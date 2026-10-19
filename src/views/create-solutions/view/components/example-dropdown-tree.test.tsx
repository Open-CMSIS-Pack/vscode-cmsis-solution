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
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { ExampleDropdownTree } from './example-dropdown-tree';
import { blankTemplate, trustZoneTemplate } from '../state/templates';
import { TreeViewCategory } from '../../../common/components/tree-view';

describe('ExampleDropdownTree', () => {
    let container: Element;
    let onSelect: jest.Mock;
    let close: jest.Mock;

    const templateEntries = (templates = [blankTemplate, trustZoneTemplate]): Array<TreeViewCategory<string>> => [{
        header: 'Templates',
        categories: [],
        items: templates.map(template => ({
            label: template.name,
            value: `template::${template.name}`,
            tooltip: template.description,
            className: 'template',
        })),
    }];

    beforeEach(() => {
        onSelect = jest.fn();
        close = jest.fn();
        container = document.createElement('div');
    });

    afterEach(() => {
        container.remove();
    });

    it('renders the number of templates', () => {
        React.act(() => {
            createRoot(container).render(<ExampleDropdownTree
                entries={templateEntries()}
                label='Test'
                onChange={close}
                onSelect={onSelect}
                searchText=''
                selectedText='Select Project'
                title='Test'
            />);
        });

        const dropDown = container.querySelector('#create-solution-template') as HTMLButtonElement;
        React.act(() => {
            Simulate.click(dropDown);
        });

        const formatHeader = container.querySelector('.components-tree-view-category');
        expect(formatHeader?.innerHTML).toContain('Templates (2)');
    });

    it('renders an entry for each given template', () => {
        const templates = [blankTemplate, trustZoneTemplate];
        React.act(() => {
            createRoot(container).render(<ExampleDropdownTree
                entries={templateEntries(templates)}
                label='Test'
                onChange={close}
                onSelect={onSelect}
                searchText=''
                selectedText='Select Project'
                title='Test'
            />);
        });

        const dropDown = container.querySelector('#create-solution-template') as HTMLButtonElement;
        React.act(() => {
            Simulate.click(dropDown);
        });

        const exampleEntries = container.querySelectorAll('.components-tree-view-item');
        expect(exampleEntries).toHaveLength(2);
        expect(exampleEntries[0].innerHTML).toContain(templates[0].name);
        expect(exampleEntries[0].innerHTML).toContain(templates[0].description);
        expect(exampleEntries[1].innerHTML).toContain(templates[1].name);
        expect(exampleEntries[1].innerHTML).toContain(templates[1].description);
    });

    it('emits a selected template value', () => {
        React.act(() => {
            createRoot(container).render(<ExampleDropdownTree
                entries={templateEntries([blankTemplate])}
                label='Test'
                onChange={jest.fn()}
                onSelect={onSelect}
                searchText=''
                selectedText='Select Project'
                title='Test'
            />);
        });

        const dropDown = container.querySelector('#create-solution-template') as HTMLButtonElement;
        React.act(() => {
            Simulate.click(dropDown);
        });

        const triggerEl = container.querySelector('.components-tree-view-item');

        React.act(() => {
            Simulate.click(triggerEl!);
        });
        expect(onSelect).toHaveBeenCalledWith(`template::${blankTemplate.name}`);
    });

    it('clicking a DataManager project dispatches its stable ID', () => {
        const draftId = 'draft-project-id';
        React.act(() => {
            createRoot(container).render(<ExampleDropdownTree
                entries={[{
                    header: 'Examples',
                    categories: [],
                    items: [{ label: 'DataManager project', value: draftId }],
                }]}
                label='Test'
                onChange={jest.fn()}
                onSelect={onSelect}
                searchText=''
                selectedText='Select Project'
                title='Test'
            />);
        });

        const dropDown = container.querySelector('#create-solution-template') as HTMLButtonElement;
        React.act(() => {
            Simulate.click(dropDown);
        });

        const triggerEl = container.querySelector('.components-tree-view-item');
        React.act(() => {
            Simulate.click(triggerEl!);
        });

        expect(onSelect).toHaveBeenCalledWith(draftId);
    });
});
