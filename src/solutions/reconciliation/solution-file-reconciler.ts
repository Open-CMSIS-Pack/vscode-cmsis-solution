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

import { ProjectData, SolutionData } from '../../core-tools/client/solutions_pb';
import * as YAML from 'yaml';
import { WorkspaceFsProvider } from '../../vscode-api/workspace-fs-provider';
import { CSolution } from '../csolution';
import { ParsedFile, SolutionFiles, loadSolutionFiles as defaultLoadSolutionFiles } from '../parsing/file-loader';
import { ProjectReference } from '../parsing/solution-file';
import {
    DocumentReconciler,
    NewSolutionData,
    reconcileProjectDocument as defaultReconcileProjectDocument,
    reconcileSolutionDocument as defaultReconcileSolutionDocument
} from './solution-document-reconciler';

const reconcileFile = <A>(reconcileDocument: (map: YAML.Document, data: A) => boolean) => async (
    workspaceFsProvider: WorkspaceFsProvider,
    data: A,
    parsedFile: ParsedFile<unknown>,
): Promise<void> => {
    const yamlDocument = parsedFile.cloneYamlDocument();
    const documentUpdated: boolean = reconcileDocument(yamlDocument, data);

    if (documentUpdated) {
        await workspaceFsProvider.writeUtf8File(parsedFile.file.path, yamlDocument.toString());
    }
};

/**
 * Reconcile changes from Core Tools with the current state of the solution files. Changes are saved back to disk.
 * This assumes that only the packs and component lists can be modified by Core Tools.
 */
export const reconcileSolutionFiles = async (
    workspaceFsProvider: WorkspaceFsProvider,
    solutionPath: string,
    projectPaths: ProjectReference[],
    newSolutionData: SolutionData.AsObject,
    loadSolutionFiles: (solutionPath: string, csolution?: CSolution) => Promise<SolutionFiles> = defaultLoadSolutionFiles.bind(this, workspaceFsProvider),
    reconcileSolutionDocument: DocumentReconciler<NewSolutionData> = defaultReconcileSolutionDocument,
    reconcileProjectDocument: DocumentReconciler<Pick<ProjectData.AsObject, 'componentsList' | 'packsList' | 'device'>> = defaultReconcileProjectDocument,
): Promise<void> => {
    const reconcileSolutionFile = reconcileFile<NewSolutionData>(reconcileSolutionDocument);
    const reconcileProjectFile = reconcileFile<ProjectData.AsObject>(reconcileProjectDocument);

    const currentSolutionFiles = await loadSolutionFiles(solutionPath);

    await reconcileSolutionFile(workspaceFsProvider, { solution: newSolutionData, projectRefs: projectPaths }, currentSolutionFiles.solution);

    const updatedSolutionFiles = await loadSolutionFiles(solutionPath);

    for (const projectData of newSolutionData.projectsList) {
        const currentProjectFile = updatedSolutionFiles.projects.find(parsedFile => parsedFile.file.path === projectData.id?.id);
        if (currentProjectFile) {
            await reconcileProjectFile(workspaceFsProvider, projectData, currentProjectFile);
        }
    }
};
