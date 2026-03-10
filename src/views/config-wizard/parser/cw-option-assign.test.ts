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
import { CwOption } from './cw-option';
import { CwOptionAssign } from './cw-option-assign';
import { ClearErrors, GetErrors } from './error';
import { Tokenizer } from './tokenizer';


const tokenizer = new Tokenizer();


describe('CwOptionAssign', () => {
    const parent = new CwOption;

    it('test assignment', () => {
        ClearErrors();
        const item = new CwOptionAssign(parent);
        const lineNo = 1;
        const cmdStr = '1=';
        const textStr = 'foo';
        const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
        const text = tokenizer.tokenizeDescr(textStr, lineNo);
        item.addProperty(cmd, text, lineNo);
        const itemText = item.getItemText();
        expect(itemText).not.toBe('');

        const errors = GetErrors();
        const numErr = errors.length;
        expect(numErr).toBe(0);
    });

    it('test error assignment', () => {
        ClearErrors();
        const item = new CwOptionAssign(parent);
        const lineNo = 1;
        const cmdStr = '=';
        const textStr = 'foo';
        const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
        const text = tokenizer.tokenizeDescr(textStr, lineNo);
        item.addProperty(cmd, text, lineNo); // will throw error
        const itemText = item.getItemText();
        expect(itemText).not.toBe('');

        const errors = GetErrors();
        const numErr = errors.length;
        expect(numErr).toBe(1);
    });

    it('rejects symbol assignment starting with digit and underscore', () => {
        ClearErrors();
        const item = new CwOptionAssign(parent);
        const lineNo = 1;
        const cmdStr = '1_FOO=';
        const textStr = 'foo';
        const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
        const text = tokenizer.tokenizeDescr(textStr, lineNo);
        item.addProperty(cmd, text, lineNo);

        const errors = GetErrors();
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects symbol assignment starting with digit and letters', () => {
        ClearErrors();
        const item = new CwOptionAssign(parent);
        const lineNo = 1;
        const cmdStr = '2BAR=';
        const textStr = 'bar';
        const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
        const text = tokenizer.tokenizeDescr(textStr, lineNo);
        item.addProperty(cmd, text, lineNo);

        const errors = GetErrors();
        expect(errors.length).toBeGreaterThan(0);
    });

});
