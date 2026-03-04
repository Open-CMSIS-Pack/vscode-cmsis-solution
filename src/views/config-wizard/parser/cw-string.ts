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

import { CwItem } from './cw-item';
import { Token } from './tokenizer';
import { NumberType } from './number-type';
import { AddText } from './cw-utils';
import { GuiTypes, GuiValue, TreeNodeElement } from '../confwiz-webview-common';
import { RwValue, ValueType } from './rw-value';
import { TextType } from './text-type';
import { LogErr } from './error';


export class CwString extends CwItem {
    private _maxLength = new NumberType();

    constructor(parent?: CwItem) {
        super(parent);
    }

    public get maxLength() { return this._maxLength; }
    public set maxLength(maxLength: NumberType) { this._maxLength = maxLength; }

    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        this.setType(this.translateType('s'));
        this.description.value = text.items;
        this.lineNo = lineNo;

        const type = cmd.items[0];   // 's'
        const length = cmd.items.length;

        switch (type) {
            case 's': {
                if (cmd.items.length > 4) {  // <s1.32>
                    LogErr(['Option: unexpected items found: ', cmd.text], lineNo);
                }
            } break;
            default: {
                LogErr('Error setting Type of String', this.lineNo);
            } break;
        }

        let offsetText = '0';
        let maxLengthText = '';
        let index = 1;
        if (index < length) { // number, text or '.'
            const item = cmd.items[index];
            if (item != '.') {
                offsetText = item;
                index++;
            }
        }
        if (index < length) { // '.' and number
            const item = cmd.items[index++];
            if (item == '.') {   // expecting number
                if (index < length) {
                    maxLengthText = cmd.items[index];
                } else {
                    LogErr('Expected: Number, e.g. <s1.32>', this.lineNo);
                }
            }
        }

        const numOffset = new NumberType(offsetText);
        if (numOffset.isValid()) {
            this.offset = numOffset;
        }

        const numMaxLength = new NumberType(maxLengthText);
        if (numMaxLength.isValid()) {
            this.maxLength = numMaxLength;
        }

        this.description.value = text.items;

        return true;
    }

    public applyWrite(value: TextType):boolean {
        const maxLen = this.maxLength.val;
        if (maxLen < 1) {
            return false;
        }

        if (value.length > maxLen) {
            value.value = value.value.substring(0, maxLen);
        }

        return true;
    }

    public getGuiItem(guiItem: TreeNodeElement): boolean {
        guiItem.type = GuiTypes.edit;

        return super.getGuiItem(guiItem);
    }

    public getItemText(): string {
        let text = super.getItemText();
        text = AddText(text, ['Offset:', this.offset.getText()]);
        if (this.maxLength.isValid()) {
            text = AddText(text, ['Max length:', this.maxLength.getText()]);
        }
        return text;
    }

    public getGuiValue(lines: string[]): GuiValue {
        const val = new RwValue(this.lineNo, this.lineNoEnd, this.offset.val, lines, ValueType.text);

        return val.getGuiValue();
    }

    public setGuiValue(_lines: string[], newValue: GuiValue): boolean {
        const text = new TextType(newValue.value);
        if (!text.isValid()) {
            return false;
        }

        if (this.applyWrite(text)) {
            newValue.value = text.value;
        }

        return true;
    }
}
