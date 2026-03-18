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
import { NumberType, NumFormat } from './number-type';
import { Token } from './tokenizer';
import { AddText } from './cw-utils';
import { LogErr } from './error';


export class CwFormat extends CwItem {
    private readonly _value = new NumberType(0);

    constructor(parent?: CwItem) {  // no tree linkage here
        super();

        if (parent instanceof CwItem) {
            parent.format = this;
            this.setParent(parent);
        }
    }

    public get value() { return this._value; }

    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        this.setType(this.translateType('f'));
        this.description.value = text.items;
        this.lineNo = lineNo;

        const type = cmd.items[0];   // 'f'
        const length = cmd.items.length;

        switch (type) {
            case 'f': {
                if (cmd.items.length > 3) {  // <f.format-specifier>
                    LogErr(['Option: unexpected items found: ', cmd.text], lineNo);
                }
            } break;
            default: {
                LogErr('Error setting Type of Option', this.lineNo);
            } break;
        }

        let index = 1;
        if (index < length) { // format d,h,o,b
            const item = cmd.items[index];
            if (item != '.') {
                LogErr('Unexpected item found', this.lineNo);
            }
            index++;
        }
        if (index < length) { // format d,h,o,b
            const item = cmd.items[index];
            switch (item) {
                case 'd': {
                    this.value.displayFormat = NumFormat.decimal;
                } break;
                case 'h': {
                    this.value.displayFormat = NumFormat.hexadecimal;
                } break;
                case 'o': {
                    this.value.displayFormat = NumFormat.octal;
                } break;
                case 'b': {
                    this.value.displayFormat = NumFormat.binary;
                } break;
                default: {
                    LogErr('Error: Number format not found', this.lineNo);
                } break;
            }
        } else {
            LogErr('Error: Number format missing: <f.d | h | o | b>', this.lineNo);
        }

        this.checkParentType(lineNo);

        return true;
    }

    public getItemText(): string {
        let text = super.getItemText();
        text = AddText(text, ['Number format:', this.value.getFormatText(this.value.format)]);
        return text;
    }
}
