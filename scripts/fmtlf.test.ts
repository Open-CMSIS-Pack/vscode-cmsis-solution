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

import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const { TestDataHandler } = jest.requireActual('../src/__test__/test-data') as typeof import('../src/__test__/test-data.js');
const scriptPath = path.resolve(__dirname, 'fmtlf.ts');
const tsxCliPath = require.resolve('tsx/cli');

describe('fmtlf', () => {
    let testData: InstanceType<typeof TestDataHandler>;

    beforeEach(() => {
        testData = new TestDataHandler();
        const result = spawnSync('git', ['init', '--quiet', testData.tmpDir]);
        expect(result.status).toBe(0);
    });

    afterEach(() => {
        testData.dispose();
    });

    function writeFile(relativePath: string, content: string | Buffer): string {
        const file = path.join(testData.tmpDir, relativePath);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
        return file;
    }

    function run(...args: string[]) {
        return spawnSync(process.execPath, [tsxCliPath, scriptPath, ...args], {
            cwd: testData.tmpDir, encoding: 'utf8', timeout: 15000,
        });
    }

    it.each([
        ['CRLF', 'first\r\nsecond\r\n', 'first\nsecond\n'],
        ['CR and mixed endings', 'first\rsecond\r\nthird\n', 'first\nsecond\nthird\n'],
        ['missing final newline', 'first', 'first\n'],
        ['multiple final newlines', 'first\n\n\n', 'first\n'],
        ['empty file', '', '\n'],
        ['BOM and whitespace', '\uFEFFfirst  \r\n\tsecond', '\uFEFFfirst  \n\tsecond\n'],
    ])('checks and fixes %s without changing other content', (_name, original, expected) => {
        const file = writeFile('source.ts', original);
        expect(run().status).toBe(1);
        expect(fs.readFileSync(file, 'utf8')).toBe(original);
        expect(run('--mode=fix').status).toBe(0);
        expect(fs.readFileSync(file, 'utf8')).toBe(expected);
        expect(run().status).toBe(0);
        expect(run('--mode=fix').stdout).not.toContain('Fixed:');
        expect(fs.readFileSync(file, 'utf8')).toBe(expected);
    });

    it('leaves compliant files unchanged', () => {
        const file = writeFile('README.md', 'first\n\nsecond\n');
        const before = fs.statSync(file).mtimeMs;
        expect(run('--mode=fix').status).toBe(0);
        expect(fs.statSync(file).mtimeMs).toBe(before);
    });

    it('respects includes, custom excludes, ignored files and fixed fixture exclusions', () => {
        writeFile('.gitignore', 'ignored/\n');
        const selected = writeFile('src/selected.ts', 'selected');
        const others = ['src/excluded.ts', 'README.md', 'test-data/fixture.ts', 'src/test-data/fixture.ts', 'ignored/file.ts', 'node_modules/file.ts'];
        const files = others.map(file => writeFile(file, 'unchanged'));
        expect(run('--mode=fix', '--include=**/*.ts', '--exclude=src/excluded.ts').status).toBe(0);
        expect(fs.readFileSync(selected, 'utf8')).toBe('selected\n');
        files.forEach(file => expect(fs.readFileSync(file, 'utf8')).toBe('unchanged'));
    });

    it('skips binary files and reports unsupported encodings without rewriting', () => {
        const binary = writeFile('binary.png', Buffer.from([0x89, 0x50, 0x0D, 0x0A]));
        const nul = writeFile('binary.txt', Buffer.from([0, 0x0D, 0x0A]));
        const utf16 = writeFile('utf16.txt', Buffer.from([0xFF, 0xFE, 0x41, 0]));
        const invalid = writeFile('invalid.txt', Buffer.from([0xC3, 0x28]));
        const files = [binary, nul, utf16, invalid];
        const originals = files.map(file => fs.readFileSync(file));
        const result = run('--mode=fix');
        expect(result.status).toBe(1);
        expect(result.stderr).toContain('unsupported encoding');
        files.forEach((file, index) => expect(fs.readFileSync(file)).toEqual(originals[index]));
    });

    it('excludes batch files even with explicit includes', () => {
        const content = Buffer.from('@echo off\r\necho batch\r\n');
        const files = ['script.bat', 'nested/script.BAT'].map(file => writeFile(file, content));

        for (const args of [[], ['--include=script.bat,nested/script.BAT']]) {
            expect(run(...args).status).toBe(0);
            expect(run('--mode=fix', ...args).status).toBe(0);
            files.forEach(file => expect(fs.readFileSync(file)).toEqual(content));
        }
    });

    it('rejects unsupported modes', () => {
        const result = run('--mode=unknown');
        expect(result.status).toBe(1);
        expect(result.stderr).toContain('Unsupported mode: unknown');
    });
});
