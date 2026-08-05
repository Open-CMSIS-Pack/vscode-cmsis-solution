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

import { faker } from '@faker-js/faker';
import { waitTimeout } from '../../../__test__/test-waits';
import { serialisePackId } from '../../../packs/pack-id';
import { serialiseBoardIdWithoutVendor, serialiseDeviceWithoutVendor } from '../../../solutions/solution-serialisers';
import { MockMessageHandler } from '../../__test__/mock-message-handler';
import { DeviceHardwareOption } from '../cmsis-solution-types';
import { boardHardwareOptionFactory, deviceHardwareOptionFactory } from '../cmsis-solution-types.factories';
import { TargetType } from '../create-solution-dto';
import { IncomingMessage, OutgoingMessage, RequestMessage, RequestMessagePayload } from '../messages';
import { buildNewSolutionMessage, CreateSolutionViewModel } from './create-solution-view-model';
import { CreateSolutionState, initialState } from './state/reducer';

describe('CreateSolutionViewModel', () => {
    let messageListener: jest.Mock;
    let messageHandler: MockMessageHandler<IncomingMessage, OutgoingMessage>;
    let viewModel: CreateSolutionViewModel;

    const getRequests = <T extends RequestMessage['type']>(type: T): Array<Extract<RequestMessage, { type: T }>> =>
        messageListener.mock.calls
            .map(call => call[0] as OutgoingMessage)
            .filter((candidate): candidate is Extract<RequestMessage, { type: T }> => candidate.type === type);

    const getLastRequest = <T extends RequestMessage['type']>(type: T): Extract<RequestMessage, { type: T }> =>
        getRequests(type).at(-1)!;

    const validStateFactory = (device?: DeviceHardwareOption): CreateSolutionState => ({
        ...initialState,
        initGit: false,
        solutionName: { value: 'Solution Name', hadInteraction: true },
        projects: [{ value: { name: 'Project Name', processorName: 'some core', trustzone: 'off' }, hadInteraction: true }],
        solutionLocation: { value: '/solution/location', hadInteraction: true },
        solutionFolder: { value: 'Solution Name', hadInteraction: true },
        targetType: { value: faker.word.noun(), hadInteraction: true },
        deviceSelection: { value: device ?? deviceHardwareOptionFactory(), hadInteraction: true },
        selectedTemplate: {
            value: { type: 'template', value: { name: 'Blank solution', description: '' } },
            hadInteraction: true,
        },
    });

    beforeEach(() => {
        messageListener = jest.fn();
        messageHandler = new MockMessageHandler<IncomingMessage, OutgoingMessage>(messageListener);
        viewModel = new CreateSolutionViewModel(messageHandler);
        viewModel.initialize();
    });

    afterEach(() => viewModel.dispose());

    it('requests initial view data', () => {
        expect(messageListener).toHaveBeenCalledWith(expect.objectContaining({ type: 'GET_PLATFORM' }));
        expect(messageListener).toHaveBeenCalledWith(expect.objectContaining({ type: 'GET_STATE_USE_WEBSERVICES' }));
        expect(messageListener).toHaveBeenCalledWith(expect.objectContaining({ type: 'DATA_GET_TARGETS' }));
        expect(messageListener).toHaveBeenCalledWith(expect.objectContaining({ type: 'DATA_GET_DEFAULT_LOCATION' }));
    });

    it('loads connected hardware after target data arrives', () => {
        const targetsRequest = getLastRequest('DATA_GET_TARGETS');
        messageHandler.postWindowMessage({
            type: 'TARGET_DATA',
            requestId: targetsRequest.requestId,
            data: { boards: [], devices: [] },
            errors: [],
        });

        expect(messageListener).toHaveBeenCalledWith(expect.objectContaining({ type: 'DATA_GET_CONNECTED_DEVICE' }));
    });

    it('loads compatible examples when hardware changes', () => {
        const device = deviceHardwareOptionFactory();
        viewModel.dispatch({ type: 'SET_DEVICE_SELECTION', deviceSelection: device });

        expect(messageListener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'DATA_GET_DATAMANAGER_APPS',
            device: device.key,
        }));
    });

    it('loads draft details when an example is selected', () => {
        viewModel.selectExample('draft-id');

        expect(messageListener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'DATA_GET_DRAFTPROJECT_INFO',
            id: 'draft-id',
        }));
    });

    it('updates existence state for correlated success and failure responses', async () => {
        const success = viewModel.checkSolutionExists('/location', 'Solution', 'folder');
        const successRequest = getLastRequest('CHECK_SOLUTION_DOES_NOT_EXIST');
        messageHandler.postWindowMessage({
            type: 'REQUEST_SUCCESSFUL',
            requestType: successRequest.type,
            requestId: successRequest.requestId,
        });

        await expect(success).resolves.toBe(false);
        expect(viewModel.getSnapshot().state.solutionExists).toEqual({ type: 'loaded', result: false });

        const failure = viewModel.checkSolutionExists('/location', 'Solution', 'folder');
        const failureRequest = getLastRequest('CHECK_SOLUTION_DOES_NOT_EXIST');
        messageHandler.postWindowMessage({
            type: 'REQUEST_FAILED',
            requestType: failureRequest.type,
            requestId: failureRequest.requestId,
            errorMessage: 'already exists',
        });

        await expect(failure).resolves.toBe(true);
        expect(viewModel.getSnapshot().state.solutionExists).toEqual({ type: 'loaded', result: true });
    });

    it('ignores a stale existence response', async () => {
        const first = viewModel.checkSolutionExists('/location', 'First', 'folder');
        const firstRequest = getLastRequest('CHECK_SOLUTION_DOES_NOT_EXIST');
        const second = viewModel.checkSolutionExists('/location', 'Second', 'folder');
        const secondRequest = getLastRequest('CHECK_SOLUTION_DOES_NOT_EXIST');

        messageHandler.postWindowMessage({
            type: 'REQUEST_SUCCESSFUL',
            requestType: secondRequest.type,
            requestId: secondRequest.requestId,
        });
        await second;
        messageHandler.postWindowMessage({
            type: 'REQUEST_FAILED',
            requestType: firstRequest.type,
            requestId: firstRequest.requestId,
            errorMessage: 'already exists',
        });
        await first;

        expect(viewModel.getSnapshot().state.solutionExists).toEqual({ type: 'loaded', result: false });
    });

    it('ignores stale hardware preview data', () => {
        const firstBoard = boardHardwareOptionFactory();
        const secondBoard = boardHardwareOptionFactory();
        viewModel.dispatch({ type: 'SET_BOARD_PREVIEW', boardPreview: firstBoard });
        const firstRequest = getLastRequest('DATA_GET_BOARD_INFO');
        viewModel.dispatch({ type: 'SET_BOARD_PREVIEW', boardPreview: secondBoard });
        const secondRequest = getLastRequest('DATA_GET_BOARD_INFO');

        messageHandler.postWindowMessage({
            type: 'HARDWARE_INFO',
            requestId: secondRequest.requestId,
            data: { image: 'new-image', memoryInfo: {}, debugInterfacesList: [] },
        });
        messageHandler.postWindowMessage({
            type: 'HARDWARE_INFO',
            requestId: firstRequest.requestId,
            data: { image: 'stale-image', memoryInfo: {}, debugInterfacesList: [] },
        });

        expect(viewModel.getSnapshot().state.hardwareInfo?.image).toBe('new-image');
    });

    it('does not submit when validation fails', async () => {
        const creation = viewModel.createSolution();
        const existenceRequest = getLastRequest('CHECK_SOLUTION_DOES_NOT_EXIST');
        messageHandler.postWindowMessage({
            type: 'REQUEST_SUCCESSFUL',
            requestType: existenceRequest.type,
            requestId: existenceRequest.requestId,
        });

        await creation;

        expect(viewModel.getSnapshot().state.createProgress).toBe('idle');
        expect(getRequests('NEW_SOLUTION')).toHaveLength(0);
        expect(messageListener).not.toHaveBeenCalledWith({ type: 'WEBVIEW_CLOSE' });
    });

    it('closes the webview when creation succeeds', async () => {
        viewModel.dispose();
        const inputState = validStateFactory();
        viewModel = new CreateSolutionViewModel(messageHandler, inputState);
        viewModel.initialize();

        const creation = viewModel.createSolution();
        const existenceRequest = getLastRequest('CHECK_SOLUTION_DOES_NOT_EXIST');
        messageHandler.postWindowMessage({
            type: 'REQUEST_SUCCESSFUL',
            requestType: existenceRequest.type,
            requestId: existenceRequest.requestId,
        });
        await waitTimeout();

        expect(messageListener).toHaveBeenCalledWith({
            ...buildNewSolutionMessage(inputState),
            requestId: expect.any(String),
        });
        const creationRequest = getLastRequest('NEW_SOLUTION');
        messageHandler.postWindowMessage({
            type: 'REQUEST_SUCCESSFUL',
            requestType: creationRequest.type,
            requestId: creationRequest.requestId,
        });
        await creation;

        expect(messageListener).toHaveBeenCalledWith({ type: 'WEBVIEW_CLOSE' });
    });

    it('restores idle progress when creation fails', async () => {
        viewModel.dispose();
        viewModel = new CreateSolutionViewModel(messageHandler, validStateFactory());
        viewModel.initialize();

        const creation = viewModel.createSolution();
        const existenceRequest = getLastRequest('CHECK_SOLUTION_DOES_NOT_EXIST');
        messageHandler.postWindowMessage({
            type: 'REQUEST_SUCCESSFUL',
            requestType: existenceRequest.type,
            requestId: existenceRequest.requestId,
        });
        await waitTimeout();
        const creationRequest = getLastRequest('NEW_SOLUTION');
        messageHandler.postWindowMessage({
            type: 'REQUEST_FAILED',
            requestType: creationRequest.type,
            requestId: creationRequest.requestId,
            errorMessage: 'creation failed',
        });
        await creation;

        expect(viewModel.getSnapshot().state.createProgress).toBe('idle');
        expect(messageListener).not.toHaveBeenCalledWith({ type: 'WEBVIEW_CLOSE' });
    });

    describe('buildNewSolutionMessage', () => {
        it('creates a NEW_SOLUTION message for valid device hardware inputs', () => {
            const device = deviceHardwareOptionFactory();
            const inputState = validStateFactory(device);

            expect(buildNewSolutionMessage(inputState)).toEqual({
                type: 'NEW_SOLUTION',
                gitInit: false,
                compiler: '',
                solutionName: 'Solution Name',
                projects: [{ name: 'Project Name', processorName: 'some core', trustzone: 'off' }],
                solutionLocation: '/solution/location',
                solutionFolder: 'Solution Name',
                packs: [
                    { pack: serialisePackId(device.pack!), forContext: [], notForContext: [] },
                    { pack: 'ARM::CMSIS', forContext: [], notForContext: [] },
                ],
                targetTypes: [{ type: inputState.targetType.value, device: device.id.name }],
                selectedDraftId: undefined,
                showOpenDialog: false,
            } satisfies RequestMessagePayload);
        });

        it('creates target and pack data for a selected board', () => {
            const device = deviceHardwareOptionFactory();
            const board = boardHardwareOptionFactory({ mountedDevices: [device] });
            const inputState: CreateSolutionState = {
                ...validStateFactory(),
                boardSelection: { value: board, hadInteraction: true },
                deviceSelection: { value: device, hadInteraction: true },
            };
            const output = buildNewSolutionMessage(inputState);
            const expectedTargetType: TargetType = {
                type: inputState.targetType.value,
                board: serialiseBoardIdWithoutVendor({ ...board.id, revision: board.id.revision ?? '' }),
                device: serialiseDeviceWithoutVendor({ ...device.id, processor: '' }),
            };

            expect(output.targetTypes).toEqual([expectedTargetType]);
            expect(output.packs).toEqual([
                { pack: serialisePackId(board.pack!), forContext: [], notForContext: [] },
                { pack: serialisePackId(device.pack!), forContext: [], notForContext: [] },
                { pack: 'ARM::CMSIS', forContext: [], notForContext: [] },
            ]);
        });

        it('maps compiler display names to backend identifiers', () => {
            expect(buildNewSolutionMessage({ ...validStateFactory(), compiler: 'GCC' }).compiler).toBe('GCC');
            expect(buildNewSolutionMessage({ ...validStateFactory(), compiler: 'LLVM' }).compiler).toBe('CLANG');
            expect(buildNewSolutionMessage({ ...validStateFactory(), compiler: 'Arm Compiler 6' }).compiler).toBe('AC6');
        });
    });
});
