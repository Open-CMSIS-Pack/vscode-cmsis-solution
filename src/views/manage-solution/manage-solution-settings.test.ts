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

import path from 'path';
import * as vscode from 'vscode';
import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { DebugAdaptersYamlFile } from '../../debug/debug-adapters-yaml-file';
import { csolutionServiceFactory } from '../../json-rpc/csolution-rpc-client.factory';
import { commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { getMockWebViewManager } from '../__test__/mock-webview-manager';
import { manageSolutionWebviewMainFactory } from './manage-solution-webview-main.factories';
import { OutgoingMessage, IncomingMessage } from './messages';
import { AdapterSnapshot } from './settings-contract';

/** Creates a host with the declarative registry and captures canonical action responses. */
async function setup() {
    const registry = new DebugAdaptersYamlFile();
    expect(await registry.load(path.join(__dirname, '../../../test-data/debug-adapters/declarative.yml'))).toBe(ETextFileResult.Success);
    const webview = getMockWebViewManager<OutgoingMessage>();
    const onEdit = jest.fn();
    const commandsProvider = commandsProviderFactory();
    const main = manageSolutionWebviewMainFactory({ webviewManager: webview, onEdit, commandsProvider });
    main.controller.csolutionService = csolutionServiceFactory();
    main.controller['debugAdaptersYmlFile'] = registry;
    main.controller.activeTargetTypeName = 'Target';
    main.controller.enableDebugger(true, 'CMSIS-DAP@pyOCD');
    const send = (message: OutgoingMessage) => main['handleMessage'](message);
    const messages = () => webview.sendMessage.mock.calls.map(([message]) => message as IncomingMessage);
    const latest = (): AdapterSnapshot => {
        const message = messages().filter(message => message.type === 'ADAPTER_SETTINGS' || message.type === 'SETTINGS_ACTION_RESULT').at(-1)!;
        return message.type === 'ADAPTER_SETTINGS' ? message.snapshot : (message as Extract<IncomingMessage, { type: 'SETTINGS_ACTION_RESULT' }>).result.snapshot;
    };
    let sequence = 0;
    const perform = (actionId: string, value?: string | number | boolean, snapshot = latest()) => send({ type: 'SETTINGS_ACTION', request: {
        contextId: snapshot.contextId, revision: snapshot.revision, requestId: `request-${++sequence}`, actionId, value,
    } });
    await send({ type: 'GET_ADAPTER_SETTINGS' });
    return { main, webview, onEdit, send, messages, latest, perform, commandsProvider };
}

/** Configures a file field for host-side file picker tests. */
async function setupFileSettings(pathType?: 'absolute' | 'relative') {
    const host = await setup();
    host.main.controller.csolutionYml.fileName = path.join(path.sep, 'solution', 'test.csolution.yml');
    const registry = host.main.controller['debugAdaptersYmlFile']!;
    registry.rootItem = new CTreeItem('');
    registry.rootItem.fromObject({ 'debug-adapters': [{ name: 'Files', template: 'unused.adapter.json', 'user-interface': [{
        section: 'Inputs', options: [{ name: 'Image', 'yml-node': 'image', type: 'file', 'path-type': pathType }],
    }] }] });
    host.main.controller.setSelectedDebugger('Files');
    await host.send({ type: 'GET_ADAPTER_SETTINGS' });
    const field = host.latest().sections[0].fields[0];
    if (field.type !== 'file') {
        throw new Error('Expected file field');
    }
    return { ...host, field };
}

describe('registry-driven settings actions', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.mocked(vscode.window.showOpenDialog).mockReset();
    });

    it.each([false, true])('saves a preceding field edit when the model starts dirty: %s', async initiallyDirty => {
        const { main, perform, field } = await setupFileSettings();
        const controller = main.controller;
        controller.csolutionYml.text = controller.csolutionYml.stringify();
        controller.cmsisJsonFile.text = controller.cmsisJsonFile.stringify();
        if (initiallyDirty) {
            controller.csolutionYml.text += '\n';
        }
        const savedPaths: unknown[] = [];
        jest.spyOn(controller, 'saveSolution').mockImplementation(async () => {
            savedPaths.push(controller.activeDebugger?.getValue('image'));
            return true;
        });

        const editing = perform(field.editAction!, 'new.bin');
        const saving = main.saveChanges();
        await Promise.all([editing, saving]);

        expect(savedPaths).toEqual(['new.bin']);
    });

    it('serializes undo/redo with a pending field edit without spanning the restoration in its undo entry', async () => {
        const { main, perform, latest, onEdit, field } = await setupFileSettings();
        await perform(field.editAction!, 'restored.bin');
        const restored = main.getSolutionSnapshot();
        await perform(field.editAction!, 'current.bin');
        onEdit.mockClear();
        const editing = perform(field.editAction!, 'queued.bin');
        const undoing = main.applySnapshot(restored);
        await Promise.all([editing, undoing]);

        expect(latest().sections[0].fields[0].value).toBe('restored.bin');
        expect(onEdit).toHaveBeenCalledTimes(1);
        const [, before, after] = onEdit.mock.calls[0];
        expect(before.targets[0].targetSets[0].debugger.image).toBe('current.bin');
        expect(after.targets[0].targetSets[0].debugger.image).toBe('queued.bin');
        await main.applySnapshot(after);
        expect(latest().sections[0].fields[0].value).toBe('queued.bin');
        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('opens the canonical path after a preceding edit and reuses device information', async () => {
        const { main, perform, latest, onEdit, field, commandsProvider } = await setupFileSettings();
        await perform(field.editAction!, 'old.bin');
        const file = latest().sections[0].fields[0];
        if (file.type !== 'file' || !file.openAction) {
            throw new Error('Expected an Open action for the configured file');
        }
        onEdit.mockClear();
        const service = csolutionServiceFactory({
            getDeviceInfo: jest.fn().mockResolvedValue({
                success: true, device: { id: 'TestDevice', processors: [] },
            }),
        });
        main.controller.csolutionService = service;
        main.controller.activeTargetTypeWrap!.device = 'TestDevice';
        await main.sendContextData();
        const editing = perform(field.editAction!, 'new.bin');
        const opening = perform(file.openAction);
        await Promise.all([editing, opening]);

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', vscode.Uri.file('/solution/new.bin'));
        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(service.getDeviceInfo).toHaveBeenCalledTimes(1);
    });

    it('refreshes device information on a target-set change and its undo/redo even when the device stays the same', async () => {
        const { main, send } = await setup();
        main.controller.activeTargetTypeWrap!.device = 'TestDevice';
        main.controller.csolutionYml.ensureTargetTypeAndSet('Target', 'Other');
        const service = csolutionServiceFactory({
            getDeviceInfo: jest.fn().mockResolvedValue({
                success: true, device: { id: 'TestDevice', processors: [{ name: 'Core', core: 'Cortex-M0' }] },
            }),
        });
        main.controller.csolutionService = service;
        await main.sendContextData();
        const before = main.getSolutionSnapshot();

        await send({ type: 'SET_SELECTED_TARGET', target: 'Target', set: 'Other' });
        const after = main.getSolutionSnapshot();
        expect(service.getDeviceInfo).toHaveBeenCalledTimes(2);
        expect(main.controller.availableCoreNames).toEqual(['Core']);
        await main.applySnapshot(before);
        expect(service.getDeviceInfo).toHaveBeenCalledTimes(3);
        await main.applySnapshot(after);
        expect(service.getDeviceInfo).toHaveBeenCalledTimes(4);
        expect(service.getDeviceInfo).toHaveBeenLastCalledWith({ id: 'TestDevice' });
    });

    it('discards a file selection overtaken by undo during Browse validation', async () => {
        const { main, perform, latest, messages, onEdit, field } = await setupFileSettings();
        await perform(field.editAction!, 'restored.bin');
        const restored = main.getSolutionSnapshot();
        await perform(field.editAction!, 'current.bin');
        jest.mocked(vscode.window.showOpenDialog).mockResolvedValue([vscode.Uri.file('/chosen/obsolete.bin')]);

        const browsing = perform(field.browseAction!);
        const undoing = main.applySnapshot(restored);
        await Promise.all([browsing, undoing]);

        expect(latest().sections[0].fields[0].value).toBe('restored.bin');
        expect(onEdit).toHaveBeenCalledTimes(2);
        expect(messages().filter(message => message.type === 'SETTINGS_ACTION_RESULT').at(-1))
            .toMatchObject({ result: { status: 'rejected' } });
    });

    it('continues processing settings after an earlier queued mutation fails', async () => {
        const { main, perform, latest, messages, field } = await setupFileSettings();
        jest.spyOn(main.controller, 'applySettingsAction').mockImplementationOnce(() => {
            throw new Error('Edit failed');
        });

        const failed = perform(field.editAction!, 'failed.bin');
        const succeeding = perform(field.editAction!, 'new.bin');
        await Promise.all([failed, succeeding]);

        expect(latest().sections[0].fields[0].value).toBe('new.bin');
        expect(messages().filter(message => message.type === 'SETTINGS_ACTION_RESULT').map(message => message.result.status))
            .toEqual(['rejected', 'applied']);
    });

    it('adds, edits, disables and removes trace through opaque actions and restores undo/redo snapshots', async () => {
        const { main, latest, perform, onEdit, messages } = await setup();
        const trace = () => latest().sections.find(section => section.label === 'Trace')!;
        expect(trace()).toMatchObject({ childCount: 0, selected: undefined, children: [] });
        await perform(trace().addActions.find(action => action.label === 'Serial Wire')!.action);
        const source = () => trace().children.find(section => section.label === 'Serial Wire')!;
        expect(source()).toMatchObject({ selected: true });
        await perform(source().fields[0].editAction!, 64.7);
        expect(main.controller.activeDebugger?.getTraceSource('swo-uart')?.inputClock).toBe(64000);
        await perform(source().toggleAction!, false);
        expect(source().selected).toBe(false);
        expect(trace().childCount).toBe(1);
        const disabled = main.getSolutionSnapshot();
        await perform(source().removeAction!);
        expect(trace().children).toEqual([]);
        const removed = main.getSolutionSnapshot();
        await main.applySnapshot(disabled);
        expect(main.controller.activeDebugger?.getTraceSource('swo-uart')?.getValue('mode')).toBe('off');
        await main.applySnapshot(removed);
        expect(main.controller.activeDebugger?.getTraceSource('swo-uart')).toBeUndefined();
        expect(onEdit).toHaveBeenCalledTimes(4);
        expect(messages()).toContainEqual({ type: 'IS_DIRTY', data: true });
        expect(messages().filter(message => message.type === 'SETTINGS_ACTION_RESULT').every(message => message.result.status === 'applied')).toBe(true);
    });

    it('rejects stale context and unknown actions and keeps debugger state out of browser table snapshots', async () => {
        const { main, latest, perform, send, onEdit, messages } = await setup();
        const snapshot = latest();
        await perform('unknown');
        await perform(snapshot.sections[0].fields[0].editAction!, 3, { ...snapshot, contextId: 'stale' });
        expect(onEdit).not.toHaveBeenCalled();
        const results = messages().filter(message => message.type === 'SETTINGS_ACTION_RESULT');
        expect(results.map(message => message.result.status)).toEqual(['rejected', 'rejected']);
        await send({ type: 'GET_CONTEXT_SELECTION_DATA' });
        const table = messages().find(message => message.type === 'DATA_CONTEXT_SELECTION');
        if (table?.type !== 'DATA_CONTEXT_SELECTION') throw new Error('Missing table snapshot');
        expect(table.data.targets.flatMap(target => target.targetSets ?? []).every(set => !('debugger' in set))).toBe(true);
        const before = main.controller.activeDebugger?.object;
        await send({ type: 'SET_SELECTED_CONTEXTS', data: table.data });
        expect(main.controller.activeDebugger?.object).toEqual(before);
    });

    it.each([
        { pathType: undefined, expected: 'images/selected.bin' },
        { pathType: 'absolute' as const, expected: '/solution/images/selected.bin' },
    ])('applies a selected file using the $pathType path binding', async ({ pathType, expected }) => {
        const { latest, perform, messages, onEdit, field } = await setupFileSettings(pathType);
        const selected = vscode.Uri.file(path.join(path.sep, 'solution', 'images', 'selected.bin'));
        jest.mocked(vscode.window.showOpenDialog).mockResolvedValue([selected]);

        await perform(field.browseAction!);

        expect(latest().sections[0].fields[0].value).toBe(expected);
        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(messages().filter(message => message.type === 'SETTINGS_ACTION_RESULT').at(-1)).toMatchObject({
            result: { status: 'applied' },
        });
    });

    it.each(['cancel', 'manual', 'failure'] as const)('acknowledges file picker %s without overwriting newer edits', async outcome => {
        const { latest, perform, messages, onEdit, field } = await setupFileSettings();
        let finish: (value: vscode.Uri[] | undefined) => void = () => undefined;
        let opened: () => void = () => undefined;
        const dialogOpened = new Promise<void>(resolve => { opened = resolve; });
        jest.mocked(vscode.window.showOpenDialog).mockImplementation(() => {
            opened();
            if (outcome === 'failure') return Promise.reject(new Error('Dialog failed'));
            return new Promise(resolve => { finish = resolve; });
        });
        const pending = perform(field.browseAction!);
        await dialogOpened;
        if (outcome === 'manual') await perform(field.editAction!, 'newer.bin');
        finish(outcome === 'cancel' ? undefined : [vscode.Uri.file('/chosen/older.bin')]);
        await pending;
        expect(messages().filter(message => message.type === 'SETTINGS_ACTION_RESULT').at(-1)).toMatchObject({
            result: { status: outcome === 'cancel' ? 'cancelled' : 'rejected' },
        });
        expect(onEdit).toHaveBeenCalledTimes(outcome === 'manual' ? 1 : 0);
        if (outcome === 'manual') expect(latest().sections[0].fields[0].value).toBe('newer.bin');
    });

    it('discards a delayed file selection after undo restores the same context', async () => {
        const { main, latest, perform, messages, onEdit, field } = await setupFileSettings();
        await perform(field.editAction!, 'restored.bin');
        const restored = main.getSolutionSnapshot();
        await perform(field.editAction!, 'current.bin');

        let finish: (value: vscode.Uri[] | undefined) => void = () => undefined;
        let opened: () => void = () => undefined;
        const dialogOpened = new Promise<void>(resolve => { opened = resolve; });
        jest.mocked(vscode.window.showOpenDialog).mockImplementation(() => {
            opened();
            return new Promise(resolve => { finish = resolve; });
        });

        const pending = perform(field.browseAction!);
        await dialogOpened;
        await main.applySnapshot(restored);
        finish([vscode.Uri.file('/chosen/obsolete.bin')]);
        await pending;

        expect(latest().sections[0].fields[0].value).toBe('restored.bin');
        expect(onEdit).toHaveBeenCalledTimes(2);
        expect(messages().filter(message => message.type === 'SETTINGS_ACTION_RESULT').at(-1)).toMatchObject({
            result: { status: 'rejected' },
        });
    });

    it('discards a delayed file selection after switching context', async () => {
        const { main, perform, messages, field } = await setupFileSettings();
        let finish: (value: vscode.Uri[] | undefined) => void = () => undefined;
        let opened: () => void = () => undefined;
        const dialogOpened = new Promise<void>(resolve => { opened = resolve; });
        jest.mocked(vscode.window.showOpenDialog).mockImplementation(() => {
            opened();
            return new Promise(resolve => { finish = resolve; });
        });
        const pending = perform(field.browseAction!);
        await dialogOpened;
        expect(vscode.window.showOpenDialog).toHaveBeenCalledTimes(1);
        main.controller.setActiveTargetSet('Other', undefined);
        await main['handleMessage']({ type: 'GET_ADAPTER_SETTINGS' });
        finish([vscode.Uri.file('/chosen/image.bin')]);
        await pending;
        expect(main.controller.activeDebugger).toBeUndefined();
        expect(messages().filter(message => message.type === 'SETTINGS_ACTION_RESULT').at(-1)).toMatchObject({ result: { status: 'rejected' } });
    });
});
