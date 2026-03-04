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

import * as Messages from '../../messages';

export type ChangeLayerProgress = 'idle' | 'loading' | 'checking' | 'adding';
export type ViewLayerState = 'idle' | 'prev' | 'next';


export type VariableSet = {
    set: string;
}

export type ConfigurationVariable = {
    variableName: string;
    variableValue: string;
    description: string;
    settings?: VariableSet[];
    path: string;
    file: string;
    copyTo: string;
    copyToOrig: string;
    disabled: boolean;
}

export type TargetConfiguration = {
    variables: ConfigurationVariable[];
}

export type LayerError = {
    name: string;
    project: string;
    configuration: string;
    messages: string[] | undefined;
};

export type LayerPathError = {
    variableId: number;
    pathExists: boolean;
};

export type ManageLayersState = {
    changeLayerProgress: ChangeLayerProgress;
    layers: TargetConfiguration[];
    currentLayerNumber: number;
    platform: Messages.Platform;
    viewLayer: ViewLayerState;
    availableCompilers: string[];
    selectedCompiler: string;
    layerErrors: LayerError[];
    activeTargetType?: string;
    layerPathError: LayerPathError[];
}

export const initialState: ManageLayersState = {
    changeLayerProgress: 'idle',
    layers: [],
    currentLayerNumber: 0,
    platform: 'ksc',
    viewLayer: 'idle',
    availableCompilers: [],
    selectedCompiler: '',
    layerErrors: [],
    layerPathError: [],
};

export type ManageLayersAction
    = { type: 'LAYERS_CHECK_START' }
    | { type: 'LAYERS_START' }
    | { type: 'LAYERS_END' }
    | { type: 'INCOMING_MESSAGE', message: Messages.IncomingMessage }
    | { type: 'SET_PLATFORM', name: Messages.Platform }
    | { type: 'PREV_LAYER' }
    | { type: 'NEXT_LAYER' }
    | { type: 'CURRENT_LAYER_PATH_COPYTO', variableId: number, newPath: string }
    | { type: 'CURRENT_LAYER_PATH_COPYTO_DEFAULT', variableId: number }
    | { type: 'SET_COMPILER', compiler: string }
    ;

export const incomingMessageReducer = (state: ManageLayersState, message: Messages.IncomingMessage): ManageLayersState => {
    switch (message.type) {
        case 'BOARD_LAYER_DATA':
            return {
                ...state,
                changeLayerProgress: 'idle',
                layers: [ ...message.layers ],
                activeTargetType: message.activeTargetType,
                currentLayerNumber: 0,
                availableCompilers: [ ...message.availableCompilers],
                selectedCompiler: Object.keys(message.availableCompilers).length ? message.availableCompilers[0] : '',
            };
        case 'LOADING':
            return {
                ...state,
                availableCompilers: [],
                selectedCompiler: '',
                layers: [],
                changeLayerProgress: 'loading',
                activeTargetType: '',
            };
        case 'BOARD_LAYER_NODATA':
            return {
                ...state,
                layers: [],
                changeLayerProgress: 'idle',
                activeTargetType: message.activeTargetType,
                availableCompilers: [ ...message.availableCompilers ],
                selectedCompiler: Object.keys(message.availableCompilers).length ? message.availableCompilers[0] : '',
            };
        case 'REQUEST_SUCCESSFUL':
        case 'REQUEST_FAILED':
            return state;
        case 'PLATFORM':
            return {
                ...state,
                platform: message.data.name,
            };
        case 'BOARD_LAYER_DATA_ERRORS':
            return {
                ...state,
                layerErrors: message.layerErrors,
                layers: [], // removing layers
            };
        case 'RESULT_LAYER_EXISTS_CHECK':
            return { ...state,
                layerPathError: {
                    ...state.layerPathError,
                    [message.variableId]: { variableId: message.variableId, pathExists: message.result },
                }
            };

        default:
            return message;
    }
};

const applyCopyToPath = (state: ManageLayersState, id: number, newPath: string): ManageLayersState => {
    return {
        ...state,
        layers: {
            ...state.layers,
            [state.currentLayerNumber]: {
                ...state.layers[state.currentLayerNumber],
                variables: state.layers[state.currentLayerNumber].variables.map((variable, index) => {
                    if (index === id) {
                        return {
                            ...variable,
                            copyTo: newPath,
                        };
                    }
                    return variable;
                })
            }
        },
    };
};

const applyCopyToPathDefault = (state: ManageLayersState, id: number): ManageLayersState => {
    return {
        ...state,
        layers: {
            ...state.layers,
            [state.currentLayerNumber]: {
                ...state.layers[state.currentLayerNumber],
                variables: state.layers[state.currentLayerNumber].variables.map((variable, index) => {
                    if (index === id) {
                        return {
                            ...variable,
                            copyTo: variable.copyToOrig,
                        };
                    }
                    return variable;
                })
            }
        },
    };
};

export const manageLayersReducer = (state: ManageLayersState, action: ManageLayersAction): ManageLayersState => {
    switch (action.type) {
        case 'LAYERS_CHECK_START':
            return state;
        case 'LAYERS_START':
            return { ...state, changeLayerProgress: 'idle' };
        case 'LAYERS_END':
            return { ...state, changeLayerProgress: 'idle' };
        case 'PREV_LAYER':
            if (state.currentLayerNumber === 0) {
                return state;
            }
            return {
                ...state,
                currentLayerNumber: state.currentLayerNumber - 1,
                layerPathError: [],
            };
        case 'NEXT_LAYER': {
            const len = Object.keys(state.layers).length;
            const maxNum = len - (len ? 1 : 0);
            if (state.currentLayerNumber === maxNum) {
                return state;
            }
            return {
                ...state,
                currentLayerNumber: state.currentLayerNumber + 1,
                layerPathError: [],
            };
        }
        case 'INCOMING_MESSAGE':
            return incomingMessageReducer(state, action.message);
        case 'SET_PLATFORM':
            return { ...state, platform: action.name };
        case 'CURRENT_LAYER_PATH_COPYTO':
            return applyCopyToPath(state, action.variableId, action.newPath);
        case 'CURRENT_LAYER_PATH_COPYTO_DEFAULT':
            return applyCopyToPathDefault(state, action.variableId);
        case 'SET_COMPILER':
            return { ...state, selectedCompiler: action.compiler };
        default:
            // Exhaustiveness check
            return action;
    }
};
