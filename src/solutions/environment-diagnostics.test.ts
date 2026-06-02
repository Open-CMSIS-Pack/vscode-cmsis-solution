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

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as path from 'node:path';
import * as vscode from 'vscode';
import type { ExtensionContext } from 'vscode';
import { waitTimeout } from '../__test__/test-waits';
import * as fsUtils from '../utils/fs-utils';
import { EnvironmentDiagnosticsImpl } from './environment-diagnostics';
import { SolutionEventHub } from './solution-event-hub';

describe('EnvironmentDiagnostics', () => {
    let eventHub: SolutionEventHub;
    let environmentDiagnostics: EnvironmentDiagnosticsImpl;

    beforeEach(() => {
        jest.clearAllMocks();

        eventHub = new SolutionEventHub();
        environmentDiagnostics = new EnvironmentDiagnosticsImpl(eventHub);

        (vscode.workspace as typeof vscode.workspace & {
            workspaceFolders?: readonly vscode.WorkspaceFolder[];
            workspaceFile?: vscode.Uri;
        }).workspaceFolders = [{
            uri: vscode.Uri.file(path.join(path.sep, 'workspace')),
            name: 'workspace',
            index: 0,
        }];
        (vscode.workspace as typeof vscode.workspace & {
            workspaceFolders?: readonly vscode.WorkspaceFolder[];
            workspaceFile?: vscode.Uri;
        }).workspaceFile = undefined;

        jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);
        (vscode.workspace.openTextDocument as unknown as jest.Mock).mockImplementation(async () => ({
            getText: () => '{"cmsis-csolution.environmentVariables": {}}',
            positionAt: () => ({ line: 0, character: 2 }),
            lineAt: () => ({ range: { end: { character: 42 } } }),
        } as unknown as vscode.TextDocument));
    });

    describe('activation', () => {
        it('registers convert/cbuild listeners and diagnostics collection', async () => {
            const context = { subscriptions: [] } as unknown as ExtensionContext;

            await environmentDiagnostics.activate(context);

            expect(context.subscriptions).toHaveLength(3);
        });
    });

    describe('environment diagnostics updates', () => {
        it('creates diagnostics for unique environment-variable messages and opens Problems view', async () => {
            await environmentDiagnostics.activate({ subscriptions: [] } as unknown as ExtensionContext);
            const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

            await eventHub.fireConvertCompleted({
                success: false,
                severity: 'error',
                detection: false,
                logMessages: {
                    success: false,
                    errors: ['missing ZEPHYR_BASE environment variable'],
                    warnings: ['missing ZEPHYR_BASE environment variable'],
                    info: [],
                },
                toolsOutputMessages: [
                    'warning cbuild: ZEPHYR_BASE environment variable specifies non-existent directory: /missing',
                ],
            });
            await waitTimeout();

            expect(setSpy).toHaveBeenCalledTimes(1);
            const [, diagnostics] = setSpy.mock.calls[0] as unknown as [vscode.Uri, readonly vscode.Diagnostic[] | undefined];
            expect(diagnostics).toHaveLength(2);
            expect(diagnostics?.map(diagnostic => diagnostic.message)).toEqual(expect.arrayContaining([
                'missing ZEPHYR_BASE environment variable; review "cmsis-csolution.environmentVariables"',
                'ZEPHYR_BASE environment variable specifies non-existent directory: /missing; review "cmsis-csolution.environmentVariables"',
            ]));
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('workbench.actions.view.problems', { preserveFocus: true });
        });

        it('does not update diagnostics when no environment-variable message is present', async () => {
            await environmentDiagnostics.activate({ subscriptions: [] } as unknown as ExtensionContext);
            const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

            await eventHub.fireCbuildCompleted({
                success: true,
                severity: 'success',
                toolsOutputMessages: [
                    'warning cbuild: some optional step skipped',
                ],
            });
            await waitTimeout();

            expect(setSpy).not.toHaveBeenCalled();
            expect(vscode.commands.executeCommand).not.toHaveBeenCalledWith('workbench.actions.view.problems', { preserveFocus: true });
        });

        it('targets diagnostics at the workspace file path when present', async () => {
            const workspaceFilePath = 'C:\\workspace\\my.code-workspace';
            (vscode.workspace as typeof vscode.workspace & {
                workspaceFile?: vscode.Uri;
            }).workspaceFile = vscode.Uri.file(workspaceFilePath);

            jest.spyOn(fsUtils, 'fileExists').mockReturnValue(false);
            await environmentDiagnostics.activate({ subscriptions: [] } as unknown as ExtensionContext);
            const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

            await eventHub.fireCbuildCompleted({
                success: false,
                severity: 'error',
                toolsOutputMessages: [
                    'error cbuild: missing ZEPHYR_BASE environment variable',
                ],
            });
            await waitTimeout();

            expect(setSpy).toHaveBeenCalledTimes(1);
            const [uri] = setSpy.mock.calls[0] as unknown as [vscode.Uri, readonly vscode.Diagnostic[] | undefined];
            expect(uri.fsPath).toBe(vscode.Uri.file(workspaceFilePath).fsPath);
        });
    });
});
