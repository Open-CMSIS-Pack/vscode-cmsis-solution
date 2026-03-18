/**
 * Copyright 2023-2026 Arm Limited
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

import * as YAML from 'yaml';
import { emptyProcessorData } from './processor-data-parsing';
import { DEFAULT_BUILD_TYPES, Solution, SolutionFile } from './solution-file';
import { newSolution, parseSolution } from './solution-file-parsing';

const fullSolution = `
solution:
  created-for: cmsis-toolbox@2.0
  cdefault:
  misc:
    - C-CPP:
      - -O3
  compiler: IAR
  build-types:
    - type: Debug
      compiler: GCC
      debug: "on"
      type: Debug
      misc:
        - Link:
            - --specs=nosys.specs
      optimize: "none"
    - type: Release
      compiler: AC6
    - type: Other
      processor:
        trustzone: secure
  packs:
    - pack: ARM::CMSIS@5.9.0
      not-for-context: .Release
    - pack: AWS::AWS_IoT_Jobs@4.0.0
    - pack: AWS::AWS_IoT_Over-the-air_Update@4.0.1
  projects:
    - project: testing.cproject.yaml
      for-context:
        - +Device
        - +Board
  target-types:
    - type: Device
      device: NXP::K32L3A60VPJ1A:cm4
      variables:
        - Board-Layer: Board.clayer.yml
        - Shield-Layer: Shield.clayer.yml
    - type: Board
      board: A::Board
      compiler: AC6
      processor:
        trustzone: secure
        fpu: dp
        dsp: on
        mve: fp
        endian: little
        branch-protection: bti
      misc:
        - C:
          - -std=c99
`;

const defaultLessSolution = `
solution:
  compiler: IAR
  build-types:
    - type: Debug
      compiler: GCC
      debug: "on"
      type: Debug
      misc:
        - Link:
            - --specs=nosys.specs
      optimize: "none"
  packs:
    - pack: ARM::CMSIS@5.9.0
      not-for-context: .Release
  projects:
    - project: testing.cproject.yaml
  target-types:
    - type: Device
      device: NXP::K32L3A60VPJ1A:cm4
`;
const emptySolution = 'solution: {}';

describe('parseSolution', () => {
    it('parses a full solution with a cdefault specified', () => {
        const yamlDocument = YAML.parseDocument(fullSolution);
        const parsedSolution = parseSolution(yamlDocument);

        const expected: typeof parsedSolution = {
            compiler: 'IAR',
            processor: emptyProcessorData,
            projects: [
                {
                    reference: 'testing.cproject.yaml',
                    forContext: ['+Device', '+Board'],
                    notForContext: []
                }
            ],
            buildTypes: [
                { type: 'Debug', compiler: 'GCC', processor: emptyProcessorData, debug: 'on', optimize: 'none' },
                { type: 'Release', compiler: 'AC6', processor: emptyProcessorData, debug: '', optimize: '' },
                { type: 'Other', compiler: '', processor: { ...emptyProcessorData, trustzone: 'secure' }, debug: '', optimize: '' },
            ],
            targetTypes: [
                { type: 'Device', device: 'NXP::K32L3A60VPJ1A:cm4', board: '', compiler: '', processor: emptyProcessorData,
                    variables: [{ name: 'Board-Layer', value: 'Board.clayer.yml' }, { name: 'Shield-Layer', value: 'Shield.clayer.yml' } ]
                },
                { type: 'Board', device: '', board: 'A::Board', compiler: 'AC6',
                    processor: { trustzone: 'secure', fpu: 'dp', dsp: 'on', mve: 'fp', endian: 'little', 'branch-protection': 'bti' },
                    variables: []
                },
            ],
            packs: [
                { pack: 'ARM::CMSIS@5.9.0', forContext: [], notForContext: '.Release' },
                { pack: 'AWS::AWS_IoT_Jobs@4.0.0', forContext: [], notForContext: [] },
                { pack: 'AWS::AWS_IoT_Over-the-air_Update@4.0.1', forContext: [], notForContext: [] }
            ],
            cdefault: true,
            createdFor: 'cmsis-toolbox@2.0'
        };

        expect(parsedSolution).toEqual(expected);
    });

    it('parses a full solution without a cdefault specified', () => {
        const yamlDocument = YAML.parseDocument(defaultLessSolution);
        const parsedSolution = parseSolution(yamlDocument);

        const expected: typeof parsedSolution = {
            compiler: 'IAR',
            processor: emptyProcessorData,
            projects: [
                {
                    reference: 'testing.cproject.yaml',
                    forContext: [],
                    notForContext: []
                }
            ],
            buildTypes: [
                { type: 'Debug', compiler: 'GCC', processor: emptyProcessorData, debug: 'on', optimize: 'none' },
            ],
            targetTypes: [
                { type: 'Device', device: 'NXP::K32L3A60VPJ1A:cm4', board: '', compiler: '', processor: emptyProcessorData,
                    variables: []
                },
            ],
            packs: [
                { pack: 'ARM::CMSIS@5.9.0', forContext: [], notForContext: '.Release' },
            ],
            cdefault: undefined,
        };

        expect(parsedSolution).toEqual(expected);
    });

    it('parses an empty solution', () => {
        const yamlDocument = YAML.parseDocument(emptySolution);
        const parsedSolution = parseSolution(yamlDocument);

        const expected: typeof parsedSolution = {
            projects: [],
            buildTypes: [],
            targetTypes: [],
            compiler: undefined,
            cdefault: undefined,
            packs: [],
            processor: emptyProcessorData,
        };

        expect(parsedSolution).toEqual(expected);
    });
});

describe('newSolution', () => {
    it('creates a new solution', () => {
        const targetType = {
            type: 'some-type',
            device: 'a device',
        };

        const solution = newSolution('some-solution', ['some-project1', 'some-project2'], [targetType], [ { pack: 'some-pack-id', forContext: [], notForContext: [] } ], 'some-compiler');

        const expected: SolutionFile<Solution> = {
            path: 'some-solution',
            value: {
                projects: [{ reference: 'some-project1', forContext: [], notForContext: [] }, { reference: 'some-project2', forContext: [], notForContext: [] }],
                targetTypes: [targetType],
                buildTypes: DEFAULT_BUILD_TYPES,
                packs: [{ pack: 'some-pack-id', forContext: [], notForContext: [] }],
                compiler: 'some-compiler',
            }
        };

        expect(solution).toEqual(expected);
    });
});
