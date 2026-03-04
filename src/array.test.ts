/**
 * Copyright 2022-2026 Arm Limited
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

import { arraysAreEqualIgnoringOrder, dedupe, groupBy, pick, range } from './array';
import { ComponentOption } from './views/manage-components-packs/components-data';
import { componentOptionFactory, componentOptionIdFactory } from './views/manage-components-packs/components-data.factories';

describe('Array utils', () => {
    type TestItem = { name: string, age: number }
    const testIsEqual = (item1: TestItem) => (item2: TestItem) => item1.name === item2.name;

    describe('pick', () => {
        it('returns empty when given an empty array', () => {
            expect(pick('name')([])).toEqual([]);
        });

        it('picks the property from each item in the array', () => {
            const input = [{ name: 'fred', size: 8 }, { name: 'penny', size: -4 }];
            expect(pick('name')(input)).toEqual(['fred', 'penny']);
        });
    });

    describe('dedupe', () => {
        it('returns empty when given an empty array', () => {
            const output = dedupe(testIsEqual)([]);
            expect(output).toEqual([]);
        });

        it('filters out duplicates using the equality function', () => {
            const output = dedupe(testIsEqual)([
                { name: 'Oswald', age: 24 },
                { name: 'Penny', age: 12 },
                { name: 'Oswald', age: 25 },
                { name: 'Jerry', age: 62 }
            ]);

            expect(output).toEqual([
                { name: 'Oswald', age: 24 },
                { name: 'Penny', age: 12 },
                { name: 'Jerry', age: 62 }
            ]);
        });

        it('uses reference equality when no isEquals is given', () => {
            const output = dedupe()([2, 4, 2, 3]);
            expect(output).toEqual([2, 4, 3]);
        });
    });

    describe('arraysAreEqualIgnoringOrder', () => {
        const testArraysAreEqualIgnoringOrder = arraysAreEqualIgnoringOrder(testIsEqual);

        it('returns true if both arrays are empty', () => {
            const output = testArraysAreEqualIgnoringOrder([])([]);
            expect(output).toBe(true);
        });

        it('returns false if the arrays have different lengths', () => {
            const output = testArraysAreEqualIgnoringOrder([{ name: 'Oswald', age: 3 }])([]);
            expect(output).toBe(false);
        });

        it('returns true if the arrays contain the same elements in the same order', () => {
            const array1 = [{ name: 'Oswald', age: 3 }, { name: 'Penny', age: 104 }];
            const array2 = [{ name: 'Oswald', age: 3 }, { name: 'Penny', age: 104 }];
            const output = testArraysAreEqualIgnoringOrder(array1)(array2);
            expect(output).toBe(true);
        });

        it('returns true if the arrays contain the same elements in a different order', () => {
            const array1 = [{ name: 'Oswald', age: 3 }, { name: 'Penny', age: 104 }];
            const array2 = [{ name: 'Penny', age: 104 }, { name: 'Oswald', age: 9 }];
            const output = testArraysAreEqualIgnoringOrder(array1)(array2);
            expect(output).toBe(true);
        });

        it('returns false if the arrays contain one different element', () => {
            const array1 = [{ name: 'Oswald', age: 3 }, { name: 'Penny', age: 104 }, { name: 'Jenny', age: 3 }];
            const array2 = [{ name: 'Penny', age: 104 }, { name: 'Jerry', age: 9 }, { name: 'Oswald', age: 3 }];
            const output = testArraysAreEqualIgnoringOrder(array1)(array2);
            expect(output).toBe(false);
        });
    });

    describe('range', () => {
        it('returns an empty array when given 0', () => {
            expect(range(0)).toEqual([]);
        });

        it('returns an array containing the numbers up to the size minus 1', () => {
            expect(range(7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
        });
    });

    describe('groupBy', () => {
        it('returns empty if given the empty array', () => {
            const output = groupBy([], 'theProperty');
            expect(output).toEqual([]);
        });

        it('groups by reference equality if no isEqual function is provided', () => {
            const input: TestItem[] = [
                { name: 'Steve', age: 7 },
                { name: 'Helen', age: 31 },
                { name: 'Helen', age: 77 },
            ];
            const output = groupBy(input, 'name');
            const expected: typeof output = [
                {
                    key: 'Steve', items: [
                        { name: 'Steve', age: 7 }
                    ]
                },
                {
                    key: 'Helen', items: [
                        { name: 'Helen', age: 31 },
                        { name: 'Helen', age: 77 },
                    ]
                },
            ];
            expect(output).toEqual(expected);
        });

        it('uses the isEqual function if provided', () => {
            const input: { field: TestItem, extra: boolean }[] = [
                { field: { name: 'Helen', age: 31 }, extra: true },
                { field: { name: 'Helen', age: 38 }, extra: false },
            ];
            const output = groupBy(input, 'field', testIsEqual);
            const expected: typeof output = [
                {
                    key: { name: 'Helen', age: 31 }, items: [
                        { field: { name: 'Helen', age: 31 }, extra: true },
                        { field: { name: 'Helen', age: 38 }, extra: false },
                    ]
                }
            ];
            expect(output).toEqual(expected);
        });

        it('groups ComponentOptions by key', () => {
            const id1 = componentOptionIdFactory();
            const id2 = componentOptionIdFactory();
            const option1 = componentOptionFactory({ id: id1 });
            const option2 = componentOptionFactory({ id: id2 });
            const option3 = componentOptionFactory({ id: id2 });
            const objectArray: ComponentOption[] = [option1, option2, option3];

            const result = groupBy(objectArray, 'id');
            const expected: typeof result = [{ key: id1, items: [option1] }, { key: id2, items: [option2, option3] }];

            expect(result).toEqual(expected);
        });
    });
});
