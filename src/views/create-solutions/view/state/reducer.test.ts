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

import 'jest';
import { faker } from '@faker-js/faker';
import { Tz } from '../../../../core-tools/client/packs_pb';
import { ExampleProject } from '../../../../solar-search/solar-search-client';
import { cSolutionExampleFactory } from '../../../../solar-search/solar-search-client.factories';
import { BoardHardwareOption, DeviceHardwareOption, NewProject, ProcessorInfo } from '../../cmsis-solution-types';
import { boardHardwareOptionFactory, deviceHardwareOptionFactory } from '../../cmsis-solution-types.factories';
import { createProjectsForTemplateAndHardware, blankTemplate, trustZoneTemplate } from './templates';
import { FieldAndInteraction, hadInteraction } from './field-and-interaction';
import { CreateSolutionState, Template, alignTemplate, convertToValidSolutionName, createSolutionReducer, emptyHardwareLists, initialState } from './reducer';
import { refAppFactory } from '../../../../core-tools/core-tools-service.factories';

// Checks that all properties of the outputState equal the inputState, apart from the given keys
const checkValuesUnmodified = (
    keysWithExpectedModifications: Array<keyof CreateSolutionState>,
    inputState: CreateSolutionState,
    outputState: CreateSolutionState
) => {
    const filteredInputState = Object.fromEntries(
        Object.entries(inputState).filter(([key]) => !keysWithExpectedModifications.includes(key as keyof CreateSolutionState))
    );

    const filteredOutputState = Object.fromEntries(
        Object.entries(outputState).filter(([key]) => !keysWithExpectedModifications.includes(key as keyof CreateSolutionState))
    );

    expect(filteredInputState).toEqual(filteredOutputState);
};

describe('createSolutionReducer', () => {
    describe('TOGGLE_INIT_GIT', () => {
        it('toggles initGit', () => {
            const input: CreateSolutionState = { ...initialState, initGit: true };
            const output1 = createSolutionReducer(input, { type: 'TOGGLE_INIT_GIT' });
            expect(output1.initGit).toBe(false);
            checkValuesUnmodified(['initGit'], input, output1);

            const output2 = createSolutionReducer(output1, { type: 'TOGGLE_INIT_GIT' });
            expect(output2.initGit).toBe(true);
            checkValuesUnmodified(['initGit'], input, output2);
        });
    });

    describe('SET_BOARD_TREE_VIEW_SEARCH', () => {
        it('sets the board tree view search state', () => {
            const input: CreateSolutionState = { ...initialState, boardTreeViewSearch: '' };
            const output = createSolutionReducer(input, { type: 'SET_BOARD_TREE_VIEW_SEARCH', search: 'board' });
            expect(output.boardTreeViewSearch).toBe('board');
            checkValuesUnmodified(['boardTreeViewSearch'], input, output);
        });
    });

    describe('SET_EXAMPLES_TREE_VIEW_SEARCH', () => {
        it('sets the board tree view search state', () => {
            const input: CreateSolutionState = { ...initialState, examplesTreeViewSearch: '' };
            const output = createSolutionReducer(input, { type: 'SET_EXAMPLES_TREE_VIEW_SEARCH', search: 'my-fancy-search' });
            expect(output.examplesTreeViewSearch).toBe('my-fancy-search');
            checkValuesUnmodified(['examplesTreeViewSearch'], input, output);
        });
    });

    describe('SET_DEVICE_TREE_VIEW_SEARCH', () => {
        it('sets the device tree view search state', () => {
            const input: CreateSolutionState = { ...initialState, deviceTreeViewSearch: '' };
            const output = createSolutionReducer(input, { type: 'SET_DEVICE_TREE_VIEW_SEARCH', search: 'device' });
            expect(output.deviceTreeViewSearch).toBe('device');
            checkValuesUnmodified(['deviceTreeViewSearch'], input, output);
        });
    });

    describe('SET_COMPILER', () => {
        it('sets the compiler state', () => {
            const input: CreateSolutionState = { ...initialState, compiler: 'GCC' };
            const output = createSolutionReducer(input, { type: 'SET_COMPILER', compiler: 'Arm Compiler 6' });
            expect(output.compiler).toBe('Arm Compiler 6');
            checkValuesUnmodified(['compiler'], input, output);
        });
    });

    describe('CREATION_CHECK_START', () => {
        it('sets the create progress state and marks all fields as having had an interaction', () => {
            const input: CreateSolutionState = { ...initialState, createProgress: 'idle' };
            const output = createSolutionReducer(input, { type: 'CREATION_CHECK_START' });
            expect(output.createProgress).toBe('checking');
            expect(output.solutionName.hadInteraction).toBe(true);
            expect(output.solutionLocation.hadInteraction).toBe(true);
            expect(output.boardSelection.hadInteraction).toBe(true);
            expect(output.deviceSelection.hadInteraction).toBe(true);
            expect(output.selectedTemplate.hadInteraction).toBe(true);
            expect(output.targetType.hadInteraction).toBe(true);
            checkValuesUnmodified(
                ['createProgress', 'solutionName', 'solutionLocation', 'solutionFolder', 'boardSelection', 'deviceSelection', 'selectedTemplate', 'targetType'],
                input,
                output,
            );
        });
    });

    describe('CREATION_START', () => {
        it('sets the create progress state', () => {
            const input: CreateSolutionState = { ...initialState, createProgress: 'idle' };
            const output = createSolutionReducer(input, { type: 'CREATION_START' });
            expect(output.createProgress).toBe('creating');
            checkValuesUnmodified(['createProgress'], input, output);
        });
    });

    describe('CREATION_END', () => {
        it('sets the create progress state', () => {
            const input: CreateSolutionState = { ...initialState, createProgress: 'checking' };
            const output = createSolutionReducer(input, { type: 'CREATION_END' });
            expect(output.createProgress).toBe('idle');
            checkValuesUnmodified(['createProgress'], input, output);
        });
    });

    describe('SET_SELECTED_TEMPLATE', () => {
        it('sets the template and updates the projects and solution name if there is a device selection', () => {
            const deviceSelection: DeviceHardwareOption = deviceHardwareOptionFactory();

            const input: CreateSolutionState = {
                ...initialState,
                selectedTemplate: { hadInteraction: false, value: undefined },
                deviceSelection: hadInteraction(deviceSelection),
            };

            const output = createSolutionReducer(input, { type: 'SET_SELECTED_TEMPLATE', template: { type: 'template', value: blankTemplate } });
            expect(output.selectedTemplate).toEqual(hadInteraction({ type: 'template', value: blankTemplate }));
            expect(output.projects).toEqual(createProjectsForTemplateAndHardware(deviceSelection, blankTemplate));
            expect(output.solutionName).toEqual({ hadInteraction: false, value: blankTemplate.name.replace(/\s/g, '_') });
            checkValuesUnmodified(['selectedTemplate', 'solutionName', 'solutionFolder', 'projects'], input, output);
        });

        it('sets a valid solution name when an example is picked', () => {
            const deviceSelection: DeviceHardwareOption = deviceHardwareOptionFactory();

            const input: CreateSolutionState = {
                ...initialState,
                selectedTemplate: { hadInteraction: false, value: undefined },
                deviceSelection: hadInteraction(deviceSelection),
            };
            const exampleProject: ExampleProject = cSolutionExampleFactory('[WLCSP65][MDK]demo_TFM_LV2');

            const output = createSolutionReducer(input, { type: 'SET_SELECTED_TEMPLATE', template: { type: 'example', value: exampleProject } });
            expect(output.solutionName).toEqual({ hadInteraction: false, value: 'WLCSP65-MDK-demo_TFM_LV2' });
            checkValuesUnmodified(['selectedTemplate', 'solutionName', 'solutionFolder', 'projects'], input, output);
        });

        it('sets the template and solution name and does not update the projects if there is no device selection', () => {
            const input: CreateSolutionState = {
                ...initialState,
                selectedTemplate: { hadInteraction: false, value: undefined },
                deviceSelection: { hadInteraction: false, value: undefined },
            };

            const output = createSolutionReducer(input, { type: 'SET_SELECTED_TEMPLATE', template: { type: 'template', value: blankTemplate } });
            expect(output.selectedTemplate).toEqual(hadInteraction({ type: 'template', value: blankTemplate }));
            expect(output.projects).toEqual([]);
            expect(output.solutionName).toEqual({ hadInteraction: false, value: blankTemplate.name.replace(/\s/g, '_') });
            checkValuesUnmodified(['selectedTemplate', 'solutionName', 'solutionFolder'], input, output);
        });

        it('sets the given example project state for board', () => {
            const deviceOption1Processor1: ProcessorInfo = { name: 'P1', core: 'Cortex-M3', tz: Tz.TZ };
            const deviceOption1Processor2: ProcessorInfo = { name: 'P2', core: 'Cortex-M5', tz: Tz.TZ_UNSPECIFIED };
            const deviceOption2Processor1: ProcessorInfo = { name: 'P1', core: 'Cortex-M4', tz: Tz.TZ_UNSPECIFIED };
            const deviceOption1 = deviceHardwareOptionFactory({ processors: [deviceOption1Processor1, deviceOption1Processor2] });
            const deviceOption2 = deviceHardwareOptionFactory({ processors: [deviceOption2Processor1] });
            const boardOption = boardHardwareOptionFactory({ mountedDevices: [deviceOption1, deviceOption2] });
            const boardSelection: FieldAndInteraction<BoardHardwareOption | undefined> = {
                value: boardOption,
                hadInteraction: true
            };
            const input: CreateSolutionState = { ...initialState, selectedTemplate: { value: { type: 'template', value: blankTemplate }, hadInteraction: true }, boardSelection };
            const exampleProject = cSolutionExampleFactory('[invalid][solution  name]');

            const output = createSolutionReducer(input, { type: 'SET_SELECTED_TEMPLATE', template: { type: 'example', value: exampleProject } });

            expect(output.selectedTemplate.value?.value).toBe(exampleProject);
            expect(output.solutionName).toEqual({ hadInteraction: false, value: convertToValidSolutionName(exampleProject.name) });
            checkValuesUnmodified(['selectedTemplate', 'solutionName', 'solutionFolder'], input, output);
        });
    });

    describe('INCOMING_MESSAGE', () => {
        it('sets hardwareLists when the message type is TARGET_DATA', () => {
            const input: CreateSolutionState = { ...initialState, hardwareLists: { type: 'loading' } };

            const output = createSolutionReducer(input, {
                type: 'INCOMING_MESSAGE', message: {
                    type: 'TARGET_DATA',
                    data: emptyHardwareLists,
                    errors: [],
                }
            });

            expect(output.hardwareLists).toEqual({ type: 'loaded', result: emptyHardwareLists });
            checkValuesUnmodified(['hardwareLists'], input, output);
        });

        it('sets the solution location when the message type is SOLUTION_LOCATION', () => {
            const input: CreateSolutionState = { ...initialState, solutionLocation: { value: '', hadInteraction: false } };

            const output = createSolutionReducer(input, {
                type: 'INCOMING_MESSAGE', message: {
                    type: 'SOLUTION_LOCATION',
                    data: { path: 'some path here' },
                }
            });

            expect(output.solutionLocation).toEqual({ value: 'some path here', hadInteraction: true });
            checkValuesUnmodified(['solutionLocation'], input, output);
        });

        it('sets the ref app list when the message type is REF_APP_DATA', () => {
            const want = [refAppFactory(), refAppFactory(), refAppFactory()];
            const input: CreateSolutionState = { ...initialState, refApps: [refAppFactory()] };

            const output = createSolutionReducer(input, {
                type: 'INCOMING_MESSAGE', message: {
                    type: 'REF_APP_DATA',
                    data: want,
                }
            });

            expect(output.refApps).toEqual(want);
            checkValuesUnmodified(['refApps'], input, output);
        });

        it('does nothing otherwise', () => {
            const input: CreateSolutionState = { ...initialState, hardwareLists: { type: 'loading' } };

            const output = createSolutionReducer(input, {
                type: 'INCOMING_MESSAGE', message: {
                    type: 'REQUEST_SUCCESSFUL',
                    requestType: 'CHECK_SOLUTION_DOES_NOT_EXIST',
                }
            });

            expect(output).toEqual(input);
        });
    });

    describe('SET_BOARD_SELECTION', () => {
        it('updates board selection value and tracks the user interaction for multi device boards', () => {
            const input: CreateSolutionState = {
                ...initialState,
                selectedTemplate: { value: { type: 'template', value: blankTemplate }, hadInteraction: true },
                boardSelection: { value: undefined, hadInteraction: false },
            };

            const boardSelection = boardHardwareOptionFactory({ mountedDevices: [deviceHardwareOptionFactory(), deviceHardwareOptionFactory()] });

            const output = createSolutionReducer(input, { type: 'SET_BOARD_SELECTION', boardSelection });

            expect(output.boardSelection).toEqual({ value: boardSelection, hadInteraction: true });
            expect(output.boardPreview).toEqual(boardSelection);
            expect(output.deviceSelection).toEqual({ value: undefined, hadInteraction: false });
            expect(output.targetType).toEqual({ value: '', hadInteraction: false });
            expect(output.projects).toEqual([]);
            checkValuesUnmodified(['boardSelection', 'boardPreview', 'deviceSelection', 'devicePreview', 'targetType', 'selectedTemplate'], input, output);
        });

        it('sets template to undefined when selecting a different board', () => {
            const boardOption1 = boardHardwareOptionFactory({ mountedDevices: [] });
            const boardOption2 = boardHardwareOptionFactory({ mountedDevices: [] });
            const boardSelection: FieldAndInteraction<BoardHardwareOption> = {
                value: boardOption1,
                hadInteraction: true
            };
            const input: CreateSolutionState = { ...initialState, selectedTemplate: { value: { type: 'example', value: cSolutionExampleFactory() }, hadInteraction: true }, boardSelection };

            const output = createSolutionReducer(input, { type: 'SET_BOARD_SELECTION', boardSelection: boardOption2 });

            expect(output.selectedTemplate).toStrictEqual({ value: undefined, hadInteraction: false });
        });

        it('sets the examples to an empty array when selecting a different board', () => {
            const exampleProjects: ExampleProject[] = faker.helpers.multiple(() => cSolutionExampleFactory());
            const boardOption1 = boardHardwareOptionFactory({ mountedDevices: [] });
            const boardOption2 = boardHardwareOptionFactory({ mountedDevices: [] });
            const boardSelection: FieldAndInteraction<BoardHardwareOption> = {
                value: boardOption1,
                hadInteraction: true
            };
            const input: CreateSolutionState = { ...initialState, boardSelection, examples: exampleProjects };

            const output = createSolutionReducer(input, { type: 'SET_BOARD_SELECTION', boardSelection: boardOption2 });

            expect(output.examples).toStrictEqual([]);
        });

        it('updates board selection and device selection values, and tracks the user interaction for single device boards', () => {
            const input: CreateSolutionState = {
                ...initialState,
                selectedTemplate: { value: { type: 'template', value: blankTemplate }, hadInteraction: true },
                boardSelection: { value: undefined, hadInteraction: false },
            };

            const mountedDevice = deviceHardwareOptionFactory();
            const boardSelection = boardHardwareOptionFactory({ mountedDevices: [mountedDevice] });

            const output = createSolutionReducer(input, { type: 'SET_BOARD_SELECTION', boardSelection });

            expect(output.boardSelection).toEqual({ value: boardSelection, hadInteraction: true });
            expect(output.boardPreview).toEqual(boardSelection);
            expect(output.deviceSelection).toEqual({ value: mountedDevice, hadInteraction: true });
            expect(output.devicePreview).toEqual(mountedDevice);
            expect(output.targetType).toEqual({ value: mountedDevice.id.name, hadInteraction: false });
            checkValuesUnmodified(['boardSelection', 'boardPreview', 'deviceSelection', 'devicePreview', 'projects', 'targetType', 'selectedTemplate'], input, output);
        });
    });

    describe('SET_DEVICE_SELECTION', () => {
        it('updates the stored value and tracks the user interaction, and updates the projects list if a template is selected', () => {
            const input: CreateSolutionState = {
                ...initialState,
                selectedTemplate: { value: { type: 'template', value: blankTemplate }, hadInteraction: true },
                deviceSelection: { value: undefined, hadInteraction: false },
                targetType: { value: '', hadInteraction: false },
            };

            const deviceSelection = deviceHardwareOptionFactory();

            const output = createSolutionReducer(input, { type: 'SET_DEVICE_SELECTION', deviceSelection });

            expect(output.deviceSelection).toEqual({ value: deviceSelection, hadInteraction: true });
            expect(output.devicePreview).toEqual(deviceSelection);
            expect(output.projects).toEqual(createProjectsForTemplateAndHardware(deviceSelection, blankTemplate));
            expect(output.targetType).toEqual({ value: deviceSelection.id.name, hadInteraction: false });
            checkValuesUnmodified(['deviceSelection', 'projects', 'devicePreview', 'targetType'], input, output);
        });

        it('does not update the projects list if no template is selected', () => {
            const input: CreateSolutionState = { ...initialState, deviceSelection: { value: undefined, hadInteraction: false } };
            const deviceSelection = deviceHardwareOptionFactory();
            const output = createSolutionReducer(input, { type: 'SET_DEVICE_SELECTION', deviceSelection });
            checkValuesUnmodified(['deviceSelection', 'devicePreview', 'targetType'], input, output);
        });

        it('sets template to the blank template when selecting a new device that is not trustzone enabled, but trustzone template was previously selected', () => {
            const deviceOption1 = deviceHardwareOptionFactory({ processors: [{ name: 'little pea', core: 'Cortex-M3', tz: Tz.TZ }] });
            const deviceOption2 = deviceHardwareOptionFactory({ processors: [{ name: 'big pea', core: 'Cortex-M3', tz: Tz.TZ_NO }] });
            const deviceSelection: FieldAndInteraction<DeviceHardwareOption> = {
                value: deviceOption1,
                hadInteraction: true
            };
            const input: CreateSolutionState = { ...initialState, selectedTemplate: { value: { type: 'template', value: trustZoneTemplate }, hadInteraction: true }, deviceSelection };

            const output = createSolutionReducer(input, { type: 'SET_DEVICE_SELECTION', deviceSelection: deviceOption2 });

            expect(output.examples).toStrictEqual([]);
            expect(output.selectedTemplate).toStrictEqual({ value: { type: 'template', value: blankTemplate }, hadInteraction: true });
        });
    });

    describe('SET_BOARD_PREVIEW', () => {
        it('update the state of the preview hardware with the new board', () => {
            const boardSelection = boardHardwareOptionFactory();

            const input: CreateSolutionState = {
                ...initialState, hardwareInfo: {
                    image: 'image',
                    memoryInfo: { 'IROM1': { size: 32768, count: 2 } },
                    debugInterfacesList: [{ adapter: 'JTAG', connector: '20 pin JTAG' }, { adapter: 'JTAG', connector: '30000 pin Micro USB' }],
                }
            };
            const output = createSolutionReducer(input, { type: 'SET_BOARD_PREVIEW', boardPreview: boardSelection });
            expect(output.boardPreview).toEqual(boardSelection);
            expect(output.hardwareInfo).toEqual(undefined);
            checkValuesUnmodified(['boardPreview', 'hardwareInfo'], input, output);
        });

        it('does not clear the hardwareInfo if the same board is selected twice', () => {
            const boardSelection = boardHardwareOptionFactory();
            const hardwareInfo = {
                image: 'image',
                memoryInfo: { 'IROM1': { size: 32768, count: 2 } },
                debugInterfacesList: [{ adapter: 'JTAG', connector: '20 pin JTAG' }, { adapter: 'JTAG', connector: '30000 pin Micro USB' }],
            };
            const input: CreateSolutionState = { ...initialState, boardPreview: boardSelection, hardwareInfo };

            const output = createSolutionReducer(input, { type: 'SET_BOARD_PREVIEW', boardPreview: boardSelection });
            expect(output.boardPreview).toEqual(boardSelection);
            expect(output.hardwareInfo).toEqual(hardwareInfo);
            checkValuesUnmodified(['boardPreview'], input, output);
        });
    });

    describe('SET_DEVICE_PREVIEW', () => {
        it('update the state of the preview hardware with the new device', () => {
            const deviceSelection = deviceHardwareOptionFactory();

            const input: CreateSolutionState = {
                ...initialState, hardwareInfo: {
                    image: 'image',
                    memoryInfo: { 'IROM1': { size: 32768, count: 2 } },
                    debugInterfacesList: [{ adapter: 'JTAG', connector: '20 pin JTAG' }, { adapter: 'JTAG', connector: '30000 pin Micro USB' }],
                }
            };
            const output = createSolutionReducer(input, { type: 'SET_DEVICE_PREVIEW', devicePreview: deviceSelection });
            expect(output.devicePreview).toEqual(deviceSelection);
            expect(output.hardwareInfo).toEqual(undefined);
            checkValuesUnmodified(['devicePreview', 'hardwareInfo'], input, output);
        });

        it('does not clear the hardwareInfo if the same device is selected twice', () => {
            const deviceSelection = deviceHardwareOptionFactory();
            const hardwareInfo = {
                image: 'image',
                memoryInfo: { 'IROM1': { size: 32768, count: 2 } },
                debugInterfacesList: [{ adapter: 'JTAG', connector: '20 pin JTAG' }, { adapter: 'JTAG', connector: '30000 pin Micro USB' }],
            };
            const input: CreateSolutionState = { ...initialState, devicePreview: deviceSelection, hardwareInfo };

            const output = createSolutionReducer(input, { type: 'SET_DEVICE_PREVIEW', devicePreview: deviceSelection });
            expect(output.devicePreview).toEqual(deviceSelection);
            expect(output.hardwareInfo).toEqual(hardwareInfo);
            checkValuesUnmodified(['devicePreview'], input, output);
        });
    });

    describe('MODIFY_PROJECT', () => {
        it('ADD_PROJECT', () => {
            const deviceSelection = deviceHardwareOptionFactory();

            const input: CreateSolutionState = {
                ...initialState,
                projects: [{ value: { name: 'My Test Project', processorName: 'some core', trustzone: 'off' }, hadInteraction: false }],
                deviceSelection: { value: deviceSelection, hadInteraction: true },
            };

            const output = createSolutionReducer(input, { type: 'MODIFY_PROJECT', request: { type: 'ADD_PROJECT' } });

            const expected: FieldAndInteraction<NewProject>[] = [
                ...input.projects,
                { value: { name: '', processorName: deviceSelection.processors[0].name, trustzone: 'off' }, hadInteraction: false },
            ];

            expect(output.projects).toEqual(expected);
            checkValuesUnmodified(['projects'], input, output);
        });

        it('REMOVE_PROJECT', () => {
            const input: CreateSolutionState = {
                ...initialState, projects: [
                    { value: { name: 'My Test Project1', processorName: 'some core', trustzone: 'secure' }, hadInteraction: true },
                    { value: { name: 'My Test Project2', processorName: 'some core', trustzone: 'non-secure' }, hadInteraction: true },
                    { value: { name: 'My Test Project3', processorName: 'some core', trustzone: 'off' }, hadInteraction: true },
                ]
            };

            const output = createSolutionReducer(input, { type: 'MODIFY_PROJECT', request: { type: 'REMOVE_PROJECT', index: 1 } });

            expect(output.projects).toEqual([
                { value: { name: 'My Test Project1', processorName: 'some core', trustzone: 'secure' }, hadInteraction: true },
                { value: { name: 'My Test Project3', processorName: 'some core', trustzone: 'off' }, hadInteraction: true },
            ]);
            checkValuesUnmodified(['projects'], input, output);
        });

        it('UPDATE_PROJECT_NAME', () => {
            const input: CreateSolutionState = {
                ...initialState, projects: [
                    { value: { name: 'My Test Project1', processorName: 'some core', trustzone: 'secure' }, hadInteraction: true },
                    { value: { name: 'My Test Project2', processorName: 'some core', trustzone: 'non-secure' }, hadInteraction: true },
                ]
            };

            const output = createSolutionReducer(input, { type: 'MODIFY_PROJECT', request: { type: 'UPDATE_PROJECT_NAME', index: 1, name: 'My New Project' } });

            expect(output.projects).toEqual([
                { value: { name: 'My Test Project1', processorName: 'some core', trustzone: 'secure' }, hadInteraction: true },
                { value: { name: 'My New Project', processorName: 'some core', trustzone: 'non-secure' }, hadInteraction: true },
            ]);
            checkValuesUnmodified(['projects'], input, output);
        });

        it('UPDATE_PROJECT_CORE', () => {
            const processor1: ProcessorInfo = { name: 'P1', core: 'Cortex-M3', tz: Tz.TZ };
            const processor2: ProcessorInfo = { name: 'P2', core: 'Cortex-M5', tz: Tz.TZ_UNSPECIFIED };
            const deviceSelection = deviceHardwareOptionFactory({ processors: [processor1, processor2] });

            const input: CreateSolutionState = {
                ...initialState, deviceSelection: { value: deviceSelection, hadInteraction: true }, projects: [
                    { value: { name: 'My Test Project1', processorName: 'P1', trustzone: 'secure' }, hadInteraction: true },
                    { value: { name: 'My Test Project2', processorName: 'P1', trustzone: 'non-secure' }, hadInteraction: true },
                ]
            };

            const output = createSolutionReducer(input, { type: 'MODIFY_PROJECT', request: { type: 'UPDATE_PROJECT_CORE', index: 0, processorName: 'P2' } });

            expect(output.projects).toEqual([
                { value: { name: 'My Test Project1', processorName: 'P2', trustzone: 'off' }, hadInteraction: true },
                { value: { name: 'My Test Project2', processorName: 'P1', trustzone: 'non-secure' }, hadInteraction: true },
            ]);
            checkValuesUnmodified(['projects'], input, output);
        });

        it('UPDATE_PROJECT_TRUSTZONE', () => {
            const input: CreateSolutionState = {
                ...initialState, projects: [
                    { value: { name: 'My Test Project1', processorName: 'some core', trustzone: 'secure' }, hadInteraction: true },
                    { value: { name: 'My Test Project2', processorName: 'some core', trustzone: 'non-secure' }, hadInteraction: true },
                ]
            };

            const output = createSolutionReducer(input, { type: 'MODIFY_PROJECT', request: { type: 'UPDATE_PROJECT_TRUSTZONE', index: 1, trustzone: 'off' } });

            expect(output.projects).toEqual([
                { value: { name: 'My Test Project1', processorName: 'some core', trustzone: 'secure' }, hadInteraction: true },
                { value: { name: 'My Test Project2', processorName: 'some core', trustzone: 'off' }, hadInteraction: true },
            ]);
            checkValuesUnmodified(['projects'], input, output);
        });
    });

    describe('SET_SOLUTION_LOCATION', () => {
        it('updates the stored value and tracks the user interaction', () => {
            const input: CreateSolutionState = { ...initialState, solutionLocation: { value: '', hadInteraction: false } };
            const solutionLocation = 'my solution location';

            const output = createSolutionReducer(input, { type: 'SET_SOLUTION_LOCATION', solutionLocation });

            expect(output.solutionLocation).toEqual({ value: solutionLocation, hadInteraction: true });
            checkValuesUnmodified(['solutionLocation'], input, output);
        });
    });

    describe('SET_SOLUTION_NAME', () => {
        it('updates the stored value and tracks the user interaction', () => {
            const input: CreateSolutionState = { ...initialState, solutionName: { value: '', hadInteraction: false } };
            const solutionName = 'my solution name';

            const output = createSolutionReducer(input, { type: 'SET_SOLUTION_NAME', solutionName });

            expect(output.solutionName).toEqual({ value: solutionName, hadInteraction: true });
            checkValuesUnmodified(['solutionName'], input, output);
        });
    });

    describe('START_SOLUTION_EXISTS_CHECK', () => {
        it('sets the loading state', () => {
            const input: CreateSolutionState = { ...initialState, solutionExists: { type: 'loaded', result: false } };

            const output = createSolutionReducer(input, { type: 'START_SOLUTION_EXISTS_CHECK' });

            expect(output.solutionExists).toEqual({ type: 'loading' });
            checkValuesUnmodified(['solutionExists'], input, output);
        });
    });

    describe('END_SOLUTION_EXISTS_CHECK', () => {
        it('sets the loaded state', () => {
            const input: CreateSolutionState = { ...initialState, solutionExists: { type: 'loading' } };

            const output = createSolutionReducer(input, { type: 'END_SOLUTION_EXISTS_CHECK', result: false });

            expect(output.solutionExists).toEqual({ type: 'loaded', result: false });
            checkValuesUnmodified(['solutionExists'], input, output);
        });
    });

    describe('SET_TARGET_TYPE', () => {
        it('sets the targetType state, and logs the field has been interacted with', () => {
            const input: CreateSolutionState = { ...initialState, targetType: { value: '', hadInteraction: false } };

            const output = createSolutionReducer(input, { type: 'SET_TARGET_TYPE', targetType: 'New Target Type' });

            expect(output.targetType).toEqual({ value: 'New Target Type', hadInteraction: true });
            checkValuesUnmodified(['targetType'], input, output);
        });
    });

    describe('alignTemplate', () => {
        it('returns all template options when current template is undefined', () => {
            const deviceSelection = deviceHardwareOptionFactory();
            const currentTemplate = undefined;
            const result = alignTemplate(currentTemplate, deviceSelection);

            expect(result).toEqual({ value: currentTemplate, hadInteraction: false });
        });

        it('returns blank template option when hardware selected only has that option', () => {
            const deviceSelection = deviceHardwareOptionFactory({
                processors:
                    [{ name: '', core: 'Cortex-M1', tz: Tz.TZ_UNSPECIFIED }]
            });
            const currentTemplate: Template = { type: 'template', value: trustZoneTemplate };

            const expectedTemplate: Template = { type: 'template', value: blankTemplate };
            const result = alignTemplate(currentTemplate, deviceSelection);

            expect(result).toEqual({ value: expectedTemplate, hadInteraction: true });
        });

        it('returns trustzone template option when hardware selected allows that option', () => {
            const deviceSelection = deviceHardwareOptionFactory({ processors: [{ name: '', core: 'Cortex-M33', tz: Tz.TZ }] });
            const currentTemplate: Template = { type: 'template', value: trustZoneTemplate };
            const result = alignTemplate(currentTemplate, deviceSelection);

            expect(result).toEqual({ value: currentTemplate, hadInteraction: true });
        });
    });

    describe('CLEAR_BOARD_SELECTION', () => {
        it('clears the board selection and related fields', () => {
            const input: CreateSolutionState = {
                ...initialState,
                boardSelection: {
                    value: {
                        id: {
                            name: 'board1',
                            vendor: '',
                            revision: ''
                        },
                        key: '',
                        mountedDevices: [],
                        unresolvedDevices: []
                    }, hadInteraction: true
                },
                boardPreview: {
                    id: {
                        name: 'board1',
                        vendor: '',
                        revision: ''
                    },
                    key: '',
                    mountedDevices: [],
                    unresolvedDevices: []
                },
                deviceSelection: {
                    value: {
                        id: {
                            name: 'device1',
                            vendor: ''
                        },
                        key: '',
                        processors: []
                    }, hadInteraction: true
                },
                targetType: { value: 'type1', hadInteraction: true },
                selectedTemplate: {
                    value: {
                        type: 'template', value: {
                            name: 'template1',
                            description: ''
                        }
                    }, hadInteraction: true
                },
                projects: [{ value: { name: 'proj', processorName: 'core', trustzone: 'off' }, hadInteraction: true }],
                examples: [{
                    name: 'ex',
                    description: '',
                    format: {
                        type: 'csolution'
                    },
                    download_url: '',
                    id: ''
                }],
                solutionFolder: { value: 'folder', hadInteraction: true },
            };
            const output = createSolutionReducer(input, { type: 'CLEAR_BOARD_SELECTION' });
            expect(output.boardSelection).toEqual({ value: undefined, hadInteraction: true });
            expect(output.boardPreview).toBeUndefined();
            expect(output.deviceSelection).toEqual({ value: undefined, hadInteraction: false });
            expect(output.targetType).toEqual({ value: '', hadInteraction: false });
            expect(output.selectedTemplate).toEqual({ value: undefined, hadInteraction: false });
            expect(output.projects).toEqual([]);
            expect(output.examples).toEqual([]);
            expect(output.datamanagerApps).toEqual([]);
            expect(output.solutionFolder).toEqual({ value: '', hadInteraction: false });
        });
    });

    describe('TOGGLE_OPEN_MODAL', () => {
        it('toggles the showOpenDialog state', () => {
            const input: CreateSolutionState = { ...initialState, showOpenDialog: false };
            const output = createSolutionReducer(input, { type: 'TOGGLE_OPEN_MODAL' });
            expect(output.showOpenDialog).toBe(true);
            const output2 = createSolutionReducer(output, { type: 'TOGGLE_OPEN_MODAL' });
            expect(output2.showOpenDialog).toBe(false);
        });
    });

    describe('SET_PLATFORM', () => {
        it('sets the platform state', () => {
            const input: CreateSolutionState = { ...initialState, platform: 'ksc' };
            const output = createSolutionReducer(input, { type: 'SET_PLATFORM', name: 'ksc' });
            expect(output.platform).toBe('ksc');
        });
    });

    describe('SET_SELECTED_DRAFTPROJECT_ID', () => {
        it('sets the selectedDraftProjectId state', () => {
            const input: CreateSolutionState = { ...initialState, selectedDraftProjectId: '' };
            const output = createSolutionReducer(input, { type: 'SET_SELECTED_DRAFTPROJECT_ID', id: 'draft123' });
            expect(output.selectedDraftProjectId).toBe('draft123');
        });
    });
});
