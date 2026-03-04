/**
 * Copyright 2024-2026 Arm Limited
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

import { CTreeItemFile, CTreeItemYamlFile, CTreeItemJsonFile, CTreeItemXmlFile } from './tree-item-file';
import { CTreeItem, ETreeItemKind } from './tree-item';
import { CTreeItemBuilder } from './tree-item-builder';
import { ITreeItemParser } from './tree-item-parser';
import { it } from '@jest/globals';
import path from 'path';
import { ETextFileResult } from './text-file';
import { TestDataHandler } from '../__test__/test-data';


// A test utility function for creating a test root item
function createTestRootItem(): CTreeItem {
    const root = new CTreeItem();
    root.setKind(ETreeItemKind.Map);
    const top = root.createChild('options').setKind(ETreeItemKind.Map);
    top.setValue('name', 'test');
    top.setValue('value', 'example');
    return root;
}


describe('CTreeItemFile', () => {
    let mockParser: ITreeItemParser<CTreeItem>;
    let mockBuilder: CTreeItemBuilder;
    let mockRootItem: CTreeItem;

    beforeEach(() => {
        mockBuilder = new CTreeItemBuilder('');
        mockParser = {
            parse: jest.fn(),
            builder: mockBuilder
        } as unknown as ITreeItemParser<CTreeItem>;
        mockRootItem = {
            toObject: jest.fn(() => ({ foo: 'bar' })),
            getChildItem: jest.fn(() => 'childItem'),
            setProperty: jest.fn()
        } as unknown as CTreeItem;
    });

    it('constructor sets fileName and parser', () => {
        const file = new CTreeItemFile('file.txt', mockParser);
        expect(file.fileName).toBe('file.txt');
        expect(file.parser).toBe(mockParser);
    });

    it('builder getter/setter works', () => {
        const file = new CTreeItemFile();
        expect(file.builder).toBeUndefined();
        file.parser = mockParser;
        file.builder = mockBuilder;
        expect(file.builder).toBe(mockBuilder);
    });

    it('fileName setter updates builder.fileName if builder exists', () => {
        const file = new CTreeItemFile('old.txt', mockParser);
        file.parser = mockParser;
        file.builder = mockBuilder;
        file.fileName = 'new.txt';
        expect(file.fileName).toBe('new.txt');
        expect(file.builder?.fileName).toBe('new.txt');
    });

    it('fileName setter does not throw if builder is undefined', () => {
        const file = new CTreeItemFile('old.txt', mockParser);
        expect(() => { file.fileName = 'new.txt'; }).not.toThrow();
    });

    it('ensure root item', () => {
        const file = new CTreeItemFile('file.txt', mockParser);
        expect(file.rootItem).toBeUndefined();
        const root = file.ensureRootItem();
        expect(root).toBeDefined();
        expect(root).toBe(file.rootItem);
    });

    it('ensure top item', () => {
        const file = new CTreeItemFile('file.txt', mockParser);
        expect(file.topItem).toBeUndefined();
        const top = file.ensureTopItem('foo');
        expect(top).toBeDefined();
        expect(top?.getParent()).toBe(file.rootItem);
        expect(file.rootItem?.getChild('foo')).toBe(top);
        expect(top?.getTag()).toBe('foo');
        const top1 = file.ensureTopItem();
        expect(top1).toBe(top);
        expect(top1.getTag()).toBe('foo');
    });


    it('content getter returns rootItem', () => {
        const file = new CTreeItemFile();
        file.rootItem = mockRootItem;
        expect(file.content).toBe(mockRootItem);
    });

    it('object getter returns rootItem.toObject() if rootItem exists', () => {
        const file = new CTreeItemFile();
        file.rootItem = mockRootItem;
        expect(file.object).toEqual({ foo: 'bar' });
    });

    it('object getter returns {} if rootItem does not exist', () => {
        const file = new CTreeItemFile();
        file.rootItem = undefined;
        expect(file.object).toEqual({});
    });

    it('rootItem getter/setter works', () => {
        const file = new CTreeItemFile();
        file.rootItem = mockRootItem;
        expect(file.rootItem).toBe(mockRootItem);
    });

    it('topItem getter returns rootItem.getChildItem() if rootItem exists', () => {
        const file = new CTreeItemFile();
        file.rootItem = mockRootItem;
        expect(file.topItem).toBe('childItem');
    });

    it('topItem getter returns undefined if rootItem does not exist', () => {
        const file = new CTreeItemFile();
        file.rootItem = undefined;
        expect(file.topItem).toBeUndefined();
    });

    it('parse sets fileName property on root', () => {
        const file = new CTreeItemFile('test.txt', mockParser);
        (mockParser.parse as jest.Mock).mockReturnValue(mockRootItem);
        file.text = 'dummy';
        const root = file.parse();
        expect(root).toBe(mockRootItem);
        expect(root.rootFileName).toEqual('test.txt');
    });
});

describe('CTreeItemYamlFile', () => {
    const testDataHandler = new TestDataHandler();
    let tmpSolutionDir: string;
    beforeAll(async () => {
        tmpSolutionDir = testDataHandler.copyTestDataToTmp('solutions');
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });

    it('test loading non-existing file', async () => {
        const ymlFile = new CTreeItemYamlFile();
        ymlFile.readOnly = true;
        const fileName = testDataHandler.tmpFileName('dummyFile.yml');
        const loadResult = await ymlFile.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.NotExists);
        expect(testDataHandler.errorMessageSpy).toHaveBeenCalledWith(ymlFile.errors.join('\n'));
        const root = ymlFile.rootItem;
        expect(root).toEqual(undefined);
        expect(ymlFile.text).toEqual('');
    });

    it('test load/save existing file', async () => {
        const fileName = path.join(tmpSolutionDir, 'simple', 'test.csolution.yml');
        const ymlFile = new CTreeItemYamlFile();

        let loadResult = await ymlFile.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);
        // load again: should be unchanged
        loadResult = await ymlFile.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Unchanged);
        expect(ymlFile.fileName).toBe(fileName);
        expect(ymlFile.fileDir).toBe(path.dirname(fileName));
        const root = ymlFile.rootItem;
        expect(root).toBeInstanceOf(CTreeItem);
        expect(root!.rootFileName).toBe(fileName);
        expect(root!.rootFileDir).toBe(path.dirname(fileName));

        let content = ymlFile.text;

        // use second file to ensure for comparison
        const ymlFile1 = new CTreeItemYamlFile();
        let loadResult1 = await ymlFile1.load(fileName);
        expect(loadResult1).toEqual(ETextFileResult.Success);

        loadResult1 = await ymlFile1.load(fileName);
        expect(loadResult1).toEqual(ETextFileResult.Unchanged);

        let content1 = ymlFile1.text;

        expect(content).not.toEqual('');
        expect(content).toEqual(content1);

        // save
        let saveResult = await ymlFile.save();
        expect(saveResult).toEqual(ETextFileResult.Success);

        // save unchanged
        saveResult = await ymlFile.save();
        expect(saveResult).toEqual(ETextFileResult.Unchanged);

        loadResult1 = await ymlFile1.load(fileName);
        expect(loadResult1).toEqual(ETextFileResult.Success);

        loadResult1 = await ymlFile1.load(fileName);
        expect(loadResult1).toEqual(ETextFileResult.Unchanged);

        // modify and save file
        const firstChild = root!.getChild(); // solution node
        expect(!!firstChild).toEqual(true);
        expect(ymlFile.topItem).toEqual(firstChild);
        // add defines element
        firstChild!.createChild('defines').setKind(ETreeItemKind.Sequence).createChild('-').setText('Ddummy');
        // save changes
        saveResult = await ymlFile.save();
        content = ymlFile.text.trim();
        expect(saveResult).toEqual(ETextFileResult.Success);
        // validate changes saved
        loadResult1 = await ymlFile1.load(fileName);
        expect(loadResult1).toEqual(ETextFileResult.Success);
        content1 = ymlFile1.text.trim();
        expect(content).toEqual(content1);

        const root1 = ymlFile1.rootItem;
        expect(root1).toBeInstanceOf(CTreeItem);
        const firsChild1 = root1!.getChild(); // solution node
        const definesChild = firsChild1!.getChild('defines');
        expect(definesChild).toBeDefined();
        expect(definesChild!.getValue()).toEqual('Ddummy');
    });
});

describe('CTreeItemJsonFile', () => {
    const testDataHandler = new TestDataHandler();
    const tmpDir = testDataHandler.tmpDir;
    const fileName = path.join(tmpDir, 'testFile.json');

    afterEach(() => {
        testDataHandler.rmFile(fileName);
    });

    afterAll(() => {
        testDataHandler.dispose();
    });

    it('should create, save, load, and modify JSON tree item file', async () => {
        // Create a root item and save to file
        const root = createTestRootItem();

        const jsonFile = new CTreeItemJsonFile(fileName);
        jsonFile.rootItem = root;
        let saveResult = await jsonFile.save();
        expect(saveResult).toBe(ETextFileResult.Success);
        const text = jsonFile.text;
        expect(text.includes('options')).toBeTruthy();
        // Load the file and check content
        const jsonFile2 = new CTreeItemJsonFile();
        let loadResult = await jsonFile2.load(fileName);
        const text2 = jsonFile2.text;
        expect(text2).toEqual(text);
        expect(loadResult).toBe(ETextFileResult.Success);
        expect(jsonFile2.fileName).toBe(fileName);
        expect(jsonFile2.rootItem).toBeInstanceOf(CTreeItem);

        // Check the defines value
        const loadedRoot = jsonFile2.rootItem!;
        const options = loadedRoot.getChild('options');
        expect(options).toBeDefined();
        expect(options?.getValue('name')).toBe('test');

        // Modify and save again
        options!.setValue('foo', 'bar');
        saveResult = await jsonFile2.save();
        expect(saveResult).toBe(ETextFileResult.Success);

        // Reload and verify modification
        const jsonFile3 = new CTreeItemJsonFile(fileName);
        loadResult = await jsonFile3.load();
        expect(loadResult).toBe(ETextFileResult.Success);
        const options2 = jsonFile3.rootItem!.getChild('options');
        expect(options2?.getValue('foo')).toEqual('bar');
    });
});

describe('CTreeItemXmlFile', () => {
    const testDataHandler = new TestDataHandler();
    const tmpDir = testDataHandler.tmpDir;
    const fileName = path.join(tmpDir, 'testFile.xml');

    afterEach(() => {
        testDataHandler.rmFile(fileName);
    });

    afterAll(() => {
        testDataHandler.dispose();
    });

    it('should create, save, load, and modify XML tree item file', async () => {
        const root = createTestRootItem();

        const xmlFile = new CTreeItemXmlFile(fileName);
        xmlFile.rootItem = root;
        let saveResult = await xmlFile.save();
        expect(saveResult).toBe(ETextFileResult.Success);
        const text = xmlFile.text;
        expect(text.includes('options')).toBeTruthy();
        // Load the file and check content
        const xmlFile2 = new CTreeItemXmlFile();
        let loadResult = await xmlFile2.load(fileName);
        const text2 = xmlFile2.text;
        expect(text2).toEqual(text);
        expect(loadResult).toBe(ETextFileResult.Success);
        expect(xmlFile2.fileName).toBe(fileName);
        expect(xmlFile2.rootItem).toBeInstanceOf(CTreeItem);

        // Check the defines value
        const loadedRoot = xmlFile2.rootItem!;
        const options = loadedRoot.getChild('options');
        expect(options).toBeDefined();
        expect(options?.getValue('name')).toBe('test');

        // Modify and save again
        options!.setValue('foo', 'bar');
        saveResult = await xmlFile2.save();
        expect(saveResult).toBe(ETextFileResult.Success);

        // Reload and verify modification
        const xmlFile3 = new CTreeItemXmlFile(fileName);
        loadResult = await xmlFile3.load();
        expect(loadResult).toBe(ETextFileResult.Success);
        const options2 = xmlFile3.rootItem!.getChild('options');
        expect(options2?.getValue('foo')).toEqual('bar');
    });
});

