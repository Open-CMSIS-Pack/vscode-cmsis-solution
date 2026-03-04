/**
 * Copyright 2023-2026 Arm Limited
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

import 'jest';
import * as YAML from 'yaml';
import { composeParsers, defaultIfUndefined, mapParser, readMapFromMap, readOptionalMapArrayFromMap, readOptionalMapFromMap, readOptionalNumberFromMap, readOptionalSeqFromMap, readOptionalStringFromMap, readSeqFromMap, readStringFromMap, requireMap, requireNumber, requireScalar, requireSeq, requireString, tryParsers, unwrapScalar } from './yaml-file-parsing';
import { YAMLMap, YAMLSeq } from 'yaml';

const inputYaml = `
map:
  key1: value1
  key2:
    - value2
    - value3
sequence:
  - thing1
  - thing2
mixedSequence:
  - an: object
  - a string
mapSequence:
  - field1: value1
    field2: value2
  - field1: value3
    field2: value4
stringField: a string
numberField: 137
`;

const rootNode = YAML.parseDocument(inputYaml).contents as YAMLMap;

describe('YAML parsing', () => {
    describe('composeParsers', () => {
        it('runs the given parsers in turn, returning the result on success', () => {
            const result = composeParsers(
                (input: string): number => input.length,
                readStringFromMap('stringField')
            )(rootNode);

            expect(result).toBe(8);
        });

        it('throws if one of the parsers throws', () => {
            expect(() => {
                composeParsers(
                    (input: string): number => input.length,
                    readStringFromMap('map')
                )(rootNode);
            }).toThrow();
        });
    });

    describe('mapParser', () => {
        it('returns the result of applying each parser in turn to an array', () => {
            const input = (rootNode.get('sequence') as YAMLSeq).items;
            const result = mapParser(unwrapScalar)(input);
            expect(result).toEqual(['thing1', 'thing2']);
        });

        it('throws if the parser fails to parse one of the inputs', () => {
            const input = (rootNode.get('sequence') as YAMLSeq).items;
            expect(() => { mapParser(requireMap)(input); }).toThrow();
        });
    });

    describe('tryParsers', () => {
        it('returns the output if one parser could parse the input', () => {
            const result = tryParsers(
                requireString,
                readStringFromMap('stringField'),
            )(rootNode);

            expect(result).toBe('a string');
        });

        it('throws if no parsers could parse the input', () => {
            const parser = tryParsers(requireString);
            expect(() => { parser(rootNode); }).toThrow();
        });
    });

    describe('requireMap', () => {
        it('returns the input if it was a map', () => {
            const input = rootNode.get('map');
            const result = requireMap(input);
            expect(result).toEqual(input);
        });

        it('throws if the input was not a map', () => {
            const input = rootNode.get('sequence');
            expect(() => { requireMap(input); }).toThrow();
        });
    });

    describe('requireSeq', () => {
        it('returns the input items if it was a sequence', () => {
            const input = rootNode.get('sequence');
            const result = requireSeq(input);
            expect(result).toEqual(input);
        });

        it('throws if the input was not a sequence', () => {
            const input = rootNode.get('map');
            expect(() => { requireSeq(input); }).toThrow();
        });
    });

    describe('requireString', () => {
        it('returns the input if it was a string', () => {
            const input = rootNode.get('stringField');
            const result = requireString(input);
            expect(result).toEqual(input);
        });

        it('throws if the input was not a string', () => {
            const input = rootNode.get('map');
            expect(() => { requireString(input); }).toThrow();
        });
    });

    describe('requireNumber', () => {
        it('returns the input if it was a number', () => {
            const input = rootNode.get('numberField');
            const result = requireNumber(input);
            expect(result).toEqual(input);
        });

        it('throws if the input was not a number', () => {
            const input = rootNode.get('stringField');
            expect(() => { requireNumber(input); }).toThrow();
        });
    });

    describe('requireScalar', () => {
        it('returns the input if it was a scalar', () => {
            const input = rootNode.get('stringField', true);
            const result = requireScalar(input);
            expect(result).toEqual(input);
        });

        it('throws if the input was not a scalar', () => {
            const input = rootNode.get('map');
            expect(() => { requireScalar(input); }).toThrow();
        });
    });

    describe('readOptionalStringFromMap', () => {
        it('returns the string if present', () => {
            const result = readOptionalStringFromMap('stringField')(rootNode);
            expect(result).toBe('a string');
        });

        it('returns undefined if it was not present', () => {
            const result = readOptionalStringFromMap('notAField')(rootNode);
            expect(result).toBeUndefined();
        });

        it('throws if the value was not a string', () => {
            expect(() => { readOptionalStringFromMap('map')(rootNode); }).toThrow();
        });
    });

    describe('readStringFromMap', () => {
        it('returns the string if present', () => {
            const result = readStringFromMap('stringField')(rootNode);
            expect(result).toBe('a string');
        });

        it('throws if it was not present', () => {
            expect(() => { readStringFromMap('notAField')(rootNode); }).toThrow();
        });

        it('throws if the value was not a string', () => {
            expect(() => { readStringFromMap('map')(rootNode); }).toThrow();
        });
    });

    describe('readOptionalNumberFromMap', () => {
        it('returns the number if present', () => {
            const result = readOptionalNumberFromMap('numberField')(rootNode);
            expect(result).toBe(137);
        });

        it('returns undefined if number was not present', () => {
            const result = readOptionalNumberFromMap('notAField')(rootNode);
            expect(result).toBeUndefined();
        });

        it('throws if the value was not a number', () => {
            expect(() => { readOptionalNumberFromMap('stringField')(rootNode); }).toThrow();
        });
    });

    describe('readOptionalMapFromMap', () => {
        it('returns the map if present', () => {
            const result = readOptionalMapFromMap('map')(rootNode);
            expect(result).toEqual(rootNode.get('map'));
        });

        it('returns undefined if it was not present', () => {
            const result = readOptionalMapFromMap('notAField')(rootNode);
            expect(result).toBeUndefined();
        });

        it('throws if the value was not a map', () => {
            expect(() => { readOptionalMapFromMap('stringField')(rootNode); }).toThrow();
        });
    });

    describe('readMapFromMap', () => {
        it('returns the map if present', () => {
            const result = readMapFromMap('map')(rootNode);
            expect(result).toEqual(rootNode.get('map'));
        });

        it('throws if it was not present', () => {
            expect(() => { readMapFromMap('notAField')(rootNode); }).toThrow();
        });

        it('throws if the value was not a map', () => {
            expect(() => { readMapFromMap('stringField')(rootNode); }).toThrow();
        });
    });

    describe('readOptionalSeqFromMap', () => {
        it('returns the sequence items if present', () => {
            const result = readOptionalSeqFromMap('sequence')(rootNode);
            expect(result).toEqual(rootNode.get('sequence') as YAMLSeq);
        });

        it('returns undefined if it was not present', () => {
            const result = readOptionalSeqFromMap('notAField')(rootNode);
            expect(result).toBeUndefined();
        });

        it('throws if the value was not a map', () => {
            expect(() => { readOptionalSeqFromMap('stringField')(rootNode); }).toThrow();
        });
    });

    describe('readSeqFromMap', () => {
        it('returns the sequence if present', () => {
            const result = readSeqFromMap('sequence')(rootNode);
            expect(result).toEqual(rootNode.get('sequence') as YAMLSeq);
        });

        it('throws if it was not present', () => {
            expect(() => { readSeqFromMap('notAField')(rootNode); }).toThrow();
        });

        it('throws if the value was not a map', () => {
            expect(() => { readSeqFromMap('stringField')(rootNode); }).toThrow();
        });
    });

    describe('defaultIfUndefined', () => {
        it('returns the default if the input was undefined', () => {
            const defaultValue = 'the_default';
            const output = defaultIfUndefined(defaultValue, (input: { name: string }) => input.name)(undefined);
            expect(output).toBe(defaultValue);
        });

        it('returns the output of the wrapped parser if the input was not undefined', () => {
            const output = defaultIfUndefined('the_default', (input: { name: string }) => input.name)({ name: 'Fred' });
            expect(output).toBe('Fred');
        });
    });

    describe('readOptionalMapArrayFromMap', () => {
        it('returns empty if the input does not have the given key', () => {
            const output = readOptionalMapArrayFromMap('notThere')(rootNode);
            expect(output).toEqual([]);
        });

        it('throws if the key value is not a sequence', () => {
            const parser = readOptionalMapArrayFromMap('stringField');
            expect(() => parser(rootNode)).toThrow();
        });

        it('throws if one of the items was not a map', () => {
            const parser = readOptionalMapArrayFromMap('mixedSequence');
            expect(() => parser(rootNode)).toThrow();
        });

        it('returns the array of maps', () => {
            const output = readOptionalMapArrayFromMap('mapSequence')(rootNode);
            const sequence = rootNode.get('mapSequence') as YAMLSeq;
            expect(output).toEqual([
                sequence.get(0),
                sequence.get(1),
            ]);
        });
    });
});
