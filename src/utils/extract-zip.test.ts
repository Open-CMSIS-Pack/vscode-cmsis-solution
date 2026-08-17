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

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { setImmediate } from 'timers';
import { crc32 } from 'zlib';
import { extractZip } from './extract-zip';

globalThis.setImmediate = setImmediate;

async function writeZip(
    zipPath: string,
    entries: Array<{ name: string; contents: string; mode?: number; archiveName?: string }>,
): Promise<void> {
    const localRecords: Buffer[] = [];
    const centralRecords: Buffer[] = [];
    let localOffset = 0;

    for (const entry of entries) {
        const name = Buffer.from(entry.name);
        const contents = Buffer.from(entry.contents);
        const checksum = crc32(contents);
        const localHeader = Buffer.alloc(30);
        localHeader.writeUInt32LE(0x04034b50, 0);
        localHeader.writeUInt16LE(20, 4);
        localHeader.writeUInt16LE(0x0800, 6);
        localHeader.writeUInt32LE(checksum, 14);
        localHeader.writeUInt32LE(contents.length, 18);
        localHeader.writeUInt32LE(contents.length, 22);
        localHeader.writeUInt16LE(name.length, 26);
        localRecords.push(localHeader, name, contents);

        const centralHeader = Buffer.alloc(46);
        centralHeader.writeUInt32LE(0x02014b50, 0);
        centralHeader.writeUInt16LE(0x0314, 4);
        centralHeader.writeUInt16LE(20, 6);
        centralHeader.writeUInt16LE(0x0800, 8);
        centralHeader.writeUInt32LE(checksum, 16);
        centralHeader.writeUInt32LE(contents.length, 20);
        centralHeader.writeUInt32LE(contents.length, 24);
        centralHeader.writeUInt16LE(name.length, 28);
        centralHeader.writeUInt32LE(((entry.mode ?? 0o100664) << 16) >>> 0, 38);
        centralHeader.writeUInt32LE(localOffset, 42);
        centralRecords.push(centralHeader, name);

        localOffset += localHeader.length + name.length + contents.length;
    }

    const centralDirectory = Buffer.concat(centralRecords);
    const endRecord = Buffer.alloc(22);
    endRecord.writeUInt32LE(0x06054b50, 0);
    endRecord.writeUInt16LE(entries.length, 8);
    endRecord.writeUInt16LE(entries.length, 10);
    endRecord.writeUInt32LE(centralDirectory.length, 12);
    endRecord.writeUInt32LE(localOffset, 16);

    await fs.writeFile(zipPath, Buffer.concat([...localRecords, centralDirectory, endRecord]));

    let archive = await fs.readFile(zipPath);
    for (const entry of entries) {
        if (entry.archiveName) {
            expect(entry.archiveName).toHaveLength(entry.name.length);
            archive = Buffer.from(archive.toString('binary').replaceAll(entry.name, entry.archiveName), 'binary');
        }
    }
    await fs.writeFile(zipPath, archive);
}

describe('extractZip', () => {
    let testRoot: string;

    beforeEach(async () => {
        testRoot = await fs.mkdtemp(path.join(tmpdir(), 'extract-zip-test-'));
    });

    afterEach(async () => {
        await fs.rm(testRoot, { recursive: true, force: true });
    });

    it('extracts regular files', async () => {
        const zipPath = path.join(testRoot, 'archive.zip');
        const destination = path.join(testRoot, 'destination');
        await writeZip(zipPath, [{ name: 'folder/file.txt', contents: 'contents' }]);

        await extractZip(zipPath, destination);

        await expect(fs.readFile(path.join(destination, 'folder', 'file.txt'), 'utf8')).resolves.toBe('contents');
    });

    it.each(['..config', '.../file.txt'])('extracts a safe entry named %s', async entryName => {
        const zipPath = path.join(testRoot, 'archive.zip');
        const destination = path.join(testRoot, 'destination');
        await writeZip(zipPath, [{ name: entryName, contents: 'contents' }]);

        await extractZip(zipPath, destination);

        await expect(fs.readFile(path.join(destination, entryName), 'utf8')).resolves.toBe('contents');
    });

    it('overwrites an existing regular file', async () => {
        const zipPath = path.join(testRoot, 'archive.zip');
        const destination = path.join(testRoot, 'destination');
        const extractedFile = path.join(destination, 'file.txt');
        await fs.mkdir(destination);
        await fs.writeFile(extractedFile, 'old contents');
        await writeZip(zipPath, [{ name: 'file.txt', contents: 'new contents' }]);

        await extractZip(zipPath, destination);

        await expect(fs.readFile(extractedFile, 'utf8')).resolves.toBe('new contents');
    });

    it('allows duplicate entries to overwrite earlier entries', async () => {
        const zipPath = path.join(testRoot, 'archive.zip');
        const destination = path.join(testRoot, 'destination');
        await writeZip(zipPath, [
            { name: 'file.txt', contents: 'first contents' },
            { name: 'file.txt', contents: 'last contents' },
        ]);

        await extractZip(zipPath, destination);

        await expect(fs.readFile(path.join(destination, 'file.txt'), 'utf8')).resolves.toBe('last contents');
    });

    it('removes the staged file when an existing destination is unsafe', async () => {
        const zipPath = path.join(testRoot, 'archive.zip');
        const destination = path.join(testRoot, 'destination');
        const extractedPath = path.join(destination, 'file.txt');
        await fs.mkdir(extractedPath, { recursive: true });
        await writeZip(zipPath, [{ name: 'file.txt', contents: 'contents' }]);

        await expect(extractZip(zipPath, destination)).rejects.toThrow('unsafe destination path');

        await expect(fs.stat(extractedPath)).resolves.toMatchObject({ isDirectory: expect.any(Function) });
        await expect(fs.readdir(destination)).resolves.toEqual(['file.txt']);
    });

    it('rejects entries that escape the extraction directory', async () => {
        const zipPath = path.join(testRoot, 'archive.zip');
        const destination = path.join(testRoot, 'destination');
        await writeZip(zipPath, [{ name: 'xx/outside.txt', archiveName: '../outside.txt', contents: 'escaped' }]);

        await expect(extractZip(zipPath, destination)).rejects.toThrow();
        await expect(fs.stat(path.join(testRoot, 'outside.txt'))).rejects.toMatchObject({ code: 'ENOENT' });
    });

    it('rejects symbolic links before a later entry can traverse them', async () => {
        const zipPath = path.join(testRoot, 'archive.zip');
        const destination = path.join(testRoot, 'destination');
        await writeZip(zipPath, [
            { name: 'link', contents: '..', mode: 0o120777 },
            { name: 'link/outside.txt', contents: 'escaped' },
        ]);

        await expect(extractZip(zipPath, destination)).rejects.toThrow('symbolic links are not allowed');
        await expect(fs.stat(path.join(testRoot, 'outside.txt'))).rejects.toMatchObject({ code: 'ENOENT' });
    });
});
