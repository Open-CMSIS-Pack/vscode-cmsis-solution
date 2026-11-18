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

import { BuildTaskProviderImpl, waitForActiveBuildTasksCompletion } from './build-task-provider';
import { cbuildArgsFromTaskDefinition } from './build-runner';
import { Runner } from '../../vscode-api/runner/runner';
import * as path from 'path';
import { BuildTaskDefinition } from './build-task-definition';
import * as vscode from 'vscode';
import { TerminalTaskRunner } from '../../vscode-api/runner/terminal-task-runner';
import { CsolutionApiV2Impl } from '../../api/v2-api';
import type { DataManager } from '../../data-manager/data-manager';
import type { SolutionCreator } from '../../solutions/solution-creator';
import { CSolution } from '../../solutions/csolution';

jest.mock('vscode', () => {
    const mock = jest.requireActual('../../../__mocks__/vscode');
    return {
        ...mock,
        tasks: {
            ...mock.tasks,
            registerTaskProvider: jest.fn(() => ({ dispose: jest.fn() })),
        },
        CancellationTokenSource: jest.fn(() => {
            const emitter = new mock.EventEmitter();
            const token = { isCancellationRequested: false, onCancellationRequested: emitter.event };
            return {
                token,
                cancel: () => { token.isCancellationRequested = true; emitter.fire(); },
                dispose: () => emitter.dispose(),
            };
        }),
    };
});

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

    it('waitForActiveBuildTasksCompletion resolves immediately when no active build tasks exist', async () => {
        (vscode.tasks as unknown as { taskExecutions: vscode.TaskExecution[] }).taskExecutions = [];

        await expect(waitForActiveBuildTasksCompletion()).resolves.toBeUndefined();
    });

    it('waitForActiveBuildTasksCompletion waits until active build task ends', async () => {
        const activeExecution = {
            task: { definition: { type: BuildTaskProviderImpl.taskType } }
        } as unknown as vscode.TaskExecution;
        const callbacks: Array<(event: vscode.TaskEndEvent) => void> = [];

        (vscode.tasks as unknown as {
            taskExecutions: vscode.TaskExecution[];
            onDidEndTask: (listener: (event: vscode.TaskEndEvent) => void) => vscode.Disposable;
        }).taskExecutions = [activeExecution];
        (vscode.tasks as unknown as {
            onDidEndTask: (listener: (event: vscode.TaskEndEvent) => void) => vscode.Disposable;
        }).onDidEndTask = (listener) => {
            callbacks.push(listener);
            return { dispose: jest.fn() } as unknown as vscode.Disposable;
        };

        let completed = false;
        const waitPromise = waitForActiveBuildTasksCompletion().then(() => {
            completed = true;
        });

        await Promise.resolve();
        expect(completed).toBe(false);

        callbacks[0]({ execution: activeExecution } as vscode.TaskEndEvent);
        await waitPromise;
        expect(completed).toBe(true);
    });

    it('resolves if build task ended before listener registration (race condition)', async () => {
        const activeExecution = {
            task: { definition: { type: BuildTaskProviderImpl.taskType } }
        } as unknown as vscode.TaskExecution;

        // Initial snapshot shows the task as active
        (vscode.tasks as unknown as {
            taskExecutions: vscode.TaskExecution[];
        }).taskExecutions = [activeExecution];

        (vscode.tasks as unknown as {
            onDidEndTask: (listener: (event: vscode.TaskEndEvent) => void) => vscode.Disposable;
        }).onDidEndTask = (listener) => {
            // After listener registration, the task is no longer active (simulating race condition)
            (vscode.tasks as unknown as {
                taskExecutions: vscode.TaskExecution[];
            }).taskExecutions = [];
            // Invoke listener callback on next tick (safe to do even if task already ended)
            setTimeout(() => listener({ execution: activeExecution } as vscode.TaskEndEvent), 0);
            return { dispose: jest.fn() } as unknown as vscode.Disposable;
        };

        // Should resolve without hanging, even though the task ended before the listener could catch the event
        await expect(waitForActiveBuildTasksCompletion()).resolves.toBeUndefined();
    });
});

describe('build result capture', () => {
    let provider: BuildTaskProviderImpl;
    let run: jest.MockedFunction<Runner['run']>;
    let startEmitter: vscode.EventEmitter<vscode.TaskStartEvent>;
    let endEmitter: vscode.EventEmitter<vscode.TaskEndEvent>;
    let subscriptions: vscode.Disposable[];
    let active: vscode.TaskExecution[];
    let solution: CSolution;
    let activeTarget: string;
    const solutionManager = { getCsolution: jest.fn<CSolution | undefined, []>() };
    const definition = { type: BuildTaskProviderImpl.taskType, solution: 'test.csolution.yml' };
    const openTask = async (task: vscode.Task) => {
        const custom = task.execution as unknown as { callback: ConstructorParameters<typeof vscode.CustomExecution>[0] };
        return await custom.callback({ ...task.definition, solution: task.definition.solution ?? '' }) as TerminalTaskRunner;
    };
    const startTask = async (task: vscode.Task) => {
        const runner = await openTask(task);
        const execution = { task, terminate: () => runner.close() };
        active.push(execution);
        startEmitter.fire({ execution });
        return { execution, runner };
    };

    beforeEach(async () => {
        run = jest.fn();
        solution = new CSolution();
        solution.solutionPath = path.resolve('test.csolution.yml');
        activeTarget = 'Target';
        jest.spyOn(solution, 'getActiveTargetSetName').mockImplementation(() => activeTarget);
        solutionManager.getCsolution.mockReturnValue(solution);
        provider = new BuildTaskProviderImpl({ run }, undefined, undefined, solutionManager);
        startEmitter = new vscode.EventEmitter<vscode.TaskStartEvent>();
        endEmitter = new vscode.EventEmitter<vscode.TaskEndEvent>();
        active = [];
        Object.assign(vscode.tasks, {
            onDidStartTask: startEmitter.event, onDidEndTask: endEmitter.event, taskExecutions: active,
        });
        subscriptions = [];
        await provider.activate({ subscriptions } as vscode.ExtensionContext);
    });

    afterEach(() => {
        subscriptions.forEach(subscription => subscription.dispose());
        startEmitter.dispose();
        endEmitter.dispose();
    });

    it.each([
        [0, 'compiled\r\n'],
        [7, 'main.c:5: error: invalid operand\r\n'],
        [0, '\u001b[33mwarning: deprecated\u001b[0m  \r\n'],
        [-1, 'cannot start cbuild\r\n'],
    ])('captures exit code %s and exact terminal output %j from tasks started outside the API', async (exitCode, output) => {
        let written = '';
        run.mockImplementation(async (_definition, onOutput) => {
            onOutput(output);
            onOutput('last chunk');
            return exitCode;
        });
        const { execution, runner } = await startTask(provider.createTask(definition));
        runner.onDidWrite(chunk => { written += chunk; });
        const result = provider.getBuildResult(execution);
        await runner.open(undefined);
        runner.getOutputBuffer(); // Existing consumers can still drain their own buffer.
        endEmitter.fire({ execution });

        expect(provider.getBuildResult(execution)).toBe(result);
        await expect(result).resolves.toEqual({ exitCode, output: output + 'last chunk' });
        expect(written).toBe(output + 'last chunk');
    });

    it('keeps overlapping executions with identical definitions isolated', async () => {
        const finish: Array<() => void> = [];
        run.mockImplementation((_definition, onOutput) => new Promise(resolve => {
            const index = finish.length;
            onOutput(`start ${index}\r\n`);
            finish.push(() => { onOutput(`end ${index}\r\n`); resolve(index); });
        }));
        const first = await startTask(provider.createTask(definition));
        const second = await startTask(provider.createTask(definition));
        const firstOpen = first.runner.open(undefined);
        const secondOpen = second.runner.open(undefined);
        finish[1]();
        await secondOpen;
        finish[0]();
        await firstOpen;

        await expect(provider.getBuildResult(first.execution)).resolves.toEqual({ exitCode: 0, output: 'start 0\r\nend 0\r\n' });
        await expect(provider.getBuildResult(second.execution)).resolves.toEqual({ exitCode: 1, output: 'start 1\r\nend 1\r\n' });
    });

    it('retains separate results when the same task is run again', async () => {
        const task = provider.createTask(definition);
        run.mockImplementationOnce(async (_definition, onOutput) => { onOutput('first'); return 0; });
        run.mockImplementationOnce(async (_definition, onOutput) => { onOutput('second'); return 7; });
        const first = await startTask(task);
        await first.runner.open(undefined);
        endEmitter.fire({ execution: first.execution });
        const second = await startTask(task);
        await second.runner.open(undefined);
        endEmitter.fire({ execution: second.execution });

        await expect(provider.getBuildResult(first.execution)).resolves.toEqual({ exitCode: 0, output: 'first' });
        await expect(provider.getBuildResult(second.execution)).resolves.toEqual({ exitCode: 7, output: 'second' });
    });

    it('pairs concurrent callbacks for the same custom task with their individual executions', async () => {
        const task = provider.createTask(definition);
        const firstRunner = await openTask(task);
        const secondRunner = await openTask(task);
        const first = { task, terminate: jest.fn() };
        const second = { task, terminate: jest.fn() };
        startEmitter.fire({ execution: first });
        startEmitter.fire({ execution: second });
        run.mockImplementationOnce(async (_definition, onOutput) => { onOutput('first'); return 0; });
        run.mockImplementationOnce(async (_definition, onOutput) => { onOutput('second'); return 7; });
        await firstRunner.open(undefined);
        await secondRunner.open(undefined);

        await expect(provider.getBuildResult(first)).resolves.toEqual({ exitCode: 0, output: 'first' });
        await expect(provider.getBuildResult(second)).resolves.toEqual({ exitCode: 7, output: 'second' });
    });

    it.each(['start', 'end'])('retains an immediate result before the task %s event', async event => {
        run.mockImplementation(async (_definition, onOutput) => { onOutput('done'); return 7; });
        const task = provider.createTask(definition);
        const runner = await openTask(task);
        await runner.open(undefined);
        const execution = { task, terminate: jest.fn() };
        if (event === 'start') startEmitter.fire({ execution });
        endEmitter.fire({ execution });
        await expect(provider.getBuildResult(execution)).resolves.toEqual({ exitCode: 7, output: 'done' });
    });

    it('allows lookup before the custom callback and start event', async () => {
        const task = provider.createTask(definition);
        const execution = { task, terminate: jest.fn() };
        active.push(execution);
        const result = provider.getBuildResult(execution);
        expect(provider.getBuildResult(execution)).toBe(result);
        const runner = await openTask(task);
        startEmitter.fire({ execution });
        run.mockResolvedValue(0);
        await runner.open(undefined);
        await expect(result).resolves.toEqual({ exitCode: 0, output: '' });
    });

    it('does not report a skipped toolbox call as successful', async () => {
        run.mockImplementation(async (_definition, _onOutput, _token, _dimensions, onSkipped) => {
            onSkipped!();
            return 0;
        });
        const { execution, runner } = await startTask(provider.createTask(definition));
        await runner.open(undefined);
        await expect(provider.getBuildResult(execution)).resolves.toEqual({ exitCode: undefined, output: '' });
    });

    it('captures runner startup errors and settles the result', async () => {
        run.mockRejectedValue(new Error('spawn failed'));
        const { execution, runner } = await startTask(provider.createTask(definition));
        await runner.open(undefined);
        await expect(provider.getBuildResult(execution)).resolves.toEqual({ exitCode: undefined, output: 'spawn failed' });
    });

    it('settles tasks ending before their custom callback, ignoring unrelated end events', async () => {
        const task = provider.createTask(definition);
        const execution = { task, terminate: jest.fn() };
        active.push(execution);
        const result = provider.getBuildResult(execution);
        let settled = false;
        void result.then(() => { settled = true; });
        endEmitter.fire({ execution: { task: {} as vscode.Task, terminate: jest.fn() } });
        await Promise.resolve();
        expect(settled).toBe(false);
        endEmitter.fire({ execution });
        await expect(result).resolves.toEqual({ output: '' });
    });

    it('rejects executions without a capture, including an inactive handle with the same task', async () => {
        const unknown = { task: {} as vscode.Task, terminate: jest.fn() };
        await expect(provider.getBuildResult(unknown)).rejects.toThrow('No captured build result');
        const { execution, runner } = await startTask(provider.createTask(definition));
        run.mockResolvedValue(0);
        await runner.open(undefined);
        await expect(provider.getBuildResult({ ...execution })).rejects.toThrow('No captured build result');
    });

    it('captures resolved tasks launched through VS Code', async () => {
        const task = provider.resolveTask(new vscode.Task(definition, vscode.TaskScope.Workspace, 'Build', definition.type));
        const { execution, runner } = await startTask(task);
        run.mockImplementation(async (_definition, onOutput) => { onOutput('resolved'); return 0; });
        await runner.open(undefined);
        await expect(provider.getBuildResult(execution)).resolves.toEqual({ exitCode: 0, output: 'resolved' });
    });

    it('captures builds requested through the unchanged V2 API', async () => {
        const api = new CsolutionApiV2Impl({} as DataManager, {} as SolutionCreator, provider);
        run.mockImplementation(async (_definition, onOutput) => { onOutput('V2 warning'); return 0; });
        const execute = jest.spyOn(vscode.tasks, 'executeTask').mockImplementation(async task => {
            const { execution, runner } = await startTask(task);
            await runner.open(undefined);
            endEmitter.fire({ execution });
            return execution;
        });
        try {
            const execution = await api.build();
            await expect(provider.getBuildResult(execution)).resolves.toEqual({ exitCode: 0, output: 'V2 warning' });
            await expect(provider.getBuildResult()).resolves.toEqual({ exitCode: 0, output: 'V2 warning' });
            expect(run.mock.calls[0][0]).toMatchObject({ solution: solution.solutionPath, active: 'Target' });
            expect(execution.task.definition.type).toBe(BuildTaskProviderImpl.taskType);
        } finally {
            execute.mockRestore();
        }
    });

    it('settles cancellation without reporting a zero runner code as success', async () => {
        run.mockImplementation((_definition, onOutput, token) => new Promise(resolve => {
            onOutput('building\r\n');
            token.onCancellationRequested(() => resolve(0));
        }));
        const { execution, runner } = await startTask(provider.createTask(definition));
        const running = runner.open(undefined);
        execution.terminate();
        await running;
        await expect(provider.getBuildResult(execution)).resolves.toEqual({ exitCode: undefined, output: 'building\r\n' });
    });

    it('settles manual termination with the existing termination message', async () => {
        jest.useFakeTimers();
        try {
            run.mockImplementation((_definition, onOutput, token) => new Promise(resolve => {
                onOutput('building\r\n');
                token.onCancellationRequested(() => resolve(130));
            }));
            const { execution, runner } = await startTask(provider.createTask(definition));
            const running = runner.open(undefined);
            runner.terminateProcess();
            await jest.advanceTimersByTimeAsync(100);
            await running;
            await expect(provider.getBuildResult(execution)).resolves.toEqual({
                exitCode: 130, output: 'building\r\n\r\n\u{1f7e5} Build cancelled by user\r\n',
            });
        } finally {
            jest.useRealTimers();
        }
    });

    it('returns undefined without an observed build or an active solution', async () => {
        await expect(provider.getBuildResult()).resolves.toBeUndefined();
        const { runner } = await startTask(provider.createTask(definition));
        run.mockResolvedValue(0);
        await runner.open(undefined);
        solutionManager.getCsolution.mockReturnValue(undefined);
        await expect(provider.getBuildResult()).resolves.toBeUndefined();
    });

    it('returns the latest completion including failure, without waiting for a running build', async () => {
        const first = await startTask(provider.createTask(definition));
        run.mockImplementationOnce(async (_definition, onOutput) => { onOutput('success'); return 0; });
        await first.runner.open(undefined);
        const second = await startTask(provider.createTask(definition));
        let finish!: (code: number) => void;
        run.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
        const running = second.runner.open(undefined);

        await expect(provider.getBuildResult()).resolves.toEqual({ exitCode: 0, output: 'success' });
        finish(7);
        await running;
        await expect(provider.getBuildResult()).resolves.toEqual({ exitCode: 7, output: '' });
    });

    it('keeps latest results separate by solution and target, including context switches during a build', async () => {
        const originalPath = solution.solutionPath;
        const first = await startTask(provider.createTask(definition));
        let finish!: (code: number) => void;
        run.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
        const running = first.runner.open(undefined);
        solution.solutionPath = path.resolve('other.csolution.yml');
        const second = await startTask(provider.createTask({ ...definition, solution: solution.solutionPath, active: 'Other' }));
        run.mockResolvedValueOnce(7);
        await second.runner.open(undefined);
        finish(0);
        await running;

        await expect(provider.getBuildResult()).resolves.toBeUndefined(); // Other solution, Target.
        activeTarget = 'Other';
        await expect(provider.getBuildResult()).resolves.toEqual({ exitCode: 7, output: '' });
        solution.solutionPath = originalPath;
        await expect(provider.getBuildResult()).resolves.toBeUndefined(); // Original solution, Other.
        activeTarget = 'Target';
        await expect(provider.getBuildResult()).resolves.toEqual({ exitCode: 0, output: '' });
    });

    it.each(['clean', 'setup'] as const)('excludes %s tasks from latest results while keeping explicit lookup available', async action => {
        const build = await startTask(provider.createTask(definition));
        run.mockResolvedValueOnce(7);
        await build.runner.open(undefined);
        const task = await startTask(provider.createTask({ ...definition, [action]: true }));
        run.mockResolvedValueOnce(0);
        await task.runner.open(undefined);

        await expect(provider.getBuildResult()).resolves.toEqual({ exitCode: 7, output: '' });
        await expect(provider.getBuildResult(task.execution)).resolves.toEqual({ exitCode: 0, output: '' });
    });

    it.each(['skipped', 'cancelled', 'startup error'])('replaces an older success with a %s result', async outcome => {
        const first = await startTask(provider.createTask(definition));
        run.mockResolvedValueOnce(0);
        await first.runner.open(undefined);
        const second = await startTask(provider.createTask(definition));
        if (outcome === 'skipped') {
            run.mockImplementationOnce(async (_definition, _onOutput, _token, _dimensions, onSkipped) => { onSkipped!(); return 0; });
        } else if (outcome === 'startup error') {
            run.mockRejectedValueOnce(new Error('spawn failed'));
        } else {
            run.mockImplementationOnce((_definition, _onOutput, token) => new Promise(resolve => {
                token.onCancellationRequested(() => resolve(0));
            }));
        }
        const running = second.runner.open(undefined);
        if (outcome === 'cancelled') second.execution.terminate();
        await running;
        await expect(provider.getBuildResult()).resolves.toEqual({
            exitCode: undefined, output: outcome === 'startup error' ? 'spawn failed' : '',
        });
    });

    it('records unavailable completion once for a task that never opened its terminal', async () => {
        const execution = { task: provider.createTask(definition), terminate: jest.fn() };
        endEmitter.fire({ execution });
        await expect(provider.getBuildResult()).resolves.toEqual({ output: '' });
        const next = await startTask(provider.createTask(definition));
        run.mockResolvedValueOnce(7);
        await next.runner.open(undefined);
        endEmitter.fire({ execution });
        await expect(provider.getBuildResult()).resolves.toEqual({ exitCode: 7, output: '' });
    });

    it('uses completion order for overlapping builds and clears latest results on disposal', async () => {
        const first = await startTask(provider.createTask(definition));
        const second = await startTask(provider.createTask(definition));
        let finish!: (code: number) => void;
        run.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
        const running = first.runner.open(undefined);
        run.mockResolvedValueOnce(7);
        await second.runner.open(undefined);
        await expect(provider.getBuildResult()).resolves.toEqual({ exitCode: 7, output: '' });
        finish(0);
        await running;
        await expect(provider.getBuildResult()).resolves.toEqual({ exitCode: 0, output: '' });
        subscriptions.forEach(subscription => subscription.dispose());
        await expect(provider.getBuildResult()).resolves.toBeUndefined();
        await expect(provider.getBuildResult(first.execution)).resolves.toEqual({ exitCode: 0, output: '' });
    });

    it('associates a replacement custom callback with the original execution handle', async () => {
        const original = provider.createTask({ ...definition, virtualProject: true });
        // VS Code re-resolves the task, dropping UI metadata and replacing CustomExecution.
        const replacement = provider.resolveTask(new vscode.Task(
            { solution: definition.solution, type: definition.type }, vscode.TaskScope.Workspace, original.name, definition.type,
        ));
        const execution = { task: original, terminate: jest.fn() };
        const runner = await openTask(replacement);
        active.push(execution);
        startEmitter.fire({ execution });
        run.mockImplementationOnce(async (_definition, onOutput) => { onOutput('actual diagnostic'); return 7; });
        await runner.open(undefined);
        endEmitter.fire({ execution });

        await expect(provider.getBuildResult(execution)).resolves.toEqual({ exitCode: 7, output: 'actual diagnostic' });
    });

    it('pins the implicit solution and target used by the runner before execution is queued', async () => {
        const originalPath = solution.solutionPath;
        const { execution, runner } = await startTask(provider.createTask({ type: definition.type }));
        solution.solutionPath = path.resolve('other.csolution.yml');
        activeTarget = 'Other';
        run.mockImplementationOnce(async (bound, onOutput) => {
            // BuildRunner constructs cbuild arguments from exactly this definition.
            expect(cbuildArgsFromTaskDefinition(bound as BuildTaskDefinition)).toEqual(expect.arrayContaining([
                originalPath, '--active', 'Target',
            ]));
            onOutput(`built ${bound.active}`);
            return 0;
        });
        await runner.open(undefined);
        endEmitter.fire({ execution });

        await expect(provider.getBuildResult()).resolves.toBeUndefined();
        solution.solutionPath = originalPath;
        activeTarget = 'Target';
        await expect(provider.getBuildResult()).resolves.toEqual({ exitCode: 0, output: 'built Target' });
    });

    it('keeps unresolved task variables separate while binding the actual resolved context', async () => {
        const task = provider.createTask({ ...definition, solution: '${command:cmsis-csolution.getSolutionFile}' });
        const custom = task.execution as unknown as { callback: ConstructorParameters<typeof vscode.CustomExecution>[0] };
        const runner = await custom.callback({ ...task.definition, solution: solution.solutionPath }) as TerminalTaskRunner;
        const execution = { task, terminate: jest.fn() };
        startEmitter.fire({ execution });
        run.mockResolvedValueOnce(0);
        await runner.open(undefined);

        await expect(provider.getBuildResult(execution)).resolves.toEqual({ exitCode: 0, output: '' });
        await expect(provider.getBuildResult()).resolves.toEqual({ exitCode: 0, output: '' });
    });

    it('settles a task ending after its callback but before the terminal opens', async () => {
        const task = provider.createTask(definition);
        await openTask(task);
        const execution = { task, terminate: jest.fn() };
        startEmitter.fire({ execution });
        endEmitter.fire({ execution });
        await expect(provider.getBuildResult(execution)).resolves.toEqual({ exitCode: undefined, output: '' });
        expect(run).not.toHaveBeenCalled();
    });

    it('retains the final diagnostics and actual exit code after a slow manual cancellation', async () => {
        jest.useFakeTimers();
        try {
            let finish!: () => void;
            run.mockImplementationOnce((_definition, onOutput) => new Promise(resolve => {
                onOutput('started\r\n');
                finish = () => { onOutput('final cancellation diagnostic\r\n'); resolve(130); };
            }));
            const { execution, runner } = await startTask(provider.createTask(definition));
            runner.onDidClose(() => endEmitter.fire({ execution }));
            const running = runner.open(undefined);
            const result = provider.getBuildResult(execution);
            let completed = false;
            void result.then(() => { completed = true; });
            runner.terminateProcess();
            await jest.advanceTimersByTimeAsync(100);

            expect(completed).toBe(false);
            await expect(provider.getBuildResult()).resolves.toBeUndefined();
            finish();
            await running;
            await expect(result).resolves.toEqual({
                exitCode: 130,
                output: 'started\r\n\r\n\u{1f7e5} Build cancelled by user\r\nfinal cancellation diagnostic\r\n',
            });
            await expect(provider.getBuildResult()).resolves.toEqual(await result);
        } finally {
            jest.useRealTimers();
        }
    });
});
