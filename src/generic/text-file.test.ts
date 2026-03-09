/**
 * Copyright 2025-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { TextFile, ETextFileResult } from './text-file';
import { TestDataHandler } from '../__test__/test-data';
import { EtaExt } from './eta-ext';
import { EtaTextRenderer } from './text-renderer';
import * as fsUtils from '../utils/fs-utils';
import { TextParser } from './text-parser';

describe('TextFile', () => {

    const initialContent = 'Initial content';
    const changedContent = 'Changed content';
    const wrongContent = 'wrong';

    class MockParser extends TextParser {
        override parse(content: string) {
            if (content === wrongContent) {
                // Simulate a parser error
                this.addError('Parse failed at line 2, column 5');
                return {};
            }
            return content;
        };
        override stringify(_obj?: string): string {
            return _obj || initialContent;
        };
    }

    const testDataHandler = new TestDataHandler();
    const tmpDataDir = testDataHandler.tmpDir;
    const TEST_FILE = path.join(tmpDataDir, 'textFile.txt');

    afterEach(() => {
        testDataHandler.rmFile(TEST_FILE);
    });

    afterAll(() => {
        testDataHandler.dispose();
    });


    it('should set and get content', () => {
        const tf = new TextFile(TEST_FILE);
        tf.text = 'Hello';
        expect(tf.text).toBe('Hello');
        expect(tf.isDirty).toBe(true);
    });

    it('should set and get fileName', () => {
        const tf = new TextFile(TEST_FILE);
        expect(tf.fileName).toBe(TEST_FILE);
        const newName = path.join(__dirname, 'other.txt');
        tf.fileName = newName;
        expect(tf.fileName).toBe(newName);
        expect(tf.fileDir).toBe(__dirname);
    });

    it('should save and load content', async () => {
        const tf = new TextFile(TEST_FILE);
        tf.text = 'Test content';
        await tf.save();
        expect(tf.exists()).toBe(true);

        const tf2 = new TextFile(TEST_FILE);
        const result = await tf2.load();
        expect(result).toBe(ETextFileResult.Success);
        expect(tf2.text).toBe('Test content');

        tf.unlink();
        expect(tf.exists()).toBe(false);
    });

    it('should return Error when loading non-existent file but keep existing data in memory', async () => {
        const tf = new TextFile('nonexistent.txt');
        tf.readOnly = true;
        tf.text = 'abc';
        const result = await tf.load();
        expect(result).toBe(ETextFileResult.NotExists);
        expect(tf.text).toBe('abc');
        expect(tf.isDirty).toBe(true);
        expect(tf.hasErrors()).toBe(true);
        expect(tf.errors[0]).toBe('nonexistent.txt: File not exists');
        expect(testDataHandler.errorMessageSpy).toHaveBeenCalledWith(tf.errors.join('\n'));
    });

    it('should not mark as dirty if content is unchanged', () => {
        const tf = new TextFile(TEST_FILE);
        tf.text = 'abc';
        expect(tf.isDirty).toBe(true); // dirty, content has changed
        tf.text = 'abc';
        expect(tf.isDirty).toBe(true); // remains dirty, as set does not reset
    });

    it('should respect read-only flag', async () => {
        const tf = new TextFile(TEST_FILE);
        tf.text = 'foo';
        let result = await tf.save();
        expect(result).toEqual(ETextFileResult.Success);
        tf.text = 'bar';
        tf.readOnly = true;
        result = await tf.save();
        expect(result).toEqual(ETextFileResult.Error);
        result = await tf.load();
        expect(result).toEqual(ETextFileResult.Success);
        expect(tf.text).toEqual('foo');
        tf.unlink();
        expect(tf.exists()).toBe(true);
    });

    it('should call stringify and parse', async () => {
        class CustomTextFile extends TextFile {
            public override stringify(): string {
                return 'stringified';
            }
            public override parse(): object {
                return { parsed: true };
            }
        }
        const tf = new CustomTextFile(TEST_FILE);
        await tf.load();
        expect(tf.object).toEqual({});
        tf.text = 'abc';
        await tf.save();
        expect(tf.text).toEqual('stringified');
        tf.text = '';
        await tf.load();
        expect(tf.text).toEqual('stringified');
        expect(tf.object).toEqual({ parsed: true });
    });

    it('should use renderer to render text', () => {
        const eta = new EtaExt({ useWith: true });
        const renderer = new EtaTextRenderer({ name: 'World' }, eta);
        const tf = new TextFile(TEST_FILE);
        tf.renderer = renderer;
        tf.text = 'Hello, <%= name %>!';
        // render() should use EtaTextRenderer
        expect(tf.render()).toBe('Hello, World!');
    });

    it('should return original text if renderer is not set', () => {
        const tf = new TextFile(TEST_FILE);
        tf.text = 'Hello, <%= name %>!';
        expect(tf.render()).toBe('Hello, <%= name %>!');
    });

    it('should update rendered text when renderer data changes', () => {
        const eta = new EtaExt({ useWith: true });
        const renderer = new EtaTextRenderer({ name: 'Alice' }, eta);
        const tf = new TextFile(TEST_FILE);
        tf.renderer = renderer;
        tf.text = 'Hi, <%= name %>!';
        expect(tf.render()).toBe('Hi, Alice!');
        renderer.renderData = { name: 'Bob' };
        expect(tf.render()).toBe('Hi, Bob!');
    });

    it('should handle errors from writeTextFile()', async () => {
        const tf = new TextFile(TEST_FILE);
        tf.text = 'dummy';
        const spy = jest.spyOn(fsUtils, 'writeTextFile').mockImplementation(() => {
            throw new Error('Simulated write error');
        });

        const result = await tf.save();
        expect(result).toBe(ETextFileResult.Error);
        expect(tf.errors.length).toBeGreaterThan(0);
        expect(tf.errors[0]).toEqual(`${TEST_FILE}: Failed to write: Simulated write error`);
        expect(testDataHandler.errorMessageSpy).toHaveBeenCalledWith(tf.errors.join('\n'));
        spy.mockRestore();
    });

    it('should handle errors from readTextFile()', async () => {
        fsUtils.writeTextFile(TEST_FILE, 'dummy');
        const tf = new TextFile(TEST_FILE);
        const spy = jest.spyOn(fsUtils, 'readTextFile').mockImplementation(() => {
            throw new Error('Simulated read error');
        });

        const result = await tf.load();
        expect(result).toBe(ETextFileResult.Error);
        expect(tf.errors.length).toBeGreaterThan(0);
        expect(tf.errors[0]).toEqual(`${TEST_FILE}: Failed to read: Simulated read error`);
        expect(testDataHandler.errorMessageSpy).toHaveBeenCalledWith(tf.errors.join('\n'));
        spy.mockRestore();
    });

    it('should save and load content with specified filename', async () => {
        const tf = new TextFile('');
        tf.text = 'Content with filename';
        // Save with explicit filename
        await tf.save(TEST_FILE);
        expect(fs.existsSync(TEST_FILE)).toBe(true);
        // Load with explicit filename
        tf.text = '';
        tf.fileName = '';
        const result = await tf.load(TEST_FILE);
        expect(result).toBe(ETextFileResult.Success);
        expect(tf.text).toBe('Content with filename');
    });

    it('should handle parser errors and add them to errors list', async () => {
        fsUtils.writeTextFile(TEST_FILE, wrongContent);
        const tf = new TextFile(TEST_FILE, new MockParser());
        // Simulate load which calls parser.parse
        await tf.load();
        expect(tf.errors.length).toBeGreaterThan(1);
        expect(tf.errors[0]).toEqual(`${TEST_FILE}: Failed to parse:`);
        expect(tf.errors[1]).toEqual('Parse failed at line 2, column 5');
        expect(testDataHandler.errorMessageSpy).toHaveBeenCalledWith(tf.errors.join('\n'));
    });

    it('checks if isModified returns true when content changes', () => {
        const tf = new TextFile(TEST_FILE, new MockParser());
        tf.text = initialContent;
        expect(tf.isModified()).toBe(false); // Not modified yet

        tf['contentString'] = changedContent;
        expect(tf.isModified()).toBe(true); // Now modified
    });

    it('checks if isModified returns false when content is the same', () => {
        const initialContent = 'Same content';
        const tf = new TextFile(TEST_FILE);
        tf.text = initialContent;
        expect(tf.isModified()).toBe(false); // Not modified yet
        tf.text = initialContent;
        expect(tf.isModified()).toBe(false); // Still not modified
    });

    it('checks if isModified returns false when content is reset to original', async () => {
        const tf = new TextFile(TEST_FILE, new MockParser());
        tf.text = initialContent;
        await tf.save();
        expect(tf.isModified()).toBe(false); // Just saved, not modified
        tf.text = changedContent;
        expect(tf.isModified()).toBe(true); // Now modified
        tf.text = initialContent;
        expect(tf.isModified()).toBe(false); // Back to original, not modified
    });

    it('checks if copy works', async () => {
        const tf = new TextFile(TEST_FILE, new MockParser());
        tf.text = initialContent;
        tf.content = tf.parse();
        expect(tf.copyFrom()).toBe(ETextFileResult.Unchanged); // Nothing copied

        const tfSrc = new TextFile(TEST_FILE, new MockParser());
        tfSrc.text = initialContent;
        tfSrc.content = initialContent;
        expect(tf.copyFrom(tfSrc)).toBe(ETextFileResult.Unchanged); // Equal
        tfSrc.text = changedContent;
        tfSrc.content = changedContent;
        expect(tf.copyFrom(tfSrc)).toBe(ETextFileResult.Success); // Copied
        expect(tf.text).toBe(changedContent);
        expect(tf.content).toEqual(changedContent);

        tfSrc.text = wrongContent;
        tfSrc.content = wrongContent;
        expect(tf.copyFrom(tfSrc)).toBe(ETextFileResult.Error); // copied with errors
        expect(tf.errors.length).toBe(2);
    });

    it('resolves path', () => {
        const tf = new TextFile(TEST_FILE);

        // Test resolving undefined paths
        const resolvedUndefined = tf.resolvePath(undefined);
        expect(resolvedUndefined).toBe('');

        // Test resolving relative paths
        const resolved = tf.resolvePath('bar/baz.txt');
        expect(resolved).toBe(path.join(tmpDataDir, 'bar', 'baz.txt'));

        // Test resolving absolute paths (should pass through)
        const absolutePath = path.join(tmpDataDir, 'absolute', 'file.txt');
        const resolvedAbsolute = tf.resolvePath(absolutePath);
        expect(resolvedAbsolute).toBe(absolutePath);
    });

    it('treats mixed-string file changes as a modification on reload', async () => {
        const initial = [
            'prefix',
            'UNCHANGED',
            'needle',
            'UNCHANGED',
            'suffix'
        ].join('\n');
        const changed = [
            'prefix',
            'UNCHANGED',
            'needle-modified',
            'UNCHANGED',
            'suffix'
        ].join('\n');

        fsUtils.writeTextFile(TEST_FILE, initial);
        const tf = new TextFile(TEST_FILE, new MockParser());

        let loadResult = await tf.load();
        expect(loadResult).toBe(ETextFileResult.Success);
        expect(tf.text).toBe(initial);

        fsUtils.writeTextFile(TEST_FILE, changed);
        loadResult = await tf.load();
        expect(loadResult).toBe(ETextFileResult.Success);
        expect(tf.text).toBe(changed);
    });

    it('ignores CRLF vs LF differences when checking isModified (mixed line endings)', () => {
        const tf = new TextFile(TEST_FILE, new MockParser());

        const mixedLineEndingsOnDisk = 'a\r\nb\nc\r\nd\n';
        const normalizedLf = 'a\nb\nc\nd\n';

        tf.text = mixedLineEndingsOnDisk;
        tf.content = normalizedLf;
        expect(tf.isModified()).toBe(false);

        tf.text = normalizedLf;
        tf.content = mixedLineEndingsOnDisk;
        expect(tf.isModified()).toBe(false);
    });

    it('supports file modifications with special characters in the file path', async () => {
        const unicodeDir = path.join(tmpDataDir, 'cartella-èàù', 'dossier-français');
        const unicodeFile = path.join(unicodeDir, 'caffè-école.txt');
        const initial = 'Line 1\nLigne 2\nCaffè\n';
        const updated = 'Line 1\nLigne 2\nCaffè (modifié)\n';

        // Ensure a clean slate
        testDataHandler.rmDir(unicodeDir);

        const tf = new TextFile(unicodeFile);
        tf.text = initial;
        let saveResult = await tf.save();
        expect(saveResult).toBe(ETextFileResult.Success);
        expect(fs.existsSync(unicodeFile)).toBe(true);

        const tf2 = new TextFile(unicodeFile);
        let loadResult = await tf2.load();
        expect(loadResult).toBe(ETextFileResult.Success);
        expect(tf2.text).toBe(initial);

        tf2.text = updated;
        saveResult = await tf2.save();
        expect(saveResult).toBe(ETextFileResult.Success);

        const tf3 = new TextFile(unicodeFile);
        loadResult = await tf3.load();
        expect(loadResult).toBe(ETextFileResult.Success);
        expect(tf3.text).toBe(updated);

        testDataHandler.rmDir(unicodeDir);
    });

    it('primes external stamp on first change check', async () => {
        const tf = new TextFile(TEST_FILE);
        tf.text = initialContent;
        const saveResult = await tf.save();
        expect(saveResult).toBe(ETextFileResult.Success);

        expect(tf.hasExternalFileChanged()).toBe(false);
    });

    it('detects external on-disk updates and then re-baselines', async () => {
        const tf = new TextFile(TEST_FILE);
        tf.text = initialContent;
        const saveResult = await tf.save();
        expect(saveResult).toBe(ETextFileResult.Success);

        tf.refreshExternalFileStamp();
        expect(tf.hasExternalFileChanged()).toBe(false);

        fsUtils.writeTextFile(TEST_FILE, changedContent);
        expect(tf.hasExternalFileChanged()).toBe(true);
        expect(tf.hasExternalFileChanged()).toBe(false);
    });
});
