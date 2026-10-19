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

    it('searches only existing regular source and solution YML files', async () => {
        const sourceFiles = [
            path.join(path.parse(process.cwd()).root, 'workspace', 'main.c'),
            path.join(path.parse(process.cwd()).root, 'packs', 'header[1].h'),
            path.join(path.parse(process.cwd()).root, 'west', 'missing.c'),
        ];
        const solutionYmlFiles = [
            path.join(path.parse(process.cwd()).root, 'workspace', 'solution.csolution.yml'),
            path.join(path.parse(process.cwd()).root, 'workspace', 'missing.cproject.yml'),
        ];
        const solution = {
            getSourceFiles: jest.fn().mockReturnValue(sourceFiles),
            getSolutionYmlFiles: jest.fn().mockReturnValue(solutionYmlFiles),
        } as Pick<CSolution, 'getSourceFiles' | 'getSolutionYmlFiles'>;
        const solutionManager = solutionManagerFactory({
            getCsolution: jest.fn().mockReturnValue(solution as CSolution),
        });
        const commandsProvider = commandsProviderFactory();
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.isFile.mockImplementation(async fileName => fileName !== sourceFiles[2] && fileName !== solutionYmlFiles[1]);
        const command = new SearchSolutionSourcesCommand(
            solutionManager,
            commandsProvider,
            workspaceFsProvider,
            messageProviderFactory(),
        );
        await command.activate(extensionContextFactory());

        await commandsProvider.mockRunRegistered(SearchSolutionSourcesCommand.commandId);

        expect(workspaceFsProvider.isFile).toHaveBeenCalledTimes(5);
        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('workbench.action.findInFiles', {
            filesToInclude: [...sourceFiles.slice(0, 2), solutionYmlFiles[0]].map(encodeSearchFileInclude).join(', '),
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

    it('warns when no searchable paths are enumerated', async () => {
        const solution = {
            getSourceFiles: jest.fn().mockReturnValue([]),
            getSolutionYmlFiles: jest.fn().mockReturnValue([]),
        } as Pick<CSolution, 'getSourceFiles' | 'getSolutionYmlFiles'>;
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
            'The active CMSIS solution does not contain any searchable source or solution YML files.'
        );
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
    });

    it('searches solution YML files when no source files are enumerated', async () => {
        const solutionYmlFile = path.join(path.parse(process.cwd()).root, 'workspace', 'solution.csolution.yml');
        const solution = {
            getSourceFiles: jest.fn().mockReturnValue([]),
            getSolutionYmlFiles: jest.fn().mockReturnValue([solutionYmlFile]),
        } as Pick<CSolution, 'getSourceFiles' | 'getSolutionYmlFiles'>;
        const solutionManager = solutionManagerFactory({
            getCsolution: jest.fn().mockReturnValue(solution as CSolution),
        });
        const commandsProvider = commandsProviderFactory();
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.isFile.mockResolvedValue(true);
        const command = new SearchSolutionSourcesCommand(
            solutionManager,
            commandsProvider,
            workspaceFsProvider,
            messageProviderFactory(),
        );
        await command.activate(extensionContextFactory());

        await commandsProvider.mockRunRegistered(SearchSolutionSourcesCommand.commandId);

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('workbench.action.findInFiles', {
            filesToInclude: encodeSearchFileInclude(solutionYmlFile),
            triggerSearch: false,
            showIncludesExcludes: true,
        });
    });

    it('warns when no enumerated paths are regular files', async () => {
        const solution = {
            getSourceFiles: jest.fn().mockReturnValue([path.join('pack', 'include')]),
            getSolutionYmlFiles: jest.fn().mockReturnValue([]),
        } as Pick<CSolution, 'getSourceFiles' | 'getSolutionYmlFiles'>;
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
            'No existing source or solution YML files were found for the active CMSIS solution.'
        );
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
    });
});
