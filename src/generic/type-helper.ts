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

/**
 * Recursively beautifies a type by applying the same transformation to all nested properties.
 * @template T - The type to beautify.
 */
export type Beautify<T> = T extends object ? {
  [K in keyof T]: Beautify<T[K]>;
} : T;

/**
 * Makes a type optional.
 * @template T - The type to make optional.
 */
export type Optional<T> = T | undefined;

/**
 * Makes a type nullable.
 * @template T - The type to make nullable.
 */
export type Nullable<T> = T | null;

/**
 * Infers the type of an array element.
 * @template T - The array type to infer from.
 */
export type ArrayElement<T extends Optional<Nullable<unknown[]>>> = T extends (infer U)[] ? U : never;

/**
 * Checks if two types are equal.
 * @template A - The first type to compare.
 * @template B - The second type to compare.
 * @returns true if the types are equal, false otherwise.
 */
export type Equal<A, B> =
    (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2)
        ? true
        : false;

/**
 * Checks for true type
 * @template T - The type to check.
 */
export type Expect<T extends true> = T;

/**
 * Adds the partial modified (?) to all properties accepting undefined.
 * @template T - The type to modify.
 */
export type PartialIfUndefined<T> = Beautify<{
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
}>;
