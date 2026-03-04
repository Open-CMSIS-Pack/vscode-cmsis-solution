/**
 * Copyright 2026 Arm Limited
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

import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { ConfWiz } from './confwiz-webview-view-component';
import {
    ConfigWizardData,
    GuiTypes,
    TreeNodeElement,
    markDocumentDirty,
    saveElement,
    setPanelActiveType,
    setWizardDataType
} from './confwiz-webview-common';

const sendNotificationMock = jest.fn();
const notificationHandlers = new Map<string, (data: unknown) => void>();

const getNotificationKey = (type: unknown): string => {
    if (typeof type === 'string') {
        return type;
    }

    if (type && typeof type === 'object' && 'method' in type) {
        return String((type as { method: string }).method);
    }

    return String(type);
};

// Mock acquireVsCodeApi
global.acquireVsCodeApi = jest.fn(() => ({
    postMessage: jest.fn(),
    setState: jest.fn(),
    getState: jest.fn(),
}));

jest.mock('vscode-messenger-webview', () => ({
    Messenger: jest.fn().mockImplementation(() => ({
        start: jest.fn(),
        onNotification: (type: unknown, handler: (data: unknown) => void) => {
            notificationHandlers.set(getNotificationKey(type), handler);
        },
        sendNotification: sendNotificationMock,
    }))
}));

jest.mock('@vscode/webview-ui-toolkit/react', () => ({
    VSCodeTextField: ({ children: _children, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input role="textbox" {...props} />
    ),
    VSCodeCheckbox: ({ onChange, onClick, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input type="checkbox" onChange={onChange ?? (() => undefined)} onClick={onClick} {...props} />
    ),
    VSCodeDropdown: (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} />,
    VSCodeOption: (props: React.OptionHTMLAttributes<HTMLOptionElement>) => <option {...props} />,
}));

jest.mock('primereact/treetable', () => ({
    TreeTable: ({ value, header, children }: { value: unknown[]; header: React.ReactNode; children: React.ReactNode }) => {
        const columns = React.Children.toArray(children) as React.ReactElement[];
        return (
            <div>
                {header}
                {value?.map((node: unknown, index: number) => (
                    <div key={index} data-testid={`row-${index}`}>
                        {columns.map((col, colIndex) => (
                            <div key={colIndex}>{col.props.body(node, {})}</div>
                        ))}
                    </div>
                ))}
            </div>
        );
    },
}));

jest.mock('primereact/column', () => ({
    Column: ({ body }: { body: (data: unknown, options: unknown) => React.ReactNode }) => {
        return <div data-testid="column" data-body={body} />;
    }
}));

jest.mock('./../filterTree', () => ({
    filterTree: (nodes: unknown) => nodes,
}));

const emitWizardData = (data: ConfigWizardData) => {
    const handler = notificationHandlers.get(getNotificationKey(setWizardDataType));
    if (!handler) {
        throw new Error('setWizardDataType handler not registered');
    }
    act(() => {
        handler(data);
    });
};

const emitPanelActive = (active: boolean) => {
    const handler = notificationHandlers.get(getNotificationKey(setPanelActiveType));
    if (!handler) {
        throw new Error('setPanelActiveType handler not registered');
    }
    act(() => {
        handler({ active });
    });
};

const makeRoot = (children: TreeNodeElement[]): TreeNodeElement => ({
    guiId: 0,
    name: 'Root',
    type: GuiTypes.group,
    group: true,
    value: { value: 'Root', readOnly: true },
    newValue: { value: 'Root', readOnly: true },
    children,
});

describe('ConfWiz functional component', () => {
    beforeEach(() => {
        sendNotificationMock.mockClear();
        notificationHandlers.clear();
    });

    it('marks dirty on first edit and saves on blur', () => {
        const editElement: TreeNodeElement = {
            guiId: 1,
            name: 'Edit Field',
            type: GuiTypes.edit,
            group: false,
            value: { value: '', readOnly: false },
            newValue: { value: '', readOnly: false },
        };

        const { getAllByRole } = render(<ConfWiz />);
        emitWizardData({ element: makeRoot([editElement]), documentPath: 'test.c', noAnnotationsFound: false });

        const inputs = getAllByRole('textbox') as HTMLInputElement[];
        const input = inputs.find(item => item.getAttribute('placeholder') !== 'Search annotations') as HTMLInputElement;
        fireEvent.input(input, { target: { value: 'a' } });

        const dirtyCalls = sendNotificationMock.mock.calls.filter(call => call[0] === markDocumentDirty);
        expect(dirtyCalls).toHaveLength(1);
        expect(dirtyCalls[0][2]).toEqual({ documentPath: 'test.c' });

        fireEvent.blur(input);

        const saveCalls = sendNotificationMock.mock.calls.filter(call => call[0] === saveElement);
        expect(saveCalls.length).toBe(1);
    });

    it('applies checkbox-inconsistent class and tooltip when inconsistent flag is true', () => {
        const checkboxElement: TreeNodeElement = {
            guiId: 2,
            name: 'Check Field',
            type: GuiTypes.check,
            group: false,
            value: { value: '1', checked: true, readOnly: false, inconsistent: true },
            newValue: { value: '1', readOnly: false },
            infoItems: ['Original tooltip info'],
        };

        render(<ConfWiz />);
        emitWizardData({ element: makeRoot([checkboxElement]), documentPath: 'test.c', noAnnotationsFound: false });

        const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(checkbox.className).toContain('checkbox-inconsistent');
        expect(checkbox.getAttribute('title')).toContain('Inconsistent comment state detected');
        expect(checkbox.getAttribute('title')).toContain('Original tooltip info');
    });

    it('toggles checkbox on Space key press', () => {
        const checkboxElement: TreeNodeElement = {
            guiId: 3,
            name: 'Check Field',
            type: GuiTypes.check,
            group: false,
            value: { value: '0', checked: false, readOnly: false },
            newValue: { value: '0', readOnly: false },
        };

        render(<ConfWiz />);
        emitWizardData({ element: makeRoot([checkboxElement]), documentPath: 'test.c', noAnnotationsFound: false });

        const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
        fireEvent.keyDown(checkbox, { key: ' ' });

        expect(checkboxElement.value.checked).toBe(true);
        expect(checkboxElement.newValue.value).toBe('1');
        const saveCalls = sendNotificationMock.mock.calls.filter(call => call[0] === saveElement);
        expect(saveCalls.length).toBe(1);
    });

    it('moves focus to clicked row after panel is deactivated and reactivated', () => {
        const firstElement: TreeNodeElement = {
            guiId: 11,
            name: 'First Node',
            type: GuiTypes.edit,
            group: false,
            value: { value: 'a', readOnly: false },
            newValue: { value: 'a', readOnly: false },
        };
        const secondElement: TreeNodeElement = {
            guiId: 12,
            name: 'Second Node',
            type: GuiTypes.edit,
            group: false,
            value: { value: 'b', readOnly: false },
            newValue: { value: 'b', readOnly: false },
        };

        const { getByText } = render(<ConfWiz />);
        emitWizardData({ element: makeRoot([firstElement, secondElement]), documentPath: 'test.c', noAnnotationsFound: false });

        const firstRow = getByText('First Node') as HTMLSpanElement;
        const secondRow = getByText('Second Node') as HTMLSpanElement;

        fireEvent.focus(secondRow);
        expect(secondRow.tabIndex).toBe(0);
        expect(firstRow.tabIndex).toBe(-1);

        emitPanelActive(false);
        emitPanelActive(true);

        fireEvent.mouseDown(firstRow, { button: 0 });
        expect(firstRow.tabIndex).toBe(0);
        expect(secondRow.tabIndex).toBe(-1);
        expect(document.activeElement).toBe(firstRow);
    });
});

describe('ConfWiz dropdown overflow tooltips', () => {
    class TestableDropdownConfWiz extends ConfWiz {
        public getCreateCombobox(element: TreeNodeElement, shouldDisable: boolean = false) {
            return this.createCombobox(element, shouldDisable);
        }
    }

    it('should show overflow tooltip and invalid class when overflow is flagged', () => {
        const element: TreeNodeElement = {
            guiId: 200,
            name: 'ISR FIFO Queue',
            type: GuiTypes.dropdown,
            group: false,
            value: {
                value: '256 entries',
                readOnly: false,
                overflow: true,
                overflowValue: 256,
                extractedValue: 256,
                bitWidth: 8,
            },
            newValue: { value: '256 entries', readOnly: false },
            dropItems: ['4 entries', '256 entries']
        };

        const confWiz = new TestableDropdownConfWiz({});
        const { getByRole } = render(confWiz.getCreateCombobox(element));
        const dropdown = getByRole('combobox') as HTMLSelectElement;

        expect(dropdown.title).toBe("Value '256' overflows 8 bits");
        expect(dropdown.className).toContain('dropdown-invalid');
    });

    it('should show not-in-list tooltip when value is missing and no overflow', () => {
        const element: TreeNodeElement = {
            guiId: 201,
            name: 'ISR FIFO Queue',
            type: GuiTypes.dropdown,
            group: false,
            value: {
                value: '0',
                readOnly: false,
                extractedValue: 0,
                bitWidth: 8,
            },
            newValue: { value: '0', readOnly: false },
            dropItems: ['4 entries', '8 entries']
        };

        const confWiz = new TestableDropdownConfWiz({});
        const { getByRole } = render(confWiz.getCreateCombobox(element));
        const dropdown = getByRole('combobox') as HTMLSelectElement;

        expect(dropdown.title).toBe("Value '0' is not in the list");
        expect(dropdown.className).toContain('dropdown-invalid');
    });
});
