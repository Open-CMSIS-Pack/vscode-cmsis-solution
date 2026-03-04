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
import { CwItem } from './cw-item';
import { ClearErrors, GetErrors } from './error';
import { TextType } from './text-type';
import { Tokenizer } from './tokenizer';


const tokenizer = new Tokenizer();

describe('Config Wizard', () => {


    it('test CwItem', () => {
        ClearErrors();
        const item = new CwItem;
        const lineNo = 42;
        const cmdStr = 'x';
        const textStr = 'foo';
        const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
        const text = tokenizer.tokenizeDescr(textStr, lineNo);

        item.addProperty(cmd, text, lineNo); // will throw error
        item.description = new TextType('Foo');  // usually set via this.description.value = ...
        const errors = GetErrors();
        const numErr = errors.length;
        const lines: string[] = [ 'foo 42', 'bar 43'];
        const guiVal = item.getGuiValue(lines);
        expect(numErr).toBeGreaterThan(0);
        expect(guiVal).toBeDefined();
    });


    it.each([
        ['h', 'Heading'],
        ['e', 'Heading'],
        ['i', 'Info'],
        ['n', 'Notification'],
        ['d', 'Default'],
        ['c', 'Comment'],
        ['o', 'Option'],
        ['q', 'Option'],
        ['=', 'OptionAssign'],
        ['s', 'String'],
        ['a', 'Array'],
        ['-', 'Range'],
        ['..', 'Range'],
        ['f', 'Format'],
        ['#', 'MathOperation'],
        ['', ''],
        ['~', ''],
    ])('parses %s as %s', (input: string, resultText: string) => {
        const item = new CwItem;
        const parseResult = item.typeToString(item.translateType(input));
        expect(parseResult).toBe(resultText);
    });
});
