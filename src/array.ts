/**
 * Copyright 2022-2026 Arm Limited
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
 * Filters the input array to remove duplicates.
 * @param isEqual Function to use when comparing two entries
 */
export const dedupe = <A>(
    isEqual: (a: A) => (b: A) => boolean = a => b => a === b
) => (input: A[]): A[] => input.reduce((acc: A[], current) => {
        if (acc.some(isEqual(current))) {
            return acc;
        } else {
            return [...acc, current];
        }
    }, []);

/**
 * Pick a property off of each item in the array.
 */
export const pick = <K extends string>(
    property: K,
) => <A extends Record<K, unknown>>(input: A[]): Array<A[K]> => input.map(item => item[property]);

export const arraysAreEqualIgnoringOrder = <E>(
    isEqual: (a: E) => (b: E) => boolean
) => (array1: E[]) => (array2: E[]): boolean =>
        array1.length === array2.length && array1.every(item1 => array2.some(isEqual(item1)));

/**
 * Creates an array of numbers for 0 to the size - 1, like range() in python
 */
export const range = (size: number) => [...Array(size).keys()];

export type Grouped<A, P extends keyof A> = {
    key: A[P];
    items: A[];
}

/**
 * Groups an array of objects by selected key on the object
 */
export const groupBy = <A extends object, P extends keyof A>(
    input: A[],
    property: P,
    isEqual: (a: A[P]) => (b: A[P]) => boolean = a => b => a === b
): Grouped<A, P>[] => {
    const output: Grouped<A, P>[] = [];

    for (const item of input) {
        const key = item[property];
        let group = output.find(i => isEqual(key)(i.key));

        if (!group) {
            group = { key, items: [] };
            output.push(group);
        }

        group.items.push(item);
    }

    return output;
};
