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

import { SimpleJsonParser, SimpleYamlParser, ITextParser } from './text-parser';

describe('SimpleJsonParser', () => {
    let parser: ITextParser;

    beforeEach(() => {
        parser = new SimpleJsonParser();
    });

    it('parses valid JSON string', () => {
        const json = '{\n    "a": 1,\n    "b": 2\n}';
        const result = parser.parse(json);
        expect(result).toEqual({ a: 1, b: 2 });
        const text = parser.stringify(result);
        expect(text).toEqual(json);
        parser = new SimpleYamlParser();
        const yaml = parser.stringify(result);
        const result1 = parser.parse(yaml);
        expect(result1).toEqual(result);

    });

    it('parses valid JSON string with comment', () => {
        const json = '{"a":1,//this is a comment\n"b":2}';
        expect(parser.parse(json)).toEqual({ a: 1, b: 2 });
    });

    it('returns undefined for invalid JSON', () => {
        const invalidJson = '{a:1,}';
        const result = parser.parse(invalidJson);
        expect(result).toEqual({});
        expect(parser.errors.length).toBeGreaterThan(0);
    });

    it('stringifies object to JSON', () => {
        const obj = { foo: 'bar', num: 42 };
        expect(parser.stringify(obj)).toBe(JSON.stringify(obj, null, 4));
    });

    it('stringifies undefined to empty string', () => {
        expect(parser.stringify(undefined)).toBe('');
    });
});

describe('SimpleYamlParser', () => {
    let parser: ITextParser;

    beforeEach(() => {
        parser = new SimpleYamlParser();
    });

    it('parses valid YAML string', () => {
        const yaml = 'a: 1\nb: 2\n';
        const result = parser.parse(yaml);
        expect(result).toEqual({ a: 1, b: 2 });
        const text = parser.stringify(result);
        expect(text).toEqual(yaml);
        parser = new SimpleJsonParser();
        const json = parser.stringify(result);
        const result1 = parser.parse(json);
        expect(result1).toEqual(result);
    });

    it('returns undefined for invalid YAML', () => {
        const invalidYaml = 'a: 1\nb';
        const result = parser.parse(invalidYaml);
        expect(result).toEqual({});
        expect(parser.errors.length).toBeGreaterThan(0);
    });

    it('stringifies object to YAML', () => {
        const obj = { foo: 'bar', num: 42 };
        const yaml = parser.stringify(obj);
        expect(yaml).toContain('foo: bar');
        expect(yaml).toContain('num: 42');
    });

    it('stringifies undefined to empty string', () => {
        expect(parser.stringify(undefined)).toBe('');
    });
});
