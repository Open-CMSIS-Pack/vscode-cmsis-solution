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

import path from 'node:path';
import { CSolution } from '../../../solutions/csolution';
import { solutionManagerFactory } from '../../../solutions/solution-manager.factories';
import { commandsProviderFactory } from '../../../vscode-api/commands-provider.factories';
import { extensionContextFactory } from '../../../vscode-api/extension-context.factories';
import { messageProviderFactory } from '../../../vscode-api/message-provider.factories';
import { workspaceFsProviderFactory } from '../../../vscode-api/workspace-fs-provider.factories';
import { encodeSearchFileInclude, SearchSolutionSourcesCommand } from './search-solution-sources-command';

describe('SearchSolutionSourcesCommand', () => {
    it('encodes exact absolute file includes with glob punctuation', () => {
        const firstFile = path.join(path.parse(process.cwd()).root, 'pack[1]', 'source{a},?.c');
        const secondFile = path.join(path.parse(process.cwd()).root, 'pack[1]', 'plain.c');
        const thirdFile = path.join(path.parse(process.cwd()).root, 'pack{', 'literal*.c');

        expect(encodeSearchFileInclude(firstFile)).toBe(
            `${path.parse(process.cwd()).root.replace(/\\/g, '/')}pack[[]1[]]/{s}ource[{]{}a[}][,][?].c`
        );
        expect(encodeSearchFileInclude(secondFile)).toBe(
            `${path.parse(process.cwd()).root.replace(/\\/g, '/')}pack[[]1[]]/{p}lain.c`
        );
        expect(encodeSearchFileInclude(thirdFile)).toBe(
            `${path.parse(process.cwd()).root.replace(/\\/g, '/')}pack[{]{}/{l}iteral[*].c`
        );
    });

    it('registers the command on activation', async () => {
        const commandsProvider = commandsProviderFactory();
        const command = new SearchSolutionSourcesCommand(
            solutionManagerFactory(),
            commandsProvider,
            workspaceFsProviderFactory(),
            messageProviderFactory(),
        );

        await command.activate(extensionContextFactory());

        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(
            SearchSolutionSourcesCommand.commandId,
            expect.any(Function),
            command,
        );
    });

    it('searches only existing regular source files', async () => {
        const sourceFiles = [
            path.join(path.parse(process.cwd()).root, 'workspace', 'main.c'),
            path.join(path.parse(process.cwd()).root, 'packs', 'header[1].h'),
            path.join(path.parse(process.cwd()).root, 'west', 'missing.c'),
        ];
        const solution = { getSourceFiles: jest.fn().mockReturnValue(sourceFiles) } as Pick<CSolution, 'getSourceFiles'>;
        const solutionManager = solutionManagerFactory({
            getCsolution: jest.fn().mockReturnValue(solution as CSolution),
        });
        const commandsProvider = commandsProviderFactory();
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.isFile.mockImplementation(async fileName => fileName !== sourceFiles[2]);
        const command = new SearchSolutionSourcesCommand(
            solutionManager,
            commandsProvider,
            workspaceFsProvider,
            messageProviderFactory(),
        );
        await command.activate(extensionContextFactory());

        await commandsProvider.mockRunRegistered(SearchSolutionSourcesCommand.commandId);

        expect(workspaceFsProvider.isFile).toHaveBeenCalledTimes(3);
        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('workbench.action.findInFiles', {
            filesToInclude: sourceFiles.slice(0, 2).map(encodeSearchFileInclude).join(', '),
            triggerSearch: false,
            showIncludesExcludes: true,
        });
    });

    it('warns when no active solution is available', async () => {
        const solutionManager = solutionManagerFactory({
            getCsolution: jest.fn().mockReturnValue(undefined),
        });
        const commandsProvider = commandsProviderFactory();
        const messageProvider = messageProviderFactory();
        const command = new SearchSolutionSourcesCommand(
            solutionManager,
            commandsProvider,
            workspaceFsProviderFactory(),
            messageProvider,
        );
        await command.activate(extensionContextFactory());

        await commandsProvider.mockRunRegistered(SearchSolutionSourcesCommand.commandId);

        expect(messageProvider.showWarningMessage).toHaveBeenCalledWith('No active CMSIS solution is available to search.');
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
    });

    it('warns when no source paths are enumerated', async () => {
        const solution = { getSourceFiles: jest.fn().mockReturnValue([]) } as Pick<CSolution, 'getSourceFiles'>;
        const solutionManager = solutionManagerFactory({
            getCsolution: jest.fn().mockReturnValue(solution as CSolution),
        });
        const commandsProvider = commandsProviderFactory();
        const messageProvider = messageProviderFactory();
        const command = new SearchSolutionSourcesCommand(
            solutionManager,
            commandsProvider,
            workspaceFsProviderFactory(),
            messageProvider,
        );
        await command.activate(extensionContextFactory());

        await commandsProvider.mockRunRegistered(SearchSolutionSourcesCommand.commandId);

        expect(messageProvider.showWarningMessage).toHaveBeenCalledWith(
            'The active CMSIS solution does not contain any searchable source files.'
        );
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
    });

    it('warns when no enumerated paths are regular files', async () => {
        const solution = { getSourceFiles: jest.fn().mockReturnValue([path.join('pack', 'include')]) } as Pick<CSolution, 'getSourceFiles'>;
        const solutionManager = solutionManagerFactory({
            getCsolution: jest.fn().mockReturnValue(solution as CSolution),
        });
        const commandsProvider = commandsProviderFactory();
        const messageProvider = messageProviderFactory();
        const command = new SearchSolutionSourcesCommand(
            solutionManager,
            commandsProvider,
            workspaceFsProviderFactory(),
            messageProvider,
        );
        await command.activate(extensionContextFactory());

        await commandsProvider.mockRunRegistered(SearchSolutionSourcesCommand.commandId);

        expect(messageProvider.showWarningMessage).toHaveBeenCalledWith(
            'No existing source files were found for the active CMSIS solution.'
        );
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
    });
});
