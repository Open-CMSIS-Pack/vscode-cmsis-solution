#!npx tsx

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

import { isUtf8 } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import minimist from 'minimist';

const excluded = [
    '**/.git/**', '**/node_modules/**', '**/coverage/**', '**/dist/**', '**/out/**',
    '**/test-data/**', 'test-workspace/**', 'src/e2e-tests/data/**', 'tools/**',
    'src/json-rpc/interface/**', 'src/solar-search/graphql/client/**',
    'e2e-report/**', 'e2e-screenshots/**', 'test-results/**',
];
const textExtensions = new Set([
    '.c', '.cc', '.cmake', '.cmd', '.cpp', '.css', '.csv', '.cxx', '.dts',
    '.gitattributes', '.gitignore', '.graphql', '.h', '.hpp', '.htm', '.html', '.ini',
    '.js', '.json', '.jsonc', '.jsx', '.lock', '.md', '.mjs', '.cjs', '.ps1', '.py',
    '.s', '.sh', '.snap', '.svg', '.toml', '.ts', '.tsx', '.txt', '.xml', '.yaml', '.yml',
]);

function main(): void {
    const args = minimist(process.argv.slice(2), { string: ['mode', 'include', 'exclude'] });
    const mode = args.mode ?? 'check';
    if (mode !== 'check' && mode !== 'fix') {
        throw new Error(`Unsupported mode: ${mode}`);
    }
    const inventory = new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
        encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
    }).split('\0').filter(Boolean));
    const patterns: string[] = args.include ? args.include.split(',') : ['**/*'];
    const ignore = [...excluded, ...(args.exclude ? args.exclude.split(',') : [])];
    const files = new Set(patterns.flatMap(pattern => globSync(pattern, { dot: true, nodir: true, ignore }))
        .map(file => file.split(path.sep).join('/'))
        .filter(file => inventory.has(file)));
    let failures = 0;
    let checked = 0;
    for (const file of [...files].sort()) {
        if (fs.lstatSync(file).isSymbolicLink()) {
            continue;
        }
        const extension = path.extname(file).toLowerCase();
        if (!textExtensions.has(extension) && !['LICENSE', 'LICENSE-Apache-2.0', '.gitattributes', '.gitignore', '.npmrc', '.nvmrc'].includes(path.basename(file))) {
            continue;
        }
        const original = fs.readFileSync(file);
        const utf16 = original[0] === 0xFF && original[1] === 0xFE || original[0] === 0xFE && original[1] === 0xFF;
        if (utf16 || !isUtf8(original)) {
            console.error(`${file}: unsupported encoding (expected UTF-8); not modified`);
            failures++;
            continue;
        }
        if (original.includes(0)) {
            continue;
        }
        checked++;
        const content = original.toString('utf8');
        const normalized = content.replace(/\r\n?/g, '\n').replace(/\n*$/, '\n');
        const reasons = [
            ...(content.includes('\r') ? ['non-LF line endings'] : []),
            ...(!content.endsWith('\n') ? ['missing final newline'] : []),
            ...(content.endsWith('\n\n') ? ['multiple final newlines'] : []),
        ];
        if (normalized === content) {
            continue;
        }
        if (mode === 'fix') {
            fs.writeFileSync(file, normalized, 'utf8');
            console.log(`Fixed: ${file} (${reasons.join(', ')})`);
        } else {
            console.error(`${file}: ${reasons.join(', ')}`);
            failures++;
        }
    }
    console.log(`Formatting ${mode}: ${checked} text files checked, ${failures} failure(s).`);
    process.exitCode = failures > 0 ? 1 : 0;
}

try {
    main();
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
}
