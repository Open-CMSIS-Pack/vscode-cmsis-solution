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
import * as fs from 'node:fs';
import { readFileSync } from 'node:fs';
import { pathToFileURL, URL } from 'node:url';
import { JsonFile } from '@open-cmsis-pack/cmsis-common/json-file';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { DocManager } from './doc-manager';
import { DocsYamlFile } from './docs-yaml-file';
import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { TestDataHandler } from '../__test__/test-data';
import { ArmDoc, armDocName } from './arm-docs';
import { DocDownload } from './doc-download';
import { fileExists, writeTextFile } from '../utils/fs-utils';
import * as fsUtils from '../utils/fs-utils';

describe('DocManager catalog registration', () => {
    const testData = new TestDataHandler();
    let manager: DocManager;

    beforeEach(async () => {
        manager = new DocManager(path.join(__dirname, 'arm-docs.json'));
        await manager.initialize(testData.tmpDir);
    });

    afterEach(() => {
        jest.restoreAllMocks();
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

    it.each([undefined, 'missing.pdf'])('discovers an existing Arm download when the stored path is %s', async storedPath => {
        const doc = manager.file.getDocs('arm-docs', 'common')[0];
        const destination = doc.getDestinationPath();
        doc.path = storedPath === undefined ? undefined : path.join(testData.tmpDir, storedPath);
        doc.error = 'Download failed';
        expect(await manager.file.save()).toBe(ETextFileResult.Success);
        writeTextFile(destination, '%PDF-1.7');

        expect(await manager.initialize(testData.tmpDir)).toBe(ETextFileResult.Success);

        const reloaded = new DocsYamlFile(manager.file.fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.getDoc(doc.name, 'arm-docs', 'common')).toEqual(expect.objectContaining({
            path: destination, error: undefined,
        }));
    });

    it('preserves a valid custom Arm path and unrelated error even when the default download exists', async () => {
        const doc = manager.file.getDocs('arm-docs', 'common')[0];
        const customPath = path.join(testData.tmpDir, 'selected.pdf');
        writeTextFile(customPath, '%PDF-1.7');
        writeTextFile(doc.getDestinationPath(), '%PDF-1.7');
        doc.path = customPath;
        doc.error = 'Previous download failed';
        expect(await manager.file.save()).toBe(ETextFileResult.Success);

        await manager.initialize(testData.tmpDir);

        const reloaded = new DocsYamlFile(manager.file.fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.getDoc(doc.name, 'arm-docs', 'common')).toEqual(expect.objectContaining({
            path: customPath, error: 'Previous download failed',
        }));
    });

    it.each(['common', 'board', 'device'])('validates all %s document paths and clears only recovered missing-file errors', async parentTag => {
        const parentId = parentTag === 'common' ? 'arm-docs' : `Vendor::${parentTag}`;
        const name = 'https://example.com/manual.pdf';
        const missingPath = path.join(testData.tmpDir, 'missing.pdf');
        const existingPath = path.join(testData.tmpDir, 'existing.pdf');
        writeTextFile(existingPath, '%PDF-1.7');
        const missing = manager.file.ensureDoc(name, parentId, parentTag);
        missing.path = missingPath;
        missing.mode = 'user';
        missing.error = 'Download failed';
        const existing = manager.file.ensureDoc('existing.pdf', parentId, parentTag);
        existing.path = existingPath;
        existing.error = 'Unrelated error';
        const noPath = manager.file.ensureDoc('https://example.com/online.html', parentId, parentTag);
        const noPathError = manager.file.ensureDoc('https://example.com/failed.pdf', parentId, parentTag);
        noPathError.error = 'HTTP 404';
        expect(await manager.file.save()).toBe(ETextFileResult.Success);

        expect(await manager.initialize(testData.tmpDir)).toBe(ETextFileResult.Success);

        const reloaded = new DocsYamlFile(manager.file.fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.getDoc(name, parentId, parentTag)).toEqual(expect.objectContaining({
            path: missingPath, error: 'File not exists', mode: 'user',
        }));
        expect(reloaded.getDoc(existing.name, parentId, parentTag)).toEqual(expect.objectContaining({
            path: existingPath, error: 'Unrelated error',
        }));
        expect(reloaded.getDoc(noPath.name, parentId, parentTag)).toEqual(expect.objectContaining({
            path: undefined, error: undefined,
        }));
        expect(reloaded.getDoc(noPathError.name, parentId, parentTag)).toEqual(expect.objectContaining({
            path: undefined, error: 'HTTP 404',
        }));

        writeTextFile(missingPath, '%PDF-1.7');
        expect(await manager.initialize(testData.tmpDir)).toBe(ETextFileResult.Success);

        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        expect(reloaded.getDoc(name, parentId, parentTag)).toEqual(expect.objectContaining({
            path: missingPath, error: undefined, mode: 'user',
        }));
        expect(reloaded.getDoc(existing.name, parentId, parentTag)?.error).toBe('Unrelated error');
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
        jest.restoreAllMocks();
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

    it.each(['relative path', 'file URL'])('copies a user book from a %s and persists its managed path', async inputType => {
        const source = path.join(testData.tmpDir, 'books', 'user.pdf');
        writeTextFile(source, 'User document');
        const input = inputType === 'file URL' ? pathToFileURL(source).href : path.relative(process.cwd(), source);

        const doc = await manager.addUserBook(`${deviceId}:CPU0`, 'device', input, 'User manual', 'reference');

        const destination = path.join(testData.tmpDir, 'docs', 'Vendor', 'Device', 'user', 'user.pdf');
        expect(doc).toEqual(expect.objectContaining({ name: source, path: destination, title: 'User manual', category: 'reference', mode: 'user' }));
        expect(readFileSync(source, 'utf8')).toBe('User document');
        expect(readFileSync(destination, 'utf8')).toBe('User document');
        const stored = new DocsYamlFile(manager.file.fileName);
        expect(await stored.load()).toBe(ETextFileResult.Success);
        expect(stored.getDoc(source, deviceId, 'device')?.path).toBe(destination);
    });

    it.each([false, true])('reuses a same-filename user entry and confirms overwriting its managed file, approved: %s', async approved => {
        const source = path.join(testData.tmpDir, 'old', 'manual.pdf');
        const replacement = path.join(testData.tmpDir, 'new', 'manual.pdf');
        writeTextFile(source, 'Original document');
        writeTextFile(replacement, 'Replacement document');
        const original = await manager.addUserBook(boardId, 'board', source, 'Original title', 'reference');
        const other = await manager.addUserBook(deviceId, 'device', source, 'Device manual');
        const destination = original!.path!;
        const before = manager.file.stringify();
        const changed = jest.fn();
        manager.onDidChange(changed);
        const confirm = jest.fn().mockResolvedValue(approved);

        const result = await manager.addUserBook(boardId, 'board', replacement, 'New title', 'other', confirm);

        expect(confirm).toHaveBeenCalledWith([destination]);
        expect(changed).not.toHaveBeenCalled();
        expect(manager.getBooks(boardId, 'board')).toEqual([expect.objectContaining({
            name: source, path: destination, title: 'Original title', category: 'reference', mode: 'user',
        })]);
        expect(readFileSync(destination, 'utf8')).toBe(approved ? 'Replacement document' : 'Original document');
        expect(readFileSync(other!.path!, 'utf8')).toBe('Original document');
        expect(readFileSync(source, 'utf8')).toBe('Original document');
        expect(readFileSync(replacement, 'utf8')).toBe('Replacement document');
        if (!approved) {
            expect(result).toBeNull();
            expect(manager.file.stringify()).toBe(before);
        }
    });

    it.each([
        { name: webName, format: 'pdf', locationType: 'W' },
        { name: 'https://example.com/manual.html', format: 'html', locationType: 'H' },
        { name: 'https://example.com/manual', format: undefined, locationType: 'H' },
    ])('imports only the selected $locationType reference while retaining its identity and metadata', async ({ name, format, locationType }) => {
        await manager.addBooks(createBuild({
            board: boardId, device: deviceId,
            'board-books': [{ name, title: 'Board manual', category: 'reference' }],
            'device-books': [{ name, title: 'Device manual' }],
        }));
        const doc = manager.file.getDoc(name, boardId, 'board')!;
        doc.id = 'manual';
        doc.version = '1';
        doc.format = format;
        doc.metadataUrl = 'https://example.com/metadata';
        doc.error = 'Download failed';
        await manager.file.save();
        const source = path.join(testData.tmpDir, 'replacement.pdf');
        writeTextFile(source, 'Imported document');
        const changed = jest.fn();
        manager.onDidChange(changed);

        expect(await manager.importDocument(boardId, 'board', name, pathToFileURL(source).href)).toBe(true);

        const stored = new DocsYamlFile(manager.file.fileName);
        expect(await stored.load()).toBe(ETextFileResult.Success);
        const destination = doc.getDestinationPath();
        expect(stored.getDoc(name, boardId, 'board')).toEqual(expect.objectContaining({
            name, title: 'Board manual', category: 'reference', id: 'manual', version: '1', format, locationType,
            metadataUrl: 'https://example.com/metadata', mode: undefined, path: destination, error: undefined,
        }));
        expect(stored.getDoc(name, deviceId, 'device')?.path).toBeUndefined();
        expect(readFileSync(destination, 'utf8')).toBe('Imported document');
        expect(readFileSync(source, 'utf8')).toBe('Imported document');
        expect(changed).toHaveBeenCalledTimes(1);
    });

    it.each(['add', 'import'])('avoids self-copying during %s', async operation => {
        const doc = manager.file.ensureDoc(webName, boardId, 'board');
        await manager.file.save();
        const destination = doc.getDestinationPath();
        writeTextFile(destination, 'Existing document');
        const confirm = jest.fn();
        const copy = jest.spyOn(fsUtils, 'copyFile');

        if (operation === 'add') {
            expect(await manager.addUserBook(boardId, 'board', destination, 'Manual', undefined, confirm)).toEqual(expect.objectContaining({ path: destination }));
        } else {
            expect(await manager.importDocument(boardId, 'board', webName, destination, confirm)).toBe(true);
        }
        expect(confirm).not.toHaveBeenCalled();
        expect(copy).not.toHaveBeenCalled();
        expect(readFileSync(destination, 'utf8')).toBe('Existing document');
    });

    it.each(['missing', 'directory'])('rejects a %s source without adding an inventory entry', async sourceType => {
        const source = sourceType === 'directory' ? testData.tmpDir : path.join(testData.tmpDir, 'missing.pdf');
        const before = manager.file.stringify();
        const reporter = jest.fn();
        DocManager.setErrorReporter(reporter);
        try {
            expect(await manager.addUserBook(boardId, 'board', source, 'Manual')).toBeUndefined();
            expect(manager.file.stringify()).toBe(before);
            expect(reporter).toHaveBeenCalledTimes(1);
        } finally {
            DocManager.setErrorReporter();
        }
    });

    it('reports a copy failure without updating the inventory', async () => {
        const doc = manager.file.ensureDoc(webName, boardId, 'board');
        doc.path = path.join(testData.tmpDir, 'legacy.pdf');
        doc.error = 'Previous error';
        await manager.file.save();
        const destination = doc.getDestinationPath();
        const source = path.join(testData.tmpDir, 'source.pdf');
        writeTextFile(source, 'Replacement document');
        writeTextFile(destination, 'Original document');
        const before = manager.file.stringify();
        const changed = jest.fn();
        manager.onDidChange(changed);
        const reporter = jest.fn();
        DocManager.setErrorReporter(reporter);
        jest.spyOn(fsUtils, 'copyFile').mockImplementationOnce(() => { throw new Error('Copy failed'); });
        try {
            expect(await manager.importDocument(boardId, 'board', webName, source, async () => true)).toBe(false);
            expect(manager.file.stringify()).toBe(before);
            expect(changed).not.toHaveBeenCalled();
            expect(reporter).toHaveBeenCalledTimes(1);
        } finally {
            DocManager.setErrorReporter();
        }
    });

    it.each([false, true])('confirms an existing download destination before changing state, approved: %s', async approved => {
        manager.dispose();
        const downloader = new DocDownload();
        const download = jest.spyOn(downloader, 'downloadDoc').mockResolvedValue(undefined);
        manager = new DocManager(path.join(__dirname, 'arm-docs.json'), downloader);
        await manager.initialize(testData.tmpDir);
        const doc = manager.file.ensureDoc(webName, boardId, 'board');
        const destination = path.join(testData.tmpDir, 'docs', 'Vendor', 'Board', 'manual', 'manual.pdf');
        writeTextFile(destination, 'Original document');
        doc!.path = path.join(testData.tmpDir, 'previous.pdf');
        doc!.error = 'Previous error';
        await manager.file.save();
        const before = manager.file.stringify();
        const changed = jest.fn();
        manager.onDidChange(changed);
        const confirm = jest.fn().mockResolvedValue(approved);

        await manager.downloadDocument(boardId, 'board', webName, confirm);

        expect(confirm).toHaveBeenCalledWith([destination]);
        expect(download).toHaveBeenCalledTimes(approved ? 1 : 0);
        expect(changed).toHaveBeenCalledTimes(approved ? 1 : 0);
        expect(readFileSync(destination, 'utf8')).toBe('Original document');
        if (!approved) {
            expect(manager.file.stringify()).toBe(before);
        } else {
            expect(manager.file.getDoc(webName, boardId, 'board')).toEqual(expect.objectContaining({ path: destination, error: undefined }));
        }
    });

    it.each([
        { failure: new Error('HTTP 404'), reason: 'HTTP 404' },
        { failure: 'Connection reset', reason: 'Connection reset' },
        { failure: undefined, reason: 'Error downloading file' },
    ])('reports the download reason "$reason" without persisting it or logging to console', async ({ failure, reason }) => {
        manager.file.ensureDoc(webName, boardId, 'board');
        await manager.file.save();
        const download = jest.spyOn(DocDownload.prototype, 'downloadDoc').mockRejectedValueOnce(failure);
        const errorReporter = jest.fn();
        const consoleError = jest.spyOn(console, 'error').mockImplementation();
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
        const consoleLog = jest.spyOn(console, 'log').mockImplementation();
        DocManager.setErrorReporter(errorReporter);

        try {
            await expect(manager.downloadDocument(boardId, 'board', webName)).resolves.toBeUndefined();

            expect(errorReporter).toHaveBeenCalledTimes(1);
            expect(errorReporter).toHaveBeenCalledWith(`Error : download failed ${webName} : ${reason}`);
            const stored = new DocsYamlFile(manager.file.fileName);
            expect(await stored.load()).toBe(ETextFileResult.Success);
            expect(stored.getDoc(webName, boardId, 'board')?.error).toBe('Download failed');
            expect(consoleError).not.toHaveBeenCalled();
            expect(consoleWarn).not.toHaveBeenCalled();
            expect(consoleLog).not.toHaveBeenCalled();
        } finally {
            DocManager.setErrorReporter();
            download.mockRestore();
            consoleError.mockRestore();
            consoleWarn.mockRestore();
            consoleLog.mockRestore();
        }
    });

    it('preserves the previous path and persists errors when destination preparation fails', async () => {
        const name = 'https://developer.arm.com/documentation/invalid/latest';
        const doc = manager.file.ensureDoc(name, 'arm-docs', 'common');
        doc.format = 'pdf';
        const previousPath = path.join(testData.tmpDir, 'old.pdf');
        doc.path = previousPath;
        await manager.file.save();
        const changed = jest.fn();
        manager.onDidChange(changed);

        const errorReporter = jest.fn();
        DocManager.setErrorReporter(errorReporter);
        try {
            await expect(manager.downloadDocument('arm-docs', 'common', name)).resolves.toBeUndefined();

            expect(errorReporter).toHaveBeenCalledTimes(1);
            expect(errorReporter).toHaveBeenCalledWith(`Error : download failed ${name} : Invalid document id: (missing)`);
            const stored = new DocsYamlFile(manager.file.fileName);
            expect(await stored.load()).toBe(ETextFileResult.Success);
            expect(stored.getDoc(name, 'arm-docs', 'common')).toEqual(expect.objectContaining({
                path: previousPath, error: 'Download failed',
            }));
            expect(changed).toHaveBeenCalledTimes(1);
        } finally {
            DocManager.setErrorReporter();
        }
    });

    it.each([false, true])('assigns the destination before transfer and persists download state, failure: %s', async fails => {
        manager.dispose();
        const downloader = new DocDownload();
        const destination = path.join(testData.tmpDir, 'docs', 'Vendor', 'Board', 'manual', 'manual.pdf');
        let transferState: { path: string | undefined; error: string | undefined } | undefined;
        const download = jest.spyOn(downloader, 'downloadDoc').mockImplementationOnce(async () => {
            const current = manager.file.getDoc(webName, boardId, 'board')!;
            transferState = { path: current.path, error: current.error };
            if (fails) {
                throw new Error('Transfer failed');
            }
        });
        manager = new DocManager(path.join(__dirname, 'arm-docs.json'), downloader);
        await manager.initialize(testData.tmpDir);
        const doc = manager.file.ensureDoc(webName, boardId, 'board');
        doc!.path = path.join(testData.tmpDir, 'previous.pdf');
        doc!.error = 'Previous error';
        await manager.file.save();
        const changed = jest.fn();
        manager.onDidChange(changed);

        try {
            await expect(manager.downloadDocument(boardId, 'board', webName)).resolves.toBeUndefined();

            expect(transferState).toEqual({ path: destination, error: undefined });
            const stored = new DocsYamlFile(manager.file.fileName);
            expect(await stored.load()).toBe(ETextFileResult.Success);
            expect(stored.getDoc(webName, boardId, 'board')).toEqual(expect.objectContaining({
                name: webName, title: webName, mode: undefined, path: destination, error: fails ? 'Download failed' : undefined,
            }));
            expect(download).toHaveBeenCalledWith(new URL(webName), destination, false, undefined);
            expect(changed).toHaveBeenCalledTimes(1);
        } finally {
            download.mockRestore();
        }
    });

    it('prepares common Arm PDF metadata and transfer arguments', async () => {
        manager.dispose();
        const downloader = new DocDownload();
        const download = jest.spyOn(downloader, 'downloadDoc').mockResolvedValue(undefined);
        manager = new DocManager(path.join(__dirname, 'arm-docs.json'), downloader);
        await manager.initialize(testData.tmpDir);
        const name = 'https://developer.arm.com/documentation/100230/latest';
        const destination = path.join(testData.tmpDir, 'docs', '100230-latest', '100230-latest.pdf');
        const doc = manager.file.ensureDoc(name, 'arm-docs', 'common');
        doc.id = '100230';
        doc.version = 'latest';
        doc.format = 'pdf';
        doc.metadataUrl = 'https://documentation-service.arm.com/documentation/100230/latest';
        doc.error = 'Previous error';
        await manager.file.save();

        try {
            await expect(manager.downloadDocument('arm-docs', 'common', name)).resolves.toBeUndefined();

            expect(download).toHaveBeenCalledWith(new URL(doc.metadataUrl), destination, true, '100230');
            const stored = new DocsYamlFile(manager.file.fileName);
            expect(await stored.load()).toBe(ETextFileResult.Success);
            expect(stored.getDoc(name, 'arm-docs', 'common')).toEqual(expect.objectContaining({
                name, id: '100230', version: 'latest', format: 'pdf', metadataUrl: doc.metadataUrl,
                path: destination, error: undefined,
            }));
        } finally {
            download.mockRestore();
        }
    });

    it.each([false, true])('preserves the current path when a document is replaced during a download, failure: %s', async fails => {
        const previousPath = path.join(testData.tmpDir, 'previous.pdf');
        const failure = new Error('Transfer failed');
        const original = manager.file.ensureDoc(webName, boardId, 'board');
        original!.path = previousPath;
        original!.error = 'Previous error';
        await manager.file.save();
        await manager.file.save();
        const download = jest.spyOn(DocDownload.prototype, 'downloadDoc').mockImplementationOnce(async () => {
            manager.file.removeDoc(webName, boardId, 'board');
            const current = manager.file.ensureDoc(webName, boardId, 'board');
            current.title = 'Updated manual';
            current.path = previousPath;
            current.error = 'Previous error';
            if (fails) {
                throw failure;
            }
        });

        try {
            await expect(manager.downloadDocument(boardId, 'board', webName)).resolves.toBeUndefined();

            const stored = new DocsYamlFile(manager.file.fileName);
            expect(await stored.load()).toBe(ETextFileResult.Success);
            expect(stored.getDoc(webName, boardId, 'board')).toEqual(expect.objectContaining({
                title: 'Updated manual',
                path: previousPath,
                error: fails ? 'Download failed' : 'Previous error',
            }));
            expect(original!.path).toEqual(expect.stringContaining(path.join('Vendor', 'Board', 'manual', 'manual.pdf')));
            expect(original!.error).toBeUndefined();
        } finally {
            download.mockRestore();
        }
    });

    it.each([false, true])('does not recreate a document removed during a download, failure: %s', async fails => {
        manager.file.ensureDoc(webName, boardId, 'board');
        const failure = new Error('Transfer failed');
        const changed = jest.fn();
        manager.onDidChange(changed);
        await manager.file.save();
        const download = jest.spyOn(DocDownload.prototype, 'downloadDoc').mockImplementationOnce(async () => {
            manager.file.removeDoc(webName, boardId, 'board');
            if (fails) {
                throw failure;
            }
        });

        try {
            await expect(manager.downloadDocument(boardId, 'board', webName)).resolves.toBeUndefined();

            expect(manager.file.getDoc(webName, boardId, 'board')).toBeUndefined();
            expect(changed).toHaveBeenCalledTimes(1);
        } finally {
            download.mockRestore();
        }
    });

    it.each([
        { name: 'missing', mode: undefined },
        { name: 'https://example.com/manual.html', mode: undefined },
        { name: '${CMSIS_PACK_ROOT}/manual.pdf', mode: undefined },
        { name: webName, mode: 'user' as const },
    ])('rejects Import and Download for an ineligible document: $name ($mode)', async ({ name, mode }) => {
        if (name !== 'missing') {
            manager.file.ensureDoc(name, boardId, 'board').mode = mode;
            await manager.file.save();
        }
        const before = manager.file.stringify();
        const download = jest.spyOn(DocDownload.prototype, 'downloadDoc');
        const changed = jest.fn();
        manager.onDidChange(changed);

        await expect(manager.downloadDocument(boardId, 'board', name)).resolves.toBeUndefined();
        expect(await manager.importDocument(boardId, 'board', name, 'manual.pdf')).toBe(false);
        expect(download).not.toHaveBeenCalled();
        expect(manager.file.stringify()).toBe(before);
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

        expect(await manager.importDocument(boardId, 'board', name, localPath)).toBe(false);
        expect(manager.file.getDoc(name, boardId, 'board')?.path).toBe(name === 'missing' ? undefined : originalPath);
        expect(changed).not.toHaveBeenCalled();
    });

    it('removes the selected managed directory and companions while retaining other documents and the source', async () => {
        const source = path.join(testData.tmpDir, 'source', 'manual.pdf');
        writeTextFile(source, 'Original');
        const selected = await manager.addUserBook(boardId, 'board', source, 'Board user manual');
        const other = await manager.addUserBook(deviceId, 'device', source, 'Device user manual');
        const siblingSource = path.join(testData.tmpDir, 'source', 'other.pdf');
        writeTextFile(siblingSource, 'Other');
        const sibling = await manager.addUserBook(boardId, 'board', siblingSource, 'Other manual');
        writeTextFile(path.join(selected!.indexDir!, 'generated', 'index.txt'), 'Companion');

        expect(await manager.removeDocument(boardId, 'board', selected!.name)).toBe(true);

        expect(fileExists(selected!.indexDir)).toBe(false);
        expect(fileExists(path.dirname(selected!.indexDir!))).toBe(true);
        expect(readFileSync(other!.path!, 'utf8')).toBe('Original');
        expect(readFileSync(sibling!.path!, 'utf8')).toBe('Other');
        expect(readFileSync(source, 'utf8')).toBe('Original');
        const stored = new DocsYamlFile(manager.file.fileName);
        expect(await stored.load()).toBe(ETextFileResult.Success);
        expect(stored.getDoc(source, boardId, 'board')).toBeUndefined();
        expect(stored.getDoc(source, deviceId, 'device')?.path).toBe(other!.path);
    });

    it('removes an entry whose managed directory is already missing', async () => {
        const doc = manager.file.ensureDoc('manual.pdf', boardId, 'board');
        doc.mode = 'user';
        doc.path = doc.getDestinationPath();
        await manager.file.save();

        expect(await manager.removeDocument(boardId, 'board', doc.name)).toBe(true);
        expect(manager.file.getDoc(doc.name, boardId, 'board')).toBeUndefined();
    });

    it('removes a legacy external entry without deleting its file', async () => {
        const source = path.join(testData.tmpDir, 'external', 'manual.pdf');
        writeTextFile(source, 'Original');
        const doc = manager.file.ensureDoc(source, boardId, 'board');
        doc.mode = 'user';
        doc.path = source;
        await manager.file.save();

        expect(await manager.removeDocument(boardId, 'board', source)).toBe(true);
        expect(readFileSync(source, 'utf8')).toBe('Original');
    });

    it('retains the entry and reports a managed-directory deletion failure', async () => {
        const source = path.join(testData.tmpDir, 'source.pdf');
        writeTextFile(source, 'Original');
        const doc = await manager.addUserBook(boardId, 'board', source, 'Manual');
        const before = manager.file.stringify();
        const reporter = jest.fn();
        DocManager.setErrorReporter(reporter);
        const remove = jest.spyOn(jest.requireActual<typeof fs>('node:fs'), 'rmSync').mockImplementationOnce(() => { throw new Error('Access denied'); });
        try {
            expect(await manager.removeDocument(boardId, 'board', source)).toBe(false);
            expect(manager.file.stringify()).toBe(before);
            expect(readFileSync(doc!.path!, 'utf8')).toBe('Original');
            expect(reporter).toHaveBeenCalledWith(expect.stringContaining('Access denied'));
        } finally {
            remove.mockRestore();
            DocManager.setErrorReporter();
        }
    });

    it('retains the entry when its managed directory redirects to an external directory', async () => {
        const external = path.join(testData.tmpDir, 'external');
        const original = path.join(external, 'manual.pdf');
        writeTextFile(original, 'Original');
        const doc = manager.file.ensureDoc('manual.pdf', boardId, 'board');
        doc.mode = 'user';
        doc.path = doc.getDestinationPath();
        await manager.file.save();
        fs.mkdirSync(path.dirname(doc.indexDir!), { recursive: true });
        fs.symlinkSync(external, doc.indexDir!, 'junction');
        const reporter = jest.fn();
        DocManager.setErrorReporter(reporter);
        try {
            expect(await manager.removeDocument(boardId, 'board', doc.name)).toBe(false);
            expect(manager.file.getDoc(doc.name, boardId, 'board')).toBeDefined();
            expect(readFileSync(original, 'utf8')).toBe('Original');
            expect(reporter).toHaveBeenCalledTimes(1);
        } finally {
            DocManager.setErrorReporter();
        }
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

    it('does not notify during initialization or build imports', async () => {
        const changed = jest.fn();
        manager.onDidChange(changed);

        await manager.initialize(testData.tmpDir);
        await manager.addBooks(createBuild({ board: boardId, 'board-books': [{ name: webName }] }));

        expect(changed).not.toHaveBeenCalled();
    });
});
