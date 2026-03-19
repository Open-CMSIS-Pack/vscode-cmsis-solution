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
import { RangeType } from './range-type';
import { CwOption } from './cw-option';
import { LogErr } from './error';
import { CwArray } from './cw-array';


export class CwRange extends CwItem {
    private readonly _range: RangeType = new RangeType();

    constructor(parent?: CwItem) {  // no tree linkage here
        super();

        if (parent instanceof CwOption) {
            parent.setRange(this);
            this.setParent(parent);
        }
        if (parent instanceof CwArray) {
            parent.setRange(this);
            this.setParent(parent);
        }
    }

    public get range(): RangeType {
        return this._range;
    }


    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        this.setType(this.translateType('-'));
        this.description.value = text.items;
        this.lineNo = lineNo;

        const isFirstItemDash = cmd.items[0] === '-';
        const type = cmd.items[1];   // '-' or '..'
        const length = cmd.items.length;

        const stepDelimiter = ':';

        switch (type) {
            case '-':
            case '..': {
                if (cmd.items.length > 5) {  // <0-100:10>, <-50..100:10>
                    LogErr(['Option: unexpected items found: ', cmd.text], lineNo);
                }
            } break;
            default: {
                LogErr([`Range error: invalid range syntax: '<${cmd.text}>'`], this.lineNo);
            } break;
        }

        let rangeTextStart = '';
        let rangeTextEnd = '';
        let rangeTextStep = '';
        let index = 0;

        if (index < length) { // start number
            rangeTextStart = cmd.items[index++];
        } else {
            LogErr('Range error: expecting number', this.lineNo);
        }

        if (index < length) { // range divider '..', '-'
            const item = cmd.items[index];
            if (item == '..' || item == '-') {
                index++;
            } else {
                if (isFirstItemDash) {
                    LogErr('Range error: expecting range delimiter: \'..\'', this.lineNo);
                } else {
                    LogErr('Range error: expecting range delimiter: \'-\' or \'..\'', this.lineNo);
                }
                return false;
            }
        }

        if (index < length) { // end number
            rangeTextEnd = cmd.items[index++];
        } else {
            LogErr('Range error: expecting number', this.lineNo);
        }

        // show these error messages only if range contains step
        if (index < length) { // step divider ':'
            const item = cmd.items[index];
            if (item == stepDelimiter) {
                index++;
            } else {
                LogErr(`Range error: expecting '${stepDelimiter}'`, this.lineNo);
            }

            if (index < length) { // step number
                rangeTextStep = cmd.items[index++];
                const numStep = new NumberType(rangeTextStep);
                if (numStep.isValid()) {
                    this.range.step = numStep;
                }
            } else {
                LogErr(['Range error: expecting number, got \'', rangeTextStep, '\': <', cmd.text, '>\''], this.lineNo);
            }
        }

        const numStart = new NumberType(rangeTextStart);
        if (numStart.isValid()) {
            this.range.start = numStart;
        } else {
            LogErr(['Range error: expecting number, got \'', rangeTextStart, '\': <', cmd.text, '>\''], this.lineNo);
        }

        const numEnd = new NumberType(rangeTextEnd);
        if (numEnd.isValid()) {
            this.range.end = numEnd;
        } else {
            LogErr(['Range error: expecting number, got \'', rangeTextEnd, '\': <', cmd.text, '>\''], this.lineNo);
        }

        this.checkParentType(lineNo);
        this.range.validate();

        return true;
    }

    public apply(value: NumberType): boolean {
        return this.range.apply(value);
    }

    public getItemText(): string {
        let text = super.getItemText();
        text = AddText(text, ['Range:', this.range.getText()]);
        return text;
    }
}
