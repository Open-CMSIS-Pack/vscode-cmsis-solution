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

import { TestDataHandler } from '../__test__/test-data';
import * as fsUtils from '../utils/fs-utils';
import { JsonFile } from './json-file';
import { assureProperty } from './schema';
import { parse as parseJson } from 'jsonc-parser';
import { ETextFileResult } from './text-file';

interface TestContent {
    key: string;
}

class JsonFileTest extends JsonFile {
    get testContent() : TestContent {
        const obj = this.object;
        assureProperty(obj as object, 'key', (value): value is string => typeof value === 'string', '');
        return obj as TestContent;
    }

    public override exists() {
        return true;
    }
}

describe('JsonFile', () => {
    const testDataHandler = new TestDataHandler();
    const filePath = 'path/to/file.json';
    let jsonFile : JsonFileTest;

    beforeEach(() => {
        jsonFile = new JsonFileTest(filePath);
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });


    it('should load empty file', async () => {
        // Mock the file system operations
        const mockContent = '';
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);

        await jsonFile.load();
        expect(jsonFile.content).toBeUndefined();
        expect(jsonFile.testContent).toEqual({ key: '' });
    });

    it('should load JSON file but skip save without changes', async () => {
        const mockContent = JSON.stringify({ key: 'value' }, null, 4);
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);
        const writeSpy = jest.spyOn(fsUtils, 'writeTextFile').mockImplementation(() => {});

        await jsonFile.load();
        expect(jsonFile.content).toEqual(JSON.parse(mockContent));

        await jsonFile.save();
        expect(writeSpy).not.toHaveBeenCalled();

        await jsonFile.save();
        expect(writeSpy).not.toHaveBeenCalled();
    });

    it('should load and save JSON file with changes', async () => {
        const mockContent = JSON.stringify({ key: 'value' }, null, 4);
        const mockChangedContent = JSON.stringify({ key: 'newValue' }, null, 4);
        const mockObjectContent = JSON.stringify({ key: 'ObjectValue' }, null, 4);

        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);
        const writeSpy = jest.spyOn(fsUtils, 'writeTextFile').mockImplementation(() => {});

        await jsonFile.load();
        expect(jsonFile.content).toEqual(JSON.parse(mockContent));
        expect(jsonFile.isModified()).toBeFalsy();

        jsonFile.testContent.key = 'newValue';
        expect(jsonFile.isModified()).toBeTruthy();

        await jsonFile.save();
        expect(writeSpy).toHaveBeenCalledWith(filePath, mockChangedContent);
        expect(jsonFile.isModified()).toBeFalsy();

        await jsonFile.save();
        expect(writeSpy).toHaveBeenCalledWith(filePath, mockChangedContent);
        expect(jsonFile.isDirty).toBeFalsy();

        jsonFile.content = JSON.parse(mockObjectContent);
        expect(jsonFile.isDirty).toBeTruthy();
        await jsonFile.save();
        expect(writeSpy).toHaveBeenCalledWith(filePath, mockObjectContent);

    });

    it('should load JSON file with comments', async () => {
        // Mock the file system operations
        const mockContent = `{
            // Some leading comment
            "version": "0.2.0",
            "configurations": []
            }
            `;
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);
        const result = await jsonFile.load();
        expect(result).toEqual(ETextFileResult.Success);
        expect(jsonFile.object).toEqual(parseJson(mockContent));
    });

});
