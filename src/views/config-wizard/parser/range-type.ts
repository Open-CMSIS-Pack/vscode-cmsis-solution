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

import { NumberType } from './number-type';


export class RangeType {
    private _start: NumberType;
    private _end: NumberType;
    private _step: NumberType;
    private _valid = false;

    constructor(start?: NumberType, end?: NumberType, step?: NumberType) {
        this._start = new NumberType(start);
        this._end = new NumberType(end);
        this._step = new NumberType(step);
        this.validate();
    }

    public get start(): NumberType { return this._start; }
    public set start(val: NumberType) {  this._start = val; }
    public get end(): NumberType { return this._end; }
    public set end(val: NumberType) {  this._end = val; }
    public get step(): NumberType { return this._step; }
    public set step(val: NumberType) {  this._step = val; }
    public get valid(): boolean { return this._valid; }
    public set valid(value: boolean) { this._valid = value; }
    public isValid() { return this._valid; }

    public validate(): boolean {
        const start = this.start.val;
        const end = this.end.val;
        const step = this.step.val;

        if (end <= start) {
            return false;
        }
        if (step > (end - start)) {
            return false;
        }

        if (step == 0) { // default
            this.step.val = 1;
        }

        this.valid = true;
        return this.valid;
    }

    public check(_num: NumberType): boolean {
        if (!this.isValid()) {
            return false;
        }

        return true;
    }

    public apply(num: NumberType): boolean {
        if (!this.check(num)) {
            return false;
        }

        const rangeStart = this.start.val;
        const rangeEnd = this.end.val;
        const rangestep = this.step.val;

        let value = num.val;
        const diff = (value % rangestep);
        value = value - diff;

        if (value < rangeStart) {
            value = rangeStart;
        }
        if (value > rangeEnd) {
            value = rangeEnd;
        }

        num.val = value;

        return true;
    }

    public getText() {
        let text = 'start: ';
        text += this.start.getText();
        text += ', end: ';
        text += this.end.getText();

        if (this.step.isValid()) {
            text += ', step: ';
            text += this.step.getText();
        }

        return text;
    }
}
