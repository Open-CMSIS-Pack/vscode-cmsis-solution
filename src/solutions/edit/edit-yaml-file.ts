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

import { Uri } from 'vscode';
import { WorkspaceFsProvider } from '../../vscode-api/workspace-fs-provider';
import { Document as YamlDocument } from 'yaml';
import * as yaml from 'yaml';

export const editYamlFile = async (
    workspaceFsProvider: WorkspaceFsProvider,
    fileUri: Uri,
    documentModifications: Array<(yamlDocument: YamlDocument) => void>,
): Promise<void> => {
    const initialFileContents = await workspaceFsProvider.readUtf8File(fileUri.fsPath);
    const yamlDocument = yaml.parseDocument(initialFileContents);

    for (const modificationFunction of documentModifications) {
        modificationFunction(yamlDocument);
    }

    await workspaceFsProvider.writeUtf8File(fileUri.fsPath, yaml.stringify(yamlDocument));
};
