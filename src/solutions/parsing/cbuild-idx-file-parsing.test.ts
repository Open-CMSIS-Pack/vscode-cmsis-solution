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
import { parseCBuildIdx } from './cbuild-idx-file-parsing';

const emptyCbuildIdxFile = 'build-idx: {}';

const cbuildeIdxFile = `
build-idx:
  generated-by: csolution extension unit test
  cdefault: cdefault.yml
  csolution: UnitTest.csolution.yml
  cprojects:
    - cproject: UnitTest/UnitTest.cproject.yml
      clayers:
        - clayer: UnitTest/$Board-Layer$
  cbuilds:
    - cbuild: UnitTest/UnitTest.Debug+BoardDummy.cbuild.yml
      project: UnitTest
      configuration: .Debug+BoardDummy
      clayers:
        - clayer: Board/BoardDummy/Board.clayer.yml
        - clayer: Board/BoardDummy/Gen/Board.cgen.yml
    - cbuild: UnitTest/UnitTest.Release+BoardDummy.cbuild.yml
      project: UnitTest
      configuration: .Release+BoardDummy
`;

describe('parseCbuildIdxFile', () => {
    it('parses an empty file', () => {
        const yamlDocument = YAML.parseDocument(emptyCbuildIdxFile);
        const parsedCbuildIdxFile = parseCBuildIdx(yamlDocument);

        const expected: typeof parsedCbuildIdxFile = { cbuildRefs:[], configurations: [] };
        expect(parsedCbuildIdxFile).toEqual(expected);
    });

    it('parses a pack file', () => {
        const yamlDocument = YAML.parseDocument(cbuildeIdxFile);
        const parsedCbuildIdxFile = parseCBuildIdx(yamlDocument);

        const expected: typeof parsedCbuildIdxFile = {
            cbuildRefs: [
                {
                    path: 'UnitTest/UnitTest.Debug+BoardDummy.cbuild.yml',
                },
                {
                    path: 'UnitTest/UnitTest.Release+BoardDummy.cbuild.yml',
                }
            ],

            configurations: [],
        };
        expect(parsedCbuildIdxFile).toEqual(expected);
    });
});
