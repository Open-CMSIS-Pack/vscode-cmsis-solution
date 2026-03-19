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

import { GuiValue, MultiEdit, TreeNodeElement } from '../confwiz-webview-common';
import { NumberType } from './number-type';
import { TextType } from './text-type';
import { TypeBase } from './type-base';
import { EditRect } from './cw-utils';


export enum ValueType {
    none,
    number,
    text,
    comment,
    identifier,
    exchangeSymbol
}

export class RwValue {
    private readonly _value: NumberType | TextType | undefined;
    private _valueType = ValueType.number;
    private _inComment = false;
    private _inconsistentState = false;

    private readonly _multiEdit: MultiEdit[] = [];

    constructor(lineNo: number, lineNoEnd: number, offset: number, lines: string[], valueType: ValueType, identifier?: TextType) {
        if (valueType !== undefined) {
            this._valueType = valueType;
        }

        switch (valueType) {
            case ValueType.number:
                this._value = this.getNumber(offset, lineNo, lineNoEnd, lines);
                break;
            case ValueType.text:
                this._value = this.getString(offset, lineNo, lineNoEnd, lines);
                break;
            case ValueType.comment:
                this._value = this.getCommentState(offset, lineNo, lineNoEnd, lines);
                break;
            case ValueType.identifier:
                this._value = this.getIdentifierValue(offset, lineNo, lineNoEnd, lines, identifier);
                break;
            case ValueType.exchangeSymbol:
                this._value = this.getSymbolValue(offset, lineNo, lineNoEnd, lines, identifier);
                break;
        }
    }

    get value() {
        return this._value;
    }

    public get valueType() {
        return this._valueType;
    }
    public set valueType(value) {
        this._valueType = value;
    }

    public get inComment() {
        return this._inComment;
    }
    public set inComment(value) {
        this._inComment = value;
    }

    public get multiEdit(): MultiEdit[] {
        return this._multiEdit;
    }
    public addMultiEdit(value: MultiEdit) {
        this._multiEdit.push(value);
    }

    public get inconsistentState() {
        return this._inconsistentState;
    }
    public set inconsistentState(value) {
        this._inconsistentState = value;
    }

    protected isWhite(ch: string) {
        if (!ch) {
            return false;
        }

        return ch.match(/\s/i) ? true : false;
    }

    protected skipWhite(line: string, pos: number): number {
        if (!this.isWhite(line[pos])) {
            return pos;
        }

        do {
            if (!this.isWhite(line[pos])) {
                break;
            }
            pos++;
        } while (pos < line.length);

        return pos;
    }

    protected skipNonWhite(line: string, pos: number): number {
        if (this.isWhite(line[pos])) {
            return pos;
        }

        do {
            if (this.isWhite(line[pos])) {
                break;
            }
            pos++;
        } while (pos < line.length);

        return pos;
    }


    protected findKeyword(find: string, line: string, pos: number): number {
        const commentPos = this.findCommentStart(line, pos);
        const found = line.indexOf(find, pos);
        if (commentPos != -1 && found != -1 && found >= commentPos) {
            return -1;
        }

        return found;
    }

    protected isAtPosition(find: string, line: string, pos: number): boolean {
        const found = line.indexOf(find, pos);
        if (found == pos) {
            return true;
        }
        return false;
    }

    protected findCommentStart(line: string, pos: number): number {
        let found = line.indexOf('//', pos);
        if (found != -1) {
            return found;
        }

        found = line.indexOf('/*', pos);
        if (found != -1) {
            return found;
        }

        return -1;
    }

    protected skipComment(line: string, pos: number): number {
        pos = this.skipWhite(line, pos);

        if (this.isAtPosition('//', line, pos)) {
            return line.length; // skip rest of line
        }

        if (!this.inComment) {
            if (this.isAtPosition('/*', line, pos)) {
                pos += 2;
                this.inComment = true;
            }
        }

        if (this.inComment) {
            const found = line.indexOf('*/', pos);
            if (found == -1) {
                return line.length; // skip rest of line
            } else {
                pos = found + 2;
                this.inComment = false;
            }
        }

        return pos;
    }

    protected getNextItemPos(pos: number, line: string): number {
        pos = this.skipComment(line, pos);
        pos = this.skipWhite(line, pos);
        pos = this.skipKeyword(line, pos);

        return pos;
    }

    protected getNextNumberPos(pos: number, line: string): number {
        pos = this.getNextItemPos(pos, line);
        if (pos == line.length) {
            return line.length;
        }

        const str = line.substring(pos);

        const regexpTrueFalse = /\b(true|false)\b/igm;
        const matchTrueFalse = regexpTrueFalse.exec(str);
        let posTrueFalse = pos;
        let foundTrueFalse = false;
        if (matchTrueFalse != undefined) {
            posTrueFalse += matchTrueFalse.index;
            foundTrueFalse = true;
        }

        const regexp = /\b[0-9]/g;
        const match = regexp.exec(str);
        if (match) {
            let foundPos = match.index;
            if (foundPos > 0 && str[foundPos - 1] == '-') { // negative number
                foundPos--;
            }
            pos += foundPos;
        } else {
            pos = line.length;
        }

        if (foundTrueFalse && pos > posTrueFalse) {
            pos = posTrueFalse;
        }

        return pos;
    }

    protected getNextNumberPosEnd(pos: number, line: string): number {
        if (pos == line.length) {
            return line.length;
        }

        const str = line.substring(pos);

        const regexpTrueFalse = /\b(true|false)\b/igm;
        const matchTrueFalse = regexpTrueFalse.exec(str);
        if (matchTrueFalse != undefined) {
            pos += matchTrueFalse[0].length;
            return pos;
        }

        const re = /^-?[0-9xa-f]+/ig; // no \b "word boundary" because the start of a number is already found

        const match = re.exec(str);
        if (match) {
            pos += match[0].length;
        } else {
            pos = line.length;
        }

        return pos;
    }

    protected getNumber(offset: number, lineNo: number, lineNoEnd: number, lines: string[]): NumberType {
        let value = new NumberType;
        let offs = 0;
        let found = false;
        let pos = 0;
        let valLineNo = lineNo - 1;
        let linesEnd: number | undefined = undefined;
        if (lineNoEnd != 0) {
            linesEnd = lineNoEnd;
        }

        //const linePart = lines.slice(lineNo, linesEnd);
        for (const line of lines.slice(lineNo, linesEnd)) {
            pos = 0;
            valLineNo++;
            do {
                pos = this.getNextNumberPos(pos, line);
                if (pos == line.length) {
                    continue;
                }

                const end = this.getNextNumberPosEnd(pos, line);
                const text = line.substring(pos, end);
                const tmp = new NumberType(text);
                if (tmp.isValid()) {
                    if (offs == offset) {
                        tmp.editRect = { col: { start: pos, end: end }, line: valLineNo };
                        found = true;
                        value = tmp;
                        break;
                    }
                    offs++;
                }
                pos = end + 1;
            } while (!found && pos < line.length);
            if (found) {
                break;
            }
        }

        return value;
    }

    protected getNextIdentifierPos(pos: number, line: string): number {
        pos = this.getNextItemPos(pos, line);
        if (pos == line.length) {
            return line.length;
        }

        const re = /\b[a-z_0-9]/gi;
        const str = line.substring(pos);
        const match = re.exec(str);
        pos += match?.index ?? line.length;

        return pos;
    }

    protected getNextIdentifierPosEnd(pos: number, line: string): number {
        if (pos == line.length) {
            return line.length;
        }

        const re = /\b[^a-z_0-9]/gi;
        const str = line.substring(pos);
        const match = re.exec(str);
        pos += match?.index ?? str.length;

        return pos;
    }

    protected getNextStringPos(pos: number, line: string): number {
        pos = this.getNextItemPos(pos, line);
        if (pos == line.length) {
            return line.length;
        }

        pos = line.indexOf('"', pos);
        if (pos == -1) {
            return line.length;
        }

        if (pos < line.length - 1) {
            pos++;
        }
        return pos;
    }

    protected getLineCommentState(multiEdit: MultiEdit, line: string): boolean {
        const pos = this.skipWhite(line, multiEdit.editRect.col.start);

        const newPos = line.indexOf('//', pos);
        if (newPos == pos) {     // found comment as first char
            multiEdit.editRect.col.start = pos;
            multiEdit.editRect.col.end = pos + 2;
            multiEdit.text = '//';
            return true;
        }

        multiEdit.editRect.col.start = pos;
        multiEdit.editRect.col.end = pos;
        multiEdit.text = '';
        return false;
    }


    protected getNextStringPosEnd(pos: number, line: string): number {
        if (pos == line.length) {
            return line.length;
        }

        pos = line.indexOf('"', pos);
        if (pos == -1) {
            return line.length;
        }

        return pos;
    }

    protected getCommentState(offset: number, lineNo: number, lineNoEnd: number, lines: string[]): NumberType {
        const value = new NumberType();
        if (lineNoEnd <= lineNo) {   // exit on error
            return value;
        }

        let state = false;
        let offs = 0;

        for (const line of lines.slice(lineNo, lineNoEnd)) {
            const editRect: EditRect = { line: lineNo + offs, col: { start: 0, end: 0 } };
            const multiEdit: MultiEdit = { editRect: editRect, text: '' };

            if (offs >= offset) {
                const newState = this.getLineCommentState(multiEdit, line);
                if (offs == offset) {  // commented or not? Use offset as line to determine state
                    state = newState;
                    value.editRect = editRect;
                } else if (offs >= offset) {  // check remaining lines for consistency
                    if (newState != state) {
                        this.inconsistentState = true;
                    }
                }
                this.addMultiEdit(multiEdit);
            }
            offs++;
        }

        value.val = state ? 0 : 1;  // logic is inverted, function is "block enable"

        return value;
    }

    protected skipKeyword(line: string, pos: number): number {
        const end = this.skipNonWhite(line, pos);
        const tmp = new TextType(line, pos, end);

        if (!tmp.isValid()) {
            return end;
        }

        switch (tmp.getText()) {
            case '#define':
                return end;
            default:
                return pos;
        }
    }

    protected getSymbolValue(offset: number, lineNo: number, lineNoEnd: number, lines: string[], identifier?: TextType): TextType {
        let value = new TextType();
        if (lineNoEnd <= lineNo) {   // exit on error
            return value;
        }

        let offs = 0;
        let foundKey = false;
        let lNo = lineNo - 1;
        let found = false;

        for (const line of lines.slice(lineNo, lineNoEnd)) {
            lNo++;
            let pos = this.getNextItemPos(0, line);
            if (pos == line.length) {
                continue;
            }

            if (identifier != undefined && identifier.isValid()) {
                if (!foundKey) {
                    pos = this.findKeyword(identifier.getTextRaw(), line, pos);
                    if (pos == -1) {
                        continue;
                    }
                    pos += identifier.getTextRaw().length;
                    foundKey = true;
                }
            } else {  // auto-skip one symbol, e.g. get "maxFiles" of "#define FAT_MAX_OPEN_FILES      maxFiles"
                offset++;
            }

            do {
                pos = this.getNextIdentifierPos(pos, line);
                if (pos == line.length) {
                    continue;
                }

                const end = this.getNextIdentifierPosEnd(pos, line);
                const tmp = new TextType(line, pos, end);
                if (tmp.isValid()) {
                    if (offs == offset) {
                        tmp.editRect = { col: { start: pos, end: end }, line: lNo };
                        value = tmp;
                        found = true;
                        break;
                    }
                }
                offs++;
                pos = end + 1;
            } while (!found && pos < line.length);
            if (found) {
                break;
            }
        }

        return value;
    }

    protected getIdentifierValue(offset: number, lineNo: number, lineNoEnd: number, lines: string[], identifier?: TextType): TextType {
        let value = new TextType();
        if (identifier === undefined || lineNoEnd <= lineNo) {   // exit on error
            return value;
        }

        let offs = 0;
        let foundKey = false;
        let lNo = lineNo - 1;

        for (const line of lines.slice(lineNo, lineNoEnd)) {
            lNo++;
            let pos = this.getNextItemPos(0, line);
            if (pos == line.length) {
                continue;
            }

            if (!foundKey) {
                pos = this.findKeyword(identifier.getTextRaw(), line, pos);
                if (pos == -1) {
                    continue;
                }
                pos += identifier.getTextRaw().length;
                foundKey = true;
            }

            pos = this.getNextIdentifierPos(pos, line);
            if (pos == line.length) {
                continue;
            }

            const end = this.getNextIdentifierPosEnd(pos, line);
            const tmp = new TextType(line, pos, end);

            if (tmp.isValid() && offs >= offset) {
                value = tmp;
                value.editRect = { line: lNo, col: { start: pos, end: end } };
                break;
            }
            offs++;
        }

        return value;
    }

    protected getString(offset: number, lineNo: number, lineNoEnd: number, lines: string[]): TextType {
        let value = new TextType();
        value.value = value.getValueNotFoundGui();
        let offs = 0;
        let found = false;
        let pos = 0;
        let linesEnd: number | undefined = undefined;
        if (lineNoEnd != 0) {
            linesEnd = lineNoEnd;
        }
        let lNo = lineNo - 1;

        for (const line of lines.slice(lineNo, linesEnd)) {
            lNo++;
            pos = 0;
            do {
                pos = this.getNextStringPos(pos, line);
                if (pos == line.length) {
                    continue;
                }

                const end = this.getNextStringPosEnd(pos, line);
                const tmp = new TextType(line, pos, end);
                if (tmp.isValid()) {
                    if (offs == offset) {
                        tmp.editRect = { col: { start: pos, end: end }, line: lNo };
                        value = tmp;
                        found = true;
                        break;
                    }
                }
                offs++;
                pos = end + 1;
            } while (!found && pos < line.length);
            if (found) {
                break;
            }
        }

        return value;
    }

    public getGuiValue(): GuiValue {
        if (this.value === undefined) {
            const v = new TypeBase();
            return { value: v.getValueNotFoundGui(), readOnly: true };
        }

        const val: GuiValue = { value: this.value.getGuiString(), readOnly: this.value.isValid() ? false : true, editRect: this.value.editRect, inconsistent: this.inconsistentState };
        val.multiEdit = this.multiEdit;

        return val;
    }

    public setGuiValue(_element: TreeNodeElement): GuiValue {
        if (this.value === undefined) {
            const v = new TypeBase();
            return { value: v.getValueNotFoundGui(), readOnly: true };
        }

        return { value: this.value.getGuiString(), readOnly: this.value.isValid() ? false : true, editRect: this.value.editRect };
    }

}
