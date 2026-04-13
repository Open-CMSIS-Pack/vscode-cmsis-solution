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

import { TextField } from '@vscode/webview-ui-toolkit';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import { AsyncStatus, asyncLoaded } from '../../../async-status';
import { TreeViewCategory } from '../../../common/components/tree-view';
import { BoardHardwareOption, DeviceHardwareOption } from '../../cmsis-solution-types';
import { boardHardwareOptionFactory, deviceHardwareOptionFactory } from '../../cmsis-solution-types.factories';
import { HardwareLists, IncomingMessage, OutgoingMessage } from '../../messages';
import { hadInteraction } from '../state/field-and-interaction';
import { CreateSolutionState, initialState } from '../state/reducer';
import { ValidationErrors } from '../state/validation';
import { HardwareRow } from './hardware-row';

describe('HardwareRow', () => {
    let container: Element;
    let listener: jest.Mock;
    let messageHandler: MockMessageHandler<IncomingMessage, OutgoingMessage>;
    let dispatch: jest.Mock;
    let validationErrors: Pick<ValidationErrors, 'targetType' | 'deviceSelection'>;
    let state: CreateSolutionState;

    const getElements = () => ({
        boardDropdown: container.querySelector('#create-solution-board-target') as HTMLElement,
        deviceDropdown: container.querySelector('#create-solution-device-target') as HTMLElement,
        targetType: container.querySelector('#create-solution-target-type') as TextField,
        hardwareRowHeaders: container.querySelector('#create-solution-hardware') as HTMLElement

    });

    const makeTargetCategories = <A,>(param: A) => {
        return   {
            header: 'Test Header',
            categories: [],
            items: ['A', 'B', 'C'].map(i => ({
                label: `Item ${i}`,
                value: param,
            }))
        };

    };

    const boards: TreeViewCategory<BoardHardwareOption>[] = ([makeTargetCategories(boardHardwareOptionFactory()), makeTargetCategories(boardHardwareOptionFactory())]);
    const devices: TreeViewCategory<DeviceHardwareOption>[] = ([makeTargetCategories(deviceHardwareOptionFactory())]);
    const hardwareLists: AsyncStatus<HardwareLists> = asyncLoaded({ boards, devices });

    beforeEach(async() => {
        container = document.createElement('div');
        jest.clearAllMocks();
        listener = jest.fn();
        messageHandler = new MockMessageHandler(listener);
        dispatch = jest.fn();
        state = { ...initialState, hardwareLists };
        validationErrors = { targetType: '', deviceSelection: '' };
    });

    afterEach(() => {
        container.remove();
    });

    it('renders the hardware row validations', async () => {
        validationErrors = { targetType: 'boom', deviceSelection: '' };
        await React.act(async () => createRoot(container).render(
            <HardwareRow
                state={{ ...state, targetType: hadInteraction(''), deviceSelection: hadInteraction(undefined) }}
                disabled={true}
                targetTypeFieldEnabled={true}
                validationErrors={validationErrors}
                webServicesEnabled={state.webServicesEnabled}
                messageHandler={messageHandler}
                dispatch={dispatch}/>
        ));

        const input = container.querySelector('#create-solution-target-type') as HTMLElement;
        expect(input.classList.contains('input-validation-error'));
    });

    it('disables fields when disabled is set to true', async () => {
        await React.act(async () => createRoot(container).render(
            <HardwareRow
                state={state}
                disabled={true}
                targetTypeFieldEnabled={true}
                validationErrors={validationErrors}
                webServicesEnabled={state.webServicesEnabled}
                messageHandler={messageHandler}
                dispatch={dispatch}/>
        ));

        const elements = getElements();

        expect(elements.boardDropdown.getAttribute('aria-disabled')).toBe('true');
        expect(elements.deviceDropdown.getAttribute('aria-disabled')).toBe('true');
        expect(elements.targetType.disabled).toBe(true);
    });

    it('renders the hardware row', async () => {
        await React.act(async () => createRoot(container).render(
            <HardwareRow
                state={state}
                disabled={false}
                targetTypeFieldEnabled={true}
                validationErrors={validationErrors}
                webServicesEnabled={state.webServicesEnabled}
                messageHandler={messageHandler}
                dispatch={dispatch}/>
        ));

        const elements = getElements();

        expect(elements.hardwareRowHeaders!.innerHTML.includes('Target Board')).toBeTruthy();
        expect(elements.hardwareRowHeaders!.innerHTML.includes('Target Device')).toBeTruthy();
        expect(elements.hardwareRowHeaders!.innerHTML.includes('Target Type')).toBeTruthy();
    });

    it('clears board selection when clear button is clicked', async () => {
        const boardHardwareOption = boardHardwareOptionFactory();
        await React.act(async () => createRoot(container).render(
            <HardwareRow
                state={{ ...state, targetType: hadInteraction(''), boardSelection: { value: boardHardwareOption, hadInteraction: true } }}
                disabled={false}
                targetTypeFieldEnabled={true}
                validationErrors={validationErrors}
                webServicesEnabled={state.webServicesEnabled}
                messageHandler={messageHandler}
                dispatch={dispatch}/>
        ));
        const clearButton = container.querySelector('[title="clear-selection"]') as HTMLButtonElement;

        React.act(() => {
            Simulate.click(clearButton);
        });

        expect(dispatch).toHaveBeenCalledWith({ type: 'CLEAR_BOARD_SELECTION', boardSelection: undefined });
    });

    it('button is not present when the board has not been selected', async () => {
        await React.act(async () => createRoot(container).render(
            <HardwareRow
                state={{ ...state, targetType: hadInteraction(''), boardSelection: { value: undefined, hadInteraction: false } }}
                disabled={false}
                targetTypeFieldEnabled={true}
                validationErrors={validationErrors}
                webServicesEnabled={state.webServicesEnabled}
                messageHandler={messageHandler}
                dispatch={dispatch}/>
        ));

        const clearButton = container.querySelector('[title="clear-selection"]');
        expect(clearButton).toBeNull();
    });
});
