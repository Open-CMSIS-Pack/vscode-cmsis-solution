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
import { DebuggerWrap } from '../../solutions/files/csolution-wrap';
import { UISection } from '../../debug/debug-adapters-yaml-file';
import { AdapterSettingsContext, AdapterSettingsPresenter } from './adapter-settings-presenter';
import { SettingsActionRequest } from './settings-contract';

/** Creates a host context backed by a real debugger tree for snapshot and action tests. */
function context(sections: UISection[], data: object = {}): AdapterSettingsContext {
    const node = new CTreeItem('debugger');
    node.fromObject(data);
    return {
        identity: ['solution', 'target', 'set', 'adapter'], adapter: 'adapter', adapters: ['adapter', 'other'],
        processors: ['CPU0', 'CPU1'], startProcessor: 'CPU1', autoUpdate: true, sections,
        debugger: new DebuggerWrap(node),
    };
}

describe('AdapterSettingsPresenter', () => {
    it('normalizes null labels and supplies default or explicit collapsibility without changing section identity', () => {
        const presenter = new AdapterSettingsPresenter();
        const input = context([{
            section: 'Telnet', 'yml-node': { name: 'telnet', kind: 'sequence' }, options: [], subsections: [{
                section: null, collapsible: false, 'yml-node': { name: 'pname', value: null, optional: true },
                options: [{ name: 'Mode', 'yml-node': 'mode', type: 'string', default: 'monitor' }],
            }],
        }], { telnet: [{ mode: 'console' }, { pname: 'Core0', mode: 'file' }] });
        const snapshot = presenter.prepare(input);
        expect(snapshot.sections[0].collapsible).toBe(true);
        const child = snapshot.sections[0].children[0];
        expect(child).toMatchObject({ label: '', collapsible: false, fields: [{ value: 'console' }] });
        input.sections[0].subsections![0].section = '';
        const refreshed = presenter.prepare(input).sections[0].children[0];
        expect(refreshed.id).toBe(child.id);
        expect(refreshed.fields[0].editAction).toBe(child.fields[0].editAction);
    });

    it('prepares scaled/default/processor values and unknown enums without exposing bindings', () => {
        const presenter = new AdapterSettingsPresenter();
        const snapshot = presenter.prepare(context([{
            section: 'Connection', 'yml-node': 'private-section', 'pname-options': true,
            options: [
                { name: 'Clock', 'yml-node': 'private-clock', type: 'number', scale: 1000, default: 5, pname: 'CPU0' },
                { name: 'Clock', 'yml-node': 'private-clock', type: 'number', scale: 1000, default: 5, pname: 'CPU1' },
                { name: 'Choice', 'yml-node': 'private-choice', type: 'enum', values: [{ name: 'One', value: 'one' }] },
                { name: 'Label', 'yml-node': 'private-label', type: 'string', default: 'fallback' },
            ],
        }], { 'private-section': [{ pname: 'CPU0', 'private-clock': 7000, 'private-choice': 'unknown' }] }));
        expect(snapshot.header).toMatchObject({ showProcessor: true, selectedProcessor: 'CPU1' });
        expect(snapshot.sections[0].fields).toMatchObject([
            { label: 'Clock', processor: 'CPU0', value: 7 }, { label: 'Clock', processor: 'CPU1', value: 5 },
            { type: 'enum', value: 'unknown', warning: 'Unknown value: unknown' }, { type: 'string', value: 'fallback' },
        ]);
        // Presentation IDs and action IDs reveal no storage addresses.
        expect(snapshot.sections[0]).not.toHaveProperty('yml-node');
        expect(snapshot.sections[0].fields[0]).not.toHaveProperty('scale');
        expect(snapshot.sections[0].fields[0]).not.toHaveProperty('pname');
        expect(snapshot).not.toHaveProperty('debugger');
        expect(JSON.stringify(snapshot)).not.toContain('private-');
    });

    it.each([{ processors: [] }, { processors: ['CPU0'] }])('keeps single-processor fields unlabelled while retaining their storage assignment for $processors', ({ processors }) => {
        const presenter = new AdapterSettingsPresenter();
        const input = context([{
            section: 'Console', 'yml-node': 'console', 'pname-options': true,
            options: [{ name: 'Port', 'yml-node': 'port', type: 'number', pname: 'CPU0', default: 3333 }],
        }], { console: { port: 4444 } });
        input.processors = processors;
        const snapshot = presenter.prepare(input);
        const field = snapshot.sections[0].fields[0];
        expect(field).toMatchObject({ value: 4444, processor: undefined });
        expect(presenter.resolve({ contextId: snapshot.contextId, revision: snapshot.revision,
            requestId: 'edit', actionId: field.editAction!, value: 5555 })).toMatchObject({ option: { pname: 'CPU0' }, value: 5555 });
    });

    it('counts only used dynamic children, hides available children, and inherits disabled state', () => {
        const presenter = new AdapterSettingsPresenter();
        const snapshot = presenter.prepare(context([{
            section: 'Root', select: false, options: [],
            subsections: [
                { section: 'Fixed', options: [], subsections: [{ section: 'Leaf', options: [{ name: 'Value', 'yml-node': 'x', type: 'string' }] }] },
                { section: 'Used', id: 'used', usage: 'used', select: false, options: [] },
                { section: 'Candidate', id: 'candidate', usage: 'available', options: [] },
            ],
        }]));
        const root = snapshot.sections[0];
        expect(root).toMatchObject({ childCount: 1, childrenLayout: 'content', addActions: [] });
        expect(root.children.map(child => child.label)).toEqual(['Fixed', 'Used']);
        expect(root.children[0].children[0].fields[0]).toMatchObject({ disabled: true, editAction: undefined });
        expect(root.children[1].toggleAction).toBeUndefined();
        expect(root.children[1].removeAction).toBeDefined();
    });

    it('keeps read-only subtrees visible and revokes all their actions without reading parent values', () => {
        const presenter = new AdapterSettingsPresenter();
        const input = context([{
            section: 'Root', options: [], subsections: [{
                id: 'target', section: 'Target', usage: 'used', select: true,
                options: [{ name: 'File', 'yml-node': 'file', type: 'file', default: 'default.elf' }],
                subsections: [{
                    id: 'child', section: 'Child', usage: 'available', select: true,
                    options: [{ name: 'Value', 'yml-node': 'value', type: 'string' }],
                }],
            }],
        }], { file: 'parent.elf', target: { file: 'saved.elf' } });
        const first = presenter.prepare(input);
        const previous = first.sections[0].children[0];
        const file = previous.fields[0];
        if (file.type !== 'file') {
            throw new Error('Expected a file field');
        }
        input.sections[0].subsections![0].readOnly = true;

        const second = presenter.prepare(input);
        const target = second.sections[0].children[0];
        expect(target).toMatchObject({
            disabled: true, toggleAction: undefined, removeAction: undefined, addActions: [],
            fields: [{ value: 'default.elf', disabled: true, editAction: undefined, browseAction: undefined, openAction: undefined }],
            children: [{ label: 'Child', disabled: true, toggleAction: undefined, removeAction: undefined }],
        });
        for (const actionId of [previous.toggleAction, previous.removeAction, previous.addActions[0].action,
            file.editAction, file.browseAction, file.openAction]) {
            expect(actionId).toBeDefined();
            expect(presenter.resolve({ contextId: first.contextId, revision: first.revision, requestId: 'old', actionId: actionId! })).toBeUndefined();
        }
        expect(second.sections[0].addActions).toEqual([]);
        expect(input.debugger?.object).toEqual({ file: 'parent.elf', target: { file: 'saved.elf' } });
    });

    it('derives counts from immediate dynamic children and omits counts for static sections', () => {
        const presenter = new AdapterSettingsPresenter();
        const snapshot = presenter.prepare(context([
            { section: 'Empty', options: [] },
            { section: 'Static', options: [], subsections: [{ section: 'Fixed', options: [] }] },
            { section: 'Dynamic', options: [], subsections: [{ section: 'Candidate', usage: 'available', options: [] }] },
            { section: 'Nested', options: [], subsections: [{
                section: 'Fixed', options: [], subsections: [{ section: 'Used', usage: 'used', options: [] }],
            }] },
        ]));

        expect(snapshot.sections.map(section => section.childCount)).toEqual([undefined, undefined, 0, undefined]);
        expect(snapshot.sections[3].children[0].childCount).toBe(1);
    });

    it('keeps full paths collision-free and resolves only current opaque actions', () => {
        const presenter = new AdapterSettingsPresenter();
        const sections: UISection[] = [{ section: 'Root', options: [], subsections: ['Left', 'Right'].map(section => ({
            section, id: section, options: [{ name: 'Value', 'yml-node': 'value', type: 'number', scale: 10, range: [0, 10] }],
        })) }];
        const input = context(sections);
        const first = presenter.prepare(input);
        const fields = first.sections[0].children.map(child => child.fields[0]);
        expect(fields[0].id).not.toBe(fields[1].id);
        const request: SettingsActionRequest = {
            contextId: first.contextId, revision: first.revision, requestId: 'request', actionId: fields[1].editAction!, value: 15.6,
        };
        expect(presenter.resolve(request)).toMatchObject({ kind: 'edit', root: 'root', path: ['Right'], value: 100 });
        expect(presenter.resolve({ ...request, value: 3.7 })?.value).toBe(30);
        expect(presenter.resolve({ ...request, value: true })).toBeUndefined();
        expect(presenter.resolve({ ...request, actionId: 'invented' })).toBeUndefined();
        const second = presenter.prepare(input);
        expect(second.contextId).toBe(first.contextId);
        expect(second.revision).toBeGreaterThan(first.revision);
        expect(second.sections[0].children[1].fields[0].editAction).toBe(request.actionId);
        expect(presenter.resolve(request)).toBeDefined();
        presenter.prepare({ ...input, identity: ['other-solution'] });
        expect(presenter.resolve(request)).toBeUndefined();
        const restored = presenter.prepare(input);
        expect(restored.contextId).toBe(first.contextId);
        expect(presenter.resolve(request)).toBeUndefined();
    });

    it('prepares empty containers and header actions without synthesizing sections or processor rows', () => {
        const presenter = new AdapterSettingsPresenter();
        const input = context([{ section: 'Display', options: [], subsections: [{ section: 'Add me', usage: 'available', options: [] }] }]);
        input.processors = ['CPU0'];
        const snapshot = presenter.prepare(input);
        expect(snapshot.header).toMatchObject({ showProcessor: false, selectProcessorAction: undefined });
        expect(snapshot.sections[0]).toMatchObject({ fields: [], children: [], childCount: 0, addActions: [{ label: 'Add me' }] });
        expect(presenter.prepare({ ...input, sections: [] }).sections).toEqual([]);
    });

    it('offers file opening only when the effective path is non-empty', () => {
        const presenter = new AdapterSettingsPresenter();
        const snapshot = presenter.prepare(context([{
            section: 'Files', options: [
                { name: 'Fallback', 'yml-node': 'fallback', type: 'file', default: 'default.bin' },
                { name: 'Cleared', 'yml-node': 'cleared', type: 'file', default: 'default.bin' },
                { name: 'Saved', 'yml-node': 'saved', type: 'file', default: 'default.bin' },
                { name: 'Empty', 'yml-node': 'empty', type: 'file' },
            ],
        }], { cleared: '', saved: 'saved.bin' }));

        expect(snapshot.sections[0].fields).toMatchObject([
            { value: 'default.bin', openAction: expect.any(String) },
            { value: '', openAction: undefined },
            { value: 'saved.bin', openAction: expect.any(String) },
            { value: '', openAction: undefined },
        ]);
    });

    it('rejects old field actions after their section is removed and recreated with the same identity', () => {
        const presenter = new AdapterSettingsPresenter();
        const input = context([{
            section: 'Files', options: [{ name: 'Image', 'yml-node': 'image', type: 'file' }],
        }], { image: 'saved.bin' });
        const first = presenter.prepare(input);
        const field = first.sections[0].fields[0];
        if (field.type !== 'file') {
            throw new Error('Expected a file field');
        }
        const requests = [
            { actionId: field.editAction!, kind: 'edit' },
            { actionId: field.browseAction!, kind: 'browse' },
            { actionId: field.openAction!, kind: 'open' },
        ].map(({ actionId, kind }) => ({
            kind,
            request: { contextId: first.contextId, revision: first.revision, requestId: kind, actionId, value: 'new.bin' },
        }));
        presenter.prepare({ ...input, sections: [] });
        requests.forEach(({ request }) => expect(presenter.resolve(request)).toBeUndefined());

        const restored = presenter.prepare(input);
        expect(restored.sections[0].fields[0].editAction).toBe(field.editAction);
        requests.forEach(({ request, kind }) => {
            expect(presenter.resolve(request)).toBeUndefined();
            expect(presenter.resolve({ ...request, revision: restored.revision })).toMatchObject({ kind });
        });
    });
});
