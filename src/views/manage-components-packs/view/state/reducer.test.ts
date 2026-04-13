/* eslint-disable @typescript-eslint/no-explicit-any */
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

import 'jest';
import { Project } from '../../components-data';
import { initialState, ComponentsAction, componentsReducer, ComponentsState } from './reducer';

// Checks that all properties of the outputState equal the inputState, apart from the given keys
const checkValuesUnmodified = (
    keysWithExpectedModifications: Array<keyof ComponentsState>,
    inputState: ComponentsState,
    outputState: ComponentsState
) => {
    const filteredInputState = Object.fromEntries(
        Object.entries(inputState).filter(([key]) => !keysWithExpectedModifications.includes(key as keyof ComponentsState))
    );

    const filteredOutputState = Object.fromEntries(
        Object.entries(outputState).filter(([key]) => !keysWithExpectedModifications.includes(key as keyof ComponentsState))
    );

    expect(filteredInputState).toEqual(filteredOutputState);
};

describe('manageComponentsReducer', () => {

    describe('handling an INCOMING_MESSAGE action', () => {
        it('sets the selected project if the message type is SELECTED_PROJECT, leaving other properties unmodified', () => {
            const project: Project = { projectId: 'path/to/myProject.cproject.yml', projectName: 'myProject' };

            const action: ComponentsAction = {
                type: 'INCOMING_MESSAGE',
                message: { type: 'SELECTED_PROJECT', project }
            };

            const inputState = { ...initialState, selectedProject: undefined };
            const outputState = componentsReducer(inputState, action);
            expect(outputState.selectedProject).toBe(project);
            checkValuesUnmodified(['selectedProject'], inputState, outputState);
        });

        it('stores packs when receiving SET_PACKS_INFO, leaving other properties unmodified', () => {
            const pack = {
                key: 'Vendor::Pack@1.0.0',
                packId: 'Vendor::Pack@1.0.0',
                name: 'Vendor::Pack',
                description: 'A pack',
                used: true,
                references: [{ pack: 'Vendor::Pack@1.0.0', origin: 'my.cproject.yml', relOrigin: 'my.cproject.yml', selected: true }],
                overviewLink: '',
                versionUsed: '1.0.0',
                versionTarget: '',
            };
            const action: ComponentsAction = {
                type: 'INCOMING_MESSAGE',
                message: {
                    type: 'SET_PACKS_INFO',
                    packs: [pack]
                }
            };

            const inputState = { ...initialState, packs: undefined };
            const outputState = componentsReducer(inputState, action);

            expect(outputState.packs).toEqual([pack]);
            checkValuesUnmodified(['packs'], inputState, outputState);
        });

        it('returns unknown message object in reducer default branch', () => {
            const unknownMessage = { type: 'UNEXPECTED_INCOMING_MESSAGE' } as any;
            const action = { type: 'INCOMING_MESSAGE', message: unknownMessage } as ComponentsAction;

            const outputState = componentsReducer(initialState, action as any);
            expect(outputState).toBe(unknownMessage);
        });

    });
});
