/**
 * Copyright 2025-2026 Arm Limited
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

import { PartialIfUndefined } from './type-helper';

/**
 * Primitive type check function
 * @template T - The expected type
 * @param value - The value to check
 * @returns true if the value is of the expected type, false otherwise
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PrimitiveCheck<T = any> = (value: unknown) => value is T;

/** Optional-type value wrapper */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OptionalWrapper<T = any> = {
    kind: 'optional';
    validator: T;
};

/** Nullable-type value wrapper */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NullableWrapper<T = any> = {
    kind: 'nullable';
    validator: T;
};

/** Array-type value wrapper */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ArrayWrapper<T = any> = {
    kind: 'array';
    validator: T;
};

/** Union-type value wrapper */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnionWrapper<V extends readonly SchemaEntry[] = readonly any[]> = {
    kind: 'union';
    validators: V;
};

/** Single Schema element */
export type SchemaEntry =
    | PrimitiveCheck
    | OptionalWrapper
    | NullableWrapper
    | ArrayWrapper
    | UnionWrapper
    | SchemaDef
    | Schema<SchemaDef>
    ;

/**
 * Schema definition object
 * The schema associates each property name with a primitive value validator
 * function or a complex value wrapper.
 */
export type SchemaDef = {
    [key: string]: SchemaEntry;
};

/**
 * Optional-type value wrapper constructor
 * @param validator Schema entry for the optional value
 * @returns Optional value wrapper
 */
export function optional<T extends SchemaEntry>(validator: T): OptionalWrapper<T> {
    return { kind: 'optional', validator };
}

/**
 * Nullable-type value wrapper constructor
 * @param validator Schema entry for the nullable value
 * @returns Nullable value wrapper
 */
export function nullable<T extends SchemaEntry>(validator: T): NullableWrapper<T> {
    return { kind: 'nullable', validator };
}

/**
 * Array-type value wrapper constructor
 * @param validator Schema entry for all array values
 * @returns Array-type value wrapper
 */
export function arrayOf<T extends SchemaEntry>(validator: T): ArrayWrapper<T> {
    return { kind: 'array', validator };
}

/**
 * Union-type value wrapper constructor
 * @param validators
 * @returns Array-type value wrapper
 */
export function unionOf<const V extends readonly SchemaEntry[]>(...validators: V): UnionWrapper<V> {
    return { kind: 'union', validators };
}

/**
 * Infers the recursive type of a schema or schema entry
 * @template T - The schema or schema entry
 * @returns The inferred (object) type
 */
export type InferType<T> =
    T extends PrimitiveCheck<infer P> ? P :
    T extends ArrayWrapper<infer V> ? InferType<V>[] :
    T extends OptionalWrapper<infer V> ? InferType<V> | undefined :
    T extends NullableWrapper<infer V> ? InferType<V> | null :
    T extends UnionWrapper<infer V> ? InferUnion<V> :
    T extends SchemaDef ? PartialIfUndefined<{ [K in keyof T]: InferType<T[K]> }> :
    T extends Schema<infer S> ? InferType<S> :
    never;

/**
 * Helper to infer union types
 * @template T - An array of schema entries to unionize
 * @returns The union of the inferred types of the schema entries
 */
export type InferUnion<T extends readonly SchemaEntry[]> =
    T extends readonly [infer First, ...infer Rest]
    ? InferType<First> | InferUnion<Rest extends readonly SchemaEntry[] ? Rest : []>
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPrimitiveCheck(entry: SchemaEntry): entry is PrimitiveCheck<any> {
    return typeof entry === 'function';
}

function isOptional(entry: SchemaEntry): entry is OptionalWrapper {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof entry === 'object' && entry !== null && (entry as any).kind === 'optional';
}

function isNullable(entry: SchemaEntry): entry is NullableWrapper {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof entry === 'object' && entry !== null && (entry as any).kind === 'nullable';
}

function isArray(entry: SchemaEntry): entry is ArrayWrapper {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof entry === 'object' && entry !== null && (entry as any).kind === 'array';
}

function isUnion(entry: SchemaEntry): entry is UnionWrapper<readonly SchemaEntry[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof entry === 'object' && entry !== null && (entry as any).kind === 'union';
}

function isSchemaDef(entry: SchemaEntry): entry is SchemaDef {
    return typeof entry === 'object' && entry !== null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        && !(entry as any).kind && !(entry as any).definition;
}

function isSchema(entry: SchemaEntry): entry is Schema<SchemaDef> {
    return typeof entry === 'object' && entry !== null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        && !(entry as any).kind && (entry as any).definition;
}

function isOfType<T extends SchemaDef>(value: unknown, schema: T, element?: string[], msgs?: string[]): value is InferType<T> {
    if (typeof value !== 'object' || value === null) return false;

    let result = true;

    for (const key in schema) {
        const validator = schema[key];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = (value as any)[key];
        result = validateEntry(val, validator, element?.concat([key]), msgs) && result;
    }

    return result;
}

function validationResult(value: unknown, result: boolean, element?: string[], msgs?: string[]) {
    if (!result && element) {
        if (msgs) {
            msgs.push(`Validation failed for ${element.join('.')}: ${value}`);
        } else {
            console.error(`Validation failed for ${element.join('.')}:`, value);
        }
    }
    return result;
}

function validateEntry(value: unknown, entry: SchemaEntry, element?: string[], msgs?: string[]): boolean {
    if (isPrimitiveCheck(entry)) return validationResult(value, entry(value), element, msgs);
    if (isOptional(entry)) return value === undefined || validateEntry(value, entry.validator, element, msgs);
    if (isNullable(entry)) return value === null || validateEntry(value, entry.validator, element, msgs);
    if (isArray(entry)) return Array.isArray(value) && value.every((v, i) => validateEntry(v, entry.validator, element?.concat(i.toString()), msgs));
    if (isUnion(entry)) {
        const submsgs: string[] = [];
        const result = entry.validators.some(validator => validateEntry(value, validator, element, submsgs));
        if (!result) {
            if (msgs) {
                msgs.push(...submsgs);
            } else {
                console.error(submsgs.join('\n'));
            }
        }
        return validationResult(value, result, element, msgs);
    }
    if (isSchemaDef(entry)) return isOfType(value, entry, element, msgs);
    if (isSchema(entry)) return isOfType(value, entry.definition, element, msgs);
    return false;
}

/** Primitive type checker for string values */
export const string = (value: unknown): value is string => typeof value === 'string';

/** Primitive type checker for number values */
export const number = (value: unknown): value is number => typeof value === 'number';

/** Primitive type checker for boolean values */
export const boolean = (value: unknown): value is boolean => typeof value === 'boolean';

/** Primitive type checker for object values */
export const object = (value: unknown): value is object => typeof value === 'object' && value !== null;

/** Primitive type checker for array values */
export const array = (value: unknown): value is unknown[] => Array.isArray(value);

/** Primitive type checker for unknown values */
export const unknown = (value: unknown): value is unknown => value !== null;

/**
 * Schema capsule for validation and type assertion.
 * @template T - The schema definition type
 */
export class Schema<T extends SchemaDef> {
    /**
     * Creates a new schema instance.
     * @param definition - The schema definition
     */
    constructor(public readonly definition: T) { }

    /**
     * Validate a given unknown value against the schema.
     * @param value - The value to validate
     * @returns true if the value is valid according to the schema, false otherwise
     */
    public validate(value: unknown): value is InferType<T> {
        return validateEntry(value, this.definition, []);
    }

    /**
     * Type assertion method to ensure the value conforms to the schema.
     * @param value - The value to assert
     * @throws Error if the value does not conform to the schema
     */
    protected assert(value: unknown): asserts value is InferType<T> {
        const msgs: string[] = [];
        if (!validateEntry(value, this.definition, [], msgs)) {
            throw new Error(`Validation caused errors:\n${msgs.join('\n')}`);
        }
    }

    /**
     * Parse a given unknown value and return it if it conforms to the schema.
     * @param value - The value to parse
     * @returns The value if it conforms to the schema
     * @throws Error if the value does not conform to the schema
     */
    public parse(value: unknown): InferType<T> {
        this.assert(value);
        return value;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assureProperty<T extends object, K extends keyof any, V>(obj: T, key: K, predicate: PrimitiveCheck<V>, defaultValue: V) : asserts obj is T & Record<K, V> {
    if (!predicate(obj[key as unknown as keyof T])) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (obj as any)[key] = defaultValue;
    }
}
