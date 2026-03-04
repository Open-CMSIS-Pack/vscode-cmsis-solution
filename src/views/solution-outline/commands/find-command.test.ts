/**
 * Copyright 2025-2026 Arm Limited
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

import { extensionContextFactory } from '../../../vscode-api/extension-context.factories';
import { commandsProviderFactory, MockCommandsProvider } from '../../../vscode-api/commands-provider.factories';
import { FindCommand } from './find-command';
import { SolutionOutlineView } from '../solution-outline';
import vscode from 'vscode';

describe('FindCommand', () => {
    let commandsProvider: MockCommandsProvider;

    beforeEach(async () => {
        commandsProvider = commandsProviderFactory();
    });

    it('registers the command on activation', async () => {
        const view = new FindCommand(
            commandsProvider,
        );

        await view.activate(extensionContextFactory());

        expect(commandsProvider.registerCommand).toHaveBeenCalledTimes(1);
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(FindCommand.commandListFind, expect.any(Function), expect.anything());
    });

    it('invokes the list find command', async () => {
        const view = new FindCommand(commandsProvider);
        await view.activate(extensionContextFactory());

        jest.spyOn(view, 'listFind' as keyof FindCommand).mockImplementation(async () => {
            await commandsProvider.executeCommand(`${SolutionOutlineView.treeViewId}.focus`);
            await commandsProvider.executeCommand('list.find');
            return Promise.resolve();
        });
        await commandsProvider.mockRunRegistered(FindCommand.commandListFind);

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith(`${SolutionOutlineView.treeViewId}.focus`);
        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('list.find');
    });

    it('directly invokes listFind and calls focus then list.find commands', async () => {
        // Arrange: Spy on vscode.commands.executeCommand
        const executeCommandSpy = jest.spyOn(vscode.commands, 'executeCommand').mockImplementation((command: string) => {
            if (command === `${SolutionOutlineView.treeViewId}.focus`) {
                return Promise.resolve(undefined);
            } else if (command === 'list.find') {
                return Promise.resolve('find result');
            }
            return Promise.resolve();
        });

        const view = new FindCommand(commandsProvider);

        // Act: Call the private listFind (casting to any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (view as any).listFind();

        // Assert: Verify that the focus and list.find commands were executed
        expect(executeCommandSpy).toHaveBeenCalledWith(`${SolutionOutlineView.treeViewId}.focus`);
        expect(executeCommandSpy).toHaveBeenCalledWith('list.find');
        expect(result).toBe('find result');

        executeCommandSpy.mockRestore();
    });

});
