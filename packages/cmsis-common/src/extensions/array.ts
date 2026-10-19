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

export {};

declare global {
    interface Array<T> {
        /**
         * Group elements of an array based on a key generator function.
         *
         * @param key The key generator function to use for grouping
         * @return Map-of-arrays grouping the array values
         */
        groupedBy<K>(key: (value: T) => K, thisArg?: unknown): Map<K, T[]>;
    }
};

Array.prototype.groupedBy = function <T, K>(
    this: T[],
    key: (value: T) => K,
    thisArg?: unknown,
): Map<K, T[]> {
    return this.reduce((result, item) => {
        const groupKey = key.call(thisArg, item);
        const group = result.get(groupKey);
        if (group !== undefined) {
            group.push(item);
        } else {
            result.set(groupKey, [item]);
        }
        return result;
    }, new Map<K, T[]>());
};
