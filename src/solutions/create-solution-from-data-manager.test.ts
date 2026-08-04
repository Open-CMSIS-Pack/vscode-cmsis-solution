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
import { pathsEqual } from '../utils/path-utils';
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

    it('preserves example csolution files without applying requested metadata', async () => {
        const solutionDir = path.join(tempDir, 'Example');
        const solutionPath = path.join(solutionDir, 'Example.csolution.yml');
        const originalContent = 'solution:\n  description: Example content\n';
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
            solutionName: 'Example',
            solutionLocation: tempDir,
            solutionFolder: 'Example',
            gitInit: false,
            compiler: 'GCC',
            projects: [],
            targetTypes: [{ type: 'Board', board: 'Vendor::Board:1.0.0' }],
            packs: [{ pack: 'Vendor::Pack@1.0.0', forContext: [], notForContext: [] }],
            draftProject: {
                id: { name: 'Example', key: 'example' },
                name: 'Example',
                description: 'Example solution',
                format: DraftProjectFormat.Csolution,
                draftType: DraftProjectType.Example,
                draftSource: DraftProjectSource.Local,
                pack: undefined,
                copyTo: async destination => {
                    await fs.promises.mkdir(destination, { recursive: true });
                    await fs.promises.writeFile(solutionPath, originalContent, 'utf8');
                },
            },
        });

        expect(fs.readFileSync(solutionPath, 'utf8')).toBe(originalContent);
    });

    it('converts a uVision draft and returns the requested solution directory', async () => {
        const solutionDir = path.join(tempDir, 'Converted');
        const uVisionPath = path.join(solutionDir, 'project.uvmpw');
        const convertedSolutionPath = path.join(solutionDir, 'nested', 'project.csolution.yml');
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.createDirectory.mockResolvedValue(undefined);
        const findFiles = jest.fn()
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([Uri.file(uVisionPath)]);
        const mdkToCsolutionConverter: jest.Mocked<MdkToCsolutionConverter> = {
            convert: jest.fn().mockResolvedValue({
                solutionFile: Uri.file(convertedSolutionPath),
                solutionDir: Uri.file(path.dirname(convertedSolutionPath)),
                conversionStatus: 'warnings',
                vcpkgConfigured: true,
                forceRteUpdate: false,
            }),
        };
        const createSolution = getCreateSolutionFromDataManager(
            workspaceFsProvider,
            mdkToCsolutionConverter,
            findFiles,
        );

        const createdSolution = await createSolution(URI.file(solutionDir), {
            solutionName: 'Converted',
            solutionLocation: tempDir,
            solutionFolder: 'Converted',
            gitInit: false,
            compiler: 'GCC',
            projects: [],
            targetTypes: [],
            packs: [],
            draftProject: {
                id: { name: 'uVision', key: 'uvision' },
                name: 'uVision',
                description: 'uVision solution',
                format: DraftProjectFormat.uVision,
                draftType: DraftProjectType.Example,
                draftSource: DraftProjectSource.Local,
                pack: undefined,
                copyTo: jest.fn().mockResolvedValue(undefined),
            },
        });

        expect(mdkToCsolutionConverter.convert).toHaveBeenCalledWith(Uri.file(uVisionPath));
        const [sourcePath, destinationPath, overwrite] = workspaceFsProvider.rename.mock.calls[0];
        expect(pathsEqual(sourcePath, path.join(path.dirname(convertedSolutionPath), 'vcpkg-configuration.json'))).toBe(true);
        expect(pathsEqual(destinationPath, path.join(solutionDir, 'vcpkg-configuration.json'))).toBe(true);
        expect(overwrite).toBe(false);
        expect(pathsEqual(createdSolution.solutionFile?.fsPath, convertedSolutionPath)).toBe(true);
        expect(pathsEqual(createdSolution.solutionDir.fsPath, solutionDir)).toBe(true);
        expect(createdSolution).toMatchObject({
            conversionStatus: 'warnings',
            vcpkgConfigured: true,
            forceRteUpdate: false,
        });
    });
});
