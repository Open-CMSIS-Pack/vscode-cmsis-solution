/**
 * Copyright (C) 2022-2026 Arm Limited
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
