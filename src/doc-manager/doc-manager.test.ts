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

    it('owns the file in the supplied directory without performing I/O on construction', () => {
        const manager = new DocManager(docsDirectory);
        expect(manager.file).toBeInstanceOf(DocsYamlFile);
        expect(manager.file.fileName).toBe(fileName);
        expect(manager.file.fileDir).toBe(docsDirectory);
        expect(manager.file.rootItem).toBeUndefined();
        expect(fileSystem.exists).not.toHaveBeenCalled();
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    it('loads the existing inventory without writing and exposes it for direct editing and saving', async () => {
        const manager = new DocManager(docsDirectory);
        const file = manager.file;
        const originalText = files.get(fileName);
        expect(await manager.initialize()).toBe(ETextFileResult.Success);
        expect(manager.file).toBe(file);
        expect(file.getDoc('manual', 'Vendor::Board', 'board')?.path).toBe('manual.pdf');
        expect(file.errors).toEqual([]);
        expect(fileSystem.read).toHaveBeenCalledWith(fileName);
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(files.get(fileName)).toBe(originalText);

        file.getDocs('Vendor::Board', 'board')[0].title = 'Manual';
        expect(await file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocManager(docsDirectory);
        expect(await reloaded.initialize()).toBe(ETextFileResult.Success);
        expect(reloaded.file.getDoc('manual', 'Vendor::Board', 'board')?.title).toBe('Manual');
        expect(fileSystem.write).toHaveBeenCalledTimes(1);
    });

    it('addBooks appends missing books to an existing board without changing stored docs or performing I/O', async () => {
        const manager = new DocManager(docsDirectory);
        expect(await manager.initialize()).toBe(ETextFileResult.Success);
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

        manager.addBooks(cbuild, 'board');
        const docs = manager.file.getDocs('Vendor::Board', 'board');
        expect(manager.file.getDocParent('Vendor::Device', 'device')).toBeUndefined();
        expect(docs.map(doc => doc.name)).toEqual(['manual', path.resolve('build', 'guide.pdf'), 'https://example.com/guide.pdf']);
        expect(docs[0].item).toBe(existing.item);
        expect(docs[0].title).toBe('Stored manual');
        expect(docs[0].category).toBe('stored');
        expect(docs[0].path).toBe('manual.pdf');
        expect(docs[0].item!.getValue('future')).toBe('preserved');
        expect(manager.file.getDocParent('Vendor::Board', 'board')!.item).toBe(parentItem);
        expect(parentItem.getValue('future')).toBe('preserved');
        expect(docs[1].title).toBe('Local guide');
        expect(docs[1].category).toBe('reference');
        expect(docs[1].path).toBe(path.resolve('build', 'guide.pdf'));
        expect(docs[2].title).toBe('https://example.com/guide.pdf');
        expect(docs[2].path).toBeUndefined();
        expect(docs[2].item!.getChild('title')).toBeUndefined();
        const importedText = manager.file.stringify();
        expect(importedText).not.toBe(existingText);

        manager.addBooks(cbuild, 'board');
        expect(cbuildFile.stringify()).toBe(sourceText);
        cbuild.removeChild(cbuild.getChild('board-books'));
        manager.addBooks(cbuild, 'board');
        expect(manager.file.stringify()).toBe(importedText);
        expect(manager.file.getDocs('Vendor::Board', 'board').map(doc => doc.item)).toEqual(docs.map(doc => doc.item));
        expect(fileSystem.exists).not.toHaveBeenCalled();
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(fileSystem.unlink).not.toHaveBeenCalled();
    });

    it.each([
        ['missing board', ['  board-books:', '    - name: manual.pdf']],
        ['empty board', ['  board: ""', '  board-books:', '    - name: manual.pdf']],
        ['missing books', ['  board: Vendor::Board', '  device-books:', '    - name: device.pdf']],
        ['empty books', ['  board: Vendor::Board', '  board-books: []']],
        ['missing names', ['  board: Vendor::Board', '  board-books:', '    - title: Manual', '    - name: ""']],
    ])('addBooks ignores %s without creating an empty board or performing I/O', (_description, lines) => {
        const manager = new DocManager(docsDirectory);
        const cbuildFile = new CTreeItemYamlFile();
        cbuildFile.text = ['build:', ...lines].join('\n');
        cbuildFile.rootItem = cbuildFile.parse();

        manager.addBooks(cbuildFile.topItem!, 'board');

        expect(manager.file.rootItem).toBeUndefined();
        expect(fileSystem.exists).not.toHaveBeenCalled();
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(fileSystem.unlink).not.toHaveBeenCalled();
    });

    it('addBooks imports only the selected device collection', () => {
        const manager = new DocManager(docsDirectory);
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

        manager.addBooks(cbuildFile.topItem!, 'device');

        const docs = manager.file.getDocs('Vendor::Device', 'device');
        expect(docs.map(doc => doc.name)).toEqual([path.resolve('build', 'device.pdf')]);
        expect(docs[0].title).toBe('Device manual');
        expect(manager.file.getDocParents('board')).toEqual([]);
    });

    it.each([
        ['both parents', ['board', 'device']],
        ['board only', ['board']],
        ['device only', ['device']],
    ])('addBooksFromCbuild imports available collections with %s', (_description, parentTags) => {
        const manager = new DocManager(docsDirectory);
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

        manager.addBooksFromCbuild(cbuildFile.topItem!);

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
        manager.addBooksFromCbuild(cbuildFile.topItem!);
        expect(manager.file.stringify()).toBe(importedText);
        expect(cbuildFile.stringify()).toBe(sourceText);
        expect(fileSystem.exists).not.toHaveBeenCalled();
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(fileSystem.unlink).not.toHaveBeenCalled();
    });

    it.each([
        ['relative path', '../manual.pdf', path.resolve('manual.pdf'), true],
        ['absolute path', path.resolve('books', 'manual.pdf'), path.resolve('books', 'manual.pdf'), false],
        ['pack path', '${CMSIS_PACK_ROOT}/Vendor/Pack/manual.pdf', path.resolve('packs', 'Vendor', 'Pack', 'manual.pdf'), false],
        ['compiler path', '${CMSIS_COMPILER_ROOT}/manual.pdf', path.resolve('compilers', 'manual.pdf'), false],
        ['file URL', pathToFileURL(path.resolve('books', 'encoded manual.pdf')).href, path.resolve('books', 'encoded manual.pdf'), false],
        ['localhost file URL', `file://localhost${pathToFileURL(path.resolve('books', 'encoded manual.pdf')).pathname}`, path.resolve('books', 'encoded manual.pdf'), false],
        ['remote file URL', 'file://server/share/encoded%20manual.pdf', undefined, true],
        ['HTTP URL', 'http://example.com/manual.pdf', undefined, true],
        ['HTTPS URL', 'https://example.com/manual.pdf', undefined, true],
        ['www address', 'www.example.com/manual.pdf', undefined, true],
        ['other URI', 'custom:manual', path.resolve('build', 'custom:manual'), true],
        ['relative path without source metadata', 'manual.pdf', path.resolve('manual.pdf'), false],
    ])('addBook normalizes %s and sets the matching path only for files', (_description, name, expectedPath, hasSource) => {
        jest.replaceProperty(process, 'env', {
            ...process.env,
            CMSIS_PACK_ROOT: path.resolve('packs'),
            CMSIS_COMPILER_ROOT: path.resolve('compilers'),
        });
        const manager = new DocManager(docsDirectory);
        const cbuildFile = new CTreeItemYamlFile(hasSource ? path.resolve('build', 'example.cbuild.yml') : '');
        cbuildFile.text = 'build: {board: Vendor::Board, board-books: [{title: Manual, category: reference}]}\n';
        cbuildFile.rootItem = cbuildFile.parse();
        cbuildFile.topItem!.getGrandChildren('board-books')[0].setValue('name', name);
        const sourceText = cbuildFile.stringify();

        manager.addBook(cbuildFile.topItem!.getGrandChildren('board-books')[0], 'Vendor::Board', 'board');

        const doc = manager.file.getDocs('Vendor::Board', 'board')[0];
        expect(doc.name).toBe(expectedPath ?? name);
        expect(doc.title).toBe('Manual');
        expect(doc.category).toBe('reference');
        expect(doc.path).toBe(expectedPath);
        expect(cbuildFile.stringify()).toBe(sourceText);
        expect(fileSystem.exists).not.toHaveBeenCalled();
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(fileSystem.unlink).not.toHaveBeenCalled();
    });

    it.each([false, true])('addBook reuses normalized file aliases with an existing reference: %s', hasExisting => {
        const manager = new DocManager(docsDirectory);
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

        manager.addBooks(cbuildFile.topItem!, 'board');

        const docs = manager.file.getDocs('Vendor::Board', 'board');
        expect(docs).toHaveLength(1);
        expect(docs[0].name).toBe(docName);
        expect(docs[0].title).toBe(hasExisting ? 'Stored title' : 'First title');
        expect(docs[0].category).toBe(hasExisting ? 'stored' : 'reference');
        expect(docs[0].path).toBe(hasExisting ? undefined : docName);
        if (existing) {
            expect(docs[0].item).toBe(existing.item);
            expect(docs[0].item!.getValue('future')).toBe('preserved');
        }
        const importedText = manager.file.stringify();
        manager.addBooks(cbuildFile.topItem!, 'board');
        expect(manager.file.stringify()).toBe(importedText);
        expect(manager.file.getDocs('Vendor::Board', 'board')[0].item).toBe(docs[0].item);
        expect(cbuildFile.stringify()).toBe(sourceText);
        expect(fileSystem.exists).not.toHaveBeenCalled();
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(fileSystem.unlink).not.toHaveBeenCalled();
    });

    it('addBooks creates separate board references and persists them only when explicitly saved', async () => {
        const manager = new DocManager(docsDirectory);
        expect(await manager.initialize()).toBe(ETextFileResult.Success);
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
        manager.addBooks(cbuildFile.topItem!, 'board');
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
        manager.addBooks(cbuildFile.topItem!, 'board');
        expect(manager.file.stringify()).toBe(existingText);
        expect(manager.file.getDoc(remote.name, 'Vendor::NewBoard', 'board')!.item).toBe(remote.item);
        expect(remote.path).toBeUndefined();
        expect(remote.item!.getChild('title')).toBeUndefined();
        expect(remote.item!.getChild('category')).toBeUndefined();
        const remoteFile = manager.file.getDoc('file://server/share/manual.pdf', 'Vendor::NewBoard', 'board')!;
        expect(remoteFile.path).toBeUndefined();
        expect(fileSystem.write).not.toHaveBeenCalled();

        expect(await manager.file.save()).toBe(ETextFileResult.Success);
        const reloaded = new DocManager(docsDirectory);
        expect(await reloaded.initialize()).toBe(ETextFileResult.Success);
        expect(reloaded.file.getDocs('Vendor::NewBoard', 'board').map(entry => entry.name))
            .toEqual([docName, 'https://example.com/manual.pdf', 'file://server/share/manual.pdf']);
        expect(reloaded.file.getDoc(docName, 'Vendor::NewBoard', 'board')?.path).toBe(doc.path);
        expect(reloaded.file.getDoc(remote.name, 'Vendor::NewBoard', 'board')?.item!.getValue('future')).toBe('preserved');
        expect(reloaded.file.getDoc(remote.name, 'Vendor::NewBoard', 'board')?.path).toBeUndefined();
        expect(reloaded.file.getDoc(remoteFile.name, 'Vendor::NewBoard', 'board')?.path).toBeUndefined();
        expect(fileSystem.write).toHaveBeenCalledTimes(1);
    });

    it('creates a missing inventory with an empty docs map that can be reloaded', async () => {
        files.clear();
        const manager = new DocManager(docsDirectory);
        expect(await manager.initialize()).toBe(ETextFileResult.Success);
        expect(manager.file.topItem?.getTag()).toBe('docs');
        expect(manager.file.topItem?.isMap()).toBe(true);
        expect(manager.file.getDocParents()).toEqual([]);
        expect(manager.file.errors).toEqual([]);
        expect(fileSystem.read).not.toHaveBeenCalled();
        expect(fileSystem.write).toHaveBeenCalledWith(fileName, expect.any(String));

        const reloaded = new DocManager(docsDirectory);
        expect(await reloaded.initialize()).toBe(ETextFileResult.Success);
        expect(reloaded.file.topItem?.getTag()).toBe('docs');
        expect(reloaded.file.topItem?.isMap()).toBe(true);
        expect(reloaded.file.getDocParents()).toEqual([]);
        expect(fileSystem.write).toHaveBeenCalledTimes(1);
    });

    it('does not rewrite an unchanged inventory on repeated initialization', async () => {
        const manager = new DocManager(docsDirectory);
        expect(await manager.initialize()).toBe(ETextFileResult.Success);
        const parentItem = manager.file.getDocParent('Vendor::Board', 'board')?.item;
        expect(await manager.initialize()).toBe(ETextFileResult.Unchanged);
        expect(manager.file.getDocParent('Vendor::Board', 'board')?.item).toBe(parentItem);
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    it('propagates read errors without creating an inventory and supports retry', async () => {
        fileSystem.read.mockImplementationOnce(() => { throw new Error('read failed'); });
        const manager = new DocManager(docsDirectory);
        const originalText = files.get(fileName);
        expect(await manager.initialize()).toBe(ETextFileResult.Error);
        expect(manager.file.errors.join('\n')).toContain('read failed');
        expect(manager.file.rootItem).toBeUndefined();
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(files.get(fileName)).toBe(originalText);
        expect(await manager.initialize()).toBe(ETextFileResult.Success);
        expect(manager.file.errors).toEqual([]);
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    it('does not overwrite an existing inventory when parsing fails', async () => {
        const invalidText = 'docs: [\n';
        files.set(fileName, invalidText);
        const manager = new DocManager(docsDirectory);
        expect(await manager.initialize()).toBe(ETextFileResult.Error);
        expect(manager.file.errors.join('\n')).toContain('Failed to parse');
        expect(fileSystem.write).not.toHaveBeenCalled();
        expect(files.get(fileName)).toBe(invalidText);
        expect(await manager.initialize()).toBe(ETextFileResult.Error);
        expect(files.get(fileName)).toBe(invalidText);
        expect(fileSystem.write).not.toHaveBeenCalled();

        files.set(fileName, 'docs: {}\n');
        expect(await manager.initialize()).toBe(ETextFileResult.Success);
        expect(manager.file.errors).toEqual([]);
        expect(manager.file.topItem?.isMap()).toBe(true);
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    it('reports creation errors and retries when the inventory is still missing', async () => {
        files.clear();
        fileSystem.write.mockImplementationOnce(() => { throw new Error('write failed'); });
        const manager = new DocManager(docsDirectory);
        expect(await manager.initialize()).toBe(ETextFileResult.Error);
        expect(manager.file.errors.join('\n')).toContain('write failed');
        expect(files.has(fileName)).toBe(false);
        expect(await manager.initialize()).toBe(ETextFileResult.Success);
        expect(manager.file.errors).toEqual([]);
        expect(manager.file.topItem?.isMap()).toBe(true);
        expect(files.has(fileName)).toBe(true);
        expect(fileSystem.write).toHaveBeenCalledTimes(2);
    });
});
