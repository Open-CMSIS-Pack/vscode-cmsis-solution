/**
 * Copyright 2022-2026 Arm Limited
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

import { faker } from '@faker-js/faker';
import { waitTimeout } from '../../../__test__/test-waits';
import { TargetType } from '../../../solutions/parsing/solution-file';
import { serialiseBoardIdWithoutVendor, serialiseDeviceWithoutVendor, serialisePackReference } from '../../../solutions/solution-serialisers';
import { MockMessageHandler } from '../../__test__/mock-message-handler';
import { DeviceHardwareOption } from '../cmsis-solution-types';
import { boardHardwareOptionFactory, deviceHardwareOptionFactory } from '../cmsis-solution-types.factories';
import { IncomingMessage, OutgoingMessage } from '../messages';
import { buildNewSolutionMessage, checkSolutionExists, createSolution } from './actions';
import { CreateSolutionAction, CreateSolutionState, initialState } from './state/reducer';

describe('Create Solution actions', () => {
    let messageListener: jest.Mock;
    let messageHandler: MockMessageHandler<IncomingMessage, OutgoingMessage>;
    let dispatch: jest.Mock;

    beforeEach(() => {
        messageListener = jest.fn();
        messageHandler = new MockMessageHandler<IncomingMessage, OutgoingMessage>(messageListener);
        dispatch = jest.fn();
    });

    describe('checkSolutionExists', () => {
        it('dispatches a START_SOLUTION_EXISTS_CHECK and a END_SOLUTION_EXISTS_CHECK action if the request succeeds', async () => {
            const solutionName = 'Solution Name';
            const solutionLocation = '/solution/location';
            const solutionFolder = solutionName;

            const promise = checkSolutionExists(
                messageHandler,
                dispatch,
                solutionLocation,
                solutionName,
                solutionFolder,
            );

            const expectedMessage: OutgoingMessage = {
                type: 'CHECK_SOLUTION_DOES_NOT_EXIST',
                solutionName,
                solutionLocation,
                solutionFolder,
            };

            expect(messageListener).toHaveBeenCalledWith(expectedMessage);

            const expectedAction1: CreateSolutionAction = { type: 'START_SOLUTION_EXISTS_CHECK' };
            expect(dispatch).toHaveBeenCalledWith(expectedAction1);

            messageHandler.postWindowMessage({
                type: 'REQUEST_SUCCESSFUL',
                requestType: 'CHECK_SOLUTION_DOES_NOT_EXIST',
            });

            await promise;

            const expectedAction2: CreateSolutionAction = { type: 'END_SOLUTION_EXISTS_CHECK', result: false };
            expect(dispatch).toHaveBeenCalledWith(expectedAction2);
        });

        it('dispatches a START_SOLUTION_EXISTS_CHECK and a END_SOLUTION_EXISTS_CHECK action if the request fails', async () => {
            const solutionName = 'Solution Name';
            const solutionLocation = '/solution/location';
            const solutionFolder = solutionName;

            const promise = checkSolutionExists(
                messageHandler,
                dispatch,
                solutionLocation,
                solutionName,
                solutionFolder,
            );

            const expectedMessage: OutgoingMessage = {
                type: 'CHECK_SOLUTION_DOES_NOT_EXIST',
                solutionName,
                solutionLocation,
                solutionFolder,
            };

            expect(messageListener).toHaveBeenCalledWith(expectedMessage);

            const expectedAction1: CreateSolutionAction = { type: 'START_SOLUTION_EXISTS_CHECK' };
            expect(dispatch).toHaveBeenCalledWith(expectedAction1);

            messageHandler.postWindowMessage({
                type: 'REQUEST_FAILED',
                requestType: 'CHECK_SOLUTION_DOES_NOT_EXIST',
                errorMessage: 'already exists'
            });

            await promise;

            const expectedAction2: CreateSolutionAction = { type: 'END_SOLUTION_EXISTS_CHECK', result: true };
            expect(dispatch).toHaveBeenCalledWith(expectedAction2);
        });
    });

    describe('buildNewSolutionMessage', () => {
        const validStateFactory = (device?: DeviceHardwareOption): CreateSolutionState => ({
            ...initialState,
            initGit: false,
            solutionName: { value: 'Solution Name', hadInteraction: true },
            projects: [{ value: { name: 'Project Name', processorName: 'some core', trustzone: 'off' }, hadInteraction: true }],
            solutionLocation: { value: '/solution/location', hadInteraction: true },
            solutionFolder: { value: 'Solution Name', hadInteraction: true },
            targetType: { value: faker.word.noun(), hadInteraction: true },
            deviceSelection: { value: device ?? deviceHardwareOptionFactory(), hadInteraction: true },
        });

        it('creates a NEW_SOLUTION message for valid device hardware inputs', () => {
            const device = deviceHardwareOptionFactory();
            const inputState = validStateFactory(device);
            const output = buildNewSolutionMessage(inputState);

            const expectedMessage: OutgoingMessage = {
                type: 'NEW_SOLUTION',
                gitInit: false,
                compiler: '',
                solutionName: 'Solution Name',
                projects: [{ name: 'Project Name', processorName: 'some core', trustzone: 'off' }],
                solutionLocation: '/solution/location',
                solutionFolder: 'Solution Name',
                packs: [{ pack: serialisePackReference(device.pack), forContext: [], notForContext: [] }, { pack:  'ARM::CMSIS', forContext: [], notForContext: [] }],
                //targetTypes: [{ type: inputState.targetType.value, device: `${device.id.vendor}::${device.id.name}` }],
                targetTypes: [{ type: inputState.targetType.value, device: `${device.id.name}` }],
                selectedTemplate: undefined,
                showOpenDialog: false,
            };

            expect(output).toEqual(expectedMessage);
        });

        it('creates a target type with a board if a board was selected', () => {
            const deviceHardwareOption = deviceHardwareOptionFactory();
            const boardHardwareOption = boardHardwareOptionFactory({ mountedDevices: [deviceHardwareOption] });

            const inputState: CreateSolutionState = {
                ...validStateFactory(),
                boardSelection: { value: boardHardwareOption, hadInteraction: true },
                deviceSelection: { value: deviceHardwareOption, hadInteraction: true }
            };

            const output = buildNewSolutionMessage(inputState);
            const serDeviceFunc = serialiseDeviceWithoutVendor; // serialiseDevice
            const serBoardFunc = serialiseBoardIdWithoutVendor; // serialiseBoardId


            const expectedTargetType: TargetType = {
                type: inputState.targetType.value,
                board: serBoardFunc(boardHardwareOption.id),
                device: serDeviceFunc({ ...deviceHardwareOption.id, processor: '' }),
            };

            expect((output as Extract<OutgoingMessage, { type: 'NEW_SOLUTION' }>).targetTypes).toEqual([expectedTargetType]);
            expect((output as Extract<OutgoingMessage, { type: 'NEW_SOLUTION' }>).packs).toEqual([
                { pack: serialisePackReference(boardHardwareOption.pack), forContext: [], notForContext: [] },
                { pack: serialisePackReference(deviceHardwareOption.pack), forContext: [], notForContext: []  },
                { pack:  'ARM::CMSIS', forContext: [], notForContext: []  },
            ]);
        });

        it('respects the git init state', () => {
            const inputState: CreateSolutionState = { ...validStateFactory(), initGit: true };
            const output = buildNewSolutionMessage(inputState);
            expect((output as Extract<OutgoingMessage, { type: 'NEW_SOLUTION' }>).gitInit).toBe(true);
        });

        it('respects the selected compiler', () => {
            const gccInputState: CreateSolutionState = { ...validStateFactory(), compiler: 'GCC' };
            const gccOutput = buildNewSolutionMessage(gccInputState);
            expect((gccOutput as Extract<OutgoingMessage, { type: 'NEW_SOLUTION' }>).compiler).toEqual('GCC');

            const llvmInputState: CreateSolutionState = { ...validStateFactory(), compiler: 'LLVM' };
            const llvmOutput = buildNewSolutionMessage(llvmInputState);
            expect((llvmOutput as Extract<OutgoingMessage, { type: 'NEW_SOLUTION' }>).compiler).toEqual('CLANG');
        });
    });

    describe('createSolution', () => {
        it('does not submit if there are validation errors', async () => {
            const promise = createSolution(dispatch, initialState, messageHandler);

            expect(messageListener).toHaveBeenCalledWith(expect.objectContaining({ type: 'CHECK_SOLUTION_DOES_NOT_EXIST' }));
            messageHandler.postWindowMessage({ type: 'REQUEST_SUCCESSFUL', requestType: 'CHECK_SOLUTION_DOES_NOT_EXIST' });

            await promise;

            const expectedAction1: CreateSolutionAction = { type: 'CREATION_CHECK_START' };
            expect(dispatch).toHaveBeenCalledWith(expectedAction1);

            const expectedAction2: CreateSolutionAction = { type: 'CREATION_END' };
            expect(dispatch).toHaveBeenCalledWith(expectedAction2);

            expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'CREATION_START' }));
            expect(messageListener).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'NEW_SOLUTION' }));
            expect(messageListener).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'WEBVIEW_CLOSE' }));
        });

        it('closes the webview if creation succeeds', async () => {
            const inputState: CreateSolutionState = {
                ...initialState,
                initGit: false,
                solutionName: { value: 'Solution Name', hadInteraction: true },
                projects: [{ value: { name: 'Project Name', processorName: 'some core', trustzone: 'off' }, hadInteraction: true }],
                solutionLocation: { value: '/solution/location', hadInteraction: true },
                solutionFolder: { value: 'folder', hadInteraction: true },
                targetType: { value: 'the-target', hadInteraction: true },
                deviceSelection: { value: deviceHardwareOptionFactory(), hadInteraction: true },
                selectedTemplate: { value: { type: 'template', value: { name: 'Blank solution', description: '' } }, hadInteraction: true },
            };

            const promise = createSolution(dispatch, inputState, messageHandler);

            const expectedAction1: CreateSolutionAction = { type: 'CREATION_CHECK_START' };
            expect(dispatch).toHaveBeenCalledWith(expectedAction1);

            messageHandler.postWindowMessage({ type: 'REQUEST_SUCCESSFUL', requestType: 'CHECK_SOLUTION_DOES_NOT_EXIST' });

            await waitTimeout();

            const expectedAction2: CreateSolutionAction = { type: 'CREATION_START' };
            expect(dispatch).toHaveBeenCalledWith(expectedAction2);

            const expectedCreationMessage: OutgoingMessage = buildNewSolutionMessage(inputState);

            expect(messageListener).toHaveBeenCalledWith(expectedCreationMessage);
            messageHandler.postWindowMessage({ type: 'REQUEST_SUCCESSFUL', requestType: 'NEW_SOLUTION' });

            await promise;

            expect(messageListener).toHaveBeenCalledWith(expect.objectContaining({ type: 'WEBVIEW_CLOSE' }));
        });
    });
});
