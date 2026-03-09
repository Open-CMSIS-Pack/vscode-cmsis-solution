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
 * Copyright (C) 2023 - 2026 Arm Limited
 */

import { it, describe, expect, beforeEach } from '@jest/globals';
import { CwOption } from './cw-option';
import { CwOptionAssign } from './cw-option-assign';
import { NumberType } from './number-type';
import { TextType } from './text-type';
import { ClearErrors } from './error';
import { Tokenizer } from './tokenizer';
import { GuiValue } from '../confwiz-webview-common';

const tokenizer = new Tokenizer();

describe('CwOption', () => {

    beforeEach(() => {
        ClearErrors();
    });

    describe('Numeric value matching with leading zeros', () => {
        let option: CwOption;

        beforeEach(() => {
            // Create option with dropdown values similar to TPIU Pin Routing
            option = new CwOption();
            option.addProperty(
                tokenizer.tokenizeCmd('o1', 1),
                tokenizer.tokenizeDescr('TRACED0', 1),
                1
            );

            // Add option assignments with leading zeros (like in dbgconf files)
            const pinPE3 = new CwOptionAssign(option);
            pinPE3.addProperty(
                tokenizer.tokenizeCmd('0x00040003=', 2),
                tokenizer.tokenizeDescr('Pin PE3', 2),
                2
            );
            option.addOption(pinPE3);

            const pinPC1 = new CwOptionAssign(option);
            pinPC1.addProperty(
                tokenizer.tokenizeCmd('0x00020001=', 3),
                tokenizer.tokenizeDescr('Pin PC1', 3),
                3
            );
            option.addOption(pinPC1);
        });

        it('should match value with 8-digit hex (0x00040003) to option with 8-digit hex', () => {
            const value = new NumberType('0x00040003');
            const matchedOption = option.getOption(value);

            expect(matchedOption).toBeDefined();
            expect(matchedOption?.description.getText()).toBe('Pin PE3');
        });

        it('should match value with 5-digit hex (0x40003) to option with 8-digit hex (0x00040003)', () => {
            const value = new NumberType('0x40003');
            const matchedOption = option.getOption(value);

            expect(matchedOption).toBeDefined();
            expect(matchedOption?.description.getText()).toBe('Pin PE3');
        });

        it('should match value with no leading zeros to option with leading zeros', () => {
            const value = new NumberType('0x20001');
            const matchedOption = option.getOption(value);

            expect(matchedOption).toBeDefined();
            expect(matchedOption?.description.getText()).toBe('Pin PC1');
        });

        it('should match decimal value (262147) to hex option (0x00040003)', () => {
            const value = new NumberType(262147); // 0x00040003 in decimal
            const matchedOption = option.getOption(value);

            expect(matchedOption).toBeDefined();
            expect(matchedOption?.description.getText()).toBe('Pin PE3');
        });

        it('should return undefined for non-matching value', () => {
            const value = new NumberType('0x99999999');
            const matchedOption = option.getOption(value);

            expect(matchedOption).toBeUndefined();
        });

        it('should match regardless of uppercase/lowercase in hex', () => {
            const value = new NumberType('0X00040003');
            const matchedOption = option.getOption(value);

            expect(matchedOption).toBeDefined();
            expect(matchedOption?.description.getText()).toBe('Pin PE3');
        });
    });

    describe('Real-world TPIU Pin Routing scenario', () => {
        let traced0: CwOption;
        let traced1: CwOption;
        let traced2: CwOption;
        let traced3: CwOption;

        beforeEach(() => {
            // TRACED0 options
            traced0 = new CwOption();
            traced0.addProperty(
                tokenizer.tokenizeCmd('o1', 1),
                tokenizer.tokenizeDescr('TRACED0', 1),
                1
            );

            const pe3 = new CwOptionAssign(traced0);
            pe3.addProperty(
                tokenizer.tokenizeCmd('0x00040003=', 2),
                tokenizer.tokenizeDescr('Pin PE3', 2),
                2
            );
            traced0.addOption(pe3);

            const pc1 = new CwOptionAssign(traced0);
            pc1.addProperty(
                tokenizer.tokenizeCmd('0x00020001=', 3),
                tokenizer.tokenizeDescr('Pin PC1', 3),
                3
            );
            traced0.addOption(pc1);

            // TRACED1 options
            traced1 = new CwOption();
            traced1.addProperty(
                tokenizer.tokenizeCmd('o2', 4),
                tokenizer.tokenizeDescr('TRACED1', 4),
                4
            );

            const pe4 = new CwOptionAssign(traced1);
            pe4.addProperty(
                tokenizer.tokenizeCmd('0x00040004=', 5),
                tokenizer.tokenizeDescr('Pin PE4', 5),
                5
            );
            traced1.addOption(pe4);

            const pc10 = new CwOptionAssign(traced1);
            pc10.addProperty(
                tokenizer.tokenizeCmd('0x0002000A=', 6),
                tokenizer.tokenizeDescr('Pin PC10', 6),
                6
            );
            traced1.addOption(pc10);

            // TRACED2 options
            traced2 = new CwOption();
            traced2.addProperty(
                tokenizer.tokenizeCmd('o3', 7),
                tokenizer.tokenizeDescr('TRACED2', 7),
                7
            );

            const pe5 = new CwOptionAssign(traced2);
            pe5.addProperty(
                tokenizer.tokenizeCmd('0x00040005=', 8),
                tokenizer.tokenizeDescr('Pin PE5', 8),
                8
            );
            traced2.addOption(pe5);

            const pd2 = new CwOptionAssign(traced2);
            pd2.addProperty(
                tokenizer.tokenizeCmd('0x00030002=', 9),
                tokenizer.tokenizeDescr('Pin PD2', 9),
                9
            );
            traced2.addOption(pd2);

            // TRACED3 options
            traced3 = new CwOption();
            traced3.addProperty(
                tokenizer.tokenizeCmd('o4', 10),
                tokenizer.tokenizeDescr('TRACED3', 10),
                10
            );

            const pe6 = new CwOptionAssign(traced3);
            pe6.addProperty(
                tokenizer.tokenizeCmd('0x00040006=', 11),
                tokenizer.tokenizeDescr('Pin PE6', 11),
                11
            );
            traced3.addOption(pe6);

            const pc12 = new CwOptionAssign(traced3);
            pc12.addProperty(
                tokenizer.tokenizeCmd('0x0002000C=', 12),
                tokenizer.tokenizeDescr('Pin PC12', 12),
                12
            );
            traced3.addOption(pc12);
        });

        it('should correctly match all TRACED0 pin values from dbgconf', () => {
            // TraceD0_Pin  = 0x00040003;
            const traceD0Value = new NumberType('0x00040003');
            const matched = traced0.getOption(traceD0Value);

            expect(matched).toBeDefined();
            expect(matched?.description.getText()).toBe('Pin PE3');
        });

        it('should correctly match all TRACED1 pin values from dbgconf', () => {
            // TraceD1_Pin  = 0x00040004;
            const traceD1Value = new NumberType('0x00040004');
            const matched = traced1.getOption(traceD1Value);

            expect(matched).toBeDefined();
            expect(matched?.description.getText()).toBe('Pin PE4');
        });

        it('should correctly match all TRACED2 pin values from dbgconf', () => {
            // TraceD2_Pin  = 0x00040005;
            const traceD2Value = new NumberType('0x00040005');
            const matched = traced2.getOption(traceD2Value);

            expect(matched).toBeDefined();
            expect(matched?.description.getText()).toBe('Pin PE5');
        });

        it('should correctly match all TRACED3 pin values from dbgconf', () => {
            // TraceD3_Pin  = 0x00040006;
            const traceD3Value = new NumberType('0x00040006');
            const matched = traced3.getOption(traceD3Value);

            expect(matched).toBeDefined();
            expect(matched?.description.getText()).toBe('Pin PE6');
        });

        it('should match PC10 with hex value 0x0002000A', () => {
            const value = new NumberType('0x0002000A');
            const matched = traced1.getOption(value);

            expect(matched).toBeDefined();
            expect(matched?.description.getText()).toBe('Pin PC10');
        });

        it('should match PC12 with hex value 0x0002000C', () => {
            const value = new NumberType('0x0002000C');
            const matched = traced3.getOption(value);

            expect(matched).toBeDefined();
            expect(matched?.description.getText()).toBe('Pin PC12');
        });
    });

    describe('Text and identifier options', () => {
        it('should match identifier symbol options correctly', () => {
            const option = new CwOption();
            option.addProperty(
                tokenizer.tokenizeCmd('o redPortMode', 1),
                tokenizer.tokenizeDescr('Red port mode', 1),
                1
            );

            const opt1 = new CwOptionAssign(option);
            opt1.addProperty(
                tokenizer.tokenizeCmd('OutPushPull_GPIO=', 2),
                tokenizer.tokenizeDescr('PushPull', 2),
                2
            );
            option.addOption(opt1);

            const opt2 = new CwOptionAssign(option);
            opt2.addProperty(
                tokenizer.tokenizeCmd('OutOpenDrain_GPIO=', 3),
                tokenizer.tokenizeDescr('OpenDrain', 3),
                3
            );
            option.addOption(opt2);

            const textValue = new TextType('OutPushPull_GPIO');
            const matched = option.getOption(textValue);
            expect(matched).toBeDefined();
            expect(matched?.description.getText()).toBe('PushPull');
        });

        it('should match mixed alphanumeric identifier options correctly', () => {
            const option = new CwOption();
            option.addProperty(
                tokenizer.tokenizeCmd('o MACRO2', 1),
                tokenizer.tokenizeDescr('Role level', 1),
                1
            );

            const opt1 = new CwOptionAssign(option);
            opt1.addProperty(
                tokenizer.tokenizeCmd('LEVEL_UNKNOWN=', 2),
                tokenizer.tokenizeDescr('LEVEL_UNKNOWN', 2),
                2
            );
            option.addOption(opt1);

            const opt2 = new CwOptionAssign(option);
            opt2.addProperty(
                tokenizer.tokenizeCmd('LEVEL_3P1=', 3),
                tokenizer.tokenizeDescr('LEVEL_3P1', 3),
                3
            );
            option.addOption(opt2);

            const textValue = new TextType('LEVEL_3P1');
            const matched = option.getOption(textValue);
            expect(matched).toBeDefined();
            expect(matched?.description.getText()).toBe('LEVEL_3P1');
        });
    });

    describe('Edge cases', () => {
        it('should return undefined for undefined key', () => {
            const option = new CwOption();
            const matched = option.getOption(undefined);
            expect(matched).toBeUndefined();
        });

        it('should handle empty options list', () => {
            const option = new CwOption();
            const value = new NumberType('0x42');
            const matched = option.getOption(value);
            expect(matched).toBeUndefined();
        });

        it('should match zero value with leading zeros', () => {
            const option = new CwOption();
            option.addProperty(
                tokenizer.tokenizeCmd('o', 1),
                tokenizer.tokenizeDescr('Test', 1),
                1
            );

            const opt0 = new CwOptionAssign(option);
            opt0.addProperty(
                tokenizer.tokenizeCmd('0x00000000=', 2),
                tokenizer.tokenizeDescr('Zero option', 2),
                2
            );
            option.addOption(opt0);

            const value = new NumberType('0x0');
            const matched = option.getOption(value);

            expect(matched).toBeDefined();
            expect(matched?.description.getText()).toBe('Zero option');
        });

        it('should match large hex values correctly', () => {
            const option = new CwOption();
            option.addProperty(
                tokenizer.tokenizeCmd('o', 1),
                tokenizer.tokenizeDescr('Test', 1),
                1
            );

            const optLarge = new CwOptionAssign(option);
            optLarge.addProperty(
                tokenizer.tokenizeCmd('0xFFFFFFFF=', 2),
                tokenizer.tokenizeDescr('Max 32-bit value', 2),
                2
            );
            option.addOption(optLarge);

            const value = new NumberType('0xFFFFFFFF');
            const matched = option.getOption(value);

            expect(matched).toBeDefined();
            expect(matched?.description.getText()).toBe('Max 32-bit value');
        });
    });

    describe('Bitfield dropdown sequential value changes', () => {
        let option: CwOption;

        beforeEach(() => {
            // Create ISR FIFO Queue option with bitfield <o0.8..15>
            option = new CwOption();
            option.addProperty(
                tokenizer.tokenizeCmd('o0.8..15', 1),
                tokenizer.tokenizeDescr('ISR FIFO Queue', 1),
                1
            );

            // Add all dropdown options
            const entries = [4, 8, 12, 16, 24, 32, 64, 128, 256];
            let lineNo = 2;
            for (const count of entries) {
                const opt = new CwOptionAssign(option);
                opt.addProperty(
                    tokenizer.tokenizeCmd(`${count}=`, lineNo),
                    tokenizer.tokenizeDescr(`${count} entries`, lineNo),
                    lineNo
                );
                option.addOption(opt);
                lineNo++;
            }
        });

        it('should correctly format 0x00 -> 4 entries = 0x400', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x00'
            ];

            const newGuiValue: GuiValue = { value: '4 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x400');
        });

        it('should correctly format 0x400 -> 8 entries = 0x800', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x400'
            ];

            const newGuiValue: GuiValue = { value: '8 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x800');
        });

        it('should correctly format 0x800 -> 12 entries = 0xC00', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x800'
            ];

            const newGuiValue: GuiValue = { value: '12 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0xC00');
        });

        it('should correctly format 0xC00 -> 16 entries = 0x1000', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0xC00'
            ];

            const newGuiValue: GuiValue = { value: '16 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x1000');
        });

        it('should correctly format 0x1000 -> 24 entries = 0x1800', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x1000'
            ];

            const newGuiValue: GuiValue = { value: '24 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x1800');
        });

        it('should correctly format 0x1800 -> 32 entries = 0x2000', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x1800'
            ];

            const newGuiValue: GuiValue = { value: '32 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x2000');
        });

        it('should correctly format 0x3000 -> 64 entries = 0x4000', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x3000'
            ];

            const newGuiValue: GuiValue = { value: '64 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x4000');
        });

        it('should correctly format 0x7000 -> 128 entries = 0x8000', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x7000'
            ];

            const newGuiValue: GuiValue = { value: '128 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x8000');
        });

        it('should correctly format 0xF000 -> 256 entries = 0x0000', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0xF000'
            ];

            const newGuiValue: GuiValue = { value: '256 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            // 256 & 0xFF = 0 (overflow), result is 0 (NumberType formats as '0x0')
            expect(newGuiValue.editStr).toBe('0x0000');
        });
    });

    describe('Bitfield dropdown non-sequential value changes', () => {
        let option: CwOption;

        beforeEach(() => {
            // Create ISR FIFO Queue option with bitfield <o0.8..15>
            option = new CwOption();
            option.addProperty(
                tokenizer.tokenizeCmd('o0.8..15', 1),
                tokenizer.tokenizeDescr('ISR FIFO Queue', 1),
                1
            );

            // Add all dropdown options
            const entries = [4, 8, 12, 16, 24, 32, 64, 128, 256];
            let lineNo = 2;
            for (const count of entries) {
                const opt = new CwOptionAssign(option);
                opt.addProperty(
                    tokenizer.tokenizeCmd(`${count}=`, lineNo),
                    tokenizer.tokenizeDescr(`${count} entries`, lineNo),
                    lineNo
                );
                option.addOption(opt);
                lineNo++;
            }
        });

        it('should correctly format 0x0400 (4 entries) -> 128 entries = 0x8000', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x0400'
            ];

            const newGuiValue: GuiValue = { value: '128 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x8000');
        });

        it('should correctly format 0x0400 (4 entries) -> 256 entries = 0x0000', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x0400'
            ];

            const newGuiValue: GuiValue = { value: '256 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x0000');
        });

        it('should correctly format 0x8000 (128 entries) -> 4 entries = 0x0400', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x8000'
            ];

            const newGuiValue: GuiValue = { value: '4 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x0400');
        });

        it('should correctly format 0x0000 (256 entries) -> 4 entries = 0x0400', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x0000'
            ];

            const newGuiValue: GuiValue = { value: '4 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x0400');
        });

        it('should correctly format 0x0000 (256 entries) -> 16 entries = 0x1000', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x0000'
            ];

            const newGuiValue: GuiValue = { value: '16 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x1000');
        });

        it('should correctly format 0x2000 (32 entries) -> 256 entries = 0x0000', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x2000'
            ];

            const newGuiValue: GuiValue = { value: '256 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x0000');
        });

        it('should correctly format 0x4000 (64 entries) -> 12 entries = 0x0C00', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x4000'
            ];

            const newGuiValue: GuiValue = { value: '12 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x0C00');
        });

        it('should correctly format 0x1800 (24 entries) -> 128 entries = 0x8000', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x1800'
            ];

            const newGuiValue: GuiValue = { value: '128 entries', readOnly: false };
            option.setGuiValue(lines, newGuiValue);

            expect(newGuiValue.editStr).toBe('0x8000');
        });
    });

    describe('Bitfield dropdown overflow metadata', () => {
        let option: CwOption;

        beforeEach(() => {
            option = new CwOption();
            option.addProperty(
                tokenizer.tokenizeCmd('o0.8..15', 1),
                tokenizer.tokenizeDescr('ISR FIFO Queue', 1),
                1
            );

            const entries = [4, 8, 12, 16, 24, 32, 64, 128, 256];
            let lineNo = 2;
            for (const count of entries) {
                const opt = new CwOptionAssign(option);
                opt.addProperty(
                    tokenizer.tokenizeCmd(`${count}=`, lineNo),
                    tokenizer.tokenizeDescr(`${count} entries`, lineNo),
                    lineNo
                );
                option.addOption(opt);
                lineNo++;
            }
        });

        it('should flag overflow metadata when extracted value exceeds bit width', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x10000'
            ];

            const guiValue = option.getGuiValueDropOption(lines);

            expect(guiValue.notFound).toBe(true);
            expect(guiValue.overflow).toBe(true);
            expect(guiValue.overflowValue).toBe(256);
            expect(guiValue.extractedValue).toBe(256);
            expect(guiValue.bitWidth).toBe(8);
        });

        it('should not flag overflow when extracted value fits bit width', () => {
            const lines = [
                '//   <o0.8..15>ISR FIFO Queue',
                '#define OS_ISR_FIFO_QUEUE           0x8000'
            ];

            const guiValue = option.getGuiValueDropOption(lines);

            expect(guiValue.overflow).toBeUndefined();
            expect(guiValue.extractedValue).toBe(128);
            expect(guiValue.bitWidth).toBe(8);
            expect(guiValue.value).toBe('128 entries');
        });
    });
});
