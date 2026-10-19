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
import { JsonFile } from '@open-cmsis-pack/cmsis-common';

const repository = fileURLToPath(new URL('../', import.meta.url));
const fixtureDirectory = path.join(repository, '.vscode-test', 'api-v3-smoke');
await fs.mkdir(fixtureDirectory, { recursive: true });
const runDirectory = await fs.mkdtemp(path.join(fixtureDirectory, 'run-'));
const folders = ['root-one', 'root-two'].map(name => ({ path: path.join(runDirectory, name) }));
await Promise.all(folders.map(folder => fs.mkdir(folder.path)));

const workspace = new JsonFile(path.join(fixtureDirectory, 'smoke.code-workspace'));
workspace.content = { folders, settings: {} };
await fs.writeFile(workspace.fileName, workspace.stringify(), 'utf8');
