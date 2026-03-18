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
import { parseProcessorData } from './processor-data-parsing';
import { Layer } from './layer-file';
import {
    readMapFromMap,
    readOptionalMapArrayFromMap,
    readOptionalStringFromMap,
    requireMap,
} from './yaml-file-parsing';
import { parseGroups, parsePacks, parseComponents } from './common-file-parsing';

export const parseLayer = (yamlDocument: YAML.Document<YAML.Node>): Layer => {
    try {
        const root = requireMap(yamlDocument.contents);
        const layerNode = readMapFromMap('layer')(root);

        return {
            description: readOptionalStringFromMap('description')(layerNode),
            compiler: readOptionalStringFromMap('compiler')(layerNode),
            board: readOptionalStringFromMap('board')(layerNode),
            device: readOptionalStringFromMap('device')(layerNode),
            processor: parseProcessorData(layerNode),
            components: parseComponents(readOptionalMapArrayFromMap('components')(layerNode)),
            groups: parseGroups(readOptionalMapArrayFromMap('groups')(layerNode)),
            packs: parsePacks(readOptionalMapArrayFromMap('packs')(layerNode)),
        };
    } catch (error) {
        console.log('Unable to parse layer', error);
        return newEmptyLayer();
    }
};

const newEmptyLayer = (): Layer => {
    return {
        description: undefined,
        compiler: undefined,
        board: undefined,
        device: undefined,
        processor: undefined,
        components: [],
        groups: [],
        packs: [],
    };
};
