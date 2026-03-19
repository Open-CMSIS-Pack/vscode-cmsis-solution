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
import { faker } from '@faker-js/faker';
import { createdSolutionFactory } from './solution-creator.factories';
import { SolutionInitialiser, SolutionInitialiserImp } from './solution-initialiser';

describe('SolutionInitialiserImp', () => {
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

    it('configures vcpkg when a solution has been created', async () => {
        const solutionDirUri = Uri.file(faker.system.directoryPath());
        const createdSolution = createdSolutionFactory({ solutionDir: solutionDirUri, vcpkgConfigured: false });
        await solutionInitialiser.initialiseSolution({ createdSolution, enableGit });

        expect(mockConfigureVcpkgForNewSolution).toHaveBeenCalledWith(solutionDirUri, ['AC6']);
        expect(commandsProvider.executeCommandIfRegistered).toHaveBeenCalledWith('keil-studio.initialise-project', solutionDirUri);
    });

    it('calls openNewSolutionModal', async () =>{
        const createdSolution = createdSolutionFactory({ vcpkgConfigured: true });
        await solutionInitialiser.initialiseSolution({ createdSolution, enableGit });
        expect(mockOpenNewSolutionModal).toHaveBeenCalled();
    });

    it('calls openNewSolutionModal and provides a modal in VS Code', async () =>{
        const createdSolution = createdSolutionFactory({ vcpkgConfigured: true });

        await solutionInitialiser.initialiseSolution({ createdSolution, enableGit });

        expect(mockOpenNewSolutionModal).toHaveBeenCalled();
    });

});
