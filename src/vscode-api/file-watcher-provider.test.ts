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
import { fileWatcherProvider } from './file-watcher-provider';

describe('fileWatcherProvider', () => {
    const watcher = {
        onDidChange: jest.fn(), onDidCreate: jest.fn(), onDidDelete: jest.fn(), dispose: jest.fn(),
    };
    const createWatcher = jest.fn(() => watcher);

    beforeEach(() => {
        Object.assign(vscode.workspace, { createFileSystemWatcher: createWatcher });
    });

    it('passes external RelativePatterns through unchanged and forwards events', () => {
        const pattern = new vscode.RelativePattern(vscode.Uri.file('/external/pack'), 'config.h');
        const onChange = jest.fn();
        const onCreate = jest.fn();
        const onDelete = jest.fn();
        expect(fileWatcherProvider.watchFiles(pattern, { onChange, onCreate, onDelete })).toBe(watcher);
        expect(createWatcher).toHaveBeenCalledWith(pattern, false, false, false);
        const uri = vscode.Uri.file('/external/pack/config.h');
        watcher.onDidChange.mock.calls[0][0](uri);
        watcher.onDidCreate.mock.calls[0][0](uri);
        watcher.onDidDelete.mock.calls[0][0](uri);
        for (const handler of [onChange, onCreate, onDelete]) expect(handler).toHaveBeenCalledWith(uri.fsPath);
    });

    it('preserves string globs and disabled events', () => {
        fileWatcherProvider.watchFiles('**/*.csolution.yml', { onChange: jest.fn() });
        expect(createWatcher).toHaveBeenCalledWith('**/*.csolution.yml', true, false, true);
    });

    it('preserves existing workspace-folder targets', () => {
        const workspaceFolder = { uri: vscode.Uri.file('/workspace'), name: 'workspace', index: 0 };
        fileWatcherProvider.watchFiles({ workspaceFolder, glob: '**/*.dbgconf' }, {});
        expect(vscode.RelativePattern).toHaveBeenLastCalledWith(workspaceFolder, '**/*.dbgconf');
        expect(createWatcher).toHaveBeenCalledWith(expect.objectContaining({ base: workspaceFolder, pattern: '**/*.dbgconf' }), true, true, true);
    });
});
