/**
 * Copyright 2022-2026 Arm Limited
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

import 'jest';
import { ActiveSolutionTracker, ActiveSolutionTrackerImpl, COMMAND_ACTIVATE_SOLUTION, SolutionDetails, solutionFileWatchPattern } from './active-solution-tracker';
import * as vscode from 'vscode';
import { WorkspaceFolder } from 'vscode';
import { URI } from 'vscode-uri';
import * as path from 'path';
import { waitForEvent, waitTimeout } from '../__test__/test-waits';
import { waitForCondition } from '../__test__/wait-for-condition';
import { messageProviderFactory } from '../vscode-api/message-provider.factories';
import { commandsProviderFactory, MockCommandsProvider } from '../vscode-api/commands-provider.factories';
import { MockFileWatcherProvider, fileWatcherProviderFactory } from '../vscode-api/file-watcher-provider.factories';
import { MockWorkspaceFoldersProvider, workspaceFoldersProviderFactory } from '../vscode-api/workspace-folders-provider.factories';
import { MockConfigurationProvider, configurationProviderFactory } from '../vscode-api/configuration-provider.factories';
import * as manifest from '../manifest';
import { faker } from '@faker-js/faker';
import { MockWorkspaceFsProvider, workspaceFsProviderFactory } from '../vscode-api/workspace-fs-provider.factories';
import { FileType } from '../vscode-api/workspace-fs-provider';

const WORKSPACE_PATH = __dirname;

const SOLUTION_URI_DEFAULT = URI.file(path.join(WORKSPACE_PATH,'test.csolution.yml'));
const SOLUTION_URI_FOO = URI.file(path.join(WORKSPACE_PATH,'foo','Foo.csolution.yml'));
const SOLUTION_URI_BAR = URI.file(path.join(WORKSPACE_PATH,'bar','Bar.csolution.yml'));
const SOLUTION_URI_NEW = URI.file(path.join(WORKSPACE_PATH,'new','New.csolution.yml'));

describe('ActiveSolutionTracker', () => {
    let changeSolutionsListener: jest.Mock;
    let changeActiveListener: jest.Mock;
    let activeSolutionTracker: ActiveSolutionTracker;
    let context: { subscriptions: Array<{ dispose: () => Promise<void> }>, workspaceState: { get: jest.Mock, update: jest.Mock }, extension: { activate: jest.Mock } };
    let commandsProvider: MockCommandsProvider;
    let fileWatcherProvider: MockFileWatcherProvider;
    let workspaceFoldersProvider: MockWorkspaceFoldersProvider;
    let workspaceFsProvider: MockWorkspaceFsProvider;
    let configurationProvider: MockConfigurationProvider;

    beforeEach(() => {
        (vscode.workspace as { workspaceFolders: WorkspaceFolder[] | undefined }).workspaceFolders = [
            { uri: URI.file(WORKSPACE_PATH) } as WorkspaceFolder
        ];

        context = {
            subscriptions: [],
            workspaceState: { get: jest.fn(), update: jest.fn() },
            extension: {
                activate: jest.fn().mockImplementation(() => waitTimeout(2)),
            },
        };

        (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([
            SOLUTION_URI_FOO,
            SOLUTION_URI_BAR,
            SOLUTION_URI_DEFAULT,
        ]);

        changeSolutionsListener = jest.fn();
        changeActiveListener = jest.fn();

        commandsProvider = commandsProviderFactory();
        fileWatcherProvider = fileWatcherProviderFactory();
        workspaceFoldersProvider = workspaceFoldersProviderFactory([{ uri: URI.file(WORKSPACE_PATH), name: 'Workspace Folder 1', index: 1 }]);
        configurationProvider = configurationProviderFactory();
        workspaceFsProvider = workspaceFsProviderFactory();

        activeSolutionTracker = new ActiveSolutionTrackerImpl(
            messageProviderFactory(),
            commandsProvider,
            fileWatcherProvider,
            workspaceFoldersProvider,
            workspaceFsProvider,
            configurationProvider,
            0
        );

        activeSolutionTracker.onDidChangeActiveSolution(changeActiveListener);
        activeSolutionTracker.onDidChangeSolutions(changeSolutionsListener);
    });

    afterEach(async () => {
        for (const { dispose } of context.subscriptions) {
            await dispose();
        }
    });

    it('searches for solution files on activation', async () => {
        await activeSolutionTracker.activate(context as unknown as vscode.ExtensionContext);
        await waitForCondition(
            async () => (vscode.workspace.findFiles as jest.Mock).mock.calls.length > 0,
            'solution file search to be triggered after activation',
            200,
        );

        expect(vscode.workspace.findFiles).toHaveBeenCalledTimes(1);
        expect(vscode.workspace.findFiles).toHaveBeenCalledWith(ActiveSolutionTrackerImpl.GLOB_PATTERN, undefined);
    });

    it('uses the configured glob pattern for searches', async () => {
        const testGlobPattern = faker.word.words();
        configurationProvider.getConfigVariable.mockImplementation((name: string) => name === manifest.CONFIG_EXCLUDE ? testGlobPattern : undefined);

        await activeSolutionTracker.activate(context as unknown as vscode.ExtensionContext);
        await waitForCondition(
            async () => (vscode.workspace.findFiles as jest.Mock).mock.calls.length > 0,
            'solution file search to be triggered with configured exclude glob',
            200,
        );

        expect(vscode.workspace.findFiles).toHaveBeenCalledTimes(1);
        expect(vscode.workspace.findFiles).toHaveBeenCalledWith(ActiveSolutionTrackerImpl.GLOB_PATTERN, testGlobPattern);
    });

    it('updates when the configured glob pattern changes', async () => {
        await activeSolutionTracker.activate(context as unknown as vscode.ExtensionContext);
        await waitForCondition(
            async () => (vscode.workspace.findFiles as jest.Mock).mock.calls.length > 0,
            'initial solution file search to complete',
            200,
        );

        (vscode.workspace.findFiles as jest.Mock).mockClear();

        expect(configurationProvider.onChangeConfiguration).toHaveBeenCalledTimes(1);
        expect(configurationProvider.onChangeConfiguration).toHaveBeenCalledWith(expect.any(Function), manifest.CONFIG_EXCLUDE);

        const testGlobPattern = faker.word.words();
        configurationProvider.getConfigVariable.mockImplementation((name: string) => name === manifest.CONFIG_EXCLUDE ? testGlobPattern : undefined);
        configurationProvider.onChangeConfiguration.mock.calls[0][0]();
        await waitForCondition(
            async () => (vscode.workspace.findFiles as jest.Mock).mock.calls.length > 0,
            'solution file search to run after configuration change',
            200,
        );

        expect(vscode.workspace.findFiles).toHaveBeenCalledTimes(1);
        expect(vscode.workspace.findFiles).toHaveBeenCalledWith(ActiveSolutionTrackerImpl.GLOB_PATTERN, testGlobPattern);
    });

    describe('activated with no solutions in the workspace', () => {
        beforeEach(async () => {
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);

            await activeSolutionTracker.activate(context as unknown as vscode.ExtensionContext);
            await waitForCondition(
                async () => (vscode.workspace.findFiles as jest.Mock).mock.calls.length > 0,
                'solution file search to complete in empty workspace',
                200,
            );
        });

        it('has no solutions or active solution', () => {
            expect(activeSolutionTracker.solutions).toEqual([]);
            expect(activeSolutionTracker.activeSolution).toBeUndefined();
            expect(changeActiveListener).not.toHaveBeenCalled();
            expect(changeSolutionsListener).not.toHaveBeenCalled();
        });

        it('updates ACTIVE_SOLUTION_STATE to none', () => {
            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('setContext', ActiveSolutionTrackerImpl.ACTIVE_SOLUTION_STATE, 'none');
        });
    });

    describe('activated with solutions in the workspace and no previous selection', () => {
        beforeEach(async () => {
            await activeSolutionTracker.activate(context as unknown as vscode.ExtensionContext);
            await waitForEvent(activeSolutionTracker.onDidChangeActiveSolution);
        });

        it('selects the first solution as active', () => {
            expect(activeSolutionTracker.solutions).toEqual([
                SOLUTION_URI_BAR.fsPath,
                SOLUTION_URI_FOO.fsPath,
                SOLUTION_URI_DEFAULT.fsPath,
            ]);

            expect(activeSolutionTracker.activeSolution).toBe(SOLUTION_URI_DEFAULT.fsPath);
            expect(changeActiveListener).toHaveBeenCalled();
            expect(changeSolutionsListener).toHaveBeenCalled();
        });

        it('updates ACTIVE_SOLUTION_STATE to active', () => {
            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('setContext', ActiveSolutionTrackerImpl.ACTIVE_SOLUTION_STATE, 'active');
        });
    });

    describe('activated with solutions in the workspace and an existing previous selection', () => {
        beforeEach(async () => {
            context.workspaceState.get.mockImplementation(
                key => key === ActiveSolutionTrackerImpl.ACTIVE_SOLUTION_KEY ? SOLUTION_URI_FOO.fsPath : undefined
            );

            await activeSolutionTracker.activate(context as unknown as vscode.ExtensionContext);
            await waitForEvent(activeSolutionTracker.onDidChangeActiveSolution);
        });

        it('preserves the previous selection', () => {
            expect(activeSolutionTracker.activeSolution).toBe(SOLUTION_URI_FOO.fsPath);
            expect(changeActiveListener).toHaveBeenCalled();
            expect(changeSolutionsListener).toHaveBeenCalled();
        });
    });

    describe('activated with solutions in the workspace and a non existing previous selection', () => {
        beforeEach(async () => {
            context.workspaceState.get.mockImplementation(
                key => key === ActiveSolutionTrackerImpl.ACTIVE_SOLUTION_KEY ? URI.file(path.join(WORKSPACE_PATH, 'baz', 'Baz.csolution.yml')).fsPath : undefined
            );

            await activeSolutionTracker.activate(context as unknown as vscode.ExtensionContext);
            await waitForEvent(activeSolutionTracker.onDidChangeActiveSolution);
        });

        it('selects the first solution as active', () => {
            expect(activeSolutionTracker.solutions).toEqual([
                SOLUTION_URI_BAR.fsPath,
                SOLUTION_URI_FOO.fsPath,
                SOLUTION_URI_DEFAULT.fsPath,
            ]);

            expect(activeSolutionTracker.activeSolution).toBe(SOLUTION_URI_DEFAULT.fsPath);
            expect(changeActiveListener).toHaveBeenCalled();
            expect(changeSolutionsListener).toHaveBeenCalled();
        });
    });

    describe('activated with solutions in workspace subfolders only', () => {
        beforeEach(async () => {
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([
                SOLUTION_URI_FOO,
                SOLUTION_URI_BAR,
            ]);
        });

        it('selects no active solution', async () => {
            await activeSolutionTracker.activate(context as unknown as vscode.ExtensionContext);
            await waitForEvent(activeSolutionTracker.onDidChangeSolutions);

            expect(activeSolutionTracker.solutions).toEqual([
                SOLUTION_URI_BAR.fsPath,
                SOLUTION_URI_FOO.fsPath,
            ]);

            expect(activeSolutionTracker.activeSolution).toBeUndefined();
            expect(changeActiveListener).not.toHaveBeenCalled();
            expect(changeSolutionsListener).toHaveBeenCalled();
        });

        it('does not update ACTIVE_SOLUTION_STATE', () => {
            expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
        });

    });

    describe('after activation', () => {
        beforeEach(async () => {
            await activeSolutionTracker.activate(context as unknown as vscode.ExtensionContext);
            await waitForEvent(activeSolutionTracker.onDidChangeActiveSolution);
            changeActiveListener.mockClear();
            changeSolutionsListener.mockClear();
        });

        it('does not set a non-existing solution active', () => {
            const solutionPath = URI.file(path.join(WORKSPACE_PATH, 'not', 'a', 'File.csolution.yml')).fsPath;
            activeSolutionTracker.activeSolution = solutionPath;

            expect(activeSolutionTracker.activeSolution).not.toBe(solutionPath);
            expect(changeActiveListener).not.toHaveBeenCalled();
        });

        it('sets a new solution as active', () => {
            const solutionPath = SOLUTION_URI_FOO.fsPath;
            activeSolutionTracker.activeSolution = solutionPath;

            expect(activeSolutionTracker.activeSolution).toBe(solutionPath);
            expect(changeActiveListener).toHaveBeenCalled();
        });

        it('does not fire a change event when re-selecting the current active solution', () => {
            const solutionPath = SOLUTION_URI_DEFAULT.fsPath;
            expect(activeSolutionTracker.activeSolution).toBe(solutionPath);

            activeSolutionTracker.activeSolution = solutionPath;

            expect(activeSolutionTracker.activeSolution).toBe(solutionPath);
            expect(changeActiveListener).not.toHaveBeenCalled();
        });

        it('updates the list of solutions when a new solution file is added', async () => {
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([
                SOLUTION_URI_NEW,
                SOLUTION_URI_FOO,
                SOLUTION_URI_BAR
            ]);

            fileWatcherProvider.mockFireEvent(ActiveSolutionTrackerImpl.GLOB_PATTERN, '/', 'create');

            await waitForEvent(activeSolutionTracker.onDidChangeSolutions);

            expect(activeSolutionTracker.solutions).toEqual([
                SOLUTION_URI_BAR.fsPath,
                SOLUTION_URI_FOO.fsPath,
                SOLUTION_URI_NEW.fsPath
            ]);

            expect(changeSolutionsListener).toHaveBeenCalledTimes(1);
        });

        it('updates the list of solutions when a solution file is deleted', async () => {
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([
                SOLUTION_URI_FOO,
            ]);

            fileWatcherProvider.mockFireEvent('**/*', SOLUTION_URI_BAR.fsPath, 'delete');

            await waitForEvent(activeSolutionTracker.onDidChangeSolutions);

            expect(activeSolutionTracker.solutions).toEqual([
                SOLUTION_URI_FOO.fsPath,
            ]);

            expect(changeSolutionsListener).toHaveBeenCalledTimes(1);
        });

        it('updates the list of solutions when a folder containing a solution file is deleted', async () => {
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([
                SOLUTION_URI_FOO,
            ]);

            fileWatcherProvider.mockFireEvent('**/*', path.resolve(SOLUTION_URI_BAR.fsPath, '..'), 'delete');

            await waitForEvent(activeSolutionTracker.onDidChangeSolutions);

            expect(activeSolutionTracker.solutions).toEqual([
                SOLUTION_URI_FOO.fsPath,
            ]);

            expect(changeSolutionsListener).toHaveBeenCalledTimes(1);
        });

        it('updates the list of solutions when a new workspace folder is added', async () => {
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([
                SOLUTION_URI_NEW,
                SOLUTION_URI_FOO,
                SOLUTION_URI_BAR
            ]);

            workspaceFoldersProvider.updateWorkspaceFolders([
                { uri: URI.file(__dirname), name: 'Workspace Folder 1', index: 1 },
                { uri: URI.file(__dirname), name: 'Workspace Folder 2', index: 2 }
            ]);

            await waitForEvent(activeSolutionTracker.onDidChangeSolutions);

            expect(activeSolutionTracker.solutions).toEqual([
                SOLUTION_URI_BAR.fsPath,
                SOLUTION_URI_FOO.fsPath,
                SOLUTION_URI_NEW.fsPath
            ]);

            expect(changeSolutionsListener).toHaveBeenCalledTimes(1);
        });

        it('provides solution details', () => {
            workspaceFoldersProvider.asRelativePath.mockClear();

            const details = activeSolutionTracker.getSolutionDetails(SOLUTION_URI_FOO.fsPath);
            const expectedDetails: SolutionDetails = {
                path: SOLUTION_URI_FOO.fsPath,
                displayName: `foo${path.sep}Foo`
            };

            expect(details).toEqual(expectedDetails);
            expect(workspaceFoldersProvider.asRelativePath).toHaveBeenCalledWith(SOLUTION_URI_FOO.fsPath);
        });

        describe('activate command', () => {
            it('is registered on activation', () => {
                expect(commandsProvider.registerCommand).toHaveBeenCalledWith(COMMAND_ACTIVATE_SOLUTION, expect.any(Function), expect.anything());
            });

            it('sets the given solution as active when passed as an argument', async () => {
                await commandsProvider.mockRunRegistered(COMMAND_ACTIVATE_SOLUTION, SOLUTION_URI_FOO.fsPath);

                expect(activeSolutionTracker.activeSolution).toEqual(SOLUTION_URI_FOO.fsPath);
                expect(changeActiveListener).toHaveBeenCalledTimes(1);
            });

            it('sets the given URI as active when passed as an argument', async () => {
                await commandsProvider.mockRunRegistered(COMMAND_ACTIVATE_SOLUTION, SOLUTION_URI_FOO);

                expect(activeSolutionTracker.activeSolution).toEqual(SOLUTION_URI_FOO.fsPath);
                expect(changeActiveListener).toHaveBeenCalledTimes(1);
            });

            it('sets the given solution as active when its containing folder is passed as an argument', async () => {
                const solutionRootPath = path.dirname(SOLUTION_URI_FOO.fsPath);
                const files: [string, FileType][] = [
                    [
                        path.basename(SOLUTION_URI_FOO.fsPath),
                        'file'
                    ]
                ];
                workspaceFsProvider.readDirectory.mockResolvedValue(files);
                await commandsProvider.mockRunRegistered(COMMAND_ACTIVATE_SOLUTION, solutionRootPath);

                expect(activeSolutionTracker.activeSolution).toEqual(SOLUTION_URI_FOO.fsPath);
                expect(changeActiveListener).toHaveBeenCalledTimes(1);
            });

            it('sets the given solution as active when its containing folder URI is passed as an argument', async () => {
                const files: [string, FileType][] = [
                    [
                        path.basename(SOLUTION_URI_FOO.fsPath),
                        'file'
                    ]
                ];
                workspaceFsProvider.readDirectory.mockResolvedValue(files);
                await commandsProvider.mockRunRegistered(COMMAND_ACTIVATE_SOLUTION, SOLUTION_URI_FOO);

                expect(activeSolutionTracker.activeSolution).toEqual(SOLUTION_URI_FOO.fsPath);
                expect(changeActiveListener).toHaveBeenCalledTimes(1);
            });

            it('shows a quick pick if no solution is passed as an argument', async () => {
                const mockShowQuickPick = vscode.window.showQuickPick as jest.Mock;
                mockShowQuickPick.mockResolvedValue(`foo${path.sep}Foo`);

                await commandsProvider.mockRunRegistered(COMMAND_ACTIVATE_SOLUTION, undefined);

                expect(mockShowQuickPick).toHaveBeenCalledTimes(1);
                expect(mockShowQuickPick).toHaveBeenCalledWith([`bar${path.sep}Bar`, `foo${path.sep}Foo`, 'test'], expect.anything());

                expect(activeSolutionTracker.activeSolution).toEqual(SOLUTION_URI_FOO.fsPath);
                expect(changeActiveListener).toHaveBeenCalledTimes(1);
            });

            it('shows a quick pick if a non-URI object is passed as an argument', async () => {
                const mockShowQuickPick = vscode.window.showQuickPick as jest.Mock;
                mockShowQuickPick.mockResolvedValue(`foo${path.sep}Foo`);

                await commandsProvider.mockRunRegistered(COMMAND_ACTIVATE_SOLUTION, { someKey: 'someValue' });

                expect(mockShowQuickPick).toHaveBeenCalledTimes(1);
                expect(mockShowQuickPick).toHaveBeenCalledWith([`bar${path.sep}Bar`, `foo${path.sep}Foo`, 'test'], expect.anything());

                expect(activeSolutionTracker.activeSolution).toEqual(SOLUTION_URI_FOO.fsPath);
                expect(changeActiveListener).toHaveBeenCalledTimes(1);
            });
        });
    });
});

const debounceMillis = 5;
const waitForDebounce = () => new Promise(resolve => setTimeout(resolve, 2 * debounceMillis));

const solutionRoot = path.join(__dirname, 'root');
const activeSolution = path.join(solutionRoot, 'My.csolution.yml');

describe('ActiveSolutionTracker solution file watching', () => {
    let fileWatcherProvider: MockFileWatcherProvider;
    let commandsProvider: MockCommandsProvider;
    let workspaceFoldersProvider: MockWorkspaceFoldersProvider;
    let workspaceFsProvider: MockWorkspaceFsProvider;
    let configurationProvider: MockConfigurationProvider;
    let changeListener: jest.Mock;
    let tracker: ActiveSolutionTrackerImpl;
    let context: { subscriptions: Array<{ dispose: () => Promise<void> }>, workspaceState: { get: jest.Mock, update: jest.Mock }, extension: { activate: jest.Mock } };

    beforeEach(async () => {
        context = {
            subscriptions: [],
            workspaceState: { get: jest.fn(), update: jest.fn() },
            extension: {
                activate: jest.fn().mockResolvedValue(undefined),
            },
        };

        (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([URI.file(activeSolution)]);

        fileWatcherProvider = fileWatcherProviderFactory();
        commandsProvider = commandsProviderFactory();
        workspaceFoldersProvider = workspaceFoldersProviderFactory([{ uri: URI.file(solutionRoot), name: 'workspace', index: 0 }]);
        workspaceFsProvider = workspaceFsProviderFactory();
        configurationProvider = configurationProviderFactory();

        tracker = new ActiveSolutionTrackerImpl(
            messageProviderFactory(),
            commandsProvider,
            fileWatcherProvider,
            workspaceFoldersProvider,
            workspaceFsProvider,
            configurationProvider,
            0,
            debounceMillis,
        );

        await tracker.activate(context as unknown as vscode.ExtensionContext);
        await waitForEvent(tracker.onDidChangeActiveSolution);

        changeListener = jest.fn();
        tracker.onActiveSolutionFilesChanged(changeListener);
    });

    afterEach(async () => {
        for (const { dispose } of context.subscriptions) {
            await dispose();
        }
    });

    it('registers a file watcher on activation', () => {
        expect(fileWatcherProvider.watchFiles).toHaveBeenCalledWith(solutionFileWatchPattern, expect.any(Object), expect.anything());
        expect(tracker.suspendWatch).toBeFalsy();
    });

    it('fires onActiveSolutionFilesChanged when the csolution file is modified', async () => {
        fileWatcherProvider.mockFireEvent(solutionFileWatchPattern, activeSolution, 'change');
        await waitForDebounce();

        expect(changeListener).toHaveBeenCalledTimes(1);
    });

    it('when suspended fires no onActiveSolutionFilesChanged when the csolution file is modified', async () => {
        tracker.suspendWatch = true;
        expect(tracker.suspendWatch).toBeTruthy();
        fileWatcherProvider.mockFireEvent(solutionFileWatchPattern, activeSolution, 'change');
        await waitForDebounce();
        expect(changeListener).toHaveBeenCalledTimes(0);
        tracker.suspendWatch = false;
        expect(tracker.suspendWatch).toBeFalsy();
        fileWatcherProvider.mockFireEvent(solutionFileWatchPattern, activeSolution, 'change');
        await waitForDebounce();
        expect(changeListener).toHaveBeenCalledTimes(1);
    });

    it('fires onActiveSolutionFilesChanged when a cproject file is modified in the active solution directory', async () => {
        const projectFile = path.join(solutionRoot, 'My.cproject.yml');
        fileWatcherProvider.mockFireEvent(solutionFileWatchPattern, projectFile, 'change');
        await waitForDebounce();

        expect(changeListener).toHaveBeenCalledTimes(1);
    });

    it('fires onActiveSolutionFilesChanged when a cproject file is modified in a directory beneath active solution directory', async () => {
        const projectFile = path.join(solutionRoot, 'AProject', 'My.cproject.yml');
        fileWatcherProvider.mockFireEvent(solutionFileWatchPattern, projectFile, 'change');
        await waitForDebounce();

        expect(changeListener).toHaveBeenCalledTimes(1);
    });

    it('fires onActiveSolutionFilesChanged when a cgen.yml file is modified in the active solution directory', async () => {
        const packFile = path.join(solutionRoot, 'My.cgen.yml');
        fileWatcherProvider.mockFireEvent(solutionFileWatchPattern, packFile, 'change');
        await waitForDebounce();

        expect(changeListener).toHaveBeenCalledTimes(1);
    });

    it('does not fire onActiveSolutionFilesChanged when a file other than the active csolution file is modified', async () => {
        const projectFile = path.join(solutionRoot, 'NotMy.csolution.yaml');
        fileWatcherProvider.mockFireEvent(solutionFileWatchPattern, projectFile, 'change');
        await waitForDebounce();

        expect(changeListener).toHaveBeenCalledTimes(0);
    });

    it('does not fire onActiveSolutionFilesChanged when a file outside the solution directory is changed', async () => {
        const projectFile = path.join(__dirname, 'another-solution', 'NotMy.csolution.yaml');
        fileWatcherProvider.mockFireEvent(solutionFileWatchPattern, projectFile, 'change');
        await waitForDebounce();

        expect(changeListener).toHaveBeenCalledTimes(0);
    });
});
