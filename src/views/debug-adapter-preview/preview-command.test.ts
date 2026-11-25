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

import * as vscode from 'vscode';
import { commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import type { DeviceInfo } from '../../json-rpc/csolution-rpc-client';
import { WebviewManager } from '../webview-manager';
import { registerDebugAdapterPreview } from './preview-command';
import type { IncomingMessage, OutgoingMessage } from './messages';

jest.mock('../webview-manager');

/** Minimal unsaved source used to exercise document and RPC boundaries. */
const source = 'debug-adapters:\n  - name: Example\n    user-interface:\n      - section: General\n        options: []\n';

describe('debug adapter preview command', () => {
    const commands = commandsProviderFactory();
    const service = { getDeviceList: jest.fn(), getDeviceInfo: jest.fn() };
    const manager = { sendMessage: jest.fn(), attachPanel: jest.fn(), onDidReceiveMessage: jest.fn() };
    const closed = new vscode.EventEmitter<void>();
    const changed = new vscode.EventEmitter<vscode.TextDocumentChangeEvent>();
    const grantTrust = new vscode.EventEmitter<void>();
    const panel = { reveal: jest.fn(), onDidDispose: closed.event, dispose: jest.fn(() => closed.fire()) };
    const document = { uri: vscode.Uri.parse('untitled:debug-adapters.yml'), getText: jest.fn(() => source) } as unknown as vscode.TextDocument;
    let registration: vscode.Disposable;

    /** Delivers a browser message through the registered webview boundary. */
    function receive(message: OutgoingMessage): Promise<void> {
        return manager.onDidReceiveMessage.mock.calls[0][0](message);
    }

    /** Reads the most recently published state, excluding action acknowledgements. */
    function state() {
        const messages = manager.sendMessage.mock.calls.map(([message]) => message as IncomingMessage);
        return messages.filter(message => message.type === 'STATE').at(-1)!.state;
    }

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        Object.defineProperty(vscode.workspace, 'isTrusted', { configurable: true, value: true });
        Object.defineProperty(vscode.workspace, 'onDidGrantWorkspaceTrust', { configurable: true, value: grantTrust.event });
        jest.mocked(vscode.workspace.onDidChangeTextDocument).mockImplementation(changed.event);
        jest.mocked(vscode.workspace.openTextDocument).mockResolvedValue(document);
        jest.mocked(vscode.window.createWebviewPanel).mockReturnValue(panel as unknown as vscode.WebviewPanel);
        jest.mocked(WebviewManager).mockImplementation(() => manager as unknown as WebviewManager<unknown, unknown>);
        manager.onDidReceiveMessage.mockReturnValue(new vscode.Disposable(() => {}));
        manager.sendMessage.mockResolvedValue(undefined);
        service.getDeviceList.mockResolvedValue({ success: true, devices: [{ id: 'Vendor::A' }, { id: 'Vendor::B' }] });
        registration = registerDebugAdapterPreview({ subscriptions: [] } as unknown as vscode.ExtensionContext, commands, service);
    });

    afterEach(() => {
        registration.dispose();
        jest.useRealTimers();
    });

    it('opens beside the dirty source, reuses its panel, and debounces only that document', async () => {
        await commands.mockRunRegistered('cmsis-csolution.previewDebugAdapterUi', document.uri);
        expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(expect.any(String), expect.any(String), vscode.ViewColumn.Beside, expect.any(Object));
        expect(state().adapters).toEqual(['Example']);
        expect(service.getDeviceList).toHaveBeenCalledWith({ context: '', vendor: '', namePattern: '' });
        await commands.mockRunRegistered('cmsis-csolution.previewDebugAdapterUi', document.uri);
        expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
        expect(panel.reveal).toHaveBeenCalled();
        changed.fire({ document } as vscode.TextDocumentChangeEvent);
        expect(state().error).toBe('Updating preview…');
        jest.advanceTimersByTime(200);
        expect(state().error).toBeUndefined();
        panel.dispose();
        const count = manager.sendMessage.mock.calls.length;
        changed.fire({ document } as vscode.TextDocumentChangeEvent);
        jest.runAllTimers();
        expect(manager.sendMessage).toHaveBeenCalledTimes(count);
    });

    it('ignores older device responses and caches complete details', async () => {
        await commands.mockRunRegistered('cmsis-csolution.previewDebugAdapterUi', document.uri);
        let resolveFirst!: (value: DeviceInfo) => void;
        service.getDeviceInfo.mockImplementationOnce(() => new Promise<DeviceInfo>(resolve => { resolveFirst = resolve; }));
        service.getDeviceInfo.mockResolvedValueOnce({ success: true, device: { id: 'Vendor::B', processors: [{ name: 'CM33', core: 'Cortex-M33' }] } });
        const first = receive({ type: 'DEVICE', id: 'Vendor::A' });
        await receive({ type: 'DEVICE', id: 'Vendor::B' });
        expect(state().device).toBe('Vendor::B');
        resolveFirst({ success: true, device: { id: 'Vendor::A' } });
        await first;
        expect(state().device).toBe('Vendor::B');
        expect(state().processors).toEqual(['CM33']);
        await receive({ type: 'DEVICE', id: 'Vendor::A' });
        expect(service.getDeviceInfo).toHaveBeenCalledTimes(2);
        expect(state().device).toBe('Vendor::A');
    });

    it('reports device failures and ignores completion after disposal', async () => {
        await commands.mockRunRegistered('cmsis-csolution.previewDebugAdapterUi', document.uri);
        service.getDeviceInfo.mockRejectedValueOnce(new Error('Missing device pack'));
        await receive({ type: 'DEVICE', id: 'Vendor::A' });
        expect(state().deviceError).toContain('Missing device pack');
        expect(state().device).toBe('');
        let resolveDevice!: (value: DeviceInfo) => void;
        service.getDeviceInfo.mockImplementationOnce(() => new Promise<DeviceInfo>(resolve => { resolveDevice = resolve; }));
        const pending = receive({ type: 'DEVICE', id: 'Vendor::B' });
        panel.dispose();
        const count = manager.sendMessage.mock.calls.length;
        resolveDevice({ success: true, device: { id: 'Vendor::B' } });
        await pending;
        expect(manager.sendMessage).toHaveBeenCalledTimes(count);
    });

    it('routes device context edits without modifying cached metadata and gates edits on workspace trust', async () => {
        await commands.mockRunRegistered('cmsis-csolution.previewDebugAdapterUi', document.uri);
        service.getDeviceInfo.mockResolvedValue({ success: true, device: { id: 'Vendor::A' } });
        await receive({ type: 'DEVICE', id: 'Vendor::A' });
        const original = state().deviceContext;
        await receive({ type: 'DEVICE_CONTEXT', text: '{"id":"Custom"}' });
        expect(state().device).toBe('Vendor::A');
        expect(state().deviceContext).toContain('Custom');
        await receive({ type: 'DEVICE', id: '' });
        await receive({ type: 'DEVICE', id: 'Vendor::A' });
        expect(state().deviceContext).toBe(original);
        expect(service.getDeviceInfo).toHaveBeenCalledTimes(1);

        Object.defineProperty(vscode.workspace, 'isTrusted', { configurable: true, value: false });
        await receive({ type: 'DEVICE_CONTEXT', text: '{"id":"Untrusted"}' });
        expect(state().deviceContext).toBe(original);
    });
});
