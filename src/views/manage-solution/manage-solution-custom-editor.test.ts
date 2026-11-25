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

import 'jest';
import * as vscode from 'vscode';
import { setImmediate } from 'node:timers';
import * as manifest from '../../manifest';
import { csolutionFactory } from '../../solutions/csolution.factory';
import { activeSolutionLoadStateFactory, idleSolutionLoadStateFactory, solutionManagerFactory } from '../../solutions/solution-manager.factories';
import { commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { configurationProviderFactory } from '../../vscode-api/configuration-provider.factories';
import { ManageSolutionCustomEditorProvider, registerManageSolutionCommand } from './manage-solution-custom-editor';
import { OpenCommand } from '../solution-outline/commands/open-command';
import { openFileExternalFactory } from '../../open-file-external.factories';
import { extensionContextFactory } from '../../vscode-api/extension-context.factories';
import { manageSolutionWebviewMainFactory } from './manage-solution-webview-main.factories';

type MockTabGroup = { tabs: vscode.Tab[]; viewColumn?: vscode.ViewColumn };

type MockTabGroups = {
    all: MockTabGroup[];
    activeTabGroup?: MockTabGroup;
    close: jest.Mock;
    onDidChangeTabs: jest.Mock;
};

describe('registerManageSolutionCommand', () => {
    const solutionUri = vscode.Uri.file('/workspace/folder/solution.csolution.yml');
    const commandOpenUiEditor = `${manifest.PACKAGE_NAME}.openManageSolutionUiEditor`;
    const commandOpenTextEditor = `${manifest.PACKAGE_NAME}.openManageSolutionTextEditor`;
    const commandManageSolution = `${manifest.PACKAGE_NAME}.manageSolution`;
    const defaultOpenOptions = { viewColumn: vscode.ViewColumn.Active, preview: false };

    let tabGroups: MockTabGroups;
    let onDidChangeTabsHandler: ((event: vscode.TabChangeEvent) => void) | undefined;
    let commandsProvider: ReturnType<typeof commandsProviderFactory>;
    let solutionManager: ReturnType<typeof solutionManagerFactory>;
    let configurationProvider: ReturnType<typeof configurationProviderFactory>;
    const originalTabGroups = vscode.window.tabGroups;
    const originalActiveTextEditor = Object.getOwnPropertyDescriptor(vscode.window, 'activeTextEditor');

    const makeTab = (mode: 'ui' | 'text', uri = solutionUri) => ({
        input: mode === 'ui'
            ? new vscode.TabInputCustom(uri, ManageSolutionCustomEditorProvider.viewType)
            : new vscode.TabInputText(uri),
        isActive: false,
    } as vscode.Tab & { isActive: boolean });

    const fireTabEvent = (event: Partial<vscode.TabChangeEvent>) => {
        onDidChangeTabsHandler?.({ opened: [], changed: [], closed: [], ...event });
    };

    const removeTabs = (tabs: readonly vscode.Tab[]) => {
        const closed = tabGroups.all.flatMap(group => group.tabs.filter(tab => tabs.includes(tab)));
        for (const group of tabGroups.all) {
            group.tabs = group.tabs.filter(tab => !closed.includes(tab));
        }
        fireTabEvent({ closed });
    };

    const openTab = (tab: vscode.Tab) => {
        tabGroups.all[0].tabs.push(tab);
        fireTabEvent({ opened: [tab] });
    };

    // Advance to the next event-loop turn, after queued editor switches and their events settle.
    const settleTabEvents = () => new Promise<void>(resolve => setImmediate(resolve));

    const register = () => registerManageSolutionCommand(commandsProvider, solutionManager, configurationProvider);

    beforeEach(() => {
        onDidChangeTabsHandler = undefined;
        tabGroups = {
            all: [],
            close: jest.fn().mockImplementation(async (tabs: readonly vscode.Tab[]) => {
                removeTabs(tabs);
                return true;
            }),
            onDidChangeTabs: jest.fn().mockImplementation((cb: (event: vscode.TabChangeEvent) => void) => {
                onDidChangeTabsHandler = cb;
                return { dispose: jest.fn() };
            }),
        };

        (vscode.window as unknown as { tabGroups: MockTabGroups }).tabGroups = tabGroups;
        commandsProvider = commandsProviderFactory();
        solutionManager = solutionManagerFactory({
            loadState: activeSolutionLoadStateFactory({ solutionPath: solutionUri.fsPath }),
        });
        configurationProvider = configurationProviderFactory();
        configurationProvider.getConfigVariableOrDefault.mockReturnValue(true);
        solutionManager.getCsolution.mockReturnValue(csolutionFactory({ solutionPath: solutionUri.fsPath }));
    });

    afterEach(() => {
        (vscode.window as unknown as { tabGroups: vscode.TabGroups }).tabGroups = originalTabGroups;
        if (originalActiveTextEditor) {
            Object.defineProperty(vscode.window, 'activeTextEditor', originalActiveTextEditor);
        } else {
            Reflect.deleteProperty(vscode.window, 'activeTextEditor');
        }
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe('outline toolbar', () => {
        const firstColumn = 1 as vscode.ViewColumn;
        const secondColumn = 2 as vscode.ViewColumn;
        let groupOrchestrator: {
            getTargetViewColumn: jest.Mock;
            rememberTargetViewColumn: jest.Mock;
        };
        const runOutlineCommand = (mode: 'ui' | 'text') => commandsProvider.mockRunRegistered(
            mode === 'ui' ? commandManageSolution : OpenCommand.openSolutionCommandId,
        );

        beforeEach(async () => {
            const group = { tabs: [] as vscode.Tab[], viewColumn: firstColumn };
            tabGroups.all = [group];
            tabGroups.activeTabGroup = group;
            groupOrchestrator = {
                getTargetViewColumn: jest.fn().mockReturnValue(firstColumn),
                rememberTargetViewColumn: jest.fn(),
            };
            commandsProvider.executeCommand.mockImplementation(async (command, ...args) => {
                if (command === commandOpenTextEditor) {
                    return commandsProvider.mockRunRegistered(command, ...args);
                }
                if (command === 'vscode.openWith') {
                    const [uri, viewType, options] = args as [vscode.Uri, string, vscode.TextDocumentShowOptions];
                    const target = tabGroups.all.find(candidate => candidate.viewColumn === options.viewColumn)!;
                    const mode = viewType === 'default' ? 'text' : 'ui';
                    let tab = target.tabs.find(candidate => {
                        const input = candidate.input as vscode.TabInputText | vscode.TabInputCustom;
                        return input.uri.toString() === uri.toString()
                            && (mode === 'text' ? input instanceof vscode.TabInputText : input instanceof vscode.TabInputCustom);
                    });
                    if (!tab) {
                        tab = makeTab(mode, uri);
                        target.tabs.push(tab);
                        fireTabEvent({ opened: [tab] });
                    }
                    tabGroups.activeTabGroup = target;
                }
                return undefined;
            });
            registerManageSolutionCommand(commandsProvider, solutionManager, configurationProvider, groupOrchestrator);
            await new OpenCommand(solutionManager, commandsProvider, openFileExternalFactory(), undefined, groupOrchestrator)
                .activate(extensionContextFactory());
        });

        it.each(['ui', 'text'] as const)('opens, switches and reuses the active solution in %s mode', async mode => {
            const otherUri = vscode.Uri.file('/workspace/other.csolution.yml');
            const unrelated = makeTab('text', otherUri);
            tabGroups.all[0].tabs.push(unrelated);
            Object.defineProperty(vscode.window, 'activeTextEditor', {
                configurable: true,
                value: { document: { uri: otherUri } },
            });

            for (const requested of [mode, mode === 'text' ? 'ui' : 'text', mode, mode] as const) {
                await runOutlineCommand(requested);
                await settleTabEvents();

                const tabs = tabGroups.all[0].tabs;
                expect(tabs).toHaveLength(2);
                expect(tabs).toContain(unrelated);
                const input = tabs.find(tab => tab !== unrelated)?.input as vscode.TabInputText | vscode.TabInputCustom;
                expect(input).toBeInstanceOf(requested === 'text' ? vscode.TabInputText : vscode.TabInputCustom);
                expect(input.uri.toString()).toBe(solutionUri.toString());
            }
        });

        it.each(['ui', 'text'] as const)('aborts the outline switch to %s when the close is cancelled', async mode => {
            const original = makeTab(mode === 'text' ? 'ui' : 'text');
            tabGroups.all[0].tabs.push(original);
            tabGroups.close.mockResolvedValue(false);

            await runOutlineCommand(mode);

            expect(tabGroups.all[0].tabs).toEqual([original]);
            expect(commandsProvider.executeCommand.mock.calls.some(([command]) => command === 'vscode.openWith')).toBe(false);
        });

        it.each(['ui', 'text'] as const)('allows both modes through the outline with single-editor mode disabled: %s', async mode => {
            const original = makeTab(mode === 'text' ? 'ui' : 'text');
            tabGroups.all[0].tabs.push(original);
            configurationProvider.getConfigVariableOrDefault.mockReturnValue(false);

            await runOutlineCommand(mode);
            await settleTabEvents();

            expect(tabGroups.close).not.toHaveBeenCalled();
            expect(tabGroups.all[0].tabs).toHaveLength(2);
            expect(tabGroups.all[0].tabs).toContain(original);
        });

        it('does not let Manage Solution fall back to an open file when no solution is active', async () => {
            solutionManager.loadState = idleSolutionLoadStateFactory();
            Object.defineProperty(vscode.window, 'activeTextEditor', {
                configurable: true,
                value: { document: { uri: solutionUri } },
            });

            await runOutlineCommand('ui');

            expect(tabGroups.all[0].tabs).toEqual([]);
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No active solution. Open a .csolution.yml first.');
        });

        it.each(['ui', 'text'] as const)('uses the shared outline target group for a first %s open', async mode => {
            const target = { tabs: [] as vscode.Tab[], viewColumn: secondColumn };
            tabGroups.all.push(target);
            groupOrchestrator.getTargetViewColumn.mockReturnValue(secondColumn);

            await runOutlineCommand(mode);

            expect(tabGroups.all[0].tabs).toEqual([]);
            expect(target.tabs).toHaveLength(1);
            expect(tabGroups.activeTabGroup).toBe(target);
            expect(groupOrchestrator.rememberTargetViewColumn).toHaveBeenCalledWith('solution-outline', secondColumn);
        });

        it.each(['ui', 'text'] as const)('reuses an existing %s tab in another group', async mode => {
            const existing = makeTab(mode);
            const target = { tabs: [existing], viewColumn: secondColumn };
            tabGroups.all.push(target);

            await runOutlineCommand(mode);
            await runOutlineCommand(mode);

            expect(tabGroups.all[0].tabs).toEqual([]);
            expect(target.tabs).toEqual([existing]);
            expect(tabGroups.activeTabGroup).toBe(target);
        });

        it.each(['ui', 'text'] as const)('switches in the existing solution group to %s', async mode => {
            const original = makeTab(mode === 'text' ? 'ui' : 'text');
            const target = { tabs: [original], viewColumn: secondColumn };
            tabGroups.all.push(target);

            await runOutlineCommand(mode);

            expect(tabGroups.all[0].tabs).toEqual([]);
            expect(target.tabs).toHaveLength(1);
            expect(target.tabs).not.toContain(original);
            expect(tabGroups.activeTabGroup).toBe(target);
        });

        it('follows the requested editor group when closing another group renumbers it', async () => {
            const original = makeTab('ui');
            const existing = makeTab('text');
            const target = { tabs: [existing], viewColumn: secondColumn };
            tabGroups.all[0].tabs.push(original);
            tabGroups.all.push(target);
            tabGroups.close.mockImplementationOnce(async (tabs: readonly vscode.Tab[]) => {
                removeTabs(tabs);
                tabGroups.all.shift();
                target.viewColumn = firstColumn;
                return true;
            });

            await runOutlineCommand('text');

            expect(tabGroups.all).toEqual([target]);
            expect(target.tabs).toEqual([existing]);
            expect(tabGroups.activeTabGroup).toBe(target);
        });
    });

    it.each([true, false])('honors the dirty UI close result when opening a solution source link: %s', async closed => {
        const original = Object.assign(makeTab('ui'), { isDirty: true });
        tabGroups.all = [{ tabs: [original] }];
        let finishClose!: (closed: boolean) => void;
        const closeResult = new Promise<boolean>(resolve => { finishClose = resolve; });
        tabGroups.close.mockImplementationOnce(async (tabs: readonly vscode.Tab[]) => {
            if (await closeResult) {
                removeTabs(tabs);
                return true;
            }
            return false;
        });
        commandsProvider.executeCommand.mockImplementation(async (command, ...args) => {
            if (command === commandOpenTextEditor) {
                await commandsProvider.mockRunRegistered(command, ...args);
            } else if (command === 'vscode.openWith') {
                openTab(makeTab('text', args[0] as vscode.Uri));
            }
        });
        register();
        const main = manageSolutionWebviewMainFactory({ commandsProvider, solutionManager, configurationProvider });
        main.controller.csolutionYml.fileName = solutionUri.fsPath;

        const opening = main['handleMessage']({ type: 'OPEN_FILE', path: solutionUri.fsPath });
        await settleTabEvents();

        expect(tabGroups.close).toHaveBeenCalledWith([original], true);
        expect(tabGroups.all[0].tabs).toEqual([original]);
        expect(commandsProvider.executeCommand).toHaveBeenCalledTimes(1);

        finishClose(closed);
        await opening;
        await settleTabEvents();

        if (closed) {
            expect(commandsProvider.executeCommand).toHaveBeenLastCalledWith(
                'vscode.openWith', expect.objectContaining({ fsPath: solutionUri.fsPath }), 'default', defaultOpenOptions,
            );
            expect(tabGroups.all[0].tabs).toHaveLength(1);
            expect(tabGroups.all[0].tabs[0].input).toBeInstanceOf(vscode.TabInputText);
        } else {
            expect(commandsProvider.executeCommand).toHaveBeenCalledTimes(1);
            expect(tabGroups.all[0].tabs).toEqual([original]);
        }
    });

    it.each(['ui', 'text'] as const)('keeps the %s tab when switching from the toolbar', async mode => {
        const textTab = makeTab('text');
        const customTab = makeTab('ui');
        tabGroups.all = [{ tabs: [textTab, customTab] }];
        register();

        await commandsProvider.mockRunRegistered(mode === 'ui' ? commandOpenUiEditor : commandOpenTextEditor, solutionUri);
        await settleTabEvents();

        expect(tabGroups.close).toHaveBeenCalledTimes(1);
        expect(tabGroups.close).toHaveBeenCalledWith([mode === 'ui' ? textTab : customTab], true);
        expect(tabGroups.all[0].tabs).toEqual([mode === 'ui' ? customTab : textTab]);
        expect(commandsProvider.executeCommand).toHaveBeenCalledWith(
            'vscode.openWith', solutionUri, mode === 'ui' ? ManageSolutionCustomEditorProvider.viewType : 'default', defaultOpenOptions,
        );
    });

    it.each(['ui', 'text'] as const)('keeps the native %s replacement after VS Code closes the original tab', async mode => {
        const original = makeTab(mode === 'ui' ? 'text' : 'ui');
        const replacement = makeTab(mode);
        tabGroups.all = [{ tabs: [original] }];
        register();

        openTab(replacement);
        removeTabs([original]);
        await settleTabEvents();

        expect(tabGroups.all[0].tabs).toEqual([replacement]);
        expect(tabGroups.close).not.toHaveBeenCalled();
    });

    it.each(['ui', 'text'] as const)('preserves a newly opened %s tab while the original still exists', async mode => {
        const original = makeTab(mode === 'ui' ? 'text' : 'ui');
        const replacement = makeTab(mode);
        tabGroups.all = [{ tabs: [original] }];
        register();

        openTab(replacement);
        await settleTabEvents();
        removeTabs([original]);
        await settleTabEvents();

        expect(tabGroups.close).toHaveBeenCalledTimes(1);
        expect(tabGroups.close).toHaveBeenCalledWith([original], true);
        expect(tabGroups.all[0].tabs).toEqual([replacement]);
    });

    it.each(['ui', 'text'] as const)('aborts the toolbar switch to %s when closing the other mode is cancelled', async mode => {
        const original = makeTab(mode === 'ui' ? 'text' : 'ui');
        tabGroups.all = [{ tabs: [original] }];
        tabGroups.close.mockResolvedValue(false);
        register();

        await commandsProvider.mockRunRegistered(mode === 'ui' ? commandOpenUiEditor : commandOpenTextEditor, solutionUri);

        expect(tabGroups.all[0].tabs).toEqual([original]);
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
    });

    it('honors a newly activated editor without treating later metadata changes as switches', async () => {
        const textTab = makeTab('text');
        const customTab = makeTab('ui');
        customTab.isActive = true;
        tabGroups.all = [{ tabs: [customTab, textTab] }];
        register();

        fireTabEvent({ changed: [customTab] });
        await settleTabEvents();
        expect(tabGroups.close).not.toHaveBeenCalled();

        customTab.isActive = false;
        textTab.isActive = true;
        fireTabEvent({ changed: [customTab, textTab] });
        await settleTabEvents();

        expect(tabGroups.close).toHaveBeenCalledWith([customTab], true);
        expect(tabGroups.all[0].tabs).toEqual([textTab]);
    });

    it('does not let tab events compete with a pending toolbar switch', async () => {
        const textTab = makeTab('text');
        const customTab = makeTab('ui');
        tabGroups.all = [{ tabs: [customTab, textTab] }];
        let finishClose!: (closed: boolean) => void;
        const closeResult = new Promise<boolean>(resolve => { finishClose = resolve; });
        tabGroups.close.mockImplementation(async (tabs: readonly vscode.Tab[]) => {
            const closed = await closeResult;
            removeTabs(tabs);
            return closed;
        });
        register();

        const switching = commandsProvider.mockRunRegistered(commandOpenTextEditor, solutionUri);
        await settleTabEvents();
        customTab.isActive = true;
        fireTabEvent({ changed: [customTab] });
        await settleTabEvents();
        finishClose(true);
        await switching;
        await settleTabEvents();

        expect(tabGroups.close).toHaveBeenCalledTimes(1);
        expect(tabGroups.all[0].tabs).toEqual([textTab]);
    });

    it('serializes overlapping toolbar switches for the same solution', async () => {
        const original = makeTab('ui');
        tabGroups.all = [{ tabs: [original] }];
        let finishClose!: () => void;
        const closeResult = new Promise<void>(resolve => { finishClose = resolve; });
        tabGroups.close.mockImplementationOnce(async (tabs: readonly vscode.Tab[]) => {
            await closeResult;
            removeTabs(tabs);
            return true;
        });
        commandsProvider.executeCommand.mockImplementation(async (_command, _uri, viewType) => {
            openTab(makeTab(viewType === 'default' ? 'text' : 'ui'));
        });
        register();

        const openingText = commandsProvider.mockRunRegistered(commandOpenTextEditor, solutionUri);
        await settleTabEvents();
        const openingUi = commandsProvider.mockRunRegistered(commandOpenUiEditor, solutionUri);
        await settleTabEvents();
        expect(tabGroups.close).toHaveBeenCalledTimes(1);
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();

        finishClose();
        await Promise.all([openingText, openingUi]);
        await settleTabEvents();

        expect(commandsProvider.executeCommand).toHaveBeenNthCalledWith(1, 'vscode.openWith', solutionUri, 'default', defaultOpenOptions);
        expect(commandsProvider.executeCommand).toHaveBeenNthCalledWith(
            2, 'vscode.openWith', solutionUri, ManageSolutionCustomEditorProvider.viewType, defaultOpenOptions,
        );
        expect(tabGroups.all[0].tabs.map(tab => tab.input)).toEqual([
            new vscode.TabInputCustom(solutionUri, ManageSolutionCustomEditorProvider.viewType),
        ]);
    });

    it('lets an explicit switch supersede native cleanup that is still queued', async () => {
        const original = makeTab('ui');
        const replacement = makeTab('text');
        tabGroups.all = [{ tabs: [original] }];
        register();

        openTab(replacement);
        await commandsProvider.mockRunRegistered(commandOpenUiEditor, solutionUri);
        await settleTabEvents();

        expect(tabGroups.close).toHaveBeenCalledTimes(1);
        expect(tabGroups.close).toHaveBeenCalledWith([replacement], true);
        expect(tabGroups.all[0].tabs).toEqual([original]);
    });

    it('does not block another solution while a switch is pending', async () => {
        const otherUri = vscode.Uri.file('/workspace/folder/other.csolution.yml');
        const original = makeTab('ui');
        const otherOriginal = makeTab('ui', otherUri);
        tabGroups.all = [{ tabs: [original, otherOriginal] }];
        let finishClose!: () => void;
        const closeResult = new Promise<void>(resolve => { finishClose = resolve; });
        tabGroups.close.mockImplementationOnce(async (tabs: readonly vscode.Tab[]) => {
            await closeResult;
            removeTabs(tabs);
            return true;
        });
        register();

        const firstSwitch = commandsProvider.mockRunRegistered(commandOpenTextEditor, solutionUri);
        await settleTabEvents();
        await commandsProvider.mockRunRegistered(commandOpenTextEditor, otherUri);

        expect(tabGroups.all[0].tabs).toEqual([original]);
        expect(commandsProvider.executeCommand).toHaveBeenCalledTimes(1);
        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.openWith', otherUri, 'default', defaultOpenOptions);

        finishClose();
        await firstSwitch;

        expect(commandsProvider.executeCommand).toHaveBeenLastCalledWith('vscode.openWith', solutionUri, 'default', defaultOpenOptions);
    });

    it('runs the next queued switch after an editor-open failure and then resumes native cleanup', async () => {
        const original = makeTab('ui');
        const error = new Error('Editor open failed');
        tabGroups.all = [{ tabs: [original] }];
        let failOpen!: (error: Error) => void;
        const openResult = new Promise<void>((_resolve, reject) => { failOpen = reject; });
        commandsProvider.executeCommand.mockImplementationOnce(() => openResult);
        register();

        const firstSwitch = commandsProvider.mockRunRegistered(commandOpenTextEditor, solutionUri);
        const firstFailure = expect(firstSwitch).rejects.toThrow(error);
        await settleTabEvents();
        const nextSwitch = commandsProvider.mockRunRegistered(commandOpenUiEditor, solutionUri);
        await settleTabEvents();
        expect(commandsProvider.executeCommand).toHaveBeenCalledTimes(1);

        failOpen(error);
        await firstFailure;
        await nextSwitch;
        expect(commandsProvider.executeCommand).toHaveBeenLastCalledWith(
            'vscode.openWith', solutionUri, ManageSolutionCustomEditorProvider.viewType, defaultOpenOptions,
        );

        const textTab = makeTab('text');
        const customTab = makeTab('ui');
        openTab(textTab);
        await settleTabEvents();
        openTab(customTab);
        await settleTabEvents();

        expect(tabGroups.close).toHaveBeenLastCalledWith([textTab], true);
        expect(tabGroups.all[0].tabs).toEqual([customTab]);
    });

    it('uses the latest native mode request when multiple events arrive before cleanup', async () => {
        const original = makeTab('ui');
        const textTab = makeTab('text');
        const replacement = makeTab('ui');
        tabGroups.all = [{ tabs: [original] }];
        register();

        openTab(textTab);
        openTab(replacement);
        removeTabs([original]);
        await settleTabEvents();

        expect(tabGroups.close).toHaveBeenCalledTimes(1);
        expect(tabGroups.close).toHaveBeenCalledWith([textTab], true);
        expect(tabGroups.all[0].tabs).toEqual([replacement]);
    });

    it('ignores queued native requests whose preferred tab has already closed', async () => {
        const original = makeTab('ui');
        const replacement = makeTab('text');
        tabGroups.all = [{ tabs: [original] }];
        register();

        openTab(replacement);
        removeTabs([replacement]);
        await settleTabEvents();

        expect(tabGroups.close).not.toHaveBeenCalled();
        expect(tabGroups.all[0].tabs).toEqual([original]);
    });

    it('keeps the requested mode when closing the original tab activates it and is then cancelled', async () => {
        const original = makeTab('ui');
        const replacement = makeTab('text');
        tabGroups.all = [{ tabs: [original] }];
        tabGroups.close.mockImplementationOnce(async () => {
            original.isActive = true;
            fireTabEvent({ changed: [original] });
            return false;
        });
        register();

        openTab(replacement);
        await settleTabEvents();
        fireTabEvent({ changed: [original] });
        await settleTabEvents();

        expect(tabGroups.close).toHaveBeenCalledTimes(1);
        expect(tabGroups.all[0].tabs).toEqual([original, replacement]);
    });

    it('allows another switch after automatic cleanup fails', async () => {
        const original = makeTab('ui');
        const replacement = makeTab('text');
        const error = new Error('Tab close failed');
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        tabGroups.all = [{ tabs: [original] }];
        tabGroups.close.mockRejectedValueOnce(error);
        register();

        openTab(replacement);
        await settleTabEvents();
        expect(errorSpy).toHaveBeenCalledWith('Failed to enforce Manage Solution editor mode:', error);

        await commandsProvider.mockRunRegistered(commandOpenUiEditor, solutionUri);

        expect(tabGroups.all[0].tabs).toEqual([original]);
        expect(commandsProvider.executeCommand).toHaveBeenCalledWith(
            'vscode.openWith', solutionUri, ManageSolutionCustomEditorProvider.viewType, defaultOpenOptions,
        );
    });

    it('only closes the opposite mode for the same URI across editor groups', async () => {
        const original = makeTab('ui');
        const otherGroupUi = makeTab('ui');
        const unrelatedSolution = makeTab('ui', vscode.Uri.file('/workspace/folder/other.csolution.yml'));
        const unrelatedFile = makeTab('text', vscode.Uri.file('/workspace/folder/readme.md'));
        const replacement = makeTab('text');
        tabGroups.all = [{ tabs: [original, unrelatedFile] }, { tabs: [otherGroupUi, unrelatedSolution] }];
        register();

        openTab(replacement);
        await settleTabEvents();

        expect(tabGroups.close).toHaveBeenCalledWith([original, otherGroupUi], true);
        expect(tabGroups.all.map(group => group.tabs)).toEqual([[unrelatedFile, replacement], [unrelatedSolution]]);
    });

    it.each(['ui', 'text'] as const)('does not close tabs when opening %s with single-editor mode disabled', async mode => {
        const textTab = makeTab('text');
        const customTab = makeTab('ui');
        tabGroups.all = [{ tabs: [customTab, textTab] }];
        configurationProvider.getConfigVariableOrDefault.mockReturnValue(false);
        register();

        await commandsProvider.mockRunRegistered(mode === 'ui' ? commandOpenUiEditor : commandOpenTextEditor, solutionUri);
        fireTabEvent({ opened: [mode === 'ui' ? customTab : textTab] });
        await settleTabEvents();

        expect(tabGroups.close).not.toHaveBeenCalled();
        expect(tabGroups.all[0].tabs).toEqual([customTab, textTab]);
        expect(commandsProvider.executeCommand).toHaveBeenCalledWith(
            'vscode.openWith', solutionUri, mode === 'ui' ? ManageSolutionCustomEditorProvider.viewType : 'default', defaultOpenOptions,
        );
    });
});
