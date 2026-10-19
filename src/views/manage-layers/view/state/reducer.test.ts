/**
 * Copyright 2026 Arm Limited
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

import {
    ConfigurationVariable,
    initialState,
    incomingMessageReducer,
    ManageLayersState,
    manageLayersReducer,
    TargetConfiguration,
} from './reducer';

const variableFactory = (overrides: Partial<ConfigurationVariable> = {}): ConfigurationVariable => ({
    variableName: 'BOARD_LAYER',
    variableValue: 'Vendor::Board.Layer',
    description: 'Board layer',
    settings: [{ set: 'Debug' }],
    path: '/packs/board',
    file: 'board.clayer.yml',
    copyTo: 'Layers/Board',
    copyToOrig: 'Layers/Board',
    disabled: false,
    ...overrides,
});

const layerFactory = (variables: ConfigurationVariable[] = [variableFactory()]): TargetConfiguration => ({ variables });

const stateFactory = (overrides: Partial<ManageLayersState> = {}): ManageLayersState => ({
    ...initialState,
    layers: [layerFactory()],
    availableCompilers: ['AC6'],
    selectedCompiler: 'AC6',
    ...overrides,
});

describe('manage layers reducer', () => {
    describe('incomingMessageReducer', () => {
        it('loads board layer data and selects the first compiler', () => {
            const state = stateFactory({
                changeLayerProgress: 'checking',
                currentLayerNumber: 3,
            });
            const layers = [layerFactory(), layerFactory([variableFactory({ variableName: 'SECOND_LAYER' })])];
            const availableCompilers = ['GCC', 'AC6'];

            const result = incomingMessageReducer(state, {
                type: 'BOARD_LAYER_DATA',
                layers,
                activeTargetType: 'Release',
                availableCompilers,
            });

            expect(result).toEqual({
                ...state,
                changeLayerProgress: 'idle',
                layers,
                activeTargetType: 'Release',
                currentLayerNumber: 0,
                availableCompilers,
                selectedCompiler: 'GCC',
            });
            expect(result.layers).not.toBe(layers);
            expect(result.availableCompilers).not.toBe(availableCompilers);
        });

        it('leaves the compiler selection empty when board layer data has no compilers', () => {
            const result = incomingMessageReducer(stateFactory(), {
                type: 'BOARD_LAYER_DATA',
                layers: [],
                activeTargetType: 'Debug',
                availableCompilers: [],
            });

            expect(result.selectedCompiler).toBe('');
        });

        it('clears layer data while loading', () => {
            const state = stateFactory({
                changeLayerProgress: 'adding',
                activeTargetType: 'Debug',
            });

            expect(incomingMessageReducer(state, { type: 'LOADING' })).toEqual({
                ...state,
                availableCompilers: [],
                selectedCompiler: '',
                layers: [],
                changeLayerProgress: 'loading',
                activeTargetType: '',
            });
        });

        it('handles no layer data with and without available compilers', () => {
            const state = stateFactory({ changeLayerProgress: 'loading' });

            expect(incomingMessageReducer(state, {
                type: 'BOARD_LAYER_NODATA',
                activeTargetType: 'Debug',
                availableCompilers: ['IAR', 'AC6'],
            })).toEqual({
                ...state,
                layers: [],
                changeLayerProgress: 'idle',
                activeTargetType: 'Debug',
                availableCompilers: ['IAR', 'AC6'],
                selectedCompiler: 'IAR',
            });
            expect(incomingMessageReducer(state, {
                type: 'BOARD_LAYER_NODATA',
                activeTargetType: 'Debug',
                availableCompilers: [],
            }).selectedCompiler).toBe('');
        });

        it('preserves state for successful and failed request acknowledgements', () => {
            const state = stateFactory();

            expect(incomingMessageReducer(state, {
                type: 'REQUEST_SUCCESSFUL',
                requestType: 'APPLY_CONFIGURE',
            })).toBe(state);
            expect(incomingMessageReducer(state, {
                type: 'REQUEST_FAILED',
                requestType: 'APPLY_CONFIGURE',
                errorMessage: 'copy failed',
            })).toBe(state);
        });

        it('updates the platform', () => {
            const state = stateFactory();

            expect(incomingMessageReducer(state, {
                type: 'PLATFORM',
                data: { name: 'vscode' },
            })).toEqual({
                ...state,
                platform: 'vscode',
            });
        });

        it('replaces layer errors and removes stale layers', () => {
            const state = stateFactory();
            const layerErrors = [{
                name: 'Board layer',
                project: 'App',
                configuration: 'Debug',
                messages: ['Layer is incompatible'],
            }];

            expect(incomingMessageReducer(state, {
                type: 'BOARD_LAYER_DATA_ERRORS',
                layerErrors,
            })).toEqual({
                ...state,
                layerErrors,
                layers: [],
            });
        });

        it('records a path check result without discarding other results', () => {
            const state = stateFactory({
                layerPathError: [{ variableId: 0, pathExists: false }],
            });

            const result = incomingMessageReducer(state, {
                type: 'RESULT_LAYER_EXISTS_CHECK',
                variableId: 1,
                result: true,
            });

            expect(Array.isArray(result.layerPathError)).toBe(true);
            expect(result.layerPathError).toEqual([
                { variableId: 0, pathExists: false },
                { variableId: 1, pathExists: true },
            ]);
            expect(state.layerPathError).toEqual([{ variableId: 0, pathExists: false }]);
        });
    });

    describe('manageLayersReducer', () => {
        it('preserves state when a layer check starts', () => {
            const state = stateFactory({ changeLayerProgress: 'checking' });

            expect(manageLayersReducer(state, { type: 'LAYERS_CHECK_START' })).toBe(state);
        });

        it.each(['LAYERS_START', 'LAYERS_END'] as const)('returns to idle for %s', type => {
            const state = stateFactory({ changeLayerProgress: 'adding' });

            expect(manageLayersReducer(state, { type })).toEqual({
                ...state,
                changeLayerProgress: 'idle',
            });
        });

        it('does not navigate before the first layer', () => {
            const state = stateFactory({ currentLayerNumber: 0 });

            expect(manageLayersReducer(state, { type: 'PREV_LAYER' })).toBe(state);
        });

        it('navigates to the previous layer and clears path errors', () => {
            const state = stateFactory({
                layers: [layerFactory(), layerFactory()],
                currentLayerNumber: 1,
                layerPathError: [{ variableId: 0, pathExists: true }],
            });

            expect(manageLayersReducer(state, { type: 'PREV_LAYER' })).toEqual({
                ...state,
                currentLayerNumber: 0,
                layerPathError: [],
            });
        });

        it('does not navigate past the last or an absent layer', () => {
            const lastLayerState = stateFactory({
                layers: [layerFactory(), layerFactory()],
                currentLayerNumber: 1,
            });
            const emptyState = stateFactory({ layers: [], currentLayerNumber: 0 });

            expect(manageLayersReducer(lastLayerState, { type: 'NEXT_LAYER' })).toBe(lastLayerState);
            expect(manageLayersReducer(emptyState, { type: 'NEXT_LAYER' })).toBe(emptyState);
        });

        it('navigates to the next layer and clears path errors', () => {
            const state = stateFactory({
                layers: [layerFactory(), layerFactory()],
                layerPathError: [{ variableId: 0, pathExists: true }],
            });

            expect(manageLayersReducer(state, { type: 'NEXT_LAYER' })).toEqual({
                ...state,
                currentLayerNumber: 1,
                layerPathError: [],
            });
        });

        it('delegates incoming messages', () => {
            const state = stateFactory();

            expect(manageLayersReducer(state, {
                type: 'INCOMING_MESSAGE',
                message: { type: 'PLATFORM', data: { name: 'vscode' } },
            })).toEqual({
                ...state,
                platform: 'vscode',
            });
        });

        it('updates the selected platform and compiler', () => {
            const state = stateFactory();
            const platformState = manageLayersReducer(state, { type: 'SET_PLATFORM', name: 'vscode' });

            expect(platformState).toEqual({ ...state, platform: 'vscode' });
            expect(manageLayersReducer(platformState, { type: 'SET_COMPILER', compiler: 'GCC' })).toEqual({
                ...platformState,
                selectedCompiler: 'GCC',
            });
        });

        it('updates one copy destination without mutating other variables or layers', () => {
            const firstVariable = variableFactory();
            const secondVariable = variableFactory({ variableName: 'SECOND_LAYER', copyTo: 'Layers/Second' });
            const otherLayer = layerFactory([variableFactory({ variableName: 'OTHER_OPTION' })]);
            const state = stateFactory({
                layers: [layerFactory([firstVariable, secondVariable]), otherLayer],
            });

            const result = manageLayersReducer(state, {
                type: 'CURRENT_LAYER_PATH_COPYTO',
                variableId: 1,
                newPath: 'Custom/Second',
            });

            expect(Array.isArray(result.layers)).toBe(true);
            expect(result.layers[0].variables).toEqual([
                firstVariable,
                { ...secondVariable, copyTo: 'Custom/Second' },
            ]);
            expect(result.layers[1]).toBe(otherLayer);
            expect(state.layers[0].variables[1].copyTo).toBe('Layers/Second');
        });

        it('restores one copy destination to its original value', () => {
            const variable = variableFactory({
                copyTo: 'Custom/Board',
                copyToOrig: 'Layers/Board',
            });
            const unchangedVariable = variableFactory({ variableName: 'SECOND_LAYER' });
            const otherLayer = layerFactory([variableFactory({ variableName: 'OTHER_OPTION' })]);
            const state = stateFactory({
                layers: [layerFactory([variable, unchangedVariable]), otherLayer],
            });

            const result = manageLayersReducer(state, {
                type: 'CURRENT_LAYER_PATH_COPYTO_DEFAULT',
                variableId: 0,
            });

            expect(Array.isArray(result.layers)).toBe(true);
            expect(result.layers[0].variables[0]).toEqual({
                ...variable,
                copyTo: 'Layers/Board',
            });
            expect(result.layers[0].variables[1]).toBe(unchangedVariable);
            expect(result.layers[1]).toBe(otherLayer);
            expect(state.layers[0].variables[0].copyTo).toBe('Custom/Board');
        });
    });
});
