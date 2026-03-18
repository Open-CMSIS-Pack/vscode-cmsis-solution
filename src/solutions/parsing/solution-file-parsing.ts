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
import { Parser, composeParsers, mapParser, readMapFromMap, readOptionalMapArrayFromMap, readOptionalStringFromMap, readStringFromMap, requireMap } from './yaml-file-parsing';
import { parseProcessorData } from './processor-data-parsing';
import { YAMLMap } from 'yaml';
import { parseContextRestriction } from './context-restriction-parsing';
import { BuildType, DEFAULT_BUILD_TYPES, ProjectReference, Solution, SolutionFile, TargetType, Variable } from './solution-file';
import { PackReference, parsePacks } from './common-file-parsing';

export const parseSolution = (yamlDocument: YAML.Document<YAML.Node>): Solution => {
    const parsed = yamlDocument.contents;
    const root = requireMap(parsed);
    const solutionNode = readMapFromMap('solution')(root);
    return {
        projects: composeParsers(mapParser(parseProject), readOptionalMapArrayFromMap('projects'))(solutionNode),
        targetTypes: composeParsers(mapParser(parseTargetType), readOptionalMapArrayFromMap('target-types'))(solutionNode),
        buildTypes: composeParsers(mapParser(parseBuildType), readOptionalMapArrayFromMap('build-types'))(solutionNode),
        packs: parsePacks(readOptionalMapArrayFromMap('packs')(solutionNode)),
        compiler: readOptionalStringFromMap('compiler')(solutionNode),
        processor: parseProcessorData(solutionNode),
        cdefault: solutionNode.has('cdefault') ? true : undefined,
        createdFor: readOptionalStringFromMap('created-for')(solutionNode),
    };
};

export const parseProject: Parser<YAMLMap, ProjectReference> = projectMap => ({
    reference: readStringFromMap('project')(projectMap),
    ...parseContextRestriction(projectMap),
});

export const parseBuildType: Parser<YAMLMap, BuildType> = buildTypeMap => ({
    type: readStringFromMap('type')(buildTypeMap),
    compiler: readOptionalStringFromMap('compiler')(buildTypeMap) || '',
    processor: parseProcessorData(buildTypeMap),
    debug: readOptionalStringFromMap('debug')(buildTypeMap) || '',
    optimize: readOptionalStringFromMap('optimize')(buildTypeMap) || '',
});

export const parseTargetType: Parser<YAMLMap, TargetType> = targetTypeMap => ({
    type: readStringFromMap('type')(targetTypeMap),
    board: readOptionalStringFromMap('board')(targetTypeMap) || '',
    device: readOptionalStringFromMap('device')(targetTypeMap) || '',
    compiler: readOptionalStringFromMap('compiler')(targetTypeMap) || '',
    processor: parseProcessorData(targetTypeMap),
    variables: composeParsers(mapParser(parseVariables), readOptionalMapArrayFromMap('variables'))(targetTypeMap),
});

export const parseVariables: Parser<YAMLMap, Variable> = variablesMap => ({
    // TdB todo
    name: readOptionalStringFromMap('Board-Layer')(variablesMap) ? 'Board-Layer' :
        (readOptionalStringFromMap('Shield-Layer')(variablesMap) ? 'Shield-Layer' : ''),
    value: readOptionalStringFromMap('Board-Layer')(variablesMap) || readOptionalStringFromMap('Shield-Layer')(variablesMap) || '',
});


export const newSolution = (
    solutionPath: string,
    projectPaths: string[],
    targetTypes: TargetType[],
    packs: PackReference[],
    compiler: string,
): SolutionFile<Solution> => ({
    path: solutionPath,
    value: {
        projects: projectPaths.map(path => ({ reference: path, forContext: [], notForContext: [] })),
        targetTypes: targetTypes,
        buildTypes: DEFAULT_BUILD_TYPES,
        packs,
        compiler,
    },
});
