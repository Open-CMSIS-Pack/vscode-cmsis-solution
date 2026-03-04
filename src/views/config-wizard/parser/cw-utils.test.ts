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
import * as utils from './cw-utils';


describe('utils', () => {
    describe('test string insert', () => {
        it('test string insert before', () => {
            const text = utils.insertString('test text', 'extended ', 0);
            const result = 'extended test text';
            expect(text).toBe(result);
        });
        it('test string insert after', () => {
            const text = utils.insertString('test text', ' extended', 9);
            const result = 'test text extended';
            expect(text).toBe(result);
        });
        it('test string insert middle', () => {
            const text = utils.insertString('test text', 'extended ', 5);
            const result = 'test extended text';
            expect(text).toBe(result);
        });
    });

    describe('test AddText', () => {
        it('test AddText', () => {
            let text = '';

            text = utils.AddText(text, ['more', 'text']);
            expect(text).toBe('more text');

            text = '';
            text = utils.AddText(text, 'foo');
            expect(text).toBe('foo');

            text = utils.AddText(text, 'bar');
            expect(text).toBe('foo bar');

            text = utils.AddText(text, ['more', 'text']);
            expect(text).toBe('foo bar more text');
        });
    });

});
