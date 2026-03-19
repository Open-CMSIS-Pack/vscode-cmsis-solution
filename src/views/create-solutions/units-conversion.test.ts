/**
 * Copyright 2023-2026 Arm Limited
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

import { formatBytes } from './units-conversion';

describe('formatBytes', () => {
    it('returns accurate btye amount with units Byte (B)', () => {
        const expected: string = '300 B';
        const result: typeof expected = formatBytes(300);
        expect(result).toBe(expected);
    });

    it('returns accurate btye amount with units Kibibyte (KiB)', () => {
        const expected: string = '1.95 KiB';
        const result: typeof expected = formatBytes(2000);
        expect(result).toBe(expected);
    });

    it('returns accurate btye amount with units Mebibyte (MiB)', () => {
        const expected: string = '1.43 MiB';
        const result: typeof expected = formatBytes(1500000);
        expect(result).toBe(expected);
    });

    it('returns accurate btye amount with units Gibibyte (GiB)', () => {
        const expected: string = '1.45 GiB';
        const result: typeof expected = formatBytes(1556500000);
        expect(result).toBe(expected);
    });

    it('returns accurate btye amount with units Tebibyte (TiB)', () => {
        const expected: string = '4.06 TiB';
        const result: typeof expected = formatBytes(4466556500000);
        expect(result).toBe(expected);
    });
});
