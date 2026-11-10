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

import * as path from 'node:path';
import * as os from 'node:os';
import { promises as fs } from 'node:fs';
import { expect, test } from '@playwright/test';
import { JsonFile } from '@open-cmsis-pack/cmsis-common/json-file';
import { YamlFile } from '@open-cmsis-pack/cmsis-common/yaml-file';
import { ETextFileResult, TextFile } from '@open-cmsis-pack/cmsis-common/text-file';
import { VsCodeDriver } from '../../../infrastructure/vscode-driver';
import { DEFAULT_TIMEOUT_MS } from '../../../constants';

type RootFixture = { folder: string; solution: string; target: string; marker: string };
export type MultiRootFixture = { roots: [RootFixture, RootFixture] };

const save = async (file: TextFile, content: unknown): Promise<void> => {
    file.content = content;
    expect(await file.save()).toBe(ETextFileResult.Success);
};

export const runWf001SwitchSolutions = async (driver: VsCodeDriver, fixture: MultiRootFixture): Promise<void> => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'cmsis-multi-root-'));
    if (path.dirname(directory) !== path.resolve(os.tmpdir()) || !path.basename(directory).startsWith('cmsis-multi-root-')) {
        throw new Error(`Unexpected temporary workspace path: ${directory}`);
    }
    const [first, second] = fixture.roots;
    const rootPath = (root: RootFixture) => path.join(directory, root.folder);
    const settingsFile = (root: RootFixture) => new JsonFile(path.join(rootPath(root), '.vscode', 'cmsis.json'));
    const environmentFile = (root: RootFixture) => new YamlFile(path.join(rootPath(root), '.cmsis', 'tools-environment.yml'));
    const expectedVariables = (root: RootFixture) => ({
        FOLDER_MARKER: root.marker,
        CMSIS_PACK_ROOT: path.join(rootPath(root), 'packs').replace(/\\/g, '/'),
    });
    const expectEnvironment = async (root: RootFixture) => {
        await expect.poll(async () => {
            const file = environmentFile(root);
            if (!file.exists()) { return undefined; }
            await file.load();
            return file.content;
        }, { timeout: DEFAULT_TIMEOUT_MS }).toMatchObject({
            'cmsis-tools-environment': {
                solution: `../nested/${root.solution}.csolution.yml`,
                environment: { variables: expectedVariables(root) },
            },
        });
        const settings = settingsFile(root);
        await settings.load();
        expect(settings.content).toMatchObject({
            activeSolution: `../nested/${root.solution}.csolution.yml`,
            activeTarget: root.target,
            folderSentinel: root.marker,
        });
        expect(await fs.stat(path.join(rootPath(root), 'nested', '.cmsis')).catch(() => undefined)).toBeUndefined();
        expect(await fs.stat(path.join(rootPath(root), 'nested', '.vscode')).catch(() => undefined)).toBeUndefined();
    };
    const selectSolution = async (root: RootFixture) => {
        environmentFile(root).unlink();
        await driver.page.getCommands().runCommandFromPalette('CMSIS: Open Solution in Workspace');
        const picker = driver.page.getPage().locator('.quick-input-widget');
        await expect(picker.getByPlaceholder('Select a solution')).toBeVisible();
        await picker.getByRole('option').filter({ hasText: root.solution }).click();
        await expectEnvironment(root);
    };
    try {
        await test.step('Prepare independent folder configurations and nested solutions', async () => {
            for (const root of fixture.roots) {
                await save(new JsonFile(path.join(rootPath(root), '.vscode', 'settings.json')), {
                    'cmsis-csolution.environmentVariables': expectedVariables(root),
                });
                await save(new YamlFile(path.join(rootPath(root), 'nested', `${root.solution}.csolution.yml`)), {
                    solution: { 'target-types': [{ type: root.target }], 'build-types': [{ type: 'Debug' }] },
                });
                await save(settingsFile(root), {
                    activeSolution: root === second ? `../nested/${root.solution}.csolution.yml` : '../missing.csolution.yml',
                    folderSentinel: root.marker,
                });
                await fs.mkdir(path.join(rootPath(root), 'packs'));
            }
            const workspaceFile = new JsonFile(path.join(directory, 'MultiRoot.code-workspace'));
            await save(workspaceFile, { folders: fixture.roots.map(root => ({ path: root.folder })) });
            await driver.openWorkspaceFolder(workspaceFile.fileName);
        });
        await test.step('Discover the second-folder default without modifying the first folder', async () => {
            await expectEnvironment(second);
            const firstSettings = settingsFile(first);
            await firstSettings.load();
            expect(firstSettings.content).toEqual({ activeSolution: '../missing.csolution.yml', folderSentinel: first.marker });
            expect(environmentFile(first).exists()).toBe(false);
        });
        await test.step('Switch first, second, first while keeping folder state independent', async () => {
            await selectSolution(first);
            const firstEnvironment = environmentFile(first);
            await firstEnvironment.load();
            const firstContent = firstEnvironment.content;
            await selectSolution(second);
            await firstEnvironment.load();
            expect(firstEnvironment.content).toEqual(firstContent);
            await selectSolution(first);
            await expectEnvironment(second);
        });
        await test.step('Restore the active solution and environment after reloading', async () => {
            environmentFile(first).unlink();
            await driver.page.reloadWindow('CMSIS');
            await expectEnvironment(first);
        });
    } finally {
        await driver.restoreTestWorkspace();
        // Only remove the temporary workspace created above, after closing it in VS Code.
        await fs.rm(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    }
};
