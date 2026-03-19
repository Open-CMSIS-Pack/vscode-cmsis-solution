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

import type * as vscode from 'vscode';
import { SolutionManager } from '../../solutions/solution-manager';
import { ConfigureVcpkgForSolution } from '../../vcpkg/configure-vcpkg';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { ExtensionApiProvider } from '../../vscode-api/extension-api-provider';

export const installArmToolsAction = 'Install Environment Manager';
export const addToVcpkgAction = 'Add to Arm Tools';
export const showInstallationDocsAction = 'Manual Setup';
type Action = typeof showInstallationDocsAction | typeof addToVcpkgAction | typeof installArmToolsAction;

export const installationDocsUrl = 'https://open-cmsis-pack.github.io/cmsis-toolbox/installation';

export type HandleBuildEnoent = () => Promise<void>;

export const getHandleBuildEnoent = (
    solutionManager: SolutionManager,
    environmentManagerApiProvider: ExtensionApiProvider<unknown>,
    commandsProvider: CommandsProvider,
    configureVcpkg: ConfigureVcpkgForSolution,
    vscodeWindow: Pick<typeof vscode.window, 'showWarningMessage'>,
    vscodeWorkspace: Pick<typeof vscode.workspace, 'workspaceFolders'>,
): HandleBuildEnoent => async () => {
    const { message, actions } = await getNotificationMessageAndActions(environmentManagerApiProvider);

    const action = await vscodeWindow.showWarningMessage(message, ...actions);

    if (action) {
        await handleAction(action, solutionManager, commandsProvider, configureVcpkg, vscodeWorkspace);
    }
};

type MessageAndActions = {
    message: string;
    actions: Action[];
}

const getNotificationMessageAndActions = async  (environmentManagerApiProvider: ExtensionApiProvider<unknown>): Promise<MessageAndActions> => {
    const environmentManagerApi = await environmentManagerApiProvider.activateIfEnabled();

    const environmentSentence = environmentManagerApi
        ? 'or add it to Arm Tools.'
        : 'or install [Arm Tools Environment Manager](https://marketplace.visualstudio.com/items?itemName=Arm.environment-manager) extension.';

    const message = [
        'CMSIS-Toolbox not found.',
        'Set PATH environment manually ',
        environmentSentence,
    ].join(' ');

    const actions: Action[] = [
        showInstallationDocsAction,
        environmentManagerApi ? addToVcpkgAction : installArmToolsAction,
    ];

    return { message, actions };
};

const handleAction = async (
    action: Action,
    solutionManager: SolutionManager,
    commandsProvider: CommandsProvider,
    configureVcpkg: ConfigureVcpkgForSolution,
    vscodeWorkspace: Pick<typeof vscode.workspace, 'workspaceFolders'>,
): Promise<void> => {
    switch (action) {
        case addToVcpkgAction: {
            const rootUri = vscodeWorkspace.workspaceFolders?.[0]?.uri;
            if (rootUri) {
                const csolution = solutionManager.getCsolution();
                const compilers = csolution?.getCompilers() ?? ['AC6'];
                await configureVcpkg(rootUri, compilers);
            } else {
                throw new Error('Unable to update vcpkg configuration because there is no folder open');
            }
            return;
        }
        case installArmToolsAction:
            commandsProvider.executeCommand('workbench.extensions.installExtension', 'arm.environment-manager');
            return;
        case showInstallationDocsAction: {
            commandsProvider.executeCommand('vscode.open', installationDocsUrl);
            return;
        }
    }
};
