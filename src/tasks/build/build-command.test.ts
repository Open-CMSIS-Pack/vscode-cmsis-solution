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
import { BuildCommand } from './build-command';
import { BuildTaskProvider, BuildTaskProviderImpl } from './build-task-provider';
import { commandsProviderFactory, MockCommandsProvider } from '../../vscode-api/commands-provider.factories';
import { MockBuildTaskDefinitionBuilder, buildTaskDefinitionBuilderFactory } from './build-task-definition-builder.factories';
import { BuildTaskDefinition } from './build-task-definition';

const mockExecuteTask = vscode.tasks.executeTask as jest.Mock;

describe('BuildCommand', () => {
    let mockBuildTaskProvider: BuildTaskProvider;
    let commandsProvider: MockCommandsProvider;
    let buildTaskDefinitionBuilder: MockBuildTaskDefinitionBuilder;

    const buildTaskDefinition: BuildTaskDefinition = {
        type: BuildTaskProviderImpl.taskType,
        solution: 'some-solution-path',
        schemaCheck: false
    };

    beforeEach(async () => {
        commandsProvider = commandsProviderFactory();
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
    });

    it('registers the build, clean and rebuild commands on activation', async () => {
        const buildCommand = new BuildCommand(
            mockBuildTaskProvider,
            commandsProvider,
            buildTaskDefinitionBuilder,
        );

        await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

        expect(commandsProvider.registerCommand).toHaveBeenCalledTimes(3);
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(BuildCommand.buildCommandType, expect.any(Function), buildCommand);
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(BuildCommand.cleanCommandType, expect.any(Function), buildCommand);
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(BuildCommand.rebuildCommandType, expect.any(Function), buildCommand);
    });

    describe('build command', () => {
        it('executes the build task definition', async () => {
            const buildCommand = new BuildCommand(
                mockBuildTaskProvider,
                commandsProvider,
                buildTaskDefinitionBuilder,
            );
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('workbench.action.files.save');
            expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).toHaveBeenCalledWith('build', undefined);

            const saveCommandCallOrder = commandsProvider.executeCommand.mock.invocationCallOrder[0];
            const createDefinitionCallOrder = buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode.mock.invocationCallOrder[0];
            expect(saveCommandCallOrder).toBeLessThan(createDefinitionCallOrder);

            expect(mockExecuteTask).toHaveBeenCalledTimes(1);
            expect(mockExecuteTask).toHaveBeenCalledWith({
                definition: buildTaskDefinition,
                name: 'cbuild some-solution-path',
                scope: vscode.TaskScope.Workspace,
                source: BuildTaskProviderImpl.taskType,
                execution: undefined,
            });
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

            const buildCommand = new BuildCommand(
                mockBuildTaskProvider,
                commandsProvider,
                buildTaskDefinitionBuilder,
            );
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

            const buildCommand = new BuildCommand(
                mockBuildTaskProvider,
                commandsProvider,
                buildTaskDefinitionBuilder,
            );
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.buildCommandType, undefined);

            expect(mockBuildTaskProvider.terminateTask).toHaveBeenCalledWith('cbuild setup-solution');
            expect(terminateSpy).toHaveBeenCalledTimes(1);
            expect(buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode).toHaveBeenCalledWith('build', undefined);
            expect(mockExecuteTask).toHaveBeenCalledTimes(1);
        });

    });

    describe('rebuild command', () => {
        it('builds the build task definition with rebuild: true', async () => {
            const buildCommand = new BuildCommand(
                mockBuildTaskProvider,
                commandsProvider,
                buildTaskDefinitionBuilder,
            );
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.rebuildCommandType);

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('workbench.action.files.save');
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
            const buildCommand = new BuildCommand(
                mockBuildTaskProvider,
                commandsProvider,
                buildTaskDefinitionBuilder,
            );
            await buildCommand.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

            await commandsProvider.mockRunRegistered(BuildCommand.cleanCommandType);

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('workbench.action.files.save');
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
