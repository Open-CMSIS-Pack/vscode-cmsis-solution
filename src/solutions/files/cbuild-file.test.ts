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

import path from 'node:path';
import { TestDataHandler } from '../../__test__/test-data';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { CbuildFile } from './cbuild-file';
import { getCmsisPackRoot } from '../../utils/path-utils';

describe('CbuildFile', () => {
    const testDataHandler = new TestDataHandler();
    let tmpSolutionDir: string;

    beforeAll(async () => {
        tmpSolutionDir = testDataHandler.copyTestDataToTmp('solutions/USBD');
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });

    describe('outDir', () => {

        it('returns build/output-dirs/outdir when set', async () => {
            const cbuildFile = new CbuildFile(`${tmpSolutionDir}/HID/HID.Debug+B-U585I-IOT02A.cbuild.yml`);
            const result = await cbuildFile.load();
            expect(result).toBe(ETextFileResult.Success);
            expect(cbuildFile.outDir).toBe(path.join(tmpSolutionDir, 'out', 'HID', 'B-U585I-IOT02A', 'Debug'));
        });

        it('returns file basedir when outdir is not set', async () => {
            const cbuildFile = new CbuildFile(`${tmpSolutionDir}/HID/HID.Debug+B-U585I-IOT02A.cbuild.yml`);
            const result = await cbuildFile.load();
            expect(result).toBe(ETextFileResult.Success);

            cbuildFile.topItem?.removeChildrenWithTags(['output-dirs']);
            expect(cbuildFile.outDir).toBe(path.join(tmpSolutionDir, 'HID'));
        });

        it('returns virtual west project', async () => {
            const cbuildFile = new CbuildFile(`${tmpSolutionDir}/HID/HID.Debug+B-U585I-IOT02A.cbuild.yml`);
            const result = await cbuildFile.load();
            expect(result).toBe(ETextFileResult.Success);

            cbuildFile.topItem?.removeChildrenWithTags(['project']);
            cbuildFile.topItem?.createChild('west').setValue('app-path', '../zephyr');
            expect(cbuildFile.projectPath).toContain('zephyr.cproject-west.yml');
        });

    });

    describe('getSourceFiles', () => {
        it('returns code-related group, component, API, and linker files', async () => {
            const cbuildFile = new CbuildFile(`${tmpSolutionDir}/HID/HID.Release+B-U585I-IOT02A.cbuild.yml`);
            expect(await cbuildFile.load()).toBe(ETextFileResult.Success);

            const sourceFiles = cbuildFile.getSourceFiles();
            const packRoot = getCmsisPackRoot();

            expect(sourceFiles).toEqual(expect.arrayContaining([
                path.join(tmpSolutionDir, 'HID', 'HID.c'),
                path.join(tmpSolutionDir, 'HID', 'RTE', 'CMSIS', 'RTX_Config.c'),
                path.join(packRoot, 'ARM', 'CMSIS-Compiler', '2.1.0', 'source', 'armcc', 'retarget_io.c'),
                path.join(packRoot, 'ARM', 'CMSIS', '6.1.0', 'CMSIS', 'Driver', 'Include', 'Driver_USART.h'),
                path.join(tmpSolutionDir, 'Board', 'B-U585I-IOT02A', 'RTE', 'Device', 'STM32U585AIIx', 'ac6_linker_script.sct.src'),
                path.join(tmpSolutionDir, 'Board', 'B-U585I-IOT02A', 'RTE', 'Device', 'STM32U585AIIx', 'regions_B-U585I-IOT02A.h'),
            ]));

            expect(sourceFiles).not.toEqual(expect.arrayContaining([
                path.join(tmpSolutionDir, 'HID', 'README.md'),
                path.join(tmpSolutionDir, 'HID', 'RTE', '_Release_B-U585I-IOT02A', 'RTE_Components.h'),
                path.join(packRoot, 'ARM', 'CMSIS-Compiler', '2.1.0', 'template', 'stdio', 'stderr_user.c'),
                path.join(packRoot, 'ARM', 'CMSIS', '6.1.0', 'CMSIS', 'Core', 'Include'),
                path.join(packRoot, 'ARM', 'CMSIS-RTX', '5.9.0', 'Documentation', 'index.html'),
                path.join(packRoot, 'ARM', 'CMSIS-RTX', '5.9.0', 'RTX5.scvd'),
            ]));
        });

        it('recursively collects nested group files', async () => {
            const cbuildFile = new CbuildFile(`${tmpSolutionDir}/HID/HID.Release+B-U585I-IOT02A.cbuild.yml`);
            expect(await cbuildFile.load()).toBe(ETextFileResult.Success);

            const parentGroup = cbuildFile.topItem?.getChild('groups')?.createChild('-');
            parentGroup?.setValue('group', 'Parent');
            const nestedGroup = parentGroup?.createChild('groups').createChild('-');
            nestedGroup?.setValue('group', 'Nested');
            nestedGroup?.createChild('files').createChild('-').setValue('file', 'nested/source.cpp');

            expect(cbuildFile.getSourceFiles()).toContain(path.join(tmpSolutionDir, 'HID', 'nested', 'source.cpp'));
        });
    });


});
