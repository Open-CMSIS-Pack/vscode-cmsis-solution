/**
 * Copyright 2023-2026 Arm Limited
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

import React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { ProjectConfiguration } from './project-configuration';
import { newProjectFactory } from '../../cmsis-solution-types.factories';
import { simulateChangeEvent } from '../../../../__test__/dom-events';
import { ProjectConfigurationRow } from '../create-solution-view-model';

describe('ProjectConfiguration', () => {
    let container: Element;
    let dispatch: jest.Mock;

    beforeEach(() => {
        dispatch = jest.fn();
        container = document.createElement('div');
    });

    afterEach(() => {
        container.remove();
    });

    const createRow = (overrides: Partial<ProjectConfigurationRow> = {}): ProjectConfigurationRow => ({
        project: { value: newProjectFactory(), hadInteraction: false },
        coreOptions: ['core'],
        selectedCore: 'core',
        trustzoneOptions: ['off'],
        ...overrides,
    });

    it('renders the project configuration info for device reference', () => {
        const rows = [createRow({
            project: { value: newProjectFactory({
                trustzone: 'secure',
                processorName: '',
                name: 'IO6-Alen',
            }),
            hadInteraction: false },
            coreOptions: [''],
            selectedCore: 'M0',
            trustzoneOptions: ['secure', 'non-secure', 'off'],
        })];

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                rows={rows}
                showTrustzoneInfo={true}
                dispatch={dispatch}
                errors={[]}
            />);
        });

        const projectHeaders = container.querySelector('.layout-header');
        expect(projectHeaders?.innerHTML.includes('Project Name')).toBeTruthy();
        expect(projectHeaders?.innerHTML.includes('Core')).toBeTruthy();
        expect(projectHeaders?.innerHTML.includes('TrustZone')).toBeTruthy();

        const configInfo = container.querySelectorAll('.layout-config-info');
        expect(configInfo.length).toBe(1);
        expect(configInfo[0].innerHTML).toContain('input');
        expect(configInfo[0].innerHTML).toContain('M0');
        expect(configInfo[0].innerHTML).toContain('secure');
        expect(configInfo[0].innerHTML).toContain('codicon-trash');
    });

    it('Add project configuration', () => {
        const rows = [createRow()];

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                rows={rows}
                showTrustzoneInfo={false}
                dispatch={dispatch}
                errors={[]}
            />);
        });
        const targetElement = container.querySelector('[title="Add a new project configuration row"');
        React.act(() => {
            Simulate.click(targetElement!);
        });
        expect(dispatch).toHaveBeenCalledWith({ type: 'MODIFY_PROJECT', request: { type: 'ADD_PROJECT' } });
    });

    it('Remove project configuration', () => {
        const rows = [createRow(), createRow()];

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                rows={rows}
                showTrustzoneInfo={false}
                dispatch={dispatch}
                errors={[]}
            />);
        });
        const targetElement = container.querySelectorAll('[aria-label="Delete"');
        React.act(() => {
            Simulate.click(targetElement[1]!);
        });
        expect(dispatch).toHaveBeenCalledWith({ type: 'MODIFY_PROJECT', request: { type: 'REMOVE_PROJECT', index: 1 } });
    });


    it('update project configuration', () => {
        const rows = [createRow(), createRow()];

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                rows={rows}
                showTrustzoneInfo={false}
                dispatch={dispatch}
                errors={[]}
            />);
        });

        const targetElement = container.querySelector('[placeholder="Project name"]') as HTMLInputElement;
        simulateChangeEvent(targetElement, 'NewValue');

        expect(dispatch).toHaveBeenCalledWith({ type: 'MODIFY_PROJECT', request: { type: 'UPDATE_PROJECT_NAME', index: 0, name: 'NewValue' } });
    });

    it('update to the core selected in the dropdown', async () => {
        const rows = [
            createRow({
                project: { value: newProjectFactory({ name: '', processorName: 'core1' }), hadInteraction: false },
                coreOptions: ['the-core', ''],
                selectedCore: 'core1',
            }),
            createRow(),
        ];

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                rows={rows}
                showTrustzoneInfo={false}
                dispatch={dispatch}
                errors={[]}
            />);
        });

        const targetElement = container.querySelector('.dropdownCore');
        await React.act(async () => { // Open the dropdown
            Simulate.click(targetElement!.querySelector('.compact-dropdown-trigger')!);
        });

        const dropdownList = targetElement!.querySelectorAll('li');
        await React.act(async () => { // Click the first option in the dropdown
            Simulate.click(dropdownList[0]!);
        });

        expect(dispatch).toHaveBeenCalledWith({ type: 'MODIFY_PROJECT', request: { type: 'UPDATE_PROJECT_CORE', index: 0, processorName: 'the-core' } });
    });

    it('update to the trustzone selected in the dropdown', async () => {
        const rows = [createRow({
            project: { value: newProjectFactory({ processorName: 'coreA', trustzone: 'secure' }), hadInteraction: false },
            trustzoneOptions: ['secure', 'non-secure', 'off'],
        })];

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                rows={rows}
                showTrustzoneInfo={true}
                dispatch={dispatch}
                errors={[]}
            />);
        });
        const targetElement = container.querySelector('.dropdownTrustzone');
        await React.act(async () => { // Open the dropdown
            Simulate.click(targetElement!.querySelector('.compact-dropdown-trigger')!);
        });

        const dropdownList = targetElement!.querySelectorAll('li');
        await React.act(async () => { // Click the second option in the dropdown
            Simulate.click(dropdownList[1]!);
        });

        expect(dispatch).toHaveBeenCalledWith({ type: 'MODIFY_PROJECT', request: { type: 'UPDATE_PROJECT_TRUSTZONE', index: 0, trustzone: 'non-secure' } });
    });

    it('display the validation error for the project configuration', () => {
        const rows = [createRow(), createRow({ project: { value: newProjectFactory(), hadInteraction: true } })];

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                rows={rows}
                showTrustzoneInfo={false}
                dispatch={dispatch}
                errors={['', 'another-error']}
            />);
        });
        expect(Array.from(container.querySelectorAll('.input-validation-error'))).toHaveLength(1);
        expect(container.innerHTML).toContain('another-error');
    });
});
