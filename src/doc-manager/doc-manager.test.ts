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
import { JsonFile } from '@open-cmsis-pack/cmsis-common/json-file';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { DocManager } from './doc-manager';
import { DocsYamlFile } from './docs-yaml-file';
import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { TestDataHandler } from '../__test__/test-data';
import { ArmDoc, armDocName } from './arm-docs';
import { DocDownload } from './doc-download';
import { writeTextFile } from '../utils/fs-utils';

describe('DocManager catalog registration', () => {
    const testData = new TestDataHandler();
    let manager: DocManager;

    beforeEach(async () => {
        manager = new DocManager(path.join(__dirname, 'arm-docs.json'));
        await manager.initialize(testData.tmpDir);
    });

    afterEach(() => {
        manager.dispose();
        testData.rmTmpDir();
    });

    it('writes every catalog entry once to the shared owner during initialization', async () => {
        const catalog = new JsonFile(path.join(__dirname, 'arm-docs.json'));
        expect(await catalog.load()).toBe(ETextFileResult.Success);
        const reloaded = new DocsYamlFile(manager.file.fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        const entries = (catalog.content as { docs: ArmDoc[] }).docs;
        const books = reloaded.getDocs('arm-docs', 'common');
        expect(books.map(doc => ({
            name: doc.name,
            title: doc.title,
            category: doc.category,
            id: doc.id,
            version: doc.version,
            format: doc.format,
            metadataUrl: doc.metadataUrl,
        }))).toEqual(entries.map(entry => ({
            name: armDocName(entry),
            title: entry.title,
            category: entry.kind,
            id: entry.docId,
            version: entry.version,
            format: entry.format,
            metadataUrl: `https://documentation-service.arm.com/documentation/${entry.docId}/${entry.version}`,
        })));
        expect(new Set(books.map(doc => doc.name)).size).toBe(entries.length);
        expect(reloaded.getDocParents('common')).toHaveLength(1);
    });
});

describe('DocManager', () => {
    const testData = new TestDataHandler();
    const boardId = 'Vendor::Board';
    const deviceId = 'Vendor::Device';
    const webName = 'https://example.com/manual.pdf';
    let manager: DocManager;

    const createBuild = (content: Record<string, unknown>): CTreeItem => {
        const build = new CTreeItem('build').fromObject(content);
        build.rootFileName = path.join(testData.tmpDir, 'example.cbuild.yml');
        return build;
    };

    beforeEach(async () => {
        manager = new DocManager(path.join(__dirname, 'arm-docs.json'));
        expect(await manager.initialize(testData.tmpDir)).toBe(ETextFileResult.Success);
    });

    afterEach(() => {
        manager.dispose();
        testData.rmTmpDir();
    });

    it('imports device and board books with their metadata and resolved local paths', async () => {
        const boardPath = path.join(testData.tmpDir, 'board.pdf');
        const devicePath = path.join(testData.tmpDir, 'manuals', 'device.pdf');
        const build = createBuild({
            device: `${deviceId}:CPU0`,
            'device-pack': 'Vendor::DevicePack@1.0.0',
            board: boardId,
            'board-pack': 'Vendor::BoardPack@2.0.0',
            'device-books': [
                { name: path.join('manuals', 'device.pdf'), title: 'Device manual', category: 'reference' },
                { name: webName, title: 'Online manual' },
                { title: 'Missing name' },
            ],
            'board-books': [{ name: pathToFileURL(boardPath).href, title: 'Board manual' }],
        });

        await manager.addBooks(build);

        expect(manager.file.getDocs(deviceId, 'device')).toEqual([
            expect.objectContaining({ name: devicePath, path: devicePath, title: 'Device manual', category: 'reference', mode: undefined }),
            expect.objectContaining({ name: webName, path: undefined, title: 'Online manual', mode: undefined }),
        ]);
        expect(manager.getBooks(boardId, 'board')).toEqual([
            expect.objectContaining({ name: boardPath, path: boardPath, title: 'Board manual' }),
        ]);
        expect(manager.file.getDocParent(deviceId, 'device')?.packId).toBe('Vendor::DevicePack@1.0.0');
        expect(manager.file.getDocParent(boardId, 'board')?.packId).toBe('Vendor::BoardPack@2.0.0');
        expect(build.getGrandChildren('device-books')[0].getValue('name')).toBe(path.join('manuals', 'device.pdf'));
    });

    it('ignores build books whose hardware parent is missing', async () => {
        await manager.addBooks(createBuild({
            'device-books': [{ name: webName }],
            'board-books': [{ name: webName }],
        }));
        await manager.addBooks(createBuild({
            board: boardId,
            'board-books': [{ name: webName }],
            'device-books': [{ name: 'https://example.com/device.pdf' }],
        }));

        expect(manager.file.getDocParents('device')).toEqual([]);
        expect(manager.getBooks(boardId, 'board').map(doc => doc.name)).toEqual([webName]);
    });

    it('reuses imported books without replacing their stored metadata or adding duplicates', async () => {
        const name = path.join(testData.tmpDir, 'manual.pdf');
        const build = createBuild({
            board: boardId,
            'board-books': [{ name: 'manual.pdf', title: 'Original title', category: 'reference' }],
        });
        await manager.addBooks(build);
        const doc = manager.file.getDoc(name, boardId, 'board')!;
        doc.title = 'Stored title';
        doc.error = 'Stored error';
        expect(await manager.file.save()).toBe(ETextFileResult.Success);
        build.getGrandChildren('board-books')[0].setValue('title', 'Replacement title');

        await manager.addBooks(build);
        await manager.addBooks(build);

        expect(manager.getBooks(boardId, 'board')).toEqual([
            expect.objectContaining({ name, title: 'Stored title', category: 'reference', error: 'Stored error' }),
        ]);
    });

    it.each(['Vendor::Device', 'Device'])('shares device books across processors of %s', async parentId => {
        for (const processor of ['CPU0', 'CPU1']) {
            await manager.addBooks(createBuild({
                device: `${parentId}:${processor}`,
                'device-books': [{ name: `https://example.com/${processor}.pdf` }],
            }));
        }

        expect(manager.file.getDocParents('device').map(parent => parent.id)).toEqual([parentId]);
        expect(manager.getBooks(parentId, 'device').map(doc => doc.name)).toEqual([
            'https://example.com/CPU0.pdf',
            'https://example.com/CPU1.pdf',
        ]);
    });

    it('combines device books with stored Arm references but leaves board books separate', async () => {
        const build = createBuild({
            device: deviceId,
            board: boardId,
            processor: { core: 'Cortex-M4' },
            'device-books': [{ name: webName }],
            'board-books': [{ name: 'https://example.com/board.pdf' }],
        });
        await manager.addBooks(build);

        const armBooks = manager.getArmBooks(build);
        expect(armBooks).toContainEqual(expect.objectContaining({
            id: 'ddi0439',
            name: 'https://developer.arm.com/documentation/ddi0439/b',
            metadataUrl: 'https://documentation-service.arm.com/documentation/ddi0439/b',
        }));
        expect(armBooks.map(doc => doc.item)).toEqual(armBooks.map(doc => manager.file.getDoc(doc.name, 'arm-docs', 'common')?.item));
        expect(manager.getBooks(deviceId, 'device', build).map(doc => doc.name)).toEqual([webName, ...armBooks.map(doc => doc.name)]);
        expect(manager.getBooks(boardId, 'board', build).map(doc => doc.name)).toEqual(['https://example.com/board.pdf']);
        expect(manager.getArmBooks()).toEqual([]);
    });

    it.each([
        { description: 'relative path', name: path.join('manuals', 'user.pdf'), expectedPath: path.resolve('manuals', 'user.pdf') },
        { description: 'file URL', name: pathToFileURL(path.resolve('user.pdf')).href, expectedPath: path.resolve('user.pdf') },
        { description: 'web address', name: webName, expectedPath: undefined },
    ])('adds a user book from a $description and reuses it on repeated additions', async ({ name, expectedPath }) => {
        const doc = await manager.addUserBook(boardId, 'board', name, 'User manual', 'reference');
        const duplicate = await manager.addUserBook(boardId, 'board', name, 'Replacement title', 'other');

        expect(doc).toEqual(expect.objectContaining({
            name: expectedPath ?? name,
            path: expectedPath,
            title: 'User manual',
            category: 'reference',
            mode: 'user',
        }));
        expect(duplicate?.item).toBe(manager.file.getDoc(expectedPath ?? name, boardId, 'board')?.item);
        expect(manager.getBooks(boardId, 'board')).toEqual([doc]);
    });

    it('marks an existing imported book as user-owned without replacing its metadata or parent pack', async () => {
        await manager.addBooks(createBuild({
            board: boardId,
            'board-pack': 'Vendor::BoardPack@1.0.0',
            'board-books': [{ name: webName, title: 'Imported manual', category: 'reference' }],
        }));

        const doc = await manager.addUserBook(boardId, 'board', webName, 'Replacement title', 'other');

        expect(doc).toEqual(expect.objectContaining({ name: webName, title: 'Imported manual', category: 'reference', mode: 'user' }));
        expect(manager.getBooks(boardId, 'board')).toEqual([doc]);
        expect(manager.file.getDocParent(boardId, 'board')?.packId).toBe('Vendor::BoardPack@1.0.0');
    });

    it('scopes user books by hardware parent and normalizes processor-qualified device IDs', async () => {
        await manager.addUserBook(boardId, 'board', webName, 'Board manual');
        await manager.addUserBook(`${deviceId}:CPU0`, 'device', webName, 'Device manual');
        await manager.addUserBook('Vendor::Other', 'board', webName, 'Other manual');

        expect(manager.getBooks(boardId, 'board')).toEqual([expect.objectContaining({ title: 'Board manual', category: undefined })]);
        expect(manager.getBooks(deviceId, 'device')).toEqual([expect.objectContaining({ title: 'Device manual', category: undefined })]);
        expect(manager.getBooks('Vendor::Other', 'board')).toEqual([expect.objectContaining({ title: 'Other manual', category: undefined })]);
    });

    it.each([
        ['', webName],
        [boardId, ''],
    ])('rejects a user book with parent "%s" and name "%s"', async (parentId, name) => {
        const changed = jest.fn();
        manager.onDidChange(changed);

        expect(await manager.addUserBook(parentId, 'board', name, 'Manual')).toBeUndefined();
        expect(manager.file.getDocParents('board')).toEqual([]);
        expect(changed).not.toHaveBeenCalled();
    });

    it.each(['relative path', 'file URL'])('sets a downloaded %s on every matching reference and clears their errors', async source => {
        await manager.addUserBook(boardId, 'board', webName, 'Board manual', 'reference');
        await manager.addUserBook(deviceId, 'device', webName, 'Device manual');
        const otherName = 'https://example.com/other.pdf';
        await manager.addUserBook(boardId, 'board', otherName, 'Other manual');
        for (const doc of manager.file.findDocs(webName)) {
            doc.error = 'Download failed';
        }
        expect(await manager.file.save()).toBe(ETextFileResult.Success);
        const localPath = path.relative(process.cwd(), path.join(testData.tmpDir, 'downloads', 'manual.pdf'));
        const resolved = path.resolve(localPath);
        writeTextFile(resolved, 'manual');
        const input = source === 'file URL' ? pathToFileURL(resolved).href : localPath;

        expect(await manager.setLocalPath(boardId, 'board', webName, input)).toBe(true);

        expect(manager.file.findDocs(webName)).toEqual([
            expect.objectContaining({ name: webName, title: 'Board manual', category: 'reference', path: resolved, error: undefined, mode: 'user' }),
            expect.objectContaining({ name: webName, title: 'Device manual', path: resolved, error: undefined, mode: 'user' }),
        ]);
        expect(manager.file.getDoc(otherName, boardId, 'board')?.path).toBeUndefined();
    });

    it('retains errors when setting a local path that does not exist', async () => {
        const doc = await manager.addUserBook(boardId, 'board', webName, 'Manual');
        doc!.error = 'Download failed';
        await manager.file.save();
        const missingPath = path.join(testData.tmpDir, 'missing.pdf');

        expect(await manager.setLocalPath(boardId, 'board', webName, missingPath)).toBe(true);

        const stored = new DocsYamlFile(manager.file.fileName);
        expect(await stored.load()).toBe(ETextFileResult.Success);
        expect(stored.getDoc(webName, boardId, 'board')).toEqual(expect.objectContaining({
            path: missingPath, error: 'Download failed',
        }));
    });

    it('persists failed downloads and notifies before rejecting', async () => {
        const name = 'https://developer.arm.com/documentation/invalid/latest';
        const doc = manager.file.ensureDoc(name, 'arm-docs', 'common');
        doc.format = 'pdf';
        doc.path = path.join(testData.tmpDir, 'old.pdf');
        await manager.file.save();
        const changed = jest.fn();
        manager.onDidChange(changed);

        await expect(manager.downloadDocument('arm-docs', 'common', name)).rejects.toThrow('Invalid document id: (missing)');

        const stored = new DocsYamlFile(manager.file.fileName);
        expect(await stored.load()).toBe(ETextFileResult.Success);
        expect(stored.getDoc(name, 'arm-docs', 'common')).toEqual(expect.objectContaining({
            path: undefined, error: 'Invalid document id: (missing)',
        }));
        expect(changed).toHaveBeenCalledTimes(1);
    });

    it('persists successful download state and preserves document metadata', async () => {
        manager.dispose();
        const downloader = new DocDownload(testData.tmpDir);
        const download = jest.spyOn(downloader, 'downloadDoc').mockImplementation(async doc => {
            doc.path = path.join(testData.tmpDir, 'manual.pdf');
            doc.error = undefined;
        });
        manager = new DocManager(path.join(__dirname, 'arm-docs.json'), downloader);
        await manager.initialize(testData.tmpDir);
        const doc = await manager.addUserBook(boardId, 'board', webName, 'Manual');
        doc!.error = 'Previous error';
        await manager.file.save();
        const changed = jest.fn();
        manager.onDidChange(changed);

        expect(await manager.downloadDocument(boardId, 'board', webName)).toBe(true);

        const stored = new DocsYamlFile(manager.file.fileName);
        expect(await stored.load()).toBe(ETextFileResult.Success);
        expect(stored.getDoc(webName, boardId, 'board')).toEqual(expect.objectContaining({
            name: webName, title: 'Manual', mode: 'user', path: path.join(testData.tmpDir, 'manual.pdf'), error: undefined,
        }));
        expect(download).toHaveBeenCalledTimes(1);
        expect(changed).toHaveBeenCalledTimes(1);
        download.mockRestore();
    });

    it.each(['missing', 'https://example.com/manual.html'])('does not download an unsupported document: %s', async name => {
        if (name !== 'missing') {
            await manager.addUserBook(boardId, 'board', name, 'Manual');
        }
        const changed = jest.fn();
        manager.onDidChange(changed);

        expect(await manager.downloadDocument(boardId, 'board', name)).toBe(false);
        expect(changed).not.toHaveBeenCalled();
    });

    it.each([
        { name: 'https://example.com/manual.html', localPath: 'manual.pdf' },
        { name: path.resolve('manual.pdf'), localPath: 'manual.pdf' },
        { name: webName, localPath: '' },
        { name: webName, localPath: 'https://example.com/download.pdf' },
        { name: 'missing', localPath: 'manual.pdf' },
    ])('rejects a local path "$localPath" for "$name" without changing documents or notifying', async ({ name, localPath }) => {
        const originalPath = path.join(testData.tmpDir, 'original.pdf');
        if (name !== 'missing') {
            manager.file.ensureDoc(name, boardId, 'board').path = originalPath;
            expect(await manager.file.save()).toBe(ETextFileResult.Success);
        }
        const changed = jest.fn();
        manager.onDidChange(changed);

        expect(await manager.setLocalPath(boardId, 'board', name, localPath)).toBe(false);
        expect(manager.file.getDoc(name, boardId, 'board')?.path).toBe(name === 'missing' ? undefined : originalPath);
        expect(changed).not.toHaveBeenCalled();
    });

    it('removes only the selected user document and preserves imported and other-parent references', async () => {
        await manager.addBooks(createBuild({ board: boardId, 'board-books': [{ name: webName }] }));
        const userName = 'https://example.com/user.pdf';
        await manager.addUserBook(boardId, 'board', userName, 'Board user manual');
        await manager.addUserBook(deviceId, 'device', userName, 'Device user manual');

        expect(await manager.removeDocument(boardId, 'board', userName)).toBe(true);

        expect(manager.getBooks(boardId, 'board')).toEqual([expect.objectContaining({ name: webName, mode: undefined })]);
        expect(manager.getBooks(deviceId, 'device')).toEqual([expect.objectContaining({ name: userName, title: 'Device user manual', mode: 'user' })]);
    });

    it.each([webName, 'missing'])('does not remove an imported or missing document: %s', async name => {
        await manager.addBooks(createBuild({ board: boardId, 'board-books': [{ name: webName }] }));
        const changed = jest.fn();
        manager.onDidChange(changed);

        expect(await manager.removeDocument(boardId, 'board', name)).toBe(false);
        expect(manager.getBooks(boardId, 'board')).toEqual([expect.objectContaining({ name: webName, mode: undefined })]);
        expect(changed).not.toHaveBeenCalled();
    });

    it('retains build and user books added concurrently to the same manager', async () => {
        const userName = 'https://example.com/user.pdf';
        await Promise.all([
            manager.addBooks(createBuild({ board: boardId, 'board-books': [{ name: webName }] })),
            manager.addUserBook(boardId, 'board', userName, 'User manual'),
        ]);

        expect(manager.getBooks(boardId, 'board')).toEqual([
            expect.objectContaining({ name: webName, mode: undefined }),
            expect.objectContaining({ name: userName, title: 'User manual', mode: 'user' }),
        ]);
    });

    it('notifies after user mutations but not after unchanged operations', async () => {
        const changed = jest.fn();
        manager.onDidChange(changed);

        await manager.addUserBook(boardId, 'board', webName, 'Manual');
        expect(changed).toHaveBeenCalledTimes(1);
        await manager.addUserBook(boardId, 'board', webName, 'Replacement title');
        expect(changed).toHaveBeenCalledTimes(1);
        expect(await manager.setLocalPath(boardId, 'board', webName, 'manual.pdf')).toBe(true);
        expect(changed).toHaveBeenCalledTimes(2);
        expect(await manager.setLocalPath(boardId, 'board', webName, 'manual.pdf')).toBe(true);
        expect(changed).toHaveBeenCalledTimes(2);
        expect(await manager.removeDocument(boardId, 'board', webName)).toBe(true);
        expect(changed).toHaveBeenCalledTimes(3);
    });

    it('does not notify during initialization or build imports', async () => {
        const changed = jest.fn();
        manager.onDidChange(changed);

        await manager.initialize(testData.tmpDir);
        await manager.addBooks(createBuild({ board: boardId, 'board-books': [{ name: webName }] }));

        expect(changed).not.toHaveBeenCalled();
    });
});
