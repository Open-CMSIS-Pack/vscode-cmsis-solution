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
import * as inspector from 'inspector';
import * as pty from '@lydell/node-pty';
import { ProcessManagerImpl, type ProcessSpawnOptions } from './process-manager';

const spawnMock = jest.fn();
const createInterfaceMock = jest.fn();

jest.mock('child_process', () => ({
    spawn: (...args: unknown[]) => spawnMock(...args),
}));

jest.mock('readline', () => ({
    createInterface: (...args: unknown[]) => createInterfaceMock(...args),
}));

jest.mock('@lydell/node-pty', () => ({
    spawn: jest.fn(),
}));

jest.mock('inspector', () => ({
    url: jest.fn(() => undefined),
}));

describe('process-manager.ts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (inspector.url as jest.Mock).mockReturnValue(undefined);
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
            const spawnOptions: ProcessSpawnOptions = { cwd: '.', env: { ORIGINAL: '1' }, filterOutput: true };

            const resultPromise = processManager.spawn('tool', ['--flag'], spawnOptions, onOutput);

            lineCallbacks.get(stdoutStream)?.('stdout line');
            lineCallbacks.get(stderrStream)?.('stderr line');
            childProcess.emit('close', 0);

            await expect(resultPromise).resolves.toEqual({ code: 0 });
            expect(spawnMock).toHaveBeenCalledWith('tool', ['--flag'], {
                cwd: '.',
                env: { AUGMENTED: '1' },
            });
            expect(onOutput).toHaveBeenNthCalledWith(1, 'stdout line\r\n');
            expect(onOutput).toHaveBeenNthCalledWith(2, 'stderr line\r\n');
        });

        it('forces PTY with default dimensions while debugging on Windows', async () => {
            (inspector.url as jest.Mock).mockReturnValue('ws://debugger');

            let onData: ((data: string) => void) | undefined;
            let onExit: ((event: { exitCode: number }) => void) | undefined;
            const ptyProcess = {
                onData: jest.fn((callback: (data: string) => void) => { onData = callback; }),
                onExit: jest.fn((callback: (event: { exitCode: number }) => void) => { onExit = callback; }),
                write: jest.fn(),
                kill: jest.fn(),
            };
            (pty.spawn as jest.Mock).mockReturnValue(ptyProcess);

            const environmentManager = {
                augmentEnv: jest.fn(() => ({ vars: { AUGMENTED: '1' } })),
            };
            const processManager = new ProcessManagerImpl(environmentManager as never);
            const onOutput = jest.fn();

            const resultPromise = processManager.spawn(
                'tool',
                ['--flag'],
                { cwd: '.', env: { ORIGINAL: '1' }, usePty: true },
                onOutput,
            );

            onData?.('\x1b[?9001h\x1b[?1004houtput chunk');
            onExit?.({ exitCode: 0 });

            await expect(resultPromise).resolves.toEqual({ code: 0 });
            expect(pty.spawn).toHaveBeenCalledWith('tool', ['--flag'], {
                name: 'xterm-256color',
                cols: 80,
                rows: 24,
                cwd: '.',
                env: { AUGMENTED: '1' },
            });
            expect(spawnMock).not.toHaveBeenCalled();
            expect(onOutput).toHaveBeenCalledWith('\x1b[?9001h\x1b[?1004houtput chunk');
        });

        it('filters PTY control sequences split across output chunks', async () => {
            let onData: ((data: string) => void) | undefined;
            let onExit: ((event: { exitCode: number }) => void) | undefined;
            const ptyProcess = {
                onData: jest.fn((callback: (data: string) => void) => { onData = callback; }),
                onExit: jest.fn((callback: (event: { exitCode: number }) => void) => { onExit = callback; }),
                write: jest.fn(),
                kill: jest.fn(),
            };
            (pty.spawn as jest.Mock).mockReturnValue(ptyProcess);

            const environmentManager = {
                augmentEnv: jest.fn(() => ({ vars: {} })),
            };
            const processManager = new ProcessManagerImpl(environmentManager as never);
            const onOutput = jest.fn();

            const resultPromise = processManager.spawn('tool', [], { usePty: true, filterOutput: true }, onOutput);

            onData?.('\x1b[?90');
            onData?.('01hGenerator output\r\n');
            onExit?.({ exitCode: 0 });

            await expect(resultPromise).resolves.toEqual({ code: 0 });
            expect(onOutput).toHaveBeenCalledTimes(1);
            expect(onOutput).toHaveBeenCalledWith('Generator output\r\n');
        });
    });
});
