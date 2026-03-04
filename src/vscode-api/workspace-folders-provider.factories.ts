/**
 * Copyright 2023-2026 Arm Limited
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

import 'jest';
import { EventEmitter } from 'vscode';
import { WorkspaceFolder, WorkspaceFoldersProvider } from './workspace-folders-provider';
import path from 'path';

export type MockWorkspaceFoldersProvider = {
    onDidChangeWorkspaceFolders: WorkspaceFoldersProvider['onDidChangeWorkspaceFolders'];
    asRelativePath: jest.Mock;
    getWorkspaceFolder: jest.Mock;
    workspaceFolders: WorkspaceFolder[] | undefined;
    updateWorkspaceFolders: (workspaceFolders: WorkspaceFolder[] | undefined) => void;
};

export const workspaceFoldersProviderFactory = (workspaceFolders?: WorkspaceFolder[]): MockWorkspaceFoldersProvider => {
    const workspaceFoldersChangeEmitter = new EventEmitter<void>();

    const provider = {
        onDidChangeWorkspaceFolders: workspaceFoldersChangeEmitter.event,
        updateWorkspaceFolders: (newWorkspaceFolders: WorkspaceFolder[] | undefined) => {
            provider.workspaceFolders = newWorkspaceFolders;
            workspaceFoldersChangeEmitter.fire();
        },
        workspaceFolders: workspaceFolders,
        getWorkspaceFolder: jest.fn((fsPath: string): WorkspaceFolder | undefined => provider.workspaceFolders?.find(folder => fsPath.startsWith(folder.uri.fsPath))),
        asRelativePath: jest.fn((input: string): string => {
            const workspace = provider.getWorkspaceFolder(input)?.uri.fsPath;
            if (workspace) {
                return path.relative(workspace, input);
            }
            return input;
        }),
    };

    return provider;
};
