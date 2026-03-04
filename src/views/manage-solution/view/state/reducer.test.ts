/**
 * Copyright 2024-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ManageSolutionState, ImageSelection, ProjectSelection, TargetType } from './manage-solution-state';
import { solutionDataFactory, projectSelectionFactory } from './manage-solution-state.factories';
import { manageSolutionReducer, initialState } from './reducer';

describe('contextSelectionReducer', () => {
    describe('INCOMING_MESSAGE', () => {
        it('sets the context selection state when the message type is DATA_CONTEXT_SELECTION', () => {
            const solutionData = solutionDataFactory();
            const input: ManageSolutionState = { ...initialState, solutionData: solutionData };

            const output = manageSolutionReducer(input, {
                type: 'INCOMING_MESSAGE', message: {
                    type: 'DATA_CONTEXT_SELECTION',
                    data: solutionData,
                }
            });

            expect(output).toEqual({
                ...initialState,
                solutionData,
            });
        });

        it('sets the context selection state when the message type is DEBUG_ADAPTERS', () => {
            const input: ManageSolutionState = { ...initialState };

            const output = manageSolutionReducer(input, {
                type: 'INCOMING_MESSAGE', message: {
                    type: 'DEBUG_ADAPTERS',
                    data: [{ name: 'my-debug-adapter' }],
                    sectionsInUse: []
                }
            });

            expect(output).toEqual({
                ...initialState,
                debugAdapters: [{ name: 'my-debug-adapter' }],
            });
        });


        it('sets the sate of the IS_DIRTY flag', () => {
            const input: ManageSolutionState = { ...initialState };

            const output = manageSolutionReducer(input, {
                type: 'INCOMING_MESSAGE', message: {
                    type: 'IS_DIRTY',
                    data: true,
                }
            });

            expect(output).toEqual({
                ...initialState,
                isDirty: true,
            });
        });

        it('sets the sate of the IS_BUSY flag', () => {
            const input: ManageSolutionState = { ...initialState };

            const output = manageSolutionReducer(input, {
                type: 'INCOMING_MESSAGE', message: {
                    type: 'IS_BUSY',
                    data: true,
                }
            });

            expect(output).toEqual({
                ...initialState,
                busy: true,
            });
        });

        it('sets the debugger property when the message type is DEBUGGER', () => {
            const input: ManageSolutionState = { ...initialState };

            const output = manageSolutionReducer(input, {
                type: 'INCOMING_MESSAGE', message: {
                    type: 'DEBUGGER',
                    data: 'my_debugger',
                }
            });

            expect(output).toEqual({
                ...initialState,
                debugger: 'my_debugger',
            });
        });

        it('sets the debugger property when the message type is ACTIVE_TARGET_SET', () => {
            const input: ManageSolutionState = { ...initialState };

            const output = manageSolutionReducer(input, {
                type: 'INCOMING_MESSAGE', message: {
                    type: 'ACTIVE_TARGET_SET',
                    data: { project: 'my_project', set: 'my_set' },
                }
            });

            expect(output).toEqual({
                ...initialState
            });
        });

        it('sets returns a file path is FILE_SELECTED is received', () => {
            const input: ManageSolutionState = { ...initialState };

            const output = manageSolutionReducer(input, {
                type: 'INCOMING_MESSAGE', message: {
                    type: 'FILE_SELECTED',
                    data: ['C:/path/to/my/file.txt'],
                    for: 'some-id',
                }
            });

            expect(output).toEqual({
                ...initialState
            });
        });

        it('receives a correct autoUpdate value if AUTO_UPDATED is received', () => {
            const input: ManageSolutionState = { ...initialState, autoUpdate: false };

            const output = manageSolutionReducer(input, {
                type: 'INCOMING_MESSAGE', message: {
                    type: 'AUTO_UPDATE',
                    data: true,
                }
            });

            expect(output).toEqual({
                ...initialState,
                autoUpdate: true,
            });
        });
    });

    it('sets the project selection to false if the project has no valid build contexts', () => {
        const input: ManageSolutionState = { ...initialState };
        const project = projectSelectionFactory({ buildTypes: [], selected: true });
        const solutionData = solutionDataFactory({ projects: [project] });

        const output = manageSolutionReducer(input, {
            type: 'INCOMING_MESSAGE', message: {
                type: 'DATA_CONTEXT_SELECTION',
                data: solutionData,
            }
        });

        expect(output.solutionData.projects).toStrictEqual([{
            buildTypes: project.buildTypes,
            name: project.name,
            path: project.path,
            selected: true,
            selectedBuildType: '',
            load: 'none',
        }]);
    });


    describe('SET_SELECTED_TARGET', () => {
        it('sets the given target as the selected target in the context state', () => {
            const input: ManageSolutionState = { ...initialState };

            const newSelectedTarget: TargetType = { name: 'my-lovely-target', };

            input.solutionData.targets.push(newSelectedTarget);

            const output = manageSolutionReducer(input, { type: 'SET_SELECTED_TARGET', target: newSelectedTarget.name, set: undefined });

            expect(output).toEqual({
                ...initialState,
                solutionData: {
                    ...initialState.solutionData,
                    selectedTarget: newSelectedTarget,
                }
            });
        });
    });

    describe('SET_PROJECT_SELECTION', () => {
        it('sets the selected project to selected for the given project selection', () => {
            const projectSelections: ProjectSelection[] = [
                {
                    name: 'my-project',
                    path: 'some/path/to/my-project.cproject.yml',
                    buildTypes: [],
                    selectedBuildType: '',
                    load: 'none',
                    selected: false,
                },
            ];
            const input: ManageSolutionState = { ...initialState, solutionData: { ...initialState.solutionData, projects: projectSelections } };
            const newSelectedProject: ProjectSelection = { ...projectSelections[0], selected: true };

            const output = manageSolutionReducer(input, { type: 'SET_PROJECT_SELECTION', projectPath: newSelectedProject.path, selected: true });

            expect(output.solutionData.projects).toEqual([
                {
                    name: 'my-project',
                    path: 'some/path/to/my-project.cproject.yml',
                    buildTypes: [],
                    selectedBuildType: '',
                    load: 'none',
                    selected: true,
                },
            ]);
        });
    });

    describe('SET_BUILD_TYPE_SELECTION', () => {
        it('sets the selected build type for the given project', () => {
            const buildTypeSelection = 'my-selected-build-type';
            const projectSelections: ProjectSelection[] = [
                {
                    name: 'my-project',
                    path: 'some/path/to/my-project.cproject.yml',
                    buildTypes: [],
                    selectedBuildType: '',
                    load: 'none',
                    selected: false,
                },
            ];
            const input: ManageSolutionState = { ...initialState, solutionData: { ...initialState.solutionData, projects: projectSelections } };
            const newSelectedProject: ProjectSelection = { ...projectSelections[0], selected: true };

            const output = manageSolutionReducer(input, { type: 'SET_BUILD_TYPE_SELECTION', projectPath: newSelectedProject.path, buildType: buildTypeSelection });

            expect(output.solutionData.projects[0].selectedBuildType).toEqual(buildTypeSelection);
        });

        describe('SET_LOAD_TYPE_SELECTION', () => {
            it('sets the selected load type for the given project', () => {
                const loadTypeSelection = 'image+symbols';
                const projectSelections: ProjectSelection[] = [
                    {
                        name: 'my-project',
                        path: 'some/path/to/my-project.cproject.yml',
                        buildTypes: [],
                        selectedBuildType: '',
                        load: 'none',
                        selected: false,
                    },
                ];
                const imageSelections: ImageSelection[] = [
                    {
                        name: 'my-image',
                        path: 'some/path/to/my-image.cproject.yml',
                        load: 'image',
                        loadOffset: '0x0',
                        selected: false
                    },
                ];
                const input: ManageSolutionState = { ...initialState, solutionData: { ...initialState.solutionData, projects: projectSelections, images: imageSelections } };
                const newSelectedProject: ProjectSelection = { ...projectSelections[0], selected: true };
                const newSelectedImage: ImageSelection = { ...imageSelections[0], selected: true };
                const outputProject = manageSolutionReducer(input, { type: 'SET_LOAD_TYPE_SELECTION', path: newSelectedProject.path, loadType: loadTypeSelection });
                const outputImage = manageSolutionReducer(input, { type: 'SET_LOAD_TYPE_SELECTION', path: newSelectedImage.path, loadType: loadTypeSelection });

                expect(outputProject.solutionData.projects[0].load).toEqual(loadTypeSelection);
                expect(outputImage.solutionData.images?.[0].load).toEqual(loadTypeSelection);
            });
        });

        describe('SET_CORE_SELECTION', () => {
            it('sets the selected core for the given image', () => {
                const imageSelections: ImageSelection[] = [
                    {
                        name: 'my-image',
                        path: 'some/path/to/my-image.cproject.yml',
                        load: 'image',
                        loadOffset: '0x0',
                        device: 'C0',
                        selected: false
                    },
                ];
                const input: ManageSolutionState = { ...initialState, solutionData: { ...initialState.solutionData, images: imageSelections } };
                const output = manageSolutionReducer(input, { type: 'SET_CORE_SELECTION', path: imageSelections[0].path, core: 'C1' });

                expect(output.solutionData.images?.[0].device).toEqual('C1');
            });
        });
    });
});
