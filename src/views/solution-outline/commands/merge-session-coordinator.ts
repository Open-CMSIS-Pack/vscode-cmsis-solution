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

import * as path from 'path';
import * as vscode from 'vscode';
import { REFRESH_COMMAND_ID } from '../../../manifest';
import * as fsUtils from '../../../utils/fs-utils';
import { pathsEqual } from '../../../utils/path-utils';
import type { CommandsProvider } from '../../../vscode-api/commands-provider';

export interface MergeSessionFiles {
    local: string;
    update: string;
    base: string;
    merged: string;
    mergedMTimeBefore: number;
}

export interface MergeSessionCoordinator {
    activate(context: Pick<vscode.ExtensionContext, 'subscriptions'>): Promise<void>;
    startSession(files: MergeSessionFiles): void;
    cancelSession(): void;
    onMergeProcessExit(exitCode: number): Promise<void>;
}

export class MergeSessionCoordinatorImpl implements MergeSessionCoordinator {
    private activeSession?: MergeSessionFiles;
    private finalizing = false;

    constructor(
        private readonly commandsProvider: Pick<CommandsProvider, 'executeCommand'>,
    ) {
    }

    public async activate(context: Pick<vscode.ExtensionContext, 'subscriptions'>): Promise<void> {
        context.subscriptions.push(
            vscode.workspace.onDidSaveTextDocument(this.handleDidSaveTextDocument, this),
        );
    }

    public startSession(files: MergeSessionFiles): void {
        this.activeSession = files;
    }

    public cancelSession(): void {
        this.activeSession = undefined;
    }

    public async onMergeProcessExit(exitCode: number): Promise<void> {
        try {
            if (exitCode === 0) {
                await this.tryFinalizeOnExit();
            }
        } finally {
            this.activeSession = undefined;
        }
    }

    private async handleDidSaveTextDocument(document: vscode.TextDocument): Promise<void> {
        if (!this.activeSession) {
            return;
        }
        if (!pathsEqual(document.uri.fsPath, this.activeSession.merged)) {
            return;
        }
        // Keep save handling non-destructive while the merge editor is still open.
        // The actual file rename/delete operations are performed on merge process exit.
        void this.commandsProvider.executeCommand(REFRESH_COMMAND_ID);
    }

    private async tryFinalizeOnExit(): Promise<void> {
        if (!this.activeSession || this.finalizing) {
            return;
        }

        const session = this.activeSession;
        const mergedMTimeAfter = fsUtils.getFileModificationTime(session.merged);
        if (mergedMTimeAfter <= session.mergedMTimeBefore) {
            return;
        }

        this.finalizing = true;
        try {
            this.performPostMergeOperations(session);
            this.activeSession = undefined;
            // Await is required here so merge finalization is not reported complete
            // before the refresh command has finished processing.
            await this.commandsProvider.executeCommand(REFRESH_COMMAND_ID);
        } finally {
            this.finalizing = false;
        }
    }

    private performPostMergeOperations(session: MergeSessionFiles): void {
        const backupPath = `${session.local}.bak`;
        fsUtils.copyFile(session.local, backupPath);
        fsUtils.deleteFileIfExists(session.local);
        fsUtils.deleteFileIfExists(session.base);

        const newBaseFileName = path.basename(session.update).replaceAll('update', 'base');
        const newBase = path.join(path.dirname(session.update), newBaseFileName);
        fsUtils.renameFile(session.update, newBase);
        fsUtils.renameFile(session.merged, session.local);
    }
}
