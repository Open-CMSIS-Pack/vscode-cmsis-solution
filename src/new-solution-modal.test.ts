/**
 * Copyright 2024-2026 Arm Limited
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
import { messageProviderFactory } from './vscode-api/message-provider.factories';
import { messageForCreatedSolution, openNewSolutionModal } from './new-solution-modal';
import { workspaceFoldersProviderFactory } from './vscode-api/workspace-folders-provider.factories';
import { commandsProviderFactory } from './vscode-api/commands-provider.factories';
import { WorkspaceFolder } from './vscode-api/workspace-folders-provider';
import { createdSolutionFactory } from './solutions/solution-creator.factories';
import { MockGlobalState, globalStateFactory } from './vscode-api/global-state.factories';

const mockUpdateWorkspaceFolders = vscode.workspace.updateWorkspaceFolders as jest.Mock;

const providersFactory = () => ({
    commands: commandsProviderFactory(),
    message: messageProviderFactory(),
    workspaceFolders: workspaceFoldersProviderFactory(),
});

describe('newSolutionModal', () => {
    let globalStateProvider: MockGlobalState;
    beforeEach(async () => {
        globalStateProvider = globalStateFactory();
    });

    describe('messageForCreatedSolution', () => {
        it('returns a message offering to open a new solution with no conversion errors or warnings', () => {
            const message = messageForCreatedSolution(createdSolutionFactory({ conversionStatus: 'none' }));
            expect(message).toContain('open the new solution');
        });

        it('returns a message offering to open a new solution with conversion warnings', () => {
            const message = messageForCreatedSolution(createdSolutionFactory({ conversionStatus: 'warnings' }));
            expect(message).toContain('warnings');
        });

        it('returns a message offering to open a new solution with conversion errors', () => {
            const message = messageForCreatedSolution(createdSolutionFactory({ conversionStatus: 'errors' }));
            expect(message).toContain('failed');
        });
    });

    it('shows an appropriate message for the CreatedSolution', () => {
        const providers = providersFactory();
        providers.message.showInformationMessage.mockResolvedValue({
            title: 'Add project to vscode workspace', isCloseAffordance: false
        });
        const createdSolution = createdSolutionFactory();

        openNewSolutionModal(createdSolution, providers, globalStateProvider);

        expect(providers.message.showInformationMessage.mock.calls[0][0]).toBe(messageForCreatedSolution(createdSolution));
    });

    it('AddToWorkspace action option', async () => {
        const providers = providersFactory();
        providers.message.showInformationMessage.mockResolvedValue({
            title: 'Add project to vscode workspace', isCloseAffordance: false
        });

        const createdSolution = createdSolutionFactory();
        await openNewSolutionModal(createdSolution, providers, globalStateProvider);

        expect(mockUpdateWorkspaceFolders).toHaveBeenCalled();
        expect(globalStateProvider.get('autoInstallPackKey')).toBeTruthy();
    });

    it('NewWindow action option', async () => {
        const providers = providersFactory();
        providers.message.showInformationMessage.mockResolvedValue({
            title: 'Open project in new window', isCloseAffordance: false
        });

        const createdSolution = createdSolutionFactory();
        await openNewSolutionModal(createdSolution, providers, globalStateProvider);

        expect(providers.commands.executeCommand).toHaveBeenCalledWith('vscode.openFolder', createdSolution.solutionDir, true);
        expect(globalStateProvider.get('autoInstallPackKey')).toBeTruthy();
    });

    it('opens the created solution in the current window when the user selects "Open"', async () => {
        const providers = providersFactory();
        providers.message.showInformationMessage.mockResolvedValue({
            title: 'Open', isCloseAffordance: false
        });

        const createdSolution = createdSolutionFactory();
        await openNewSolutionModal(createdSolution, providers, globalStateProvider);

        expect(providers.commands.executeCommand).toHaveBeenCalledWith('vscode.openFolder', createdSolution.solutionDir, false);
        expect(globalStateProvider.get('autoInstallPackKey')).toBeTruthy();
    });

    it('does not show the "Add to workspace" option when there is no open workspace', async () => {
        const providers = providersFactory();
        providers.workspaceFolders.workspaceFolders = undefined;

        providers.message.showInformationMessage.mockResolvedValue({
            title: 'Open', isCloseAffordance: false
        });

        const createdSolution = createdSolutionFactory();
        await openNewSolutionModal(createdSolution, providers, globalStateProvider);

        expect(providers.message.showInformationMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.anything(),
            expect.objectContaining({ title: 'Open' }),
            expect.objectContaining({ title: 'Open project in new window' }),
            expect.objectContaining({ title: 'Close' }),
        );
    });

    it('opens the solution file if it is in the workspace and the user did not choose another action', async () => {
        const providers = providersFactory();
        const createdSolution = createdSolutionFactory();

        providers.workspaceFolders.getWorkspaceFolder.mockImplementation(
            (fsPath: string): WorkspaceFolder | undefined => fsPath === createdSolution.solutionFile!.fsPath
                ? { uri: createdSolution.solutionDir, name: 'Workspace', index: 0 }
                : undefined
        );
        await openNewSolutionModal(createdSolution, providers, globalStateProvider);

        expect(providers.message.showInformationMessage).toHaveBeenCalledWith(`New solution created at ${createdSolution.solutionFile!.fsPath}`);
        expect(providers.commands.executeCommand).toHaveBeenCalledWith('vscode.open', createdSolution.solutionFile);
        expect(globalStateProvider.get('autoInstallPackKey')).toBeTruthy();
    });

    it('dont set auto-install pack key to true when the solution file is in a different workspace when the user did not choose another action', async () => {
        const providers = providersFactory();
        const createdSolution = createdSolutionFactory();

        providers.workspaceFolders.workspaceFolders = undefined;
        await openNewSolutionModal(createdSolution, providers, globalStateProvider);

        expect(providers.message.showInformationMessage).toHaveBeenCalledWith(`New solution created at ${createdSolution.solutionFile!.fsPath}`);
        expect(providers.commands.executeCommand).not.toHaveBeenCalledWith('vscode.open', createdSolution.solutionFile);
        expect(globalStateProvider.get('autoInstallPackKey')).toBeFalsy();
    });
});
