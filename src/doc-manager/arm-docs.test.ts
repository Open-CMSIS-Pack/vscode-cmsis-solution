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
import { ArmDocs, armDocName, normalizeCore } from './arm-docs';
import { JsonFile } from '@open-cmsis-pack/cmsis-common/json-file';
import { TestDataHandler } from '../__test__/test-data';

describe('ArmDocs', () => {
    const docs = new ArmDocs(path.join(__dirname, 'arm-docs.json'));
    const testData = new TestDataHandler();

    beforeEach(async () => {
        await docs.load();
    });

    afterAll(() => testData.dispose());

    it('selects architecture, common and core documents in catalog order, preserving pinned versions', () => {
        const selected = docs.forTarget([' Cortex-M4 ']);
        expect(selected[0].docId).toBe('ddi0403');
        expect(selected.some(doc => doc.docId === 'ihi0031')).toBe(true);
        expect(selected.find(doc => doc.docId === 'ddi0439')?.version).toBe('b');
        expect(selected.some(doc => ['gug', 'npu'].includes(doc.kind))).toBe(false);
        expect(selected.some(doc => doc.docId === '100230')).toBe(false);
        expect(docs.forTarget([])).toEqual([]);
        expect(normalizeCore(' Cortex-M0plus ')).toBe('cortex-m0+');
        expect(docs.forTarget(['Cortex-M0plus'])).toEqual(docs.forTarget(['cortex-m0+']));
    });

    it('loads the catalog only on demand and does not retry a failed load', async () => {
        const fileName = testData.tmpFileName('catalog.json');
        const catalog = new JsonFile(fileName);
        const lazy = new ArmDocs(fileName);
        expect(lazy.isLoaded).toBe(false);
        expect(lazy.forAllCores().size).toBe(0);
        expect(lazy.forTarget(['Cortex-M4'])).toEqual([]);
        await expect(lazy.load()).rejects.toThrow('Failed to load');
        catalog.content = { docs: [], coreArch: {}, kindOrder: {}, knownNpus: [] };
        await catalog.save();
        await expect(lazy.load()).rejects.toThrow('Failed to load');
    });

    it('enumerates all core books without a build, including hidden guides and all NPU books', () => {
        expect(docs.isLoaded).toBe(true);
        const cores = docs.forAllCores();
        const books = cores.get('cortex-m4')!;
        expect(cores.has('cortex-m0+')).toBe(true);
        expect(cores.has('cortex-m0plus')).toBe(false);
        expect(books.filter(doc => doc.kind === 'npu').map(doc => doc.docId)).toEqual(['102420', '102023', '102685', '102684']);
        expect(books.find(doc => doc.kind === 'gug')?.docId).toBe('dui0553');
        expect(books.filter(doc => !['gug', 'npu'].includes(doc.kind))).toEqual(docs.forTarget(['cortex-m4']));
    });

    it('selects NPUs from the target device or explicit capabilities, never from the CPU alone', () => {
        expect(docs.forTarget(['Cortex-M55']).some(doc => doc.kind === 'npu')).toBe(false);
        expect(docs.forTarget(['Cortex-M55'], 'ARM::SSE-315').filter(doc => doc.kind === 'npu').map(doc => doc.docId)).toEqual(['102023']);
        expect(docs.forTarget([], '', ['Ethos U85']).map(doc => doc.docId)).toEqual(['102685', '102684']);
    });

    const name = armDocName({ docId: 'ddi0439', version: 'b', title: 'M4', kind: 'trm' });

    it('supplies metadata endpoints without downloading', () => {
        expect(docs.metadataUrl(name)).toBe('https://documentation-service.arm.com/documentation/ddi0439/b');
        expect(docs.metadataUrl('https://example.com/manual.pdf')).toBeUndefined();
    });
});
