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

import { existsSync } from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { DataManager } from '../../data-manager/data-manager';
import * as manifest from '../../manifest';
import { CreateSolutionRequest, SolutionCreator } from '../../solutions/solution-creator';
import { isUseWebServices } from '../../util';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { MessageProvider } from '../../vscode-api/message-provider';
import { WorkspaceFoldersProvider } from '../../vscode-api/workspace-folders-provider';
import { WebviewManager, WebviewManagerOptions } from '../webview-manager';
import { CreateSolutionData } from './create-solution-data';
import * as Messages from './messages';
import { NewSolutionMessage } from './messages';
import { OpenCommand } from '../solution-outline/commands/open-command';

export const CREATE_SOLUTION_WEBVIEW_OPTIONS: Readonly<WebviewManagerOptions> =
  {
      title: 'Create Solution',
      scriptPath: path.join('dist', 'views', 'createSolution.js'),
      viewType: 'cmsis.createSolution',
      commandId: `${manifest.PACKAGE_NAME}.createSolution`,
      iconName: {
          dark: 'cmsis-icn.svg',
          light: 'cmsis-icn-light.svg',
      },
  };

export class CreateSolutionWebviewMain {
    private readonly webviewManager: WebviewManager<
    Messages.IncomingMessage,
    Messages.OutgoingMessage
  >;
    private readonly dataModel: CreateSolutionData;

    constructor(
        private readonly solutionCreator: SolutionCreator,
        private readonly context: vscode.ExtensionContext,
        private readonly messageProvider: MessageProvider,
        private readonly commandsProvider: CommandsProvider,
        private readonly workspaceFoldersProvider: WorkspaceFoldersProvider,
        private readonly dataManager: DataManager,
        webviewManager?: WebviewManager<
            Messages.IncomingMessage,
            Messages.OutgoingMessage
        >,
    ) {
        this.webviewManager =
      webviewManager ||
      new WebviewManager(
          context,
          CREATE_SOLUTION_WEBVIEW_OPTIONS,
          this.commandsProvider,
      );

        this.dataModel = new CreateSolutionData(
            this.context,
            this.webviewManager,
            this.dataManager,
        );
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.webviewManager.onDidReceiveMessage(this.handleMessage, this),
        );
        this.webviewManager.activate(context);
        this.webviewManager.onDidDispose(this.dataModel.reset.bind(this.dataModel));
    }

    private async handleMessage(
        message: Messages.OutgoingMessage,
    ): Promise<void> {
        if (message.type === 'WEBVIEW_CLOSE') {
            this.webviewManager.disposePanel();
            return;
        }

        try {
            switch (message.type) {
                case 'NEW_SOLUTION':
                    if (!await this.createSolution(message)) {
                        return;
                    }
                    break;
                case 'CHECK_SOLUTION_DOES_NOT_EXIST': {
                    const solutionExists = this.fileExists(
                        path.join(message.solutionLocation, message.solutionFolder),
                    );
                    this.webviewManager.sendMessage({
                        type: solutionExists ? 'REQUEST_FAILED' : 'REQUEST_SUCCESSFUL',
                        requestType: message.type,
                        requestId: message.requestId,
                        errorMessage: 'Solution already exists',
                    });
                    return; // early exit to prevent showErrorMessage as this is a deliberate failure
                }
                case 'DATA_GET_TARGETS':
                    await this.sendTargetData(message.requestId);
                    break;
                case 'OPEN_FILE_PICKER': {
                    const pathUri =
            message.solutionLocation != undefined &&
            message.solutionLocation != ''
                ? vscode.Uri.file(message.solutionLocation)
                : undefined;
                    const filePath = await vscode.window.showOpenDialog({
                        defaultUri: pathUri,
                        canSelectFiles: false,
                        canSelectFolders: true,
                        canSelectMany: false,
                    });
                    if (filePath) {
                        this.webviewManager.sendMessage({
                            type: 'SOLUTION_LOCATION',
                            requestId: message.requestId,
                            data: { path: filePath[0].fsPath },
                        });
                    }
                    break;
                }
                case 'DATA_GET_DEFAULT_LOCATION': {
                    this.setDefaultLocation(message.requestId);
                    break;
                }
                case 'DATA_GET_BOARD_INFO':
                    await this.sendBoardInfo(message.boardKey, message.requestId);
                    break;
                case 'DATA_GET_DEVICE_INFO':
                    await this.sendDeviceInfo(message.deviceKey, message.requestId);
                    break;
                case 'DATA_GET_CONNECTED_DEVICE':
                    await this.sendConnectedDeviceInfo(message.requestId);
                    break;
                case 'GET_PLATFORM':
                    await this.sendPlatform(message.requestId);
                    break;
                case 'DATA_GET_DATAMANAGER_APPS':
                    await this.sendDatamanagerAppsData(
                        message.requestId,
                        message.device,
                        message.board,
                        message.fromAllPackVersions,
                    );
                    break;
                case 'GET_STATE_USE_WEBSERVICES':
                    await this.sendStateUseWebservices(message.requestId);
                    break;
                case 'DATA_GET_DRAFTPROJECT_INFO':
                    await this.getDraftProjectInfo(message.id, message.requestId);
                    break;
                case 'HELP_OPEN':
                    await this.commandsProvider.executeCommand(OpenCommand.openHelpCommandId, 'create_app.html');
                    break;
            }
            this.webviewManager.sendMessage({
                type: 'REQUEST_SUCCESSFUL',
                requestType: message.type,
                requestId: message.requestId,
            });
        } catch (err) {
            const _err = err as Error;
            this.messageProvider.showErrorMessage(
                `Solution service failure: ${_err.message}\n${_err.stack}`,
            );
            this.webviewManager.sendMessage({
                type: 'REQUEST_FAILED',
                requestType: message.type,
                requestId: message.requestId,
                errorMessage: _err.message,
            });
            console.log(err);
        }
    }

    /**
   * Private WebView message routines
   */

    private fileExists(path: string): boolean {
        return existsSync(path);
    }

    private setDefaultLocation(requestId: Messages.RequestId): void {
        let defaultLocation: string = '';
        const currentLocation =
      this.workspaceFoldersProvider.workspaceFolders?.[0].uri.fsPath;
        if (currentLocation) {
            defaultLocation = path.dirname(currentLocation);
        }
        if (defaultLocation) {
            this.webviewManager.sendMessage({
                type: 'SOLUTION_LOCATION',
                requestId,
                data: { path: defaultLocation },
            });
        }
    }

    private async createSolution(message: NewSolutionMessage): Promise<boolean> {
        const request: CreateSolutionRequest = {
            solutionName: message.solutionName,
            projects: message.projects,
            targetTypes: message.targetTypes,
            packs: message.packs,
            gitInit: message.gitInit,
            solutionLocation: message.solutionLocation,
            solutionFolder: message.solutionFolder,
            compiler: message.compiler,
            selectedDraftId: message.selectedDraftId,
            showOpenDialog: message.showOpenDialog,
            draftProject: message.selectedDraftId
                ? await this.dataModel.getDraftProjectById(message.selectedDraftId)
                : undefined,
        };

        try {
            await this.solutionCreator.createSolution(request);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : error;
            this.messageProvider.showErrorMessage(
                `Failed to create solution: ${errorMessage}`,
            );
            this.webviewManager.sendMessage({
                type: 'REQUEST_FAILED',
                requestType: 'NEW_SOLUTION',
                requestId: message.requestId,
                errorMessage: `Failed to create solution: ${errorMessage}`,
            });
            return false;
        }
    }

    private async sendPlatform(requestId: Messages.RequestId) {
        this.webviewManager.sendMessage({
            type: 'PLATFORM',
            requestId,
            data: { name: 'vscode' },
        });
    }

    private async sendTargetData(requestId: Messages.RequestId): Promise<void> {
        return this.dataModel.sendTargetData(requestId);
    }

    private async sendBoardInfo(
        boardKey: string,
        requestId: Messages.RequestId,
    ): Promise<void> {
        return this.dataModel.sendBoardInfo(boardKey, requestId);
    }

    private async sendDeviceInfo(
        deviceKey: string,
        requestId: Messages.RequestId,
    ): Promise<void> {
        return this.dataModel.sendDeviceInfo(deviceKey, requestId);
    }

    private async sendConnectedDeviceInfo(requestId: Messages.RequestId): Promise<void> {
        try {
            const connectedBoardName =
        await this.commandsProvider.executeCommandIfRegistered<string>(
            'device-manager.getBuildTargetName',
        );
            if (connectedBoardName) {
                this.webviewManager.sendMessage({
                    type: 'CONNECTED_BOARD',
                    requestId,
                    data: { name: connectedBoardName },
                });
            }
        } catch {
            return;
        }
    }

    private async sendDatamanagerAppsData(
        requestId: Messages.RequestId,
        device?: string,
        board?: string,
        fromAllPackVersions?: boolean,
    ) {
        return this.dataModel.sendDatamanagerAppsData(requestId, device, board, fromAllPackVersions);
    }

    private async sendStateUseWebservices(requestId: Messages.RequestId) {
        const en = isUseWebServices();
        return this.webviewManager.sendMessage({
            type: 'STATE_USE_WEBSERVICES',
            requestId,
            enabled: en,
        });
    }

    private async getDraftProjectInfo(id: string, requestId: Messages.RequestId) {
        return this.dataModel.getDraftProjectInfo(id, requestId);
    }
}
