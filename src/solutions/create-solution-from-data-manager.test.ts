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
import * as path from 'path';
import * as YAML from 'yaml';
import { Uri } from 'vscode';
import { URI } from 'vscode-uri';
import { TestDataHandler } from '../__test__/test-data';
import { DraftProjectFormat, DraftProjectSource, DraftProjectType } from '../data-manager/draft-project-data';
import { pathsEqual } from '../utils/path-utils';
import { workspaceFsProviderFactory } from '../vscode-api/workspace-fs-provider.factories';
import { getCreateSolutionFromDataManager } from './create-solution-from-data-manager';
import { MdkToCsolutionConverter } from './mdk-conversion/convert-mdk-command';

describe('createSolutionFromDataManager', () => {
    const testDataHandler = new TestDataHandler();
    let tempDir: string;

    beforeAll(() => {
        tempDir = testDataHandler.tmpDir;
    });

    afterAll(() => {
        testDataHandler.dispose();
    });

    it('adds requested pack metadata and a target type without synthesizing a target set', async () => {
        const solutionDir = path.join(tempDir, 'MySolution');
        const solutionPath = path.join(solutionDir, 'MySolution.csolution.yml');
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.createDirectory.mockImplementation(directory => fs.promises.mkdir(directory, { recursive: true }).then(() => undefined));
        workspaceFsProvider.exists.mockImplementation(fileName => Promise.resolve(fs.existsSync(fileName)));
        const findFiles = jest.fn();
        const createSolution = getCreateSolutionFromDataManager(
            workspaceFsProvider,
            {} as MdkToCsolutionConverter,
            findFiles,
        );

        await createSolution(URI.file(solutionDir), URI.file(solutionPath), {
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
                solutionFileName: 'MySolution.csolution.yml',
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
        workspaceFsProvider.exists.mockImplementation(fileName => Promise.resolve(fs.existsSync(fileName)));
        const findFiles = jest.fn();
        const createSolution = getCreateSolutionFromDataManager(
            workspaceFsProvider,
            {} as MdkToCsolutionConverter,
            findFiles,
        );

        await createSolution(URI.file(solutionDir), URI.file(solutionPath), {
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
                solutionFileName: 'Example.csolution.yml',
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

    it('updates only the selected solution when a copied reference application contains multiple solutions', async () => {
        const solutionDir = path.join(tempDir, 'EthosReference');
        const selectedFileName = 'Test-Ethos-U55.csolution.yml';
        const selectedSolutionPath = path.join(solutionDir, selectedFileName);
        const siblingContents = new Map([
            ['Test-Ethos-U65.csolution.yml', 'solution:\n  description: U65\n'],
            ['Test-Ethos-U85.csolution.yml', 'solution:\n  description: U85\n'],
        ]);
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.createDirectory.mockImplementation(directory => fs.promises.mkdir(directory, { recursive: true }).then(() => undefined));
        workspaceFsProvider.exists.mockImplementation(fileName => Promise.resolve(fs.existsSync(fileName)));
        const findFiles = jest.fn();
        const createSolution = getCreateSolutionFromDataManager(
            workspaceFsProvider,
            {} as MdkToCsolutionConverter,
            findFiles,
        );

        const createdSolution = await createSolution(URI.file(solutionDir), URI.file(selectedSolutionPath), {
            solutionName: 'Test-Ethos-U55',
            solutionLocation: tempDir,
            solutionFolder: 'EthosReference',
            gitInit: false,
            compiler: 'GCC',
            projects: [],
            targetTypes: [],
            packs: [{ pack: 'ARM::CMSIS-Ethos-U@1.0.0', forContext: [], notForContext: [] }],
            draftProject: {
                id: { name: 'Ethos reference', key: 'ethos-reference' },
                name: 'Ethos reference',
                solutionFileName: selectedFileName,
                description: 'Reference application with multiple solutions',
                format: DraftProjectFormat.Csolution,
                draftType: DraftProjectType.RefApp,
                draftSource: DraftProjectSource.Local,
                pack: undefined,
                copyTo: async destination => {
                    await fs.promises.mkdir(destination, { recursive: true });
                    await fs.promises.writeFile(selectedSolutionPath, 'solution:\n  description: U55\n', 'utf8');
                    for (const [fileName, content] of siblingContents) {
                        await fs.promises.writeFile(path.join(destination, fileName), content, 'utf8');
                    }
                },
            },
        });

        expect(YAML.parse(fs.readFileSync(selectedSolutionPath, 'utf8')).solution.packs).toEqual([
            { pack: 'ARM::CMSIS-Ethos-U@1.0.0' },
        ]);
        for (const [fileName, content] of siblingContents) {
            expect(fs.readFileSync(path.join(solutionDir, fileName), 'utf8')).toBe(content);
        }
        expect(pathsEqual(createdSolution.solutionFile?.fsPath, selectedSolutionPath)).toBe(true);
        expect(findFiles).not.toHaveBeenCalled();
    });

    it('retains discovery for web drafts whose metadata has no solution filename', async () => {
        const solutionDir = path.join(tempDir, 'WebExample');
        const discoveredSolutionPath = path.join(solutionDir, 'downloaded.csolution.yml');
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.createDirectory.mockImplementation(directory => fs.promises.mkdir(directory, { recursive: true }).then(() => undefined));
        workspaceFsProvider.exists.mockImplementation(fileName => Promise.resolve(fs.existsSync(fileName)));
        const findFiles = jest.fn().mockResolvedValue([Uri.file(discoveredSolutionPath)]);
        const createSolution = getCreateSolutionFromDataManager(
            workspaceFsProvider,
            {} as MdkToCsolutionConverter,
            findFiles,
        );

        const createdSolution = await createSolution(
            URI.file(solutionDir),
            URI.file(path.join(solutionDir, 'WebExample.csolution.yml')),
            {
                solutionName: 'WebExample',
                solutionLocation: tempDir,
                solutionFolder: 'WebExample',
                gitInit: false,
                compiler: 'GCC',
                projects: [],
                targetTypes: [],
                packs: [],
                draftProject: {
                    id: { name: 'Web example', key: 'web-example' },
                    name: 'Web example',
                    solutionFileName: undefined,
                    description: 'Downloadable example',
                    format: DraftProjectFormat.Csolution,
                    draftType: DraftProjectType.Example,
                    draftSource: DraftProjectSource.Web,
                    pack: undefined,
                    copyTo: async destination => {
                        await fs.promises.mkdir(destination, { recursive: true });
                        await fs.promises.writeFile(discoveredSolutionPath, 'solution:\n', 'utf8');
                    },
                },
            });

        expect(pathsEqual(createdSolution.solutionFile?.fsPath, discoveredSolutionPath)).toBe(true);
        expect(findFiles).toHaveBeenCalledTimes(1);
    });

    it('fails when a local csolution draft does not identify its solution file', async () => {
        const solutionDir = path.join(tempDir, 'MissingFileName');
        const solutionDirUri = URI.file(solutionDir);
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.createDirectory.mockImplementation(directory => fs.promises.mkdir(directory, { recursive: true }).then(() => undefined));
        const findFiles = jest.fn();
        const createSolution = getCreateSolutionFromDataManager(
            workspaceFsProvider,
            {} as MdkToCsolutionConverter,
            findFiles,
        );

        const creation = createSolution(
            solutionDirUri,
            URI.file(path.join(solutionDir, 'MissingFileName.csolution.yml')),
            {
                solutionName: 'MissingFileName',
                solutionLocation: tempDir,
                solutionFolder: 'MissingFileName',
                gitInit: false,
                compiler: 'GCC',
                projects: [],
                targetTypes: [],
                packs: [],
                draftProject: {
                    id: { name: 'Local example', key: 'local-example' },
                    name: 'Local example',
                    solutionFileName: undefined,
                    description: 'Local example without file metadata',
                    format: DraftProjectFormat.Csolution,
                    draftType: DraftProjectType.Example,
                    draftSource: DraftProjectSource.Local,
                    pack: undefined,
                    copyTo: async destination => fs.promises.mkdir(destination, { recursive: true }).then(() => undefined),
                },
            });

        await expect(creation).rejects.toThrow(
            `Could not determine the csolution file path after copying the draft project into ${solutionDirUri.fsPath}`,
        );
        expect(findFiles).not.toHaveBeenCalled();
    });

    it('fails when the identified csolution file was not copied', async () => {
        const solutionDir = path.join(tempDir, 'MissingFile');
        const solutionPath = path.join(solutionDir, 'MissingFile.csolution.yml');
        const solutionFileUri = URI.file(solutionPath);
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.createDirectory.mockImplementation(directory => fs.promises.mkdir(directory, { recursive: true }).then(() => undefined));
        workspaceFsProvider.exists.mockImplementation(fileName => Promise.resolve(fs.existsSync(fileName)));
        const findFiles = jest.fn();
        const createSolution = getCreateSolutionFromDataManager(
            workspaceFsProvider,
            {} as MdkToCsolutionConverter,
            findFiles,
        );

        const creation = createSolution(URI.file(solutionDir), solutionFileUri, {
            solutionName: 'MissingFile',
            solutionLocation: tempDir,
            solutionFolder: 'MissingFile',
            gitInit: false,
            compiler: 'GCC',
            projects: [],
            targetTypes: [],
            packs: [],
            draftProject: {
                id: { name: 'Local example', key: 'local-example' },
                name: 'Local example',
                solutionFileName: 'MissingFile.csolution.yml',
                description: 'Local example with missing copied file',
                format: DraftProjectFormat.Csolution,
                draftType: DraftProjectType.Example,
                draftSource: DraftProjectSource.Local,
                pack: undefined,
                copyTo: async destination => fs.promises.mkdir(destination, { recursive: true }).then(() => undefined),
            },
        });

        await expect(creation).rejects.toThrow(
            `Could not find the csolution file ${solutionFileUri.fsPath} after copying the draft project`,
        );
        expect(findFiles).not.toHaveBeenCalled();
    });

    it('converts a uVision draft and returns the requested solution directory', async () => {
        const solutionDir = path.join(tempDir, 'Converted');
        const uVisionPath = path.join(solutionDir, 'project.uvmpw');
        const convertedSolutionPath = path.join(solutionDir, 'nested', 'project.csolution.yml');
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.createDirectory.mockResolvedValue(undefined);
        const findFiles = jest.fn()
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

        const createdSolution = await createSolution(
            URI.file(solutionDir),
            URI.file(path.join(solutionDir, 'Converted.csolution.yml')),
            {
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
                    solutionFileName: undefined,
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
