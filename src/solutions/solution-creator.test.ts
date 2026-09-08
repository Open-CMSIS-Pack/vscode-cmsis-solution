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
import { URI } from 'vscode-uri';
import * as fsUtils from '../utils/fs-utils';
import { pathsEqual } from '../utils/path-utils';
import { SolutionInitialiserFactory } from './solution-initialiser.factory';
import { findExistingSolutionFiles, SolutionCreatorImp } from './solution-creator';

describe('SolutionCreatorImp', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'solution-creator-'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('finds supported solution files only in the destination directory', () => {
        const nestedDir = path.join(tempDir, 'nested');
        fs.mkdirSync(nestedDir);
        fs.writeFileSync(path.join(tempDir, 'first.csolution.yml'), '');
        fs.writeFileSync(path.join(nestedDir, 'second.csolution.yaml'), '');
        fs.writeFileSync(path.join(tempDir, 'not-a-solution.yml'), '');

        const relativeMatches = findExistingSolutionFiles(tempDir)
            .map(fileName => path.relative(tempDir, fileName));

        expect(relativeMatches).toEqual(['first.csolution.yml']);
    });

    it('rejects a late solution-file conflict unless overwrite was confirmed', async () => {
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

        await expect(creator.createSolution(request)).rejects.toThrow(
            `Solution directory already contains a solution file (existing.csolution.yaml): ${URI.file(solutionDir).fsPath}`,
        );
        expect(findSolutionFiles).toHaveBeenCalledTimes(1);
        expect(pathsEqual(findSolutionFiles.mock.calls[0][0], solutionDir)).toBe(true);
    });

    it('lists up to five conflicting solution files and reports the remainder', async () => {
        const solutionName = 'MySolution';
        const solutionDir = path.join(tempDir, solutionName);
        const solutionFiles = Array.from(
            { length: 6 },
            (_, index) => path.join(solutionDir, `existing-${index + 1}.csolution.yml`),
        );
        const creator = new SolutionCreatorImp(
            jest.fn(),
            SolutionInitialiserFactory(),
            jest.fn().mockReturnValue(solutionFiles),
        );

        await expect(creator.createSolution({
            solutionName,
            solutionLocation: tempDir,
            solutionFolder: solutionName,
            gitInit: false,
            compiler: 'GCC',
            projects: [],
            targetTypes: [],
            packs: [],
        })).rejects.toThrow(
            `Solution directory already contains a solution file (` +
            `existing-1.csolution.yml, existing-2.csolution.yml, existing-3.csolution.yml, ` +
            `existing-4.csolution.yml, existing-5.csolution.yml (and 1 more)): ${URI.file(solutionDir).fsPath}`,
        );
    });

    it('allows creation after overwrite was confirmed', async () => {
        const solutionName = 'MySolution';
        const solutionDir = path.join(tempDir, solutionName);
        const findSolutionFiles = jest.fn().mockReturnValue([path.join(solutionDir, 'existing.csolution.yml')]);
        const creator = new SolutionCreatorImp(
            jest.fn(),
            SolutionInitialiserFactory(),
            findSolutionFiles,
        );

        const createdSolution = await creator.createSolution({
            solutionName,
            solutionLocation: tempDir,
            solutionFolder: solutionName,
            gitInit: false,
            compiler: 'GCC',
            projects: [],
            targetTypes: [],
            packs: [],
            overwriteExisting: true,
        });

        expect(pathsEqual(createdSolution.solutionDir.fsPath, solutionDir)).toBe(true);
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
