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
import * as fsUtils from '../utils/fs-utils';
import { getWorkspaceFolder } from '../utils/vscode-utils';
import { ProblemDiagnosticActionResolver } from './problem-diagnostic-action-resolver';
import { CbuildResultData, ConvertResultData, SolutionEventHub } from './solution-event-hub';
import {
    isEnvironmentVariableMessage,
    normalizeEnvironmentMessage,
    toolsPrefixPatterns,
} from './solution-problems';

interface SettingsLocation {
    filePath: string;
    range: vscode.Range;
}

interface EnvironmentMessage {
    message: string;
    severity: vscode.DiagnosticSeverity;
}

export interface EnvironmentDiagnostics {
    activate(context: vscode.ExtensionContext): Promise<void>;
}

export class EnvironmentDiagnosticsImpl implements EnvironmentDiagnostics {

    private readonly diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection('csolution-environment');
    private readonly diagnosticActionResolver = new ProblemDiagnosticActionResolver();
    private readonly environmentVariablesSetting = '"cmsis-csolution.environmentVariables"';

    constructor(
        private readonly eventHub: SolutionEventHub,
    ) {
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.eventHub.onDidConvertCompleted(this.handleConvertCompleted, this),
            this.eventHub.onDidCbuildCompleted(this.handleCbuildCompleted, this),
            this.diagnosticCollection,
        );
    }

    private async handleConvertCompleted(data: ConvertResultData): Promise<void> {
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
        await this.updateDiagnostics(messages);
    }

    private async handleCbuildCompleted(data: CbuildResultData): Promise<void> {
        const messages = this.extractEnvironmentMessagesFromToolOutput(data.toolsOutputMessages);
        await this.updateDiagnostics(messages);
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

    private async updateDiagnostics(rawMessages: EnvironmentMessage[]): Promise<void> {
        this.diagnosticCollection.clear();

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
            return;
        }

        const settings = await this.getSettingsLocation();
        if (!settings) {
            return;
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

        const uri = vscode.Uri.file(path.posix.normalize(settings.filePath));
        this.diagnosticCollection.set(uri, diagnostics);
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
}

export const EnvironmentDiagnostics = constructor<typeof EnvironmentDiagnosticsImpl, EnvironmentDiagnostics>(EnvironmentDiagnosticsImpl);
