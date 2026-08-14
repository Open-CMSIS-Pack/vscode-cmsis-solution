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

import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { ConfWiz } from './confwiz-webview-view-component';
import {
    ConfigWizardData,
    GuiTypes,
    TreeNodeElement,
    markDocumentDirty,
    openIssueLocationType,
    saveElement,
    selectAnnotationType,
    setPanelActiveType,
    setWizardDataType
} from './confwiz-webview-common';

const sendNotificationMock = jest.fn();
const notificationHandlers = new Map<string, (data: unknown) => void>();
const mockVsCodeApi = {
    postMessage: jest.fn(),
    setState: jest.fn(),
    getState: jest.fn(),
};
const acquireVsCodeApiMock = jest.fn(() => mockVsCodeApi);

const getNotificationKey = (type: unknown): string => {
    if (typeof type === 'string') {
        return type;
    }

    if (type && typeof type === 'object' && 'method' in type) {
        return String((type as { method: string }).method);
    }

    return String(type);
};

jest.mock('vscode-messenger-webview', () => ({
    Messenger: jest.fn().mockImplementation(() => ({
        start: jest.fn(),
        onNotification: (type: unknown, handler: (data: unknown) => void) => {
            notificationHandlers.set(getNotificationKey(type), handler);
        },
        sendNotification: sendNotificationMock,
    }))
}));

jest.mock('primereact/treetable', () => ({
    TreeTable: ({ value, header, children, onRowClick }: { value: unknown[]; header: React.ReactNode; children: React.ReactNode; onRowClick?: (event: { originalEvent: React.SyntheticEvent; node: unknown }) => void }) => {
        const columns = React.Children.toArray(children) as React.ReactElement[];
        return (
            <>
                {header}
                {value?.map((node: unknown, index: number) => (
                    <div key={index} data-testid={`row-${index}`} onClick={(event) => onRowClick?.({ originalEvent: event, node })}>
                        {columns.map((col, colIndex) => (
                            <div key={colIndex}>{col.props.body(node, {})}</div>
                        ))}
                    </div>
                ))}
            </>
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

const makeRoot = (children: TreeNodeElement[], issues?: string[]): TreeNodeElement => ({
    guiId: 0,
    name: 'Root',
    type: GuiTypes.group,
    group: true,
    value: { value: 'Root', readOnly: true },
    newValue: { value: 'Root', readOnly: true },
    children,
    errors: issues,
});

describe('ConfWiz functional component', () => {
    beforeEach(() => {
        (globalThis as { acquireVsCodeApi?: () => unknown }).acquireVsCodeApi = acquireVsCodeApiMock;
        acquireVsCodeApiMock.mockClear();
        sendNotificationMock.mockClear();
        mockVsCodeApi.postMessage.mockClear();
        mockVsCodeApi.setState.mockClear();
        mockVsCodeApi.getState.mockClear();
        notificationHandlers.clear();
    });

    afterEach(() => {
        delete (globalThis as { acquireVsCodeApi?: () => unknown }).acquireVsCodeApi;
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

    it('uses only info annotations for the option tooltip', () => {
        const settingName = 'DBGMCU APB2 peripheral freeze register CPU2 (DBGMCU_APB2FZ2)';
        const textElement: TreeNodeElement = {
            guiId: 2,
            name: settingName,
            type: GuiTypes.none,
            group: false,
            value: { value: '', readOnly: true },
            newValue: { value: '', readOnly: true },
            infoItems: ['Register configuration details', 'Default: enabled'],
        };

        const { getByText } = render(<ConfWiz />);
        emitWizardData({ element: makeRoot([textElement]), documentPath: 'test.c', noAnnotationsFound: false });

        const settingNameElement = getByText(settingName);
        expect(settingNameElement.textContent).toBe(settingName);
        expect(settingNameElement.getAttribute('title')).toBe('Register configuration details\nDefault: enabled');
    });

    it('keeps a full static value in the DOM but not in the value tooltip', () => {
        const longValue = 'A static configuration value that does not fit in a narrow value column';
        const textElement: TreeNodeElement = {
            guiId: 3,
            name: 'Static value',
            type: GuiTypes.none,
            group: false,
            value: { value: longValue, readOnly: true },
            newValue: { value: longValue, readOnly: true },
            infoItems: ['Value details'],
        };

        const { getByText } = render(<ConfWiz />);
        emitWizardData({ element: makeRoot([textElement]), documentPath: 'test.c', noAnnotationsFound: false });

        const valueElement = getByText(longValue);
        expect(valueElement.classList.contains('cw-value-text')).toBe(true);
        expect(valueElement.getAttribute('title')).toBe('Value details');
    });

    it('keeps checkbox info and inconsistency diagnostics in separate tooltips', () => {
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

        const checkbox = document.querySelector('input[type="checkbox"]')?.parentElement as HTMLInputElement;
        expect(checkbox.parentElement?.className).toContain('checkbox-inconsistent');
        expect(checkbox.getAttribute('title')).toBe('Original tooltip info');

        const warning = document.querySelector('.checkbox-inconsistent-warning');
        expect(warning?.getAttribute('title')).toContain('Inconsistent comment state detected');
        expect(warning?.getAttribute('title')).not.toContain('Original tooltip info');
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

    it('shows and hides line-numbered annotation issues from the tree header', () => {
        const issues = [
            'Line: 208: Unknown command "<9>" found.',
            'Line: 211: Unknown command "<10>" found.',
            'Line: 214: Unknown command "<8>" found.',
            'Line: 1285: Unknown command "<0>" found.',
        ];

        const { getByRole, getByText, queryByRole } = render(<ConfWiz />);
        emitWizardData({
            element: makeRoot([], issues),
            documentPath: 'board_defs.h',
            noAnnotationsFound: false
        });

        const showButton = getByRole('button', { name: '4 annotation issues Show' });
        expect(showButton.getAttribute('aria-expanded')).toBe('false');
        expect(queryByRole('region', { name: 'Annotation issues' })).toBeNull();

        fireEvent.click(showButton);

        expect(getByRole('button', { name: '4 annotation issues Hide' }).getAttribute('aria-expanded')).toBe('true');
        expect(getByRole('region', { name: 'Annotation issues' })).not.toBeNull();
        expect(getByText(issues[0])).not.toBeNull();
        expect(getByText(issues[3])).not.toBeNull();

        fireEvent.click(getByRole('button', { name: '4 annotation issues Hide' }));

        expect(queryByRole('region', { name: 'Annotation issues' })).toBeNull();
    });

    it('does not show an annotation issue control when parsing has no issues', () => {
        const { queryByText } = render(<ConfWiz />);
        emitWizardData({ element: makeRoot([]), documentPath: 'valid.h', noAnnotationsFound: false });

        expect(queryByText(/annotation issues?/)).toBeNull();
    });

    it('opens line-numbered issues while leaving unlocated issues as plain text', () => {
        const locatedIssue = 'Line: 12: Unknown command "<x>" found.';
        const unlocatedIssue = 'Configuration section marker is missing.';
        const { getByRole, queryByRole } = render(<ConfWiz />);
        emitWizardData({
            element: makeRoot([], [locatedIssue, unlocatedIssue]),
            documentPath: 'config.h',
            noAnnotationsFound: false
        });
        fireEvent.click(getByRole('button', { name: '2 annotation issues Show' }));
        sendNotificationMock.mockClear();

        fireEvent.click(getByRole('button', { name: locatedIssue }));

        expect(sendNotificationMock).toHaveBeenCalledWith(openIssueLocationType, expect.anything(), {
            documentPath: 'config.h',
            line: 11
        });
        expect(queryByRole('button', { name: unlocatedIssue })).toBeNull();
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

    it('reports the annotation range when a GUI row is selected', () => {
        const notificationElement: TreeNodeElement = {
            guiId: 21,
            name: 'Memory configuration',
            type: GuiTypes.none,
            group: false,
            value: { value: '', readOnly: true },
            newValue: { value: '', readOnly: true },
            annotationRange: {
                start: { line: 7, character: 4 },
                end: { line: 7, character: 38 }
            }
        };

        const { getByText } = render(<ConfWiz />);
        emitWizardData({ element: makeRoot([notificationElement]), documentPath: 'config.h', noAnnotationsFound: false });
        sendNotificationMock.mockClear();

        fireEvent.click(getByText('Memory configuration'));

        expect(sendNotificationMock).toHaveBeenCalledWith(selectAnnotationType, expect.anything(), {
            documentPath: 'config.h',
            annotationRange: notificationElement.annotationRange
        });
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
            dropItems: ['4 entries', '256 entries'],
            infoItems: ['Choose the queue size']
        };

        const confWiz = new TestableDropdownConfWiz({});
        const { getByRole } = render(confWiz.getCreateCombobox(element));
        const dropdown = getByRole('combobox') as HTMLSelectElement;

        expect(dropdown.title).toBe('Choose the queue size');
        expect(document.querySelector('.compact-dropdown-warn')?.getAttribute('title')).toBe("Value '256' overflows 8 bits");
        expect(dropdown.className).toContain('compact-dropdown-trigger');
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
            dropItems: ['4 entries', '8 entries'],
            infoItems: ['Choose the queue size']
        };

        const confWiz = new TestableDropdownConfWiz({});
        const { getByRole } = render(confWiz.getCreateCombobox(element));
        const dropdown = getByRole('combobox') as HTMLSelectElement;

        expect(dropdown.title).toBe('Choose the queue size');
        expect(document.querySelector('.compact-dropdown-warn')?.getAttribute('title')).toBe("Value '0' is not in the list");
        expect(dropdown.className).toContain('compact-dropdown-trigger');
    });
});
