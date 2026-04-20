/**
 * Copyright 2025-2026 Arm Limited
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
import { TreeViewProvider } from './treeview-provider';
import { SolutionOutlineView } from './solution-outline';
import { SolutionLoadState } from '../../solutions/solution-manager';
import { waitForPromises } from '../../__test__/test-waits';
import { activeSolutionLoadStateFactory, idleSolutionLoadStateFactory, solutionManagerFactory } from '../../solutions/solution-manager.factories';
import { extensionContextFactory } from '../../vscode-api/extension-context.factories';
import { CsolutionGlobalState, GlobalState } from '../../vscode-api/global-state';
import { globalStateFactory } from '../../vscode-api/global-state.factories';
import { COutlineItem } from './tree-structure/solution-outline-item';
import { csolutionFactory } from '../../solutions/csolution.factory';
import { TreeViewFileDecorationProvider } from './treeview-decoration-provider';
import { configurationProviderFactory, MockConfigurationProvider } from '../../vscode-api/configuration-provider.factories';
import { CONFIG_AUTO_REVEAL_CMSIS_VIEW } from '../../manifest';

describe('SolutionOutlineView', () => {
    let mockTreeViewProvider: TreeViewProvider<COutlineItem>;
    let mockTreeViewFileDecorationProvider: TreeViewFileDecorationProvider;
    let visibilityChangeEmitter: vscode.EventEmitter<Event>;
    let globalStateProvider: GlobalState<CsolutionGlobalState>;
    let configurationProvider: MockConfigurationProvider;

    beforeEach(async () => {
        visibilityChangeEmitter = new vscode.EventEmitter();

        mockTreeViewProvider = {
            updateTree: jest.fn(),
            setDescription: jest.fn(),
            setTitle: jest.fn(),
            setBadge: jest.fn(),
            registerVisibilityChangeEvent: visibilityChangeEmitter.event,
            activate: jest.fn(),
        };

        mockTreeViewFileDecorationProvider = {
            setTreeRoot: jest.fn(),
        } as unknown as TreeViewFileDecorationProvider;

        globalStateProvider = globalStateFactory();
        configurationProvider = configurationProviderFactory();
    });


    it('shows a badge when the solution outline is shown for the first time', async () => {
        const view = new SolutionOutlineView(
            solutionManagerFactory(),
            mockTreeViewProvider,
            globalStateProvider,
            mockTreeViewFileDecorationProvider,
            configurationProvider
        );
        const context = extensionContextFactory();

        context.globalState.update('panelSeen', undefined);
        await view.activate(context);

        expect(mockTreeViewProvider.setBadge).toHaveBeenCalledWith({ tooltip: '', value: 1 });
    });

    it('stops showing the badge once the solution outline has been seen', async () => {
        const view = new SolutionOutlineView(
            solutionManagerFactory(),
            mockTreeViewProvider,
            globalStateProvider,
            mockTreeViewFileDecorationProvider,
            configurationProvider
        );
        const context = extensionContextFactory();

        await view.activate(context);
        visibilityChangeEmitter.fire(new Event('some event'));

        expect(mockTreeViewProvider.setBadge).toHaveBeenCalledWith({ tooltip: '', value: 0 });
    });

    it('sets the description of the outline view to the target type when csolution is loaded', async () => {
        const solutionLoadedState = activeSolutionLoadStateFactory({ });
        const mockSolutionManager = solutionManagerFactory({
            loadState: solutionLoadedState,
            getCsolution: jest.fn().mockReturnValue(csolutionFactory({
                getActiveTargetSetName: jest.fn().mockReturnValue('test-target'),
            })),
        });
        const view = new SolutionOutlineView(
            mockSolutionManager,
            mockTreeViewProvider,
            globalStateProvider,
            mockTreeViewFileDecorationProvider,
            configurationProvider
        );
        await view.activate(extensionContextFactory());

        mockSolutionManager.onDidChangeLoadStateEmitter.fire({
            previousState: { solutionPath: undefined },
            newState: solutionLoadedState,
        });
        await waitForPromises();

        expect(mockTreeViewProvider.setDescription).toHaveBeenCalledWith('test-target');
    });

    it('sets the title of the outline view when csolution is loaded', async () => {
        const mockSolutionManager = solutionManagerFactory({
            getCsolution: jest.fn().mockReturnValue(csolutionFactory({
                solutionPath: '/path/to/My-Solution.csolution.yml',
            })),
            loadState: activeSolutionLoadStateFactory(),
        });
        const view = new SolutionOutlineView(
            mockSolutionManager,
            mockTreeViewProvider,
            globalStateProvider,
            mockTreeViewFileDecorationProvider,
            configurationProvider
        );
        await view.activate(extensionContextFactory());

        mockSolutionManager.onDidChangeLoadStateEmitter.fire({
            previousState: { solutionPath: undefined },
            newState: activeSolutionLoadStateFactory(),
        });
        await waitForPromises();

        expect(mockTreeViewProvider.setTitle).toHaveBeenCalledWith('My-Solution');
    });

    it('resets the title and description of the outline view when csolution is unloaded', async () => {
        const mockSolutionManager = solutionManagerFactory({
            getCsolution: jest.fn().mockReturnValue(csolutionFactory({
                solutionPath: '/path/to/My-Solution.csolution.yml',
            })),
            loadState: idleSolutionLoadStateFactory(),
        });
        const view = new SolutionOutlineView(
            mockSolutionManager,
            mockTreeViewProvider,
            globalStateProvider,
            mockTreeViewFileDecorationProvider,
            configurationProvider
        );
        await view.activate(extensionContextFactory());

        mockSolutionManager.onDidChangeLoadStateEmitter.fire({
            previousState: activeSolutionLoadStateFactory(),
            newState: idleSolutionLoadStateFactory(),
        });
        await waitForPromises();

        expect(mockTreeViewProvider.setTitle).toHaveBeenCalledWith('');
        expect(mockTreeViewProvider.setDescription).toHaveBeenCalledWith('');
    });

    it('change the outline view when the solution is reloading', async () => {
        const loadedState = activeSolutionLoadStateFactory();
        const loadingState: SolutionLoadState = { ...loadedState };
        const mockSolutionManager = solutionManagerFactory({ loadState: loadingState });
        const view = new SolutionOutlineView(
            mockSolutionManager,
            mockTreeViewProvider,
            globalStateProvider,
            mockTreeViewFileDecorationProvider,
            configurationProvider
        );
        await view.activate(extensionContextFactory());

        mockSolutionManager.onDidChangeLoadStateEmitter.fire({
            previousState: loadedState,
            newState: loadingState,
        });
        await waitForPromises();

        expect(mockTreeViewProvider.updateTree).toHaveBeenCalled();
    });

    it('clears the outline view when the solution fails to load', async () => {
        const loadingState: SolutionLoadState = { ...activeSolutionLoadStateFactory() };
        const errorState: SolutionLoadState = { ...loadingState };
        const mockSolutionManager = solutionManagerFactory({ loadState: errorState });
        mockSolutionManager.getCsolution.mockReturnValue(undefined);

        const view = new SolutionOutlineView(
            mockSolutionManager,
            mockTreeViewProvider,
            globalStateProvider,
            mockTreeViewFileDecorationProvider,
            configurationProvider
        );
        await view.activate(extensionContextFactory());

        mockSolutionManager.loadState = errorState;
        mockSolutionManager.onDidChangeLoadStateEmitter.fire({
            previousState: loadingState,
            newState: errorState,
        });
        await waitForPromises();

        expect(mockTreeViewProvider.updateTree).toHaveBeenCalled();
    });

    it('reveals the solution outline when a new solution is loaded and auto reveal is enabled', async () => {
        const executeCommandSpy = jest.spyOn(vscode.commands, 'executeCommand').mockResolvedValue(undefined);
        const solutionLoadedState = activeSolutionLoadStateFactory();
        const mockSolutionManager = solutionManagerFactory({
            loadState: solutionLoadedState,
            getCsolution: jest.fn().mockReturnValue(csolutionFactory()),
        });
        const view = new SolutionOutlineView(
            mockSolutionManager,
            mockTreeViewProvider,
            globalStateProvider,
            mockTreeViewFileDecorationProvider,
            configurationProvider
        );

        await view.activate(extensionContextFactory());
        mockSolutionManager.onDidChangeLoadStateEmitter.fire({
            previousState: { solutionPath: undefined },
            newState: solutionLoadedState,
        });
        await waitForPromises();

        expect(executeCommandSpy).toHaveBeenCalledWith(`${SolutionOutlineView.treeViewId}.open`, { preserveFocus: true });

        executeCommandSpy.mockRestore();
    });

    it('does not reveal the solution outline when auto reveal is disabled', async () => {
        const executeCommandSpy = jest.spyOn(vscode.commands, 'executeCommand').mockResolvedValue(undefined);
        const solutionLoadedState = activeSolutionLoadStateFactory();
        const mockSolutionManager = solutionManagerFactory({
            loadState: solutionLoadedState,
            getCsolution: jest.fn().mockReturnValue(csolutionFactory()),
        });
        configurationProvider = configurationProviderFactory({
            [CONFIG_AUTO_REVEAL_CMSIS_VIEW]: false,
        });
        const view = new SolutionOutlineView(
            mockSolutionManager,
            mockTreeViewProvider,
            globalStateProvider,
            mockTreeViewFileDecorationProvider,
            configurationProvider
        );

        await view.activate(extensionContextFactory());
        mockSolutionManager.onDidChangeLoadStateEmitter.fire({
            previousState: { solutionPath: undefined },
            newState: solutionLoadedState,
        });
        await waitForPromises();

        expect(executeCommandSpy).not.toHaveBeenCalledWith(`${SolutionOutlineView.treeViewId}.open`, { preserveFocus: true });

        executeCommandSpy.mockRestore();
    });

});
