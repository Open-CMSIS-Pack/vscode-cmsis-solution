/**
 * Copyright 2024-2026 Arm Limited
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

import * as path from 'path';
import * as fsUtils from './fs-utils';
import { promises as fs } from 'fs';
import { TestDataHandler } from '../__test__/test-data';

describe('removeReadOnly', () => {
    const testDataHandler = new TestDataHandler();
    const tempDir = testDataHandler.tmpDir;
    const checkPermissions = async (dirPath: string): Promise<string> => {
        const stats = await fs.stat(dirPath);
        const mode = stats.mode & 0o777;
        return mode.toString(8);
    };

    beforeAll(async () => {
        await fs.chmod(tempDir, 0o444);
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });

    it('checks read only permissions were set', async () => {
        const permissions = await checkPermissions(await tempDir);
        expect(permissions).toBe('444');
    });

    it('removes directory read only permissions', async () => {
        fsUtils.removeReadOnly(tempDir);
        const permissions = await checkPermissions(tempDir);
        expect(permissions).toBe('666');
    });
});

describe('copyFolderRecursive', () => {
    const testDataHandler = new TestDataHandler();
    const tempDir = testDataHandler.tmpDir;
    const srcDir = path.join(tempDir, 'srcDir');
    const destDir = path.join(tempDir, 'destDir');

    beforeAll(async () => {
        await fs.mkdir(srcDir);
        await fs.writeFile(path.join(srcDir, 'file1.txt'), 'text1');
        await fs.mkdir(path.join(srcDir, 'subDir'));
        await fs.writeFile(path.join(srcDir, 'subDir', 'file2.txt'), 'text2');
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });

    it('copies the directory recursively', async () => {
        fsUtils.copyFolderRecursive(srcDir, destDir);
        const file1 = fsUtils.readTextFile(path.join(destDir, 'file1.txt'));
        const file2 = fsUtils.readTextFile(path.join(destDir, 'subDir', 'file2.txt'));
        expect(file1).toBe('text1');
        expect(file2).toBe('text2');
    });

    it('checks copied directory structure', async () => {
        fsUtils.copyFolderRecursive(srcDir, destDir);
        const destSubDirExists = await fs.stat(path.join(destDir, 'subDir'));
        expect(destSubDirExists.isDirectory()).toBe(true);
    });
});

describe('fsUtils', () => {

    it('should handle undefined filename', () => {
        expect(fsUtils.fileExists()).toBe(false);
        const readContent = fsUtils.readTextFile();
        expect(readContent).toBe('');
    });

    it('should write and read text file using fsUtils', () => {
        const testDataHandler = new TestDataHandler();
        const tmpDataDir = testDataHandler.tmpDir;
        const filePath = path.join(tmpDataDir, 'fsUtilsTest.txt');
        const testContent = 'Hello, fsUtils!';

        expect(fsUtils.fileExists(filePath)).toBe(false);

        // Write text file
        fsUtils.writeTextFile(filePath, testContent);
        expect(fsUtils.fileExists(filePath)).toBe(true);

        // Read text file
        const readContent = fsUtils.readTextFile(filePath);
        expect(readContent).toBe(testContent);

        const emptyFilePath = path.join(tmpDataDir, 'empty.txt');
        fsUtils.writeTextFile(emptyFilePath);
        expect(fsUtils.fileExists(emptyFilePath)).toBe(true);
        expect(fsUtils.readTextFile(emptyFilePath)).toBe('');

        // Test deleteFileIfExists
        fsUtils.deleteFileIfExists(filePath);
        expect(fsUtils.fileExists(filePath)).toBe(false);
    });

    it('should get file modification time', () => {
        const testDataHandler = new TestDataHandler();
        const tmpDataDir = testDataHandler.tmpDir;
        const filePath = path.join(tmpDataDir, 'fsUtilsTest.txt');
        const testContent = 'Hello, fsUtils!';
        fsUtils.writeTextFile(filePath, testContent);
        expect(fsUtils.fileExists(filePath)).toBe(true);

        // Get file modification time for existing file
        const modTime = fsUtils.getFileModificationTime(filePath);
        expect(modTime).toBeGreaterThan(0);

        fsUtils.deleteFileIfExists(filePath);
        expect(fsUtils.fileExists(filePath)).toBe(false);

        // For non-existing file
        const modTime0 = fsUtils.getFileModificationTime(filePath);
        expect(modTime0).toEqual(0);
    });
});
