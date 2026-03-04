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

import { Event, EventEmitter } from 'vscode';

type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
}

type Factory<T> = (options?: Partial<T>) => Mutable<T>;

type Initializer<T, B> = {
    [P in Exclude<keyof T, keyof B>]: (result: Partial<T>) => T[P];
};

export type StubEvents<T, S extends string = 'Emitter'> = {
    [P in keyof T as T[P] extends Event<unknown> ? `${string & P}${S}` : never]: T[P] extends Event<infer U> ? EventEmitter<U> : never
} & T;

//export function makeFactory<T extends B, B extends object = object>(initializer: Initializer<T, B>): Factory<T>;
export function makeFactory<T extends object>(initializer: Initializer<T, object>): Factory<T>;
export function makeFactory<T extends B, B extends object>(initializer: Initializer<T, B>, baseFactory: object extends B ? never : Factory<B>): Factory<T>;
export function makeFactory<T extends B, B extends object = object>(initializer: Initializer<T, B>, baseFactory?: Factory<B>): Factory<T> {
    const factory = (options?: Partial<T>) => {
        const base = baseFactory?.(options) ?? {} as Mutable<B>;
        const result = { ...options, ...base } as Mutable<T>;
        for (const k in initializer) {
            const key = k as Exclude<keyof T, keyof B>;
            if (!(key in result)) {
                result[key] = initializer[key].call(result, result);
            }
        }
        return result;
    };
    return factory;
}

export function makeGenerator<T>(factory: Factory<T>) {
    return (count: number = 1, options?: Partial<T>): T[] => {
        return [...Array(count)].map(_ => factory(options));
    };
}
