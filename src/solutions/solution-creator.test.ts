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
import { URI } from 'vscode-uri';
import { TestDataHandler } from '../__test__/test-data';
import { draftProjectDataFactory } from '../data-manager/data-manager.factories';
import { CsolutionExampleData, DraftProjectFormat } from '../data-manager/draft-project-data';
import { ExampleProject } from '../json-rpc/csolution-rpc-client';
import * as fsUtils from '../utils/fs-utils';
import { pathsEqual } from '../utils/path-utils';
import { workspaceFsProviderFactory } from '../vscode-api/workspace-fs-provider.factories';
import { getCreateSolutionFromDataManager } from './create-solution-from-data-manager';
import { MdkToCsolutionConverter } from './mdk-conversion/convert-mdk-command';
import { SolutionInitialiserFactory } from './solution-initialiser.factory';
import { findExistingSolutionFiles, SolutionCreatorImp, SolutionDirectoryConflictError } from './solution-creator';

describe('SolutionCreatorImp', () => {
    const testDataHandler = new TestDataHandler();
    let tempDir: string;

    beforeEach(() => {
        tempDir = testDataHandler.tmpDir;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        testDataHandler.dispose();
    });

    it('finds supported solution files only in the destination directory', () => {
        const nestedDir = path.join(tempDir, 'nested');
        fs.mkdirSync(nestedDir);
        fs.writeFileSync(path.join(tempDir, 'second.csolution.yml'), '');
        fs.writeFileSync(path.join(tempDir, 'first.csolution.yaml'), '');
        fs.writeFileSync(path.join(nestedDir, 'nested.csolution.yaml'), '');
        fs.writeFileSync(path.join(tempDir, 'not-a-solution.yml'), '');

        const relativeMatches = findExistingSolutionFiles(tempDir)
            .map(fileName => path.relative(tempDir, fileName));

        expect(relativeMatches).toEqual(['first.csolution.yaml', 'second.csolution.yml']);
    });

    it('rejects a late solution-file conflict with the subfolder and first filename', async () => {
        const solutionName = 'MySolution';
        const solutionDir = path.join(tempDir, solutionName);
        const findSolutionFiles = jest.fn().mockReturnValue([path.join(solutionDir, 'existing.csolution.yaml')]);
        const creator = new SolutionCreatorImp(
            jest.fn(),
            SolutionInitialiserFactory(),
            findSolutionFiles,
        );
        const request = {
            solutionName,
            solutionLocation: tempDir,
            solutionFolder: solutionName,
            gitInit: false,
            compiler: 'GCC',
            projects: [],
            targetTypes: [],
            packs: [],
        };

        const creation = creator.createSolution(request);
        await expect(creation).rejects.toEqual(expect.objectContaining({
            name: 'SolutionDirectoryConflictError',
            solutionFolder: solutionName,
            fileName: 'existing.csolution.yaml',
            message: `Selected solution directory ${solutionName} already contains existing.csolution.yaml`,
        } satisfies Partial<SolutionDirectoryConflictError>));
        expect(findSolutionFiles).toHaveBeenCalledTimes(1);
        expect(pathsEqual(findSolutionFiles.mock.calls[0][0], solutionDir)).toBe(true);
    });

    it.each(['', 'VSCode'])('corrects a contradictory draft name and preserves solution subfolder "%s"', async solutionSubfolder => {
        const solutionFolder = 'SelectedDestination';
        const solutionDir = path.join(tempDir, solutionFolder);
        const selectedFileName = path.join(solutionSubfolder, 'Test-Ethos-U55.csolution.yml');
        const createFromDraft = jest.fn().mockResolvedValue({
            solutionFile: URI.file(path.join(solutionDir, selectedFileName)),
            solutionDir: URI.file(solutionDir),
            conversionStatus: 'none',
            vcpkgConfigured: false,
            forceRteUpdate: true,
        });
        const solutionInitialiser = SolutionInitialiserFactory();
        const creator = new SolutionCreatorImp(
            createFromDraft,
            solutionInitialiser,
            jest.fn().mockReturnValue([]),
        );

        await creator.createSolution({
            solutionName: 'ContradictoryName',
            solutionLocation: tempDir,
            solutionFolder,
            gitInit: false,
            compiler: 'GCC',
            projects: [],
            targetTypes: [{ type: 'SelectedTarget' }],
            packs: [],
            draftProject: draftProjectDataFactory({
                format: DraftProjectFormat.Csolution,
                solutionFileName: selectedFileName,
            }),
        });

        expect(createFromDraft).toHaveBeenCalledTimes(1);
        const [actualSolutionDir, actualSolutionFile, actualRequest] = createFromDraft.mock.calls[0];
        expect(pathsEqual(actualSolutionDir.fsPath, solutionDir)).toBe(true);
        expect(actualSolutionFile.toString()).toBe(URI.file(path.join(solutionDir, selectedFileName)).toString());
        expect(actualRequest).toMatchObject({
            solutionName: 'Test-Ethos-U55',
            solutionFolder,
        });
        expect(solutionInitialiser.initialiseSolution).toHaveBeenCalledWith(expect.objectContaining({
            activeTarget: 'SelectedTarget',
        }));
    });

    it('copies and selects a nested example solution when the root contains a solution with the same filename', async () => {
        const sourceDir = path.join(tempDir, 'pack', 'Examples', 'Blinky');
        const solutionFileName = path.join('VSCode', 'Blinky.csolution.yml');
        const selectedContent = 'solution:\n  description: Selected nested solution\n';
        const rootContent = 'solution:\n  description: Root solution\n';
        fs.mkdirSync(path.join(sourceDir, 'VSCode'), { recursive: true });
        fs.writeFileSync(path.join(sourceDir, solutionFileName), selectedContent);
        fs.writeFileSync(path.join(sourceDir, 'Blinky.csolution.yml'), rootContent);
        const example: ExampleProject = {
            name: 'Blinky',
            description: 'Blinky example with VIO',
            doc: '',
            pack: 'Nuvoton::NuMicro_M55M1_BSP@3.2.0',
            environments: [{ name: 'csolution', folder: sourceDir, file: path.join(sourceDir, solutionFileName) }],
        };
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.createDirectory.mockImplementation(directory => fs.promises.mkdir(directory, { recursive: true }).then(() => undefined));
        workspaceFsProvider.exists.mockImplementation(fileName => Promise.resolve(fs.existsSync(fileName)));
        const findFiles = jest.fn();
        const solutionInitialiser = SolutionInitialiserFactory();
        const creator = new SolutionCreatorImp(
            getCreateSolutionFromDataManager(workspaceFsProvider, {} as MdkToCsolutionConverter, findFiles),
            solutionInitialiser,
        );
        const solutionFolder = 'CopiedBlinky';
        const solutionDir = path.join(tempDir, solutionFolder);

        const createdSolution = await creator.createSolution({
            solutionName: 'Blinky',
            solutionLocation: tempDir,
            solutionFolder,
            gitInit: false,
            compiler: 'AC6',
            projects: [],
            targetTypes: [],
            packs: [],
            draftProject: new CsolutionExampleData(example),
        });

        expect(createdSolution.solutionFile?.toString()).toBe(URI.file(path.join(solutionDir, solutionFileName)).toString());
        expect(pathsEqual(createdSolution.solutionDir.fsPath, solutionDir)).toBe(true);
        expect(fs.readFileSync(path.join(solutionDir, solutionFileName), 'utf8')).toBe(selectedContent);
        expect(fs.readFileSync(path.join(solutionDir, 'Blinky.csolution.yml'), 'utf8')).toBe(rootContent);
        expect(findFiles).not.toHaveBeenCalled();
        expect(solutionInitialiser.initialiseSolution).toHaveBeenCalledWith(expect.objectContaining({ createdSolution }));
    });

    it('creates blank solution YAML directly and writes the solution after its projects', async () => {
        const solutionName = 'MySolution';
        const solutionDir = path.join(tempDir, solutionName);
        const solutionPath = path.join(solutionDir, `${solutionName}.csolution.yml`);
        const writeOrder: string[] = [];
        jest.spyOn(fsUtils, 'writeTextFile').mockImplementation((fileName, content) => {
            if (!fileName) {
                throw new Error('Expected a destination file name');
            }
            writeOrder.push(fileName);
            fs.writeFileSync(fileName, content ?? '', 'utf8');
        });
        const creator = new SolutionCreatorImp(
            jest.fn(),
            SolutionInitialiserFactory(),
        );

        await creator.createSolutionFromTemplate(URI.file(solutionDir), URI.file(solutionPath), {
            solutionName,
            solutionLocation: tempDir,
            solutionFolder: solutionName,
            gitInit: false,
            compiler: 'GCC',
            projects: [
                { name: 'Basic', processorName: 'cm0', trustzone: 'off' },
                { name: 'NonSecure', processorName: 'cm33', trustzone: 'non-secure' },
                { name: 'Secure', processorName: 'cm33', trustzone: 'secure' },
            ],
            targetTypes: [
                { type: 'Board', board: 'Vendor::Board:1.0.0' },
                { type: 'Device', device: 'Vendor::Device' },
            ],
            packs: [
                {
                    pack: 'Vendor::BoardPack@1.2.3',
                    forContext: ['+Board'],
                    notForContext: ['.Release+Board', '.Debug+Device'],
                },
            ],
        });

        const solution = YAML.parse(fs.readFileSync(solutionPath, 'utf8')).solution;
        const secureProject = YAML.parse(fs.readFileSync(path.join(solutionDir, 'Secure', 'Secure.cproject.yml'), 'utf8')).project;

        expect(solution.projects).toEqual([
            { project: 'Secure/Secure.cproject.yml' },
            { project: 'NonSecure/NonSecure.cproject.yml' },
            { project: 'Basic/Basic.cproject.yml' },
        ]);
        expect(solution['target-types']).toEqual([
            { type: 'Board', board: 'Vendor::Board:1.0.0' },
            { type: 'Device', device: 'Vendor::Device' },
        ]);
        expect(solution.packs).toEqual([{
            pack: 'Vendor::BoardPack@1.2.3',
            'for-context': '+Board',
            'not-for-context': ['.Release+Board', '.Debug+Device'],
        }]);
        expect(solution.compiler).toBe('GCC');
        expect(secureProject.device).toBe(':cm33');
        expect(secureProject.processor.trustzone).toBe('secure');
        expect(secureProject.components).toEqual([
            { component: 'ARM::CMSIS:CORE' },
            { component: 'Device:Startup' },
        ]);
        expect(fs.existsSync(path.join(solutionDir, 'Secure', 'main.c'))).toBe(true);
        expect(pathsEqual(writeOrder.at(-1), solutionPath)).toBe(true);
        for (const projectName of ['Secure', 'NonSecure', 'Basic']) {
            const projectPath = path.join(solutionDir, projectName, `${projectName}.cproject.yml`);
            expect(writeOrder.slice(0, -1).some(writtenPath => pathsEqual(writtenPath, projectPath))).toBe(true);
        }
    });
});
