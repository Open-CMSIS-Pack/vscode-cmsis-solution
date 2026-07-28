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
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { simulateChangeEvent } from '../../../../__test__/dom-events';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import { boardHardwareOptionFactory, deviceHardwareOptionFactory } from '../../cmsis-solution-types.factories';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { CreationActions } from '../actions';
import { CreateSolution } from './create-solution';
import { act } from 'react';
import { CreateSolutionState } from '../state/reducer';



const targetDataWindowMessage: Extract<IncomingMessage, { type: 'TARGET_DATA' }> = {
    type: 'TARGET_DATA', requestId: 'request-id', data: {
        devices: [
            {
                header: 'Test Header',
                categories: [],
                items: ['A', 'B', 'C'].map(i => ({
                    label: `Item ${i}`,
                    value: deviceHardwareOptionFactory(),
                }))
            }
        ],
        boards: [
            {
                header: 'Test Header',
                categories: [],
                items: ['A', 'B', 'C'].map(i => ({
                    label: `Item ${i}`,
                    value: boardHardwareOptionFactory(),
                }))
            }
        ]
    }, errors: []
};

describe('CreateSolution', () => {
    let container: Element;
    let listener: jest.Mock;
    let messageHandler: MockMessageHandler<IncomingMessage, OutgoingMessage>;
    let creationActions: { [key in keyof CreationActions]: jest.Mock<ReturnType<CreationActions[key]>, Parameters<CreationActions[key]>> };

    const getElements = () => ({
        createBtn: container.querySelector('button[title="Create Solution"]') as HTMLButtonElement,
        cancelBtn: container.querySelector('button[title="Cancel"]') as HTMLButtonElement,
        fInput: container.querySelector('#create-solution-solution-folder') as HTMLInputElement,
        boardDropdown: container.querySelector('#create-solution-board-target') as HTMLElement,
        deviceDropdown: container.querySelector('#create-solution-device-target') as HTMLElement,
        gitCheckbox: container.querySelector('#create-solution-git-init-input') as HTMLInputElement,
        solutionLocationInput: container.querySelector('#create-solution-file-locator') as HTMLInputElement,
        templateDropdown: container.querySelector('#create-solution-template') as HTMLElement,
    });

    const openDropdown = async (dropdownTrigger: HTMLElement) => {
        await act(async () => dropdownTrigger.click());
    };

    const selectFirstTarget = async () => {
        const firstOption = container.querySelector('.components-tree-view-item') as HTMLElement;
        await act(async () => firstOption.click());
    };

    const confirmTargetSelection = async () => {
        const selectButton = container.querySelector('button[title="Select"]:not([disabled])') as HTMLButtonElement;
        await act(async () => selectButton.click());
    };

    const selectFirstTemplate = async () => {
        const firstTemplate = container.querySelector('.template') as HTMLElement;
        await act(async () => firstTemplate.click());
    };

    const fillOutFormFields = async () => {
        const elements = getElements();

        await openDropdown(elements.boardDropdown);
        await selectFirstTarget();
        await confirmTargetSelection();

        await openDropdown(elements.templateDropdown);
        await selectFirstTemplate();

        simulateChangeEvent(elements.fInput, 'test solution');
        simulateChangeEvent(elements.solutionLocationInput, 'test-location');
    };

    const renderCreateSolution = async (): Promise<void> => act(async () => createRoot(container).render(
        <CreateSolution messageHandler={messageHandler} creationActions={creationActions}></CreateSolution>
    ));

    beforeEach(async () => {
        container = document.createElement('div');
        listener = jest.fn();
        messageHandler = new MockMessageHandler(listener);
        creationActions = { createSolution: jest.fn(), checkSolutionExists: jest.fn() };

        listener.mockImplementation(async (message: OutgoingMessage) => {
            if (message.type === 'WEBVIEW_CLOSE') {
                return;
            }
            switch (message.type) {
                case 'DATA_GET_TARGETS':
                    messageHandler.postWindowMessage({ ...targetDataWindowMessage, requestId: message.requestId });
                    break;
                case 'GET_PLATFORM':
                    messageHandler.postWindowMessage({ type: 'PLATFORM', requestId: message.requestId, data: { name: 'vscode' } });
                    break;
                case 'DATA_GET_BOARD_INFO':
                    messageHandler.postWindowMessage({
                        type: 'HARDWARE_INFO',
                        requestId: message.requestId,
                        data: {
                            memoryInfo: {},
                            image: '',
                            debugInterfacesList: [],
                            boardInfo: boardHardwareOptionFactory(),
                        },
                    });
                    break;
            }
            messageHandler.postWindowMessage({ type: 'REQUEST_SUCCESSFUL', requestType: message.type, requestId: message.requestId });
        });
    });

    afterEach(() => {
        container.remove();
    });

    it('requests target hardware data on startup', async () => {
        await renderCreateSolution();

        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'DATA_GET_TARGETS',
            requestId: expect.any(String),
        }));
    });

    it('requests directory path is NOT called on startup', async () => {
        await renderCreateSolution();

        expect(listener).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'OPEN_FILE_PICKER' }));
    });

    it('requests the default location directory on startup', async () => {
        await renderCreateSolution();

        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'DATA_GET_DEFAULT_LOCATION',
            requestId: expect.any(String),
        }));
    });

    it('requests closure of the webview on the cancel button', async () => {
        await renderCreateSolution();
        const expectedMessage: OutgoingMessage = { type: 'WEBVIEW_CLOSE' };
        const cancelBtn = Array.from(container.querySelectorAll('#create-solution-form button'))
            .find(button => button.innerHTML.includes('Cancel')) as HTMLButtonElement;

        await act(async () => cancelBtn!.click());

        expect(listener).toHaveBeenLastCalledWith(expectedMessage);
    });

    it('enables all fields by default', async () => {
        await renderCreateSolution();

        const elements = getElements();
        expect(elements.createBtn.disabled).toBe(true);
        expect(elements.cancelBtn.disabled).toBeFalsy();
        expect(elements.fInput.disabled).toBeFalsy();
        expect(elements.boardDropdown.getAttribute('aria-disabled')).toBe('false');
        expect(elements.deviceDropdown.getAttribute('aria-disabled')).toBe('false');
        expect(elements.gitCheckbox.disabled).toBeFalsy();
    });

    it('checks if the solution exists when the name or location is changed', async () => {
        await renderCreateSolution();

        await fillOutFormFields();
        creationActions.checkSolutionExists.mockClear();

        simulateChangeEvent(getElements().fInput, 'The new value');

        expect(creationActions.checkSolutionExists).toHaveBeenCalledWith(
            messageHandler,
            expect.any(Function),
            'test-location',
            'Blank_solution',
            'The new value',
        );
    });

    describe('when the form is filled in and the create button is clicked', () => {
        beforeEach(async () => {
            creationActions.createSolution.mockImplementation(async (dispatch) => {
                dispatch({ type: 'CREATION_CHECK_START' });
            });
        });

        it('calls the createSolution creation action', async () => {
            await renderCreateSolution();
            await fillOutFormFields();
            await act(async () => getElements().createBtn!.click());

            const expectedSolutionNameState: CreateSolutionState['solutionFolder'] = { hadInteraction: true, value: 'test solution' };
            expect(creationActions.createSolution).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({ solutionFolder: expectedSolutionNameState }),
                messageHandler,
            );
        });

        it('disables interactive elements', async () => {
            await renderCreateSolution();
            await fillOutFormFields();
            await act(async () => getElements().createBtn!.click());

            const elements = getElements();
            expect(elements.createBtn.disabled).toBe(true);
            expect(elements.cancelBtn.disabled).toBe(true);
            expect(elements.fInput.disabled).toBe(true);
            expect(elements.boardDropdown.getAttribute('aria-disabled')).toBe('true');
            expect(elements.deviceDropdown.getAttribute('aria-disabled')).toBe('true');
            expect(elements.gitCheckbox.disabled).toBe(true);
        });
    });

    it('requests the directory path when the browse button is clicked', async () => {
        await renderCreateSolution();
        const browseBtn = container.querySelector('#create-solution-file-locator ~ button') as HTMLButtonElement;

        await act(async () => browseBtn!.click());

        expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({
            type: 'OPEN_FILE_PICKER',
            requestId: expect.any(String),
            solutionLocation: '',
        }));
    });

    it('displays errors for invalid text inputs', async () => {
        await renderCreateSolution();
        const fInput = container.querySelector('#create-solution-solution-folder') as HTMLInputElement;

        simulateChangeEvent(fInput, '!@?..I,.,Am,.Invalid');

        const errorMessageParagraph = fInput as HTMLElement;
        expect(errorMessageParagraph!.classList.contains('input-validation-error'));
        expect(errorMessageParagraph.innerHTML.includes('must only contain letters'));
    });

    it('displays an error if solution at given location already exists', async () => {
        await renderCreateSolution();
        creationActions.checkSolutionExists.mockImplementation(async (_messageHandler, dispatch) => {
            dispatch({ type: 'END_SOLUTION_EXISTS_CHECK', result: true });
            return true;
        });

        simulateChangeEvent(getElements().fInput, 'some solution');
        simulateChangeEvent(getElements().solutionLocationInput, 'existing/path');

        const errorMessageElement = getElements().solutionLocationInput.nextSibling as HTMLElement;

        expect(errorMessageElement).not.toBeNull();
        expect(errorMessageElement!.classList.contains('input-validation-error'));
        expect(errorMessageElement.innerHTML.includes('already exists at this location'));
    });

    it('auto selects a board if it is connected', async () => {
        const connectedBoard = targetDataWindowMessage.data.boards[0].items[1].value;
        listener.mockImplementation(async (message: OutgoingMessage) => {
            if (message.type === 'WEBVIEW_CLOSE') {
                return;
            }
            switch (message.type) {
                case 'DATA_GET_TARGETS':
                    messageHandler.postWindowMessage({ ...targetDataWindowMessage, requestId: message.requestId });
                    break;
                case 'DATA_GET_CONNECTED_DEVICE':
                    messageHandler.postWindowMessage({ type: 'CONNECTED_BOARD', requestId: message.requestId, data: { name: connectedBoard.id.name } });
                    break;
            }
        });

        await renderCreateSolution();

        const boardSelection = getElements().boardDropdown.querySelector('.dropdown-select-input-text');
        expect(boardSelection?.innerHTML).toBe(`${connectedBoard.id.name} (${connectedBoard.id.revision})`);
    });

});
