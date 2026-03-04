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

import { NumberType } from './number-type';
import { clearSignBit, unsignedRShift } from './cw-utils';


export class BitfieldType {
    private _lsb: NumberType;
    private _msb: NumberType;
    private _valid = false;

    constructor(lsb?: NumberType, msb?: NumberType) {
        this._lsb = new NumberType(lsb);
        this._msb = new NumberType(msb);
    }

    public get lsb(): NumberType { return this._lsb; }
    public set lsb(val: NumberType) {  this._lsb = val; }
    public get msb(): NumberType { return this._msb; }
    public set msb(val: NumberType) {  this._msb = val; }
    public get valid(): boolean { return this._valid; }
    public set valid(value: boolean) { this._valid = value; }
    public isValid() { return this._valid; }

    protected createBitMask(): number {
        let dwMask = 0;
        let dwBit = 0x01;

        for (let i = this.lsb.val; i <= this.msb.val; i++) {
            dwMask = clearSignBit(dwMask | dwBit);
            dwBit = clearSignBit(dwBit << 1);
        }

        return clearSignBit(dwMask);
    }

    public validate(): boolean {
        const lsb = this.lsb.val;
        const msb = this.msb.val;

        if (!this.lsb.isValid() || !this.msb.isValid()) {
            return false;
        }

        if (lsb > msb) {
            return false;
        }
        if (lsb < 0 || msb < 0) {
            return false;
        }
        if (lsb > 31 || msb > 31) {
            return false;
        }

        this.valid = true;

        return true;
    }

    protected check(num: NumberType): boolean {
        if (!this.isValid()) {
            return false;
        }

        const value = num.val;
        if (value < 0 || (value % 1) > 0) { // currently unsupported for negative or float numbers
            return false;
        }

        return true;
    }

    protected getAdjustedValue(num: NumberType): number {
        const lsb = this.lsb.val;
        let value = num.val;

        const mask = this.createBitMask();

        value = unsignedRShift(value, lsb);
        value = clearSignBit(value & mask);

        return value;
    }

    public getMaxValue(): number {
        if (!this.isValid()) {
            return 0;
        }

        return this.createBitMask();
    }

    public getExtractedValue(num: NumberType): number {
        if (!this.check(num)) {
            return num.val;
        }

        const lsb = this.lsb.val;
        return unsignedRShift(num.val, lsb);
    }

    public getBitWidth(): number {
        if (!this.isValid()) {
            return 0;
        }

        return (this.msb.val - this.lsb.val) + 1;
    }

    public applyRead(num: NumberType):boolean {
        if (!this.check(num)) {
            return false;
        }

        num.val = this.getAdjustedValue(num);
        num.numOfDisplayBits = (this.msb.val - this.lsb.val) + 1;

        return true;
    }

    public applyWrite(newVal: NumberType, curVal: NumberType):boolean {
        if (!this.check(newVal)) {   // no bitfield available or not appliable
            curVal.val = newVal.val;
            return false;
        }

        let newValue = newVal.val;
        if (newValue < 0 || (newValue % 1) > 0) { // currently unsupported for negative or float numbers
            return false;
        }

        const lsb = this.lsb.val;
        let curValue = curVal.val;

        const mask = this.createBitMask();
        const fullMask = clearSignBit(mask << lsb);

        newValue = clearSignBit(newValue & mask);
        newValue = clearSignBit(newValue << lsb);

        curValue = clearSignBit(curValue & ~fullMask);
        curValue = clearSignBit(curValue | newValue);
        curVal.val = curValue;

        return true;
    }


    public getText() {
        let text = 'start: ';
        text += this.lsb.getText();
        text += ', end: ';
        text += this.msb.getText();

        return text;
    }
}
