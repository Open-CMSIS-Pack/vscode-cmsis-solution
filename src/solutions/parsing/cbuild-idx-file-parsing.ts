/**
 * Copyright 2024-2026 Arm Limited
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
import { readMapFromMap, readOptionalMapArrayFromMap, readOptionalStringFromMap, requireMap } from './yaml-file-parsing';
import { CBuildIdxConfigurations, CBuildIdxTargetConfigurations, CBuildIdxVariables, CBuildIdxSettings, CbuildIdx, CbuildIdxReference } from './cbuild-idx-file';

export const parseCbuildRefs = (cbuildRefs: YAML.YAMLMap<unknown, unknown>[]): CbuildIdxReference[] => {
    return cbuildRefs.map(cbuildRefsMap => {
        return {
            path: readOptionalStringFromMap('cbuild')(cbuildRefsMap) ?? '',
        };
    });
};

export const parseTargetConfigurationsVariablesSettings = (refs: YAML.YAMLMap<unknown, unknown>[]): CBuildIdxSettings[] => {
    return refs.map(item => {
        return {
            set: readOptionalStringFromMap('set')(item) ?? '',
        };
    });
};

export const parseTargetConfigurationsVariables = (refs: YAML.YAMLMap<unknown, unknown>[]): CBuildIdxVariables[] => {
    return refs.map(item => {
        // To do: find the name from all of the keys
        //const allKeys = Object.keys(item.items);
        const board = readOptionalStringFromMap('Board-Layer')(item);
        const shield = readOptionalStringFromMap('Shield-Layer')(item);
        return {
            variableName: board ? 'Board-Layer' : (shield ? 'Shield-Layer' : 'Unknown-Layer'),
            variableValue: board ?? shield ?? '',
            description: readOptionalStringFromMap('description')(item) ?? '',
            path: readOptionalStringFromMap('path')(item) ?? '',
            file: readOptionalStringFromMap('file')(item) ?? '',
            copyTo: readOptionalStringFromMap('copy-to')(item) ?? '',
            settings: parseTargetConfigurationsVariablesSettings(readOptionalMapArrayFromMap('settings')(item)),
        };
    });
};

export const parseTargetConfigurations = (refs: YAML.YAMLMap<unknown, unknown>[]): CBuildIdxTargetConfigurations[] => {
    return refs.map(item => {
        return {
            configuration: readOptionalStringFromMap('configuration')(item) ?? '',
            variables: parseTargetConfigurationsVariables(readOptionalMapArrayFromMap('variables')(item))
        };
    });
};

export const parseConfigurations = (refs: YAML.YAMLMap<unknown, unknown>[]): CBuildIdxConfigurations[] => {
    return refs.map(item => {
        return {
            targetType: readOptionalStringFromMap('target-type')(item) ?? '',
            targetConfigurations: parseTargetConfigurations(readOptionalMapArrayFromMap('target-configurations')(item))
        };
    });
};

export const parseCBuildIdx = (yamlDocument: YAML.Document<YAML.Node>): CbuildIdx => {
    const root  = requireMap(yamlDocument.contents);
    const buildIdxNode = readMapFromMap('build-idx')(root);

    return {
        cbuildRefs: parseCbuildRefs(readOptionalMapArrayFromMap('cbuilds')(buildIdxNode)),
        configurations: parseConfigurations(readOptionalMapArrayFromMap('configurations')(buildIdxNode))
    };
};
