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

import 'jest';
import type { CTreeItem } from '../generic/tree-item';
import { getLatestAvailablePacks, IndexPidxFile } from './index-pidx-file';
import * as pathUtils from '../utils/path-utils';
import * as fsUtils from '../utils/fs-utils';


describe('IndexPidxFile', () => {
    const createFile = (xml: string): IndexPidxFile => {
        const file = new IndexPidxFile();
        file.text = xml;
        file.rootItem = file.parse() as CTreeItem;
        return file;
    };

    it('returns an empty map when no packs exist', () => {
        const file = createFile('<packs></packs>');
        expect(file.packIds.size).toBe(0);
    });

    it('maps pack identifiers to Keil URLs', () => {
        const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<index schemaVersion="1.1.0" xs:noNamespaceSchemaLocation="PackIndex.xsd" xmlns:xs="http://www.w3.org/2001/XMLSchema-instance">
<vendor>Keil</vendor>
<url>https://www.keil.com/pack/</url>
<timestamp>2026-01-14T04:01:27.0418082+00:00</timestamp>
<pindex>
    <pdsc url="https://www.keil.com/pack/" vendor="ARM" name="CMSIS" version="6.3.0" />
    <pdsc url="https://www.keil.com/pack/" vendor="Keil" name="MDK-Middleware" version="8.2.0" />
</pindex>
</index>
`;
        const file = createFile(xml);
        const result = file.packIds;

        expect(result.get('ARM::CMSIS@6.3.0')).toBe('https://www.keil.arm.com/packs/cmsis-arm/versions/');
        expect(result.get('Keil::MDK-Middleware@8.2.0')).toBe('https://www.keil.arm.com/packs/mdk-middleware-keil/versions/');
    });

    it('ignores strings when attributes are missing', () => {
        const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<index>
<pindex>
    <pdsc name="CMSIS" version="6.3.0" />
    <pdsc vendor="Keil"  version="8.2.0" />
    <pdsc name="foo" vendor="Keil"  />
</pindex>
</index>
`;
        const file = createFile(xml);
        expect(file.packIds.size).toBe(0);
    });
});


describe('getLatestAvailablePacks', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should load and return pack IDs from index.pidx file', async () => {
        const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<index schemaVersion="1.1.0">
  <pindex>
    <pdsc vendor="ARM" name="CMSIS" version="5.9.0"/>
    <pdsc vendor="Keil" name="STM32F4xx_DFP" version="2.16.0"/>
    <pdsc vendor="NXP" name="LPC55S69_DFP" version="15.0.0"/>
  </pindex>
</index>`;

        jest.spyOn(pathUtils, 'getCmsisPackRoot').mockReturnValue('/mock/pack/root');
        jest.spyOn(fsUtils, 'readTextFile').mockReturnValue(mockXml);
        jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);

        const packs = await getLatestAvailablePacks();

        expect(packs.size).toBe(3);
        expect(packs.get('ARM::CMSIS@5.9.0')).toBe('https://www.keil.arm.com/packs/cmsis-arm/versions/');
        expect(packs.get('Keil::STM32F4xx_DFP@2.16.0')).toBe('https://www.keil.arm.com/packs/stm32f4xx_dfp-keil/versions/');
        expect(packs.get('NXP::LPC55S69_DFP@15.0.0')).toBe('https://www.keil.arm.com/packs/lpc55s69_dfp-nxp/versions/');
    });

    it('should return empty map when index.pidx file is not found', async () => {

        jest.spyOn(pathUtils, 'getCmsisPackRoot').mockReturnValue('/mock/pack/root');
        jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);
        const packs = await getLatestAvailablePacks();
        expect(packs.size).toBe(0);
    });
});
