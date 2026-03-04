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

import './array';
import './map';

describe('Array.groupedBy', () => {

    it('groups an array of objects by a specified key', () => {
        const array = [
            { category: 'fruit', name: 'apple' },
            { category: 'vegetable', name: 'carrot' },
            { category: 'fruit', name: 'banana' },
            { category: 'vegetable', name: 'lettuce' },
        ];

        const result = array.groupedBy(e => e.category);
        expect(result.toObject()).toEqual({
            fruit: [
                { category: 'fruit', name: 'apple' },
                { category: 'fruit', name: 'banana' },
            ],
            vegetable: [
                { category: 'vegetable', name: 'carrot' },
                { category: 'vegetable', name: 'lettuce' },
            ],
        });
    });

    it('handles empty array', () => {
        const array: { category: string; name: string }[] = [];

        const result = array.groupedBy(e => e.category);
        expect(result.toObject()).toEqual({});
    });

    it('handles empty, null, or undefined group keys', () => {
        const array = [
            { category: 'fruit', name: 'apple' },
            { category: '', name: 'unknown' },
            { category: 'fruit', name: 'banana' },
            { category: null, name: 'mystery' },
            { category: undefined, name: 'riddle' },
        ];

        const result = array.groupedBy(e => e.category ?? '');
        expect(result.toObject()).toEqual({
            fruit: [
                { category: 'fruit', name: 'apple' },
                { category: 'fruit', name: 'banana' },
            ],
            '': [
                { category: '', name: 'unknown' },
                { category: null, name: 'mystery' },
                { category: undefined, name: 'riddle' },
            ],
        });
    });

    it('uses a sanitizer function to process group keys', () => {
        const array = [
            { category: 'Fruit', name: 'apple' },
            { category: 'vegetable', name: 'carrot' },
            { category: 'FRUIT', name: 'banana' },
            { category: 'Vegetable', name: 'lettuce' },
        ];

        const result = array.groupedBy(e => e.category.toLowerCase());
        expect(result.toObject()).toEqual({
            fruit: [
                { category: 'Fruit', name: 'apple' },
                { category: 'FRUIT', name: 'banana' },
            ],
            vegetable: [
                { category: 'vegetable', name: 'carrot' },
                { category: 'Vegetable', name: 'lettuce' },
            ],
        });
    });
});

