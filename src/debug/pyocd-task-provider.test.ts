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

import { EventEmitter } from 'events';
import { PassThrough } from 'stream';
import { ChildProcess, spawn } from 'child_process';
import * as vscode from 'vscode';
import { PYOCD_TASK_TYPE, PyocdTaskProvider, PyocdTerminal } from './pyocd-task-provider';
import { pyocdWindowsHost } from './pyocd-windows';

jest.mock('child_process', () => ({ spawn: jest.fn() }));

function childProcess(pid = 123): ChildProcess {
    return Object.assign(new EventEmitter(), {
        pid, stdout: new PassThrough(), stderr: new PassThrough(), stdin: new PassThrough(), kill: jest.fn(),
    }) as unknown as ChildProcess;
}

describe('managed pyOCD lifecycle', () => {
    let child: ChildProcess;
    let complete: jest.Mock;

    beforeEach(() => {
        jest.useFakeTimers();
        child = childProcess();
        complete = jest.fn();
        jest.mocked(spawn).mockReset().mockReturnValue(child);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const definition = { type: PYOCD_TASK_TYPE, args: ['load', '--cbuild-run', '/project with spaces/app.cbuild-run.yml'], options: { cwd: '/project' } };

    it('preserves arguments, environment, output and successful completion', () => {
        const terminal = new PyocdTerminal(definition, { PATH: '/tools' }, complete, 'linux');
        const write = jest.fn();
        const close = jest.fn();
        terminal.onDidWrite(write);
        terminal.onDidClose(close);
        terminal.open();
        expect(spawn).toHaveBeenCalledWith('pyocd', definition.args, expect.objectContaining({ cwd: '/project', env: { PATH: '/tools' } }));
        child.stdout!.emit('data', Buffer.from('loaded\n'));
        child.stderr!.emit('data', Buffer.from('warning\n'));
        expect(write.mock.calls).toEqual([['loaded\r\n'], ['warning\r\n']]);
        child.emit('close', 0);
        expect(complete).toHaveBeenCalledWith(0);
        expect(close).toHaveBeenCalledWith(0);
        expect(jest.getTimerCount()).toBe(0);
    });

    it.each(['linux', 'darwin'] as const)('uses SIGINT on %s and reports cancellation even if pyOCD returns zero', platform => {
        const terminal = new PyocdTerminal(definition, {}, complete, platform);
        terminal.open();
        terminal.close();
        terminal.close();
        expect(child.kill).toHaveBeenCalledTimes(1);
        expect(child.kill).toHaveBeenCalledWith('SIGINT');
        expect(complete).not.toHaveBeenCalled();
        child.emit('close', 0);
        expect(complete).toHaveBeenCalledWith(130);
        jest.runAllTimers();
        expect(child.kill).toHaveBeenCalledTimes(1);
    });

    it('sends Windows cancellation through the private control pipe, never Node SIGINT', () => {
        const terminal = new PyocdTerminal(definition, {}, complete, 'win32');
        const write = jest.spyOn(child.stdin!, 'write');
        terminal.open();
        expect(spawn).toHaveBeenCalledWith(expect.stringMatching(/powershell.exe$/), [
            '-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand',
            Buffer.from(pyocdWindowsHost, 'utf16le').toString('base64'),
        ], expect.objectContaining({ windowsHide: true, env: { CMSIS_PYOCD_ARGUMENTS: JSON.stringify(definition.args) } }));
        terminal.handleInput('\x03');
        expect(write).toHaveBeenCalledWith('stop\n');
        expect(child.kill).not.toHaveBeenCalled();
        child.emit('close', 0);
        expect(complete).toHaveBeenCalledWith(130);
    });

    it.each(['linux', 'win32'] as const)('forces only the owned process after the %s shutdown timeout', platform => {
        const terminal = new PyocdTerminal(definition, {}, complete, platform);
        terminal.open();
        terminal.close();
        jest.advanceTimersByTime(6000);
        if (platform === 'win32') {
            expect(spawn).toHaveBeenLastCalledWith('taskkill.exe', ['/PID', '123', '/T', '/F'], { windowsHide: true });
        } else {
            expect(child.kill).toHaveBeenLastCalledWith('SIGKILL');
        }
        child.emit('close', null);
        expect(complete).toHaveBeenCalledWith(130);
    });

    it('does not launch when cancelled before open', () => {
        const terminal = new PyocdTerminal(definition, {}, complete);
        terminal.close();
        terminal.open();
        expect(spawn).not.toHaveBeenCalled();
        expect(complete).toHaveBeenCalledWith(130);
    });

    it('retains the forced fallback if graceful signal delivery fails', () => {
        const terminal = new PyocdTerminal(definition, {}, complete, 'linux');
        terminal.open();
        terminal.close();
        child.emit('error', new Error('signal failed'));
        expect(complete).not.toHaveBeenCalled();
        jest.advanceTimersByTime(6000);
        expect(child.kill).toHaveBeenLastCalledWith('SIGKILL');
        child.emit('close', null);
        expect(complete).toHaveBeenCalledWith(130);
    });

    it('completes exactly once after a launch failure', () => {
        const terminal = new PyocdTerminal(definition, {}, complete);
        terminal.open();
        child.emit('error', new Error('ENOENT'));
        child.emit('close', -2);
        expect(complete.mock.calls).toEqual([[1]]);
    });

    it('keeps concurrent processes independent', () => {
        const other = childProcess(456);
        jest.mocked(spawn).mockReturnValueOnce(child).mockReturnValueOnce(other);
        const first = new PyocdTerminal(definition, {}, complete, 'linux');
        const second = new PyocdTerminal(definition, {}, jest.fn(), 'linux');
        first.open();
        second.open();
        first.close();
        expect(other.kill).not.toHaveBeenCalled();
        child.emit('close', 0);
        other.emit('close', 0);
    });

    it('resolves configured tasks and publishes completion before terminal close', async () => {
        const provider = new PyocdTaskProvider(() => ({ PATH: '/tools' }));
        const task = new vscode.Task(definition, vscode.TaskScope.Workspace, 'CMSIS Load', 'Workspace');
        task.presentationOptions = { reveal: vscode.TaskRevealKind.Always };
        const resolved = provider.resolveTask(task)!;
        expect(resolved.definition).toBe(task.definition);
        expect(resolved.presentationOptions).toEqual({ ...task.presentationOptions, close: false });
        // The VS Code mock exposes the callback at the CustomExecution boundary.
        const execution = resolved.execution as unknown as { callback: (definition: vscode.TaskDefinition) => Promise<PyocdTerminal> };
        const terminal = await execution.callback(definition);
        const events: string[] = [];
        provider.onDidEndTask(event => {
            expect(event).toEqual({ task: resolved, exitCode: 130 });
            events.push('complete');
        });
        terminal.onDidClose(() => events.push('close'));
        terminal.open();
        terminal.close();
        if (process.platform === 'win32') {
            expect(child.kill).not.toHaveBeenCalled();
        } else {
            expect(child.kill).toHaveBeenCalledWith('SIGINT');
        }
        child.emit('close', 0);
        expect(events).toEqual(['complete', 'close']);
        provider.dispose();
    });

    it('retains shutdown output after VS Code disconnects the task terminal', async () => {
        const output = { append: jest.fn(), appendLine: jest.fn() };
        const channels = { getOrCreate: jest.fn().mockReturnValue(output) };
        const provider = new PyocdTaskProvider(() => ({}), channels);
        const task = new vscode.Task(definition, vscode.TaskScope.Workspace, 'CMSIS Run', 'Workspace');
        const resolved = provider.resolveTask(task)!;
        const execution = resolved.execution as unknown as { callback: (definition: vscode.TaskDefinition) => Promise<PyocdTerminal> };
        const terminal = await execution.callback(definition);
        // No VS Code terminal write listener remains when its UI is closed.
        terminal.open();
        terminal.close();
        child.stderr!.emit('data', Buffer.from('KeyboardInterrupt received; shutting down GDB servers\n'));
        child.emit('close', 0);
        expect(channels.getOrCreate).toHaveBeenCalledWith('CMSIS pyOCD');
        expect(output.append).toHaveBeenCalledWith('\r\npyOCD: requesting graceful shutdown.\r\n');
        expect(output.append).toHaveBeenCalledWith('KeyboardInterrupt received; shutting down GDB servers\r\n');
        expect(output.appendLine).toHaveBeenLastCalledWith('[CMSIS Run] pyOCD task finished (exit code 130).');
        provider.dispose();
    });

    it.each(['CMSIS Load', 'CMSIS Run'])('stops %s through its compound task while retaining terminal output', async name => {
        const provider = new PyocdTaskProvider(() => ({}));
        const scope = { uri: vscode.Uri.file('/project') } as vscode.WorkspaceFolder;
        const task = new vscode.Task(definition, scope, name, 'Workspace');
        task.presentationOptions = { close: true };
        const resolved = provider.resolveTask(task)!;
        expect(resolved.presentationOptions.close).toBe(false);
        const execution = resolved.execution as unknown as { callback: (definition: vscode.TaskDefinition) => Promise<PyocdTerminal> };
        const terminal = await execution.callback(definition);
        const write = jest.fn();
        const close = jest.fn();
        terminal.onDidWrite(write);
        terminal.onDidClose(close);
        terminal.open();
        const compound = new vscode.Task({ type: 'shell' }, scope, 'CMSIS Load+Run', 'Workspace');
        const otherScope = new vscode.Task(definition, { uri: vscode.Uri.file('/other') } as vscode.WorkspaceFolder, name, 'Workspace');
        expect(provider.stopTask(otherScope)).toBe(false);
        expect(provider.stopTask(compound)).toBe(true);
        expect(close).not.toHaveBeenCalled();
        child.stderr!.emit('data', Buffer.from('GDB server on port 3333 stopped\n'));
        expect(write).toHaveBeenCalledWith('GDB server on port 3333 stopped\r\n');
        child.emit('close', 0);
        expect(write).toHaveBeenLastCalledWith('\r\npyOCD task finished (exit code 130).\r\n');
        expect(close).toHaveBeenCalledWith(130);
        expect(provider.stopTask(compound)).toBe(false);
        provider.dispose();
    });
});
