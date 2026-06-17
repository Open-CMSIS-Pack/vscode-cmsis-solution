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
import { ClearErrors, GetErrors } from './error';
import { CwNotification } from './cw-notification';
import { Tokenizer } from './tokenizer';

const tokenizer = new Tokenizer();

function createNotification(command = 'n', description = 'Debugger access is disabled', lineNo = 0): CwNotification {
    const notification = new CwNotification();
    notification.addProperty(
        tokenizer.tokenizeCmd(command, lineNo),
        tokenizer.tokenizeDescr(description, lineNo),
        lineNo
    );

    return notification;
}

function createTreeNodeElement(): TreeNodeElement {
    const value: GuiValue = { value: '', readOnly: false };
    return {
        guiId: 1,
        name: '',
        type: GuiTypes.none,
        group: true,
        value,
        newValue: value
    };
}

describe('CwNotification', () => {
    beforeEach(() => {
        ClearErrors();
    });

    describe('display-only behavior', () => {
        it('exposes notification text as a non-group tree item without an editable value', () => {
            const notification = createNotification();
            const guiItem = createTreeNodeElement();

            notification.getGuiItem(guiItem);

            expect(guiItem.group).toBe(false);
            expect(guiItem.name).toBe('Debugger access is disabled');
            expect(notification.getGuiValue(['#define DEBUG_ACCESS 0'])).toEqual({ value: '', readOnly: false });
            expect(GetErrors()).toEqual([]);
        });
    });

    describe('command validation', () => {
        it('reports unexpected command payload on notification annotations', () => {
            createNotification('n0', 'Unexpected payload', 7);

            expect(GetErrors()).toEqual([
                'Line: 8: Notification: unexpected items found: n0'
            ]);
        });
    });
});
