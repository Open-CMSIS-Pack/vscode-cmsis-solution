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
import { CTreeItemYamlFile } from '@open-cmsis-pack/cmsis-common/tree-item-file';
import { DocManager } from './doc-manager';
import { DocsYamlFile } from './docs-yaml-file';
import { textFileSystemFactory } from '../__test__/text-file-system';

describe('DocManager', () => {
    const docsDirectory = path.resolve('inventory');
    const fileName = path.join(docsDirectory, 'docs.yml');
    let files: Map<string, string>;
    let fileSystem: jest.Mocked<ITextFileSystem>;

    const createManager = (directory = docsDirectory): DocManager => {
        const manager = new DocManager();
        manager.file.fileName = path.join(directory, 'docs.yml');
        return manager;
    };

    beforeEach(() => {
        files = new Map([[fileName,
            'docs: {boards: [{board: Vendor::Board, docs: [{name: manual, path: manual.pdf}]}]}\n',
        ]]);
        fileSystem = textFileSystemFactory(files);
        TextFile.setFileSystem(fileSystem);
        TextFile.setErrorReporter(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        TextFile.setFileSystem();
        TextFile.setErrorReporter();
        jest.restoreAllMocks();
    });

    it('owns an unnamed file without performing I/O on construction', () => {
        const manager = new DocManager();
        expect(manager.file).toBeInstanceOf(DocsYamlFile);
        expect(manager.file.fileName).toBe('');
        expect(manager.file.fileDir).toBe('');
        expect(manager.file.rootItem).toBeUndefined();
        expect(fileSystem.exists).not.toHaveBeenCalled();
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    it('loads the existing inventory without writing and exposes it for direct editing and saving', async () => {
        const manager = new DocManager();
        const file = manager.file;
        const originalText = files.get(fileName);
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        expect(manager.file).toBe(file);
        expect(file.fileName).toBe(fileName);
        expect(file.fileDir).toBe(docsDirectory);
        expect(file.getDoc('manual', 'Vendor::Board', 'board')?.path).toBe('manual.pdf');
        expect(file.errors).toEqual([]);
        expect(fileSystem.read).toHaveBeenCalledWith(fileName);
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(files.get(fileName)).toBe(originalText);

        file.getDocs('Vendor::Board', 'board')[0].title = 'Manual';
        expect(await file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocManager();
        expect(await reloaded.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        expect(reloaded.file.getDoc('manual', 'Vendor::Board', 'board')?.title).toBe('Manual');
        expect(fileSystem.write).toHaveBeenCalledTimes(1);
    });

    it('addCbuildBooks saves appended books without changing stored docs or rewriting unchanged content', async () => {
        const manager = new DocManager();
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        const save = jest.spyOn(manager.file, 'save');
        const parentItem = manager.file.getDocParent('Vendor::Board', 'board')!.item!;
        parentItem.setValue('future', 'preserved');
        const existing = manager.file.getDoc('manual', 'Vendor::Board', 'board')!;
        existing.title = 'Stored manual';
        existing.category = 'stored';
        existing.item!.setValue('future', 'preserved');
        const existingText = manager.file.stringify();
        const cbuildFile = new CTreeItemYamlFile(path.resolve('build', 'example.cbuild.yml'));
        cbuildFile.text = [
            'build:',
            '  board: Vendor::Board',
            '  device: Vendor::Device',
            '  board-books:',
            '    - title: New title',
            '      name: manual',
            '      category: new',
            '    - title: Local guide',
            '      name: guide.pdf',
            '      category: reference',
            '    - name: https://example.com/guide.pdf',
            '    - name: guide.pdf',
            '      title: Duplicate guide',
            '  device-books:',
            '    - name: device.pdf',
        ].join('\n');
        cbuildFile.rootItem = cbuildFile.parse();
        const cbuild = cbuildFile.topItem!;
        const sourceText = cbuildFile.stringify();
        jest.clearAllMocks();

        await manager.addCbuildBooks(cbuild, 'board');
        const docs = manager.file.getDocs('Vendor::Board', 'board');
        expect(manager.file.getDocParent('Vendor::Device', 'device')).toBeUndefined();
        expect(docs.map(doc => doc.name)).toEqual(['manual', path.resolve('build', 'guide.pdf'), 'https://example.com/guide.pdf']);
        expect(docs[0].item).toBe(existing.item);
        expect(docs[0].title).toBe('Stored manual');
        expect(docs[0].category).toBe('stored');
        expect(docs[0].path).toBe('manual.pdf');
        expect(docs[0].locationType).toBe('L');
        expect(docs[0].item!.getValue('future')).toBe('preserved');
        expect(manager.file.getDocParent('Vendor::Board', 'board')!.item).toBe(parentItem);
        expect(parentItem.getValue('future')).toBe('preserved');
        expect(docs[1].title).toBe('Local guide');
        expect(docs[1].category).toBe('reference');
        expect(docs[1].path).toBe(path.resolve('build', 'guide.pdf'));
        expect(docs[1].locationType).toBe('L');
        expect(docs[2].title).toBe('https://example.com/guide.pdf');
        expect(docs[2].path).toBeUndefined();
        expect(docs[2].locationType).toBe('W');
        expect(docs[2].item!.getChild('title')).toBeUndefined();
        const importedText = manager.file.stringify();
        expect(importedText).not.toBe(existingText);

        await manager.addCbuildBooks(cbuild, 'board');
        expect(cbuildFile.stringify()).toBe(sourceText);
        cbuild.removeChild(cbuild.getChild('board-books'));
        await manager.addCbuildBooks(cbuild, 'board');
        expect(manager.file.stringify()).toBe(importedText);
        expect(manager.file.getDocs('Vendor::Board', 'board').map(doc => doc.item)).toEqual(docs.map(doc => doc.item));
        expect(save).toHaveBeenCalledTimes(3);
        expect(files.get(fileName)).toBe(importedText);
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).toHaveBeenCalledTimes(1);
        expect(fileSystem.unlink).not.toHaveBeenCalled();
    });

    it.each([
        ['missing board', ['  board-books:', '    - name: manual.pdf']],
        ['empty board', ['  board: ""', '  board-books:', '    - name: manual.pdf']],
    ])('addCbuildBooks ignores %s without creating an empty board or performing I/O', async (_description, lines) => {
        const manager = createManager();
        const cbuildFile = new CTreeItemYamlFile();
        cbuildFile.text = ['build:', ...lines].join('\n');
        cbuildFile.rootItem = cbuildFile.parse();

        await manager.addCbuildBooks(cbuildFile.topItem!, 'board');

        expect(manager.file.rootItem).toBeUndefined();
        expect(fileSystem.exists).not.toHaveBeenCalled();
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(fileSystem.unlink).not.toHaveBeenCalled();
    });

    it.each([
        ['missing books', ['  device-books:', '    - name: device.pdf']],
        ['empty books', ['  board-books: []']],
        ['missing names', ['  board-books:', '    - title: Manual', '    - name: ""']],
    ])('addCbuildBooks saves the parent with %s without adding documents', async (_description, lines) => {
        const manager = createManager();
        const cbuildFile = new CTreeItemYamlFile();
        cbuildFile.text = ['build:', '  board: Vendor::Board', ...lines].join('\n');
        cbuildFile.rootItem = cbuildFile.parse();

        await manager.addCbuildBooks(cbuildFile.topItem!, 'board');

        expect(manager.file.getDocParent('Vendor::Board', 'board')?.id).toBe('Vendor::Board');
        expect(manager.file.getDocs('Vendor::Board', 'board')).toEqual([]);
        expect(manager.file.getDocParents('device')).toEqual([]);
        expect(files.get(fileName)).toBe(manager.file.stringify());
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).toHaveBeenCalledTimes(1);
        expect(fileSystem.unlink).not.toHaveBeenCalled();
    });

    it.each(['board', 'device'])('addCbuildBooks updates %s metadata and clones the processor only for devices', async parentTag => {
        const manager = createManager();
        const cbuildFile = new CTreeItemYamlFile(path.resolve('build', 'example.cbuild.yml'));
        cbuildFile.text = [
            'build:',
            '  board: Vendor::Board',
            '  device: Vendor::Device',
            '  board-pack: Vendor::BoardPack@1.0.0',
            '  device-pack: Vendor::DevicePack@2.0.0',
            '  processor:',
            '    # Keep processor attributes.',
            '    core: Cortex-M33',
            '    future:',
            '      value: preserved',
        ].join('\n');
        cbuildFile.rootItem = cbuildFile.parse();
        const cbuild = cbuildFile.topItem!;
        const sourceProcessor = cbuild.getChildItem('processor')!;
        const sourceText = cbuildFile.stringify();
        const parentId = cbuild.getValue(parentTag)!;

        await manager.addCbuildBooks(cbuild, parentTag);

        const parent = manager.file.getDocParent(parentId, parentTag)!.item!;
        parent.setValue('future', 'preserved');
        expect(parent.getValue('pack')).toBe(cbuild.getValue(`${parentTag}-pack`));
        const processor = parent.getChild('processor');
        if (parentTag === 'device') {
            expect(processor).not.toBe(sourceProcessor);
            expect(processor?.getParent()).toBe(parent);
            expect(processor?.toObject()).toEqual(sourceProcessor.toObject());
            expect(processor?.getChild('future')).not.toBe(sourceProcessor.getChild('future'));
        } else {
            expect(processor).toBeUndefined();
        }
        expect(manager.file.getDocs(parentId, parentTag)).toEqual([]);
        expect(manager.file.getDocParents()).toHaveLength(1);
        const importedText = manager.file.stringify();

        await manager.addCbuildBooks(cbuild, parentTag);
        expect(manager.file.stringify()).toBe(importedText);
        expect(cbuildFile.stringify()).toBe(sourceText);
        cbuild.setValue(`${parentTag}-pack`, 'Vendor::UpdatedPack@3.0.0');
        sourceProcessor.setValue('core', 'Cortex-M55');
        expect(processor?.getValue('core')).toBe(parentTag === 'device' ? 'Cortex-M33' : undefined);
        await manager.addCbuildBooks(cbuild, parentTag);
        expect(manager.file.getDocParent(parentId, parentTag)!.item).toBe(parent);
        expect(parent.getValue('pack')).toBe('Vendor::UpdatedPack@3.0.0');
        expect(parent.getChildren().filter(child => child.getTag() === 'processor')).toHaveLength(parentTag === 'device' ? 1 : 0);
        expect(parent.getChild('processor')).toBe(processor);
        expect(processor?.getValue('core')).toBe(parentTag === 'device' ? 'Cortex-M33' : undefined);
        expect(parent.getValue('future')).toBe('preserved');
        expect(files.get(fileName)).toBe(manager.file.stringify());
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).toHaveBeenCalledTimes(3);
        expect(fileSystem.unlink).not.toHaveBeenCalled();

        const reloaded = new DocManager();
        expect(await reloaded.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        const savedParent = reloaded.file.getDocParent(parentId, parentTag)!.item!;
        expect(savedParent.toObject()).toEqual(parent.toObject());
        expect(files.get(fileName)?.includes('# Keep processor attributes.')).toBe(parentTag === 'device');
        cbuild.setValue(`${parentTag}-pack`, undefined);
        await manager.addCbuildBooks(cbuild, parentTag);
        expect(parent.getValue('pack')).toBe('Vendor::UpdatedPack@3.0.0');
        expect(files.get(fileName)).toBe(manager.file.stringify());
    });

    describe.each(['board', 'device'])('addCbuildBooks %s pack changes', parentTag => {
        it.each([
            ['unchanged pack', 'Vendor::Pack@1.0.0', 'Vendor::Pack@1.0.0', true],
            ['both packs missing', undefined, undefined, true],
            ['changed pack', 'Vendor::Pack@1.0.0', 'Vendor::Pack@2.0.0', true],
            ['new pack', undefined, 'Vendor::Pack@2.0.0', true],
            ['missing pack update', 'Vendor::Pack@1.0.0', undefined, true],
            ['changed pack without books', 'Vendor::Pack@1.0.0', 'Vendor::Pack@2.0.0', false],
        ])('preserves user entries and clears imported entries only for %s', async (_description, currentPack, packId, includeBooks) => {
            const manager = createManager();
            const parentId = 'Vendor::Hardware';
            const parent = manager.file.ensureParent(parentId, parentTag);
            parent.setValue('pack', currentPack);
            parent.setValue('future', 'preserved');
            const manual = manager.file.ensureDoc('https://example.com/manual.pdf', parentId, parentTag);
            manual.mode = 'user';
            manual.title = 'User title';
            manual.path = path.resolve('downloaded', 'manual.pdf');
            manual.error = 'Stored error';
            const manualText = manual.item!.toObject();
            const stale = manager.file.ensureDoc('https://example.com/stale.pdf', parentId, parentTag);
            const shared = manager.file.ensureDoc('https://example.com/shared.pdf', parentId, parentTag);
            shared.title = 'Old pack title';
            const otherTag = parentTag === 'board' ? 'device' : 'board';
            const otherType = manager.file.ensureDoc(stale.name, parentId, otherTag);
            const otherParent = manager.file.ensureDoc(stale.name, 'Vendor::Other', parentTag);
            const cbuildFile = new CTreeItemYamlFile();
            cbuildFile.text = [
                'build:',
                `  ${parentTag}: ${parentId}`,
                ...(includeBooks ? [
                    `  ${parentTag}-books:`,
                    '    - name: https://example.com/manual.pdf',
                    '      title: Pack manual',
                    '    - name: https://example.com/shared.pdf',
                    '      title: New pack title',
                    '    - name: https://example.com/new.pdf',
                ] : []),
            ].join('\n');
            cbuildFile.rootItem = cbuildFile.parse();
            const cbuild = cbuildFile.topItem!;
            cbuild.setValue(`${parentTag}-pack`, packId);
            const expectedPack = packId ?? currentPack;
            const packChanged = currentPack !== expectedPack;

            await manager.addCbuildBooks(cbuild, parentTag);

            expect(manager.file.getDocParent(parentId, parentTag)!.item).toBe(parent);
            expect(parent.getValue('pack')).toBe(expectedPack);
            expect(parent.getValue('future')).toBe('preserved');
            expect(manager.file.getDoc(manual.name, parentId, parentTag)!.item).toBe(manual.item);
            expect(manual.item!.toObject()).toEqual(manualText);
            const savedStale = manager.file.getDoc(stale.name, parentId, parentTag);
            expect(savedStale?.item).toBe(packChanged ? undefined : stale.item);
            if (includeBooks) {
                const savedShared = manager.file.getDoc(shared.name, parentId, parentTag)!;
                expect(savedShared.title).toBe(packChanged ? 'New pack title' : 'Old pack title');
                expect(savedShared.mode).toBeUndefined();
                if (packChanged) {
                    expect(savedShared.item).not.toBe(shared.item);
                } else {
                    expect(savedShared.item).toBe(shared.item);
                }
                expect(manager.file.getDoc('https://example.com/new.pdf', parentId, parentTag)).toBeDefined();
            } else {
                expect(manager.file.getDocs(parentId, parentTag).map(doc => doc.item)).toEqual([manual.item]);
            }
            expect(manager.file.getDoc(stale.name, parentId, otherTag)!.item).toBe(otherType.item);
            expect(manager.file.getDoc(stale.name, 'Vendor::Other', parentTag)!.item).toBe(otherParent.item);
            expect(files.get(fileName)).toBe(manager.file.stringify());
            const importedText = manager.file.stringify();
            await manager.addCbuildBooks(cbuild, parentTag);
            expect(manager.file.stringify()).toBe(importedText);
            expect(fileSystem.write).toHaveBeenCalledTimes(1);

            const reloaded = new DocManager();
            expect(await reloaded.initialize(docsDirectory)).toBe(ETextFileResult.Success);
            expect(reloaded.file.getDoc(manual.name, parentId, parentTag)?.mode).toBe('user');
            expect(reloaded.file.getDoc(stale.name, parentId, parentTag)?.name).toBe(packChanged ? undefined : stale.name);
            expect(reloaded.file.getDocParent(parentId, parentTag)?.item!.getValue('pack')).toBe(expectedPack);
        });
    });

    it('addCbuildBooks imports only the selected device collection', async () => {
        const manager = createManager();
        const cbuildFile = new CTreeItemYamlFile(path.resolve('build', 'example.cbuild.yml'));
        cbuildFile.text = [
            'build:',
            '  board: Vendor::Board',
            '  device: Vendor::Device',
            '  board-books:',
            '    - name: board.pdf',
            '  device-books:',
            '    - name: device.pdf',
            '      title: Device manual',
        ].join('\n');
        cbuildFile.rootItem = cbuildFile.parse();

        await manager.addCbuildBooks(cbuildFile.topItem!, 'device');

        const docs = manager.file.getDocs('Vendor::Device', 'device');
        expect(docs.map(doc => doc.name)).toEqual([path.resolve('build', 'device.pdf')]);
        expect(docs[0].title).toBe('Device manual');
        expect(manager.file.getDocParents('board')).toEqual([]);
    });

    it.each([
        ['both parents', ['board', 'device']],
        ['board only', ['board']],
        ['device only', ['device']],
    ])('addCbuildBooks imports independent collections with %s', async (_description, parentTags) => {
        const manager = createManager();
        const cbuildFile = new CTreeItemYamlFile(path.resolve('build', 'example.cbuild.yml'));
        cbuildFile.text = [
            'build:',
            ...parentTags.map(parentTag => `  ${parentTag}: Vendor::Hardware`),
            '  board-books:',
            '    - name: manual.pdf',
            '      title: Board manual',
            '  device-books:',
            '    - name: manual.pdf',
            '      title: Device manual',
        ].join('\n');
        cbuildFile.rootItem = cbuildFile.parse();
        const sourceText = cbuildFile.stringify();
        const docName = path.resolve('build', 'manual.pdf');

        await manager.addCbuildBooks(cbuildFile.topItem!, 'board');
        await manager.addCbuildBooks(cbuildFile.topItem!, 'device');

        for (const parentTag of ['board', 'device']) {
            const docs = manager.file.getDocs('Vendor::Hardware', parentTag);
            if (parentTags.includes(parentTag)) {
                expect(docs.map(doc => doc.name)).toEqual([docName]);
                expect(docs[0].title).toBe(parentTag === 'board' ? 'Board manual' : 'Device manual');
            } else {
                expect(manager.file.getDocParents(parentTag)).toEqual([]);
            }
        }
        const importedText = manager.file.stringify();
        await manager.addCbuildBooks(cbuildFile.topItem!, 'board');
        await manager.addCbuildBooks(cbuildFile.topItem!, 'device');
        expect(manager.file.stringify()).toBe(importedText);
        expect(cbuildFile.stringify()).toBe(sourceText);
        expect(files.get(fileName)).toBe(importedText);
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).toHaveBeenCalledTimes(parentTags.length);
        expect(fileSystem.unlink).not.toHaveBeenCalled();
    });

    describe.each(['cbuild', 'user'])('independent DocManager instances adding %s books', source => {
        it.each([
            { description: 'identical books', firstBooks: ['shared.pdf'], secondBooks: ['shared.pdf'], expectedBooks: ['shared.pdf'] },
            { description: 'different books', firstBooks: ['first.pdf'], secondBooks: ['second.pdf'], expectedBooks: ['first.pdf', 'second.pdf'] },
            {
                description: 'overlapping books',
                firstBooks: ['first.pdf', 'shared.pdf'],
                secondBooks: ['shared.pdf', 'second.pdf'],
                expectedBooks: ['first.pdf', 'shared.pdf', 'second.pdf'],
            },
        ])('persist a duplicate-free union of $description', async ({ firstBooks, secondBooks, expectedBooks }) => {
            const firstManager = new DocManager();
            const secondManager = new DocManager();
            expect(await firstManager.initialize(docsDirectory)).toBe(ETextFileResult.Success);
            expect(await secondManager.initialize(docsDirectory)).toBe(ETextFileResult.Success);
            expect(firstManager.file).not.toBe(secondManager.file);
            expect(firstManager.file.rootItem).not.toBe(secondManager.file.rootItem);
            const addBooks = async (manager: DocManager, books: string[]) => {
                if (source === 'cbuild') {
                    const cbuildFile = new CTreeItemYamlFile();
                    cbuildFile.text = [
                        'build:',
                        '  board: Vendor::Board',
                        '  board-books:',
                        ...books.map(name => `    - name: https://example.com/${name}`),
                    ].join('\n');
                    cbuildFile.rootItem = cbuildFile.parse();
                    await manager.addCbuildBooks(cbuildFile.topItem!, 'board');
                } else {
                    for (const name of books) {
                        expect(await manager.addUserBook('Vendor::Board', 'board', `https://example.com/${name}`, name)).toBeDefined();
                    }
                }
            };

            await addBooks(firstManager, firstBooks);
            expect(secondManager.file.getDocs('Vendor::Board', 'board').map(doc => doc.name)).toEqual(['manual']);
            await addBooks(secondManager, secondBooks);
            await addBooks(firstManager, firstBooks);
            await addBooks(secondManager, secondBooks);

            const reloaded = new DocManager();
            expect(await reloaded.initialize(docsDirectory)).toBe(ETextFileResult.Success);
            expect(reloaded.file.getDocParents('board')).toHaveLength(1);
            expect(reloaded.file.getDocs('Vendor::Board', 'board').map(doc => doc.name).sort())
                .toEqual(['manual', ...expectedBooks.map(name => `https://example.com/${name}`)].sort());
            expect(reloaded.file.getDoc('manual', 'Vendor::Board', 'board')?.path).toBe('manual.pdf');
            expect(fileSystem.unlink).not.toHaveBeenCalled();
        });
    });

    it.each([
        ['relative path', '../manual.pdf', path.resolve('manual.pdf'), true, 'L'],
        ['absolute path', path.resolve('books', 'manual.pdf'), path.resolve('books', 'manual.pdf'), false, 'L'],
        ['pack path', '${CMSIS_PACK_ROOT}/Vendor/Pack/manual.pdf', path.resolve('packs', 'Vendor', 'Pack', 'manual.pdf'), false, 'P'],
        ['expanded pack path', path.resolve('packs', 'Vendor', 'manual.pdf'), path.resolve('packs', 'Vendor', 'manual.pdf'), false, 'P'],
        ['relative pack path', '../packs/Vendor/manual.pdf', path.resolve('packs', 'Vendor', 'manual.pdf'), true, 'P'],
        ['pack file URL', pathToFileURL(path.resolve('packs', 'manual.pdf')).href, path.resolve('packs', 'manual.pdf'), false, 'P'],
        ['pack root sibling', path.resolve('packs-other', 'manual.pdf'), path.resolve('packs-other', 'manual.pdf'), false, 'L'],
        ['pack root parent', path.resolve('packs', '..'), path.resolve('packs', '..'), false, 'L'],
        ['pack root traversal', path.resolve('packs', '..', 'manual.pdf'), path.resolve('manual.pdf'), false, 'L'],
        ['dot-prefixed pack child', path.resolve('packs', '..manual.pdf'), path.resolve('packs', '..manual.pdf'), false, 'P'],
        ['compiler path', '${CMSIS_COMPILER_ROOT}/manual.pdf', path.resolve('compilers', 'manual.pdf'), false, 'L'],
        ['file URL', pathToFileURL(path.resolve('books', 'encoded manual.pdf')).href, path.resolve('books', 'encoded manual.pdf'), false, 'L'],
        ['localhost file URL', `file://localhost${pathToFileURL(path.resolve('books', 'encoded manual.pdf')).pathname}`, path.resolve('books', 'encoded manual.pdf'), false, 'L'],
        ['remote file URL', 'file://server/share/encoded%20manual.pdf', undefined, true, 'W'],
        ['remote file hyperlink', 'file://server/share/manual.HTM', undefined, true, 'H'],
        ['HTTP URL', 'http://example.com/manual.pdf', undefined, true, 'W'],
        ['HTTPS URL', 'https://example.com/manual.pdf', undefined, true, 'W'],
        ['www address', 'www.example.com/manual.pdf', undefined, true, 'W'],
        ['HTML URL', 'https://example.com/manual.HTML?download=.pdf', undefined, true, 'H'],
        ['HTM URL', 'https://example.com/manual.htm#manual.pdf', undefined, true, 'H'],
        ['extensionless URL', 'https://example.com/manual?file=manual.pdf', undefined, true, 'H'],
        ['document URL with query', 'https://example.com/manual.PDF?format=html#manual.htm', undefined, true, 'W'],
        ['malformed web URL', 'https://', undefined, true, 'H'],
        ['other URI', 'custom:manual', path.resolve('build', 'custom:manual'), true, 'L'],
        ['relative path without source metadata', 'manual.pdf', path.resolve('manual.pdf'), false, 'L'],
    ])('addCbuildBooks normalizes and classifies %s and sets the matching path only for files', async (_description, name, expectedPath, hasSource, locationType) => {
        jest.replaceProperty(process, 'env', {
            ...process.env,
            CMSIS_PACK_ROOT: path.resolve('packs'),
            CMSIS_COMPILER_ROOT: path.resolve('compilers'),
        });
        const manager = createManager();
        const cbuildFile = new CTreeItemYamlFile(hasSource ? path.resolve('build', 'example.cbuild.yml') : '');
        cbuildFile.text = 'build: {board: Vendor::Board, board-books: [{title: Manual, category: reference}]}\n';
        cbuildFile.rootItem = cbuildFile.parse();
        cbuildFile.topItem!.getGrandChildren('board-books')[0].setValue('name', name);
        const sourceText = cbuildFile.stringify();

        await manager.addCbuildBooks(cbuildFile.topItem!, 'board');

        const doc = manager.file.getDocs('Vendor::Board', 'board')[0];
        expect(doc.name).toBe(expectedPath ?? name);
        expect(doc.title).toBe('Manual');
        expect(doc.category).toBe('reference');
        expect(doc.path).toBe(expectedPath);
        expect(doc.locationType).toBe(locationType);
        expect(doc.item!.getChild('locationType')).toBeUndefined();
        expect(files.get(fileName)).not.toContain('locationType:');
        expect(doc.mode).toBeUndefined();
        expect(doc.item!.getChild('mode')).toBeUndefined();
        expect(cbuildFile.stringify()).toBe(sourceText);
        expect(files.get(fileName)).toBe(manager.file.stringify());
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).toHaveBeenCalledTimes(1);
        expect(fileSystem.unlink).not.toHaveBeenCalled();
    });

    it.each([false, true])('addCbuildBooks reuses normalized file aliases with an existing reference: %s', async hasExisting => {
        const manager = createManager();
        const docName = path.resolve('build', 'guide.pdf');
        const existing = hasExisting ? manager.file.ensureDoc(docName, 'Vendor::Board', 'board') : undefined;
        if (existing) {
            existing.title = 'Stored title';
            existing.category = 'stored';
            existing.item!.setValue('future', 'preserved');
        }
        const cbuildFile = new CTreeItemYamlFile(path.resolve('build', 'example.cbuild.yml'));
        cbuildFile.text = [
            'build:',
            '  board: Vendor::Board',
            '  board-books:',
            '    - name: guide.pdf',
            '      title: First title',
            '      category: reference',
            '    - title: Absolute alias',
            '    - title: File URL alias',
        ].join('\n');
        cbuildFile.rootItem = cbuildFile.parse();
        const books = cbuildFile.topItem!.getGrandChildren('board-books');
        books[1].setValue('name', docName);
        books[2].setValue('name', pathToFileURL(docName).href);
        const sourceText = cbuildFile.stringify();

        await manager.addCbuildBooks(cbuildFile.topItem!, 'board');

        const docs = manager.file.getDocs('Vendor::Board', 'board');
        expect(docs).toHaveLength(1);
        expect(docs[0].name).toBe(docName);
        expect(docs[0].title).toBe(hasExisting ? 'Stored title' : 'First title');
        expect(docs[0].category).toBe(hasExisting ? 'stored' : 'reference');
        expect(docs[0].path).toBe(hasExisting ? undefined : docName);
        expect(docs[0].locationType).toBe('L');
        if (existing) {
            expect(docs[0].item).toBe(existing.item);
            expect(docs[0].item!.getValue('future')).toBe('preserved');
        }
        const importedText = manager.file.stringify();
        await manager.addCbuildBooks(cbuildFile.topItem!, 'board');
        expect(manager.file.stringify()).toBe(importedText);
        expect(manager.file.getDocs('Vendor::Board', 'board')[0].item).toBe(docs[0].item);
        expect(cbuildFile.stringify()).toBe(sourceText);
        expect(files.get(fileName)).toBe(importedText);
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).toHaveBeenCalledTimes(1);
        expect(fileSystem.unlink).not.toHaveBeenCalled();
    });

    it.each([
        ['manual.pdf', path.resolve('manual.pdf'), false, false, 'L'],
        ['${CMSIS_PACK_ROOT}/manual.pdf', path.resolve('packs', 'manual.pdf'), false, false, 'P'],
        [path.resolve('packs', 'manual.pdf'), path.resolve('packs', 'manual.pdf'), false, false, 'P'],
        [path.join('packs', 'manual.pdf'), path.resolve('packs', 'manual.pdf'), false, false, 'P'],
        [pathToFileURL(path.resolve('packs', 'manual.pdf')).href, path.resolve('packs', 'manual.pdf'), false, false, 'P'],
        [`file://localhost${pathToFileURL(path.resolve('packs', 'manual.pdf')).pathname}`, path.resolve('packs', 'manual.pdf'), false, false, 'P'],
        [path.resolve('packs-other', 'manual.pdf'), path.resolve('packs-other', 'manual.pdf'), false, false, 'L'],
        [path.resolve('packs', '..'), path.resolve('packs', '..'), false, false, 'L'],
        [path.join('packs', '..', 'manual.pdf'), path.resolve('manual.pdf'), false, false, 'L'],
        [path.resolve('packs', '..manual.pdf'), path.resolve('packs', '..manual.pdf'), false, false, 'P'],
        [pathToFileURL(path.resolve('books', 'manual.pdf')).href, path.resolve('books', 'manual.pdf'), false, false, 'L'],
        [`file://localhost${pathToFileURL(path.resolve('books', 'manual.pdf')).pathname}`, path.resolve('books', 'manual.pdf'), false, false, 'L'],
        ['https://example.com/manual.pdf', undefined, true, true, 'W'],
        ['https://example.com/manual.htm', undefined, true, false, 'H'],
        ['www.example.com/manual.pdf', undefined, true, true, 'W'],
        ['file://server/share/manual.pdf', undefined, true, true, 'W'],
    ])('addUserBook classifies manual additions and preserves their web predicates: %s', async (name, expectedPath, isWeb, isWebDoc, locationType) => {
        jest.replaceProperty(process, 'env', { ...process.env, CMSIS_PACK_ROOT: path.resolve('packs') });
        const manager = createManager();
        const save = jest.spyOn(manager.file, 'save');
        const cbuildFile = new CTreeItemYamlFile(path.resolve('example.cbuild.yml'));
        cbuildFile.text = 'build: {board: Vendor::Board, board-books: [{title: Manual}]}\n';
        cbuildFile.rootItem = cbuildFile.parse();
        const book = cbuildFile.topItem!.getGrandChildren('board-books')[0];
        book.setValue('name', name);
        const sourceText = cbuildFile.stringify();

        await manager.addUserBook('Vendor::Board', 'board', name, 'Manual', 'reference');

        const doc = manager.file.getDocs('Vendor::Board', 'board')[0];
        expect(doc.name).toBe(expectedPath ?? name);
        expect(doc.title).toBe('Manual');
        expect(doc.category).toBe('reference');
        expect(doc.path).toBe(expectedPath);
        expect(doc.locationType).toBe(locationType);
        expect(doc.item!.getChild('locationType')).toBeUndefined();
        expect(files.get(fileName)).not.toContain('locationType:');
        expect(doc.mode).toBe('user');
        expect(doc.item!.getChild('mode')?.toObject()).toBe('user');
        expect(doc.isWeb()).toBe(isWeb);
        expect(doc.isWebDoc()).toBe(isWebDoc);
        expect(doc.isDownloaded()).toBe(false);
        expect(files.get(fileName)).toBe(manager.file.stringify());
        const cbuildManager = createManager(path.join(docsDirectory, 'cbuild'));
        await cbuildManager.addCbuildBooks(cbuildFile.topItem!, 'board');
        const importedDoc = cbuildManager.file.getDocs('Vendor::Board', 'board')[0];
        expect(importedDoc.name).toBe(doc.name);
        expect(importedDoc.path).toBe(expectedPath);
        expect(importedDoc.locationType).toBe(locationType);
        expect(importedDoc.mode).toBeUndefined();
        expect(importedDoc.item!.getChild('mode')).toBeUndefined();
        expect(cbuildManager.file.stringify()).not.toContain('mode:');
        doc.path = path.resolve('downloaded', 'manual.pdf');
        doc.error = 'Retry failed';
        expect(doc.isDownloaded()).toBe(locationType === 'W');
        const importedText = manager.file.stringify();
        await manager.addCbuildBooks(cbuildFile.topItem!, 'board');
        await manager.addUserBook('Vendor::Board', 'board', name, 'Replacement', 'other');
        expect(manager.file.stringify()).toBe(importedText);
        expect(cbuildFile.stringify()).toBe(sourceText);
        expect(save).toHaveBeenCalledTimes(3);
        expect(files.get(fileName)).toBe(importedText);
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).toHaveBeenCalledTimes(3);
        expect(fileSystem.unlink).not.toHaveBeenCalled();
        const reloaded = new DocManager();
        expect(await reloaded.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        const saved = reloaded.file.getDoc(doc.name, 'Vendor::Board', 'board')!;
        expect(saved.locationType).toBe(locationType);
        expect(saved.item!.getChild('locationType')).toBeUndefined();
        expect(saved.mode).toBe('user');
        expect(files.get(fileName)).toContain('mode: user');
        expect(saved.error).toBe('Retry failed');
        expect(saved.path).toBe(doc.path);
    });

    it.each([undefined, 'W', 'H', 'P', 'L', 'U', 'future'])('addUserBook and addCbuildBooks ignore legacy type %s while preserving duplicate metadata', async locationType => {
        const manager = createManager();
        const docName = path.resolve('build', 'guide.pdf');
        const doc = manager.file.ensureDoc(docName, 'Vendor::Board', 'board');
        doc.title = 'Stored title';
        doc.category = 'stored';
        doc.item!.setValue('locationType', locationType);
        doc.error = 'Stored error';
        doc.path = path.resolve('downloaded', 'guide.pdf');
        const cbuildFile = new CTreeItemYamlFile(path.resolve('build', 'example.cbuild.yml'));
        cbuildFile.text = 'build: {board: Vendor::Board, board-books: [{name: guide.pdf}, {}]}\n';
        cbuildFile.rootItem = cbuildFile.parse();
        const books = cbuildFile.topItem!.getGrandChildren('board-books');
        books[1].setValue('name', docName);
        const importedText = manager.file.stringify();

        await manager.addCbuildBooks(cbuildFile.topItem!, 'board');
        expect(manager.file.stringify()).toBe(importedText);
        await manager.addUserBook('Vendor::Board', 'board', path.join('build', 'guide.pdf'), 'New title', 'new');
        await manager.addUserBook('Vendor::Board', 'board', docName, 'New title', 'new');

        expect(manager.file.getDocs('Vendor::Board', 'board')).toHaveLength(1);
        const saved = manager.file.getDoc(docName, 'Vendor::Board', 'board')!;
        expect(saved.item).toBe(doc.item);
        expect(saved.title).toBe('Stored title');
        expect(saved.category).toBe('stored');
        expect(saved.locationType).toBe('L');
        expect(saved.item!.getValue('locationType')).toBe(locationType);
        expect(saved.mode).toBe('user');
        expect(saved.error).toBe('Stored error');
        expect(saved.path).toBe(doc.path);
        expect(files.get(fileName)).toBe(manager.file.stringify());
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).toHaveBeenCalledTimes(2);
        expect(fileSystem.unlink).not.toHaveBeenCalled();
    });

    it('addUserBook returns live new and duplicate references without resetting the parent pack', async () => {
        const manager = createManager();
        const parentId = 'Vendor::Board';
        const parent = manager.file.ensureParent(parentId, 'board', 'Vendor::Pack@1.0.0');
        const imported = manager.file.ensureDoc('https://example.com/imported.pdf', parentId, 'board');
        const save = jest.spyOn(manager.file, 'save');

        const created = (await manager.addUserBook(parentId, 'board', 'guide.pdf', 'Guide', 'reference'))!;
        expect(created.item).toBe(manager.file.getDoc(path.resolve('guide.pdf'), parentId, 'board')!.item);
        expect(created.title).toBe('Guide');
        expect(created.category).toBe('reference');
        expect(created.path).toBe(path.resolve('guide.pdf'));
        expect(created.mode).toBe('user');
        created.error = 'Stored error';
        const createdObject = created.item!.toObject();
        const normalizedDuplicate = (await manager.addUserBook(parentId, 'board', 'guide.pdf', 'Replacement', 'other'))!;
        expect(normalizedDuplicate.item).toBe(created.item);
        expect(normalizedDuplicate.item!.toObject()).toEqual(createdObject);

        const legacy = manager.file.ensureDoc('legacy.pdf', parentId, 'board');
        legacy.title = 'Stored title';
        const rawDuplicate = (await manager.addUserBook(parentId, 'board', legacy.name, 'Replacement'))!;
        expect(rawDuplicate.item).toBe(legacy.item);
        expect(rawDuplicate.title).toBe('Stored title');
        expect(rawDuplicate.mode).toBe('user');
        const web = (await manager.addUserBook(parentId, 'board', 'https://example.com/manual.pdf', 'Manual'))!;
        expect(web.item).toBe(manager.file.getDoc(web.name, parentId, 'board')!.item);
        expect(web.path).toBeUndefined();
        expect(web.mode).toBe('user');
        expect((await manager.addUserBook(parentId, 'board', web.name, 'Replacement'))!.item).toBe(web.item);
        expect(parent.getValue('pack')).toBe('Vendor::Pack@1.0.0');
        expect(manager.file.getDoc(imported.name, parentId, 'board')!.item).toBe(imported.item);
        expect(save).toHaveBeenCalledTimes(5);
        expect(files.get(fileName)).toBe(manager.file.stringify());
        expect(await manager.addUserBook('', 'board', 'guide.pdf', 'Guide')).toBeUndefined();
        expect(await manager.addUserBook(parentId, 'board', '', 'Guide')).toBeUndefined();
        expect(save).toHaveBeenCalledTimes(5);
    });

    it('sets a local path only for W documents and preserves their identity and metadata after reloading', async () => {
        const manager = createManager();
        const name = 'https://example.com/manual.pdf';
        const doc = manager.file.ensureDoc(name, 'Vendor::Board', 'board');
        doc.title = 'Manual';
        doc.item!.setValue('future', 'preserved');
        const other = manager.file.ensureDoc(name, 'Vendor::Board', 'device');
        const changed = jest.fn();
        manager.onDidChange(changed);

        expect(await manager.setLocalPath('Vendor::Board', 'board', name, 'local/manual.pdf')).toBe(true);
        expect(doc.path).toBe(path.resolve('local/manual.pdf'));
        expect(doc.locationType).toBe('W');
        expect(doc.mode).toBeUndefined();
        expect(other.path).toBeUndefined();
        expect(changed).toHaveBeenCalledTimes(1);
        const reloaded = new DocManager();
        await reloaded.initialize(docsDirectory);
        const saved = reloaded.file.getDoc(name, 'Vendor::Board', 'board')!;
        expect(saved.path).toBe(doc.path);
        expect(saved.title).toBe('Manual');
        expect(saved.item!.getValue('future')).toBe('preserved');
    });

    it.each(['https://example.com/manual.html', 'local.pdf', '${CMSIS_PACK_ROOT}/manual.pdf', 'missing'])('rejects Set Local Path for %s without saving', async name => {
        const manager = createManager();
        if (name !== 'missing') {
            manager.file.ensureDoc(name, 'Vendor::Board', 'board');
        }
        const save = jest.spyOn(manager.file, 'save');
        expect(await manager.setLocalPath('Vendor::Board', 'board', name, 'local.pdf')).toBe(false);
        expect(save).not.toHaveBeenCalled();
    });

    it.each([undefined, 'future', 'user'])('removes only user documents, never their local file: %s', async mode => {
        const manager = createManager();
        const doc = manager.file.ensureDoc('manual.pdf', 'Vendor::Board', 'board');
        doc.item!.setValue('mode', mode);
        doc.path = path.resolve('manual.pdf');
        const other = manager.file.ensureDoc(doc.name, 'Vendor::Board', 'device');
        const save = jest.spyOn(manager.file, 'save');
        const changed = jest.fn();
        manager.onDidChange(changed);

        expect(await manager.removeDocument('Vendor::Board', 'board', doc.name)).toBe(mode === 'user');
        expect(manager.file.getDoc(doc.name, 'Vendor::Board', 'board')?.item).toBe(mode === 'user' ? undefined : doc.item);
        expect(manager.file.getDoc(doc.name, 'Vendor::Board', 'device')!.item).toBe(other.item);
        expect(save).toHaveBeenCalledTimes(mode === 'user' ? 1 : 0);
        expect(changed).toHaveBeenCalledTimes(mode === 'user' ? 1 : 0);
        expect(fileSystem.unlink).not.toHaveBeenCalled();
        if (mode === 'user') {
            const reloaded = new DocManager();
            await reloaded.initialize(docsDirectory);
            expect(reloaded.file.getDocs('Vendor::Board', 'board')).toEqual([]);
        }
    });

    it.each([ETextFileResult.Success, ETextFileResult.Error])('notifies only after a successful document save: %s', async result => {
        const manager = createManager();
        let completeSave!: (result: ETextFileResult) => void;
        jest.spyOn(manager.file, 'save').mockReturnValueOnce(new Promise(resolve => { completeSave = resolve; }));
        const changed = jest.fn();
        manager.onDidChange(changed);
        const addition = manager.addUserBook('Vendor::Board', 'board', 'manual.pdf', 'Manual');
        expect(changed).not.toHaveBeenCalled();
        completeSave(result);
        const doc = await addition;
        expect(changed).toHaveBeenCalledTimes(result === ETextFileResult.Success ? 1 : 0);
        expect(doc?.mode).toBe(result === ETextFileResult.Success ? 'user' : undefined);
    });

    it.each([undefined, 'reference'])('addUserBook scopes manual entries by parent and accepts optional category %s', async category => {
        const manager = createManager();
        const name = 'https://example.com/manual.pdf';

        await manager.addUserBook('Vendor::Hardware', 'board', name, 'Board manual', category);
        await manager.addUserBook('Vendor::Hardware', 'device', name, 'Device manual');
        await manager.addUserBook('Vendor::Other', 'board', name, 'Other manual');

        const board = manager.file.getDoc(name, 'Vendor::Hardware', 'board')!;
        const device = manager.file.getDoc(name, 'Vendor::Hardware', 'device')!;
        const other = manager.file.getDoc(name, 'Vendor::Other', 'board')!;
        expect(board.title).toBe('Board manual');
        expect(board.category).toBe(category);
        expect(device.title).toBe('Device manual');
        expect(device.category).toBeUndefined();
        expect(other.title).toBe('Other manual');
        expect(board.item).not.toBe(device.item);
        expect(board.item).not.toBe(other.item);
        expect([board, device, other].map(doc => doc.locationType)).toEqual(['W', 'W', 'W']);
        expect([board, device, other].map(doc => doc.mode)).toEqual(['user', 'user', 'user']);
        expect(files.get(fileName)).toBe(manager.file.stringify());
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).toHaveBeenCalledTimes(3);
    });

    it.each([
        ['', 'manual.pdf'],
        ['Vendor::Board', ''],
    ])('addUserBook ignores missing parent id %s or name %s without creating entries', async (parentId, name) => {
        const manager = createManager();

        await manager.addUserBook(parentId, 'board', name, 'Manual');

        expect(manager.file.rootItem).toBeUndefined();
        expect(fileSystem.exists).not.toHaveBeenCalled();
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    it('addCbuildBooks saves separate board references that can be reloaded', async () => {
        const manager = new DocManager();
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        const device = manager.file.ensureDoc('manual', 'Vendor::NewBoard', 'device');
        device.title = 'Device manual';
        device.path = 'device.pdf';
        expect(manager.file.getDocParent('Vendor::NewBoard', 'board')).toBeUndefined();
        const cbuildFile = new CTreeItemYamlFile(path.resolve('build', 'example.cbuild.yml'));
        cbuildFile.text = [
            'build:',
            '  board: Vendor::NewBoard',
            '  board-books:',
            '    - name: manual',
            '    - name: https://example.com/manual.pdf',
            '    - name: file://server/share/manual.pdf',
        ].join('\n');
        cbuildFile.rootItem = cbuildFile.parse();
        await manager.addCbuildBooks(cbuildFile.topItem!, 'board');
        const docName = path.resolve('build', 'manual');
        const doc = manager.file.getDoc(docName, 'Vendor::NewBoard', 'board')!;
        expect(doc.item).not.toBe(device.item);
        expect(doc.path).toBe(path.resolve('build', 'manual'));
        expect(doc.item!.getChild('title')).toBeUndefined();
        expect(doc.item!.getChild('category')).toBeUndefined();
        expect(device.title).toBe('Device manual');
        expect(device.path).toBe('device.pdf');
        expect(manager.file.getDoc('manual', 'Vendor::Board', 'board')?.path).toBe('manual.pdf');

        const remote = manager.file.getDoc('https://example.com/manual.pdf', 'Vendor::NewBoard', 'board')!;
        remote.item!.setValue('future', 'preserved');
        const existingText = manager.file.stringify();
        const book = cbuildFile.topItem!.getGrandChildren('board-books')[1];
        book.setValue('title', 'New title');
        book.setValue('category', 'new category');
        await manager.addCbuildBooks(cbuildFile.topItem!, 'board');
        expect(manager.file.stringify()).toBe(existingText);
        expect(manager.file.getDoc(remote.name, 'Vendor::NewBoard', 'board')!.item).toBe(remote.item);
        expect(remote.path).toBeUndefined();
        expect(remote.item!.getChild('title')).toBeUndefined();
        expect(remote.item!.getChild('category')).toBeUndefined();
        const remoteFile = manager.file.getDoc('file://server/share/manual.pdf', 'Vendor::NewBoard', 'board')!;
        expect(remoteFile.path).toBeUndefined();
        expect(files.get(fileName)).toBe(existingText);
        expect(fileSystem.write).toHaveBeenCalledTimes(2);

        const reloaded = new DocManager();
        expect(await reloaded.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        expect(reloaded.file.getDocs('Vendor::NewBoard', 'board').map(entry => entry.name))
            .toEqual([docName, 'https://example.com/manual.pdf', 'file://server/share/manual.pdf']);
        expect(reloaded.file.getDoc(docName, 'Vendor::NewBoard', 'board')?.path).toBe(doc.path);
        expect(reloaded.file.getDoc(docName, 'Vendor::NewBoard', 'board')?.locationType).toBe('L');
        expect(reloaded.file.getDoc(remote.name, 'Vendor::NewBoard', 'board')?.item!.getValue('future')).toBe('preserved');
        expect(reloaded.file.getDoc(remote.name, 'Vendor::NewBoard', 'board')?.path).toBeUndefined();
        expect(reloaded.file.getDoc(remote.name, 'Vendor::NewBoard', 'board')?.locationType).toBe('W');
        expect(reloaded.file.getDoc(remoteFile.name, 'Vendor::NewBoard', 'board')?.path).toBeUndefined();
        expect(reloaded.file.getDoc(remoteFile.name, 'Vendor::NewBoard', 'board')?.locationType).toBe('W');
        expect(fileSystem.write).toHaveBeenCalledTimes(2);
    });

    it.each(['cbuild', 'user'])('waits for %s book saving before resolving', async source => {
        const manager = createManager();
        let completeSave!: (result: ETextFileResult) => void;
        const saveResult = new Promise<ETextFileResult>(resolve => { completeSave = resolve; });
        const save = jest.spyOn(manager.file, 'save').mockReturnValueOnce(saveResult);
        const cbuildFile = new CTreeItemYamlFile();
        cbuildFile.text = 'build: {board: Vendor::Board, board-books: [{name: manual.pdf}]}\n';
        cbuildFile.rootItem = cbuildFile.parse();
        const addition = source === 'cbuild'
            ? manager.addCbuildBooks(cbuildFile.topItem!, 'board')
            : manager.addUserBook('Vendor::Board', 'board', 'manual.pdf', 'Manual');
        const completed = jest.fn();
        const completion = addition.then(completed);

        expect(save).toHaveBeenCalledTimes(1);
        await Promise.resolve();
        expect(completed).not.toHaveBeenCalled();

        completeSave(ETextFileResult.Success);
        await completion;

        expect(completed).toHaveBeenCalledTimes(1);
        expect(completed).toHaveBeenCalledWith(source === 'user'
            ? expect.objectContaining({ item: manager.file.getDocs('Vendor::Board', 'board')[0].item })
            : undefined);
    });

    it.each(['cbuild', 'user'])('reports %s book save errors through the file error reporter', async source => {
        const manager = createManager();
        const errorReporter = jest.fn();
        TextFile.setErrorReporter(errorReporter);
        fileSystem.write.mockImplementationOnce(() => { throw new Error('write failed'); });

        if (source === 'cbuild') {
            const cbuildFile = new CTreeItemYamlFile();
            cbuildFile.text = 'build: {board: Vendor::Board, board-books: [{name: manual.pdf}]}\n';
            cbuildFile.rootItem = cbuildFile.parse();
            await manager.addCbuildBooks(cbuildFile.topItem!, 'board');
        } else {
            await manager.addUserBook('Vendor::Board', 'board', 'manual.pdf', 'Manual');
        }

        expect(manager.file.errors.join('\n')).toContain('write failed');
        expect(errorReporter).toHaveBeenCalledWith(expect.stringContaining('write failed'));
        expect(fileSystem.write).toHaveBeenCalledTimes(1);
    });

    it('creates a missing inventory with an empty docs map that can be reloaded', async () => {
        files.clear();
        const manager = new DocManager();
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        expect(manager.file.topItem?.getTag()).toBe('docs');
        expect(manager.file.topItem?.isMap()).toBe(true);
        expect(manager.file.getDocParents()).toEqual([]);
        expect(manager.file.errors).toEqual([]);
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).toHaveBeenCalledWith(fileName, expect.any(String));

        const reloaded = new DocManager();
        expect(await reloaded.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        expect(reloaded.file.topItem?.getTag()).toBe('docs');
        expect(reloaded.file.topItem?.isMap()).toBe(true);
        expect(reloaded.file.getDocParents()).toEqual([]);
        expect(fileSystem.write).toHaveBeenCalledTimes(1);
    });

    it('does not rewrite an unchanged inventory on repeated initialization', async () => {
        const manager = new DocManager();
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        const parentItem = manager.file.getDocParent('Vendor::Board', 'board')?.item;
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Unchanged);
        expect(manager.file.getDocParent('Vendor::Board', 'board')?.item).toBe(parentItem);
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    it('propagates read errors without creating an inventory and supports retry', async () => {
        fileSystem.read.mockImplementationOnce(() => { throw new Error('read failed'); });
        const manager = new DocManager();
        const originalText = files.get(fileName);
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Error);
        expect(manager.file.errors.join('\n')).toContain('read failed');
        expect(manager.file.rootItem).toBeUndefined();
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(files.get(fileName)).toBe(originalText);
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        expect(manager.file.errors).toEqual([]);
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    it('does not overwrite an existing inventory when parsing fails', async () => {
        const invalidText = 'docs: [\n';
        files.set(fileName, invalidText);
        const manager = new DocManager();
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Error);
        expect(manager.file.errors.join('\n')).toContain('Failed to parse');
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(files.get(fileName)).toBe(invalidText);
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Error);
        expect(files.get(fileName)).toBe(invalidText);
        expect(fileSystem.write).not.toHaveBeenCalled();

        files.set(fileName, 'docs: {}\n');
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        expect(manager.file.errors).toEqual([]);
        expect(manager.file.topItem?.isMap()).toBe(true);
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    it('reports creation errors and retries when the inventory is still missing', async () => {
        files.clear();
        fileSystem.write.mockImplementationOnce(() => { throw new Error('write failed'); });
        const manager = new DocManager();
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Error);
        expect(manager.file.errors.join('\n')).toContain('write failed');
        expect(files.has(fileName)).toBe(false);
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        expect(manager.file.errors).toEqual([]);
        expect(manager.file.topItem?.isMap()).toBe(true);
        expect(files.has(fileName)).toBe(true);
        expect(fileSystem.write).toHaveBeenCalledTimes(2);
    });

    it('switches inventory directories without retaining documents from the previous directory', async () => {
        const manager = new DocManager();
        const file = manager.file;
        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        const originalText = files.get(fileName);
        const nextDirectory = path.resolve('other-inventory');
        const nextFileName = path.join(nextDirectory, 'docs.yml');

        expect(await manager.initialize(nextDirectory)).toBe(ETextFileResult.Success);
        expect(manager.file).toBe(file);
        expect(file.fileName).toBe(nextFileName);
        expect(file.fileDir).toBe(nextDirectory);
        expect(file.getDocParents()).toEqual([]);
        await manager.addUserBook('Vendor::OtherBoard', 'board', 'https://example.com/other.pdf', 'Other');
        const nextText = files.get(nextFileName);
        expect(nextText).toContain('Vendor::OtherBoard');
        expect(files.get(fileName)).toBe(originalText);

        expect(await manager.initialize(docsDirectory)).toBe(ETextFileResult.Success);
        expect(file.getDoc('manual', 'Vendor::Board', 'board')?.path).toBe('manual.pdf');
        expect(file.getDocParents().map(parent => parent.id)).toEqual(['Vendor::Board']);
        expect(files.get(nextFileName)).toBe(nextText);
    });
});
