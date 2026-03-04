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
import { TextType } from './text-type';
import { CwOption } from './cw-option';
import { LogErr } from './error';


export class CwOptionAssign extends CwItem {
    private _value: NumberType | TextType | undefined;

    constructor(parent?: CwItem) {  // no tree linkage here
        super();

        if (parent instanceof CwOption) {
            parent.addOption(this);
            this.setParent(parent);
        }
    }

    public get value(): NumberType | TextType | undefined {
        return this._value;
    }
    public set value(value: NumberType | TextType | undefined) {
        this._value = value;
    }

    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        this.setType(this.translateType('='));
        this.description.value = text.items;
        this.lineNo = lineNo;

        if (cmd.items.length < 2) {
            LogErr(['OptionAssign: items missing: ', cmd.text], lineNo);
            return false;
        }

        const command = cmd.items[1];   // '='
        switch (command) {
            case '=':
                if (cmd.items.length > 2) {  // <n=> FOO
                    LogErr(['OptionAssign: unexpected items found: ', cmd.text], lineNo);
                }
                break;
            default:
                LogErr('Error setting Type of OptionAssign', this.lineNo);
                break;
        }

        const valueText = cmd.items[0];
        this.description.value = text.items;

        const valueNum = new NumberType(valueText);
        if (valueNum.isValid()) {
            this.value = valueNum;
        } else {
            this.value = new TextType(valueText);
        }

        this.checkParentType(lineNo);

        return true;
    }

    public getItemText(): string {
        let text = super.getItemText();
        text = AddText(text, 'ID: ');
        if (this.value !== undefined) {
            text = AddText(text, this.value.getGuiString());
        }

        text = AddText(text, [', Descr: ', this.description.getText()]);

        return text;
    }
}
