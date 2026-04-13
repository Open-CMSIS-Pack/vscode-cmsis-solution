/**
 * Copyright (C) 2022-2026 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { simulateChangeEvent } from '../../../../__test__/dom-events';
import { refAppFactory } from '../../../../core-tools/core-tools-service.factories';
import { cSolutionExampleFactory } from '../../../../solar-search/solar-search-client.factories';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import { boardHardwareOptionFactory, deviceHardwareOptionFactory } from '../../cmsis-solution-types.factories';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { CreationActions } from '../actions';
import { CreateSolution } from './create-solution';
import { act } from 'react';



const targetDataWindowMessage: IncomingMessage = {
    type: 'TARGET_DATA', data: {
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

    const selectFirstExample = async () => {
        const firstTemplate = container.querySelector('.example') as HTMLElement;
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
            switch (message.type) {
                case 'DATA_GET_TARGETS':
                    messageHandler.postWindowMessage(targetDataWindowMessage);
                    break;
                case 'GET_PLATFORM':
                    messageHandler.postWindowMessage({ type: 'PLATFORM', data: { name: 'vscode' } });
                    break;
                case 'DATA_GET_BOARD_INFO':
                    messageHandler.postWindowMessage({
                        type: 'HARDWARE_INFO',
                        data: {
                            memoryInfo: {},
                            image: '',
                            debugInterfacesList: [],
                            boardInfo: boardHardwareOptionFactory(),
                        },
                    });
                    break;
            }
            messageHandler.postWindowMessage({ type: 'REQUEST_SUCCESSFUL', requestType: message.type });
        });
    });

    afterEach(() => {
        container.remove();
    });

    it('requests target hardware data on startup', async () => {
        await renderCreateSolution();

        const expectedMessage: OutgoingMessage = { type: 'DATA_GET_TARGETS' };
        expect(listener).toHaveBeenCalledWith(expectedMessage);
    });

    it('requests directory path is NOT called on startup', async () => {
        await renderCreateSolution();

        const expectedMessage: OutgoingMessage = { type: 'OPEN_FILE_PICKER' };
        expect(listener).not.toHaveBeenCalledWith(expectedMessage);
    });

    it('requests the default location directory on startup', async () => {
        await renderCreateSolution();

        const expectedMessage: OutgoingMessage = { type: 'DATA_GET_DEFAULT_LOCATION' };
        expect(listener).toHaveBeenCalledWith(expectedMessage);
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

    it('hides the toolchain input on selection of an example', async () => {
        await renderCreateSolution();
        const example = cSolutionExampleFactory();
        messageHandler.postWindowMessage({
            type: 'BOARD_EXAMPLE_DATA',
            data: [example],
        });

        await openDropdown(getElements().templateDropdown);
        await selectFirstExample();
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

        const expectedMessage: OutgoingMessage = { type: 'OPEN_FILE_PICKER', solutionLocation: '' };
        expect(listener).toHaveBeenLastCalledWith(expectedMessage);
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
            switch (message.type) {
                case 'DATA_GET_TARGETS':
                    messageHandler.postWindowMessage(targetDataWindowMessage);
                    break;
                case 'DATA_GET_CONNECTED_DEVICE':
                    messageHandler.postWindowMessage({ type: 'CONNECTED_BOARD', data: { name: connectedBoard.id.name } });
                    break;
            }
        });

        await renderCreateSolution();

        const boardSelection = getElements().boardDropdown.querySelector('.dropdown-select-input-text');
        expect(boardSelection?.innerHTML).toBe(`${connectedBoard.id.name} (${connectedBoard.id.revision})`);
    });

    it('lists examples when example data is available is selected', async () => {
        await renderCreateSolution();
        const example = cSolutionExampleFactory();

        messageHandler.postWindowMessage({
            type: 'BOARD_EXAMPLE_DATA',
            data: [example],
        });

        const templateDropdown = getElements().templateDropdown;
        await openDropdown(templateDropdown);

        const exampleEl = container.querySelector('.example');
        expect(exampleEl!.innerHTML).toContain(example.name);
    });

    it('lists reference apps', async () => {
        await renderCreateSolution();
        const refApps = [refAppFactory(), refAppFactory(), refAppFactory()];

        messageHandler.postWindowMessage({
            type: 'REF_APP_DATA',
            data: refApps,
        });

        const templateDropdown = getElements().templateDropdown;
        await openDropdown(templateDropdown);

        const exampleEl = container.querySelector('.refapp');
        expect(exampleEl!.innerHTML).toContain(refApps[0].name);
    });

});
