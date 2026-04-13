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

import { Example as ApiExample, RefApp } from '../../../../core-tools/client/packs_pb';
import * as React from 'react';
import { ExampleProject, ExampleProjectFormat } from '../../../../solar-search/solar-search-client';
import { DropdownSelect } from '../../../common/components/dropdown-select';
import { SearchableTreeView } from '../../../common/components/searchable-tree-view';
import { TreeViewCategory, TreeViewItem } from '../../../common/components/tree-view';
import { CreateSolutionAction, CreateSolutionState } from '../state/reducer';
import { CSolutionTemplate } from '../state/templates';

export type ExampleDropdownTreeProps = {
    title: string;
    label: React.ReactNode;
    templates?: CSolutionTemplate[];
    examples?: ExampleProject[];
    refApps?: RefApp.AsObject[];
    localExamples?: ApiExample.AsObject[];
    onChange: (val: string) => void;
    searchText: string;
    selectedTemplate?: CreateSolutionState['selectedTemplate'];
    datamanagerApps: Array<TreeViewCategory<string>>;
    dispatch: React.Dispatch<CreateSolutionAction>;
}

const extractDropdownText = (selectedTemplate?: CreateSolutionState['selectedTemplate']) => {
    if (selectedTemplate?.value?.type === 'example') {
        return selectedTemplate.value.value.name;
    } else if (selectedTemplate?.value?.type === 'template') {
        return selectedTemplate.value.value.name;
    } else if (selectedTemplate?.value?.type === 'refApp') {
        return selectedTemplate.value.value.name;
    } else if (selectedTemplate?.value?.type === 'localExample') {
        return selectedTemplate.value.value.name;
    } else if (selectedTemplate?.value?.type === 'dataManagerApp') {
        return selectedTemplate.value.value.name;
    } else {
        return 'Select Project';
    }
};


const EXAMPLE_PREFIX = 'example::';
const TEMPLATE_PREFIX = 'template::';
const REFAPP_PREFIX = 'refapp::';
const LOCALEXAMPLE_PREFIX = 'localExample::';

type Lookup = {
    [EXAMPLE_PREFIX]: Record<string, ExampleProject>,
    [REFAPP_PREFIX]: Record<string, RefApp.AsObject>,
    [TEMPLATE_PREFIX]: Record<string, CSolutionTemplate>,
    [LOCALEXAMPLE_PREFIX]: Record<string, ApiExample.AsObject>,
  }

const prepareDispatchAction = (value: string, examples: Lookup): Extract<CreateSolutionAction, {type: 'SET_SELECTED_TEMPLATE' | 'SET_SELECTED_DRAFTPROJECT_ID'}> | undefined => {
    if (value.startsWith(EXAMPLE_PREFIX)) {
        const id = value.slice(EXAMPLE_PREFIX.length);
        const example = examples[EXAMPLE_PREFIX][id];
        if (example !== undefined) {
            return { type: 'SET_SELECTED_TEMPLATE', template: { type: 'example', value: example } };
        }
    } else if (value.startsWith(REFAPP_PREFIX)) {
        const id = value.slice(REFAPP_PREFIX.length);
        const refApp = examples[REFAPP_PREFIX][id];
        if (refApp !== undefined) {
            return { type: 'SET_SELECTED_TEMPLATE', template: { type: 'refApp', value: refApp } };
        }
    } else if (value.startsWith(TEMPLATE_PREFIX)) {
        const id = value.slice(TEMPLATE_PREFIX.length);
        const template = examples[TEMPLATE_PREFIX][id];
        if (template !== undefined) {
            return  { type: 'SET_SELECTED_TEMPLATE', template: { type: 'template', value: template } };
        }
    } else if (value.startsWith(LOCALEXAMPLE_PREFIX)) {
        const id = value.slice(LOCALEXAMPLE_PREFIX.length);
        const example = examples[LOCALEXAMPLE_PREFIX][id];
        if (example !== undefined) {
            return { type: 'SET_SELECTED_TEMPLATE', template: { type: 'localExample', value: example } };
        }
    } else {
        const id = value;
        return { type: 'SET_SELECTED_DRAFTPROJECT_ID', id: id };
    }

    return undefined;
};

// prefer CSolution example over uvproj
const GetLocalExampleType = (example: ApiExample.AsObject): ExampleProjectFormat => {
    let format: ExampleProjectFormat = { type: 'other' };

    for (const environment of example.environmentsList) {
        if (environment.toolchain == 'csolution') {
            format = { type: 'csolution' };
            break;
        }
        if (environment.toolchain == 'cmsis') {
            format = { type: 'csolution' };
            break;
        }
        if (environment.toolchain == 'uv') {
            format = { type: 'uvproj', convertible: true };
        }
    }

    return format;
};

export const ExampleDropdownTree = (props: ExampleDropdownTreeProps) => {
    const examples: Lookup = { 'example::': {}, 'refapp::': {}, 'template::': {}, 'localExample::': {} };
    const uvprojExamples = props.examples?.filter(example => example.format.type === 'uvproj');
    const csolutionExamples = props.examples?.filter(example => example.format.type === 'csolution');
    const refApps = props.refApps;
    const localUvprojExamples = props.localExamples?.filter(example => GetLocalExampleType(example).type === 'uvproj');
    const localCsolutionExamples = props.localExamples?.filter(example => GetLocalExampleType(example).type === 'csolution');
    const datamanagerApps = props.datamanagerApps;

    if (props.examples) {
        for (const example of props.examples) {
            examples[EXAMPLE_PREFIX][example.id] = example;
        }
    }
    if (props.refApps) {
        for (const refApp of props.refApps) {
            examples[REFAPP_PREFIX][refApp.name] = refApp;
        }
    }
    if (props.templates) {
        for (const template of props.templates) {
            examples[TEMPLATE_PREFIX][template.name] = template;
        }
    }
    if (props.localExamples) {
        for (const localExample of props.localExamples) {
            examples[LOCALEXAMPLE_PREFIX][localExample.name] = localExample;
        }
    }

    const onSelect = (value: string) => {
        const action = prepareDispatchAction(value, examples);
        if (action) props.dispatch(action);
    };

    const mapTemplate = (template: CSolutionTemplate): TreeViewItem<string> => {
        return { label: template.name, value: `${TEMPLATE_PREFIX}${template.name}`, tooltip: template.description, className: 'template' };
    };
    const mapExample = (example: ExampleProject): TreeViewItem<string> => {
        return { label: example.name, value: `${EXAMPLE_PREFIX}${example.id}`, tooltip: example.description, className: 'example' };
    };
    const mapRefApp = (example: RefApp.AsObject): TreeViewItem<string> => {
        return { label: example.name, value: `${REFAPP_PREFIX}${example.name}`, tooltip: example.description, className: 'refapp' };
    };
    const mapLocalExample = (example: ApiExample.AsObject): TreeViewItem<string> => {
        return { label: example.name, value: `${LOCALEXAMPLE_PREFIX}${example.name}`, tooltip: example.description, className: 'localExample' };
    };

    const entries: Array<TreeViewCategory<string>> = [];
    if (props.templates?.length) entries.push({ categories: [], header: 'Templates', items: props.templates.map(mapTemplate) });
    if (refApps?.length) entries.push({ categories: [], header: 'REFERENCE EXAMPLES', items: refApps.map(mapRefApp) });
    if (csolutionExamples?.length) entries.push({ categories: [], header: 'CMSIS SOLUTION EXAMPLES', items: csolutionExamples.map(mapExample) });
    if (uvprojExamples?.length) entries.push({ categories: [], header: 'µVISION EXAMPLES (require conversion)', items: uvprojExamples.map(mapExample) });
    if (localCsolutionExamples?.length) entries.push({ categories: [], header: 'LOCAL CMSIS SOLUTION EXAMPLES', items: localCsolutionExamples.map(mapLocalExample) });
    if (localUvprojExamples?.length) entries.push({ categories: [], header: 'LOCAL µVISION EXAMPLES (require conversion)', items: localUvprojExamples.map(mapLocalExample) });
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
