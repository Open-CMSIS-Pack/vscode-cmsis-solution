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
 * Copyright (C) 2023-2026 Arm Limited
 */

import { CwItem } from './cw-item';
import { NumberType } from './number-type';
import { Token } from './tokenizer';
import { AddText } from './cw-utils';
import { GuiTypes, GuiValue, TreeNodeElement } from '../confwiz-webview-common';
import { RwValue, ValueType } from './rw-value';
import { LogErr } from './error';


export class CwComment extends CwItem {
    private _isNegated = false;
    private _commentStartAfterLineNo = 0;

    constructor(parent?: CwItem) {
        super(parent);
    }

    public get isNegated() {
        return this._isNegated;
    }
    public set isNegated(isNegated: boolean) {
        this._isNegated = isNegated;
    }

    public get commentStartAfterLineNo() {
        return this._commentStartAfterLineNo;
    }
    public set commentStartAfterLineNo(value) {
        this._commentStartAfterLineNo = value;
    }

    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        this.setType(this.translateType('c'));
        this.description.value = text.items;
        this.lineNo = lineNo;
        this.commentStartAfterLineNo = lineNo;

        let command = cmd.items[0];   // 'c' or '!c'
        if (command == '!') {
            this.isNegated = true;
            if (cmd.items.length >= 2) {
                command = cmd.items[1];
            } else {
                LogErr('Missing command', lineNo);
            }
        }

        switch (command) {
            case 'c':
                break;
            default:
                LogErr('Error setting Type of Comment', this.lineNo);
                break;
        }

        if (cmd.items.length > 3) {  // <!c1>
            LogErr(['Comment: unexpected items found: ', cmd.text], lineNo);
        }

        let index = 1;
        if (this.isNegated) {
            index++;
        }

        if (cmd.items.length >= index) {
            const offsetText = cmd.items[index];
            const offset = new NumberType(offsetText);
            if (offset.isValid()) {
                this.offset = offset;
            }
        }

        return true;
    }

    public getGuiItem(guiItem: TreeNodeElement): boolean {
        guiItem.type = GuiTypes.check;

        return super.getGuiItem(guiItem);
    }

    public getGuiValue(lines: string[]): GuiValue {
        const linesStart = this.commentStartAfterLineNo + 1;
        const linesEnd = this.lineNoEnd;

        const val = new RwValue(linesStart, linesEnd, this.offset.val, lines, ValueType.comment);

        const numVal = val.value;
        let commentState = false;
        if (numVal instanceof NumberType) {
            commentState = numVal.val ? true : false;
            if (this.isNegated) {
                commentState = !commentState;
            }
        }

        const res = val.getGuiValue();
        res.value = commentState ? '1' : '0';   // string interface to GUI
        res.checked = commentState ? true : false;

        return res;
    }

    public setGuiValue(lines: string[], newValue: GuiValue): boolean {
        const newValNum = new NumberType(newValue.value);
        if (!newValNum.isValid()) {
            return false;
        }

        if (this.isNegated) {
            if (newValNum.val == 1) {
                newValNum.val = 0;
            } else {
                newValNum.val = 1;
            }
        }

        const linesStart = this.commentStartAfterLineNo + 1;
        const linesEnd = this.lineNoEnd;
        const rwVal = new RwValue(linesStart, linesEnd, this.offset.val, lines, ValueType.comment);

        const curVal = rwVal.value;
        let newState = false;
        if (!(curVal instanceof NumberType)) {
            return false;
        }

        newState = newValNum.val ? false : true;  // logic is inverted: Block enable if checked

        if (newValNum.val == curVal.val) {
            return false;
        }

        const editText = newState ? '//' : '';

        const multiEditArr = rwVal.multiEdit;   // Change text to modify
        multiEditArr.forEach(multiEdit => multiEdit.text = editText);
        newValue.multiEdit = multiEditArr;

        return true;
    }

    public getItemText(): string {
        let text = super.getItemText();
        text = AddText(text, ['Offset:', this.offset.getText()]);
        if (this.isNegated) {
            text = AddText(text, 'Negated');
        }
        text += 'Block begin: ';
        text += this.lineNo;
        text += 'Comment begin: ';
        text += this._commentStartAfterLineNo;
        text += 'Block end: ';
        text += this.lineNoEnd;

        return text;
    }
}
