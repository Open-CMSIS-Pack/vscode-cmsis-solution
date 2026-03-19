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

import 'jest';
import { workspaceFsProviderFactory } from '../../vscode-api/workspace-fs-provider.factories';
import { editYamlFile } from './edit-yaml-file';
import { URI } from 'vscode-uri';
import { faker } from '@faker-js/faker';
import { YAMLMap, Document as YamlDocument } from 'yaml';

describe('editYamlFile', () => {
    it('applies the given modification functions in turn to the file, then saves the file', async () => {
        const fileUri = URI.file(faker.system.filePath());
        const workspaceFsProvider = workspaceFsProviderFactory();

        const inputYaml = 'someKey: initialValue\n';
        workspaceFsProvider.readUtf8File.mockImplementation(async fsPath => fsPath === fileUri.fsPath ? inputYaml : '');

        const modificationFunction = (document: YamlDocument): void => {
            (document.contents as YAMLMap).set('someKey', 'newValue');
        };

        await editYamlFile(workspaceFsProvider, fileUri, [modificationFunction]);

        const expectedYaml = 'someKey: newValue\n';
        expect(workspaceFsProvider.writeUtf8File).toHaveBeenCalledWith(fileUri.fsPath, expectedYaml);
    });
});
