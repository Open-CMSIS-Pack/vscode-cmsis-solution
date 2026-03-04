/**
 * Copyright 2025-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';
import { Runner } from './runner';

export interface TerminalTask {
    definition: vscode.TaskDefinition,
    runner: Runner,
    taskName: string,
    runMessage: string,
    completeMessage: string,
    terminationMessage: string,
    dimensions: vscode.TerminalDimensions | undefined;
}

export class TerminalTaskRunner implements vscode.Pseudoterminal {
    private readonly writeEmitter = new vscode.EventEmitter<string>();
    private readonly closeEmitter = new vscode.EventEmitter<number>();
    private cancellationTokenSource?: vscode.CancellationTokenSource;
    private isManuallyTerminated = false;
    private outputBuffer: string[] = [];

    public readonly onDidWrite: vscode.Event<string> = this.writeEmitter.event;
    public readonly onDidClose: vscode.Event<number> = this.closeEmitter.event;

    public constructor(protected terminalTask: TerminalTask) { }

    public async open(initialDimensions: vscode.TerminalDimensions | undefined): Promise<void> {
        this.cancellationTokenSource = new vscode.CancellationTokenSource();
        this.terminalTask.dimensions = initialDimensions;
        this.isManuallyTerminated = false;
        this.outputBuffer = [];

        try {
            await this.terminalTask.runner.run(
                this.terminalTask.definition,
                this.handleTaskOutput.bind(this),
                this.cancellationTokenSource.token,
                this.terminalTask.dimensions,
            );
            if (!this.isManuallyTerminated) {
                this.handleTaskOutput(this.terminalTask.completeMessage);
                this.closeEmitter.fire(0);
            }
        } catch (error) {
            if (this.isManuallyTerminated) {
                // Manual termination is handled in terminateProcess(), don't duplicate
                // The exit code will be fired immediately there
            } else {
                this.handleTaskOutput((error as Error).message);
                this.closeEmitter.fire(1);
            }
        } finally {
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
            this.cancellationTokenSource.cancel();

            // Ensure messages are shown even if no exception is thrown
            setTimeout(() => {
                if (this.isManuallyTerminated) {
                    this.handleTaskOutput(this.terminalTask.terminationMessage!);
                    // Fire exit code immediately to show red trash bin, but terminal stays open for reuse
                    this.closeEmitter.fire(130);
                }
            }, 100); // Small delay to ensure cancellation is processed
        }
    }

    private handleTaskOutput(message: string) {
        this.outputBuffer.push(message.trimEnd());
        this.writeEmitter.fire(message);
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
