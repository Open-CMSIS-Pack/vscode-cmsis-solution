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
import { PACKAGE_NAME } from '../../manifest';
import type { CsolutionService } from '../../json-rpc/csolution-rpc-client';
import type { DeviceWithTrace } from '../../debug/debug-adapter-templates';
import type { CommandsProvider } from '../../vscode-api/commands-provider';
import { WebviewManager } from '../webview-manager';
import type { IncomingMessage, OutgoingMessage } from './messages';
import { PreviewSession } from './preview-session';

/** Opens an isolated preview of the current registry buffer beside its YAML editor. */
export function registerDebugAdapterPreview(
    context: vscode.ExtensionContext,
    commands: CommandsProvider,
    service: Pick<CsolutionService, 'getDeviceList' | 'getDeviceInfo'>,
): vscode.Disposable {
    const panels = new Map<string, vscode.WebviewPanel>();
    const details = new Map<string, DeviceWithTrace>();
    const registration = commands.registerCommand(`${PACKAGE_NAME}.previewDebugAdapterUi`, async (uri?: vscode.Uri) => {
        const source = uri ?? vscode.window.activeTextEditor?.document.uri;
        if (!source) {
            await vscode.window.showInformationMessage('Open debug-adapters.yml to preview its user-interface declarations.');
            return;
        }
        const key = source.toString();
        const existing = panels.get(key);
        if (existing) {
            existing.reveal(vscode.ViewColumn.Beside);
            return;
        }
        let document = await vscode.workspace.openTextDocument(source);
        const opened = panels.get(key);
        if (opened) {
            opened.reveal(vscode.ViewColumn.Beside);
            return;
        }
        const session = new PreviewSession(key);
        const disposables: vscode.Disposable[] = [];
        const panelContext = Object.create(context) as vscode.ExtensionContext;
        Object.defineProperty(panelContext, 'subscriptions', { value: disposables });
        const manager = new WebviewManager<IncomingMessage, OutgoingMessage>(panelContext, {
            title: 'Debug Adapter UI Preview',
            viewType: `${PACKAGE_NAME}.debugAdapterPreview`,
            scriptPath: 'dist/views/debugAdapterPreview.js',
            enableSerializer: false,
        }, commands);
        const panel = vscode.window.createWebviewPanel(`${PACKAGE_NAME}.debugAdapterPreview`, 'Debug Adapter UI Preview',
            vscode.ViewColumn.Beside, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [context.extensionUri],
            });
        panels.set(key, panel);
        let disposed = false;
        let loading = true;
        let deviceError: string | undefined;
        let devices: { id: string; name: string }[] = [];
        let queryRevision = 0;
        let timer: ReturnType<typeof setTimeout> | undefined;

        /** Sends the current sandbox state only while the owning document preview exists. */
        function publish(): void {
            if (!disposed) {
                void manager.sendMessage({ type: 'STATE', state: { ...session.state(), devices, loading, deviceError } });
            }
        }

        /** Recompiles the current unsaved document and resumes controls after successful parsing. */
        function refresh(): void {
            session.update(document.getText(), vscode.workspace.isTrusted);
            publish();
        }

        /** Fetches full device metadata lazily and ignores superseded or disposed queries. */
        async function selectDevice(id: string): Promise<void> {
            if (id && !devices.some(device => device.id === id)) {
                return;
            }
            const revision = ++queryRevision;
            loading = true;
            deviceError = undefined;
            publish();
            try {
                let device = details.get(id);
                if (id && !device) {
                    const response = await service.getDeviceInfo({ id });
                    if (!response.success || !response.device) {
                        throw new Error(`Could not retrieve device details for ${id}.`);
                    }
                    device = response.device;
                    details.set(id, device);
                }
                if (!disposed && revision === queryRevision) {
                    session.selectDevice(device);
                }
            } catch (error) {
                if (revision === queryRevision) {
                    deviceError = String(error);
                }
            } finally {
                if (!disposed && revision === queryRevision) {
                    loading = false;
                    publish();
                }
            }
        }

        disposables.push(manager.onDidReceiveMessage(async message => {
            if (!message || typeof message.type !== 'string') {
                return;
            }
            try {
                switch (message.type) {
                    case 'READY':
                        publish();
                        return;
                    case 'DEVICE':
                        if (typeof message.id === 'string') {
                            await selectDevice(message.id);
                        }
                        return;
                    case 'REVEAL':
                        await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
                        return;
                    case 'ACTION': {
                        if (!message.request || typeof message.request.actionId !== 'string') {
                            return;
                        }
                        const result = session.act(message.request, !loading && vscode.workspace.isTrusted);
                        if (result) {
                            await manager.sendMessage({ type: 'RESULT', result });
                        }
                        break;
                    }
                    case 'ADAPTER':
                        if (typeof message.name === 'string') {
                            session.selectAdapter(message.name);
                        }
                        break;
                    case 'PROCESSORS':
                        if (!loading && Array.isArray(message.names) && message.names.every(name => typeof name === 'string')) {
                            session.selectProcessors(message.names);
                        }
                        break;
                    case 'DEVICE_CONTEXT':
                        if (!loading && vscode.workspace.isTrusted && typeof message.text === 'string') {
                            session.editDeviceContext(message.text);
                        }
                        break;
                    case 'RESET':
                        session.reset();
                        break;
                }
                publish();
            } catch (error) {
                session.suspend(String(error));
                publish();
            }
        }));
        disposables.push(vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.uri.toString() === key) {
                document = event.document;
                clearTimeout(timer);
                session.suspend('Updating preview…');
                publish();
                timer = setTimeout(refresh, 200);
            }
        }));
        disposables.push(vscode.workspace.onDidGrantWorkspaceTrust(refresh));
        panel.onDidDispose(() => {
            disposed = true;
            queryRevision++;
            clearTimeout(timer);
            panels.delete(key);
            disposables.splice(0).forEach(disposable => disposable.dispose());
        });
        manager.attachPanel(panel);
        refresh();
        try {
            const response = await service.getDeviceList({ context: '', vendor: '', namePattern: '' });
            if (!response.success) {
                throw new Error('Could not retrieve the csolution device list.');
            }
            devices = response.devices.map(device => ({ id: device.id, name: device.id.split('::').pop() ?? device.id }))
                .sort((left, right) => left.id.localeCompare(right.id));
        } catch (error) {
            deviceError = String(error);
        } finally {
            loading = false;
            publish();
        }
    });
    return new vscode.Disposable(() => {
        registration.dispose();
        panels.forEach(panel => panel.dispose());
        details.clear();
    });
}
