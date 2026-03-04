/**
 * Copyright 2023-2026 Arm Limited
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

import 'jest';
import * as path from 'path';
import * as YAML from 'yaml';
import { Files, populatedWorkspaceFsProviderFactory, workspaceFsProviderFactory } from '../../vscode-api/workspace-fs-provider.factories';
import { loadSolutionFiles } from './file-loader';
import { parseSolution } from './solution-file-parsing';
import { parseDefaultConfiguration } from './default-file-parsing';
import { parsePackFile } from './build-pack-file-parsing';
import { parseLayer } from './layer-file-parsing';
import { parseProject } from './project-file-parsing';

describe('loadSolutionFiles', () => {
    it('loads and parses a solution file with no projects', async () => {
        const rootDir = __dirname;
        const csolutionFileContent = `
            solution:
              processor:
                trustzone: off
        `;
        const fs: Files = [
            { relativePath: 'MySolution.csolution.yml', content: csolutionFileContent },
        ];
        const workspaceFsProvider = populatedWorkspaceFsProviderFactory(rootDir, fs);
        const solutionFilePath = path.join(rootDir, './MySolution.csolution.yml');

        const output = (await loadSolutionFiles(workspaceFsProvider, solutionFilePath, undefined)).solution.file;

        const expected: typeof output = {
            path: solutionFilePath,
            value: { ...parseSolution(YAML.parseDocument(csolutionFileContent)) },
        };
        expect(output).toEqual(expected);
    });

    it('loads and parses a cdefault file when enabled by solution', async () => {
        const rootDir = __dirname;
        const csolutionFileContent = `
            solution:
              cdefault: true
        `;
        const cdefaultFileContent = `
            default:
              compiler: AC6
        `;
        const fs: Files = [
            { relativePath: 'Hello.csolution.yml', content: csolutionFileContent },
            { relativePath: 'cdefault.yml', content: cdefaultFileContent },
        ];
        const workspaceFsProvider = populatedWorkspaceFsProviderFactory(rootDir, fs);
        const solutionFilePath = path.join(rootDir, './Hello.csolution.yml');

        const output = (await loadSolutionFiles(workspaceFsProvider, solutionFilePath)).defaultConfiguration;

        const expected: typeof output = {
            ...parseDefaultConfiguration(YAML.parseDocument(cdefaultFileContent)),
            path: 'cdefault.yml',
        };
        expect(output).toEqual(expected);
    });

    it('loads and parses a solution file without defaults when cdefault specified (defaulting compiler to GCC), but no default file can be found', async () => {
        const rootDir = __dirname;
        const csolutionFileContent = `
            solution:
              cdefault: true
        `;
        const fs: Files = [
            { relativePath: 'Hello.csolution.yml', content: csolutionFileContent },
        ];
        const workspaceFsProvider = populatedWorkspaceFsProviderFactory(rootDir, fs);
        const solutionFilePath = path.join(rootDir, './Hello.csolution.yml');

        const output = (await loadSolutionFiles(workspaceFsProvider, solutionFilePath)).defaultConfiguration;

        const expected: typeof output = { defaultConfiguration: { compiler: 'GCC' } };
        expect(output).toEqual(expected);
    });

    it('loads and parses a solution with a cbuild-pack file', async () => {
        const rootDir = __dirname;
        const cbuildPackFileContent = `
            cbuild-pack:
              resolved-packs:
                - resolved-pack: alien::Pack@1.0.0
        `;
        const fs: Files = [
            { relativePath: 'FancySolution.csolution.yml', content: 'solution: {}' },
            { relativePath: 'FancySolution.cbuild-pack.yml', content: cbuildPackFileContent },
        ];
        const workspaceFsProvider = populatedWorkspaceFsProviderFactory(rootDir, fs);
        const solutionFilePath = path.join(rootDir, './FancySolution.csolution.yml');

        const output = (await loadSolutionFiles(workspaceFsProvider, solutionFilePath)).packFile;

        const expected: typeof output = parsePackFile(YAML.parseDocument(cbuildPackFileContent));
        expect(output).toEqual(expected);
    });

    it('does not store duplicate layers', async () => {
        const rootDir = __dirname;
        const csolutionFileContent = `
            solution:
              projects:
                - project: FancyProject.cproject.yml
        `;
        const cprojectFileContent = `
            project:
              layers:
                - layer: FancyLayer.clayer.yml
                - layer: FancyLayer.clayer.yml
        `;
        const clayerFileContent = `
            layer:
              components:
                - component: HumanTech:BubbleBlowingMachine
        `;
        const fs: Files = [
            { relativePath: 'FancySolution.csolution.yml', content: csolutionFileContent },
            { relativePath: 'FancyProject.cproject.yml', content: cprojectFileContent },
            { relativePath: 'FancyLayer.clayer.yml', content: clayerFileContent },
        ];
        const workspaceFsProvider = populatedWorkspaceFsProviderFactory(rootDir, fs);
        const solutionFilePath = path.join(rootDir, './FancySolution.csolution.yml');

        const output = (await loadSolutionFiles(workspaceFsProvider, solutionFilePath)).layers;

        expect(output).toHaveLength(1);
        const expected: typeof output[0]['file'] = {
            value: { ...parseLayer(YAML.parseDocument(clayerFileContent)) },
            path: path.join(rootDir, 'FancyLayer.clayer.yml'),
        };
        expect(output[0].file).toEqual(expected);
    });

    it('throws an error when the csolution file does not exist', async () => {
        const workspaceFsProvider = workspaceFsProviderFactory();
        workspaceFsProvider.readUtf8File.mockRejectedValue(new Error('Not found'));

        await expect(loadSolutionFiles(workspaceFsProvider, 'some-solution.yml')).rejects.toThrow('Not found');
    });

    it('throws an error when the csolution file cannot be parsed', async () => {
        const rootDir = __dirname;
        const fs: Files = [
            { relativePath: 'FancySolution.csolution.yml', content: 'Hello world!' },
        ];
        const workspaceFsProvider = populatedWorkspaceFsProviderFactory(rootDir, fs);
        const solutionFilePath = path.join(rootDir, './FancySolution.csolution.yml');

        await expect(
            loadSolutionFiles(workspaceFsProvider, solutionFilePath)
        ).rejects.toThrow();
    });

    it('ignores cproject files that do not exist', async () => {
        const csolutionFileContent = `
            solution:
                projects:
                    - project: MyProject.cproject.yml
        `;
        const fs: Files = [
            { relativePath: 'MySolution.csolution.yml', content: csolutionFileContent },
        ];
        const rootDir = __dirname;
        const workspaceFsProvider = populatedWorkspaceFsProviderFactory(rootDir, fs);
        const solutionFilePath = path.join(rootDir, './MySolution.csolution.yml');

        const output = (await loadSolutionFiles(workspaceFsProvider, solutionFilePath)).projects;

        const expected: typeof output = [];
        expect(output).toEqual(expected);
    });

    it('does not ignore cproject files that cannot be parsed', async () => {
        const csolutionFileContent = `
            solution:
                projects:
                    - project: MyProject.cproject.yml
        `;
        const cprojectFileContent = '$$$Cannot parse me mwahahah!$$$';
        const fs: Files = [
            { relativePath: 'MySolution.csolution.yml', content: csolutionFileContent },
            { relativePath: 'MyProject.cproject.yml', content: cprojectFileContent },
        ];
        const rootDir = __dirname;
        const workspaceFsProvider = populatedWorkspaceFsProviderFactory(rootDir, fs);
        const solutionFilePath = path.join(rootDir, './MySolution.csolution.yml');

        const output = (await loadSolutionFiles(workspaceFsProvider, solutionFilePath)).projects;

        const expected: typeof output[0]['file'] = {
            value: { ...parseProject(YAML.parseDocument(cprojectFileContent)) },
            path: path.join(rootDir, 'MyProject.cproject.yml'),
        };
        expect(output[0].file).toEqual(expected);
    });
});
