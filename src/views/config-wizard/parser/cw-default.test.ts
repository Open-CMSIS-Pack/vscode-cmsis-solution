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

import { CwDefault } from './cw-default';
import { CwItem } from './cw-item';
import { ClearErrors, GetErrors } from './error';
import { Tokenizer } from './tokenizer';

const tokenizer = new Tokenizer();

describe('CwDefault', () => {

    it('testing <d> foo', () => {
        const item = new CwDefault;
        const lineNo = 1;
        const cmdStr = 'd';
        const textStr = 'foo';
        const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
        const text = tokenizer.tokenizeDescr(textStr, lineNo);
        item.addProperty(cmd, text, lineNo);
        const itemText = item.getItemText();
        expect(itemText).not.toBe('');
    });


    it('testing <d1.1> foo', () => {
        ClearErrors();

        const rootItem = new CwItem;
        const item = new CwDefault(rootItem);
        const lineNo = 1;
        const cmdStr = 'd1.1';
        const textStr = 'foo';
        const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
        const text = tokenizer.tokenizeDescr(textStr, lineNo);
        item.addProperty(cmd, text, lineNo);
        const itemText = item.getItemText();
        expect(itemText).not.toBe('');

        const errors = GetErrors();
        const numErr = errors.length;
        expect(numErr).toBe(1);
    });
});
