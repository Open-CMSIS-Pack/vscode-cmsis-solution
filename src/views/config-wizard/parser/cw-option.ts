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

/*
 * Copyright (C) 2023 - 2026 Arm Limited
 */

import { CwItem } from './cw-item';
import { NumberType } from './number-type';
import { Token } from './tokenizer';
import { AddText } from './cw-utils';
import { TextType } from './text-type';
import { GuiTypes, GuiValue, TreeNodeElement } from '../confwiz-webview-common';
import { CwOptionAssign } from './cw-option-assign';
import { CwRange } from './cw-range';
import { RwValue, ValueType } from './rw-value';
import { BitfieldType } from './bitfield-type';
import { CwMathOperation } from './cw-math-operation';
import { LogErr } from './error';


export class CwOption extends CwItem {
    private _isBool = false;
    private _isSymbolExchange = false;
    private readonly _bitfield = new BitfieldType;
    private _identifierName = new TextType;
    private readonly _options: CwOptionAssign[] = [];
    private _range = new CwRange;
    private _mathOperation = new CwMathOperation;

    constructor(parent?: CwItem) {
        super(parent);
    }

    public getOptions() {
        return this._options;
    }
    public addOption(item: CwOptionAssign) {
        this._options.push(item);
    }

    public get range(): CwRange {
        return this._range;
    }
    public setRange(item: CwRange) {
        this._range = item;
    }

    public get isSymbolExchange() {
        return this._isSymbolExchange;
    }
    public set isSymbolExchange(value) {
        this._isSymbolExchange = value;
    }

    public get mathOperation() {
        return this._mathOperation;
    }

    public setMathOperation(value: CwMathOperation) {
        this._mathOperation = value;
    }

    public get isBool() { return this._isBool; }
    public set isBool(isBool: boolean) { this._isBool = isBool; }
    public get bitfield() { return this._bitfield; }
    public get identifierName() { return this._identifierName; }
    public set identifierName(identifierName: TextType) { this._identifierName = identifierName; }
    public get isDropdown() { return this.getOptions().length; }

    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        this.setType(this.translateType('o'));
        this.description.value = text.items;
        this.lineNo = lineNo;

        const type = cmd.items[0];   // 'o' or 'q'
        const length = cmd.items.length;
        const couldBeSymbol = cmd.items.length > 2 && cmd.items[1] == ' ';

        if (!couldBeSymbol) {
            switch (type) {
                case 'o': {
                    if (cmd.items.length > 7) {  // <o0.1..4>
                        LogErr(['Option: unexpected items found: ', cmd.text], lineNo);
                    }
                } break;
                case 'q': {
                    if (cmd.items.length > 4) {  // <q1.3>
                        LogErr(['Option (Bit): unexpected items found: ', cmd.text], lineNo);
                    }
                    this.isBool = true;
                } break;
                case 'y': {
                    if (cmd.items.length > 3) {  // <y1>
                        LogErr(['Option (Identifier): unexpected items found: ', cmd.text], lineNo);
                    }
                    this._isSymbolExchange = true;
                } break;
                default: {
                    LogErr('Error setting Type of Option', this.lineNo);
                } break;
            }
        }

        let offsetText = '';
        let bitfieldTextLsb = '';
        let bitfieldTextMsb = '';
        let index = 1;
        if (index < length) { // number text or '.'
            const item = cmd.items[index];
            if (item != '.' && item != ' ') {
                offsetText = item;
                index++;
            }
        }
        if (index < length) { // '.' and number or ' ' and identifier name
            const item = cmd.items[index++];
            if (item == '.') {   // expecting number
                if (index < length) {
                    bitfieldTextLsb = cmd.items[index++];
                    bitfieldTextMsb = bitfieldTextLsb;
                } else {
                    LogErr('Expected: Number, e.g. <o0.1..4>', this.lineNo);
                }
            } else if (item == ' ') {   // expecting string
                if (index < length) {
                    this.identifierName = new TextType(cmd.items.slice(index++).join(''));
                }
            }
        }
        if (index < length) { // '..' and number
            if (!this.isBool && !this._isSymbolExchange) {
                const item = cmd.items[index++];
                if (item == '..') {   // expecting number
                    if (index < length) {
                        bitfieldTextMsb = cmd.items[index];
                    } else {
                        LogErr('Expected: Number, e.g. <o0.1..4>', this.lineNo);
                    }
                } else if (item == '.') {   // expecting number
                    LogErr('Expected: Bit-range, e.g. <o0.1..4>', this.lineNo);
                }
            } else {
                if (this.isBool) {
                    LogErr('Unexpected Bit-range on bool option, e.g. <q1.4>', this.lineNo);
                }
                if (this._isSymbolExchange) {
                    LogErr('Unexpected Bit-range on symbol option, e.g. <q1.4>', this.lineNo);
                }
            }
        }

        const offset = new NumberType(offsetText);
        if (offset.isValid()) {
            this.offset = offset;
        }

        const numLsb = new NumberType(bitfieldTextLsb);
        if (numLsb.isValid()) {
            this.bitfield.lsb = numLsb;
        }

        const numMsb = new NumberType(bitfieldTextMsb);
        if (numMsb.isValid()) {
            this.bitfield.msb = numMsb;
        }

        this.bitfield.validate();   // only validate on MSB, either both must be set or none

        return true;
    }

    public getOption(key: TextType | string | NumberType | undefined): CwOptionAssign | undefined {
        if (key === undefined) {
            return undefined;
        }

        let keyStr = '';
        if (typeof key == 'string') {
            keyStr = key;
        } else {
            keyStr = key.getGuiString();
        }

        const options = this.getOptions();

        if (this.identifierName.length || key instanceof TextType || typeof key === 'string') {
            return options.find((option) => option.value?.getGuiString() == keyStr);
        }

        // Numeric Value Matching
        for (const option of options) {
            const optVal = option.value;
            if (optVal instanceof NumberType) {
                if (optVal.val == key.val) {
                    return option;
                }
            }
        }

        return undefined;
    }

    public getOptionFromGui(key: TextType | string | NumberType | undefined): CwOptionAssign | undefined {

        if (key === undefined) {
            return undefined;
        }

        let keyStr = '';
        if (typeof key == 'string') {
            keyStr = key;
        } else {
            keyStr = key.getGuiString();
        }

        const options = this.getOptions();
        for (const option of options) {
            const val = option.description;
            if (keyStr == val?.getGuiString()) {
                return option;
            }
        }

        return undefined;
    }


    public getGuiItem(guiItem: TreeNodeElement): boolean {
        if (this.isDropdown) {
            guiItem.type = GuiTypes.dropdown;
        } else if (this.isBool) {
            guiItem.type = GuiTypes.check;
        } else {
            guiItem.type = GuiTypes.edit;
        }

        const options = this.getOptions();
        const dropValues: string[] = [];
        for (const value of options) {
            dropValues.push(value.description.getText());
        }

        guiItem.dropItems = dropValues;

        return super.getGuiItem(guiItem);
    }

    protected getGuiValueSymbolExchange(lines: string[]): GuiValue {
        const keyWord = this.identifierName;
        const val = new RwValue(this.lineNo, this.lineNoEnd, this.offset.val, lines, ValueType.exchangeSymbol, keyWord);

        return val.getGuiValue();
    }

    protected getGuiValueIdentifierName(lines: string[]): GuiValue {
        const keyWord = this.identifierName;
        if (!keyWord.isValid()) {
            return { value: keyWord.getGuiString(), readOnly: true, editRect: { line: 0, col: { start: 0, end: 0 } } };
        }

        const val = new RwValue(this.lineNo, this.lineNoEnd, this.offset.val, lines, ValueType.identifier, keyWord);

        const option = this.getOption(val.value);
        if (option === undefined) {
            return val.getGuiValue();
        }

        const v = val.value;
        if (v === undefined) {
            return val.getGuiValue();
        }

        return { value: option.description.getGuiString(), readOnly: v.isValid() ? false : true, editRect: v.editRect };
    }

    public getGuiValueDropOption(lines: string[]): GuiValue {
        const val = new RwValue(this.lineNo, this.lineNoEnd, this.offset.val, lines, ValueType.number);

        const v = val.value;
        if (v === undefined) {
            return val.getGuiValue();
        }

        let hasOverflow = false;
        let extractedValue = 0;

        if (v instanceof NumberType) {
            if (this.bitfield.isValid()) {
                extractedValue = this.bitfield.getExtractedValue(v);
                const maxValue = this.bitfield.getMaxValue();
                if (extractedValue > maxValue) {
                    hasOverflow = true;
                }
            }

            this.bitfield.applyRead(v);  // apply bitfield (move position of value)
            this.mathOperation.applyRead(v);
        }

        const option = this.getOption(v);
        if (option == undefined) {
            const guiVal = val.getGuiValue();
            guiVal.notFound = true;
            if (this.bitfield.isValid()) {
                guiVal.extractedValue = extractedValue;
                guiVal.bitWidth = this.bitfield.getBitWidth();
            }
            if (hasOverflow) {
                guiVal.overflow = true;
                guiVal.overflowValue = extractedValue;
            }
            return guiVal;
        }

        const guiVal: GuiValue = { value: option.description.getGuiString(), readOnly: v.isValid() ? false : true, editRect: v.editRect };
        if (this.bitfield.isValid()) {
            guiVal.extractedValue = extractedValue;
            guiVal.bitWidth = this.bitfield.getBitWidth();
        }
        if (hasOverflow) {
            guiVal.overflow = true;
            guiVal.overflowValue = extractedValue;
        }
        return guiVal;
    }

    public getGuiValue(lines: string[]): GuiValue {
        // option set via dropdown and modifier string. Current spec: Identifyer always has a dropdown list of replacement strings
        if (this.isSymbolExchange) {
            return this.getGuiValueSymbolExchange(lines);
        }

        if (this.identifierName.length) {
            return this.getGuiValueIdentifierName(lines);
        }

        if (this.isDropdown) {
            return this.getGuiValueDropOption(lines);   // option set by dropdown
        }

        return this.getGuiValueNumber(lines);    // option set via number
    }

    public getGuiValueNumber(lines: string[]): GuiValue {
        const val = new RwValue(this.lineNo, this.lineNoEnd, this.offset.val, lines, ValueType.number);
        const v = val.value;
        if (!(v instanceof NumberType)) {
            return val.getGuiValue();
        }

        this.applyFormat(v);
        this.bitfield.applyRead(v);  // apply bitfield (move position of value)
        this.mathOperation.applyRead(v);

        const guiVal = val.getGuiValue();
        if (this.isBool) {
            guiVal.checked = v.val ? true : false;
        }

        return guiVal;
    }

    public setGuiValueNumber(lines: string[], newValue: GuiValue): boolean {
        const val = new RwValue(this.lineNo, this.lineNoEnd, this.offset.val, lines, ValueType.number);
        const newValNum = new NumberType(newValue.value);
        if (newValNum === undefined || !(val.value instanceof NumberType)) {
            return false;
        }

        const oldValNum = new NumberType(val.value);
        this.mathOperation.applyRead(oldValNum);
        this.range.apply(oldValNum);   // set range for "raw" value
        this.bitfield.applyRead(oldValNum);
        if (newValNum.val == oldValNum.val) {
            return false;   // not changed
        }

        newValNum.format = oldValNum.format;
        newValNum.displayFormat = oldValNum.displayFormat;

        const modifyValNum = new NumberType(val.value);
        this.mathOperation.applyWrite(newValNum);
        this.range.apply(newValNum);   // set range for "raw" value
        this.bitfield.applyWrite(newValNum, modifyValNum);
        newValue.editStr = modifyValNum.getText();

        return true;
    }

    public setGuiValue(lines: string[], newValue: GuiValue): boolean {

        if (this.isSymbolExchange) {
            return this.setGuiValueSymbolExchange(lines, newValue);
        }

        // option set via dropdown and modifier string. Current spec: Identifyer always has a dropdown list of replacement strings
        if (this.identifierName.length) {
            return this.setGuiValueIdentifierName(lines, newValue);
        }
        if (this.isDropdown) {
            return this.setGuiValueDropOption(lines, newValue);
        }

        return this.setGuiValueNumber(lines, newValue);
    }

    public setGuiValueDropOption(lines: string[], newValue: GuiValue): boolean {
        const val = new RwValue(this.lineNo, this.lineNoEnd, this.offset.val, lines, ValueType.number);
        const oldVal = val.value;
        if (oldVal === undefined) {
            return false;
        }

        const option = this.getOptionFromGui(newValue.value);
        if (option === undefined) {
            return false;
        }
        const optVal = option.value;
        if (optVal === undefined) {
            return false;
        }

        if (optVal instanceof NumberType && oldVal instanceof NumberType) {
            this.mathOperation.applyWrite(optVal);
            this.bitfield.applyWrite(optVal, oldVal);
        }

        newValue.editStr = oldVal.getText();

        return true;
    }

    public setGuiValueSymbolExchange(lines: string[], newValue: GuiValue): boolean {
        const val = new RwValue(this.lineNo, this.lineNoEnd, this.offset.val, lines, ValueType.exchangeSymbol);
        const oldVal = val.value;
        if (oldVal === undefined || !(oldVal instanceof TextType)) {
            return false;
        }

        newValue.editStr = newValue.value;

        return true;
    }

    public setGuiValueIdentifierName(lines: string[], newValue: GuiValue): boolean {
        const val = new RwValue(this.lineNo, this.lineNoEnd, this.offset.val, lines, ValueType.identifier);
        const oldVal = val.value;
        if (oldVal === undefined || !(oldVal instanceof TextType)) {
            return false;
        }

        const option = this.getOptionFromGui(newValue.value);
        if (option === undefined) {
            return false;
        }
        const optVal = option.value;
        if (optVal === undefined) {
            return false;
        }

        newValue.editStr = optVal.getGuiString();

        return true;
    }


    public getItemText(): string {
        let text = super.getItemText();
        text = AddText(text, ['Offset:', this.offset.getText()]);
        const tmp = this.identifierName.getText();
        if (tmp.length) {
            text = AddText(text, ['Modifier String:', tmp]);
        }
        text = AddText(text, ['Modify range:', this.bitfield.getText()]);
        return text;
    }
}
