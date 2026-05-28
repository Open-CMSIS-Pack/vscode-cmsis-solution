/**
 * Copyright 2025-2026 Arm Limited
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

import * as vscode from 'vscode';
import { PACKAGE_NAME } from '../../manifest';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { BuildTaskDefinition } from './build-task-definition';
import { BuildTaskProvider, waitForActiveBuildTasksCompletion } from './build-task-provider';
import { BuildTaskDefinitionBuilder } from './build-task-definition-builder';
import { COutlineItem } from '../../views/solution-outline/tree-structure/solution-outline-item';

type UriOrSolutionNode = vscode.Uri | COutlineItem;

export class BuildCommand {
    public static readonly buildCommandType = `${PACKAGE_NAME}.build`;
    public static readonly cleanCommandType = `${PACKAGE_NAME}.clean`;
    public static readonly rebuildCommandType = `${PACKAGE_NAME}.rebuild`;

    public constructor(
        private readonly buildTaskProvider: BuildTaskProvider,
        private readonly commandsProvider: CommandsProvider,
        private readonly buildTaskDefinitionBuilder: BuildTaskDefinitionBuilder,
    ) {}

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(BuildCommand.buildCommandType, this.handleBuild, this),
            this.commandsProvider.registerCommand(BuildCommand.rebuildCommandType, this.handleRebuild, this),
            this.commandsProvider.registerCommand(BuildCommand.cleanCommandType, this.handleClean, this),
        );
    }

    private async handleBuild(uriOrSolutionNode?: UriOrSolutionNode): Promise<vscode.TaskExecution | undefined> {
        return this.createAndExecuteTaskDefinition('build', uriOrSolutionNode);
    }

    private async handleClean(uriOrSolutionNode?: UriOrSolutionNode): Promise<vscode.TaskExecution> {
        return this.createAndExecuteTaskDefinition('clean', uriOrSolutionNode);
    }

    private async handleRebuild(uriOrSolutionNode?: UriOrSolutionNode): Promise<vscode.TaskExecution> {
        return this.createAndExecuteTaskDefinition('rebuild', uriOrSolutionNode);
    }

    private async createAndExecuteTaskDefinition(action: 'build' | 'clean' | 'rebuild', uriOrSolutionNode?: UriOrSolutionNode): Promise<vscode.TaskExecution> {
        await waitForActiveBuildTasksCompletion();
        await this.saveDirtyManageSolutionTarget();
        const definition = await this.buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode(action, uriOrSolutionNode);
        return this.executeTaskDefinition(definition);
    }

    private async saveDirtyManageSolutionTarget(): Promise<void> {
        await this.commandsProvider.executeCommand('workbench.action.files.save');
    }

    private async executeTaskDefinition(definition: BuildTaskDefinition): Promise<vscode.TaskExecution> {
        const task = this.buildTaskProvider.createTask(definition);
        return vscode.tasks.executeTask(task);
    }
}
