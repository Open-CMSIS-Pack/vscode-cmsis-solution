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
