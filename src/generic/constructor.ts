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
 * Generic Constructor Type
 * @template T - The constructor type
 * @template I - The instance (interface) type
 */
export type Constructor<T extends new (...args: ConstructorParameters<T>) => I, I = T> = new (...args: ConstructorParameters<T>) => I;

/**
 * Generic Constructor extractor
 *
 * @template T - The constructor type
 * @template I - The instance (interface) type
 * @param ctor - The class to extract constructor from
 * @returns The constructor type
 *
 * @example
 * ```ts
 * interface MyInterface {}
 * class MyClass implements MyInterface {}
 * const MyInterface = constructor<typeof MyClass, MyInterface>(MyClass);
 * const myInstance: MyInterface = new MyInterface();
 * ```
 */
export function constructor<T extends Constructor<T, I>, I>(ctor: T): Constructor<T, I> {
    return ctor;
}
