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

import * as React from 'react';
import { DropdownSelect } from '../../../common/components/dropdown-select';
import { SearchableTreeView } from '../../../common/components/searchable-tree-view';
import { TreeViewCategory } from '../../../common/components/tree-view';

export type ExampleDropdownTreeProps = {
    title: string;
    label: React.ReactNode;
    entries: Array<TreeViewCategory<string>>;
    onChange: (val: string) => void;
    onSelect: (value: string) => void;
    searchText: string;
    selectedText: string;
}

export const ExampleDropdownTree = (props: ExampleDropdownTreeProps) => {
    const dropdown = (closeDropdown: () => void) => {
        return <SearchableTreeView
            onChange={props.onChange}
            searchValue={props.searchText}
            topLevelCategories={props.entries}
            onSelect={item => {
                props.onSelect(item.value);
                closeDropdown();
            }}
        />;
    };

    return (
        <DropdownSelect
            dropdownContent={dropdown}
            id='create-solution-template'
            label={props.label}
            title={props.title}

            text={props.selectedText}
        />
    );
};
