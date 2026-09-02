/**
 * Copyright 2023-2026 Arm Limited
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

import { type CancellationToken, type TerminalDimensions } from 'vscode';
import { spawn, SpawnOptions } from 'child_process';
import { createInterface } from 'readline';
import * as inspector from 'inspector';
import * as pty from '@lydell/node-pty';
import { Environment, EnvironmentManager } from '../../desktop/env-manager';
import { TerminalOutputFilter } from '../../utils/terminal-output-filter';

const DEFAULT_PTY_DIMENSIONS: TerminalDimensions = { columns: 80, rows: 24 };

export type ProcessResult = {
    code: number;
    error?: unknown;
}

export type ProcessSpawnOptions = SpawnOptions & {
    /** Execute the process in a pseudoterminal. */
    usePty?: boolean;
    /** Remove terminal control sequences from PTY output when true. */
    filterOutput?: boolean;
}

export const isProcessResult = (r: unknown): r is ProcessResult => typeof (r as ProcessResult).code === 'number';

export interface ProcessManager {
    spawn(
        command: string,
        args: string[],
        options: ProcessSpawnOptions,
        onOutput: (line: string) => void,
        cancellationToken?: CancellationToken,
        dimensions?: TerminalDimensions,
    ): Promise<ProcessResult>;
}

export class ProcessManagerImpl implements ProcessManager {
    constructor(
        private readonly environmentManager: EnvironmentManager,
    ) {}

    // Conpty freezes when debugging on Windows
    // https://github.com/microsoft/node-pty/issues/763
    private readonly debuggingOnWindows = process.platform === 'win32' && inspector.url() !== undefined;

    public spawn(
        command: string,
        args: string[],
        options: ProcessSpawnOptions,
        onOutput: (line: string) => void,
        cancellationToken?: CancellationToken,
        dimensions?: TerminalDimensions,
    ): Promise<ProcessResult> {
        return new Promise((resolve, reject) => {
            if (cancellationToken?.isCancellationRequested) {
                return;
            }

            const { usePty = false, filterOutput, ...spawnOptions } = options;

            // Augment environment
            const augmentedEnv = this.environmentManager.augmentEnv(new Environment(spawnOptions.env)).vars;

            if (usePty || (dimensions && !this.debuggingOnWindows)) {
                const ptyDimensions = dimensions ?? DEFAULT_PTY_DIMENSIONS;
                const outputFilter = filterOutput ? new TerminalOutputFilter() : undefined;
                const ptyProcess = pty.spawn(command, args, {
                    name: 'xterm-256color',
                    cols: ptyDimensions.columns,
                    rows: ptyDimensions.rows,
                    cwd: typeof spawnOptions.cwd === 'string' ? spawnOptions.cwd : undefined,
                    env: augmentedEnv
                });
                ptyProcess.onData((data) => {
                    const output = outputFilter?.write(data) ?? data;
                    if (output.length > 0) {
                        onOutput(output);
                    }
                });
                ptyProcess.onExit(({ exitCode }) => {
                    if (exitCode === 0) {
                        resolve({ code: 0 });
                    } else {
                        reject({ code: exitCode });
                    }
                });
                cancellationToken?.onCancellationRequested(() => {
                    // Send Ctrl+C to pty process
                    ptyProcess.write('\x03');
                    // Give it 500ms to exit gracefully
                    setTimeout(() => {
                        ptyProcess.kill();
                    }, 500);
                });

            } else {

                const childProcess = spawn(command, args, { ...spawnOptions, env: augmentedEnv });

                [childProcess.stdout, childProcess.stderr].forEach(ioStream => {
                    if (ioStream) {
                        const outputReadline = createInterface({ input: ioStream, crlfDelay: Infinity });
                        outputReadline.on('line', (line) => {
                            onOutput(line + '\r\n');
                        });
                    }
                });

                childProcess.on('error', error => {
                    reject({ code: childProcess.exitCode, error: error });
                });

                /*
In Node child processes, 'exit' and' close' events mean different lifecycle points:

'exit'

Emitted when the child process itself has ended.
Gives you exit code and signal.
May happen before all stdout and stderr data has been fully flushed/closed.

'close'

Emitted when the process has ended and all stdio streams are closed.
Also provides code and signal.
This is usually the safer event if you need to be sure all output handling is finished.
Typical ordering:
exit first, then close.

Practical rule:

Use exit when you only care that the process terminated.
Use close when you care about complete I/O completion (most
command-runner cases).

We do care about output,  therefore 'close' is used here.
*/
                childProcess.on('close', code => {
                    if (code === 0) {
                        resolve({ code: 0 });
                    } else {
                        reject({ code });
                    }
                });

                cancellationToken?.onCancellationRequested(() => {
                    if (childProcess.exitCode === null) {
                        childProcess.kill();
                    }
                });
            }
        });
    }
}
