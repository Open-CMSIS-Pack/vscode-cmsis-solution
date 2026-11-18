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

import * as vscode from 'vscode';
import { Runner } from './runner';

export interface TaskOutputCapture {
    onStart?(): void;
    onOutput(message: string): void;
    onComplete(exitCode?: number): void;
}

export interface TerminalTask {
    definition: vscode.TaskDefinition,
    runner: Runner,
    taskName: string,
    runMessage: string,
    completeMessage: string,
    terminationMessage: string,
    dimensions: vscode.TerminalDimensions | undefined;
    capture?: TaskOutputCapture;
}

export class TerminalTaskRunner implements vscode.Pseudoterminal {
    private readonly writeEmitter = new vscode.EventEmitter<string>();
    private readonly closeEmitter = new vscode.EventEmitter<number>();
    private cancellationTokenSource?: vscode.CancellationTokenSource;
    private isManuallyTerminated = false;
    private processExitCode?: number;
    private termination?: Promise<void>;
    private outputBuffer: string[] = [];

    public readonly onDidWrite: vscode.Event<string> = this.writeEmitter.event;
    public readonly onDidClose: vscode.Event<number> = this.closeEmitter.event;

    public constructor(protected terminalTask: TerminalTask) { }

    public async open(initialDimensions: vscode.TerminalDimensions | undefined): Promise<void> {
        this.cancellationTokenSource = new vscode.CancellationTokenSource();
        this.terminalTask.dimensions = initialDimensions;
        this.isManuallyTerminated = false;
        this.processExitCode = undefined;
        this.termination = undefined;
        this.outputBuffer = [];
        let skipped = false;
        this.terminalTask.capture?.onStart?.();

        try {
            const exitCode = await this.terminalTask.runner.run(
                this.terminalTask.definition,
                this.handleTaskOutput.bind(this),
                this.cancellationTokenSource.token,
                this.terminalTask.dimensions,
                ...(this.terminalTask.capture ? [() => { skipped = true; }] : []),
            );
            this.processExitCode = exitCode;
            if (!this.isManuallyTerminated) {
                if (exitCode === 0) {
                    this.handleTaskOutput(this.terminalTask.completeMessage);
                }
                this.completeCapture(skipped ||
                    (exitCode === 0 && this.cancellationTokenSource.token.isCancellationRequested) ? undefined : exitCode);
                this.closeEmitter.fire(exitCode >= 0 ? exitCode : 1);
            }
        } catch (error) {
            if (this.isManuallyTerminated) {
                // Manual termination is handled in terminateProcess(), don't duplicate
                // The exit code will be fired immediately there
            } else {
                this.handleTaskOutput((error as Error).message);
                this.completeCapture();
                this.closeEmitter.fire(1);
            }
        } finally {
            if (this.isManuallyTerminated) {
                await this.termination;
                this.completeCapture(skipped || this.processExitCode === 0 ? undefined : this.processExitCode);
            }
            this.cancellationTokenSource?.dispose();
            this.cancellationTokenSource = undefined;
        }
    }

    public close(): void {
        // Cancel the running process when terminal is closed
        if (this.cancellationTokenSource && !this.cancellationTokenSource.token.isCancellationRequested) {
            this.cancellationTokenSource.cancel();
        }
    }

    /**
     * Gracefully terminates the running task process and displays a termination message.
     *
     * This method provides a controlled way to stop a running task while keeping the terminal
     * open for user review.
     */
    public terminateProcess(): void {
        if (this.cancellationTokenSource && !this.cancellationTokenSource.token.isCancellationRequested) {
            this.isManuallyTerminated = true;
            // Ensure messages are shown even if no exception is thrown
            this.termination = new Promise(resolve => {
                setTimeout(() => {
                    if (this.isManuallyTerminated) {
                        this.handleTaskOutput(this.terminalTask.terminationMessage!);
                        // Preserve the existing terminal UI; result capture waits for the runner.
                        this.closeEmitter.fire(130);
                    }
                    resolve();
                }, 100);
            });
            this.cancellationTokenSource.cancel();
        }
    }

    private handleTaskOutput(message: string) {
        this.outputBuffer.push(message.trimEnd());
        this.terminalTask.capture?.onOutput(message);
        this.writeEmitter.fire(message);
    }

    private completeCapture(exitCode?: number): void {
        const capture = this.terminalTask.capture;
        this.terminalTask.capture = undefined;
        capture?.onComplete(exitCode);
    }

    public getOutputBuffer(): string[] {
        const buffer = this.outputBuffer.slice();
        this.outputBuffer = [];
        return buffer;
    }

    public setDimensions(dimensions: vscode.TerminalDimensions): void {
        // vscode itself calls setDimensions internally when the terminal size changes
        this.terminalTask.dimensions = dimensions;
    }
}
