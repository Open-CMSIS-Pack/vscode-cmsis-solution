/**
 * Copyright 2025-2026 Arm Limited
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

import { splitBoardId } from './board-data';
import { splitDeviceId } from './device-data';
import { comparePackIds, PackId, splitPackId, splitVendorNameId } from './pack-data';

describe('splitVendorNameId', () => {
    it.each([
        ['Vendor::Name:revision', 'Vendor', 'Name', 'revision'],
        ['Vendor::Name', 'Vendor', 'Name', undefined],
        ['Name', undefined, 'Name', undefined],
        ['Name:core:extra', undefined, 'Name', 'core:extra'],
        ['Vendor::Name:', 'Vendor', 'Name', ''],
        [' Vendor :: Name : suffix ', ' Vendor ', ' Name ', ' suffix '],
        ['', undefined, '', undefined],
        ['::Name', '', 'Name', undefined],
        ['Vendor::', 'Vendor', '', undefined],
        ['::', '', '', undefined],
        [':suffix', undefined, '', 'suffix'],
        ['Vendor:::suffix', 'Vendor', '', 'suffix'],
    ])('splits %j and preserves the board/device projections', (id, vendor, name, suffix) => {
        expect(splitVendorNameId(id!)).toEqual({ vendor, name, suffix });
        expect(splitBoardId(id!)).toEqual({ vendor, name, revision: suffix });
        expect(splitDeviceId(id!)).toEqual({ vendor, name });
    });

    it('returns undefined only for undefined input', () => {
        expect(splitVendorNameId(undefined)).toBeUndefined();
        expect(splitBoardId(undefined)).toBeUndefined();
        expect(splitDeviceId(undefined)).toBeUndefined();
    });

    it('rejects malformed IDs in all projections', () => {
        const id = 'Vendor::Name:invalid\nsuffix';
        expect(() => splitVendorNameId(id)).toThrow();
        expect(() => splitBoardId(id)).toThrow();
        expect(() => splitDeviceId(id)).toThrow();
    });
});

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

describe('splitPackId', () => {
    it('splits a valid pack ID', () => {
        const result = splitPackId('vendor::name@1.0.0');
        expect(result).toEqual({ vendor: 'vendor', name: 'name', version: '1.0.0' });
    });

    it('splits a valid pack ID without version', () => {
        const result = splitPackId('vendor::name');
        expect(result).toEqual({ vendor: 'vendor', name: 'name', version: undefined });
    });

    it('returns undefined for an undefined pack ID', () => {
        expect(splitPackId(undefined)).toBeUndefined();
    });

    it('throws an error for invalid pack ID format', () => {
        expect(() => splitPackId('invalid-pack-id')).toThrow('Invalid pack ID format: invalid-pack-id');
    });
});

describe('comparePackIds', () => {
    it.each([
        ['Vendor::Pack@1.0.0', 'Vendor::Pack@1.0.0', 0],
        ['VENDOR::PACK@1.0.0', 'vendor::pack@1.0.0', 0],
        ['Alpha::Pack@2.0.0', 'Beta::Pack@1.0.0', -1],
        ['Beta::Pack@1.0.0', 'Alpha::Pack@2.0.0', 1],
        ['Vendor::Alpha@2.0.0', 'Vendor::Beta@1.0.0', -1],
        ['Vendor::Beta@1.0.0', 'Vendor::Alpha@2.0.0', 1],
        ['Vendor::Pack@1.2.0', 'Vendor::Pack@1.10.0', -1],
        ['Vendor::Pack@2.0.0', 'Vendor::Pack@1.0.0', 1],
        ['Vendor::Pack@1.0.0-rc.1', 'Vendor::Pack@1.0.0', -1],
        ['Vendor::Pack@1.0.0+build.1', 'Vendor::Pack@1.0.0+build.2', 0],
    ])('compares %s with %s', (first, second, expected) => {
        expect(Math.sign(comparePackIds(first, second))).toBe(expected);
    });

    it.each(['', 'Vendor', '::Pack@1.0.0', 'Vendor::Pack@invalid'])('rejects invalid pack ID %s in either position', invalid => {
        expect(() => comparePackIds(invalid, 'Vendor::Pack@1.0.0')).toThrow();
        expect(() => comparePackIds('Vendor::Pack@1.0.0', invalid)).toThrow();
    });
});
