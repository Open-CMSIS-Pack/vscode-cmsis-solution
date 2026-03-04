/**
 * Copyright 2024-2026 Arm Limited
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

import * as path from 'path';
import { ExtensionContext } from 'vscode';
import { FileWatcherProvider } from '../vscode-api/file-watcher-provider';
import { WorkspaceFoldersProvider } from '../vscode-api/workspace-folders-provider';
import { WorkspaceFsProvider } from '../vscode-api/workspace-fs-provider';
import { CommandsProvider } from '../vscode-api/commands-provider';
import * as manifest from '../manifest';
import { SOLUTION_SUFFIX } from './constants';

export const csolutionFileWatchPattern = '**/*.csolution.{yaml,yml}';
export const solutionRootsContextKey = `${manifest.PACKAGE_NAME}.solutionRoots`;

export class SolutionRootsWatcher {

    constructor(
        private readonly fileWatcherProvider: FileWatcherProvider,
        private readonly workspaceFoldersProvider: WorkspaceFoldersProvider,
        private readonly workspaceFsProvider: WorkspaceFsProvider,
        private readonly commandsProvider: CommandsProvider,
    ) {}

    public async activate(context: Pick<ExtensionContext, 'subscriptions'>): Promise<void> {
        context.subscriptions.push(
            this.fileWatcherProvider.watchFiles(csolutionFileWatchPattern, {
                onCreate: this.updateSolutionRootsContext,
                onDelete: this.updateSolutionRootsContext,
            }, this)
        );
        await this.updateSolutionRootsContext();
    }

    private async updateSolutionRootsContext(): Promise<void> {
        const solutionRoots: string[] = [];
        const workspaceFolders = this.workspaceFoldersProvider.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            for (const workspaceFolder of workspaceFolders) {
                const workspaceFolderPath = workspaceFolder.uri.fsPath;
                const files = await this.workspaceFsProvider.readDirectory(workspaceFolderPath);
                const folders = files.filter(folder => folder[1] === 'directory');
                for (const folder of folders) {
                    const folderName = folder[0];
                    const folderPath = path.join(workspaceFolderPath, folderName);
                    const folderFiles = await this.workspaceFsProvider.readDirectory(folderPath);
                    const isFolderSolutionRoot = folderFiles.some(f => f[1] === 'file' && (f[0].endsWith(SOLUTION_SUFFIX) || f[0].endsWith('.csolution.yaml')));
                    if (isFolderSolutionRoot) {
                        solutionRoots.push(folderName);
                    }
                }
            }
        }
        const solutionRootsContext = Object.fromEntries(solutionRoots.map(solutionRoot => [solutionRoot, true]));
        this.commandsProvider.executeCommand('setContext', solutionRootsContextKey, solutionRootsContext);
    }
}
