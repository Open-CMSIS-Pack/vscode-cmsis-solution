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
 *
 * @jest-environment node
 */

import fs from 'node:fs';
import fsPromises, { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import { TestDataHandler } from '../__test__/test-data';
import { DocDownload } from './doc-download';

describe('DocDownload', () => {
    const testData = new TestDataHandler();

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(() => {
        testData.dispose();
    });

    it.each([
        ['ddi0439', 'b'],
        ['100230', 'latest'],
        ['', 'latest'],
    ])('downloads Arm document %s/%s through the metadata service', async (id, version) => {
        const destinationRoot = path.join(testData.tmpDir, 'docs');
        const downloader = new DocDownload();
        const destination = path.join(destinationRoot, `${id}-${version}.pdf`);
        const metadataUrl = new URL(`https://documentation-service.arm.com/documentation/${id}/${version}`);
        const downloadUrl = new URL(`https://documentation-service.arm.com/static/${id}.pdf`);
        const metadata = Response.json({ _links: { resources: [
            { href: '/manual.html', extension: 'html' },
            { href: downloadUrl.href, extension: 'PDF', name: `${id}.pdf` },
        ] } });
        Object.defineProperty(metadata, 'url', { value: metadataUrl.href });
        const request = jest.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(metadata)
            .mockResolvedValueOnce(new Response('%PDF-Arm document'));

        await downloader.downloadDoc(metadataUrl, destination, true, id);

        expect(request).toHaveBeenCalledTimes(2);
        expect(request).toHaveBeenNthCalledWith(2, downloadUrl, {
            signal: expect.any(AbortSignal), redirect: 'manual', headers: { Accept: 'application/pdf' },
        });
        expect(await readFile(destination, 'utf8')).toBe('%PDF-Arm document');
        expect(await readdir(destinationRoot)).not.toContain(expect.stringMatching(/\.part$/));
    });

    it('follows Arm redirects and selects the PDF matching the document ID', async () => {
        const metadataUrl = new URL('https://documentation-service.arm.com/documentation/100230/latest');
        const resourceUrl = new URL('https://documentation-service.arm.com/resources/100230');
        const finalUrl = new URL('https://documentation-service.arm.com/static/100230.pdf');
        const destination = path.join(testData.tmpDir, 'arm-redirect', 'manual.pdf');
        const metadata = Response.json({ _links: { resources: [
            { href: '/other.pdf', extension: 'pdf', name: 'other.pdf' },
            { href: '/resources/100230', contentType: 'APPLICATION/PDF', name: '100230.pdf' },
        ] } });
        Object.defineProperty(metadata, 'url', { value: metadataUrl.href });
        const request = jest.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(new Response('Redirect', { status: 302, headers: { location: metadataUrl.href } }))
            .mockResolvedValueOnce(metadata)
            .mockResolvedValueOnce(new Response('Redirect', { status: 307, headers: { location: '/static/100230.pdf' } }))
            .mockResolvedValueOnce(new Response('%PDF-Arm document'));

        await new DocDownload().downloadDoc(new URL('https://example.com/arm-manual'), destination, true, '100230');

        expect(request).toHaveBeenCalledTimes(4);
        expect(request).toHaveBeenNthCalledWith(2, metadataUrl, {
            signal: expect.any(AbortSignal), redirect: 'manual', headers: { Accept: 'application/json' },
        });
        for (const [index, url] of [resourceUrl, finalUrl].entries()) {
            expect(request).toHaveBeenNthCalledWith(index + 3, url, {
                signal: expect.any(AbortSignal), redirect: 'manual', headers: { Accept: 'application/pdf' },
            });
        }
        expect(await readFile(destination, 'utf8')).toBe('%PDF-Arm document');
    });

    it('rejects a non-HTTP URL without creating a destination file', async () => {
        const downloader = new DocDownload();
        const destination = path.join(testData.tmpDir, 'failed-docs', 'manual.pdf');

        await expect(downloader.downloadDoc(new URL('file:///manual.pdf'), destination, false))
            .rejects.toThrow('Document downloads require an HTTP or HTTPS URL.');

        await expect(stat(destination)).rejects.toMatchObject({ code: 'ENOENT' });
    });

    it('owns one timeout shared by Arm metadata and file transfer', async () => {
        const downloader = new DocDownload();
        const metadataUrl = new URL('https://documentation-service.arm.com/documentation/100230/latest');
        const downloadUrl = new URL('https://example.com/100230.pdf');
        const destination = path.join(testData.tmpDir, 'timeout', 'manual.pdf');
        const signal = new AbortController().signal;
        const metadata = Response.json({ _links: { resources: [{ href: downloadUrl.href, extension: 'pdf', name: '100230.pdf' }] } });
        Object.defineProperty(metadata, 'url', { value: metadataUrl.href });
        const timeout = jest.spyOn(AbortSignal, 'timeout').mockReturnValue(signal);
        const request = jest.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(metadata)
            .mockResolvedValueOnce(new Response('%PDF-test'));

        await downloader.downloadDoc(metadataUrl, destination, true, '100230');

        expect(timeout).toHaveBeenCalledTimes(1);
        expect(timeout).toHaveBeenCalledWith(120_000);
        expect(request).toHaveBeenNthCalledWith(1, metadataUrl, {
            signal, redirect: 'manual', headers: { Accept: 'application/json' },
        });
        expect(request).toHaveBeenNthCalledWith(2, downloadUrl, {
            signal, redirect: 'manual', headers: { Accept: 'application/pdf' },
        });
        expect((await stat(destination)).isFile()).toBe(true);
    });

    it.each([
        [false, 'WHATWG'],
        [true, 'WHATWG'],
        [false, 'Node'],
        [true, 'Node'],
    ] as const)('downloads a non-Arm document with requirePdf %s and a %s response', async (requirePdf, streamType) => {
        const destinationRoot = path.join(testData.tmpDir, 'device-docs');
        const downloadUrl = new URL('https://www.st.com/resource/en/user_manual/um2839-discovery-kit-for-iot-node-with-stm32u5-series-stmicroelectronics.pdf');
        const destination = path.join(destinationRoot, String(requirePdf), streamType, 'manual.pdf');
        const signal = new AbortController().signal;
        const timeout = jest.spyOn(AbortSignal, 'timeout').mockReturnValue(signal);
        const content = requirePdf ? '%PDF-document' : 'Web document';
        const body = Readable.from([Buffer.from(content.slice(0, 2)), Buffer.from(content.slice(2))]);
        const response = new Response(null);
        Object.defineProperty(response, 'body', { value: streamType === 'Node' ? body : Readable.toWeb(body) });
        const request = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response);
        const temporaryDirectory = jest.spyOn(fsPromises, 'mkdtemp');
        const output = jest.spyOn(fs, 'createWriteStream');
        const copy = jest.spyOn(fsPromises, 'copyFile');

        await new DocDownload().downloadDoc(downloadUrl, destination, requirePdf);

        expect(timeout).toHaveBeenCalledTimes(1);
        expect(timeout).toHaveBeenCalledWith(120_000);
        expect(request).toHaveBeenCalledTimes(1);
        expect(request).toHaveBeenCalledWith(downloadUrl, {
            redirect: 'follow', signal, headers: { 'User-Agent': 'Arm CMSIS Solution' },
        });
        const directory = await temporaryDirectory.mock.results[0].value;
        const temporary = path.join(directory, 'document');
        expect(output).toHaveBeenCalledWith(temporary, { flags: 'wx', mode: 0o600 });
        expect(copy).toHaveBeenCalledWith(temporary, destination);
        expect(await readFile(destination, 'utf8')).toBe(content);
        expect((await stat(destination)).mode & 0o200).toBe(0o200);
        await expect(stat(directory)).rejects.toMatchObject({ code: 'ENOENT' });
        await writeFile(destination, 'Writable document');
        await fsPromises.unlink(destination);
        await expect(stat(destination)).rejects.toMatchObject({ code: 'ENOENT' });
    });

    it.each([undefined, 'manual'])('overwrites an existing destination for armDocId %s', async armDocId => {
        const destination = path.join(testData.tmpDir, 'overwrite', String(armDocId), 'manual.pdf');
        const downloadUrl = new URL('https://example.com/manual.pdf');
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, 'Original document');
        const request = jest.spyOn(globalThis, 'fetch');
        if (armDocId !== undefined) {
            const metadata = Response.json({ _links: { resources: [{ href: downloadUrl.href, extension: 'pdf' }] } });
            Object.defineProperty(metadata, 'url', { value: downloadUrl.href });
            request.mockResolvedValueOnce(metadata);
        }
        request.mockImplementationOnce(async () => {
            expect(await readFile(destination, 'utf8')).toBe('Original document');
            return new Response('%PDF-replacement document');
        });

        await new DocDownload().downloadDoc(downloadUrl, destination, true, armDocId);

        expect(await readFile(destination, 'utf8')).toBe('%PDF-replacement document');
        expect(await readdir(path.dirname(destination))).toEqual(['manual.pdf']);
    });

    describe('errors', () => {
        const metadataUrl = new URL('https://documentation-service.arm.com/documentation/manual/latest');
        const downloadUrl = new URL('https://example.com/manual.pdf');
        let destination: string;
        let request: jest.SpyInstance<ReturnType<typeof fetch>, Parameters<typeof fetch>>;
        let temporaryDirectory: jest.SpyInstance;

        beforeEach(async () => {
            destination = path.join(testData.tmpDir, 'errors', 'manual.pdf');
            await mkdir(path.dirname(destination), { recursive: true });
            await writeFile(destination, 'Original document');
            request = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected request.'));
            temporaryDirectory = jest.spyOn(fsPromises, 'mkdtemp');
        });

        afterEach(async () => {
            const directories = await Promise.allSettled(temporaryDirectory.mock.results.map(result => result.value));
            for (const directory of directories) {
                if (directory.status === 'fulfilled') {
                    await expect(stat(directory.value)).rejects.toMatchObject({ code: 'ENOENT' });
                }
            }
        });

        const pdfMetadata = () => {
            const response = Response.json({ _links: { resources: [{ href: downloadUrl.href, extension: 'pdf' }] } });
            Object.defineProperty(response, 'url', { value: metadataUrl.href });
            return response;
        };

        const expectUnchangedDestination = async () => {
            expect(await readFile(destination, 'utf8')).toBe('Original document');
            expect(await readdir(path.dirname(destination))).toEqual(['manual.pdf']);
        };

        it.each(['metadata', 'transfer'])('propagates a rejected %s request', async stage => {
            const failure = new Error('Connection failed');
            if (stage === 'transfer') {
                request.mockResolvedValueOnce(pdfMetadata());
            }
            request.mockRejectedValueOnce(failure);

            await expect(new DocDownload().downloadDoc(metadataUrl, destination, true, 'manual'))
                .rejects.toBe(failure);

            expect(request).toHaveBeenCalledTimes(stage === 'metadata' ? 1 : 2);
            await expectUnchangedDestination();
        });

        it.each([
            [404, 'Not Found'],
            [500, 'Internal Server Error'],
        ])('rejects HTTP %i and cancels the response body', async (status, statusText) => {
            const response = new Response('Request failed', { status, statusText });
            const cancel = jest.spyOn(response.body!, 'cancel');
            request.mockResolvedValueOnce(response);

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true))
                .rejects.toThrow(`Document request failed: HTTP ${status} ${statusText}`);

            expect(request).toHaveBeenCalledTimes(1);
            expect(cancel).toHaveBeenCalledTimes(1);
            await expectUnchangedDestination();
        });

        it('rejects a redirect without a location and cancels its body', async () => {
            const response = new Response('Redirect', { status: 302 });
            const cancel = jest.spyOn(response.body!, 'cancel');
            request.mockResolvedValueOnce(response);

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true, 'manual'))
                .rejects.toThrow('Document redirect has no location.');

            expect(request).toHaveBeenCalledTimes(1);
            expect(cancel).toHaveBeenCalledTimes(1);
            await expectUnchangedDestination();
        });

        it.each([302, 404])('destroys a Node response body on HTTP %i', async status => {
            const body = Readable.from(['Request failed']);
            const destroy = jest.spyOn(body, 'destroy');
            const response = new Response(null, { status });
            Object.defineProperty(response, 'body', { value: body });
            request.mockResolvedValueOnce(response);

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true, 'manual'))
                .rejects.toThrow(status === 302 ? 'Document redirect has no location.' : 'Document request failed: HTTP 404');

            expect(request).toHaveBeenCalledTimes(1);
            expect(destroy).toHaveBeenCalledTimes(1);
            expect(body.destroyed).toBe(true);
            await expectUnchangedDestination();
        });

        it('rejects a redirect chain exceeding five redirects', async () => {
            const cancel = jest.fn();
            request.mockImplementation(async () => new Response(new ReadableStream({ cancel }), {
                status: 302, headers: { location: '/redirect' },
            }));

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true, 'manual'))
                .rejects.toThrow('Document request exceeded five redirects.');

            expect(request).toHaveBeenCalledTimes(6);
            expect(cancel).toHaveBeenCalledTimes(6);
            await expectUnchangedDestination();
        });

        it.each([
            ['file:///manual.pdf', 'Document downloads require an HTTP or HTTPS URL.'],
            ['http://[invalid', 'Invalid URL'],
        ])('rejects an invalid redirect target %s', async (location, message) => {
            const response = new Response('Redirect', { status: 302, headers: { location } });
            const cancel = jest.spyOn(response.body!, 'cancel');
            request.mockResolvedValueOnce(response);

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true, 'manual')).rejects.toThrow(message);

            expect(request).toHaveBeenCalledTimes(1);
            expect(cancel).toHaveBeenCalledTimes(1);
            await expectUnchangedDestination();
        });

        it('propagates malformed Arm metadata JSON without requesting a file', async () => {
            request.mockResolvedValueOnce(new Response('{invalid'));

            await expect(new DocDownload().downloadDoc(metadataUrl, destination, true, 'manual'))
                .rejects.toMatchObject({ name: 'SyntaxError' });

            expect(request).toHaveBeenCalledTimes(1);
            await expectUnchangedDestination();
        });

        it.each([
            {},
            { _links: {} },
            { _links: { resources: [] } },
            { _links: { resources: [{ href: '/manual.html', extension: 'html' }] } },
            { _links: { resources: [{ extension: 'pdf' }] } },
        ])('rejects Arm metadata without a usable PDF: %j', async metadata => {
            request.mockResolvedValueOnce(Response.json(metadata));

            await expect(new DocDownload().downloadDoc(metadataUrl, destination, true, 'manual'))
                .rejects.toThrow('No downloadable PDF resource is available for Arm document manual.');

            expect(request).toHaveBeenCalledTimes(1);
            await expectUnchangedDestination();
        });

        it('rejects a response without a body', async () => {
            request.mockResolvedValueOnce(new Response(null));

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true))
                .rejects.toThrow('Document response has no body.');

            await expectUnchangedDestination();
        });

        it.each([false, true])('rejects an empty response when requirePdf is %s', async requirePdf => {
            request.mockResolvedValueOnce(new Response(''));

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, requirePdf))
                .rejects.toThrow('Document response is empty.');

            await expectUnchangedDestination();
        });

        it.each([
            [['<html>Server error</html>'], 'Document response is not a PDF.'],
            [['<h', 'tml>Server error</html>'], 'Document response is not a PDF.'],
            [['%PDF'], 'Document response has an incomplete PDF header.'],
            [['%', 'PD', 'F'], 'Document response has an incomplete PDF header.'],
        ])('rejects invalid PDF chunks %j', async (chunks, message) => {
            const body = new ReadableStream<Uint8Array>({
                start(controller) {
                    chunks.forEach(chunk => controller.enqueue(Buffer.from(chunk)));
                    controller.close();
                },
            });
            request.mockResolvedValueOnce(new Response(body));

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true)).rejects.toThrow(message);

            await expectUnchangedDestination();
        });

        it.each(['WHATWG', 'Node'])('cleans up after a partial %s response stream fails', async streamType => {
            const failure = new Error('Response stream failed');
            const body = Readable.from((async function* () {
                yield Buffer.from('%PDF-partial document');
                throw failure;
            })());
            const response = new Response(null);
            Object.defineProperty(response, 'body', {
                value: streamType === 'Node' ? body : Readable.toWeb(body),
            });
            request.mockResolvedValueOnce(response);

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true)).rejects.toBe(failure);

            expect(body.destroyed).toBe(true);
            await expectUnchangedDestination();
        });

        it.each([undefined, 'manual'])('rejects an abort during fetching for armDocId %s', async armDocId => {
            const controller = new AbortController();
            const failure = new DOMException('Download timed out', 'TimeoutError');
            jest.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
            request.mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
                const signal = options!.signal!;
                signal.addEventListener('abort', () => reject(signal.reason), { once: true });
                controller.abort(failure);
            }));

            await expect(new DocDownload().downloadDoc(metadataUrl, destination, true, armDocId))
                .rejects.toBe(failure);

            expect(request).toHaveBeenCalledTimes(1);
            await expectUnchangedDestination();
        });

        it.each(['WHATWG', 'Node'])('cleans up when aborted during %s response streaming', async streamType => {
            const controller = new AbortController();
            jest.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
            const body = Readable.from((async function* () {
                yield Buffer.from('%PDF-partial document');
                controller.abort(new DOMException('Download timed out', 'TimeoutError'));
            })());
            const response = new Response(null);
            Object.defineProperty(response, 'body', {
                value: streamType === 'Node' ? body : Readable.toWeb(body),
            });
            request.mockResolvedValueOnce(response);

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true))
                .rejects.toMatchObject({ name: 'AbortError' });

            expect(body.destroyed).toBe(true);
            await expectUnchangedDestination();
        });

        it('cleans up when destination directory creation fails after downloading', async () => {
            const failure = Object.assign(new Error('Cannot create destination directory'), { code: 'EACCES' });
            jest.spyOn(fsPromises, 'mkdir').mockRejectedValueOnce(failure);
            request.mockResolvedValueOnce(new Response('%PDF-document'));

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true)).rejects.toBe(failure);

            expect(request).toHaveBeenCalledTimes(1);
            await expectUnchangedDestination();
        });

        it('does not replace the destination if aborted during destination directory creation', async () => {
            const controller = new AbortController();
            const failure = new DOMException('Download timed out', 'TimeoutError');
            jest.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
            jest.spyOn(fsPromises, 'mkdir').mockImplementationOnce(async () => {
                controller.abort(failure);
                return undefined;
            });
            const copy = jest.spyOn(fsPromises, 'copyFile');
            request.mockResolvedValueOnce(new Response('%PDF-document'));

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true)).rejects.toBe(failure);

            expect(copy).not.toHaveBeenCalled();
            await expectUnchangedDestination();
        });

        it('propagates a temporary directory creation failure without requesting a file', async () => {
            const failure = Object.assign(new Error('Cannot create temporary directory'), { code: 'EACCES' });
            temporaryDirectory.mockRejectedValueOnce(failure);

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true)).rejects.toBe(failure);

            expect(request).not.toHaveBeenCalled();
            await expectUnchangedDestination();
        });

        it('propagates a rejected non-Arm request', async () => {
            const failure = new Error('Connection failed');
            request.mockRejectedValueOnce(failure);

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true)).rejects.toBe(failure);

            expect(request).toHaveBeenCalledTimes(1);
            await expectUnchangedDestination();
        });

        it('cleans up after an output stream error', async () => {
            const failure = Object.assign(new Error('Cannot write document'), { code: 'ENOSPC' });
            const createWriteStream = fs.createWriteStream;
            jest.spyOn(fs, 'createWriteStream').mockImplementationOnce((filePath, options) => {
                const stream = createWriteStream(filePath, options);
                stream.once('open', () => stream.destroy(failure));
                return stream;
            });
            request.mockResolvedValueOnce(new Response('%PDF-document'));

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true)).rejects.toBe(failure);

            await expectUnchangedDestination();
        });

        it.each([undefined, 'manual'])('cleans up after finalization fails for armDocId %s', async armDocId => {
            const failure = Object.assign(new Error('Cannot replace destination'), { code: 'EACCES' });
            if (armDocId !== undefined) {
                jest.spyOn(fsPromises, 'rename').mockRejectedValueOnce(failure);
                request.mockResolvedValueOnce(pdfMetadata());
            } else {
                jest.spyOn(fsPromises, 'copyFile').mockRejectedValueOnce(failure);
            }
            request.mockResolvedValueOnce(new Response('%PDF-document'));

            await expect(new DocDownload().downloadDoc(downloadUrl, destination, true, armDocId)).rejects.toBe(failure);

            await expectUnchangedDestination();
        });
    });
});
