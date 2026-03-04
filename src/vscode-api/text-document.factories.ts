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

import { TextDocument } from 'vscode';
import { URI as Uri } from 'vscode-uri';
import { faker } from '@faker-js/faker';
import { makeFactory } from '../__test__/test-data-factory';

export const textDocumentFactory = makeFactory<jest.Mocked<TextDocument>>({
    uri: () => Uri.file(faker.system.filePath()),
    fileName: () => faker.system.fileName(),
    isUntitled: () => false,
    languageId: () => faker.word.noun(),
    encoding: () => 'utf8',
    version: () => faker.number.int(),
    isDirty: () => false,
    isClosed: () => false,
    eol: () => 1,
    lineCount: () => faker.number.int(),
    save: () => jest.fn(),
    lineAt: () => jest.fn(),
    offsetAt: () => jest.fn(),
    positionAt: () => jest.fn(),
    getText: () => jest.fn(),
    getWordRangeAtPosition: () => jest.fn(),
    validateRange: () => jest.fn(),
    validatePosition: () => jest.fn(),
});
