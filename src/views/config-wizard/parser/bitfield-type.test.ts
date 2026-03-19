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

import { it } from '@jest/globals';
import { BitfieldType } from './bitfield-type';
import { NumberType } from './number-type';


class ExposeBitfield extends BitfieldType {
    public createBitMask(): number {
        return super.createBitMask();
    }
    public check(num: NumberType): boolean {
        return super.check(num);
    }
    public getAdjustedValue(num: NumberType): number {
        return super.getAdjustedValue(num);
    }
}


interface result {
    value: number;
    expected: number;
    lsb: number;
    msb: number;
}

const resTestValues: result[] = [
    { value: 0,
        expected: 0,
        lsb: 0,
        msb: 0 },
    { value: 0x00,
        expected: 0,
        lsb: 0,
        msb: 0 },
    { value: 0xff,
        expected: 0xff,
        lsb: 0,
        msb: 7 },
    { value: 0xff,
        expected: 0x1f,
        lsb: 0,
        msb: 4 },
    { value: 0xff,
        expected: 0x1f,
        lsb: 3,
        msb: 8 },
    { value: 0xfff,
        expected: 0x1f,
        lsb: 4,
        msb: 8 },
];


describe('CBitfield', () => {

    describe('test Bitfield', () => {
        it('test value conversion (Read)', () => {
            for (const test of resTestValues) {
                const numLsb = new NumberType(test.lsb);
                const numMsb = new NumberType(test.msb);
                const result = new NumberType(test.value);

                const bitfield = new ExposeBitfield(numLsb, numMsb);
                bitfield.validate();
                bitfield.applyRead(result);

                const res = result.val;
                const exp = test.expected;
                expect(res).toEqual(exp);
            }
        });

        it('should expose max value and bit width for valid ranges', () => {
            const bitfield = new BitfieldType(new NumberType(8), new NumberType(15));
            bitfield.validate();

            expect(bitfield.getMaxValue()).toBe(0xff);
            expect(bitfield.getBitWidth()).toBe(8);
        });

        it('should extract unshifted value from a raw number', () => {
            const bitfield = new BitfieldType(new NumberType(8), new NumberType(15));
            bitfield.validate();

            const value = new NumberType('0x8000');
            expect(bitfield.getExtractedValue(value)).toBe(0x80);
        });

    });
});
