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

import { ExtensionContext } from 'vscode';
import * as manifest from '../manifest';
import { ConfigurationProvider } from '../vscode-api/configuration-provider';
import { OutputChannelProvider } from '../vscode-api/output-channel-provider';
import { CmsisToolboxManager } from './cmsis-toolbox';
import { CompileCommandsGenerator } from './intellisense/compile-commands-generator';
import { Mutex } from 'async-mutex';
import * as rpc from '../json-rpc/csolution-rpc-client';
import { ConvertRequestData, SolutionEventHub } from './solution-event-hub';
import { Severity } from './constants';
import { toolsPrefixPatterns } from './solution-problems';


export interface SolutionConverter {
    activate(context: ExtensionContext): void;
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
        private readonly compileCommandsGenerator: CompileCommandsGenerator,
    ) {
    }

    public activate(context: ExtensionContext) {
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

        outputChannel.appendLine('⚙️ Converting solution...');
        let missingPacksResult = undefined;
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
                const downloadPacksOutput = await this.downloadMissingPacks(missingPacksResult.packs);
                toolsOutputMessages = toolsOutputMessages.concat(downloadPacksOutput);
                missingPacksResult.success = downloadPacksOutput.length === 0;
            }
        }
        if (signal.aborted) {
            return;
        }

        let detection = false;
        let convertResult: rpc.ConvertSolutionResult = { success: false };
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
            const availableCompilers = convertResult.selectCompiler ?? [];
            detection = availableCompilers.length > 0;
            let availableConfigurations: rpc.VariablesConfiguration[] | undefined;
            if (convertResult.undefinedLayers) {
                const result = await this.checkDiscoverLayers();
                const discoverLayersOutput = !result.success && result.message ? [`error csolution: ${result.message.trim()}`] : [];
                toolsOutputMessages = toolsOutputMessages.concat(discoverLayersOutput);
                availableConfigurations = result.configurations;
                detection = detection || result.success;
            }
            if (detection) {
                // compilers and variables detection handling: apply select-compiler and discover layer configurations if any
                this.eventHub.fireConfigureSolutionDataReady({ availableCompilers, availableConfigurations });
            }
        }

        let logResult = undefined;
        if (!detection) {
            if (convertResult.success) {
                // check if compile commands need to be updated: call cbuild setup skipping csolution convert step
                outputChannel.append('Setup database... ');
                let cbuildOutput = undefined;
                [convertResult.success, cbuildOutput] = await this.compileCommandsGenerator.runCbuildSetup();
                toolsOutputMessages = toolsOutputMessages.concat(cbuildOutput ?? []);
            }
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
        const severity = this.getSeverity(logResult, toolsOutputMessages);

        // print result to output channel
        outputChannel.append('\n' + (
            detection ?
                '⏳ Action needed: see Configure Solution dialog' :
                severity == 'error' ?
                    '🟥 Convert solution failed' :
                    severity == 'warning' ?
                        '🟨 Convert solution completed with warnings' :
                        '✅ Convert solution completed'
        ) + '\n\n');
        // notify conversion result and detection status asynchronously!
        this.eventHub.fireConvertCompleted({
            severity: severity,
            detection: detection,
            logMessages: logResult,
            toolsOutputMessages,
        });
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

    private getSeverity(messages: rpc.LogMessages, lines?: string[]): Severity {
        if (!messages.success || (messages.errors && messages.errors.length > 0) || lines?.find(line => toolsPrefixPatterns.error.test(line))) {
            return 'error';
        } else if ((messages.warnings && messages.warnings.length > 0) || lines?.find(line => toolsPrefixPatterns.warning.test(line))) {
            return 'warning';
        } else if (messages.info && messages.info.length > 0) {
            return 'info';
        }
        return 'success';
    }
}
