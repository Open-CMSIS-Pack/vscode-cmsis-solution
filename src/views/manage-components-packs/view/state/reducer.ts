/**
 * Copyright 2022-2026 Arm Limited
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

import { PackId } from '../../../../packs/pack-id';
import { AsyncStatus } from '../../../async-status';
import { TargetType } from '../../../manage-solution/view/state/manage-solution-state';
import { CClass, ComponentOptionId, CurrentTarget, Layer, PacksFilterValue, Project, TargetSetData, UiErrorMessage } from '../../components-data';
import { ComponentRowId } from '../../data/component-row-id';
import { ComponentRowDataType, ComponentScope, mapTree, PackRowDataType } from '../../data/component-tools';
import * as Messages from '../../messages';
import { packsRowFromInfo } from '../helpers/components-packs-helpers';

export type ComponentsState = {
    stateMessage: string | undefined;
    cClasses: AsyncStatus<CClass[]>;
    searchText: string;
    packsFilterValue: PacksFilterValue,
    showSelectedOnly: boolean;
    expandedGroups: ComponentRowId[];
    /**
     * Tracks which bundle the user has picked from a bundle dropdown.
     */
    visibleBundles: { [cClass in string]: string };
    /**
     * Tracks which vendor/variant/version option is visible in the UI for each row ID.
     * If the row has a selected option, that option takes precedence over this state.
     */
    visibleComponentOptions: { rowId: ComponentRowId, optionId: ComponentOptionId }[];
    currentTarget: CurrentTarget;
    targetTypes: TargetType[] | undefined;
    selectedProject: Project | undefined;
    availableProjects: Project[];
    missingPacks: PackId[];
    solution: Messages.SolutionInfo;
    componentTree: ComponentRowDataType[],
    isDirty: boolean;
    layers: Layer[]; // List of available layers, used for the component tree
    packs?: PackRowDataType[]; // Information about available packs
    cbuildPackPath: string,
    componentScope: ComponentScope;
    errorMessages: UiErrorMessage[]; // Add errorMessages property
    availableTargetTypes: TargetSetData[]; // Available target types for UI
    selectedTargetType: TargetSetData | undefined; // Currently selected target type
    unlilnkRequestStack: string[]; // Stack of unlink requests
    availablePacks: Record<string, string>; // Map of available packs (id to URL)
}

export type ComponentsAction
    = { type: 'INCOMING_MESSAGE', message: Messages.IncomingMessage }
    | { type: 'SET_COMPONENT_SCOPE', scope: ComponentScope }
    ;

export type ComponentsDispatch = (action: ComponentsAction) => void;

export const initialState: ComponentsState = {
    cClasses: { type: 'loading' },
    searchText: '',
    packsFilterValue: 'solution',
    showSelectedOnly: false,
    expandedGroups: [],
    visibleBundles: {},
    visibleComponentOptions: [],
    layers: [],
    currentTarget: { type: 'all' },
    targetTypes: [],
    selectedProject: undefined,
    availableProjects: [],
    missingPacks: [],
    solution: { name: '' },
    cbuildPackPath: '',
    componentTree: [],
    isDirty: false,
    componentScope: ComponentScope.Solution,
    stateMessage: 'Initializing...',
    errorMessages: [], // Initialize errorMessages
    availableTargetTypes: [], // Initialize availableTargetTypes
    selectedTargetType: undefined, // Initialize selectedTargetType
    unlilnkRequestStack: [], // Initialize unlinkRequests
    availablePacks: {}, // Initialize availablePacks
};

const incomingMessageReducer = (
    state: ComponentsState,
    { message }: Extract<ComponentsAction, { type: 'INCOMING_MESSAGE' }>
): ComponentsState => {
    switch (message.type) {
        case 'SELECTED_PROJECT': {
            return { ...state, selectedProject: message.project };
        }
        case 'SET_COMPONENT_TREE': {
            return {
                ...state,
                componentTree: mapTree(message.tree, message.validations),
                componentScope: message.scope ?? state.componentScope
            };
        }
        case 'IS_DIRTY': {
            return { ...state, isDirty: message.isDirty };
        }
        case 'SET_SOLUTION_STATE': {
            return { ...state, stateMessage: message.stateMessage };
        }
        case 'SET_ERROR_MESSAGES': {
            return {
                ...state,
                errorMessages: message.messages
            };
        }
        case 'SET_PACKS_INFO': {
            return { ...state, packs: message.packs?.map(packsRowFromInfo) };
        }
        case 'SET_SOLUTION_INFO': {
            return { ...state, solution: message.solution ?? {} };
        }
        case 'SOLUTION_LOADED': {
            return {
                ...state,
                componentTree: mapTree(message.componentTree, message.validations),
                componentScope: message.componentScope,
                availableTargetTypes: message.availableTargetTypes,
                selectedTargetType: message.selectedTargetType,
                packs: message.packs?.map(packsRowFromInfo),
                solution: message.solution ?? {},
                isDirty: message.isDirty ?? state.isDirty,
                stateMessage: undefined,
                cbuildPackPath: message.cbuildPackPath,
                errorMessages: [],
                availablePacks: message.availablePacks
            };
        }
        case 'SET_UNLINKREQUESTS_STACK': {
            return { ...state, unlilnkRequestStack: message.unlinkRequests };
        }
        default:
            // Exhaustiveness check
            return message;
    }
};

export const componentsReducer = (state: ComponentsState, action: ComponentsAction): ComponentsState => {
    switch (action.type) {
        case 'INCOMING_MESSAGE':
            return incomingMessageReducer(state, action);
        case 'SET_COMPONENT_SCOPE':
            return { ...state, componentScope: action.scope };
        default:
            // Exhaustiveness check
            return state;
    }
};
