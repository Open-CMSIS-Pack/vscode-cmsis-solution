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
import { NumberType } from './number-type';
import { Token } from './tokenizer';
import { AddText } from './cw-utils';
import { GuiTypes, GuiValue, TreeNodeElement } from '../confwiz-webview-common';
import { RwValue, ValueType } from './rw-value';
import { BitfieldType } from './bitfield-type';
import { LogErr } from './error';


export class CwHeading extends CwItem {
    private _hasEnable = false;
    private _bitfield = new BitfieldType();

    constructor(parent?: CwItem) {
        super(parent);
    }

    public get hasEnable() { return this._hasEnable; }
    public set hasEnable(hasEnable: boolean) { this._hasEnable = hasEnable; }
    public get bitfield() { return this._bitfield; }
    public set bitfield(bitfield: BitfieldType) { this._bitfield = bitfield; }

    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        this.setType(this.translateType('h'));
        this.description.value = text.items;
        this.lineNo = lineNo;

        const command = cmd.items[0];   // 'h' or 'e'
        const length = cmd.items.length;

        switch (command) {
            case 'h':
                if (cmd.items.length > 1) {  // <h0>
                    LogErr(['Heading: unexpected items found: ', cmd.text], lineNo);
                }
                break;
            case 'e':
                if (cmd.items.length > 4) {  // <e0.1>
                    LogErr(['Heading: unexpected items found: ', cmd.text], lineNo);
                }
                this.hasEnable = true;
                break;
            default:
                LogErr('Error setting Type of Heading', this.lineNo);
                break;
        }

        let offsetText = '0';
        let bitText = '0';
        let index = 1;
        if (index < length) { // number or '.'
            const item = cmd.items[index];
            if (item != '.') {
                if (!this.hasEnable) {
                    LogErr(['Unexpected offset specifier found for <', command, '>'], this.lineNo);
                }
                offsetText = item;
                index++;
            }
        }
        if (index < length) { // '.' and number
            const item = cmd.items[index++];
            if (item == '.') {   // expecting number
                if (!this.hasEnable) {
                    LogErr(['Unexpected bit specifier found for <', command, '>'], this.lineNo);
                }
                if (index < length) {
                    bitText = cmd.items[index++];
                } else {
                    if (this.hasEnable) {
                        LogErr('Expected: Number, e.g. <e0.1>', this.lineNo);
                    }
                }
            }
        }
        if (index < length) { // '..' and number (unexpected)
            const item = cmd.items[index++];
            if (item == '..') {
                LogErr(['Unexpected range specifier found for <', command, '>'], this.lineNo);
            }
        }

        const numOffset = new NumberType(offsetText);
        if (numOffset.isValid()) {
            this.offset = numOffset;
        }
        const numBit = new NumberType(bitText);
        if (numBit.isValid()) {
            this.bitfield.lsb = numBit;
            this.bitfield.msb = numBit;
            this.bitfield.valid = true;
        }

        return true;
    }

    public getGuiItem(guiItem: TreeNodeElement): boolean {
        guiItem.group = true;
        if (this._hasEnable) {
            guiItem.type = GuiTypes.check;
        }

        return super.getGuiItem(guiItem);
    }

    public getGuiValue(lines: string[]): GuiValue { // no value display for Headings (returns empty string)
        if (!this._hasEnable) {
            return { value: '', readOnly: false };
        }

        const val = new RwValue(this.lineNo, this.lineNoEnd, this.offset.val, lines, ValueType.number);

        const v = val.value;
        if (!(v instanceof NumberType)) {  // apply bitfield if number
            return { value: '', readOnly: false };
        }

        this.bitfield.applyRead(v);
        const guiVal = val.getGuiValue();
        guiVal.checked = v.val ? true : false;

        return guiVal;
    }

    public setGuiValue(lines: string[], newValue: GuiValue): boolean {
        if (!this._hasEnable) {
            return false;
        }

        const val = new RwValue(this.lineNo, this.lineNoEnd, this.offset.val, lines, ValueType.number);
        const newValNum = new NumberType(newValue.value);
        if (newValNum == undefined || !(val.value instanceof NumberType)) {
            return false;
        }

        const oldValNum = new NumberType(val.value);
        this.bitfield.applyRead(oldValNum);
        if (newValNum.val == oldValNum.val) {
            return false;   // not changed
        }

        newValNum.format = oldValNum.format;
        newValNum.displayFormat = oldValNum.displayFormat;

        const modifyValNum = new NumberType(val.value);
        this.bitfield.applyWrite(newValNum, modifyValNum);
        newValue.editStr = modifyValNum.getText();

        return true;
    }


    public getItemText(): string {
        let text = super.getItemText();
        text = AddText(text, ['Offset:', this.offset.getText()]);
        if (this.hasEnable) {
            text = AddText(text, 'Enable');
        }
        text = AddText(text, ['Bit:', this.bitfield.getText()]);
        return text;
    }

}
