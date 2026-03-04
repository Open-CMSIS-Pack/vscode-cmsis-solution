/**
 * Copyright 2023-2026 Arm Limited
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

import { Example as ApiExample, Template as ApiTemplate, RefApp } from '../../../../core-tools/client/packs_pb';
import { DraftProjectType } from '../../../../data-manager/draft-project-data';
import { ExampleProject } from '../../../../solar-search/solar-search-client';
import { AsyncStatus } from '../../../async-status';
import { TreeViewCategory } from '../../../common/components/tree-view';
import { BoardHardwareOption, compareBoardId, compareDeviceId, DeviceHardwareOption, HardwareInfo, NewProject, Trustzone } from '../../cmsis-solution-types';
import * as Messages from '../../messages';
import { HardwareLists } from '../../messages';
import { FieldAndInteraction, hadInteraction } from './field-and-interaction';
import { createProjectsForTemplateAndHardware, CSolutionTemplate, hardwareTemplateOptions } from './templates';

export type CompilerDisplay = 'Arm Compiler 6' | 'GCC' | 'LLVM' | '';
export type CreateProgress = 'idle' | 'checking' | 'creating';

export type DataManagerApp = {
    name: string;
    description: string;
    objectId: string;
    draftType: DraftProjectType;
}

export type Example = {
    type: 'example';
    value: ExampleProject;
}

export type Template = {
    type: 'template';
    value: CSolutionTemplate;
}

export type RefApplication = {
    type: 'refApp';
    value: RefApp.AsObject;
}

export type LocalExample = {
    type: 'localExample';
    value: ApiExample.AsObject;
}

export type DataManagerExample = {
    type: 'dataManagerApp';
    value: DataManagerApp;
}

export type DraftProject = Template | Example | RefApplication | LocalExample | DataManagerExample;

export const emptyHardwareLists = { boards: [], devices: [] };

export type CreateSolutionState = {
    createProgress: CreateProgress;
    compiler: CompilerDisplay;
    initGit: boolean;
    showOpenDialog: boolean;
    boardTreeViewSearch: string;
    deviceTreeViewSearch: string;
    examplesTreeViewSearch: string;
    hardwareLists: AsyncStatus<HardwareLists>;
    hardwareInfo: HardwareInfo | undefined;
    projects: FieldAndInteraction<NewProject>[];
    examples: ExampleProject[];
    refApps: RefApp.AsObject[];
    localExamples: ApiExample.AsObject[];
    templates: ApiTemplate.AsObject[] ;
    datamanagerApps: Array<TreeViewCategory<string>>;
    selectedTemplate: FieldAndInteraction<DraftProject | undefined>;
    boardSelection: FieldAndInteraction<BoardHardwareOption | undefined>;
    deviceSelection: FieldAndInteraction<DeviceHardwareOption | undefined>;
    boardPreview: BoardHardwareOption | undefined;
    devicePreview: DeviceHardwareOption | undefined;
    solutionLocation: FieldAndInteraction<string>;
    solutionName: FieldAndInteraction<string>;
    solutionFolder: FieldAndInteraction<string>;
    solutionExists: AsyncStatus<boolean>;
    targetType: FieldAndInteraction<string>;
    connectedBoard: string;
    platform: Messages.Platform;
    webServicesEnabled: boolean;
    selectedDraftProjectId: string;
    fromAllPackVersions: boolean;
    servicesErrors: string[];
}

export const initialState: CreateSolutionState = {
    createProgress: 'idle',
    compiler: '',
    hardwareLists: { type: 'loading' },
    initGit: true,
    showOpenDialog: false,
    boardTreeViewSearch: '',
    deviceTreeViewSearch: '',
    examplesTreeViewSearch: '',
    solutionName: { value: '', hadInteraction: false },
    solutionFolder: { value: '', hadInteraction: false },
    projects: [],
    examples: [],
    refApps: [],
    localExamples: [],
    templates: [],
    datamanagerApps: [],
    selectedTemplate: { value: undefined, hadInteraction: false },
    solutionLocation: { value: '', hadInteraction: false },
    boardSelection: { value: undefined, hadInteraction: false },
    deviceSelection: { value: undefined, hadInteraction: false },
    boardPreview: undefined,
    devicePreview: undefined,
    solutionExists: { type: 'loaded', result: false },
    hardwareInfo: undefined,
    targetType: { value: '', hadInteraction: false },
    connectedBoard: '',
    platform: 'ksc',
    webServicesEnabled: false,
    selectedDraftProjectId: '',
    fromAllPackVersions: false,
    servicesErrors: [],
};

export type CreateSolutionAction
    = { type: 'TOGGLE_INIT_GIT' }
    | { type: 'CREATION_CHECK_START' }
    | { type: 'CREATION_START' }
    | { type: 'CREATION_END' }
    | { type: 'SET_COMPILER', compiler: CompilerDisplay }
    | { type: 'SET_SELECTED_TEMPLATE', template: DraftProject }
    | { type: 'SET_SOLUTION_NAME', solutionName: string }
    | { type: 'SET_SOLUTION_FOLDER', solutionFolder: string }
    | { type: 'MODIFY_PROJECT', request: ProjectRequest }
    | { type: 'SET_SOLUTION_LOCATION', solutionLocation: string }
    | { type: 'SET_BOARD_SELECTION', boardSelection: BoardHardwareOption }
    | { type: 'CLEAR_BOARD_SELECTION' }
    | { type: 'SET_DEVICE_SELECTION', deviceSelection: DeviceHardwareOption }
    | { type: 'SET_BOARD_PREVIEW', boardPreview: BoardHardwareOption }
    | { type: 'SET_DEVICE_PREVIEW', devicePreview: DeviceHardwareOption }
    | { type: 'INCOMING_MESSAGE', message: Messages.IncomingMessage }
    | { type: 'START_SOLUTION_EXISTS_CHECK' }
    | { type: 'END_SOLUTION_EXISTS_CHECK', result: boolean }
    | { type: 'SET_BOARD_TREE_VIEW_SEARCH', search: string }
    | { type: 'SET_DEVICE_TREE_VIEW_SEARCH', search: string }
    | { type: 'SET_EXAMPLES_TREE_VIEW_SEARCH', search: string }
    | { type: 'SET_TARGET_TYPE', targetType: string }
    | { type: 'SET_PLATFORM', name: Messages.Platform }
    | { type: 'TOGGLE_OPEN_MODAL' }
    | { type: 'SET_SELECTED_DRAFTPROJECT_ID', id: string }
    | { type: 'TOGGLE_ALL_PACK_VERSIONS' }
    ;

export const incomingMessageReducer = (state: CreateSolutionState, message: Messages.IncomingMessage): CreateSolutionState => {
    switch (message.type) {
        case 'TARGET_DATA':
            return {
                ...state,
                hardwareLists: { type: 'loaded', result: { boards: message.data.boards, devices: message.data.devices } },
                servicesErrors: message.errors,
            };
        case 'BOARD_EXAMPLE_DATA':
            return {
                ...state,
                examples: message.data,
            };
        case 'HARDWARE_INFO':
            return {
                ...state,
                hardwareInfo: message.data,
            };
        case 'SOLUTION_LOCATION':
            return {
                ...state,
                solutionLocation: { value: message.data.path, hadInteraction: true },
            };
        case 'REQUEST_SUCCESSFUL':
        case 'REQUEST_FAILED':
            return state;
        case 'CONNECTED_BOARD': {
            let boardSelection: BoardHardwareOption | undefined = undefined;
            let deviceSelection: DeviceHardwareOption | undefined = undefined;
            const connectedBoard = message.data.name;
            if (state.hardwareLists.type === 'loaded') {
                for (const board of state.hardwareLists.result.boards) {
                    for (const item of board.items) {
                        if (item.value.id.name === connectedBoard) {
                            boardSelection = item.value;
                            deviceSelection = item.value.mountedDevices[0];
                        }
                    }
                }
            }
            return {
                ...state,
                connectedBoard,
                boardSelection: { value: boardSelection, hadInteraction: !!boardSelection },
                deviceSelection: { value: deviceSelection, hadInteraction: !!deviceSelection },
            };
        }
        case 'PLATFORM':
            return {
                ...state,
                platform: message.data.name
            };
        case 'REF_APP_DATA': {
            return {
                ...state,
                refApps: message.data,
            };
        }
        case 'BOARD_EXAMPLE_DATA_LOCAL': {
            return {
                ...state,
                localExamples: message.data,
            };
        }
        case 'TEMPLATE_DATA': {
            return {
                ...state,
                templates: message.data,
            };
        }
        case 'DATAMANAGER_APPS_DATA': {
            return {
                ...state,
                datamanagerApps: message.data,
            };
        }
        case 'STATE_USE_WEBSERVICES':
            return {
                ...state,
                webServicesEnabled: message.enabled,
            };
        case 'DRAFTPROJECT_INFO': {
            const validSolutionName = convertToValidSolutionName(message.data.value.name);

            return applyTemplateIfValid({
                ...state,
                selectedTemplate: hadInteraction(message.data),
                solutionName: { hadInteraction: false, value: validSolutionName },
                solutionFolder: { hadInteraction: false, value: validSolutionName },
            });
        }
        default:
            return state;
    }
};

export type ProjectRequest
    = { type: 'ADD_PROJECT' }
    | { type: 'REMOVE_PROJECT', index: number }
    | { type: 'UPDATE_PROJECT_NAME', index: number, name: string }
    | { type: 'UPDATE_PROJECT_CORE', index: number, processorName: string }
    | { type: 'UPDATE_PROJECT_TRUSTZONE', index: number, trustzone: Trustzone }

const updateProjectProperty = <T extends keyof NewProject>(projects: FieldAndInteraction<NewProject>[], requestIndex: number, key: T, propValue: NewProject[T]): FieldAndInteraction<NewProject>[] => {
    return projects.map(({ value }, index)  => index === requestIndex ?
        { value: { ...value, [key]: propValue }, hadInteraction: true } : { value, hadInteraction: true });
};

const updateProjectCore  = (projects: FieldAndInteraction<NewProject>[], deviceSelection: DeviceHardwareOption, requestIndex: number, requestedProcessorName: string): FieldAndInteraction<NewProject>[] => {
    const newCoreHasTZ = deviceSelection?.processors?.find(({ name }) => name === requestedProcessorName)?.tz;
    const projectsWithUpdatedDeviceAndCore = updateProjectProperty(projects, requestIndex, 'processorName', requestedProcessorName);
    return !newCoreHasTZ ? updateProjectProperty(projectsWithUpdatedDeviceAndCore, requestIndex, 'trustzone', 'off') : projectsWithUpdatedDeviceAndCore;
};

export const modifyProjectReducer = (state: CreateSolutionState, request: ProjectRequest): CreateSolutionState => {
    switch (request.type) {
        case 'REMOVE_PROJECT':
            return { ...state, projects:  state.projects.splice(request.index, 1) && state.projects };
        case 'ADD_PROJECT': {
            if (state.deviceSelection) {
                const device = state.deviceSelection.value;
                const processorName = device?.processors[0]?.name || '';

                return { ...state, projects: [
                    ...state.projects,
                    { value: { name: '', trustzone: 'off', processorName }, hadInteraction: false }
                ] };
            }

            return state;
        }
        case 'UPDATE_PROJECT_NAME':
            return { ...state, projects: updateProjectProperty(state.projects, request.index, 'name', request.name) };
        case 'UPDATE_PROJECT_CORE':
            return { ...state, projects: state.deviceSelection.value ? updateProjectCore(state.projects, state.deviceSelection.value, request.index, request.processorName) : state.projects };
        case 'UPDATE_PROJECT_TRUSTZONE':
            return { ...state, projects: updateProjectProperty(state.projects, request.index, 'trustzone', request.trustzone) };
        default:
            return request;
    }
};

const applyTemplateIfValid = (state: CreateSolutionState): CreateSolutionState => {
    const deviceSelection = state.deviceSelection.value;
    const templateName = state.selectedTemplate.value?.type === 'template' ? state.selectedTemplate.value.value : undefined;
    const examples = state.boardSelection.value ? state.examples : [];
    const refApps = state.boardSelection.value ? state.refApps : [];
    const localExamples = state.boardSelection.value ? state.localExamples : [];

    if (deviceSelection && templateName) {
        const projects = createProjectsForTemplateAndHardware(deviceSelection, templateName);
        return { ...state, projects, examples };
    } else if (state.selectedTemplate.value?.type === 'example') {
        return { ...state, projects: [], selectedTemplate: state.selectedTemplate, examples };
    } else if (state.selectedTemplate.value?.type === 'refApp') {
        return { ...state, projects: [], selectedTemplate: state.selectedTemplate, refApps };
    } else if (state.selectedTemplate.value?.type === 'localExample') {
        return { ...state, projects: [], selectedTemplate: state.selectedTemplate, localExamples };
    } else if (state.selectedTemplate.value?.type === 'dataManagerApp') {
        return { ...state, projects: [], selectedTemplate: state.selectedTemplate, localExamples };
    }

    return { ...state, examples };
};

export const alignTemplate = (currentTemplate: DraftProject | undefined, deviceSelection: DeviceHardwareOption): FieldAndInteraction<Template | undefined> => {
    if (!currentTemplate) {
        return { value: currentTemplate, hadInteraction: false };
    }
    const validTemplates = hardwareTemplateOptions(deviceSelection);
    let newTemplate: Template;
    if (currentTemplate.type !== 'template') {
        newTemplate = { type: 'template', value: validTemplates[0] };
    } else {
        newTemplate = validTemplates.some(template => template.name === currentTemplate.value.name) ? currentTemplate : { type: 'template', value: validTemplates[0] };
    }
    return { value: newTemplate, hadInteraction: true };
};

const selectBoard = (state: CreateSolutionState, boardSelection: BoardHardwareOption | undefined): CreateSolutionState => {
    const newState: CreateSolutionState = {
        ...state,
        boardSelection: hadInteraction(boardSelection),
        boardPreview: boardSelection,
        deviceSelection: { hadInteraction: false, value: undefined },
        targetType: { hadInteraction: false, value: '' },
        selectedTemplate: { hadInteraction: false, value: undefined },
        selectedDraftProjectId: '',
        projects: [],
        examples: [],
        datamanagerApps: [],
        solutionFolder: { hadInteraction: false, value: '' },
    };

    if (boardSelection?.mountedDevices.length === 1) {
        return selectDevice(newState, boardSelection.mountedDevices[0]);
    }

    return newState;
};

const convertToTargetTypeName = (name: string): string => {
    return name
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .substring(0, 32);
};

const selectDevice = (state: CreateSolutionState, deviceSelection: DeviceHardwareOption): CreateSolutionState => {
    return applyTemplateIfValid({
        ...state,
        deviceSelection: hadInteraction(deviceSelection),
        selectedTemplate: alignTemplate(state.selectedTemplate.value, deviceSelection),
        devicePreview: deviceSelection,
        targetType: { hadInteraction: false, value: convertToTargetTypeName(deviceSelection.id.name) }
    });
};

export const convertToValidSolutionName = (solutionName: string) => {

    return solutionName
        .replace(/[^\w\s]/g, '-')
        .replace(/\s{2,}/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+/g, '')
        .replace(/-+$/g, '')
        .replace(/\s/g, '_');
};

export const createSolutionReducer = (state: CreateSolutionState, action: CreateSolutionAction): CreateSolutionState => {
    switch (action.type) {
        case 'TOGGLE_INIT_GIT':
            return { ...state, initGit: !state.initGit };
        case 'SET_BOARD_TREE_VIEW_SEARCH':
            return { ...state, boardTreeViewSearch: action.search };
        case 'SET_DEVICE_TREE_VIEW_SEARCH':
            return { ...state, deviceTreeViewSearch: action.search };
        case 'SET_EXAMPLES_TREE_VIEW_SEARCH':
            return { ...state, examplesTreeViewSearch: action.search };
        case 'SET_COMPILER':
            return { ...state, compiler: action.compiler };
        case 'CREATION_CHECK_START':
            return {
                ...state,
                createProgress: 'checking',
                solutionName: hadInteraction(state.solutionName.value),
                projects: state.projects.map((project) => ({ value: project.value, hadInteraction: true })),
                solutionLocation: hadInteraction(state.solutionLocation.value),
                solutionFolder: hadInteraction(state.solutionFolder.value),
                boardSelection: hadInteraction(state.boardSelection.value),
                deviceSelection: hadInteraction(state.deviceSelection.value),
                selectedTemplate: hadInteraction(state.selectedTemplate.value),
                targetType: hadInteraction(state.targetType.value),
                platform: state.platform
            };
        case 'CREATION_START':
            return { ...state, createProgress: 'creating' };
        case 'CREATION_END':
            return { ...state, createProgress: 'idle' };
        case 'SET_SELECTED_TEMPLATE': {
            const validSolutionName = convertToValidSolutionName(action.template.value.name);

            return applyTemplateIfValid({
                ...state,
                selectedTemplate: hadInteraction(action.template),
                solutionName: { hadInteraction: false, value: validSolutionName },
                solutionFolder: { hadInteraction: false, value: validSolutionName },
            });
        }
        case 'SET_SELECTED_DRAFTPROJECT_ID': {
            return {
                ...state,
                selectedDraftProjectId: action.id,
            };
        }
        case 'MODIFY_PROJECT':
            return modifyProjectReducer(state, action.request);
        case 'INCOMING_MESSAGE':
            return incomingMessageReducer(state, action.message);
        case 'SET_BOARD_SELECTION':
            return selectBoard(state, action.boardSelection);
        case 'CLEAR_BOARD_SELECTION':
            return selectBoard(state, undefined);
        case 'SET_DEVICE_SELECTION':
            return selectDevice(state, action.deviceSelection);
        case 'SET_BOARD_PREVIEW': {
            const hasChanged = !state.boardPreview || !compareBoardId(state.boardPreview.id)(action.boardPreview.id);
            return { ...state, boardPreview: action.boardPreview, hardwareInfo: hasChanged ? undefined : state.hardwareInfo  };
        }
        case 'SET_DEVICE_PREVIEW': {
            const hasChanged = !state.devicePreview || !compareDeviceId(state.devicePreview.id)(action.devicePreview.id);
            return { ...state, devicePreview: action.devicePreview, hardwareInfo: hasChanged ? undefined : state.hardwareInfo };
        }
        case 'SET_SOLUTION_LOCATION':
            return { ...state, solutionLocation: hadInteraction(action.solutionLocation) };
        case 'SET_SOLUTION_NAME':
            return { ...state, solutionName: hadInteraction(action.solutionName) };
        case 'SET_SOLUTION_FOLDER':
            return { ...state, solutionFolder: hadInteraction(action.solutionFolder) };
        case 'START_SOLUTION_EXISTS_CHECK':
            return { ...state, solutionExists: { type: 'loading' } };
        case 'END_SOLUTION_EXISTS_CHECK':
            return { ...state, solutionExists: { type: 'loaded', result: action.result } };
        case 'SET_TARGET_TYPE':
            return { ...state, targetType: hadInteraction(action.targetType) };
        case 'SET_PLATFORM':
            return { ...state, platform: action.name };
        case 'TOGGLE_OPEN_MODAL':
            return { ...state, showOpenDialog: !state.showOpenDialog };
        case 'TOGGLE_ALL_PACK_VERSIONS':
            return { ...state, fromAllPackVersions: !state.fromAllPackVersions };
        default:
            // Exhaustiveness check
            return action;
    }
};
