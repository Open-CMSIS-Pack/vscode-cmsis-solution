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

import { IncomingMessage } from '../../messages';
import { SolutionData, ManageSolutionState, LoadType } from './manage-solution-state';

/**
 * An action that updates the selected context.
 */
export type SolutionUpdateAction
    = { type: 'SET_SELECTED_TARGET', target: string, set: string | undefined }
    | { type: 'SET_PROJECT_SELECTION', projectPath: string, selected: boolean }
    | { type: 'SET_BUILD_TYPE_SELECTION', projectPath: string, buildType: string }
    | { type: 'SET_LOAD_TYPE_SELECTION', path: string, loadType: LoadType }
    | { type: 'SET_CORE_SELECTION', path: string, core: string };

export const contextUpdateReducer = (solutionData: SolutionData, action: SolutionUpdateAction): SolutionData => {
    switch (action.type) {
        case 'SET_SELECTED_TARGET': {
            const selectedTarget = solutionData.targets.find(t => t.name === action.target);
            return !selectedTarget ? solutionData : { ...solutionData, selectedTarget: { ...selectedTarget, selectedSet: action.set } };
        }
        case 'SET_PROJECT_SELECTION': {
            const projectSelections = solutionData.projects.map(project => {
                return action.projectPath === project.path
                    ? { ...project, selected: action.selected }
                    : project;
            });
            return { ...solutionData, projects: [...projectSelections] };
        }
        case 'SET_BUILD_TYPE_SELECTION': {
            const projectSelections = solutionData.projects.map(project => {
                return action.projectPath === project.path
                    ? { ...project, selectedBuildType: action.buildType }
                    : project;
            });
            return { ...solutionData, projects: [...projectSelections] };
        }
        case 'SET_LOAD_TYPE_SELECTION': {
            const projectSelections = solutionData.projects.map(project => {
                return action.path === project.path
                    ? { ...project, load: action.loadType }
                    : project;
            });
            const imageSelections = solutionData.images?.map(image => {
                return action.path === image.path
                    ? { ...image, load: action.loadType }
                    : image;
            }) || [];
            return { ...solutionData, projects: [...projectSelections], images: [...imageSelections] };
        }
        case 'SET_CORE_SELECTION': {
            const imageSelections = solutionData.images?.map(image => {
                return action.path === image.path
                    ? { ...image, device: action.core }
                    : image;
            }) || [];
            return { ...solutionData, images: [...imageSelections] };
        }
    }
};

type ManageSolutionAction
    = { type: 'INCOMING_MESSAGE', message: IncomingMessage }
    | SolutionUpdateAction;

export const initialState: ManageSolutionState = {
    solutionData: {
        selectedTarget: undefined,
        solutionName: '',
        solutionPath: '',
        targets: [],
        projects: [],
        images: [],
        availableCoreNames: [],
    },
    debugAdapters: [],
    debugger: undefined,
    isDirty: false,
    autoUpdate: true,
    busy: true,
};

const incomingMessageReducer = (
    state: ManageSolutionState,
    { message }: Extract<ManageSolutionAction, { type: 'INCOMING_MESSAGE' }>,
): ManageSolutionState => {
    switch (message.type) {
        case 'DATA_CONTEXT_SELECTION': {
            return { ...state, solutionData: message.data };
        }
        case 'DEBUG_ADAPTERS': {
            const updatedAdapters = message.data.map(da => {
                return {
                    ...da,
                    ['user-interface']: da['user-interface']?.map(section => {
                        if (section.select === undefined) return section;
                        return {
                            ...section,
                            select: message.sectionsInUse.includes(section.section.toLowerCase()),
                        };
                    }) || da['user-interface'],
                };
            });
            return { ...state, debugAdapters: updatedAdapters };
        }
        case 'IS_DIRTY':
            return { ...state, isDirty: message.data };
        case 'IS_BUSY':
            return { ...state, busy: message.data };
        case 'DEBUGGER':
            return { ...state, debugger: message.data };
        case 'ACTIVE_TARGET_SET':
            return { ...state };
        case 'FILE_SELECTED':
            return state;
        case 'AUTO_UPDATE':
            return { ...state, autoUpdate: message.data };
        default:
            console.warn(`Unhandled message: ${JSON.stringify(message)}`);
            return state;
    }
};

export const manageSolutionReducer = (state: ManageSolutionState, action: ManageSolutionAction): ManageSolutionState => {
    switch (action.type) {
        case 'INCOMING_MESSAGE':
            return incomingMessageReducer(state, action);
        case 'SET_SELECTED_TARGET':
        case 'SET_PROJECT_SELECTION':
        case 'SET_BUILD_TYPE_SELECTION':
        case 'SET_LOAD_TYPE_SELECTION':
        case 'SET_CORE_SELECTION':
            return { ...state, solutionData: contextUpdateReducer(state.solutionData, action) };
    }
};
