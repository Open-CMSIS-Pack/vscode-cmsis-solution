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

import { TreeViewCategory, TreeViewItem } from './tree-view';

const alphaStringSort = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' });
function categorySort(a: TreeViewCategory<unknown>, b: TreeViewCategory<unknown>) {
    if (a.sortkey === b.sortkey) {
        return alphaStringSort(a.header, b.header);
    } else if (a.sortkey === undefined) {
        return 1;
    } else if (b.sortkey === undefined) {
        return -1;
    }
    return a.sortkey - b.sortkey;
}

export const sortTreeViewCategories = <T>(tree: TreeViewCategory<T>[], depth: number = 2): TreeViewCategory<T>[] => {
    if (depth > 0) {
        tree.sort(categorySort);
        tree.forEach(v => {
            sortTreeViewCategories(v.categories, depth - 1);
            v.items.sort((a, b) => alphaStringSort(a.label, b.label));
        });
    }
    return tree;
};

export type TreeViewItemBuilder<V, K = string> = (value: V) => TreeViewItem<K>;
export type TreeViewCategoryHeaderBuilder<V> = (value: V) => string | undefined | [string, number];

function findCategory<V, K = string>(tree: TreeViewCategory<K>[], datum: V, categories: TreeViewCategoryHeaderBuilder<V>[]) {
    let treeCategory: TreeViewCategory<K> | undefined;
    for (const categoryBuilder of categories) {
        let category = categoryBuilder(datum);
        let sortkey: number | undefined = undefined;
        if (!category) { break; }
        if (typeof category !== 'string') {
            [category, sortkey] = category;
        }
        let nextTreeCategory = (treeCategory?.categories ?? tree).find(c => c.header === category);
        if (!nextTreeCategory) {
            nextTreeCategory = { header: category, sortkey, categories: [], items: [] };
            (treeCategory?.categories ?? tree).push(nextTreeCategory);
        }
        treeCategory = nextTreeCategory;
    }
    return treeCategory;
}

export function buildTreeViewCategories<V, K = string>(data: Iterable<V>, itemBuilder: TreeViewItemBuilder<V, K>, ...categories: TreeViewCategoryHeaderBuilder<V>[]) : TreeViewCategory<K>[] {
    const tree : TreeViewCategory<K>[] = [];

    for (const datum of data) {
        const treeCategory = findCategory(tree, datum, categories);
        treeCategory?.items?.push(itemBuilder(datum));
    }

    return sortTreeViewCategories(tree, categories.length);
}
