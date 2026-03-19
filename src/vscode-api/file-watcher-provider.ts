/**
 * Copyright 2023-2026 Arm Limited
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
import type { Disposable, GlobPattern, WorkspaceFolder } from 'vscode';
import { RelativePattern } from 'vscode';

export type { WorkspaceFolder };

export type FileChangeHandlers = {
    onChange?: (fsPath: string) => void;
    onCreate?: (fsPath: string) => void;
    onDelete?: (fsPath: string) => void;
}

export type WatchTarget
    = string
    | { workspaceFolder: WorkspaceFolder, glob: string }

export type FileWatcherProvider = {
    watchFiles: (watchTarget: WatchTarget, handlers: FileChangeHandlers, thisValue?: unknown) => Disposable;
}

export const fileWatcherProvider: FileWatcherProvider = {
    watchFiles: (watchTarget, handlers, thisValue) => {
        const globPattern: GlobPattern = typeof watchTarget === 'string'
            ? watchTarget
            : new RelativePattern(watchTarget.workspaceFolder, watchTarget.glob);

        const watcher = vscode.workspace.createFileSystemWatcher(globPattern, !handlers.onCreate, !handlers.onChange, !handlers.onDelete);

        watcher.onDidChange(uri => handlers.onChange && handlers.onChange.call(thisValue, uri.fsPath));
        watcher.onDidCreate(uri => handlers.onCreate && handlers.onCreate.call(thisValue, uri.fsPath));
        watcher.onDidDelete(uri => handlers.onDelete && handlers.onDelete.call(thisValue, uri.fsPath));

        return watcher;
    }
};
