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
import { DebugAdapterSectionDefinition, DebugAdapterSections } from './debug-adapter-sections';
import { UISection } from './debug-adapters-yaml-file';

/** Defines an independent feature with a dynamic map containing dynamic sequence entries. */
const captureDefinition: DebugAdapterSectionDefinition = {
    ui: { id: 'capture', section: 'Capture', 'yml-node': 'capture-settings', options: [] },
    dynamic: {
        kind: 'map',
        types: [{
            ui: { id: 'group', section: 'Group', 'yml-node': 'group-sinks', removable: true, options: [] },
            dynamic: {
                kind: 'sequence',
                types: [{
                    ui: {
                        id: 'sink', section: 'Sink', 'yml-node': 'stream', select: true, removable: true,
                        options: [{ name: 'Rate', 'yml-node': 'rate', type: 'number', scale: 10, default: 2, range: [0, 10] }],
                    },
                    initialValues: { state: 'enabled' },
                    switch: {
                        read: node => node.getValue('state') === 'enabled',
                        write: (node, enabled) => { node.setValue('state', enabled ? 'enabled' : 'disabled'); },
                    },
                }],
            },
        }],
    },
};

/** Creates a real in-memory debugger tree for structured editing without filesystem or transport mocks. */
function createSettings(data: object = {}) {
    const item = new CTreeItem('debugger');
    item.fromObject(data);
    const debuggerWrap = new DebuggerWrap(item);
    const settings = new DebugAdapterSections([], [captureDefinition], () => debuggerWrap, () => debuggerWrap);
    return { settings, item };
}

describe('DebugAdapterSections', () => {
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
        }], [], () => debuggerWrap, () => debuggerWrap);

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
        }], [], () => debuggerWrap, () => debuggerWrap);
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
        }], [], () => debuggerWrap, () => debuggerWrap);

        settings.setParameter('settings', ['processors'], 'port', 3333, 'Core0');
        settings.setParameter('settings', ['processors'], 'port', 3334, 'Core1');
        settings.setParameter('settings', ['processors'], 'port', 5555, 'Core1');

        expect(item.toObject()).toEqual({ settings: { processors: [
            { pname: 'Core0', port: 3333 }, { pname: 'Core1', port: 5555 },
        ] } });
    });

    it('creates nested map and sequence children once and restores choices after removal', () => {
        const { settings, item } = createSettings({ unrelated: { keep: true } });
        expect(settings.sections[0].addOptions).toEqual([{ id: 'group', name: 'Group' }]);
        expect(item.toObject()).toEqual({ unrelated: { keep: true } });

        settings.add('capture', ['group']);
        expect(settings.sections[0].addOptions).toEqual([]);
        expect(settings.sections[0].subsections?.[0].addOptions).toEqual([{ id: 'sink', name: 'Sink' }]);
        settings.add('capture', ['group', 'sink']);
        settings.add('capture', ['group', 'sink']);
        expect(item.toObject()).toEqual({
            unrelated: { keep: true },
            'capture-settings': { 'group-sinks': [{ stream: null, state: 'enabled', rate: 20 }] },
        });
        expect(settings.sections[0].subsections?.[0].addOptions).toEqual([]);

        settings.remove('capture', ['group', 'sink']);
        expect(item.toObject()).toEqual({ unrelated: { keep: true }, 'capture-settings': {} });
        expect(settings.sections[0].addOptions).toEqual([{ id: 'group', name: 'Group' }]);
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
        const group = captureDefinition.dynamic!.types[0];
        const extension: DebugAdapterSectionDefinition = {
            ...captureDefinition,
            dynamic: { kind: 'map', types: [{ ...group, addable: false }] },
        };
        const debuggerWrap = new DebuggerWrap(item);
        const settings = new DebugAdapterSections([], [extension], () => debuggerWrap, () => debuggerWrap);
        expect(settings.sections[0].addOptions).toEqual([]);
        expect(settings.sections[0].subsections?.[0].removable).toBe(true);

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
                { section: 'Display Group', removable: true, options: [] },
            ],
        }], [], () => debuggerWrap, () => debuggerWrap);
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
