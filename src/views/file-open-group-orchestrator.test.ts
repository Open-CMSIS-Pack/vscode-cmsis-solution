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

import 'jest';
import * as vscode from 'vscode';
import { FileOpenGroupOrchestratorImpl } from './file-open-group-orchestrator';

describe('FileOpenGroupOrchestratorImpl', () => {
    type MockTabGroups = Omit<vscode.TabGroups, 'all'> & {
        all: vscode.TabGroup[];
    };

    const tabGroups = vscode.window.tabGroups as unknown as MockTabGroups;

    beforeEach(() => {
        tabGroups.all = [];
    });

    it('returns default target columns per origin when no group has been persisted', () => {
        const orchestrator = new FileOpenGroupOrchestratorImpl();

        expect(orchestrator.getTargetViewColumn('software-components')).toBe(vscode.ViewColumn.Beside);
        expect(orchestrator.getTargetViewColumn('solution-outline')).toBe(vscode.ViewColumn.Active);
    });

    it('persists only concrete numeric view columns', () => {
        const orchestrator = new FileOpenGroupOrchestratorImpl();

        orchestrator.rememberTargetViewColumn(vscode.ViewColumn.Active);
        orchestrator.rememberTargetViewColumn(vscode.ViewColumn.Beside);
        orchestrator.rememberTargetViewColumn(undefined);

        expect(orchestrator.getTargetViewColumn('solution-outline')).toBe(vscode.ViewColumn.Active);

        const persistedColumn = 3 as vscode.ViewColumn;
        tabGroups.all = [{ viewColumn: persistedColumn } as vscode.TabGroup];
        orchestrator.rememberTargetViewColumn(persistedColumn);

        expect(orchestrator.getTargetViewColumn('solution-outline')).toBe(persistedColumn);
        expect(orchestrator.getTargetViewColumn('software-components')).toBe(persistedColumn);
    });

    it('resets persisted group when the column is no longer present in tab groups', () => {
        const orchestrator = new FileOpenGroupOrchestratorImpl();
        const oldColumn = 3 as vscode.ViewColumn;

        tabGroups.all = [{ viewColumn: oldColumn } as vscode.TabGroup];
        orchestrator.rememberTargetViewColumn(oldColumn);
        expect(orchestrator.getTargetViewColumn('solution-outline')).toBe(oldColumn);

        tabGroups.all = [{ viewColumn: 4 as vscode.ViewColumn } as vscode.TabGroup];

        expect(orchestrator.getTargetViewColumn('solution-outline')).toBe(vscode.ViewColumn.Active);
        expect(orchestrator.getTargetViewColumn('software-components')).toBe(vscode.ViewColumn.Beside);
    });
});
