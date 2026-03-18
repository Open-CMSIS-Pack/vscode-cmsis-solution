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

/*
 * Copyright (C) 2023-2026.2024 Arm Limited
 */

import { cSolutionExampleFactory } from '../../../../solar-search/solar-search-client.factories';
import { Trustzone } from '../../cmsis-solution-types';
import { deviceHardwareOptionFactory } from '../../cmsis-solution-types.factories';
import { CreateSolutionState, initialState } from './reducer';
import { blankTemplate } from './templates';
import { hasErrors, validate } from './validation';

describe('Create solutions validation', () => {
    const device = { name: '', vendor: '' };

    describe('hasErrors', () => {
        it('returns true when one or more fields have errors', () => {
            expect(hasErrors({
                projects: [],
                solutionName: 'This one is no good',
                solutionLocation: '',
                solutionFolder: '',
                deviceSelection: '',
                selectedTemplate: '',
                targetType: ''
            })).toBe(true);

            expect(hasErrors({
                projects: ['This one is no good'],
                solutionName: 'This one is no good either',
                solutionLocation: 'What even is this?',
                solutionFolder: 'Why even is this?',
                deviceSelection: 'Why do you do this to me',
                selectedTemplate: 'So many errors',
                targetType: 'No luck',
            })).toBe(true);
        });

        it('returns false when no fields have errors', () => {
            expect(hasErrors({
                projects: ['', ''],
                solutionName: '',
                solutionLocation: '',
                solutionFolder: '',
                deviceSelection: '',
                selectedTemplate: '',
                targetType: ''
            })).toBe(false);
        });
    });

    describe('validate', () => {
        const validStateFactory = (): CreateSolutionState => ({
            ...initialState,
            solutionName: { value:  'Test Solution Name', hadInteraction: true },
            projects: [{ value: { name: 'Test Project Name', processorName: 'some core', trustzone: 'off' }, hadInteraction: true }],
            solutionExists: { type: 'loaded', result: false },
            deviceSelection: { value: deviceHardwareOptionFactory(), hadInteraction: true },
            solutionLocation: { value: '/some/path', hadInteraction: true },
            solutionFolder: { value: '/path2', hadInteraction: true },
            targetType: { value: 'The Target Type', hadInteraction: true },
            selectedTemplate: { value: { type: 'template', value: blankTemplate }, hadInteraction: true },
        });

        it('returns all fields valid for a correctly completed form', () => {
            const inputState = validStateFactory();

            expect(validate(inputState, inputState.solutionExists, false)).toEqual({
                deviceSelection: '',
                projects: [''],
                solutionName: '',
                solutionLocation: '',
                solutionFolder: expect.stringContaining('start with a letter'),
                targetType: expect.stringContaining('Target type must be'),
                selectedTemplate: '',
            });
        });

        it('returns all fields valid for the initial state', () => {
            expect(validate(initialState, initialState.solutionExists, false)).toEqual({
                deviceSelection: '',
                projects: [],
                solutionName: '',
                solutionLocation: '',
                solutionFolder: '',
                targetType: '',
                selectedTemplate: '',
            });
        });

        it('validates empty fields that have had interaction', () => {
            const inputState = {
                ...validStateFactory(),
                solutionName: { value: '', hadInteraction: true },
                projects: [{ value: { name: '', processorName: '', device, trustzone: '' as Trustzone }, hadInteraction: true }],
                deviceSelection: { value: undefined, hadInteraction: true },
                solutionLocation: { value: '', hadInteraction: true },
                solutionFolder: { value: '', hadInteraction: true },
                targetType: { value: '', hadInteraction: false },
                selectedTemplate: { value: undefined, hadInteraction: true },
            };

            expect(validate(inputState, inputState.solutionExists, false)).toEqual({
                deviceSelection: expect.stringContaining('required'),
                projects: [expect.stringContaining('required')],
                solutionName: expect.stringContaining('required'),
                solutionLocation: expect.stringContaining('required'),
                solutionFolder: expect.stringContaining('required'),
                targetType: '',
                selectedTemplate: expect.stringContaining('required'),
            });
        });

        it('validates empty fields that have not had interaction if validateUnmodifiedFields is true', () => {
            const inputState = {
                ...validStateFactory(),
                solutionName: { value: '', hadInteraction: false },
                projects: [{ value: { name: '', processorName: '', device, trustzone: '' as Trustzone }, hadInteraction: false }],
                deviceSelection: { value: undefined, hadInteraction: false },
                solutionLocation: { value: '', hadInteraction: false },
                solutionFolder: { value: '', hadInteraction: false },
                selectedTemplate: { value: undefined, hadInteraction: false },
            };

            validate(inputState, inputState.solutionExists, true);
            expect(validate(inputState, inputState.solutionExists, true)).toEqual({
                deviceSelection: expect.stringContaining('required'),
                projects: [expect.stringContaining('required')],
                solutionName: expect.stringContaining('required'),
                solutionLocation: expect.stringContaining('required'),
                solutionFolder: expect.stringContaining('required'),
                targetType: expect.stringContaining('must be'),
                selectedTemplate: expect.stringContaining('required'),
            });
        });

        it('validates the allowed characters in names', () => {
            const inputState = {
                ...validStateFactory(),
                solutionName: { value: 'A#', hadInteraction: true },
                projects: [{ value: { name:'#Name', processorName: '', device, trustzone: '' as Trustzone }, hadInteraction: true }],
            };

            expect(validate(inputState, inputState.solutionExists, false)).toEqual({
                deviceSelection: '',
                projects: [expect.stringContaining('only contain letters')],
                solutionName: expect.stringContaining('start with a letter'),
                solutionLocation: '',
                solutionFolder: expect.stringContaining('start with a letter'),
                targetType: expect.stringContaining('must be'),
                selectedTemplate: '',
            });
        });

        it('validates the solution does not already exist', () => {
            const inputState: CreateSolutionState = {
                ...validStateFactory(),
                solutionLocation: { value: '/path/to/solution', hadInteraction: true },
                solutionExists: { type: 'loaded', result: true },
            };

            expect(validate(inputState, inputState.solutionExists, false)).toEqual({
                deviceSelection: '',
                projects: [''],
                solutionName: '',
                solutionLocation: expect.stringContaining('already exists'),
                solutionFolder: expect.stringContaining('start with a letter'),
                targetType: expect.stringContaining('must be'),
                selectedTemplate: '',
            });
        });

        it('validates the project name is unique', () => {
            const inputState: CreateSolutionState = {
                ...validStateFactory(),
                projects: [
                    { value: { name: 'Test Project Name', processorName: 'some core', trustzone: 'secure' as Trustzone }, hadInteraction: true },
                    { value: { name: 'Test Project Name', processorName: 'some core', trustzone: 'off' as Trustzone }, hadInteraction: true }
                ],
            };

            expect(validate(inputState, inputState.solutionExists, false)).toEqual({
                deviceSelection: '',
                projects: [expect.stringContaining('unique'), expect.stringContaining('unique')],
                solutionName: '',
                solutionLocation: '',
                solutionFolder: expect.stringContaining('start with a letter'),
                targetType: expect.stringContaining('must be'),
                selectedTemplate: '',
            });
        });

        it('does not validate hardware processors when selected template is an example project', () => {
            const inputState: CreateSolutionState = {
                ...validStateFactory(),
                deviceSelection: { value: deviceHardwareOptionFactory(), hadInteraction: true },
                selectedTemplate: { value: { type: 'example', value: cSolutionExampleFactory() }, hadInteraction: true }
            };

            expect(validate(inputState, inputState.solutionExists, false)).toEqual({
                deviceSelection: '',
                projects: [''],
                solutionName: '',
                solutionLocation: '',
                solutionFolder: expect.stringContaining('start with a letter'),
                targetType: expect.stringContaining('must be'),
                selectedTemplate: '',
            });
        });
    });
});
