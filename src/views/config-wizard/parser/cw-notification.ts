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
import { AddText } from './cw-utils';
import { LogErr } from './error';
import { GuiValue, TreeNodeElement } from '../confwiz-webview-common';


export class CwNotification extends CwItem {

    constructor(parent?: CwItem) {
        super(parent);
    }

    public addProperty(cmd: Token, text: Token, lineNo: number): boolean {
        this.setType(this.translateType('n'));
        this.description.value = text.items;
        this.lineNo = lineNo;

        const command = cmd.items[0];   // 'n'

        switch (command) {
            case 'n':
                if (cmd.items.length > 1) {  // <n0>
                    LogErr(['Notification: unexpected items found: ', cmd.text], lineNo);
                }
                break;
            default:
                LogErr('Error setting Type of Notification', this.lineNo);
                break;
        }

        return true;
    }

    public getGuiValue(_lines: string[]): GuiValue { // no value display for Notification (returns empty string)
        return { value: '', readOnly: false };
    }

    public getGuiItem(guiItem: TreeNodeElement): boolean {
        guiItem.group = false;

        return super.getGuiItem(guiItem);
    }

    public getItemText(): string {
        let text = super.getItemText();
        text = AddText(text, ['Offset:', this.offset.getText()]);
        return text;
    }

}
