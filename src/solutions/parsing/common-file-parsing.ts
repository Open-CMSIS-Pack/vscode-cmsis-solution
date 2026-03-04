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
import { parseContextRestriction } from './context-restriction-parsing';
import {
    readOptionalMapArrayFromMap,
    readOptionalNumberFromMap,
    readStringFromMap,
} from './yaml-file-parsing';

const parseFiles = (filesYaml: YAML.YAMLMap<unknown, unknown>[]): FileData[] => {
    return filesYaml.map(parseFile);
};

export type ContextRestriction = {
    forContext: string[] | string;
    notForContext: string[] | string;
}

export type FileData = ContextRestriction & {
    name: string;
 }

export type GroupData = FileData & {
  files: FileData[];
  groups: GroupData[];
}

export const parseFile = (fileYaml: YAML.YAMLMap<unknown, unknown>): FileData => {
    const contextRestriction = parseContextRestriction(fileYaml);
    return {
        name: readStringFromMap('file')(fileYaml),
        forContext: contextRestriction.forContext,
        notForContext: contextRestriction.notForContext
    };
};

export type PackReference = {
    pack: string;
    forContext: string[] | string;
    notForContext: string[] | string;
}

export const parsePacks = (packsYaml: YAML.YAMLMap<unknown, unknown>[]): PackReference[] => {
    return packsYaml.map(packMap => {
        const contextRestriction = parseContextRestriction(packMap);
        return {
            pack: readStringFromMap('pack')(packMap),
            forContext: contextRestriction.forContext,
            notForContext: contextRestriction.notForContext
        };
    });
};

export type ComponentData = {
  reference: string;
  forContext: string[] | string;
  notForContext: string[] | string;
  instances: number;
}

export const parseComponents = (componentsYaml: YAML.YAMLMap<unknown, unknown>[]): ComponentData[] => {
    return componentsYaml.map(componentMap => {
        const contextRestriction = parseContextRestriction(componentMap);
        return {
            reference: readStringFromMap('component')(componentMap),
            forContext: contextRestriction.forContext,
            notForContext: contextRestriction.notForContext,
            instances: readOptionalNumberFromMap('instances')(componentMap) ?? 1,
        };
    });
};


export const parseGroups = (groupsYaml: YAML.YAMLMap<unknown, unknown>[]): GroupData[] => {
    return groupsYaml.map(parseGroup);
};

export const parseGroup = (groupYaml: YAML.YAMLMap<unknown, unknown>): GroupData => {
    const contextRestriction = parseContextRestriction(groupYaml);
    return {
        name: readStringFromMap('group')(groupYaml),
        files: parseFiles(readOptionalMapArrayFromMap('files')(groupYaml)),
        groups: parseGroups(readOptionalMapArrayFromMap('groups')(groupYaml)),
        forContext: contextRestriction.forContext,
        notForContext: contextRestriction.notForContext
    };
};
