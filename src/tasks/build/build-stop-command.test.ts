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

import * as vscode from 'vscode';
import { commandsProviderFactory, MockCommandsProvider } from '../../vscode-api/commands-provider.factories';
import { MockSolutionManager, solutionManagerFactory } from '../../solutions/solution-manager.factories';
import { extensionContextFactory } from '../../vscode-api/extension-context.factories';
import { PACKAGE_NAME } from '../../manifest';
import { CSolution } from '../../solutions/csolution';
import { CTreeItem } from '../../generic/tree-item';
import { BuildStopCommand } from './build-stop-command';
import { BuildTaskProviderImpl } from './build-task-provider';

jest.mock('vscode');
(vscode.tasks.onDidStartTask as jest.Mock) = jest.fn();
(vscode.tasks.onDidStartTaskProcess as jest.Mock) = jest.fn();
(vscode.tasks.onDidEndTask as jest.Mock) = jest.fn();
(vscode.tasks.onDidEndTaskProcess as jest.Mock) = jest.fn();
(vscode.window.showErrorMessage as jest.Mock) = jest.fn();
(vscode.window.showInformationMessage as jest.Mock) = jest.fn();

describe('BuildStopCommand', () => {
    let buildStopCommand: BuildStopCommand;
    let commandsProvider: MockCommandsProvider;
    let solutionManager: MockSolutionManager;
    let onDidEndTaskProcessHandler: (event: vscode.TaskProcessEndEvent) => void;

    let onDidEndTaskHandler: (event: vscode.TaskEndEvent) => void;

    let onDidStartTaskProcessHandler: (event: vscode.TaskProcessStartEvent) => void;

    let onDidStartTaskHandler: (event: vscode.TaskStartEvent) => void;

    beforeEach(() => {
        jest.clearAllMocks();

        (vscode.tasks as typeof vscode.tasks & { taskExecutions?: vscode.TaskExecution[] }).taskExecutions = [];

        (vscode.tasks.onDidEndTaskProcess as jest.Mock).mockImplementation((handler) => {
            onDidEndTaskProcessHandler = handler;
        });

        (vscode.tasks.onDidEndTask as jest.Mock).mockImplementation((handler) => {
            onDidEndTaskHandler = handler;
        });

        (vscode.tasks.onDidStartTaskProcess as jest.Mock).mockImplementation((handler) => {
            onDidStartTaskProcessHandler = handler;
        });

        (vscode.tasks.onDidStartTask as jest.Mock).mockImplementation((handler) => {
            onDidStartTaskHandler = handler;
        });

        commandsProvider = commandsProviderFactory();
        solutionManager = solutionManagerFactory();
        buildStopCommand = new BuildStopCommand(commandsProvider);
    });

    const createBuildTaskEvent = (name: string) => ({
        execution: { task: { name, definition: { type: BuildTaskProviderImpl.taskType } } }
    });

    it('registers the command on activation', async () => {
        buildStopCommand = new BuildStopCommand(commandsProvider);
        await buildStopCommand.activate(extensionContextFactory());

        expect(commandsProvider.registerCommand).toHaveBeenCalledTimes(1);

    });

    // sets VS Code context for execution states:
    const expectedStates = ['idle', 'building'] as const;

    expectedStates.forEach((state) => {
        it(`sets VS Code context for execution state: ${state}`, () => {
            buildStopCommand['setExecutionState'](state);
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                'setContext',
                `${PACKAGE_NAME}.buildState`,
                state
            );
        });
    });

    it('sets state to idle if Build task is stopped', async () => {
        await buildStopCommand.activate(extensionContextFactory());

        onDidEndTaskProcessHandler({
            execution: { task: { name: 'cbuild test-solution', definition: { type: BuildTaskProviderImpl.taskType } } },
            exitCode: 1
        } as vscode.TaskProcessEndEvent);

        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            'setContext',
            expect.stringContaining('buildState'),
            'idle'
        );
    });

    it('sets execution state to idle after Build task completes successfully', async () => {
        solutionManager.getCsolution.mockReturnValue({
            cbuildYmlRoot: new Map([['fake.yml', {} as CTreeItem]])
        } as unknown as CSolution);

        await buildStopCommand.activate(extensionContextFactory());

        onDidEndTaskProcessHandler({
            execution: { task: { name: 'cbuild test-solution', definition: { type: BuildTaskProviderImpl.taskType } } },
            exitCode: 0
        } as vscode.TaskProcessEndEvent);

        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            'setContext',
            expect.stringContaining('buildState'),
            'idle'
        );
    });

    it('stop Build task manually with graceful termination', async () => {
        // Mock buildTaskProvider with terminateTask method
        const mockBuildTaskProvider = {
            createTask: jest.fn(),
            terminateTask: jest.fn().mockReturnValue(true)
        };

        // Create BuildStopCommand with mockBuildTaskProvider
        buildStopCommand = new BuildStopCommand(commandsProvider, mockBuildTaskProvider);
        await buildStopCommand.activate(extensionContextFactory());

        buildStopCommand['taskLifecycles'].set('cbuild test-solution', { name: 'cbuild test-solution', started: true, processStarted: true });

        const fireSpy = jest.spyOn(buildStopCommand['eventEmitter'], 'fire');

        // call stopBuildTask
        await buildStopCommand['stopBuildTask']();

        expect(mockBuildTaskProvider.terminateTask).toHaveBeenCalledWith('cbuild test-solution');

        expect(buildStopCommand['taskLifecycles'].get('cbuild test-solution')?.stoppedManually).toBe(true);

        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            'setContext',
            `${PACKAGE_NAME}.buildState`,
            'idle'
        );

        expect(fireSpy).toHaveBeenCalled();
    });

    it('falls back to terminating matching build task execution when terminateTask fails', async () => {
        const mockBuildTaskProvider = {
            createTask: jest.fn(),
            terminateTask: jest.fn().mockReturnValue(false)
        };

        const nonBuildTerminateSpy = jest.fn();
        const buildTerminateSpy = jest.fn();
        const buildTask = {
            name: 'cbuild test-solution',
            definition: { type: BuildTaskProviderImpl.taskType }
        } as unknown as vscode.Task;

        const nonBuildTask = {
            name: 'lint test-solution',
            definition: { type: 'shell' }
        } as unknown as vscode.Task;

        (vscode.tasks as typeof vscode.tasks & { taskExecutions?: vscode.TaskExecution[] }).taskExecutions = [
            {
                task: nonBuildTask,
                terminate: nonBuildTerminateSpy
            } as unknown as vscode.TaskExecution,
            {
                task: buildTask,
                terminate: buildTerminateSpy
            } as unknown as vscode.TaskExecution
        ];

        buildStopCommand = new BuildStopCommand(commandsProvider, mockBuildTaskProvider);
        await buildStopCommand.activate(extensionContextFactory());

        buildStopCommand['taskLifecycles'].set('cbuild test-solution', {
            name: 'cbuild test-solution',
            started: true,
            processStarted: true
        });

        await buildStopCommand['stopBuildTask']();

        expect(mockBuildTaskProvider.terminateTask).toHaveBeenCalledWith('cbuild test-solution');
        expect(nonBuildTerminateSpy).not.toHaveBeenCalled();
        expect(buildTerminateSpy).toHaveBeenCalledTimes(1);
    });

    it('should set stoppedManually flag, set idle state, and fire event when terminateTask succeeds', async () => {
        const mockBuildTaskProvider = {
            createTask: jest.fn(),
            terminateTask: jest.fn().mockReturnValue(true)
        };

        buildStopCommand = new BuildStopCommand(commandsProvider, mockBuildTaskProvider);
        await buildStopCommand.activate(extensionContextFactory());

        const lifecycle = { name: 'cbuild test-solution', started: true, processStarted: true, stoppedManually: false };
        buildStopCommand['taskLifecycles'].set('cbuild test-solution', lifecycle);

        const fireSpy = jest.spyOn(buildStopCommand['eventEmitter'], 'fire');
        const setExecutionStateSpy = jest.spyOn(buildStopCommand as never, 'setExecutionState');

        await buildStopCommand['stopBuildTask']();

        expect(mockBuildTaskProvider.terminateTask).toHaveBeenCalledWith('cbuild test-solution');
        expect(lifecycle.stoppedManually).toBe(true);
        expect(setExecutionStateSpy).toHaveBeenCalledWith('idle');
        expect(fireSpy).toHaveBeenCalled();
    });

    it('should handle missing lifecycle when terminateTask succeeds', async () => {
        const mockBuildTaskProvider = {
            createTask: jest.fn(),
            terminateTask: jest.fn().mockReturnValue(true)
        };

        buildStopCommand = new BuildStopCommand(commandsProvider, mockBuildTaskProvider);
        await buildStopCommand.activate(extensionContextFactory());

        const fireSpy = jest.spyOn(buildStopCommand['eventEmitter'], 'fire');
        const setExecutionStateSpy = jest.spyOn(buildStopCommand as never, 'setExecutionState');

        await buildStopCommand['stopBuildTask']();

        expect(mockBuildTaskProvider.terminateTask).not.toHaveBeenCalled();
        expect(buildStopCommand['taskLifecycles'].get('cbuild test-solution')).toBeUndefined();
        expect(setExecutionStateSpy).toHaveBeenCalledWith('idle');
        expect(fireSpy).toHaveBeenCalled();
    });

    it('should add a lifecycle and set started when Build task starts', async () => {
        await buildStopCommand.activate(extensionContextFactory());

        // simulate Build task start
        const startTaskEvent = createBuildTaskEvent('cbuild test-solution') as vscode.TaskStartEvent;


        buildStopCommand.activate(extensionContextFactory());
        // Call the handler
        onDidStartTaskHandler(startTaskEvent);
        const lifecycle = buildStopCommand['taskLifecycles'].get('cbuild test-solution');
        expect(lifecycle).toBeDefined();
        expect(lifecycle?.started).toBe(true);
        expect(lifecycle?.processStarted).toBe(false);
    });

    it('should set processStarted and set state to building when Build task process starts', async () => {
        await buildStopCommand.activate(extensionContextFactory());
        // Add lifecycle for Build
        buildStopCommand['taskLifecycles'].set('cbuild test-solution', { name: 'cbuild test-solution', started: true, processStarted: false });

        buildStopCommand.activate(extensionContextFactory());

        const task = createBuildTaskEvent('cbuild test-solution') as vscode.TaskProcessStartEvent;

        // Call the handler
        onDidStartTaskProcessHandler(task);
        const lifecycle = buildStopCommand['taskLifecycles'].get('cbuild test-solution');
        expect(lifecycle?.processStarted).toBe(true);
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            'setContext',
            `${PACKAGE_NAME}.buildState`,
            'building'
        );
    });

    it('should set exitCode and show info message if Build task ends with non-zero exit code and stopped manually', async () => {
        await buildStopCommand.activate(extensionContextFactory());
        buildStopCommand['taskLifecycles'].set('cbuild test-solution', { name: 'cbuild test-solution', started: true, processStarted: true, stoppedManually: true });

        buildStopCommand.activate(extensionContextFactory());

        const task = {
            execution: { task: { name: 'cbuild test-solution', definition: { type: BuildTaskProviderImpl.taskType } } },
            exitCode: 1
        } as vscode.TaskProcessEndEvent;

        // Call the handler
        onDidEndTaskProcessHandler(task);
        const lifecycle = buildStopCommand['taskLifecycles'].get('cbuild test-solution');
        expect(lifecycle?.exitCode).toBe(1);
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            'setContext',
            `${PACKAGE_NAME}.buildState`,
            'idle'
        );
    });

    it('should set state to idle and fire event when Build task ends and not stopped manually', async () => {
        await buildStopCommand.activate(extensionContextFactory());
        buildStopCommand['taskLifecycles'].set('cbuild test-solution', { name: 'cbuild test-solution', started: true, processStarted: true });

        buildStopCommand.activate(extensionContextFactory());
        // Spy on eventEmitter.fire
        const fireSpy = jest.spyOn(buildStopCommand['eventEmitter'], 'fire');


        const task = {
            execution: { task: { name: 'cbuild test-solution', definition: { type: BuildTaskProviderImpl.taskType } } }
        } as vscode.TaskEndEvent;

        // Call the handler
        onDidEndTaskHandler(task);
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            'setContext',
            `${PACKAGE_NAME}.buildState`,
            'idle'
        );
        expect(fireSpy).toHaveBeenCalled();
    });

});
