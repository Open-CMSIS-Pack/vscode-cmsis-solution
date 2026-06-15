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
import { GuiTypes, GuiValue, TreeNodeElement } from '../confwiz-webview-common';
import { ClearErrors } from './error';
import { CwArray } from './cw-array';
import { Tokenizer } from './tokenizer';

const tokenizer = new Tokenizer();

function createArray(command: string): CwArray {
    const arrayItem = new CwArray();
    arrayItem.addProperty(
        tokenizer.tokenizeCmd(command, 0),
        tokenizer.tokenizeDescr('Memory buffer', 0),
        0
    );

    return arrayItem;
}

function createTreeNodeElement(): TreeNodeElement {
    const value: GuiValue = { value: '', readOnly: false };
    return {
        guiId: 1,
        name: '',
        type: GuiTypes.none,
        group: false,
        value,
        newValue: value
    };
}

describe('CwArray', () => {
    beforeEach(() => {
        ClearErrors();
    });

    describe('GUI behavior', () => {
        it('should expose array items as editable GUI fields', () => {
            const arrayItem = createArray('a.16');
            const guiItem = createTreeNodeElement();

            arrayItem.getGuiItem(guiItem);

            expect(guiItem.type).toBe(GuiTypes.edit);
            expect(guiItem.name).toBe('Memory buffer');
        });
    });

    describe('read behavior', () => {
        it('should read the numeric value selected by offset', () => {
            const arrayItem = createArray('a1.16');

            const guiValue = arrayItem.getGuiValue(['#define BUFFER 0x10 0x20 0x30']);

            expect(guiValue.value).toBe('0x20');
            expect(guiValue.readOnly).toBe(false);
        });
    });

    describe('summary behavior', () => {
        it('should include offset and max length in item text when configured', () => {
            const arrayItem = createArray('a1.16');

            expect(arrayItem.getItemText()).toContain('Offset: 1');
            expect(arrayItem.getItemText()).toContain('Max length: 16');
        });

        it('should default the offset to zero when only max length is configured', () => {
            const arrayItem = createArray('a.16 BUFFER');

            expect(arrayItem.getGuiValue(['#define BUFFER 0x10 0x20']).value).toBe('0x10');
            expect(arrayItem.getItemText()).toContain('Offset: 0');
            expect(arrayItem.getItemText()).toContain('Max length: 16');
        });
    });
});
