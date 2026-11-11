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

import * as React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { UISection } from '../../../../debug/debug-adapters-yaml-file';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { DebugAdapterSectionLabel } from './debug-adapter-subsections';

/** Supplies a selectable subsection with one editable field. */
const serialWire: UISection = {
    id: 'serialwire',
    section: 'Serial Wire',
    select: true,
    removable: true,
    options: [{ name: 'Clock', 'yml-node': 'input-clock', type: 'number' }],
};

/** Renders the real section controls inside a clickable navigation entry. */
function renderLabel(section: UISection, path = ['serialwire'], disabled = false) {
    const listener = jest.fn();
    const onToggle = jest.fn();
    const onNavigate = jest.fn();
    const messageHandler = new MockMessageHandler<IncomingMessage, OutgoingMessage>(listener);
    /** Keeps the surrounding navigation handler stable across backend descriptor updates. */
    const label = (updated: UISection) => (
        <div onClick={onNavigate}>
            <DebugAdapterSectionLabel
                section={updated}
                rootSection='trace'
                path={path}
                disabled={disabled}
                onToggle={onToggle}
                messageHandler={messageHandler}
            />
        </div>
    );

    const view = render(label(section));

    /** Applies a descriptor update to the existing section controls. */
    const updateSection = (updated: UISection) => view.rerender(label(updated));

    return { listener, onToggle, onNavigate, controls: within(view.container), updateSection };
}

describe('debug adapter subsection controls', () => {
    it.each([true, false])('retains the warning tooltip when the source is selected: %s', async selected => {
        const warning = 'SWO requires SWD protocol';
        const { listener, controls, onNavigate } = renderLabel({ ...serialWire, select: selected, warning });
        const checkbox = controls.getByRole('checkbox', { name: 'Serial Wire' }) as HTMLInputElement;
        expect(checkbox.checked).toBe(selected);
        expect(checkbox.indeterminate).toBe(false);
        expect(checkbox.getAttribute('aria-checked')).toBeNull();
        expect(checkbox.disabled).toBe(false);
        expect(checkbox.getAttribute('aria-invalid')).toBe(selected ? 'true' : null);
        expect(controls.queryByRole('img', { name: warning }) !== null).toBe(selected);

        fireEvent.mouseEnter(checkbox);
        expect((await screen.findByRole('tooltip')).textContent).toBe(warning);
        fireEvent.mouseLeave(checkbox.closest('label')!.parentElement!);
        await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
        fireEvent.click(checkbox);
        expect(listener).toHaveBeenCalledWith({
            type: 'SET_DEBUG_ADAPTER_SUBSECTION_ENABLED', section: 'trace', subsection: ['serialwire'], enabled: !selected,
        });
        expect(onNavigate).not.toHaveBeenCalled();
    });

    it('renders an ordinary selectable source without warning state', () => {
        const { controls } = renderLabel(serialWire);
        const checkbox = controls.getByRole('checkbox', { name: 'Serial Wire' }) as HTMLInputElement;
        expect(checkbox.disabled).toBe(false);
        expect(checkbox.indeterminate).toBe(false);
        expect(checkbox.getAttribute('aria-invalid')).toBeNull();
        expect(controls.queryByRole('img', { name: 'SWO requires SWD protocol' })).toBeNull();
    });

    it('toggles a root section through its callback', () => {
        const { controls, onToggle, listener } = renderLabel({ ...serialWire, section: 'Trace' }, []);
        fireEvent.click(controls.getByRole('checkbox', { name: 'Enable Trace' }));
        expect(onToggle).toHaveBeenCalledTimes(1);
        expect(listener).not.toHaveBeenCalled();
        expect(controls.queryByRole('button', { name: 'Remove Trace' })).toBeNull();
    });

    it('omits controls for fixed sections', () => {
        const { controls } = renderLabel({ ...serialWire, select: undefined, removable: false });
        expect(controls.queryByRole('checkbox')).toBeNull();
        expect(controls.queryByRole('button', { name: 'Remove Serial Wire' })).toBeNull();
        expect(controls.queryByRole('button', { name: 'Add subsection' })).toBeNull();
    });

    it('disables a subsection switch when its ancestor is disabled', () => {
        const { controls, listener } = renderLabel(serialWire, ['serialwire'], true);
        const checkbox = controls.getByRole('checkbox', { name: 'Serial Wire' }) as HTMLInputElement;
        expect(checkbox.disabled).toBe(true);
        fireEvent.click(checkbox);
        expect(listener).not.toHaveBeenCalled();
    });

    it('removes a nested source independently of the add menu without navigating', () => {
        const { controls, listener, onNavigate } = renderLabel(serialWire, ['serialwire', 'settings', 'channel']);
        fireEvent.click(controls.getByRole('button', { name: 'Remove Serial Wire' }));
        expect(listener).toHaveBeenCalledWith({
            type: 'REMOVE_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['serialwire', 'settings', 'channel'],
        });
        expect(onNavigate).not.toHaveBeenCalled();
    });

    it('offers only supplied choices and sends the complete nested path without navigating', async () => {
        const { controls, listener, onNavigate } = renderLabel({
            section: 'Settings', options: [], addOptions: [{ id: 'channel', name: 'Channel' }],
        }, ['serialwire', 'settings']);
        fireEvent.click(controls.getByRole('button', { name: 'Add subsection' }));
        const menu = within(await screen.findByRole('menu'));
        expect(menu.queryByRole('menuitem', { name: 'Serial Wire' })).toBeNull();
        fireEvent.click(menu.getByRole('menuitem', { name: 'Channel' }));
        expect(listener).toHaveBeenCalledWith({
            type: 'ADD_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['serialwire', 'settings', 'channel'],
        });
        expect(onNavigate).not.toHaveBeenCalled();
    });

    it('refreshes available choices after a backend descriptor update', async () => {
        const { controls, updateSection } = renderLabel({
            ...serialWire, addOptions: [{ id: 'tracebuffer', name: 'Trace Buffer' }],
        });
        updateSection({ ...serialWire, addOptions: [{ id: 'serialwire', name: 'Serial Wire' }] });
        fireEvent.click(controls.getByRole('button', { name: 'Add subsection' }));
        const menu = within(await screen.findByRole('menu'));
        expect(menu.getByRole('menuitem', { name: 'Serial Wire' })).toBeDefined();
        expect(menu.queryByRole('menuitem', { name: 'Trace Buffer' })).toBeNull();
    });

    it('disables the add menu when all source types are configured', () => {
        const { controls } = renderLabel({ ...serialWire, addOptions: [] });
        const add = controls.getByRole('button', { name: 'Add subsection' }) as HTMLButtonElement;
        expect(add.disabled).toBe(true);
    });
});
