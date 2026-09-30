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

const scriptPath = path.resolve(__dirname, 'copyright-manager.ts');
const tsxCliPath = require.resolve('tsx/cli');
const currentYear = new Date().getFullYear();
const earlierYear = currentYear - 2;

describe('copyright-manager', () => {
    let testData: InstanceType<typeof TestDataHandler>;

    beforeEach(() => {
        testData = new TestDataHandler();
    });

    afterEach(() => {
        testData.dispose();
    });

    function writeFile(relativePath: string, content: string): string {
        const filePath = path.join(testData.tmpDir, relativePath);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
        return filePath;
    }

    function run(...args: string[]) {
        return spawnSync(process.execPath, [tsxCliPath, scriptPath, ...args], {
            cwd: testData.tmpDir,
            encoding: 'utf8',
            timeout: 15000,
        });
    }

    function expectSuccess(result: ReturnType<typeof run>) {
        if (result.status !== 0) {
            throw new Error(result.error?.message ?? result.stderr ?? result.stdout);
        }
    }

    it('updates an existing year range and is idempotent', () => {
        const source = writeFile('src/older.ts', `/**\n * Copyright ${earlierYear} Arm Limited\n * Licensed under the Apache License, Version 2.0\n */\n\nexport const value = 1;\n`);

        expectSuccess(run('--mode=check', '--include=src/older.ts'));
        expect(run('--mode=check', '--include=src/older.ts', '--current-year').status).toBe(1);
        expectSuccess(run('--mode=fix', '--include=src/older.ts'));
        const updated = fs.readFileSync(source, 'utf8');
        expect(updated).toContain(`Copyright ${earlierYear}-${currentYear} Arm Limited`);
        expect(updated).toContain('Licensed under the Apache License, Version 2.0');
        expectSuccess(run('--mode=check', '--include=src/older.ts', '--current-year'));
        expectSuccess(run('--mode=fix', '--include=src/older.ts'));
        expect(fs.readFileSync(source, 'utf8')).toBe(updated);
    });

    it('replaces a legacy notice with one Apache header', () => {
        const source = writeFile('src/legacy.ts', `/* Copyright (C) ${earlierYear} Arm Limited */\n\nexport const value = 1;\n`);

        expectSuccess(run('--mode=fix', '--include=src/legacy.ts'));
        const updated = fs.readFileSync(source, 'utf8');
        expect(updated).toContain(`Copyright ${earlierYear}-${currentYear} Arm Limited`);
        expect(updated).toContain('Licensed under the Apache License, Version 2.0');
        expect(updated).not.toContain('Copyright (C)');
        expect(updated.match(/Copyright \d{4}(?:-\d{4})? Arm Limited/g)).toHaveLength(1);
    });

    it('preserves a shebang when adding a missing notice', () => {
        const source = writeFile('scripts/tool.ts', '#!npx tsx\n\nexport const value = 1;\n');

        expectSuccess(run('--mode=fix', '--include=scripts/tool.ts'));
        const updated = fs.readFileSync(source, 'utf8');
        expect(updated).toMatch(new RegExp(`^#!npx tsx\\n\\n/\\*\\*\\n \\* Copyright ${currentYear} Arm Limited`));
        expectSuccess(run('--mode=check', '--include=scripts/tool.ts', '--current-year'));
    });

    it('recognizes notices after lint directives and CSS imports', () => {
        const notice = `/**\n * Copyright ${currentYear} Arm Limited\n */\n`;
        const linted = writeFile('src/linted.ts', `/* eslint-disable no-console */\n\n${notice}\nconsole.log('test');\n`);
        const css = writeFile('src/theme.css', `@import 'base.css';\n\n${notice}\nbody {}\n`);
        const originalLinted = fs.readFileSync(linted, 'utf8');
        const originalCss = fs.readFileSync(css, 'utf8');

        expectSuccess(run('--mode=check', '--include=src/linted.ts,src/theme.css', '--current-year'));
        expectSuccess(run('--mode=fix', '--include=src/linted.ts,src/theme.css'));
        expect(fs.readFileSync(linted, 'utf8')).toBe(originalLinted);
        expect(fs.readFileSync(css, 'utf8')).toBe(originalCss);
    });

    it('ignores test-data even with explicit includes and custom excludes', () => {
        const source = writeFile('src/changed.ts', 'export const changed = true;\n');
        const fixture = writeFile('test-data/fixture.ts', 'export const fixture = true;\n');
        const nestedFixture = writeFile('src/test-data/nested.ts', 'export const nested = true;\n');

        expectSuccess(run('--mode=fix', '--include=**/*.ts', '--exclude=unrelated/**'));
        expect(fs.readFileSync(source, 'utf8')).toContain(`Copyright ${currentYear} Arm Limited`);
        expect(fs.readFileSync(fixture, 'utf8')).toBe('export const fixture = true;\n');
        expect(fs.readFileSync(nestedFixture, 'utf8')).toBe('export const nested = true;\n');
        expectSuccess(run('--mode=check', '--include=test-data/fixture.ts,src/test-data/nested.ts', '--exclude=unrelated/**', '--current-year'));
    });
});
