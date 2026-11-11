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
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

    render(<ManageSolution messageHandler={messageHandler} />);
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
    });
    updateSection(section);
    listener.mockClear();

    return { listener, updateSection, updateDebuggerProperties };
}

describe('Manage Solution trace settings', () => {
    const testDataHandler = new TestDataHandler();
    afterAll(() => testDataHandler.dispose());
    afterEach(cleanup);

    it('allows switching a warned source and retains its tooltip in both states', async () => {
        const warning = 'SWO requires SWD protocol';
        const traceWithWarning: UISection = {
            ...configuredTrace,
            subsections: configuredTrace.subsections!.map(section => ({
                ...section,
                ...(section.id === 'serialwire' ? { warning } : {}),
            })),
        };
        const { listener, updateSection } = renderTrace(traceWithWarning);
        const sourceSwitch = screen.getByRole('checkbox', { name: 'Serial Wire' }) as HTMLInputElement;
        expect(sourceSwitch.checked).toBe(true);
        expect(sourceSwitch.indeterminate).toBe(false);
        expect(sourceSwitch.getAttribute('aria-checked')).toBeNull();
        expect(sourceSwitch.disabled).toBe(false);
        expect(sourceSwitch.getAttribute('aria-invalid')).toBe('true');

        const warningIcon = screen.getByRole('img', { name: warning });
        const tooltipTarget = warningIcon.parentElement!;
        fireEvent.mouseEnter(warningIcon);
        expect((await screen.findByRole('tooltip')).textContent).toBe(warning);
        fireEvent.mouseLeave(tooltipTarget);
        await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
        fireEvent.click(sourceSwitch);
        expect(listener).toHaveBeenCalledWith({ type: 'SET_DEBUG_ADAPTER_SUBSECTION_ENABLED', section: 'trace', subsection: ['serialwire'], enabled: false });

        updateSection({
            ...traceWithWarning,
            subsections: traceWithWarning.subsections!.map(section => ({ ...section, select: section.id !== 'serialwire' })),
        });
        expect(sourceSwitch.checked).toBe(false);
        expect(sourceSwitch.indeterminate).toBe(false);
        expect(sourceSwitch.disabled).toBe(false);
        expect(sourceSwitch.getAttribute('aria-invalid')).toBeNull();
        expect(screen.queryByRole('img', { name: warning })).toBeNull();
        fireEvent.mouseEnter(tooltipTarget);
        expect((await screen.findByRole('tooltip')).textContent).toBe(warning);
        listener.mockClear();
        fireEvent.click(sourceSwitch);
        expect(listener).toHaveBeenCalledWith({ type: 'SET_DEBUG_ADAPTER_SUBSECTION_ENABLED', section: 'trace', subsection: ['serialwire'], enabled: true });

        fireEvent.click(screen.getByRole('button', { name: 'Remove Serial Wire' }));
        expect(listener).toHaveBeenCalledWith({ type: 'REMOVE_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['serialwire'] });

        updateSection(configuredTrace);
        expect(sourceSwitch.getAttribute('aria-invalid')).toBeNull();
        expect(sourceSwitch.disabled).toBe(false);
        expect(sourceSwitch.indeterminate).toBe(false);
    });

    it('omits unavailable source types from the add menu', async () => {
        const { listener } = renderTrace({
            ...configuredTrace, section: 'Trace (0)', subsections: [],
            addOptions: [{ id: 'tracebuffer', name: 'Trace Buffer' }],
        });
        fireEvent.click(screen.getByRole('button', { name: 'Add subsection' }));
        expect(await screen.findByRole('menuitem', { name: 'Trace Buffer' })).toBeDefined();
        expect(screen.queryByRole('menuitem', { name: 'Serial Wire' })).toBeNull();
        fireEvent.click(screen.getByRole('menuitem', { name: 'Trace Buffer' }));
        expect(listener).toHaveBeenCalledWith({ type: 'ADD_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['tracebuffer'] });
    });

    it('reads and edits processor-specific values inside nested sections', () => {
        const { listener } = renderTrace({
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
        }, {
            trace: [{ 'swo-uart': null, processors: { ports: [{ pname: 'Core0', port: 3333 }, { pname: 'Core1', port: 3334 }] } }],
        });
        fireEvent.click(screen.getByRole('tab', { name: 'Ports' }));
        const ports = screen.getAllByRole('spinbutton', { name: 'Port' }) as HTMLInputElement[];
        expect(ports.map(port => port.value)).toEqual(['3333', '3334']);
        fireEvent.change(ports[1], { target: { value: '5555' } });
        fireEvent.blur(ports[1]);
        expect(listener).toHaveBeenCalledWith({
            type: 'SET_DEBUG_ADAPTER_PROPERTY', service: 'trace', subsection: ['serialwire', 'processors', 'ports'],
            key: 'port', value: 5555, pname: 'Core1',
        });
    });

    it('retains saved numeric and string values when a single-core nested map is reopened and blurred', () => {
        const { listener } = renderTrace({
            section: 'Settings', 'yml-node': 'settings', options: [],
            subsections: [{
                id: 'connection', section: 'Connection', 'pname-options': true,
                options: [
                    { name: 'Port', 'yml-node': 'port', type: 'number', pname: 'Core0', default: 3333 },
                    { name: 'Host', 'yml-node': 'host', type: 'string', pname: 'Core0', default: 'localhost' },
                ],
            }],
        }, { settings: { connection: { port: 5555, host: 'saved-host' } } });
        fireEvent.click(screen.getByRole('tab', { name: 'Connection' }));
        const panel = within(screen.getByRole('tabpanel'));
        const port = panel.getByRole('spinbutton', { name: 'Port' }) as HTMLInputElement;
        const host = panel.getByRole('textbox') as HTMLInputElement;
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
        const { listener, updateDebuggerProperties } = renderTrace(section, properties);
        const tab = source === 'trace' ? 'Serial Wire' : 'Debug Interface';
        const label = source === 'trace' ? 'Input Clock (kHz)' : 'Clock (kHz)';
        fireEvent.click(screen.getByRole('tab', { name: new RegExp(tab) }));
        const clock = screen.getByRole('spinbutton', { name: label }) as HTMLInputElement;
        expect(clock.value).toBe('96000.5');

        fireEvent.focus(clock);
        fireEvent.blur(clock);

        expect(clock.value).toBe('96000.5');
        expect(listener).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_DEBUG_ADAPTER_PROPERTY' }));

        updateDebuggerProperties({ clock: 98000500, trace: [{ 'swo-uart': null, mode: 'file', 'input-clock': 98000500 }] });
        expect(clock.value).toBe('98000.5');
    });

    it.each([
        ['1', 1000, '1'],
        ['1.0015', 1000, '1'],
        ['96000.9', 96000000, '96000'],
    ])('cuts off fractions in %s kHz and persists %s Hz after acknowledgement and reopening', async (input, stored, display) => {
        const file = new CTreeItemYamlFile(testDataHandler.tmpFileName('trace.yml'));
        const debuggerWrap = new DebuggerWrap(file.ensureTopItem('debugger'));
        debuggerWrap.object = { trace: [{ 'swo-uart': null, mode: 'file', 'input-clock': 48000000 }] };
        const settings = new DebugAdapterSections([], [createTraceSectionDefinition(debuggerWrap)], () => debuggerWrap, () => debuggerWrap);
        const { listener, updateDebuggerProperties } = renderTrace(settings.sections[0], debuggerWrap.object as GenericPropertyList);
        fireEvent.click(screen.getByRole('tab', { name: /Serial Wire/ }));
        const clock = screen.getByRole('spinbutton', { name: 'Input Clock (kHz)' }) as HTMLInputElement;

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
        renderTrace(settings.sections[0], savedDebugger.object as GenericPropertyList);
        fireEvent.click(screen.getByRole('tab', { name: /Serial Wire/ }));
        expect((screen.getByRole('spinbutton', { name: 'Input Clock (kHz)' }) as HTMLInputElement).value).toBe(display);
    });

    it('addresses four levels with repeated leaf identities and propagates disabled ancestors only within their branch', async () => {
        const leaf: UISection = {
            id: 'channel', section: 'Channel', 'yml-node': 'channel', select: true, removable: true,
            options: [{ name: 'Input Clock (Hz)', type: 'number', 'yml-node': 'input-clock' }],
        };
        const serialWire: UISection = {
            id: 'serialwire', 'yml-node': 'swo-uart', section: 'Serial Wire', select: true, options: [],
            subsections: [{
                id: 'settings', 'yml-node': 'settings', section: 'Settings A', select: true, options: [],
                subsections: [leaf], addOptions: [],
            }],
        };
        const traceBuffer: UISection = {
            ...serialWire, id: 'tracebuffer', 'yml-node': 'trace-buffer', section: 'Trace Buffer',
            subsections: [{ ...serialWire.subsections![0], section: 'Settings B' }],
        };
        const section = { ...configuredTrace, subsections: [serialWire, traceBuffer] };
        const { listener, updateSection } = renderTrace(section, {
            trace: [
                { 'trace-buffer': null, settings: { channel: { 'input-clock': 84000000 } } },
                { 'swo-uart': null, settings: { channel: { 'input-clock': 42000000 } } },
            ],
        });
        const tabs = screen.getAllByRole('tab');
        expect(tabs.map(tab => tab.textContent)).toEqual(['Trace (2)', 'Serial Wire', 'Settings A', 'Channel', 'Trace Buffer', 'Settings B', 'Channel']);
        expect(new Set(tabs.map(tab => tab.id)).size).toBe(tabs.length);

        fireEvent.click(tabs[3]);
        const clock = screen.getByRole('spinbutton', { name: 'Input Clock (Hz)' }) as HTMLInputElement;
        expect(clock.value).toBe('42000000');
        fireEvent.change(clock, { target: { value: '64000000' } });
        fireEvent.blur(clock);
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'SET_DEBUG_ADAPTER_PROPERTY', service: 'trace', subsection: ['serialwire', 'settings', 'channel'], key: 'input-clock', value: 64000000,
        }));
        fireEvent.click(within(tabs[3]).getByRole('checkbox', { name: 'Channel' }));
        expect(listener).toHaveBeenCalledWith({
            type: 'SET_DEBUG_ADAPTER_SUBSECTION_ENABLED', section: 'trace', subsection: ['serialwire', 'settings', 'channel'], enabled: false,
        });
        fireEvent.click(tabs[6]);
        expect((screen.getByRole('spinbutton', { name: 'Input Clock (Hz)' }) as HTMLInputElement).value).toBe('84000000');
        fireEvent.click(within(tabs[6]).getByRole('button', { name: 'Remove Channel' }));
        expect(listener).toHaveBeenCalledWith({
            type: 'REMOVE_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['tracebuffer', 'settings', 'channel'],
        });

        updateSection({
            ...section,
            subsections: [{ ...serialWire, select: false }, traceBuffer],
        });
        expect((within(tabs[3]).getByRole('checkbox') as HTMLInputElement).disabled).toBe(true);
        expect((within(tabs[6]).getByRole('checkbox') as HTMLInputElement).disabled).toBe(false);
        fireEvent.click(tabs[3]);
        expect(clock.disabled).toBe(true);

        updateSection({
            ...section,
            subsections: [{
                ...serialWire,
                subsections: [{ ...serialWire.subsections![0], subsections: [], addOptions: [{ id: 'channel', name: 'Channel' }] }],
            }, traceBuffer],
        });
        fireEvent.click(within(screen.getByRole('tab', { name: /Settings A/ })).getByRole('button', { name: 'Add subsection' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: 'Channel' }));
        expect(listener).toHaveBeenCalledWith({
            type: 'ADD_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['serialwire', 'settings', 'channel'],
        });
    });

    it('displays saved Hz clocks in kHz and sends edits in Hz while routing subsection actions', () => {
        const { listener } = renderTrace(configuredTrace);
        fireEvent.click(screen.getByRole('tab', { name: /Serial Wire/ }));
        const clock = screen.getByRole('spinbutton', { name: 'Input Clock (kHz)' });
        expect((clock as HTMLInputElement).value).toBe('48000');
        expect(screen.getByRole('tab', { name: /Trace \(2\)/ }).textContent).toContain('Trace (2)');
        expect(screen.getAllByRole('spinbutton')).toHaveLength(1);

        fireEvent.change(clock, { target: { value: '96000.5' } });
        fireEvent.blur(clock);
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'SET_DEBUG_ADAPTER_PROPERTY', service: 'trace', subsection: ['serialwire'], key: 'input-clock', value: 96000000,
        }));

        fireEvent.click(screen.getByRole('checkbox', { name: 'Serial Wire' }));
        expect(listener).toHaveBeenCalledWith({ type: 'SET_DEBUG_ADAPTER_SUBSECTION_ENABLED', section: 'trace', subsection: ['serialwire'], enabled: false });
        fireEvent.click(screen.getByRole('checkbox', { name: 'Trace Buffer' }));
        expect(listener).toHaveBeenCalledWith({ type: 'SET_DEBUG_ADAPTER_SUBSECTION_ENABLED', section: 'trace', subsection: ['tracebuffer'], enabled: false });
        expect(screen.getByRole('tab', { name: /Serial Wire/ }).getAttribute('aria-selected')).toBe('true');
        fireEvent.click(screen.getByRole('button', { name: 'Remove Trace Buffer' }));
        expect(listener).toHaveBeenCalledWith({ type: 'REMOVE_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['tracebuffer'] });
        expect(screen.getByRole('tab', { name: /Serial Wire/ }).getAttribute('aria-selected')).toBe('true');
        expect(screen.queryByRole('checkbox', { name: 'Enable Trace (2)' })).toBeNull();
        expect(listener).not.toHaveBeenCalledWith({ type: 'TOGGLE_DEBUG_ADAPTER_SECTION', section: 'trace' });
    });

    it.each([
        ['1.001', 1000],
        ['1.003', 1000],
        ['1.9', 1000],
        ['0.0000001', 0],
    ])('cuts off fractions in %s kHz before converting to %s Hz', (display, stored) => {
        const { listener } = renderTrace(configuredTrace);
        fireEvent.click(screen.getByRole('tab', { name: /Serial Wire/ }));
        const clock = screen.getByRole('spinbutton', { name: 'Input Clock (kHz)' });

        fireEvent.change(clock, { target: { value: display } });
        fireEvent.blur(clock);

        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'SET_DEBUG_ADAPTER_PROPERTY', service: 'trace', subsection: ['serialwire'], key: 'input-clock', value: stored,
        }));
    });

    it('allows all disabled trace sources to be re-enabled independently while retaining their values', () => {
        const { listener, updateSection } = renderTrace({
            ...configuredTrace,
            subsections: configuredTrace.subsections!.map(source => ({ ...source, select: false })),
        });
        fireEvent.click(screen.getByRole('tab', { name: /Serial Wire/ }));
        const clock = screen.getByRole('spinbutton', { name: 'Input Clock (kHz)' }) as HTMLInputElement;
        const sourceSwitch = screen.getByRole('checkbox', { name: 'Serial Wire' }) as HTMLInputElement;
        expect(clock.disabled).toBe(true);
        expect(clock.value).toBe('48000');
        expect(sourceSwitch.checked).toBe(false);
        expect(sourceSwitch.disabled).toBe(false);
        expect(screen.queryByRole('checkbox', { name: 'Enable Trace (2)' })).toBeNull();
        const bufferSwitch = screen.getByRole('checkbox', { name: 'Trace Buffer' }) as HTMLInputElement;
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
        const { listener, updateSection } = renderTrace(fixedSection);
        expect(screen.queryByRole('checkbox', { name: 'Enable Trace' })).toBeNull();
        expect(screen.queryByRole('checkbox', { name: 'Serial Wire' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Add subsection' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Remove Serial Wire' })).toBeNull();

        fireEvent.click(screen.getByRole('tab', { name: 'Serial Wire' }));
        const clock = screen.getByRole('spinbutton', { name: 'Input Clock (kHz)' }) as HTMLInputElement;
        expect(clock.disabled).toBe(false);
        fireEvent.change(clock, { target: { value: '64000' } });
        fireEvent.blur(clock);
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'SET_DEBUG_ADAPTER_PROPERTY', service: 'trace', subsection: ['serialwire'], key: 'input-clock', value: 64000000,
        }));

        updateSection({ ...fixedSection, select: false });
        expect(clock.disabled).toBe(true);
        expect(screen.queryByRole('checkbox', { name: 'Serial Wire' })).toBeNull();
    });

    it('uses the removable flag independently of addOptions and supports switches without a parent switch', () => {
        const { listener } = renderTrace({
            ...configuredTrace,
            addOptions: undefined,
            subsections: configuredTrace.subsections!.map(section => ({
                ...section,
                ...(section.id === 'tracebuffer' ? { removable: false } : {}),
            })),
        });
        expect(screen.queryByRole('checkbox', { name: 'Enable Trace (2)' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Remove Trace Buffer' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Add subsection' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Remove Serial Wire' }));
        expect(listener).toHaveBeenCalledWith({
            type: 'REMOVE_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['serialwire'],
        });

        const sourceSwitch = screen.getByRole('checkbox', { name: 'Trace Buffer' }) as HTMLInputElement;
        expect(sourceSwitch.disabled).toBe(false);
        fireEvent.click(sourceSwitch);
        expect(listener).toHaveBeenCalledWith({
            type: 'SET_DEBUG_ADAPTER_SUBSECTION_ENABLED', section: 'trace', subsection: ['tracebuffer'], enabled: false,
        });
    });

    it('offers backend-supplied choices through the plus menu and adds selectable children below Trace', async () => {
        const { listener, updateSection } = renderTrace({
            ...configuredTrace, section: 'Trace (0)', subsections: [],
            addOptions: [{ id: 'serialwire', name: 'Serial Wire' }, { id: 'tracebuffer', name: 'Trace Buffer' }],
        });

        expect(screen.queryByRole('checkbox', { name: 'Enable Trace (0)' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Add subsection' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: 'Serial Wire' }));
        expect(listener).toHaveBeenCalledWith({ type: 'ADD_DEBUG_ADAPTER_SUBSECTION', section: 'trace', subsection: ['serialwire'] });

        updateSection(configuredTrace);
        const tabs = screen.getAllByRole('tab');
        expect(tabs.map(tab => tab.textContent)).toEqual(['Trace (2)', 'Serial Wire', 'Trace Buffer']);
        expect(tabs[0].getAttribute('aria-selected')).toBe('true');
        expect(screen.getByRole('button', { name: 'Remove Serial Wire' }).closest('[role="tab"]')).toBe(tabs[1]);
        expect(screen.getByRole('button', { name: 'Remove Trace Buffer' }).closest('[role="tab"]')).toBe(tabs[2]);

        fireEvent.click(tabs[1]);
        expect(screen.getByRole('spinbutton', { name: 'Input Clock (kHz)' })).toBeDefined();
        expect((screen.getByRole('button', { name: 'Add subsection' }) as HTMLButtonElement).disabled).toBe(true);

        fireEvent.click(tabs[2]);
        expect(tabs[2].getAttribute('aria-selected')).toBe('true');
        expect(screen.queryByRole('spinbutton', { name: 'Input Clock (kHz)' })).toBeNull();

        updateSection({
            ...configuredTrace,
            section: 'Trace (1)',
            subsections: [configuredTrace.subsections![1]],
            addOptions: [{ id: 'serialwire', name: 'Serial Wire' }],
        });
        fireEvent.click(screen.getByRole('button', { name: 'Add subsection' }));
        expect(await screen.findByRole('menuitem', { name: 'Serial Wire' })).toBeDefined();
        expect(screen.queryByRole('menuitem', { name: 'Trace Buffer' })).toBeNull();
    });
});
