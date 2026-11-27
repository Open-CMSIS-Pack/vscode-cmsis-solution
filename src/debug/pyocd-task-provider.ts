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
import fs from 'fs';
import { StringDecoder } from 'string_decoder';
import { pyocdWindowsHost } from './pyocd-windows';
import type { CsolutionApiV3 } from '../../api/csolution-api-v3';

export const PYOCD_TASK_TYPE = 'cmsis-csolution.pyocd';

export interface PyocdTaskDefinition extends vscode.TaskDefinition {
    command?: string;
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
        private readonly onStart?: () => void,
    ) {}

    public open(): void {
        if (this.opened) {
            return;
        }
        this.opened = true;
        this.onStart?.();
        if (this.cancelled) {
            this.finish(130);
            return;
        }
        this.launch(this.definition.command || 'pyocd');
    }

    private launch(command: string): void {
        try {
            const windows = this.platform === 'win32';
            const executable = windows
                ? path.win32.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
                : command;
            this.child = spawn(executable, windows ? [
                '-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand',
                Buffer.from(pyocdWindowsHost, 'utf16le').toString('base64'),
            ] : this.definition.args, {
                cwd: this.definition.options?.cwd,
                env: { ...this.env, ...this.definition.options?.env,
                    ...(windows ? { CMSIS_PYOCD_ARGUMENTS: JSON.stringify(this.definition.args),
                        CMSIS_PYOCD_COMMAND: this.definition.command || '' } : {}) },
                windowsHide: true,
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            for (const stream of [this.child.stdout, this.child.stderr]) {
                const decoder = new StringDecoder('utf8');
                stream?.on('data', (data: Buffer) => this.writeEmitter.fire(decoder.write(data).replace(/\r?\n/g, '\r\n')));
                stream?.on('end', () => this.writeEmitter.fire(decoder.end()));
            }
            const child = this.child;
            this.child.on('error', (error: NodeJS.ErrnoException) => {
                if (this.canFallBack(command, error)) {
                    this.launch('pyocd');
                    return;
                }
                const configured = this.definition.command ? ` (configured command '${this.definition.command}')` : '';
                this.writeEmitter.fire(`pyOCD: executable '${command}'${configured}: ${error.message}\r\n`);
                if (!this.cancelled || !this.child?.pid) {
                    this.finish(1);
                }
            });
            this.child.on('spawn', () => {
                if (!windows && command === 'pyocd' && this.definition.command && this.definition.command !== command) {
                    this.writeEmitter.fire(`Warning: configured executable '${this.definition.command}' was not found; using '${command}'.\r\n`);
                }
            });
            this.child.on('close', code => { if (this.child === child) this.finish(code ?? 1); });
            // A failed control pipe must never become an unhandled EPIPE exception.
            this.child.stdin?.on('error', () => {});
        } catch (error) {
            this.writeEmitter.fire(`pyOCD: ${error}\r\n`);
            this.finish(1);
        }
    }

    private canFallBack(command: string, error: NodeJS.ErrnoException): boolean {
        if (this.platform === 'win32' || error.code !== 'ENOENT') {
            return false;
        }
        if (command === 'pyocd' || this.cancelled) {
            return false;
        }
        // ENOENT can also mean a missing cwd or interpreter. Only retry a
        // missing executable, never an existing program that failed to launch.
        const cwd = this.definition.options?.cwd ?? process.cwd();
        if (!fs.existsSync(cwd)) {
            return false;
        }
        const searchPath = this.definition.options?.env?.PATH ?? this.env.PATH ?? process.env.PATH ?? '';
        const candidates = command.includes('/') ? [path.resolve(cwd, command)]
            : searchPath.split(':').map(directory => path.resolve(cwd, directory, command));
        return !candidates.some(candidate => fs.existsSync(candidate));
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
                // Process exit can precede pipe drainage. Only close completes the task.
                return;
            }
            this.writeEmitter.fire('\r\npyOCD shutdown timed out; forcing termination.\r\n');
            if (this.platform === 'win32' && this.child?.pid) {
                // Use the host environment, never task overrides or executable search.
                // System32 also works under WOW64: redirection selects the system's 32-bit utility.
                const windowsRoot = [process.env.SystemRoot, process.env.windir]
                    .find(root => root !== undefined && /^[a-z]:[\\/]/i.test(root)) ?? 'C:\\Windows';
                const executable = path.win32.join(windowsRoot, 'System32', 'taskkill.exe');
                const killer = spawn(executable, ['/PID', String(this.child.pid), '/T', '/F'], { windowsHide: true });
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

interface TaskCapture {
    result: Promise<CsolutionApiV3.TaskResult>;
    onOutput(message: string): void;
    onComplete(exitCode?: number): void;
    started: boolean;
    completed: boolean;
    execution?: vscode.TaskExecution;
}

interface TaskResultEntry {
    result: Promise<CsolutionApiV3.TaskResult>;
    resolve(result: CsolutionApiV3.TaskResult | PromiseLike<CsolutionApiV3.TaskResult>): void;
    capture?: TaskCapture;
    key: string;
}

// Bound long-running Run output and provider-owned completed history independently.
const OUTPUT_LIMIT = 256 * 1024;
const COMPLETED_LIMIT = 20;
const TRUNCATION_MARKER = '[Earlier pyOCD output truncated]\r\n';

export class PyocdTaskProvider implements vscode.TaskProvider, vscode.Disposable {
    private readonly terminals = new Map<PyocdTerminal, vscode.Task>();
    private readonly endEmitter = new vscode.EventEmitter<{ task: vscode.Task; exitCode: number }>();
    public readonly onDidEndTask = this.endEmitter.event;
    private readonly results = new Map<vscode.TaskExecution, TaskResultEntry>();
    private readonly completed = new Set<vscode.TaskExecution>();
    private readonly evicted = new WeakSet<vscode.TaskExecution>();
    private readonly pendingCaptures = new Map<string, TaskCapture[]>();

    constructor(
        private readonly environment: () => NodeJS.ProcessEnv,
    ) {}

    public activate(context: Pick<vscode.ExtensionContext, 'subscriptions'>): void {
        context.subscriptions.push(this, vscode.tasks.registerTaskProvider(PYOCD_TASK_TYPE, this),
            vscode.tasks.onDidStartTask(event => { this.trackExecution(event.execution); }),
            vscode.tasks.onDidEndTask(event => {
                const entry = this.trackExecution(event.execution);
                // Terminal disposal can precede shutdown. A started capture waits for close.
                if (entry?.capture) {
                    if (!entry.capture.started) entry.capture.onComplete(130);
                } else if (entry) {
                    entry.resolve({ output: '' });
                    this.retainCompleted(event.execution);
                }
            }));
    }

    public getTaskResult(execution: vscode.TaskExecution): Promise<CsolutionApiV3.TaskResult> {
        const entry = this.results.get(execution) ??
            ((vscode.tasks.taskExecutions ?? []).includes(execution) ? this.trackExecution(execution) : undefined);
        return entry?.result ?? Promise.reject(new Error('No captured task result is available for this task execution'));
    }

    private taskKey(task: vscode.Task): string {
        const definition = task.definition as PyocdTaskDefinition;
        const scope = typeof task.scope === 'object' ? task.scope.uri.toString() : task.scope;
        return JSON.stringify([scope, task.name, definition.command || '', definition.args,
            definition.options?.cwd ?? '', Object.entries(definition.options?.env ?? {}).sort(([a], [b]) => a.localeCompare(b))]);
    }

    private trackExecution(execution: vscode.TaskExecution): TaskResultEntry | undefined {
        if (this.evicted.has(execution)) return undefined;
        if (execution.task.definition.type !== PYOCD_TASK_TYPE || !['CMSIS Load', 'CMSIS Run'].includes(execution.task.name)) {
            return undefined;
        }
        let entry = this.results.get(execution);
        if (!entry) {
            let resolve!: TaskResultEntry['resolve'];
            const result = new Promise<CsolutionApiV3.TaskResult>(complete => { resolve = complete; });
            entry = { result, resolve, key: this.taskKey(execution.task) };
            this.results.set(execution, entry);
        }
        if (!entry.capture) {
            const pending = this.pendingCaptures.get(entry.key);
            const capture = pending?.shift();
            if (!pending?.length) this.pendingCaptures.delete(entry.key);
            if (capture) {
                entry.capture = capture;
                capture.execution = execution;
                entry.resolve(capture.result);
                if (capture.completed) this.retainCompleted(execution);
            }
        }
        return entry;
    }

    private retainCompleted(execution: vscode.TaskExecution): void {
        this.completed.add(execution);
        if (this.completed.size > COMPLETED_LIMIT) {
            const oldest = this.completed.values().next().value!;
            this.completed.delete(oldest);
            this.results.delete(oldest);
            this.evicted.add(oldest);
        }
    }

    private createCapture(task: vscode.Task): TaskCapture {
        let output = '';
        let truncated = false;
        let resolve!: (result: CsolutionApiV3.TaskResult) => void;
        const result = new Promise<CsolutionApiV3.TaskResult>(complete => { resolve = complete; });
        const capture: TaskCapture = {
            result, started: false, completed: false,
            onOutput: message => {
                if (capture.completed) return;
                output += message;
                if (output.length > OUTPUT_LIMIT) {
                    output = output.slice(-OUTPUT_LIMIT);
                    // Do not retain half of a UTF-16 surrogate pair at the truncation boundary.
                    if (/^[\uDC00-\uDFFF]/.test(output)) output = output.slice(1);
                    truncated = true;
                }
            },
            onComplete: exitCode => {
                if (capture.completed) return;
                capture.completed = true;
                resolve({ exitCode, output: (truncated ? TRUNCATION_MARKER : '') + output });
                output = '';
                if (capture.execution) this.retainCompleted(capture.execution);
            },
        };
        const key = this.taskKey(task);
        const pending = this.pendingCaptures.get(key) ?? [];
        pending.push(capture);
        this.pendingCaptures.set(key, pending);
        // Either the callback or the start event can arrive first.
        for (const execution of new Set([...this.results.keys(), ...(vscode.tasks.taskExecutions ?? [])])) {
            this.trackExecution(execution);
        }
        return capture;
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
                let capture = ['CMSIS Load', 'CMSIS Run'].includes(resolved.name) ? this.createCapture(resolved) : undefined;
                const terminal = new PyocdTerminal(definition as PyocdTaskDefinition, this.environment(), exitCode => {
                    capture?.onComplete(exitCode);
                    // A retained terminal must not keep an evicted result alive through its callbacks.
                    capture = undefined;
                    this.terminals.delete(terminal);
                    this.endEmitter.fire({ task: resolved, exitCode });
                }, process.platform, () => { if (capture) capture.started = true; });
                terminal.onDidWrite(message => capture?.onOutput(message));
                this.terminals.set(terminal, resolved);
                return terminal;
            }), task.problemMatchers);
        resolved.presentationOptions = { ...task.presentationOptions, close: false };
        resolved.runOptions = task.runOptions;
        resolved.isBackground = task.isBackground;
        resolved.group = task.group;
        return resolved;
    }

    public stopTask(task: vscode.Task): boolean {
        if (task.definition?.type !== PYOCD_TASK_TYPE && task.name !== 'CMSIS Load+Run') {
            return false;
        }
        let stopped = false;
        const scopeId = (scope: vscode.Task['scope']) => typeof scope === 'object' ? scope.uri.toString() : scope;
        for (const [terminal, activeTask] of this.terminals) {
            const matchesName = activeTask.name === task.name ||
                (task.name === 'CMSIS Load+Run' && ['CMSIS Load', 'CMSIS Run'].includes(activeTask.name));
            if (matchesName && scopeId(activeTask.scope) === scopeId(task.scope)) {
                terminal.close();
                stopped = true;
            }
        }
        // Leave the task and compound dependency connected until the cancelled
        // child reports 130. This retains final output and prevents Run after Load.
        return stopped;
    }

    public dispose(): void {
        for (const terminal of this.terminals.keys()) {
            terminal.close();
        }
        this.endEmitter.dispose();
        for (const captures of this.pendingCaptures.values()) {
            for (const capture of captures) if (!capture.started) capture.onComplete(130);
        }
        for (const entry of this.results.values()) {
            if (entry.capture) {
                if (!entry.capture.started) entry.capture.onComplete(130);
            } else {
                entry.resolve({ output: '' });
            }
        }
        this.pendingCaptures.clear();
        this.results.clear();
        this.completed.clear();
    }
}
