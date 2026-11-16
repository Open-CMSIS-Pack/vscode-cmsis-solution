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
import { randomUUID } from 'node:crypto';
import { closeSync, mkdtempSync, openSync, writeSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import type { CsolutionApiV3 } from '../../../api/csolution-api-v3';
import type { BuildTaskDefinition } from './build-task-definition';
import type { BuildTaskProvider } from './build-task-provider';
import type { Runner } from '../../vscode-api/runner/runner';

export class BuildOperation implements CsolutionApiV3.BuildOperation {
    public readonly id = randomUUID();
    public readonly result: Promise<CsolutionApiV3.BuildResult>;
    public taskExecution?: vscode.TaskExecution;
    private readonly output = new vscode.EventEmitter<CsolutionApiV3.BuildOutput>();
    public readonly onOutput = this.output.event;
    private readonly cancellation = new vscode.CancellationTokenSource();
    private readonly logFile!: vscode.Uri;
    private readonly log?: number;
    private sequence = 0;
    private started = false;
    private completed = false;
    private resolve!: (result: CsolutionApiV3.BuildResult) => void;
    private reject!: (error: unknown) => void;
    private readonly abort = () => this.cancel();
    private taskEnd?: vscode.Disposable;

    constructor(
        definition: BuildTaskDefinition,
        provider: BuildTaskProvider,
        private readonly signal?: AbortSignal,
    ) {
        this.result = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        try {
            this.logFile = vscode.Uri.file(path.join(mkdtempSync(path.join(tmpdir(), 'cmsis-build-')), 'build.log'));
            this.log = openSync(this.logFile.fsPath, 'w');
        } catch (error) {
            this.finish(undefined, error);
            return;
        }
        this.signal?.addEventListener('abort', this.abort, { once: true });
        if (this.signal?.aborted) {
            this.cancel();
        }
        // Let the caller subscribe before task creation or synchronous execution failures.
        void Promise.resolve().then(async () => {
            if (this.completed) {
                return;
            }
            try {
                const task = provider.createTask({ ...definition, operationId: this.id }, runner => this.wrapRunner(runner));
                this.taskEnd = vscode.tasks.onDidEndTask(event => {
                    if (event.execution.task.definition.operationId === this.id && !this.started) {
                        this.finish({ status: 'failed', logFile: this.logFile });
                    }
                });
                this.taskExecution = await vscode.tasks.executeTask(task);
                if (this.completed) {
                    this.taskEnd.dispose();
                }
            } catch (error) {
                this.finish(undefined, error);
            }
        });
    }

    public cancel(): void {
        if (!this.completed) {
            this.cancellation.cancel();
            if (!this.started) {
                this.finish({ status: 'cancelled', logFile: this.logFile });
            }
        }
    }

    /** Disposal cannot confirm termination, so interrupted operations reject rather than claim cancellation. */
    public dispose(): void {
        if (!this.completed) {
            this.cancellation.cancel();
            this.finish(undefined, new Error('Build interrupted because the API was disposed'));
        }
    }

    private wrapRunner(runner: Runner): Runner {
        return {
            run: async (definition, onOutput, token, dimensions) => {
                if (this.completed) {
                    return 130;
                }
                this.started = true;
                const subscription = token.onCancellationRequested(() => this.cancellation.cancel());
                if (token.isCancellationRequested) {
                    this.cancellation.cancel();
                }
                let outputError: unknown;
                let skipped = false;
                let cancelledBeforeStart = false;
                try {
                    const exitCode = await runner.run(definition, text => {
                        if (!this.completed && !outputError) {
                            try {
                                if (writeSync(this.log!, text, undefined, 'utf8') !== Buffer.byteLength(text, 'utf8')) {
                                    throw new Error('Incomplete build log write');
                                }
                                this.output.fire({ sequence: ++this.sequence, timestamp: Date.now(), text, stream: 'combined' });
                            } catch (error) {
                                outputError = error;
                                this.cancellation.cancel();
                            }
                        }
                        onOutput(text);
                    }, this.cancellation.token, dimensions, () => { skipped = true; }, () => { cancelledBeforeStart = true; });
                    if (outputError) {
                        throw outputError;
                    }
                    this.finish({
                        status: skipped ? 'skipped' : exitCode === 0 ? 'success' : this.cancellation.token.isCancellationRequested && exitCode === 130 ? 'cancelled' : 'failed',
                        exitCode: !skipped && !cancelledBeforeStart && exitCode >= 0 ? exitCode : undefined,
                        logFile: this.logFile,
                    });
                    return exitCode;
                } catch (error) {
                    this.finish(undefined, error);
                    throw error;
                } finally {
                    subscription.dispose();
                }
            },
        };
    }

    private finish(result?: CsolutionApiV3.BuildResult, error?: unknown): void {
        if (this.completed) {
            return;
        }
        this.completed = true;
        this.signal?.removeEventListener('abort', this.abort);
        this.taskEnd?.dispose();
        this.output.dispose();
        this.cancellation.dispose();
        try {
            if (this.log !== undefined) {
                closeSync(this.log);
            }
        } catch (closeError) {
            error ??= closeError;
        }
        if (error !== undefined) {
            this.reject(error);
        } else {
            this.resolve(result!);
        }
    }
}
