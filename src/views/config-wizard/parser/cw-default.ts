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
import { TextType } from './text-type';
import { Token } from './tokenizer';
import { AddText } from './cw-utils';
import { LogErr } from './error';


export class CwDefault extends CwItem {
    private _defaultVal: NumberType | TextType | undefined;
    private readonly _elements: NumberType[] = [];

    constructor(parent?: CwItem) {  // no tree linkage here
        super();

        if (parent instanceof CwItem) {
            parent.addDefault(this);
            this.setParent(parent);
        }
    }

    public get default() { return this._defaultVal; }
    public set default(value: NumberType | TextType | undefined) { this._defaultVal = value; }
    public get elements() { return this._elements; }
    public set elements(element: NumberType | NumberType[]) {
        if (element instanceof NumberType) {
            this._elements.push(element);
        } else if (Array.isArray(element)) {
            this._elements.concat(element);
        }
    }

    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        this.setType(this.translateType('d'));
        this.lineNo = lineNo;

        const command = cmd.items[0];   // 'd'
        switch (command) {
            case 'd':
                break;
            default:
                LogErr('Error setting Type of Default', this.lineNo);
                break;
        }

        if (cmd.items.length > 1) {  // <d>
            LogErr(['Default: unexpected items found: ', cmd.text], lineNo);
        }

        const item = text.items.join('');
        if (!isNaN(Number(item))) {
            this.default = new NumberType(item);
        } else {
            this.default = new TextType(item);
        }

        // fill elements (used by <a> Array type)
        const lengthDescr = text.items.length;
        if (lengthDescr) {
            for (const item of text.items) {
                if (item.match(/[{},]/)) {
                    continue;
                }
                this.elements = new NumberType(item);
            }
        }

        this.checkParentType(lineNo);

        return true;
    }

    public getItemText(): string {
        let text = super.getItemText();
        if (this.default !== undefined) {
            text = AddText(text, ['Value: "', this.default.getText(), '"']);
        }
        return text;
    }
}
