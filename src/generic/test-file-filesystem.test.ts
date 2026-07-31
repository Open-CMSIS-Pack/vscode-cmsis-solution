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

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { TextFileSystem } from './test-file-filesystem';

describe('TextFileSystem', () => {
    const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'text-file-system-'));
    const testFile = path.join(testDirectory, 'nested', 'test.txt');
    const fileSystem = new TextFileSystem();

    afterAll(() => {
        fs.rmSync(testDirectory, { recursive: true, force: true });
    });

    it('should provide file and path operations', () => {
        expect(fileSystem.dirname(testFile)).toBe(path.dirname(testFile));
        expect(fileSystem.resolve(testDirectory, 'nested', 'test.txt')).toBe(path.resolve(testDirectory, 'nested', 'test.txt'));
        expect(fileSystem.exists(testFile)).toBe(false);
        expect(fileSystem.read(testFile)).toBe('');

        fileSystem.write(testFile, 'Test content');

        expect(fileSystem.exists(testFile)).toBe(true);
        expect(fileSystem.read(testFile)).toBe('Test content');

        fileSystem.unlink(testFile);

        expect(fileSystem.exists(testFile)).toBe(false);
    });
});
