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

import * as vscode from 'vscode';
import { readFileSync, rmSync } from 'node:fs';
import * as fs from 'node:fs';
import { dirname } from 'node:path';
import { BuildOperation } from './build-operation';
import { BuildTaskProvider } from './build-task-provider';
import { Runner } from '../../vscode-api/runner/runner';

jest.mock('node:fs', () => {
    const actual = jest.requireActual('node:fs');
    return { ...actual, writeSync: jest.fn(actual.writeSync), mkdtempSync: jest.fn(actual.mkdtempSync), openSync: jest.fn(actual.openSync) };
});

jest.mock('vscode', () => {
    const api = jest.requireActual('../../../__mocks__/vscode');
    return {
        ...api,
        CancellationTokenSource: class {
            private readonly emitter = new api.EventEmitter();
            readonly token = { isCancellationRequested: false, onCancellationRequested: this.emitter.event };
            cancel() {
                if (!this.token.isCancellationRequested) {
                    this.token.isCancellationRequested = true;
                    this.emitter.fire();
                }
            }
            dispose() { this.emitter.dispose(); }
        },
        tasks: { ...api.tasks, onDidEndTask: jest.fn(() => ({ dispose: jest.fn() })) },
    };
});

const deferred = <T>() => {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
};

describe('BuildOperation', () => {
    const operations: BuildOperation[] = [];
    let runner: jest.Mocked<Runner>;
    let provider: BuildTaskProvider;
    let run: Promise<number>;
    let started: ReturnType<typeof deferred<void>>;

    const submit = (signal?: AbortSignal) => {
        const operation = new BuildOperation({ type: 'build', solution: 'App.csolution.yml' }, provider, signal);
        operations.push(operation);
        return operation;
    };

    beforeEach(() => {
        started = deferred<void>();
        runner = { run: jest.fn().mockResolvedValue(0) };
        provider = {
            createTask: jest.fn((definition, wrap) => ({ definition, runner: wrap!(runner) }) as unknown as vscode.Task),
        } as unknown as BuildTaskProvider;
        jest.mocked(vscode.tasks.executeTask).mockImplementation(async task => {
            const wrapped = (task as unknown as { runner: Runner }).runner;
            run = wrapped.run(task.definition, jest.fn(), new vscode.CancellationTokenSource().token, undefined);
            void run.catch(() => {});
            started.resolve();
            return { task, terminate: jest.fn() };
        });
    });

    afterEach(async () => {
        for (const operation of operations.splice(0)) {
            operation.dispose();
            const result = await operation.result.catch(() => undefined);
            const logFile = result?.logFile ?? (operation as unknown as { logFile?: vscode.Uri }).logFile;
            if (logFile) {
                rmSync(dirname(logFile.fsPath), { recursive: true, force: true });
            }
        }
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    it.each([0, 2, -1])('retains original output and reports exit code %s, including to late awaiters', async code => {
        const text = '\u001b[31mcompiler output\r\nprogress\r';
        runner.run.mockImplementation(async (_definition, output) => { output(text); return code; });
        const operation = submit();
        const output = jest.fn();
        operation.onOutput(output);
        const result = await operation.result;
        expect(result).toEqual({ status: code === 0 ? 'success' : 'failed', exitCode: code >= 0 ? code : undefined, logFile: expect.anything() });
        expect(readFileSync(result.logFile.fsPath, 'utf8')).toBe(text);
        expect(output).toHaveBeenCalledWith({ sequence: 1, timestamp: expect.any(Number), text, stream: 'combined' });
        await expect(operation.result).resolves.toBe(result);
        expect(runner.run).toHaveBeenCalledTimes(1);
    });

    it('reports discarded duplicates as skipped without an exit code or output', async () => {
        runner.run.mockImplementation(async (_definition, _output, _token, _dimensions, onSkipped) => {
            onSkipped?.();
            return 0;
        });
        const operation = submit();
        const output = jest.fn();
        operation.onOutput(output);
        const result = await operation.result;
        expect(result).toEqual({ status: 'skipped', exitCode: undefined, logFile: expect.anything() });
        expect(readFileSync(result.logFile.fsPath, 'utf8')).toBe('');
        expect(output).not.toHaveBeenCalled();
    });

    it('omits the exit code when cancellation prevents execution', async () => {
        const completion = deferred<number>();
        runner.run.mockImplementation(async (_definition, _output, _token, _dimensions, _onSkipped, onCancelledBeforeStart) => {
            await completion.promise;
            onCancelledBeforeStart?.();
            return 130;
        });
        const operation = submit();
        await started.promise;
        operation.cancel();
        completion.resolve(130);
        await expect(operation.result).resolves.toEqual({ status: 'cancelled', exitCode: undefined, logFile: expect.anything() });
    });

    it('retains multibyte output without treating byte length as a short write', async () => {
        const text = '编译完成 ✅\r\n';
        runner.run.mockImplementation(async (_definition, output) => { output(text); return 0; });
        const result = await submit().result;
        expect(result.status).toBe('success');
        expect(readFileSync(result.logFile.fsPath, 'utf8')).toBe(text);
    });

    it('retains large output without truncation', async () => {
        const chunk = 'compiler output\r\n'.repeat(4096);
        runner.run.mockImplementation(async (_definition, output) => {
            for (let index = 0; index < 32; index++) output(chunk);
            return 0;
        });
        const result = await submit().result;
        expect(readFileSync(result.logFile.fsPath, 'utf8')).toBe(chunk.repeat(32));
    });

    it('isolates identical submissions with unique identities and logs', async () => {
        runner.run.mockImplementation(async (definition, output) => { output(definition.operationId); return 0; });
        const first = submit();
        const second = submit();
        const [a, b] = await Promise.all([first.result, second.result]);
        expect(first.id).not.toBe(second.id);
        expect(a.logFile.fsPath).not.toBe(b.logFile.fsPath);
        expect(readFileSync(a.logFile.fsPath, 'utf8')).toBe(first.id);
        expect(readFileSync(b.logFile.fsPath, 'utf8')).toBe(second.id);
        expect(runner.run).toHaveBeenCalledTimes(2);
    });

    it.each(['cancel', 'abort'] as const)('cancels before task submission using %s', async method => {
        const controller = new AbortController();
        const operation = submit(controller.signal);
        if (method === 'abort') controller.abort();
        else operation.cancel();
        operation.cancel();
        await expect(operation.result).resolves.toEqual({ status: 'cancelled', logFile: expect.anything() });
        expect(vscode.tasks.executeTask).not.toHaveBeenCalled();
    });

    it.each([130, 0, 2])('waits for running process completion and preserves completion race (%s)', async code => {
        const completion = deferred<number>();
        runner.run.mockReturnValue(completion.promise);
        const operation = submit();
        await started.promise;
        const settled = jest.fn();
        void operation.result.then(settled);
        operation.cancel();
        await Promise.resolve();
        expect(settled).not.toHaveBeenCalled();
        expect(runner.run.mock.calls[0][2].isCancellationRequested).toBe(true);
        completion.resolve(code);
        await expect(operation.result).resolves.toMatchObject({ status: code === 130 ? 'cancelled' : code === 0 ? 'success' : 'failed', exitCode: code });
        await run;
    });

    it.each(['mkdtempSync', 'openSync'] as const)('rejects result without submitting a task when %s fails', async method => {
        const error = new Error('temporary log unavailable');
        jest.mocked(fs[method]).mockImplementationOnce(() => { throw error; });
        const operation = submit();
        await expect(operation.result).rejects.toBe(error);
        expect(provider.createTask).not.toHaveBeenCalled();
        expect(vscode.tasks.executeTask).not.toHaveBeenCalled();
    });

    it('rejects infrastructure failures rather than returning a compiler failure', async () => {
        runner.run.mockRejectedValue(new Error('spawn failed'));
        await expect(submit().result).rejects.toThrow('spawn failed');
        await expect(run).rejects.toThrow('spawn failed');
    });

    it('cancels on log failure without throwing out of the process output callback', async () => {
        jest.mocked(fs.writeSync).mockImplementationOnce(() => { throw new Error('disk full'); });
        runner.run.mockImplementation(async (_definition, output, token) => {
            expect(() => output('original output')).not.toThrow();
            expect(token.isCancellationRequested).toBe(true);
            return 130;
        });
        await expect(submit().result).rejects.toThrow('disk full');
        await expect(run).rejects.toThrow('disk full');
    });

    it('rejects short log writes and requests cancellation without publishing incomplete output', async () => {
        jest.mocked(fs.writeSync).mockReturnValueOnce(1);
        runner.run.mockImplementation(async (_definition, output, token) => {
            expect(() => output('compiler output')).not.toThrow();
            expect(token.isCancellationRequested).toBe(true);
            return 130;
        });
        const operation = submit();
        const output = jest.fn();
        operation.onOutput(output);
        await expect(operation.result).rejects.toThrow('Incomplete build log write');
        await expect(run).rejects.toThrow('Incomplete build log write');
        expect(output).not.toHaveBeenCalled();
    });

    it('rejects task submission failure', async () => {
        jest.mocked(vscode.tasks.executeTask).mockRejectedValueOnce(new Error('task rejected'));
        await expect(submit().result).rejects.toThrow('task rejected');
    });

    it('settles when a task ends without starting its custom execution', async () => {
        jest.mocked(vscode.tasks.executeTask).mockImplementationOnce(async task => {
            const listener = jest.mocked(vscode.tasks.onDidEndTask).mock.calls.at(-1)![0];
            listener({ execution: { task, terminate: jest.fn() } });
            return { task, terminate: jest.fn() };
        });
        await expect(submit().result).resolves.toEqual({ status: 'failed', logFile: expect.anything() });
    });

    it('rejects interrupted builds on disposal and requests termination', async () => {
        const completion = deferred<number>();
        runner.run.mockReturnValue(completion.promise);
        const operation = submit();
        await started.promise;
        const result = expect(operation.result).rejects.toThrow('API was disposed');
        operation.dispose();
        await result;
        expect(runner.run.mock.calls[0][2].isCancellationRequested).toBe(true);
        completion.resolve(130);
        await run;
    });
});
