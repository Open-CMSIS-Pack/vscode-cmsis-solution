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
import { ETextFileResult } from '../../generic/text-file';
import { CbuildFile } from './cbuild-file';

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


});
