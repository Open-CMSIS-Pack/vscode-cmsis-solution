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

export type FileOpenOrigin = 'software-components' | 'solution-outline';

export interface FileOpenGroupOrchestrator {
    getTargetViewColumn(origin: FileOpenOrigin): vscode.ViewColumn;
    rememberTargetViewColumn(origin: FileOpenOrigin, viewColumn: vscode.ViewColumn | undefined): void;
}

export class FileOpenGroupOrchestratorImpl implements FileOpenGroupOrchestrator {
    private targetViewColumn?: vscode.ViewColumn;

    private isPersistableViewColumn(viewColumn: vscode.ViewColumn | undefined): viewColumn is vscode.ViewColumn {
        return typeof viewColumn === 'number' && viewColumn > 0;
    }

    private hasOpenGroup(viewColumn: vscode.ViewColumn | undefined): boolean {
        return this.isPersistableViewColumn(viewColumn)
            && vscode.window.tabGroups.all.some(group => group.viewColumn === viewColumn);
    }

    public getTargetViewColumn(origin: FileOpenOrigin): vscode.ViewColumn {
        if (!this.hasOpenGroup(this.targetViewColumn)) {
            this.targetViewColumn = undefined;
        }

        if (this.targetViewColumn) {
            return this.targetViewColumn;
        }

        return origin === 'software-components'
            ? vscode.ViewColumn.Beside
            : vscode.ViewColumn.Active;
    }

    public rememberTargetViewColumn(origin: FileOpenOrigin, viewColumn: vscode.ViewColumn | undefined): void {
        if (!this.isPersistableViewColumn(viewColumn)) {
            return;
        }

        if (!this.targetViewColumn && origin !== 'software-components') {
            return;
        }

        this.targetViewColumn = viewColumn;
    }
}
