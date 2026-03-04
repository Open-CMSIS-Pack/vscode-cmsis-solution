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

import './map';

describe('Map', () => {

    describe('every', () => {
        it('returns true if all elements in the map pass the test implemented by the provided function', () => {
            const map = new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]);

            const result = map.every((value) => value > 0);
            expect(result).toBe(true);
        });

        it('returns false if any element in the map fails the test implemented by the provided function', () => {
            const map = new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]);

            const result = map.every((value) => value > 1);
            expect(result).toBe(false);
        });

        it('returns true if the map is empty', () => {
            const map = new Map();

            const result = map.every(() => false);
            expect(result).toBe(true);
        });

        it('returns true if the two maps have same content', () => {
            const map1 = new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]);

            const map2 = new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]);

            const result = map1.every((value, key) => map2.get(key) === value);
            expect(result).toBe(true);
        });

        it('returns false if the two maps have different content', () => {
            const map1 = new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]);

            const map2 = new Map([
                ['a', 1],
                ['b', 22],
                ['c', 3],
            ]);

            const result = map1.every((value, key) => map2.get(key) === value);
            expect(result).toBe(false);
        });

    });

    describe('mapValues', () => {
        it('transforms the values of the map using the provided function', () => {
            const map = new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]);

            const result = map.mapValues((value) => value * 2);
            expect(result).toEqual(new Map([
                ['a', 2],
                ['b', 4],
                ['c', 6],
            ]));
        });
    });

    describe('toObject', () => {
        it('converts a Map with string keys to an object', () => {
            const map = new Map<string, number>([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]);

            const result = map.toObject();
            expect(result).toEqual({
                a: 1,
                b: 2,
                c: 3,
            });
        });
    });

});
