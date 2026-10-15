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

import 'jest';
import * as vscode from 'vscode';
import * as manifest from '../../manifest';
import { csolutionFactory } from '../../solutions/csolution.factory';
import { solutionManagerFactory } from '../../solutions/solution-manager.factories';
import { commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { configurationProviderFactory } from '../../vscode-api/configuration-provider.factories';
import { ManageSolutionCustomEditorProvider, registerManageSolutionCommand } from './manage-solution-custom-editor';

type MockTabGroups = {
    all: Array<{ tabs: vscode.Tab[] }>;
    close: jest.Mock;
    onDidChangeTabs: jest.Mock;
};

describe('registerManageSolutionCommand', () => {
    const solutionUri = vscode.Uri.file('/workspace/folder/solution.csolution.yml');
    const commandOpenUiEditor = `${manifest.PACKAGE_NAME}.openManageSolutionUiEditor`;
    const commandOpenTextEditor = `${manifest.PACKAGE_NAME}.openManageSolutionTextEditor`;

    let tabGroups: MockTabGroups;
    let onDidChangeTabsHandler: ((event: vscode.TabChangeEvent) => void) | undefined;

    beforeEach(() => {
        onDidChangeTabsHandler = undefined;
        tabGroups = {
            all: [],
            close: jest.fn().mockResolvedValue(undefined),
            onDidChangeTabs: jest.fn().mockImplementation((cb: (event: vscode.TabChangeEvent) => void) => {
                onDidChangeTabsHandler = cb;
                return { dispose: jest.fn() };
            }),
        };

        (vscode.window as unknown as { tabGroups: MockTabGroups }).tabGroups = tabGroups;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('closes text tab for same solution when opening UI editor in single-editor mode', async () => {
        const commandsProvider = commandsProviderFactory();
        const solutionManager = solutionManagerFactory();
        const configurationProvider = configurationProviderFactory();
        configurationProvider.getConfigVariableOrDefault.mockReturnValue(true);
        solutionManager.getCsolution.mockReturnValue(csolutionFactory({ solutionPath: solutionUri.fsPath }));

        const textTab = { input: { uri: solutionUri } } as unknown as vscode.Tab;
        const customTab = { input: { uri: solutionUri, viewType: ManageSolutionCustomEditorProvider.viewType } } as unknown as vscode.Tab;
        tabGroups.all = [{ tabs: [textTab, customTab] }];

        registerManageSolutionCommand(commandsProvider, solutionManager, configurationProvider);

        await commandsProvider.mockRunRegistered(commandOpenUiEditor, solutionUri);

        expect(tabGroups.close).toHaveBeenCalledWith([textTab], true);
        expect(commandsProvider.executeCommand).toHaveBeenCalledWith(
            'vscode.openWith',
            solutionUri,
            ManageSolutionCustomEditorProvider.viewType
        );
    });

    it('closes manage solution custom tab for same solution when opening text editor in single-editor mode', async () => {
        const commandsProvider = commandsProviderFactory();
        const solutionManager = solutionManagerFactory();
        const configurationProvider = configurationProviderFactory();
        configurationProvider.getConfigVariableOrDefault.mockReturnValue(true);
        solutionManager.getCsolution.mockReturnValue(csolutionFactory({ solutionPath: solutionUri.fsPath }));

        const textTab = { input: { uri: solutionUri } } as unknown as vscode.Tab;
        const customTab = { input: { uri: solutionUri, viewType: ManageSolutionCustomEditorProvider.viewType } } as unknown as vscode.Tab;
        tabGroups.all = [{ tabs: [textTab, customTab] }];

        registerManageSolutionCommand(commandsProvider, solutionManager, configurationProvider);

        await commandsProvider.mockRunRegistered(commandOpenTextEditor, solutionUri);

        expect(tabGroups.close).toHaveBeenCalledWith([customTab], true);
        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.openWith', solutionUri, 'default');
    });

    it('closes newly opened text tab from explorer when webview tab already exists', async () => {
        const commandsProvider = commandsProviderFactory();
        const solutionManager = solutionManagerFactory();
        const configurationProvider = configurationProviderFactory();
        configurationProvider.getConfigVariableOrDefault.mockReturnValue(true);
        solutionManager.getCsolution.mockReturnValue(csolutionFactory({ solutionPath: solutionUri.fsPath }));

        const textTab = { input: { uri: solutionUri } } as unknown as vscode.Tab;
        const customTab = { input: { uri: solutionUri, viewType: ManageSolutionCustomEditorProvider.viewType } } as unknown as vscode.Tab;
        tabGroups.all = [{ tabs: [customTab, textTab] }];

        registerManageSolutionCommand(commandsProvider, solutionManager, configurationProvider);
        expect(onDidChangeTabsHandler).toBeDefined();

        onDidChangeTabsHandler!({ opened: [textTab], closed: [], changed: [] });
        await Promise.resolve();

        expect(tabGroups.close).toHaveBeenCalledWith([textTab], true);
    });

    it('does not close tabs when single-editor mode is disabled', async () => {
        const commandsProvider = commandsProviderFactory();
        const solutionManager = solutionManagerFactory();
        const configurationProvider = configurationProviderFactory();
        configurationProvider.getConfigVariableOrDefault.mockReturnValue(false);
        solutionManager.getCsolution.mockReturnValue(csolutionFactory({ solutionPath: solutionUri.fsPath }));

        const textTab = { input: { uri: solutionUri } } as unknown as vscode.Tab;
        const customTab = { input: { uri: solutionUri, viewType: ManageSolutionCustomEditorProvider.viewType } } as unknown as vscode.Tab;
        tabGroups.all = [{ tabs: [customTab, textTab] }];

        registerManageSolutionCommand(commandsProvider, solutionManager, configurationProvider);

        await commandsProvider.mockRunRegistered(commandOpenUiEditor, solutionUri);
        expect(onDidChangeTabsHandler).toBeDefined();
        onDidChangeTabsHandler!({ opened: [textTab], closed: [], changed: [] });
        await Promise.resolve();

        expect(tabGroups.close).not.toHaveBeenCalled();
    });
});
