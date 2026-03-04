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

export class CwError {
    private _value: string[] = [];

    public add(text: string | string[], lineNo: number | undefined) {
        let tmp = '';
        if (lineNo !== undefined) {
            lineNo++;   // adjust with editor display
            tmp = 'Line: ' + lineNo.toString() + ': ';
        }

        if (typeof text === 'string') {
            tmp += text;
        } else if (Array.isArray(text)) {
            tmp += text.join('');
        }

        this.addError(tmp);
    }

    public addError(item: string) {
        this._value.push(item);
    }
    public getError(): string[] {
        return this._value;
    }
    public getErrors(): string[] {
        return this._value;
    }
    public clear() {
        this._value = [];
    }
}


const cwError = new CwError;

export function LogErr(text: string | string[], lineNo: number | undefined) {
    cwError.add(text, lineNo);
}

export function GetErrors(): string[] {
    return cwError.getErrors();
}

export function ClearErrors() {
    cwError.clear();
}
