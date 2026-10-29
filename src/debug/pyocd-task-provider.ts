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
import { ChildProcess, spawn } from 'child_process';
import path from 'path';
import { StringDecoder } from 'string_decoder';
import { pyocdWindowsHost } from './pyocd-windows';

export const PYOCD_TASK_TYPE = 'cmsis-csolution.pyocd';

export interface PyocdTaskDefinition extends vscode.TaskDefinition {
    args: string[];
    options?: { cwd?: string; env?: NodeJS.ProcessEnv };
}

export class PyocdTerminal implements vscode.Pseudoterminal {
    private readonly writeEmitter = new vscode.EventEmitter<string>();
    private readonly closeEmitter = new vscode.EventEmitter<number>();
    public readonly onDidWrite = this.writeEmitter.event;
    public readonly onDidClose = this.closeEmitter.event;
    private child?: ChildProcess;
    private cancelled = false;
    private finished = false;
    private opened = false;
    private shutdownTimer?: ReturnType<typeof setTimeout>;

    constructor(
        private readonly definition: PyocdTaskDefinition,
        private readonly env: NodeJS.ProcessEnv,
        private readonly complete: (exitCode: number) => void,
        private readonly platform = process.platform,
    ) {}

    public open(): void {
        if (this.opened) {
            return;
        }
        this.opened = true;
        if (this.cancelled) {
            this.finish(130);
            return;
        }
        try {
            const windows = this.platform === 'win32';
            const executable = windows
                ? path.win32.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
                : 'pyocd';
            this.child = spawn(executable, windows ? [
                '-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand',
                Buffer.from(pyocdWindowsHost, 'utf16le').toString('base64'),
            ] : this.definition.args, {
                cwd: this.definition.options?.cwd,
                env: { ...this.env, ...this.definition.options?.env,
                    ...(windows ? { CMSIS_PYOCD_ARGUMENTS: JSON.stringify(this.definition.args) } : {}) },
                windowsHide: true,
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            for (const stream of [this.child.stdout, this.child.stderr]) {
                const decoder = new StringDecoder('utf8');
                stream?.on('data', (data: Buffer) => this.writeEmitter.fire(decoder.write(data).replace(/\r?\n/g, '\r\n')));
                stream?.on('end', () => this.writeEmitter.fire(decoder.end()));
            }
            this.child.on('error', error => {
                this.writeEmitter.fire(`pyOCD: ${error.message}\r\n`);
                if (!this.cancelled || !this.child?.pid) {
                    this.finish(1);
                }
            });
            this.child.on('close', code => this.finish(code ?? 1));
            // A failed control pipe must never become an unhandled EPIPE exception.
            this.child.stdin?.on('error', () => {});
        } catch (error) {
            this.writeEmitter.fire(`pyOCD: ${error}\r\n`);
            this.finish(1);
        }
    }

    public handleInput(data: string): void {
        if (data.includes('\x03')) {
            this.close();
        }
    }

    public close(): void {
        if (this.cancelled || this.finished) {
            return;
        }
        this.cancelled = true;
        if (!this.child) {
            return; // VS Code may cancel between CustomExecution creation and open.
        }
        this.shutdownTimer = setTimeout(() => {
            if (this.child?.exitCode != null || this.child?.signalCode != null) {
                this.finish(130);
                return;
            }
            this.writeEmitter.fire('\r\npyOCD shutdown timed out; forcing termination.\r\n');
            if (this.platform === 'win32' && this.child?.pid) {
                const killer = spawn('taskkill.exe', ['/PID', String(this.child.pid), '/T', '/F'], { windowsHide: true });
                killer.on('error', error => this.writeEmitter.fire(`pyOCD termination failed: ${error.message}\r\n`));
            } else {
                this.child?.kill('SIGKILL');
            }
        }, 6000);
        if (this.platform === 'win32') {
            this.child.stdin?.write('stop\n');
        } else {
            this.child.kill('SIGINT');
        }
    }

    private finish(code: number): void {
        if (this.finished) {
            return;
        }
        this.finished = true;
        clearTimeout(this.shutdownTimer);
        // pyOCD may catch KeyboardInterrupt and return zero. A cancelled Load must
        // still fail its sequential dependency so that Run cannot start.
        const exitCode = this.cancelled ? 130 : code;
        this.complete(exitCode);
        this.closeEmitter.fire(exitCode);
        this.writeEmitter.dispose();
        this.closeEmitter.dispose();
    }
}

export class PyocdTaskProvider implements vscode.TaskProvider, vscode.Disposable {
    private readonly terminals = new Set<PyocdTerminal>();
    private readonly endEmitter = new vscode.EventEmitter<{ task: vscode.Task; exitCode: number }>();
    public readonly onDidEndTask = this.endEmitter.event;

    constructor(private readonly environment: () => NodeJS.ProcessEnv) {}

    public activate(context: Pick<vscode.ExtensionContext, 'subscriptions'>): void {
        context.subscriptions.push(this, vscode.tasks.registerTaskProvider(PYOCD_TASK_TYPE, this));
    }

    public provideTasks(): vscode.Task[] {
        return []; // Only resolve explicitly generated/configured tasks.
    }

    public resolveTask(task: vscode.Task): vscode.Task | undefined {
        if (!Array.isArray(task.definition.args) || !task.definition.args.every(arg => typeof arg === 'string')) {
            return undefined;
        }
        const resolved = new vscode.Task(task.definition, task.scope ?? vscode.TaskScope.Workspace,
            task.name, task.source, new vscode.CustomExecution(async definition => {
                const terminal = new PyocdTerminal(definition as PyocdTaskDefinition, this.environment(), exitCode => {
                    this.terminals.delete(terminal);
                    this.endEmitter.fire({ task: resolved, exitCode });
                });
                this.terminals.add(terminal);
                return terminal;
            }), task.problemMatchers);
        resolved.presentationOptions = task.presentationOptions;
        resolved.runOptions = task.runOptions;
        resolved.isBackground = task.isBackground;
        resolved.group = task.group;
        return resolved;
    }

    public dispose(): void {
        for (const terminal of this.terminals) {
            terminal.close();
        }
        this.endEmitter.dispose();
    }
}
