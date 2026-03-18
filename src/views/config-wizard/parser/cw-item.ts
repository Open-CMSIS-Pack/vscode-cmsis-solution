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

import { TextType } from './text-type';
import { AddText } from './cw-utils';
import { Token } from './tokenizer';
import { GuiValue, TreeNodeElement } from '../confwiz-webview-common';
import { NumberType } from './number-type';
import { RwValue, ValueType } from './rw-value';
import { CwInfo } from './cw-info';
import { CwDefault } from './cw-default';
import { CwFormat } from './cw-format';
import { LogErr } from './error';

//https://open-cmsis-pack.github.io/Open-CMSIS-Pack-Spec/main/html/configWizard.html
export type ConfwizTypes =  'none' |
                            'root' |
                            'Heading' |         // <h>, <e>, </h>, </e>
                            'Info' |            // <i>
                            'Notification' |    // <n>
                            'Default' |         // <d>
                            'Comment' |         // <c>, </c>
                            'Option' |          // <o>, <q>, <y>
                            'OptionAssign' |    // <n=>
                            'String' |          // <s>
                            'Array' |           // <a>
                            'Range' |           // <0-10:4>, <-0..-10:-4>
                            'Format' |          // <f.h>: d, h, o, b
                            'MathOperation'     // <#>: <#+1>, <#-1>, <#*8>, <#/3>
;


export class CwItem {
    private _lineNo = 0;
    private _lineNoEnd = 0;
    private _type: ConfwizTypes = 'none';
    private _descr = new TextType;
    private _offset = new NumberType(0);
    private _guiId = 0;
    private readonly _infos: CwInfo[] = [];
    private readonly _defaults: CwDefault[] = [];
    private _format?: CwFormat;

    private _parent?: CwItem;
    private  readonly _children: CwItem[] = [];

    constructor(parent?: CwItem) {
        if (parent instanceof CwItem) {
            this._parent = parent;
            parent.addChild(this);
        }
    }

    public addInfo(item: CwInfo) {
        this._infos.push(item);
    }
    public getInfos(): CwInfo[] {
        return this._infos;
    }

    public getDefaults(): CwDefault[] {
        return this._defaults;
    }
    public addDefault(item: CwDefault) {
        this._defaults.push(item);
    }

    public get format() {
        return this._format;
    }
    public set format(value) {
        this._format = value;
    }

    protected addChild(child: CwItem) {
        this._children.push(child);
    }

    public get offset() { return this._offset; }
    public set offset(offset: NumberType) { this._offset = offset; }

    public getGuiId() { return this._guiId; }
    public setGuiId(guiId: number) { this._guiId = guiId; }

    public getParent() { return this._parent; }
    public setParent(parent: CwItem) { this._parent = parent; }

    public getChildren() { return this._children; }

    public setType(type: ConfwizTypes) { this._type = type; }
    public getType() { return this._type; }
    public get description() { return this._descr; }
    public set description(description: TextType) { this._descr = description; }

    public get lineNo() {
        return this._lineNo;
    }
    public set lineNo(lineNo: number) {
        this._lineNo = lineNo;
    }

    public get lineNoEnd() {
        return this._lineNoEnd;
    }
    public set lineNoEnd(value) {
        this._lineNoEnd = value;
    }

    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        LogErr(['CW Base object called:', cmd.text, ', ', text.text], lineNo);
        return true;
    }

    public getItemText() {
        let text = 'Line: ';
        text += this.lineNo;
        text = AddText(text, [this.typeToString(this._type), ': ']);
        text = AddText(text, ['Text: "', this.description.getText(), '"']);

        return text;
    }

    public getGuiItem(guiItem: TreeNodeElement): boolean {
        guiItem.name = this.description.getGuiString();
        guiItem.infoItems = this.getInfoItems();

        return true;
    }

    public applyFormat(value: NumberType | TextType) {
        if (value instanceof NumberType) {
            const format = this.format;
            if (format !== undefined) {
                value.displayFormat = format.value.displayFormat;
            }
        }
        if (value instanceof TextType) {
            LogErr('Text currently not supported for format specifier <f.d|h|o|b>', this.lineNo);
        }
    }

    public getGuiValue(lines: string[]): GuiValue {
        const val = new RwValue(this.lineNo, this.lineNoEnd, this.offset.val, lines, ValueType.number);

        const v = val.value;
        if (v === undefined) {
            return val.getGuiValue();
        }

        this.applyFormat(v);

        return val.getGuiValue();
    }

    public setGuiValue(lines: string[], newValue: GuiValue): boolean {
        const val = this.getGuiValue(lines);

        if (newValue.value != val.value) {
            val.hasChanged = true;
        }

        if (!val.hasChanged) {
            return false;
        }

        return true;
    }


    public getInfoItems() {
        const infoText: string[] = [];
        const infos = this.getInfos();
        for (const info of infos) {
            const text = info.description.getGuiString();
            infoText.push(text);
        }

        return infoText;
    }

    public translateType(tp: string): ConfwizTypes {
        let type: ConfwizTypes = 'none';
        switch (tp) {
            case 'h': type = 'Heading'; break;          // <h>, <e>
            case 'e': type = 'Heading'; break;          // <h>, <e>
            case 'i': type = 'Info'; break;             // <i>
            case 'n': type = 'Notification'; break;     // <n>
            case 'd': type = 'Default'; break;          // <d>
            case 'c': type = 'Comment'; break;          // <c>
            case 'o': type = 'Option'; break;           // <o>, <q>, <y>
            case 'q': type = 'Option'; break;           // <o>, <q>, <y>
            case 'y': type = 'Option'; break;           // <o>, <q>, <y>
            case '=': type = 'OptionAssign'; break;     // <n=>
            case 's': type = 'String'; break;           // <s>
            case 'a': type = 'Array'; break;            // <a>
            case '-': type = 'Range'; break;            // <0-10>
            case '..': type = 'Range'; break;           // <0..10>
            case 'f': type = 'Format'; break;           // <f.>
            case '#': type = 'MathOperation'; break;    // <#+1>
            default: break;
        }
        return type;
    }

    public typeToString(type: ConfwizTypes): string {
        let text = '';
        switch (type) {
            case 'Heading':        text = 'Heading'; break;          // <h>, <e>
            case 'Info':           text = 'Info'; break;             // <i>
            case 'Notification':   text = 'Notification'; break;     // <n>
            case 'Default':        text = 'Default'; break;          // <d>
            case 'Comment':        text = 'Comment'; break;          // <c>
            case 'Option':         text = 'Option'; break;           // <o>, <q>, <y>
            case 'OptionAssign':   text = 'OptionAssign'; break;     // <n=>
            case 'String':         text = 'String'; break;           // <s>
            case 'Array':          text = 'Array'; break;            // <a>
            case 'Range':          text = 'Range'; break;            // <0..10>, <0-10>
            case 'Format':         text = 'Format'; break;           // <f.>
            case 'MathOperation':  text = 'MathOperation'; break;    // <#+1>
            default: break;
        }
        return text;
    }

    protected checkParentType(lineNo: number | undefined): boolean {
        const type = this.getType();
        const parent = this.getParent();

        if (parent !== undefined) {
            const parentType = parent.getType();
            switch (type) {
                case 'root': {
                    LogErr(['Type ', this.translateType(type), ' assigned to ', this.translateType(parentType)], lineNo);
                    return false;
                }
                default: {
                    // ok
                } break;
            }
        } else {
            LogErr('Parent type undefined!', lineNo);
            return false;
        }

        return true;
    }
}
