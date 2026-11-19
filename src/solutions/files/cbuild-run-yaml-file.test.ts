/**
 * Copyright 2025-2026 Arm Limited
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

import { CbuildRunYamlFile } from './cbuild-run-yaml-file';
import path from 'path';
import { ETextFileResult, TextFile } from '@open-cmsis-pack/cmsis-common/text-file';
import { textFileSystemFactory } from '../../__test__/text-file-system';

describe('cbuild-run-yaml-file', () => {
    const workspaceFolder = path.resolve('test-workspace');
    const fileUri = path.join(workspaceFolder, 'out', 'test.cbuild-run.yml');
    let files: Map<string, string>;

    beforeEach(() => {
        files = new Map();
        TextFile.setFileSystem(textFileSystemFactory(files));
    });

    afterEach(() => TextFile.setFileSystem());
    const bootElf = path.join('boot', 'release', 'boot.elf');
    const bootHex = path.join('boot', 'release', 'boot.hex');
    const appElf = path.join('app', 'debug', 'app.elf');
    const appBin = path.join('app', 'debug', 'app.bin');
    const cbuildRunYamlFile = `cbuild-run:
        generated-by: unittest version 1.2.3
        solution: ../solution.csolution.yml
        output:
          - file: ${bootElf}
            type: elf
            load: symbols
          - file: ${bootHex}
            type: hex
            load: image
          - file: ${appElf}
            type: elf
            load: image+symbols
          - file: ${appBin}
            type: bin
            load: none
            load-offset: 0x00080000
        debugger:
          name: CMSIS-DAP
          info: Generic CMSIS-DAP compliant Serial Wire Debugger
          protocol: swd
          clock: 1000000
          gdbserver:
            - port: 1234
              pname: core0
            - port: 1235
              pname: core1
    `;

    it('returns debugger configuration from basic cbuild-run.yml file', async () => {
        const cbuildRunFile = new CbuildRunYamlFile(fileUri);
        files.set(fileUri, cbuildRunYamlFile);
        await cbuildRunFile.load();

        expect(cbuildRunFile.getDebugger()).toEqual({
            name: 'CMSIS-DAP',
            info: 'Generic CMSIS-DAP compliant Serial Wire Debugger',
            protocol: 'swd',
            clock: 1000000,
            gdbserver: [{
                port: 1234,
                pname: 'core0',
            },{
                port: 1235,
                pname: 'core1',
            }],
        });
    });

    describe('getStdio', () => {
        const monitor = { mode: 'monitor', port: 4444, pname: 'core0' };
        const consoleOutput = { mode: 'console', pname: 'core1' };

        it.each([
            { description: 'stdio for multiple processors', yaml: '    stdio: [{ mode: monitor, port: 4444, pname: core0 }, { mode: console, pname: core1 }]', expected: [monitor, consoleOutput] },
            { description: 'legacy telnet', yaml: '    telnet: [{ mode: monitor, port: 4444, pname: core0 }]', expected: [monitor] },
            { description: 'stdio in preference to legacy telnet', yaml: '    stdio: [{ mode: console, pname: core1 }]\n    telnet: [{ mode: monitor, port: 4444, pname: core0 }]', expected: [consoleOutput] },
            { description: 'an explicitly empty stdio', yaml: '    stdio: []\n    telnet: [{ mode: monitor, port: 4444, pname: core0 }]', expected: [] },
            { description: 'no serial configuration', yaml: '', expected: undefined },
        ])('reads $description from cbuild-run YAML', async ({ yaml, expected }) => {
            files.set(fileUri, `cbuild-run:
  output: []
  debugger:
    name: CMSIS-DAP
${yaml}
`);

            const cbuildRunFile = new CbuildRunYamlFile(fileUri);
            expect(await cbuildRunFile.load()).toBe(ETextFileResult.Success);
            expect(cbuildRunFile.getDebugger().stdio).toEqual(expected);
            expect(cbuildRunFile.getStdio()).toEqual(expected ?? []);
        });

        it.each(['off', 'console', 'file'])('accepts %s mode without a TCP port', async mode => {
            files.set(fileUri, `cbuild-run:
  output: []
  debugger:
    name: CMSIS-DAP
    stdio:
      - mode: ${mode}
`);
            const cbuildRunFile = new CbuildRunYamlFile(fileUri);
            expect(await cbuildRunFile.load()).toBe(ETextFileResult.Success);
            expect(cbuildRunFile.getDebugger().stdio).toEqual([{ mode }]);
            expect(cbuildRunFile.getStdio()).toEqual([{ mode }]);
        });
    });

    describe('getToolVersion', () => {

        it('returns tools and version', async () => {
            const cbuildRunFile = new CbuildRunYamlFile(fileUri);
            files.set(fileUri, cbuildRunYamlFile);
            await cbuildRunFile.load();

            const [tool, version] = cbuildRunFile.getToolVersion();
            expect(tool).toBe('unittest');
            expect(version?.version).toBe('1.2.3');
        });

        it('returns tools and undefined broken version', async () => {
            const cbuildRunFile = new CbuildRunYamlFile(fileUri);

            const yaml = cbuildRunYamlFile.replace('generated-by: unittest version 1.2.3', 'generated-by: unittest version invalid');
            files.set(fileUri, yaml);

            await cbuildRunFile.load();

            const [tool, version] = cbuildRunFile.getToolVersion();
            expect(tool).toBe('unittest');
            expect(version?.version).toBeUndefined();
        });

        it('returns undefined when no version is present', async () => {
            const cbuildRunFile = new CbuildRunYamlFile(fileUri);

            const yaml = cbuildRunYamlFile.replace('generated-by: unittest version 1.2.3', 'generated-by: unittest');
            files.set(fileUri, yaml);

            await cbuildRunFile.load();

            const [tool, version] = cbuildRunFile.getToolVersion();
            expect(tool).toBe('unittest');
            expect(version).toBeUndefined();
        });

        it('returns undefined when no generated-by is present', async () => {
            const cbuildRunFile = new CbuildRunYamlFile(fileUri);

            const yaml = cbuildRunYamlFile.replace('generated-by: unittest version 1.2.3', '');
            files.set(fileUri, yaml);

            await cbuildRunFile.load();

            const [tool, version] = cbuildRunFile.getToolVersion();
            expect(tool).toBeUndefined();
            expect(version).toBeUndefined();
        });

    });

    it('returns resolved path to solution', async () => {
        const cbuildRunFile = new CbuildRunYamlFile(fileUri);
        files.set(fileUri, cbuildRunYamlFile);

        await cbuildRunFile.load();

        const solutionFilePath = cbuildRunFile.getSolution();
        expect(solutionFilePath).toBe(path.join(workspaceFolder, 'solution.csolution.yml'));
    });

    describe('getImages', () => {

        const filterTests: Array<{ filter: { image?: boolean, symbols?: boolean } | undefined, description: string }> = [
            { filter: undefined, description: 'with no filter' },
            { filter: { image: true }, description: 'with image=true filter' },
            { filter: { image: false }, description: 'with image=false filter' },
            { filter: { symbols: true }, description: 'with symbols=true filter' },
            { filter: { symbols: false }, description: 'with symbols=false filter' },
        ];

        filterTests.forEach(({ filter, description }) => {
            it(description, async () => {
                const cbuildRunFile = new CbuildRunYamlFile(fileUri);
                files.set(fileUri, cbuildRunYamlFile);

                await cbuildRunFile.load();

                const images = cbuildRunFile.getImages(filter);
                const expectedImages = [
                    { file: path.join(workspaceFolder, 'out', bootElf), type: 'elf', load: 'symbols' },
                    { file: path.join(workspaceFolder, 'out', bootHex), type: 'hex', load: 'image' },
                    { file: path.join(workspaceFolder, 'out', appElf), type: 'elf', load: 'image+symbols' },
                    { file: path.join(workspaceFolder, 'out', appBin), type: 'bin', load: 'none', 'load-offset': 0x00080000 },
                ].filter((img) => (filter?.image !== undefined && filter?.image === img.load.includes('image')) || (filter?.symbols !== undefined && filter?.symbols === img.load.includes('symbols')) || filter === undefined || (filter.image === undefined && filter.symbols === undefined));
                expect(images).toEqual(expectedImages);
            });
        });

    });
});
