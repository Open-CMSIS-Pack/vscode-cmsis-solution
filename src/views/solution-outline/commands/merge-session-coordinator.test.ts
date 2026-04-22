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

jest.mock('vscode');

import * as path from 'path';
import * as vscode from 'vscode';
import { TestDataHandler } from '../../../__test__/test-data';
import { MergeSessionCoordinatorImpl } from './merge-session-coordinator';
import * as fsUtils from '../../../utils/fs-utils';

describe('MergeSessionCoordinator', () => {
    const testDataHandler = new TestDataHandler();
    let tmpDir: string;
    let solutionManager: { refresh: jest.Mock<Promise<void>, []> };
    let coordinator: MergeSessionCoordinatorImpl;
    let saveEmitter: vscode.EventEmitter<vscode.TextDocument>;

    beforeEach(async () => {
        jest.restoreAllMocks();
        jest.clearAllMocks();

        testDataHandler.rmTmpDir();
        tmpDir = testDataHandler.tmpDir;

        saveEmitter = new vscode.EventEmitter<vscode.TextDocument>();
        (vscode.workspace as unknown as { onDidSaveTextDocument: vscode.Event<vscode.TextDocument> }).onDidSaveTextDocument = saveEmitter.event;

        solutionManager = {
            refresh: jest.fn().mockResolvedValue(),
        };

        coordinator = new MergeSessionCoordinatorImpl(solutionManager);

        await coordinator.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);
    });

    afterAll(() => {
        testDataHandler.dispose();
    });

    it('refreshes on save without destructive file operations', async () => {
        const local = path.join(tmpDir, 'component.c');
        const update = path.join(tmpDir, 'component.c.update@1.0.0');
        const base = path.join(tmpDir, 'component.c.base@1.0.0');
        const merged = `${local}.merged`;

        fsUtils.writeTextFile(local, '// local\n');
        fsUtils.writeTextFile(update, '// update\n');
        fsUtils.writeTextFile(base, '// base\n');
        fsUtils.writeTextFile(merged, '// merged\n');

        coordinator.startSession({ local, update, base, merged, mergedMTimeBefore: 0 });

        await (coordinator as unknown as {
            handleDidSaveTextDocument: (document: vscode.TextDocument) => Promise<void>
        }).handleDidSaveTextDocument({ uri: { fsPath: merged } } as vscode.TextDocument);

        expect(fsUtils.fileExists(local)).toBeTruthy();
        expect(fsUtils.readTextFile(local)).toContain('// local');
        expect(fsUtils.fileExists(merged)).toBeTruthy();
        expect(fsUtils.fileExists(base)).toBeTruthy();
        expect(fsUtils.fileExists(update)).toBeTruthy();
        expect(fsUtils.fileExists(`${local}.bak`)).toBeFalsy();

        expect(solutionManager.refresh).toHaveBeenCalledTimes(1);
    });

    it('ignores save events for unrelated files', async () => {
        const local = path.join(tmpDir, 'component.c');
        const update = path.join(tmpDir, 'component.c.update@1.0.0');
        const base = path.join(tmpDir, 'component.c.base@1.0.0');
        const merged = `${local}.merged`;

        fsUtils.writeTextFile(local, '// local\n');
        fsUtils.writeTextFile(update, '// update\n');
        fsUtils.writeTextFile(base, '// base\n');
        fsUtils.writeTextFile(merged, '// merged\n');

        coordinator.startSession({ local, update, base, merged, mergedMTimeBefore: 0 });

        await (coordinator as unknown as {
            handleDidSaveTextDocument: (document: vscode.TextDocument) => Promise<void>
        }).handleDidSaveTextDocument({ uri: { fsPath: path.join(tmpDir, 'other.c') } } as vscode.TextDocument);

        expect(solutionManager.refresh).not.toHaveBeenCalled();
        expect(fsUtils.fileExists(merged)).toBeTruthy();
    });

    it('does not refresh on save after session is canceled', async () => {
        const local = path.join(tmpDir, 'component.c');
        const update = path.join(tmpDir, 'component.c.update@1.0.0');
        const base = path.join(tmpDir, 'component.c.base@1.0.0');
        const merged = `${local}.merged`;

        fsUtils.writeTextFile(local, '// local\n');
        fsUtils.writeTextFile(update, '// update\n');
        fsUtils.writeTextFile(base, '// base\n');
        fsUtils.writeTextFile(merged, '// merged\n');

        coordinator.startSession({ local, update, base, merged, mergedMTimeBefore: 0 });
        coordinator.cancelSession();

        await (coordinator as unknown as {
            handleDidSaveTextDocument: (document: vscode.TextDocument) => Promise<void>
        }).handleDidSaveTextDocument({ uri: { fsPath: merged } } as vscode.TextDocument);

        expect(solutionManager.refresh).not.toHaveBeenCalled();
        expect(fsUtils.fileExists(merged)).toBeTruthy();
    });

    it('finalizes on merge process exit when save hook did not run', async () => {
        const local = path.join(tmpDir, 'component.c');
        const update = path.join(tmpDir, 'component.c.update@1.0.0');
        const base = path.join(tmpDir, 'component.c.base@1.0.0');
        const merged = `${local}.merged`;

        fsUtils.writeTextFile(local, '// local\n');
        fsUtils.writeTextFile(update, '// update\n');
        fsUtils.writeTextFile(base, '// base\n');
        fsUtils.writeTextFile(merged, '// merged\n');

        coordinator.startSession({ local, update, base, merged, mergedMTimeBefore: 0 });
        await coordinator.onMergeProcessExit(0);

        expect(fsUtils.fileExists(local)).toBeTruthy();
        expect(fsUtils.readTextFile(local)).toContain('// merged');
        expect(solutionManager.refresh).toHaveBeenCalledTimes(1);
    });
});
