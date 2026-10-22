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

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ETextFileResult, JsonFile } from '@open-cmsis-pack/cmsis-common';

const repository = fileURLToPath(new URL('../', import.meta.url));
const fixtureDirectory = path.join(repository, '.vscode-test', 'api-v3-smoke');
await fs.mkdir(fixtureDirectory, { recursive: true });
const runDirectory = await fs.mkdtemp(path.join(fixtureDirectory, 'run-'));
const folders = ['root-one', 'root-two'].map(name => ({ path: path.join(runDirectory, name) }));
await Promise.all(folders.map(folder => fs.mkdir(folder.path)));

const workspace = new JsonFile(path.join(fixtureDirectory, 'tools.code-workspace'));
workspace.content = { folders, settings: {} };
if (await workspace.save() === ETextFileResult.Error) {
    throw new Error(`Cannot prepare ${workspace.fileName}`);
}

for (const mode of ['installed', 'index', 'install']) {
    const catalogWorkspace = new JsonFile(path.join(fixtureDirectory, `${mode}.code-workspace`));
    catalogWorkspace.content = { folders: [], settings: {} };
    if (await catalogWorkspace.save() === ETextFileResult.Error) {
        throw new Error(`Cannot prepare ${catalogWorkspace.fileName}`);
    }
}

const packFixture = path.join(repository, 'test-data', 'api-v3-packs');
const fixtureSettings = new JsonFile(path.join(packFixture, '.vscode', 'settings.json'));
if (await fixtureSettings.load() === ETextFileResult.Error) {
    throw new Error(`Cannot load ${fixtureSettings.fileName}`);
}
for (const [mode, solution] of [
    ['loaded', 'Components.csolution.yml'],
    ['missing', 'Missing.csolution.yml'],
] as const) {
    const folder = path.join(runDirectory, mode);
    await fs.mkdir(folder);
    await Promise.all([
        fs.copyFile(path.join(packFixture, solution), path.join(folder, solution)),
        fs.copyFile(path.join(packFixture, 'Components.cproject.yml'), path.join(folder, 'Components.cproject.yml')),
        fs.cp(path.join(packFixture, '.vscode'), path.join(folder, '.vscode'), { recursive: true }),
    ]);
    const packWorkspace = new JsonFile(path.join(fixtureDirectory, `${mode}.code-workspace`));
    packWorkspace.content = { folders: [{ path: folder }], settings: fixtureSettings.content };
    if (await packWorkspace.save() === ETextFileResult.Error) {
        throw new Error(`Cannot prepare ${packWorkspace.fileName}`);
    }
}
