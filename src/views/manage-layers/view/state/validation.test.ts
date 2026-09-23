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

import { ConfigurationVariable, initialState, ManageLayersState } from './reducer';
import { hasErrors, validate } from './validation';

const variableFactory = (overrides: Partial<ConfigurationVariable> = {}): ConfigurationVariable => ({
    variableName: 'BOARD_LAYER',
    variableValue: 'Vendor::Board.Layer',
    description: 'Board layer',
    path: '/packs/board',
    file: 'board.clayer.yml',
    copyTo: 'Layers/Board',
    copyToOrig: 'Layers/Board',
    disabled: false,
    ...overrides,
});

const stateFactory = (
    variables: ConfigurationVariable[],
    overrides: Partial<ManageLayersState> = {},
): ManageLayersState => ({
    ...initialState,
    layers: [{ variables }],
    ...overrides,
});

describe('manage layers validation', () => {
    describe('hasErrors', () => {
        it('returns true when any variable has a path error', () => {
            expect(hasErrors({
                layerValidation: [
                    { path: 'Layers/Board', varNumber: 0, pathError: '' },
                    { path: '', varNumber: 1, pathError: 'This field is required.' },
                ],
            })).toBe(true);
        });

        it('returns false for empty validation and variables without path errors', () => {
            expect(hasErrors({ layerValidation: [] })).toBe(false);
            expect(hasErrors(validate(initialState))).toBe(false);
            expect(hasErrors({
                layerValidation: [
                    { path: 'Layers/Board', varNumber: 0, pathError: '' },
                    { path: '/Layers/Device_1', varNumber: 1, pathError: '' },
                ],
            })).toBe(false);
        });
    });

    describe('validate', () => {
        it('returns no variable results when there is no current layer', () => {
            expect(validate(initialState)).toEqual({ layerValidation: [] });
        });

        it('accepts valid relative and absolute paths', () => {
            const state = stateFactory([
                variableFactory({ copyTo: 'Layers/Board-1' }),
                variableFactory({ copyTo: '/Layers/Device_2' }),
            ]);

            expect(validate(state)).toEqual({
                layerValidation: [
                    { path: 'Layers/Board-1', varNumber: 0, pathError: '' },
                    { path: '/Layers/Device_2', varNumber: 1, pathError: '' },
                ],
            });
        });

        it('reports required and illegal path values by variable index', () => {
            const state = stateFactory([
                variableFactory({ copyTo: '' }),
                variableFactory({ copyTo: 'Layers/Board Layer' }),
            ]);

            expect(validate(state)).toEqual({
                layerValidation: [
                    { path: '', varNumber: 0, pathError: 'This field is required.' },
                    { path: 'Layers/Board Layer', varNumber: 1, pathError: 'Path contains illegal characters.' },
                ],
            });
        });

        it('prioritizes an existing-path error over other validation', () => {
            const state = stateFactory(
                [variableFactory({ copyTo: '' })],
                { layerPathError: [{ variableId: 0, pathExists: true }] },
            );

            expect(validate(state)).toEqual({
                layerValidation: [
                    { path: '', varNumber: 0, pathError: 'Path already exists.' },
                ],
            });
        });

        it('ignores required, character, and existing-path checks for disabled variables', () => {
            const state = stateFactory(
                [
                    variableFactory({ copyTo: '', disabled: true }),
                    variableFactory({ copyTo: 'Layers/Board Layer', disabled: true }),
                ],
                {
                    layerPathError: [
                        { variableId: 0, pathExists: true },
                        { variableId: 1, pathExists: true },
                    ],
                },
            );

            expect(validate(state)).toEqual({
                layerValidation: [
                    { path: '', varNumber: 0, pathError: '' },
                    { path: 'Layers/Board Layer', varNumber: 1, pathError: '' },
                ],
            });
        });

        it('only applies a path check result to its matching variable', () => {
            const state = stateFactory(
                [variableFactory(), variableFactory({ copyTo: 'Layers/Device' })],
                {
                    layerPathError: [
                        { variableId: 1, pathExists: true },
                        { variableId: 0, pathExists: true },
                    ],
                },
            );

            expect(validate(state)).toEqual({
                layerValidation: [
                    { path: 'Layers/Board', varNumber: 0, pathError: '' },
                    { path: 'Layers/Device', varNumber: 1, pathError: '' },
                ],
            });
        });
    });
});
