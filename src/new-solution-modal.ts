/**
 * Copyright 2024-2026 Arm Limited
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

import * as vscode from 'vscode';
import { MessageProvider } from './vscode-api/message-provider';
import { CommandsProvider } from './vscode-api/commands-provider';
import { WorkspaceFoldersProvider } from './vscode-api/workspace-folders-provider';
import { CsolutionGlobalState, GlobalState } from './vscode-api/global-state';
import { CreatedSolution } from './solutions/solution-creator';
import { COMMAND_ACTIVATE_SOLUTION } from './solutions/active-solution-tracker';

export type NewSolutionModalProviders = {
    message: MessageProvider;
    workspaceFolders: WorkspaceFoldersProvider;
    commands: CommandsProvider;
}

export const messageForCreatedSolution = ({ conversionStatus }: CreatedSolution): string => {
    switch (conversionStatus) {
        case 'none':
            return 'Would you like to open the new solution?';
        case 'warnings':
            return 'Project conversion from µVision to csolution completed with warnings. ' +
                'Would you like to open the solution anyway?\n\n' +
                'More detailed information is available in the uv2csolution.log file.';
        case 'errors':
            return 'Project conversion from µVision to csolution failed. ' +
                'Would you like to open the directory anyway?\n\n' +
                'More detailed information is available in the uv2csolution.log file.';
    }
};

export async function openNewSolutionModal(createdSolution: CreatedSolution, providers: NewSolutionModalProviders, globalStateProvider: GlobalState<CsolutionGlobalState>, showOpenDialog?: boolean): Promise<void> {
    const message = messageForCreatedSolution(createdSolution);
    const openFolder = { title: 'Open', isCloseAffordance: false };
    const addToWorkspace = { title: 'Add project to vscode workspace', isCloseAffordance: false };
    const newWindow = { title: 'Open project in new window', isCloseAffordance: false };
    const close = { title: 'Close', isCloseAffordance: true };

    const workspaceFoldersCount = providers.workspaceFolders.workspaceFolders?.length ?? 0;
    const hasOpenWorkspace = workspaceFoldersCount > 0;

    const actions = [
        openFolder,
        newWindow,
        ...(hasOpenWorkspace ? [addToWorkspace] : []),
        close,
    ];

    if (showOpenDialog != undefined && !showOpenDialog) {
        globalStateProvider.update('autoInstallPackKey', true);
        providers.commands.executeCommand('vscode.openFolder', createdSolution.solutionDir, false);
    } else {
        const action = await providers.message.showInformationMessage(message, { modal: true }, ...actions);

        if (action && action.title === openFolder.title) {
            globalStateProvider.update('autoInstallPackKey', true);
            providers.commands.executeCommand('vscode.openFolder', createdSolution.solutionDir, false);
        } else if (action && action.title === newWindow.title) {
            globalStateProvider.update('autoInstallPackKey', true);
            providers.commands.executeCommand('vscode.openFolder', createdSolution.solutionDir, true);
        } else if (action && action.title === addToWorkspace.title) {
            globalStateProvider.update('autoInstallPackKey', true);
            vscode.workspace.updateWorkspaceFolders(workspaceFoldersCount, 0, { uri: createdSolution.solutionDir });
        } else {
            openWorkspaceSolutionFile(createdSolution, providers, globalStateProvider);
        }
    }
}

export async function openWorkspaceSolutionFile(createdSolution: CreatedSolution, providers: NewSolutionModalProviders, globalStateProvider: GlobalState<CsolutionGlobalState>, _showOpenDialog?: boolean) {
    if (createdSolution.solutionFile) {
        providers.message.showInformationMessage(`New solution created at ${createdSolution.solutionFile.fsPath}`);
        if (providers.workspaceFolders.getWorkspaceFolder(createdSolution.solutionFile.fsPath)) {
            globalStateProvider.update('autoInstallPackKey', true);
            providers.commands.executeCommand('vscode.open', createdSolution.solutionFile);
            providers.commands.executeCommand(COMMAND_ACTIVATE_SOLUTION, createdSolution.solutionFile);
        }
    }
}
