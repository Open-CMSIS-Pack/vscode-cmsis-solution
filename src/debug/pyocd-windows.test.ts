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

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { TestDataHandler } from '../__test__/test-data';
import { pyocdWindowsHost } from './pyocd-windows';

// Exercise the real Windows lookup and error reporting without launching a console or pyOCD.
const describeWindows = process.platform === 'win32' ? describe : describe.skip;
describeWindows('Windows pyOCD executable resolution', () => {
    const data = new TestDataHandler();
    let first: string;
    let second: string;

    beforeAll(() => {
        first = path.join(data.tmpDir, 'configured installation');
        second = path.join(data.tmpDir, 'other installation');
        for (const directory of [first, second]) {
            fs.mkdirSync(directory);
            fs.writeFileSync(path.join(directory, 'pyocd.exe'), '');
        }
    });

    afterAll(() => data.dispose());

    function resolve(directories: string[], setup = '', runBody = 'System.Console.WriteLine(executable); return 0;', command = '') {
        // Replace only the native process boundary; retain the production PowerShell script.
        const script = pyocdWindowsHost.replace(/Add-Type -TypeDefinition @'[\s\S]*?'@/, `
Add-Type -TypeDefinition @'
public static class PyocdConsoleHost {
    public static int Run(string executable, string[] arguments) {
        ${runBody}
    }
}
'@
${setup}`);
        const result = spawnSync(path.win32.join(process.env.SystemRoot ?? 'C:\\Windows',
            'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'), [
            '-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand',
            Buffer.from(script, 'utf16le').toString('base64'),
        ], {
            env: { ...process.env, PATH: directories.join(path.delimiter), CMSIS_PYOCD_ARGUMENTS: '[]', CMSIS_PYOCD_COMMAND: command },
            encoding: 'utf8', windowsHide: true,
        });
        expect(result.error).toBeUndefined();
        return result;
    }

    it('resolves a single installation', () => {
        const result = resolve([first]);
        expect(result.stderr).toBe('');
        expect(result.status).toBe(0);
        expect(result.stdout.trim()).toBe(path.join(first, 'pyocd.exe'));
    });

    it.each(['pyocd', 'absolute', 'custom'])('resolves configured %s commands', kind => {
        fs.writeFileSync(path.join(first, 'custom.exe'), '');
        const command = kind === 'absolute' ? path.join(second, 'pyocd.exe') : kind === 'custom' ? 'custom' : 'pyocd';
        const result = resolve([first], '', undefined, command);
        expect(result.status).toBe(0);
        expect(result.stderr).toBe('');
        expect(result.stdout.trim()).toBe(kind === 'absolute' ? command : path.join(first, kind === 'custom' ? 'custom.exe' : 'pyocd.exe'));
    });

    it('warns when a configured command needs fallback', () => {
        const result = resolve([first], '', undefined, 'missing-command');
        expect(result.status).toBe(0);
        expect(result.stderr).toContain("configured executable 'missing-command' was not found");
        expect(result.stderr).toContain(path.join(first, 'pyocd.exe'));
    });

    it.each(['cmd', 'bat'])('resolves explicit pyocd to the executable after an earlier %s shim', extension => {
        const shims = path.join(data.tmpDir, extension);
        fs.mkdirSync(shims);
        fs.writeFileSync(path.join(shims, `pyocd.${extension}`), '@echo off\r\n');
        const result = resolve([shims, second], '', undefined, 'pyocd');
        expect(result.status).toBe(0);
        expect(result.stderr).toBe('');
        expect(result.stdout.trim()).toBe(path.join(second, 'pyocd.exe'));
    });

    it('fails with the configured command when fallback is unavailable', () => {
        const result = resolve([], '', undefined, 'missing-command');
        expect(result.status).toBe(1);
        expect(result.stderr).toContain('missing-command');
        expect(result.stdout).toBe('');
    });

    it('selects only the first installation and respects configured PATH priority', () => {
        for (const directories of [[first, second], [second, first]]) {
            const result = resolve(directories);
            expect(result.stderr).toBe('');
            expect(result.status).toBe(0);
            expect(result.stdout.trim()).toBe(path.join(directories[0], 'pyocd.exe'));
        }
    });

    it('reports a missing installation during executable resolution', () => {
        const result = resolve([]);
        expect(result.status).toBe(1);
        expect(result.stdout).toBe('');
        expect(result.stderr).toContain('pyOCD: pyOCD executable resolution (Get-Command pyocd.exe)');
        expect(result.stderr).toContain('pyocd.exe');
        expect(result.stderr.trim().split(/\r?\n/)).toHaveLength(1);
    });

    it('rejects an invalid resolved path before invoking the host', () => {
        const result = resolve([], 'function Get-Command { [PSCustomObject]@{ Source = $env:TEMP } }');
        expect(result.status).toBe(1);
        expect(result.stdout).toBe('');
        expect(result.stderr).toContain('pyOCD: pyOCD executable resolution (Get-Command pyocd.exe)');
        expect(result.stderr).toContain('Resolved pyOCD executable does not exist or is not a file:');
        expect(result.stderr.trim().split(/\r?\n/)).toHaveLength(1);
    });

    it('reports process-launch exceptions from the host on stderr', () => {
        const result = resolve([first], '', 'throw new System.ComponentModel.Win32Exception(2);');
        expect(result.status).toBe(1);
        expect(result.stdout).toBe('');
        expect(result.stderr).toMatch(/^pyOCD: PyocdConsoleHost.Run: .+/);
        expect(result.stderr.trim().split(/\r?\n/)).toHaveLength(1);
    });

    it.each([
        ['', 'False'],
        ['unexpected\n', 'False'],
        ['stop\n', 'True'],
        ['unexpected\nstop\n', 'True'],
    ])('recognizes control input %j as shutdown request: %s', (input, expected) => {
        const control = pyocdWindowsHost.match(/var\s+control\s*=\s*Task\.Run\s*\([\s\S]*?\}\s*\)\s*;/)?.[0];
        expect(control).toBeDefined();
        const result = resolve([first], '', `
            var input = new System.IO.StringReader(${JSON.stringify(input)});
            ${control?.replace('Task.Run', 'System.Threading.Tasks.Task.Run')}
            System.Console.WriteLine(control.Result);
            return 0;
        `);
        expect(result.stderr).toBe('');
        expect(result.status).toBe(0);
        expect(result.stdout.trim()).toBe(expected);
    });
});
