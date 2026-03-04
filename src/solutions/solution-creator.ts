/**
 * Copyright 2020-2026 Arm Limited
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

import { copyFile, mkdir } from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Uri } from 'vscode';
import { URI } from 'vscode-uri';
import * as YAML from 'yaml';
import { createSolutionData } from '../core-tools/core-tools-data-building';
import { NewProject } from '../views/create-solutions/cmsis-solution-types';
import { NewSolutionMessage } from '../views/create-solutions/messages';
import { WorkspaceFsProvider } from '../vscode-api/workspace-fs-provider';
import { PROJECT_SUFFIX, SOLUTION_SUFFIX } from './constants';
import { CreateSolutionFromDataManager } from './create-solution-from-data-manager';
import { ComponentData } from './parsing/common-file-parsing';
import { ParsedProjectFile } from './parsing/file-loader';
import { emptyProcessorData } from './parsing/processor-data-parsing';
import { newProject } from './parsing/project-file-parsing';
import { newSolution } from './parsing/solution-file-parsing';
import { reconcileSolutionFiles as defaultReconcileSolutionFiles } from './reconciliation/solution-file-reconciler';
import { SolutionInitialiser } from './solution-initialiser';
import { TEMPLATES_FOLDER } from '../manifest';

export type CreatedSolution = {
    vcpkgConfigured: boolean;
    solutionFile: Uri | undefined;
    solutionDir: Uri;
    conversionStatus: 'none' | 'warnings' | 'errors';
    forceRteUpdate: boolean;
}

export interface SolutionCreator {
    createSolution(message: NewSolutionMessage): Promise<CreatedSolution>;
}

export class SolutionCreatorImp  implements SolutionCreator {

    constructor(
        private readonly createSolutionFromDataManager: CreateSolutionFromDataManager,
        private readonly solutionInitialiser: SolutionInitialiser,
        private readonly workspaceFsProvider: WorkspaceFsProvider,
        public readonly reconcileSolutionFiles = defaultReconcileSolutionFiles,
    ) {
    }

    public async createSolution(message: NewSolutionMessage): Promise<CreatedSolution> {
        const solutionDirUri = URI.file(path.join(message.solutionLocation, message.solutionFolder));
        const solutionFileUri = Uri.joinPath(solutionDirUri, `${message.solutionName}${SOLUTION_SUFFIX}`);
        const createdSolution = await this.createSolutionWithSelectedTemplate(solutionDirUri, solutionFileUri, message);
        this.solutionInitialiser.initialiseSolution({
            createdSolution,
            enableGit: message.gitInit,
            compiler: message.compiler,
            showOpenDialog: message.showOpenDialog
        });
        return createdSolution;
    }

    public async createSolutionWithSelectedTemplate(solutionDirUri: Uri, solutionFileUri: Uri, message: NewSolutionMessage): Promise<CreatedSolution> {
        if (message.selectedTemplate?.type === 'example') {
            throw new Error('Not implemented');
        } else if (message.selectedTemplate?.type === 'refApp') {
            throw new Error('Not implemented');
        } else if (message.selectedTemplate?.type === 'localExample') {
            throw new Error('Not implemented');
        } else if (message.selectedTemplate?.type === 'dataManagerApp') {
            return this.createSolutionFromDataManager(solutionDirUri, message);
        } else {
            if (message.selectedTemplate?.value.origin) {
                throw new Error('Not implemented');
            } else {
                return this.createSolutionFromTemplate(solutionDirUri, solutionFileUri, message);
            }
        }
    }

    public async createSolutionFromTemplate(solutionDirUri: Uri, solutionFileUri: Uri, message: NewSolutionMessage): Promise<CreatedSolution> {
        const projectsWithPaths = message.projects.map(project => ({
            project,
            path: path.join(solutionDirUri.fsPath, project.name, `${project.name}${PROJECT_SUFFIX}`),
            // Must always use /
            referencePath: [project.name, `${project.name}${PROJECT_SUFFIX}`].join('/'),
        }));

        await this.createFiles(solutionDirUri.fsPath, solutionFileUri.fsPath, projectsWithPaths);

        projectsWithPaths.sort((a, b) => {
            // Put secure projects first in the build order
            const trustzonePriority = { 'secure': 0, 'non-secure': 1, 'off': 2 };
            return trustzonePriority[a.project.trustzone] - trustzonePriority[b.project.trustzone];
        });
        const solution = newSolution(solutionFileUri.fsPath, projectsWithPaths.map(p => p.referencePath), message.targetTypes, message.packs, message.compiler);

        const projects: ParsedProjectFile[] = projectsWithPaths.map(({ project, path: projectPath, referencePath }) =>  ({
            file: newProject(path.resolve(projectPath), project.processorName, { ...emptyProcessorData, trustzone: project.trustzone }, this.getProjectComponents()),
            referencePath,
            cloneYamlDocument: () => new YAML.Document(),
        }));

        const solutionData = createSolutionData({
            solution: { file: solution, cloneYamlDocument: () => new YAML.Document() },
            projects,
            layers: [],
        });
        await this.reconcileSolutionFiles(this.workspaceFsProvider, solutionFileUri.fsPath, solution.value.projects, solutionData.toObject());
        return { solutionFile: solutionFileUri, solutionDir: solutionDirUri, conversionStatus: 'none', vcpkgConfigured: false, forceRteUpdate: true };
    }

    private async createFiles(solutionDir: string, solutionPath: string, projectsWithPath: { project: NewProject, path: string }[]) {
        const solutionTemplatePath = path.resolve(TEMPLATES_FOLDER, 'template.csolution.yml');
        await promisify(mkdir)(solutionDir, { recursive: true });
        await promisify(copyFile)(solutionTemplatePath, solutionPath);

        await Promise.all(projectsWithPath.map(async ({ project, path: projectPath }): Promise<void> => {
            const templateFileName = {
                'secure': 'secure.cproject.yml',
                'non-secure': 'non-secure.cproject.yml',
                'off': 'template.cproject.yml',
            }[project.trustzone];

            const templatePath = path.resolve(TEMPLATES_FOLDER, templateFileName);
            await promisify(mkdir)(path.dirname(projectPath), { recursive: true });
            await promisify(copyFile)(templatePath, projectPath);

            await promisify(copyFile)(path.join(TEMPLATES_FOLDER, 'c', 'main.c'), path.join(path.dirname(projectPath), 'main.c'));
        }));
    }

    private getProjectComponents(): ComponentData[] {
        return [{ reference: 'ARM::CMSIS:CORE', forContext: [], notForContext: [], instances: 1 },
            { reference: 'Device:Startup', forContext: [], notForContext: [], instances: 1 }];
    }

}
