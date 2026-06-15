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
import { CwString } from './cw-string';
import { Tokenizer } from './tokenizer';

const tokenizer = new Tokenizer();

function createString(command: string): CwString {
    const stringItem = new CwString();
    stringItem.addProperty(
        tokenizer.tokenizeCmd(command, 0),
        tokenizer.tokenizeDescr('Device name', 0),
        0
    );

    return stringItem;
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

describe('CwString', () => {
    beforeEach(() => {
        ClearErrors();
    });

    describe('read behavior', () => {
        it('should expose string items as editable GUI fields', () => {
            const stringItem = createString('s');
            const guiItem = createTreeNodeElement();

            stringItem.getGuiItem(guiItem);

            expect(guiItem.type).toBe(GuiTypes.edit);
            expect(guiItem.name).toBe('Device name');
        });

        it('should read the first quoted string by default', () => {
            const stringItem = createString('s');

            const guiValue = stringItem.getGuiValue(['#define DEVICE_NAME "Board"']);

            expect(guiValue.value).toBe('Board');
            expect(guiValue.readOnly).toBe(false);
        });

        it('should read the quoted string selected by offset', () => {
            const stringItem = createString('s1');

            const guiValue = stringItem.getGuiValue(['#define DEVICE_NAMES "Board" "Debug"']);

            expect(guiValue.value).toBe('Debug');
            expect(guiValue.readOnly).toBe(false);
        });
    });

    describe('write behavior', () => {
        it('should accept a new string value', () => {
            const stringItem = createString('s');
            const newValue: GuiValue = { value: 'Trace', readOnly: false };

            const changed = stringItem.setGuiValue([], newValue);

            expect(changed).toBe(true);
            expect(newValue.value).toBe('Trace');
        });

        it('should preserve a value whose length matches maxLength', () => {
            const stringItem = createString('s.5');
            const newValue: GuiValue = { value: 'Trace', readOnly: false };

            const changed = stringItem.setGuiValue([], newValue);

            expect(changed).toBe(true);
            expect(newValue.value).toBe('Trace');
        });

        it('should truncate a value that exceeds maxLength', () => {
            const stringItem = createString('s.5');
            const newValue: GuiValue = { value: 'TracePort', readOnly: false };

            const changed = stringItem.setGuiValue([], newValue);

            expect(changed).toBe(true);
            expect(newValue.value).toBe('Trace');
        });

        it('should leave values unchanged when maxLength is not configured', () => {
            const stringItem = createString('s');
            const newValue: GuiValue = { value: 'TracePort', readOnly: false };

            const changed = stringItem.setGuiValue([], newValue);

            expect(changed).toBe(true);
            expect(newValue.value).toBe('TracePort');
        });
    });
});
