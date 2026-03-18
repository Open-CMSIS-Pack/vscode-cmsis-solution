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

import { CwFormat } from './cw-format';
import { CwItem } from './cw-item';
import { ClearErrors, GetErrors } from './error';
import { Tokenizer } from './tokenizer';

const tokenizer = new Tokenizer();


describe('test CwFormat', () => {

    it('test <f.h>', () => {
        ClearErrors();
        const item = new CwItem();
        const format = new CwFormat(item);
        const lineNo = 1;
        const cmdStr = 'f.h';
        const textStr = '';
        const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
        const text = tokenizer.tokenizeDescr(textStr, lineNo);
        format.addProperty(cmd, text, lineNo);
        const formatText = format.getItemText();
        expect(formatText).not.toBe('');

        const errors = GetErrors();
        const numErr = errors.length;
        expect(numErr).toBe(0);
    });

    it('test <f.h.x>', () => {
        ClearErrors();
        const item = new CwItem();
        const format = new CwFormat(item);
        const lineNo = 1;
        const cmdStr = 'f.h.x';
        const textStr = '';
        const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
        const text = tokenizer.tokenizeDescr(textStr, lineNo);
        format.addProperty(cmd, text, lineNo);

        const errors = GetErrors();
        const numErr = errors.length;
        expect(numErr).toBe(1);
    });

    it('test <f.h>', () => {
        ClearErrors();
        const item = new CwItem();
        const format = new CwFormat(item);
        const lineNo = 1;
        const cmdStr = 'f h';
        const textStr = '';
        const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
        const text = tokenizer.tokenizeDescr(textStr, lineNo);
        format.addProperty(cmd, text, lineNo);

        const errors = GetErrors();
        const numErr = errors.length;
        expect(numErr).toBe(1);
    });

    it('parses 4096, displays as hex', () => {
        ClearErrors();
        const item = new CwItem;
        const lineNo = 1;
        const cmdStr = 'o';
        const textStr = 'Number';
        const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
        const text = tokenizer.tokenizeDescr(textStr, lineNo);
        item.addProperty(cmd, text, lineNo); // will throw error

        const format = new CwFormat(item);
        const cmdStrF = 'f.h';
        const textStrF = '';
        const cmdF = tokenizer.tokenizeCmd(cmdStrF, lineNo);
        const textF = tokenizer.tokenizeDescr(textStrF, lineNo);
        format.addProperty(cmdF, textF, lineNo); // will throw error

        const guiValue = item.getGuiValue(['', '#define VAL 4096']);
        const valStr = guiValue.value;
        expect(valStr).toBe('0x1000');
    });

});
