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
 * Copyright (C) 2023 - 2026 Arm Limited
 */

import { it } from '@jest/globals';
import { NumberType } from './number-type';
import { RwValue, ValueType } from './rw-value';
import { TextType } from './text-type';
import { TypeBase } from './type-base';
import { EditRect } from './cw-utils';


class ExposeRwValue extends RwValue {
    public skipComment(line: string, pos: number): number {
        return super.skipComment(line, pos);
    }
    public findCommentStart(line: string, pos: number): number {
        return super.findCommentStart(line, pos);
    }
    public getNumber(offset: number, lineNo: number, lineNoEnd: number, lines: string[]): NumberType {
        return super.getNumber(offset, lineNo, lineNoEnd, lines);
    }
    public getString(offset: number, lineNo: number, lineNoEnd: number, lines: string[]): TextType {
        return super.getString(offset, lineNo, lineNoEnd, lines);
    }

}


interface result {
    input?: string;
    lineNo?: number;
    offs?: number;
    startLineNo?: number;
    pos?: number;
    valStr?: string;
    editRect?: EditRect;
}

const resSkipComment: result[] = [
    {
        input: '',
        pos: 0
    },
    {
        input: ' ',
        pos: 1
    }, // after skipWhite
    {
        input: '// a line comment',
        pos: '// a line comment'.length
    },
    {
        input: '/* an embedded comment*/int x;',
        pos: '/* an embedded comment*/'.length
    },
    {
        input: '/* an embedded',
        pos: '/* an embedded'.length
    },
    {
        input: 'multiline comment*/int x;',
        pos: 'multiline comment*/'.length
    },
];

const resNumberTest: result[] = [
    {
        input: '2',
        startLineNo: 0,
        valStr: '2'
    },
    {
        input: '42',
        startLineNo: 1,
        valStr: '42'
    },
    {
        input: 'foo 42',
        startLineNo: 2,
        valStr: '42'
    },
    {
        input: 'foo56 42',
        startLineNo: 3,
        valStr: '42'
    },
    {
        input: '#define FOO56 (42*7+3)',
        startLineNo: 4,
        offs: 1,
        valStr: '7'
    },
    {
        input: '/* some comment about number 42 is the answer */ #define FOO56 (42*7+3)',
        startLineNo: 4,
        offs: 1,
        valStr: '7'
    },
    {
        input: '#define VBUS_OFFSET (-200)',
        startLineNo: 6,
        offs: 0,
        valStr: '-200'
    },
];

const valNotFound = new TypeBase();

const resStringTest: result[] = [
    {
        input: '"this is string 1"',
        startLineNo: 0,
        valStr: 'this is string 1'
    },
    {
        input: '#define FOO42 "this is string 2"',
        startLineNo: 1,
        valStr: 'this is string 2'
    },
    {
        input: '#define FOO42 "this is string 3" // followed by a comment',
        startLineNo: 2,
        valStr: 'this is string 3'
    },
    {
        input: '#define FOO42 /*embedded comment*/ "this is string 4"',
        startLineNo: 3,
        valStr: 'this is string 4'
    },
    {
        input: '#define FOO42 /*embedded comment*/ "this is string 5"',
        startLineNo: 3,
        offs: 1,
        valStr: 'this is string 5'
    },
    {
        input: '//#define STR2 L"next line commented"',  // must be the last test, if a string follows, offs-count will be valid!
        startLineNo: 4,
        offs: 2,
        valStr: valNotFound.getValueNotFoundGui()
    },
];


function prepare(res: result[]): string[] {
    const lines: string[] = [];
    let lineNo = 0;
    for (const item of res) {
        if (typeof item.input === 'string') {
            lines.push(item.input);
            lineNo++;
        }
        item.lineNo = lineNo;
    }

    return lines;
}

describe('rwValue', () => {

    describe('test RW file changer', () => {
        it('test skip comments', () => {
            const rwValue = new ExposeRwValue(0, 0, 0, [''], ValueType.none);
            const lines = prepare(resSkipComment);
            let testNo = -1;

            for (const line of lines) {
                let pos = 0;

                do {
                    testNo++;
                    pos = rwValue.skipComment(line, pos);
                    expect(pos).toEqual(resSkipComment[testNo].pos);
                    if (rwValue.findCommentStart(line, pos) == -1) { // no further comment in current line
                        break;
                    }
                } while (pos < line.length && testNo < resSkipComment.length);
            }
        });

        it('test get numbers', () => {
            const lines = prepare(resNumberTest);
            const rwValue = new ExposeRwValue(0, 0, 0, [''], ValueType.none);

            for (const test of resNumberTest) {
                const offset = test.offs ?? 0;
                const startLineNo = test.startLineNo ?? 0;
                const endLineNo = 0;
                const num = rwValue.getNumber(offset, startLineNo, endLineNo, lines);

                if (num.isValid()) {
                    expect(num.getGuiString()).toEqual(test.valStr);
                }
            }
        });

        it('test get strings', () => {
            const lines = prepare(resStringTest);
            const rwValue = new ExposeRwValue(0, 0, 0, [''], ValueType.none);

            for (const test of resStringTest) {
                const offset = test.offs ?? 0;
                const startLineNo = test?.startLineNo ?? 0;
                const endLineNo = 0;
                const text = rwValue.getString(offset, startLineNo, endLineNo, lines);
                expect(text.getGuiString()).toEqual(test.valStr);
            }
        });

    });

    describe('test comment state detection', () => {
        it('should not detect inconsistent state when all lines are commented', () => {
            const lines = [
                '// first line',
                '// second line',
                '// third line'
            ];
            const rwValue = new RwValue(0, 3, 0, lines, ValueType.comment);

            expect(rwValue.inconsistentState).toBe(false);
        });

        it('should not detect inconsistent state when all lines are uncommented', () => {
            const lines = [
                'first line',
                'second line',
                'third line'
            ];
            const rwValue = new RwValue(0, 3, 0, lines, ValueType.comment);

            expect(rwValue.inconsistentState).toBe(false);
        });

        it('should detect inconsistent state when first line is uncommented and second is commented', () => {
            const lines = [
                'first line',
                '// second line',
                'third line'
            ];
            const rwValue = new RwValue(0, 3, 0, lines, ValueType.comment);

            expect(rwValue.inconsistentState).toBe(true);
        });

        it('should detect inconsistent state when first line is commented and second is uncommented', () => {
            const lines = [
                '// first line',
                'second line',
                'third line'
            ];
            const rwValue = new RwValue(0, 3, 0, lines, ValueType.comment);

            expect(rwValue.inconsistentState).toBe(true);
        });

        it('should detect inconsistent state with mixed commenting throughout block', () => {
            const lines = [
                'first line',
                '// second line',
                'third line',
                '// fourth line',
                'fifth line'
            ];
            const rwValue = new RwValue(0, 5, 0, lines, ValueType.comment);

            expect(rwValue.inconsistentState).toBe(true);
        });

        it('should propagate inconsistent state to GuiValue', () => {
            const lines = [
                'first line',
                '// second line'
            ];
            const rwValue = new RwValue(0, 2, 0, lines, ValueType.comment);
            const guiValue = rwValue.getGuiValue();

            expect(rwValue.inconsistentState).toBe(true);
            expect(guiValue.inconsistent).toBe(true);
        });

        it('should not set inconsistent flag in GuiValue when state is consistent', () => {
            const lines = [
                'first line',
                'second line'
            ];
            const rwValue = new RwValue(0, 2, 0, lines, ValueType.comment);
            const guiValue = rwValue.getGuiValue();

            expect(rwValue.inconsistentState).toBe(false);
            expect(guiValue.inconsistent).toBe(false);
        });

        it('should handle inconsistent state with whitespace variations', () => {
            const lines = [
                '  first line',
                '  // second line',
                '    third line'
            ];
            const rwValue = new RwValue(0, 3, 0, lines, ValueType.comment);

            expect(rwValue.inconsistentState).toBe(true);
        });

        it('should detect inconsistent state even with empty lines', () => {
            const lines = [
                'first line',
                '',
                '// second line'
            ];
            const rwValue = new RwValue(0, 3, 0, lines, ValueType.comment);

            expect(rwValue.inconsistentState).toBe(true);
        });
    });
});
