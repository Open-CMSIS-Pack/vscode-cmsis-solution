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
import { TreeViewCategory, TreeViewItem } from '../../../common/components/tree-view';
import { CreateSolutionAction, CreateSolutionState } from '../state/reducer';
import { CSolutionTemplate } from '../state/templates';

export type ExampleDropdownTreeProps = {
    title: string;
    label: React.ReactNode;
    templates?: CSolutionTemplate[];
    onChange: (val: string) => void;
    searchText: string;
    selectedTemplate?: CreateSolutionState['selectedTemplate'];
    datamanagerApps: Array<TreeViewCategory<string>>;
    dispatch: React.Dispatch<CreateSolutionAction>;
}

const extractDropdownText = (selectedTemplate?: CreateSolutionState['selectedTemplate']) => {
    if (selectedTemplate?.value?.type === 'template') {
        return selectedTemplate.value.value.name;
    } else if (selectedTemplate?.value?.type === 'dataManagerApp') {
        return selectedTemplate.value.value.name;
    } else {
        return 'Select Project';
    }
};


const TEMPLATE_PREFIX = 'template::';

type Lookup = {
    [TEMPLATE_PREFIX]: Record<string, CSolutionTemplate>,
  }

const prepareDispatchAction = (value: string, examples: Lookup): Extract<CreateSolutionAction, {type: 'SET_SELECTED_TEMPLATE' | 'SET_SELECTED_DRAFTPROJECT_ID'}> | undefined => {
    if (value.startsWith(TEMPLATE_PREFIX)) {
        const id = value.slice(TEMPLATE_PREFIX.length);
        const template = examples[TEMPLATE_PREFIX][id];
        if (template !== undefined) {
            return  { type: 'SET_SELECTED_TEMPLATE', template: { type: 'template', value: template } };
        }
    } else {
        const id = value;
        return { type: 'SET_SELECTED_DRAFTPROJECT_ID', id: id };
    }

    return undefined;
};

export const ExampleDropdownTree = (props: ExampleDropdownTreeProps) => {
    const examples: Lookup = { 'template::': {} };
    const datamanagerApps = props.datamanagerApps;

    if (props.templates) {
        for (const template of props.templates) {
            examples[TEMPLATE_PREFIX][template.name] = template;
        }
    }

    const onSelect = (value: string) => {
        const action = prepareDispatchAction(value, examples);
        if (action) props.dispatch(action);
    };

    const mapTemplate = (template: CSolutionTemplate): TreeViewItem<string> => {
        return { label: template.name, value: `${TEMPLATE_PREFIX}${template.name}`, tooltip: template.description, className: 'template' };
    };
    const entries: Array<TreeViewCategory<string>> = [];
    if (props.templates?.length) entries.push({ categories: [], header: 'Templates', items: props.templates.map(mapTemplate) });
    if (datamanagerApps.length) entries.push(...datamanagerApps);

    const dropdown = (closeDropdown: () => void) => {
        return <SearchableTreeView
            onChange={props.onChange}
            searchValue={props.searchText}
            topLevelCategories={entries}
            onSelect={item => {
                onSelect(item.value);
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

            text={extractDropdownText(props.selectedTemplate)}
        />
    );
};
