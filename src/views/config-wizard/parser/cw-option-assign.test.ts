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

import { it } from '@jest/globals';
import { CwOption } from './cw-option';
import { CwOptionAssign } from './cw-option-assign';
import { ClearErrors, GetErrors } from './error';
import { Tokenizer } from './tokenizer';


const tokenizer = new Tokenizer();


describe('CwOptionAssign', () => {
    const parent = new CwOption;

    function runAssignment(cmdStr: string, textStr = 'foo') {
        ClearErrors();

        const item = new CwOptionAssign(parent);
        const lineNo = 1;
        const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
        const text = tokenizer.tokenizeDescr(textStr, lineNo);
        item.addProperty(cmd, text, lineNo);

        return {
            item,
            errors: GetErrors()
        };
    }

    it('test assignment', () => {
        const { item, errors } = runAssignment('1=');
        const itemText = item.getItemText();
        expect(itemText).not.toBe('');
        expect(errors.length).toBe(0);
    });

    it('test error assignment', () => {
        const { item, errors } = runAssignment('='); // will throw error
        const itemText = item.getItemText();
        expect(itemText).not.toBe('');
        expect(errors.length).toBe(1);
    });

    it('rejects symbol assignment starting with digit and underscore', () => {
        const { errors } = runAssignment('1_FOO=');
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects symbol assignment starting with digit and letters', () => {
        const { errors } = runAssignment('2BAR=', 'bar');
        expect(errors.length).toBeGreaterThan(0);
    });

    it('accepts hexadecimal assignment values', () => {
        const { item, errors } = runAssignment('0x2A=');

        expect(item.value?.getGuiString()).toBe('0x2A');
        expect(errors.length).toBe(0);
    });

    it('accepts octal assignment values', () => {
        const { item, errors } = runAssignment('077=');

        expect(item.value?.getGuiString()).toBe('077');
        expect(errors.length).toBe(0);
    });

    it('accepts binary assignment values', () => {
        const { item, errors } = runAssignment('0b1010=');

        expect(item.value?.getGuiString()).toBe('0b1010');
        expect(errors.length).toBe(0);
    });

    it('accepts valid identifier assignment values', () => {
        const { item, errors } = runAssignment('FOO_BAR2=');

        expect(item.value?.getGuiString()).toBe('FOO_BAR2');
        expect(errors.length).toBe(0);
    });

});
