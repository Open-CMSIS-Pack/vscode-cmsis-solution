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
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as vscodeUtils from '../utils/vscode-utils';
import * as fsUtils from '../utils/fs-utils';
import { CmsisSettingsJsonFile, ContextSelectionSettings } from './cmsis-settings-json-file';
import { TestDataHandler } from '../__test__/test-data';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';


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

    it('stores the active solution relative to cmsis.json', () => {
        const solutionPath = path.join(testDir, 'solutions', 'example.csolution.yml');

        cmsisJson.setActiveSolution(solutionPath);

        expect(cmsisJson.getSettings().activeSolution).toBe('../solutions/example.csolution.yml');
        expect(cmsisJson.activeSolution).toBe(solutionPath);
    });

    it('stores explicit solution deactivation as null', () => {
        cmsisJson.setActiveSolution(null);

        expect(cmsisJson.getSettings().activeSolution).toBeNull();
        expect(cmsisJson.activeSolution).toBeNull();
    });

    it('merges the active solution without overwriting target selections', () => {
        fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
        fs.writeFileSync(testFilePath, JSON.stringify({ targetSet: { existing: { activeTargetType: 'Board' } } }));
        cmsisJson.setActiveSolution(path.join(testDir, 'example.csolution.yml'));

        expect(cmsisJson.saveActiveSolution()).toBe(true);
        expect(JSON.parse(fsUtils.readTextFile(testFilePath))).toEqual({
            activeSolution: '../example.csolution.yml',
            targetSet: { existing: { activeTargetType: 'Board' } },
        });
    });

    it('preserves unsaved target selections when saving the active solution', () => {
        cmsisJson.solutionPath = path.join(testDir, 'example.csolution.yml');
        cmsisJson.setSelectedSet('Board', 'release', ['', 'release'], ['Board']);
        cmsisJson.setActiveSolution(path.join(testDir, 'example.csolution.yml'));

        expect(cmsisJson.saveActiveSolution()).toBe(true);
        expect(cmsisJson.targetSetMap?.selectedTargetSets).toEqual([{
            targetType: { name: 'Board', index: 0 },
            targetSet: { name: 'release', index: 1 },
        }]);
        expect(cmsisJson.isDirty).toBe(true);
        expect(JSON.parse(fsUtils.readTextFile(testFilePath))).toEqual({
            activeSolution: '../example.csolution.yml',
        });
    });

    it('should store and resolve a selected target set by name', () => {
        cmsisJson.solutionPath = path.join(testDir, 'solutions', 'example.csolution.yml');

        cmsisJson.setSelectedSet('Board', 'release', ['', 'debug', 'release'], ['Simulator', 'Board']);

        expect(cmsisJson.targetSetMap?.selectedTargetSets).toEqual([{
            targetType: { name: 'Board', index: 1 },
            targetSet: { name: 'release', index: 2 },
        }]);
        const solutionSelections = cmsisJson.get<Record<string, ContextSelectionSettings>>('solutionSelections');
        expect(solutionSelections?.['../solutions/example.csolution.yml']).toBeDefined();
        expect(cmsisJson.getSelectedSet('Board', ['', 'debug', 'release'])).toBe(2);
    });

    it('recovers renamed target type and target set selections by ordinal', () => {
        cmsisJson.solutionPath = path.join(testDir, 'example.csolution.yml');
        cmsisJson.setActiveTargetType('Board', ['Simulator', 'Board']);
        cmsisJson.setSelectedSet('Board', 'release', ['', 'release'], ['Simulator', 'Board']);

        expect(cmsisJson.getActiveTargetType(['Simulator', 'RenamedBoard'])).toBe('RenamedBoard');
        expect(cmsisJson.getSelectedSet('RenamedBoard', ['', 'renamed-release'])).toBe(1);
        expect(cmsisJson.targetSetMap).toEqual({
            selectedTargetType: 'RenamedBoard',
            selectedTargetSets: [{
                targetType: { name: 'RenamedBoard', index: 1 },
                targetSet: { name: 'renamed-release', index: 1 },
            }],
        });
    });

    it('uses the stored ordinal when a target type name no longer exists', () => {
        cmsisJson.solutionPath = path.join(testDir, 'example.csolution.yml');
        cmsisJson.setActiveTargetType('Board', ['Simulator', 'Board']);
        cmsisJson.setSelectedSet('Board', 'release', ['', 'release'], ['Simulator', 'Board']);

        expect(cmsisJson.getActiveTargetType(['Inserted', 'RenamedBoard', 'Simulator'])).toBe('RenamedBoard');
        expect(cmsisJson.activeTargetTypeName).toBe('RenamedBoard');
    });

    it('uses the stored ordinal when a target set name no longer exists', () => {
        cmsisJson.solutionPath = path.join(testDir, 'example.csolution.yml');
        cmsisJson.setSelectedSet('Board', 'release', ['', 'release'], ['Board']);

        expect(cmsisJson.getSelectedSet('Board', ['', 'renamed-release', 'debug'])).toBe(1);
        expect(cmsisJson.targetSetMap?.selectedTargetSets).toEqual([{
            targetType: { name: 'Board', index: 0 },
            targetSet: { name: 'renamed-release', index: 1 },
        }]);
    });

    it('invalidates a selection when its stored ordinal is out of range', () => {
        cmsisJson.solutionPath = path.join(testDir, 'example.csolution.yml');
        cmsisJson.setSelectedSet('Board', 'release', ['', 'release'], ['Board']);

        expect(cmsisJson.getSelectedSet('Board', [''])).toBe(-1);
        expect(cmsisJson.hasSelectedSet('Board')).toBe(false);
    });

    it('should resolve and migrate legacy solution and target-set selections', async () => {
        cmsisJson.solutionPath = path.join(testDir, 'HelloWorld.csolution.yml');
        const legacySettings = {
            HelloWorld: { activeTargetType: 'FRDM-K32L3A6', 'FRDM-K32L3A6': 1 },
        };
        cmsisJson.set('targetSet', legacySettings);
        fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
        fs.writeFileSync(testFilePath, JSON.stringify({ targetSet: legacySettings }));

        expect(cmsisJson.getActiveTargetType(['FRDM-K32L3A6'])).toBe('FRDM-K32L3A6');
        expect(cmsisJson.getSelectedSet('FRDM-K32L3A6', ['', 'release'])).toBe(1);
        expect(cmsisJson.get('solutionSelections')).toEqual({
            '../HelloWorld.csolution.yml': { selectedTargetType: 'FRDM-K32L3A6', 'FRDM-K32L3A6': 1 },
        });

        cmsisJson.setSelectedSet('FRDM-K32L3A6', 'release', ['', 'release'], ['FRDM-K32L3A6']);
        expect(cmsisJson.targetSetMap).toEqual({
            selectedTargetType: 'FRDM-K32L3A6',
            selectedTargetSets: [{
                targetType: { name: 'FRDM-K32L3A6', index: 0 },
                targetSet: { name: 'release', index: 1 },
            }],
        });
        expect(await cmsisJson.saveResolvedSelections()).toBe(true);
        expect(JSON.parse(fsUtils.readTextFile(testFilePath)).solutionSelections).toEqual({
            '../HelloWorld.csolution.yml': {
                selectedTargetType: 'FRDM-K32L3A6',
                selectedTargetSets: [{
                    targetType: { name: 'FRDM-K32L3A6', index: 0 },
                    targetSet: { name: 'release', index: 1 },
                }],
            },
        });
    });

    it('should resolve a legacy selected target set index', () => {
        cmsisJson.solutionPath = path.join(testDir, 'example.csolution.yml');
        cmsisJson.set('targetSet', {
            example: { Board: 1 },
        });

        expect(cmsisJson.getSelectedSet('Board', ['', 'release'])).toBe(1);
    });

    it('should migrate a nested legacy solution key to the complete csolution filename', () => {
        cmsisJson.solutionPath = path.join(testDir, 'solutions', 'example.csolution.yml');
        cmsisJson.set('targetSet', {
            'solutions/example': { activeTargetType: 'Board', Board: 1 },
        });

        expect(cmsisJson.getActiveTargetType(['Board'])).toBe('Board');
        expect(cmsisJson.get('solutionSelections')).toEqual({
            '../solutions/example.csolution.yml': { selectedTargetType: 'Board', Board: 1 },
        });
    });

    it('removes a basename legacy key when the canonical solution entry already exists', async () => {
        cmsisJson.solutionPath = path.join(testDir, 'Hello', 'Hello.csolution.yml');
        const settings = {
            targetSet: {
                Hello: { activeTargetType: 'CS300' },
                '../Hello/Hello.csolution.yml': { activeTargetType: 'CS300-2' },
            },
        };
        cmsisJson.setSettings(settings);
        fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
        fs.writeFileSync(testFilePath, JSON.stringify(settings));
        cmsisJson.setSelectedSet('CS300-2', '', [''], ['CS300', 'CS300-2']);

        expect(await cmsisJson.saveResolvedSelections()).toBe(true);
        expect(JSON.parse(fsUtils.readTextFile(testFilePath))).toEqual({
            solutionSelections: {
                '../Hello/Hello.csolution.yml': {
                    selectedTargetType: 'CS300-2',
                    selectedTargetSets: [{
                        targetType: { name: 'CS300-2', index: 1 },
                        targetSet: { name: '', index: 0 },
                    }],
                },
            },
        });
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

    it('keeps resolved selections in memory and warns when persistence fails', async () => {
        const blockedDirectory = path.join(testDir, 'blocked');
        fs.writeFileSync(blockedDirectory, 'not a directory');
        const blockedCmsisJson = new CmsisSettingsJsonFile(path.join(blockedDirectory, 'cmsis.json'));
        blockedCmsisJson.solutionPath = path.join(testDir, 'example.csolution.yml');
        blockedCmsisJson.setActiveTargetType('Board', ['Board']);
        const warningSpy = jest.spyOn(vscode.window, 'showWarningMessage');

        await expect(blockedCmsisJson.saveResolvedSelections()).resolves.toBe(false);
        expect(blockedCmsisJson.activeTargetTypeName).toBe('Board');
        expect(warningSpy).toHaveBeenCalledWith('The CMSIS solution was loaded, but its resolved target selections could not be saved.');

        warningSpy.mockRestore();
        fs.rmSync(blockedDirectory, { force: true });
    });

    it('merges resolved selections from separate instances', async () => {
        const first = new CmsisSettingsJsonFile(testFilePath);
        first.solutionPath = path.join(testDir, 'first.csolution.yml');
        first.setActiveTargetType('First', ['First']);
        expect(await first.saveResolvedSelections()).toBe(true);

        const second = new CmsisSettingsJsonFile(testFilePath);
        second.solutionPath = path.join(testDir, 'second.csolution.yml');
        second.setActiveTargetType('Second', ['Second']);
        expect(await second.saveResolvedSelections()).toBe(true);

        expect(JSON.parse(fsUtils.readTextFile(testFilePath)).solutionSelections).toEqual({
            '../first.csolution.yml': { selectedTargetType: 'First' },
            '../second.csolution.yml': { selectedTargetType: 'Second' },
        });
    });

    it('preserves newer disk settings and unrelated unsaved settings when saving resolved selections', async () => {
        cmsisJson.solutionPath = path.join(testDir, 'example.csolution.yml');
        cmsisJson.set('localSetting', 'unsaved');
        cmsisJson.setActiveTargetType('Board', ['Board']);
        fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
        fs.writeFileSync(testFilePath, JSON.stringify({ diskSetting: 'newer' }));

        expect(await cmsisJson.saveResolvedSelections()).toBe(true);
        expect(JSON.parse(fsUtils.readTextFile(testFilePath))).toEqual({
            diskSetting: 'newer',
            solutionSelections: {
                '../example.csolution.yml': { selectedTargetType: 'Board' },
            },
        });
        expect(cmsisJson.getSettings()).toEqual({
            diskSetting: 'newer',
            localSetting: 'unsaved',
            solutionSelections: {
                '../example.csolution.yml': { selectedTargetType: 'Board' },
            },
        });
        expect(cmsisJson.isDirty).toBe(true);
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
