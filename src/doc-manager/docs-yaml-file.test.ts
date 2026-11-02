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
import { pathToFileURL } from 'node:url';
import { ETextFileResult, TextFile } from '@open-cmsis-pack/cmsis-common/text-file';
import { ITextFileSystem } from '@open-cmsis-pack/cmsis-common/text-file-system';
import { DocsYamlFile, getDocParentId } from './docs-yaml-file';

const fileName = '/inventory/docs.yml';
const inventory = [
    'docs:',
    '  devices:',
    '    - device: NXP::LPC4300',
    '      docs:',
    '        - name: datasheet.pdf',
    '  boards:',
    '    - board: Keil::MCB4300',
    '      docs:',
    '        - path: docs/Keil/MCB4300/schematic.pdf',
    '',
].join('\n');

describe('getDocParentId', () => {
    it.each([
        ['Vendor::Device:cm33', 'device', 'Vendor::Device'],
        ['Device:cm33', 'device', 'Device'],
        ['Vendor::Device', 'device', 'Vendor::Device'],
        ['Device', 'device', 'Device'],
        ['', 'device', ''],
        ['Vendor::Board:RevA', 'board', 'Vendor::Board:RevA'],
        ['Vendor::Component:suffix', 'component', 'Vendor::Component:suffix'],
    ])('normalizes %s only for device parents (%s)', (parentId, parentTag, expected) => {
        expect(getDocParentId(parentId, parentTag)).toBe(expected);
    });
});

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
    });

    afterEach(() => {
        TextFile.setFileSystem();
        jest.restoreAllMocks();
    });

    it.each([
        ['board', 'Vendor::Board:RevA', 'https://example.com/manual.pdf?download=1#page=2', undefined, ['Vendor', 'Board', 'manual', 'manual.pdf']],
        ['device', 'Vendor::Device:CPU0', path.resolve('books', 'manual.pdf'), 'user', ['Vendor', 'Device', 'manual', 'manual.pdf']],
        ['board', 'Board', pathToFileURL(path.resolve('books', 'local manual.md')).href, 'user', ['Board', 'local manual', 'local manual.md']],
        ['common', 'arm-docs', 'https://developer.arm.com/documentation/100230/latest', undefined, ['100230-latest', '100230-latest.pdf']],
    ] as const)('uses the index directory for %s destination %s: %s', (tag, parent, name, mode, segments) => {
        const file = new DocsYamlFile(fileName);
        const doc = file.ensureDoc(name, parent, tag);
        doc.mode = mode;
        if (tag === 'common') {
            doc.id = '100230';
            doc.version = 'latest';
            doc.format = 'pdf';
        }
        expect(doc.getDestinationPath()).toBe(path.resolve(path.dirname(fileName), 'docs', ...segments));
        expect(path.dirname(doc.getDestinationPath())).toBe(doc.indexDir);
    });

    it.each(['pdf', 'md'])('uses the imported file extension for a common H document: %s', extension => {
        const name = 'https://developer.arm.com/documentation/100230/latest';
        const doc = new DocsYamlFile(fileName).ensureDoc(name, 'arm-docs', 'common');
        doc.id = '100230';
        doc.version = 'latest';
        doc.format = 'html';
        const destination = path.resolve(path.dirname(fileName), 'docs', '100230-latest', `100230-latest.${extension}`);

        expect(doc.getDestinationPath(path.resolve('source', `selected.${extension}`))).toBe(destination);
        doc.path = destination;
        expect(doc.getDestinationPath()).toBe(destination);
        expect(doc.name).toBe(name);
        expect(doc.locationType).toBe('H');
        expect(doc.format).toBe('html');
    });

    it.each([
        ['../Vendor::Board', 'https://example.com/manual.pdf'],
        ['Vendor::Board.', 'https://example.com/manual.pdf'],
        ['Vendor::Board', 'https://example.com/manual%2Fone.pdf'],
        ['Vendor::Board', 'https://example.com/CON.pdf'],
        ['Vendor::Board', 'https://example.com/manual.html'],
    ])('rejects unsafe or unsupported destinations for %s: %s', (parent, name) => {
        const doc = new DocsYamlFile(fileName).ensureDoc(name, parent, 'board');
        expect(() => doc.getDestinationPath()).toThrow();
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
        doc.path = '/downloaded/manual.pdf';

        expect(doc.isWeb()).toBe(isWeb);
        expect(doc.isWebDoc()).toBe(isWebDoc);
    });

    it('round-trips optional metadata and classifies extensionless PDF URLs without changing other documents', async () => {
        const file = new DocsYamlFile(fileName);
        expect(await file.load()).toBe(ETextFileResult.Success);
        const existing = file.getDocs('NXP::LPC4300', 'device')[0];
        expect([existing.id, existing.version, existing.format]).toEqual([undefined, undefined, undefined]);
        const doc = file.ensureDoc('https://developer.arm.com/documentation/ddi0419/latest', 'arm-docs', 'common');
        expect(doc.locationType).toBe('H');
        doc.id = 'ddi0419';
        doc.version = 'latest';
        doc.format = 'pdf';
        doc.metadataUrl = 'https://documentation-service.arm.com/documentation/ddi0419/latest';
        expect(doc.locationType).toBe('W');
        expect(doc.isWebDoc()).toBe(true);
        expect(doc.indexDir).toBeDefined();
        expect(doc.isDownloaded()).toBe(false);
        doc.path = '/downloaded/manual.pdf';
        expect(doc.isDownloaded()).toBe(true);
        expect(await file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        const saved = reloaded.getDocs('arm-docs', 'common')[0];
        expect([saved.parentId, saved.parentTag]).toEqual(['arm-docs', 'common']);
        expect([saved.id, saved.version, saved.format, saved.path]).toEqual(['ddi0419', 'latest', 'pdf', doc.path]);
        expect(saved.metadataUrl).toBe(doc.metadataUrl);
        saved.name = '/local/manual';
        expect(saved.locationType).toBe('L');
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

                expect(doc.isDownloaded()).toBe(isWebDoc && docPath !== undefined);
            }
        }
    });

    it.each(['board', 'device', 'foo', 'bar', 'component'])('resolves %s index directories identically for W, P and L without I/O', parentTag => {
        const inventoryName = path.resolve('..', 'index-inventory', 'docs.yml');
        const file = new DocsYamlFile(inventoryName);
        jest.replaceProperty(process, 'env', { ...process.env, CMSIS_PACK_ROOT: path.resolve('packs') });
        for (const [name, locationType] of [
            ['https://example.com/reference.manual.pdf?download=1#page=2', 'W'],
            ['${CMSIS_PACK_ROOT}/reference.manual.pdf', 'P'],
            [path.resolve('books', 'reference.manual.pdf'), 'L'],
        ]) {
            const doc = file.ensureDoc(name, 'Vendor::Hardware:suffix', parentTag);
            doc.path = '/downloaded/different.pdf';

            expect(doc.locationType).toBe(locationType);
            expect(doc.indexDir).toBe(path.resolve(path.dirname(inventoryName), 'docs', 'Vendor', 'Hardware', 'reference.manual'));
        }
    });

    it.each([
        ['Name', ['Name']],
        ['::Name', ['Name']],
        ['Vendor::', ['Vendor']],
        ['Vendor:::suffix', ['Vendor']],
        ['', []],
        ['::', []],
        [':suffix', []],
    ] as const)('omits empty vendor/name segments for parent %j', (id, segments) => {
        const inventoryName = path.resolve('..', 'index-inventory', 'docs.yml');
        const file = new DocsYamlFile(inventoryName);
        for (const parentTag of ['board', 'device']) {
            const doc = file.ensureDoc('manual.pdf', id, parentTag);
            expect(doc.indexDir).toBe(path.resolve(path.dirname(inventoryName), 'docs', ...segments, 'manual'));
        }
    });

    it.each([
        ['www.example.com/manual.pdf?query=.html#fragment', 'manual'],
        ['https://example.com/manual%20one.pdf', 'manual%20one'],
        ['https://example.com/manual%2Fone.pdf', 'manual%2Fone'],
        ['file://server/share/manual.pdf', 'manual'],
        [pathToFileURL(path.resolve('books', 'local manual.pdf')).href, 'local manual'],
        ['books/reference.manual.pdf', 'reference.manual'],
        ['manual', 'manual'],
    ])('derives index basename from %s', (name, basename) => {
        const file = new DocsYamlFile(fileName);
        const doc = file.ensureDoc(name, 'Vendor::Board:revision', 'board');
        expect(doc.indexDir).toBe(path.resolve(path.dirname(fileName), 'docs', 'Vendor', 'Board', basename));
    });

    it.each([
        ['https://example.com/manual.html', 'manual', 'selected.pdf'],
        ['https://example.com/manual', 'manual', 'selected.md'],
        ['https://example.com/manual/', 'manual', 'selected.pdf'],
        ['https://example.com/', 'index', 'selected.pdf'],
    ])('provides a managed destination for an imported H reference: %s', (name, basename, localFile) => {
        const file = new DocsYamlFile(fileName);
        const doc = file.ensureDoc(name, 'Vendor::Board', 'board');
        const directory = path.resolve(path.dirname(fileName), 'docs', 'Vendor', 'Board', basename);
        expect(doc.indexDir).toBe(directory);
        expect(() => doc.getDestinationPath()).toThrow('Invalid document filename');
        expect(doc.getDestinationPath(path.resolve('source', localFile))).toBe(path.join(directory, localFile));
        doc.path = doc.getDestinationPath(path.resolve('source', localFile));
        expect(doc.getDestinationPath()).toBe(doc.path);
        expect(doc.name).toBe(name);
        expect(doc.locationType).toBe('H');
        expect(doc.isDownloaded()).toBe(false);
    });

    it('rejects a malformed H reference when resolving its managed directory', () => {
        const doc = new DocsYamlFile(fileName).ensureDoc('https://', 'Vendor::Board', 'board');
        expect(() => doc.indexDir).toThrow();
    });

    it('propagates malformed file URL errors without mutating the inventory', () => {
        const file = new DocsYamlFile(fileName);
        const doc = file.ensureDoc('file:///invalid%2Fmanual.pdf', 'Vendor::Board', 'board');
        expect(() => doc.indexDir).toThrow();
    });

    it.each([
        ['CON::Board.', 'invalid?.pdf', ['CON', 'Board.', 'invalid?']],
        ['Vendor :: Board', 'manual..pdf', ['Vendor ', ' Board', 'manual.']],
        ['', '', []],
    ] as const)('joins index components without additional validation: %j, %j', (id, name, segments) => {
        const file = new DocsYamlFile(fileName);
        const doc = file.ensureDoc(name, id, 'foo');
        expect(doc.indexDir).toBe(path.resolve(path.dirname(fileName), 'docs', ...segments));
    });

    it('recalculates indexes from live parent, document and inventory values and after reload', async () => {
        const file = new DocsYamlFile(fileName);
        expect(await file.load()).toBe(ETextFileResult.Success);
        const parent = file.getDocParent('NXP::LPC4300', 'device')!;
        const doc = parent.docs[0];
        expect(doc.indexDir).toBe(path.resolve(path.dirname(fileName), 'docs', 'NXP', 'LPC4300', 'datasheet'));

        parent.name = 'Other::Renamed:processor';
        doc.name = 'https://example.com/changed.pdf';
        doc.path = '/downloads/different.pdf';
        const expectedPath = path.join('docs', 'Other', 'Renamed', 'changed');
        expect(doc.indexDir).toBe(path.resolve(path.dirname(fileName), expectedPath));
        file.fileName = path.resolve('..', 'other-inventory', 'docs.yml');
        expect(doc.indexDir).toBe(path.resolve(path.dirname(file.fileName), expectedPath));
        doc.name = undefined;
        expect(doc.indexDir).toBe(path.resolve(path.dirname(file.fileName), 'docs', 'Other', 'Renamed', 'different'));
        expect(await file.save()).toBe(ETextFileResult.Success);
        expect(files.get(file.fileName)).not.toContain('indexDir:');

        const reloaded = new DocsYamlFile(file.fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        const saved = reloaded.getDocs(parent.id, 'device')[0];
        expect(saved.indexDir).toBe(doc.indexDir);
        saved.path = 'next.pdf';
        expect(saved.indexDir).toBe(path.resolve(path.dirname(file.fileName), 'docs', 'Other', 'Renamed', 'next'));
    });

    it('persists user mode and removes it when cleared with undefined', async () => {
        const file = new DocsYamlFile(fileName);
        const doc = file.ensureDoc('manual.pdf', 'Vendor::Board', 'board');

        expect(doc.mode).toBeUndefined();
        doc.mode = 'user';
        expect(doc.mode).toBe('user');
        expect(await file.save()).toBe(ETextFileResult.Success);
        expect(files.get(fileName)).toContain('mode: user');

        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        const saved = reloaded.getDoc(doc.name, 'Vendor::Board', 'board')!;
        expect(saved.mode).toBe('user');
        saved.mode = undefined;
        expect(saved.mode).toBeUndefined();
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
        expect(doc.locationType).toBe(locationType);
        doc.path = '/downloaded/manual.pdf';
        expect(doc.error).toBeUndefined();
        doc.error = 'Retry failed';
        expect(doc.path).toBe('/downloaded/manual.pdf');
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
        expect(saved.path).toBe('/downloaded/manual.pdf');
        saved.error = undefined;
        expect(saved.path).toBe('/downloaded/manual.pdf');
        saved.name = 'https://example.com/changed.html';
        expect(saved.locationType).toBe('H');
        expect(saved.isDownloaded()).toBe(false);
        expect(saved.error).toBeUndefined();
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

        expect(doc.locationType).toBe('P');
        process.env.CMSIS_PACK_ROOT = path.resolve('other-packs');
        expect(doc.locationType).toBe('L');
    });

    it('searches all parent types for the requested id when the tag is omitted', () => {
        const file = new DocsYamlFile(fileName);
        const device = file.ensureDoc('device-guide', 'Vendor::Shared', 'device');
        device.path = 'device.pdf';
        file.ensureDoc('other-guide', 'Vendor::Other', 'component');

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
    });

    it('finds all exact document names across the collection or a specified parent type', () => {
        const file = new DocsYamlFile(fileName);
        expect(file.findDocs('manual')).toEqual([]);

        const board = file.ensureDoc('manual', 'Vendor::Board', 'board');
        const duplicate = file.ensureDoc('duplicate', 'Vendor::Board', 'board');
        duplicate.name = 'manual';
        file.ensureDoc('other', 'Vendor::Component', 'component').path = 'manual';

        expect(file.findDocs('manual', 'component')).toEqual([]);
        expect(file.findDocs('manual', 'missing')).toEqual([]);
        expect(file.findDocs('Manual')).toEqual([]);
        expect(file.findDocs('missing')).toEqual([]);
        file.findDocs('manual')[0].title = 'Manual';
        expect(board.title).toBe('Manual');
    });

    it.each([
        'Vendor::Pack@1.0.0',
        'vendor::pack@1.0.0',
        'Vendor::Pack@1.0.0+build.1',
    ])('preserves equivalent pack %s and updates changed packs without replacing user documents', equivalentPackId => {
        const file = new DocsYamlFile(fileName);
        file.ensureParent('Vendor::Component', 'component', 'Vendor::Pack@1.0.0');
        const parent = file.getDocParent('Vendor::Component', 'component')!;
        const manual = parent.ensureDoc('manual.pdf');
        manual.mode = 'user';

        expect(parent.packId).toBe('Vendor::Pack@1.0.0');
        parent.packId = equivalentPackId;
        expect(parent.packId).toBe('Vendor::Pack@1.0.0');
        parent.packId = 'Vendor::Pack@2.0.0';
        expect(parent.packId).toBe('Vendor::Pack@2.0.0');
        for (const ignoredPackId of [undefined, '', 'Vendor::Pack@1.0.0']) {
            parent.packId = ignoredPackId;
            expect(parent.packId).toBe('Vendor::Pack@2.0.0');
        }
    });

    it('creates both parents and removes only the requested document', async () => {
        const file = new DocsYamlFile('/new/docs.yml');
        expect(file.getDocParents()).toEqual([]);
        expect(file.getDocs('NXP::LPC4300', 'device')).toEqual([]);
        expect(file.removeDoc('manual', 'NXP::LPC4300', 'device')).toBe(false);

        const device = file.ensureDoc('manual', 'NXP::LPC4300', 'device');
        expect(device.name).toBe('manual');
        expect(device.path).toBeUndefined();
        device.path = 'manual.pdf';
        device.title = 'Manual';
        device.category = 'reference';
        const parent = file.getDocParent('NXP::LPC4300', 'device')!;
        expect(parent.docs[0].title).toBe('Manual');
        const second = parent.ensureDoc('second.pdf');
        expect(file.getDocParent('nxp::LPC4300', 'device')).toBeUndefined();

        expect(parent.removeDoc('manual.pdf')).toBe(false);
        expect(file.removeDoc('manual.pdf', 'NXP::LPC4300', 'device')).toBe(false);
        expect(parent.removeDoc('manual')).toBe(true);
        expect(parent.removeDoc('manual')).toBe(false);
        expect(parent.removeDoc(second.name)).toBe(true);
        expect(parent.docs).toEqual([]);
        expect(await file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocsYamlFile(file.fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.getDocParent('NXP::LPC4300', 'device')?.docs).toEqual([]);
    });

    it('creates, enumerates and round-trips references for arbitrary parents', async () => {
        const file = new DocsYamlFile(fileName);
        const parentTag: string = 'component';
        const reference = file.ensureDoc('manual', 'Vendor::Component', parentTag);
        reference.path = 'manual.pdf';
        reference.title = 'Component manual';
        const docParent = file.getDocParent('Vendor::Component', parentTag)!;
        expect(docParent.tag).toBe(parentTag);
        expect(docParent.id).toBe('Vendor::Component');
        expect(docParent.name).toBe('Vendor::Component');
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

        parent.name = 'NXP::Renamed';
        expect(parent.id).toBe('NXP::Renamed');
        expect(parent.tag).toBe('device');
        expect(await file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocsYamlFile(fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.getDocParent('NXP::Renamed', 'device')?.name).toBe('NXP::Renamed');
        expect(reloaded.getDocs('NXP::Renamed', 'device')[0].name).toBe(doc.name);
    });

    it('computes titles and locator keys from current nodes without cached field values', async () => {
        const file = new DocsYamlFile(fileName);
        await file.load();
        const parent = file.getDocParent('NXP::LPC4300', 'device')!;
        const doc = parent.docs[0];
        doc.path = 'local.pdf';
        expect(parent.getDoc('local.pdf')).toBeUndefined();
        expect(parent.getDocByPath('datasheet.pdf')).toBeUndefined();
        doc.title = 'Explicit';
        expect(doc.title).toBe('Explicit');
        doc.title = '';
        expect(doc.title).toBe(doc.name);
        doc.title = undefined;

        doc.name = 'new.pdf';
        expect(parent.getDoc('datasheet.pdf')).toBeUndefined();
        expect(parent.getDoc('NEW.PDF')).toBeUndefined();
        doc.name = undefined;
        expect(doc.name).toBe('');
        expect(parent.getDoc('new.pdf')).toBeUndefined();
        expect(doc.title).toBe('local.pdf');
        doc.path = 'new-local.pdf';
        expect(parent.getDocByPath('local.pdf')).toBeUndefined();
        expect(parent.getDocByPath('NEW-LOCAL.PDF')).toBeUndefined();
        doc.path = undefined;
        expect(parent.getDocByPath('new-local.pdf')).toBeUndefined();
        expect(doc.title).toBe('');
    });

    it('assigns and removes locations without checking document identities', async () => {
        const file = new DocsYamlFile(fileName);
        const first = file.ensureDoc('first.pdf', 'Keil::MCB4300', 'board');
        const second = file.ensureDoc('second.pdf', 'Keil::MCB4300', 'board');
        first.path = 'local.pdf';

        second.name = first.name;
        expect(second.name).toBe(first.name);
        second.name = undefined;
        expect(second.name).toBe('');
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
        }
    });
});
