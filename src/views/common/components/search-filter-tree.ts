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

const categoryIsNotEmpty = <T>(category: TreeViewCategory<T>): boolean => {
    return category.items.length > 0 || category.categories.length > 0;
};

const includesCaseInsensitive = (haystack: string, needle: string): boolean => {
    return haystack.toLowerCase().includes(needle);
};

function filterCategoriesByPredicate<T>(
    categories: TreeViewCategory<T>[],
    itemPredicate: (item: TreeViewItem<T>) => boolean
): TreeViewCategory<T>[] {
    return categories.map(category => ({
        ...category,
        categories: filterCategoriesByPredicate(category.categories, itemPredicate),
        items: category.items.filter(itemPredicate),
    })).filter(categoryIsNotEmpty);
}

function filterCategoryByValue<T>(
    category: TreeViewCategory<T>,
    filterValue: string,
): TreeViewCategory<T> {
    if (includesCaseInsensitive(category.header, filterValue)) {
        return category;
    }
    return {
        ...category,
        categories: filterCategoriesByValue(category.categories, filterValue),
        items: category.items.filter(item => includesCaseInsensitive(item.label, filterValue)),
    };
}

function filterCategoriesByValue<T>(
    categories: TreeViewCategory<T>[],
    filterValue: string,
): TreeViewCategory<T>[] {
    return categories.map(category => filterCategoryByValue(category, filterValue)).filter(categoryIsNotEmpty);
}

export function filterTreeSearch<T = string>(
    filterValue: string,
    itemPredicate: (item: TreeViewItem<T>) => boolean,
    categories: TreeViewCategory<T>[],
): TreeViewCategory<T>[] {
    const predicatedCategories = filterCategoriesByPredicate(categories, itemPredicate);
    const filteredCategoriesBy = filterCategoriesByValue(predicatedCategories, filterValue.toLowerCase());
    return filteredCategoriesBy;
};
