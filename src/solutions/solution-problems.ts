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
import { LogMessages } from '../json-rpc/csolution-rpc-client';
import * as fsUtils from '../utils/fs-utils';
import { getFileNameFromPath } from '../utils/path-utils';
import { stripTwoExtensions } from '../utils/string-utils';
import { getWorkspaceFolder } from '../utils/vscode-utils';
import { SolutionManager } from './solution-manager';
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

    errors.forEach(e => pushUniquely(logMessages.errors ?? [], e));
    warnings.forEach(w => pushUniquely(logMessages.warnings ?? [], w));
};

export interface SolutionProblems {
    activate(context: vscode.ExtensionContext): Promise<void>;
}

export class SolutionProblemsImpl implements SolutionProblems {

    private readonly diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection('csolution');

    constructor(
        private readonly solutionManager: SolutionManager,
        private readonly eventHub: SolutionEventHub,
    ) {
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.eventHub.onDidConvertCompleted(this.handleConvertCompleted, this),
            this.diagnosticCollection,
        );
    }

    private async handleConvertCompleted(data: ConvertResultData): Promise<void> {
        await enrichLogMessagesFromToolOutput(data.logMessages, data.toolsOutputMessages);
        await this.updateDiagnostics(data.logMessages);
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

    private async updateDiagnostics(messages: LogMessages): Promise<void> {
        // clear previous diagnostics
        this.diagnosticCollection.clear();
        this.collectYmlFiles();
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
}

export const SolutionProblems = constructor<typeof SolutionProblemsImpl, SolutionProblems>(SolutionProblemsImpl);
