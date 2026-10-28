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
import { ArmDocs, armDocName } from './arm-docs';

describe('ArmDocs', () => {
    const docs = new ArmDocs(path.join(__dirname, 'arm-docs.json'));

    beforeEach(async () => {
        await docs.load();
    });

    it.each<[string, string[]]>([
        ['Cortex-M4', ['ddi0403', 'ihi0014', 'ddi0440', 'ddi0439', 'dui0553']],
        ['Cortex-M7', ['ddi0403', 'ihi0064', 'ddi0494', 'ddi0489', 'dui0646']],
        ['Cortex-Undefined', []],
    ])('returns unique core and architecture document IDs for %s', (core, expected) => {
        expect(docs.getDockIDs(core)).toEqual(expected);
    });

    const name = armDocName({ docId: 'ddi0439', version: 'b', title: 'M4', kind: 'trm' });

    it('supplies metadata endpoints without downloading', () => {
        expect(docs.metadataUrl(name)).toBe('https://documentation-service.arm.com/documentation/ddi0439/b');
        expect(docs.metadataUrl('https://example.com/manual.pdf')).toBeUndefined();
    });
});
