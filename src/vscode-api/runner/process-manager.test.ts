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
    });
});
