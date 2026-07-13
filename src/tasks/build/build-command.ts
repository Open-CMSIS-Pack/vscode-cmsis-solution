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
import { BuildTaskProvider, BuildTaskProviderImpl, waitForActiveBuildTasksCompletion } from './build-task-provider';
import { BuildTaskDefinitionBuilder } from './build-task-definition-builder';
import { COutlineItem } from '../../views/solution-outline/tree-structure/solution-outline-item';

type UriOrSolutionNode = vscode.Uri | COutlineItem;

export interface BuildCommandSaveParticipant {
    saveChangesBeforeBuild(): Promise<boolean>;
}

export class BuildCommand {
    public static readonly buildCommandType = `${PACKAGE_NAME}.build`;
    public static readonly cleanCommandType = `${PACKAGE_NAME}.clean`;
    public static readonly rebuildCommandType = `${PACKAGE_NAME}.rebuild`;

    public constructor(
        private readonly buildTaskProvider: BuildTaskProvider,
        private readonly commandsProvider: CommandsProvider,
        private readonly buildTaskDefinitionBuilder: BuildTaskDefinitionBuilder,
        private readonly saveParticipant?: BuildCommandSaveParticipant,
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

    private async handleClean(uriOrSolutionNode?: UriOrSolutionNode): Promise<vscode.TaskExecution | undefined> {
        return this.createAndExecuteTaskDefinition('clean', uriOrSolutionNode);
    }

    private async handleRebuild(uriOrSolutionNode?: UriOrSolutionNode): Promise<vscode.TaskExecution | undefined> {
        return this.createAndExecuteTaskDefinition('rebuild', uriOrSolutionNode);
    }

    private async createAndExecuteTaskDefinition(action: 'build' | 'clean' | 'rebuild', uriOrSolutionNode?: UriOrSolutionNode): Promise<vscode.TaskExecution | undefined> {
        await this.stopActiveSetupTaskIfRunning();
        await waitForActiveBuildTasksCompletion();
        if (!await this.saveChangesBeforeBuild()) {
            return undefined;
        }
        const definition = await this.buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode(action, uriOrSolutionNode);
        return this.executeTaskDefinition(definition);
    }

    private async stopActiveSetupTaskIfRunning(): Promise<void> {
        const setupExecution = (vscode.tasks.taskExecutions ?? []).find(execution =>
            execution.task.definition?.type === BuildTaskProviderImpl.taskType && execution.task.definition?.setup === true
        );

        if (!setupExecution) {
            return;
        }

        const taskName = setupExecution.task.name;
        if (!taskName || !this.buildTaskProvider.terminateTask(taskName)) {
            setupExecution.terminate();
        }
    }

    private async saveChangesBeforeBuild(): Promise<boolean> {
        try {
            const savedEditors = await vscode.workspace.saveAll(false);
            if (!savedEditors) {
                await vscode.window.showWarningMessage('Build cancelled because modified files could not be saved.');
                return false;
            }

            const savedViewChanges = await (this.saveParticipant?.saveChangesBeforeBuild() ?? Promise.resolve(true));
            if (!savedViewChanges) {
                await vscode.window.showWarningMessage('Build cancelled because Software Components changes could not be saved.');
                return false;
            }

            return true;
        } catch (error) {
            await vscode.window.showErrorMessage(`Build cancelled while saving changes: ${error}`);
            return false;
        }
    }

    private async executeTaskDefinition(definition: BuildTaskDefinition): Promise<vscode.TaskExecution> {
        const task = this.buildTaskProvider.createTask(definition);
        return vscode.tasks.executeTask(task);
    }
}
