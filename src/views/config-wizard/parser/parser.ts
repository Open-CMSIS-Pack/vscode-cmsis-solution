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

import { Tokenizer, Token } from './tokenizer';
import { StartEnd } from './cw-utils';
import { CwItem } from './cw-item';
import { CwHeading } from './cw-heading';
import { CwComment } from './cw-comment';
import { CwOption } from './cw-option';
import { CwString } from './cw-string';
import { CwArray } from './cw-array';
import { CwInfo } from './cw-info';
import { CwDefault } from './cw-default';
import { CwOptionAssign } from './cw-option-assign';
import { CwRange } from './cw-range';
import { CwFormat } from './cw-format';
import { CwMathOperation } from './cw-math-operation';
import { LogErr } from './error';
import { CwNotification } from './cw-notification';

const cwCommandDetect = /^\s*\/\/\s*</;
const cwBeginEndDetect = /^\s*\/\/\s*/;

export class Parser {

    protected isAnnotation(line: string): boolean {
        return cwCommandDetect.test(line);
    }

    protected isAnnotationStartEnd(line: string): boolean {
        return cwBeginEndDetect.test(line);
    }

    public findAnnotationStart(lines: string[]): StartEnd | undefined {
        let startIndex = -1, endIndex = -1;
        const searchLimit = Math.min(110, lines.length);
        for (let index = 0; index < searchLimit; index++) {
            const line = lines[index].toLowerCase();
            if (this.isAnnotationStartEnd(line) && line.indexOf('<<< use configuration wizard in context menu >>>') != -1) {
                startIndex = index;
                break;
            }
        }

        if (startIndex == -1) {
            return undefined; // No Configuration Wizard file
        }

        for (let index = startIndex + 1; index < lines.length; index++) {
            const line = lines[index].toLowerCase();
            if (this.isAnnotationStartEnd(line) && line.indexOf('<<< end of configuration section >>>') != -1) {
                endIndex = index;
                break;
            }
        }
        if (endIndex == -1) {  // End = file end
            endIndex = lines.length;
        }

        const startEnd: StartEnd = { start: startIndex, end: endIndex };
        return startEnd;
    }

    public parse(lines: string[]): CwItem | undefined {
        if (!lines.length) {
            return undefined;
        }
        lines = lines.map((line) => line.trimEnd());
        const startEnd = this.findAnnotationStart(lines);
        if (startEnd === undefined || startEnd.start >= lines.length) {
            return undefined;
        }

        const tokenizer = new Tokenizer();
        let lineNo = -1;
        const startTime = new Date().getTime();

        const root = new CwItem();
        root.setType('root');
        let item: CwItem | undefined = root;

        for (const line of lines) {
            lineNo++;
            if (lineNo <= startEnd.start) {
                continue;
            }
            if (lineNo >= startEnd.end) {
                break;
            }

            if (!this.isAnnotation(line)) {
                continue;
            }

            let pos = tokenizer.isAnnotation(line);
            if (pos == -1) { // no commented line
                LogErr(tokenizer.error, lineNo);
                continue;
            }

            do {
                pos = tokenizer.getNextToken(line, pos);
                if (pos == -1) { // error
                    LogErr(tokenizer.error, lineNo);
                    break;
                }

                const cmdStr = tokenizer.cmd;
                const textStr = tokenizer.text;
                const cmd = tokenizer.tokenizeCmd(cmdStr, lineNo);
                const text = tokenizer.tokenizeDescr(textStr, lineNo);
                cmd.lineNo = lineNo;
                cmd.lineNoEnd = startEnd.end;
                text.lineNo = lineNo;
                text.lineNoEnd = startEnd.end;

                if (item !== undefined) {
                    item = this.dispatch(item, cmd, text);
                }
            } while (pos < line.length);
        }

        const elapsedTime = new Date().getTime() - startTime;
        console.log(`ConfigWizard parsing cmd, took ${elapsedTime / 1000}s`);

        return root;
    }

    protected getParent(item: CwItem) {
        const parent = item.getParent();
        if (parent !== undefined) {
            return parent;
        }

        return item;
    }

    public dispatch(item: CwItem, cmd: Token, text: Token): CwItem | undefined {
        let type = cmd.items[0];
        let isEnd = false;
        let lineNo = 0;

        if (cmd.lineNo !== undefined) {
            lineNo = cmd.lineNo;
        }

        if (type == '/') {
            type = cmd.items[1];
            isEnd = true;
        }
        if (type == '!') {
            type = cmd.items[1];
        }

        // find other cmd items, such as options, range
        if (cmd.items.length > 1 && type != '#') {
            const tmpCmd = cmd.items[1];
            switch (tmpCmd) {
                case '=':
                case '-':
                case '..': {
                    type = tmpCmd;
                } break;
            }
        }

        const curType = item.getType();
        const newtype = item.translateType(type);
        let parent = item;

        if (curType == 'Comment') {  // mark begin/end of comment block
            const commentItem = item as CwComment;
            if (commentItem !== undefined) {
                if (newtype == 'Default' || newtype == 'Info') {
                    commentItem.commentStartAfterLineNo = lineNo;
                }
                if (isEnd) {
                    item.lineNoEnd = lineNo;
                }
            }
        }

        if (isEnd) {
            if (newtype != 'Heading' && newtype != 'Comment') {
                LogErr('Unsupported END tag', cmd.lineNo);
            }
            if (curType != 'Heading' && curType != 'Comment') {  // END prev. item first, e.g. Option, String, Array, Comment
                parent = this.getParent(item);
            }

            return this.getParent(parent);
        }

        if (curType != 'Heading') {  // parent can be Heading only (or root)
            parent = this.getParent(item);
        }

        // create child objects
        switch (newtype) {
            case 'Heading': {
                item = new CwHeading(parent);
                item.addProperty(cmd, text, lineNo);
            } break;
            case 'Notification': {
                item = new CwNotification(parent);
                item.addProperty(cmd, text, lineNo);
            } break;
            case 'Comment': {
                item = new CwComment(parent);
                item.addProperty(cmd, text, lineNo);
            } break;
            case 'Option': {
                item = new CwOption(parent);
                item.addProperty(cmd, text, lineNo);
            } break;
            case 'String': {
                item = new CwString(parent);
                item.addProperty(cmd, text, lineNo);
            } break;
            case 'Array': {
                item = new CwArray(parent);
                item.addProperty(cmd, text, lineNo);
            } break;

            case 'Default': {
                const tmpItem = new CwDefault(item);
                tmpItem.addProperty(cmd, text, lineNo);
            } break;
            case 'Info': {
                const tmpItem = new CwInfo(item);
                tmpItem.addProperty(cmd, text, lineNo);
            } break;
            case 'OptionAssign': {
                const tmpItem = new CwOptionAssign(item);
                tmpItem.addProperty(cmd, text, lineNo);
            } break;
            case 'Range': {
                const tmpItem = new CwRange(item);
                tmpItem.addProperty(cmd, text, lineNo);
            } break;
            case 'Format': {
                const tmpItem = new CwFormat(item);
                tmpItem.addProperty(cmd, text, lineNo);
            } break;
            case 'MathOperation': {
                const tmpItem = new CwMathOperation(item);
                tmpItem.addProperty(cmd, text, lineNo);
            } break;
            default: {
                if (!isEnd) {
                    LogErr(['Erronous command "<', cmd.text, '>" found.'], cmd.lineNo);
                } else {
                    LogErr(['Erronous end tag "<', cmd.text, '>" found.'], cmd.lineNo);
                } break;
            }
        }

        if (cmd.lineNoEnd !== undefined) {
            item.lineNoEnd = cmd.lineNoEnd;
        }

        return item;
    }
}
