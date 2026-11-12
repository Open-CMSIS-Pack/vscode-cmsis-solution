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

/** Defines an independent feature with a dynamic map containing dynamic sequence entries. */
const captureDefinition: UISection = {
    id: 'capture', section: 'Capture', 'yml-node': 'capture-settings', options: [],
    subsections: [{
        id: 'group', section: 'Group', usage: 'available',
        'yml-node': { name: 'group-sinks', kind: 'sequence' }, options: [],
        subsections: [{
            id: 'sink', section: 'Sink', usage: 'available', select: true,
            'yml-node': { name: 'stream', select: { node: 'state', selected: 'enabled', unselected: 'disabled' } },
            options: [{ name: 'Rate', 'yml-node': 'rate', type: 'number', scale: 10, default: 2, range: [0, 10] }],
        }],
    }],
};

/** Creates a real in-memory debugger tree for structured editing without filesystem or transport mocks. */
function createSettings(data: object = {}) {
    const item = new CTreeItem('debugger');
    item.fromObject(data);
    const debuggerWrap = new DebuggerWrap(item);
    const settings = new DebugAdapterSections([captureDefinition], () => debuggerWrap, () => debuggerWrap);
    return { settings, item };
}

describe('DebugAdapterSections', () => {
    it('rejects duplicate siblings and fields while permitting repeated leaf identities across branches', () => {
        const leaf: UISection = { id: 'leaf', section: 'Leaf', options: [] };
        const wrapper = new DebuggerWrap(new CTreeItem('debugger'));
        const create = (sections: UISection[]) => new DebugAdapterSections(sections, () => wrapper, () => wrapper);
        expect(() => create([{ section: 'Root', options: [], subsections: [leaf, leaf] }])).toThrow('Duplicate section identity');
        const field = { name: 'Value', 'yml-node': 'value', type: 'string' as const };
        expect(() => create([{ section: 'Root', options: [field, field] }])).toThrow('Duplicate field identity');
        expect(() => create([
            { id: 'a', section: 'A', options: [], subsections: [leaf] },
            { id: 'b', section: 'B', options: [], subsections: [leaf] },
        ])).not.toThrow();
    });

    it.each([
        { cores: [] },
        { cores: ['Core0'] },
        { cores: ['Core0', 'Core1'] },
    ])('initializes nested processor defaults for cores $cores without overwriting other cores', ({ cores }) => {
        const { item } = createSettings({ unrelated: { keep: true } });
        const debuggerWrap = new DebuggerWrap(item);
        const processors: UISection = {
            id: 'processors', section: 'Processors', select: false, 'pname-options': true,
            options: (cores.length > 0 ? cores : ['']).map(pname => ({
                name: 'Port', 'yml-node': 'port', type: 'number', pname, default: 3333,
            })),
        };
        const settings = new DebugAdapterSections([{
            section: 'Settings', 'yml-node': 'settings', options: [], subsections: [processors],
        }], () => debuggerWrap, () => debuggerWrap);

        settings.setEnabled('settings', ['processors'], true);
        settings.setParameter('settings', ['processors'], 'port', 5555, cores.at(-1));

        const expected = cores.length > 1
            ? [{ pname: 'Core0', port: 3333 }, { pname: 'Core1', port: 5555 }]
            : { port: 5555 };
        expect(item.toObject()).toEqual({ unrelated: { keep: true }, settings: { processors: expected } });
    });

    it('migrates a saved single-core map before editing another processor', () => {
        const { item } = createSettings({
            unrelated: { keep: true }, settings: { processors: { port: 4444, custom: { keep: true } } },
        });
        const debuggerWrap = new DebuggerWrap(item);
        const processors: UISection = {
            id: 'processors', section: 'Processors', 'pname-options': true,
            options: [{ name: 'Port', 'yml-node': 'port', type: 'number', pname: 'Core0', default: 3333 }],
        };
        const settings = new DebugAdapterSections([{
            section: 'Settings', 'yml-node': 'settings', options: [], subsections: [processors],
        }], () => debuggerWrap, () => debuggerWrap);
        const processorNode = debuggerWrap.getSection(['settings', 'processors'])!.item!;
        processorNode.getChild('custom')!.setProperty('comments', { comment: ' Retained setting' });

        settings.setParameter('settings', ['processors'], 'port', 4444, 'Core0');
        processors.options.push({ ...processors.options[0], pname: 'Core1' });

        expect(settings.sections[0].subsections?.[0].options.map(option => option.pname)).toEqual(['Core0', 'Core1']);
        settings.setParameter('settings', ['processors'], 'port', Number.NaN, 'Core1');
        expect(processorNode.toObject()).toEqual({ port: 4444, custom: { keep: true } });

        settings.setParameter('settings', ['processors'], 'port', 5555, 'Core1');
        expect(processorNode.toObject()).toEqual([
            { pname: 'Core0', port: 4444, custom: { keep: true } },
            { pname: 'Core1', port: 5555, custom: { keep: true } },
        ]);

        settings.setParameter('settings', ['processors'], 'port', 6666, 'Core1');
        expect(item.toObject()).toEqual({
            unrelated: { keep: true }, settings: { processors: [
                { pname: 'Core0', port: 4444, custom: { keep: true } },
                { pname: 'Core1', port: 6666, custom: { keep: true } },
            ] },
        });
        processorNode.getChildren().forEach(entry => {
            expect(entry.getChild('custom')?.getProperty('comments')).toEqual({ comment: ' Retained setting' });
        });
    });

    it('creates separate processor entries when editing a missing nested section before applying defaults', () => {
        const { item } = createSettings();
        const debuggerWrap = new DebuggerWrap(item);
        const settings = new DebugAdapterSections([{
            section: 'Settings', 'yml-node': 'settings', options: [],
            subsections: [{
                id: 'processors', section: 'Processors', 'pname-options': true,
                options: ['Core0', 'Core1'].map(pname => ({ name: 'Port', 'yml-node': 'port', type: 'number', pname })),
            }],
        }], () => debuggerWrap, () => debuggerWrap);

        settings.setParameter('settings', ['processors'], 'port', 3333, 'Core0');
        settings.setParameter('settings', ['processors'], 'port', 3334, 'Core1');
        settings.setParameter('settings', ['processors'], 'port', 5555, 'Core1');

        expect(item.toObject()).toEqual({ settings: { processors: [
            { pname: 'Core0', port: 3333 }, { pname: 'Core1', port: 5555 },
        ] } });
    });

    it('creates nested map and sequence children once and restores choices after removal', () => {
        const { settings, item } = createSettings({ unrelated: { keep: true } });
        expect(settings.sections[0].subsections?.[0].usage).toBe('available');
        expect(item.toObject()).toEqual({ unrelated: { keep: true } });

        settings.add('capture', ['group']);
        expect(settings.sections[0].subsections?.[0].usage).toBe('used');
        expect(settings.sections[0].subsections?.[0].subsections?.[0].usage).toBe('available');
        settings.add('capture', ['group', 'sink']);
        settings.add('capture', ['group', 'sink']);
        expect(item.toObject()).toEqual({
            unrelated: { keep: true },
            'capture-settings': { 'group-sinks': [{ stream: null, state: 'enabled', rate: 20 }] },
        });
        expect(settings.sections[0].subsections?.[0].subsections?.[0].usage).toBe('used');

        settings.remove('capture', ['group', 'sink']);
        expect(item.toObject()).toEqual({ unrelated: { keep: true }, 'capture-settings': {} });
        expect(settings.sections[0].subsections?.[0].usage).toBe('available');
    });

    it('applies value-based switches and validates scaled fields without losing other settings', () => {
        const { settings, item } = createSettings({
            'capture-settings': { 'group-sinks': [{ stream: null, state: 'enabled', rate: 20, custom: 'retained' }] },
        });
        settings.setParameter('capture', ['group', 'sink'], 'rate', 35);
        settings.setParameter('capture', ['group', 'sink'], 'rate', 101);
        settings.setParameter('capture', ['group', 'sink'], 'rate', Number.NaN);
        settings.setEnabled('capture', ['group', 'sink'], false);
        expect(settings.sections[0].subsections?.[0].subsections?.[0].select).toBe(false);
        expect(item.toObject()).toEqual({
            'capture-settings': { 'group-sinks': [{ stream: null, state: 'disabled', rate: 35, custom: 'retained' }] },
        });
        settings.setEnabled('capture', ['group', 'sink'], true);
        expect(settings.sections[0].subsections?.[0].subsections?.[0].select).toBe(true);
    });

    it('rejects unavailable types and unconfigured paths while retaining existing unavailable children', () => {
        const { item } = createSettings({ 'capture-settings': { 'group-sinks': [] } });
        const description: UISection = {
            ...captureDefinition, subsections: [{ ...captureDefinition.subsections![0], usage: 'used' }],
        };
        const debuggerWrap = new DebuggerWrap(item);
        const settings = new DebugAdapterSections([description], () => debuggerWrap, () => debuggerWrap);
        expect(settings.sections[0].subsections?.[0].usage).toBe('used');

        settings.add('capture', ['missing']);
        settings.setParameter('capture', ['group', 'sink'], 'rate', 50);
        settings.setEnabled('capture', ['group', 'sink'], true);
        expect(item.toObject()).toEqual({ 'capture-settings': { 'group-sinks': [] } });
        settings.remove('capture', ['group']);
        settings.add('capture', ['group']);
        expect(item.toObject()).toEqual({});
    });

    it('retains static non-removable sections and supports presence switches independently of dynamic choices', () => {
        const { item } = createSettings();
        const debuggerWrap = new DebuggerWrap(item);
        const settings = new DebugAdapterSections([{
            section: 'Fixed', 'yml-node': 'fixed', options: [],
            subsections: [
                { id: 'child', section: 'Child', select: true, options: [{ name: 'Count', 'yml-node': 'count', type: 'number', default: 3 }] },
                { section: 'Display Group', options: [] },
            ],
        }], () => debuggerWrap, () => debuggerWrap);
        settings.setEnabled('fixed', ['child'], true);
        settings.setParameter('fixed', ['child'], 'count', 7);
        settings.setEnabled('fixed', ['child'], true);
        settings.remove('fixed', ['child']);
        settings.remove('fixed', ['Display Group']);
        expect(item.toObject()).toEqual({ fixed: { child: { count: 7 } } });
        settings.setEnabled('fixed', ['child'], false);
        expect(item.toObject()).toEqual({ fixed: {} });
        expect(settings.sections[0].subsections?.[0].select).toBe(false);
    });
});

/** Uses arbitrary names so the same bindings cannot depend on trace transports or mode fields. */
describe('declarative section storage', () => {
    const description: UISection = {
        section: 'Acquisition', 'yml-node': { name: 'sources', kind: 'sequence' }, options: [],
        subsections: [{
            id: 'stream', section: 'Channel', usage: 'available', select: true,
            'yml-node': { name: 'channel-marker', select: {
                node: 'status', selected: ['record', 'listen'], unselected: ['paused', 'stopped'],
            } },
            options: [{ name: 'Rate', 'yml-node': 'frequency', type: 'number', default: 2, scale: 1000 }],
        }],
    };

    function model(data: object = {}, sections = [description]) {
        const item = new CTreeItem('debugger');
        item.fromObject(data);
        const wrapper = new DebuggerWrap(item);
        return { item, settings: new DebugAdapterSections(sections, () => wrapper, () => wrapper) };
    }

    it('resolves candidates without writing, initializes once, and removes the whole entry', () => {
        const { item, settings } = model({ custom: 'keep' });
        expect(settings.sections[0].subsections?.[0].usage).toBe('available');
        expect(item.toObject()).toEqual({ custom: 'keep' });
        settings.add('sources', ['stream']);
        settings.add('sources', ['stream']);
        expect(settings.sections[0].subsections?.[0]).toMatchObject({ usage: 'used', select: true });
        expect(item.toObject()).toEqual({ custom: 'keep', sources: [{ 'channel-marker': null, status: 'record', frequency: 2000 }] });
        settings.setEnabled('sources', ['stream'], false);
        expect(settings.sections[0].subsections?.[0]).toMatchObject({ usage: 'used', select: false });
        expect(item.toObject()).toEqual({ custom: 'keep', sources: [{ 'channel-marker': null, status: 'paused', frequency: 2000 }] });
        settings.remove('sources', ['stream']);
        expect(item.toObject()).toEqual({ custom: 'keep' });
        expect(settings.sections[0].subsections?.[0].usage).toBe('available');
    });

    it.each(['record', 'listen', 'paused', 'stopped', 'unknown', undefined])('reads %s without normalizing or dropping siblings', status => {
        const entry = { 'channel-marker': null, ...(status === undefined ? {} : { status }), custom: 23 };
        const { item, settings } = model({ sources: [entry] });
        expect(settings.sections[0].subsections?.[0]).toMatchObject({ usage: 'used', select: status === 'record' || status === 'listen' });
        expect(item.toObject()).toEqual({ sources: [entry] });
        settings.setEnabled('sources', ['stream'], true);
        expect(item.toObject()).toEqual({ sources: [{ ...entry, status: 'record' }] });
        settings.setEnabled('sources', ['stream'], false);
        expect(item.toObject()).toEqual({ sources: [{ ...entry, status: 'paused' }] });
    });

    it.each(['link', { name: 'link' }])('uses presence switches for %j and keeps static descriptions after deletion', binding => {
        const { item, settings } = model({}, [{
            section: 'Connection', 'yml-node': binding, select: false, options: [{
                name: 'Port', 'yml-node': 'port', type: 'number', default: 7,
            }],
        }]);
        settings.setEnabled('link', [], true);
        expect(item.toObject()).toEqual({ link: { port: 7 } });
        settings.setEnabled('link', [], false);
        expect(item.toObject()).toEqual({});
        expect(settings.sections).toMatchObject([{ section: 'Connection', select: false }]);
    });

    it('uses a false initial value and accepts scalar states in either direction', () => {
        const { item, settings } = model({}, [{ ...description, subsections: [{
            ...description.subsections![0], select: false,
            'yml-node': { name: 'channel-marker', select: { node: 'status', selected: 'ready', unselected: 'idle' } },
        }] }]);
        settings.add('sources', ['stream']);
        expect(item.toObject()).toEqual({ sources: [{ 'channel-marker': null, status: 'idle', frequency: 2000 }] });
        expect(settings.sections[0].subsections?.[0]).toMatchObject({ usage: 'used', select: false });
    });

    it('does not interpret a missing switch value as an empty-string alias', () => {
        const { settings } = model({ link: {} }, [{
            section: 'Connection', select: true, options: [],
            'yml-node': { name: 'link', select: { node: 'state', selected: '', unselected: 'idle' } },
        }]);
        expect(settings.sections[0].select).toBe(false);
    });

    it('rejects invalid bindings before any editing can occur', () => {
        expect(() => model({}, [{ ...description, 'yml-node': {
            name: 'bad', select: { node: 'status', selected: 'same', unselected: 'same' },
        } }])).toThrow('overlap');
    });
});
