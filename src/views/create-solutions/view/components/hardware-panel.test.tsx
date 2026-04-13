/**
 * Copyright 2023-2026 Arm Limited
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

import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { HardwarePanel } from './hardware-panel';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { HardwareSelection } from '../state/hardware-selection';
import { boardHardwareOptionFactory, deviceHardwareOptionFactory } from '../../cmsis-solution-types.factories';
import { HardwareInfo, labelForHardwareOption } from '../../cmsis-solution-types';
import { faker } from '@faker-js/faker';
import { serialisePackId } from '../../../../packs/pack-id';

describe('Hardware Panel', () => {
    let container: Element;
    let listener: jest.Mock;
    let messageHandler: MockMessageHandler<IncomingMessage, OutgoingMessage>;
    let dispatch: jest.Mock;
    let onClick: jest.Mock;

    const mountedDevice = deviceHardwareOptionFactory();
    const boardHardwareOption = boardHardwareOptionFactory({ mountedDevices: [mountedDevice] });
    const boardSelection: HardwareSelection = { type: 'Boards', value: boardHardwareOption };

    const hardwareInfo: HardwareInfo = {
        image: faker.internet.url(),
        memoryInfo: { 'IROM1': { size: 32768, count: 2 } },
        debugInterfacesList: [{ adapter: 'JTAG', connector: '20 pin JTAG' } , { adapter: 'JTAG', connector: '30000 pin Micro USB' }],
    };

    beforeEach(() => {
        container = document.createElement('div');
        listener = jest.fn();
        messageHandler = new MockMessageHandler(listener);
        dispatch = jest.fn();
        onClick = jest.fn();

        listener.mockImplementation(async (message: OutgoingMessage) => {
            switch (message.type) {
                case 'DATA_GET_BOARD_INFO':
                    messageHandler.postWindowMessage({ type: 'HARDWARE_INFO', data: hardwareInfo });
                    break;
                case 'DATA_GET_DEVICE_INFO':
                    messageHandler.postWindowMessage({ type: 'HARDWARE_INFO', data: hardwareInfo });
                    break;
            }
            messageHandler.postWindowMessage({ type: 'REQUEST_SUCCESSFUL', requestType: message.type });
        });
    });

    afterEach(() => {
        container.remove();
    });

    it('render hardware info panel for the selected Board/Device', () => {
        React.act(() => {
            createRoot(container).render(<HardwarePanel hardwareSelection={boardSelection} hardwareInfo={hardwareInfo} onClick={onClick} messageHandler={messageHandler} previewHardware={boardSelection} dispatch={dispatch}/>);
        });
        const HardwareInfoTitlesEntry = container.querySelector('.details-header-item');
        expect(HardwareInfoTitlesEntry!.querySelector('#board-device')?.innerHTML).toBe(labelForHardwareOption(boardHardwareOption));
        expect(HardwareInfoTitlesEntry!.querySelector('#vendor')!.innerHTML).toBe(boardHardwareOption.id.vendor);
        const HardwareInfoDataEntry = container.querySelectorAll('.details-grid');
        expect(HardwareInfoDataEntry[0].querySelector('.cores')!.textContent).toBe(mountedDevice.processors[0].core);
        expect(HardwareInfoDataEntry[0].querySelector('.debug-int')!.textContent).toBe(hardwareInfo.debugInterfacesList[0].adapter);
        expect(HardwareInfoDataEntry[0].querySelector('.mounted-dev')!.textContent).toBe(mountedDevice.id.name);
        expect(HardwareInfoDataEntry[0].querySelector('.pack-id')!.textContent).toBe(serialisePackId(boardSelection.value.pack!));
        expect(HardwareInfoDataEntry[0].querySelector('.ram')!.textContent).toContain('2 x 32 KiB IROM1');
        const HardwareInfoDataTitlesEntry = container.querySelectorAll('.title');
        expect(HardwareInfoDataTitlesEntry).toHaveLength(5);
    });

    it('requests board/device hardwareInfo data on startup', () => {
        React.act(() => {
            createRoot(container).render(<HardwarePanel hardwareSelection={boardSelection} hardwareInfo={hardwareInfo} onClick={onClick} messageHandler={messageHandler} previewHardware={boardSelection} dispatch={dispatch}/>);
        });
        const expectedMessage: OutgoingMessage = { type: 'DATA_GET_BOARD_INFO', boardId: { ...boardHardwareOption.id, key: boardHardwareOption.key } };
        expect(listener).toHaveBeenCalledWith(expectedMessage);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('dispatches a SET_BOARD_SELECTION action when the select button is clicked and a board is selected', () => {
        React.act(() => {
            createRoot(container).render(<HardwarePanel hardwareSelection={boardSelection} hardwareInfo={hardwareInfo} onClick={onClick} messageHandler={messageHandler} previewHardware={boardSelection} dispatch={dispatch}/>);
        });
        const selectBtn = container.querySelector('.select-button vscode-button') as HTMLButtonElement;

        React.act(() => {
            Simulate.click(selectBtn);
        });
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: 'SET_BOARD_SELECTION', boardSelection: boardSelection.value });
    });

    it('dispatches a SET_DEVICE_SELECTION action when the select button is clicked and a device is selected', () => {
        const deviceHardwareOption = deviceHardwareOptionFactory();
        const deviceSelection: HardwareSelection = { type: 'Devices', value: deviceHardwareOption };
        React.act(() => {
            createRoot(container).render(<HardwarePanel hardwareSelection={deviceSelection} hardwareInfo={hardwareInfo} onClick={onClick} messageHandler={messageHandler} previewHardware={deviceSelection} dispatch={dispatch}/>);
        });
        const selectBtn = container.querySelector('.select-button vscode-button') as HTMLButtonElement;

        React.act(() => {
            Simulate.click(selectBtn);
        });
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: 'SET_DEVICE_SELECTION', deviceSelection: deviceSelection.value });
    });
});
