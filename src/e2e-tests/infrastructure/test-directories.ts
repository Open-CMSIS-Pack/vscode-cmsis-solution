/**
 * Copyright 2025-2026 Arm Limited
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

/**
 * Test Workspace and Directory Management
 *
 * This module manages the creation and cleanup of isolated test directories used
 * during E2E testing. Each test gets an isolated workspace to prevent test
 * interference and allow parallel execution.
 *
 * Key responsibilities:
 * - Create temporary test directories (workspace, extensions, user data, pack cache)
 * - Copy source workspaces to isolated test locations
 * - Clean up test directories after test completion
 * - Handle graceful cleanup of .vscode directories (ignore ENOENT errors)
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import { ncp } from 'ncp';
import { log } from '../utils/logger';

export type TestDirectories = {
    root: string;
    extensions: string;
    workspace: string;
    packCache: string;
    userData: string;
}

export const createTestDirectories = async (): Promise<TestDirectories> => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'csolution-e2e-'));
    const extensions = path.join(root, 'extensions-dir');
    const userData = path.join(root, 'user-data');
    const workspace = path.join(root, 'e2e-workspace');
    const packCache = path.join(root, 'packs');
    await fs.mkdir(extensions);
    await fs.mkdir(userData);
    await fs.mkdir(packCache);
    await fs.mkdir(workspace);
    log('debug', `Created test directories in ${root}`);
    return { root, extensions, userData, workspace, packCache };
};

export type WorkspaceOptions = {
    sourceDir: string | undefined;
    testDirectories: TestDirectories;
    settings: unknown
}

export const createWorkspace = async ({ sourceDir, testDirectories }: Omit<WorkspaceOptions, 'settings'>): Promise<void> => {
    if (sourceDir) {
        await promisify(ncp)(sourceDir, testDirectories.workspace);
    }

    log('debug', `Test workspace set up in ${testDirectories.workspace}`);
};

export const tryCleanTestDirectories = async (testDirectories: TestDirectories): Promise<void> => {
    const doDelete = () => fs.rm(testDirectories.root, { recursive: true });

    try {
        await doDelete();
    } catch (error1) {
        log('warn', 'Failed to delete test directories. It is likely that a process was still writing to them. Retrying…', error1);
        try {
            await doDelete();
        } catch (error2) {
            log('warn', `Failed to delete test directories at ${testDirectories.root}. Will not try a second time.`, error2);
        }
    }
};
