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

import 'jest';
import type { WorkspaceFolder } from 'vscode';

import { Uri } from 'vscode';
import * as handleEnoent from './handle-enoent';
import { extensionApiProviderFactory } from '../../vscode-api/extension-api-provider.factories';
import { commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { ConfigureVcpkgForSolution } from '../../vcpkg/configure-vcpkg';
import { faker } from '@faker-js/faker';
import { solutionManagerFactory } from '../../solutions/solution-manager.factories';

const handleBuildEnoentFactory = (options: { environmentManagerInstalled: boolean }) => {
    const environmentManagerApiProvider = extensionApiProviderFactory(options.environmentManagerInstalled ? {} : undefined);
    const commandsProvider = commandsProviderFactory();
    const configureVcpkg: jest.MockedFn<ConfigureVcpkgForSolution> = jest.fn();
    const showWarningMessage = jest.fn();
    const solutionManager = solutionManagerFactory();

    const workspaceFolder: WorkspaceFolder = {
        index: 0,
        name: faker.word.noun(),
        uri: Uri.file(faker.system.directoryPath()),
    };

    const handleBuildEnoent = handleEnoent.getHandleBuildEnoent(
        solutionManager,
        environmentManagerApiProvider,
        commandsProvider,
        configureVcpkg,
        { showWarningMessage },
        { workspaceFolders: [workspaceFolder] },
    );

    return { handleBuildEnoent, commandsProvider, configureVcpkg, showWarningMessage, workspaceFolder, solutionManager };
};

describe('HandleBuildEnoent', () => {
    it('shows a notification suggesting installing the Environment Manager extension if it is not installed', async () => {
        const { handleBuildEnoent, showWarningMessage } = handleBuildEnoentFactory({ environmentManagerInstalled: false });

        await handleBuildEnoent();

        expect(showWarningMessage).toHaveBeenCalledWith(
            expect.stringContaining('install [Arm Tools Environment Manager]'),
            handleEnoent.showInstallationDocsAction,
            handleEnoent.installArmToolsAction,
        );
    });

    it('shows a notification suggesting adding the CMSIS Toolbox to the vcpkg-configuration if Arm Environment Manager is installed', async () => {
        const { handleBuildEnoent, showWarningMessage } = handleBuildEnoentFactory({ environmentManagerInstalled: true });

        await handleBuildEnoent();

        expect(showWarningMessage).toHaveBeenCalledWith(
            expect.stringContaining('add it to Arm Tools'),
            handleEnoent.showInstallationDocsAction,
            handleEnoent.addToVcpkgAction,
        );
    });

    it('takes no action if the user does not choose an option', async () => {
        const { handleBuildEnoent, showWarningMessage, configureVcpkg, commandsProvider } = handleBuildEnoentFactory({ environmentManagerInstalled: true });
        showWarningMessage.mockResolvedValue(undefined);

        await handleBuildEnoent();

        expect(configureVcpkg).not.toHaveBeenCalled();
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
    });

    it('configures vcpkg for the active solution\'s compiler if the user chooses "Add to Vcpkg"', async () => {
        const { handleBuildEnoent, showWarningMessage, configureVcpkg, workspaceFolder, solutionManager } = handleBuildEnoentFactory({ environmentManagerInstalled: true });
        showWarningMessage.mockResolvedValue(handleEnoent.addToVcpkgAction);
        // Mock csolution with a getCompilers method returning ['GCC']
        const csolutionMock = solutionManager.getCsolution.mock.results[0]?.value || {};
        csolutionMock.getCompilers = () => ['GCC'];
        solutionManager.getCsolution.mockReturnValue(csolutionMock);

        await handleBuildEnoent();

        expect(configureVcpkg).toHaveBeenCalledWith(workspaceFolder.uri, ['GCC']);
    });

    it('configures vcpkg for AC6 if the user chooses "Add to Vcpkg" but there is no active solution', async () => {
        const { handleBuildEnoent, showWarningMessage, configureVcpkg, workspaceFolder, solutionManager } = handleBuildEnoentFactory({ environmentManagerInstalled: true });
        solutionManager.getCsolution.mockReturnValue(undefined);
        showWarningMessage.mockResolvedValue(handleEnoent.addToVcpkgAction);

        await handleBuildEnoent();

        expect(configureVcpkg).toHaveBeenCalledWith(workspaceFolder.uri, ['AC6']);
    });

    it('opens the Extensions panel if the user chooses "Install Environment Manager"', async () => {
        const { handleBuildEnoent, showWarningMessage, commandsProvider } = handleBuildEnoentFactory({ environmentManagerInstalled: false });
        showWarningMessage.mockResolvedValue(handleEnoent.installArmToolsAction);

        await handleBuildEnoent();

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('workbench.extensions.installExtension', 'arm.environment-manager');
    });

    it('opens the installation documentation if the user chooses "Open Installation Docs"', async () => {
        const { handleBuildEnoent, showWarningMessage, commandsProvider } = handleBuildEnoentFactory({ environmentManagerInstalled: false });
        showWarningMessage.mockResolvedValue(handleEnoent.showInstallationDocsAction);

        await handleBuildEnoent();

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', handleEnoent.installationDocsUrl);
    });
});
