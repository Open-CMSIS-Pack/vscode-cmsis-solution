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
import type { SolutionManager } from '../../../solutions/solution-manager';
import * as fsUtils from '../../../utils/fs-utils';
import { pathsEqual } from '../../../utils/path-utils';

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
    onMergeProcessExit(exitCode: number): Promise<void>;
}

export class MergeSessionCoordinatorImpl implements MergeSessionCoordinator {
    private activeSession?: MergeSessionFiles;
    private finalizing = false;

    constructor(
        private readonly solutionManager: Pick<SolutionManager, 'refresh'>,
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

    public async onMergeProcessExit(exitCode: number): Promise<void> {
        if (exitCode === 0) {
            await this.tryFinalize();
        }
        this.activeSession = undefined;
    }

    private async handleDidSaveTextDocument(document: vscode.TextDocument): Promise<void> {
        if (!this.activeSession) {
            return;
        }
        if (!pathsEqual(document.uri.fsPath, this.activeSession.merged)) {
            return;
        }
        await this.tryFinalize();
    }

    private async tryFinalize(): Promise<void> {
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
            await this.solutionManager.refresh();
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
