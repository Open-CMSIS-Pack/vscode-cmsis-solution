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
import { CwInfo } from './cw-info';
import { CwItem } from './cw-item';
import { ClearErrors, GetErrors } from './error';
import { Tokenizer } from './tokenizer';

const tokenizer = new Tokenizer();

function createParentItem(): CwItem {
    const parent = new CwItem();
    parent.setType('Option');

    return parent;
}

function addInfo(parent: CwItem, command = 'i', description = 'Select the active source', lineNo = 0): CwInfo {
    const info = new CwInfo(parent);
    info.addProperty(
        tokenizer.tokenizeCmd(command, lineNo),
        tokenizer.tokenizeDescr(description, lineNo),
        lineNo
    );

    return info;
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

describe('CwInfo', () => {
    beforeEach(() => {
        ClearErrors();
    });

    describe('parent info behavior', () => {
        it('exposes info descriptions through the parent GUI item', () => {
            const parent = createParentItem();

            addInfo(parent, 'i', 'Select the active source');
            addInfo(parent, 'i', 'Default: internal oscillator');

            const guiItem = createTreeNodeElement();
            parent.getGuiItem(guiItem);

            expect(guiItem.infoItems).toEqual([
                'Select the active source',
                'Default: internal oscillator'
            ]);
            expect(GetErrors()).toEqual([]);
        });
    });

    describe('command validation', () => {
        it('reports unexpected command payload on info annotations', () => {
            const parent = createParentItem();

            addInfo(parent, 'i.', 'Unexpected payload', 4);

            expect(GetErrors()).toEqual([
                'Line: 5: Info: unexpected items found: i.'
            ]);
        });
    });
});
