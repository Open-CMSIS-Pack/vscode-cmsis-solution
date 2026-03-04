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
import path from 'path';
import { faker } from '@faker-js/faker';
import { Layer } from './layer-file';
import { Project } from './project-file';
import { Solution, SolutionFile } from './solution-file';
import { ParsedFile, ParsedProjectFile, SolutionFiles, ParsedLayerFile } from './file-loader';
import { PackFile, ResolvedPack } from './build-pack-file';

export type ProjectFactoryOptions = Partial<Project> & {referencePath?: string};
export type LayerFactoryOptions = Partial<Layer> & {referencePath?: string};

export const layerFactory = (options?: LayerFactoryOptions): Layer => ({
    components: [
        { reference: 'Test:Component', forContext: [], notForContext: [], instances: 1 },
    ],
    packs: options?.packs ? options.packs : [],
    groups: options?.groups ? options.groups : [],
    ...options,
});

export const projectFactory = (options?: ProjectFactoryOptions): Project => ({
    components: [
        { reference: 'Test:Component', forContext: [], notForContext: [], instances: 1 },
    ],
    packs: options?.packs ? options.packs : [],
    groups: options?.groups ? options.groups : [],
    layers: options?.layers ? options.layers : [],
    ...options,
});

export type SolutionFactoryOptions = Partial<Solution>;

export const solutionFactory = (options?: SolutionFactoryOptions): Solution => {
    return ({
        projects: options?.projects ?? [{ reference: './some/path_name.cproject.yml', forContext: [], notForContext: [] }],
        targetTypes: options?.targetTypes ?? [
            { type: faker.word.noun(), board: faker.word.noun(), device: 'some device:some processor' },
        ],
        packs: [],
        buildTypes: options?.buildTypes !== undefined ? options.buildTypes : [
            { type: faker.word.noun(), compiler: faker.word.noun(), debug: 'on' },
            { type: faker.word.noun(), compiler: faker.word.noun(), debug: 'off' },
        ],
        compiler: 'AC6',
        ...options,
    });
};

export const solutionFileFactory = <A>(options: Partial<SolutionFile<A>> & Pick<SolutionFile<A>, 'value'>): SolutionFile<A> => ({
    path: options.path ?? `.${path.sep}${faker.word.noun()}.yml`,
    ...options,
});

export const parsedFileFactory = <A>(options: Partial<ParsedFile<A>> & Pick<ParsedFile<A>, 'file'>): ParsedFile<A> => ({
    cloneYamlDocument: jest.fn(() => new YAML.Document()),
    ...options,
});

export const parsedSolutionFileFactory = (options?: SolutionFactoryOptions): ParsedFile<Solution> => parsedFileFactory(
    { file: solutionFileFactory({ value: solutionFactory(options) }) }
);

export const parsedProjectFileFactory = (options?: ProjectFactoryOptions): ParsedProjectFile => {
    const referencePath = options?.referencePath || `.${path.sep}${faker.word.noun()}.cproject.yml`;
    return {
        ...parsedFileFactory({ file: solutionFileFactory({ value: projectFactory(options), path: path.resolve(referencePath) }) }),
        referencePath,
    };
};

export const parsedLayerFileFactory = (options?: LayerFactoryOptions): ParsedLayerFile => {
    const referencePath = options?.referencePath || `.${path.sep}${faker.word.noun()}.clayer.yml`;
    return {
        ...parsedFileFactory({ file: solutionFileFactory({ value: layerFactory(options), path: path.resolve(referencePath) }) }),
        referencePath,
    };
};

export type SolutionFilesFactoryOptions = {
    solution?: SolutionFactoryOptions,
    projects?: ProjectFactoryOptions[],
    layers?: LayerFactoryOptions[]
};

export const solutionFilesFactory = (options?: SolutionFilesFactoryOptions): SolutionFiles => ({
    layers: (options?.layers !== undefined ? options.layers : []).map(parsedLayerFileFactory),
    projects: (options?.projects !== undefined ? options.projects : []).map(parsedProjectFileFactory),
    solution: parsedSolutionFileFactory(options?.solution)
});

export type PackFileFactoryOptions = Partial<PackFile>;
export type ResolvedPackOptions = Partial<ResolvedPack>;

export const packFileFactory = (options?: PackFileFactoryOptions): PackFile => ({
    resolvedPacks: (options?.resolvedPacks ? options.resolvedPacks : []).map(resolvedPackFactory)
});

const resolvedPackFactory = (options?: ResolvedPackOptions): ResolvedPack => ({
    resolvedPack: (options?.resolvedPack ? options.resolvedPack : packFactory()),
    selectedByPack: (options?.selectedByPack ? options.selectedByPack : []).map(packFactory)
});

const packFactory = (options?: string) => {
    return options ? options : faker.word.noun() + '::' + faker.word.noun() + '@' + faker.system.semver;
};
