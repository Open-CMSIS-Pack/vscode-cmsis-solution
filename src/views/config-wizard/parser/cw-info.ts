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
import { Token } from './tokenizer';
import { LogErr } from './error';


export class CwInfo extends CwItem {

    constructor(parent?: CwItem) {  // no tree linkage here
        super();

        if (parent instanceof CwItem) {
            parent.addInfo(this);
            this.setParent(parent);
        }
    }

    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        if (!this.checkParentType(lineNo)) {
            return false;
        }

        this.setType(this.translateType('i'));
        this.description.value = text.items;
        this.lineNo = lineNo;

        const command = cmd.items[0];   // 'i'
        switch (command) {
            case 'i':
                break;
            default:
                LogErr('Error setting Type of Info: ', this.lineNo);
                break;
        }

        if (cmd.items.length > 1) {  // <i>
            LogErr(['Info: unexpected items found: ', cmd.text], lineNo);
        }

        return true;
    }

    public getItemText(): string {
        const text = super.getItemText();
        return text;
    }
}
