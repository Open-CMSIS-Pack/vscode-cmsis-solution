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
import { MANAGE_COMPONENTS_PACKS_COMMAND_ID, MERGE_FILE_COMMAND_ID, RUN_GENERATOR_COMMAND_ID } from '../manifest';
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

        expect(context.subscriptions).toHaveLength(4);
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
            success: true,
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
            success: false,
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
            success: true,
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
            success: false,
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
            success: true,
            severity: 'warning',
            detection: false,
            logMessages: {
                success: true,
                errors: [],
                warnings: ["mylayer.clayer.yml - update required for file '/packs/Component/config.c' from component 'Arm::Device@2.3.4'"],
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
        expect(command).toBe(`command:${MERGE_FILE_COMMAND_ID}`);
        expect(JSON.parse(decodeURIComponent(args))).toEqual(['/packs/Component/config.c']);
    });

    it('attaches run generator command uri only when parsed diagnostic has no location', async () => {
        await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
        const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

        await eventHub.fireConvertCompleted({
            severity: 'error',
            detection: false,
            logMessages: {
                success: false,
                errors: [
                    "mylayer.clayer.yml - cgen file was not found, run generator 'CubeMX2' for context 'CubeMX2.Debug+STM32C531CBT6'",
                    "mylayer.clayer.yml:10:2 - cgen file was not found, run generator 'CubeMX2' for context 'CubeMX2.Debug+STM32C531CBT6'",
                ],
                warnings: [],
                info: [],
            },
        });
        await waitTimeout();

        const setCalls = setSpy.mock.calls as unknown as Array<[vscode.Uri, readonly vscode.Diagnostic[] | undefined]>;
        const diagnostics = setCalls.flatMap(([, diagnosticEntries]) => diagnosticEntries ?? []);
        const runGeneratorDiagnostics = diagnostics.filter(
            d => typeof d.code === 'object' && d.code !== null && 'value' in d.code && d.code.value === 'Run Generator'
        );
        const diagnosticWithoutCode = diagnostics.find(d => d.code === undefined);

        expect(runGeneratorDiagnostics).toHaveLength(1);
        expect(diagnosticWithoutCode).toBeDefined();

        const code = runGeneratorDiagnostics[0].code as { value: string; target: vscode.Uri };
        const [command, args] = code.target.toString().split('?');
        expect(command).toBe(`command:${RUN_GENERATOR_COMMAND_ID}`);
        expect(JSON.parse(decodeURIComponent(args))).toEqual([{ generator: 'CubeMX2', context: 'CubeMX2.Debug+STM32C531CBT6' }]);
    });

    it('falls back to the diagnostic file path for relative merge paths', async () => {
        await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
        const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

        await eventHub.fireConvertCompleted({
            success: true,
            severity: 'warning',
            detection: false,
            logMessages: {
                success: true,
                errors: [],
                warnings: ["mylayer.clayer.yml - update recommended for file 'relative-config.c'"],
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
        expect(command).toBe(`command:${MERGE_FILE_COMMAND_ID}`);
        expect(JSON.parse(decodeURIComponent(args))).toEqual([layerPath]);
    });

    it.each(['required', 'recommended', 'suggested'] as const)(
        'renders merge diagnostics for current toolbox wording with %s update levels',
        async updateLevel => {
            await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
            const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

            await eventHub.fireConvertCompleted({
                success: true,
                severity: 'warning',
                detection: false,
                logMessages: {
                    success: true,
                    errors: [],
                    warnings: [`mylayer.clayer.yml - update ${updateLevel} for file '/packs/Component/${updateLevel}.c'; merge content from update file, rename update file to base file and remove previous base file`],
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
            success: false,
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

    describe('handleCbuildCompleted', () => {
        it('creates diagnostics from cbuild error output messages', async () => {
            await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
            const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');
            const clearSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'clear');

            await eventHub.fireCbuildCompleted({
                success: false,
                severity: 'error',
                toolsOutputMessages: [
                    'error cbuild: failed to generate compile_commands.json',
                ],
            });
            await waitTimeout();

            expect(setSpy).toHaveBeenCalledTimes(1);
            expect(clearSpy).not.toHaveBeenCalled();
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('workbench.actions.view.problems', { preserveFocus: true });
        });

        it('creates diagnostics from cbuild warning output messages', async () => {
            await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
            const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');
            const clearSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'clear');

            await eventHub.fireCbuildCompleted({
                success: true,
                severity: 'warning',
                toolsOutputMessages: [
                    'warning cbuild: some optional step skipped',
                ],
            });
            await waitTimeout();

            expect(setSpy).toHaveBeenCalledTimes(1);
            expect(clearSpy).not.toHaveBeenCalled();
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('workbench.actions.view.problems', { preserveFocus: true });
        });

        it('does not update diagnostics when toolsOutputMessages has no prefixed messages', async () => {
            await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
            const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

            await eventHub.fireCbuildCompleted({
                success: true,
                severity: 'success',
                toolsOutputMessages: [
                    'cbuild setup completed with exit code 0',
                ],
            });
            await waitTimeout();

            expect(setSpy).not.toHaveBeenCalled();
            expect(vscode.commands.executeCommand).not.toHaveBeenCalledWith('workbench.actions.view.problems', { preserveFocus: true });
        });

        it('does not update diagnostics when toolsOutputMessages is empty', async () => {
            await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
            const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

            await eventHub.fireCbuildCompleted({
                success: true,
                severity: 'success',
                toolsOutputMessages: [],
            });
            await waitTimeout();

            expect(setSpy).not.toHaveBeenCalled();
        });

        it('does not update diagnostics when no csolution is loaded', async () => {
            solutionManager.getCsolution.mockReturnValue(undefined);
            await solutionProblems.activate({ subscriptions: [] } as unknown as ExtensionContext);
            const setSpy = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');

            await eventHub.fireCbuildCompleted({
                success: false,
                severity: 'error',
                toolsOutputMessages: [
                    'error cbuild: failed to generate compile_commands.json',
                ],
            });
            await waitTimeout();

            expect(setSpy).not.toHaveBeenCalled();
        });
    });
});
