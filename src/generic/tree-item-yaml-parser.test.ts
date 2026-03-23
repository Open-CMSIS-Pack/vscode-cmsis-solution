/**
 * Copyright 2024-2026 Arm Limited
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

import { it } from '@jest/globals';
import { CTreeItemYamlParser, parseYamlToCTreeItem, toYamlString } from './tree-item-yaml-parser';
import { CTreeItem, ETreeItemKind } from './tree-item';
import dedent from 'dedent';
import { CTreeItemBuilder } from './tree-item-builder';

const trimSpaces = (s: string): string => {
    return s.trim().replace(/ +/g, ' ');
};

describe('parseYamlToCTreeItem', () => {

    it('test toYamlString from undefined', async () => {
        const yamlString = toYamlString(undefined);
        expect(yamlString).toEqual('');
    });

    it('test parseYamlToCTreeItem parsing empty input', async () => {
        const root = parseYamlToCTreeItem('');
        expect(root).toBeInstanceOf(CTreeItem);
        expect(root!.rootFileName).toEqual('');
        expect(root!.getTag()).toEqual(undefined);
        expect(root!.getKind()).toEqual(ETreeItemKind.Undefined);
    });

    it('test parseYamlToCTreeItem parsing non-existing file', async () => {
        const root = parseYamlToCTreeItem('', './dummyFile');
        expect(root).toBeInstanceOf(CTreeItem);
        expect(root!.rootFileName).toEqual('./dummyFile');
        expect(root!.getTag()).toEqual(undefined);
        expect(root!.getKind()).toEqual(ETreeItemKind.Undefined);
    });

    it('test parseYamlToCTreeItem parsing scalar', async () => {
        const root = parseYamlToCTreeItem('scalar\n', './dummyFile');

        expect(root).toBeInstanceOf(CTreeItem);
        expect(root!.rootFileName).toEqual('./dummyFile');
        expect(root!.getText()).toEqual('scalar');
        expect(root!.getKind()).toEqual(ETreeItemKind.Scalar);

        const yamlString = toYamlString(root);
        expect(yamlString).toEqual('scalar\n');
    });

    it('stores scalar range as start and value-end offsets', async () => {
        const input = 'key: value\n';
        const root = parseYamlToCTreeItem(input, './dummyFile');
        const valueNode = root?.getChild('key');

        expect(valueNode).toBeDefined();
        expect(valueNode?.range).toEqual([5, 10]);
    });

    it('test parseYamlToCTreeItem parsing sequence', async () => {
        const prime = dedent`
        # document comment
        # commentBefore prime
        prime:
            #comment after prime
            - two
            #comment before three
            - three #comment on the line three
            - seven
        `;

        const root = parseYamlToCTreeItem(prime);

        expect(root).toBeInstanceOf(CTreeItem);
        expect(root!.getKind()).toEqual(ETreeItemKind.Map);
        const child = root?.getChild();
        expect(!!child).toEqual(true);
        if (!child || !root) {
            return;
        }
        expect(child).toBeInstanceOf(CTreeItem);
        expect(child.getChildren().length).toEqual(3);
        expect(child.getKind()).toEqual(ETreeItemKind.Sequence);
        expect(child.getPrimaryKey()).toEqual('prime');
        expect(child.getValue()).toEqual('two');
        expect(child.getValuesAsArray()).toEqual(['two', 'three', 'seven']);
        expect(root.getValuesAsArray('prime')).toEqual(['two', 'three', 'seven']);
        expect(child.getValuesAsArray('prime')).toEqual([]);

        const two = root!.findChild(['prime', 'two']);
        expect(two).toBeInstanceOf(CTreeItem);
        expect(two!.getKind()).toEqual(ETreeItemKind.Scalar);
        expect(two!.getPrimaryKey()).toEqual('two');
        expect(two!.getText()).toEqual('two');

        const yamlString = toYamlString(root);
        expect(trimSpaces(yamlString)).toEqual(trimSpaces(prime));
    });

    it('test parseYamlToCTreeItem parsing map to attributes', async () => {
        const prime =
            `prime:
                two: v2
                three: v3
                seven: v7`;

        const root = parseYamlToCTreeItem(prime, 'foo.yml', true);

        expect(root).toBeInstanceOf(CTreeItem);
        const child = root?.getChild();
        expect(child).toBeInstanceOf(CTreeItem);
        expect(child!.getAttribute('two')).toEqual('v2');
        expect(child!.getValue('two')).toEqual('v2');
        expect(child!.getKind()).toEqual(ETreeItemKind.Map);
        const attributes = child!.getAttributes();
        expect(attributes!.size).toEqual(3);

        expect(root!.getValuesAsArray('prime')).toEqual([]);

        const yamlString = toYamlString(root);
        expect(trimSpaces(yamlString)).toEqual(trimSpaces(prime));
    });

    it('test parseYamlToCTreeItem parsing map to items', async () => {
        const prime =
            `prime:
                empty: ""
                emptys: ''
                null_val:
                two: v2
                three: v3
                seven: v7
                double_quoted: "dq"
                single_quoted: 'sq'`;

        const root = parseYamlToCTreeItem(prime, 'foo.yml');

        expect(root).toBeInstanceOf(CTreeItem);
        const child = root?.getChild();
        expect(child).toBeInstanceOf(CTreeItem);
        expect(child!.getKind()).toEqual(ETreeItemKind.Map);
        expect(child!.getAttributes()).toEqual(undefined);
        expect(child!.getValue('two')).toEqual('v2');

        const yamlString = toYamlString(root);
        expect(trimSpaces(yamlString)).toEqual(trimSpaces(prime));
    });

    it('test parseYamlToCTreeItem save empty lines', async () => {
        const prime =
            `prime:
                # comment before name
                # comment before name
                # comment before name
                # comment before name

                - name: baz # comment after name

                - name: foo
                  val: bar`;

        const root = parseYamlToCTreeItem(prime, 'foo.yml');
        expect(root).toBeInstanceOf(CTreeItem);
        const child = root?.getChild();
        expect(child).toBeInstanceOf(CTreeItem);
        expect(child!.getKind()).toEqual(ETreeItemKind.Sequence);
        expect(child!.getTag()).toEqual('prime');
        expect(child!.getValuesAsArray('name')).toEqual(['baz', 'foo']);


        const yamlString = toYamlString(root);
        expect(trimSpaces(yamlString)).toEqual(trimSpaces(prime));
    });

    it('test parseYamlToCTreeItem save empty lines no value', async () => {
        const prime =
            `prime:
                # comment before name

                - name:

                - name: foo
                  val: bar`;

        const root = parseYamlToCTreeItem(prime, 'foo.yml');

        const yamlString = toYamlString(root);
        expect(trimSpaces(yamlString)).toEqual(trimSpaces(prime));
    });

    it('test parseYamlToCTreeItem parsing numbers to strings', async () => {
        const numbers =
            `numbers:
                hex: 0x1234
                hex0: 0x00001234
                dec: 1234
                bool: true
                float:  1.234
                float2: 1.234e+2
                negative: -1234
                oct: 01234
                zero: 0`;

        const root = parseYamlToCTreeItem(numbers, 'foo.yml');

        expect(root).toBeInstanceOf(CTreeItem);
        const child = root?.getChild();
        expect(child).toBeInstanceOf(CTreeItem);
        expect(child!.getKind()).toEqual(ETreeItemKind.Map);
        expect(child!.getValue('hex')).toEqual('0x1234');
        expect(child!.getValue('dec')).toEqual('1234');
        expect(child!.getValue('negative')).toEqual('-1234');
        expect(child!.getValue('oct')).toEqual('01234');
        expect(child!.getValue('negative')).toEqual('-1234');

        const yamlString = toYamlString(root);
        expect(trimSpaces(yamlString)).toEqual(trimSpaces(numbers));
    });

    it('test parseYamlToCTreeItem parsing quoted numbers to strings', async () => {
        const numbers =
            `numbers:
                hex: '0x1234'
                hex0: '0x00001234'
                dec: '1234'
                bool: 'true'
                float:  '1.234'
                float2: '1.234e+2'
                negative: '-1234'
                oct: '01234'
                zero: '0'`;

        const root = parseYamlToCTreeItem(numbers, 'foo.yml');

        expect(root).toBeInstanceOf(CTreeItem);
        const child = root?.getChild();
        expect(child).toBeInstanceOf(CTreeItem);
        expect(child!.getKind()).toEqual(ETreeItemKind.Map);
        expect(child!.getValue('hex')).toEqual('0x1234');
        expect(child!.getValue('dec')).toEqual('1234');
        expect(child!.getValue('negative')).toEqual('-1234');
        expect(child!.getValue('oct')).toEqual('01234');
        expect(child!.getValue('negative')).toEqual('-1234');

        const yamlString = toYamlString(root);
        expect(trimSpaces(yamlString)).toEqual(trimSpaces(numbers));
    });

    it('test parseYamlToCTreeItem parsing double quoted numbers to strings', async () => {
        const doubleQuotedNumbers =
            `numbers:
                    hex: "0x1234"
                    hex0: "0x00001234"
                    dec: "1234"
                    negative: "-1234"
                    bool: "true"
                    float: "1.234"
                    float2: "1.234e+2"
                    oct: "01234"
                    zero: "0"`;

        const root = parseYamlToCTreeItem(doubleQuotedNumbers, 'foo.yml');

        expect(root).toBeInstanceOf(CTreeItem);
        const child = root?.getChild();
        expect(child).toBeInstanceOf(CTreeItem);
        expect(child!.getKind()).toEqual(ETreeItemKind.Map);
        expect(child!.getValue('hex')).toEqual('0x1234');
        expect(child!.getValue('dec')).toEqual('1234');
        expect(child!.getValue('negative')).toEqual('-1234');
        expect(child!.getValue('oct')).toEqual('01234');
        expect(child!.getValue('negative')).toEqual('-1234');

        const yamlString = toYamlString(root);
        expect(trimSpaces(yamlString)).toEqual(trimSpaces(doubleQuotedNumbers));
    });

    it('test parseYamlToCTreeItem parsing nested', async () => {
        const input =
            `nested:
                one: v1 #comment V2
                two: v2 #comment V2
                three:
                #comment three
                    # s_one
                    s_one: v3.1
                    # s_two
                    s_two: v3.2 #comment v3.2
                    empty: ""
                four:
                - k4.1
                - k4.2.a: a
                  k4.2.b: b`;

        const root = parseYamlToCTreeItem(input);

        expect(root).toBeInstanceOf(CTreeItem);
        const topChild = root?.getChild();
        expect(topChild).toBeInstanceOf(CTreeItem);
        if (!topChild) {
            return;
        }

        expect(topChild.getAttributes()).toEqual(undefined);

        expect(topChild.getValue('two')).toEqual('v2');
        const child3 = topChild.getChild('three');
        expect(child3).toBeInstanceOf(CTreeItem);
        expect(child3!.getValue('s_one')).toEqual('v3.1');
        const child4 = topChild.getChild('four');
        expect(child4).toBeInstanceOf(CTreeItem);
        expect(child4!.getChildren().length).toEqual(2);
        expect(child4!.getChildren()[1].getValue('k4.2.b')).toEqual('b');
        expect(child4!.getKind()).toEqual(ETreeItemKind.Sequence);

        const c42 = child4!.getChild('a');
        expect(c42).toBeInstanceOf(CTreeItem);
        if (c42) {
            const treePath = c42.getTreePath();
            expect(treePath).toEqual(['nested', 'four', 'a']);
            expect(root!.findChild(treePath)).toEqual(c42);
        }

        const yamlString = toYamlString(root);
        expect(trimSpaces(yamlString)).toEqual(trimSpaces(input));
    });

    it('test parseYamlToCTreeItem parsing nested with comments', async () => {
        const input =
            `# comment before nested
            nested:
            # comment after nested
                one: v1
                two: v2
                # comment above three
                three:
                    # s_one
                    s_one: v3.1 #comment v3.1
                    # s_two
                    s_two: v3.2 #comment v3.2

                # comment above four

                four:
                - k4.1  # comment after k4.1
                - k4.2.a: a
                  # comment before k4.2.b
                  k4.2.b: b`;

        const parser = new CTreeItemYamlParser();
        const root = parser.parse(input);
        expect(root).toBeInstanceOf(CTreeItem);
        const topChild = root?.getChild();
        expect(topChild).toBeInstanceOf(CTreeItem);
        if (!topChild) {
            return;
        }
        const output = parser.yamlDocument?.toString();
        expect(output).toBeTruthy();
        expect(trimSpaces(output!).replace('\nnested', '\n nested')).toEqual(trimSpaces(input));

        const yamlString = toYamlString(root);
        expect(trimSpaces(yamlString)).toEqual(trimSpaces(output!));
    });

    it('should parse JSON with comments', async () => {
        const input = `{
                // This is a comment
                "name": "test",
                /* Multi-line
                   comment */
                "value": 42
            }`;
        const parser = new CTreeItemYamlParser();
        const root = parser.parse(input);

        expect(root).toBeInstanceOf(CTreeItem);
        const topChild = root?.getChild();
        expect(topChild).toBeInstanceOf(CTreeItem);
    });
    it('should report errors with line and column for invalid YAML', () => {
        const parser = new CTreeItemYamlParser(new CTreeItemBuilder('test.yml'));
        // Invalid YAML: missing colon after key
        const input = dedent`
            invalid:
            - one
            two
            `;
        const root = parser.parse(input);

        expect(root).toBeDefined();
        const errors = parser.errors;
        expect(errors.length).toBeGreaterThan(0);
        // Check error format: <filename>:<line>:<column>: <error message>
        expect(errors[0]).toMatch(/test\.yml:3:1: .*/);
    });

});

describe('TreeItemYamlParser - Comprehensive Coverage', () => {

    describe('Primitive Value Types', () => {
        it('should parse all YAML scalar types', async () => {
            const input = dedent`
                scalars:
                    string_unquoted: hello world
                    string_quoted: "quoted string"
                    string_single: 'single quoted'
                    integer_decimal: 42
                    integer_negative: -123
                    integer_hex: 0x1F
                    integer_octal: 0o755
                    integer_binary: 0b1010
                    float_decimal: 3.14159
                    float_scientific: 1.23e+10
                    float_negative: -2.5
                    float_infinity: .inf
                    float_negative_infinity: -.inf
                    float_nan: .nan
                    boolean_true: true
                    boolean_false: false
                    boolean_yes: yes
                    boolean_no: no
                    boolean_on: on
                    boolean_off: off
                    null_value: null
                    null_tilde: ~
                    null_empty:
                    empty_string: ""
                    empty_string_single: ''
            `;

            const result = parseYamlToCTreeItem(input, 'test.yml');

            expect(result).toBeDefined();
            const scalars = result?.getChild('scalars');
            expect(scalars).toBeDefined();

            // Test various scalar types
            expect(scalars?.getValue('string_unquoted')).toBe('hello world');
            expect(scalars?.getValue('string_quoted')).toBe('quoted string');
            expect(scalars?.getValue('string_single')).toBe('single quoted');
            expect(scalars?.getValue('integer_decimal')).toBe('42');
            expect(scalars?.getValue('integer_negative')).toBe('-123');
            expect(scalars?.getValue('integer_hex')).toBe('0x1F');
            expect(scalars?.getValue('float_decimal')).toBe('3.14159');
            expect(scalars?.getValue('boolean_true')).toBe('true');
            expect(scalars?.getValue('boolean_false')).toBe('false');
            expect(scalars?.getValue('null_value')).toBeUndefined();
            expect(scalars?.getValue('empty_string')).toBe('');

            const yamlString = toYamlString(result!);
            const reparsed = parseYamlToCTreeItem(yamlString, 'test.yml');
            expect(reparsed).toBeDefined();
        });

        it('should handle YAML timestamps and special values', async () => {
            const input = dedent`
                special:
                    timestamp_canonical: 2001-12-15T02:59:43.1Z
                    timestamp_iso8601: 2001-12-14t21:59:43.10-05:00
                    timestamp_spaced: 2001-12-14 21:59:43.10 -5
                    timestamp_date: 2002-12-14
                    version_number: 1.2.3
                    version_string: "v1.2.3"
                    multiline_literal: |
                        This is a literal
                        multiline string
                        with preserved newlines
            `;

            const result = parseYamlToCTreeItem(input, 'test.yml');
            expect(result).toBeDefined();

            const special = result?.getChild('special');
            expect(special?.getValue('timestamp_canonical')).toBe('2001-12-15T02:59:43.1Z');
            expect(special?.getValue('version_number')).toBe('1.2.3');
            expect(special?.getValue('version_string')).toBe('v1.2.3');

            // Test multiline strings
            expect(special?.getValue('multiline_literal')).toContain('literal\nmultiline');

            const yamlString = toYamlString(result!);
            expect(trimSpaces(yamlString)).toEqual(trimSpaces(input));
        });
    });

    describe('String Variations and Escaping', () => {
        it('should handle all YAML string escape sequences', async () => {
            const input = dedent`
                strings:
                    escaped_quote: "He said, \"Hello!\""
                    escaped_backslash: "Path: C:\\Windows\\System32"
                    raw_string: 'Raw string with "quotes" and \\backslashes'
                    mixed_quotes: "Single 'quotes' inside double"
                    single_with_double: 'Double "quotes" inside single'
                    multiline_folded: >
                        This is a folded
                        multiline string
                        with collapsed spaces
            `;

            const result = parseYamlToCTreeItem(input);
            expect(result).toBeDefined();

            const strings = result?.getChild('strings');
            expect(strings?.getValue('escaped_quote')).toEqual('He said, "Hello!"');
            expect(strings?.getValue('raw_string')).toEqual('Raw string with "quotes" and \\\\backslashes');
            expect(strings?.getValue('multiline_folded')).toEqual('This is a folded multiline string with collapsed spaces\n');
            // Test round-trip stability
            const yamlString = toYamlString(result!);
            const reparsed = parseYamlToCTreeItem(yamlString);
            expect(reparsed?.getChild('strings')?.getValue('escaped_quote')).toBe('He said, "Hello!"');
        });

        it('should preserve Unicode characters and emoji', async () => {
            const input = dedent`
                unicode:
                    emoji: "🚀🔥💯🎉"
                    chinese: "你好世界"
                    arabic: "مرحبا بالعالم"
                    russian: "Привет мир"
                    japanese: "こんにちは世界"
                    mixed: "Hello 🌍 World 你好"
                    mathematical: "∑ƒ(x)dx = ∫ from α to ω"
                    symbols: "±×÷≠≤≥∞√∂∇"
            `;

            const result = parseYamlToCTreeItem(input, 'test.yml');
            expect(result).toBeDefined();

            const unicode = result?.getChild('unicode');
            expect(unicode?.getValue('emoji')).toBe('🚀🔥💯🎉');
            expect(unicode?.getValue('chinese')).toBe('你好世界');
            expect(unicode?.getValue('arabic')).toBe('مرحبا بالعالم');
            expect(unicode?.getValue('mixed')).toBe('Hello 🌍 World 你好');
        });
    });

    describe('Array Variations and Complex Structures', () => {
        it('should handle all YAML array syntaxes', async () => {
            const input = dedent`
                arrays:
                    flow_style: [one, two, three]
                    nested_flow: [[1, 2], [3, 4], [5, 6]]
                    block_style:
                        - item1
                        - item2
                        - item3
                    mixed_types:
                        - string_value
                        - 42
                        - true
                        - null
                        - [nested, array]
                        - nested_object:
                            key: value
                    empty_array: []
                    single_item: [solo]
            `;

            const result = parseYamlToCTreeItem(input, 'test.yml');
            expect(result).toBeDefined();

            const arrays = result?.getChild('arrays');

            // Test flow style array
            const flowItems = arrays?.getGrandChildren('flow_style');
            expect(flowItems).toHaveLength(3);
            expect(flowItems?.[0]?.getText()).toBe('one');
            expect(flowItems?.[2]?.getText()).toBe('three');

            // Test mixed types array
            const mixedItems = arrays?.getGrandChildren('mixed_types');
            expect(mixedItems).toHaveLength(6);
            expect(mixedItems?.[0]?.getText()).toBe('string_value');
            expect(mixedItems?.[1]?.getText()).toBe('42');
            expect(mixedItems?.[2]?.getText()).toBe('true');
            expect(mixedItems?.[3]?.getText()).toBeUndefined();

            // Test nested object in array
            const nestedObj = mixedItems?.[5]?.getChild();
            expect(nestedObj?.getValue('key')).toBe('value');

            const yamlString = toYamlString(result!);
            const reparsed = parseYamlToCTreeItem(yamlString, 'test.yml');
            expect(reparsed).toBeDefined();
        });

        it('should handle deeply nested structures', async () => {
            const input = dedent`
                deep:
                    level1:
                        level2:
                            level3:
                                level4:
                                    level5:
                                        - deep_array_item1
                                        - deep_array_item2:
                                            very_deep: value
                                            deep_array:
                                                - [nested, flow, array]
                                                - nested_map:
                                                    key1: val1
                                                    key2: val2
            `;

            const result = parseYamlToCTreeItem(input, 'test.yml');
            expect(result).toBeDefined();

            // Navigate deep structure
            const deep = result?.getChild('deep');
            const level1 = deep?.getChild('level1');
            const level2 = level1?.getChild('level2');
            const level3 = level2?.getChild('level3');
            const level4 = level3?.getChild('level4');
            const level5Items = level4?.getGrandChildren('level5');

            expect(level5Items).toHaveLength(2);
            expect(level5Items?.[0]?.getText()).toBe('deep_array_item1');

            const deepItem2 = level5Items?.[1]?.getChild();
            expect(deepItem2?.getValue('very_deep')).toBe('value');

            // Test round-trip
            const yamlString = toYamlString(result!);
            const reparsed = parseYamlToCTreeItem(yamlString, 'test.yml');
            expect(reparsed).toBeDefined();
        });

        it('should handle complex array-object combinations', async () => {
            const input = dedent`
                complex:
                    services:
                        - name: web
                          image: nginx:latest
                          ports:
                              - "80:80"
                              - "443:443"
                          environment:
                              NODE_ENV: production
                              DEBUG: false
                          volumes:
                              - ./nginx.conf:/etc/nginx/nginx.conf
                              - ./ssl:/etc/ssl:ro
                        - name: api
                          image: node:16
                          ports: ["3000:3000"]
                          environment:
                              NODE_ENV: production
                              DATABASE_URL: postgres://user:pass@db:5432/app
                          depends_on: [db, redis]
                    networks:
                        frontend: {}
                        backend:
                            driver: bridge
                            ipam:
                                config:
                                    - subnet: 172.20.0.0/16
            `;

            const result = parseYamlToCTreeItem(input, 'test.yml');
            expect(result).toBeDefined();

            const complex = result?.getChild('complex');
            const services = complex?.getGrandChildren('services');
            expect(services).toHaveLength(2);

            // Test first service
            const webService = services?.[0];
            expect(webService?.getValue('name')).toBe('web');
            expect(webService?.getValue('image')).toBe('nginx:latest');

            const webPorts = webService?.getGrandChildren('ports');
            expect(webPorts).toHaveLength(2);
            expect(webPorts?.[0]?.getText()).toBe('80:80');

            // Test second service
            const apiService = services?.[1];
            expect(apiService?.getValue('name')).toBe('api');
            expect(apiService?.getChild('environment')?.getValue?.('NODE_ENV')).toBe('production');
        });
    });

    describe('Object Variations and Special Keys', () => {
        it('should handle objects with special property names', async () => {
            const input = dedent`
                special_keys:
                    "": empty_key_value
                    "123": numeric_key
                    "key-with-dashes": dashed_value
                    "key_with_underscores": underscore_value
                    "key.with.dots": dotted_value
                    "key with spaces": spaced_value
                    "UPPERCASE": upper_value
                    "mixedCase": mixed_value
                    "$pecial": dollar_value
                    "@symbol": at_value
                    "key/with/slashes": slash_value
                    "key:with:colons": colon_value
                    "key[with]brackets": bracket_value
                    "key{with}braces": brace_value
                    "key(with)parens": paren_value
            `;

            const result = parseYamlToCTreeItem(input, 'test.yml');
            expect(result).toBeDefined();

            const specialKeys = result?.getChild('special_keys');
            expect(specialKeys?.getValue('')).toBe('empty_key_value');
            expect(specialKeys?.getValue('123')).toBe('numeric_key');
            expect(specialKeys?.getValue('key-with-dashes')).toBe('dashed_value');
            expect(specialKeys?.getValue('key with spaces')).toBe('spaced_value');
            expect(specialKeys?.getValue('$pecial')).toBe('dollar_value');
            expect(specialKeys?.getValue('key:with:colons')).toBe('colon_value');
        });

        it('should handle merge keys and anchors (not supported for now)', async () => {
            const input = dedent`
                defaults: &default_config
                    timeout: 30
                    retries: 3
                    debug: false

                production:
                    <<: *default_config
                    debug: false
                    host: prod.example.com

                development:
                    <<: *default_config
                    debug: true
                    host: dev.example.com
                    timeout: 60
            `;

            const result = parseYamlToCTreeItem(input, 'test.yml');
            expect(result).toBeDefined();

            // YAML parser should handle merge keys and anchors
            const prod = result?.getChild('production');
            const dev = result?.getChild('development');

            // for now not supported
            expect(prod?.getValue('timeout')).toBeUndefined();
            expect(dev?.getValue('debug')).toBeTruthy();
            expect(dev?.getValue('host')).toBe('dev.example.com');
        });
    });

    describe('Comments and Documentation', () => {
        it('should preserve all comment types and positions', async () => {
            const input = dedent`
                # Document header comment
                # Multi-line document comment
                # with additional context

                config: # Inline comment on key
                    # Comment before key
                    database:
                        host: localhost # Inline comment on value
                        # Comment before port
                        port: 5432
                        # Comment before credentials
                        credentials:
                            username: admin # Inline username comment
                            # Comment before password
                            password: secret

                    # Comment before services section
                    services: # Services comment
                        # Comment before first service
                        - name: web # Web service comment
                          # Comment before port
                          port: 8080
                        # Comment before second service
                        - name: api
                          port: 3000 # API port comment
                    # Final comment in config

                # Final document comment
            `;

            const parser = new CTreeItemYamlParser(new CTreeItemBuilder('test.yml'));
            const result = parser.parse(input);
            expect(result).toBeDefined();

            // Verify structure is preserved
            const config = result?.getChild('config');
            expect(config?.getChild('database')?.getValue?.('host')).toBe('localhost');

            const services = config?.getGrandChildren('services');
            expect(services).toHaveLength(2);
            expect(services?.[0]?.getValue('name')).toBe('web');

            // Check that comments are preserved in output
            const yamlString = toYamlString(result!);
            expect(yamlString).toContain('# Document header comment');
            expect(yamlString).toContain('# Inline comment on key');
            expect(yamlString).toContain('# Web service comment');
        });

        it('should handle comments in complex structures', async () => {
            const input = dedent`
                # Configuration for CMSIS project
                project:
                    # Project metadata
                    name: my-project
                    version: 1.0.0

                    # Build configuration
                    build: # Build settings
                        # Compiler options
                        compiler:
                            - -Wall # Enable all warnings
                            - -O2   # Optimization level 2
                            - -g    # Debug information
                        # Linker options
                        linker:
                            script: linker.ld # Linker script path
                            map: true         # Generate map file

                    # Dependencies section
                    dependencies: # External dependencies
                        # ARM CMSIS pack
                        - pack: ARM::CMSIS@5.8.0
                          # Include path for CMSIS
                          include:
                              - CMSIS/Core/Include # Core includes
                              - CMSIS/DSP/Include  # DSP includes
            `;

            const parser = new CTreeItemYamlParser(new CTreeItemBuilder('test.yml'));
            const result = parser.parse(input);
            expect(result).toBeDefined();

            const project = result?.getChild('project');
            expect(project?.getValue('name')).toBe('my-project');

            const buildCompiler = project?.getChild('build')?.getGrandChildren('compiler');
            expect(buildCompiler).toHaveLength(3);
            expect(buildCompiler?.[0]?.getText()).toBe('-Wall');
        });
    });

    describe('Error Recovery and Malformed YAML', () => {
        it('should handle indentation errors gracefully', async () => {
            const parser = new CTreeItemYamlParser(new CTreeItemBuilder('test.yml'));
            const input = dedent`
                config:
                    database:
                host: localhost  # Wrong indentation
                        port: 5432
                    cache:
                        enabled: true
            `;

            const result = parser.parse(input);
            expect(result).toBeDefined();
            expect(parser.errors.length).toBeGreaterThan(0);

            // Should still parse what it can
            const config = result?.getChild('config');
            expect(config).toBeDefined();
        });


        it('should handle unclosed quotes and escape sequences', async () => {
            const parser = new CTreeItemYamlParser(new CTreeItemBuilder('test.yml'));
            const input = dedent`
                strings:
                    valid: "valid string"
                    unclosed: "unclosed string
                    another_valid: "another valid"
                    invalid_escape: "invalid \\z escape"
                    final_valid: "final string"
            `;

            const result = parser.parse(input);
            expect(result).toBeDefined();
            expect(parser.errors.length).toBeGreaterThan(0);
        });

        it('should handle mixed tabs and spaces', async () => {
            const parser = new CTreeItemYamlParser(new CTreeItemBuilder('test.yml'));
            // Using raw string with actual tab characters (\t) in the string for testing mixed indentation
            const inputWithTabs = 'config:\n    spaces: value1\n\ttabs: value2\n    mixed: value3';

            const result = parser.parse(inputWithTabs);
            expect(result).toBeDefined();
            // May or may not be an error depending on YAML parser implementation
            // but should handle gracefully
        });

        it('should provide meaningful error messages with line numbers', async () => {
            const parser = new CTreeItemYamlParser(new CTreeItemBuilder('test.yml'));
            const input = dedent`
                config:
                    database:
                        host: localhost
                        port: 5432
                    invalid:
                        - item1
                        - item2
                        missing_colon_here
                        - item3
                final: value
            `;

            const result = parser.parse(input);
            expect(result).toBeDefined();
            const errors = parser.errors;
            expect(errors.length).toBeGreaterThan(0);

            // Check that error includes file name and line number
            expect(errors[0]).toMatch(/test\.yml:\d+:\d+: .*/);
        });
    });

    describe('Edge Cases and Boundary Conditions', () => {
        it('should handle extremely large documents', async () => {
            let largeYaml = 'large_config:\n';

            // Generate large YAML with many keys
            for (let i = 0; i < 1000; i++) {
                largeYaml += `    key_${i}: value_${i}\n`;
            }

            largeYaml += '    nested:\n';
            for (let i = 0; i < 500; i++) {
                largeYaml += `        nested_key_${i}:\n`;
                largeYaml += `            - item_${i}_1\n`;
                largeYaml += `            - item_${i}_2\n`;
            }

            const result = parseYamlToCTreeItem(largeYaml, 'large.yml');
            expect(result).toBeDefined();

            const largeConfig = result?.getChild('large_config');
            expect(largeConfig?.getValue('key_0')).toBe('value_0');
            expect(largeConfig?.getValue('key_999')).toBe('value_999');

            const nested = largeConfig?.getChild('nested');
            expect(nested).toBeDefined();
        });

        it('should handle very long strings and complex content', async () => {
            const longString = 'x'.repeat(10000);
            const input = dedent`
                content:
                    long_string: "${longString}"
                    multiline_long: |
                        ${longString}
                        Second line with more content
                        ${longString}
                    complex_structure:
                        data: "${longString}"
                        metadata:
                            size: large
                            encoding: utf8
            `;

            const result = parseYamlToCTreeItem(input, 'test.yml');
            expect(result).toBeDefined();

            const content = result?.getChild('content');
            expect(content?.getValue('long_string')).toBe(longString);
            expect(content?.getValue('multiline_long')).toContain(longString);
        });

        it('should handle empty and whitespace-only documents', async () => {
            const emptyInputs = [
                '',
                '   \n  \n  ',
                '\t\t\n\n\t',
                '# Only comments\n# More comments\n',
            ];

            emptyInputs.forEach(input => {
                const result = parseYamlToCTreeItem(input, 'empty.yml');
                expect(result).toBeDefined();
                const kind = result?.getKind();
                expect(kind).toBe(ETreeItemKind.Undefined);
            });
        });

        it('should handle YAML directives and document markers', async () => {
            const input = dedent`
                %YAML 1.2
                %TAG ! tag:example.com,2000:app/
                ---
                config:
                    version: 1.0
                    data: test
                ...
                ---
                another_document:
                    key: value
                ...
            `;

            const result = parseYamlToCTreeItem(input, 'test.yml');
            expect(result).toBeDefined();

            // Should handle first document
            const config = result?.getChild('config');
            expect(config?.getValue('version')).toBe('1.0');
        });
    });

    describe('Integration and Stability Tests', () => {
        it('should maintain stability through multiple parse-stringify cycles', async () => {
            const complexYaml = dedent`
                # CMSIS Project Configuration
                project:
                    name: test-project
                    version: 1.0.0

                    build:
                        toolchain: GCC
                        optimization: -O2
                        defines:
                            - NDEBUG
                            - VERSION=1.0
                        include_paths:
                            - include/
                            - lib/cmsis/include/

                    components:
                        - name: CMSIS-Core
                          version: 5.6.0
                          includes: ["CMSIS/Core/Include"]
                        - name: Device-Startup
                          files:
                              - startup.s
                              - system.c

                    targets:
                        debug:
                            defines: [DEBUG, TRACE]
                            optimization: -Og
                        release:
                            defines: [RELEASE]
                            optimization: -O3
            `;

            let result = parseYamlToCTreeItem(complexYaml, 'test.yml');

            // Multiple cycles
            for (let i = 0; i < 5; i++) {
                const yamlString = toYamlString(result!);
                result = parseYamlToCTreeItem(yamlString, 'test.yml');
                expect(result).toBeDefined();

                // Verify key data is preserved
                const project = result?.getChild('project');
                expect(project?.getValue('name')).toBe('test-project');
                expect(project?.getValue('version')).toBe('1.0.0');
            }

            const finalString = toYamlString(result!);
            const finalResult = parseYamlToCTreeItem(finalString, 'test.yml');

            // Verify complex nested structure
            const components = finalResult?.getChild('project')?.getGrandChildren('components');
            expect(components).toHaveLength(2);
            expect(components?.[0]?.getValue('name')).toBe('CMSIS-Core');
        });

        it('should handle type coercion and dynamic changes', async () => {
            const input = dedent`
                dynamic:
                    value: "string_initially"
                    array: [item1, item2]
                    object:
                        key: value
            `;

            const result = parseYamlToCTreeItem(input, 'test.yml');
            expect(result).toBeDefined();

            const dynamic = result?.getChild('dynamic');
            expect(dynamic?.getValue('value')).toBe('string_initially');

            // Test dynamic type changes using fromObject
            const valueItem = dynamic?.getChild('value');
            valueItem!.fromObject(['new', 'array', 'value']);

            let yamlString = toYamlString(result!);
            const modifiedResult = parseYamlToCTreeItem(yamlString, 'test.yml');

            const newArrayItems = modifiedResult?.getChild('dynamic')?.getGrandChildren('value');
            expect(newArrayItems).toHaveLength(3);
            expect(newArrayItems?.[0]?.getText()).toBe('new');

            // Change to object
            const dynamicNew = modifiedResult?.getChild('dynamic');
            const valueItemNew = dynamicNew?.getChild('value');
            valueItemNew!.fromObject({ nested: 'object', with: { deep: 'structure' } });

            yamlString = toYamlString(modifiedResult!);
            const finalResult = parseYamlToCTreeItem(yamlString, 'test.yml');

            const nestedObj = finalResult?.getChild('dynamic')?.getChild('value');
            expect(nestedObj?.getValue('nested')).toBe('object');
            expect(nestedObj?.getChild('with')?.getValue('deep')).toBe('structure');
        });

        it('should handle real-world CMSIS configuration files', async () => {
            const cmsisConfig = dedent`
                # CMSIS Solution Configuration
                solution:
                    description: Example CMSIS solution
                    created-for: CMSIS-Toolbox@1.0.0
                    compiler: AC6

                    packs:
                        - pack: ARM::CMSIS@5.8.0
                          path: ./../packs/ARM.CMSIS.5.8.0.pack
                        - pack: Keil::STM32F4xx_DFP@2.15.0

                    target-types:
                        - type: MyTarget
                          device: STM32F407VETx
                          processor:
                              fpu: sp
                              endian: little

                    build-types:
                        - type: Debug
                          compiler: AC6
                          optimize: none
                          debug: on
                          define:
                              - DEBUG: 1
                              - USE_HAL_DRIVER
                          add-path:
                              - ./include
                              - ./drivers/include

                        - type: Release
                          optimize: speed
                          debug: off
                          define:
                              - NDEBUG
                              - USE_HAL_DRIVER: 1

                    projects:
                        - project: ./MyProject/MyProject.cproject.yml
                          for-context: +MyTarget
            `;

            const result = parseYamlToCTreeItem(cmsisConfig, 'csolution.yml');
            expect(result).toBeDefined();

            const solution = result?.getChild('solution');
            expect(solution?.getValue('description')).toBe('Example CMSIS solution');
            expect(solution?.getValue('compiler')).toBe('AC6');

            // Test packs array
            const packs = solution?.getGrandChildren('packs');
            expect(packs).toHaveLength(2);
            expect(packs?.[0]?.getValue('pack')).toBe('ARM::CMSIS@5.8.0');

            // Test target types
            const targetTypes = solution?.getGrandChildren('target-types');
            expect(targetTypes).toHaveLength(1);
            expect(targetTypes?.[0]?.getValue('device')).toBe('STM32F407VETx');

            // Test build types
            const buildTypes = solution?.getGrandChildren('build-types');
            expect(buildTypes).toHaveLength(2);

            const debugBuild = buildTypes?.[0];
            expect(debugBuild?.getValue('type')).toBe('Debug');
            expect(debugBuild?.getValue('debug')).toBe('on');

            const debugDefines = debugBuild?.getGrandChildren('define');
            expect(debugDefines).toHaveLength(2);

            // Test round-trip stability for real-world config
            const yamlString = toYamlString(result!);
            const reparsed = parseYamlToCTreeItem(yamlString, 'csolution.yml');
            expect(reparsed?.getChild('solution')?.getValue('description')).toBe('Example CMSIS solution');
        });
    });
});
