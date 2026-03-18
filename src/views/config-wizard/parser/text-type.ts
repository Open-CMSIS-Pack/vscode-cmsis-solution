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

import { TypeBase } from './type-base';

export class TextType extends TypeBase {
    private _value = '';
    private _valid = false;

    constructor(value?: string | string[], pos?: number, end?: number) {
        super();

        if (pos !== undefined && typeof value === 'string') {
            this.value = value.substring(pos, end);
            this.valid = true;
        } else if (value !== undefined) {
            this.value = value;
            this.valid = true;
        }
    }

    public get value(): string { return this._value; }
    public set value(value: string | string[]) {
        if (typeof value === 'string') {
            this._value = value;
            this.valid = true;
        } else if (Array.isArray(value)) {
            this._value = value.join('');
            this.valid = true;
        }
    }

    protected get valid() {
        return this._valid;
    }
    protected set valid(value) {
        this._valid = value;
    }
    public isValid(): boolean {
        return this.valid;
    }

    public get length() {
        if (!this.isValid()) {
            return 0;
        }

        return this.value.length;
    }

    public getText() {
        return this.value.trimStart().trimEnd();
    }

    public getTextRaw() {
        return this.value;
    }

    public getGuiString() {
        if (this.isValid()) {
            const text = this.getText().replace(/\\n/g, '\n');
            return text;
        }
        return super.getValueNotFoundGui();
    }
}
