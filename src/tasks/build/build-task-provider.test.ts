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

import { BuildTaskProviderImpl } from './build-task-provider';
import { cbuildArgsFromTaskDefinition } from './build-runner';
import { Runner } from '../../vscode-api/runner/runner';
import * as path from 'path';
import { BuildTaskDefinition } from './build-task-definition';

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

    const buildExpectedLabel = (definition: BuildTaskDefinition): string => {
        const displaySolution = definition.solution &&
            (definition.solution.endsWith('.csolution.yml') || definition.solution.endsWith('.csolution.yaml'))
            ? path.basename(definition.solution)
            : definition.solution;

        const labelArgs = cbuildArgsFromTaskDefinition(definition).map(arg =>
            (displaySolution && arg === definition.solution) ? displaySolution : arg
        );

        return ['cbuild', ...formatLabelArgs(labelArgs)].join(' ');
    };

    it('should create a task', () => {
        const provider = new BuildTaskProviderImpl(mockRunner, 'Build');
        const definition = {
            type: 'test-type',
            solution: 'test-solution',
            rebuild: false
        };
        const task = provider.createTask(definition);
        const expectedLabel = buildExpectedLabel(definition);
        expect(task.name).toBe(expectedLabel);
        expect(task.definition).toBe(definition);
        expect(task.execution).toHaveProperty('callback');
        expect(typeof (task.execution as MockCustomExecution).callback).toBe('function');
    });

    it('should create a task label with the csolution filename instead of absolute path', () => {
        const provider = new BuildTaskProviderImpl(mockRunner, 'Build');
        const definition = {
            type: 'test-type',
            solution: path.join('C:', 'work', 'solutions', 'MySolution.csolution.yml'),
            rebuild: false,
            active: 'Debug+Target'
        };

        const task = provider.createTask(definition);

        expect(task.name).toContain('MySolution.csolution.yml');
        expect(task.name).not.toContain(path.join('C:', 'work', 'solutions'));
        expect(task.name).toBe(buildExpectedLabel(definition));
    });

    it('should keep setup argument and shorten the following csolution path in task label', () => {
        const provider = new BuildTaskProviderImpl(mockRunner, 'Build');
        const definition = {
            type: 'test-type',
            setup: true,
            solution: path.join('C:', 'workspace', 'Foo.csolution.yaml'),
            cmakeTarget: 'database',
            rebuild: false,
            active: 'Release+Target'
        };

        const task = provider.createTask(definition);

        expect(task.name).toContain('cbuild setup Foo.csolution.yaml');
        expect(task.name).toBe(buildExpectedLabel(definition));
    });

    it('should add and terminate a task runner', () => {
        const provider = new BuildTaskProviderImpl(mockRunner, 'Build');

        const mockTerminalRunner: MockTerminalRunner = {
            terminateProcess: jest.fn()
        };

        const expectedLabel = buildExpectedLabel({
            type: 'test-type',
            solution: 'test-solution',
            rebuild: false
        });

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
