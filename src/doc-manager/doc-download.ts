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
import * as path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { URL } from 'node:url';

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
                await this.disposeResponse(response);
                const location = response.headers.get('location');
                if (!location) {
                    throw new Error('Document redirect has no location.');
                }
                url = new URL(location, url);
            } else if (!response.ok) {
                await this.disposeResponse(response);
                throw new Error(`Document request failed: HTTP ${response.status} ${response.statusText}`);
            } else {
                return response;
            }
        }
        throw new Error('Document request exceeded five redirects.');
    }

    private async disposeResponse(response: Response): Promise<void> {
        const body = response.body as ReadableStream<Uint8Array> | Readable | null;
        if (body instanceof Readable) {
            body.destroy();
        } else {
            await body?.cancel();
        }
    }

    async downloadDoc(url: URL, destination: string, requirePdf: boolean, armDocId?: string): Promise<void> {
        const signal = AbortSignal.timeout(120_000);
        if (armDocId !== undefined) {
            url = await this.getArmPdfUrl(url, armDocId, signal);
        }
        await mkdir(path.dirname(destination), { recursive: true });
        const temporary = `${destination}.${randomUUID()}.part`;
        let output: ReturnType<typeof createWriteStream> | undefined;
        try {
            const response = await this.fetchResponse(url, signal, requirePdf ? 'application/pdf' : '*/*');
            if (!response.body) {
                throw new Error('Document response has no body.');
            }
            const body = response.body as unknown as AsyncIterable<Uint8Array>;
            output = createWriteStream(temporary, { flags: 'wx' });
            await pipeline(body, chunks => this.fileChunks(chunks, requirePdf), output, { signal });
            signal.throwIfAborted();
            await rename(temporary, destination);
        } finally {
            const stream = output;
            if (stream && !stream.closed) {
                await new Promise<void>(resolve => {
                    stream.once('close', resolve);
                    stream.destroy();
                });
            }
            await rm(temporary, { force: true });
        }
    }

    private async *fileChunks(chunks: AsyncIterable<Uint8Array>, requirePdf: boolean): AsyncGenerator<Uint8Array> {
        const signature = Buffer.from('%PDF-');
        let prefix = Buffer.alloc(0);
        let validated = !requirePdf;
        let size = 0;
        for await (const chunk of chunks) {
            size += chunk.length;
            if (validated) {
                yield chunk;
            } else {
                prefix = Buffer.concat([prefix, chunk]);
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
    }
}
