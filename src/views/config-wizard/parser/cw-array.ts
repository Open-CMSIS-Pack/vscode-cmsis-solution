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
import { TextType } from './text-type';
import { GuiTypes, TreeNodeElement } from '../confwiz-webview-common';
import { LogErr } from './error';
import { CwRange } from './cw-range';


export class CwArray extends CwItem {
    private _maxLength = new NumberType();
    private _symbolName = new TextType;
    private _range = new CwRange;

    constructor(parent?: CwItem) {
        super(parent);
    }

    public get maxLength() { return this._maxLength; }
    public set maxLength(maxLength: NumberType) { this._maxLength = maxLength; }
    public get symbolName() { return this._symbolName; }
    public set symbolName(symbolName: TextType) { this._symbolName = symbolName; }

    public get range() {
        return this._range;
    }
    public setRange(item: CwRange) {
        this._range = item;
    }

    /* This item is a a bit unaligned to the remaining items:
    *  <a.16 MODIFIER_NAME> Descriptive text <0..255> <f.h>
    * treated as:
    * - <a[skip].[max_len]>
    * - <a.[max_len] [identifier Symbol]>
    */
    protected parseAddProperty(cmd: Token) {
        const length = cmd.items.length;
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
                    LogErr('Expected: Number, e.g. <a.16> ', this.lineNo);
                }
            }
        }

        if (index < length) { // text
            const item = cmd.items[index];
            if (item == ' ') {   // expecting string
                if (index < length) {
                    this.symbolName = new TextType(cmd.items.slice(index).join(''));
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
    }

    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        this.setType(this.translateType('a'));
        this.description.value = text.items;
        this.lineNo = lineNo;

        const type = cmd.items[0];   // 'a'

        switch (type) {
            case 'a': {
                if (cmd.items.length > 5) {  // <a1.16 SYMBOL>
                    LogErr(['Option: unexpected items found: ', cmd.text], lineNo);
                }
            } break;
            default: {
                LogErr('Error setting Type of Array ', this.lineNo);
            } break;
        }

        this.parseAddProperty(cmd);
        this.description.value = text.items;

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
}
