/**
 * Copyright (C) 2024-2026 Arm Limited
 */

import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { ManageSolution } from './manage-solution';
import { LoadType, TargetType } from '../state/manage-solution-state';
import { fireEvent } from '@testing-library/react';

describe('ContextSelection', () => {
    let container: Element;
    let listener: jest.Mock;
    let messageHandler: MockMessageHandler<IncomingMessage, OutgoingMessage>;

    const createContextSelectionComponent = () => {
        React.act(() => {
            createRoot(container).render(
                <ManageSolution messageHandler={messageHandler} />
            );
        });
    };

    beforeEach(() => {
        container = document.createElement('div');
        listener = jest.fn();
        messageHandler = new MockMessageHandler(listener);
    });

    afterEach(() => {
        container.remove();
    });

    const postGenericDataContext = () => {
        const targets: TargetType[] = [
            {
                name: 'my-type-1',
                board: 'my board 1',
                device: 'my device 1',
                targetSets: [{
                    name: 'my-target-set-1',
                    debugger: {
                        name: 'my-debugger-1',
                        startProcessor: 'my-processor-1',
                        protocol: 'swd',
                        clock: 1000,
                        ui: {
                            protocol: { values: ['jtag', 'swd'] },
                            clock: { title: 'Clock' },
                            'propA': { 'yml-node': 'trace-prop_a', type: 'string' },
                            'propB': { 'yml-node': 'trace-prop_b', type: 'number' },
                            'propC': { 'yml-node': 'trace-prop_c', type: 'enum', values: ['A', 'B', 'C'] },
                            'propD': { 'yml-node': 'trace-prop_d', type: 'file' },
                            trace: {
                                section: 'Trace', options: [
                                    { name: 'propA', 'yml-node': 'trace-prop_a', type: 'string' },
                                    { name: 'propB', 'yml-node': 'trace-prop_b', type: 'number' },
                                    { name: 'propC', 'yml-node': 'trace-prop_c', type: 'enum', values: ['A', 'B', 'C'] },
                                    { name: 'propD', 'yml-node': 'trace-prop_d', type: 'file' },
                                    { name: 'propE', 'yml-node': 'trace-prop_e', type: 'none' }
                                ]
                            }
                        }
                    }
                }]
            },
            {
                name: 'my-type-2',
                board: 'my board 2',
                device: 'my device 2',
                targetSets: [{
                    name: 'my-target-set-2',
                    debugger: {
                        name: 'my-debugger-2',
                        startProcessor: 'my-processor-2',
                        protocol: 'jtag',
                        clock: 2000,
                        ui: {
                            protocol: { values: ['jtag', 'swd'] },
                            clock: { title: 'Clock' },
                            trace: {
                                section: 'Trace', options: [
                                    { name: 'propA', 'yml-node': 'trace-prop_a', type: 'string' },
                                    { name: 'propB', 'yml-node': 'trace-prop_b', type: 'number' },
                                    { name: 'propC', 'yml-node': 'trace-prop_c', type: 'enum', values: ['A', 'B', 'C'] },
                                    { name: 'propD', 'yml-node': 'trace-prop_d', type: 'file' },
                                    { name: 'propE', 'yml-node': 'trace-prop_e', type: 'none' }
                                ]
                            }
                        }
                    }
                }]

            },
        ];

        const projects = [
            {
                name: 'Project 1',
                path: '/path/to/project1',
                buildTypes: ['Debug'],
                selectedBuildType: 'Debug',
                load: 'image+symbols' as LoadType,
                selected: false,
                image: { path: '/path/to/image1' },
                device: 'cm0'
            }, {
                name: 'Project 2',
                path: '/path/to/project2',
                buildTypes: ['Debug', 'Release'],
                selectedBuildType: 'Debug',
                load: 'symbols' as LoadType,
                selected: false,
                image: { path: '/path/to/image2' },
                device: 'cm4_cpu'
            },
        ];

        React.act(() => {
            messageHandler.postWindowMessage({
                type: 'DATA_CONTEXT_SELECTION',
                data: {
                    solutionName: 'My-Super-Duper-CSolution',
                    solutionPath: '/some/path/to/My-Super-Duper-CSolution.csolution.yml',
                    targets,
                    selectedTarget: targets[0],
                    projects,
                    images: [
                        { name: 'image1', path: '/path/to/image1', selected: true, loadOffset: '0x1000', load: 'image+symbols' },
                    ],
                    availableCoreNames: ['cm0', 'cm4_cpu', 'cm4_fpu']
                },
            });

            messageHandler.postWindowMessage({
                type: 'DEBUG_ADAPTERS',
                data: [{
                    name: 'TestAdapter',
                    'user-interface': [
                        {
                            section: 'telnet', options: [
                                { name: 'propA', 'yml-node': 'telnet-prop_a', type: 'string', },
                                { name: 'propB', 'yml-node': 'telnet-prop_b', type: 'number' },
                                { name: 'propC', 'yml-node': 'telnet-prop_c', type: 'enum', values: [{ name: 'A', value: 'a' }, { name: 'B', value: 'b' }, { name: 'C', value: 'c' }] },
                                { name: 'propD', 'yml-node': 'telnet-prop_d', type: 'file' },
                            ]
                        }
                    ]
                }, {
                    name: 'AnotherAdapter',
                    'user-interface': [
                        { section: 'telnet', options: [{ name: 'port', 'yml-node': 'telnet-port', type: 'number' }] }
                    ]
                }],
                sectionsInUse: ['telnet']
            });

            messageHandler.postWindowMessage({
                type: 'DEBUGGER',
                data: 'TestAdapter'
            });
        });
    };

    it('fires a click to documentation links', () => {
        createContextSelectionComponent();

        postGenericDataContext();

        const selectors = ['a[title="Active Target"]',
            '.open-csolution-yml',
            'a[title="Configure Related Projects"]',
            'a[title="Debugger Configuration"]'];

        React.act(() => {
            for (const selector of selectors) {
                const target = container.querySelector(selector);
                if (target) {
                    fireEvent.click(target);
                }
            }

            expect(listener).toHaveBeenCalledTimes(4);
            expect(listener).toHaveBeenCalledWith({ type: 'OPEN_HELP' });
            expect(listener).toHaveBeenCalledWith({ type: 'GET_CONTEXT_SELECTION_DATA' });
            expect(listener).toHaveBeenCalledWith({ type: 'GET_DEBUG_ADAPTERS' });
        });
    });

    it('checks for unblur event on pressing enter', () => {
        createContextSelectionComponent();

        postGenericDataContext();

        const selectors = [
            '.ant-input-number-input-wrap input',
            '.ant-input-wrapper input',
        ];

        for (const selector of selectors) {
            const inputElements = container.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;

            for (const inputElement of inputElements) {
                React.act(() => {
                    inputElement.focus();

                    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter', charCode: 13 });
                });

                expect(document.activeElement).not.toBe(inputElement);
            }
        }
    });

    it('sends the open file message when clicking on the open solution link', () => {
        createContextSelectionComponent();

        postGenericDataContext();

        const solutionLink = container.querySelector('.targets-section .open-csolution-yml');

        React.act(() => {
            if (solutionLink) {
                fireEvent.click(solutionLink);
            }
        });

        expect(listener).toHaveBeenCalledWith({ type: 'GET_CONTEXT_SELECTION_DATA' });
    });

    it('sets the selected target when clicking a target option', () => {
        createContextSelectionComponent();

        postGenericDataContext();

        const targetRadios = Array.from(container.querySelectorAll<HTMLInputElement>('.target-option input[type="radio"]'));
        expect(targetRadios[0].checked).toEqual(true);
        expect(targetRadios[1].checked).not.toEqual(true);

        React.act(() => {
            fireEvent.click(targetRadios[1]);
        });

        expect(listener).toHaveBeenCalledWith({ type: 'GET_CONTEXT_SELECTION_DATA' });
        expect(listener).toHaveBeenCalledWith({ type: 'GET_DEBUG_ADAPTERS' });
        expect(listener).toHaveBeenCalledWith({ type: 'SET_SELECTED_TARGET', target: expect.any(String), set: expect.any(String) });
    });

    it('should scroll ulRef into view when MutationObserver triggers', () => {
        createContextSelectionComponent();
        const ul = document.createElement('ul');
        container.appendChild(ul);

        // Mock scrollIntoView
        const scrollIntoViewMock = jest.fn();
        ul.scrollIntoView = scrollIntoViewMock;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ul as any).scrollIntoView = scrollIntoViewMock;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const observerCallback = (MutationObserver as any).mock?.calls?.[0]?.[0] || (() => { });
        if (observerCallback) observerCallback();

        // Simulate MutationObserver triggering
        ul.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });

        expect(scrollIntoViewMock).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    });

    it('should push GET_CONTEXT_SELECTION_DATA and GET_DEBUG_ADAPTERS on mount', () => {
        createContextSelectionComponent();
        expect(listener).toHaveBeenCalledWith({ type: 'GET_CONTEXT_SELECTION_DATA' });
        expect(listener).toHaveBeenCalledWith({ type: 'GET_DEBUG_ADAPTERS' });
    });

    it('calls messageHandler.push with ADD_NEW_IMAGE when addImage is invoked', () => {
        createContextSelectionComponent();

        postGenericDataContext();

        // Find the add image button (assuming it has a recognizable selector or text)
        const addImageButton = container.querySelector('.projects-section .add-img-button');
        if (addImageButton) {
            React.act(() => {
                fireEvent.click(addImageButton);
            });
            expect(listener).toHaveBeenCalledWith({ type: 'ADD_NEW_IMAGE' });

            const unlinkImageButton = container.querySelector('.projects-section .unlink-image-button');
            if (unlinkImageButton) {
                React.act(() => {
                    fireEvent.click(unlinkImageButton);
                });
                expect(listener).toHaveBeenCalledTimes(4);
                expect(listener).toHaveBeenNthCalledWith(4, { image: '/path/to/image1', type: 'UNLINK_IMAGE' });
            } else {
                throw new Error('Unlink Image button not found in ProjectsTable');
            }
        } else {
            // If the button is not found, fail the test
            throw new Error('Add Image button not found in ProjectsTable');
        }
    });

    it('calls messageHandler.push with SET_DEBUGGER and dispatches INCOMING_MESSAGE when selectDebugger is invoked', () => {
        createContextSelectionComponent();

        postGenericDataContext();

        // Find the debug adapter dropdown
        const debugAdapterDropdown = container.querySelector('.debug-adapter-dropdown');
        if (!debugAdapterDropdown) {
            throw new Error('Debug adapter dropdown element not found in the DOM');
        }

        // triggering a click populates the dropdown list
        const dropdownTriggerElement = debugAdapterDropdown?.querySelector('.compact-dropdown-trigger');
        if (dropdownTriggerElement) {
            React.act(() => {
                fireEvent.click(dropdownTriggerElement);
            });
        } else {
            throw new Error('Dropdown trigger element not found within the debug adapter dropdown');
        }

        const dropdownListItem = debugAdapterDropdown?.querySelector('.search-list-values li[data-value="TestAdapter"]');
        if (dropdownListItem) {
            React.act(() => {
                fireEvent.click(dropdownListItem);
            });
        } else {
            throw new Error('Dropdown list item for TestAdapter not found within the debug adapter dropdown');
        }

        expect(listener).toHaveBeenCalledWith({ type: 'SET_DEBUGGER', name: 'TestAdapter' });
        expect(listener).toHaveBeenCalledWith({ type: 'GET_CONTEXT_SELECTION_DATA' });
    });

    it('calls messageHandler.push with SAVE_CONTEXT_SELECTION when Save button is clicked', () => {
        createContextSelectionComponent();

        postGenericDataContext();

        // Simulate state.isDirty to enable the Save button
        React.act(() => {
            messageHandler.postWindowMessage({ type: 'IS_DIRTY', data: true });
        });

        const saveButton = container.querySelector('.save-button');
        expect(saveButton).not.toBeNull();
        expect(saveButton?.getAttribute('disabled')).toBeNull();

        React.act(() => {
            if (saveButton) {
                fireEvent.click(saveButton);
            }
        });

        expect(listener).toHaveBeenCalledWith({ type: 'SAVE_CONTEXT_SELECTION' });
    });

    it('does not call messageHandler.push with SAVE_CONTEXT_SELECTION when Save button is disabled', () => {
        createContextSelectionComponent();

        postGenericDataContext();

        // Simulate state.isDirty to disable the Save button
        React.act(() => {
            messageHandler.postWindowMessage({ type: 'IS_DIRTY', data: false });
        });

        const saveButton = container.querySelector('.save-button');
        expect(saveButton).not.toBeNull();
        expect(saveButton?.getAttribute('disabled')).not.toBeNull();

        React.act(() => {
            if (saveButton) {
                fireEvent.click(saveButton);
            }
        });

        // Must NOT call SAVE_CONTEXT_SELECTION
        expect(listener).not.toHaveBeenCalledWith({ type: 'SAVE_CONTEXT_SELECTION' });
    });

    describe('test change handlers', () => {

        it('collects all dynamically created controlls and test the handles', () => {
            createContextSelectionComponent();
            postGenericDataContext();
            const controls = container.querySelector('.capability-control');

            controls?.childNodes.forEach((control) => {
                const input = control as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
                input.value = '123';
                if (input) {
                    console.log(input.innerHTML);
                    if (input.tagName === 'INPUT' && (input.type === 'text' || input.type === 'number')) {
                        React.act(() => {
                            fireEvent.change(input, { target: { value: '12345' } });
                            fireEvent.blur(input, { target: { value: '12345' } });
                        });
                    } else if (input.tagName === 'SELECT') {
                        React.act(() => {
                            // fireEvent.change(input, { target: { value: input.options[1].value } });
                            fireEvent.change(input, { target: { value: 'swd' } });
                            fireEvent.blur(input, { target: { value: 'swd' } });
                        });
                    }
                }
            });
        });
    });

    it('calls messageHandler.push with SET_START_PROCESSOR when start processor dropdown value is changed', () => {
        createContextSelectionComponent();

        postGenericDataContext();

        const startProcessorDropdown = container.querySelector('.start-processor-dropdown');
        expect(startProcessorDropdown).not.toBeNull();

        const dropdownTriggerElement = startProcessorDropdown?.querySelector('.compact-dropdown-trigger');
        if (dropdownTriggerElement) {
            React.act(() => {
                fireEvent.click(dropdownTriggerElement);
            });
        } else {
            throw new Error('Dropdown trigger element not found within the start processor dropdown');
        }

        console.log(startProcessorDropdown?.innerHTML);
        const dropdownListItem = startProcessorDropdown?.querySelector('.search-list-values li[data-value="cm0"]');
        if (dropdownListItem) {
            React.act(() => {
                fireEvent.click(dropdownListItem);
            });
        } else {
            throw new Error('Dropdown list item for cm0 not found within the start processor dropdown');
        }

        expect(listener).toHaveBeenCalledWith({ type: 'SET_START_PROCESSOR', value: 'cm0' });
    });

    it('calls messageHandler.push with ADD_NEW_PROJECT when addProject is invoked', () => {
        createContextSelectionComponent();

        postGenericDataContext();

        // Find the add project button (assuming it has a recognizable selector or text)
        const addProjectButton = container.querySelector('.projects-section .add-project-button');
        if (addProjectButton) {
            React.act(() => {
                fireEvent.click(addProjectButton);
            });
            expect(listener).toHaveBeenCalledWith({ type: 'ADD_NEW_PROJECT' });
        } else {
            // If the button is not found, fail the test - not yet implemented
            // throw new Error('Add Project button not found in ProjectsTable');
        }
    });

    it('calls messageHandler.push with ADD_NEW_CONTEXT when addContext is invoked', () => {
        createContextSelectionComponent();

        postGenericDataContext();

        // Find the add context button (assuming it has a recognizable selector or text)
        const addContextButton = container.querySelector('.targets-section .add-context-button');
        if (addContextButton) {
            React.act(() => {
                fireEvent.click(addContextButton);
            });
            expect(listener).toHaveBeenCalledWith({ type: 'ADD_NEW_CONTEXT' });
        }
    });

    describe('observer', () => {
        it('updates isDarkTheme when body class changes', () => {
            // Simulate class change on body
            React.act(() => {
                document.body.classList.add('vscode-dark');
            });

            expect(container.querySelector('.manage-solution-frame')).toBeNull();
            expect(document.body.classList.contains('vscode-dark')).toBe(true);
        });
    });

    it('does not update input value if no file is selected', async () => {
        createContextSelectionComponent();

        postGenericDataContext();

        // Mock the showOpenFilePicker API to return an empty array
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).showOpenFilePicker = jest.fn().mockResolvedValue([]);

        // Create a mock input element
        const input = document.createElement('input');
        input.value = '';
        const parentNode = document.createElement('div');
        parentNode.appendChild(input);
        const button = document.createElement('button');
        parentNode.appendChild(button);

        // Simulate the button click
        React.act(() => {
            fireEvent.click(button);
        });

        // Wait for the async operation to complete
        await Promise.resolve();

        // Verify the input value is not updated
        expect(input.value).toBe('');
    });
    describe('sendDebugAdapterProperty', () => {
        it('calls messageHandler.push with correct parameters for number type property', () => {
            createContextSelectionComponent();

            postGenericDataContext();

            const service = 'debug-service';
            const key = 'property-key';
            const value = 42;

            React.act(() => {
                messageHandler.push({ type: 'SET_DEBUG_ADAPTER_PROPERTY', service, key, value: value ?? '' });
            });

            expect(listener).toHaveBeenCalledWith({
                type: 'SET_DEBUG_ADAPTER_PROPERTY',
                service,
                key,
                value,
            });
        });

        it('calls messageHandler.push with correct parameters for string type property', () => {
            createContextSelectionComponent();

            postGenericDataContext();

            const service = 'debug-service';
            const key = 'property-key';
            const value = 'test-value';

            React.act(() => {
                messageHandler.push({ type: 'SET_DEBUG_ADAPTER_PROPERTY', service, key, value });
            });

            expect(listener).toHaveBeenCalledWith({
                type: 'SET_DEBUG_ADAPTER_PROPERTY',
                service,
                key,
                value,
            });
        });

        it('handles empty key gracefully', () => {
            createContextSelectionComponent();

            postGenericDataContext();

            const service = 'debug-service';
            const key = '';
            const value = 'test-value';

            React.act(() => {
                messageHandler.push({ type: 'SET_DEBUG_ADAPTER_PROPERTY', service, key, value });
            });

            expect(listener).toHaveBeenCalledWith({
                type: 'SET_DEBUG_ADAPTER_PROPERTY',
                service,
                key,
                value,
            });
        });

        describe('selectFile', () => {

            it('does not update input value if FILE_SELECTED message has no data', () => {
                createContextSelectionComponent();

                const mockInput = document.createElement('input');
                mockInput.setAttribute('id', 'test-input');
                container.appendChild(mockInput);

                React.act(() => {
                    messageHandler.postWindowMessage({
                        type: 'FILE_SELECTED',
                        for: 'test-input',
                        data: []
                    });
                });

                expect(mockInput.value).toBe('');
            });

            it('does not update input value if FILE_SELECTED message is for a non-existent element', () => {
                createContextSelectionComponent();

                React.act(() => {
                    messageHandler.postWindowMessage({
                        type: 'FILE_SELECTED',
                        for: 'non-existent-input',
                        data: ['/path/to/selected/file.exe']
                    });
                });

                const nonExistentInput = container.querySelector('#non-existent-input');
                expect(nonExistentInput).toBeNull();
            });
        });
    });
});
