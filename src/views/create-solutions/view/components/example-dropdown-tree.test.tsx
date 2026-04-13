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
import { ExampleProject } from '../../../../solar-search/solar-search-client';
import { cSolutionExampleFactory, uvProjExampleFactory } from '../../../../solar-search/solar-search-client.factories';

describe('ExampleDropdownTree', () => {
    let container: Element;
    let dispatch: jest.Mock;
    let close: jest.Mock;

    beforeEach(() => {
        dispatch = jest.fn();
        close = jest.fn();
        container = document.createElement('div');
    });

    afterEach(() => {
        container.remove();
    });

    it('renders the number of examples', () => {
        const examples: ExampleProject[] = [cSolutionExampleFactory(), uvProjExampleFactory()];

        React.act(() => {
            createRoot(container).render(<ExampleDropdownTree
                examples={examples}
                dispatch={dispatch}
                label='Test'
                onChange={close}
                searchText=''
                title='Test'
                datamanagerApps={[]}
            />);
        });

        const dropDown = container.querySelector('#create-solution-template') as HTMLButtonElement;
        React.act(() => {
            Simulate.click(dropDown);
        });

        const formatHeader = container.querySelector('.components-tree-view-category');
        expect(formatHeader?.innerHTML).toContain('CMSIS SOLUTION EXAMPLES (1)');
    });

    it('renders an example entry for each given example', () => {
        const examples: ExampleProject[] = [cSolutionExampleFactory(), uvProjExampleFactory()];

        React.act(() => {
            createRoot(container).render(<ExampleDropdownTree
                examples={examples}
                dispatch={dispatch}
                label='Test'
                onChange={close}
                searchText=''
                title='Test'
                datamanagerApps={[]}
            />);
        });

        const dropDown = container.querySelector('#create-solution-template') as HTMLButtonElement;
        React.act(() => {
            Simulate.click(dropDown);
        });

        const exampleEntries = container.querySelectorAll('.components-tree-view-item');
        expect(exampleEntries).toHaveLength(2);
        expect(exampleEntries[0].innerHTML).toContain(examples[0].name);
        expect(exampleEntries[0].innerHTML).toContain(examples[0].description);
        expect(exampleEntries[1].innerHTML).toContain(examples[1].name);
        expect(exampleEntries[1].innerHTML).toContain(examples[1].description);
    });

    it('clicking on the example entry dispatches the message', () => {
        const examples: ExampleProject[] = [cSolutionExampleFactory(), uvProjExampleFactory()];

        React.act(() => {
            createRoot(container).render(<ExampleDropdownTree
                examples={examples}
                dispatch={dispatch}
                label='Test'
                onChange={jest.fn()}
                searchText=''
                title='Test'
                datamanagerApps={[]}
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
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SELECTED_TEMPLATE', template : { type: 'example', value: examples[0] } });
    });
});
