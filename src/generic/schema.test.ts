/**
 * Copyright 2025-2026 Arm Limited
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

import { Schema, arrayOf, optional, unionOf, string, number, boolean, unknown, InferType, object, array, nullable, assureProperty } from './schema';
import { Expect, Equal } from './type-helper';

export let result: boolean;

describe('Schema', () => {
    const originalConsoleError = console.error;
    // Disable error logging
    beforeAll(() => { console.error = () => { }; });

    // Restore original console.error
    afterAll(() => { console.error = originalConsoleError; });

    describe('type inference', () => {

        describe('infers number type', () => {
            const schema = {
                aNumber: number,
            };

            type ExpectedType = {
                aNumber: number;
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers string type', () => {
            const schema = {
                aString: string,
            };

            type ExpectedType = {
                aString: string;
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers boolean type', () => {
            const schema = {
                aBool: boolean,
            };

            type ExpectedType = {
                aBool: boolean;
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers unknown type', () => {
            const schema = {
                anything: unknown,
            };

            type ExpectedType = {
                anything?: unknown;
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers optional primitive types', () => {
            const schema = {
                aNumber: optional(number),
                aString: optional(string),
                aBool: optional(boolean),
                anything: optional(unknown),
            };

            type ExpectedType = {
                aNumber?: number;
                aString?: string;
                aBool?: boolean;
                anything?: unknown;
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers nullable primitive types', () => {
            const schema = {
                aNumber: nullable(number),
                aString: nullable(string),
                aBool: nullable(boolean),
                anything: nullable(unknown),
            };

            type ExpectedType = {
                aNumber: number | null;
                aString: string | null;
                aBool: boolean | null;
                anything?: unknown;
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers optional nullable primitive types', () => {
            const schema = {
                aNumber: optional(nullable(number)),
                aString: optional(nullable(string)),
                aBool: optional(nullable(boolean)),
                anything: optional(nullable(unknown)),
            };

            type ExpectedType = {
                aNumber?: number | null;
                aString?: string | null;
                aBool?: boolean | null;
                anything?: unknown;
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers object type', () => {
            const schema = {
                anObject: object
            };

            type ExpectedType = {
                anObject: object;
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers array type', () => {
            const schema = {
                anArray: array
            };

            type ExpectedType = {
                anArray: unknown[];
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers arrays of primitive types', () => {
            const schema = {
                aStringArray: arrayOf(string),
                aNumberArray: arrayOf(number),
                aBoolArray: arrayOf(boolean),
                anythingArray: arrayOf(unknown),
            };

            type ExpectedType = {
                aStringArray: string[],
                aNumberArray: number[],
                aBoolArray: boolean[],

                anythingArray: unknown[],
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers nested objects', () => {
            const schema = {
                person: {
                    name: string,
                    age: number,
                },
            };

            type ExpectedType = {
                person: {
                    name: string;
                    age: number;
                };
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers array of objects', () => {
            const schema = {
                persons: arrayOf({
                    name: string,
                    age: number,
                }),
            };

            type ExpectedType = {
                persons: {
                    name: string;
                    age: number;
                }[];
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers optional nested object types', () => {
            const schema = {
                person: optional({
                    name: string,
                    age: number,
                }),
            };

            type ExpectedType = {
                person?: {
                    name: string;
                    age: number;
                };
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers optional array of objects', () => {
            const schema = {
                persons: optional(arrayOf({
                    name: string,
                    age: number,
                })),
            };

            type ExpectedType = {
                persons?: {
                    name: string;
                    age: number;
                }[];
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers union of primitive types', () => {
            const schema = {
                aStringOrNumber: unionOf(string, number),
            };

            type ExpectedType = {
                aStringOrNumber: string | number;
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers union of complex types', () => {
            const subschema = {
                name: string,
                age: number,
            };
            const schema = {
                anObjectOrArray: unionOf(subschema, arrayOf(subschema)),
            };

            type ExpectedType = {
                anObjectOrArray: InferType<typeof subschema> | InferType<typeof subschema>[];
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers optional array of union type', () => {
            const subschema = {
                name: string,
                age: number,
            };
            const schema = {
                anObjectOrArray: optional(arrayOf(unionOf(subschema, object))),
            };

            type ExpectedType = {
                anObjectOrArray?: (InferType<typeof subschema> | object)[];
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });

        describe('infers type of an encapsulated schema', () => {
            const subschema = new Schema({
                name: string,
                age: number,
            });
            const schema = new Schema({
                anObjectOrArray: optional(arrayOf(unionOf(subschema, object))),
            });

            type ExpectedType = {
                anObjectOrArray?: (InferType<typeof subschema> | object)[];
            };
            type InferredType = InferType<typeof schema>;

            type Test = Expect<Equal<InferredType, ExpectedType>>;

            result = schema as unknown as Test;
        });
    });

    describe('validate', () => {

        it('should validate a simple schema', () => {
            const schema = new Schema({
                name: string,
                age: number,
            });

            const obj = { name: 'John', age: 30 };
            expect(schema.validate(obj)).toBeTruthy();
        });

        it('should fail on type error', () => {
            const schema = new Schema({
                name: string,
                age: number,
            });

            const obj = { name: 'John', age: '30' };
            expect(schema.validate(obj)).toBeFalsy();
        });


        it('should validate nested schema', () => {
            const schema = new Schema({
                person: {
                    name: string,
                    age: number,
                },
            });

            const obj = { person: { name: 'John', age: 30 } };
            expect(schema.validate(obj)).toBeTruthy();
        });

        it('should fail on nested type error', () => {
            const schema = new Schema({
                person: {
                    name: string,
                    age: number,
                },
            });

            const obj = { person: { name: 'John', age: '30' } };
            expect(schema.validate(obj)).toBeFalsy();
        });

        it('should validate arrays', () => {
            const schema = new Schema({
                names: arrayOf(string),
            });

            const obj = { names: ['John', 'Jane'] };
            expect(schema.validate(obj)).toBeTruthy();
        });

        it('should validate array of arrays', () => {
            const schema = new Schema({
                names: arrayOf(arrayOf(string)),
            });

            const obj = { names: [['John', 'Jane'], ['Doe', 'Foo', 'Bar']] };
            expect(schema.validate(obj)).toBeTruthy();
        });

        it('should fail on array type error', () => {
            const schema = new Schema({
                names: arrayOf(string),
            });

            const obj = { names: ['John', 31] };
            expect(schema.validate(obj)).toBeFalsy();
        });

        it('should validate missing optional properties', () => {
            const schema = new Schema({
                name: string,
                age: number,
                address: optional(string),
            });

            const obj = { name: 'John', age: 30 };
            expect(schema.validate(obj)).toBeTruthy();
        });

        it('should validate undefined optional properties', () => {
            const schema = new Schema({
                name: string,
                age: number,
                address: optional(string),
            });

            const obj = { name: 'John', age: 30, address: undefined };
            expect(schema.validate(obj)).toBeTruthy();
        });

        it('should validate valid optional properties', () => {
            const schema = new Schema({
                name: string,
                age: number,
                address: optional(string),
            });

            const obj = { name: 'John', age: 30, address: '123 Main St' };
            expect(schema.validate(obj)).toBeTruthy();
        });

        it('should fail on invalid optional properties', () => {
            const schema = new Schema({
                name: string,
                age: number,
                address: optional(string),
            });

            const obj = { name: 'John', age: 30, address: false };
            expect(schema.validate(obj)).toBeFalsy();
        });

        it('should validate nullable properties', () => {
            const schema = new Schema({
                name: string,
                age: number,
                address: nullable(string),
            });

            const obj = { name: 'John', age: 30, address: '123 Main St' };
            expect(schema.validate(obj)).toBeTruthy();
        });

        it('should validate nullable null-properties', () => {
            const schema = new Schema({
                name: string,
                age: number,
                address: nullable(string),
            });

            const obj = { name: 'John', age: 30, address: null };
            expect(schema.validate(obj)).toBeTruthy();
        });

        it('should validate undefined optional nullable properties', () => {
            const schema = new Schema({
                name: string,
                age: number,
                address: optional(nullable(string)),
            });

            const obj = { name: 'John', age: 30 };
            expect(schema.validate(obj)).toBeTruthy();
        });

        it('should fail on invalid nullable properties', () => {
            const schema = new Schema({
                name: string,
                age: number,
                address: nullable(string),
            });

            const obj = { name: 'John', age: 30, address: 123 };
            expect(schema.validate(obj)).toBeFalsy();
        });

        it('should validate union types', () => {
            const schema = new Schema({
                value: unionOf(string, number),
            });

            const obj1 = { value: 42 };
            expect(schema.validate(obj1)).toBeTruthy();

            const obj2 = { value: '42' };
            expect(schema.validate(obj2)).toBeTruthy();
        });

        it('should fail on invalid union types', () => {
            const schema = new Schema({
                value: unionOf(string, number),
            });

            const obj = { value: true };
            expect(schema.validate(obj)).toBeFalsy();
        });

        it('it should validate additional properties of type object', () => {
            const schema = new Schema({
                name: string,
                config: object,
            });

            const obj = { name: 'John', config: { key: 'value' }, extra: { key: 'value2' } };
            expect(schema.validate(obj)).toBeTruthy();
        });

    });

    describe('parse', () => {

        it('should parse a simple schema', () => {
            const schema = new Schema({
                name: string,
                age: number,
                value: unionOf(string, number),
            });

            const obj = JSON.parse('{"name": "John", "age": 30, "value": 42}');
            const parsed = schema.parse(obj);
            expect(parsed.name).toEqual('John');
            expect(parsed.age).toEqual(30);
            expect(parsed.value).toEqual(42);
        });

        it('should parse a sub-schema', () => {

            const subschema = new Schema({
                street: string,
                city: string,
                zipcode: number,
            });

            const schema = new Schema({
                name: string,
                age: number,
                address: subschema,
            });

            const obj = JSON.parse('{"name": "John", "age": 30, "address": {"street": "123 Main St", "city": "Anytown", "zipcode": 12345}}');
            const parsed = schema.parse(obj);
            expect(parsed.name).toEqual('John');
            expect(parsed.age).toEqual(30);
            expect(parsed.address.street).toEqual('123 Main St');
            expect(parsed.address.city).toEqual('Anytown');
            expect(parsed.address.zipcode).toEqual(12345);
        });


    });
});

describe('assureProperty', () => {
    it('should pass if property is valid', () => {
        const obj: { key?: string } = { key: 'value' };
        const predicate = (value: unknown): value is string => typeof value === 'string';
        const defaultValue = 'default';

        assureProperty(obj, 'key', predicate, defaultValue);

        expect(obj.key).toBe('value');
    });

    it('should set default value if property is missing', () => {
        const obj: { key?: string } = {};
        const defaultValue = 'default';
        const predicate = (value: unknown): value is string => typeof value === 'string';

        assureProperty(obj, 'key', predicate, defaultValue);

        expect(obj.key).toBe(defaultValue);
    });
});
