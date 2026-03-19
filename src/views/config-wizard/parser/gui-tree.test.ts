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

import { it, describe, expect, beforeEach } from '@jest/globals';
import { ClearErrors, GetErrors } from './error';
import { GuiTree } from './gui-tree';
import { GuiTypes, TreeNodeElement } from '../confwiz-webview-common';
import { NumberType } from './number-type';


const testFile: string = `//-------- <<< Use Configuration Wizard in Context Menu >>> --------------------
// <o> Option
#define val 0x12

// <q.1> Option
#define val 0x34

// <n> Some notification text
//   <i> Some info text

// <o> Option
//   <i> Some info text
#define val 0x56

// <o.0..4> Option <f.h>
// <o.0..4> Option <f.d>
// <o.0..4> Option <f.b>
// <o.0..4> Option <f.o>
#define val 0x12345678

//   <o>Global Dynamic Memory size [bytes] <0-1073741824:8>
//   <i> Defines the combined global dynamic memory size.
//   <i> Default: 4096
#ifndef OS_DYNAMIC_MEM_SIZE
#define OS_DYNAMIC_MEM_SIZE         4096
#endif

// <o> Option
#define val 0x12abCd3eFU

//  <s.10>Manufacturer String
//  <i>String Descriptor describing Manufacturer.
#define USBD0_STR_DESC_MAN              L"Keil Software"

// <o>Default Thread stack size [bytes] <64-4096:8><#/4>
// <i> Defines default stack size for threads with osThreadDef stacksz = 0
// <i> Default: 200
#ifndef OS_STKSIZE
#define OS_STKSIZE 50
#endif

// <o.8..15> Option  <0x00-0xff:1><#+1>
#define val 0x00000f8ff

// <o> Option  <#+2>
// <o> Option  <#-2>
// <o> Option  <#*2>
// <o> Option  <#/2>
// <o> Option  <#&2>
// <o> Option  <#|2>
#define val 0x00000f8ff

//   <o0.8..15>ISR FIFO Queue
//      <4=>  4 entries    <8=>   8 entries   <12=>  12 entries   <16=>  16 entries
//     <24=> 24 entries   <32=>  32 entries   <48=>  48 entries   <64=>  64 entries
//     <96=> 96 entries  <128=> 128 entries  <196=> 196 entries  <256=> 256 entries
//   <i> RTOS Functions called from ISR store requests to this buffer.
//   <i> Default: 16 entries
#ifndef OS_ISR_FIFO_QUEUE
#define OS_ISR_FIFO_QUEUE           0xffffffff
#endif

//   <o redPortMode> Red port mode
//     <OutPushPull_GPIO=>  PushPull
//     <OutOpenDrain_GPIO=> OpenDrain
//   <i>Selects GPIO output
ledConf.redPortMode = OutOpenDrain_GPIO;

// <h> Test Heading
// </h>

// <e> Test HeadingEnable
// </e>
#define ena 0x00000000


//   <o redPortMode> Red port mode
//     <OutPushPull_GPIO=>  PushPull
//     <OutOpenDrain_GPIO=> OpenDrain
//   <i>Selects GPIO output
ledConf.redPortMode = OutOpenDrain_GPIO;


// <c> Enable Code Block
//  <i> Comment sequence block until block end when disabled
   //foo  // comment
       //+bar // other comment
   //-xFoo
                //xxx
// </c>

// <!c> Disable Code Block
//  <i> Comment sequence block until block end when disabled
   //foo  // comment
       //+bar // other comment
   //-xFoo
                //xxx
// </c>

//  <a.16 PUBLIC_KEY> Public key for signing <0..255> <f.h>
//  <d> {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
#define PUBLIC_KEY  {0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F}

//   <y>Value or Define Symbol that specifies number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
#define FAT_MAX_OPEN_FILES      maxFiles

// <<< end of configuration section >>>`;

const testFile_error: string = `//-------- <<< Use Configuration Wizard in Context Menu >>> --------------------
// <o Option
#define val 0x42

// <n0> Some notification text
//   <i> Some info text

// <q Option
// <q.1 Option
// <q.1..3> Option
#define val 0x42

// <o> Option
//   <i.> Some info text
//   <n Some notification text
#define val 0x42

// <o.0..4> Option <f.x>
// <o.0..4> Option <f.>
// <o.0..4> Option <f>
#define val 0x12345678

//   <o>Global Dynamic Memory size [bytes] <0-1073741824:>
//   <i Defines the combined global dynamic memory size.
//   <i> Default: 4096
#ifndef OS_DYNAMIC_MEM_SIZE
#define OS_DYNAMIC_MEM_SIZE         4096
#endif

// <o> Option
#define val 0x12abCd3eFU

//  <s.>Manufacturer String
//  <i>String Descriptor describing Manufacturer.
#define USBD0_STR_DESC_MAN              L"Keil Software"

// <o>Default Thread stack size [bytes] <64_4096:8><#^4>
// <i> Defines default stack size for threads with osThreadDef stacksz = 0
// <i> Default: 200
#ifndef OS_STKSIZE
#define OS_STKSIZE 50
#endif

// <o.8.15> Option  <0x00-0xff:1><#+1>
#define val 0x00000f8ff

// <o.29..31> Option  <#^2>
#define val 0x00000f8ff


//   <o0.8..15>ISR FIFO Queue
//      <4>  4 entries    <8=>   8 entries   <12=>  12 entries   <16=>  16 entries
//     <24=> 24 entries   <32=>  32 entries   <48=>  48 entries   <64=>  64 entries
//     <96=> 96 entries  <128=> 128 entries  <196=> 196 entries  <256=> 256 entries
//   <i> RTOS Functions called from ISR store requests to this buffer.
//   <i> Default: 16 entries
#ifndef OS_ISR_FIFO_QUEUE
#define OS_ISR_FIFO_QUEUE           0xffffffff
#endif

//   <o0.8..15>ISR FIFO Queue
//      <4=FOO>  4 entries

//   <o redPortMode> Red port mode
//     <OutPushPull_GPIO=>  PushPull
//     <OutOpenDrain_GPIO=> OpenDrain
//   <i>Selects GPIO output
ledConf.redPortMode = OutOpenDrain_;


// <h0.1> Test HeadingEnable
// </h>
#define ena 0x00000000

// <e0.1..3> Test HeadingEnable
// </e>
#define ena 0x00000000


//   <o redPortMode> Red port mode
//     <OutPushPull_GPIO=>  PushPull
//     <OutOpenDrain_GPIO=> OpenDrain
//   <i>Selects GPIO output
ledConf.redPortMode = OutOpenDrain_GPIO;


// <c.1> Enable Code Block
//  <i> Comment sequence block until block end when disabled
   //foo  // comment
       //+bar // other comment
   //-xFoo
                //xxx
// </c>

//  <a PUBLIC_KEY Public key for signing <0..255 <f.i>
//  <d> {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
#define PUBLIC_KEY  {0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F}

//  <a. PUBLIC_KEY Public key for signing <0..255 <f.i>
//  <d> {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
#define PUBLIC_KEY  {0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F}

//   <y1.1>Value or Define Symbol that specifies number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
#define FAT_MAX_OPEN_FILES      maxFiles

//   <y1.1..2>Value or Define Symbol that specifies number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
#define FAT_MAX_OPEN_FILES      maxFiles

// <<< end of configuration section >>>`;


const testFile_guiSymbol: string = `//-------- <<< Use Configuration Wizard in Context Menu >>> --------------------

//   <o redPortMode> Red port mode
//     <OutPushPull_GPIO=>  PushPull
//     <OutOpenDrain_GPIO=> OpenDrain
//   <i>Selects GPIO output
ledConf.redPortMode = OutOpenDrain_GPIO;

// <<< end of configuration section >>>`;



// test global module
const guiTree = new GuiTree();

function iterateTree(element: TreeNodeElement | undefined, text: string) {
    if (element === undefined) {
        return;
    }

    // other tests
    const item = guiTree.getFromItemMap(element.guiId);
    const guiId = item.getGuiId();
    expect(guiId).toBe(element.guiId);

    const itemType = item.getType();
    const typeStr = item.typeToString(itemType);
    if (itemType == 'root') {
        expect(typeStr).toBe('');
    } else {
        expect(typeStr).not.toBe('');
    }

    const itemText = item.getItemText();
    expect(itemText).not.toBe('');

    const infoText = item.getInfoItems();
    expect(infoText).toBeDefined();

    const infos = item.getInfos();
    let infoItemText = '';
    for (const info of infos) {
        infoItemText += info.getItemText();
    }
    expect(infoItemText).toBeDefined();

    // RW value
    switch (element.type) {
        case GuiTypes.check: {
            // same value
            element.newValue.value = element.value.value;
            let isNew = guiTree.saveElement(text, element);
            expect(isNew).toBe(false);

            // new value
            const oldVal = new NumberType(element.value.value);
            const newVal = new NumberType(oldVal.val ? 0 : 1);
            expect(newVal).not.toBe(oldVal);

            element.newValue.value = newVal.getText();
            isNew = guiTree.saveElement(text, element);
            expect(isNew).toBe(true);
        } break;
        case GuiTypes.edit: {
            // same value
            element.newValue.value = element.value.value;
            guiTree.saveElement(text, element);

            // new value
            const oldVal = element.value.value;
            const newVal = '0xDEADBEEF';
            expect(newVal).not.toBe(oldVal);
            element.newValue.value = newVal;
            guiTree.saveElement(text, element);
        } break;
        case GuiTypes.dropdown:
            break;
        case GuiTypes.group:
            break;
        default:
            break;
    }

    // Tree
    const childs = element.children;
    if (childs !== undefined) {
        for (const child of childs) {
            iterateTree(child, text);
        }
    }
}

describe('GUI Tree tests', () => {

    describe('test gui tree and read values', () => {
        it('create GUI tree and read values', () => {
            ClearErrors();
            const rootItem = guiTree.getAll(testFile);
            expect(rootItem).toBeDefined();
            const errors = GetErrors();
            const numErr = errors.length;
            expect(numErr).toBe(0);
            iterateTree(rootItem, testFile);
        });

        it('create GUI tree with errors, and read values', () => {
            ClearErrors();
            const items = guiTree.getAll(testFile_error);
            expect(items).toBeDefined();
            const errors = GetErrors();
            const numErr = errors.length;
            expect(numErr).toBeGreaterThan(0);
        });

        it('create GUI tree with symbol, change symbol', () => {
            ClearErrors();
            const items = guiTree.getAll(testFile_guiSymbol);
            expect(items).toBeDefined();
            const element = items?.children?.pop();
            expect(element).toBeDefined();
            const errors = GetErrors();
            const numErr = errors.length;
            expect(numErr).toBe(0);

            if (element !== undefined) {
                const oldVal = element.value.value;
                const newVal = '0xDEADBEEF';
                expect(newVal).not.toBe(oldVal);
                element.newValue.value = newVal;
                const text = 'OutPushPull_GPIO';
                guiTree.saveElement(text, element);
            }
        });
    });

    describe('Cache Functionality', () => {
        let cachedGuiTree: GuiTree;

        beforeEach(() => {
            cachedGuiTree = new GuiTree();
        });

        it('should cache lines on first parse', () => {
            const docVersion = 1;
            const result = cachedGuiTree.getAll(testFile, docVersion);

            expect(result).toBeDefined();
            expect(result?.children).toBeDefined();
            expect(result?.children?.length).toBeGreaterThan(0);
        });

        it('should reuse cache for same document version on saveElement', () => {
            const docVersion = 1;

            // First parse - creates cache
            const rootElement = cachedGuiTree.getAll(testFile, docVersion);
            expect(rootElement).toBeDefined();

            // Find a test element
            const testElement = rootElement?.children?.find(
                child => child.type === GuiTypes.edit
            );
            expect(testElement).toBeDefined();

            if (testElement) {
                // Save with same version - should use cache
                testElement.newValue.value = '100';
                const changed = cachedGuiTree.saveElement(testFile, testElement, docVersion);

                // Should process successfully (cache hit)
                expect(changed).toBe(true);
            }
        });

        it('should invalidate cache and re-split on version change', () => {
            const docVersion1 = 1;
            const docVersion2 = 2;

            // Parse with version 1
            const result1 = cachedGuiTree.getAll(testFile, docVersion1);
            expect(result1).toBeDefined();

            // Parse with version 2 - should invalidate and re-split
            const result2 = cachedGuiTree.getAll(testFile, docVersion2);
            expect(result2).toBeDefined();
            expect(result2?.children?.length).toBeGreaterThan(0);
        });

        it('should invalidate cache when invalidateCache is called', () => {
            const docVersion = 1;

            // Parse and cache
            const result1 = cachedGuiTree.getAll(testFile, docVersion);
            expect(result1).toBeDefined();

            // Invalidate cache
            cachedGuiTree.invalidateCache();

            // Next parse should work even with same version
            const result2 = cachedGuiTree.getAll(testFile, docVersion);
            expect(result2).toBeDefined();
            expect(result2?.children?.length).toBeGreaterThan(0);
        });

        it('should handle undefined docVersion gracefully', () => {
            // Parse without version - should not cache
            const result1 = cachedGuiTree.getAll(testFile);
            expect(result1).toBeDefined();

            // Parse again without version - should split again
            const result2 = cachedGuiTree.getAll(testFile);
            expect(result2).toBeDefined();
        });
    });

    describe('Cache with Multiple Operations', () => {
        let cachedGuiTree: GuiTree;

        beforeEach(() => {
            cachedGuiTree = new GuiTree();
        });

        it('should maintain cache across multiple saveElement calls with same version', () => {
            const docVersion = 1;

            // Initial parse
            const rootElement = cachedGuiTree.getAll(testFile, docVersion);
            expect(rootElement).toBeDefined();

            const elements = rootElement?.children?.filter(
                child => child.type === GuiTypes.edit || child.type === GuiTypes.check
            ) || [];

            expect(elements.length).toBeGreaterThan(0);

            // Multiple saves with same version
            elements.forEach((element, index) => {
                element.newValue.value = `test${index}`;
                const changed = cachedGuiTree.saveElement(testFile, element, docVersion);

                // Each save should work with cached lines
                expect(typeof changed).toBe('boolean');
            });
        });

        it('should re-cache after version change', () => {
            let docVersion = 1;

            // Parse with version 1
            const result1 = cachedGuiTree.getAll(testFile, docVersion);
            expect(result1).toBeDefined();

            const element = result1?.children?.find(
                child => child.type === GuiTypes.edit
            );
            expect(element).toBeDefined();

            if (element) {
                // Save with version 1
                element.newValue.value = '100';
                const changed1 = cachedGuiTree.saveElement(testFile, element, docVersion);
                expect(typeof changed1).toBe('boolean');

                // Simulate document change
                docVersion = 2;

                // Save with version 2 - should re-cache
                element.newValue.value = '200';
                const changed2 = cachedGuiTree.saveElement(testFile, element, docVersion);
                expect(typeof changed2).toBe('boolean');
            }
        });
    });

    describe('Cache Edge Cases', () => {
        let cachedGuiTree: GuiTree;

        beforeEach(() => {
            cachedGuiTree = new GuiTree();
        });

        it('should handle empty document', () => {
            // Parser needs at least 110 lines to search for annotations
            const emptyLines = Array(120).fill('').join('\n');
            const docVersion = 1;

            // Empty documents don't have wizard annotations
            const result = cachedGuiTree.getAll(emptyLines, docVersion);
            expect(result).toBeUndefined();
        });

        it('should handle document with only comments', () => {
            // Parser needs enough lines (searches first 110 lines for start marker)
            const lines = Array(120).fill('// Just a comment').join('\n');
            const commentOnlyDoc = lines;
            const docVersion = 1;

            const result = cachedGuiTree.getAll(commentOnlyDoc, docVersion);
            expect(result).toBeUndefined();
        });

        it('should cache multiline documents correctly', () => {
            const multilineDoc = testFile;
            const docVersion = 1;

            // Parse multiline document
            const result = cachedGuiTree.getAll(multilineDoc, docVersion);
            expect(result).toBeDefined();

            // Verify multiple elements parsed
            expect(result?.children?.length).toBeGreaterThan(1);

            // Save should work with cached multiline split
            const element = result?.children?.[0];
            if (element && element.type === GuiTypes.edit) {
                element.newValue.value = 'test';
                const changed = cachedGuiTree.saveElement(multilineDoc, element, docVersion);
                expect(typeof changed).toBe('boolean');
            }
        });

        it('should handle rapid version changes', () => {
            // Simulate rapid document changes (like typing)
            for (let version = 1; version <= 10; version++) {
                const result = cachedGuiTree.getAll(testFile, version);
                expect(result).toBeDefined();
            }
        });
    });

    describe('Cache Invalidation Scenarios', () => {
        let cachedGuiTree: GuiTree;

        beforeEach(() => {
            cachedGuiTree = new GuiTree();
        });

        it('should invalidate cache on explicit call', () => {
            const docVersion = 1;

            // Parse and cache
            const result1 = cachedGuiTree.getAll(testFile, docVersion);
            expect(result1).toBeDefined();

            // Explicit invalidation
            cachedGuiTree.invalidateCache();

            // Parse again - should recreate cache
            const result2 = cachedGuiTree.getAll(testFile, docVersion);
            expect(result2).toBeDefined();
        });

        it('should work correctly after invalidation and version change', () => {
            // Parse with version 1
            cachedGuiTree.getAll(testFile, 1);

            // Invalidate
            cachedGuiTree.invalidateCache();

            // Parse with version 2
            const result = cachedGuiTree.getAll(testFile, 2);
            expect(result).toBeDefined();

            // Save with version 2 should use new cache
            const element = result?.children?.[0];
            if (element && element.type === GuiTypes.edit) {
                element.newValue.value = 'test';
                const changed = cachedGuiTree.saveElement(testFile, element, 2);
                expect(typeof changed).toBe('boolean');
            }
        });
    });

    describe('Bitfield register value parsing', () => {
        let testGuiTree: GuiTree;

        beforeEach(() => {
            testGuiTree = new GuiTree();
        });

        it('test1: should parse 4 separate byte defines without bitfield ranges', () => {
            const test1Config = `//-------- <<< Use Configuration Wizard in Context Menu >>> --------------------
// <h> 32-Bit Register Value (test1)
//   <o>   Byte 0 <0x00-0xFF>
#define REG_BYTE0 0x78
//   <o>  Byte 1 <0x00-0xFF>
#define REG_BYTE1 0x56
//   <o> Byte 2 <0x00-0xFF>
#define REG_BYTE2 0x34
//   <o> Byte 3 <0x00-0xFF>
#define REG_BYTE3 0x12
// </h>
// <<< end of configuration section >>>
`;

            ClearErrors();
            const result = testGuiTree.getAll(test1Config);
            expect(result).toBeDefined();
            expect(GetErrors().length).toBe(0);

            // Should have one heading group with 4 children
            expect(result?.children?.length).toBe(1);
            const heading = result?.children?.[0];
            expect(heading?.group).toBe(true);
            expect(heading?.children?.length).toBe(4);

            // Verify each byte value is parsed correctly
            const byte0 = heading?.children?.[0];
            expect(byte0?.name).toContain('Byte 0');
            expect(byte0?.type).toBe(GuiTypes.edit);
            expect(byte0?.value.value).toBe('0x78');

            const byte1 = heading?.children?.[1];
            expect(byte1?.name).toContain('Byte 1');
            expect(byte1?.type).toBe(GuiTypes.edit);
            expect(byte1?.value.value).toBe('0x56');

            const byte2 = heading?.children?.[2];
            expect(byte2?.name).toContain('Byte 2');
            expect(byte2?.type).toBe(GuiTypes.edit);
            expect(byte2?.value.value).toBe('0x34');

            const byte3 = heading?.children?.[3];
            expect(byte3?.name).toContain('Byte 3');
            expect(byte3?.type).toBe(GuiTypes.edit);
            expect(byte3?.value.value).toBe('0x12');
        });

        it('test2: should extract bitfield ranges from separate defines', () => {
            const test2Config = `//-------- <<< Use Configuration Wizard in Context Menu >>> --------------------
// <h> 32-Bit Register Value (test2)
//   <o.0..7>   Byte 0 <0x00-0xFF>
#define REG_BYTE0 0x78
//   <o.8..15>  Byte 1 <0x00-0xFF>
#define REG_BYTE1 0x56
//   <o.16..23> Byte 2 <0x00-0xFF>
#define REG_BYTE2 0x34
//   <o.24..31> Byte 3 <0x00-0xFF>
#define REG_BYTE3 0x12
// </h>
// <<< end of configuration section >>>
`;

            ClearErrors();
            const result = testGuiTree.getAll(test2Config);
            expect(result).toBeDefined();
            expect(GetErrors().length).toBe(0);

            // Should have one heading group with 4 children
            expect(result?.children?.length).toBe(1);
            const heading = result?.children?.[0];
            expect(heading?.group).toBe(true);
            expect(heading?.children?.length).toBe(4);

            // Per CMSIS Pack spec: <o.x..y> extracts bits x..y from the corresponding #define
            // When each option has its own #define, the bitfield is extracted from that line's value
            // REG_BYTE0=0x78: bits 0..7 = 0x78
            // REG_BYTE1=0x56: bits 8..15 don't exist in 0x56, so = 0x00
            // REG_BYTE2=0x34: bits 16..23 don't exist in 0x34, so = 0x00
            // REG_BYTE3=0x12: bits 24..31 don't exist in 0x12, so = 0x00
            const byte0 = heading?.children?.[0];
            expect(byte0?.name).toContain('Byte 0');
            expect(byte0?.type).toBe(GuiTypes.edit);
            expect(byte0?.value.value).toBe('0x78'); // Bits 0..7 of 0x78 = 0x78

            const byte1 = heading?.children?.[1];
            expect(byte1?.name).toContain('Byte 1');
            expect(byte1?.type).toBe(GuiTypes.edit);
            expect(byte1?.value.value).toBe('0x00'); // Bits 8..15 of 0x56 = 0x00

            const byte2 = heading?.children?.[2];
            expect(byte2?.name).toContain('Byte 2');
            expect(byte2?.type).toBe(GuiTypes.edit);
            expect(byte2?.value.value).toBe('0x00'); // Bits 16..23 of 0x34 = 0x00

            const byte3 = heading?.children?.[3];
            expect(byte3?.name).toContain('Byte 3');
            expect(byte3?.type).toBe(GuiTypes.edit);
            expect(byte3?.value.value).toBe('0x00'); // Bits 24..31 of 0x12 = 0x00
        });

        it('test3: should extract bitfield ranges from single combined value', () => {
            const test3Config = `//-------- <<< Use Configuration Wizard in Context Menu >>> --------------------
// <h> 32-Bit Register Value (test3)
//   <o.0..7>   Byte 0 <0x00-0xFF>
//   <o.8..15>  Byte 1 <0x00-0xFF>
//   <o.16..23> Byte 2 <0x00-0xFF>
//   <o.24..31> Byte 3 <0x00-0xFF>
#define REG_BYTE3 0x12345678
// </h>
// <<< end of configuration section >>>
`;

            ClearErrors();
            const result = testGuiTree.getAll(test3Config);
            expect(result).toBeDefined();
            expect(GetErrors().length).toBe(0);

            // Should have one heading group with 4 children
            expect(result?.children?.length).toBe(1);
            const heading = result?.children?.[0];
            expect(heading?.group).toBe(true);
            expect(heading?.children?.length).toBe(4);

            // Per CMSIS Pack spec: When multiple <o.x..y> options point to the same #define,
            // each extracts its respective bitfield range from that shared 32-bit value
            const byte0 = heading?.children?.[0];
            expect(byte0?.name).toContain('Byte 0');
            expect(byte0?.type).toBe(GuiTypes.edit);
            expect(byte0?.value.value).toBe('0x78'); // Bits 0..7 of 0x12345678 = 0x78

            const byte1 = heading?.children?.[1];
            expect(byte1?.name).toContain('Byte 1');
            expect(byte1?.type).toBe(GuiTypes.edit);
            expect(byte1?.value.value).toBe('0x56'); // Bits 8..15 of 0x12345678 = 0x56

            const byte2 = heading?.children?.[2];
            expect(byte2?.name).toContain('Byte 2');
            expect(byte2?.type).toBe(GuiTypes.edit);
            expect(byte2?.value.value).toBe('0x34'); // Bits 16..23 of 0x12345678 = 0x34

            const byte3 = heading?.children?.[3];
            expect(byte3?.name).toContain('Byte 3');
            expect(byte3?.type).toBe(GuiTypes.edit);
            expect(byte3?.value.value).toBe('0x12'); // Bits 24..31 of 0x12345678 = 0x12
        });
    });
});
