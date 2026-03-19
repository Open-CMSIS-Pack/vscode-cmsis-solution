/**
 * Copyright 2025-2026 Arm Limited
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
import * as vscodeUtils from '../utils/vscode-utils';
import * as fsUtils from '../utils/fs-utils';
import { CmsisSettingsJsonFile, ContextSelectionSettings } from './cmsis-settings-json-file';
import { TestDataHandler } from '../__test__/test-data';
import { ETextFileResult } from '../generic/text-file';


describe('WorkspaceSettingsService', () => {
    const testDataHandler = new TestDataHandler();
    const testDir = testDataHandler.tmpDir;
    const testFile = 'cmsis.json';
    const testFilePath = path.join(testDir, '.vscode', testFile);
    let cmsisJson: CmsisSettingsJsonFile;

    beforeAll(() => {
        jest.spyOn(vscodeUtils, 'getWorkspaceFolder').mockReturnValue(testDir);
    });


    beforeEach(() => {
        cmsisJson = new CmsisSettingsJsonFile(testFilePath);
    });

    afterEach(() => {
        testDataHandler.rmFile(testFilePath);
    });

    afterAll(() => {
        testDataHandler.dispose();
        jest.restoreAllMocks();
    });

    it('should set and get settings object', () => {
        const settings: ContextSelectionSettings = { selectedTargetSet: 'foo' };
        cmsisJson.setSettings(settings);
        const result = cmsisJson.getSettings();
        expect(result.selectedTargetSet).toBe('foo');
    });

    it('should get and set a single setting', () => {
        cmsisJson.set('root.selectedTargetSet', 'bar');
        const value = cmsisJson.get('root.selectedTargetSet');
        expect(value).toBe('bar');
    });

    it('should return undefined for missing setting', async () => {
        expect(cmsisJson.get('selectedTargetSet')).toBeUndefined();
        const res = await cmsisJson.getAndDelete('selectedTargetSet');
        expect(res).toBeUndefined();
    });

    it('should create settings file in .vscode directory of workspace folder', async () => {
        cmsisJson.setSettings({ foo: 'bar' });
        let result = await cmsisJson.save(); // will automatically create file if needed
        expect(result).toBe(ETextFileResult.Success);
        const exists = fsUtils.fileExists(testFilePath);
        expect(exists).toBe(true);
        result = await cmsisJson.load();
        expect(result).toBe(ETextFileResult.Unchanged);
        // test reset setting
        let val = await cmsisJson.getAndDelete('foo');
        expect(val).toBe('bar');
        val = await cmsisJson.getAndDelete('foo');
        expect(val).toBeUndefined();
        result = await cmsisJson.load();
        expect(result).toBe(ETextFileResult.Unchanged); // getAndDelete updated the file
        val = await cmsisJson.getAndDelete('foo');
        expect(val).toBeUndefined();
    });

    describe('WorkspaceSettingsService.get', () => {

        it.each([
            [undefined],
            [''],
            ['missing'],
            ['nested.missing'],
            ['foo.inner'],
        ])('should return undefined for missing or invalid key "%s"', (key) => {
            cmsisJson.setSettings({ foo: 'bar', nested: { inner: 'baz' } });
            expect(cmsisJson.get(key as string)).toBeUndefined();
        });

        it('should read top-level string value', () => {
            cmsisJson.setSettings({ foo: 'bar' });
            expect(cmsisJson.get('foo')).toBe('bar');
        });

        it('should read top-level number value', () => {
            cmsisJson.setSettings({ num: 42 });
            expect(cmsisJson.get('num')).toBe(42);
        });

        it('should read nested value using dot notation', () => {
            cmsisJson.setSettings({ nested: { inner: 'baz' } });
            expect(cmsisJson.get('nested.inner')).toBe('baz');
        });

        it('should return object for nested object value', () => {
            cmsisJson.setSettings({ nested: { inner: { deep: 'value' } } });
            expect(cmsisJson.get('nested.inner.deep')).toEqual('value');
        });

        it('should return undefined if a key does not exist', () => {
            cmsisJson.setSettings({ foo: 'bar', nested: { inner: undefined } });
            expect(cmsisJson.get('foo.nested.inner.deep')).toBeUndefined();
        });
    });

    describe('WorkspaceSettingsService.set', () => {

        it('should write a top-level string value', () => {
            cmsisJson.set('foo', 'bar');
            const settings = cmsisJson.getSettings();
            expect(settings.foo).toBe('bar');
        });

        it('should write a top-level number value', () => {
            cmsisJson.set('num', 123);
            const settings = cmsisJson.getSettings();
            expect(settings.num).toBe(123);
        });

        it('should write a nested value using dot notation', () => {
            cmsisJson.set('nested.inner', 'baz');
            const settings = cmsisJson.getSettings();
            expect(settings.nested).toBeDefined();
            expect((settings.nested as ContextSelectionSettings).inner).toBe('baz');
        });

        it('should overwrite existing value', () => {
            cmsisJson.set('foo', 'bar');
            cmsisJson.set('foo', 'baz');
            const settings = cmsisJson.getSettings();
            expect(settings.foo).toBe('baz');
        });

        it('should create nested objects if they do not exist', () => {
            cmsisJson.set('a.b.c', 'value');
            const settings = cmsisJson.getSettings();
            expect(settings.a).toBeDefined();
            expect(((settings.a as ContextSelectionSettings).b as ContextSelectionSettings).c).toBe('value');
        });

        it('should do nothing if key is undefined', () => {
            cmsisJson.clear();
            cmsisJson.set(undefined as unknown as string, 'bar');
            const settings = cmsisJson.getSettings();
            expect(settings).toEqual({});
        });

        it('should do nothing if key is empty string', () => {
            cmsisJson.clear();
            cmsisJson.set('', 'bar');
            const settings = cmsisJson.getSettings();
            expect(settings).toEqual({});
        });

        it('should overwrite nested value', () => {
            cmsisJson.set('nested.inner', 'foo');
            cmsisJson.set('nested.inner', 'bar');
            const settings = cmsisJson.getSettings();
            expect((settings.nested as ContextSelectionSettings).inner).toBe('bar');
        });

        it('should handle writing undefined value', () => {
            cmsisJson.set('foo', undefined);
            const settings = cmsisJson.getSettings();
            expect(settings.foo).toBeUndefined();
        });

        it('should overwrite non-object with object when writing nested value', () => {
            cmsisJson.set('foo', 'bar');
            cmsisJson.set('foo.inner', 'baz');
            const settings = cmsisJson.getSettings();
            expect(typeof settings.foo).toBe('object');
            expect((settings.foo as ContextSelectionSettings).inner).toBe('baz');
        });
    });
});
