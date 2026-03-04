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

export {};

declare global {
    interface Map<K, V> {
        /**
         * Determines whether all the members of a Map satisfy the specified test.
         * @param predicate A function that accepts up to three arguments. The every method calls
         * the predicate function for each element in the Map until the predicate returns a value
         * which is coercible to the Boolean value false, or until the end of the Map.
         * @param thisArg An object to which the this keyword can refer in the predicate function.
         * If thisArg is omitted, undefined is used as the this value.
         */
        every(callbackfn: (value: V, key: K, map: Map<K, V>) => boolean, thisArg?: unknown): boolean;

        /**
         * Transforms the values of a Map by applying a function to each value.
         * @param callbackfn A function that accepts up to three arguments. The mapValues method calls
         * the callbackfn function for each element in the Map.
         * @param thisArg An object to which the this keyword can refer in the callbackfn function.
         * If thisArg is omitted, undefined is used as the this value.
         */
        mapValues<T>(callbackfn: (value: V, key: K, map: Map<K, V>) => T, thisArg?: unknown): Map<K, T>;

        /**
         * Converts a Map using string keys to a plain object.
         */
        toObject(): Record<K extends string ? string : never, V>;
    }
}

Map.prototype.every = function<K, V>(
    this: Map<K, V>,
    callback: (value: V, key: K, map: Map<K, V>) => boolean,
    thisArg?: unknown,
): boolean {
    for (const [key, value] of this) {
        if (!callback.call(thisArg, value, key, this)) {
            return false;
        }
    }
    return true;
};

Map.prototype.mapValues = function<K, V, T>(
    this: Map<K, V>,
    callback: (value: V, key: K, map: Map<K, V>) => T,
    thisArg?: unknown,
): Map<K, T> {
    const result = new Map<K, T>();
    for (const [key, value] of this) {
        result.set(key, callback.call(thisArg, value, key, this));
    }
    return result;
};

Map.prototype.toObject = function<K extends string, V>(this: Map<K, V>): Record<string, V> {
    return Object.fromEntries(this.entries());
};
