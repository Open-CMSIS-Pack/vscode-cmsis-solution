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
import { Readable, Transform, TransformCallback } from 'stream';
import { pipeline } from 'stream/promises';
import { Entry, open, ZipFile } from 'yauzl';

const fileTypeMask = 0o170000;
const directoryType = 0o040000;
const symbolicLinkType = 0o120000;

export interface ExtractZipLimits {
    maxEntries: number;
    maxEntryBytes: number;
    maxTotalBytes: number;
}

const defaultLimits: ExtractZipLimits = {
    maxEntries: 10_000,
    maxEntryBytes: 512 * 1024 * 1024,
    maxTotalBytes: 2 * 1024 * 1024 * 1024,
};

interface ExtractionProgress {
    totalBytes: number;
}

class LimitBytesTransform extends Transform {
    private entryBytes = 0;
    public limitError: Error | undefined;

    constructor(
        private readonly entryName: string,
        private readonly progress: ExtractionProgress,
        private readonly limits: ExtractZipLimits,
        private readonly source: Readable,
    ) {
        super();
    }

    private rejectChunk(error: Error, callback: TransformCallback): void {
        this.limitError = error;
        this.source.unpipe(this);
        this.source.destroy();
        callback(error);
    }

    override _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
        const entryBytes = this.entryBytes + chunk.length;
        if (entryBytes > this.limits.maxEntryBytes) {
            this.rejectChunk(new Error(`ZIP entry exceeds the uncompressed size limit: ${this.entryName}`), callback);
            return;
        }

        const totalBytes = this.progress.totalBytes + chunk.length;
        if (totalBytes > this.limits.maxTotalBytes) {
            this.rejectChunk(new Error('ZIP archive exceeds the total uncompressed size limit'), callback);
            return;
        }

        this.entryBytes = entryBytes;
        this.progress.totalBytes = totalBytes;
        callback(undefined, chunk);
    }
}

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

function openReadStream(zipFile: ZipFile, entry: Entry): Promise<Readable> {
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

async function extractEntry(
    zipFile: ZipFile,
    entry: Entry,
    root: string,
    progress: ExtractionProgress,
    limits: ExtractZipLimits,
): Promise<void> {
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
        const limitBytes = new LimitBytesTransform(entry.fileName, progress, limits, readStream);
        try {
            await pipeline(readStream, limitBytes, writeStream);
        } catch (error) {
            throw limitBytes.limitError ?? error;
        }
        await replaceRegularFile(temporary, destination);
    } finally {
        await fs.rm(temporary, { force: true });
    }
}

export async function extractZip(
    zipPath: string,
    destination: string,
    limitOverrides: Partial<ExtractZipLimits> = {},
): Promise<void> {
    const limits = { ...defaultLimits, ...limitOverrides };
    const root = path.resolve(destination);
    await fs.mkdir(root, { recursive: true });
    const rootStats = await fs.lstat(root);
    if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) {
        throw new Error(`ZIP extraction destination must be a directory: ${destination}`);
    }

    const zipFile = await openZip(zipPath);
    return new Promise((resolve, reject) => {
        let settled = false;
        let entryCount = 0;
        const progress: ExtractionProgress = { totalBytes: 0 };
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
                zipFile.close();
                resolve();
            }
        });
        zipFile.on('entry', entry => {
            entryCount += 1;
            if (entryCount > limits.maxEntries) {
                fail(new Error('ZIP archive exceeds the entry count limit'));
                return;
            }

            void extractEntry(zipFile, entry, root, progress, limits)
                .then(() => zipFile.readEntry())
                .catch(fail);
        });
        zipFile.readEntry();
    });
}
