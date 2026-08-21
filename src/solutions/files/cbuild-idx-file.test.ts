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

import { it } from '@jest/globals';
import { TestDataHandler } from '../../__test__/test-data';
import path from 'node:path';
import * as fsUtils from '../../utils/fs-utils';
import { CbuildIdxFile } from './cbuild-idx-file';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { getFileNameNoExt } from '../../utils/path-utils';

describe('CbuildIdxFile', () => {
    const testDataHandler = new TestDataHandler();
    let tmpSolutionDir: string;
    beforeAll(async () => {
        tmpSolutionDir = testDataHandler.copyTestDataToTmp('solutions');
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });
    it('test loading non-existing file', async () => {
        const idxFile = new CbuildIdxFile();
        const fileName = testDataHandler.tmpFileName('dummyFile.yml');
        const loadResult = await idxFile.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.NotExists);
        const root = idxFile.rootItem;
        expect(root).toEqual(undefined);
        expect(idxFile.activeContexts.length).toEqual(0);
    });

    it('test load existing file', async () => {
        const solutionDir =  path.join(tmpSolutionDir, 'USBD');
        const fileName = path.join(solutionDir, 'USB_Device.cbuild-idx.yml');
        const idxFile = new CbuildIdxFile();

        let loadResult = await idxFile.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.cbuildLoadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.activeContexts.length).toEqual(2);

        // load again: should be unchanged
        loadResult = await idxFile.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Unchanged);
        expect(idxFile.cbuildLoadResult).toEqual(ETextFileResult.Unchanged);
        expect(idxFile.activeContexts.length).toEqual(2);

        expect(idxFile.activeContexts[0].displayName).toEqual('HID.Release+B-U585I-IOT02A');
        expect(idxFile.activeContexts[0].buildType).toEqual('Release');
        expect(idxFile.activeContexts[0].targetType).toEqual('B-U585I-IOT02A');
        expect(idxFile.activeContexts[0].projectName).toEqual('HID');

        const projectPath = path.join(solutionDir, 'HID', 'HID.cproject.yml');

        expect(idxFile.activeContexts[0].projectPath).toEqual(projectPath);
        expect(idxFile.activeContexts[0].layers).toBeDefined();
        expect(idxFile.activeContexts[0].layers?.length).toEqual(2);

        expect(idxFile.getContext('HID')).toEqual(idxFile.activeContexts[0]);
        expect(idxFile.getContext('HID.cproject.yml')).toEqual(idxFile.activeContexts[0]);
        expect(idxFile.getContext(projectPath)).toEqual(idxFile.activeContexts[0]);

        const cgenPath = path.join(solutionDir, 'Board','B-U585I-IOT02A', 'CubeMX', 'Board.cgen.yml');
        expect(idxFile.activeContexts[0].layers![0].absolutePath).toEqual(cgenPath);
        expect(idxFile.activeContexts[0].layers![0].displayName).toEqual('Board');

        const clayerPath = path.join(solutionDir, 'Board','B-U585I-IOT02A', 'Board.clayer.yml');
        expect(idxFile.activeContexts[1].layers![1].absolutePath).toEqual(clayerPath);
        expect(idxFile.activeContexts[1].layers![1].displayName).toEqual('Board');

        expect(idxFile.activeContexts[1].displayName).toEqual('MassStorage.Debug+B-U585I-IOT02A');
    });

    it('propagates a virtual CMake project path from a generated cbuild', async () => {
        const solutionDir = path.join(tmpSolutionDir, 'USBD');
        const cbuildFileName = path.join(solutionDir, 'HID', 'HID.Release+B-U585I-IOT02A.cbuild.yml');
        const originalCbuild = fsUtils.readTextFile(cbuildFileName);
        const cmakeCbuild = originalCbuild.replace(
            '  project: HID.cproject.yml',
            '  cmake:\n    source: ../app.v2\n    project-id: appID'
        );
        fsUtils.writeTextFile(cbuildFileName, cmakeCbuild);

        try {
            const idxFile = new CbuildIdxFile();
            expect(await idxFile.load(path.join(solutionDir, 'USB_Device.cbuild-idx.yml'))).toBe(ETextFileResult.Success);
            const projectPath = path.join(solutionDir, 'app.v2', 'appID.cproject-cmake.yml');
            expect(idxFile.activeContexts[0].projectName).toBe('appID');
            expect(idxFile.activeContexts[0].projectPath).toBe(projectPath);
            expect(idxFile.getContext(projectPath)).toBe(idxFile.activeContexts[0]);
        } finally {
            fsUtils.writeTextFile(cbuildFileName, originalCbuild);
        }
    });

    it('test load modified cbuild file', async () => {
        const solutionDir =  path.join(tmpSolutionDir, 'USBD');
        const fileName = path.join(solutionDir, 'USB_Device.cbuild-idx.yml');
        const idxFile = new CbuildIdxFile();

        let loadResult = await idxFile.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.cbuildLoadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.activeContexts.length).toEqual(2);
        expect(idxFile.cbuildFiles.size).toEqual(2);
        const cbuild = idxFile.cbuildFiles.get('HID.Release+B-U585I-IOT02A');
        expect(cbuild).toBeDefined();
        cbuild?.clear();

        // load again: should be changed
        loadResult = await idxFile.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.cbuildLoadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.activeContexts.length).toEqual(2);
    });

    it('test load modified cbuild file with another context', async () => {
        const solutionDir =  path.join(tmpSolutionDir, 'USBD');
        let fileName = path.join(solutionDir, 'USB_Device.cbuild-idx.yml');
        const idxFile = new CbuildIdxFile();

        let loadResult = await idxFile.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.cbuildLoadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.activeContexts.length).toEqual(2);
        expect(idxFile.cbuildFiles.size).toEqual(2);
        let cbuild = idxFile.cbuildFiles.get('HID.Release+B-U585I-IOT02A');
        expect(cbuild).toBeDefined();

        let baseName = getFileNameNoExt(cbuild?.fileName);
        expect(baseName).toEqual('HID.Release+B-U585I-IOT02A');
        const cbuildItem = idxFile.topItem?.getChild('cbuilds')?.getChildByValue('cbuild', 'HID/HID.Release+B-U585I-IOT02A.cbuild.yml');
        expect(cbuildItem).toBeDefined();
        let value = cbuildItem?.getValue('cbuild');
        cbuildItem?.setValue('cbuild', value?.replace('.Release+B-U585I-IOT02A', '.Debug+B-U585I-IOT02A'));
        value = cbuildItem?.getValue('cbuild');
        cbuildItem?.setValue('configuration', value?.replace('.Release+B-U585I-IOT02A', '.Debug+B-U585I-IOT02A'));

        // save under another name to avoid interfering with other tests
        fileName = fileName.replace('USB_Device.cbuild-idx.yml', 'USB_Device1.cbuild-idx.yml');
        loadResult = await idxFile.save(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);

        // load again: should be changed because cbuild file is different
        loadResult = await idxFile.load();
        expect(loadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.cbuildLoadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.activeContexts.length).toEqual(2);

        cbuild = idxFile.cbuildFiles.get('HID.Debug+B-U585I-IOT02A');
        expect(cbuild).toBeDefined();
        baseName = getFileNameNoExt(cbuild?.fileName);
        expect(baseName).toEqual('HID.Debug+B-U585I-IOT02A');
    });

    it('retains multiple contexts for the same project', async () => {
        const solutionDir = path.join(tmpSolutionDir, 'USBD');
        let fileName = path.join(solutionDir, 'USB_Device.cbuild-idx.yml');
        const idxFile = new CbuildIdxFile();

        expect(await idxFile.load(fileName)).toEqual(ETextFileResult.Success);
        const massStorage = idxFile.topItem?.getChild('cbuilds')?.getChildByValue(
            'cbuild',
            'MassStorage/MassStorage.Debug+B-U585I-IOT02A.cbuild.yml'
        );
        expect(massStorage).toBeDefined();
        massStorage?.setValue('cbuild', 'HID/HID.Debug+B-U585I-IOT02A.cbuild.yml');
        massStorage?.setValue('configuration', 'HID.Debug+B-U585I-IOT02A');

        fileName = fileName.replace('USB_Device.cbuild-idx.yml', 'USB_Device-contexts.cbuild-idx.yml');
        expect(await idxFile.save(fileName)).toEqual(ETextFileResult.Success);
        expect(await idxFile.load()).toEqual(ETextFileResult.Success);

        expect(idxFile.activeContexts.map(context => context.displayName)).toEqual([
            'HID.Release+B-U585I-IOT02A',
            'HID.Debug+B-U585I-IOT02A'
        ]);
        expect(idxFile.cbuildFiles.size).toEqual(2);
        expect(idxFile.cbuildFiles.get('HID.Release+B-U585I-IOT02A')).not.toBe(
            idxFile.cbuildFiles.get('HID.Debug+B-U585I-IOT02A')
        );
        expect(getFileNameNoExt(idxFile.cbuildFiles.get('HID.Debug+B-U585I-IOT02A')?.fileName)).toEqual('HID.Debug+B-U585I-IOT02A');
    });


    it('test load non-existing cbuild file', async () => {
        const solutionDir =  path.join(tmpSolutionDir, 'USBD');
        const fileName = path.join(solutionDir, 'USB_Device.cbuild-idx.yml');
        const idxFile = new CbuildIdxFile();
        jest.spyOn(fsUtils, 'fileExists').mockImplementation((filePath: string | undefined) =>!!filePath && !filePath.includes('MassStorage'));

        const loadResult = await idxFile.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.NotExists);
        expect(idxFile.cbuildLoadResult).toEqual(ETextFileResult.NotExists);
        expect(idxFile.cbuildFiles.size).toEqual(2);
        expect(idxFile.activeContexts.length).toEqual(2);

        expect(idxFile.activeContexts[0].projectPath).toBeDefined();
        expect(idxFile.activeContexts[1].projectPath).toBeUndefined();
    });
});
