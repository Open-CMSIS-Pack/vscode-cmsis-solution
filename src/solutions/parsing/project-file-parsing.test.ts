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
import { newProject, parseProject } from './project-file-parsing';
import { Project } from './project-file';
import { SolutionFile } from './solution-file';
import { emptyProcessorData } from './processor-data-parsing';
import { componentDataFactory } from './common-file-parsing.factories';
import { processorDataFactory } from './processor-data-parsing.factories';

const fullProject = `
project:
  description: a project that brings together human and alien technology
  compiler: AC6
  board: surf board
  device: plot
  processor:
    trustzone: secure
    fpu: dp
    dsp: on
    mve: fp
    endian: little
    branch-protection: bti
  components:
    - component: HumanTech:BubbleBlowingMachine
      instances: 3
    - component: AlienTech:WormholeOpener
      for-context:
        - Travel
        - Fun
    - component: AlienTech:Raygun
      for-context: Invading Earth
      not-for-context: Lighting birthday candles
  packs:
    - pack: Aliens::InTheSea@5.9.0
      for-context:
        - Invading Earth
        - With Dolphins
  layers:
    - layer: testing.clayer.yaml
      for-context:
        - Device
        - Board
  groups:
    - group: Source Files
      for-context: With Dolphins
      files:
        - file: ./main.c
          for-context: Without Dolphins
      misc:
        - C-CPP:
          - -O3
      groups:
        - group: Nested Files
          files:
            - file: ../hello/some-file.c
  misc:
    - C:
      - -std=c99
`;

const emptyProject = 'project: {}';

const projectWithInvalidComponentType = `
project:
  components:
    - Some component
`;

describe('parseProject', () => {
    it('parses a full project', () => {
        const yamlDocument = YAML.parseDocument(fullProject);
        const parsedProject = parseProject(yamlDocument);

        const expected: typeof parsedProject = {
            description: 'a project that brings together human and alien technology',
            compiler: 'AC6',
            board: 'surf board',
            device: 'plot',
            processor: {
                trustzone: 'secure',
                fpu: 'dp',
                dsp: 'on',
                mve: 'fp',
                endian: 'little',
                'branch-protection': 'bti'
            },
            components: [
                { reference: 'HumanTech:BubbleBlowingMachine', forContext: [], notForContext: [], instances: 3 },
                { reference: 'AlienTech:WormholeOpener', forContext: ['Travel', 'Fun'], notForContext: [], instances: 1 },
                { reference: 'AlienTech:Raygun', forContext: 'Invading Earth', notForContext: 'Lighting birthday candles', instances: 1 },
            ],
            packs: [
                { pack: 'Aliens::InTheSea@5.9.0', forContext: ['Invading Earth', 'With Dolphins'], notForContext: [] },
            ],
            groups: [
                {
                    name: 'Source Files',
                    forContext: 'With Dolphins',
                    notForContext: [],
                    files: [
                        {
                            name: './main.c' ,
                            forContext: 'Without Dolphins',
                            notForContext: []
                        }
                    ],
                    groups: [{
                        name: 'Nested Files',
                        forContext: [],
                        notForContext: [],
                        files: [
                            {
                                name: '../hello/some-file.c',
                                forContext: [],
                                notForContext: []
                            }
                        ],
                        groups: [],
                    }],
                },
            ],
            layers: [{
                reference: 'testing.clayer.yaml',
                forContext: ['Device', 'Board'],
                notForContext: []
            }]
        };

        expect(parsedProject).toEqual(expected);
    });

    it('parses an empty project', () => {
        const yamlDocument = YAML.parseDocument(emptyProject);
        const parsedProject = parseProject(yamlDocument);

        const expected: typeof parsedProject = {
            processor: emptyProcessorData,
            components: [],
            groups: [],
            packs: [],
            layers: [],
        };

        expect(parsedProject).toEqual(expected);
    });

    it('returns an empty project if yaml is not valid', () => {
        const yamlDocument = YAML.parseDocument(projectWithInvalidComponentType);
        const parsedProject = parseProject(yamlDocument);

        const expected: typeof parsedProject = {
            description: undefined,
            compiler: undefined,
            board: undefined,
            device: undefined,
            processor: undefined,
            components: [],
            groups: [],
            packs: [],
            layers: [],
        };

        expect(parsedProject).toEqual(expected);
    });
});

describe('newProject', () => {
    it('creates a new project', () => {
        const processor = processorDataFactory();
        const components = [componentDataFactory()];
        const projectPath = 'some-path';
        const processorName = 'core';

        const expected: SolutionFile<Project> = {
            path: projectPath,
            value: {
                processor,
                device: `:${processorName}`,
                components,
                packs: [],
                groups: [],
                layers: [],
            },
        };

        expect(newProject(projectPath, processorName, processor, components)).toEqual(expected);
    });

    it('does not create a device entry if there is no processor', () => {
        const processor = processorDataFactory();
        const components = [componentDataFactory()];
        const projectPath = 'some-path';

        const expected: SolutionFile<Project> = {
            path: projectPath,
            value: {
                processor,
                components,
                packs: [],
                groups: [],
                layers: [],
            },
        };

        expect(newProject(projectPath, '', processor, components)).toEqual(expected);
    });
});
