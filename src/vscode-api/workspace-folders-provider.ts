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

import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { Event, WorkspaceFolder } from 'vscode';

export type { WorkspaceFolder };

export type WorkspaceFoldersProvider = {
    onDidChangeWorkspaceFolders: Event<unknown>;
    asRelativePath: (fsPath: string) => string;
    getWorkspaceFolder: (fsPath: string) => WorkspaceFolder | undefined;
    readonly workspaceFolders: readonly WorkspaceFolder[] | undefined
}

export const workspaceFoldersProvider: WorkspaceFoldersProvider = {
    onDidChangeWorkspaceFolders: vscode.workspace.onDidChangeWorkspaceFolders,
    asRelativePath: vscode.workspace.asRelativePath,
    getWorkspaceFolder: (fsPath: string) => vscode.workspace.getWorkspaceFolder(Uri.file(fsPath)),

    get workspaceFolders(): readonly WorkspaceFolder[] | undefined {
        return vscode.workspace.workspaceFolders;
    },
};
