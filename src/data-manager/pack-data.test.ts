/**
 * Copyright 2025-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PackId } from './pack-data';

describe('PackId', () => {

    describe('equalByName', () => {

        it('returns true when two pack ids have same vendor and name', () => {
            const packA = new PackId('Vendor', 'PackName', '1.0.0');
            const packB = new PackId('Vendor', 'PackName', '2.0.0');
            expect(packA.equalByName(packB)).toBe(true);
        });

        it('returns false when two pack ids have different names', () => {
            const packA = new PackId('Vendor', 'PackName', '1.0.0');
            const packB = new PackId('Vendor', 'AnotherPack', '1.0.0');
            expect(packA.equalByName(packB)).toBe(false);
        });

    });

    describe('compare', () => {

        it('returns 0 when two pack ids are identical', () => {
            const packA = new PackId('Vendor', 'PackName', '1.0.0');
            const packB = new PackId('Vendor', 'PackName', '1.0.0');
            expect(packA.compare(packB)).toBe(0);
        });

        it('returns negative when first pack id is less than second by vendor', () => {
            const packA = new PackId('AlphaVendor', 'PackName', '1.0.0');
            const packB = new PackId('BetaVendor', 'PackName', '1.0.0');
            expect(packA.compare(packB)).toBeLessThan(0);
        });

        it('returns positive when first pack id is greater than second by vendor', () => {
            const packA = new PackId('BetaVendor', 'PackName', '1.0.0');
            const packB = new PackId('AlphaVendor', 'PackName', '1.0.0');
            expect(packA.compare(packB)).toBeGreaterThan(0);
        });

        it('returns negative when first pack id is less than second by name', () => {
            const packA = new PackId('Vendor', 'AlphaPack', '1.0.0');
            const packB = new PackId('Vendor', 'BetaPack', '1.0.0');
            expect(packA.compare(packB)).toBeLessThan(0);
        });

        it('returns positive when first pack id is greater than second by name', () => {
            const packA = new PackId('Vendor', 'BetaPack', '1.0.0');
            const packB = new PackId('Vendor', 'AlphaPack', '1.0.0');
            expect(packA.compare(packB)).toBeGreaterThan(0);
        });

        it('returns negative when first pack id is less than second by version', () => {
            const packA = new PackId('Vendor', 'PackName', '1.0.0');
            const packB = new PackId('Vendor', 'PackName', '2.0.0');
            expect(packA.compare(packB)).toBeLessThan(0);
        });

        it('returns positive when first pack id is greater than second by version', () => {
            const packA = new PackId('Vendor', 'PackName', '2.0.0');
            const packB = new PackId('Vendor', 'PackName', '1.0.0');
            expect(packA.compare(packB)).toBeGreaterThan(0);
        });

    });

});
