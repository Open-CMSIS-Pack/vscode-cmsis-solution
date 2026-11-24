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
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { CTreeItemYamlFile } from '@open-cmsis-pack/cmsis-common/tree-item-file';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { UISection } from '../../../../debug/debug-adapters-yaml-file';
import { DebugAdapterSections } from '../../../../debug/debug-adapter-sections';
import { createTraceSectionDefinition } from '../../../../debug/debug-adapter-trace';
import { DebuggerWrap } from '../../../../solutions/files/csolution-wrap';
import { TestDataHandler } from '../../../../__test__/test-data';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { initialState } from '../state/reducer';
import { GenericPropertyList } from '../state/manage-solution-state';
import { ManageSolution } from './manage-solution';

/** Represents the two initial trace sources supplied by the backend. */
const configuredTrace: UISection = {
    section: 'Trace (2)',
    'yml-node': 'trace',
    options: [],
    addOptions: [],
    subsections: [
        {
            id: 'serialwire', 'yml-node': 'swo-uart', section: 'Serial Wire', select: true, removable: true,
            options: [{ name: 'Input Clock (kHz)', type: 'number', 'yml-node': 'input-clock', scale: 1000, default: 0, range: [0, Number.MAX_SAFE_INTEGER / 1000] }],
        },
        { id: 'tracebuffer', 'yml-node': 'trace-buffer', section: 'Trace Buffer', select: true, removable: true, options: [] },
    ],
};

/** Defines a four-level tree with the same leaf identity in two independent branches. */
const nestedTrace: UISection = {
    ...configuredTrace,
    subsections: ['serialwire', 'tracebuffer'].map((id, index) => ({
        id,
        'yml-node': index === 0 ? 'swo-uart' : 'trace-buffer',
        section: index === 0 ? 'Serial Wire' : 'Trace Buffer',
        select: true,
        options: [],
        subsections: [{
            id: 'settings', 'yml-node': 'settings', section: index === 0 ? 'Settings A' : 'Settings B', options: [],
            subsections: [{
                id: 'channel', 'yml-node': 'channel', section: 'Channel', select: true, removable: true,
                options: [{ name: 'Input Clock (Hz)', type: 'number', 'yml-node': 'input-clock' }],
            }],
        }],
    })),
};

/** Keeps distinct saved values in the two branches to expose path mix-ups. */
const nestedProperties: GenericPropertyList = {
    trace: [
        { 'trace-buffer': null, settings: { channel: { 'input-clock': 84000000 } } },
        { 'swo-uart': null, settings: { channel: { 'input-clock': 42000000 } } },
    ],
};

/** Renders the complete dialog and publishes representative saved trace data and descriptors. */
function renderTrace(section: UISection, debuggerProperties: GenericPropertyList = {
    trace: [{ 'trace-buffer': null }, { 'swo-uart': null, 'input-clock': 48000000 }],
}) {
    const listener = jest.fn();
    const messageHandler = new MockMessageHandler<IncomingMessage, OutgoingMessage>(listener);

    /** Publishes a backend descriptor update, including a present but possibly disabled trace node. */
    const updateSection = (updated: UISection): void => {
        act(() => messageHandler.postWindowMessage({
            type: 'DEBUG_ADAPTERS',
            data: [{ name: 'Test Adapter', 'user-interface': [updated] }],
            sectionsInUse: ['trace'],
        }));
    };

    const view = render(<ManageSolution messageHandler={messageHandler} />);
    const target = {
        name: 'Test Target', selectedSet: '',
        targetSets: [{ name: '', debugger: { name: 'Test Adapter', ...debuggerProperties } }],
    };

    /** Publishes saved settings after an edit so the reducer can acknowledge the displayed value. */
    const updateDebuggerProperties = (properties: GenericPropertyList): void => {
        const updatedTarget = { ...target, targetSets: [{ name: '', debugger: { name: 'Test Adapter', ...properties } }] };
        act(() => messageHandler.postWindowMessage({
            type: 'DATA_CONTEXT_SELECTION',
            data: { ...initialState.solutionData, targets: [updatedTarget], selectedTarget: updatedTarget },
        }));
    };
    act(() => {
        messageHandler.postWindowMessage({
            type: 'DATA_CONTEXT_SELECTION',
            data: { ...initialState.solutionData, targets: [target], selectedTarget: target },
        });
        messageHandler.postWindowMessage({ type: 'DEBUGGER', data: 'Test Adapter' });
        messageHandler.postWindowMessage({ type: 'IS_BUSY', data: false });
        updateSection(section);
    });
    listener.mockClear();

    /** Limits field queries to the currently visible settings panel. */
    const getPanel = () => {
        const panel = view.container.querySelector<HTMLElement>('[role="tabpanel"][aria-hidden="false"]');
        if (!panel) {
            throw new Error('No active debug adapter settings panel');
        }
        return within(panel);
    };

    return { listener, updateSection, updateDebuggerProperties, navigation: within(view.getByRole('tablist', { hidden: true })), getPanel };
}

/** Finds the named section label without recalculating CSS for every tab descendant. */
function getTraceTab(navigation: ReturnType<typeof within>, name: string | RegExp): HTMLElement {
    const label: HTMLElement = navigation.getByText(name, { selector: '.section-label' });
    const tab = label.closest<HTMLElement>('[role="tab"]');
    if (!tab) {
        throw new Error('Debug adapter section label has no navigation tab');
    }
    return tab;
}

jest.setTimeout(3000);

describe('Manage Solution trace settings', () => {
    const testDataHandler = new TestDataHandler();
    afterAll(() => testDataHandler.dispose());
    afterEach(cleanup);

    it('reads and edits processor-specific values inside nested sections', () => {
        const section: UISection = {
            section: 'Trace', 'yml-node': 'trace', options: [],
            subsections: [{
                id: 'serialwire', section: 'Serial Wire', 'yml-node': 'swo-uart', options: [],
                subsections: [{
                    id: 'processors', section: 'Processors', options: [],
                    subsections: [{
                        id: 'ports', section: 'Ports', options: ['Core0', 'Core1'].map(pname => ({
                            name: 'Port', 'yml-node': 'port', type: 'number' as const, pname,
                        })),
                    }],
                }],
            }],
        };
        const { listener, navigation, getPanel, updateSection } = renderTrace(section, {
            trace: [{ 'swo-uart': null, processors: { ports: [{ pname: 'Core0', port: 3333 }, { pname: 'Core1', port: 3334 }] } }],
        });
        fireEvent.click(getTraceTab(navigation, 'Ports'));
        const ports = getPanel().getAllByLabelText('Port') as HTMLInputElement[];
        expect(ports.map(port => port.value)).toEqual(['3333', '3334']);
        fireEvent.change(ports[1], { target: { value: '5555' } });
        fireEvent.blur(ports[1]);
        expect(listener).toHaveBeenCalledWith({
            type: 'SET_DEBUG_ADAPTER_PROPERTY', service: 'trace', subsection: ['serialwire', 'processors', 'ports'],
            key: 'port', value: 5555, pname: 'Core1',
        });

        const processors = section.subsections![0].subsections![0];
        updateSection({
            ...section,
            subsections: [{
                ...section.subsections![0],
                subsections: [{
                    ...processors,
                    subsections: [{ ...processors.subsections![0], options: [...processors.subsections![0].options].reverse() }],
                }],
            }],
        });
        const reordered = getPanel().getAllByLabelText('Port');
        expect(reordered[0]).toBe(ports[1]);
        expect(reordered[1]).toBe(ports[0]);
    });

    it('retains saved numeric and string values when a single-core nested map is reopened and blurred', () => {
        const { listener, navigation, getPanel } = renderTrace({
            section: 'Settings', 'yml-node': 'settings', options: [],
            subsections: [{
                id: 'connection', section: 'Connection', 'pname-options': true,
                options: [
                    { name: 'Port', 'yml-node': 'port', type: 'number', pname: 'Core0', default: 3333 },
                    { name: 'Host', 'yml-node': 'host', type: 'string', pname: 'Core0', default: 'localhost' },
                ],
            }],
        }, { settings: { connection: { port: 5555, host: 'saved-host' } } });
        fireEvent.click(getTraceTab(navigation, 'Connection'));
        const panel = getPanel();
        const port = panel.getByLabelText('Port') as HTMLInputElement;
        const host = panel.getByRole('textbox', { hidden: true }) as HTMLInputElement;
        expect(port.value).toBe('5555');
        expect(host.value).toBe('saved-host');

        fireEvent.blur(port);
        fireEvent.blur(host);

        expect(listener).not.toHaveBeenCalledWith(expect.objectContaining({ key: 'port' }));
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({ key: 'host', value: 'saved-host', pname: 'Core0' }));
    });

    it.each(['trace', 'adapter'])('preserves an unchanged fractional %s clock when focused and blurred', source => {
        const properties = { clock: 96000500, trace: [{ 'swo-uart': null, mode: 'file', 'input-clock': 96000500 }] };
        const section: UISection = source === 'trace' ? configuredTrace : {
            section: 'Debug Interface', options: [{ name: 'Clock (kHz)', 'yml-node': 'clock', type: 'number', scale: 1000 }],
        };
        const { listener, updateDebuggerProperties, navigation, getPanel } = renderTrace(section, properties);
        const tab = source === 'trace' ? 'Serial Wire' : 'Debug Interface';
        const label = source === 'trace' ? 'Input Clock (kHz)' : 'Clock (kHz)';
        fireEvent.click(getTraceTab(navigation, new RegExp(tab)));
        const clock = getPanel().getByLabelText(label) as HTMLInputElement;
        expect(clock.value).toBe('96000.5');

        fireEvent.focus(clock);
        fireEvent.blur(clock);

        expect(clock.value).toBe('96000.5');
        expect(listener).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_DEBUG_ADAPTER_PROPERTY' }));

        updateDebuggerProperties({ clock: 98000500, trace: [{ 'swo-uart': null, mode: 'file', 'input-clock': 98000500 }] });
        expect(clock.value).toBe('98000.5');
    });

    it('retains an edited clock after backend acknowledgement and reopening', async () => {
        const input = '96000.9';
        const stored = 96000000;
        const display = '96000';
        const file = new CTreeItemYamlFile(testDataHandler.tmpFileName('trace.yml'));
        const debuggerWrap = new DebuggerWrap(file.ensureTopItem('debugger'));
        debuggerWrap.object = { trace: [{ 'swo-uart': null, mode: 'file', 'input-clock': 48000000 }] };
        const settings = new DebugAdapterSections([], [createTraceSectionDefinition(debuggerWrap)], () => debuggerWrap, () => debuggerWrap);
        const { listener, updateDebuggerProperties, navigation, getPanel } = renderTrace(settings.sections[0], debuggerWrap.object as GenericPropertyList);
        fireEvent.click(getTraceTab(navigation, /Serial Wire/));
        const clock = getPanel().getByLabelText('Input Clock (kHz)') as HTMLInputElement;

        fireEvent.change(clock, { target: { value: input } });
        fireEvent.blur(clock);
        expect(clock.value).toBe(display);

        const message = listener.mock.calls.at(-1)?.[0] as OutgoingMessage;
        expect(message).toEqual(expect.objectContaining({ type: 'SET_DEBUG_ADAPTER_PROPERTY', value: stored }));
        if (message.type !== 'SET_DEBUG_ADAPTER_PROPERTY') {
            throw new Error('Expected a trace clock edit');
        }
        settings.setParameter(message.service!, message.subsection!, message.key, message.value);
        updateDebuggerProperties(debuggerWrap.object as GenericPropertyList);
        expect(clock.value).toBe(display);
        expect(debuggerWrap.getTraceSource('swo-uart')?.inputClock).toBe(stored);
        expect(await file.save()).toBe(ETextFileResult.Success);

        cleanup();
        const reloaded = new CTreeItemYamlFile(file.fileName);
        expect(await reloaded.load()).toBe(ETextFileResult.Success);
        const savedDebugger = new DebuggerWrap(reloaded.topItem);
        expect(savedDebugger.getTraceSource('swo-uart')?.inputClock).toBe(stored);
        const reopened = renderTrace(settings.sections[0], savedDebugger.object as GenericPropertyList);
        fireEvent.click(getTraceTab(reopened.navigation, /Serial Wire/));
        expect((reopened.getPanel().getByLabelText('Input Clock (kHz)') as HTMLInputElement).value).toBe(display);
    });

    it('routes property edits to the correct branch when leaf identities repeat', () => {
        const { listener, navigation, getPanel } = renderTrace(nestedTrace, nestedProperties);
        const tabs = navigation.getAllByRole('tab', { hidden: true });
        expect(tabs.map(tab => tab.textContent)).toEqual(['Trace (2)', 'Serial Wire', 'Settings A', 'Channel', 'Trace Buffer', 'Settings B', 'Channel']);
        expect(new Set(tabs.map(tab => tab.id)).size).toBe(tabs.length);

        fireEvent.click(tabs[3]);
        const clock = getPanel().getByLabelText('Input Clock (Hz)') as HTMLInputElement;
        expect(clock.value).toBe('42000000');
        fireEvent.change(clock, { target: { value: '64000000' } });
        fireEvent.blur(clock);
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'SET_DEBUG_ADAPTER_PROPERTY', service: 'trace', subsection: ['serialwire', 'settings', 'channel'], key: 'input-clock', value: 64000000,
        }));
        fireEvent.click(tabs[6]);
        expect((getPanel().getByLabelText('Input Clock (Hz)') as HTMLInputElement).value).toBe('84000000');
    });

    it('disables descendants only within the disabled branch', () => {
        const { navigation, getPanel, updateSection } = renderTrace(nestedTrace, nestedProperties);
        updateSection({
            ...nestedTrace,
            subsections: [{ ...nestedTrace.subsections![0], select: false }, nestedTrace.subsections![1]],
        });
        const tabs = navigation.getAllByRole('tab', { hidden: true });
        expect((within(tabs[3]).getByLabelText('Channel') as HTMLInputElement).disabled).toBe(true);
        expect((within(tabs[6]).getByLabelText('Channel') as HTMLInputElement).disabled).toBe(false);
        fireEvent.click(tabs[3]);
        expect((getPanel().getByLabelText('Input Clock (Hz)') as HTMLInputElement).disabled).toBe(true);
    });

    it('routes switch and removal actions to the selected nested branch', () => {
        const { listener, navigation } = renderTrace(nestedTrace, nestedProperties);
        const tabs = navigation.getAllByRole('tab', { hidden: true });
        fireEvent.click(within(tabs[3]).getByLabelText('Channel'));
        expect(listener).toHaveBeenCalledWith({
            type: 'SET_DEBUG_ADAPTER_SUBSECTION_ENABLED', section: 'trace', subsection: ['serialwire', 'settings', 'channel'], enabled: false,
        });
        fireEvent.click(within(tabs[6]).getByLabelText('Remove Channel'));
        expect(listener).toHaveBeenCalledWith({
            type: 'REMOVE_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['tracebuffer', 'settings', 'channel'],
        });
    });

    it('adds a source below a nested section using its complete path', async () => {
        const { listener, navigation } = renderTrace({
            ...nestedTrace,
            subsections: [{
                ...nestedTrace.subsections![0],
                subsections: [{ section: 'Settings A', id: 'settings', options: [], subsections: [], addOptions: [{ id: 'channel', name: 'Channel' }] }],
            }],
        });
        const settingsTab = getTraceTab(navigation, /Settings A/);
        fireEvent.click(within(settingsTab).getByLabelText('Add subsection'));
        const menu = within(await screen.findByRole('menu'));
        fireEvent.click(menu.getByText('Channel'));
        expect(listener).toHaveBeenCalledWith({
            type: 'ADD_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['serialwire', 'settings', 'channel'],
        });
    });

    it('displays saved Hz clocks in kHz and sends edits in Hz', () => {
        const { listener, navigation, getPanel } = renderTrace(configuredTrace);
        fireEvent.click(getTraceTab(navigation, /Serial Wire/));
        const clock = getPanel().getByLabelText('Input Clock (kHz)');
        expect((clock as HTMLInputElement).value).toBe('48000');
        expect(getTraceTab(navigation, /Trace \(2\)/).textContent).toContain('Trace (2)');
        expect(getPanel().getAllByRole('spinbutton', { hidden: true })).toHaveLength(1);

        fireEvent.change(clock, { target: { value: '96000.5' } });
        fireEvent.blur(clock);
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'SET_DEBUG_ADAPTER_PROPERTY', service: 'trace', subsection: ['serialwire'], key: 'input-clock', value: 96000000,
        }));
    });

    it('keeps the selected tab when another source is toggled or removed', () => {
        const { listener, navigation } = renderTrace(configuredTrace);
        const serialWire = getTraceTab(navigation, /Serial Wire/);
        fireEvent.click(serialWire);
        fireEvent.click(navigation.getByLabelText('Trace Buffer'));
        expect(listener).toHaveBeenCalledWith({ type: 'SET_DEBUG_ADAPTER_SUBSECTION_ENABLED', section: 'trace', subsection: ['tracebuffer'], enabled: false });
        expect(serialWire.getAttribute('aria-selected')).toBe('true');
        fireEvent.click(navigation.getByLabelText('Remove Trace Buffer'));
        expect(listener).toHaveBeenCalledWith({ type: 'REMOVE_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['tracebuffer'] });
        expect(serialWire.getAttribute('aria-selected')).toBe('true');
        expect(navigation.queryByRole('checkbox', { name: 'Enable Trace (2)' })).toBeNull();
        expect(listener).not.toHaveBeenCalledWith({ type: 'TOGGLE_DEBUG_ADAPTER_SECTION', section: 'trace' });
    });

    it.each([
        ['1', 1000],
        ['1.0015', 1000],
        ['96000.9', 96000000],
        ['1.001', 1000],
        ['1.003', 1000],
        ['1.9', 1000],
        ['0.0000001', 0],
    ])('cuts off fractions in %s kHz before converting to %s Hz', (display, stored) => {
        const { listener, navigation, getPanel } = renderTrace(configuredTrace);
        fireEvent.click(getTraceTab(navigation, /Serial Wire/));
        const clock = getPanel().getByLabelText('Input Clock (kHz)');

        fireEvent.change(clock, { target: { value: display } });
        fireEvent.blur(clock);

        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'SET_DEBUG_ADAPTER_PROPERTY', service: 'trace', subsection: ['serialwire'], key: 'input-clock', value: stored,
        }));
    });

    it('allows all disabled trace sources to be re-enabled independently while retaining their values', () => {
        const { listener, updateSection, navigation, getPanel } = renderTrace({
            ...configuredTrace,
            subsections: configuredTrace.subsections!.map(source => ({ ...source, select: false })),
        });
        fireEvent.click(getTraceTab(navigation, /Serial Wire/));
        const clock = getPanel().getByLabelText('Input Clock (kHz)') as HTMLInputElement;
        const sourceSwitch = navigation.getByLabelText('Serial Wire') as HTMLInputElement;
        expect(clock.disabled).toBe(true);
        expect(clock.value).toBe('48000');
        expect(sourceSwitch.checked).toBe(false);
        expect(sourceSwitch.disabled).toBe(false);
        expect(navigation.queryByRole('checkbox', { name: 'Enable Trace (2)' })).toBeNull();
        const bufferSwitch = navigation.getByLabelText('Trace Buffer') as HTMLInputElement;
        expect(bufferSwitch.checked).toBe(false);
        expect(bufferSwitch.disabled).toBe(false);

        fireEvent.click(sourceSwitch);
        expect(listener).toHaveBeenCalledWith({ type: 'SET_DEBUG_ADAPTER_SUBSECTION_ENABLED', section: 'trace', subsection: ['serialwire'], enabled: true });
        fireEvent.click(bufferSwitch);
        expect(listener).toHaveBeenCalledWith({ type: 'SET_DEBUG_ADAPTER_SUBSECTION_ENABLED', section: 'trace', subsection: ['tracebuffer'], enabled: true });

        updateSection({
            ...configuredTrace,
            subsections: configuredTrace.subsections!.map(source => ({ ...source, select: source.id === 'serialwire' })),
        });
        expect(clock.disabled).toBe(false);
        expect(sourceSwitch.checked).toBe(true);
        expect(sourceSwitch.disabled).toBe(false);
        expect(bufferSwitch.checked).toBe(false);
        expect(bufferSwitch.disabled).toBe(false);

        updateSection(configuredTrace);
        expect(clock.disabled).toBe(false);
        expect(clock.value).toBe('48000');
    });

    it('renders fixed subsections without checkboxes and keeps their fields enabled until the parent is disabled', () => {
        const fixedSection: UISection = {
            section: 'Trace',
            'yml-node': 'trace',
            options: [],
            subsections: [{
                id: 'serialwire',
                'yml-node': 'swo-uart',
                section: 'Serial Wire',
                options: configuredTrace.subsections![0].options,
            }],
        };
        const { listener, updateSection, navigation, getPanel } = renderTrace(fixedSection);
        expect(navigation.queryByRole('checkbox', { name: 'Enable Trace' })).toBeNull();
        expect(navigation.queryByRole('checkbox', { name: 'Serial Wire' })).toBeNull();
        expect(navigation.queryByRole('button', { name: 'Add subsection' })).toBeNull();
        expect(navigation.queryByRole('button', { name: 'Remove Serial Wire' })).toBeNull();

        fireEvent.click(getTraceTab(navigation, 'Serial Wire'));
        const clock = getPanel().getByLabelText('Input Clock (kHz)') as HTMLInputElement;
        expect(clock.disabled).toBe(false);
        fireEvent.change(clock, { target: { value: '64000' } });
        fireEvent.blur(clock);
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'SET_DEBUG_ADAPTER_PROPERTY', service: 'trace', subsection: ['serialwire'], key: 'input-clock', value: 64000000,
        }));

        updateSection({ ...fixedSection, select: false });
        expect(clock.disabled).toBe(true);
        expect(navigation.queryByRole('checkbox', { name: 'Serial Wire' })).toBeNull();
    });

    it('offers backend-supplied choices through the plus menu and adds selectable children below Trace', async () => {
        const { listener, updateSection, navigation } = renderTrace({
            ...configuredTrace, section: 'Trace (0)', subsections: [],
            addOptions: [{ id: 'serialwire', name: 'Serial Wire' }, { id: 'tracebuffer', name: 'Trace Buffer' }],
        });

        expect(navigation.queryByRole('checkbox', { name: 'Enable Trace (0)' })).toBeNull();
        fireEvent.click(navigation.getByLabelText('Add subsection'));
        const menu = within(await screen.findByRole('menu'));
        fireEvent.click(menu.getByText('Serial Wire'));
        expect(listener).toHaveBeenCalledWith({ type: 'ADD_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['serialwire'] });

        updateSection(configuredTrace);
        const tabs = navigation.getAllByRole('tab', { hidden: true });
        expect(tabs.map(tab => tab.textContent)).toEqual(['Trace (2)', 'Serial Wire', 'Trace Buffer']);
        expect(tabs[0].getAttribute('aria-selected')).toBe('true');
        expect(navigation.getByLabelText('Remove Serial Wire').closest('[role="tab"]')).toBe(tabs[1]);
        expect(navigation.getByLabelText('Remove Trace Buffer').closest('[role="tab"]')).toBe(tabs[2]);
    });

    it('shows fields only in the selected source panel', () => {
        const { navigation, getPanel } = renderTrace(configuredTrace);
        const tabs = navigation.getAllByRole('tab', { hidden: true });
        fireEvent.click(tabs[1]);
        expect(getPanel().getByLabelText('Input Clock (kHz)')).toBeDefined();
        fireEvent.click(tabs[2]);
        expect(tabs[2].getAttribute('aria-selected')).toBe('true');
        expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe(tabs[2].id);
        expect(getPanel().queryByRole('spinbutton', { name: 'Input Clock (kHz)' })).toBeNull();
    });
});
