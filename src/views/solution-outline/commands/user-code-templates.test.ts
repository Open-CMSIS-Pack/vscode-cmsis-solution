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

import { TestDataHandler } from '../../../__test__/test-data';
import { CSolution } from '../../../solutions/csolution';
import { ETextFileResult } from '../../../generic/text-file';
import path from 'node:path';
import { buildTemplatesFromCbuild } from './user-code-templates';

describe('CSolution', () => {
    let cmsisPackRoot: string;
    const testDataHandler = new TestDataHandler();
    let tmpSolutionDir: string;
    beforeAll(async () => {
        const tmpDataDir = testDataHandler.copyTestDataToTmp();
        tmpSolutionDir = path.join(tmpDataDir, 'solutions');
        cmsisPackRoot = path.join(tmpDataDir, 'packs');
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });

    it('collecting templates with instances > 1', async () => {
        const fileName = path.join(tmpSolutionDir, 'USBD', 'USB_Device.csolution.yml');
        const csolution = new CSolution();

        const loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);


        const templates = buildTemplatesFromCbuild(csolution, cmsisPackRoot);
        expect(templates).toBeDefined();

        const selectedBy = 'Keil::USB&MDK:Device:HID';
        const matchingTemplates = templates.filter(t => t.component === selectedBy);
        expect(matchingTemplates.length).toBe(2);
        expect(matchingTemplates[0].maxInstances).toBe(2);
        expect(matchingTemplates[0].useIndex).toBe(true);
        // Check that the templates have the expected files
        const want1: string[] = ['USBD_User_HID.c'];
        const want2: string[] = ['USBD_User_HID_Mouse.h', 'USBD_User_HID_Mouse.c'];

        const got1: string[] = [];
        const got2: string[] = [];

        for (const template of matchingTemplates) {
            if (template.select === 'USB Device HID (Human Interface Device)') {
                got1.push(...template.files.map(file => path.basename(file)));
            } else if (template.select === 'USB Device HID Mouse') {
                got2.push(...template.files.map(file => path.basename(file)));
            }
        }

        expect(got1).toEqual(want1);
        expect(got2).toEqual(want2);
    });

    it('collecting templates with instances > 0 but no maxInstances === 1', async () => {
        const fileName = path.join(tmpSolutionDir, 'USBD', 'USB_Device.csolution.yml');
        const csolution = new CSolution();

        const loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);

        // get Component and fake max instances

        const cbuild = csolution.cbuildYmlRoot.values().next().value?.getChild();
        expect(cbuild).toBeDefined();
        const component  = cbuild?.getChild('components')?.getChildByValue('component', 'Keil::USB&MDK:Device:HID@8.0.0');
        expect(component).toBeDefined();

        component?.setValue('maxInstances'); // remove maxInstances

        const selectedBy = 'Keil::USB&MDK:Device:HID';

        const templates = buildTemplatesFromCbuild(csolution, cmsisPackRoot);
        expect(templates).toBeDefined();

        const matchingTemplates = templates.filter(t => t.component === selectedBy);
        expect(matchingTemplates.length).toBe(2);
        expect(matchingTemplates[0].maxInstances).toBe(2);
        expect(matchingTemplates[0].useIndex).toBe(true);

        // Check that the templates have the expected files
        const want1: string[] = ['USBD_User_HID.c'];
        const want2: string[] = ['USBD_User_HID_Mouse.h', 'USBD_User_HID_Mouse.c'];

        const got1: string[] = [];
        const got2: string[] = [];

        for (const template of matchingTemplates) {
            if (template.select === 'USB Device HID (Human Interface Device)') {
                got1.push(...template.files.map(file => path.basename(file)));
            } else if (template.select === 'USB Device HID Mouse') {
                got2.push(...template.files.map(file => path.basename(file)));
            }
        }

        expect(got1).toEqual(want1);
        expect(got2).toEqual(want2);
    });

    it('collecting templates with instances == 1, no maxInstances but %Instance% replacement', async () => {
        const fileName = path.join(tmpSolutionDir, 'USBD', 'USB_Device.csolution.yml');
        const csolution = new CSolution();

        const loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);

        // get Component and fake max instances

        const cbuild = csolution.cbuildYmlRoot.values().next().value?.getChild();
        expect(cbuild).toBeDefined();
        const component  = cbuild?.getChild('components')?.getChildByValue('component', 'Keil::USB&MDK:Device:HID@8.0.0');
        expect(component).toBeDefined();

        component?.setValue('maxInstances'); // remove maxInstances
        component?.setValue('instances'); // remove instances

        const selectedBy = 'Keil::USB&MDK:Device:HID';

        const templates = buildTemplatesFromCbuild(csolution, cmsisPackRoot);
        expect(templates).toBeDefined();

        const matchingTemplates = templates.filter(t => t.component === selectedBy);
        expect(matchingTemplates.length).toBe(2);
        expect(matchingTemplates[0].maxInstances).toBe(1);
        expect(matchingTemplates[0].useIndex).toBe(true);

        // Check that the templates have the expected files
        const want1: string[] = ['USBD_User_HID.c'];
        const want2: string[] = ['USBD_User_HID_Mouse.h', 'USBD_User_HID_Mouse.c'];

        const got1: string[] = [];
        const got2: string[] = [];

        for (const template of matchingTemplates) {
            if (template.select === 'USB Device HID (Human Interface Device)') {
                got1.push(...template.files.map(file => path.basename(file)));
            } else if (template.select === 'USB Device HID Mouse') {
                got2.push(...template.files.map(file => path.basename(file)));
            }
        }

        expect(got1).toEqual(want1);
        expect(got2).toEqual(want2);
    });



    it('creation of templates with instances = 1', async () => {
        const fileName = path.join(tmpSolutionDir, 'USBD', 'USB_Device.csolution.yml');
        const csolution = new CSolution();

        const loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);


        const templates = buildTemplatesFromCbuild(csolution, cmsisPackRoot);
        expect(templates).toBeDefined();

        const selectedBy = 'ARM::CMSIS-Compiler:STDERR:Custom';
        const matchingTemplates = templates.filter(t => t.component === selectedBy);
        expect(matchingTemplates.length).toBe(2);
        expect(matchingTemplates[0].maxInstances).toBe(1);
        expect(matchingTemplates[0].useIndex).toBe(false);

    });

});
