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
 * Generic factory pattern utility for creating interface-based exports
 * while hiding concrete implementation classes.
 *
 * @template T - The interface type that consumers will use
 * @template TImpl - The concrete implementation class type
 * Usage example:
 * ```typescript
 * type MyInterfaceConstructor = InterfaceFactory<MyInterface, typeof MyImplementation>;
 * export const MyInterface: MyInterfaceConstructor = MyImplementation;
 * ```
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InterfaceFactory<T, TImpl extends new (...args: any[]) => T> = TImpl;

/**
 * Creates a factory function that exports a class through an interface
 * while hiding the concrete implementation.
 * Usage example:
 * ```typescript
 * interface MyInterface {
 *   doSomething(): void;
 * }
 * class MyImplementation implements MyInterface {
 *   doSomething(): void { }
 * }
 * export const MyInterface = createInterfaceFactory<MyInterface>(MyImplementation);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createInterfaceFactory<T>(implementation: new (...args: any[]) => T): new (...args: any[]) => T {
    return implementation;
}
