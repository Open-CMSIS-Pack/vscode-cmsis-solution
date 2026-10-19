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

import fs from 'fs-extra';
import * as glob from 'glob';
import minimist from 'minimist';
import path from 'node:path';

const args = minimist(process.argv.slice(2), { boolean: ['current-year'] });
const mode = args.mode || 'check';
const currentYear = new Date().getFullYear();

const DEFAULT_INCLUDE_GLOBS = ['src/**/*.ts', 'scripts/**/*.ts', 'api/**/*.ts', 'packages/**/*.ts', '__mocks__/**/*.ts', '**/*.tsx', '**/*.css'];
const DEFAULT_EXCLUDE_GLOBS = ['**/node_modules/**', '**/coverage/**', '**/dist/**', 'tools/**', 'src/json-rpc/**', 'test-workspace/**'];
const TEST_DATA_EXCLUDE_GLOBS = ['test-data/**', '**/test-data/**'];

const includeGlobs: string[] = args.include ? args.include.split(',') : DEFAULT_INCLUDE_GLOBS;
const excludeGlobs: string[] = [...new Set([...(args.exclude ? args.exclude.split(',') : DEFAULT_EXCLUDE_GLOBS), ...TEST_DATA_EXCLUDE_GLOBS])];

const COPYRIGHT_TEXT = `/**
 * Copyright ${currentYear} Arm Limited
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
 */`;

const COPYRIGHT_REGEX = /^\/\*\*\r?\n \* Copyright (20\d{2})(?:-(20\d{2}))? Arm Limited[\s\S]*?\*\//;
const LEGACY_COPYRIGHT_REGEX = /^\/\* Copyright \(C\) (20\d{2})(?:-(20\d{2}))? Arm Limited \*\//;
const COPYRIGHT_LINE_REGEX = /^ \* Copyright 20\d{2}(?:-20\d{2})? Arm Limited/m;

function getHeaderStart(content: string): number {
    let start = content.charCodeAt(0) === 0xFEFF ? 1 : 0;
    if (content.startsWith('#!', start)) {
        const lineEnd = content.indexOf('\n', start);
        start = lineEnd === -1 ? content.length : lineEnd + 1;
    }
    while (true) {
        const preamble = content.slice(start).match(/^(?:[ \t]*\r?\n|\/\* eslint-disable[^\r\n]*\*\/[ \t]*\r?\n|@import [^\r\n]*;[ \t]*\r?\n)/);
        if (!preamble) {
            return start;
        }
        start += preamble[0].length;
    }
}

function getCopyrightNotice(content: string) {
    const start = getHeaderStart(content);
    const remaining = content.slice(start);
    const canonical = remaining.match(COPYRIGHT_REGEX);
    if (canonical) {
        return { start, match: canonical, canonical: true };
    }
    const legacy = remaining.match(LEGACY_COPYRIGHT_REGEX);
    return legacy ? { start, match: legacy, canonical: false } : undefined;
}

function isTestDataFile(file: string): boolean {
    return path.relative(process.cwd(), file).split(/[\\/]/).some(segment => segment.toLowerCase() === 'test-data');
}

function getFiles(): string[] {
    const allFiles = new Set<string>();
    for (const pattern of includeGlobs) {
        try {
            const matchedFiles = glob.sync(pattern, {
                ignore: excludeGlobs,
                absolute: true,
                cwd: process.cwd(),
            });
            matchedFiles.filter(file => !isTestDataFile(file)).forEach(file => allFiles.add(file));
        } catch (err) {
            console.error(`Error processing pattern "${pattern}":`, err);
        }
    }
    return [...allFiles];
}

function fixCopyrightNotice(content: string): string {
    const notice = getCopyrightNotice(content);
    const firstYear = notice ? Number(notice.match[1]) : currentYear;
    if (firstYear > currentYear) {
        throw new Error(`Copyright year ${firstYear} is later than the current year ${currentYear}`);
    }
    const years = firstYear === currentYear ? `${currentYear}` : `${firstYear}-${currentYear}`;
    if (notice?.canonical) {
        const original = notice.match[0];
        const updated = original.replace(COPYRIGHT_LINE_REGEX, ` * Copyright ${years} Arm Limited`);
        return content.slice(0, notice.start) + updated + content.slice(notice.start + original.length);
    }

    const lineEnding = content.includes('\r\n') ? '\r\n' : '\n';
    const header = COPYRIGHT_TEXT.replace(`Copyright ${currentYear}`, `Copyright ${years}`).replace(/\n/g, lineEnding);
    const start = notice?.start ?? getHeaderStart(content);
    const prefix = content.slice(0, start);
    const separator = prefix && !prefix.endsWith('\n') ? lineEnding : '';
    const suffix = content.slice(start + (notice?.match[0].length ?? 0));
    return `${prefix}${separator}${header}${notice ? '' : `${lineEnding}${lineEnding}`}${suffix}`;
}

function checkFiles(files: string[]) {
    const violations = files.flatMap(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const notice = getCopyrightNotice(content);
        if (!notice?.canonical) {
            return [`${file}: missing or nonstandard notice`];
        }
        if (args['current-year'] && Number(notice.match[2] ?? notice.match[1]) !== currentYear) {
            return [`${file}: copyright year is not ${currentYear}`];
        }
        return [];
    });

    if (violations.length > 0) {
        console.error('error: Copyright notice violations:');
        violations.forEach(violation => console.error(` - ${violation}`));
        process.exit(1);
    } else {
        console.log('All files are compliant.');
    }
}

function fixFiles(files: string[]) {
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const updated = fixCopyrightNotice(content);
        if (updated !== content) {
            fs.writeFileSync(file, updated, 'utf-8');
            console.log(`Fixed: ${file}`);
        }
    });
    console.log('Fix completed.');
}

function main() {
    if (mode !== 'check' && mode !== 'fix') {
        throw new Error(`Unsupported mode: ${mode}`);
    }
    const files = getFiles();
    if (mode === 'fix') {
        fixFiles(files);
    } else {
        checkFiles(files);
    }
}

main();
