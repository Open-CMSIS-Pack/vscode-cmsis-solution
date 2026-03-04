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

import { TextType } from './text-type';

describe('text-type class test', () => {
    it('test class functions', () => {
        const text = new TextType();
        expect(text.getText()).toBe('');

        const value = 'Hello, World';
        text.value = value;
        expect(text.getText()).toBe(value);
        expect(text.length).toBe(value.length);

        const valueArr = ['Hello', ', ', 'World'];
        text.value = valueArr;
        expect(text.getText()).toBe(value);

        const text2 = new TextType(value, 'Hello, '.length);
        expect(text2.getText()).toBe('World');

        const value3 = ' Hello, World ';
        const text3 = new TextType(value3);
        expect(text3.getText()).toBe('Hello, World');
        expect(text3.getGuiString()).toBe('Hello, World');
        expect(text3.getTextRaw()).toBe(value3);

        const value4 = 'Hello, \\nWorld';
        const text4 = new TextType(value4);
        expect(text4.getGuiString()).toBe('Hello, \nWorld');

        const value5 = undefined;
        const text5 = new TextType(value5);
        expect(text5.getText()).toBe('');
        expect(text5.getGuiString()).toBe('<value not found>');
        expect(text5.isValid()).toBe(false);
        expect(text5.length).toBe(0);
    });
});
