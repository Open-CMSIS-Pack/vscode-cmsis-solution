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

import * as vscode from 'vscode';
import path from 'path';
import { getWorkspaceFolder } from './vscode-utils';

describe('getWorkspaceFolder', () => {
    const firstFolder = { uri: vscode.Uri.file(path.resolve('first')), name: 'First', index: 0 };
    const secondFolder = { uri: vscode.Uri.file(path.resolve('second')), name: 'Second', index: 1 };
    const previousFolders = vscode.workspace.workspaceFolders;

    beforeEach(() => {
        Object.defineProperty(vscode.workspace, 'workspaceFolders', {
            configurable: true, writable: true, value: [firstFolder, secondFolder],
        });
    });

    afterEach(() => {
        Object.defineProperty(vscode.workspace, 'workspaceFolders', { value: previousFolders });
        jest.mocked(vscode.workspace.getWorkspaceFolder).mockReset();
    });

    it('uses the owner of the supplied solution instead of the first folder', () => {
        const solutionPath = path.join(secondFolder.uri.fsPath, 'nested', 'App.csolution.yml');
        jest.mocked(vscode.workspace.getWorkspaceFolder).mockReturnValue(secondFolder);

        expect(getWorkspaceFolder(solutionPath)).toBe(secondFolder.uri.fsPath);
        expect(vscode.workspace.getWorkspaceFolder).toHaveBeenCalledWith(vscode.Uri.file(solutionPath));
    });

    it('does not use the first folder for a file outside the workspace', () => {
        jest.mocked(vscode.workspace.getWorkspaceFolder).mockReturnValue(undefined);

        expect(getWorkspaceFolder(path.resolve('outside', 'App.csolution.yml'))).toBe('');
    });

    it('retains the first-folder default only when no file is supplied', () => {
        expect(getWorkspaceFolder()).toBe(firstFolder.uri.fsPath);
        expect(vscode.workspace.getWorkspaceFolder).not.toHaveBeenCalled();
    });
});
