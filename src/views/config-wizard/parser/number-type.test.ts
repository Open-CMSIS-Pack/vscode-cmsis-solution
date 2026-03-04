/**
 * Copyright 2026 Arm Limited
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

/*
 * Copyright (C) 2023-2026 Arm Limited
 */

import { it } from '@jest/globals';
import { NumFormat, NumberType } from './number-type';

const checkNumber = (item: NumberType, resultText: string, resultDisp: string, format: NumFormat) => {
    const itemText = item.getText();
    const guiText = item.getGuiString();
    const formatText = item.getFormatText(format);
    expect(itemText).toBe(resultText);
    expect(guiText).toBe(resultDisp);
    expect(item.format).toBe(format);
    expect(formatText).toBe(NumFormat[format]);
};

describe('Config Wizard', () => {
    it.each([
        ['true', 'true', 'true', NumFormat.boolean],
        ['false', 'false', 'false', NumFormat.boolean],
        ['0x42', '0x42', '0x42', NumFormat.hexadecimal],
        ['0xabcdef', '0xABCDEF', '0xABCDEF', NumFormat.hexadecimal],
        ['0xABCDEF', '0xABCDEF', '0xABCDEF', NumFormat.hexadecimal],
        ['0XABCDEF', '0xABCDEF', '0xABCDEF', NumFormat.hexadecimal],
        ['66', '66', '66', NumFormat.decimal],
        ['0102', '0102', '0102', NumFormat.octal],
        ['0b01000010', '0b01000010', '0b1000010', NumFormat.binary],
        ['abcdefg', '0', '<value not found>', NumFormat.undefined],
        ['-66', '-66', '-66', NumFormat.decimal],
    ])('parses %s as %s', (input: string, resultText: string, resultDisp: string, format: NumFormat) => {
        checkNumber(new NumberType(input), resultText, resultDisp, format);
    });

    it('parses 66 (number, not as string)', () => {
        checkNumber(new NumberType(66), '66', '66', NumFormat.decimal);
    });
    it('parses 66 (number, not as string) and sets format', () => {
        checkNumber(new NumberType(66, NumFormat.hexadecimal), '0x42', '0x42', NumFormat.hexadecimal);
    });

    it('checking display bits', () => {
        const num = new NumberType('0x42');
        const numOfDispBits = 4 * 4;
        num.numOfDigits = 8;
        num.numOfDisplayBits = numOfDispBits;
        checkNumber(num, '0x00000042', '0x0042', NumFormat.hexadecimal);
        expect(num.numOfDisplayBits).toBe(numOfDispBits);
    });

    it('checking number of digits', () => {
        const numFrom = new NumberType('0x42');
        const numOfDispBits = 4 * 4;
        numFrom.numOfDigits = 8;
        numFrom.numOfDisplayBits = numOfDispBits;

        const num = new NumberType(numFrom);
        checkNumber(num, '0x00000042', '0x0042', NumFormat.hexadecimal);

        num.numOfDigits = 0;
        expect(num.numOfDigits).toBe(1);
        num.numOfDisplayBits = 0;
        expect(num.numOfDisplayBits).toBe(1);
    });

    it('checking 0x as <value not found>', () => {
        const num = new NumberType('0x');
        checkNumber(num, '0', '<value not found>', NumFormat.undefined);
    });

    it('checking ampty string as <value not found>', () => {
        const num = new NumberType('');
        checkNumber(num, '0', '<value not found>', NumFormat.undefined);
    });

    it('checking set value', () => {
        const num = new NumberType();
        num.val = new NumberType(0x42);
        checkNumber(num, '66', '66', NumFormat.decimal);

        num.val = '0x43';
        checkNumber(num, '0x43', '0x43', NumFormat.hexadecimal);
    });

});
