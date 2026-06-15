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

import { beforeEach, describe, expect, it } from '@jest/globals';
import { GuiTypes, GuiValue, TreeNodeElement } from '../confwiz-webview-common';
import { ClearErrors } from './error';
import { CwHeading } from './cw-heading';
import { Tokenizer } from './tokenizer';

const tokenizer = new Tokenizer();

function createHeading(command: string): CwHeading {
    const heading = new CwHeading();
    heading.addProperty(
        tokenizer.tokenizeCmd(command, 0),
        tokenizer.tokenizeDescr('Feature group', 0),
        0
    );

    return heading;
}

function createTreeNodeElement(): TreeNodeElement {
    const value: GuiValue = { value: '', readOnly: false };
    return {
        guiId: 1,
        name: '',
        type: GuiTypes.none,
        group: false,
        value,
        newValue: value
    };
}

describe('CwHeading', () => {
    beforeEach(() => {
        ClearErrors();
    });

    describe('plain heading behavior', () => {
        it('should expose a display-only group without a checkbox value', () => {
            const heading = createHeading('h');
            const guiItem = createTreeNodeElement();

            heading.getGuiItem(guiItem);

            expect(guiItem.group).toBe(true);
            expect(guiItem.type).toBe(GuiTypes.none);
            expect(guiItem.name).toBe('Feature group');
            expect(heading.getGuiValue(['#define FEATURE_ENABLE 0x00000020'])).toEqual({ value: '', readOnly: false });
            expect(heading.setGuiValue(['#define FEATURE_ENABLE 0x00000020'], { value: '0', readOnly: false })).toBe(false);
        });
    });

    describe('enable bit behavior', () => {
        it('should expose enable headings as checkbox groups', () => {
            const heading = createHeading('e0.5');
            const guiItem = createTreeNodeElement();

            heading.getGuiItem(guiItem);

            expect(guiItem.group).toBe(true);
            expect(guiItem.type).toBe(GuiTypes.check);
            expect(guiItem.name).toBe('Feature group');
        });

        it('should read the configured bit as the checkbox state', () => {
            const heading = createHeading('e0.5');

            expect(heading.getGuiValue(['#define FEATURE_ENABLE 0x00000020']).checked).toBe(true);
            expect(heading.getGuiValue(['#define FEATURE_ENABLE 0x00000000']).checked).toBe(false);
        });

        it('should clear only the configured enable bit when unchecked', () => {
            const heading = createHeading('e0.5');
            const newValue: GuiValue = { value: '0', readOnly: false };

            const changed = heading.setGuiValue(['#define FEATURE_ENABLE 0x00000023'], newValue);

            expect(changed).toBe(true);
            expect(newValue.editStr).toBe('0x00000003');
        });

        it('should set only the configured enable bit when checked', () => {
            const heading = createHeading('e0.5');
            const newValue: GuiValue = { value: '1', readOnly: false };

            const changed = heading.setGuiValue(['#define FEATURE_ENABLE 0x00000003'], newValue);

            expect(changed).toBe(true);
            expect(newValue.editStr).toBe('0x00000023');
        });

        it('should not report a change when the checkbox state already matches the bit', () => {
            const heading = createHeading('e0.5');
            const newValue: GuiValue = { value: '1', readOnly: false };

            const changed = heading.setGuiValue(['#define FEATURE_ENABLE 0x00000020'], newValue);

            expect(changed).toBe(false);
            expect(newValue.editStr).toBeUndefined();
        });
    });
});
