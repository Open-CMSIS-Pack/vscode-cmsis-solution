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
import { createRoot, Root } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { ImageSelection, ProjectSelection } from '../state/manage-solution-state';
import { ProjectsTable } from './projects-table';
import { simulateChangeEvent } from '../../../../__test__/dom-events';
import { BuildTypeDropdown } from './projects-table';
import { getSelected, hasOption, isDisabled, openCompactDropdown, openDropdown, selectCompactDropdownOption, selectOption } from '../../../common/components/dropdown-select.test-utils.test';

describe('ProjectsTable', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        root.unmount();
        container.remove();
    });

    it('renders a row for each of the given projects', () => {
        const projects: ProjectSelection[] = [
            { name: 'some-project-1', path: '/some/absolute/path/some-project-1.cproject.yml', buildTypes: [], selectedBuildType: '', load: 'none', selected: true },
            { name: 'some-project-2', path: '/some/absolute/path/some-project-2.cproject.yml', buildTypes: [], selectedBuildType: '', load: 'none', selected: true },
        ];

        React.act(() => {
            root.render(
                <ProjectsTable projects={projects} availableCores={[]} updateSolutionData={jest.fn()} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
            );
        });

        const projectNames = container.querySelectorAll('.name');
        expect(projectNames).toHaveLength(2);
        expect(projectNames[0].innerHTML).toBe(projects[0].name);
        expect(projectNames[1].innerHTML).toBe(projects[1].name);
    });

    it('renders an option for each build type that is valid for the project', () => {
        const projects: ProjectSelection[] = [{
            name: 'some-project',
            path: '/path/to/some-project.cproject.yml',
            buildTypes: ['type-1', 'type-2'],
            selectedBuildType: '',
            load: 'none',
            selected: true,
        }, {
            name: 'another-project',
            path: '/path/to/another-project.cproject.yml',
            buildTypes: ['type-1', 'type-2'],
            selectedBuildType: 'type-2',
            load: 'none',
            selected: true,
        }];

        React.act(() => {
            root.render(
                <ProjectsTable projects={projects} availableCores={[]} updateSolutionData={jest.fn()} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
            );
        });

        const dropdownCell = container.querySelector('td.build-type');
        openDropdown(dropdownCell!);
        expect(hasOption(dropdownCell!, 'type-1')).toBe(true);
        expect(hasOption(dropdownCell!, 'type-2')).toBe(true);
    });

    it('displays the selected build type value', () => {
        const projects: ProjectSelection[] = [{
            name: 'some-project',
            path: '/path/to/some-project.cproject.yml',
            buildTypes: ['type-1', 'type-2'],
            selectedBuildType: 'type-1',
            load: 'none',
            selected: true,
        }];

        React.act(() => {
            root.render(
                <ProjectsTable projects={projects} availableCores={[]} updateSolutionData={jest.fn()} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
            );
        });

        React.act(() => {
            root.render(
                <ProjectsTable projects={projects} availableCores={[]} updateSolutionData={jest.fn()} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
            );
        });

        const dropdownCell = container.querySelector('td.build-type');
        const selected = getSelected(dropdownCell!);
        expect(selected).toEqual('type-1');
    });

    it('dispatches the SET_LOAD_TYPE_SELECTION message when selecting a load type', () => {
        const projects: ProjectSelection[] = [{
            name: 'some-project',
            path: '/path/to/some-project.cproject.yml',
            buildTypes: ['type-1', 'type-2'],
            selectedBuildType: '',
            load: 'none',
            selected: true,
        }];
        const images: ImageSelection[] = [{
            name: 'some-image',
            path: '/path/to/some-image.cimage.yml',
            loadOffset: '0x0',
            load: 'none',
            selected: false,
        }];

        const updateContextSelection = jest.fn();
        React.act(() => {
            root.render(
                <ProjectsTable projects={projects} images={images} availableCores={[]} updateSolutionData={updateContextSelection} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
            );
        });

        const projectLoadDropdownCell = container.querySelector('.project .load-column');
        const imageLoadDropdownCell = container.querySelector('.image .load-column');
        openCompactDropdown(projectLoadDropdownCell!);
        selectCompactDropdownOption(projectLoadDropdownCell!, 'symbols');
        openCompactDropdown(imageLoadDropdownCell!);
        selectCompactDropdownOption(imageLoadDropdownCell!, 'symbols');

        expect(updateContextSelection).toHaveBeenCalledWith({
            type: 'SET_LOAD_TYPE_SELECTION',
            path: projects[0].path,
            loadType: 'symbols',
        });
        expect(updateContextSelection).toHaveBeenCalledWith({
            type: 'SET_LOAD_TYPE_SELECTION',
            path: images[0].path,
            loadType: 'symbols',
        });
    });

    it('renders a core selection dropdown when multiple cores are available', () => {
        const images: ImageSelection[] = [{
            name: 'some-image',
            path: '/path/to/some-image.cimage.yml',
            loadOffset: '0x0',
            load: 'none',
            selected: true,
        }];

        React.act(() => {
            root.render(
                <ProjectsTable projects={[]} images={images} availableCores={['C0', 'C1']} updateSolutionData={jest.fn()} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
            );
        });

        const coreDropdownCell = container.querySelector('.image .build-type');
        expect(coreDropdownCell?.querySelector('.compact-dropdown')).toBeTruthy();
    });

    it('dispatches the SET_CORE_SELECTION message when selecting a core', () => {
        const images: ImageSelection[] = [{
            name: 'some-image',
            path: '/path/to/some-image.cimage.yml',
            loadOffset: '0x0',
            load: 'none',
            selected: true,
        }];

        const updateContextSelection = jest.fn();
        React.act(() => {
            root.render(
                <ProjectsTable projects={[]} images={images} availableCores={['C0', 'C1']} updateSolutionData={updateContextSelection} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
            );
        });

        const coreDropdownCell = container.querySelector('.image .build-type');
        openCompactDropdown(coreDropdownCell!);
        selectCompactDropdownOption(coreDropdownCell!, 'C1');

        expect(updateContextSelection).toHaveBeenCalledWith({
            type: 'SET_CORE_SELECTION',
            path: images[0].path,
            core: 'C1',
        });
    });

    it('doesn\'t dispatch the SET_PROJECT_SELECTION message when only one project exists', () => {
        const projects: ProjectSelection[] = [{
            name: 'some-project',
            path: '/path/to/some-project.cproject.yml',
            buildTypes: ['type-1', 'type-2'],
            selectedBuildType: 'type-1',
            load: 'image+symbols',
            selected: true,
        }];

        const updateContextSelection = jest.fn();
        React.act(() => {
            root.render(
                <ProjectsTable projects={projects} availableCores={[]} updateSolutionData={updateContextSelection} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
            );
        });
        const project = container.querySelector('.project input[type="checkbox"]');

        simulateChangeEvent(project as HTMLInputElement, 'on');

        expect(updateContextSelection).not.toHaveBeenCalledWith({
            type: 'SET_PROJECT_SELECTION',
            projectPath: projects[0].path,
            selected: true,
        });
    });

    it('dispatches the SET_PROJECT_SELECTION message when selecting a project', () => {
        const projects: ProjectSelection[] = [{
            name: 'some-project',
            path: '/path/to/some-project.cproject.yml',
            buildTypes: ['type-1', 'type-2'],
            selectedBuildType: '',
            load: 'none',
            selected: false,
        }, {
            name: 'another-project',
            path: '/path/to/another-project.cproject.yml',
            buildTypes: ['type-1', 'type-2'],
            selectedBuildType: '',
            load: 'none',
            selected: false,
        }];

        const updateContextSelection = jest.fn();
        React.act(() => {
            root.render(
                <ProjectsTable projects={projects} availableCores={[]} updateSolutionData={updateContextSelection} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
            );
        });
        const project = container.querySelector('.project input[type="checkbox"]');

        simulateChangeEvent(project as HTMLInputElement, 'on');

        expect(updateContextSelection).toHaveBeenCalledWith({
            type: 'SET_PROJECT_SELECTION',
            projectPath: projects[0].path,
            selected: true,
        });
    });

    it('dispatches the SET_BUILD_TYPE_SELECTION message when selecting a build type', () => {
        const projects: ProjectSelection[] = [{
            name: 'some-project',
            path: '/path/to/some-project.cproject.yml',
            buildTypes: ['Release', 'Debug'],
            selectedBuildType: '',
            load: 'none',
            selected: true,
        }, {
            name: 'another-project',
            path: '/path/to/another-project.cproject.yml',
            buildTypes: ['Release', 'Debug'],
            selectedBuildType: '',
            load: 'none',
            selected: false,
        }];

        const updateContextSelection = jest.fn();
        React.act(() => {
            root.render(
                <ProjectsTable projects={projects} availableCores={[]} updateSolutionData={updateContextSelection} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
            );
        });

        const dropdownCell = container.querySelector('td.build-type');
        openDropdown(dropdownCell!);
        selectOption(dropdownCell!, 'Debug');

        expect(updateContextSelection).toHaveBeenCalledWith({
            type: 'SET_BUILD_TYPE_SELECTION',
            projectPath: projects[0].path,
            buildType: 'Debug',
        });
    });

    it('calls the openFile function when clicking on the project file link', () => {
        const projects: ProjectSelection[] = [
            { name: 'some-project', path: '/path/to/some-project.cproject.yml', buildTypes: [], selectedBuildType: '', load: 'none', selected: true },
        ];

        const openFile = jest.fn();
        React.act(() => {
            root.render(
                <ProjectsTable projects={projects} availableCores={[]} updateSolutionData={jest.fn()} openFile={openFile} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
            );
        });
        const projectLink = container.querySelector('.project a');

        React.act(() => {
            if (projectLink) {
                Simulate.click(projectLink);
            }
        });

        expect(openFile).toHaveBeenCalledWith(projects[0].path);
    });

    it('disables the project row when there are no build types to select', () => {
        const projects: ProjectSelection[] = [{
            name: 'some-project',
            path: '/path/to/some-project.cproject.yml',
            buildTypes: [],
            selected: true,
            selectedBuildType: '',
            load: 'none',
        }];

        React.act(() => {
            root.render(
                <ProjectsTable projects={projects} availableCores={[]} updateSolutionData={jest.fn()} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
            );
        });

        const projectNameField = container.querySelector('.project .name');
        expect(projectNameField?.className).not.toContain('disabled');
        const dropdownCell = container.querySelector('td.build-type');
        const selected = getSelected(dropdownCell!);
        expect(selected).toEqual('');
        expect(isDisabled(dropdownCell!)).toBe(true);
    });

    describe('BuildTypeDropdown', () => {
        let container: Element;

        beforeEach(() => {
            container = document.createElement('div');
        });

        afterEach(() => {
            container.remove();
        });

        it('renders the correct text for the selected build type', () => {
            React.act(() => {
                createRoot(container).render(
                    <BuildTypeDropdown
                        projectPath="/path/to/project"
                        buildTypes={['Release', 'Debug']}
                        selectedBuildType="Debug"
                        updateSolutionData={jest.fn()}
                    />
                );
            });

            const dropdownText = container.querySelector('.build-type-dropdown')?.textContent;
            expect(dropdownText).toBe('Debug');
        });

        it('renders the first available buildType when project is disabled', () => {
            React.act(() => {
                createRoot(container).render(
                    <BuildTypeDropdown
                        projectPath="/path/to/project"
                        buildTypes={['Release', 'Debug']}
                        selectedBuildType=""
                        disabled={true}
                        updateSolutionData={jest.fn()}
                    />
                );
            });

            const dropdownText = container.querySelector('.build-type-dropdown')?.textContent;
            expect(dropdownText).toBe('Release');
        });

        it('calls updateContextSelection with the correct build type when an option is selected', () => {
            const updateContextSelection = jest.fn();

            React.act(() => {
                createRoot(container).render(
                    <BuildTypeDropdown
                        projectPath="/path/to/project"
                        buildTypes={['Release', 'Debug']}
                        selectedBuildType=""
                        updateSolutionData={updateContextSelection}
                    />
                );
            });

            const dropdown = container.querySelector('.build-type-dropdown');
            React.act(() => {
                openDropdown(dropdown!);
            });

            const option = container.querySelector('ul li:nth-child(2)');
            React.act(() => {
                option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            });

            expect(updateContextSelection).toHaveBeenCalledWith({
                type: 'SET_BUILD_TYPE_SELECTION',
                projectPath: '/path/to/project',
                buildType: 'Debug',
            });
        });

        it('displays the first build type as default when no selection is made', () => {
            React.act(() => {
                createRoot(container).render(
                    <BuildTypeDropdown
                        projectPath="/path/to/project"
                        buildTypes={['Release', 'Debug']}
                        selectedBuildType=""
                        updateSolutionData={jest.fn()}
                    />
                );
            });

            const dropdownText = container.querySelector('.build-type-dropdown')?.textContent;
            expect(dropdownText).toBe('Release');
        });
    });

    describe('<ProjectsTable />', () => {
        const container: Element = document.createElement('div');

        it('renders the correct number of rows for projects', () => {
            const projects: ProjectSelection[] = [
                { name: 'project-1', path: '/path/project-1.cproject.yml', buildTypes: [], selectedBuildType: '', load: 'none', selected: true },
                { name: 'project-2', path: '/path/project-2.cproject.yml', buildTypes: [], selectedBuildType: '', load: 'none', selected: false },
            ];

            React.act(() => {
                createRoot(container).render(
                    <ProjectsTable projects={projects} availableCores={[]} updateSolutionData={jest.fn()} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
                );
            });

            const rows = container.querySelectorAll('tbody .project');
            expect(rows).toHaveLength(2);
        });

        it('renders the "Add Project" button and triggers the addProject function on click', () => {
            const addProject = jest.fn();

            React.act(() => {
                createRoot(container).render(
                    <ProjectsTable projects={[]} availableCores={[]} updateSolutionData={jest.fn()} openFile={jest.fn()} addProject={addProject} addImage={jest.fn()} unlinkImage={jest.fn()} />
                );
            });

            const addButton = container.querySelector('.add-button');
            expect(addButton).toBeTruthy();

            React.act(() => {
                addButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            });

            expect(addProject).not.toHaveBeenCalled();
        });

        it('renders additional images section when images are provided', () => {
            const images: ImageSelection[] = [
                {
                    name: 'image-1', loadOffset: '0x1000', selected: true,
                    path: './image1.afx',
                    load: 'image'
                },
                {
                    name: 'image-2', loadOffset: '0x2000', selected: false,
                    path: './image2.afx',
                    load: 'image'
                },
            ];

            const projects: ProjectSelection[] = [
                { name: 'project-1', path: '/path/project-1.cproject.yml', buildTypes: [], selectedBuildType: '', load: 'none', selected: true },
            ];

            React.act(() => {
                createRoot(container).render(
                    <ProjectsTable projects={projects} images={images} availableCores={[]} updateSolutionData={jest.fn()} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
                );
            });

            const projectRows = container.querySelectorAll('tbody .project');
            expect(projectRows).toHaveLength(1);
            const imageRows = container.querySelectorAll('tbody .image');
            expect(imageRows).toHaveLength(2);
            expect(imageRows[0].querySelector('.name')?.textContent).toBe('image-1');
            expect(imageRows[1].querySelector('.name')?.textContent).toBe('image-2');
        });

        it('renders the correct header when projects have devices', () => {
            const projects: ProjectSelection[] = [
                { name: 'project-1', path: '/path/project-1.cproject.yml', buildTypes: [], selectedBuildType: '', load: 'none', selected: true, device: 'Device-1' },
            ];

            React.act(() => {
                createRoot(container).render(
                    <ProjectsTable projects={projects} availableCores={[]} updateSolutionData={jest.fn()} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
                );
            });

            const header = container.querySelector('th.column-name');
            expect(header?.textContent).toBe('Processor: Projects');
        });

        it('renders the correct header when projects do not have devices', () => {
            const projects: ProjectSelection[] = [
                { name: 'project-1', path: '/path/project-1.cproject.yml', buildTypes: [], selectedBuildType: '', load: 'none', selected: true },
            ];

            React.act(() => {
                createRoot(container).render(
                    <ProjectsTable projects={projects} availableCores={[]} updateSolutionData={jest.fn()} openFile={jest.fn()} addProject={jest.fn()} addImage={jest.fn()} unlinkImage={jest.fn()} />
                );
            });

            const header = container.querySelector('th.column-name');
            expect(header?.textContent).toBe('Projects');
        });
    });

    it('renders the "Add Image" button and triggers the addImage function on click', () => {
        const addImage = jest.fn();

        React.act(() => {
            root.render(
                <ProjectsTable projects={[]} images={[]} availableCores={[]} updateSolutionData={jest.fn()} openFile={jest.fn()} addProject={jest.fn()} addImage={addImage} unlinkImage={jest.fn()} />
            );
        });

        const addImageButton = container.querySelector('.add-img-button');
        expect(addImageButton).toBeTruthy();

        React.act(() => {
            addImageButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(addImage).toHaveBeenCalled();
    });
});
