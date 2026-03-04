/**
 * Copyright 2023-2026 Arm Limited
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

import * as YAML from 'yaml';
import { parseDefaultConfiguration } from './default-file-parsing';

const defaultConfiguration = `
default:
  compiler: CLANG
  misc:
    - Link:
      - --specs=nosys.specs
`;

const emptyDefaultConfiguration = 'default: {}';

describe('parseDefault', () => {
    it('parses a default file', () => {
        const yamlDocument = YAML.parseDocument(defaultConfiguration);
        const parsedDefaultConfiguration = parseDefaultConfiguration(yamlDocument);

        const expected: typeof parsedDefaultConfiguration = {
            defaultConfiguration: {
                compiler: 'CLANG',
            },
        };

        expect(parsedDefaultConfiguration).toEqual(expected);
    });

    it('parses an empty default file', () => {
        const yamlDocument = YAML.parseDocument(emptyDefaultConfiguration);
        const parsedDefaultConfiguration = parseDefaultConfiguration(yamlDocument);

        const expected: typeof parsedDefaultConfiguration  = {
            defaultConfiguration: {
                compiler: undefined,
            },
        };

        expect(parsedDefaultConfiguration).toEqual(expected);
    });
});
