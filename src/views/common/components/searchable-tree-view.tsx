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

import * as React from 'react';
import { filterTreeSearch } from './search-filter-tree';
import { SearchInput } from './search-input';
import { TreeView, TreeViewItem, TreeViewProps } from './tree-view';

export type SearchableTreeViewProps<T = string> = TreeViewProps<T> & {
    searchValue: string,
    onChange: (value: string) => void,
    itemPredicate?: (item: TreeViewItem<T>) => boolean,
    noEntriesMessage?: React.ReactNode,
};

/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
export const SearchableTreeView = <T extends unknown = string>(props: SearchableTreeViewProps<T>) => {
    const predicateFn = props.itemPredicate || (() => true);
    return (
        <>
            <SearchInput
                placeholder='Search'
                value={props.searchValue}
                onChange={e => props.onChange(e.target.value)}
            />
            <TreeView
                onSelect={props.onSelect}
                topLevelCategories={filterTreeSearch(props.searchValue, predicateFn, props.topLevelCategories)}
                height={props.height}
                noEntriesMessage={props.noEntriesMessage}
            />
        </>
    );
};
