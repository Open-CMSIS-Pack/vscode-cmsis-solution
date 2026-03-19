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

import { assureProperty } from './schema';
import { YamlFile } from './yaml-file';
import * as YAML from 'yaml';
import * as fsUtils from '../utils/fs-utils';

interface TestContent {
    key: string;
}

class YamlFileTest extends YamlFile {
    get Content() : TestContent {
        const obj = this.object;
        assureProperty(obj, 'key', (value): value is string => typeof value === 'string', '');
        return obj as TestContent;
    }

    set Content(content: TestContent) {
        this.contentObject = content;
    }

    public override exists() {
        return true;
    }
}

describe('YamlFile', () => {
    const filePath = 'path/to/file.yaml';
    let yamlFile: YamlFileTest;

    beforeEach(() => {
        yamlFile = new YamlFileTest(filePath);
    });

    it('should load empty file', async () => {
        const mockContent = '';
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);

        await yamlFile.load();
        expect(yamlFile.Content).toEqual({ key: '' });
    });

    it('should load YAML file but skip save without changes', async () => {
        const mockContent = YAML.stringify({ key: 'value' });
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);
        const writeSpy = jest.spyOn(fsUtils, 'writeTextFile').mockImplementation(() => {});

        await yamlFile.load();
        expect(yamlFile.Content).toEqual(YAML.parse(mockContent));

        await yamlFile.save();
        expect(writeSpy).not.toHaveBeenCalled();

        await yamlFile.save();
        expect(writeSpy).not.toHaveBeenCalled();
    });

    it('should load and save YAML file with changes', async () => {
        const mockContent = YAML.stringify({ key: 'value' });
        const mockChangedContent = YAML.stringify({ key: 'newValue' });

        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);
        const writeSpy = jest.spyOn(fsUtils, 'writeTextFile').mockImplementation(() => {});

        await yamlFile.load();
        expect(yamlFile.Content).toEqual(YAML.parse(mockContent));

        yamlFile.Content.key = 'newValue';

        await yamlFile.save();
        expect(writeSpy).toHaveBeenCalledWith(filePath, mockChangedContent);

        yamlFile.Content.key = 'newValue';

        await yamlFile.save();
        expect(writeSpy).toHaveBeenCalledWith(filePath, mockChangedContent);
    });

    it('should load YAML file with comments', async () => {
        const mockContent = `
            # Some leading comment
            version: "0.2.0"
            configurations:
              - name: Desktop Extension
                type: extensionHost
                request: launch
        `;
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockContent);

        await yamlFile.load();
        expect(yamlFile.object).toEqual(YAML.parse(mockContent));
    });
});
