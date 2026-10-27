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

import { stat } from 'node:fs/promises';
import * as path from 'node:path';
import { TestDataHandler } from '../__test__/test-data';
import { DocDownload } from './doc-download';

describe('DocDownload', () => {
    const testData = new TestDataHandler();

    afterAll(() => {
        testData.dispose();
    });

    it.each([
        ['ddi0439', 'b'],
        ['100230', 'latest'],
    ])('downloads Arm document %s/%s to a real PDF file', async (id, version) => {
        const destinationRoot = path.join(testData.tmpDir, 'docs');
        const downloader = new DocDownload();
        const destination = path.join(destinationRoot, `${id}-${version}.pdf`);
        const metadataUrl = new URL(`https://documentation-service.arm.com/documentation/${id}/${version}`);

        await downloader.downloadDoc(metadataUrl, destination, true, id);

        const fileStat = await stat(destination);
        expect(fileStat.isFile()).toBe(true);
        expect(fileStat.size).toBeGreaterThan(100);
    }, 150_000);

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

        try {
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
        } finally {
            timeout.mockRestore();
            request.mockRestore();
        }
    });

    it('downloads a web document to the supplied destination', async () => {
        const destinationRoot = path.join(testData.tmpDir, 'device-docs');
        const downloader = new DocDownload();
        const downloadUrl = new URL('https://raw.githubusercontent.com/Open-CMSIS-Pack/vscode-cmsis-solution/refs/heads/main/README.md');
        const destination = path.join(destinationRoot, 'MyVendor', 'MyDevice', 'README.md');

        await downloader.downloadDoc(downloadUrl, destination, false);

        const fileStat = await stat(destination);
        expect(fileStat.isFile()).toBe(true);
        expect(fileStat.size).toBeGreaterThan(100);
    }, 150_000);
});
