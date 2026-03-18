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
import { ProcessorData, parseProcessorData } from './processor-data-parsing';
import { LayerReference, Project } from './project-file';
import { parseComponents, parsePacks, parseGroups, ComponentData } from './common-file-parsing';
import {
    readMapFromMap,
    readOptionalMapArrayFromMap,
    readOptionalStringFromMap,
    requireMap,
    readStringFromMap,
} from './yaml-file-parsing';
import { SolutionFile } from './solution-file';
import { parseContextRestriction } from './context-restriction-parsing';
import { serialiseDevice } from '../solution-serialisers';

export const parseLayerReference = (packsYaml: YAML.YAMLMap<unknown, unknown>[]): LayerReference[] => {
    return packsYaml.map(layerMap => {
        const contextRestriction = parseContextRestriction(layerMap);
        return {
            reference: readStringFromMap('layer')(layerMap),
            forContext: contextRestriction.forContext,
            notForContext: contextRestriction.notForContext,
        };
    });
};

export const parseProject = (yamlDocument: YAML.Document<YAML.Node>): Project => {
    try {
        const root = requireMap(yamlDocument.contents);
        const projectNode = readMapFromMap('project')(root);
        return {
            description: readOptionalStringFromMap('description')(projectNode),
            compiler: readOptionalStringFromMap('compiler')(projectNode),
            board: readOptionalStringFromMap('board')(projectNode),
            device: readOptionalStringFromMap('device')(projectNode),
            processor: parseProcessorData(projectNode),
            components: parseComponents(readOptionalMapArrayFromMap('components')(projectNode)),
            groups: parseGroups(readOptionalMapArrayFromMap('groups')(projectNode)),
            packs: parsePacks(readOptionalMapArrayFromMap('packs')(projectNode)),
            layers: parseLayerReference(readOptionalMapArrayFromMap('layers')(projectNode)),
        };
    } catch (error) {
        console.log('Unable to parse project', error);
        return newEmptyProject();
    }
};

const newEmptyProject = (): Project => {
    return {
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
};

export const newProject = (projectPath: string, core: string, processor: ProcessorData, components: ComponentData[]): SolutionFile<Project> => ({
    path: projectPath,
    value: {
        components,
        processor,
        ...(core ? { device: serialiseDevice({ name: '', vendor: '', processor: core }) } : {}),
        layers: [],
        packs: [],
        groups: [],
    },
});
