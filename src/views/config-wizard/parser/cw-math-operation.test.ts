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

import { beforeEach, describe, expect, it } from '@jest/globals';
import { ClearErrors } from './error';
import { CwMathOperation } from './cw-math-operation';
import { CwOption } from './cw-option';
import { NumberType } from './number-type';
import { Tokenizer } from './tokenizer';

const tokenizer = new Tokenizer();

const createMathOperation = (command: string) => {
    const option = new CwOption();
    const mathOperation = new CwMathOperation(option);

    mathOperation.addProperty(
        tokenizer.tokenizeCmd(command, 1),
        tokenizer.tokenizeDescr('', 1),
        1
    );

    return mathOperation;
};

describe('CwMathOperation', () => {
    beforeEach(() => {
        ClearErrors();
    });

    describe('read and write conversion', () => {
        it.each([
            { command: '#+3', value: 12, writeValue: 15, readValue: 9 },
            { command: '#-3', value: 12, writeValue: 9, readValue: 15 },
            { command: '#*3', value: 12, writeValue: 36, readValue: 4 },
            { command: '#/3', value: 12, writeValue: 4, readValue: 36 },
            { command: '#&0x0A', value: 0x0c, writeValue: 0x08, readValue: 0x0e },
            { command: '#|0x0A', value: 0x0c, writeValue: 0x0e, readValue: 0x08 },
        ])('applies $command for write and its inverse for read', ({ command, value, writeValue, readValue }) => {
            const mathOperation = createMathOperation(command);
            const writeResult = new NumberType(value);
            const readResult = new NumberType(value);

            expect(mathOperation.applyWrite(writeResult)).toBe(true);
            expect(writeResult.val).toBe(writeValue);

            expect(mathOperation.applyRead(readResult)).toBe(true);
            expect(readResult.val).toBe(readValue);
        });

        it.each([
            '#+3',
            '#-3',
            '#*3',
            '#/3',
        ])('restores arithmetic values when a $command write result is read back', command => {
            const mathOperation = createMathOperation(command);
            const value = new NumberType(12);

            expect(mathOperation.applyWrite(value)).toBe(true);
            expect(mathOperation.applyRead(value)).toBe(true);
            expect(value.val).toBe(12);
        });

        it('does not modify values when the math operation is invalid', () => {
            const mathOperation = createMathOperation('#^3');
            const value = new NumberType(12);

            expect(mathOperation.applyWrite(value)).toBe(false);
            expect(mathOperation.applyRead(value)).toBe(false);
            expect(value.val).toBe(12);
        });
    });
});
