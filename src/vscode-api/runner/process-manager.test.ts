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

import 'jest';
import { EventEmitter } from 'events';
import { type SpawnOptions } from 'child_process';
import { ProcessManagerImpl } from './process-manager';

const spawnMock = jest.fn();
const createInterfaceMock = jest.fn();
const ptySpawnMock = jest.fn();

jest.mock('child_process', () => ({
    spawn: (...args: unknown[]) => spawnMock(...args),
}));

jest.mock('readline', () => ({
    createInterface: (...args: unknown[]) => createInterfaceMock(...args),
}));

jest.mock('@lydell/node-pty', () => ({
    spawn: (...args: unknown[]) => ptySpawnMock(...args),
}));

jest.mock('inspector', () => ({
    url: jest.fn(() => undefined),
}));

describe('process-manager.ts', () => {
    beforeEach(() => {
        spawnMock.mockReset();
        createInterfaceMock.mockReset();
        ptySpawnMock.mockReset();
    });

    describe('spawn', () => {
        it('forwards stdout and stderr line output and resolves on close code 0', async () => {
            const stdoutStream = {};
            const stderrStream = {};
            const lineCallbacks = new Map<object, (line: string) => void>();

            createInterfaceMock.mockImplementation(({ input }: { input: object }) => ({
                on: (event: string, callback: (line: string) => void) => {
                    if (event === 'line') {
                        lineCallbacks.set(input, callback);
                    }
                },
            }));

            const childProcess = new EventEmitter() as EventEmitter & {
                stdout: object;
                stderr: object;
                exitCode: number | null;
                kill: jest.Mock;
            };

            childProcess.stdout = stdoutStream;
            childProcess.stderr = stderrStream;
            childProcess.exitCode = null;
            childProcess.kill = jest.fn();

            spawnMock.mockReturnValue(childProcess);

            const environmentManager = {
                augmentEnv: jest.fn(() => ({ vars: { AUGMENTED: '1' } })),
            };

            const processManager = new ProcessManagerImpl(environmentManager as never);
            const onOutput = jest.fn();
            const spawnOptions: SpawnOptions = { cwd: '.', env: { ORIGINAL: '1' } };

            const resultPromise = processManager.spawn('tool', ['--flag'], spawnOptions, onOutput);

            lineCallbacks.get(stdoutStream)?.('stdout line');
            lineCallbacks.get(stderrStream)?.('stderr line');
            childProcess.emit('close', 0);

            await expect(resultPromise).resolves.toEqual({ code: 0 });
            expect(spawnMock).toHaveBeenCalledWith('tool', ['--flag'], { ...spawnOptions, env: { AUGMENTED: '1' } });
            expect(onOutput).toHaveBeenNthCalledWith(1, 'stdout line\r\n');
            expect(onOutput).toHaveBeenNthCalledWith(2, 'stderr line\r\n');
        });

        describe('when terminal dimensions are provided', () => {
            it('emits normalized pty output lines and flushes a trailing partial line on exit', async () => {
                let onDataCallback: ((data: string) => void) | undefined;
                let onExitCallback: ((event: { exitCode: number }) => void) | undefined;
                const ptyProcess = {
                    onData: jest.fn((callback: (data: string) => void) => {
                        onDataCallback = callback;
                    }),
                    onExit: jest.fn((callback: (event: { exitCode: number }) => void) => {
                        onExitCallback = callback;
                    }),
                    write: jest.fn(),
                    kill: jest.fn(),
                };
                ptySpawnMock.mockReturnValue(ptyProcess);

                const environmentManager = {
                    augmentEnv: jest.fn(() => ({ vars: { AUGMENTED: '1' } })),
                };
                const processManager = new ProcessManagerImpl(environmentManager as never);
                const onOutput = jest.fn();

                const resultPromise = processManager.spawn(
                    'tool',
                    ['--flag'],
                    { cwd: '.', env: { ORIGINAL: '1' } },
                    onOutput,
                    undefined,
                    { columns: 80, rows: 24 }
                );

                onDataCallback?.('\x1b[31mfirst');
                onDataCallback?.(' line\x1b[0m\r\nsecond\x07 line\r\n\r\ntrailing');
                onExitCallback?.({ exitCode: 0 });

                await expect(resultPromise).resolves.toEqual({ code: 0 });
                expect(ptySpawnMock).toHaveBeenCalledWith('tool', ['--flag'], {
                    name: 'xterm-256color',
                    cols: 80,
                    rows: 24,
                    cwd: '.',
                    env: { AUGMENTED: '1' },
                });
                expect(spawnMock).not.toHaveBeenCalled();
                expect(onOutput).toHaveBeenNthCalledWith(1, 'first line\r\n');
                expect(onOutput).toHaveBeenNthCalledWith(2, 'second line\r\n');
                expect(onOutput).toHaveBeenNthCalledWith(3, '\r\n');
                expect(onOutput).toHaveBeenNthCalledWith(4, 'trailing\r\n');
            });

            it('preserves blank PTY line boundaries for whitespace and control-sequence-only lines', async () => {
                let onDataCallback: ((data: string) => void) | undefined;
                let onExitCallback: ((event: { exitCode: number }) => void) | undefined;
                const ptyProcess = {
                    onData: jest.fn((callback: (data: string) => void) => {
                        onDataCallback = callback;
                    }),
                    onExit: jest.fn((callback: (event: { exitCode: number }) => void) => {
                        onExitCallback = callback;
                    }),
                    write: jest.fn(),
                    kill: jest.fn(),
                };
                ptySpawnMock.mockReturnValue(ptyProcess);

                const environmentManager = {
                    augmentEnv: jest.fn(() => ({ vars: { AUGMENTED: '1' } })),
                };
                const processManager = new ProcessManagerImpl(environmentManager as never);
                const onOutput = jest.fn();

                const resultPromise = processManager.spawn(
                    'tool',
                    ['--flag'],
                    { cwd: '.', env: { ORIGINAL: '1' } },
                    onOutput,
                    undefined,
                    { columns: 80, rows: 24 }
                );

                onDataCallback?.(' \r\n\x1b[31m\x1b[0m\r\nnext\r\n');
                onExitCallback?.({ exitCode: 0 });

                await expect(resultPromise).resolves.toEqual({ code: 0 });
                expect(onOutput).toHaveBeenNthCalledWith(1, '\r\n');
                expect(onOutput).toHaveBeenNthCalledWith(2, '\r\n');
                expect(onOutput).toHaveBeenNthCalledWith(3, 'next\r\n');
            });

            it('cancels pty process with ctrl+c followed by kill after grace period', async () => {
                jest.useFakeTimers();
                try {
                    let onExitCallback: ((event: { exitCode: number }) => void) | undefined;
                    let cancellationHandler: (() => void) | undefined;
                    const ptyProcess = {
                        onData: jest.fn(),
                        onExit: jest.fn((callback: (event: { exitCode: number }) => void) => {
                            onExitCallback = callback;
                        }),
                        write: jest.fn(),
                        kill: jest.fn(),
                    };
                    ptySpawnMock.mockReturnValue(ptyProcess);

                    const cancellationToken = {
                        isCancellationRequested: false,
                        onCancellationRequested: (callback: () => void) => {
                            cancellationHandler = callback;
                            return { dispose: () => {} };
                        },
                    };

                    const environmentManager = {
                        augmentEnv: jest.fn(() => ({ vars: { AUGMENTED: '1' } })),
                    };
                    const processManager = new ProcessManagerImpl(environmentManager as never);
                    const onOutput = jest.fn();

                    const resultPromise = processManager.spawn(
                        'tool',
                        ['--flag'],
                        { cwd: '.', env: { ORIGINAL: '1' } },
                        onOutput,
                        cancellationToken as never,
                        { columns: 100, rows: 30 }
                    );

                    cancellationHandler?.();

                    expect(ptyProcess.write).toHaveBeenCalledWith('\x03');
                    expect(ptyProcess.kill).not.toHaveBeenCalled();

                    jest.advanceTimersByTime(500);
                    expect(ptyProcess.kill).toHaveBeenCalledTimes(1);

                    onExitCallback?.({ exitCode: 0 });
                    await expect(resultPromise).resolves.toEqual({ code: 0 });
                } finally {
                    jest.useRealTimers();
                }
            });
        });
    });
});
