/**
 * Copyright 2020-2026 Arm Limited
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

import { copyFile, mkdir } from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Uri } from 'vscode';
import { URI } from 'vscode-uri';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { DraftProjectData } from '../data-manager/draft-project-data';
import { NewProject } from '../views/create-solutions/cmsis-solution-types';
import { CreateSolutionSubmission } from '../views/create-solutions/create-solution-dto';
import { PROJECT_SUFFIX, SOLUTION_SUFFIX } from './constants';
import { CreateSolutionFromDataManager } from './create-solution-from-data-manager';
import { SolutionInitialiser } from './solution-initialiser';
import { TEMPLATES_FOLDER } from '../manifest';
import { CProjectYamlFile } from './files/cproject-yaml-file';
import { CSolutionYamlFile } from './files/csolution-yaml-file';

export type CreatedSolution = {
    vcpkgConfigured: boolean;
    solutionFile: Uri | undefined;
    solutionDir: Uri;
    conversionStatus: 'none' | 'warnings' | 'errors';
    forceRteUpdate: boolean;
}

export type CreateSolutionRequest = CreateSolutionSubmission & {
    draftProject?: DraftProjectData;
}

export interface SolutionCreator {
    createSolution(message: CreateSolutionRequest): Promise<CreatedSolution>;
}

export class SolutionCreatorImp  implements SolutionCreator {

    constructor(
        private readonly createSolutionFromDataManager: CreateSolutionFromDataManager,
        private readonly solutionInitialiser: SolutionInitialiser,
    ) {
    }

    public async createSolution(message: CreateSolutionRequest): Promise<CreatedSolution> {
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

    public async createSolutionWithSelectedTemplate(solutionDirUri: Uri, solutionFileUri: Uri, message: CreateSolutionRequest): Promise<CreatedSolution> {
        if (message.draftProject) {
            return this.createSolutionFromDataManager(solutionDirUri, message);
        } else {
            return this.createSolutionFromTemplate(solutionDirUri, solutionFileUri, message);
        }
    }

    public async createSolutionFromTemplate(solutionDirUri: Uri, solutionFileUri: Uri, message: CreateSolutionRequest): Promise<CreatedSolution> {
        const projectsWithPaths = message.projects.map(project => ({
            project,
            path: path.join(solutionDirUri.fsPath, project.name, `${project.name}${PROJECT_SUFFIX}`),
            // Must always use /
            referencePath: [project.name, `${project.name}${PROJECT_SUFFIX}`].join('/'),
        }));

        await this.createFiles(solutionDirUri.fsPath, projectsWithPaths);

        projectsWithPaths.sort((a, b) => {
            // Put secure projects first in the build order
            const trustzonePriority = { 'secure': 0, 'non-secure': 1, 'off': 2 };
            return trustzonePriority[a.project.trustzone] - trustzonePriority[b.project.trustzone];
        });
        const solution = new CSolutionYamlFile();
        await this.assertFileResult(
            solution.loadTemplate(path.resolve(TEMPLATES_FOLDER, 'template.csolution.yml'), solutionFileUri.fsPath),
            `load solution template for ${solutionFileUri.fsPath}`,
        );
        for (const { referencePath } of projectsWithPaths) {
            solution.appendProjectRef(referencePath);
        }
        for (const targetType of message.targetTypes) {
            solution.appendTargetType(targetType.type, targetType.device, targetType.board);
        }
        for (const pack of message.packs) {
            solution.addPack(pack.pack, pack.forContext, pack.notForContext);
        }
        solution.compiler = message.compiler;
        await this.assertFileResult(solution.save(), `save solution ${solutionFileUri.fsPath}`);
        return { solutionFile: solutionFileUri, solutionDir: solutionDirUri, conversionStatus: 'none', vcpkgConfigured: false, forceRteUpdate: true };
    }

    private async createFiles(solutionDir: string, projectsWithPath: { project: NewProject, path: string }[]) {
        await promisify(mkdir)(solutionDir, { recursive: true });
        await Promise.all(projectsWithPath.map(async ({ project, path: projectPath }): Promise<void> => {
            const templateFileName = {
                'secure': 'secure.cproject.yml',
                'non-secure': 'non-secure.cproject.yml',
                'off': 'template.cproject.yml',
            }[project.trustzone];

            const templatePath = path.resolve(TEMPLATES_FOLDER, templateFileName);
            await promisify(mkdir)(path.dirname(projectPath), { recursive: true });
            const projectFile = new CProjectYamlFile();
            await this.assertFileResult(
                projectFile.loadTemplate(templatePath, projectPath),
                `load project template for ${projectPath}`,
            );
            projectFile.deviceProcessor = project.processorName;
            projectFile.addComponent('ARM::CMSIS:CORE');
            projectFile.addComponent('Device:Startup');
            await this.assertFileResult(projectFile.save(), `save project ${projectPath}`);

            await promisify(copyFile)(path.join(TEMPLATES_FOLDER, 'c', 'main.c'), path.join(path.dirname(projectPath), 'main.c'));
        }));
    }

    private async assertFileResult(result: Promise<ETextFileResult>, action: string): Promise<void> {
        const fileResult = await result;
        if (fileResult !== ETextFileResult.Success && fileResult !== ETextFileResult.Unchanged) {
            throw new Error(`Failed to ${action}`);
        }
    }

}
