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

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as YAML from 'yaml';
import { Uri } from 'vscode';
import { URI } from 'vscode-uri';
import { DraftProjectFormat, DraftProjectSource, DraftProjectType } from '../data-manager/draft-project-data';
import { workspaceFsProviderFactory } from '../vscode-api/workspace-fs-provider.factories';
import { getCreateSolutionFromDataManager } from './create-solution-from-data-manager';
import { MdkToCsolutionConverter } from './mdk-conversion/convert-mdk-command';

describe('createSolutionFromDataManager', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'data-manager-solution-'));
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('adds requested pack metadata and a target type without synthesizing a target set', async () => {
        const solutionDir = path.join(tempDir, 'MySolution');
        const solutionPath = path.join(solutionDir, 'MySolution.csolution.yml');
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.createDirectory.mockImplementation(directory => fs.promises.mkdir(directory, { recursive: true }).then(() => undefined));
        workspaceFsProvider.exists.mockResolvedValue(false);
        const findFiles = jest.fn()
            .mockResolvedValueOnce([Uri.file(solutionPath)])
            .mockResolvedValueOnce([]);
        const createSolution = getCreateSolutionFromDataManager(
            workspaceFsProvider,
            {} as MdkToCsolutionConverter,
            findFiles,
        );

        await createSolution(URI.file(solutionDir), {
            solutionName: 'MySolution',
            solutionLocation: tempDir,
            solutionFolder: 'MySolution',
            gitInit: false,
            compiler: 'GCC',
            projects: [],
            targetTypes: [{ type: 'Board', board: 'Vendor::Board:1.0.0' }],
            packs: [{
                pack: 'Vendor::BoardPack@1.2.3',
                forContext: ['+Board'],
                notForContext: ['.Release+Board', '.Debug+Board'],
            }],
            draftProject: {
                id: { name: 'Draft', key: 'draft' },
                name: 'Draft',
                description: 'Draft solution',
                format: DraftProjectFormat.Csolution,
                draftType: DraftProjectType.Template,
                draftSource: DraftProjectSource.Local,
                pack: undefined,
                copyTo: async destination => {
                    await fs.promises.mkdir(destination, { recursive: true });
                    await fs.promises.writeFile(solutionPath, [
                        'solution:',
                        '  target-types:',
                        '    - type: ${Name}',
                        '  packs:',
                        '',
                    ].join('\n'), 'utf8');
                },
            },
        });

        const solution = YAML.parse(fs.readFileSync(solutionPath, 'utf8')).solution;

        expect(solution.packs).toEqual([{
            pack: 'Vendor::BoardPack@1.2.3',
            'for-context': '+Board',
            'not-for-context': ['.Release+Board', '.Debug+Board'],
        }]);
        expect(solution['target-types']).toEqual([{
            type: 'Board',
            board: 'Vendor::Board:1.0.0',
        }]);
    });
});
