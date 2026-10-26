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

import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { URL } from 'node:url';
import { splitBoardId } from '../data-manager/board-data';
import { splitDeviceId } from '../data-manager/device-data';
import { IDocRef } from './docs-yaml-file';

interface ArmResource {
    href?: string;
    name?: string;
    extension?: string;
    contentType?: string;
}

interface ArmMetadata {
    _links?: { resources?: ArmResource[] };
}

export class DocDownload {
    private readonly destinationRoot: string;

    constructor(destinationRoot = path.join(os.homedir(), '.cmsis', 'docs')) {
        this.destinationRoot = path.resolve(destinationRoot);
    }

    getDestinationPath(doc: IDocRef): string {
        if (doc.parentTag === 'common') {
            return this.getCommonDestinationPath(doc);
        }
        if ((doc.parentTag === 'device' || doc.parentTag === 'board') && doc.isWebDoc()) {
            return this.getHardwareDestinationPath(doc);
        }
        throw new Error('Only common documents and board or device web documents are supported.');
    }

    async downloadDoc(doc: IDocRef): Promise<void> {
        try {
            const destination = this.getDestinationPath(doc);
            const signal = AbortSignal.timeout(120_000);
            const isCommon = doc.parentTag === 'common';
            let downloadUrl: URL;
            if (isCommon) {
                if (doc.format?.toLowerCase() !== 'pdf') {
                    throw new Error('Only PDF downloads are supported for common Arm documents.');
                }
                const metadataUrl = new URL(
                    `https://documentation-service.arm.com/documentation/${encodeURIComponent(doc.id!)}/${encodeURIComponent(doc.version!)}`,
                );
                downloadUrl = await this.getArmPdfUrl(metadataUrl, doc.id!, signal);
            } else {
                downloadUrl = this.getHardwareDownloadUrl(doc);
            }
            await this.downloadFile(downloadUrl, destination, signal, isCommon);
            doc.path = destination;
            doc.error = undefined;
        } catch (error) {
            doc.error = error instanceof Error ? error.message : String(error);
            throw error;
        }
    }

    private async getArmPdfUrl(metadataUrl: URL, id: string, signal: AbortSignal): Promise<URL> {
        const response = await this.fetchResponse(metadataUrl, signal, 'application/json');
        const metadata = await response.json() as ArmMetadata;
        const resources = metadata._links?.resources?.filter(resource => resource.href
            && (resource.extension?.toLowerCase() === 'pdf' || resource.contentType?.toLowerCase() === 'application/pdf')) ?? [];
        const resource = resources.find(candidate => candidate.name?.toLowerCase().startsWith(id.toLowerCase())) ?? resources[0];
        if (!resource?.href) {
            throw new Error(`No downloadable PDF resource is available for Arm document ${id}.`);
        }
        return new URL(resource.href, response.url);
    }

    private async fetchResponse(url: URL, signal: AbortSignal, accept: string): Promise<Response> {
        for (let redirects = 0; redirects <= 5; redirects++) {
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                throw new Error('Document downloads require an HTTP or HTTPS URL.');
            }
            const response = await fetch(url, { signal, redirect: 'manual', headers: { Accept: accept } });
            if ([301, 302, 303, 307, 308].includes(response.status)) {
                await response.body?.cancel();
                const location = response.headers.get('location');
                if (!location) {
                    throw new Error('Document redirect has no location.');
                }
                url = new URL(location, url);
            } else if (!response.ok) {
                await response.body?.cancel();
                throw new Error(`Document request failed: HTTP ${response.status} ${response.statusText}`);
            } else {
                return response;
            }
        }
        throw new Error('Document request exceeded five redirects.');
    }

    private getHardwareDownloadUrl(doc: IDocRef): URL {
        return new URL(doc.name.startsWith('www.') ? `https://${doc.name}` : doc.name);
    }

    private async downloadFile(url: URL, destination: string, signal: AbortSignal, requirePdf: boolean): Promise<void> {
        await mkdir(path.dirname(destination), { recursive: true });
        const temporary = `${destination}.${randomUUID()}.part`;
        try {
            const response = await this.fetchResponse(url, signal, requirePdf ? 'application/pdf' : '*/*');
            await pipeline(this.fileChunks(response, requirePdf), createWriteStream(temporary, { flags: 'wx' }), { signal });
            signal.throwIfAborted();
            await rename(temporary, destination);
        } finally {
            await rm(temporary, { force: true });
        }
    }

    private async *fileChunks(response: Response, requirePdf: boolean): AsyncGenerator<Uint8Array> {
        if (!response.body) {
            throw new Error('Document response has no body.');
        }
        const reader = response.body.getReader();
        const signature = Buffer.from('%PDF-');
        let prefix = Buffer.alloc(0);
        let validated = !requirePdf;
        let size = 0;
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                size += value.length;
                if (validated) {
                    yield value;
                } else {
                    prefix = Buffer.concat([prefix, value]);
                    if (prefix.length >= signature.length) {
                        if (!prefix.subarray(0, signature.length).equals(signature)) {
                            throw new Error('Document response is not a PDF.');
                        }
                        validated = true;
                        yield prefix;
                    }
                }
            }
            if (size === 0) {
                throw new Error('Document response is empty.');
            }
            if (!validated) {
                throw new Error('Document response has an incomplete PDF header.');
            }
        } finally {
            await reader.cancel().catch(() => undefined);
            reader.releaseLock();
        }
    }

    private getCommonDestinationPath(doc: IDocRef): string {
        const id = this.pathComponent(doc.id, 'id');
        const version = this.pathComponent(doc.version, 'version');
        const extension = doc.format === undefined ? '' : `.${this.pathComponent(doc.format, 'format')}`;
        return path.join(this.destinationRoot, `${id}-${version}${extension}`);
    }

    private getHardwareDestinationPath(doc: IDocRef): string {
        const hardware = doc.parentTag === 'device' ? splitDeviceId(doc.parentId) : splitBoardId(doc.parentId);
        const vendor = this.pathComponent(hardware?.vendor, 'vendor');
        const name = this.pathComponent(hardware?.name, 'hardware name');
        const url = new URL(doc.name.startsWith('www.') ? `https://${doc.name}` : doc.name);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new Error('Document downloads require an HTTP or HTTPS URL.');
        }
        const fileName = this.pathComponent(
            url.pathname.endsWith('/') ? undefined : decodeURIComponent(path.posix.basename(url.pathname)), 'filename',
        );
        return path.join(this.destinationRoot, vendor, name, fileName);
    }

    private pathComponent(value: string | undefined, label: string): string {
        if (!value || /[<>:"/\\|?*]/.test(value) || /[. ]$/.test(value)
            || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(value)
            || Array.from(value).some(character => character.charCodeAt(0) < 32)) {
            throw new Error(`Invalid document ${label}: ${value ?? '(missing)'}`);
        }
        return value;
    }
}
