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
import { parseLayer } from './layer-file-parsing';
import { processorDataFactory } from './processor-data-parsing.factories';

const layer = `
layer:
  description: a layer that brings together human and alien technology
  compiler: AC6
  board: surf board
  device: plot
  processor:
    trustzone: secure
  components:
    - component: HumanTech:BubbleBlowingMachine
    - component: AlienTech:WormholeOpener
      for-context:
        - Travel
        - Fun
    - component: AlienTech:Raygun
      for-context: Invading Earth
      not-for-context: Lighting birthday candles
  packs:
    - pack: Aliens::InTheSea@5.9.0
      for-context: Invading Earth
  misc:
    - Link:
      - link-to-alien-overlords
      C:
        - std=c99
    - ASM:
      - -masm=auto
  groups:
    - group: Source Files
      for-context: Invading Earth
      files:
        - file: ./main.c
          not-for-context: Surviving Humans
      groups:
        - group: Nested Files
          files:
            - file: ../hello/some-file.c
`;

const emptyLayer = 'layer: {}';

describe('parseLayer', () => {
    it('parses a layer', () => {
        const yamlDocument = YAML.parseDocument(layer);
        const parsedLayer = parseLayer(yamlDocument);

        const expected: typeof parsedLayer = {
            description: 'a layer that brings together human and alien technology',
            compiler: 'AC6',
            board: 'surf board',
            device: 'plot',
            processor: processorDataFactory({ trustzone: 'secure' }),
            components: [
                { reference: 'HumanTech:BubbleBlowingMachine', forContext: [], notForContext: [], instances: 1 },
                { reference: 'AlienTech:WormholeOpener', forContext: ['Travel', 'Fun'], notForContext: [], instances: 1 },
                { reference: 'AlienTech:Raygun', forContext: 'Invading Earth', notForContext: 'Lighting birthday candles', instances: 1 },
            ],
            packs: [
                { pack: 'Aliens::InTheSea@5.9.0', forContext: 'Invading Earth', notForContext: [] },
            ],
            groups: [
                {
                    name: 'Source Files',
                    forContext: 'Invading Earth',
                    notForContext: [],
                    files: [
                        {
                            name: './main.c',
                            forContext: [],
                            notForContext: 'Surviving Humans',
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
                                notForContext: [],
                            } ,
                        ],
                        groups: [],
                    }],
                },
            ],
        };

        expect(parsedLayer).toEqual(expected);
    });

    it('parses an empty layer', () => {
        const yamlDocument = YAML.parseDocument(emptyLayer);
        const parsedLayer = parseLayer(yamlDocument);

        const expected: typeof parsedLayer = {
            processor: processorDataFactory(),
            components: [],
            groups: [],
            packs: [],
        };

        expect(parsedLayer).toEqual(expected);
    });

    it('returns an empty layer if yaml is not valid', () => {
        const invalidLayerYaml = 'yolo:';
        const yamlDocument = YAML.parseDocument(invalidLayerYaml);
        const parsedLayer = parseLayer(yamlDocument);

        const expected: typeof parsedLayer = {
            description: undefined,
            compiler: undefined,
            board: undefined,
            device: undefined,
            processor: undefined,
            components: [],
            groups: [],
            packs: [],
        };

        expect(parsedLayer).toEqual(expected);
    });
});
