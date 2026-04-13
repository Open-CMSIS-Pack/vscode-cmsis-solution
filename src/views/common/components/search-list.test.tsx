/**
 * Copyright 2021-2026 Arm Limited
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

import { createRoot } from 'react-dom/client';
import * as React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { SearchList } from './search-list';
import { simulateChangeEvent } from '../../../__test__/dom-events';

describe('SearchList', () => {
    let container: Element;
    const values = ['aa', 'ab', 'bb'];

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
        container.remove();
    });

    it('renders all values', () => {
        React.act(() => {
            createRoot(container).render(
                <SearchList onSelect={jest.fn()} values={values} />
            );
        });

        expect(container.querySelectorAll('li').length).toBe(values.length);
    });

    it('calls onSelect on item click', () => {
        const onSelect = jest.fn();
        React.act(() => {
            createRoot(container).render(
                <SearchList onSelect={onSelect} values={values} />
            );
        });

        expect(onSelect).not.toHaveBeenCalled();

        const liElements = container.querySelectorAll('li');
        const element = liElements[1];
        React.act(() => {
            Simulate.click(element);
        });

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith(values[1]);
    });

    it('prevents event propagation on click', () => {
        const containerClick = jest.fn();

        React.act(() => {
            createRoot(container).render(
                <div onClick={containerClick}>
                    <SearchList onSelect={jest.fn()} values={values} />
                </div>
            );
        });

        const liElements = container.querySelectorAll('li');
        const element = liElements[1];

        React.act(() => {
            Simulate.click(element);
        });

        expect(containerClick).not.toHaveBeenCalled();
    });

    it('filters values on search', () => {
        React.act(() => {
            createRoot(container).render(
                <SearchList onSelect={jest.fn()} values={values} />
            );
        });

        expect(container.querySelectorAll('li').length).toBe(3);

        const searchInput = container.querySelector('input')!;
        simulateChangeEvent(searchInput, 'a');

        expect(container.querySelectorAll('li').length).toBe(2);
    });

    it('render all values with optional taglist', ()=> {
        const tagLabels = ['tag1', 'tag2', 'tag3'];
        React.act(() => {
            createRoot(container).render(
                <SearchList onSelect={jest.fn()} values={values} tagLabel={tagLabels ? (value: string) => tagLabels[values.indexOf(value)] : undefined}/>
            );
        });
        const lisTag = container.querySelectorAll('.search-list-tag');
        expect(lisTag[1].innerHTML).toBe(tagLabels[1]);
    });

    describe('searchable flag', () => {
        it('renders search box if true', () => {
            React.act(() => {
                createRoot(container).render(
                    <SearchList
                        onSelect={jest.fn()}
                        values={values}
                        searchable={true}
                    />
                );
            });

            expect(
                container.querySelectorAll('.search-list-input').length
            ).toEqual(1);
        });

        it('does not render search box if false', () => {
            React.act(() => {
                createRoot(container).render(
                    <SearchList
                        onSelect={jest.fn()}
                        values={values}
                        searchable={false}
                    />
                );
            });

            expect(
                container.querySelectorAll('.search-list-input').length
            ).toEqual(0);
        });
    });
});
