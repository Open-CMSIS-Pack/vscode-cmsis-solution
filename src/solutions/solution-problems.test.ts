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

import { describe, it, expect, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';
import { ExtensionContext } from 'vscode';
import { MANAGE_COMPONENTS_PACKS_COMMAND_ID, MERGE_FILE_FROM_PATH_COMMAND_ID } from '../manifest';
import * as fsUtils from '../utils/fs-utils';
import * as vscodeUtils from '../utils/vscode-utils';
import { solutionManagerFactory, MockSolutionManager } from './solution-manager.factories';
import { SolutionEventHub } from './solution-event-hub';
import { enrichLogMessagesFromToolOutput, SolutionProblemsImpl } from './solution-problems';
import { waitTimeout } from '../__test__/test-waits';

const solutionPath = '/work/app.csolution.yml';
const layerPath = '/work/config/mylayer.clayer.yml';

const buildCsolution = () => {
    return {
        solutionPath,
        cbuildRunYml: undefined,
        cbuildIdxFile: {
            fileName: '/work/app.cbuild-idx.yml',
            activeContexts: [{
                projectPath: '/work/project.cproject.yml',
                layers: [{ absolutePath: layerPath }],
            }],
            cbuildFiles: new Map([
                ['ctx', { fileName: '/work/ctx.cbuild.yml' }],
            ]),
        },
    };
};

describe('SolutionProblems', () => {
    let solutionManager: MockSolutionManager;
    let eventHub: SolutionEventHub;
    let solutionProblems: SolutionProblemsImpl;

    beforeEach(() => {
        solutionManager = solutionManagerFactory();
        solutionManager.getCsolution.mockReturnValue(buildCsolution() as unknown as ReturnType<MockSolutionManager['getCsolution']>);
        eventHub = new SolutionEventHub();
        solutionProblems = new SolutionProblemsImpl(solutionManager, eventHub);

        (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue({
            lineCount: 200,
            lineAt: () => ({ range: { end: { character: 80 } } }),
        });
        (vscode.commands.executeCommand as jest.Mock).mockClear();
        (vscode.languages.createDiagnosticCollection().set as jest.Mock).mockClear();
        (vscode.languages.createDiagnosticCollection().clear as jest.Mock).mockClear();
    });

    it('registers listener and diagnostic collection on activate', async () => {
        const context = { subscriptions: [] } as unknown as ExtensionContext;

        await solutionProblems.activate(context);

        expect(context.subscriptions).toHaveLength(3);
    });

    it('clears diagnostics when solution path changes', async () => {
        await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
        const clearSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'clear');

        solutionManager.fireOnDidChangeLoadState(
            { solutionPath: '/work/new.csolution.yml' },
            { solutionPath: '/work/old.csolution.yml' }
        );

        expect(clearSpy).toHaveBeenCalledTimes(1);
    });

    it('clears diagnostics when solution is closed', async () => {
        await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
        const clearSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'clear');

        solutionManager.fireOnDidChangeLoadState(
            { solutionPath: undefined },
            { solutionPath: '/work/old.csolution.yml' }
        );

        expect(clearSpy).toHaveBeenCalledTimes(1);
    });
    it('does not clear diagnostics when solution path is unchanged', async () => {
        await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
        const clearSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'clear');

        solutionManager.fireOnDidChangeLoadState(
            { solutionPath: '/work/same.csolution.yml' },
            { solutionPath: '/work/same.csolution.yml' }
        );

        expect(clearSpy).not.toHaveBeenCalled();
    });

    it('creates diagnostics from convert completed log messages', async () => {
        await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
        const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');
        const clearSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'clear');

        await eventHub.fireConvertCompleted({
            severity: 'warning',
            detection: false,
            logMessages: {
                success: true,
                errors: ['mylayer.clayer.yml:10:2 - missing node'],
                warnings: ['app.csolution.yml - unknown tool'],
                info: ['general info message', 'app.cbuild-idx.yml - file generated successfully'],
            },
        });
        await waitTimeout();

        expect(clearSpy).toHaveBeenCalledTimes(1);
        expect(setSpy).toHaveBeenCalledTimes(3);
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith('workbench.actions.view.problems', { preserveFocus: true });
    });

    it('maps diagnostics to referenced source files from solution metadata', async () => {
        await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
        const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

        await eventHub.fireConvertCompleted({
            severity: 'error',
            detection: false,
            logMessages: {
                success: false,
                errors: ['mylayer.clayer.yml:2:1 - invalid value'],
                warnings: [],
                info: [],
            },
        });
        await waitTimeout();

        const [uri] = setSpy.mock.calls[0] as unknown as [vscode.Uri, readonly vscode.Diagnostic[] | undefined];
        expect(uri.fsPath).toContain('mylayer.clayer.yml');
    });

    it('does not open problems view when all messages are excluded', async () => {
        await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
        const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

        await eventHub.fireConvertCompleted({
            severity: 'success',
            detection: false,
            logMessages: {
                success: true,
                errors: [],
                warnings: [],
                info: [
                    'hello.cbuild-idx.yml - file generated successfully',
                    'foo.cbuild.yml - file is already up-to-date',
                ],
            },
        });
        await waitTimeout();

        expect(setSpy).not.toHaveBeenCalled();
        expect(vscode.commands.executeCommand).not.toHaveBeenCalledWith('workbench.actions.view.problems', { preserveFocus: true });
    });

    it('enriches prefixed tool messages and keeps them unique', async () => {
        const messages = { success: true, errors: ['already there'], warnings: [], info: [] };

        await enrichLogMessagesFromToolOutput(messages, [
            'warning cbuild2cmake: generated warning',
            'warning cbuild2cmake: generated warning',
            'error csolution: generated error',
            'error csolution: generated error',
        ]);

        expect(messages.errors).toEqual(['already there', 'generated error']);
        expect(messages.warnings).toEqual(['generated warning']);
    });

    it('formats west-related messages with settings location', async () => {
        jest.spyOn(vscodeUtils, 'getWorkspaceFolder').mockReturnValue('/workspace/folder');
        jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);
        (vscode.workspace as { workspaceFile?: vscode.Uri }).workspaceFile = undefined;
        (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue({
            getText: () => '{"cmsis-csolution.environmentVariables":{}}',
            positionAt: () => ({ line: 2, character: 4 }),
            lineCount: 100,
            lineAt: () => ({ range: { end: { character: 80 } } }),
        });

        const messages = { success: true, errors: [], warnings: [], info: [] };
        await enrichLogMessagesFromToolOutput(messages, [
            'warning cbuild: missing ZEPHYR_BASE environment variable',
            'error cbuild: exec: "west": executable file not found in $PATH',
        ]);

        expect(messages.warnings[0]).toContain('.vscode');
        expect(messages.warnings[0]).toContain('settings.json:3:5 - missing ZEPHYR_BASE environment variable; review "cmsis-csolution.environmentVariables"');
        expect(messages.errors[0]).toContain('.vscode');
        expect(messages.errors[0]).toContain('settings.json:3:5 - exec: "west": executable file not found in $PATH; review "cmsis-csolution.environmentVariables"');
    });

    it('creates manage components command link with context argument', async () => {
        await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
        const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

        await eventHub.fireConvertCompleted({
            severity: 'error',
            detection: false,
            logMessages: {
                success: false,
                errors: ["dependency validation for context 'HID.Debug+STM32U585AIIx' failed:"],
                warnings: [],
                info: [],
            },
        });
        await waitTimeout();

        const [, diagnostics] = setSpy.mock.calls[0] as unknown as [vscode.Uri, readonly vscode.Diagnostic[] | undefined];
        const code = diagnostics?.[0].code as { value: string; target: vscode.Uri };
        const [command, args] = code.target.toString().split('?');

        expect(code.value).toBe('Manage Components');
        expect(command).toBe(`command:${MANAGE_COMPONENTS_PACKS_COMMAND_ID}`);
        expect(JSON.parse(decodeURIComponent(args))).toEqual([{ type: 'context', value: 'HID.Debug+STM32U585AIIx' }]);
    });

    it('creates open merge view command link for absolute merge paths', async () => {
        await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
        const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

        await eventHub.fireConvertCompleted({
            severity: 'warning',
            detection: false,
            logMessages: {
                success: true,
                errors: [],
                warnings: ["mylayer.clayer.yml - file '/packs/Component/config.c' update required from component 'Arm::Device@2.3.4'"],
                info: [],
            },
        });
        await waitTimeout();

        const [, diagnostics] = setSpy.mock.calls[0] as unknown as [vscode.Uri, readonly vscode.Diagnostic[] | undefined];
        const diagnostic = diagnostics?.[0];
        const code = diagnostic?.code as { value: string; target: vscode.Uri };
        const [command, args] = code.target.toString().split('?');

        expect(diagnostic?.message).toBe("update required for config file 'config.c' from component 'Device'.");
        expect(code.value).toBe('Open in Merge View');
        expect(command).toBe(`command:${MERGE_FILE_FROM_PATH_COMMAND_ID}`);
        expect(JSON.parse(decodeURIComponent(args))).toEqual(['/packs/Component/config.c']);
    });

    it('creates a merge command uri with encoded local path', () => {
        const result = solutionProblems['createMergeCommandUri']('/packs/Component/config.c');
        const [command, args] = result.toString().split('?');

        expect(command).toBe(`command:${MERGE_FILE_FROM_PATH_COMMAND_ID}`);
        expect(JSON.parse(decodeURIComponent(args))).toEqual(['/packs/Component/config.c']);
    });

    it('creates merge diagnostic action for merge messages with component context', () => {
        const result = solutionProblems['createMergeDiagnosticAction'](
            "file '/packs/Component/config.c' update required from component 'Arm::Device@2.3.4'",
            layerPath,
        );

        expect(result).toEqual({
            message: "update required for config file 'config.c' from component 'Device'.",
            code: {
                value: 'Open in Merge View',
                target: vscode.Uri.parse(`command:${MERGE_FILE_FROM_PATH_COMMAND_ID}?${encodeURIComponent(JSON.stringify(['/packs/Component/config.c']))}`),
            },
        });
    });

    it('returns undefined merge diagnostic action for non-merge messages', () => {
        const result = solutionProblems['createMergeDiagnosticAction'](
            "component 'Arm::Device@2.3.4' is missing",
            layerPath,
        );

        expect(result).toBeUndefined();
    });

    it('falls back to the diagnostic file path for relative merge paths', async () => {
        await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
        const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

        await eventHub.fireConvertCompleted({
            severity: 'warning',
            detection: false,
            logMessages: {
                success: true,
                errors: [],
                warnings: ["mylayer.clayer.yml - file 'relative-config.c' update recommended"],
                info: [],
            },
        });
        await waitTimeout();

        const [uri, diagnostics] = setSpy.mock.calls[0] as unknown as [vscode.Uri, readonly vscode.Diagnostic[] | undefined];
        const diagnostic = diagnostics?.[0];
        const code = diagnostic?.code as { value: string; target: vscode.Uri };
        const [command, args] = code.target.toString().split('?');

        expect(uri.fsPath).toContain('mylayer.clayer.yml');
        expect(diagnostic?.message).toBe("update recommended for config file 'mylayer.clayer.yml' has a new version available for merge.");
        expect(code.value).toBe('Open in Merge View');
        expect(command).toBe(`command:${MERGE_FILE_FROM_PATH_COMMAND_ID}`);
        expect(JSON.parse(decodeURIComponent(args))).toEqual([layerPath]);
    });

    it.each(['required', 'recommended', 'suggested', 'mandatory'] as const)(
        'renders merge diagnostics for %s update levels',
        async updateLevel => {
            await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
            const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

            await eventHub.fireConvertCompleted({
                severity: 'warning',
                detection: false,
                logMessages: {
                    success: true,
                    errors: [],
                    warnings: [`mylayer.clayer.yml - file '/packs/Component/${updateLevel}.c' update ${updateLevel}`],
                    info: [],
                },
            });
            await waitTimeout();

            const [, diagnostics] = setSpy.mock.calls[0] as unknown as [vscode.Uri, readonly vscode.Diagnostic[] | undefined];
            expect(diagnostics?.[0].message).toBe(
                `update ${updateLevel} for config file '${updateLevel}.c' has a new version available for merge.`
            );
        }
    );

    it('keeps non-merge diagnostics on the generic action path', async () => {
        await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
        const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

        await eventHub.fireConvertCompleted({
            severity: 'error',
            detection: false,
            logMessages: {
                success: false,
                errors: ["mylayer.clayer.yml - component 'Arm::Device@2.3.4' is missing"],
                warnings: [],
                info: [],
            },
        });
        await waitTimeout();

        const [, diagnostics] = setSpy.mock.calls[0] as unknown as [vscode.Uri, readonly vscode.Diagnostic[] | undefined];
        const diagnostic = diagnostics?.[0];
        const code = diagnostic?.code as { value: string; target: vscode.Uri };

        expect(diagnostic?.message).toBe("component 'Arm::Device@2.3.4' is missing");
        expect(code.value).toBe('Find in Files');
        expect(code.target.toString()).toContain('command:workbench.action.findInFiles');
    });
});
