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

import { UISection, UISectionChildren } from '../../../../debug/debug-adapters-yaml-file';
import { IncomingMessage } from '../../messages';
import { EditableProperty, SolutionData, ManageSolutionState, LoadType } from './manage-solution-state';

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
    | { type: 'EDIT_PROPERTY', key: string, value: string | number }
    | { type: 'FOCUS_PROPERTY', key: string }
    | { type: 'BLUR_PROPERTY', key: string }
    | SolutionUpdateAction;

export const editablePropertyKey = (
    solutionData: SolutionData,
    debuggerName: string | undefined,
    section: UISection | undefined,
    option: UISectionChildren | undefined,
): string => [
    solutionData.selectedTarget?.name ?? '',
    solutionData.selectedTarget?.selectedSet ?? '',
    debuggerName ?? '',
    section?.['yml-node'] ?? '',
    option?.pname ?? '',
    option?.['yml-node'] ?? '',
].join('::');

const getProperty = <T>(defaultValue: T | undefined, obj: Record<string, unknown>, ...keys: (string | undefined)[]): T | undefined => {
    let result: unknown = obj;
    let index = 0;
    while (index < keys.length) {
        const key = keys[index];
        if (!key || !result) {
            index++;
            continue;
        }
        if (Array.isArray(result)) {
            if (key === 'pname' && keys[index + 1] && keys[index + 2]) {
                const pname = keys[index + 1];
                const valueKey = keys[index + 2]!;
                result = result.find(item => item.pname === pname)?.[valueKey];
                index += 3;
                continue;
            }
            result = result[0]?.[key];
        } else {
            result = (result as Record<string, unknown>)[key];
        }
        index++;
    }
    return (result as T | undefined) ?? defaultValue;
};

const propertyValue = (
    selectedDebugger: Record<string, unknown>,
    section: UISection,
    option: UISectionChildren,
): string | number => {
    const sectionNode = section['yml-node'];
    const optionNode = option['yml-node'];
    if (option.type === 'number') {
        const defaultValue = option.default ?? option.range?.[1] ?? 0;
        const raw = getProperty<number>(
            option.scale === undefined ? defaultValue : defaultValue * option.scale,
            selectedDebugger,
            sectionNode,
            option.pname ? 'pname' : undefined,
            option.pname,
            optionNode,
        ) ?? defaultValue;
        return option.scale === undefined ? raw : raw / option.scale;
    }
    return getProperty<string>(
        option.default ?? '',
        selectedDebugger,
        sectionNode,
        option.pname ? 'pname' : undefined,
        option.pname,
        optionNode,
    ) ?? '';
};

const reconcileEditableProperties = (state: ManageSolutionState): Record<string, EditableProperty> => {
    const adapter = state.debugAdapters.find(candidate => candidate.name === state.debugger);
    const selectedDebugger = state.solutionData.selectedTarget?.targetSets
        ?.find(({ name }) => name === (state.solutionData.selectedTarget?.selectedSet ?? ''))
        ?.debugger as Record<string, unknown> | undefined;
    const next: Record<string, EditableProperty> = {};

    adapter?.['user-interface']?.forEach(section => section.options.forEach(option => {
        const key = editablePropertyKey(state.solutionData, state.debugger, section, option);
        const incomingValue = propertyValue(selectedDebugger ?? {}, section, option);
        const current = state.editableProperties[key];
        next[key] = current?.focused || (current?.dirty && current.value !== incomingValue)
            ? current
            : { value: incomingValue, focused: false, dirty: false };
    }));
    return next;
};

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
    editableProperties: {},
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
            const next = { ...state, solutionData: message.data };
            return { ...next, editableProperties: reconcileEditableProperties(next) };
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
            const next = { ...state, debugAdapters: updatedAdapters };
            return { ...next, editableProperties: reconcileEditableProperties(next) };
        }
        case 'IS_DIRTY':
            return { ...state, isDirty: message.data };
        case 'IS_BUSY':
            return { ...state, busy: message.data };
        case 'DEBUGGER':
            {
                const next = { ...state, debugger: message.data };
                return { ...next, editableProperties: reconcileEditableProperties(next) };
            }
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
        case 'EDIT_PROPERTY':
            return {
                ...state,
                editableProperties: {
                    ...state.editableProperties,
                    [action.key]: { value: action.value, dirty: true, focused: state.editableProperties[action.key]?.focused ?? false },
                },
            };
        case 'FOCUS_PROPERTY':
        case 'BLUR_PROPERTY': {
            const property = state.editableProperties[action.key];
            if (!property) return state;
            return {
                ...state,
                editableProperties: {
                    ...state.editableProperties,
                    [action.key]: { ...property, focused: action.type === 'FOCUS_PROPERTY' },
                },
            };
        }
        case 'SET_SELECTED_TARGET':
        case 'SET_PROJECT_SELECTION':
        case 'SET_BUILD_TYPE_SELECTION':
        case 'SET_LOAD_TYPE_SELECTION':
        case 'SET_CORE_SELECTION':
            return { ...state, solutionData: contextUpdateReducer(state.solutionData, action) };
    }
};
