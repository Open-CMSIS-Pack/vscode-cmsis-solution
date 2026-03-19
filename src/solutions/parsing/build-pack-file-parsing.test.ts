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
import * as YAML from 'yaml';
import { parsePackFile } from './build-pack-file-parsing';

const emptyPackFile = 'cbuild-pack: {}';

const packFile = `
cbuild-pack:
  resolved-packs:
    - resolved-pack: alien::Pack@1.0.0
      selected-by-pack:
        - alien::Pack@1.0.0
        - alien::Pack@4.5.0
    - resolved-pack: monster::Pack@3.4.6
      selected-by:
        - monster::Pack@3.4.6
`;

describe('parsePackFile', () => {
    it('parses an empty pack file', () => {
        const yamlDocument = YAML.parseDocument(emptyPackFile);
        const parsedPackFile = parsePackFile(yamlDocument);

        const expected: typeof parsedPackFile = {
            resolvedPacks: []
        };
        expect(parsedPackFile).toEqual(expected);
    });

    it('parses a pack file', () => {
        const yamlDocument = YAML.parseDocument(packFile);
        const parsedPackFile = parsePackFile(yamlDocument);

        const expected: typeof parsedPackFile = {
            resolvedPacks: [
                {
                    resolvedPack: 'alien::Pack@1.0.0',
                    selectedByPack: [
                        'alien::Pack@1.0.0',
                        'alien::Pack@4.5.0'],
                },
                {
                    resolvedPack: 'monster::Pack@3.4.6',
                    selectedByPack: [
                        'monster::Pack@3.4.6'
                    ]
                }
            ]
        };
        expect(parsedPackFile).toEqual(expected);
    });
});
