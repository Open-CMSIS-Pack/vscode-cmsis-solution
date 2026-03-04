/**
 * Copyright 2024-2026 Arm Limited
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

import * as fs from 'node:fs';
import * as fsUtils from '../utils/fs-utils';
import * as os from 'os';
import * as vscodeUtils from '../utils/vscode-utils';
import { Uri, workspace, WorkspaceFolder } from 'vscode';
import { tmpdir } from 'node:os';
import path from 'node:path';


export const CMSIS_VSCODE_TEST_DIR = 'cmsis_vs_test_dir-';
export const SOLUTIONS_DIR = 'solutions';

export const getTestDataDir = () => {
    return path.resolve(__dirname, '../../test-data');
};

export const getTemplatesDir = () => {
    return path.resolve(__dirname, '../../templates');
};


export const createTmpDir = () => {
    return fs.mkdtempSync(path.join(tmpdir(), CMSIS_VSCODE_TEST_DIR));
};

export type MockWorkspaceWithFolders = { workspaceFolders?: typeof workspace.workspaceFolders };

export function setupMockWorkspace(name = 'mock-workspace') {
    const mockWorkspacePath = path.join(os.tmpdir(), name);
    if (!fs.existsSync(mockWorkspacePath)) {
        fs.mkdirSync(mockWorkspacePath, { recursive: true });
    }
    (workspace as { workspaceFolders: WorkspaceFolder[] | undefined }).workspaceFolders = [
        { uri: Uri.file(mockWorkspacePath), name, index: 0 }
    ];
    return mockWorkspacePath;
}

/**
 * type to be used in JSON.stringify as replacer
 */
type JsonReplacer = (key: string, value: unknown) => unknown;
export const TmpDirReplacer = (tmpDir: string): JsonReplacer =>
    (_key, value) => (typeof value === 'string' && value.includes(tmpDir)) ?
        value.replaceAll(tmpDir, 'TEST_PATH').replaceAll('\\', '/') :
        value;

export class TestDataHandler {
    protected _tmpDataDir?: string;
    protected _tmpDir?: string;
    public showErrorMessageSpy;

    public get errorMessageSpy() {
        return this.showErrorMessageSpy;
    }

    constructor() {
        this.showErrorMessageSpy = jest.spyOn(vscodeUtils, 'showErrorMessage').mockImplementation(() => { });
    }

    public dispose() {
        if (this.showErrorMessageSpy) {
            this.showErrorMessageSpy.mockRestore();
        }
        this.rmTmpDir();
    }

    public get tmpDir() {
        if (!this._tmpDir) {
            this._tmpDataDir = this._tmpDir = createTmpDir();
        }
        return this._tmpDir;
    }

    public get tmpDataDir() {
        return this._tmpDataDir;
    }

    public tmpFileName(suffix: string, keepExisting?: boolean) {
        const filename = path.join(this.tmpDir, suffix);
        if (!keepExisting) {
            this.rmFile(filename);
        }
        return filename;
    }

    public copyTestDataToTmp(subfolder?: string) {
        this.rmTmpDir();
        let src = getTestDataDir();
        const tmp = this.tmpDir;
        let dst = tmp;
        if (subfolder) {
            src = path.join(src, subfolder);
            dst = path.join(dst, subfolder);
        }
        fsUtils.copyFolderRecursive(src, dst);
        this._tmpDataDir = dst;
        return dst;
    }

    public rmTmpDir() {
        if (this.tmpDir && fs.existsSync(this.tmpDir)) {
            fs.rmSync(this.tmpDir, { recursive: true, force: true });
            this._tmpDataDir = this._tmpDir = undefined;
        }
    }

    public rmFile(filePath?: string) {
        if (filePath && fs.existsSync(filePath)) {
            fs.rmSync(filePath);
        }
    }

    public rmDir(dirPath?: string) {
        if (dirPath && fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true });
        }
    }

};
