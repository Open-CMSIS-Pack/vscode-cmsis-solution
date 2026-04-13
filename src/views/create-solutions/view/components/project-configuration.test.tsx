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
import { NewProject } from '../../cmsis-solution-types';
import { deviceHardwareOptionFactory, newProjectFactory } from '../../cmsis-solution-types.factories';
import { Tz } from '../../../../core-tools/client/packs_pb';
import { FieldAndInteraction } from '../state/field-and-interaction';
import { simulateChangeEvent } from '../../../../__test__/dom-events';

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

    it('renders the project configuration info for device reference', () => {
        const projects: FieldAndInteraction<NewProject>[] =  [{
            value: newProjectFactory({
                trustzone: 'secure',
                processorName: '',
                name: 'IO6-Alen',
            }),
            hadInteraction: false }
        ];
        const device = {
            id: { name: 'blast-blast-2000', vendor: 'c7-mark12-intergalatic' },
            key: 'boardHardwareOption::blast-blast-2000',
            processors: [{ tz: Tz.TZ, core: 'M0', name: '' }],
            pack: {
                name: '',
                vendor: '',
                version: ''
            },
        };

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                device={device}
                projects={projects}
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
        const projects = [{ value: newProjectFactory(), hadInteraction: false }];
        const device = deviceHardwareOptionFactory();

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                device={device}
                projects={projects}
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
        const projects = [{ value: newProjectFactory(), hadInteraction: false }, { value: newProjectFactory(), hadInteraction: false }];
        const device = deviceHardwareOptionFactory();

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                device={device}
                projects={projects}
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
        const projects = [{ value: newProjectFactory(), hadInteraction: false }, { value: newProjectFactory(), hadInteraction: false }];
        const device = deviceHardwareOptionFactory();

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                device={device}
                projects={projects}
                dispatch={dispatch}
                errors={[]}
            />);
        });

        const targetElement = container.querySelector('[placeholder="Project name"]') as HTMLInputElement;
        simulateChangeEvent(targetElement, 'NewValue');

        expect(dispatch).toHaveBeenCalledWith({ type: 'MODIFY_PROJECT', request: { type: 'UPDATE_PROJECT_NAME', index: 0, name: 'NewValue' } });
    });

    it('update to the core selected in the dropdown', () => {
        const projects = [
            { value: newProjectFactory({ name: '', processorName: 'core1' }), hadInteraction: false },
            { value: newProjectFactory(), hadInteraction: false }
        ];

        const device = {
            id: { name: 'device1', vendor: 'vendor1' },
            key: 'vendor1::device1',
            processors: [{ name: 'the-core', core: 'core1-0', tz: Tz.TZ_NO }, { name: '', core: 'core1-1', tz: Tz.TZ_NO }],
            pack: { name: '', vendor: '', version: '' },
        };

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                device={device}
                projects={projects}
                dispatch={dispatch}
                errors={[]}
            />);
        });

        const targetElement = container.querySelectorAll('.dropdownCore');
        const dropdownList = targetElement[0].querySelectorAll('vscode-option');

        React.act(() => {
            Simulate.click(dropdownList[0]!);
        });

        expect(dispatch).toHaveBeenCalledWith({ type: 'MODIFY_PROJECT', request: { type: 'UPDATE_PROJECT_CORE', index: 0, processorName: 'the-core' } });
    });

    it('update to the trustzone selected in the dropdown', () => {
        const projects = [{ value: newProjectFactory({ processorName: 'coreA', trustzone: 'secure' }), hadInteraction: false }];
        const device = deviceHardwareOptionFactory({
            id: { name: 'some-device', vendor: 'some-vendor' },
            processors: [ { name: 'coreA', core: 'Cortex-M', tz: Tz.TZ }]
        });

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                device={device}
                projects={projects}
                dispatch={dispatch}
                errors={[]}
            />);
        });
        const targetElement = container.querySelectorAll('.dropdownTrustzone');
        const dropdownList = targetElement[0].querySelectorAll('vscode-option');

        React.act(() => {
            Simulate.click(dropdownList[1]!);
        });

        expect(dispatch).toHaveBeenCalledWith({ type: 'MODIFY_PROJECT', request: { type: 'UPDATE_PROJECT_TRUSTZONE', index: 0, trustzone: 'non-secure' } });
    });

    it('display the validation error for the project configuration', () => {
        const projects = [{ value: newProjectFactory(), hadInteraction: false }, { value: newProjectFactory(), hadInteraction: true }];
        const device = deviceHardwareOptionFactory();

        React.act(() => {
            createRoot(container).render(<ProjectConfiguration
                device={device}
                projects={projects}
                dispatch={dispatch}
                errors={['', 'another-error']}
            />);
        });
        expect(Array.from(container.querySelectorAll('.input-validation-error'))).toHaveLength(1);
        expect(container.innerHTML).toContain('another-error');
    });
});
