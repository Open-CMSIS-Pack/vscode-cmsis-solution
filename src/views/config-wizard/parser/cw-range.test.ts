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

/*
 * Copyright (C) 2023-2026 Arm Limited
 */

import { CwRange } from './cw-range';
import { Token } from './tokenizer';
import { it } from '@jest/globals';
import { NumberType } from './number-type';
import { RangeType } from './range-type';
import { GetErrors } from './error';


describe('CwRange valid syntax', () => {
    it('should parse <0-31> without errors', () => {
        const cmd = { items: ['0', '-', '31'], text: '0-31' } as Token;
        const text = { items: [], text: '' } as Token;
        const lineNo = 1;
        const range = new CwRange();

        const result = range.addProperty(cmd, text, lineNo);
        expect(result).toBe(true);

        const got = GetErrors();
        expect(got.some(e => e.includes('Range error:'))).toBe(false);
    });

    it('should parse <0-100:10> without errors', () => {
        const cmd = { items: ['0', '-', '100', ':', '10'], text: '0-100:10' } as Token;
        const text = { items: [], text: '' } as Token;
        const lineNo = 2;
        const range = new CwRange();

        const result = range.addProperty(cmd, text, lineNo);
        expect(result).toBe(true);

        const got = GetErrors();
        expect(got.some(e => e.includes('Range error:'))).toBe(false);
    });

    it('should parse <0x40-0x1000:0x10> without errors', () => {
        const cmd = { items: ['0x40', '-', '0x1000', ':', '0x10'], text: '0x40-0x1000:0x10' } as Token;
        const text = { items: [], text: '' } as Token;
        const lineNo = 3;
        const range = new CwRange();

        const result = range.addProperty(cmd, text, lineNo);
        expect(result).toBe(true);

        const got = GetErrors();
        expect(got.some(e => e.includes('Range error:'))).toBe(false);
    });

    it('should parse <-32..31> without errors', () => {
        const cmd = { items: ['-32', '..', '31'], text: '-32..31' } as Token;
        const text = { items: [], text: '' } as Token;
        const lineNo = 4;
        const range = new CwRange();

        const result = range.addProperty(cmd, text, lineNo);
        expect(result).toBe(true);

        const got = GetErrors();
        expect(got.some(e => e.includes('Range error:'))).toBe(false);
    });

    it('should parse <-50..100:10> without errors', () => {
        const cmd = { items: ['-50', '..', '100', ':', '10'], text: '-50..100:10' } as Token;
        const text = { items: [], text: '' } as Token;
        const lineNo = 5;
        const range = new CwRange();

        const result = range.addProperty(cmd, text, lineNo);
        expect(result).toBe(true);

        const got = GetErrors();
        expect(got.some(e => e.includes('Range error:'))).toBe(false);
    });

    it('should parse <-0x40..0x1000:0x10> without errors', () => {
        const cmd = { items: ['-0x40', '..', '0x1000', ':', '0x10'], text: '-0x40..0x1000:0x10' } as Token;
        const text = { items: [], text: '' } as Token;
        const lineNo = 6;
        const range = new CwRange();

        const result = range.addProperty(cmd, text, lineNo);
        expect(result).toBe(true);

        const got = GetErrors();
        expect(got.some(e => e.includes('Range error:'))).toBe(false);
    });

    it('should parse <-60..-20> without errors', () => {
        const cmd = { items: ['-60', '..', '-20'], text: '-60..-20' } as Token;
        const text = { items: [], text: '' } as Token;
        const lineNo = 4;
        const range = new CwRange();

        const result = range.addProperty(cmd, text, lineNo);
        expect(result).toBe(true);

        const got = GetErrors();
        expect(got.some(e => e.includes('Range error:'))).toBe(false);
    });

});

describe('CwRange invalid syntax', () => {
    it('should report errors for invalid range <-10-10>', () => {
        const cmd = {
            items: ['-', '10', '-', '10'],
            lineNo: 5,
            lineNoEnd: 13,
            text: '-10-10'
        } as Token;
        const text = { items: [], lineNo: 5, lineNoEnd: 13, text: '' } as Token;
        const lineNo = 6;

        const range = new CwRange();
        const result = range.addProperty(cmd, text, lineNo);

        expect(result).toBe(false);

        const got = GetErrors();
        expect(got).toEqual(
            expect.arrayContaining([
                "Line: 7: Range error: invalid range syntax: '<-10-10>'",
                "Line: 7: Range error: expecting range delimiter: '..'"
            ])
        );
    });

    it('should report errors for invalid range <-60--20>', () => {
        const cmd = {
            items: ['-', '60', '-', '-', '20'],
            lineNo: 5,
            lineNoEnd: 13,
            text: '-60--20'
        } as Token;
        const text = { items: [], lineNo: 5, lineNoEnd: 13, text: '' } as Token;
        const lineNo = 6;

        const range = new CwRange();
        const result = range.addProperty(cmd, text, lineNo);

        expect(result).toBe(false);

        const got = GetErrors();
        expect(got).toEqual(
            expect.arrayContaining([
                "Line: 7: Range error: invalid range syntax: '<-60--20>'",
                "Line: 7: Range error: expecting range delimiter: '..'"
            ])
        );
    });
});

describe('RangeType', () => {

    it('test object creation', () => {
        const item = new RangeType(new NumberType('4'), new NumberType('10'), new NumberType('2'));
        expect(item.validate()).toBe(true);
        const itemText = item.getText();
        expect(itemText).not.toBe('');
    });

    it('test apply range, lower', () => {
        const item = new RangeType(new NumberType('4'), new NumberType('10'), new NumberType('2'));
        const num = new NumberType('0');
        expect(item.apply(num)).toBe(true);
        expect(num.val).toBe(4);
    });

    it('test apply range, higher', () => {
        const item = new RangeType(new NumberType('4'), new NumberType('10'), new NumberType('2'));
        const num2 = new NumberType('20');
        expect(item.apply(num2)).toBe(true);
        expect(num2.val).toBe(10);
    });

    it('test apply range, in range but step fit', () => {
        const item = new RangeType(new NumberType('4'), new NumberType('10'), new NumberType('2'));
        const num3 = new NumberType('7');
        expect(item.apply(num3)).toBe(true);
        expect(num3.val).toBe(6);
    });

    it('test object creation, min>max', () => {
        const item2 = new RangeType(new NumberType('10'), new NumberType('0'), new NumberType('2'));
        expect(item2.validate()).toBe(false);
    });
});
