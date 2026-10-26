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
import { DocsYamlFile } from './docs-yaml-file';

describe('DocDownload', () => {
    const testData = new TestDataHandler();

    afterAll(() => {
        testData.dispose();
    });

    it('clears a previous path and records the error when a download fails', async () => {
        const downloader = new DocDownload(path.join(testData.tmpDir, 'failed-docs'));
        const inventory = new DocsYamlFile();
        const doc = inventory.ensureDoc('https://developer.arm.com/documentation/100230/latest', 'arm-docs', 'common');
        doc.path = path.join(testData.tmpDir, 'previous.pdf');
        doc.error = 'Previous error';

        await expect(downloader.downloadDoc(doc)).rejects.toThrow('Invalid document id: (missing)');

        expect(doc.path).toBeUndefined();
        expect(doc.error).toBe('Invalid document id: (missing)');
        expect(doc.isDownloaded()).toBe(false);
    });

    it('downloads Arm document 100230/latest to a real PDF file', async () => {
        const destinationRoot = path.join(testData.tmpDir, 'docs');
        const downloader = new DocDownload(destinationRoot);
        const name = 'https://developer.arm.com/documentation/100230/latest';
        const inventory = new DocsYamlFile();
        const doc = inventory.ensureDoc(name, 'arm-docs', 'common');
        doc.id = '100230';
        doc.version = 'latest';
        doc.format = 'pdf';
        doc.metadataUrl = 'https://documentation-service.arm.com/documentation/100230/latest';
        doc.error = 'A previous download failed.';

        await downloader.downloadDoc(doc);

        const destination = path.join(destinationRoot, '100230-latest.pdf');
        expect(doc.path).toBe(destination);
        expect(path.isAbsolute(doc.path ?? '')).toBe(true);
        expect(doc.error).toBeUndefined();
        expect(doc.isDownloaded()).toBe(true);
        expect(doc.name).toBe(name);
        expect(doc.id).toBe('100230');
        expect(doc.version).toBe('latest');
        expect(doc.format).toBe('pdf');
        expect(doc.metadataUrl).toBe('https://documentation-service.arm.com/documentation/100230/latest');
        const fileStat = await stat(destination);
        expect(fileStat.isFile()).toBe(true);
        expect(fileStat.size).toBeGreaterThan(100);
    }, 150_000);

    it('downloads a device web document to its vendor and device directory', async () => {
        const destinationRoot = path.join(testData.tmpDir, 'device-docs');
        const downloader = new DocDownload(destinationRoot);
        const name = 'https://raw.githubusercontent.com/Open-CMSIS-Pack/vscode-cmsis-solution/refs/heads/main/README.md';
        const inventory = new DocsYamlFile();
        const doc = inventory.ensureDoc(name, 'MyVendor::MyDevice', 'device');
        doc.title = 'My dummy manual';
        doc.error = 'A previous download failed.';

        expect(doc.isWebDoc()).toBe(true);
        await downloader.downloadDoc(doc);

        const destination = path.join(destinationRoot, 'MyVendor', 'MyDevice', 'README.md');
        expect(doc.path).toBe(destination);
        expect(path.isAbsolute(doc.path ?? '')).toBe(true);
        expect(doc.error).toBeUndefined();
        expect(doc.isDownloaded()).toBe(true);
        expect(doc.name).toBe(name);
        expect(doc.title).toBe('My dummy manual');
        expect(doc.parentId).toBe('MyVendor::MyDevice');
        expect(doc.parentTag).toBe('device');
        const fileStat = await stat(destination);
        expect(fileStat.isFile()).toBe(true);
        expect(fileStat.size).toBeGreaterThan(100);
    }, 150_000);
});
