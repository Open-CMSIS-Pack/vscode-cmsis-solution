/**
 * Copyright 2025-2026 Arm Limited
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

import { it } from '@jest/globals';
import { TestDataHandler } from '../../__test__/test-data';
import path from 'node:path';
import * as fsUtils from '../../utils/fs-utils';
import { CbuildIdxFile } from './cbuild-idx-file';
import { ETextFileResult } from '../../generic/text-file';

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

    it('test load modified cbuild file', async () => {
        const solutionDir =  path.join(tmpSolutionDir, 'USBD');
        const fileName = path.join(solutionDir, 'USB_Device.cbuild-idx.yml');
        const idxFile = new CbuildIdxFile();

        let loadResult = await idxFile.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.cbuildLoadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.activeContexts.length).toEqual(2);
        expect(idxFile.cbuildFiles.size).toEqual(2);
        const cbuild = idxFile.cbuildFiles.get('HID');
        expect(cbuild).toBeDefined();
        cbuild?.clear();

        // load again: should be changed
        loadResult = await idxFile.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.cbuildLoadResult).toEqual(ETextFileResult.Success);
        expect(idxFile.activeContexts.length).toEqual(2);


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
