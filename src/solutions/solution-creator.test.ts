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
import { SolutionCreatorImp } from './solution-creator';

describe('SolutionCreatorImp', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'solution-creator-'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
        fs.rmSync(tempDir, { recursive: true, force: true });
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
