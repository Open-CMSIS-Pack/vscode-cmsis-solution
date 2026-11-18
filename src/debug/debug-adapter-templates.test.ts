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

import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { DebuggerWrap } from '../solutions/files/csolution-wrap';
import { DebugAdapterSections } from './debug-adapter-sections';
import { UISection } from './debug-adapters-yaml-file';
import { effectiveDebugConfiguration, expandAdapterSections, templateDevice, type DeviceWithTrace } from './debug-adapter-templates';
import { sectionStoragePath } from './section-yaml-binding';

/** Reusable registry definition covering conditional and projected sequence entries. */
const definitions: UISection[] = [{
    section: 'Interface', options: [{ name: 'Protocol', 'yml-node': 'protocol', type: 'enum', default: 'swd', values: [] }],
}, {
    section: 'Trace', 'yml-node': { name: 'trace', kind: 'sequence' }, options: [], subsections: [{
        section: 'Serial Wire', condition: '${{ device.trace.serialwire && config.protocol === "swd" }}',
        'condition-message': 'SWD and device support are required.',
        usage: 'available', select: true,
        'yml-node': { name: 'swo-uart', select: { node: 'mode', selected: 'file', unselected: 'off' } },
        options: [],
    }, {
        section: 'Buffer${{ device.trace.tracebuffer.name ? " " + device.trace.tracebuffer.name : "" }}',
        description: '${{ device.trace.tracebuffer.start }} / ${{ device.trace.tracebuffer.size }} / ${{ device.trace.tracebuffer.length }}',
        usage: 'available', select: true,
        'yml-node': { name: 'trace-buffer', value: '${{ device.trace.tracebuffer.name }}', select: { node: 'mode', selected: 'file', unselected: 'off' } },
        options: [{ name: 'Clock', 'yml-node': 'clock', type: 'number', default: 2, scale: 1000 }],
    }],
}];

/** Exercises optional processor selectors using ordinary recursive section declarations. */
const processorDefinitions: UISection[] = [{
    section: 'Telnet', 'yml-node': { name: 'telnet', kind: 'sequence' }, select: false, options: [],
    subsections: [{
        section: '${{ processors.name }}', collapsible: false,
        'yml-node': { name: 'pname', value: '${{ processors.name }}', optional: true },
        options: [{ name: 'Mode', 'yml-node': 'mode', type: 'string', default: 'monitor' }],
    }],
}];

/** Creates processor settings whose device metadata is independent of the effective processor selection. */
function processorModel(data: object = {}, names: string[] = [], declarations = processorDefinitions) {
    const item = new CTreeItem('debugger');
    item.fromObject(data);
    const debuggerWrap = new DebuggerWrap(item);
    const device: DeviceWithTrace = { id: 'D', processors: [
        { name: 'Core0', core: 'Cortex-M4' }, { name: 'Core1', core: 'Cortex-M0' },
    ] };
    const settings = new DebugAdapterSections(declarations, () => debuggerWrap, () => debuggerWrap, device, names);
    return { item, debuggerWrap, settings };
}

/** Constructs real storage and a model whose evaluations follow subsequent in-memory edits. */
function model(data: object = {}, device?: DeviceWithTrace) {
    const item = new CTreeItem('debugger');
    item.fromObject(data);
    const debuggerWrap = new DebuggerWrap(item);
    const settings = new DebugAdapterSections(definitions, () => debuggerWrap, () => debuggerWrap, device);
    const trace = () => settings.sections[1];
    return { item, debuggerWrap, settings, trace };
}

/** Finds the stable model identity assigned to an expanded selector. */
function bufferId(name: string | null): string {
    return JSON.stringify(['trace-buffer', name]);
}

describe('device-aware registry templates', () => {
    it('defaults only absent trace metadata and retains all device properties', () => {
        const device: DeviceWithTrace = { id: 'Device', family: 'Family', processors: [{ core: 'Cortex-M4' }], trace: { serialwire: false, tracebuffer: [] } };
        expect(templateDevice().trace).toEqual({ serialwire: true, tracebuffer: [{}] });
        expect(templateDevice({ id: 'Device', trace: {} }).trace).toEqual({ serialwire: false, tracebuffer: [] });
        expect(templateDevice(device)).toEqual(device);
        expect(device.trace).toEqual({ serialwire: false, tracebuffer: [] });
    });

    it('keeps projected labels, addresses and sizes correlated without narrowing the source array', () => {
        const device: DeviceWithTrace = { id: 'D', trace: { tracebuffer: [
            { name: 'MTB', start: 4096, size: 128 }, { name: 'ETF', start: 8192, size: 256 },
        ] } };
        const { trace } = model({}, device);
        expect(trace().subsections?.map(child => [child.section, child.description])).toEqual([
            ['Buffer MTB', '4096 / 128 / 2'], ['Buffer ETF', '8192 / 256 / 2'],
        ]);
        expect(device.trace?.tracebuffer).toHaveLength(2);
    });

    it('retains unnamed buffers and emits no candidates for an explicit empty capability list', () => {
        expect(model().trace().subsections?.map(child => child.section)).toEqual(['Serial Wire', 'Buffer']);
        expect(model({}, { id: 'D', trace: {} }).trace().subsections).toEqual([]);
    });

    it('independently adds, edits, switches and removes named buffer entries', () => {
        const { item, settings, trace } = model({}, { id: 'D', trace: { tracebuffer: [{ name: 'MTB' }, { name: 'ETF' }] } });
        settings.add('trace', [bufferId('MTB')]);
        settings.add('trace', [bufferId('ETF')]);
        settings.add('trace', [bufferId('MTB')]);
        settings.setParameter('trace', [bufferId('ETF')], 'clock', 9000);
        settings.setEnabled('trace', [bufferId('MTB')], false);
        expect(item.toObject()).toEqual({ trace: [
            { 'trace-buffer': 'MTB', clock: 2000, mode: 'off' },
            { 'trace-buffer': 'ETF', clock: 9000, mode: 'file' },
        ] });
        settings.remove('trace', [bufferId('MTB')]);
        expect(trace().subsections?.map(child => [child.section, child.usage])).toEqual([
            ['Buffer ETF', 'used'], ['Buffer MTB', 'available'],
        ]);
        expect(item.getChild('trace')?.getChildren()).toHaveLength(1);
    });

    it('adds empty-string and null selectors once and edits them independently', () => {
        const { item, settings } = model({}, { id: 'D', trace: { tracebuffer: [{ name: '' }, {}] } });
        settings.add('trace', [bufferId('')]);
        settings.add('trace', [bufferId('')]);
        expect(item.getChild('trace')?.getChildren()).toHaveLength(1);

        settings.add('trace', [bufferId(null)]);
        settings.add('trace', [bufferId(null)]);
        const entries = item.getChild('trace')!.getChildren();
        expect(entries).toHaveLength(2);
        expect(entries.map(entry => entry.getChild('trace-buffer')?.getText())).toEqual(['', undefined]);

        settings.setParameter('trace', [bufferId('')], 'clock', 3000);
        settings.setParameter('trace', [bufferId(null)], 'clock', 4000);
        expect(entries.map(entry => entry.getValue('clock'))).toEqual(['3000', '4000']);

        settings.remove('trace', [bufferId('')]);
        expect(item.getChild('trace')?.getChildren()).toEqual([entries[1]]);
    });

    it('reconstructs distinct empty-string and null selectors when their capabilities disappear', () => {
        const { item, settings, trace } = model({ trace: [
            { 'trace-buffer': '', mode: 'file', custom: 'empty' },
            { 'trace-buffer': null, mode: 'file', custom: 'null' },
        ] }, { id: 'D', trace: { tracebuffer: [] } });

        expect(trace().subsections?.map(child => [child.id, child.usage, child.condition])).toEqual([
            [bufferId(''), 'used', false], [bufferId(null), 'used', false],
        ]);

        settings.setParameter('trace', [bufferId('')], 'clock', 5000);
        const entries = item.getChild('trace')!.getChildren();
        expect(entries[0].getChild('trace-buffer')?.getText()).toBe('');
        expect(entries[0].getValue('clock')).toBe('5000');
        expect(entries[1].getValue('clock')).toBeUndefined();

        settings.remove('trace', [bufferId('')]);
        expect(item.toObject()).toEqual({ trace: [{ 'trace-buffer': null, mode: 'file', custom: 'null' }] });
    });

    it('reevaluates unsaved protocol edits while retaining, disabling and removing unsupported sinks', () => {
        const { settings, debuggerWrap, trace, item } = model();
        settings.add('trace', ['swo-uart']);
        debuggerWrap.protocol = 'jtag';
        const source = trace().subsections?.find(child => child.section === 'Serial Wire');
        expect(source).toMatchObject({ usage: 'used', select: true, condition: false, warning: 'SWD and device support are required.' });
        settings.setEnabled('trace', ['swo-uart'], false);
        settings.setEnabled('trace', ['swo-uart'], true);
        expect(debuggerWrap.getTraceSource('swo-uart')?.enabled).toBe(false);
        settings.remove('trace', ['swo-uart']);
        settings.add('trace', ['swo-uart']);
        expect(item.toObject()).toEqual({ protocol: 'jtag' });
        debuggerWrap.protocol = 'swd';
        expect(trace().subsections?.find(child => child.section === 'Serial Wire')?.warning).toBeUndefined();
    });

    it('reconstructs configured named buffers absent from capabilities after reopening', () => {
        const data = { trace: [{ 'trace-buffer': 'Missing', mode: 'file', custom: 123 }, { 'trace-buffer': null, mode: 'off' }] };
        const { settings, trace, item } = model(data, { id: 'D', trace: { tracebuffer: [{ name: 'MTB' }] } });
        expect(trace().subsections?.map(child => [child.section, child.usage, child.condition])).toEqual([
            ['Buffer Missing', 'used', false], ['Buffer', 'used', false], ['Buffer MTB', 'available', undefined],
        ]);
        settings.setParameter('trace', [bufferId('Missing')], 'clock', 5000);
        expect(item.getChild('trace')?.getChildren()[0].toObject()).toEqual({ 'trace-buffer': 'Missing', mode: 'file', custom: 123, clock: 5000 });
        settings.remove('trace', [bufferId(null)]);
        expect(item.getChild('trace')?.getChildren()).toHaveLength(1);
    });

    it('fills configured nested defaults in storage units without mutating explicit values or creating candidates', () => {
        const actual = { protocol: '', custom: { enabled: false, count: 0, marker: null }, trace: [{ 'trace-buffer': 'MTB', mode: 'off' }] };
        const effective = effectiveDebugConfiguration(definitions, actual);
        expect(effective).toEqual({ ...actual, trace: [{ ...actual.trace[0], clock: 2000 }] });
        expect(actual.trace[0]).not.toHaveProperty('clock');
        expect(effectiveDebugConfiguration(definitions, {})).toEqual({ protocol: 'swd' });
    });

    it('uses nested IDs for defaults while retaining root grouping and explicit YAML bindings', () => {
        const sections: UISection[] = [{
            id: 'root', section: 'Root',
            options: [{ name: 'Root count', 'yml-node': 'root-count', type: 'number', default: 1 }],
            subsections: [{
                section: 'Fixed', 'yml-node': 'fixed', options: [], subsections: [{
                    id: 'child', section: 'Child',
                    options: [{ name: 'Count', 'yml-node': 'count', type: 'number', default: 2, scale: 1000 }],
                }, {
                    id: 'display-id', section: 'Explicit', 'yml-node': 'explicit',
                    options: [{ name: 'Count', 'yml-node': 'count', type: 'number', default: 3 }],
                }, {
                    id: 'missing', section: 'Missing',
                    options: [{ name: 'Count', 'yml-node': 'count', type: 'number', default: 4 }],
                }],
            }],
        }];
        const actual = { fixed: { child: {}, explicit: {} } };

        expect(effectiveDebugConfiguration(sections, actual)).toEqual({
            'root-count': 1, fixed: { child: { count: 2000 }, explicit: { count: 3 } },
        });
        expect(actual).toEqual({ fixed: { child: {}, explicit: {} } });
    });

    it('evaluates Add conditions against defaults in an ID-only nested section', () => {
        const sections: UISection[] = [{
            section: 'Fixed', 'yml-node': 'fixed', options: [], subsections: [{
                id: 'child', section: 'Child',
                options: [{ name: 'Count', 'yml-node': 'count', type: 'number', default: 2 }],
            }],
        }, {
            section: 'Choices', 'yml-node': 'choices', options: [], subsections: [{
                section: 'Candidate', 'yml-node': 'candidate', usage: 'available', options: [],
                condition: '${{ config.fixed.child.count === 2 }}',
            }],
        }];
        const item = new CTreeItem('debugger');
        item.fromObject({ fixed: { child: {} } });
        const wrap = new DebuggerWrap(item);
        const settings = new DebugAdapterSections(sections, () => wrap, () => wrap);

        expect(settings.sections[1].subsections).toMatchObject([
            { section: 'Candidate', usage: 'available', condition: true },
        ]);
        expect(item.toObject()).toEqual({ fixed: { child: {} } });
    });

    it.each([
        { binding: '${{ config.transport }}', id: undefined },
        { binding: { name: '${{ config.transport }}' }, id: undefined },
        { binding: undefined, id: '${{ config.transport }}' },
    ])('resolves default storage before conditions and text for binding $binding and ID $id', ({ binding, id }) => {
        const sections: UISection[] = [{
            section: 'Choices', 'yml-node': 'choices', options: [], subsections: [{
                section: 'Candidate', 'yml-node': 'candidate', usage: 'available', options: [],
                condition: '${{ config.tcp.port === 3333 }}',
            }],
        }, {
            section: 'Interface',
            options: [{ name: 'Transport', 'yml-node': 'transport', type: 'string', default: 'tcp' }],
            subsections: [{
                section: 'Transport', id, 'yml-node': binding,
                description: 'Port ${{ config.tcp.port.toFixed(0) }}',
                condition: '${{ config.tcp.port === 3333 }}',
                options: [{ name: 'Port', 'yml-node': 'port', type: 'number', default: 3333 }],
            }, {
                section: 'Optional', 'yml-node': 'missing-${{ config.transport }}', select: false,
                options: [{ name: 'Port', 'yml-node': 'port', type: 'number', default: 4444 }],
            }],
        }];
        const item = new CTreeItem('debugger');
        item.fromObject({ tcp: {} });
        const wrap = new DebuggerWrap(item);
        const settings = new DebugAdapterSections(sections, () => wrap, () => wrap);

        expect(settings.sections[0].subsections).toMatchObject([{ section: 'Candidate', condition: true }]);
        expect(settings.sections[1].subsections?.[0]).toMatchObject({ description: 'Port 3333', condition: true });
        expect(settings.sections[1].subsections?.[1].select).toBe(false);
        expect(item.toObject()).toEqual({ tcp: {} });

        wrap.setSectionParameter(['tcp'], 'port', 4444);

        expect(settings.sections[0].subsections).toEqual([]);
        expect(settings.sections[1].subsections?.[0]).toMatchObject({ description: 'Port 4444', condition: false });
        expect(item.toObject()).toEqual({ tcp: { port: 4444 } });
    });

    it('fills defaults through projected marker names without evaluating display expressions first', () => {
        const sections: UISection[] = [{
            section: 'Trace', 'yml-node': { name: 'trace', kind: 'sequence' }, options: [], subsections: [{
                section: 'Buffer ${{ device.trace.tracebuffer.name }}', usage: 'available',
                description: '${{ config.trace[1].clock.toFixed(0) }}',
                condition: '${{ config.trace[1].clock === 2000 }}',
                'yml-node': { name: 'buffer-${{ device.trace.tracebuffer.name }}', value: '${{ device.trace.tracebuffer.name }}' },
                options: [{ name: 'Clock', 'yml-node': 'clock', type: 'number', default: 2, scale: 1000 }],
            }],
        }];
        const item = new CTreeItem('debugger');
        item.fromObject({ trace: [{ 'buffer-A': 'A', clock: 0 }, { 'buffer-B': 'B' }] });
        const wrap = new DebuggerWrap(item);
        const settings = new DebugAdapterSections(sections, () => wrap, () => wrap, {
            id: 'D', trace: { tracebuffer: [{ name: 'A' }, { name: 'B' }, { name: 'Missing' }] },
        });

        expect(settings.sections[0].subsections).toMatchObject([
            { section: 'Buffer A', description: '2000', condition: true, usage: 'used' },
            { section: 'Buffer B', description: '2000', condition: true, usage: 'used' },
            { section: 'Buffer Missing', description: '2000', condition: true, usage: 'available' },
        ]);
        expect(item.toObject()).toEqual({ trace: [{ 'buffer-A': 'A', clock: 0 }, { 'buffer-B': 'B' }] });
    });

    it('exposes complete nested config and device fields to conditions without permitting mutations', () => {
        const context = { config: { custom: { enabled: false }, trace: [{ 'trace-buffer': 'MTB' }] }, device: templateDevice({ id: 'D', family: 'Family' }) };
        const sections: UISection[] = [{ section: 'Custom', options: [], condition: '${{ config.custom.enabled === false && config.trace.length === 1 && device.family === "Family" }}' }];
        expect(expandAdapterSections(sections, context)[0].condition).toBe(true);
        const diagnostic = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(expandAdapterSections([{ ...sections[0], condition: '${{ config.custom.enabled = true }}' }], context)).toEqual([]);
        expect(context.config.custom.enabled).toBe(false);
        diagnostic.mockRestore();
    });

    it('suppresses malformed expressions and duplicate concrete selectors with diagnostics', () => {
        const diagnostic = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        const bad: UISection[] = [
            { section: 'Bad', options: [], condition: '${{ broken( }}' },
            { section: 'Unclosed ${{ device.id', options: [] },
            { section: '${{ 123 }}', options: [] },
            { section: 'Bad binding', 'yml-node': { name: '${{ 123 }}' }, options: [] },
        ];
        expect(expandAdapterSections(bad, { config: {}, device: templateDevice() })).toEqual([]);
        const { trace } = model({}, { id: 'D', trace: { tracebuffer: [{ name: 'MTB' }, { name: 'MTB' }] } });
        expect(trace().subsections).toEqual([]);
        expect(diagnostic).toHaveBeenCalled();
        diagnostic.mockRestore();
    });

    it('supports literal scalar and sequence selectors and matches null markers exactly', () => {
        const sections: UISection[] = [{ section: 'Root', 'yml-node': { name: 'trace', kind: 'sequence' }, options: [], subsections: [{
            section: 'Choice', 'yml-node': { name: 'buffer', value: [null, 'MTB', 0, false] }, usage: 'available', options: [],
        }] }];
        const item = new CTreeItem('debugger');
        item.fromObject({ trace: [{ buffer: 'MTB', retained: true }, { buffer: null }] });
        const wrap = new DebuggerWrap(item);
        const expanded = expandAdapterSections(sections, { config: {}, device: templateDevice() }, wrap);
        const choices = expanded[0].subsections!;
        expect(wrap.getSection(sectionStoragePath([expanded[0], choices[0]]))?.object).toEqual({ buffer: null });
        expect(choices).toHaveLength(4);
    });

    it('enables unnamed processor defaults without writing a marker and restores edits after reopening', () => {
        const { settings, item } = processorModel();
        expect(settings.sections[0].subsections).toMatchObject([{ section: '', collapsible: false }]);
        expect(item.toObject()).toEqual({});

        settings.setEnabled('telnet', [], true);
        expect(item.toObject()).toEqual({ telnet: [{ mode: 'monitor' }] });
        const id = settings.sections[0].subsections![0].id!;
        settings.setParameter('telnet', [id], 'mode', 'console');
        const reopened = processorModel(item.toObject() as object);
        expect(reopened.settings.sections[0].subsections![0].id).toBe(id);
        reopened.settings.setParameter('telnet', [id], 'mode', 'file');
        expect(reopened.item.toObject()).toEqual({ telnet: [{ mode: 'file' }] });
    });

    it.each([{}, { pname: null }, { pname: '' }])('edits only the unnamed entry for saved marker %j', marker => {
        const { settings, item } = processorModel({ telnet: [
            { ...marker, mode: 'console', custom: 'retained' }, { pname: 'Core0', mode: 'file' },
        ] });
        const children = settings.sections[0].subsections!;
        const storedMarker = 'pname' in marker ? { pname: marker.pname || null } : {};
        expect(children).toHaveLength(2);
        settings.setParameter('telnet', [children[0].id!], 'mode', 'off');
        expect(item.toObject()).toEqual({ telnet: [
            { ...storedMarker, mode: 'off', custom: 'retained' }, { pname: 'Core0', mode: 'file' },
        ] });
        expect(effectiveDebugConfiguration(processorDefinitions, { telnet: [{ ...marker }] }))
            .toEqual({ telnet: [{ ...marker, mode: 'monitor' }] });
    });

    it('initializes each selected processor and edits named entries independently', () => {
        const { settings, item } = processorModel({}, ['Core0', 'Core1']);
        settings.setEnabled('telnet', [], true);
        expect(item.toObject()).toEqual({ telnet: [
            { pname: 'Core0', mode: 'monitor' }, { pname: 'Core1', mode: 'monitor' },
        ] });
        settings.setParameter('telnet', [settings.sections[0].subsections![1].id!], 'mode', 'file');
        expect(item.toObject()).toEqual({ telnet: [
            { pname: 'Core0', mode: 'monitor' }, { pname: 'Core1', mode: 'file' },
        ] });
        expect(processorModel({}, ['Core1']).settings.sections[0].subsections?.map(child => child.section)).toEqual(['Core1']);
    });

    it('preserves unknown non-map entries when selecting an unnamed processor', () => {
        const { settings, item } = processorModel({ telnet: ['unknown', ['custom'], { mode: 'console' }] });
        settings.setParameter('telnet', [settings.sections[0].subsections![0].id!], 'mode', 'off');
        expect(item.toObject()).toEqual({ telnet: ['unknown', ['custom'], { mode: 'off' }] });
    });

    it('migrates legacy shared maps on editing while retaining fields and comments', () => {
        const { settings, item } = processorModel({ telnet: { mode: 'console', custom: 23 } }, ['Core0', 'Core1']);
        item.getChild('telnet')!.getChild('custom')!.setProperty('comments', { comment: ' Keep' });
        const id = settings.sections[0].subsections![1].id!;
        settings.setParameter('telnet', [id], 'mode', 'file');
        expect(item.toObject()).toEqual({ telnet: [
            { pname: 'Core0', mode: 'console', custom: 23 }, { pname: 'Core1', mode: 'file', custom: 23 },
        ] });
        for (const entry of item.getChild('telnet')!.getChildren()) {
            expect(entry.getChild('custom')!.getProperty('comments')).toEqual({ comment: ' Keep' });
        }
    });

    it('normalizes optional null and empty selectors to the same identity and rejects conflicting entries', () => {
        const context = { config: {}, device: templateDevice() };
        const child: UISection = { section: null, 'yml-node': { name: 'pname', value: null, optional: true }, options: [] };
        const empty: UISection = { ...child, 'yml-node': { name: 'pname', value: '', optional: true } };
        expect(expandAdapterSections([child], context)[0].id).toBe(expandAdapterSections([empty], context)[0].id);
        const diagnostic = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(expandAdapterSections([child, empty], context)).toEqual([]);
        expect(diagnostic).toHaveBeenCalled();
        diagnostic.mockRestore();
    });
});
