/**
 * Copyright 2023-2026 Arm Limited
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

import { TreeViewCategory, TreeViewItem } from './tree-view';
import { filterTreeSearch } from './search-filter-tree';
import { TreeViewCategoryFactory } from './tree-view.factories';

describe('filterTreeSearch', () => {
    it('filters the TreeViewCategories list of items by the provided predicate', () => {
        const animalCategories: TreeViewCategory<string>[] = [
            TreeViewCategoryFactory({
                header: 'Walk',
                categories: [
                    {
                        items: [
                            { label: 'Cat', value: 'Cat' },
                            { label: 'Dog', value: 'Dog' },
                            { label: 'Pig', value: 'Pig' }
                        ],
                        header: 'Farm',
                        categories: [],
                    }
                ],
                items: [],
            }),
            TreeViewCategoryFactory({
                header: 'Fly',
                categories: [
                    {
                        items: [
                            { label: 'Bird', value: 'Bird' },
                        ],
                        header: 'Sky',
                        categories: [],
                    },
                ],
                items: [],
            }),
            TreeViewCategoryFactory({
                header: 'Swim',
                categories: [
                    {
                        items: [
                            { label: 'Fish', value: 'Fish' },
                        ],
                        header: 'Sea',
                        categories: [],
                    }
                ],
                items: [],
            })
        ];
        const itemPredicate = (item: TreeViewItem<string>) => item.value === 'Pig';

        const expected = [
            TreeViewCategoryFactory({
                header: 'Walk',
                categories: [
                    {
                        items: [
                            { label: 'Pig', value: 'Pig' }
                        ],
                        header: 'Farm',
                        categories: [],
                    }
                ],
                items: [],
            })
        ];

        const result = filterTreeSearch('', itemPredicate, animalCategories);
        expect(result).toEqual(expected);
    });

    it('searches the list of TreeViewCategories and returns the TreeViewCategory with headers matching the search value', () => {
        const animalCategories: TreeViewCategory<string>[] = [
            TreeViewCategoryFactory({
                header: 'Walk',
                items: [
                    { label: 'Cat', value: 'Cat' },
                    { label: 'Dog', value: 'Dog' },
                    { label: 'Pig', value: 'Pig' }],
                categories: []
            }),
            TreeViewCategoryFactory({
                header: 'Fly',
                items: [
                    { label: 'Bird', value: 'Bird' }],
                categories: []
            }),
            TreeViewCategoryFactory({
                header: 'Swim',
                items: [{ label: 'Fish', value: 'Fish' }],
                categories: []
            })
        ];

        const searchValue = 'fl';
        const expected = [animalCategories[1]];

        const result = filterTreeSearch(searchValue, (()=> true), animalCategories);
        expect(result).toEqual(expected);
    });

    it('filters TreeViewCategory subcategories by the parent header value', () => {
        const animalCategories: TreeViewCategory<string>[] = [
            TreeViewCategoryFactory({
                header: 'Mammal',
                items: [],
                categories: [
                    {
                        header: 'Cat',
                        items: [
                            { label: 'Cat', value: 'Cat' }
                        ],
                        categories: [],
                    },
                    {
                        header: 'Dog',
                        items: [
                            { label: 'Dog', value: 'Dog' }
                        ],
                        categories: [],
                    }
                ]
            }),
            TreeViewCategoryFactory({
                header: 'Fish',
                items: [],
                categories: [
                    {
                        header: 'Salmon',
                        items: [
                            { label: 'Salmon', value: 'Salmon' }
                        ],
                        categories: [],
                    },
                    {
                        header: 'Mackerel',
                        items: [
                            { label: 'Mackerel', value: 'Mackerel' }
                        ],
                        categories: [],
                    }
                ]
            }),
        ];

        const searchValue = 'mam';
        const expected = [TreeViewCategoryFactory({
            header: 'Mammal',
            items: [],
            categories: [
                {
                    header: 'Cat',
                    items: [
                        { label: 'Cat', value: 'Cat' }
                    ],
                    categories: [],
                },
                {
                    header: 'Dog',
                    items: [
                        { label: 'Dog', value: 'Dog' }
                    ],
                    categories: [],
                }
            ]
        })
        ];

        const result = filterTreeSearch(searchValue, (()=> true), animalCategories);
        expect(result).toEqual(expected);
    });

    it('searches the list of TreeViewCategories and returns the TreeViewCategory with items matching the search value', () => {
        const animalCategories: TreeViewCategory<string>[] = [
            TreeViewCategoryFactory({
                header: 'Walk',
                items: [
                    { label: 'Cat', value: 'Cat' },
                    { label: 'Dog', value: 'Dog' },
                    { label: 'Pig', value: 'Pig' }],
                categories: []
            }),
            TreeViewCategoryFactory({
                header: 'Fly',
                items: [{ label: 'Bird', value: 'Bird' }],
                categories: [] }),
            TreeViewCategoryFactory({
                header: 'Swim',
                items: [{ label: 'Fish', value: 'Fish' }],
                categories: [] })
        ];

        const searchValue = 'do';
        const expected = [
            TreeViewCategoryFactory({
                header: 'Walk',
                items: [{ label: 'Dog', value: 'Dog' }],
                categories: []
            }),
        ];

        const result = filterTreeSearch(searchValue,(()=> true), animalCategories);
        expect(result).toEqual(expected);
    });

    it('searches the list of TreeViewCategories and returns the TreeViewCategory with subcategory headers matching the search value', () => {
        const animalCategories: TreeViewCategory<string>[] = [
            TreeViewCategoryFactory({
                header: 'Walk',
                items: [
                    { label: 'Cat', value: 'Cat' },
                    { label: 'Dog', value: 'Dog' },
                    { label: 'Pig', value: 'Pig' }],
                categories: []
            }),
            TreeViewCategoryFactory({
                header: 'Swim',
                items: [{ label: 'Fish', value: 'Fish' }],
                categories: [
                    TreeViewCategoryFactory({
                        header: 'mammal',
                        items: [{ label: 'whale', value: 'whale' }],
                        categories: []
                    }),
                    TreeViewCategoryFactory({
                        header: 'crustacean',
                        items: [{ label: 'crag', value: 'crag' }],
                        categories: []
                    })]
            })];

        const searchValue = 'crus';
        const expected = [
            TreeViewCategoryFactory({
                header: 'Swim',
                items: [],
                categories: [
                    TreeViewCategoryFactory({
                        header: 'crustacean',
                        items: [{ label: 'crag', value: 'crag' }],
                        categories: []
                    })]
            })
        ];

        const result = filterTreeSearch(searchValue,(()=> true), animalCategories);
        expect(result).toEqual(expected);
    });

    it('searches the list of TreeViewCategories and returns the TreeViewCategory with subcategory items matching the search value', () => {
        const animalCategories: TreeViewCategory<string>[] = [
            TreeViewCategoryFactory({
                header: 'Walk',
                items: [
                    { label: 'Cat', value: 'Cat' },
                    { label: 'Dog', value: 'Dog' },
                    { label: 'Pig', value: 'Pig' }],
                categories: [] }),
            TreeViewCategoryFactory({
                header: 'Swim',
                items: [{ label: 'Fish', value: 'Fish' }],
                categories: [TreeViewCategoryFactory({
                    header: 'mammal',
                    items: [{ label: 'whale', value: 'whale' }],
                    categories: [] }),
                TreeViewCategoryFactory({
                    header: 'crustacean',
                    items: [{ label: 'crag', value: 'crag' }],
                    categories: []
                })]
            })];

        const searchValue = 'crag';
        const expected = [
            TreeViewCategoryFactory({
                header: 'Swim',
                items: [],
                categories: [
                    TreeViewCategoryFactory({
                        header: 'crustacean',
                        items: [{ label: 'crag', value: 'crag' }],
                        categories: []
                    })]
            })
        ];
        const result = filterTreeSearch(searchValue,(()=> true), animalCategories);
        expect(result).toEqual(expected);
    });

    it('searches the list of TreeViewCategories and returns the TreeViewCategories and items matching the search value', () => {
        const animalCategories: TreeViewCategory<string>[] = [
            TreeViewCategoryFactory({
                header: 'Walk',
                items: [
                    { label: 'Cat', value: 'Cat' },
                    { label: 'Dog', value: 'Dog' },
                    { label: 'Pig', value: 'Pig' }],
                categories: [] }),
            TreeViewCategoryFactory({
                header: 'Swim',
                items: [{ label: 'Fish', value: 'Fish' }],
                categories: [
                    TreeViewCategoryFactory({
                        header: 'Seapigs',
                        items: [
                            { label: 'whale', value: 'whale' },
                            { label: 'dolphin', value: 'dolphin' },
                        ],
                        categories: []
                    }),
                    TreeViewCategoryFactory({
                        header: 'crustacean',
                        items: [{ label: 'crag', value: 'crag' }],
                        categories: []
                    }),
                ],
            })];

        const searchValue = 'pig';
        const expected = [
            TreeViewCategoryFactory({
                header: 'Walk',
                items: [
                    { label: 'Pig', value: 'Pig' }],    // only matching items
                categories: [] }),
            TreeViewCategoryFactory({
                header: 'Swim',
                items: [],
                categories: [animalCategories[1].categories[0]], // entire matching subcategory
            })
        ];
        const result = filterTreeSearch(searchValue,(()=> true), animalCategories);
        expect(result).toEqual(expected);
    });
});
