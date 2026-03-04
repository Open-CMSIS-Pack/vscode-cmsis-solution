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

import * as path from 'path';
import * as YAML from 'yaml';
import { FileType, WorkspaceFsProvider } from '../../vscode-api/workspace-fs-provider';
import { Project } from './project-file';
import { parseProject } from './project-file-parsing';
import { Solution, SolutionFile } from './solution-file';
import { parseSolution } from './solution-file-parsing';
import { Layer } from './layer-file';
import { parseLayer } from './layer-file-parsing';
import { dedupe } from '../../array';
import { parseDefaultConfiguration } from './default-file-parsing';
import { DefaultConfiguration } from './default-file';
import { PackFile } from './build-pack-file';
import { parsePackFile } from './build-pack-file-parsing';
import { CbuildIdx } from './cbuild-idx-file';
import { parseCBuildIdx } from './cbuild-idx-file-parsing';
import { CSolution, expandPath } from '../csolution';

export type ParsedFile<A> = {
  file: SolutionFile<A>;
  cloneYamlDocument: () => YAML.Document<YAML.ParsedNode>;
}
export type ParsedFileAndReference<A> = ParsedFile<A> & {
    referencePath: string;
}

export type ParsedProjectFile = ParsedFileAndReference<Project>
export type ParsedLayerFile = ParsedFileAndReference<Layer>

export type SolutionFiles = {
    solution: ParsedFile<Solution>;
    projects: ParsedProjectFile[];
    layers: ParsedLayerFile[];
    defaultConfiguration?: DefaultConfiguration;
    packFile?: PackFile;
}

export type SolutionBuildFiles = {
    cbuildIdx?: ParsedFile<CbuildIdx>;
}

export const getFilePath = (solutionDirectory: [string, FileType][], predicate: (fileName: string) => boolean): string | undefined => {
    return solutionDirectory
        .filter(([_, fileType]) => fileType === 'file')
        .flatMap(([fileName, _]) => fileName)
        .find(predicate);
};


/**
 * Loads and parses csolution file.
 */
export const loadSolutionFileOnly = async (workspaceFsProvider: WorkspaceFsProvider, solutionPath: string): Promise<ParsedFile<Solution>> => {
    const solutionFileContent = await workspaceFsProvider.readUtf8File(solutionPath);

    const parsedSolution = parseFile(solutionPath, solutionFileContent, parseSolution);

    return parsedSolution;
};

/**
 * Loads and parses csolution and related files into old model
 */
export const loadSolutionFiles = async (workspaceFsProvider: WorkspaceFsProvider,
    solutionPath: string,
    csolution? : CSolution): Promise<SolutionFiles> => {
    const solutionFileContent = await workspaceFsProvider.readUtf8File(solutionPath);

    const parsedSolution = parseFile(solutionPath, solutionFileContent, parseSolution);

    const projectPromises = parsedSolution.file.value.projects.map(
        ({ reference: relativePath }) => loadFile(workspaceFsProvider, solutionPath, relativePath, parseProject));
    const projects = (await Promise.all(projectPromises)).filter(isDefined<ParsedProjectFile>);

    const layerPromises = projects.flatMap(
        project => project.file.value.layers.map(
            (layerRef) => {
                layerRef.referencePath = path.normalize(expandPath(layerRef.reference, csolution)).replaceAll('\\', '/');
                return loadFile(workspaceFsProvider, project.file.path,
                    layerRef.referencePath, parseLayer);
            }
        )
    );

    const layers = (await Promise.all(layerPromises)).filter(isDefined<ParsedLayerFile>);
    const dedupedLayers = dedupe<ParsedLayerFile>(layerPathEqual)(layers);

    const solutionFiles: SolutionFiles = { solution: parsedSolution, projects, layers: dedupedLayers };

    const solutionDirectory = await workspaceFsProvider.readDirectory(path.dirname(solutionPath));

    let defaultConfig: DefaultConfiguration | undefined;
    if (parsedSolution.file.value.cdefault) {

        const cdefaultPredicate = (fileName: string) => fileName.includes('cdefault') && yamlPredicate(fileName);

        const defaultConfigurationPath = getFilePath(solutionDirectory, cdefaultPredicate);
        defaultConfig = { defaultConfiguration: { compiler: 'GCC' } };

        if (defaultConfigurationPath) {
            const loadedConfig = await loadFile(workspaceFsProvider, solutionPath, defaultConfigurationPath, parseDefaultConfiguration);
            if (loadedConfig) {
                defaultConfig = {
                    path: defaultConfigurationPath,
                    defaultConfiguration: loadedConfig.file.value.defaultConfiguration
                };
            }
        }
    }
    solutionFiles.defaultConfiguration = defaultConfig;

    const solutionName = extractSolutionName(solutionPath);
    const packFilePredicate = (fileName: string) => fileName.includes('cbuild-pack') && yamlPredicate(fileName) && fileName.includes(solutionName);

    const packFilePath = getFilePath(solutionDirectory, packFilePredicate);

    if (packFilePath) {
        const packFile = await loadFile(workspaceFsProvider, solutionPath, packFilePath, parsePackFile);
        solutionFiles.packFile = packFile && { resolvedPacks: packFile.file.value.resolvedPacks };
    }

    return solutionFiles;
};

/**
 * Loads and parses csolution and related files.
 */
export const loadSolutionBuildFiles = async (workspaceFsProvider: WorkspaceFsProvider, solutionPath: string): Promise<SolutionBuildFiles> => {

    // TODO: old code to handle layers, remove when ported to CTreeItem
    const cbuildIdxPath = solutionPath.replace(/csolution.ya?ml/, 'cbuild-idx.yml');
    const cbuildIdxFileContent = await workspaceFsProvider.readUtf8File(cbuildIdxPath);
    const cbuildIdx = parseFile(cbuildIdxPath, cbuildIdxFileContent, parseCBuildIdx);
    const solutionBuildFiles: SolutionBuildFiles = { cbuildIdx };

    return solutionBuildFiles;
};

const loadFile = async<A> (
    workspaceFsProvider: WorkspaceFsProvider,
    parentPath: string,
    relativePath: string,
    parser: (yamlDocument: YAML.Document<YAML.ParsedNode>) => A
): Promise<ParsedFileAndReference<A> | undefined> => {
    const absolutePath = path.resolve(path.dirname(parentPath), relativePath);
    try {
        const fileContent = await workspaceFsProvider.readUtf8File(absolutePath);
        const parsedFile = parseFile(absolutePath, fileContent, parser);
        return { ...parsedFile, referencePath: relativePath };
    } catch (error) {
        console.log(`Failed to load file ${absolutePath}`, error);
    }
    // TODO: Create diagnostics for project files that are not found (IOTIDE-5206)
    return undefined;
};

export const parseFile = <A>(path: string, input: string, parser: (yamlDocument: YAML.Document<YAML.ParsedNode>) => A): ParsedFile<A> => {
    const yamlDocument = YAML.parseDocument(input);
    const value = parser(yamlDocument);
    return { file: { path, value }, cloneYamlDocument: () => yamlDocument.clone() };
};

export const layerPathEqual = (absPath1: ParsedLayerFile) => (absPath2: ParsedLayerFile): boolean =>
    absPath1.file.path === absPath2.file.path;

const isDefined = <A>(item: A | undefined): item is A => !!item;

export const yamlPredicate = (fileName: string) => fileName.endsWith('.yml') || fileName.endsWith('.yaml');

export const extractSolutionName = (solutionPath: string) => path.basename(solutionPath).split('.', 1)[0];
