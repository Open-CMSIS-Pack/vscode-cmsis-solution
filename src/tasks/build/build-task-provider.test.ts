/**
 * Copyright 2025-2026 Arm Limited
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

import { BuildTaskProviderImpl } from './build-task-provider';
import { cbuildArgsFromTaskDefinition } from './build-runner';
import { Runner } from '../../vscode-api/runner/runner';

interface MockCustomExecution {
    callback: () => void;
}

interface MockTerminalRunner {
    terminateProcess: jest.Mock;
}

describe('BuildTaskProviderImpl', () => {
    const mockRunner: Runner = {
        run: jest.fn()
    } as Runner;

    const formatLabelArgs = (rawArgs: string[]): string[] =>
        rawArgs.map(arg => (!arg || arg.trim().length === 0) ? '""' : arg);

    it('should create a task', () => {
        const provider = new BuildTaskProviderImpl(mockRunner, 'Build');
        const definition = {
            type: 'test-type',
            solution: 'test-solution',
            rebuild: false
        };
        const task = provider.createTask(definition);
        const expectedLabel = ['cbuild', ...formatLabelArgs(cbuildArgsFromTaskDefinition(definition))].join(' ');
        expect(task.name).toBe(expectedLabel);
        expect(task.definition).toBe(definition);
        expect(task.execution).toHaveProperty('callback');
        expect(typeof (task.execution as MockCustomExecution).callback).toBe('function');
    });

    it('should add and terminate a task runner', () => {
        const provider = new BuildTaskProviderImpl(mockRunner, 'Build');

        const mockTerminalRunner: MockTerminalRunner = {
            terminateProcess: jest.fn()
        };

        const expectedLabel = ['cbuild', ...formatLabelArgs(cbuildArgsFromTaskDefinition({
            type: 'test-type',
            solution: 'test-solution',
            rebuild: false
        }))].join(' ');

        (provider as unknown as Record<string, unknown>)['activeTaskRunners'] = new Map([[expectedLabel, mockTerminalRunner]]);

        expect(((provider as unknown as Record<string, unknown>)['activeTaskRunners'] as Map<string, unknown>).has(expectedLabel)).toBe(true);

        const result = provider.terminateTask(expectedLabel);
        expect(result).toBe(true);
        expect(mockTerminalRunner.terminateProcess).toHaveBeenCalled();

        expect(((provider as unknown as Record<string, unknown>)['activeTaskRunners'] as Map<string, unknown>).has(expectedLabel)).toBe(false);
    });

    it('should return false if no runner exists for terminateTask', () => {
        const provider = new BuildTaskProviderImpl(mockRunner, 'Build');
        const result = provider.terminateTask('Build');
        expect(result).toBe(false);
    });
});
