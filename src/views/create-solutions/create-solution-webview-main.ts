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

import * as path from 'path';
import * as vscode from 'vscode';
import { DataManager } from '../../data-manager/data-manager';
import * as manifest from '../../manifest';
import { SolutionCreator } from '../../solutions/solution-creator';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { MessageProvider } from '../../vscode-api/message-provider';
import { WorkspaceFoldersProvider } from '../../vscode-api/workspace-folders-provider';
import { WebviewManager, WebviewManagerOptions } from '../webview-manager';
import { CreateSolutionController } from './create-solution-controller';
import { CreateSolutionData } from './create-solution-data';
import * as Messages from './messages';

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
    private readonly webviewManager: WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>;
    private readonly controller: CreateSolutionController;
    private readonly dataModel: CreateSolutionData;

    constructor(
        context: vscode.ExtensionContext,
        solutionCreator: SolutionCreator,
        dataManager: DataManager,
        messageProvider: MessageProvider,
        commandsProvider: CommandsProvider,
        workspaceFoldersProvider: WorkspaceFoldersProvider,
        webviewManager?: WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>,
        controller?: CreateSolutionController,
        dataModel?: CreateSolutionData,
    ) {
        this.webviewManager = webviewManager ?? new WebviewManager(
            context,
            CREATE_SOLUTION_WEBVIEW_OPTIONS,
            commandsProvider,
        );
        this.dataModel = dataModel ?? new CreateSolutionData(
            context,
            this.webviewManager.asWebviewUri.bind(this.webviewManager),
            dataManager,
        );
        this.controller = controller ?? new CreateSolutionController(
            this.dataModel,
            solutionCreator,
            messageProvider,
            commandsProvider,
            workspaceFoldersProvider,
        );
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.webviewManager.onDidReceiveMessage(this.handleMessage, this),
        );
        this.webviewManager.activate(context);
        this.webviewManager.onDidDispose(this.dataModel.reset.bind(this.dataModel));
    }

    private async handleMessage(message: Messages.OutgoingMessage): Promise<void> {
        if (message.type === 'WEBVIEW_CLOSE') {
            this.webviewManager.disposePanel();
            return;
        }

        const responses = await this.controller.handleRequest(message);
        for (const response of responses) {
            await this.webviewManager.sendMessage(response);
        }
    }
}
