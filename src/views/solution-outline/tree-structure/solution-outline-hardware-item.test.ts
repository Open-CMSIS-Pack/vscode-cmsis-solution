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

import { CTreeItem } from '../../../generic/tree-item';
import { ETextFileResult } from '../../../generic/text-file';
import { parseYamlToCTreeItem } from '../../../generic/tree-item-yaml-parser';
import { CSolution } from '../../../solutions/csolution';
import { HardwareItemBuilder } from './solution-outline-hardware-item';
import { TestDataHandler } from '../../../__test__/test-data';
import path from 'node:path';

describe('HardwareItemBuilder', () => {
    let cSolFile: string;
    let tmpSolutionDir: string;
    const testDataHandler = new TestDataHandler();

    beforeAll(async () => {
        tmpSolutionDir = testDataHandler.copyTestDataToTmp('solutions');
        cSolFile = path.join(tmpSolutionDir, 'USBD', 'USB_Device.csolution.yml');
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });

    it('create dbgconf file node', async () => {
        const cbuildContent = `
            build:
              dbgconf:
                - file: .cmsis/Hello+CS300.dbgconf
                  version: 0.0.0`;

        const root = parseYamlToCTreeItem(cbuildContent);
        const topChild = root?.getChild();
        root!.rootFileName = cSolFile;

        const csolution = new CSolution();
        const loadResult = await csolution.load(cSolFile);
        expect(loadResult).toEqual(ETextFileResult.Success);

        const want = 'Hello+CS300.dbgconf';
        const hwItemBuilder = new HardwareItemBuilder(csolution);
        const hwNodes = hwItemBuilder.createHardwareNodes(csolution, topChild as CTreeItem);
        const node = hwNodes.get('STM32U585AIIx');

        let got: string = '';
        const children = node?.getChildren();
        if (children) {
            const device = children[0];
            got = device.getAttribute('label') ?? '';
        }
        expect(got).toEqual(want);
    });

    it('sets merge attributes on dbgconf node using addMergeFeature', async () => {
        const cbuildContent = `
                        build:
                            dbgconf:
                                - file: .cmsis/Hello+CS300.dbgconf
                                  update: .cmsis/Hello+CS300.dbgconf.update@1.0.0
                                  base: .cmsis/Hello+CS300.dbgconf.base@0.0.1
                                  status: update suggested
                                  version: 0.0.1`;

        const root = parseYamlToCTreeItem(cbuildContent);
        const topChild = root?.getChild();
        root!.rootFileName = cSolFile;

        const csolution = new CSolution();
        const loadResult = await csolution.load(cSolFile);
        expect(loadResult).toEqual(ETextFileResult.Success);

        const hwItemBuilder = new HardwareItemBuilder(csolution);
        const hwNodes = hwItemBuilder.createHardwareNodes(csolution, topChild as CTreeItem);
        const node = hwNodes.get('STM32U585AIIx');

        // find dbgConfFile child node
        const children = node?.getChildren();
        expect(children).toBeDefined();
        const device = children?.[0];

        // check merge attributes set by addMergeFeature
        const local = device?.getAttribute('resourcePath');
        const gotLocal = local ? path.basename(local) : '';
        const wantLocal = 'Hello+CS300.dbgconf';
        expect(gotLocal).toEqual(wantLocal);
    });

});
