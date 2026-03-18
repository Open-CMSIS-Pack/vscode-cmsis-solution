/**
 * Copyright 2024-2026 Arm Limited
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

import { TreeViewCategory } from './tree-view';
import { buildTreeViewCategories } from './tree-view-builder';


describe('buildTreeViewCategories', () => {

    it('Generate empty tree', () => {
        const data : [string, string][] = [];
        const tree = buildTreeViewCategories(data, d => ({ label: d[1], value: d }), d => d[0]);
        const expectedTree : TreeViewCategory<typeof data[0]>[] = [];
        expect(tree).toEqual(expectedTree);
    });

    it('Generate simple tree', () => {
        const data : [string, string][] = [
            ['Category 1', 'Item 1.1'],
            ['Category 1', 'Item 1.2'],
            ['Category 2', 'Item 2.1'],
            ['Category 2', 'Item 2.2'],
        ];

        const tree = buildTreeViewCategories(data, d => ({ label: d[1], value: d }), d => d[0]);

        const expectedTree : TreeViewCategory<typeof data[0]>[] = [
            {
                header: data[0][0], categories: [], items: [
                    { label: data[0][1], value: data[0] },
                    { label: data[1][1], value: data[1] },
                ],
            },
            {
                header: data[2][0], categories: [], items: [
                    { label: data[2][1], value: data[2] },
                    { label: data[3][1], value: data[3] },
                ],
            },
        ];

        expect(tree).toEqual(expectedTree);
    });

    it('Generate complex tree', () => {
        const data : [string, string, string][] = [
            ['Category 1', 'Category 1.1', 'Item 1.1.2'],
            ['Category 1', 'Category 1.2', 'Item 1.2.1'],
            ['Category 2', 'Category 2.1', 'Item 2.1.2'],
            ['Category 1', 'Category 1.1', 'Item 1.1.1'],
            ['Category 1', 'Category 1.2', 'Item 1.2.2'],
            ['Category 2', 'Category 2.1', 'Item 2.1.1'],
        ];

        const tree = buildTreeViewCategories(data, d => ({ label: d[2], value: d }), d => d[0], d => d[1]);

        const expectedTree : TreeViewCategory<typeof data[0]>[] = [
            {
                header: data[0][0], items: [], categories: [
                    {
                        header: data[0][1], categories: [], items: [
                            { label: data[3][2], value: data[3] },
                            { label: data[0][2], value: data[0] },
                        ],
                    },
                    {
                        header: data[1][1], categories: [], items: [
                            { label: data[1][2], value: data[1] },
                            { label: data[4][2], value: data[4] },
                        ],
                    },
                ],
            },
            {
                header: data[2][0], items: [], categories: [
                    {
                        header: data[2][1], categories: [], items: [
                            { label: data[5][2], value: data[5] },
                            { label: data[2][2], value: data[2] },
                        ],
                    },
                ]
            },
        ];

        expect(tree).toEqual(expectedTree);
    });

    it('Generate complex tree with sort keys', () => {
        const data : [[string, number], string, number|undefined, string][] = [
            [['Category 1', 2], 'Category 1.1', 3, 'Item 1.1.2'],
            [['Category 1', 2], 'Category 1.2', undefined, 'Item 1.2.1'],
            [['Category 2', 1], 'Category 2.1', undefined, 'Item 2.1.2'],
            [['Category 1', 2], 'Category 1.1', undefined, 'Item 1.1.1'],
            [['Category 1', 2], 'Category 1.2', undefined, 'Item 1.2.2'],
            [['Category 2', 1], 'Category 2.1', undefined, 'Item 2.1.1'],
        ];

        const tree = buildTreeViewCategories(data, d => ({ label: d[3], value: d }), d => d[0], d => d[2] !== undefined ? [d[1], d[2]] : d[1]);

        const expectedTree : TreeViewCategory<unknown>[] = [
            {
                header: data[2][0][0], sortkey: 1, items: [], categories: [
                    {
                        header: data[2][1], categories: [], items: [
                            { label: data[5][3], value: data[5] },
                            { label: data[2][3], value: data[2] },
                        ],
                    },
                ]
            },
            {
                header: data[0][0][0], sortkey: 2, items: [], categories: [
                    {
                        header: data[0][1], sortkey: data[0][2], categories: [], items: [
                            { label: data[3][3], value: data[3] },
                            { label: data[0][3], value: data[0] },
                        ],
                    },
                    {
                        header: data[1][1], sortkey: data[1][2], categories: [], items: [
                            { label: data[1][3], value: data[1] },
                            { label: data[4][3], value: data[4] },
                        ],
                    },
                ],
            },
        ];

        expect(tree).toEqual(expectedTree);
    });

    it('Skip on undefined subcategories', () => {
        const data : [string, string | undefined, string][] = [
            ['Category 1', 'Category 1.1', 'Item 1.1.1'],
            ['Category 1', undefined, 'Item 1.2'],
        ];

        const tree = buildTreeViewCategories(data, d => ({ label: d[2], value: d }), d => d[0], d => d[1]);

        const expectedTree : TreeViewCategory<typeof data[0]>[] = [
            {
                header: data[0][0], categories: [
                    {
                        header: data[0][1] ?? '', categories: [], items: [
                            { label: data[0][2], value: data[0] },
                        ],
                    },
                ], items: [
                    { label: data[1][2], value: data[1] },
                ]
            },
        ];

        expect(tree).toEqual(expectedTree);
    });

    it('Ignore undefined toplevel categories', () => {
        const data : [string | undefined, string][] = [
            ['Category 1', 'Item 1.1'],
            [undefined, 'Item 1.2'],
        ];

        const tree = buildTreeViewCategories(data, d => ({ label: d[1], value: d }), d => d[0]);

        const expectedTree : TreeViewCategory<typeof data[0]>[] = [
            {
                header: data[0][0] ?? '', categories: [], items: [
                    { label: data[0][1], value: data[0] },
                ]
            },
        ];

        expect(tree).toEqual(expectedTree);
    });

});
