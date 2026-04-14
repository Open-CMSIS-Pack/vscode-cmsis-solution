/**
 * Copyright 2026 Arm Limited
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

import 'jest';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { CompactDropdown } from './compact-dropdown';

describe('CompactDropdown', () => {
    let container: Element;
    let onChange: jest.Mock;

    beforeEach(() => {
        onChange = jest.fn();
        container = document.createElement('div');
    });

    afterEach(() => {
        container.remove();
    });

    it('renders an empty string if there are no options', () => {
        React.act(() => {
            createRoot(container).render(<CompactDropdown onChange={onChange} selected="" available={[]} />);
        });

        expect(container.textContent?.trim()).toBe('');
        expect(container.querySelectorAll('select').length).toBe(0);
    });

    it('renders the selected option if there is one option', () => {
        const selected = 'The Selection';

        React.act(() => {
            createRoot(container).render(<CompactDropdown onChange={onChange} selected={selected} available={[selected]} />);
        });

        expect(container.textContent?.trim()).toBe(selected);
        expect(container.querySelectorAll('select').length).toBe(0);
    });

    describe('with more than one available option', () => {
        let containerClick: jest.Mock;
        const available = [
            'option-1',
            'option-2',
            'option-3'
        ];

        const initialSelection = available[1];
        const newSelection = available[2];

        beforeEach(() => {
            containerClick = jest.fn();

            React.act(() => {
                createRoot(container).render(
                    <div onClick={containerClick}>
                        <CompactDropdown onChange={onChange} selected={initialSelection} available={available} />
                    </div>
                );
            });
        });

        it('shows the selected value in the trigger element', () => {
            const triggerEl = container.querySelector('.compact-dropdown-trigger');
            expect(triggerEl).toBeTruthy();
            expect(triggerEl!.textContent?.includes(initialSelection)).toBeTruthy();
        });

        it('renders a closed dropdown', () => {
            const dropdownAnchor = container.querySelector('.mbs-dropdown-anchor');
            expect(dropdownAnchor).toBeTruthy();
            const dropdownEl = dropdownAnchor!.querySelector('.mbs-dropdown');
            expect(dropdownEl).toBeFalsy();
        });

        describe('when the trigger is clicked', () => {
            beforeEach(() => {
                const triggerEl = container.querySelector('.compact-dropdown-trigger');

                React.act(() => {
                    Simulate.click(triggerEl!);
                });
            });

            it('opens the dropdown', () => {
                const dropdownEl = container.querySelector('.mbs-dropdown-anchor .mbs-dropdown');
                expect(dropdownEl).toBeTruthy();
            });

            it('renders a search list and a list item for each available option', () => {
                expect(container.querySelector('.search-list-values')).toBeTruthy();

                const lis = container.querySelectorAll('.search-list-values li');
                expect(lis.length).toBe(3);

                for (const option of available) {
                    expect(container.querySelector(`.search-list-values li[data-value="${option}"]`)).toBeTruthy();
                }
            });

            it('stops the event from propagating', () => {
                expect(containerClick).not.toHaveBeenCalled();
            });

            it('highlights the currently selected option in the list', () => {
                const selectedLi = container.querySelector(`.search-list-values li[data-value="${initialSelection}"]`);
                expect(selectedLi).toBeTruthy();
                expect(selectedLi!.classList.contains('compact-dropdown-selected')).toBe(true);
            });

            describe('then a new option is selected', () => {
                beforeEach(() => {
                    const liEl = container.querySelector(`.search-list-values li[data-value="${newSelection}"]`);

                    React.act(() => {
                        Simulate.click(liEl!);
                    });
                });

                it('calls on change with the new option', () => {
                    expect(onChange).toHaveBeenCalledTimes(1);
                    expect(onChange).toHaveBeenLastCalledWith(newSelection);
                });

                it('closes the dropdown', () => {
                    const dropdownEl = container.querySelector('.mbs-dropdown-anchor .mbs-dropdown');
                    expect(dropdownEl).toBeFalsy();
                });
            });
        });
    });

    describe('with option tags', () => {
        beforeEach(() => {
            const available = [
                'option-1',
                'option-2',
                'option-3'
            ];
            const tagLabels = ['tag1', 'tag2', 'tag3'];
            const testTag = 'tag';
            const initialSelection = available[0];
            const tagSelect = <span className='search-list-tag'>{testTag}</span>;
            React.act(() => {
                createRoot(container).render(<CompactDropdown
                    onChange={onChange}
                    selected={initialSelection}
                    available={available}
                    tag={tagSelect}
                    tagLabels={tagLabels}
                />);
            });
        });
        it('renders the selected option with an optional tag', () => {
            const expected = 'tag';

            expect(container.querySelector('.search-list-tag')?.innerHTML).toBe(expected);
        });

        it('renders the available options with optional tags', () => {
            const triggerEl = container.querySelector('.compact-dropdown-trigger');
            React.act(() => {
                Simulate.click(triggerEl!);
            });

            const lisTag = container.querySelectorAll('.search-list-tag');
            const expected = 'tag2';

            expect(lisTag[2].innerHTML).toBe(expected);
        });
    });
});
