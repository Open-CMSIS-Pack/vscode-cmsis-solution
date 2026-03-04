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

import 'jest';
import * as YAML from 'yaml';
import { YAMLMap } from 'yaml';
import { parseContextRestriction } from './context-restriction-parsing';

const noRestrictionYaml = `
someField: some value
`;

const stringLiteralRestrictionYaml = `
someField: some value
for-context: +Target
`;

const forContextRestrictionYaml = `
someField: some value
for-context:
  - +Target
  - +Target.Release
`;

const notForContextRestrictionYaml = `
someField: some value
not-for-context:
  - +Target
  - +Target.Release
`;

describe('parseContextRestriction', () => {
    it('returns empty arrays when the input map has neither for-context nor not-for-context', () => {
        const rootNode = YAML.parseDocument(noRestrictionYaml).contents as YAMLMap;
        const output = parseContextRestriction(rootNode);
        const expected: typeof output = { notForContext: [], forContext: [] };
        expect(output).toEqual(expected);
    });

    it('parses a map with a string literal for-context', () => {
        const rootNode = YAML.parseDocument(stringLiteralRestrictionYaml).contents as YAMLMap;
        const output = parseContextRestriction(rootNode);
        const expected: typeof output = { notForContext: [], forContext: '+Target' };
        expect(output).toEqual(expected);
    });

    it('parses a map with a string list for-context', () => {
        const rootNode = YAML.parseDocument(forContextRestrictionYaml).contents as YAMLMap;
        const output = parseContextRestriction(rootNode);
        const expected: typeof output = { notForContext: [], forContext: ['+Target', '+Target.Release'] };
        expect(output).toEqual(expected);
    });

    it('parses a map with a string list not-for-context', () => {
        const rootNode = YAML.parseDocument(notForContextRestrictionYaml).contents as YAMLMap;
        const output = parseContextRestriction(rootNode);
        const expected: typeof output = { forContext: [], notForContext: ['+Target', '+Target.Release'] };
        expect(output).toEqual(expected);
    });
});
