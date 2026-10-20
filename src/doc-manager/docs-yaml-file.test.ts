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

import * as path from 'node:path';
import { ETextFileResult, TextFile } from '@open-cmsis-pack/cmsis-common/text-file';
import { ITextFileSystem } from '@open-cmsis-pack/cmsis-common/text-file-system';
import { DocsYamlFile } from './docs-yaml-file';

const fileName = '/inventory/docs.yml';
const inventory = [
    'docs:',
    '  devices:',
    '    - device: NXP::LPC4300',
    '      docs:',
    '        - name: datasheet.pdf',
    '          # Keep the download metadata.',
    '          future:',
    '            checksum: abc',
    '  boards:',
    '    - board: Keil::MCB4300',
    '      docs:',
    '        - path: docs/Keil/MCB4300/schematic.pdf',
    '  layers:',
    '    - future-layer: preserved',
    '',
].join('\n');

describe('DocsYamlFile', () => {
    let files: Map<string, string>;
    let fileSystem: jest.Mocked<ITextFileSystem>;

    beforeEach(() => {
        files = new Map([[fileName, inventory]]);
        fileSystem = {
            exists: jest.fn(name => files.has(name)),
            read: jest.fn(name => files.get(name) ?? ''),
            write: jest.fn((name, text) => { files.set(name, text); }),
            unlink: jest.fn(name => { files.delete(name); }),
            dirname: jest.fn(path.posix.dirname),
            resolve: jest.fn(path.posix.resolve),
        };
        TextFile.setFileSystem(fileSystem);
        TextFile.setErrorReporter(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        TextFile.setFileSystem();
        TextFile.setErrorReporter();
        jest.restoreAllMocks();
    });

    it.each([
        ['http://example.com/manual.pdf', true, true],
        ['https://example.com/manual.PDF?format=.html#section', true, true],
        ['www.example.com/manual.pdf', true, true],
        ['https://example.com/manual.html?download=.pdf', true, false],
        ['https://example.com/manual.HTM#manual.pdf', true, false],
        ['https://example.com/manual.HTML', true, false],
        ['https://example.com/manual', true, false],
        ['https://example.com/manual.pdf/', true, false],
        ['https://example.com/.hidden', true, false],
        ['https://example.com/manual.', true, false],
        ['https://', true, false],
        ['file://server/share/manual.pdf', true, true],
        ['file://server/share/manual.htm', true, false],
        ['file:///books/manual.pdf', false, false],
        ['file://localhost/books/manual.pdf', false, false],
        ['/books/manual.pdf', false, false],
        ['custom:manual.pdf', false, false],
    ])('detects web references independently of provenance: %s', (name, isWeb, isWebDoc) => {
        const file = new DocsYamlFile(fileName);
        const doc = file.ensureDoc(name, 'Vendor::Board', 'board');
        for (const locationType of [undefined, 'U', 'W', 'H', 'P', 'L', 'future']) {
            doc.item!.setValue('locationType', locationType);
            doc.path = '/downloaded/manual.pdf';
            const beforeRead = file.stringify();

            expect(doc.isWeb()).toBe(isWeb);
            expect(doc.isWebDoc()).toBe(isWebDoc);
            expect(file.stringify()).toBe(beforeRead);
        }
        expect(fileSystem.exists).not.toHaveBeenCalled();
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    it.each([
        ['https://example.com/manual.pdf', true],
        ['https://example.com/manual.html', false],
        ['manual.pdf', false],
    ])('detects downloads from the current reference %s and a defined path', (name, isWebDoc) => {
        const file = new DocsYamlFile(fileName);
        const doc = file.ensureDoc(name, 'Vendor::Board', 'board');
        for (const mode of [undefined, 'user'] as const) {
            doc.mode = mode;
            for (const docPath of [undefined, '', '/downloaded/manual.pdf']) {
                doc.path = docPath;
                const beforeRead = file.stringify();

                expect(doc.isDownloaded()).toBe(isWebDoc && docPath !== undefined);
                expect(file.stringify()).toBe(beforeRead);
            }
        }
        expect(fileSystem.exists).not.toHaveBeenCalled();
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    it('persists user mode and removes it when cleared with undefined', async () => {
        const file = new DocsYamlFile(fileName);
        const doc = file.ensureDoc('manual.pdf', 'Vendor::Board', 'board');
        const beforeRead = file.stringify();

        expect(doc.mode).toBeUndefined();
        expect(doc.item!.getChild('mode')).toBeUndefined();
        expect(file.stringify()).toBe(beforeRead);
        doc.mode = 'user';
        expect(doc.mode).toBe('user');
        expect(doc.item!.getChild('mode')?.toObject()).toBe('user');
        expect(await file.save()).toBe(ETextFileResult.Success);
        expect(files.get(fileName)).toContain('mode: user');

        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        const saved = reloaded.getDoc(doc.name, 'Vendor::Board', 'board')!;
        expect(saved.mode).toBe('user');
        saved.item!.setValue('mode', 'future');
        const beforeModeRead = reloaded.stringify();
        expect(saved.mode).toBeUndefined();
        expect(saved.item!.getValue('mode')).toBe('future');
        expect(reloaded.stringify()).toBe(beforeModeRead);
        saved.mode = 'user';
        saved.mode = undefined;
        expect(saved.mode).toBeUndefined();
        expect(saved.item!.getChild('mode')).toBeUndefined();
        expect(await reloaded.save()).toBe(ETextFileResult.Success);
        expect(files.get(fileName)).not.toContain('mode:');

        const cleared = new DocsYamlFile(fileName);
        expect(await cleared.load()).toBe(ETextFileResult.Success);
        expect(cleared.getDoc(doc.name, 'Vendor::Board', 'board')?.mode).toBeUndefined();
    });

    it.each([
        ['https://example.com/manual.pdf', 'W'],
        ['https://example.com/manual.html', 'H'],
        ['${CMSIS_PACK_ROOT}/manual.pdf', 'P'],
        [path.resolve('packs', 'manual.pdf'), 'P'],
        [path.resolve('packs'), 'P'],
        [path.resolve('packs', '..manual.pdf'), 'P'],
        [path.resolve('packs-other', 'manual.pdf'), 'L'],
        [path.resolve('packs', '..'), 'L'],
        ['manual.pdf', 'L'],
    ])('calculates location type for %s without storing it and persists live errors', async (name, locationType) => {
        jest.replaceProperty(process, 'env', { ...process.env, CMSIS_PACK_ROOT: path.resolve('packs') });
        const file = new DocsYamlFile(fileName);
        const doc = file.ensureDoc(name, 'Vendor::Board', 'board');
        doc.error = 'Download failed';
        const beforeRead = file.stringify();
        expect(doc.locationType).toBe(locationType);
        expect(file.stringify()).toBe(beforeRead);
        expect(doc.item!.getChild('locationType')).toBeUndefined();
        expect(doc.item!.getValue('error')).toBe('Download failed');
        doc.item!.setValue('error', 'Retry failed');
        expect(doc.error).toBe('Retry failed');
        doc.path = '/downloaded/manual.pdf';
        doc.title = 'Manual';
        doc.category = 'reference';
        expect(doc.locationType).toBe(locationType);
        expect(await file.save()).toBe(ETextFileResult.Success);
        expect(files.get(fileName)).not.toContain('locationType:');

        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        const saved = reloaded.getDoc(doc.name, 'Vendor::Board', 'board')!;
        expect(saved.locationType).toBe(locationType);
        expect(saved.error).toBe('Retry failed');
        saved.error = undefined;
        saved.name = 'https://example.com/changed.html';
        expect(saved.locationType).toBe('H');
        expect(saved.isDownloaded()).toBe(false);
        expect(saved.error).toBeUndefined();
        expect(saved.item!.getChild('locationType')).toBeUndefined();
        expect(saved.item!.getChild('error')).toBeUndefined();
        expect(await reloaded.save()).toBe(ETextFileResult.Success);
        const cleared = new DocsYamlFile(fileName);
        expect(await cleared.load()).toBe(ETextFileResult.Success);
        expect(cleared.getDoc(saved.name, 'Vendor::Board', 'board')?.locationType).toBe('H');
        expect(cleared.getDoc(saved.name, 'Vendor::Board', 'board')?.error).toBeUndefined();
    });

    it('recalculates local location types when the pack root changes without mutating the tree', () => {
        jest.replaceProperty(process, 'env', { ...process.env, CMSIS_PACK_ROOT: path.resolve('packs') });
        const file = new DocsYamlFile(fileName);
        const doc = file.ensureDoc(path.resolve('packs', 'manual.pdf'), 'Vendor::Device', 'device');
        doc.item!.setValue('locationType', 'future');
        const beforeRead = file.stringify();

        expect(doc.locationType).toBe('P');
        process.env.CMSIS_PACK_ROOT = path.resolve('other-packs');
        expect(doc.locationType).toBe('L');
        expect(file.stringify()).toBe(beforeRead);
        expect(doc.item!.getValue('locationType')).toBe('future');
    });

    it('classifies legacy entries without mutating their location and error state', async () => {
        const file = new DocsYamlFile(fileName);
        expect(await file.load()).toBe(ETextFileResult.Success);
        const beforeRead = file.stringify();
        const doc = file.getDocs('NXP::LPC4300', 'device')[0];

        expect(doc.locationType).toBe('L');
        expect(doc.item!.getChild('locationType')).toBeUndefined();
        expect(doc.mode).toBeUndefined();
        expect(doc.item!.getChild('mode')).toBeUndefined();
        expect(doc.error).toBeUndefined();
        expect(doc.isWeb()).toBe(false);
        expect(doc.isWebDoc()).toBe(false);
        expect(doc.isDownloaded()).toBe(false);
        expect(file.stringify()).toBe(beforeRead);
        expect(await file.save()).toBe(ETextFileResult.Unchanged);
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    it('round-trips live documents without storing fallback titles or losing future nodes', async () => {
        const file = new DocsYamlFile(fileName);
        expect(await file.load()).toBe(ETextFileResult.Success);
        const device = file.getDocs('NXP::LPC4300', 'device')[0];
        const board = file.getDocs('Keil::MCB4300', 'board')[0];
        const beforeRead = file.stringify();

        expect(device.title).toBe('datasheet.pdf');
        expect(board.title).toBe('docs/Keil/MCB4300/schematic.pdf');
        expect(file.stringify()).toBe(beforeRead);
        expect(device.item!.getChild('title')).toBeUndefined();
        expect(board.item!.getChild('title')).toBeUndefined();
        expect(fileSystem.write).not.toHaveBeenCalled();

        device.title = 'Datasheet';
        expect(device.item!.getValue('title')).toBe('Datasheet');
        device.item!.setValue('category', 'reference');
        expect(device.category).toBe('reference');
        expect(file.getDoc(device.name, 'NXP::LPC4300', 'device')?.item).toBe(device.item);

        expect(await file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        const savedDevice = reloaded.getDocs('NXP::LPC4300', 'device')[0];
        expect(savedDevice.name).toBe('datasheet.pdf');
        expect(savedDevice.item!.getChild('url')).toBeUndefined();
        expect(savedDevice.title).toBe('Datasheet');
        expect(savedDevice.category).toBe('reference');
        expect(savedDevice.item!.getChild('future')?.getValue('checksum')).toBe('abc');
        expect(reloaded.topItem?.getGrandChildren('layers')[0].getValue('future-layer')).toBe('preserved');
        expect(reloaded.getDocs('Keil::MCB4300', 'board')[0].item!.getChild('title')).toBeUndefined();
        expect(files.get(fileName)).toContain('# Keep the download metadata.');
        expect(reloaded.errors).toEqual([]);
        expect(await reloaded.save()).toBe(ETextFileResult.Unchanged);
        expect(fileSystem.write).toHaveBeenCalledTimes(1);
    });

    it('searches all parent types for the requested id when the tag is omitted', () => {
        const file = new DocsYamlFile(fileName);
        const board = file.ensureDoc('board-guide', 'Vendor::Shared', 'board');
        const device = file.ensureDoc('device-guide', 'Vendor::Shared', 'device');
        device.path = 'device.pdf';
        file.ensureDoc('other-guide', 'Vendor::Other', 'component');

        expect(file.getDocParent('Vendor::Shared')?.item).toBe(file.getDocParent('Vendor::Shared', 'board')?.item);
        expect(file.getDocs('Vendor::Shared').map(doc => doc.item)).toEqual([board.item, device.item]);
        expect(file.getDocs('Vendor::Shared', 'device').map(doc => doc.item)).toEqual([device.item]);
        expect(file.getDoc('device-guide', 'Vendor::Shared')?.item).toBe(device.item);
        expect(file.getDocByPath('device.pdf', 'Vendor::Shared')?.item).toBe(device.item);
        expect(file.getDoc('device-guide', 'Vendor::Shared', 'board')).toBeUndefined();
        expect(file.getDocByPath('device.pdf', 'Vendor::Shared', 'board')).toBeUndefined();
        expect(file.getDoc('other-guide', 'Vendor::Shared')).toBeUndefined();
        expect(file.getDoc('device-guide', 'vendor::Shared')).toBeUndefined();
        expect(file.getDocs('Vendor::Missing')).toEqual([]);
        expect(file.getDocParent('Vendor::Missing')).toBeUndefined();
        expect(file.removeDoc('device-guide', 'Vendor::Shared', 'board')).toBe(false);
        expect(file.removeDoc('device.pdf', 'Vendor::Shared')).toBe(false);
        expect(file.removeDoc('device-guide', 'Vendor::Shared')).toBe(true);
        expect(file.removeDoc('device-guide', 'Vendor::Shared')).toBe(false);
        expect(file.getDocs('Vendor::Shared').map(doc => doc.item)).toEqual([board.item]);
    });

    it('finds all exact document names across the collection or a specified parent type', () => {
        const file = new DocsYamlFile(fileName);
        expect(file.findDocs('manual')).toEqual([]);
        expect(file.rootItem).toBeUndefined();

        const board = file.ensureDoc('manual', 'Vendor::Board', 'board');
        const duplicate = file.ensureDoc('duplicate', 'Vendor::Board', 'board');
        duplicate.name = 'manual';
        const otherBoard = file.ensureDoc('manual', 'Vendor::OtherBoard', 'board');
        const device = file.ensureDoc('manual', 'Vendor::Device', 'device');
        file.ensureDoc('other', 'Vendor::Component', 'component').path = 'manual';
        const beforeRead = file.stringify();

        expect(file.findDocs('manual').map(doc => doc.item))
            .toEqual([board.item, duplicate.item, otherBoard.item, device.item]);
        expect(file.findDocs('manual', 'board').map(doc => doc.item))
            .toEqual([board.item, duplicate.item, otherBoard.item]);
        expect(file.findDocs('manual', 'device').map(doc => doc.item)).toEqual([device.item]);
        expect(file.findDocs('manual', 'component')).toEqual([]);
        expect(file.findDocs('manual', 'missing')).toEqual([]);
        expect(file.findDocs('Manual')).toEqual([]);
        expect(file.findDocs('missing')).toEqual([]);
        expect(file.stringify()).toBe(beforeRead);
        file.findDocs('manual')[0].title = 'Manual';
        expect(board.title).toBe('Manual');
    });

    it('ensures documents only within the specified parent type', () => {
        const file = new DocsYamlFile(fileName);
        const board = file.ensureParent('Vendor::Shared', 'board');
        const device = file.ensureDoc('manual', 'Vendor::Shared', 'device');
        expect(file.ensureParent('Vendor::Shared', 'board')).toBe(board);
        expect(file.ensureDoc('manual', 'Vendor::Shared', 'device').item).toBe(device.item);
        expect(file.getDocs('Vendor::Shared', 'board')).toEqual([]);
        const created = file.ensureDoc('manual', 'Vendor::Shared', 'board');
        expect(created.item).not.toBe(device.item);
        expect(file.ensureDoc('manual', 'Vendor::Shared', 'board').item).toBe(created.item);
        expect(file.getDoc('manual', 'Vendor::Shared', 'board')?.item).toBe(created.item);
        expect(file.getDocParents()).toHaveLength(2);
    });

    it.each([
        ['unchanged pack', 'Vendor::Pack@1.0.0', 'Vendor::Pack@1.0.0', true],
        ['both packs missing', undefined, undefined, true],
        ['changed pack', 'Vendor::Pack@1.0.0', 'Vendor::Pack@2.0.0', true],
        ['new pack', undefined, 'Vendor::Pack@2.0.0', true],
        ['missing pack update', 'Vendor::Pack@1.0.0', undefined, true],
        ['omitted pack argument', 'Vendor::Pack@1.0.0', undefined, false],
    ])('ensures parent pack metadata and preserves user documents for %s', async (_description, currentPack, packId, updatePack) => {
        const file = new DocsYamlFile(fileName);
        const parentId = 'Vendor::Hardware';
        const parent = file.ensureParent(parentId, 'device', currentPack);
        const docParent = file.getDocParent(parentId, 'device')!;
        expect(docParent.packId).toBe(currentPack);
        parent.setValue('future', 'preserved');
        const manual = file.ensureDoc('manual.pdf', parentId, 'device');
        manual.mode = 'user';
        manual.error = 'Stored error';
        manual.item!.setValue('future', 'preserved');
        const manualObject = manual.item!.toObject();
        const imported = docParent.ensureDoc('imported.pdf');
        const futureMode = docParent.ensureDoc('future.pdf');
        futureMode.item!.setValue('mode', 'future');
        const otherParent = file.ensureDoc(imported.name, 'Vendor::Other', 'device');
        const otherTag = file.ensureDoc(imported.name, parentId, 'board');
        const expectedPack = updatePack && packId ? packId : currentPack;
        const packChanged = currentPack !== expectedPack;

        expect(updatePack ? file.ensureParent(parentId, 'device', packId) : file.ensureParent(parentId, 'device')).toBe(parent);

        expect(docParent.packId).toBe(expectedPack);
        expect(parent.getValue('pack')).toBe(expectedPack);
        expect(parent.getValue('future')).toBe('preserved');
        expect(docParent.docs.map(doc => doc.item)).toEqual(packChanged ? [manual.item] : [manual.item, imported.item, futureMode.item]);
        expect(manual.item!.toObject()).toEqual(manualObject);
        expect(file.getDoc(imported.name, 'Vendor::Other', 'device')!.item).toBe(otherParent.item);
        expect(file.getDoc(imported.name, parentId, 'board')!.item).toBe(otherTag.item);
        const beforeRead = file.stringify();
        expect(file.ensureParent(parentId, 'device')).toBe(parent);
        expect(docParent.packId).toBe(expectedPack);
        expect(file.stringify()).toBe(beforeRead);
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(await file.save()).toBe(ETextFileResult.Success);

        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.getDocParent(parentId, 'device')?.packId).toBe(expectedPack);
        expect(reloaded.getDocs(parentId, 'device').map(doc => doc.name))
            .toEqual(packChanged ? [manual.name] : [manual.name, imported.name, futureMode.name]);
    });

    it.each([
        'Vendor::Pack@1.0.0',
        'vendor::pack@1.0.0',
        'Vendor::Pack@1.0.0+build.1',
    ])('preserves equivalent pack %s and updates changed packs without replacing user documents', equivalentPackId => {
        const file = new DocsYamlFile(fileName);
        file.ensureParent('Vendor::Component', 'component', 'Vendor::Pack@1.0.0');
        const parent = file.getDocParent('Vendor::Component', 'component')!;
        const imported = parent.ensureDoc('imported.pdf');
        const manual = parent.ensureDoc('manual.pdf');
        manual.mode = 'user';
        const beforeRead = file.stringify();

        expect(parent.packId).toBe('Vendor::Pack@1.0.0');
        parent.packId = equivalentPackId;
        expect(parent.packId).toBe('Vendor::Pack@1.0.0');
        expect(file.stringify()).toBe(beforeRead);
        expect(parent.docs.map(doc => doc.item)).toEqual([imported.item, manual.item]);
        parent.packId = 'Vendor::Pack@2.0.0';
        expect(parent.packId).toBe('Vendor::Pack@2.0.0');
        expect(parent.docs.map(doc => doc.item)).toEqual([manual.item]);
        const replacement = parent.ensureDoc('replacement.pdf');
        const beforeIgnoredUpdate = file.stringify();
        for (const ignoredPackId of [undefined, '', 'Vendor::Pack@1.0.0']) {
            parent.packId = ignoredPackId;
            expect(parent.packId).toBe('Vendor::Pack@2.0.0');
            expect(file.stringify()).toBe(beforeIgnoredUpdate);
            expect(parent.docs.map(doc => doc.item)).toEqual([manual.item, replacement.item]);
        }
    });

    it('creates both parents and removes only the requested document', async () => {
        const file = new DocsYamlFile('/new/docs.yml');
        expect(file.getDocParents()).toEqual([]);
        expect(file.getDocs('NXP::LPC4300', 'device')).toEqual([]);
        expect(file.removeDoc('manual', 'NXP::LPC4300', 'device')).toBe(false);
        expect(file.rootItem).toBeUndefined();

        const device = file.ensureDoc('manual', 'NXP::LPC4300', 'device');
        expect(device.name).toBe('manual');
        expect(device.path).toBeUndefined();
        device.path = 'manual.pdf';
        device.title = 'Manual';
        device.category = 'reference';
        const parent = file.getDocParent('NXP::LPC4300', 'device')!;
        parent.item!.setValue('future', 'preserve');
        expect(parent.ensureDoc('manual').item).toBe(device.item);
        expect(parent.docs[0].title).toBe('Manual');
        const second = parent.ensureDoc('second.pdf');
        expect(parent.ensureDoc('second.pdf').item).toBe(second.item);
        const board = file.ensureDoc('manual', 'NXP::LPC4300', 'board');
        expect(board.item).not.toBe(device.item);
        expect(file.getDocParents().map(entry => [entry.tag, entry.id])).toEqual([
            ['device', 'NXP::LPC4300'], ['board', 'NXP::LPC4300'],
        ]);
        expect(parent.docs.map(doc => doc.item)).toEqual([device.item, second.item]);
        expect(file.getDocParent('nxp::LPC4300', 'device')).toBeUndefined();

        expect(parent.removeDoc('manual.pdf')).toBe(false);
        expect(file.removeDoc('manual.pdf', 'NXP::LPC4300', 'device')).toBe(false);
        expect(parent.docs.map(doc => doc.item)).toEqual([device.item, second.item]);
        expect(parent.removeDoc('manual')).toBe(true);
        expect(parent.removeDoc('manual')).toBe(false);
        expect(parent.removeDoc(second.name)).toBe(true);
        expect(parent.docs).toEqual([]);
        expect(parent.item!.getValue('future')).toBe('preserve');
        expect(file.getDocs('NXP::LPC4300', 'board')).toHaveLength(1);
        expect(await file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocsYamlFile(file.fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.getDocParent('NXP::LPC4300', 'device')?.docs).toEqual([]);
        expect(reloaded.rootItem?.rootFileName).toBe(file.fileName);
        expect(reloaded.resolvePath('manual.pdf')).toBe('/new/manual.pdf');
        expect(files.get(file.fileName)).not.toContain('\r');
        expect(files.get(file.fileName)).toMatch(/[^\n]\n$/);
    });

    it('creates, enumerates and round-trips references for arbitrary parents', async () => {
        const file = new DocsYamlFile(fileName);
        const parentTag: string = 'component';
        const parentItem = file.ensureParent('Vendor::Component', parentTag);
        expect(parentItem.getTag()).toBe('-');
        expect(parentItem.isMap()).toBe(true);
        expect(parentItem.getValue(parentTag)).toBe('Vendor::Component');
        expect(file.getDocParent('Vendor::Component', parentTag)?.docs).toEqual([]);
        expect(file.ensureParent('Vendor::Component', parentTag)).toBe(parentItem);
        const reference = file.ensureDoc('manual', 'Vendor::Component', parentTag);
        reference.path = 'manual.pdf';
        reference.title = 'Component manual';
        const docParent = file.getDocParent('Vendor::Component', parentTag)!;
        expect(docParent.item).toBe(parentItem);
        expect(docParent.tag).toBe(parentTag);
        expect(docParent.id).toBe('Vendor::Component');
        expect(docParent.name).toBe('Vendor::Component');
        expect(file.topItem?.getGrandChildren('components')[0]).toBe(docParent.item);
        expect(file.getDocParents()[0].item).toBe(docParent.item);
        expect(file.getDocParents(parentTag)[0].item).toBe(docParent.item);
        expect(file.ensureDoc('manual', 'Vendor::Component', parentTag).item).toBe(reference.item);
        expect(await file.save()).toBe(ETextFileResult.Success);

        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.getDocParents().map(entry => entry.tag)).toEqual([parentTag]);
        expect(reloaded.getDocByPath('manual.pdf', 'Vendor::Component', parentTag)?.title)
            .toBe('Component manual');
        expect(reloaded.getDoc('manual', 'Vendor::Component', parentTag)?.title).toBe('Component manual');
        expect(reloaded.removeDoc('manual', 'Vendor::Component', parentTag)).toBe(true);
        expect(reloaded.getDocs('Vendor::Component', parentTag)).toEqual([]);
    });

    it('reads and edits parent identities through the stored tag', async () => {
        const file = new DocsYamlFile(fileName);
        expect(await file.load()).toBe(ETextFileResult.Success);
        const parent = file.getDocParent('NXP::LPC4300', 'device')!;
        const doc = parent.docs[0];
        parent.item!.setValue('device', 'NXP::Updated');
        expect(parent.id).toBe('NXP::Updated');
        expect(parent.name).toBe('NXP::Updated');
        expect(file.getDocParent('NXP::LPC4300', 'device')).toBeUndefined();
        expect(file.getDocParent('NXP::Updated', 'device')?.item).toBe(parent.item);

        parent.name = 'NXP::Renamed';
        expect(parent.id).toBe('NXP::Renamed');
        expect(parent.tag).toBe('device');
        expect(parent.item!.getTag()).toBe('-');
        expect(parent.item!.getValue('device')).toBe('NXP::Renamed');
        expect(file.ensureParent('NXP::Renamed', 'device')).toBe(parent.item);
        expect(file.getDocs('NXP::Renamed', 'device')[0].item).toBe(doc.item);
        expect(await file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.getDocParent('NXP::Renamed', 'device')?.name).toBe('NXP::Renamed');
        expect(reloaded.getDocs('NXP::Renamed', 'device')[0].name).toBe(doc.name);
    });

    it('removes the whole parent entry without affecting other parents', async () => {
        const file = new DocsYamlFile(fileName);
        const board = file.ensureDoc('manual', 'Vendor::Shared', 'board');
        const device = file.ensureDoc('manual', 'Vendor::Shared', 'device');
        const parent = file.getDocParent('Vendor::Shared', 'board')!;
        parent.item!.setValue('future', 'metadata');
        expect(parent.docs[0].item).toBe(board.item);
        parent.remove();

        expect(file.getDocParents('board')).toEqual([]);
        expect(file.topItem?.getGrandChildren('boards')).toEqual([]);
        expect(file.findDocs('manual').map(doc => doc.item)).toEqual([device.item]);
        expect(await file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.getDocParents('board')).toEqual([]);
        expect(reloaded.getDocs('Vendor::Shared', 'device')[0].name).toBe('manual');
        expect(files.get(fileName)).not.toContain('metadata');
    });

    it('computes titles and locator keys from current nodes without cached field values', async () => {
        const file = new DocsYamlFile(fileName);
        await file.load();
        const parent = file.getDocParent('NXP::LPC4300', 'device')!;
        const doc = parent.docs[0];
        doc.path = 'local.pdf';
        expect(parent.getDoc('datasheet.pdf')?.item).toBe(doc.item);
        expect(parent.getDocByPath('local.pdf')?.item).toBe(doc.item);
        expect(parent.getDoc('local.pdf')).toBeUndefined();
        expect(parent.getDocByPath('datasheet.pdf')).toBeUndefined();
        doc.title = 'Explicit';
        expect(doc.title).toBe('Explicit');
        doc.title = '';
        expect(doc.title).toBe(doc.name);
        doc.title = undefined;
        expect(doc.item!.getChild('title')).toBeUndefined();
        doc.category = 'reference';
        doc.category = undefined;
        expect(doc.item!.getChild('category')).toBeUndefined();

        doc.name = 'new.pdf';
        expect(parent.getDoc('datasheet.pdf')).toBeUndefined();
        expect(parent.getDoc(doc.name)?.item).toBe(doc.item);
        expect(parent.getDoc('NEW.PDF')).toBeUndefined();
        doc.name = undefined;
        expect(doc.name).toBe('');
        expect(doc.item!.getValue('name')).toBeUndefined();
        expect(parent.getDoc('new.pdf')).toBeUndefined();
        expect(doc.title).toBe('local.pdf');
        doc.path = 'new-local.pdf';
        expect(parent.getDocByPath('local.pdf')).toBeUndefined();
        expect(parent.getDocByPath('new-local.pdf')?.item).toBe(doc.item);
        expect(parent.getDocByPath('NEW-LOCAL.PDF')).toBeUndefined();
        doc.path = undefined;
        expect(doc.item!.getChild('path')).toBeUndefined();
        expect(parent.getDocByPath('new-local.pdf')).toBeUndefined();
        expect(doc.title).toBe('');
        expect(await file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocsYamlFile(fileName);
        await reloaded.load();
        expect(reloaded.getDocs('NXP::LPC4300', 'device')[0].item!.getChild('title')).toBeUndefined();
    });

    it('assigns and removes locations without checking document identities', async () => {
        const file = new DocsYamlFile(fileName);
        const first = file.ensureDoc('first.pdf', 'Keil::MCB4300', 'board');
        const second = file.ensureDoc('second.pdf', 'Keil::MCB4300', 'board');
        first.path = 'local.pdf';
        expect(file.ensureDoc('first.pdf', 'Keil::MCB4300', 'board').item).toBe(first.item);

        second.name = first.name;
        expect(second.name).toBe(first.name);
        second.name = undefined;
        expect(second.name).toBe('');
        expect(second.item!.getValue('name')).toBeUndefined();
        expect(second.title).toBe('');
        first.name = undefined;
        expect(first.title).toBe('local.pdf');
        expect(await file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.getDocs('Keil::MCB4300', 'board').map(doc => doc.path))
            .toEqual(['local.pdf', undefined]);
    });

    it.each([
        ['path', '/docs/manual.pdf'], ['path', 'C:\\Local Docs\\manual.pdf'],
        ['path', 'C:/Local Docs/manual.pdf'], ['path', '\\\\server\\share\\manual.pdf'],
        ['name', 'manual.pdf'], ['name', 'Local Docs/manual.pdf'], ['name', 'datasheet'],
    ] as const)('round-trips document %s %s through creation and live edits', async (field, value) => {
        const file = new DocsYamlFile(fileName);
        const created = file.ensureDoc(field === 'name' ? value : 'manual', 'Vendor::Board', 'board');
        created[field] = value;
        const edited = file.ensureDoc('original', 'Vendor::Device', 'device');
        edited[field] = value;
        expect(created[field]).toBe(value);
        expect(edited[field]).toBe(value);
        expect(edited.title).toBe(edited.name);
        expect(await file.save()).toBe(ETextFileResult.Success);

        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        for (const [parentTag, id, name] of [
            ['board', 'Vendor::Board', created.name], ['device', 'Vendor::Device', edited.name],
        ]) {
            const saved = reloaded.getDoc(name, id, parentTag);
            expect(saved?.[field]).toBe(value);
            if (field === 'path') {
                expect(reloaded.getDocByPath(value, id, parentTag)?.item).toBe(saved?.item);
            }
        }
        expect(reloaded.errors).toEqual([]);
        expect(await reloaded.save()).toBe(ETextFileResult.Unchanged);
    });

    it('stores parent ids and document fields without validating their values', async () => {
        const file = new DocsYamlFile(fileName);
        const namedParentItem = file.ensureParent('Vendor::Device', 'device');
        const emptyParentItem = file.ensureParent('', 'device');
        expect(emptyParentItem).not.toBe(namedParentItem);
        expect(file.ensureParent('', 'device')).toBe(emptyParentItem);
        expect(file.ensureParent('Vendor::Device', 'device')).toBe(namedParentItem);
        const doc = file.ensureDoc('custom:manual', '', 'device');
        const parent = file.getDocParent('', 'device')!;
        expect(parent.item).toBe(emptyParentItem);
        expect(parent.id).toBe('');
        expect(doc.name).toBe('custom:manual');
        doc.name = ' ';
        doc.path = ' ';
        const board = file.ensureDoc('', ' ', 'board');
        expect(board.name).toBe('');
        expect(file.ensureDoc('', ' ', 'board').item).toBe(board.item);
        board.path = '';
        expect(board.path).toBe('');
        expect(await file.save()).toBe(ETextFileResult.Success);

        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        const saved = reloaded.getDocs('', 'device')[0];
        expect(saved.name).toBe(' ');
        expect(saved.path).toBe(' ');
        expect(reloaded.getDocs(' ', 'board')[0].path).toBe('');
    });

    it('preserves unrecognized sequence entries and nested future metadata', async () => {
        files.set(fileName, [
            'docs:',
            '  boards:',
            '    - future-parent:',
            '        docs: not-current-schema',
            '    - board: Keil::MCB4300',
            '      future-parent-field: [one, two]',
            '      docs:',
            '        - name: https://example.com/legacy.pdf',
            '          title: {future: title}',
            '        - future-document: [one, two]',
            '        - path: local.pdf',
            '          future-document-field: {version: next}',
            '  devices: []',
            '  future-section:',
            '    docs: {arbitrary: data}',
            '',
        ].join('\n'));
        const file = new DocsYamlFile(fileName);
        expect(await file.load()).toBe(ETextFileResult.Success);
        expect(file.getDocParents()).toHaveLength(1);
        expect(file.getDocs('Keil::MCB4300', 'board')).toHaveLength(3);
        file.getDocByPath('local.pdf', 'Keil::MCB4300', 'board')!.title = 'Local';
        expect(await file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.topItem?.getGrandChildren('boards')).toHaveLength(2);
        const parent = reloaded.getDocParent('Keil::MCB4300', 'board')!;
        const parentEntry = parent.item!;
        expect(parentEntry.getGrandChildren('docs')).toHaveLength(3);
        expect(parentEntry.getGrandChildren('docs')[0].getValue('name')).toBe('https://example.com/legacy.pdf');
        expect(parentEntry.getGrandChildren('docs')[0].getChild('title')?.getValue('future')).toBe('title');
        expect(parentEntry.getGrandChildren('future-parent-field').map(item => item.getText())).toEqual(['one', 'two']);
        expect(reloaded.topItem?.getChild('future-section')?.getChild('docs')?.getValue('arbitrary')).toBe('data');
        expect(reloaded.errors).toEqual([]);
    });

    it('replaces the tree on reload and clear without updating detached wrappers', async () => {
        const file = new DocsYamlFile(fileName);
        expect(await file.load()).toBe(ETextFileResult.Success);
        const oldDoc = file.getDocs('NXP::LPC4300', 'device')[0];
        files.set(fileName, 'docs: {}\n');
        expect(await file.load()).toBe(ETextFileResult.Success);
        expect(file.getDocParents()).toEqual([]);
        file.ensureDoc('local.pdf', 'Keil::MCB4300', 'board');
        file.clear();
        expect(file.getDocParents()).toEqual([]);
        file.ensureDoc('new.pdf', 'NXP::LPC4300', 'device');
        oldDoc.title = 'Detached';
        expect(file.getDocs('NXP::LPC4300', 'device')[0].title).toBe('new.pdf');
        expect(await file.save()).toBe(ETextFileResult.Success);
        expect(file.errors).toEqual([]);
    });

    it('persists raw-tree edits without schema validation', async () => {
        files.set(fileName, [
            'docs:',
            '  devices:',
            '    - device: NXP::LPC4300',
            '      docs:',
            '        - name: custom:manual',
            '          title: {future: metadata}',
            '',
        ].join('\n'));
        const file = new DocsYamlFile(fileName);
        expect(await file.load()).toBe(ETextFileResult.Success);
        const doc = file.getDocs('NXP::LPC4300', 'device')[0];
        doc.item!.setValue('name', 'updated');
        expect(await file.save()).toBe(ETextFileResult.Success);
        expect(file.errors).toEqual([]);
        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        const saved = reloaded.getDocs('NXP::LPC4300', 'device')[0];
        expect(saved.name).toBe('updated');
        expect(saved.item!.getChild('title')?.getValue('future')).toBe('metadata');
    });
});
