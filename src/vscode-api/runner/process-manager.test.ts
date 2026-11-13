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
import { CmsisToolboxManagerImpl } from '../../solutions/cmsis-toolbox';
import { csolutionServiceFactory } from '../../json-rpc/csolution-rpc-client.factory';

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

jest.mock('which', () => jest.fn(async (command: string) => command));

describe('process-manager.ts', () => {
    const originalPlatform = process.platform;

    beforeEach(() => {
        jest.clearAllMocks();
        (inspector.url as jest.Mock).mockReturnValue(undefined);
    });

    afterEach(() => {
        Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    describe('spawn', () => {
        it('does not spawn when cancelled while waiting for the environment', async () => {
            let finish!: () => void;
            const environmentManager = {
                waitUntilReady: () => new Promise<void>(resolve => { finish = resolve; }),
                augmentEnv: jest.fn(),
            };
            const processManager = new ProcessManagerImpl(environmentManager as never);
            const token = { isCancellationRequested: false, onCancellationRequested: jest.fn() };
            const result = processManager.spawn('cbuild', [], {}, jest.fn(), token);
            expect(spawnMock).not.toHaveBeenCalled();
            token.isCancellationRequested = true;
            finish();
            await expect(result).rejects.toEqual({ code: 130 });
            expect(environmentManager.augmentEnv).not.toHaveBeenCalled();
            expect(spawnMock).not.toHaveBeenCalled();
        });

        it.each([false, true])('rejects an already-cancelled request without spawning (usePty: %s)', async (usePty) => {
            const environmentManager = { waitUntilReady: jest.fn().mockResolvedValue(undefined), augmentEnv: jest.fn() };
            const processManager = new ProcessManagerImpl(environmentManager as never);
            const cancellationToken = { isCancellationRequested: true, onCancellationRequested: jest.fn() };

            await expect(processManager.spawn('cbuild', [], { usePty }, jest.fn(), cancellationToken))
                .rejects.toEqual({ code: 130 });

            expect(environmentManager.augmentEnv).not.toHaveBeenCalled();
            expect(spawnMock).not.toHaveBeenCalled();
            expect(pty.spawn).not.toHaveBeenCalled();
        });

        it.each(['queued', 'version check'])('releases the toolbox after setup is cancelled during %s', async (cancelDuring) => {
            const environmentManager = {
                waitUntilReady: jest.fn().mockResolvedValue(undefined),
                augmentEnv: jest.fn(() => ({ vars: {} })),
            };
            const processManager = new ProcessManagerImpl(environmentManager as never);
            const service = csolutionServiceFactory();
            service.getLogMessages.mockResolvedValue({ success: true });
            const toolbox = new CmsisToolboxManagerImpl(processManager, jest.fn(), service);
            const cancellationToken = { isCancellationRequested: false, onCancellationRequested: jest.fn() };

            spawnMock.mockImplementation((_command: string, args: string[]) => {
                const childProcess = new EventEmitter();
                queueMicrotask(() => {
                    if (args.includes('--version')) {
                        cancellationToken.isCancellationRequested = true;
                    }
                    childProcess.emit('close', 0);
                });
                return childProcess;
            });

            const setup = toolbox.runCmsisTool('cbuild', ['setup'], jest.fn(), cancellationToken);
            if (cancelDuring === 'queued') {
                cancellationToken.isCancellationRequested = true;
            }
            const build = toolbox.runCmsisTool('cbuild', ['--target', 'all'], jest.fn());
            const refresh = toolbox.runCsolutionRpc('GetLogMessages', {});
            const clean = toolbox.runCmsisTool('cbuild', ['--clean'], jest.fn());

            await expect(setup).resolves.toEqual([130, 'cbuild']);
            await expect(build).resolves.toEqual([0, 'cbuild']);
            await expect(refresh).resolves.toEqual({ success: true });
            await expect(clean).resolves.toEqual([0, 'cbuild']);

            expect(spawnMock).not.toHaveBeenCalledWith('cbuild', ['setup'], expect.anything());
            expect(spawnMock).toHaveBeenCalledWith('cbuild', ['--target', 'all'], expect.anything());
            expect(service.getLogMessages).toHaveBeenCalledTimes(1);
            expect(spawnMock).toHaveBeenCalledWith('cbuild', ['--clean'], expect.anything());
            expect(toolbox.isRunning()).toBe(false);
        });

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
                waitUntilReady: jest.fn().mockResolvedValue(undefined),
                augmentEnv: jest.fn(() => ({ vars: { AUGMENTED: '1' } })),
            };

            const processManager = new ProcessManagerImpl(environmentManager as never);
            const onOutput = jest.fn();
            const spawnOptions: ProcessSpawnOptions = { cwd: '.', env: { ORIGINAL: '1' }, filterOutput: true };

            const resultPromise = processManager.spawn('tool', ['--flag'], spawnOptions, onOutput);

            await Promise.resolve();

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

        it.each([
            { platform: 'linux', inspectorUrl: undefined, dimensions: undefined },
            { platform: 'win32', inspectorUrl: 'ws://debugger', dimensions: undefined },
            { platform: 'win32', inspectorUrl: 'ws://debugger', dimensions: { columns: 120, rows: 30 } },
        ])('uses a child process for a PTY request on $platform with inspector $inspectorUrl and dimensions $dimensions', async ({ platform, inspectorUrl, dimensions }) => {
            Object.defineProperty(process, 'platform', { value: platform });
            (inspector.url as jest.Mock).mockReturnValue(inspectorUrl);

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
                waitUntilReady: jest.fn().mockResolvedValue(undefined),
                augmentEnv: jest.fn(() => ({ vars: { AUGMENTED: '1' } })),
            };
            const processManager = new ProcessManagerImpl(environmentManager as never);
            const onOutput = jest.fn();

            const args = ['run', 'd:\\examples\\csolution examples\\DualCore\\HelloWorld.csolution.yml', '-g', 'MCUXpressoConfig', '-c', 'HelloWorld_cm0plus.Debug+FRDM-K32L3A6'];
            const resultPromise = processManager.spawn('tool', args, { usePty: true }, onOutput, undefined, dimensions);

            await Promise.resolve();

            lineCallbacks.get(stdoutStream)?.('output');
            childProcess.emit('close', 0);

            await expect(resultPromise).resolves.toEqual({ code: 0 });
            expect(spawnMock).toHaveBeenCalledWith('tool', args, {
                env: { AUGMENTED: '1' },
            });
            expect(pty.spawn).not.toHaveBeenCalled();
            expect(onOutput).toHaveBeenCalledWith('output\r\n');
        });

        it('uses PTY with default dimensions when not debugging on Windows', async () => {
            Object.defineProperty(process, 'platform', { value: 'win32' });

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
                waitUntilReady: jest.fn().mockResolvedValue(undefined),
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

            await Promise.resolve();

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
            Object.defineProperty(process, 'platform', { value: 'win32' });

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
                waitUntilReady: jest.fn().mockResolvedValue(undefined),
                augmentEnv: jest.fn(() => ({ vars: {} })),
            };
            const processManager = new ProcessManagerImpl(environmentManager as never);
            const onOutput = jest.fn();

            const resultPromise = processManager.spawn('tool', [], { usePty: true, filterOutput: true }, onOutput);

            await Promise.resolve();

            onData?.('\x1b[?90');
            onData?.('01hGenerator output\r\n');
            onExit?.({ exitCode: 0 });

            await expect(resultPromise).resolves.toEqual({ code: 0 });
            expect(onOutput).toHaveBeenCalledTimes(1);
            expect(onOutput).toHaveBeenCalledWith('Generator output\r\n');
        });
    });
});
