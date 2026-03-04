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

import { expect, it, describe } from '@jest/globals';
import * as vscode from 'vscode';
import * as path from 'path';
import { CompileCommandsGeneratorImpl } from './compile-commands-generator';
import { buildTaskDefinitionBuilderFactory, MockBuildTaskDefinitionBuilder } from '../../tasks/build/build-task-definition-builder.factories';
import { BuildTaskDefinition } from '../../tasks/build/build-task-definition';
import { BuildTaskProvider, BuildTaskProviderImpl } from '../../tasks/build/build-task-provider';

jest.mock('which', () => jest.fn((cmd) => Promise.resolve(path.join('path', 'to', cmd))));

describe('CompileCommandsGenerator', () => {
    let generator: CompileCommandsGeneratorImpl;
    let mockBuildTaskProvider: BuildTaskProvider;
    let buildTaskDefinitionBuilder: MockBuildTaskDefinitionBuilder;
    let mockExecution: vscode.TaskExecution;
    let exitCode: number;

    beforeEach(async () => {
        exitCode = 0;

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

        generator = new CompileCommandsGeneratorImpl(
            mockBuildTaskProvider,
            buildTaskDefinitionBuilder,
        );

    });

    it('check cbuild setup output', async () => {
        (mockBuildTaskProvider.getActiveTaskRunner as jest.Mock).mockReturnValue({
            getOutputBuffer: () => ['completed with exit code 0']
        });
        exitCode = 0;
        const [result, output] = await generator.runCbuildSetup();
        expect(result).toBe(true);
        expect(output).toEqual(expect.arrayContaining(['completed with exit code 0']));
    }, 10000);

    it('prints an error message if the compilation database could not be generated', async () => {
        (mockBuildTaskProvider.getActiveTaskRunner as jest.Mock).mockReturnValue({
            getOutputBuffer: () => ['failed with exit code 1']
        });
        exitCode = 1;
        const [result, output] = await generator.runCbuildSetup();
        expect(result).toBe(false);
        expect(output).toEqual(expect.arrayContaining(['failed with exit code 1']));
    }, 10000);
});
