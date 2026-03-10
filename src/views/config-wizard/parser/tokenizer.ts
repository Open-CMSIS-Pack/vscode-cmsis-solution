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

import { LogErr } from './error';
import { StartEnd } from './cw-utils';


export interface Token {
    lineNo?: number;
    lineNoEnd?: number;
    text: string;
    items: string[];
}

export class Tokenizer {
    private _cmd = '';
    private _text = '';
    private _error = '';

    public isAnnotation(line: string): number {
        const pos = line.indexOf('//');
        if (pos == -1) {
            this._error = 'Not a Configuration Wizard annotation: \'//\' not found.';
            return pos;
        }
        if (pos != 0) {
            this._error = 'Configuration Wizard annotations should start at beginning of a line.';
        }

        return pos + '//'.length;
    }

    public getNextToken(line: string, pos: number): number {
        const cmdPos: StartEnd = { start: pos, end: 0 };
        cmdPos.start = line.indexOf('<', cmdPos.start);
        if (cmdPos.start == -1) {
            this._error = 'Annotation error: \'<\' missing';
            return -1;
        }
        cmdPos.end = line.indexOf('>', cmdPos.start);
        if (cmdPos.end == -1) {
            this._error = 'Annotation error: \'>\' missing';
            return -1;
        }
        cmdPos.start++;

        const valPos: StartEnd = { start: cmdPos.end, end: 0 };
        if (valPos.start < line.length) {
            valPos.start++;
        }

        while (valPos.start < line.length) {
            if (line[valPos.start] != ' ' && line[valPos.start] != '\t') {
                break;
            }
            valPos.start++;
        }
        valPos.end = line.indexOf('<', valPos.start);
        if (valPos.end == -1 || valPos.end >= line.length) {
            valPos.end = line.length;
        }

        this._cmd = line.substring(cmdPos.start, cmdPos.end);
        this._text = line.substring(valPos.start, valPos.end);

        return valPos.end;
    }

    public tokenizeCmd(text: string, lineNo: number): Token {
        const token: Token = { text: text, items: [], lineNo: lineNo };
        const length = text.length;
        if (!length) {
            return token;
        }

        const isAssignmentToken = text.includes('=');

        let canBeNegative = false;
        if (text.indexOf('..') != -1) {
            canBeNegative = true;
        }

        let pos = 0;
        let isNegative = false;
        while (pos < length) {
            let ch = text[pos];

            // skip multiple WS
            if (ch.match(/\s/i)) {
                token.items.push(' ');   // exchange any WS char by single SPACE
                do {
                    ch = text[pos];
                    if (!ch.match(/\s/i)) {
                        break;
                    }
                    pos++;
                } while (pos < length);
            }

            // search for number
            if (ch == '-' && canBeNegative) { // check for possible negative number
                if (pos + 1 < length) {
                    const chTmp = text[pos + 1];
                    if (chTmp.match(/\d/i)) {
                        isNegative = true;
                        pos++;
                        continue;
                    }
                }
                isNegative = false;
            }

            // search for number
            if (ch.match(/[\d]/)) {
                let str = '';
                let numTokenPattern = /[\d]/i;
                if (isNegative) {
                    str += '-';
                }

                if (ch == '0') { // check for 0x, 0b
                    if (pos + 1 < length) {
                        const chTmp = text[pos + 1];
                        if (chTmp == 'x' || chTmp == 'X') {
                            str += '0x';
                            pos += 2;
                            numTokenPattern = /[\da-f]/i;
                        } else if (chTmp == 'b' || chTmp == 'B') {
                            str += '0b';
                            pos += 2;
                            numTokenPattern = /[01]/i;
                        }
                        if (pos >= length) {
                            pos = length - 1;
                        }
                    }
                }

                do {
                    ch = text[pos];
                    if (!ch.match(numTokenPattern)) {
                        break;
                    }
                    str += ch;
                    pos++;
                } while (pos < text.length);
                token.items.push(str);
                isNegative = false;
                continue;
            }

            if (ch == '.') { // capture range marker '..'
                if (pos + 1 < text.length) {
                    if (text[pos + 1] == '.') {
                        pos += 2;
                        const str = '..';
                        token.items.push(str);
                        continue;
                    }
                }
            }

            // search for item category or name
            if (ch.match(/[a-z_]/i)) {
                let str = '';
                do {
                    ch = text[pos++];
                    if (!ch.match(isAssignmentToken ? /[a-z\d_]/i : /[a-z_]/i)) {
                        pos--;
                        break;
                    }
                    str += ch;
                } while (pos < text.length);
                token.items.push(str);
                continue;
            } else if (ch.match(/[/!=\-.:#+*&|[\]"'\s]/i)) {
                // search for dividers
                token.items.push(ch);
            } else {
                LogErr(['Unrecognized token found: ', ch], lineNo);
            }
            pos++;
        }

        return token;
    }

    public tokenizeDescr(text: string, lineNo: number): Token {
        const token: Token = { text: text, items: [], lineNo: lineNo };
        const length = text.length;
        if (!length) {
            return token;
        }

        let pos = 0;
        let gatherText = '';
        while (pos < length) {
            const ch = text[pos];

            if (ch.match(/[[\]{},]/)) {
                if (gatherText.length) {
                    token.items.push(gatherText);
                    gatherText = '';
                }
                token.items.push(ch);
                pos++;
                continue;
            }

            gatherText += ch;
            pos++;
        }

        if (gatherText.length) {
            token.items.push(gatherText);
            gatherText = '';
        }

        return token;
    }

    public get error() {
        return this._error;
    }
    public get cmd() {
        return this._cmd;
    }
    public get text() {
        return this._text;
    }

}
