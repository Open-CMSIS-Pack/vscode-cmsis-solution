/**
 * Copyright 2024-2026 Arm Limited
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

import dedent from 'dedent';
import { parse as parseJsonc } from 'jsonc-parser';
import { CTreeItemJsonParser, parseJsonToCTreeItem, toJsonString } from './tree-item-json-parser';
import { CTreeItemBuilder } from './tree-item-builder';
import { CTreeItem, ETreeItemKind } from './tree-item';

describe('TreeItemJsonParser', () => {
    describe('parseJsonToCTreeItem', () => {
        it('should parse simple JSON object', async () => {
            const input = dedent`
                {
                    "name": "test",
                    "value": "example"
                }`;
            const result = parseJsonToCTreeItem(input);

            expect(result).toBeDefined();
            expect(result?.getTag()).toBeUndefined();
            expect(result?.getValue('name')).toBe('test');
            expect(result?.getValue('value')).toBe('example');

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);

        });

        it('should parse JSON with nested objects', async () => {
            const input = dedent`
            {
                "parent": {
                    "child": {
                        "name": "nested"
                    }
                }
            }`;
            const result = parseJsonToCTreeItem(input);

            expect(result).toBeDefined();
            expect(result?.getTag()).toBeUndefined();

            const parent = result?.getChild('parent');
            expect(parent).toBeDefined();
            expect(parent?.getTag()).toBe('parent');

            const child = parent?.getChild('child');
            expect(child).toBeDefined();
            expect(child?.getTag()).toBe('child');
            expect(child?.getValue('name')).toBe('nested');

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);

        });

        it('should parse JSON with arrays', async () => {
            const input = dedent`
            {
                "items": [
                    {
                        "name": "first"
                    },
                    {
                        "name": "second"
                    }
                ]
            }`;
            const result = parseJsonToCTreeItem(input);

            expect(result).toBeDefined();
            const items = result?.getGrandChildren('items');
            expect(items).toHaveLength(2);
            expect(items?.[0]?.getValue('name')).toBe('first');
            expect(items?.[1]?.getValue('name')).toBe('second');

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);
        });

        it('should handle primitive values at root level', async () => {
            const input = '"simple string"';
            const result = parseJsonToCTreeItem(input);

            expect(result).toBeDefined();
            expect(result?.getTag()).toBeUndefined();
            expect(result?.getText()).toBe('simple string');
        });

        it('should parse empty objects and scalars', async () => {
            const input = dedent`
                {
                    "text": "",
                    "empty": {},
                    "empty1": {},
                    "foo": "bar",
                    "empty2": {}
                }`;
            const result = parseJsonToCTreeItem(input);

            expect(result).toBeDefined();
            expect(result?.getTag()).toBeUndefined();
            expect(result?.getValue('empty')).toBeUndefined();
            expect(result?.getValue('foo')).toBe('bar');

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);
        });

        it('should parse empty array', async () => {
            const input = dedent`
                {
                    "empty": [],
                    "empty1": [],
                    "foo": "bar",
                    "empty2": []
                }`;
            const result = parseJsonToCTreeItem(input);

            expect(result).toBeDefined();
            expect(result?.getTag()).toBeUndefined();
            expect(result?.getValue('empty')).toBeUndefined();
            expect(result?.getValue('foo')).toBe('bar');

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);

        });

        it('should parse numbers', async () => {
            const input = dedent`
                {
                    "true": true,
                    "false": false,
                    "dec": 123,
                    "hex": "0x02"
                }`;
            const result = parseJsonToCTreeItem(input);

            expect(result).toBeDefined();
            expect(result?.getTag()).toBeUndefined();
            expect(result?.getValue('true')).toBe('true');
            expect(result?.getValue('false')).toBe('false');
            expect(result?.getValue('dec')).toBe('123');
            expect(result?.getValue('hex')).toBe('0x02');

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);

        });

        it('should parse scalar arrays with strings and numbers', async () => {
            const input = dedent`
                {
                    "items": [
                        "foo",
                        "",
                        "bar",
                        123,
                        true,
                        false
                    ]
                }`;
            const result = parseJsonToCTreeItem(input);

            expect(result).toBeDefined();
            expect(result?.getTag()).toBeUndefined();

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);

        });

        it('should handle parsing errors gracefully', async () => {
            const parser = new CTreeItemJsonParser(new CTreeItemBuilder('test.json'));
            // Invalid JSON: missing quotes around property name and value
            const result = parser.parse('{"invalid": json}');

            expect(result).toBeDefined();
            const errors = parser.errors;
            expect(parser.errors.length).toBeGreaterThan(0);
            expect(errors[0]).toEqual('test.json:1:13: InvalidSymbol');
        });

        it('should preserve file name in parsed tree', async () => {
            const parser = new CTreeItemJsonParser(new CTreeItemBuilder('test.json'));
            const result = parser.parse('{"test": "value"}');

            expect(result).toBeDefined();
            expect(result?.rootFileName).toBe('test.json');
        });

        it('should parse JSON with comments (JSONC) and keep them', async () => {
            const input = dedent`
            {
                // This is a comment
                // This is also a comment
                "name": "test", // inline comment
                /* Multi-line
                   comment */
                "value": "example" /* another inline comment */
                // This is another comment
            }\n`;
            const modified = dedent`
            {
                // This is a comment
                // This is also a comment
                "name": "test", // inline comment
                /* Multi-line
                   comment */
                "value": "example", /* another inline comment */
                // This is another comment
                "foo": "bar"
            }\n`;
            const result = parseJsonToCTreeItem(input);

            expect(result).toBeDefined();
            expect(result?.getValue('name')).toBe('test');
            expect(result?.getValue('value')).toBe('example');

            let jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);
            result!.setValue('foo', 'bar');
            jsonString = toJsonString(result!);
            expect(jsonString).toEqual(modified);
        });

        describe('JSON with superfluous commas (ARM-software/vscode-cmsis-csolution#406)', () => {

            it('should parse top level object', async () => {
                const input = dedent`
                {
                    "name": "test",
                    "value": "example",
                }\n`;
                const expected = dedent`
                {
                    "name": "test",
                    "value": "example"
                }\n`;

                const result = parseJsonToCTreeItem(input);

                expect(result).toBeDefined();
                const jsonString = toJsonString(result!);
                expect(jsonString).toEqual(expected);

                expect(result?.getValue('name')).toBe('test');
                expect(result?.getValue('value')).toBe('example');
            });

            it('should parse nested object', async () => {
                const input = dedent`
                {
                    "parent": {
                        "name": "test",
                        "value": "example",
                    },
                }\n`;
                const expected = dedent`
                {
                    "parent": {
                        "name": "test",
                        "value": "example"
                    }
                }\n`;

                const result = parseJsonToCTreeItem(input);

                expect(result).toBeDefined();
                const jsonString = toJsonString(result!);
                expect(jsonString).toEqual(expected);

                const parent = result?.getChild('parent');
                expect(parent).toBeDefined();
                expect(parent?.getValue('name')).toBe('test');
                expect(parent?.getValue('value')).toBe('example');
            });

            it('should parse object with array', async () => {
                const input = dedent`
                {
                    "items": [
                        "Apple",
                        "Banana",
                        "Cherry",
                    ],
                }\n`;
                const expected = dedent`
                {
                    "items": [
                        "Apple",
                        "Banana",
                        "Cherry"
                    ]
                }\n`;

                const result = parseJsonToCTreeItem(input);

                expect(result).toBeDefined();
                const jsonString = toJsonString(result!);
                expect(jsonString).toEqual(expected);

                const items = result?.getGrandChildren('items');
                expect(items).toHaveLength(3);
                expect(items?.[0]?.getText()).toBe('Apple');
                expect(items?.[1]?.getText()).toBe('Banana');
                expect(items?.[2]?.getText()).toBe('Cherry');
            });

            it('should parse complex nested structure', async () => {
                const input = dedent`
                {
                    "inputs": [
                        {
                            "options": [
                                "kws",,,,
                            ]
                        },
                        {
                            "default": "4"
                    }}
                    ],,,,
                    "tasks": [
                        {
                            "do": "eat",,
                            "drink": "water",
                        }}
                    ]],
                }\n`;
                const expected = dedent`
                {
                    "inputs": [
                        {
                            "options": [
                                "kws"
                            ]
                        },
                        {
                            "default": "4"
                        }
                    ],
                    "tasks": [
                        {
                            "do": "eat",
                            "drink": "water"
                        }
                    ]
                }\n`;

                let result = parseJsonToCTreeItem(input);

                expect(result).toBeDefined();
                let jsonString = toJsonString(result!);
                expect(jsonString).toEqual(expected);

                // the same result should be for expected as well
                result = parseJsonToCTreeItem(expected);
                expect(result).toBeDefined();
                jsonString = toJsonString(result!);
                expect(jsonString).toEqual(expected);
            });
            it('should parse two arrays of objects', async () => {
                const input = dedent`
                {
                    "items": [
                        {
                            "fruit": "Apple"
                        }
                    ],
                    "tasks": [
                        {
                            "do": "eat"
                        }
                    ]
                }\n`;

                const result = parseJsonToCTreeItem(input);

                expect(result).toBeDefined();
                const jsonString = toJsonString(result!);
                expect(jsonString).toEqual(input);
            });
        });
    });

    describe('toJsonString', () => {
        it('should convert parsed tree item back to JSON string', async () => {
            const input = dedent`
            {
                "name": "test",
                "value": "example"
            }\n`;
            const tree = parseJsonToCTreeItem(input);

            expect(tree).toBeDefined();
            const jsonString = toJsonString(tree!);

            // Parse the output to verify it's valid JSON
            const parsed = parseJsonc(jsonString);
            expect(parsed.name).toBe('test');
            expect(parsed.value).toBe('example');
            expect(jsonString).toEqual(input);
        });
        it('should stringify tree item to JSON string', async () => {
            const expected = dedent`
            {
                "name": "test",
                "value": "example"
            }\n`;
            const tree = new CTreeItem();
            tree.setKind(ETreeItemKind.Map);
            tree.setValue('name', 'test');
            tree.setValue('value', 'example');
            const jsonString = toJsonString(tree!);

            // Parse the output to verify it's valid JSON
            const parsed = parseJsonc(jsonString);
            expect(parsed.name).toBe('test');
            expect(parsed.value).toBe('example');
            expect(jsonString).toEqual(expected);
        });
        it('should stringify tree with array to JSON string', async () => {
            const tree = new CTreeItem();
            tree.setKind(ETreeItemKind.Map);
            const top = tree.createChild('options').setKind(ETreeItemKind.Map);
            top.createChild('defines').setKind(ETreeItemKind.Sequence).createChild('-').setText('DTEST');
            const jsonString = toJsonString(tree);

            // Parse the output to verify it's valid JSON
            const parsed = parseJsonc(jsonString);
            expect(parsed.options.defines[0]).toBe('DTEST');
            const loadedRoot = parseJsonToCTreeItem(jsonString);
            expect(loadedRoot).toBeDefined();
            const options = loadedRoot?.getChild('options');
            expect(options).toBeDefined();
            // stringify  again to see if stable
            const jsonString2 = toJsonString(loadedRoot!);
            expect(jsonString).toEqual(jsonString2);
        });

        it('should stringify object with escaped unsafe characters', async () => {
            const tree = new CTreeItem();
            tree.setKind(ETreeItemKind.Map);
            tree.setValue('quote', 'He said, "Hello!"');
            tree.setValue('backslash', 'This is a backslash: \\');
            tree.setValue('control', 'First line.\nSecond line.\tTabbed.');
            const jsonString = toJsonString(tree);
            const expected = dedent.withOptions({ escapeSpecialCharacters: false })`{
                "quote": "He said, \"Hello!\"",
                "backslash": "This is a backslash: \\",
                "control": "First line.\nSecond line.\tTabbed."
            }` + '\n';
            expect(jsonString).toEqual(expected);

            // Parse the output to verify it's valid JSON
            const loadedRoot = parseJsonToCTreeItem(jsonString);
            expect(loadedRoot).toBeDefined();
            // stringify  again to see if stable
            const jsonString2 = toJsonString(loadedRoot!);
            expect(jsonString2).toEqual(expected);
        });
    });

    describe('Shall update child elements with different types (ARM-software/vscode-cmsis-csolution#390)', () => {
        it('Update scalar string to array-of-strings', () => {
            const input = dedent`
            {
                "includes": "file1.h"
            }\n`;
            const modified = dedent`
            {
                "includes": [
                    "file1.h",
                    "file2.h"
                ]
            }\n`;
            const tree = parseJsonToCTreeItem(input);
            expect(tree).toBeDefined();
            expect(tree?.getValue('includes')).toBe('file1.h');

            const includesItem = tree?.getChild('includes');
            expect(includesItem).toBeDefined();
            includesItem!.fromObject(['file1.h', 'file2.h']);

            const jsonString = toJsonString(tree!);
            expect(jsonString).toEqual(modified);
        });
    });
});

describe('TreeItemJsonParser - Comprehensive Coverage', () => {

    describe('Primitive Value Types', () => {
        it('should parse all primitive JSON types', async () => {
            const input = dedent`
            {
                "string": "text value",
                "number": 42,
                "float": 3.14,
                "negative": -10,
                "boolean_true": true,
                "boolean_false": false,
                "null_value": null,
                "empty_string": "",
                "zero": 0
            }\n`;

            const result = parseJsonToCTreeItem(input);

            expect(result).toBeDefined();
            expect(result?.getValue('string')).toBe('text value');
            expect(result?.getValue('number')).toBe('42');
            expect(result?.getValue('float')).toBe('3.14');
            expect(result?.getValue('negative')).toBe('-10');
            expect(result?.getValue('boolean_true')).toBe('true');
            expect(result?.getValue('boolean_false')).toBe('false');
            expect(result?.getValue('null_value')).toBe('null');
            expect(result?.getValue('empty_string')).toBe('');
            expect(result?.getValue('zero')).toBe('0');

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);
        });

        it('should handle scientific notation and special numbers', async () => {
            const input = dedent`
            {
                "scientific": 1.23e10,
                "scientific_negative": -1.23e-10,
                "large_number": 9223372036854776000,
                "hex_string": "0xFF",
                "binary_string": "0b1010"
            }\n`;

            const result = parseJsonToCTreeItem(input);

            expect(result).toBeDefined();
            expect(result?.getValue('scientific')).toBe('12300000000');
            expect(result?.getValue('scientific_negative')).toBe('-1.23e-10');
            expect(result?.getValue('large_number')).toBe('9223372036854776000');
            expect(result?.getValue('hex_string')).toBe('0xFF');
            expect(result?.getValue('binary_string')).toBe('0b1010');
        });
    });

    describe('String Escape Sequences', () => {
        it('should handle all JSON escape sequences', async () => {
            const tree = new CTreeItem();
            tree.setKind(ETreeItemKind.Map);
            tree.setValue('quote', 'He said, "Hello!"');
            tree.setValue('backslash', 'Path: C:\\Windows\\System32');
            tree.setValue('forward_slash', 'URL: https://example.com/path');
            tree.setValue('newline', 'Line 1\nLine 2');
            tree.setValue('tab', 'Column1\tColumn2');
            tree.setValue('carriage_return', 'Text\rReturn');
            tree.setValue('form_feed', 'Text\fFeed');
            tree.setValue('backspace', 'Text\bSpace');
            tree.setValue('unicode', 'Unicode: \u0041\u0042\u0043');
            tree.setValue('mixed', 'Mixed: "quote" \\backslash\\ \n\t\r');

            const jsonString = toJsonString(tree);

            // Verify round-trip stability
            const loadedRoot = parseJsonToCTreeItem(jsonString);
            expect(loadedRoot).toBeDefined();

            const jsonString2 = toJsonString(loadedRoot!);
            expect(jsonString2).toEqual(jsonString);
        });

        it('should preserve Unicode characters', async () => {
            const input = dedent`
            {
                "emoji": "🚀🔥💯",
                "chinese": "你好世界",
                "arabic": "مرحبا بالعالم",
                "special_chars": "±×÷≠≤≥∞",
                "unicode_escape": "\\u0048\\u0065\\u006c\\u006c\\u006f"
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();

            const jsonString = toJsonString(result!);
            expect(() => JSON.parse(jsonString)).not.toThrow();
        });
    });

    describe('Array Variations', () => {
        it('should handle mixed-type arrays', async () => {
            const input = dedent`
            {
                "mixed_array": [
                    "string",
                    42,
                    true,
                    null,
                    {
                        "nested": "object"
                    },
                    [
                        "nested",
                        "array"
                    ]
                ]
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();

            const items = result?.getGrandChildren('mixed_array');
            expect(items).toHaveLength(6);
            expect(items?.[0]?.getText()).toBe('string');
            expect(items?.[1]?.getText()).toBe('42');
            expect(items?.[2]?.getText()).toBe('true');
            expect(items?.[3]?.getText()).toBe('null');
            expect(items?.[4]?.getValue('nested')).toBe('object');

            const nestedArray = items?.[5]?.getChildren();
            expect(nestedArray).toHaveLength(2);
            expect(nestedArray?.[0]?.getText()).toBe('nested');
            expect(nestedArray?.[1]?.getText()).toBe('array');
        });

        it('should handle deeply nested arrays', async () => {
            const input = dedent`
            {
                "deep_array": [
                    [
                        [
                            [
                                "deep_value"
                            ]
                        ]
                    ]
                ]
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);
        });

        it('should handle arrays with objects containing arrays', async () => {
            const input = dedent`
            {
                "complex_structure": [
                    {
                        "name": "item1",
                        "tags": [
                            "tag1",
                            "tag2"
                        ],
                        "metadata": {
                            "flags": [
                                true,
                                false,
                                true
                            ]
                        }
                    },
                    {
                        "name": "item2",
                        "tags": [],
                        "metadata": {
                            "flags": []
                        }
                    }
                ]
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();

            const items = result?.getGrandChildren('complex_structure');
            expect(items).toHaveLength(2);

            const firstItem = items?.[0];
            expect(firstItem?.getValue('name')).toBe('item1');

            const tags = firstItem?.getGrandChildren('tags');
            expect(tags).toHaveLength(2);
            expect(tags?.[0]?.getText()).toBe('tag1');
            expect(tags?.[1]?.getText()).toBe('tag2');

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);
        });
    });

    describe('Object Variations', () => {
        it('should handle deeply nested objects', async () => {
            const input = dedent`
            {
                "level1": {
                    "level2": {
                        "level3": {
                            "level4": {
                                "level5": {
                                    "deep_value": "found"
                                }
                            }
                        }
                    }
                }
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();

            const level1 = result?.getChild('level1');
            const level2 = level1?.getChild('level2');
            const level3 = level2?.getChild('level3');
            const level4 = level3?.getChild('level4');
            const level5 = level4?.getChild('level5');

            expect(level5?.getValue('deep_value')).toBe('found');

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);
        });

        it('should handle objects with special property names', async () => {
            const input = dedent`
            {
                "": "empty_key",
                "123": "numeric_key",
                "key-with-dashes": "value",
                "key_with_underscores": "value",
                "key.with.dots": "value",
                "key with spaces": "value",
                "UPPERCASE": "value",
                "mixedCase": "value",
                "$pecial": "value",
                "@symbol": "value"
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();

            expect(result?.getValue('')).toBe('empty_key');
            expect(result?.getValue('123')).toBe('numeric_key');
            expect(result?.getValue('key-with-dashes')).toBe('value');
            expect(result?.getValue('key_with_underscores')).toBe('value');
            expect(result?.getValue('key.with.dots')).toBe('value');
            expect(result?.getValue('key with spaces')).toBe('value');
            expect(result?.getValue('UPPERCASE')).toBe('value');
            expect(result?.getValue('mixedCase')).toBe('value');
            expect(result?.getValue('$pecial')).toBe('value');
            expect(result?.getValue('@symbol')).toBe('value');
        });
    });

    describe('JSONC (JSON with Comments)', () => {
        it('should preserve all comment types', async () => {
            const input = dedent`
            {
                // Single line comment at start
                "key1": "value1", // Inline comment
                /* Block comment */
                "key2": "value2", /* Mid-line block comment */
                /*
                 * Multi-line
                 * block comment
                 */
                "key3": "value3"
                // Final comment
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();

            expect(result?.getValue('key1')).toBe('value1');
            expect(result?.getValue('key2')).toBe('value2');
            expect(result?.getValue('key3')).toBe('value3');

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(input);
        });

        it('should handle comments in arrays', async () => {
            const input = dedent`
            {
                "items": [
                    // First item
                    "item1",
                    /* Second item */ "item2", // Inline
                    "item3" // Last item
                    // Trailing comment
                ]
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();

            const items = result?.getGrandChildren('items');
            expect(items).toHaveLength(3);
            expect(items?.[0]?.getText()).toBe('item1');
            expect(items?.[1]?.getText()).toBe('item2');
            expect(items?.[2]?.getText()).toBe('item3');
        });
    });

    describe('Recoverable Parsing Errors', () => {
        it('should handle trailing commas in objects', async () => {
            const input = dedent`
            {
                "key1": "value1",
                "key2": "value2",
            }\n`;

            const expected = dedent`
            {
                "key1": "value1",
                "key2": "value2"
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(expected);
        });

        it('should handle trailing commas in arrays', async () => {
            const input = dedent`
            {
                "items": [
                    "item1",
                    "item2",
                ]
            }\n`;

            const expected = dedent`
            {
                "items": [
                    "item1",
                    "item2"
                ]
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(expected);
        });

        it('should handle multiple consecutive commas', async () => {
            const input = dedent`
            {
                "items": [
                    "item1",,,
                    "item2",,,,
                ],,,
                "other": "value",,
            }\n`;

            const expected = dedent`
            {
                "items": [
                    "item1",
                    "item2"
                ],
                "other": "value"
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();

            const jsonString = toJsonString(result!);
            expect(jsonString).toEqual(expected);
        });

        it('should handle missing closing braces (partial recovery)', async () => {
            const parser = new CTreeItemJsonParser(new CTreeItemBuilder('test.json'));
            const input = '{"key1": "value1", "nested": {"key2": "value2"';

            const result = parser.parse(input);
            expect(result).toBeDefined();
            expect(parser.errors.length).toBeGreaterThan(0);

            // Should still parse what it can
            expect(result?.getValue('key1')).toBe('value1');
        });

        it('should handle missing closing brackets in arrays', async () => {
            const parser = new CTreeItemJsonParser(new CTreeItemBuilder('test.json'));
            const input = '{"items": ["item1", "item2"';

            const result = parser.parse(input);
            expect(result).toBeDefined();
            expect(parser.errors.length).toBeGreaterThan(0);
        });

        it('should handle unquoted property names', async () => {
            const parser = new CTreeItemJsonParser(new CTreeItemBuilder('test.json'));
            const input = '{key1: "value1", key2: "value2"}';

            const result = parser.parse(input);
            expect(result).toBeDefined();
            expect(parser.errors.length).toBeGreaterThan(0);
        });

        it('should handle single quotes instead of double quotes', async () => {
            const parser = new CTreeItemJsonParser(new CTreeItemBuilder('test.json'));
            const input = "{'key1': 'value1', 'key2': 'value2'}";

            const result = parser.parse(input);
            expect(result).toBeDefined();
            expect(parser.errors.length).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases and Boundary Conditions', () => {
        it('should handle extremely large objects', async () => {
            const tree = new CTreeItem();
            tree.setKind(ETreeItemKind.Map);

            // Create object with many properties
            for (let i = 0; i < 1000; i++) {
                tree.setValue(`key_${i}`, `value_${i}`);
            }

            const jsonString = toJsonString(tree);
            const result = parseJsonToCTreeItem(jsonString);

            expect(result).toBeDefined();
            expect(result?.getValue('key_0')).toBe('value_0');
            expect(result?.getValue('key_999')).toBe('value_999');
        });

        it('should handle extremely large arrays', async () => {
            const tree = new CTreeItem();
            tree.setKind(ETreeItemKind.Map);
            const arrayItem = tree.createChild('large_array').setKind(ETreeItemKind.Sequence);

            // Create array with many items
            for (let i = 0; i < 1000; i++) {
                arrayItem.createChild('-').setText(`item_${i}`);
            }

            const jsonString = toJsonString(tree);
            const result = parseJsonToCTreeItem(jsonString);

            expect(result).toBeDefined();
            const items = result?.getGrandChildren('large_array');
            expect(items).toHaveLength(1000);
            expect(items?.[0]?.getText()).toBe('item_0');
            expect(items?.[999]?.getText()).toBe('item_999');
        });

        it('should handle very long strings', async () => {
            const longString = 'x'.repeat(10000);
            const input = dedent`
            {
                "long_string": "${longString}"
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();
            expect(result?.getValue('long_string')).toBe(longString);
        });

        it('should handle empty root containers', async () => {
            const emptyObject = '{}';
            const emptyArray = '[]';

            const objectResult = parseJsonToCTreeItem(emptyObject);
            expect(objectResult).toBeDefined();
            expect(objectResult?.getChildren()).toHaveLength(0);

            const arrayResult = parseJsonToCTreeItem(emptyArray);
            expect(arrayResult).toBeDefined();
            expect(arrayResult?.getChildren()).toHaveLength(0);
        });

        it('should handle whitespace variations', async () => {
            const input = '{\n\n\n  "key1"   :   "value1"  ,  \n\n  "key2"\t\t:\t\t"value2"\n\n\n}';

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();
            expect(result?.getValue('key1')).toBe('value1');
            expect(result?.getValue('key2')).toBe('value2');
        });
    });

    describe('Error Recovery and Validation', () => {
        it('should provide meaningful error messages', async () => {
            const parser = new CTreeItemJsonParser(new CTreeItemBuilder('test.json'));
            const invalidInputs = [
                '{"key": }',           // Missing value
                '{"key" "value"}',     // Missing colon
                '{"key": "value"',     // Missing closing brace
                '[1, 2, 3',           // Missing closing bracket
                '{"key": "unterminated string',  // Unterminated string
            ];

            invalidInputs.forEach(input => {
                const result = parser.parse(input);
                expect(result).toBeDefined();
                expect(parser.errors.length).toBeGreaterThan(0);

                // Reset parser for next test
                parser.errors.length = 0;
            });
        });

        it('should maintain stability through parse-stringify cycles', async () => {
            const complexInput = dedent`
            {
                "metadata": {
                    "version": "1.0.0",
                    "authors": [
                        "John Doe",
                        "Jane Smith"
                    ],
                    "features": {
                        "experimental": true,
                        "flags": [
                            1,
                            2,
                            3
                        ]
                    }
                },
                "data": [
                    {
                        "id": 1,
                        "values": [
                            true,
                            false,
                            null,
                            "string",
                            42
                        ]
                    }
                ]
            }\n`;

            let result = parseJsonToCTreeItem(complexInput);

            // Multiple parse-stringify cycles
            for (let i = 0; i < 5; i++) {
                const jsonString = toJsonString(result!);
                result = parseJsonToCTreeItem(jsonString);
                expect(result).toBeDefined();
            }

            const finalString = toJsonString(result!);
            expect(finalString).toEqual(complexInput);
        });
    });

    describe('Type Coercion and Conversion', () => {
        it('should handle dynamic type changes', async () => {
            const input = dedent`
            {
                "dynamic_value": "string_initially"
            }\n`;

            const result = parseJsonToCTreeItem(input);
            expect(result).toBeDefined();
            expect(result?.getValue('dynamic_value')).toBe('string_initially');

            // Change to array
            const dynamicItem = result?.getChild('dynamic_value');
            dynamicItem!.fromObject(['item1', 'item2', 'item3']);

            const arrayString = toJsonString(result!);
            const arrayResult = parseJsonToCTreeItem(arrayString);

            const items = arrayResult?.getGrandChildren('dynamic_value');
            expect(items).toHaveLength(3);
            expect(items?.[0]?.getText()).toBe('item1');

            // Change to object
            dynamicItem!.fromObject({ nested_key: 'nested_value' });

            const objectString = toJsonString(result!);
            const objectResult = parseJsonToCTreeItem(objectString);

            expect(objectResult?.getChild('dynamic_value')?.getValue('nested_key')).toBe('nested_value');
        });
    });
});
