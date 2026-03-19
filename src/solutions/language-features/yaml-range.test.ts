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
import { textDocumentFactory } from '../../vscode-api/text-document.factories';
import { rangeFromYamlNode } from './yaml-range';
import * as YAML from 'yaml';
import { Position, Range } from 'vscode';

describe('rangeFromYamlNode', () => {
    it('extracts the range from a YAML node', () => {
        const lineNumber = 3;
        const charactersBeforeThirdLine = 5;

        const mapStartOffset = 16;
        const mapValueEndOffset = 25;
        const mapNodeEndOffset = 30;

        const yamlMap = new YAML.YAMLMap();
        yamlMap.range = [mapStartOffset, mapValueEndOffset, mapNodeEndOffset];
        const textDocument = textDocumentFactory();

        textDocument.positionAt.mockImplementation((offset: number) => {
            return new Position(lineNumber, offset - charactersBeforeThirdLine);
        });

        const output = rangeFromYamlNode(textDocument, yamlMap);

        const expected = new Range(
            new Position(lineNumber, mapStartOffset - charactersBeforeThirdLine),
            new Position(lineNumber, mapValueEndOffset - charactersBeforeThirdLine),
        );

        expect(output).toEqual(expected);
    });
});
