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
import { simulateChangeEvent } from '../../../../__test__/dom-events';
import { TargetsTable } from './targets-table';
import { TargetType } from '../state/manage-solution-state';

describe('TargetsTable', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
        container.remove();
    });

    it('renders a row for each of the given targets', () => {
        const targetOptions: TargetType[] = [
            {
                name: 'my-type-1',
                board: 'my board 1',
                device: 'my device 1',
            },
            {
                name: 'my-type-2',
                board: 'my board 2',
                device: 'my device 2',
            },
        ];

        React.act(() => {
            createRoot(container).render(
                <TargetsTable options={targetOptions} selectedTarget={undefined} updateSelectedTarget={jest.fn()} addContext={jest.fn()} />
            );
        });

        const targets = container.querySelectorAll('.target-option');
        expect(targets).toHaveLength(2);

        for (let i = 0; i < 2; i++) {
            expect(targets[i].querySelector('.target-type')?.innerHTML).toBe(targetOptions[i].name);
            expect(targets[i].querySelector('.board-name')?.innerHTML).toBe(targetOptions[i].board);
            expect(targets[i].querySelector('.device-name')?.innerHTML).toBe(targetOptions[i].device);
        }
    });

    it('checks the target option checkbox for the given selected target', () => {
        const targetOptions: TargetType[] = [
            {
                name: 'my-type',
                board: 'my board',
                device: 'my device'
            },
        ];

        React.act(() => {
            createRoot(container).render(
                <TargetsTable options={targetOptions} selectedTarget={targetOptions[0]} updateSelectedTarget={jest.fn()} addContext={jest.fn()} />
            );
        });

        const target = container.querySelector('.target-option input');
        expect(target?.getAttribute('checked')).not.toBeNull();
    });

    it('dispatches the SET_SELECTED_TARGET when changing an option', () => {
        const updateContextSelection = jest.fn();
        const targetOptions: TargetType[] = [
            {
                name: 'my-type-1',
                board: 'my board 1',
                device: 'my device 1'
            },
            {
                name: 'my-type-2',
                board: 'my board 2',
                device: 'my device 2'
            },
        ];
        React.act(() => {
            createRoot(container).render(
                <TargetsTable options={targetOptions} selectedTarget={targetOptions[0]} updateSelectedTarget={updateContextSelection} addContext={jest.fn()} />
            );
        });

        const target = container.querySelectorAll<HTMLInputElement>('.target-option input');
        simulateChangeEvent(target[1]);

        expect(updateContextSelection).toHaveBeenCalledWith({
            type: 'SET_SELECTED_TARGET',
            set: undefined,
            target: 'my-type-2'
        });

    });
    it('renders the CompactDropdown with correct options and selected value', async () => {
        const targetOptions: TargetType[] = [
            {
                name: 'my-type',
                targetSets: [
                    { name: 'set-1' },
                    { name: 'set-2' },
                ],
                selectedSet: 'set-1',
                board: 'my board',
                device: 'my device'
            },
        ];

        React.act(() => {
            createRoot(container).render(
                <TargetsTable options={targetOptions} selectedTarget={undefined} updateSelectedTarget={jest.fn()} addContext={jest.fn()} />
            );
        });

        const dropdown = container.querySelector('.target-set .compact-dropdown');
        expect(dropdown).not.toBeNull();
        React.act(() => {
            dropdown?.querySelector('.compact-dropdown-trigger')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        await new Promise((r) => setTimeout(r, 500));

        const options = dropdown?.querySelectorAll('li');
        expect(options).toHaveLength(2);
        expect(options?.[0].innerHTML).toContain('set-1');
        expect(options?.[1].innerHTML).toContain('set-2');

        const selectedValue = dropdown?.querySelector('.compact-dropdown-trigger');
        expect(selectedValue?.innerHTML).toContain('set-1');
    });

    it('updates the selected target set when CompactDropdown value changes', async () => {
        const updateContextSelection = jest.fn();
        const targetOptions: TargetType[] = [
            {
                name: 'my-type',
                targetSets: [
                    { name: 'set-1' },
                    { name: 'set-2' },
                ],
                selectedSet: 'set-1',
                board: 'my board',
                device: 'my device'
            },
        ];

        React.act(() => {
            createRoot(container).render(
                <TargetsTable options={targetOptions} selectedTarget={targetOptions[0]} updateSelectedTarget={updateContextSelection} addContext={jest.fn()} />
            );
        });

        const dropdown = container.querySelector('.target-set .compact-dropdown');

        React.act(() => {
            dropdown?.querySelector('.compact-dropdown-trigger')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        await new Promise((r) => setTimeout(r, 500));

        const options = dropdown?.querySelectorAll('li');

        React.act(() => {
            options?.[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(updateContextSelection).toHaveBeenCalledWith({
            type: 'SET_SELECTED_TARGET',
            'set': 'set-2',
            'target': 'my-type',
        });
    });

});
