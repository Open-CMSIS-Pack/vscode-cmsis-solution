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
import { DocManager } from './doc-manager';
import { DocsYamlFile } from './docs-yaml-file';

describe('DocManager', () => {
    const docsDirectory = path.resolve('inventory');
    const fileName = path.join(docsDirectory, 'docs.yml');
    let files: Map<string, string>;
    let fileSystem: jest.Mocked<ITextFileSystem>;

    beforeEach(() => {
        files = new Map([[fileName,
            'docs: {boards: [{board: Vendor::Board, docs: [{name: manual, path: manual.pdf}]}]}\n',
        ]]);
        fileSystem = {
            exists: jest.fn(name => files.has(name)),
            read: jest.fn(name => files.get(name) ?? ''),
            write: jest.fn((name, text) => { files.set(name, text); }),
            unlink: jest.fn(name => { files.delete(name); }),
            dirname: jest.fn(path.dirname),
            resolve: jest.fn(path.resolve),
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
