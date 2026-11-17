/**
 * Copyright 2025-2026 Arm Limited
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
import { BuildCommand, BuildCommandSaveParticipant } from './build-command';
import { BuildTaskProvider, BuildTaskProviderImpl } from './build-task-provider';
import { commandsProviderFactory, MockCommandsProvider } from '../../vscode-api/commands-provider.factories';
import { MockBuildTaskDefinitionBuilder, buildTaskDefinitionBuilderFactory } from './build-task-definition-builder.factories';
import { BuildTaskDefinition } from './build-task-definition';
import { MockSolutionManager, solutionManagerFactory } from '../../solutions/solution-manager.factories';
import { CONFIG_AUTO_REFRESH_ON_FILE_CHANGE, CONFIG_ROOT } from '../../manifest';

const mockExecuteTask = vscode.tasks.executeTask as jest.Mock;
const mockShowWarningMessage = vscode.window.showWarningMessage as jest.Mock;
const mockSaveAll = vscode.workspace.saveAll as jest.Mock;
const mockGetConfiguration = vscode.workspace.getConfiguration as jest.Mock;

describe('BuildCommand', () => {
    let mockBuildTaskProvider: BuildTaskProvider;
    let commandsProvider: MockCommandsProvider;
    let buildTaskDefinitionBuilder: MockBuildTaskDefinitionBuilder;
    let saveParticipant: jest.Mocked<BuildCommandSaveParticipant>;
    let solutionManager: MockSolutionManager;
    let taskSaveBeforeRun: 'always' | 'never' | 'prompt';
    let autoRefreshOnFileChange: boolean | undefined;

    const buildTaskDefinition: BuildTaskDefinition = {
        type: BuildTaskProviderImpl.taskType,
        solution: 'some-solution-path',
        schemaCheck: false
    };

    beforeEach(async () => {
        commandsProvider = commandsProviderFactory();
        solutionManager = solutionManagerFactory({
            loadState: { solutionPath: buildTaskDefinition.solution, loaded: true, converted: true, dirty: false },
        });
        solutionManager.refresh.mockResolvedValue(undefined);
        (vscode.tasks as unknown as {
            taskExecutions: vscode.TaskExecution[];
            onDidEndTask: (listener: (event: vscode.TaskEndEvent) => void) => vscode.Disposable;
        }).taskExecutions = [];
        (vscode.tasks as unknown as {
            onDidEndTask: (listener: (event: vscode.TaskEndEvent) => void) => vscode.Disposable;
        }).onDidEndTask = () => ({ dispose: jest.fn() } as unknown as vscode.Disposable);
        mockBuildTaskProvider = {
            createTask: jest.fn((taskDefinition) => new vscode.Task(
                taskDefinition, vscode.TaskScope.Workspace, 'cbuild some-solution-path', taskDefinition.type
            )),
            terminateTask: jest.fn().mockReturnValue(false),
            getActiveTaskRunner: jest.fn().mockReturnValue(undefined),
        };
        buildTaskDefinitionBuilder = buildTaskDefinitionBuilderFactory();
        buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode.mockResolvedValue(buildTaskDefinition);
        commandsProvider.executeCommand.mockResolvedValue(undefined);
        saveParticipant = {
            isModifiedBeforeBuild: jest.fn().mockResolvedValue(false),
            saveChangesBeforeBuild: jest.fn().mockResolvedValue(true),
        };
        taskSaveBeforeRun = 'always';
        autoRefreshOnFileChange = undefined;
        mockGetConfiguration.mockImplementation((section: string) => {
            if (section === 'task') {
                return {
                    get: jest.fn().mockImplementation((_name: string, defaultValue: string) => taskSaveBeforeRun ?? defaultValue),
                };
            }
            if (section === CONFIG_ROOT) {
                return {
                    get: jest.fn((name: string, defaultValue: unknown) => name === CONFIG_AUTO_REFRESH_ON_FILE_CHANGE
                        ? autoRefreshOnFileChange ?? defaultValue : defaultValue),
                };
            }
            return { get: jest.fn() };
        });
        mockShowWarningMessage.mockResolvedValue(undefined);
        mockSaveAll.mockResolvedValue(true);
        (vscode.workspace as unknown as { textDocuments: vscode.TextDocument[] }).textDocuments = [];
    });

    const createBuildCommand = () => new BuildCommand(
        mockBuildTaskProvider,
        commandsProvider,
        buildTaskDefinitionBuilder,
        solutionManager,
        saveParticipant,
    );

    it('registers the build, clean and rebuild commands on activation', async () => {
        const buildCommand = createBuildCommand();

        await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

        expect(commandsProvider.registerCommand).toHaveBeenCalledTimes(3);
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(BuildCommand.buildCommandType, expect.any(Function), buildCommand);
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(BuildCommand.cleanCommandType, expect.any(Function), buildCommand);
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(BuildCommand.rebuildCommandType, expect.any(Function), buildCommand);
    });

    it.each([
        BuildCommand.buildCommandType,
        BuildCommand.rebuildCommandType,
        BuildCommand.cleanCommandType,
    ])('refreshes files made dirty by saving before starting %s', async command => {
        autoRefreshOnFileChange = false;
        saveParticipant.saveChangesBeforeBuild.mockImplementationOnce(async () => {
            solutionManager.loadState.dirty = true;
            return true;
        });
        solutionManager.refresh.mockImplementationOnce(async () => {
            solutionManager.loadState.converted = false;
        });
        const buildCommand = createBuildCommand();
        await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

        await commandsProvider.mockRunRegistered(command);

        expect(solutionManager.refresh).toHaveBeenCalledTimes(1);
        expect(saveParticipant.saveChangesBeforeBuild.mock.invocationCallOrder[0])
            .toBeLessThan(solutionManager.refresh.mock.invocationCallOrder[0]);
        expect(solutionManager.refresh.mock.invocationCallOrder[0])
            .toBeLessThan(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode.mock.invocationCallOrder[0]);
        expect(mockExecuteTask).toHaveBeenCalledTimes(1);
        expect(solutionManager.loadState).toEqual(expect.objectContaining({ converted: false, dirty: true }));
    });

    it.each([
        [undefined, true],
        [true, true],
        [true, false],
        [false, false],
    ])('builds without refreshing with automatic refresh=%s and dirty=%s', async (automatic, dirty) => {
        autoRefreshOnFileChange = automatic;
        solutionManager.loadState.dirty = dirty;
        const buildCommand = createBuildCommand();
        await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

        await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType);

        expect(solutionManager.refresh).not.toHaveBeenCalled();
        expect(mockExecuteTask).toHaveBeenCalledTimes(1);
    });

    it('waits for the refresh call before creating the task while conversion remains pending', async () => {
        autoRefreshOnFileChange = false;
        solutionManager.loadState.dirty = true;
        let releaseRefresh!: () => void;
        const refreshPending = new Promise<void>(resolve => { releaseRefresh = resolve; });
        let notifyRefreshStarted!: () => void;
        const refreshStarted = new Promise<void>(resolve => { notifyRefreshStarted = resolve; });
        solutionManager.refresh.mockImplementationOnce(async () => {
            solutionManager.loadState.converted = false;
            notifyRefreshStarted();
            await refreshPending;
        });
        const buildCommand = createBuildCommand();
        await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

        const build = commandsProvider.mockRunRegistered(BuildCommand.buildCommandType);
        await refreshStarted;

        expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).not.toHaveBeenCalled();
        expect(mockExecuteTask).not.toHaveBeenCalled();
        releaseRefresh();
        await build;

        expect(mockExecuteTask).toHaveBeenCalledTimes(1);
        expect(solutionManager.loadState.converted).toBe(false);
    });

    it('does not duplicate a refresh started by saving Software Components changes', async () => {
        autoRefreshOnFileChange = false;
        solutionManager.loadState.dirty = true;
        saveParticipant.saveChangesBeforeBuild.mockImplementationOnce(async () => {
            solutionManager.loadState.converted = false;
            return true;
        });
        const buildCommand = createBuildCommand();
        await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

        await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType);

        expect(solutionManager.refresh).not.toHaveBeenCalled();
        expect(mockExecuteTask).toHaveBeenCalledTimes(1);
    });

    it('does not launch a build when the refresh call rejects', async () => {
        autoRefreshOnFileChange = false;
        solutionManager.loadState.dirty = true;
        const error = new Error('Refresh failed');
        solutionManager.refresh.mockRejectedValueOnce(error);
        const buildCommand = createBuildCommand();
        await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

        await expect(commandsProvider.mockRunRegistered(BuildCommand.buildCommandType)).rejects.toThrow(error);

        expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).not.toHaveBeenCalled();
        expect(mockExecuteTask).not.toHaveBeenCalled();
    });

    describe('build command', () => {
        it('executes the build task definition', async () => {
            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(mockSaveAll).toHaveBeenCalledWith(false);
            expect(saveParticipant.saveChangesBeforeBuild).toHaveBeenCalledTimes(1);
            expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).toHaveBeenCalledWith('build', undefined);

            const saveCommandCallOrder = mockSaveAll.mock.invocationCallOrder[0];
            const saveParticipantCallOrder = saveParticipant.saveChangesBeforeBuild.mock.invocationCallOrder[0];
            const createDefinitionCallOrder = buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode.mock.invocationCallOrder[0];
            expect(saveCommandCallOrder).toBeLessThan(createDefinitionCallOrder);
            expect(saveParticipantCallOrder).toBeLessThan(createDefinitionCallOrder);

            expect(mockExecuteTask).toHaveBeenCalledTimes(1);
            expect(mockExecuteTask).toHaveBeenCalledWith({
                definition: buildTaskDefinition,
                name: 'cbuild some-solution-path',
                scope: vscode.TaskScope.Workspace,
                source: BuildTaskProviderImpl.taskType,
                execution: undefined,
            });
        });

        it('respects task.saveBeforeRun never and starts build without saving', async () => {
            taskSaveBeforeRun = 'never';
            autoRefreshOnFileChange = false;
            solutionManager.loadState.dirty = true;
            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(mockSaveAll).not.toHaveBeenCalled();
            expect(saveParticipant.saveChangesBeforeBuild).not.toHaveBeenCalled();
            expect(solutionManager.refresh).toHaveBeenCalledTimes(1);
            expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).toHaveBeenCalledWith('build', undefined);
            expect(mockExecuteTask).toHaveBeenCalledTimes(1);
        });

        it('respects task.saveBeforeRun prompt and saves when the user chooses Save', async () => {
            taskSaveBeforeRun = 'prompt';
            saveParticipant.isModifiedBeforeBuild.mockResolvedValue(true);
            mockShowWarningMessage.mockResolvedValue({ title: 'Save' });
            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(mockShowWarningMessage).toHaveBeenCalledWith(
                'Save modified files before building?',
                { modal: true },
                { title: 'Save' },
                { title: 'Don\'t Save' },
                { title: 'Cancel', isCloseAffordance: true },
            );
            expect(mockSaveAll).toHaveBeenCalledWith(false);
            expect(saveParticipant.saveChangesBeforeBuild).toHaveBeenCalledTimes(1);
            expect(mockExecuteTask).toHaveBeenCalledTimes(1);
        });

        it('respects task.saveBeforeRun prompt and starts build without saving when the user chooses Don\'t Save', async () => {
            taskSaveBeforeRun = 'prompt';
            autoRefreshOnFileChange = false;
            solutionManager.loadState.dirty = true;
            saveParticipant.isModifiedBeforeBuild.mockResolvedValue(true);
            mockShowWarningMessage.mockResolvedValue({ title: 'Don\'t Save' });
            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(mockSaveAll).not.toHaveBeenCalled();
            expect(saveParticipant.saveChangesBeforeBuild).not.toHaveBeenCalled();
            expect(solutionManager.refresh).toHaveBeenCalledTimes(1);
            expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).toHaveBeenCalledWith('build', undefined);
            expect(mockExecuteTask).toHaveBeenCalledTimes(1);
        });

        it('respects task.saveBeforeRun prompt and aborts build when the user chooses Cancel', async () => {
            taskSaveBeforeRun = 'prompt';
            autoRefreshOnFileChange = false;
            solutionManager.loadState.dirty = true;
            saveParticipant.isModifiedBeforeBuild.mockResolvedValue(true);
            mockShowWarningMessage.mockResolvedValue({ title: 'Cancel' });
            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            const result = await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(result).toBeUndefined();
            expect(mockSaveAll).not.toHaveBeenCalled();
            expect(saveParticipant.saveChangesBeforeBuild).not.toHaveBeenCalled();
            expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).not.toHaveBeenCalled();
            expect(mockExecuteTask).not.toHaveBeenCalled();
            expect(solutionManager.refresh).not.toHaveBeenCalled();
        });

        it('respects task.saveBeforeRun prompt and skips prompt when nothing is modified', async () => {
            taskSaveBeforeRun = 'prompt';
            autoRefreshOnFileChange = false;
            solutionManager.loadState.dirty = true;
            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(saveParticipant.isModifiedBeforeBuild).toHaveBeenCalledTimes(1);
            expect(mockShowWarningMessage).not.toHaveBeenCalledWith(
                'Save modified files before building?',
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
            expect(mockSaveAll).not.toHaveBeenCalled();
            expect(saveParticipant.saveChangesBeforeBuild).not.toHaveBeenCalled();
            expect(solutionManager.refresh).toHaveBeenCalledTimes(1);
            expect(mockExecuteTask).toHaveBeenCalledTimes(1);
        });

        it('respects task.saveBeforeRun prompt and prompts when an editor is modified', async () => {
            taskSaveBeforeRun = 'prompt';
            (vscode.workspace as unknown as { textDocuments: vscode.TextDocument[] }).textDocuments = [
                { isDirty: true, isUntitled: false } as unknown as vscode.TextDocument
            ];
            mockShowWarningMessage.mockResolvedValue({ title: 'Save' });
            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(saveParticipant.isModifiedBeforeBuild).not.toHaveBeenCalled();
            expect(mockShowWarningMessage).toHaveBeenCalledWith(
                'Save modified files before building?',
                { modal: true },
                { title: 'Save' },
                { title: 'Don\'t Save' },
                { title: 'Cancel', isCloseAffordance: true },
            );
            expect(mockSaveAll).toHaveBeenCalledWith(false);
            expect(saveParticipant.saveChangesBeforeBuild).toHaveBeenCalledTimes(1);
            expect(mockExecuteTask).toHaveBeenCalledTimes(1);
        });

        it('stops active setup task via provider before starting build', async () => {
            const setupTask = {
                name: 'cbuild setup-solution',
                definition: { type: BuildTaskProviderImpl.taskType, setup: true }
            } as unknown as vscode.Task;

            (vscode.tasks as unknown as {
                taskExecutions: vscode.TaskExecution[];
            }).taskExecutions = [
                {
                    task: setupTask,
                    terminate: jest.fn()
                } as unknown as vscode.TaskExecution
            ];

            mockBuildTaskProvider.terminateTask = jest.fn().mockImplementation(() => {
                (vscode.tasks as unknown as {
                    taskExecutions: vscode.TaskExecution[];
                }).taskExecutions = [];
                return true;
            });

            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(mockBuildTaskProvider.terminateTask).toHaveBeenCalledWith('cbuild setup-solution');
            expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).toHaveBeenCalledWith('build', undefined);
            expect(mockExecuteTask).toHaveBeenCalledTimes(1);
        });

        it('falls back to task execution terminate when provider cannot stop setup task', async () => {
            const terminateSpy = jest.fn().mockImplementation(() => {
                (vscode.tasks as unknown as {
                    taskExecutions: vscode.TaskExecution[];
                }).taskExecutions = [];
            });

            const setupTask = {
                name: 'cbuild setup-solution',
                definition: { type: BuildTaskProviderImpl.taskType, setup: true }
            } as unknown as vscode.Task;

            (vscode.tasks as unknown as {
                taskExecutions: vscode.TaskExecution[];
            }).taskExecutions = [
                {
                    task: setupTask,
                    terminate: terminateSpy
                } as unknown as vscode.TaskExecution
            ];

            mockBuildTaskProvider.terminateTask = jest.fn().mockReturnValue(false);

            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(mockBuildTaskProvider.terminateTask).toHaveBeenCalledWith('cbuild setup-solution');
            expect(terminateSpy).toHaveBeenCalledTimes(1);
            expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).toHaveBeenCalledWith('build', undefined);
            expect(mockExecuteTask).toHaveBeenCalledTimes(1);
        });

        it('aborts build when saving modified editors fails or is cancelled', async () => {
            autoRefreshOnFileChange = false;
            solutionManager.loadState.dirty = true;
            mockSaveAll.mockResolvedValue(false);

            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            const result = await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(result).toBeUndefined();
            expect(mockSaveAll).toHaveBeenCalledWith(false);
            expect(saveParticipant.saveChangesBeforeBuild).not.toHaveBeenCalled();
            expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).not.toHaveBeenCalled();
            expect(mockExecuteTask).not.toHaveBeenCalled();
            expect(solutionManager.refresh).not.toHaveBeenCalled();
            expect(mockShowWarningMessage).toHaveBeenCalledWith('Build cancelled because modified files could not be saved.');
        });

        it('aborts build when Software Components changes cannot be saved', async () => {
            autoRefreshOnFileChange = false;
            solutionManager.loadState.dirty = true;
            saveParticipant.saveChangesBeforeBuild.mockResolvedValue(false);

            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            const result = await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(result).toBeUndefined();
            expect(mockSaveAll).toHaveBeenCalledWith(false);
            expect(saveParticipant.saveChangesBeforeBuild).toHaveBeenCalledTimes(1);
            expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).not.toHaveBeenCalled();
            expect(mockExecuteTask).not.toHaveBeenCalled();
            expect(solutionManager.refresh).not.toHaveBeenCalled();
            expect(mockShowWarningMessage).toHaveBeenCalledWith('Build cancelled because Software Components changes could not be saved.');
        });

    });

    describe('rebuild command', () => {
        it('builds the build task definition with rebuild: true', async () => {
            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.rebuildCommandType);

            expect(mockSaveAll).toHaveBeenCalledWith(false);
            expect(saveParticipant.saveChangesBeforeBuild).toHaveBeenCalledTimes(1);
            expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).toHaveBeenCalledWith('rebuild', undefined);
            expect(mockExecuteTask).toHaveBeenCalledTimes(1);
            expect(mockExecuteTask).toHaveBeenCalledWith({
                definition: buildTaskDefinition,
                source: BuildTaskProviderImpl.taskType,
                name: 'cbuild some-solution-path',
                scope: vscode.TaskScope.Workspace,
                execution: undefined,
            });
        });
    });

    describe('clean command', () => {
        it('builds the build task definition with clean: true', async () => {
            const buildCommand = createBuildCommand();
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.cleanCommandType);

            expect(mockSaveAll).toHaveBeenCalledWith(false);
            expect(saveParticipant.saveChangesBeforeBuild).toHaveBeenCalledTimes(1);
            expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).toHaveBeenCalledWith('clean', undefined);
            expect(mockExecuteTask).toHaveBeenCalledTimes(1);
            expect(mockExecuteTask).toHaveBeenCalledWith({
                definition: buildTaskDefinition,
                source: BuildTaskProviderImpl.taskType,
                name: 'cbuild some-solution-path',
                scope: vscode.TaskScope.Workspace,
                execution: undefined,
            });
        });
    });
});
