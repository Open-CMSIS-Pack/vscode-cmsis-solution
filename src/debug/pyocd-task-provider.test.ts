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
import path from 'path';
import fs from 'fs';
import { ChildProcess, spawn } from 'child_process';
import * as vscode from 'vscode';
import { PYOCD_TASK_TYPE, PyocdTaskProvider, PyocdTerminal } from './pyocd-task-provider';
import { pyocdWindowsHost } from './pyocd-windows';
import { TestDataHandler } from '../__test__/test-data';
import type { CsolutionApiV3 } from '../../api/csolution-api-v3';

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
        jest.restoreAllMocks();
    });

    const definition = { type: PYOCD_TASK_TYPE, args: ['load', '--cbuild-run', '/project with spaces/app.cbuild-run.yml'], options: { cwd: '/project' } };

    it.each([undefined, '', 'pyocd', 'custom-pyocd', '/opt/tools/pyocd'])('launches Unix command %j separately from arguments', command => {
        const terminal = new PyocdTerminal({ ...definition, command }, {}, complete, 'linux');
        terminal.open();
        expect(spawn).toHaveBeenCalledWith(command || 'pyocd', definition.args, expect.any(Object));
        child.emit('close', 0);
    });

    it('falls back only for a missing command and ignores the replaced child close', () => {
        const fallback = childProcess(456);
        jest.mocked(spawn).mockReturnValueOnce(child).mockReturnValueOnce(fallback);
        const terminal = new PyocdTerminal({ ...definition, command: 'missing-custom-pyocd', options: {} }, {}, complete, 'linux');
        const write = jest.fn();
        terminal.onDidWrite(write);
        terminal.open();
        child.emit('error', Object.assign(new Error('not found'), { code: 'ENOENT' }));
        child.emit('close', -2);
        expect(complete).not.toHaveBeenCalled();
        fallback.emit('spawn');
        expect(write).toHaveBeenCalledWith("Warning: configured executable 'missing-custom-pyocd' was not found; using 'pyocd'.\r\n");
        fallback.emit('error', Object.assign(new Error('not found'), { code: 'ENOENT' }));
        expect(complete).toHaveBeenCalledWith(1);
        expect(write).toHaveBeenLastCalledWith(expect.stringContaining("configured command 'missing-custom-pyocd'"));
        expect(spawn).toHaveBeenCalledTimes(2);
    });

    it.each(['EACCES', 'EINVAL', 'ENOENT'])('does not retry an existing executable after %s', code => {
        const terminal = new PyocdTerminal({ ...definition, command: process.execPath, options: {} }, {}, complete, 'linux');
        terminal.open();
        child.emit('error', Object.assign(new Error('launch failed'), { code }));
        expect(spawn).toHaveBeenCalledTimes(1);
        expect(complete).toHaveBeenCalledWith(1);
    });

    it('completes successfully when the default executable replaces a missing command', () => {
        const fallback = childProcess(456);
        jest.mocked(spawn).mockReturnValueOnce(child).mockReturnValueOnce(fallback);
        const terminal = new PyocdTerminal({ ...definition, command: 'missing-custom-pyocd', options: {} }, {}, complete, 'darwin');
        terminal.open();
        child.emit('error', Object.assign(new Error('not found'), { code: 'ENOENT' }));
        child.emit('close', -2);
        fallback.emit('spawn');
        fallback.emit('close', 0);
        expect(complete.mock.calls).toEqual([[0]]);
    });

    it('publishes a failed task and nonzero terminal exit to block sequential dependencies', async () => {
        const provider = new PyocdTaskProvider(() => ({}));
        const task = new vscode.Task({ ...definition, command: 'missing-command' }, vscode.TaskScope.Workspace, 'CMSIS Load', 'Workspace');
        const resolved = provider.resolveTask(task)!;
        const execution = resolved.execution as unknown as { callback: (definition: vscode.TaskDefinition) => Promise<PyocdTerminal> };
        const terminal = await execution.callback(task.definition);
        const end = jest.fn();
        const close = jest.fn();
        provider.onDidEndTask(end);
        terminal.onDidClose(close);
        terminal.open();
        // The Windows host reports resolution failures through its existing exit path.
        child.emit('close', 1);
        expect(end).toHaveBeenCalledWith({ task: resolved, exitCode: 1 });
        expect(close).toHaveBeenCalledWith(1);
        expect(provider.stopTask(resolved)).toBe(false);
        provider.dispose();
    });

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

    it('waits for stream closure when the shutdown timer observes process exit', () => {
        const terminal = new PyocdTerminal(definition, {}, complete, 'linux');
        const write = jest.fn();
        const close = jest.fn();
        terminal.onDidWrite(write);
        terminal.onDidClose(close);
        terminal.open();
        terminal.close();
        Object.assign(child, { exitCode: 0 });
        child.emit('exit', 0);
        jest.advanceTimersByTime(6000);
        expect(complete).not.toHaveBeenCalled();
        expect(close).not.toHaveBeenCalled();
        child.stderr!.emit('data', Buffer.from('final shutdown diagnostic\n'));
        child.emit('close', 0);
        expect(write).toHaveBeenCalledWith('final shutdown diagnostic\r\n');
        expect(complete.mock.calls).toEqual([[130]]);
        expect(close).toHaveBeenCalledWith(130);
        expect(jest.getTimerCount()).toBe(0);
    });

    it('sends Windows cancellation through the private control pipe, never Node SIGINT', () => {
        const terminal = new PyocdTerminal(definition, {}, complete, 'win32');
        const write = jest.spyOn(child.stdin!, 'write');
        terminal.open();
        expect(spawn).toHaveBeenCalledWith(expect.stringMatching(/powershell.exe$/), [
            '-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand',
            Buffer.from(pyocdWindowsHost, 'utf16le').toString('base64'),
        ], expect.objectContaining({ windowsHide: true, env: { CMSIS_PYOCD_COMMAND: '', CMSIS_PYOCD_ARGUMENTS: JSON.stringify(definition.args) } }));
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
            expect(spawn).toHaveBeenLastCalledWith(
                expect.stringMatching(/^[a-z]:[\\/].*[\\/]System32[\\/]taskkill\.exe$/i),
                ['/PID', '123', '/T', '/F'], { windowsHide: true });
        } else {
            expect(child.kill).toHaveBeenLastCalledWith('SIGKILL');
        }
        child.emit('close', null);
        expect(complete).toHaveBeenCalledWith(130);
    });

    it.each([
        ['D:\\Windows', 'E:\\Windows', 'D:\\Windows'],
        [undefined, 'E:\\Windows', 'E:\\Windows'],
        ['relative', 'E:\\Windows', 'E:\\Windows'],
        ['C:relative', '\\Windows', 'C:\\Windows'],
        [undefined, undefined, 'C:\\Windows'],
    ])('resolves the system utility with SystemRoot=%s and windir=%s', (SystemRoot, windir, expected) => {
        jest.replaceProperty(process, 'env', { ...process.env, SystemRoot, windir });
        const terminal = new PyocdTerminal(definition, {}, complete, 'win32');
        terminal.open();
        terminal.close();
        jest.advanceTimersByTime(5999);
        expect(spawn).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(1);
        expect(spawn).toHaveBeenLastCalledWith(path.win32.join(expected!, 'System32', 'taskkill.exe'),
            ['/PID', '123', '/T', '/F'], { windowsHide: true });
        child.emit('close', null);
    });

    it('bypasses an attacker-controlled taskkill in the host search path and task environment', () => {
        const attacker = 'C:\\attacker';
        jest.replaceProperty(process, 'env', {
            ...process.env, SystemRoot: 'D:\\Windows', PATH: attacker,
            PROCESSOR_ARCHITEW6432: 'AMD64',
        });
        const terminal = new PyocdTerminal({ ...definition, options: {
            cwd: attacker, env: { SystemRoot: attacker, windir: attacker, PATH: attacker },
        } }, { PATH: attacker }, complete, 'win32');
        terminal.open();
        terminal.close();
        jest.advanceTimersByTime(6000);
        // An absolute filename bypasses lookup entirely, even with a hostile PATH/cwd.
        const executable = jest.mocked(spawn).mock.calls[1][0];
        expect(executable).toBe('D:\\Windows\\System32\\taskkill.exe');
        expect(path.win32.isAbsolute(executable)).toBe(true);
        expect(executable).not.toBe(path.win32.join(attacker, 'taskkill.exe'));
        child.emit('close', null);
    });

    (process.platform === 'win32' ? it : it.skip)('does not execute a decoy taskkill.exe from PATH or the working directory', () => {
        const data = new TestDataHandler();
        try {
            // Node rejects /?, whereas the legitimate taskkill utility prints help successfully.
            fs.copyFileSync(process.execPath, path.join(data.tmpDir, 'taskkill.exe'));
            jest.replaceProperty(process, 'env', { ...process.env, PATH: data.tmpDir });
            const terminal = new PyocdTerminal(definition, {}, complete, 'win32');
            terminal.open();
            terminal.close();
            jest.advanceTimersByTime(6000);
            const executable = jest.mocked(spawn).mock.calls[1][0];
            const { spawnSync } = jest.requireActual<typeof import('child_process')>('child_process');
            // Exercise the selected executable safely, without terminating any real process.
            const result = spawnSync(executable, ['/?'], {
                cwd: data.tmpDir, env: process.env, windowsHide: true, encoding: 'utf8', timeout: 5000,
            });
            expect(result.error).toBeUndefined();
            expect(result.status).toBe(0);
            expect(result.stdout).toMatch(/TASKKILL/i);
            child.emit('close', null);
        } finally {
            data.dispose();
        }
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
        const write = jest.fn();
        terminal.onDidWrite(write);
        terminal.open();
        child.emit('error', new Error('ENOENT'));
        expect(write.mock.calls).toEqual([["pyOCD: executable 'pyocd': ENOENT\r\n"]]);
        child.emit('close', -2);
        expect(complete.mock.calls).toEqual([[1]]);
    });

    it('reports synchronous launch failures in the terminal', () => {
        jest.mocked(spawn).mockImplementationOnce(() => { throw new Error('spawn failed'); });
        const terminal = new PyocdTerminal(definition, {}, complete);
        const write = jest.fn();
        terminal.onDidWrite(write);
        terminal.open();
        expect(write.mock.calls).toEqual([['pyOCD: Error: spawn failed\r\n']]);
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

    it('forwards Windows helper launch failures to the task terminal', () => {
        const terminal = new PyocdTerminal(definition, {}, complete, 'win32');
        const write = jest.fn();
        terminal.onDidWrite(write);
        terminal.open();
        child.stderr!.emit('data', Buffer.from('pyOCD: PyocdConsoleHost.Run: The system cannot find the file specified.\n'));
        child.emit('close', 1);
        expect(write.mock.calls).toEqual([['pyOCD: PyocdConsoleHost.Run: The system cannot find the file specified.\r\n']]);
        expect(complete).toHaveBeenCalledWith(1);
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
        expect(write.mock.calls).toEqual([['GDB server on port 3333 stopped\r\n']]);
        expect(close).toHaveBeenCalledWith(130);
        expect(provider.stopTask(compound)).toBe(false);
        provider.dispose();
    });
});

describe('managed pyOCD task results', () => {
    let provider: PyocdTaskProvider;
    let start: vscode.EventEmitter<vscode.TaskStartEvent>;
    let end: vscode.EventEmitter<vscode.TaskEndEvent>;
    let active: vscode.TaskExecution[];
    let subscriptions: vscode.Disposable[];
    let originalTasks: typeof vscode.tasks;
    const definition = { type: PYOCD_TASK_TYPE, args: ['load'], options: { cwd: '/project' } };

    async function createTask(name = 'CMSIS Load', startFirst = false, taskDefinition = definition) {
        const task = provider.resolveTask(new vscode.Task(taskDefinition, vscode.TaskScope.Workspace, name, 'Workspace'))!;
        const child = childProcess();
        jest.mocked(spawn).mockReturnValueOnce(child);
        const execution = { task, terminate: jest.fn() };
        active.push(execution);
        if (startFirst) start.fire({ execution });
        const callback = (task.execution as unknown as {
            callback: (definition: vscode.TaskDefinition) => Promise<PyocdTerminal>;
        }).callback;
        const terminal = await callback(taskDefinition);
        if (!startFirst) start.fire({ execution });
        return { execution, terminal, child };
    }

    beforeEach(() => {
        jest.useFakeTimers();
        jest.mocked(spawn).mockReset();
        start = new vscode.EventEmitter();
        end = new vscode.EventEmitter();
        active = [];
        subscriptions = [];
        originalTasks = { ...vscode.tasks };
        Object.assign(vscode.tasks, {
            taskExecutions: active, onDidStartTask: start.event, onDidEndTask: end.event,
            registerTaskProvider: jest.fn(() => ({ dispose: jest.fn() })),
        });
        provider = new PyocdTaskProvider(() => ({}));
        provider.activate({ subscriptions });
    });

    afterEach(() => {
        subscriptions.forEach(subscription => subscription.dispose());
        for (const key of Object.keys(vscode.tasks)) {
            if (!(key in originalTasks)) Reflect.deleteProperty(vscode.tasks, key);
        }
        Object.assign(vscode.tasks, originalTasks);
        start.dispose();
        end.dispose();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it.each([
        [0, 'loaded\n', ''],
        [1, '', 'probe failed\n'],
        [0, '', 'warning: target mismatch\n'],
    ])('captures completion %s, stdout %j and stderr %j', async (exitCode, stdout, stderr) => {
        const { execution, terminal, child } = await createTask();
        const result = provider.getTaskResult(execution);
        let settled = false;
        void result.then(() => { settled = true; });
        terminal.open();
        child.stdout!.emit('data', Buffer.from(stdout));
        child.stderr!.emit('data', Buffer.from(stderr));
        await Promise.resolve();
        expect(settled).toBe(false);
        child.emit('close', exitCode);
        const expected = { exitCode, output: (stdout + stderr).replace(/\n/g, '\r\n') };
        await expect(result).resolves.toEqual(expected);
        expect(provider.getTaskResult(execution)).toBe(result);
        await expect(provider.getTaskResult(execution)).resolves.toEqual(expected);
    });

    it('captures interleaved output after terminal listener disposal and flushes split UTF-8', async () => {
        const { execution, terminal, child } = await createTask();
        const listener = terminal.onDidWrite(jest.fn());
        terminal.open();
        child.stdout!.emit('data', Buffer.from('stdout '));
        listener.dispose();
        const encoded = Buffer.from('€');
        child.stdout!.emit('data', encoded.subarray(0, 1));
        child.stderr!.emit('data', Buffer.from('stderr '));
        child.stdout!.emit('data', encoded.subarray(1));
        child.stdout!.emit('data', Buffer.from([0xe2]));
        child.stdout!.emit('end');
        child.stderr!.emit('end');
        child.emit('close', 0);
        await expect(provider.getTaskResult(execution)).resolves.toEqual({ exitCode: 0, output: 'stdout stderr €�' });
    });

    it.each([0, 130])('waits for trailing output after process exit (child code %s)', async code => {
        const { execution, terminal, child } = await createTask();
        const result = provider.getTaskResult(execution);
        let settled = false;
        void result.then(() => { settled = true; });
        terminal.open();
        expect(provider.stopTask(execution.task)).toBe(true);
        // Simulate task UI detachment before pyOCD has finished shutting down.
        end.fire({ execution });
        Object.assign(child, { exitCode: code });
        child.emit('exit', code);
        jest.advanceTimersByTime(6000);
        await Promise.resolve();
        expect(settled).toBe(false);
        child.stderr!.emit('data', Buffer.from('shutdown complete\n'));
        child.stderr!.emit('end');
        child.stdout!.emit('end');
        child.emit('close', code);
        await expect(result).resolves.toEqual({ exitCode: 130, output: 'shutdown complete\r\n' });
        expect(jest.getTimerCount()).toBe(0);
    });

    it('retains received output and extension diagnostics during forced termination', async () => {
        const { execution, terminal, child } = await createTask('CMSIS Run');
        terminal.open();
        child.stdout!.emit('data', Buffer.from('running\n'));
        provider.stopTask(execution.task);
        const killer = childProcess(456);
        jest.mocked(spawn).mockReturnValueOnce(killer);
        jest.advanceTimersByTime(6000);
        child.stderr!.emit('data', Buffer.from('received before close\n'));
        child.emit('close', null);
        await expect(provider.getTaskResult(execution)).resolves.toEqual({
            exitCode: 130,
            output: 'running\r\n\r\npyOCD shutdown timed out; forcing termination.\r\nreceived before close\r\n',
        });
    });

    it('captures startup exceptions before publishing provider completion', async () => {
        const { execution, terminal } = await createTask();
        jest.mocked(spawn).mockReset().mockImplementation(() => { throw new Error('spawn failed'); });
        const seen: Array<Promise<CsolutionApiV3.TaskResult>> = [];
        provider.onDidEndTask(() => seen.push(provider.getTaskResult(execution)));
        terminal.open();
        await expect(seen[0]).resolves.toEqual({ exitCode: 1, output: 'pyOCD: Error: spawn failed\r\n' });
    });

    it('captures helper errors received on stderr', async () => {
        const { execution, terminal, child } = await createTask();
        terminal.open();
        child.stderr!.emit('data', Buffer.from('pyOCD: PyocdConsoleHost.Run: launch failed\n'));
        child.emit('close', 1);
        await expect(provider.getTaskResult(execution)).resolves.toEqual({
            exitCode: 1, output: 'pyOCD: PyocdConsoleHost.Run: launch failed\r\n',
        });
    });

    it('bounds retained output while forwarding every character to the terminal', async () => {
        const { execution, terminal, child } = await createTask('CMSIS Run');
        const write = jest.fn();
        terminal.onDidWrite(write);
        terminal.open();
        const limit = 256 * 1024;
        child.stdout!.emit('data', Buffer.from('x'.repeat(limit)));
        child.stderr!.emit('data', Buffer.from('final warning'));
        child.emit('close', 0);
        await expect(provider.getTaskResult(execution)).resolves.toEqual({
            exitCode: 0, output: '[Earlier pyOCD output truncated]\r\n' + 'x'.repeat(limit - 13) + 'final warning',
        });
        expect(write.mock.calls.flat().join('')).toBe('x'.repeat(limit) + 'final warning');
    });

    it('trims an oversized chunk without retaining half a surrogate pair', async () => {
        const { execution, terminal, child } = await createTask();
        terminal.open();
        child.stdout!.emit('data', Buffer.from('discard😀' + 'x'.repeat(256 * 1024 - 1)));
        child.emit('close', 0);
        await expect(provider.getTaskResult(execution)).resolves.toEqual({
            exitCode: 0, output: '[Earlier pyOCD output truncated]\r\n' + 'x'.repeat(256 * 1024 - 1),
        });
    });

    it.each([false, true])('isolates concurrent and repeated identical tasks (start first: %s)', async startFirst => {
        const first = await createTask('CMSIS Load', startFirst);
        first.terminal.open();
        const second = await createTask('CMSIS Load', startFirst);
        second.terminal.open();
        first.child.stdout!.emit('data', Buffer.from('first'));
        second.child.stdout!.emit('data', Buffer.from('second'));
        second.child.emit('close', 7);
        first.child.emit('close', 0);
        const third = await createTask('CMSIS Load', startFirst);
        third.terminal.open();
        third.child.emit('close', 0);
        await expect(provider.getTaskResult(first.execution)).resolves.toEqual({ exitCode: 0, output: 'first' });
        await expect(provider.getTaskResult(second.execution)).resolves.toEqual({ exitCode: 7, output: 'second' });
        await expect(provider.getTaskResult(third.execution)).resolves.toEqual({ exitCode: 0, output: '' });
    });

    it('allows lookup before the custom execution callback and start event', async () => {
        const task = provider.resolveTask(new vscode.Task(definition, vscode.TaskScope.Workspace, 'CMSIS Load', 'Workspace'))!;
        const execution = { task, terminate: jest.fn() };
        active.push(execution);
        const result = provider.getTaskResult(execution);
        const child = childProcess();
        jest.mocked(spawn).mockReturnValueOnce(child);
        const callback = (task.execution as unknown as { callback: (definition: vscode.TaskDefinition) => Promise<PyocdTerminal> }).callback;
        const terminal = await callback(definition);
        start.fire({ execution });
        terminal.open();
        child.stdout!.emit('data', Buffer.from('early lookup'));
        child.emit('close', 0);
        await expect(result).resolves.toEqual({ exitCode: 0, output: 'early lookup' });
    });

    it('settles cancellation before terminal open and leaves no timer', async () => {
        const { execution, terminal } = await createTask();
        const result = provider.getTaskResult(execution);
        terminal.close();
        end.fire({ execution });
        await expect(result).resolves.toEqual({ exitCode: 130, output: '' });
        terminal.open();
        expect(spawn).not.toHaveBeenCalled();
        expect(jest.getTimerCount()).toBe(0);
    });

    it('binds a completed capture when the execution becomes observable after the callback', async () => {
        const task = provider.resolveTask(new vscode.Task(definition, vscode.TaskScope.Workspace, 'CMSIS Load', 'Workspace'))!;
        const child = childProcess();
        jest.mocked(spawn).mockReturnValueOnce(child);
        const callback = (task.execution as unknown as { callback: (definition: vscode.TaskDefinition) => Promise<PyocdTerminal> }).callback;
        const terminal = await callback(definition);
        terminal.open();
        child.stdout!.emit('data', Buffer.from('completed before start event'));
        child.emit('close', 0);
        const execution = { task, terminate: jest.fn() };
        start.fire({ execution });
        await expect(provider.getTaskResult(execution)).resolves.toEqual({ exitCode: 0, output: 'completed before start event' });
    });

    it('settles an execution that ends without invoking its custom callback', async () => {
        const task = provider.resolveTask(new vscode.Task(definition, vscode.TaskScope.Workspace, 'CMSIS Load', 'Workspace'))!;
        const execution = { task, terminate: jest.fn() };
        active.push(execution);
        const result = provider.getTaskResult(execution);
        end.fire({ execution });
        await expect(result).resolves.toEqual({ output: '' });
    });

    it('settles pre-open cancellation on provider disposal', async () => {
        const { execution } = await createTask();
        const result = provider.getTaskResult(execution);
        provider.dispose();
        await expect(result).resolves.toEqual({ exitCode: 130, output: '' });
        expect(spawn).not.toHaveBeenCalled();
        expect(jest.getTimerCount()).toBe(0);
    });

    it('isolates workspace scopes and command arguments when callbacks arrive in reverse order', async () => {
        const firstScope = { uri: vscode.Uri.file('/first') } as vscode.WorkspaceFolder;
        const secondScope = { uri: vscode.Uri.file('/second') } as vscode.WorkspaceFolder;
        const firstDefinition = { ...definition, args: ['load', 'first'] };
        const secondDefinition = { ...definition, args: ['load', 'second'] };
        const firstTask = provider.resolveTask(new vscode.Task(firstDefinition, firstScope, 'CMSIS Load', 'Workspace'))!;
        const secondTask = provider.resolveTask(new vscode.Task(secondDefinition, secondScope, 'CMSIS Load', 'Workspace'))!;
        const firstExecution = { task: firstTask, terminate: jest.fn() };
        const secondExecution = { task: secondTask, terminate: jest.fn() };
        start.fire({ execution: firstExecution });
        start.fire({ execution: secondExecution });
        for (const [task, execution, output] of [
            [secondTask, secondExecution, 'second'], [firstTask, firstExecution, 'first'],
        ] as const) {
            const child = childProcess();
            jest.mocked(spawn).mockReturnValueOnce(child);
            const callback = (task.execution as unknown as { callback: (definition: vscode.TaskDefinition) => Promise<PyocdTerminal> }).callback;
            const terminal = await callback(task.definition);
            terminal.open();
            child.stdout!.emit('data', Buffer.from(output));
            child.emit('close', 0);
            await expect(provider.getTaskResult(execution)).resolves.toEqual({ exitCode: 0, output });
        }
    });

    it('evicts the oldest completed lookup while leaving active and already returned promises intact', async () => {
        const running = await createTask('CMSIS Run');
        running.terminal.open();
        const first = await createTask();
        first.terminal.open();
        const result = provider.getTaskResult(first.execution);
        first.child.emit('close', 0);
        for (let index = 0; index < 20; index++) {
            const next = await createTask();
            next.terminal.open();
            next.child.emit('close', 0);
            await expect(provider.getTaskResult(next.execution)).resolves.toEqual({ exitCode: 0, output: '' });
        }
        await expect(provider.getTaskResult(first.execution)).rejects.toThrow('No captured task result');
        await expect(result).resolves.toEqual({ exitCode: 0, output: '' });
        running.child.emit('close', 0);
        await expect(provider.getTaskResult(running.execution)).resolves.toEqual({ exitCode: 0, output: '' });
    });

    it.each(['CMSIS Erase', 'CMSIS TargetInfo', 'CMSIS Load+Run', 'other'])('rejects unsupported managed task %s', async name => {
        const { execution, terminal, child } = await createTask(name);
        await expect(provider.getTaskResult(execution)).rejects.toThrow('No captured task result');
        terminal.open();
        child.emit('close', 0);
    });

    it('rejects unknown, copied and shell execution handles', async () => {
        const { execution, terminal, child } = await createTask();
        terminal.open();
        child.emit('close', 0);
        active.length = 0;
        await expect(provider.getTaskResult({ ...execution })).rejects.toThrow('No captured task result');
        const shell = { task: new vscode.Task({ type: 'shell' }, vscode.TaskScope.Workspace, 'CMSIS Load', 'Workspace'), terminate: jest.fn() };
        active.push(shell);
        await expect(provider.getTaskResult(shell)).rejects.toThrow('No captured task result');
    });
});
