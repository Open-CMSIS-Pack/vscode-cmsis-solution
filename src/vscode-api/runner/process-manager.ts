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

export type ProcessResult = {
    code: number;
    error?: unknown;
}

export const isProcessResult = (r: unknown): r is ProcessResult => typeof (r as ProcessResult).code === 'number';

export interface ProcessManager {
    spawn(
        command: string,
        args: string[],
        options: SpawnOptions,
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
        options: SpawnOptions,
        onOutput: (line: string) => void,
        cancellationToken?: CancellationToken,
        dimensions?: TerminalDimensions,
    ): Promise<ProcessResult> {
        return new Promise((resolve, reject) => {
            if (cancellationToken?.isCancellationRequested) {
                return;
            }

            // Augment environment
            const augmentedEnv = this.environmentManager.augmentEnv(new Environment(options.env)).vars;

            if (dimensions && !this.debuggingOnWindows) {
                // terminal dimensions provided, use pty to spawn process preserving terminal behavior
                const ptyProcess = pty.spawn(command, args, {
                    name: 'xterm-256color',
                    cols: dimensions.columns,
                    rows: dimensions.rows,
                    cwd: typeof options.cwd === 'string' ? options.cwd : undefined,
                    env: augmentedEnv
                });
                ptyProcess.onData((data) => { onOutput(data); });
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

                const childProcess = spawn(command, args, { ...options, env: augmentedEnv });

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

                childProcess.on('exit', code => {
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
