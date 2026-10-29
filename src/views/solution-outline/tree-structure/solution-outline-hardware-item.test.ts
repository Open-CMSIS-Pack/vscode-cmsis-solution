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

import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { parseYamlToCTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item-yaml-parser';
import { CSolution } from '../../../solutions/csolution';
import { HardwareItemBuilder } from './solution-outline-hardware-item';
import { TestDataHandler } from '../../../__test__/test-data';
import path from 'node:path';
import { DocManager } from '../../../doc-manager/doc-manager';

describe('HardwareItemBuilder', () => {
    let cSolFile: string;
    let tmpSolutionDir: string;
    let docManager: DocManager;
    const testDataHandler = new TestDataHandler();

    beforeAll(async () => {
        tmpSolutionDir = testDataHandler.copyTestDataToTmp('solutions');
        cSolFile = path.join(tmpSolutionDir, 'USBD', 'USB_Device.csolution.yml');
    });

    beforeEach(() => {
        docManager = new DocManager();
        docManager.file.fileName = testDataHandler.tmpFileName(path.join('.docs', 'docs.yml'));
    });

    afterEach(() => {
        docManager.dispose();
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });

    it('shows matching core documents with their shared inventory owner', async () => {
        const csolution = new CSolution();
        await csolution.load(cSolFile);
        const manager = new DocManager(path.resolve('src/doc-manager/arm-docs.json'));
        await manager.initialize(testDataHandler.tmpFileName('.arm-docs'));
        const build = new CTreeItem('build');
        build.createChild('processor').setValue('core', 'Cortex-M4');
        build.setValue('device', 'ARM::SSE-315');
        await manager.addBooks(build);
        const builder = new HardwareItemBuilder(csolution, undefined, manager);
        const hardware = [...builder.createHardwareNodes(csolution, build).values()].find(item => item.getTag() === 'device')!;
        const books = hardware.getChildren();
        expect(books.some(book => book.getAttribute('docName')?.includes('/ddi0439/b'))).toBe(true);
        expect(books.every(book => book.getAttribute('docParentTag') === 'common' && book.getAttribute('docParentId') === 'arm-docs')).toBe(true);
        build.setValue('device', 'Vendor::Other');
        const otherHardware = [...builder.createHardwareNodes(csolution, build).values()].find(item => item.getTag() === 'device')!;
        expect(otherHardware.getChildren().map(book => book.getAttribute('docName'))).toEqual(books.map(book => book.getAttribute('docName')));
        manager.dispose();
    });

    it.each(['board', 'device'] as const)('includes inventory-only documents in %s books', async parentTag => {
        const csolution = new CSolution();
        const loadResult = await csolution.load(cSolFile);
        expect(loadResult).toEqual(ETextFileResult.Success);

        const parentId = parentTag === 'board' ? csolution.getBoardName() : csolution.getDeviceNameWithVendor();
        const guidePath = path.join(testDataHandler.tmpDir, 'guide.pdf');
        const referencePath = path.join(testDataHandler.tmpDir, 'reference.pdf');
        const guide = docManager.file.ensureDoc(guidePath, parentId, parentTag);
        guide.title = 'Inventory guide';
        guide.path = guidePath;
        const reference = docManager.file.ensureDoc(referencePath, parentId, parentTag);
        reference.title = 'Inventory reference';
        reference.path = referencePath;
        expect(await docManager.file.save()).toBe(ETextFileResult.Success);

        const root = parseYamlToCTreeItem(`
            build:
              ${parentTag}: ${parentId}
              ${parentTag}-books:
                - name: reported.pdf
                  title: Cbuild manual`);
        root!.rootFileName = cSolFile;

        await docManager.addBooks(root!.getChild() as CTreeItem);
        const inventory = docManager.file.stringify();
        const addBooks = jest.spyOn(docManager, 'addBooks');
        const hwItemBuilder = new HardwareItemBuilder(csolution, undefined, docManager);
        const hwNodes = hwItemBuilder.createHardwareNodes(csolution, root?.getChild() as CTreeItem);
        const books = hwNodes.get(parentId)?.getChildren().map(book => ({
            tag: book.getTag(),
            label: book.getAttribute('label'),
            docPath: book.getAttribute('docPath'),
        }));

        expect(books).toEqual([
            { tag: 'book', label: 'Inventory guide', docPath: guidePath },
            { tag: 'book', label: 'Inventory reference', docPath: referencePath },
            { tag: 'book', label: 'Cbuild manual', docPath: path.join(path.dirname(cSolFile), 'reported.pdf') },
        ]);
        expect(addBooks).not.toHaveBeenCalled();
        expect(docManager.file.stringify()).toBe(inventory);
    });

    it.each(['board', 'device'] as const)('exposes exact %s document identity and W/user command eligibility', async parentTag => {
        const csolution = new CSolution();
        await csolution.load(cSolFile);
        const parentId = parentTag === 'board' ? 'Vendor::Board:RevA' : 'Vendor::Device';
        csolution.getCbuildTop()!.setValue(parentTag, parentTag === 'device' ? `${parentId}:cm33` : parentId);
        const root = new CTreeItem('build');
        root.setValue(parentTag, 'Vendor::OtherHardware');
        const names = ['https://example.com/manual.pdf', 'https://example.com/manual.html', 'local.pdf', 'user.pdf'];
        for (const name of names) {
            const doc = docManager.file.ensureDoc(name, parentId, parentTag);
            doc.title = 'Same title';
            if (name === names[0]) {
                doc.path = path.resolve('selected.md');
                doc.mode = 'user';
                doc.error = 'Document unavailable';
            } else if (name === 'user.pdf') {
                doc.mode = 'user';
            }
        }
        const builder = new HardwareItemBuilder(csolution, undefined, docManager);
        const hardware = [...builder.createHardwareNodes(csolution, root).values()].find(item => item.getTag() === parentTag)!;
        expect(hardware.getFeatures()).toBe('docParent');
        expect(hardware.getTag()).toBe(parentTag);
        expect(hardware.getAttribute('hardwareName')).toBe(parentId);
        expect(hardware.getAttribute('docParentId')).toBeUndefined();
        expect(hardware.getAttribute('docParentTag')).toBeUndefined();
        const books = hardware.getChildren();
        expect(books.map(book => book.getAttribute('docName'))).toEqual(names);
        for (const book of books) {
            expect(book.getParent()).toBe(hardware);
            expect(book.getParent()?.getTag()).toBe(parentTag);
            expect(book.getParent()?.getAttribute('hardwareName')).toBe(parentId);
        }
        for (const book of books) {
            expect(book.getAttribute('docParentId')).toBe(parentId);
            expect(book.getAttribute('docParentTag')).toBe(parentTag);
        }
        expect(books.map(book => book.getAttribute('features'))).toEqual(['docFile;webDoc;userDoc', 'docFile', 'docFile', 'docFile;userDoc']);
        expect(books[0].getAttribute('docPath')).toBe(path.resolve('selected.md'));
        expect(books[0].getAttribute('resourcePath')).toBe(path.resolve('selected.md'));
        expect(books.map(book => book.getAttribute('iconPath'))).toEqual([undefined, undefined, undefined, undefined]);
        expect(books.map(book => book.getAttribute('docLocationType'))).toEqual(['W', 'H', 'L', 'L']);
        expect(books.map(book => book.getAttribute('docHasPath'))).toEqual(['1', '0', '0', '0']);
        expect(books[0].getAttribute('docError')).toBe('Document unavailable');
        expect(books[0].getAttribute('tooltip')).toBe(`${path.resolve('selected.md')}\n\nError: Document unavailable`);
        expect(books[1].getAttribute('tooltip')).toBe(names[1]);
        expect(books.map(book => book.getAttribute('command'))).toEqual([
            undefined,
            'cmsis-csolution.openDocFile',
            'cmsis-csolution.openDocFile',
            'cmsis-csolution.openDocFile',
        ]);
    });

    it.each([undefined, 'user'] as const)('shows the owning pack only for non-user pack documents (mode: %s)', async mode => {
        const csolution = new CSolution();
        await csolution.load(cSolFile);
        const parentId = csolution.getDeviceNameWithVendor();
        const packId = 'Vendor::Documentation@1.2.3';
        docManager.file.ensureParent(parentId, 'device', packId);
        const name = '${CMSIS_PACK_ROOT}/Vendor/Documentation/1.2.3/manual.pdf';
        const doc = docManager.file.ensureDoc(name, parentId, 'device');
        doc.path = path.join(testDataHandler.tmpDir, 'manual.pdf');
        doc.mode = mode;
        const builder = new HardwareItemBuilder(csolution, undefined, docManager);
        const book = builder.createHardwareNodes(csolution).get(parentId)!.getChildren()[0];

        expect(book.getAttribute('resourcePath')).toBe(doc.path);
        expect(book.getAttribute('iconPath')).toBeUndefined();
        expect(book.getAttribute('docLocationType')).toBe('P');
        expect(book.getAttribute('tooltip')).toBe(mode === 'user' ? doc.path : `${doc.path}\n\nFrom pack: \`${packId}\``);

        docManager.file.getDocParent(parentId, 'device')!.item!.setValue('pack', undefined);
        const bookWithoutPack = builder.createHardwareNodes(csolution).get(parentId)!.getChildren()[0];
        expect(bookWithoutPack.getAttribute('tooltip')).toBe(doc.path);
    });

    it.each(['Vendor::Device', 'Device'])('shows %s inventory without a supplied build tree', async parentId => {
        const csolution = new CSolution();
        expect(await csolution.load(cSolFile)).toBe(ETextFileResult.Success);
        const cbuild = csolution.getCbuildTop()!;
        const name = 'https://example.com/manual.pdf';
        docManager.file.ensureDoc(name, parentId, 'device').title = 'Device manual';
        const inventory = docManager.file.stringify();
        const addBooks = jest.spyOn(docManager, 'addBooks');
        const builder = new HardwareItemBuilder(csolution, undefined, docManager);

        for (const deviceId of [parentId, `${parentId}:cm33`, `${parentId}:cm0plus`]) {
            cbuild.setValue('device', deviceId);
            const hardware = builder.createHardwareNodes(csolution).get(parentId)!;

            expect(hardware.getTag()).toBe('device');
            expect(hardware.getAttribute('hardwareName')).toBe(parentId);
            expect(hardware.getAttribute('label')).toBe(`Device: ${parentId}`);
            const books = hardware.getChildren();
            expect(books.map(book => book.getAttribute('docName'))).toEqual([name]);
            expect(books[0].getParent()).toBe(hardware);
        }
        expect(addBooks).not.toHaveBeenCalled();
        expect(docManager.file.stringify()).toBe(inventory);
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
        const hwItemBuilder = new HardwareItemBuilder(csolution, undefined, docManager);
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

        const hwItemBuilder = new HardwareItemBuilder(csolution, undefined, docManager);
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
