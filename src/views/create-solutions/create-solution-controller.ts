/**
 * Copyright 2026 Arm Limited
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

import { existsSync } from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SOLUTION_SUFFIX } from '../../solutions/constants';
import { CreateSolutionRequest, SolutionCreator } from '../../solutions/solution-creator';
import { isUseWebServices } from '../../util';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { MessageProvider } from '../../vscode-api/message-provider';
import { WorkspaceFoldersProvider } from '../../vscode-api/workspace-folders-provider';
import { OpenCommand } from '../solution-outline/commands/open-command';
import { CreateSolutionData } from './create-solution-data';
import * as Messages from './messages';

export type ShowOpenDialog = (options: vscode.OpenDialogOptions) => Thenable<vscode.Uri[] | undefined>;

export class CreateSolutionController {
    constructor(
        private readonly dataModel: CreateSolutionData,
        private readonly solutionCreator: SolutionCreator,
        private readonly messageProvider: MessageProvider,
        private readonly commandsProvider: CommandsProvider,
        private readonly workspaceFoldersProvider: WorkspaceFoldersProvider,
        private readonly fileExists: (filePath: string) => boolean = existsSync,
        private readonly showOpenDialog: ShowOpenDialog = vscode.window.showOpenDialog,
        private readonly useWebServices: () => boolean = isUseWebServices,
    ) {}

    public async handleRequest(message: Messages.RequestMessage): Promise<Messages.IncomingMessage[]> {
        try {
            const responses = await this.handleRequestData(message);
            if (responses.some(response => response.type === 'REQUEST_FAILED')) {
                return responses;
            }
            return [
                ...responses,
                {
                    type: 'REQUEST_SUCCESSFUL',
                    requestType: message.type,
                    requestId: message.requestId,
                },
            ];
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const failureMessage = message.type === 'NEW_SOLUTION'
                ? `Failed to create solution: ${errorMessage}`
                : errorMessage;

            this.messageProvider.showErrorMessage(message.type === 'NEW_SOLUTION'
                ? failureMessage
                : `Solution service failure: ${errorMessage}\n${error instanceof Error ? error.stack : undefined}`);

            return [{
                type: 'REQUEST_FAILED',
                requestType: message.type,
                requestId: message.requestId,
                errorMessage: failureMessage,
            }];
        }
    }

    private async handleRequestData(message: Messages.RequestMessage): Promise<Messages.IncomingMessage[]> {
        switch (message.type) {
            case 'NEW_SOLUTION':
                await this.createSolution(message);
                return [];
            case 'CHECK_SOLUTION_DOES_NOT_EXIST': {
                const solutionPath = path.join(
                    message.solutionLocation,
                    message.solutionFolder,
                    `${message.solutionName}${SOLUTION_SUFFIX}`,
                );
                if (this.fileExists(solutionPath)) {
                    return [{
                        type: 'REQUEST_FAILED',
                        requestType: message.type,
                        requestId: message.requestId,
                        errorMessage: 'Solution already exists',
                    }];
                }
                return [];
            }
            case 'DATA_GET_TARGETS': {
                const targets = await this.dataModel.getTargets();
                return [{ type: 'TARGET_DATA', requestId: message.requestId, ...targets }];
            }
            case 'OPEN_FILE_PICKER': {
                const defaultUri = message.solutionLocation
                    ? vscode.Uri.file(message.solutionLocation)
                    : undefined;
                const selectedPaths = await this.showOpenDialog({
                    defaultUri,
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                });
                return selectedPaths?.[0]
                    ? [{
                        type: 'SOLUTION_LOCATION',
                        requestId: message.requestId,
                        data: { path: selectedPaths[0].fsPath },
                    }]
                    : [];
            }
            case 'DATA_GET_DEFAULT_LOCATION': {
                const currentLocation = this.workspaceFoldersProvider.workspaceFolders?.[0].uri.fsPath;
                return currentLocation
                    ? [{
                        type: 'SOLUTION_LOCATION',
                        requestId: message.requestId,
                        data: { path: path.dirname(currentLocation) },
                    }]
                    : [];
            }
            case 'DATA_GET_BOARD_INFO': {
                const data = await this.dataModel.getBoardInfo(message.boardKey);
                return data ? [{ type: 'HARDWARE_INFO', requestId: message.requestId, data }] : [];
            }
            case 'DATA_GET_DEVICE_INFO': {
                const data = await this.dataModel.getDeviceInfo(message.deviceKey);
                return data ? [{ type: 'HARDWARE_INFO', requestId: message.requestId, data }] : [];
            }
            case 'DATA_GET_CONNECTED_DEVICE': {
                const name = await this.getConnectedBoardName();
                return name ? [{ type: 'CONNECTED_BOARD', requestId: message.requestId, data: { name } }] : [];
            }
            case 'GET_PLATFORM':
                return [{ type: 'PLATFORM', requestId: message.requestId, data: { name: 'vscode' } }];
            case 'DATA_GET_DATAMANAGER_APPS': {
                const data = await this.dataModel.getDraftProjects(
                    message.device,
                    message.board,
                    message.fromAllPackVersions,
                );
                return [{ type: 'DATAMANAGER_APPS_DATA', requestId: message.requestId, data }];
            }
            case 'GET_STATE_USE_WEBSERVICES':
                return [{
                    type: 'STATE_USE_WEBSERVICES',
                    requestId: message.requestId,
                    enabled: this.useWebServices(),
                }];
            case 'DATA_GET_DRAFTPROJECT_INFO': {
                const data = await this.dataModel.getDraftProjectInfo(message.id);
                return data ? [{ type: 'DRAFTPROJECT_INFO', requestId: message.requestId, data }] : [];
            }
            case 'HELP_OPEN':
                await this.commandsProvider.executeCommand(OpenCommand.openHelpCommandId, 'create_app.html');
                return [];
        }
    }

    private async createSolution(message: Messages.NewSolutionMessage): Promise<void> {
        const request: CreateSolutionRequest = {
            solutionName: message.solutionName,
            projects: message.projects.map(project => ({
                name: project.name,
                processorName: project.processorName,
                trustzone: project.trustzone,
            })),
            targetTypes: message.targetTypes.map(targetType => ({
                type: targetType.type,
                board: targetType.board,
                device: targetType.device,
            })),
            packs: message.packs.map(pack => ({
                pack: pack.pack,
                forContext: pack.forContext,
                notForContext: pack.notForContext,
            })),
            gitInit: message.gitInit,
            solutionLocation: message.solutionLocation,
            solutionFolder: message.solutionFolder,
            compiler: message.compiler,
            showOpenDialog: message.showOpenDialog,
            draftProject: message.selectedDraftId
                ? await this.dataModel.getDraftProject(message.selectedDraftId)
                : undefined,
        };

        await this.solutionCreator.createSolution(request);
    }

    private async getConnectedBoardName(): Promise<string | undefined> {
        try {
            return await this.commandsProvider.executeCommandIfRegistered<string>(
                'device-manager.getBuildTargetName',
            );
        } catch {
            return undefined;
        }
    }
}
