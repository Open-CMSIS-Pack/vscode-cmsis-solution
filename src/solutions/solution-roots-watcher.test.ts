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
import * as path from 'path';
import { MockFileWatcherProvider, fileWatcherProviderFactory } from '../vscode-api/file-watcher-provider.factories';
import { SolutionRootsWatcher, solutionRootsContextKey } from './solution-roots-watcher';
import { MockWorkspaceFsProvider, workspaceFsProviderFactory } from '../vscode-api/workspace-fs-provider.factories';
import { MockWorkspaceFoldersProvider, workspaceFoldersProviderFactory } from '../vscode-api/workspace-folders-provider.factories';
import { MockCommandsProvider, commandsProviderFactory } from '../vscode-api/commands-provider.factories';
import { URI } from 'vscode-uri';

describe('SolutionRootsWatcher', () => {
    let fileWatcherProvider: MockFileWatcherProvider;
    let workspaceFoldersProvider: MockWorkspaceFoldersProvider;
    let workspaceFsProvider: MockWorkspaceFsProvider;
    let commandsProvider: MockCommandsProvider;
    let solutionRootsWatcher: SolutionRootsWatcher;

    beforeEach(async () => {
        fileWatcherProvider = fileWatcherProviderFactory();
        workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFoldersProvider = workspaceFoldersProviderFactory();
        commandsProvider = commandsProviderFactory();

        solutionRootsWatcher = new SolutionRootsWatcher(
            fileWatcherProvider,
            workspaceFoldersProvider,
            workspaceFsProvider,
            commandsProvider,
        );
    });

    it('sets the solution roots to an empty object if no workspace is loaded', async () => {
        workspaceFoldersProvider.workspaceFolders = [];

        await solutionRootsWatcher.activate({ subscriptions: [] });

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('setContext', solutionRootsContextKey, {});
    });

    it('sets the solution roots to the folders containing csolution files', async () => {
        const workspacePath = '/path/to/workspace';
        const workspaceUri = URI.file(workspacePath);
        const project1Folder = 'project1';
        const project1Uri = URI.file(path.join(workspacePath, project1Folder));
        const notAProjectFolder = 'not-a-project';
        const notAProjectUri = URI.file(path.join(workspacePath, notAProjectFolder));
        workspaceFoldersProvider.workspaceFolders = [
            {
                uri: workspaceUri,
                name: 'workspace',
                index: 0
            }
        ];
        workspaceFsProvider.readDirectory.mockImplementation(async filePath => {
            switch (filePath) {
                case workspaceUri.fsPath:
                    return [
                        [project1Folder, 'directory'],
                        [notAProjectFolder, 'directory'],
                    ];
                case project1Uri.fsPath:
                    return [
                        ['mock.csolution.yml', 'file'],
                        ['some-other-file.cbuild.yml', 'file'],
                    ];
                case notAProjectUri.fsPath:
                    return [
                        ['config.json', 'file'],
                        ['settings', 'directory'],
                    ];
            }
            throw Error(`${filePath} is not managed by the workspaceFsProvider.readDirector mock`);
        });
        const solutionRootsContext = {
            project1: true,
        };
        const expectedArguments = ['setContext', solutionRootsContextKey, solutionRootsContext];

        await solutionRootsWatcher.activate({ subscriptions: [] });

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith(...expectedArguments);
    });
});
