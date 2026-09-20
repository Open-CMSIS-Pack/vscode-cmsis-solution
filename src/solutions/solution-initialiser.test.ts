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

import { URI as Uri } from 'vscode-uri';
import { ConfigureVcpkgForSolution } from '../vcpkg/configure-vcpkg';
import { MockCommandsProvider, commandsProviderFactory } from '../vscode-api/commands-provider.factories';
import { CsolutionGlobalState, GlobalState } from '../vscode-api/global-state';
import { globalStateFactory } from '../vscode-api/global-state.factories';
import { MockMessageProvider, messageProviderFactory } from '../vscode-api/message-provider.factories';
import { MockWorkspaceFoldersProvider, workspaceFoldersProviderFactory } from '../vscode-api/workspace-folders-provider.factories';
import { createdSolutionFactory } from './solution-creator.factories';
import { SolutionInitialiser, SolutionInitialiserImp } from './solution-initialiser';
import { TestDataHandler } from '../__test__/test-data';
import fs from 'node:fs';
import path from 'node:path';

describe('SolutionInitialiserImp', () => {
    const testDataHandler = new TestDataHandler();
    let solutionInitialiser: SolutionInitialiser;
    let commandsProvider: MockCommandsProvider;
    let workspaceFoldersProvider: MockWorkspaceFoldersProvider;
    let mockConfigureVcpkgForNewSolution: jest.MockedFunction<ConfigureVcpkgForSolution>;
    let messageProvider: MockMessageProvider;
    let mockOpenNewSolutionModal: jest.Mock;
    let globalStateProvider: GlobalState<CsolutionGlobalState>;
    // This is set to false to avoid mocking the git extension
    const enableGit = false;

    beforeEach(async () => {
        commandsProvider = commandsProviderFactory();
        workspaceFoldersProvider = workspaceFoldersProviderFactory();
        mockConfigureVcpkgForNewSolution = jest.fn();
        messageProvider = messageProviderFactory();
        mockOpenNewSolutionModal = jest.fn();
        globalStateProvider = globalStateFactory();

        solutionInitialiser = new SolutionInitialiserImp(
            commandsProvider,
            workspaceFoldersProvider,
            mockConfigureVcpkgForNewSolution,
            messageProvider,
            globalStateProvider,
            mockOpenNewSolutionModal,
        );
    });

    afterAll(() => {
        testDataHandler.dispose();
    });

    it('configures vcpkg when a solution has been created', async () => {
        const solutionDirUri = Uri.file(path.join(testDataHandler.tmpDir, 'vcpkg-solution'));
        const createdSolution = createdSolutionFactory({ solutionDir: solutionDirUri, vcpkgConfigured: false });
        await solutionInitialiser.initialiseSolution({ createdSolution, enableGit });

        expect(mockConfigureVcpkgForNewSolution).toHaveBeenCalledWith(solutionDirUri, ['AC6']);
        expect(commandsProvider.executeCommandIfRegistered).toHaveBeenCalledWith('keil-studio.initialise-project', solutionDirUri);
    });

    it('calls openNewSolutionModal', async () =>{
        const solutionDir = Uri.file(path.join(testDataHandler.tmpDir, 'modal-solution'));
        const createdSolution = createdSolutionFactory({ solutionDir, vcpkgConfigured: true });
        await solutionInitialiser.initialiseSolution({ createdSolution, enableGit });
        expect(mockOpenNewSolutionModal).toHaveBeenCalled();
    });

    it('calls openNewSolutionModal and provides a modal in VS Code', async () =>{
        const solutionDir = Uri.file(path.join(testDataHandler.tmpDir, 'modal-solution-with-dialog'));
        const createdSolution = createdSolutionFactory({ solutionDir, vcpkgConfigured: true });

        await solutionInitialiser.initialiseSolution({ createdSolution, enableGit });

        expect(mockOpenNewSolutionModal).toHaveBeenCalled();
    });

    it('stores the selected solution and target before opening the solution', async () => {
        const solutionDir = Uri.file(path.join(testDataHandler.tmpDir, 'selected-solution'));
        const solutionFile = Uri.file(path.join(solutionDir.fsPath, 'Selected.csolution.yml'));
        const createdSolution = createdSolutionFactory({ solutionDir, solutionFile, vcpkgConfigured: true });

        await solutionInitialiser.initialiseSolution({
            createdSolution,
            enableGit,
            activeTarget: 'SelectedTarget',
        });

        const cmsisJsonFile = path.join(solutionDir.fsPath, '.vscode', 'cmsis.json');
        const settings = JSON.parse(fs.readFileSync(cmsisJsonFile, 'utf8'));
        expect(settings).toEqual(expect.objectContaining({
            activeSolution: '../Selected.csolution.yml',
            activeTarget: 'SelectedTarget',
        }));
        expect(mockOpenNewSolutionModal).toHaveBeenCalled();
    });

});
