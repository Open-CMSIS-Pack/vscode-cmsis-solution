/**
 * Copyright 2022-2026 Arm Limited
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

import { expect, it, describe } from '@jest/globals';
import * as vscode from 'vscode';
import * as path from 'path';
import { CompileCommandsGenerator } from './compile-commands-generator';
import { buildTaskDefinitionBuilderFactory, MockBuildTaskDefinitionBuilder } from '../../tasks/build/build-task-definition-builder.factories';
import { BuildTaskDefinition } from '../../tasks/build/build-task-definition';
import { BuildTaskProvider, BuildTaskProviderImpl } from '../../tasks/build/build-task-provider';
import { SolutionEventHub } from '../solution-event-hub';
import * as manifest from '../../manifest';
import { MockOutputChannelProvider, outputChannelProviderFactory } from '../../vscode-api/output-channel-provider.factories';
import { waitTimeout } from '../../__test__/test-waits';

jest.mock('which', () => jest.fn((cmd) => Promise.resolve(path.join('path', 'to', cmd))));

describe('CompileCommandsGenerator', () => {
    let generator: CompileCommandsGenerator;
    let mockBuildTaskProvider: BuildTaskProvider;
    let buildTaskDefinitionBuilder: MockBuildTaskDefinitionBuilder;
    let mockExecution: vscode.TaskExecution;
    let exitCode: number;
    let mockEventHub: jest.Mocked<SolutionEventHub>;
    let outputChannelProvider: MockOutputChannelProvider;
    let cbuildSetupRequestedListener: (() => void) | undefined;

    beforeEach(async () => {
        exitCode = 0;
        mockEventHub = {
            fireCbuildCompleted: jest.fn().mockResolvedValue(undefined),
            onDidCbuildSetupRequested: jest.fn((listener: () => void) => {
                cbuildSetupRequestedListener = listener;
                return { dispose: jest.fn() } as unknown as vscode.Disposable;
            }),
        } as unknown as jest.Mocked<SolutionEventHub>;
        outputChannelProvider = outputChannelProviderFactory();

        const buildTaskDefinition: BuildTaskDefinition = {
            type: BuildTaskProviderImpl.taskType,
            solution: 'some-solution-path',
            schemaCheck: false
        };
        mockBuildTaskProvider = {
            createTask: jest.fn((taskDefinition) => new vscode.Task(
                taskDefinition, vscode.TaskScope.Workspace, 'Build', taskDefinition.type
            )),
            terminateTask: jest.fn().mockReturnValue(false),
            getActiveTaskRunner: jest.fn().mockReturnValue(undefined),
        };
        buildTaskDefinitionBuilder = buildTaskDefinitionBuilderFactory();
        buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode.mockResolvedValue(buildTaskDefinition);

        mockExecution = { task: undefined } as unknown as vscode.TaskExecution;
        jest.spyOn(vscode.tasks, 'executeTask').mockResolvedValue(mockExecution);
        (vscode.tasks as { onDidEndTaskProcess: (listener: (event: vscode.TaskProcessEndEvent) => void) => vscode.Disposable })
            .onDidEndTaskProcess = (listener) => {
                setTimeout(() => {
                    listener({ execution: mockExecution, exitCode: exitCode } as vscode.TaskProcessEndEvent);
                }, 0);
                return { dispose: jest.fn() } as unknown as vscode.Disposable;
            };

        generator = new CompileCommandsGenerator(
            mockBuildTaskProvider,
            buildTaskDefinitionBuilder,
            mockEventHub,
            outputChannelProvider,
        );
        generator.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

    });

    it('check cbuild setup output', async () => {
        (mockBuildTaskProvider.getActiveTaskRunner as jest.Mock).mockReturnValue({
            getOutputBuffer: () => ['completed with exit code 0']
        });
        exitCode = 0;
        cbuildSetupRequestedListener?.();
        await waitTimeout();

        const outputChannel = outputChannelProvider.mockGetCreatedChannelByName(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);
        expect(vscode.tasks.executeTask).toHaveBeenCalledTimes(1);
        expect(outputChannel!.appendLine).toHaveBeenCalledWith('Launching cbuild setup in Terminal to generate IntelliSense database');
        expect(mockEventHub.fireCbuildCompleted).toHaveBeenCalledWith({ success: true, severity: 'success', toolsOutputMessages: ['completed with exit code 0'] });
    });

    it('runs cbuild setup when cbuild setup request event is received', async () => {
        (mockBuildTaskProvider.getActiveTaskRunner as jest.Mock).mockReturnValue({
            getOutputBuffer: () => ['completed with exit code 0']
        });
        exitCode = 0;
        cbuildSetupRequestedListener?.();
        await waitTimeout();

        expect(vscode.tasks.executeTask).toHaveBeenCalledTimes(1);
    });

    it('prints an error message if the compilation database could not be generated', async () => {
        (mockBuildTaskProvider.getActiveTaskRunner as jest.Mock).mockReturnValue({
            getOutputBuffer: () => ['failed with exit code 1']
        });
        exitCode = 1;
        cbuildSetupRequestedListener?.();
        await waitTimeout();
        expect(mockEventHub.fireCbuildCompleted).toHaveBeenCalledWith({ success: false, severity: 'error', toolsOutputMessages: ['failed with exit code 1'] });
    });

    it('reports warning severity when exit code is 0 but output contains warning pattern', async () => {
        (mockBuildTaskProvider.getActiveTaskRunner as jest.Mock).mockReturnValue({
            getOutputBuffer: () => ['warning cbuild: deprecated option', 'completed with exit code 0']
        });
        exitCode = 0;
        cbuildSetupRequestedListener?.();
        await waitTimeout();
        expect(mockEventHub.fireCbuildCompleted).toHaveBeenCalledWith({
            success: true,
            severity: 'warning',
            toolsOutputMessages: ['warning cbuild: deprecated option', 'completed with exit code 0']
        });
    });

    it('reports error severity when exit code is 0 but output contains error pattern', async () => {
        (mockBuildTaskProvider.getActiveTaskRunner as jest.Mock).mockReturnValue({
            getOutputBuffer: () => ['error cbuild: failed to generate', 'completed with exit code 0']
        });
        exitCode = 0;
        cbuildSetupRequestedListener?.();
        await waitTimeout();
        expect(mockEventHub.fireCbuildCompleted).toHaveBeenCalledWith({
            success: true,
            severity: 'error',
            toolsOutputMessages: ['error cbuild: failed to generate', 'completed with exit code 0']
        });
    });
});
