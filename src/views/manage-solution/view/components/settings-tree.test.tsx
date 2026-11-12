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

import '@testing-library/jest-dom';
import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AdapterSnapshot, SettingsField as Field, SettingsSection as Section } from '../../settings-contract';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import type { IncomingMessage, OutgoingMessage } from '../../messages';
import { SettingsTree } from './settings-tree';
import { SettingsField } from './settings-field';
import { SettingsSectionHeader } from './settings-section-header';
import type { SettingsDraft } from '../state/settings-reducer';
import { useAdapterSettings } from '../state/use-adapter-settings';

/** Builds presentation-only sections for isolated rendering scenarios. */
const section = (id: string, overrides: Partial<Section> = {}): Section => ({
    id, label: id, disabled: false, childrenLayout: 'content', fields: [], children: [], addActions: [], ...overrides,
});

/** Renders a settings tree with local navigation and expansion state. */
function renderTree(sections: Section[]) {
    const onAction = jest.fn();
    const onSelect = jest.fn();
    /** Owns only the interaction state needed to exercise the tree callbacks. */
    function Tree() {
        const [activeId, select] = React.useState(sections[0]?.id);
        const [expanded, expand] = React.useState<Record<string, boolean>>({});
        return <SettingsTree sections={sections} activeId={activeId} expanded={expanded} drafts={{}}
            onAction={onAction} onEdit={jest.fn()} onFocus={jest.fn()}
            onSelect={id => { onSelect(id); select(id); }}
            onExpand={id => expand(current => ({ ...current, [id]: !current[id] }))} />;
    }
    const view = render(<Tree />);
    return { ...view, onAction, onSelect };
}

/** Renders a field with an editable draft while recording host actions. */
function renderEditableField(field: Field) {
    const onAction = jest.fn();

    /** Retains draft edits and focus between field interactions. */
    function EditableField() {
        const [draft, setDraft] = React.useState<SettingsDraft>({ value: field.value, dirty: false, focused: false, version: 0 });
        return <SettingsField field={field} draft={draft} onAction={onAction}
            onEdit={(_, value) => setDraft(current => ({ ...current, value, dirty: true }))}
            onFocus={(_, focused) => setDraft(current => ({ ...current, focused }))} />;
    }

    return { ...render(<EditableField />), onAction };
}

describe('isolated settings tree', () => {
    it('uses default closed content containers and separates activation from expansion', () => {
        const { onAction } = renderTree([section('Root', { children: [section('Nested', {
            selected: false, toggleAction: 'toggle', disabled: true,
            fields: [{ id: 'field', label: 'Value', type: 'string', value: 'saved', disabled: true }],
        })] })]);
        expect(screen.getAllByRole('tab')).toHaveLength(1);
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Nested' }));
        expect(onAction).toHaveBeenCalledWith('toggle', true);
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        const expand = screen.getByRole('button', { name: 'Expand Nested' });
        fireEvent.click(expand);
        expect(expand).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('textbox', { name: 'Value' })).toBeDisabled();
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(screen.getAllByText('Root')).toHaveLength(1);
    });

    it.each<Partial<Section>>([{}, { selected: true }, { toggleAction: 'toggle' }])('aligns the content caret left when no checkbox can be rendered (%j)', overrides => {
        renderTree([section('Root', { children: [section('Nested', {
            ...overrides,
            fields: [{ id: 'value', label: 'Value', type: 'string', value: 'saved', disabled: false }],
        })] })]);
        const expand = screen.getByRole('button', { name: 'Expand Nested' });
        const header = expand.closest('.settings-section-header')!;
        expect(header.querySelector('.settings-checkbox-slot')).not.toBeInTheDocument();
        expect(header.firstElementChild?.contains(expand)).toBe(true);
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Root' }).querySelector('.settings-checkbox-slot')).toBeInTheDocument();

        fireEvent.click(expand);
        expect(expand).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('textbox', { name: 'Value' })).toHaveValue('saved');
    });

    it('keeps explicit navigation left and all descendants of content on the right', () => {
        renderTree([section('Root', { childrenLayout: 'navigation', children: [section('Left', {
            children: [section('Right', { childrenLayout: 'navigation', children: [section('Deep', {
                fields: [{ id: 'value', label: 'Deep Value', type: 'number', value: 1, disabled: false }],
            })] })],
        })] })]);
        expect(screen.getAllByRole('tab').map(tab => tab.getAttribute('aria-label'))).toEqual(['Root', 'Left']);
        fireEvent.click(screen.getByRole('tab', { name: 'Left' }));
        fireEvent.click(screen.getByRole('button', { name: 'Expand Right' }));
        fireEvent.click(screen.getByRole('button', { name: 'Expand Deep' }));
        expect(screen.getByRole('spinbutton', { name: 'Deep Value' })).toBeInTheDocument();
    });

    it('supports keyboard navigation without letting header actions select another section', async () => {
        const { onSelect, onAction } = renderTree([
            section('First'), section('Second', { removeAction: 'remove', addActions: [{ label: 'Candidate', action: 'add' }] }),
        ]);
        const first = screen.getByRole('tab', { name: 'First' });
        act(() => first.focus());
        fireEvent.keyDown(first, { key: 'ArrowDown' });
        expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'true');
        expect(onSelect).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole('button', { name: 'Remove Second' }));
        expect(onAction).toHaveBeenCalledWith('remove');
        expect(onSelect).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole('button', { name: 'Add to Second' }));
        fireEvent.click(await screen.findByText('Candidate'));
        expect(onAction).toHaveBeenCalledWith('add');
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('keeps an empty container non-collapsible while retaining its actions and warning', () => {
        renderTree([section('Root', { childCount: 1, children: [section('Empty', {
            selected: true, toggleAction: 'toggle', removeAction: 'remove', warning: 'Check configuration',
            addActions: [{ label: 'Candidate', action: 'add' }],
        })] })]);
        expect(screen.queryByRole('button', { name: 'Expand Empty' })).not.toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Enable Empty' })).toBeChecked();
        expect(screen.getByRole('button', { name: 'Add to Empty' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove Empty' })).toBeInTheDocument();
        expect(screen.getByRole('status', { name: 'Check configuration' })).toBeInTheDocument();
        expect(screen.queryByText('Enabled')).not.toBeInTheDocument();
    });

    it.each([true, false])('retains and disables Add when options are exhausted (navigation: %s)', async navigation => {
        const onAction = jest.fn();
        const trace = section('Trace', { childCount: 0, addActions: [{ label: 'Buffer', action: 'add-buffer' }] });
        const { rerender } = render(<SettingsSectionHeader section={trace} navigation={navigation} onAction={onAction} />);
        const add = screen.getByRole('button', { name: 'Add to Trace' });
        expect(add).toBeEnabled();

        rerender(<SettingsSectionHeader section={{ ...trace, childCount: 1, addActions: [] }} navigation={navigation} onAction={onAction} />);
        expect(screen.getByRole('button', { name: 'Add to Trace' })).toBe(add);
        expect(add).toBeDisabled();
        fireEvent.click(add);
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        expect(onAction).not.toHaveBeenCalled();

        rerender(<SettingsSectionHeader section={trace} navigation={navigation} onAction={onAction} />);
        expect(add).toBeEnabled();
        fireEvent.click(add);
        fireEvent.click(await screen.findByText('Buffer'));
        expect(onAction).toHaveBeenCalledWith('add-buffer');
    });
});

describe('isolated settings fields', () => {
    it.each(['15', '-1', 'invalid', ''])('commits the raw numeric draft %j on the first blur', value => {
        const { onAction } = renderEditableField({
            id: 'number', type: 'number', label: 'Rate', value: 1, min: 0, max: 10, disabled: false, editAction: 'edit',
        });
        const input = screen.getByRole('spinbutton', { name: 'Rate' });
        act(() => input.focus());
        fireEvent.change(input, { target: { value } });
        expect(onAction).not.toHaveBeenCalled();
        fireEvent.blur(input);
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction).toHaveBeenCalledWith('edit', value, 'number');
    });

    it('commits the latest numeric input on Enter after an earlier valid draft', () => {
        const { onAction } = renderEditableField({
            id: 'number', type: 'number', label: 'Rate', value: 1, min: 0, max: 10, disabled: false, editAction: 'edit',
        });
        const input = screen.getByRole('spinbutton', { name: 'Rate' });
        act(() => input.focus());
        fireEvent.change(input, { target: { value: '5' } });
        fireEvent.change(input, { target: { value: '15' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 13 });
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction).toHaveBeenCalledWith('edit', '15', 'number');
    });

    it('retains numeric step controls and commits their value on blur', () => {
        const { onAction } = renderEditableField({
            id: 'number', type: 'number', label: 'Rate', value: 1, min: 0, max: 10, disabled: false, editAction: 'edit',
        });
        const input = screen.getByRole('spinbutton', { name: 'Rate' });
        act(() => input.focus());
        fireEvent.keyDown(input, { key: 'ArrowUp' });
        expect(input).toHaveValue('2');
        expect(onAction).not.toHaveBeenCalled();
        fireEvent.blur(input);
        expect(onAction).toHaveBeenCalledWith('edit', 2, 'number');
    });

    it('commits an edited number on Enter through blur', () => {
        const { onAction } = renderEditableField({
            id: 'number', type: 'number', label: 'Rate', value: 1, disabled: false, editAction: 'edit',
        });
        const input = screen.getByRole('spinbutton', { name: 'Rate' });
        act(() => input.focus());
        fireEvent.change(input, { target: { value: '3.7' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 13 });
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction).toHaveBeenCalledWith('edit', '3.7', 'number');
        expect(input).not.toHaveFocus();
    });

    it('keeps composing text focused until Enter confirms the finished input', () => {
        const { onAction } = renderEditableField({
            id: 'text', type: 'string', label: 'Name', value: 'old', disabled: false, editAction: 'edit',
        });
        const input = screen.getByRole('textbox', { name: 'Name' });
        act(() => input.focus());
        fireEvent.compositionStart(input);
        fireEvent.change(input, { target: { value: 'new' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 229, isComposing: true });
        expect(input).toHaveFocus();
        expect(onAction).not.toHaveBeenCalled();
        fireEvent.compositionEnd(input);
        fireEvent.keyUp(input, { key: 'Enter', code: 'Enter', keyCode: 229 });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 13 });
        expect(onAction).toHaveBeenCalledWith('edit', 'new', 'text');
    });

    it('commits edited numbers on blur without frontend normalization, but does not write on unchanged focus/blur', () => {
        const { onAction } = renderEditableField({
            id: 'number', type: 'number', label: 'Rate', value: 1, disabled: false, editAction: 'edit',
        });
        const input = screen.getByRole('spinbutton', { name: 'Rate' });
        fireEvent.focus(input);
        fireEvent.blur(input);
        expect(onAction).not.toHaveBeenCalled();
        fireEvent.change(input, { target: { value: '3.7' } });
        expect(onAction).not.toHaveBeenCalled();
        fireEvent.blur(input);
        expect(onAction).toHaveBeenCalledWith('edit', '3.7', 'number');
    });

    it('shows enum descriptions below the labels and commits a choice from its description', async () => {
        const onAction = jest.fn();
        render(<SettingsField field={{ id: 'choice', type: 'enum', label: 'Choice', value: 'a', disabled: false,
            editAction: 'edit', choices: [
                { label: 'Alpha', value: 'a', description: 'First mode' },
                { label: 'Beta', value: 'b', description: 'Second mode' },
            ] }}
        onAction={onAction} onEdit={jest.fn()} onFocus={jest.fn()} />);
        fireEvent.click(screen.getByRole('combobox'));
        expect(await screen.findByText('First mode')).toHaveClass('search-list-tag');
        const description = screen.getByText('Second mode');
        expect(description).toHaveClass('search-list-tag');
        expect(description.closest('li')).toHaveTextContent('Beta');
        fireEvent.click(description);
        expect(onAction).toHaveBeenCalledWith('edit', 'b', 'choice');
    });

    it('commits manual file paths immediately and delegates browse and open actions', () => {
        const onAction = jest.fn();
        const onEdit = jest.fn();
        render(<SettingsField field={{ id: 'file', type: 'file', label: 'File', value: 'old', disabled: false,
            editAction: 'edit', browseAction: 'browse', openAction: 'open' }} onAction={onAction} onEdit={onEdit} onFocus={jest.fn()} />);
        fireEvent.change(screen.getByRole('textbox', { name: 'File' }), { target: { value: 'new/path' } });
        expect(onEdit).toHaveBeenCalledWith('file', 'new/path');
        expect(onAction).toHaveBeenCalledWith('edit', 'new/path', 'file');
        fireEvent.click(screen.getByRole('button', { name: 'Browse File' }));
        expect(onAction).toHaveBeenCalledWith('browse', undefined, 'file');
        fireEvent.click(screen.getByRole('button', { name: 'Open File' }));
        expect(onAction).toHaveBeenCalledWith('open');
    });

    it('keeps file actions inside the input border and shows icons and tooltips for both buttons', async () => {
        render(<SettingsField field={{ id: 'file', type: 'file', label: 'File', value: 'image.elf', disabled: false,
            editAction: 'edit', browseAction: 'browse', openAction: 'open' }}
        onAction={jest.fn()} onEdit={jest.fn()} onFocus={jest.fn()} />);
        const input = screen.getByRole('textbox', { name: 'File' });
        const browse = screen.getByRole('button', { name: 'Browse File' });
        const open = screen.getByRole('button', { name: 'Open File' });
        const enclosingInput = input.closest('.ant-input-affix-wrapper');

        expect(enclosingInput).toContainElement(browse);
        expect(enclosingInput).toContainElement(open);
        expect(browse.querySelector('svg')).toBeInTheDocument();
        expect(open.querySelector('svg')).toBeInTheDocument();
        fireEvent.mouseEnter(browse);
        expect(await screen.findByRole('tooltip')).toHaveTextContent('Select File');
        fireEvent.mouseLeave(browse);
        fireEvent.mouseEnter(open);
        await waitFor(() => expect(screen.getByRole('tooltip', { name: 'Open File' })).toBeVisible());
    });

    it('preserves an edited file path when Open is acknowledged before its edit', () => {
        const sent = jest.fn();
        const handler = new MockMessageHandler<IncomingMessage, OutgoingMessage>(sent);
        const fileField: Field = {
            id: 'file', type: 'file', label: 'File', value: 'old.bin', disabled: false,
            editAction: 'edit', browseAction: 'browse', openAction: 'open',
        };
        const snapshot: AdapterSnapshot = {
            contextId: 'context', revision: 1,
            header: {
                enabled: true, adapters: [], selectedAdapter: '', processors: [],
                selectedProcessor: '', showProcessor: false, autoUpdate: false,
            },
            sections: [section('Inputs', { fields: [fileField] })],
        };
        sent.mockImplementation((message: OutgoingMessage) => {
            if (message.type === 'GET_ADAPTER_SETTINGS') {
                handler.postWindowMessage({ type: 'ADAPTER_SETTINGS', snapshot });
            }
        });

        /** Connects the file control to real draft reconciliation and message handling. */
        function FileSettings() {
            const { context, dispatch, act: onAction } = useAdapterSettings(handler);
            const field = context?.snapshot.sections[0].fields[0];
            if (!context || !field) {
                return null;
            }

            return <SettingsField field={field} draft={context.drafts[field.id]} onAction={onAction}
                onEdit={(fieldId, value) => dispatch({ type: 'edit', fieldId, value })}
                onFocus={(fieldId, focused) => dispatch({ type: 'focus', fieldId, focused })} />;
        }

        render(<FileSettings />);
        const input = screen.getByRole('textbox', { name: 'File' });
        fireEvent.change(input, { target: { value: 'new.bin' } });
        fireEvent.click(screen.getByRole('button', { name: 'Open File' }));
        const [editRequest, openRequest] = sent.mock.calls
            .map(([message]) => message as OutgoingMessage)
            .filter((message): message is Extract<OutgoingMessage, { type: 'SETTINGS_ACTION' }> => message.type === 'SETTINGS_ACTION')
            .map(message => message.request);

        act(() => handler.postWindowMessage({ type: 'SETTINGS_ACTION_RESULT', result: {
            requestId: openRequest.requestId, status: 'applied', snapshot: { ...snapshot, revision: 2 },
        } }));
        expect(input).toHaveValue('new.bin');

        act(() => handler.postWindowMessage({ type: 'SETTINGS_ACTION_RESULT', result: {
            requestId: editRequest.requestId, status: 'applied', snapshot: {
                ...snapshot, revision: 3,
                sections: [section('Inputs', { fields: [{ ...fileField, value: 'new.bin' }] })],
            },
        } }));
        expect(input).toHaveValue('new.bin');
    });
});
