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
import { Severity } from './constants';
import * as fsUtils from '../utils/fs-utils';
import { getFileNameFromPath } from '../utils/path-utils';
import { stripTwoExtensions } from '../utils/string-utils';
import { getWorkspaceFolder } from '../utils/vscode-utils';
import { ProblemDiagnosticActionResolver } from './problem-diagnostic-action-resolver';
import { SolutionLoadStateChangeEvent, SolutionManager } from './solution-manager';
import { ConvertResultData, CbuildResultData, SolutionEventHub } from './solution-event-hub';

interface SettingsLocation {
    filePath: string;
    range: vscode.Range;
}

interface EnvironmentMessage {
    message: string;
    severity: vscode.DiagnosticSeverity;
}

export const toolsPrefixPatterns = {
    error: /^.*error (?:cbuild|cbuild2cmake|csolution|cpackget):\s*/,
    warning: /^.*warning (?:cbuild|cbuild2cmake|csolution|cpackget):\s*/,
};

export const hasToolError = (lines?: string[]): boolean => {
    return lines?.find(line => toolsPrefixPatterns.error.test(line)) !== undefined;
};

export const hasToolWarning = (lines?: string[]): boolean => {
    return lines?.find(line => toolsPrefixPatterns.warning.test(line)) !== undefined;
};

export const getToolsSeverity = (lines?: string[]): Severity => {
    if (hasToolError(lines)) {
        return 'error';
    }
    if (hasToolWarning(lines)) {
        return 'warning';
    }
    return 'success';
};

export const getSeverity = (messages: LogMessages, lines?: string[]): Severity => {
    if (!messages.success || (messages.errors && messages.errors.length > 0) || hasToolError(lines)) {
        return 'error';
    } else if ((messages.warnings && messages.warnings.length > 0) || hasToolWarning(lines)) {
        return 'warning';
    } else if (messages.info && messages.info.length > 0) {
        return 'info';
    }
    return 'success';
};


export const envVarWestPatterns = [
    /^missing ([A-Za-z_][A-Za-z0-9_]*) environment variable$/,
    /^([A-Za-z_][A-Za-z0-9_]*) environment variable specifies non-existent directory: .+$/,
    /^exec: "west": executable file not found in .+$/,
];

const environmentVariablesReviewSuffixRegex = /;\s*review\s+"cmsis-csolution\.environmentVariables"$/;

export const normalizeEnvironmentMessage = (message: string): string => {
    return message.replace(environmentVariablesReviewSuffixRegex, '').trim();
};

export const isEnvironmentVariableMessage = (message: string): boolean => {
    const normalized = normalizeEnvironmentMessage(message);
    return envVarWestPatterns.some(pattern => pattern.test(normalized));
};

const pushUniquely = (array: string[], value: string) => {
    if (!array.includes(value)) {
        array.push(value);
    }
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

    errors = errors.filter(error => !isEnvironmentVariableMessage(error));
    warnings = warnings.filter(warning => !isEnvironmentVariableMessage(warning));

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
    private readonly environmentDiagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection('csolution-environment');
    private readonly diagnosticActionResolver = new ProblemDiagnosticActionResolver();
    private readonly environmentVariablesSetting = '"cmsis-csolution.environmentVariables"';
    /**
    *  source files for diagnostics mapping
    */
    private readonly sourceFiles: Map<string, string> = new Map<string, string>();

    constructor(
        private readonly solutionManager: SolutionManager,
        private readonly eventHub: SolutionEventHub,
    ) {
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.eventHub.onDidConvertCompleted(this.handleConvertCompleted, this),
            this.eventHub.onDidCbuildCompleted(this.handleCbuildCompleted, this),
            this.solutionManager.onDidChangeLoadState(this.handleLoadStateChanged, this),
            this.diagnosticCollection,
            this.environmentDiagnosticCollection,
        );
    }

    private async handleConvertCompleted(data: ConvertResultData): Promise<void> {
        // Intentionally clear only on convert: convert is the canonical refresh point.
        // cbuild follows convert and should add diagnostics without wiping convert findings.
        this.clearDiagnostics();
        const [hasGeneralDiagnostics, hasEnvironmentDiagnostics] = await Promise.all([
            this.enrichAndUpdateDiagnostics(data.logMessages, data.toolsOutputMessages),
            this.updateEnvironmentDiagnosticsFromConvert(data),
        ]);
        await this.showProblemsViewIfNeeded(hasGeneralDiagnostics || hasEnvironmentDiagnostics);
    }

    private async handleCbuildCompleted(data: CbuildResultData): Promise<void> {
        // Do not clear diagnostics here. cbuild diagnostics are additive after convert.
        // This preserves existing convert diagnostics and avoids churn from redundant clears.
        const logMessages: LogMessages = { success: true, errors: [], warnings: [], info: [] };
        const [hasGeneralDiagnostics, hasEnvironmentDiagnostics] = await Promise.all([
            this.enrichAndUpdateDiagnostics(logMessages, data.toolsOutputMessages),
            this.updateEnvironmentDiagnosticsFromCbuild(data),
        ]);
        await this.showProblemsViewIfNeeded(hasGeneralDiagnostics || hasEnvironmentDiagnostics);
    }

    private async updateEnvironmentDiagnosticsFromConvert(data: ConvertResultData): Promise<boolean> {
        const messages: EnvironmentMessage[] = [
            ...(data.logMessages.errors ?? []).map(message => ({
                message,
                severity: vscode.DiagnosticSeverity.Error,
            })),
            ...(data.logMessages.warnings ?? []).map(message => ({
                message,
                severity: vscode.DiagnosticSeverity.Warning,
            })),
            ...this.extractEnvironmentMessagesFromToolOutput(data.toolsOutputMessages),
        ];
        return this.updateEnvironmentDiagnostics(messages);
    }

    private async updateEnvironmentDiagnosticsFromCbuild(data: CbuildResultData): Promise<boolean> {
        const messages = this.extractEnvironmentMessagesFromToolOutput(data.toolsOutputMessages);
        return this.updateEnvironmentDiagnostics(messages);
    }

    private async enrichAndUpdateDiagnostics(logMessages: LogMessages, toolsOutputMessages?: string[]): Promise<boolean> {
        await enrichLogMessagesFromToolOutput(logMessages, toolsOutputMessages);
        return this.updateDiagnostics(logMessages);
    }

    private handleLoadStateChanged(data: SolutionLoadStateChangeEvent): void {
        if (data.previousState.solutionPath !== data.newState.solutionPath) {
            this.clearDiagnostics();
            this.environmentDiagnosticCollection.clear();
        }
    }

    private extractEnvironmentMessagesFromToolOutput(lines?: string[]): EnvironmentMessage[] {
        if (!lines) {
            return [];
        }

        return lines
            .flatMap(line => {
                if (toolsPrefixPatterns.error.test(line)) {
                    return [{
                        message: line.replace(toolsPrefixPatterns.error, '').trim(),
                        severity: vscode.DiagnosticSeverity.Error,
                    }];
                }
                if (toolsPrefixPatterns.warning.test(line)) {
                    return [{
                        message: line.replace(toolsPrefixPatterns.warning, '').trim(),
                        severity: vscode.DiagnosticSeverity.Warning,
                    }];
                }
                return [];
            })
            .filter(item => isEnvironmentVariableMessage(item.message));
    }

    private async updateEnvironmentDiagnostics(rawMessages: EnvironmentMessage[]): Promise<boolean> {
        this.environmentDiagnosticCollection.clear();

        const messages = new Map<string, vscode.DiagnosticSeverity>();
        for (const rawMessage of rawMessages) {
            const message = normalizeEnvironmentMessage(rawMessage.message);
            if (!isEnvironmentVariableMessage(message)) {
                continue;
            }
            const currentSeverity = messages.get(message);
            if (currentSeverity === undefined || rawMessage.severity < currentSeverity) {
                messages.set(message, rawMessage.severity);
            }
        }

        if (messages.size === 0) {
            return false;
        }

        const settings = await this.getSettingsLocation();
        if (!settings) {
            return false;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        for (const [message, severity] of messages) {
            const fullMessage = `${message}; review ${this.environmentVariablesSetting}`;
            const action = this.diagnosticActionResolver.resolve({
                message: fullMessage,
                diagnosticFilePath: settings.filePath,
                hasLocation: true,
            });

            const entry = new vscode.Diagnostic(settings.range, action?.message ?? fullMessage, severity);
            entry.source = 'csolution';
            if (action?.code) {
                entry.code = action.code;
            }
            diagnostics.push(entry);
        }

        const uri = vscode.Uri.file(settings.filePath);
        this.environmentDiagnosticCollection.set(uri, diagnostics);
        return diagnostics.length > 0;
    }

    private async showProblemsViewIfNeeded(hasDiagnostics: boolean): Promise<void> {
        if (!hasDiagnostics) {
            return;
        }
        await vscode.commands.executeCommand('workbench.actions.view.problems', { preserveFocus: true });
    }

    private async getSettingsLocation(): Promise<SettingsLocation | undefined> {
        const workspaceFolder = getWorkspaceFolder();
        if (!workspaceFolder) {
            return undefined;
        }

        const settingsFile = vscode.workspace.workspaceFile?.fsPath ?? path.join(workspaceFolder, '.vscode', 'settings.json');
        if (!fsUtils.fileExists(settingsFile)) {
            return {
                filePath: settingsFile,
                range: new vscode.Range(0, 0, 0, 0),
            };
        }

        try {
            const doc = await vscode.workspace.openTextDocument(settingsFile);
            const startOffset = doc.getText().indexOf(this.environmentVariablesSetting);
            if (startOffset >= 0) {
                const pos = doc.positionAt(startOffset);
                const endCharacter = doc.lineAt(pos.line).range.end.character;
                return {
                    filePath: settingsFile,
                    range: new vscode.Range(pos.line, pos.character, pos.line, endCharacter),
                };
            }
        } catch {
            // Keep default range when settings document cannot be opened.
        }

        return {
            filePath: settingsFile,
            range: new vscode.Range(0, 0, 0, 0),
        };
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
        if (!m || !m.groups) {
            return false;
        }
        const { filename, line, column, message: messageText } = m.groups;
        if (isEnvironmentVariableMessage(messageText)) {
            return false;
        }
        const normalizedFilename = filename ? getFileNameFromPath(filename) : undefined;
        const fromMap = (filename && files.get(filename)) || (normalizedFilename && files.get(normalizedFilename));
        const absoluteFromLog = filename && this.isAbsoluteDiagnosticPath(filename) ? filename : undefined;
        const file = fromMap || absoluteFromLog || this.solutionManager.getCsolution()?.solutionPath;
        if (!file) {
            return false;
        }
        const action = this.diagnosticActionResolver.resolve({
            message: messageText,
            diagnosticFilePath: file,
            hasLocation: line !== undefined || column !== undefined,
        });
        const range = await this.createDiagnosticRange(file, filename, line, column);

        const entry = new vscode.Diagnostic(range, action?.message ?? messageText, severity);
        entry.source = 'csolution';

        if (action?.code) {
            entry.code = action.code;
        }

        // append diagnostic entry
        const uri = vscode.Uri.file(path.normalize(file));
        this.diagnosticCollection.set(uri, [...(this.diagnosticCollection.get(uri) ?? []), entry]);
        return true;
    }

    private isAbsoluteDiagnosticPath(filePath: string): boolean {
        return path.isAbsolute(filePath)
            || /^[A-Za-z]:[\\/]/.test(filePath)
            || /^\\\\[^\\]+\\[^\\]+/.test(filePath);
    }

    /**
     * Clear diagnostic and collected files
     */
    private clearDiagnostics(): void {
        this.diagnosticCollection.clear();
        this.collectYmlFiles();
    }

    private async updateDiagnostics(messages: LogMessages): Promise<boolean> {
        // Diagnostics lifecycle is controlled by event handlers.
        // handleConvertCompleted clears; handleCbuildCompleted appends.
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
        return diagnostics;
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

}

export const SolutionProblems = constructor<typeof SolutionProblemsImpl, SolutionProblems>(SolutionProblemsImpl);
