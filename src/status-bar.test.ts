/**
 * Copyright 2022-2026 Arm Limited
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
import { ExtensionContext } from 'vscode';
import { cmsisToolboxManagerFactory } from './solutions/cmsis-toolbox.factories';
import { MockSolutionManager, solutionManagerFactory } from './solutions/solution-manager.factories';
import { StatusBar } from './status-bar';
import { ThemeProvider } from './vscode-api/theme-provider';
import { csolutionFactory, CSolutionMock } from './solutions/csolution.factory';
import path from 'path';

const mockCreateStatusBarItem = vscode.window.createStatusBarItem as jest.Mock;

describe('StatusBar', () => {
    const extensionContext = { subscriptions: [] } as unknown as ExtensionContext;
    const themeProvider: ThemeProvider = { getThemeColor: (color) => ({ id: color }) };
    let solutionManager: MockSolutionManager;
    let csolution: CSolutionMock;

    beforeEach(() => {
        solutionManager = solutionManagerFactory();
        csolution = csolutionFactory({
            solutionPath: path.join(solutionManager.workspaceFolder!.fsPath, 'solution', 'test.csolution.yml')
        });
        solutionManager.getCsolution.mockReturnValue(csolution);
    });

    it('does not create a status bar item on construction', () => {
        const cmsisToolboxManager = cmsisToolboxManagerFactory();

        new StatusBar(solutionManager, cmsisToolboxManager, themeProvider);

        expect(mockCreateStatusBarItem).not.toHaveBeenCalled();
    });

    describe('after activation', () => {
        it('creates a status bar item on activation', async () => {
            const cmsisToolboxManager = cmsisToolboxManagerFactory();
            const statusBar = new StatusBar(solutionManager, cmsisToolboxManager, themeProvider);

            await statusBar.activate(extensionContext);

            expect(mockCreateStatusBarItem).toHaveBeenCalledTimes(1);
            expect(mockCreateStatusBarItem.mock.results[0].value.command).toBe(StatusBar.commandType);
            expect(mockCreateStatusBarItem.mock.results[0].value.name).toBe('CMSIS Context');
        });

        it('shows and hides the status bar item according to load state', async () => {
            const cmsisToolboxManager = cmsisToolboxManagerFactory();

            const statusBar = new StatusBar(solutionManager, cmsisToolboxManager, themeProvider);
            await statusBar.activate(extensionContext);
            const statusBarItem = mockCreateStatusBarItem.mock.results[0].value;

            solutionManager.fireOnDidChangeLoadState(
                { solutionPath: 'sol' },
                { solutionPath: '' }
            );

            expect(statusBarItem.show).toHaveBeenCalledTimes(1);
            expect(statusBarItem.hide).toHaveBeenCalledTimes(0);

            solutionManager.fireOnDidChangeLoadState(
                { solutionPath: '' },
                { solutionPath: 'sol' }
            );
            expect(statusBarItem.show).toHaveBeenCalledTimes(1);
            expect(statusBarItem.hide).toHaveBeenCalledTimes(1);
        });

        it('shows cmsis tool status bar', async () => {
            csolution.getActiveTargetSetName = jest.fn().mockReturnValue('target@set');
            csolution.getContextDescriptors = jest.fn().mockReturnValue([{
                displayName: 'project.build+target',
                projectName: 'project',
                buildType: 'build',
                targetType: 'target'
            }]);
            const cmsisToolboxManager = cmsisToolboxManagerFactory();

            const statusBar = new StatusBar(solutionManager, cmsisToolboxManager, themeProvider);
            await statusBar.activate(extensionContext);
            const statusBarItem = mockCreateStatusBarItem.mock.results[0].value;

            // start cmsis tool
            solutionManager.fireOnDidChangeLoadState(
                { solutionPath: 'sol' },
                { solutionPath: '' }
            );
            solutionManager.onLoadedBuildFilesEmitter.fire(['success', false]);
            cmsisToolboxManager.mockTriggerOnRunCmsisTool(true, false);
            expect(statusBarItem.show).toHaveBeenCalledTimes(3);
            expect(statusBarItem.text).toBe('$(sync~spin) target@set');

            // end cmsis tool
            cmsisToolboxManager.mockTriggerOnRunCmsisTool(false, false);
            expect(statusBarItem.show).toHaveBeenCalledTimes(4);
            expect(statusBarItem.text).toBe('$(target) target@set');
            expect(statusBarItem.tooltip.valueOf()).toEqual('**solution/test**\n - project.build\n');

            // cbuild setup completed and files loaded successfully
            solutionManager.onLoadedBuildFilesEmitter.fire(['success', false]);
            expect(statusBarItem.show).toHaveBeenCalledTimes(5);
            expect(statusBarItem.backgroundColor).toStrictEqual(themeProvider.getThemeColor('statusBarItem.background'));

            // Run status bar command
            statusBar.runOnClick();
            expect(vscode.commands.executeCommand).toHaveBeenCalledTimes(1);
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('cmsis-csolution.manageSolution');
            (vscode.commands.executeCommand as jest.Mock).mockClear();

            // cbuild setup completed with error
            solutionManager.onLoadedBuildFilesEmitter.fire(['error', false]);
            expect(statusBarItem.show).toHaveBeenCalledTimes(6);
            expect(statusBarItem.backgroundColor).toStrictEqual(themeProvider.getThemeColor('statusBarItem.errorBackground'));

            // Run status bar command
            statusBar.runOnClick();
            expect(vscode.commands.executeCommand).toHaveBeenCalledTimes(2);
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('cmsis-csolution.manageSolution');
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(expect.stringContaining('workbench.action.output.show.extension-output'));
        });
    });
});
