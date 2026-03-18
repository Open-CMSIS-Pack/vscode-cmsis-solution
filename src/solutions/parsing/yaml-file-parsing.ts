/**
 * Copyright 2023-2026 Arm Limited
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

import * as YAML from 'yaml';
import { Scalar, YAMLMap, YAMLSeq } from 'yaml';

export type Parser<I, O> = (input: I) => O;

/**
 * Add context to the error thrown by the wrapped parser.
 */
const wrapException = <I, O>(message: string, parser: Parser<I, O>): Parser<I, O> => input => {
    try {
        return parser(input);
    } catch (error) {
        throw new Error(`${(error as Error | undefined)?.message} ${message}`);
    }
};

/**
 * Given a parser that accepts undefined values, return a parser that throws on undefined.
 */
const readRequired = <I, O>(readOptional: Parser<I, O | undefined>): Parser<I, O> => input => {
    const value = readOptional(input);

    if (value === undefined) {
        throw new Error('Required value was not present');
    }

    return value;
};

/**
 * Given a parser that reads an optional field from a map, return a parser that throws on undefined.
 */
const readRequiredFromMap = <A>(
    readOptional: (key: string) => Parser<YAMLMap, A | undefined>
) => (key: string): Parser<YAMLMap, A> => wrapException(`while reading ${key}`, readRequired(readOptional(key)));

/**
 * Attempt to read a field from a map and check it has a certain type. Throw if it was not that type.
 * @param valueParser Function to check the type
 * @param errorMessage An error message to throw if the field was not the correct type
 */
const readOptionalFieldFromMap = <A>(valueParser: Parser<unknown, A>) => (key: string): Parser<YAMLMap, A | undefined> => map => {
    const value = map.get(key, false);

    if (value === undefined) {
        return undefined;
    }

    return valueParser(value);
};

/**
 * Compose two parsers together: first apply parser1, then apply parser2, returning the result of the second parser.
 */
export const composeParsers = <I, A, O>(parser2: Parser<A, O>, parser1: Parser<I, A>): Parser<I, O> => input => parser2(parser1(input));

/**
 * Returns a parser that runs the given parser on each of the items in the array in turn.
 */
export const mapParser = <I, O>(parser: Parser<I, O>): Parser<I[], O[]> => inputs => inputs.map(parser);

/**
 * Try each of the given parsers in turn. If one succeeds, return the output. Otherwise throw.
 */
export const tryParsers = <I, O>(...parsers: Parser<I, O>[]): Parser<I, O> => input => {
    let caught: unknown;

    for (const parser of parsers) {
        try {
            return parser(input);
        } catch (error) {
            caught = error;
        }
    }

    throw caught;
};

/**
 * Attempt to read an array field from a map. Throw if it was not present.
 */
export const requireSeq = (item: unknown): YAMLSeq => {
    if (!YAML.isSeq(item)) {
        throw new Error('Item was not a sequence');
    }

    return item;
};

/**
 * Ensure the input is a map. Throw otherwise.
 */
export const requireMap: Parser<unknown, YAMLMap> = item => {
    if (!YAML.isMap(item)) {
        throw new Error('Item was not a map');
    }

    return item;
};

export const requireString: Parser<unknown, string> = item => {
    if (typeof item !== 'string') {
        throw new Error('Item was not a string');
    }

    return item;
};

export const requireNumber: Parser<unknown, number> = item => {
    if (typeof item !== 'number') {
        throw new Error('Item was not a number');
    }

    return item;
};

/**
 * Ensure the input is a Scalar. Throw otherwise.
 */
export const requireScalar: Parser<unknown, Scalar<unknown>> = item => {
    if (!YAML.isScalar(item)) {
        throw new Error('Item was not a scalar');
    }

    return item;
};

/**
 * Pick the value from a Scalar. If the input is not a Scalar, throw.
 */
export const unwrapScalar: Parser<unknown, unknown> = composeParsers(scalar => scalar.value, requireScalar);

/**
 * Attempt to read a string field from a map. Return undefined if it was not present.
 */
export const readOptionalStringFromMap: (key: string) => Parser<YAMLMap, string | undefined> = readOptionalFieldFromMap(requireString);

/**
 * Attempt to read a string field from a map. Throw if it was not present.
 */
export const readStringFromMap: (key: string) => Parser<YAMLMap, string> = readRequiredFromMap(readOptionalStringFromMap);

/**
 * Attempt to read a number field from a map. Return undefined if it was not present.
 */
export const readOptionalNumberFromMap: (key: string) => Parser<YAMLMap, number | undefined> = readOptionalFieldFromMap(requireNumber);

/**
 * Attempt to read a map field from a map. Return undefined if it was not present.
 */
export const readOptionalMapFromMap: (key: string) => Parser<YAMLMap, YAMLMap | undefined> = readOptionalFieldFromMap(requireMap);

/**
 * Attempt to read a map field from a map. Throw if it was not present.
 */
export const readMapFromMap: (key: string) => Parser<YAMLMap, YAMLMap> = readRequiredFromMap(readOptionalMapFromMap);

/**
 * Attempt to read an array field from a map. Return undefined if it was not present.
 */
export const readOptionalSeqFromMap: (key: string) => Parser<YAMLMap, YAMLSeq | undefined> = readOptionalFieldFromMap(requireSeq);

/**
 * Attempt to read an array field from a map. Return undefined if it was not present.
 */
export const readSeqFromMap: (key: string) => Parser<YAMLMap, YAMLSeq> = readRequiredFromMap(readOptionalSeqFromMap);

/**
 * Wraps the given parser, returning the default if the input is undefined.
 */
export const defaultIfUndefined = <I, O>(theDefault: O, parser: Parser<I, O>): Parser<I | undefined, O> => input => input === undefined ? theDefault : parser(input);

/**
 * Read the items from a YAMLSeq.
 */
export const readItemsFromSeq = (seq: YAMLSeq): unknown[] => seq.items;

/**
 * Read an array of maps from a key in a map. Returns empty array if the key was undefined.
 */
export const readOptionalMapArrayFromMap: (key: string) => Parser<YAMLMap, YAMLMap[]> = key => composeParsers(
    mapParser(requireMap),
    composeParsers(defaultIfUndefined([], readItemsFromSeq), readOptionalSeqFromMap(key)),
);

const undefinedToEmptyArray = <A>(input: unknown): A[] => {
    if (input === undefined) {
        return [];
    }
    throw new Error('Input was not undefined');
};

const pickItems = (seq: YAMLSeq): unknown [] => seq.items;

export const readOptionalStringList: Parser<unknown, string[]> = tryParsers(
    // A missing value is equivalent to the empty array
    undefinedToEmptyArray<string>,
    // If the data is a sequence, each item must be a string
    composeParsers(mapParser(composeParsers(requireString, unwrapScalar)), composeParsers(pickItems, requireSeq)),
);

/**
 * Attempt to read a field from a map and return a string literal or sequence of strings.
 */
export const readOptionalStringOrStringList: Parser<unknown, string[] | string> = tryParsers<unknown, string[] | string>(
    // If the data is an array of strings, return the array
    readOptionalStringList,
    // If the data is a string, return the string
    requireString,
);
