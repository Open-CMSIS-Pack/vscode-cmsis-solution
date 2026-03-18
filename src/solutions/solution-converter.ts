/**
 * Copyright 2025-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import path from 'node:path';
import * as manifest from '../manifest';
import { ConfigurationProvider } from '../vscode-api/configuration-provider';
import { OutputChannelProvider } from '../vscode-api/output-channel-provider';
import { CmsisToolboxManager } from './cmsis-toolbox';
import { SolutionManager } from './solution-manager';
import { CompileCommandsGenerator } from './intellisense/compile-commands-generator';
import { Mutex } from 'async-mutex';
import * as rpc from '../json-rpc/csolution-rpc-client';
import * as fsUtils from '../utils/fs-utils';
import { getFileNameFromPath } from '../utils/path-utils';
import { stripTwoExtensions } from '../utils/string-utils';
import { getWorkspaceFolder } from '../utils/vscode-utils';
import { ConvertRequestData, SolutionEventHub } from './solution-event-hub';
import { Severity } from './constants';


export interface SolutionConverter {
    activate(context: ExtensionContext): void;
}

export class SolutionConverterImpl implements SolutionConverter {

    private readonly convertSolutionMutex = new Mutex();
    private controller: AbortController | null = null;
    private data: ConvertRequestData = { solutionPath: '', targetSet: '', updateRte: false, restartRpc: false };
    private readonly diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection('csolution');

    constructor(
        private readonly solutionManager: SolutionManager,
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
            this.diagnosticCollection,
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

        outputChannel.appendLine('⚙️ Converting solution...');
        if (this.isDownloadPacksEnabled()) {
            // rpc method: ListMissingPacks
            outputChannel.append('Check for missing packs... ');
            const result = await this.cmsisToolboxManager.runCsolutionRpc(
                'ListMissingPacks',
                {
                    solution: activeSolution,
                    activeTarget: activeTarget,
                }
            ) as rpc.ListMissingPacksResult;
            if (result.success && result.packs && result.packs.length > 0) {
                // download missing packs if any
                await this.downloadMissingPacks(result.packs);
            }
        }
        if (signal.aborted) {
            return;
        }

        // rpc method: ConvertSolution
        outputChannel.append('Convert solution... ');
        const result = await this.cmsisToolboxManager.runCsolutionRpc(
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
        // compilers and variables detection handling: apply select-compiler and discover layer configurations if any
        const csolution = this.solutionManager.getCsolution();
        csolution?.setSelectCompiler(result.selectCompiler);
        const detection = (!!result.undefinedLayers && await this.checkDiscoverLayers()) || !!result.selectCompiler;

        let cbuildOutput = undefined;
        let logResult = undefined;
        if (!detection) {
            if (result.success) {
                // check if compile commands need to be updated: call cbuild setup skipping csolution convert step
                outputChannel.append('Setup database... ');
                [result.success, cbuildOutput] = await this.compileCommandsGenerator.runCbuildSetup();
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
        // update 'problems' view
        logResult = { errors: [], warnings: [], info: [], ...logResult, success: result.success };
        const severity = await this.updateDiagnostics(logResult, cbuildOutput);

        csolution?.setLogMessages(logResult);

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
        this.eventHub.fireConvertCompleted({ severity: severity, detection: detection });
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

    private async downloadMissingPacks(packs: string[]): Promise<void> {
        // call cpackget to download missing packs
        const outputChannel = this.outputChannelProvider.getOrCreate(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);
        outputChannel.append('Downloading missing packs...\n');
        for (const pack of packs) {
            const args = ['add', pack, '--force-reinstall', '--agree-embedded-license', '--no-dependencies'];
            await this.cmsisToolboxManager.runCmsisTool('cpackget', args, line => outputChannel.appendLine(line.trimEnd()), undefined, undefined, true);
        }
    }

    private async checkDiscoverLayers(): Promise<boolean> {
        const outputChannel = this.outputChannelProvider.getOrCreate(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);
        this.solutionManager.getCsolution()?.setVariablesConfigurations(undefined);
        // rpc method: DiscoverLayers
        outputChannel.append('Discover Layers... ');
        const result = await this.cmsisToolboxManager.runCsolutionRpc(
            'DiscoverLayers',
            {
                solution: this.data?.solutionPath ?? '',
                activeTarget: this.data?.targetSet ?? '',
            }
        ) as rpc.DiscoverLayersInfo;
        this.solutionManager.getCsolution()?.setVariablesConfigurations(result.configurations);
        return result.success;
    }

    /**
    *  log message regex in the format <filename>:<line>:<column> - <message>
    *  regex named groups:
    *    filename: optional file path
    *    line:     optional line number (digits)
    *    column:   optional column number (digits)
    *    message:  the actual diagnostic message (may span multiple lines)
    */
    private readonly logMessageRegex = /^(?:(?<filename>(?:[A-Za-z]:)?[^\r\n:]*?[^\s\r\n:])\s*(?::\s*(?<line>\d+))?(?::\s*(?<column>\d+))?\s*-\s+)?(?<message>[\s\S]*)$/;

    private async addDiagnosticEntry(message: string, severity: vscode.DiagnosticSeverity, files: Map<string, string>): Promise<boolean> {
        // skip excluded messages
        if (this.isMessageExcluded(message)) {
            return false;
        }
        // parse message according to logMessageRegex
        const m = message.match(this.logMessageRegex);
        if (m?.groups) {
            const { filename, line, column, message } = m.groups;
            const file = (files.has(filename) ? files.get(filename) : this.data?.solutionPath) ?? '';
            const startLine = line ? Number(line) - 1 : 0;
            const startCharacter = column ? Number(column) - 1 : 0;
            let endCharacter = startCharacter;
            if (filename && column) {
                const doc = await vscode.workspace.openTextDocument(file);
                if (doc) {
                    endCharacter = doc.lineAt(startLine).range.end.character;
                }
            }
            const range = new vscode.Range(startLine, startCharacter, startLine, endCharacter);
            const entry = new vscode.Diagnostic(range, message, severity);
            entry.source = 'csolution';

            if (!line && !column) {
                // add 'Find in Files' action only if no line/column info is available
                const args = this.createQueryArgs(message);
                if (args) {
                    entry.code = {
                        value: 'Find in Files',
                        target: vscode.Uri.parse(`command:workbench.action.findInFiles?${args}`)
                    };
                }
            }

            // append diagnostic entry
            const uri = vscode.Uri.file(path.posix.normalize(file));
            this.diagnosticCollection.set(uri, [...(this.diagnosticCollection.get(uri) ?? []), entry]);
            return true;
        }
        return false;
    }

    private async updateDiagnostics(messages: rpc.LogMessages, cbuildOutput?: string[]): Promise<Severity> {
        // clear previous diagnostics
        this.diagnosticCollection.clear();
        this.collectYmlFiles();
        let diagnostics = false;

        // extract cbuild messages from cbuild output
        await this.collectCbuildMessages(messages, cbuildOutput);

        // iterate through log messages and set diagnostics
        for (const message of messages.errors ?? []) {
            diagnostics = await this.addDiagnosticEntry(message, vscode.DiagnosticSeverity.Error, this.sourceFiles) || diagnostics;
        }
        for (const message of messages.warnings ?? []) {
            diagnostics = await this.addDiagnosticEntry(message, vscode.DiagnosticSeverity.Warning, this.sourceFiles) || diagnostics;
        }
        for (const message of messages.info ?? []) {
            diagnostics = await this.addDiagnosticEntry(message, vscode.DiagnosticSeverity.Information, this.sourceFiles) || diagnostics;
        }
        if (diagnostics) {
            vscode.commands.executeCommand('workbench.actions.view.problems', { preserveFocus: true });
        }
        // return overall severity
        if (!messages.success || (messages.errors && messages.errors.length > 0)) {
            return 'error';
        } else if (messages.warnings && messages.warnings.length > 0) {
            return 'warning';
        } else if (messages.info && messages.info.length > 0) {
            return 'info';
        }
        return 'success';
    }

    /**
    *  source files for diagnostics mapping
    */
    private readonly sourceFiles: Map<string, string> = new Map<string, string>();

    private addFile(file: string): void {
        if (file.length > 0) {
            this.sourceFiles.set(getFileNameFromPath(file), file);
        }
    }

    private collectYmlFiles(): void {
        // collect relevant yml files for diagnostics mapping
        this.sourceFiles.clear();
        const csolution = this.solutionManager.getCsolution();
        if (csolution) {
            const activeSolution = csolution.solutionPath ?? '';
            // get yml files located alongside the active solution and cbuild-idx file
            this.addFile(activeSolution);
            this.addFile(csolution.cbuildIdxFile.fileName);
            this.addFile(csolution.cbuildRunYml?.fileName ?? '');
            const strippedSolution = stripTwoExtensions(activeSolution);
            this.addFile(strippedSolution + '.cbuild-pack.yml');
            this.addFile(strippedSolution + '.cbuild-set.yml');
            // get cproject.yml and clayer.yml files from all contexts
            const contexts = csolution.cbuildIdxFile.activeContexts;
            for (const context of contexts ?? []) {
                if (context.projectPath) {
                    this.addFile(context.projectPath);
                }
                for (const layer of context.layers ?? []) {
                    this.addFile(layer.absolutePath);
                }
            }
            // get all cbuild.yml files
            const cbuilds = csolution.cbuildIdxFile.cbuildFiles;
            for (const [, cbuild] of cbuilds) {
                this.addFile(cbuild.fileName);
            }
        }
    }

    /**
    *  patterns for non relevant log messages to be excluded from diagnostics
    */
    private readonly excludePatterns = [
        /processing context .* failed/,
        /file is already up-to-date/,
        /file generated successfully/,
        /file skipped/,
    ];

    private isMessageExcluded(message: string): boolean {
        // exclude non relevant messages
        return this.excludePatterns.some(pattern => pattern.test(message));
    }

    /**
    *  patterns to extract query from log message for 'Find in Files' action
    */
    private readonly queryPatterns = [
        /(?:MISSING|SELECTABLE)\s+(.*)/,                          // component dependency
        /\/([^/\s']+\.[^/\s']+)/,                                 // capture filename from path
        /'([^']+)'/,                                              // single quotes
        /([A-Za-z0-9_.-]+::[A-Za-z0-9_.-]+(@[A-Za-z0-9_.-]+)*)/,  // pack/component identifier
        /([A-Za-z0-9_.-]+@[A-Za-z0-9_.-]*)/,                      // compiler/tool identifier
    ];

    private createQueryArgs(message: string): string | undefined {
        // empirically find possible query patterns
        let query;
        for (const pattern of this.queryPatterns) {
            const match = message.match(pattern);
            if (match) {
                query = match[1];
                break;
            }
        }
        if (!query) {
            return undefined;
        }
        const args = {
            query: query,
            filesToInclude: '*.yml,*.yaml', // limit search to yml files
            filesToExclude: '*.cbuild-idx.yml,*.cbuild.yml,*.cbuild-run.yml', // exclude generated or intermediate files
            isRegex: false,
            isCaseSensitive: false,
            matchWholeWord: false,
            triggerSearch: true,
            focusResults: true,
        };
        return encodeURIComponent(JSON.stringify(args));
    }

    /**
    *  patterns to extract env vars warnings from cbuild output
    */
    private readonly cbuildWarningPatterns = [
        /^warning cbuild: missing ([A-Za-z_][A-Za-z0-9_]*) environment variable$/,
        /^warning cbuild: ([A-Za-z_][A-Za-z0-9_]*) environment variable specifies non-existent directory: .+$/
    ];

    /**
    *  patterns to extract env vars errors from cbuild output
    */
    private readonly cbuildErrorPatterns = [
        /^error cbuild: exec: "west": executable file not found in .+$/,
    ];

    /**
    *  patterns to remove from extracted cbuild messages
    */
    private readonly cbuildPrefixPatterns = {
        error: /^error cbuild:\s*/,
        warning: /^warning cbuild:\s*/,
    };

    private pushUniquely(array: string[], value: string) {
        if (!array.includes(value)) {
            array.push(value);
        }
    }

    private async collectCbuildMessages(logMessages: rpc.LogMessages, lines?: string[]): Promise<void> {
        if (!lines) {
            return;
        }
        // extract cbuild warnings and errors around environment variables settings
        let errors = lines.filter(line =>
            this.cbuildErrorPatterns.some(pattern => pattern.test(line))
        );
        let warnings = lines.filter(line =>
            this.cbuildWarningPatterns.some(pattern => pattern.test(line))
        );
        if (!warnings.length && !errors.length) {
            return;
        }
        // find cmsis-csolution.environmentVariables location in settings.json
        const workspaceFolder = getWorkspaceFolder();
        if (workspaceFolder) {
            const settings = path.join(workspaceFolder, '.vscode', 'settings.json');
            const envvars = '"cmsis-csolution.environmentVariables"';
            let startPos: vscode.Position | undefined = undefined;
            if (fsUtils.fileExists(settings)) {
                const doc = await vscode.workspace.openTextDocument(settings);
                if (doc) {
                    const startOffset = doc.getText().indexOf(envvars);
                    if (startOffset > 0) {
                        startPos = doc.positionAt(startOffset);
                    }
                }
            }
            const location = startPos ? `:${startPos.line + 1}:${startPos.character + 1}` : '';
            // format messages
            const format = (m: string, kind: 'error' | 'warning') =>
                `settings.json${location} - ${m.replace(this.cbuildPrefixPatterns[kind], '')}; review ${envvars}`;
            errors = errors.map(m => format(m, 'error'));
            warnings = warnings.map(m => format(m, 'warning'));
            this.addFile(settings);
        }
        // append formatted messages to logMessages
        errors.forEach(e => this.pushUniquely(logMessages.errors ?? [], e));
        warnings.forEach(w => this.pushUniquely(logMessages.warnings ?? [], w));
    }
}
