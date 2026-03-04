/**
 * Copyright 2023-2026 Arm Limited
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

import { CwItem } from './cw-item';
import { NumberType } from './number-type';
import { Token } from './tokenizer';
import { AddText } from './cw-utils';
import { CwOption } from './cw-option';
import { LogErr } from './error';

export enum MathOperation {
    undefined,
    addition,
    subtraction,
    multiplication,
    division,
    logicalAnd,
    logicalOr
}

export class CwMathOperation extends CwItem {
    private _operator: MathOperation = MathOperation.undefined;
    private _value = new NumberType();
    private _valid = false;

    constructor(parent?: CwItem) {  // no tree linkage here
        super();

        if (parent instanceof CwOption) {
            parent.setMathOperation(this);
            this.setParent(parent);
        }
    }

    public get operator() { return this._operator; }
    public set operator(operator: MathOperation) { this._operator = operator; }
    public get value() { return this._value; }
    public set value(value: NumberType) { this._value = value; }
    public get valid() {
        return this._valid;
    }
    public set valid(value) {
        this._valid = value;
    }

    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        this.setType(this.translateType('#'));
        this.description.value = text.items;
        this.lineNo = lineNo;

        const type = cmd.items[0];   // '#'
        const length = cmd.items.length;

        switch (type) {
            case '#': {
                if (cmd.items.length > 3) {  // <#+1>
                    LogErr(['Option: unexpected items found: ', cmd.text], lineNo);
                }
            } break;
            default: {
                LogErr('Error setting Type of Option', this.lineNo);
            } break;
        }

        let index = 1;
        if (index < length) { // operation +,-,*,/
            const item = cmd.items[index];
            switch (item) {
                case '+': {
                    this.operator = MathOperation.addition;
                } break;
                case '-': {
                    this.operator = MathOperation.subtraction;
                } break;
                case '*': {
                    this.operator = MathOperation.multiplication;
                } break;
                case '/': {
                    this.operator = MathOperation.division;
                } break;
                case '&': {
                    this.operator = MathOperation.logicalAnd;
                } break;
                case '|': {
                    this.operator = MathOperation.logicalOr;
                } break;
                default: {
                    LogErr('Error: Math  operation not found', this.lineNo);
                } break;
            }
            index++;
        }

        let numText = '';
        if (index < length) { // number
            const item = cmd.items[index++];
            numText = item;
        }

        const value = new NumberType(numText);
        if (value.isValid()) {
            this.value = value;
        }

        this.checkParentType(lineNo);

        if (this.operator != MathOperation.undefined && this.value.isValid()) {
            this.valid = true;
        }

        return true;
    }

    public getTextMathOperation(): string {
        switch (this.operator) {
            case MathOperation.addition: {
                return 'addition';
            }
            case MathOperation.subtraction: {
                return 'subtraction';
            }
            case MathOperation.multiplication: {
                return 'multiplication';
            }
            case MathOperation.division: {
                return 'division';
            }
            case MathOperation.logicalAnd: {
                return 'logical AND';
            }
            case MathOperation.logicalOr: {
                return 'logical OR';
            }
            default:
            case MathOperation.undefined: {
                return 'undefined';
            }
        }
    }

    /**
     * Applies the math operation to a number.
     * @param num - The number to modify
     * @param inverse - If true, applies the inverse operation (for read operations)
     * @returns true if operation was applied successfully, false otherwise
     */
    private applyOperation(num: NumberType, inverse: boolean): boolean {
        if (!this.valid) {
            return false;
        }

        let val = num.val;
        const modif = this.value.val;

        // For inverse operations (read), we swap the operations
        const effectiveOp = inverse ? this.getInverseOperation() : this.operator;

        switch (effectiveOp) {
            case MathOperation.addition:
                val += modif;
                break;
            case MathOperation.subtraction:
                val -= modif;
                break;
            case MathOperation.multiplication:
                val *= modif;
                break;
            case MathOperation.division:
                val /= modif;
                break;
            case MathOperation.logicalAnd:
                val &= modif;
                break;
            case MathOperation.logicalOr:
                val |= modif;
                break;
            default:
                break;
        }

        num.val = val;

        return true;
    }

    /**
     * Gets the inverse operation for read operations.
     * Addition <-> Subtraction
     * Multiplication <-> Division
     * Logical AND <-> Logical OR
     */
    private getInverseOperation(): MathOperation {
        switch (this.operator) {
            case MathOperation.addition:
                return MathOperation.subtraction;
            case MathOperation.subtraction:
                return MathOperation.addition;
            case MathOperation.multiplication:
                return MathOperation.division;
            case MathOperation.division:
                return MathOperation.multiplication;
            case MathOperation.logicalAnd:
                return MathOperation.logicalOr;
            case MathOperation.logicalOr:
                return MathOperation.logicalAnd;
            default:
                return MathOperation.undefined;
        }
    }

    public applyWrite(num: NumberType): boolean {
        return this.applyOperation(num, false);
    }

    public applyRead(num: NumberType): boolean {
        return this.applyOperation(num, true);
    }

    public getItemText(): string {
        let text = super.getItemText();
        text = AddText(text, ['Value:', this.value.getText()]);
        text = AddText(text, ['Math operation:', this.getTextMathOperation()]);
        return text;
    }
}
