/**
 * Copyright 2026 Arm Limited
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

import * as path from 'node:path';
import * as vscode from 'vscode';
import { constructor } from '../generic/constructor';
import { MANAGE_COMPONENTS_PACKS_COMMAND_ID } from '../manifest';
import { LogMessages } from '../json-rpc/csolution-rpc-client';
import * as fsUtils from '../utils/fs-utils';
import { getFileNameFromPath } from '../utils/path-utils';
import { stripTwoExtensions } from '../utils/string-utils';
import { getWorkspaceFolder } from '../utils/vscode-utils';
<<<<<<< HEAD
import { SolutionLoadStateChangeEvent, SolutionManager } from './solution-manager';
=======
import { createMergeCommandUri, createMergeDiagnosticMessage, MERGE_VIEW_LINK_LABEL, parseMergeMessage } from '../views/solution-outline/commands/merge-message-parser';
import { SolutionManager } from './solution-manager';
>>>>>>> e85440c (Add "Open Merge View" link in Problems view)
import { ConvertResultData, SolutionEventHub } from './solution-event-hub';

export const toolsPrefixPatterns = {
    error: /^.*error (?:cbuild|cbuild2cmake|csolution|cpackget):\s*/,
    warning: /^.*warning (?:cbuild|cbuild2cmake|csolution|cpackget):\s*/,
};

export const envVarWestPatterns = [
    /^missing ([A-Za-z_][A-Za-z0-9_]*) environment variable$/,
    /^([A-Za-z_][A-Za-z0-9_]*) environment variable specifies non-existent directory: .+$/,
    /^exec: "west": executable file not found in .+$/,
];

const pushUniquely = (array: string[], value: string) => {
    if (!array.includes(value)) {
        array.push(value);
    }
};

const formatWestMessages = async (errors: string[], warnings: string[]): Promise<void> => {
    const hasWestMessages = [...errors, ...warnings].some(line =>
        envVarWestPatterns.some(pattern => pattern.test(line))
    );
    if (!hasWestMessages) {
        return;
    }
    const workspaceFolder = getWorkspaceFolder();
    if (!workspaceFolder) {
        return;
    }

    const settings = vscode.workspace.workspaceFile?.fsPath ?? path.join(workspaceFolder, '.vscode', 'settings.json');
    const envvars = '"cmsis-csolution.environmentVariables"';
    let startPos: vscode.Position | undefined;
    if (fsUtils.fileExists(settings)) {
        const doc = await vscode.workspace.openTextDocument(settings);
        const startOffset = doc.getText().indexOf(envvars);
        if (startOffset >= 0) {
            startPos = doc.positionAt(startOffset);
        }
    }
    const location = startPos ? `:${startPos.line + 1}:${startPos.character + 1}` : '';
    const format = (items: string[]) => {
        for (let i = 0; i < items.length; i++) {
            if (envVarWestPatterns.some(pattern => pattern.test(items[i]))) {
                items[i] = `${settings}${location} - ${items[i]}; review ${envvars}`;
            }
        }
    };
    format(errors);
    format(warnings);
};

export const enrichLogMessagesFromToolOutput = async (logMessages: LogMessages, lines?: string[]): Promise<void> => {
    if (!lines) {
        return;
    }

    let errors = lines.filter(line => toolsPrefixPatterns.error.test(line));
    let warnings = lines.filter(line => toolsPrefixPatterns.warning.test(line));
    if (!warnings.length && !errors.length) {
        return;
    }

    const sanitize = (m: string, kind: 'error' | 'warning') => m.replace(toolsPrefixPatterns[kind], '').trim();
    errors = errors.map(e => sanitize(e, 'error'));
    warnings = warnings.map(w => sanitize(w, 'warning'));

    await formatWestMessages(errors, warnings);

    const logErrors = logMessages.errors ?? (logMessages.errors = []);
    const logWarnings = logMessages.warnings ?? (logMessages.warnings = []);

    errors.forEach(e => pushUniquely(logErrors, e));
    warnings.forEach(w => pushUniquely(logWarnings, w));
};

export interface SolutionProblems {
    activate(context: vscode.ExtensionContext): Promise<void>;
}

export class SolutionProblemsImpl implements SolutionProblems {

    private readonly diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection('csolution');
    /**
    *  source files for diagnostics mapping
    */
    private readonly sourceFiles: Map<string, string> = new Map<string, string>();

    private readonly queryActionPatterns: ReadonlyArray<{ pattern: RegExp; action: 'components-packs' | 'find-in-files' }> = [
        { pattern: /dependency validation for context '([^']+)' failed:/, action: 'components-packs' },
        { pattern: /\/([^/\s']+\.[^/\s']+)/, action: 'find-in-files' },
        { pattern: /'([^']+)'/, action: 'find-in-files' },
        { pattern: /([A-Za-z0-9_.-]+::[A-Za-z0-9_.-]+(@[A-Za-z0-9_.-]+)*)/, action: 'find-in-files' },
        { pattern: /([A-Za-z0-9_.-]+@[A-Za-z0-9_.-]*)/, action: 'find-in-files' },
    ];

    constructor(
        private readonly solutionManager: SolutionManager,
        private readonly eventHub: SolutionEventHub,
    ) {
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.eventHub.onDidConvertCompleted(this.handleConvertCompleted, this),
            this.solutionManager.onDidChangeLoadState(this.handleLoadStateChanged, this),
            this.diagnosticCollection,
        );
    }

    private async handleConvertCompleted(data: ConvertResultData): Promise<void> {
        await enrichLogMessagesFromToolOutput(data.logMessages, data.toolsOutputMessages);
        await this.updateDiagnostics(data.logMessages);
    }

    private handleLoadStateChanged(data: SolutionLoadStateChangeEvent): void {
        if (data.previousState.solutionPath !== data.newState.solutionPath) {
            this.clearDiagnostics();
        }
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

    private async createDiagnosticRange(file: string, filename: string | undefined, line: string | undefined, column: string | undefined): Promise<vscode.Range> {
        const startLine = line ? Math.max(Number(line) - 1, 0) : 0;
        const startCharacter = column ? Math.max(Number(column) - 1, 0) : 0;
        let endCharacter = startCharacter;
        if (filename && column) {
            try {
                const doc = await vscode.workspace.openTextDocument(file);
                if (doc && startLine < doc.lineCount) {
                    endCharacter = doc.lineAt(startLine).range.end.character;
                }
            } catch {
                // Keep default endCharacter when document cannot be opened.
            }
        }
        return new vscode.Range(startLine, startCharacter, startLine, endCharacter);
    }

    private async addDiagnosticEntry(message: string, severity: vscode.DiagnosticSeverity, files: Map<string, string>): Promise<boolean> {
        // skip excluded messages
        if (this.isMessageExcluded(message)) {
            return false;
        }
        // parse message according to logMessageRegex
        const m = message.match(this.logMessageRegex);
<<<<<<< HEAD
        if (!m || !m.groups) {
            return false;
=======
        if (m?.groups) {
            const { filename, line, column, message: diagnosticMessage } = m.groups;
            const normalizedFilename = filename ? getFileNameFromPath(filename) : undefined;
            const fromMap = (filename && files.get(filename)) || (normalizedFilename && files.get(normalizedFilename));
            const file = fromMap || (filename && path.isAbsolute(filename) ? filename : undefined) || this.solutionManager.getCsolution()?.solutionPath;
            if (!file) {
                return false;
            }
            const startLine = line ? Math.max(Number(line) - 1, 0) : 0;
            const startCharacter = column ? Math.max(Number(column) - 1, 0) : 0;
            let endCharacter = startCharacter;
            if (filename && column) {
                try {
                    const doc = await vscode.workspace.openTextDocument(file);
                    if (doc && startLine < doc.lineCount) {
                        endCharacter = doc.lineAt(startLine).range.end.character;
                    }
                } catch {
                    // Keep default endCharacter when document cannot be opened.
                }
            }
            const merge = parseMergeMessage(diagnosticMessage);
            const normalizedMessage = merge
                ? createMergeDiagnosticMessage(merge.localPath)
                : diagnosticMessage;

            const range = new vscode.Range(startLine, startCharacter, startLine, endCharacter);
            const entry = new vscode.Diagnostic(range, normalizedMessage, severity);
            entry.source = 'csolution';

            if (!line && !column) {
                // add merge action first, fallback to 'Find in Files' if not a merge advisory
                if (merge) {
                    const commandUri = createMergeCommandUri(merge.localPath);
                    entry.code = {
                        value: MERGE_VIEW_LINK_LABEL,
                        target: vscode.Uri.parse(commandUri),
                    };
                } else {
                    const args = this.createQueryArgs(diagnosticMessage);
                    if (args) {
                        entry.code = {
                            value: 'Find in Files',
                            target: vscode.Uri.parse(`command:workbench.action.findInFiles?${args}`)
                        };
                    }
                }
            }

            // append diagnostic entry
            const uri = vscode.Uri.file(path.posix.normalize(file));
            this.diagnosticCollection.set(uri, [...(this.diagnosticCollection.get(uri) ?? []), entry]);
            return true;
>>>>>>> e85440c (Add "Open Merge View" link in Problems view)
        }
        const { filename, line, column, message: messageText } = m.groups;
        const normalizedFilename = filename ? getFileNameFromPath(filename) : undefined;
        const fromMap = (filename && files.get(filename)) || (normalizedFilename && files.get(normalizedFilename));
        const file = fromMap || (filename && path.isAbsolute(filename) ? filename : undefined) || this.solutionManager.getCsolution()?.solutionPath;
        if (!file) {
            return false;
        }
        const range = await this.createDiagnosticRange(file, filename, line, column);

        const entry = new vscode.Diagnostic(range, messageText, severity);
        entry.source = 'csolution';

        if (!line && !column) {
            // add 'Find in Files' action only if no line/column info is available
            entry.code = this.createDiagnosticActionCode(messageText);
        }

        // append diagnostic entry
        const uri = vscode.Uri.file(path.posix.normalize(file));
        this.diagnosticCollection.set(uri, [...(this.diagnosticCollection.get(uri) ?? []), entry]);
        return true;
    }

    /**
     * Clear diagnostic and collected files
     */
    private clearDiagnostics(): void {
        this.diagnosticCollection.clear();
        this.collectYmlFiles();
    }

    private async updateDiagnostics(messages: LogMessages): Promise<void> {
        // clear previous diagnostics
        this.clearDiagnostics();
        let diagnostics = false;

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
    }

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

    private findQueryActionInMessage(message: string): { query: string; action: 'components-packs' | 'find-in-files' } | undefined {
        for (const item of this.queryActionPatterns) {
            const match = message.match(item.pattern);
            if (match?.[1]) {
                return { query: match[1], action: item.action };
            }
        }
        return undefined;
    }

    private encodeFindInFilesArgs(query: string): string {
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

    private encodeCommandArgs(args: unknown[]): string {
        return encodeURIComponent(JSON.stringify(args));
    }

    private createDiagnosticActionCode(message: string): vscode.Diagnostic['code'] | undefined {
        const queryAction = this.findQueryActionInMessage(message);
        if (!queryAction) {
            return undefined;
        }

        if (queryAction.action === 'components-packs') {
            const args = this.encodeCommandArgs([{ type: 'context', value: queryAction.query }]);
            return {
                value: 'Manage Components',
                target: vscode.Uri.parse(`command:${MANAGE_COMPONENTS_PACKS_COMMAND_ID}?${args}`)
            };
        }

        const args = this.encodeFindInFilesArgs(queryAction.query);
        return {
            value: 'Find in Files',
            target: vscode.Uri.parse(`command:workbench.action.findInFiles?${args}`)
        };
    }

}

export const SolutionProblems = constructor<typeof SolutionProblemsImpl, SolutionProblems>(SolutionProblemsImpl);
