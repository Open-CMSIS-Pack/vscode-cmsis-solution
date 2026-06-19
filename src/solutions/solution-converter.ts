/**
 * Copyright 2025-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';
import * as manifest from '../manifest';
import { ConfigurationProvider } from '../vscode-api/configuration-provider';
import { OutputChannelProvider } from '../vscode-api/output-channel-provider';
import { CmsisToolboxManager } from './cmsis-toolbox';
import { Mutex } from 'async-mutex';
import * as rpc from '../json-rpc/csolution-rpc-client';
import { ConvertRequestData, SolutionEventHub } from './solution-event-hub';
import { getSeverity } from './solution-problems';

const OPEN_SETTINGS_ACTION = 'Open Environment Variables Settings';
const ENV_VAR_SETTINGS_NAME = `${manifest.PACKAGE_NAME}.${manifest.CONFIG_ENVIRONMENT_VARIABLES}`;


export interface SolutionConverter {
    activate(context: vscode.ExtensionContext): void;
}

export class SolutionConverterImpl implements SolutionConverter {

    private readonly convertSolutionMutex = new Mutex();
    private controller: AbortController | null = null;
    private data: ConvertRequestData = { solutionPath: '', targetSet: '', updateRte: false, restartRpc: false };

    constructor(
        private readonly eventHub: SolutionEventHub,
        private readonly configProvider: ConfigurationProvider,
        private readonly outputChannelProvider: OutputChannelProvider,
        private readonly cmsisToolboxManager: CmsisToolboxManager,
    ) {
    }

    public activate(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            this.eventHub.onDidConvertRequested(this.handleConvertRequested, this),
        );
    }

    private async handleConvertRequested(data: ConvertRequestData): Promise<void> {
        // coalescing check if conversion is running
        if (this.controller) {
            // do we need to abort current conversion?
            if (this.data.lockAbort) {
                return;
            }
            // cancel previous running conversion
            this.controller.abort();
        }

        if (!data.solutionPath) {
            return; // nothing to convert
        }

        this.controller = new AbortController();
        const { signal } = this.controller;

        // wait for mutex
        const release = await this.convertSolutionMutex.acquire();
        // make deep copy of incoming data
        this.data = {
            solutionPath: data.solutionPath,
            targetSet: data.targetSet,
            updateRte: data.updateRte,
            restartRpc: data.restartRpc,
            lockAbort: data.lockAbort,
        };

        try {
            await this.convertSolution(signal);
        } catch (error) {
            if (!signal.aborted) {
                await this.handleConvertFailure(error);
            }
        } finally {
            release();
            this.controller = null;
        }
    }

    private isDownloadPacksEnabled(): boolean {
        return this.configProvider.getConfigVariable<boolean>(manifest.CONFIG_DOWNLOAD_MISSING_PACKS) ?? true;
    }

    private async convertSolution(signal: AbortSignal): Promise<void> {
        if (signal.aborted) {
            return;
        }
        const activeSolution = this.data.solutionPath;
        const activeTarget = this.data.targetSet ?? '';
        const outputChannel = this.outputChannelProvider.getOrCreate(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);

        // restart rpc server to pick up new environment variables
        if (this.data?.restartRpc) {
            outputChannel.append('🔄 Environment changed: restarting RPC server... ');
            await this.cmsisToolboxManager.runCsolutionRpc('Shutdown', {});
            outputChannel.append('Loading packs... ');
            await this.cmsisToolboxManager.runCsolutionRpc('LoadPacks', {});
            outputChannel.append('\n\n');
        }

        if (signal.aborted) {
            return;
        }

        let toolsOutputMessages: string[] = [];

        outputChannel.appendLine('\n⚙️ Converting solution...');
        let missingPacksResult = undefined;
        let downloadedMissingPacks = false;
        if (this.isDownloadPacksEnabled()) {
            // rpc method: ListMissingPacks
            outputChannel.append('Check for missing packs... ');
            missingPacksResult = await this.cmsisToolboxManager.runCsolutionRpc(
                'ListMissingPacks',
                {
                    solution: activeSolution,
                    activeTarget: activeTarget,
                }
            ) as rpc.ListMissingPacksResult;
            if (missingPacksResult.success && missingPacksResult.packs && missingPacksResult.packs.length > 0) {
                // download missing packs if any
                this.cmsisToolboxManager.suspendPackReload();
                try {
                    const downloadPacksOutput = await this.downloadMissingPacks(missingPacksResult.packs);
                    toolsOutputMessages = toolsOutputMessages.concat(downloadPacksOutput);
                    missingPacksResult.success = downloadPacksOutput.length === 0;
                    downloadedMissingPacks = missingPacksResult.success;
                } finally {
                    // Converter explicitly calls LoadPacks below on successful downloads.
                    this.cmsisToolboxManager.resumePackReload(true);
                }
            }
        }
        if (signal.aborted) {
            return;
        }

        if (downloadedMissingPacks) {
            outputChannel.append('Loading packs... ');
            await this.cmsisToolboxManager.runCsolutionRpc('LoadPacks', {});
        }

        let detection = false;
        let convertResult: rpc.ConvertSolutionResult = { success: false };
        let availableCompilers: string[] = [];
        let availableConfigurations: rpc.VariablesConfiguration[] | undefined;
        if (!missingPacksResult || missingPacksResult.success) {
            // rpc method: ConvertSolution
            outputChannel.append('Convert solution... ');
            convertResult = await this.cmsisToolboxManager.runCsolutionRpc(
                'ConvertSolution',
                {
                    solution: activeSolution,
                    activeTarget: activeTarget,
                    updateRte: this.data.updateRte ?? false,
                }
            ) as rpc.ConvertSolutionResult;

            if (signal.aborted) {
                return;
            }

            // compilers and variables detection: gather locally and emit configure event
            availableCompilers = convertResult.selectCompiler ?? [];
            detection = availableCompilers.length > 0;
            if (convertResult.undefinedLayers) {
                const result = await this.checkDiscoverLayers();
                const discoverLayersOutput = !result.success && result.message ? [`error csolution: ${result.message.trim()}`] : [];
                toolsOutputMessages = toolsOutputMessages.concat(discoverLayersOutput);
                availableConfigurations = result.configurations;
                detection = detection || result.success;
            }
        }

        let logResult = undefined;
        if (!detection) {
            // rpc method: GetLogMessages
            outputChannel.append('Get log messages... ');
            logResult = await this.cmsisToolboxManager.runCsolutionRpc(
                'GetLogMessages', {}
            ) as rpc.LogMessages;
            if (logResult?.errors || logResult?.warnings) {
                this.printErrorsWarnings(logResult);
            }
        }

        if (signal.aborted) {
            return;
        }
        logResult = { errors: [], warnings: [], info: [], ...logResult, success: convertResult.success };
        const severity = getSeverity(logResult, toolsOutputMessages);

        // print result to output channel
        outputChannel.append('\n' + (
            detection ?
                '⏳ Action needed: see Configure Solution dialog' :
                severity == 'error' ?
                    '🟥 Convert solution failed' :
                    severity == 'warning' ?
                        '🟨 Convert solution completed with warnings' :
                        '✅ Convert solution completed'
        ) + '\n');
        // notify conversion result and detection status asynchronously!
        this.eventHub.fireConvertCompleted({
            success: convertResult.success,
            severity: severity,
            detection: detection,
            logMessages: logResult,
            toolsOutputMessages,
        });
        // compilers and variables detection handling:
        // apply select-compiler and discover layer configurations, reset state otherwise
        this.eventHub.fireConfigureSolutionDataReady({ availableCompilers, availableConfigurations });
    }

    private async printErrorsWarnings(messages?: rpc.LogMessages): Promise<void> {
        const outputChannel = this.outputChannelProvider.getOrCreate(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);
        for (const message of messages?.errors ?? []) {
            outputChannel.append(`\ncsolution error: ${message}`);
        }
        for (const message of messages?.warnings ?? []) {
            outputChannel.append(`\ncsolution warning: ${message}`);
        }
    }

    private async downloadMissingPacks(packs: string[]): Promise<string[]> {
        // call cpackget to download missing packs
        const outputChannel = this.outputChannelProvider.getOrCreate(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);
        outputChannel.append('Downloading missing packs...\n');
        const formattedOutput: string[] = [];
        for (const pack of packs) {
            const cpackgetOutput: string[] = [];
            const args = ['add', pack, '--force-reinstall', '--agree-embedded-license', '--no-dependencies'];
            const [returnCode] = await this.cmsisToolboxManager.runCmsisTool('cpackget', args, line => {
                line = line.trimEnd();
                cpackgetOutput.push(line);
                outputChannel.appendLine(line);
            }, undefined, undefined, true);
            if (returnCode !== 0) {
                let errorMessage = `error cpackget: downloading pack '${pack}' failed`;
                const details = cpackgetOutput.join('\n').match(/[EW]: .*/g)?.map(line => line.replace(/^[EW]:\s*/, '')).join('\n') ?? '';
                if (details) {
                    errorMessage += `\n${details}`;
                }
                formattedOutput.push(errorMessage);
            }
        }
        return formattedOutput;
    }

    private async checkDiscoverLayers() {
        const outputChannel = this.outputChannelProvider.getOrCreate(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);
        // rpc method: DiscoverLayers
        outputChannel.append('Discover Layers... ');
        const result = await this.cmsisToolboxManager.runCsolutionRpc(
            'DiscoverLayers',
            {
                solution: this.data?.solutionPath ?? '',
                activeTarget: this.data?.targetSet ?? '',
            }
        ) as rpc.DiscoverLayersInfo;
        return result;
    }

    private async handleConvertFailure(error: unknown): Promise<void> {
        const message = this.getErrorMessage(error);
        const outputChannel = this.outputChannelProvider.getOrCreate(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);

        console.error('Unhandled error while converting solution', error);
        outputChannel.appendLine(`\n🟥 Convert solution failed: ${message}`);

        const logMessages: rpc.LogMessages = {
            success: false,
            errors: [message],
            warnings: [],
            info: [],
        };

        await this.eventHub.fireConvertCompleted({
            success: false,
            severity: 'error',
            detection: false,
            logMessages,
            toolsOutputMessages: [`error cmsis-csolution: ${message}`],
        });
        await this.eventHub.fireConfigureSolutionDataReady({ availableCompilers: [], availableConfigurations: undefined });

        if (this.isEnvironmentSettingsError(message)) {
            const selection = await vscode.window.showErrorMessage(
                `Failed to load solution due to invalid environment variable settings: ${message}`,
                OPEN_SETTINGS_ACTION,
            );
            if (selection === OPEN_SETTINGS_ACTION) {
                await vscode.commands.executeCommand(manifest.OPEN_ENV_VAR_SETTINGS_COMMAND_ID, ENV_VAR_SETTINGS_NAME);
            }
            return;
        }

        await vscode.window.showErrorMessage(`Failed to load solution: ${message}`);
    }

    private isEnvironmentSettingsError(message: string): boolean {
        const normalized = message.toLocaleLowerCase();
        const environmentIssueHints = [
            'environment variable',
            'environment variables',
            'env var',
            'env vars',
            ENV_VAR_SETTINGS_NAME.toLocaleLowerCase(),
            manifest.CONFIG_ENVIRONMENT_VARIABLES.toLocaleLowerCase(),
        ];

        return environmentIssueHints.some(hint => normalized.includes(hint));
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}

