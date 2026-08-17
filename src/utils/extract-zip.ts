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

import { createWriteStream, promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Entry, open, ZipFile } from 'yauzl';

const fileTypeMask = 0o170000;
const directoryType = 0o040000;
const symbolicLinkType = 0o120000;

function openZip(zipPath: string): Promise<ZipFile> {
    return new Promise((resolve, reject) => {
        open(zipPath, { lazyEntries: true, strictFileNames: true }, (error, zipFile) => {
            if (error) {
                reject(error);
            } else {
                resolve(zipFile);
            }
        });
    });
}

function openReadStream(zipFile: ZipFile, entry: Entry): Promise<NodeJS.ReadableStream> {
    return new Promise((resolve, reject) => {
        zipFile.openReadStream(entry, (error, readStream) => {
            if (error) {
                reject(error);
            } else {
                resolve(readStream);
            }
        });
    });
}

function entryMode(entry: Entry): number {
    return (entry.externalFileAttributes >>> 16) & 0xffff;
}

function escapesRoot(relativePath: string): boolean {
    return relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath);
}

async function ensureSafeDirectory(root: string, directory: string): Promise<void> {
    const relativeDirectory = path.relative(root, directory);
    if (escapesRoot(relativeDirectory)) {
        throw new Error(`ZIP entry escapes extraction directory: ${relativeDirectory}`);
    }

    let currentDirectory = root;
    for (const segment of relativeDirectory.split(path.sep).filter(Boolean)) {
        currentDirectory = path.join(currentDirectory, segment);
        try {
            const stats = await fs.lstat(currentDirectory);
            if (!stats.isDirectory() || stats.isSymbolicLink()) {
                throw new Error(`ZIP entry has an unsafe parent path: ${relativeDirectory}`);
            }
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
            await fs.mkdir(currentDirectory);
        }
    }
}

async function replaceRegularFile(temporary: string, destination: string): Promise<void> {
    try {
        const stats = await fs.lstat(destination);
        if (!stats.isFile() || stats.isSymbolicLink()) {
            throw new Error(`ZIP entry has an unsafe destination path: ${destination}`);
        }
        await fs.rm(destination);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
        }
    }
    await fs.rename(temporary, destination);
}

async function extractEntry(zipFile: ZipFile, entry: Entry, root: string): Promise<void> {
    const mode = entryMode(entry);
    if ((mode & fileTypeMask) === symbolicLinkType) {
        throw new Error(`ZIP symbolic links are not allowed: ${entry.fileName}`);
    }

    const destination = path.resolve(root, entry.fileName);
    const relativeDestination = path.relative(root, destination);
    if (!relativeDestination || escapesRoot(relativeDestination)) {
        throw new Error(`ZIP entry escapes extraction directory: ${entry.fileName}`);
    }

    const isDirectory = (mode & fileTypeMask) === directoryType || entry.fileName.endsWith('/');
    await ensureSafeDirectory(root, isDirectory ? destination : path.dirname(destination));
    if (isDirectory) {
        return;
    }

    const temporary = path.join(path.dirname(destination), `.${path.basename(destination)}.${randomUUID()}.tmp`);
    try {
        const readStream = await openReadStream(zipFile, entry);
        const writeStream = createWriteStream(temporary, {
            flags: 'wx',
            mode: mode & 0o777 || 0o644,
        });
        await pipeline(readStream, writeStream);
        await replaceRegularFile(temporary, destination);
    } finally {
        await fs.rm(temporary, { force: true });
    }
}

export async function extractZip(zipPath: string, destination: string): Promise<void> {
    const root = path.resolve(destination);
    await fs.mkdir(root, { recursive: true });
    const rootStats = await fs.lstat(root);
    if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) {
        throw new Error(`ZIP extraction destination must be a directory: ${destination}`);
    }

    const zipFile = await openZip(zipPath);
    return new Promise((resolve, reject) => {
        let settled = false;
        const fail = (error: unknown) => {
            if (!settled) {
                settled = true;
                zipFile.close();
                reject(error);
            }
        };

        zipFile.on('error', fail);
        zipFile.on('end', () => {
            if (!settled) {
                settled = true;
                resolve();
            }
        });
        zipFile.on('entry', entry => {
            void extractEntry(zipFile, entry, root)
                .then(() => zipFile.readEntry())
                .catch(fail);
        });
        zipFile.readEntry();
    });
}
