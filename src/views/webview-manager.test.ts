/**
 * Copyright 2021-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'jest';
import * as path from 'path';
import { WebviewManager, WebviewManagerOptions } from './webview-manager';
import * as vscode from 'vscode';
import { URI } from 'vscode-uri';
import { commandsProviderFactory } from '../vscode-api/commands-provider.factories';
import { getFileNameFromPath } from '../utils/path-utils';

interface MessageIn {
    in: string;
}

interface MessageOut {
    out: string;
}

class MockWebviewPanel {
    public viewType = 'some-view-type';
    public title = 'some-title';
    public options = [];
    public active = true;
    public visible = true;
    public receiveMessageEmitter = new vscode.EventEmitter<MessageOut>();
    public webview = {
        cspSource: 'some-csp-source',
        asWebviewUri: (input: string) => `webview://${input}`,
        onDidReceiveMessage: this.receiveMessageEmitter.event,
        postMessage: jest.fn(),
        html: ''
    };

    public onDisposeFunction: jest.Mock | undefined;

    public onDidDispose = jest.fn().mockImplementation((disposeFunc: jest.Mock) => {
        this.onDisposeFunction = disposeFunc;
    });

    public onDidChangeViewState = jest.fn();

    public dispose = jest.fn().mockImplementation(() => {
        if (this.onDisposeFunction) {
            this.onDisposeFunction();
        }
    });

    public reveal = jest.fn();
}

const TEST_OPTIONS: WebviewManagerOptions = {
    commandId: 'test.commandId',
    viewType: 'test.viewType',
    title: 'Test Panel Title',
    scriptPath: '',
    iconName: { dark: 'dark-icon', light: 'light-icon' },
};

const TEST_SCRIPT_NAME = 'test-script.js';
const TEST_EXTENSION_PATH = __dirname;

describe('WebviewManager', () => {
    let mockWebviewPanel: MockWebviewPanel;
    let webviewManager: WebviewManager<MessageIn, MessageOut>;
    let mockCreateWebviewPanel: jest.Mock;
    let createListener: jest.Mock;
    let messageReceivedListener: jest.Mock;

    beforeEach(() => {
        mockWebviewPanel = new MockWebviewPanel();
        mockCreateWebviewPanel = vscode.window.createWebviewPanel as jest.Mock;
        mockCreateWebviewPanel.mockReturnValue(mockWebviewPanel);

        webviewManager = new WebviewManager(
            { extensionPath: TEST_EXTENSION_PATH, subscriptions: [], extensionUri: vscode.Uri.file(TEST_EXTENSION_PATH) } as unknown as vscode.ExtensionContext,
            { ...TEST_OPTIONS, scriptPath: path.join(__dirname, TEST_SCRIPT_NAME) },
            commandsProviderFactory(),
        );

        createListener = jest.fn();
        webviewManager.onDidCreate(createListener);
        messageReceivedListener = jest.fn();
        webviewManager.onDidReceiveMessage(messageReceivedListener);

        webviewManager.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);
    });

    it('does not create a panel on construction', () => {
        expect(mockCreateWebviewPanel).not.toHaveBeenCalled();
    });

    it('returns false from isPanelActive on construction', () => {
        expect(webviewManager.isPanelActive).toBe(false);
    });

    describe('createOrShowPanel', () => {
        beforeEach(() => {
            webviewManager.createOrShowPanel();
        });

        it('creates the panel if it does not already exist', () => {
            expect(mockCreateWebviewPanel).toHaveBeenCalledTimes(1);
            expect(mockWebviewPanel.reveal).not.toHaveBeenCalled();
        });

        it('sets the title and view type from the constructor arguments', () => {
            expect(mockCreateWebviewPanel.mock.calls[0][0]).toBe(TEST_OPTIONS.viewType);
            expect(mockCreateWebviewPanel.mock.calls[0][1]).toBe(TEST_OPTIONS.title);
        });

        it('sets the icon for the new panel', () => {
            const darkMode = mockCreateWebviewPanel.mock.results[0].value.iconPath.dark.fsPath;
            const lightMode = mockCreateWebviewPanel.mock.results[0].value.iconPath.light.fsPath;
            expect(darkMode).toContain(TEST_OPTIONS.iconName?.dark);
            expect(lightMode).toContain(TEST_OPTIONS.iconName?.light);
        });

        it('includes the public directory and extension path in the local resource roots', () => {
            const { localResourceRoots } = mockCreateWebviewPanel.mock.calls[0][3];

            expect(localResourceRoots).toEqual(expect.arrayContaining([
                URI.file(TEST_EXTENSION_PATH),
                URI.file(__dirname)
            ]));
        });

        it('enables scripts in the webview', () => {
            const { retainContextWhenHidden } = mockCreateWebviewPanel.mock.calls[0][3];
            expect(retainContextWhenHidden).toBeTruthy();
        });

        it('retains webview context on hide', () => {
            const { enableScripts } = mockCreateWebviewPanel.mock.calls[0][3];
            expect(enableScripts).toBeTruthy();
        });

        it('fires a did create event on render', () => {
            expect(createListener).toHaveBeenCalledTimes(1);
        });

        it('reveals the panel if it already exists', () => {
            webviewManager.createOrShowPanel();

            expect(mockWebviewPanel.reveal).toHaveBeenCalledTimes(1);
            expect(mockCreateWebviewPanel).toHaveBeenCalledTimes(1);
            expect(createListener).toHaveBeenCalledTimes(1);
        });

        it('returns true from isPanelActive after creating a panel', () => {
            expect(webviewManager.isPanelActive).toBe(true);
        });

        describe('webview html', () => {
            let webviewHtml: string;

            beforeEach(() => {
                webviewHtml = mockWebviewPanel.webview.html || '';
            });

            it('is set by createOrShowPanel', () => {
                expect(webviewHtml).not.toEqual('');
            });

            it('includes the webpack bundle', () => {
                const matched = webviewHtml.match(/src="([^"]+)"/);
                expect(matched).toBeTruthy();

                const src = matched![1];
                expect(src).toBeTruthy();
                expect(src!.includes('webview://')).toBeTruthy();
                expect(src!.includes('file://')).toBeTruthy();
                expect(src!.includes(TEST_SCRIPT_NAME)).toBeTruthy();
            });

            it('sets the webpack public path', () => {
                const matched = webviewHtml.match(/cmsisPublicPath\s+=\s+['"]([^'"]+)['"]/);
                expect(matched).toBeTruthy();

                const publicPathBasename = getFileNameFromPath(__dirname);
                const src = matched![1];
                expect(src).toBeTruthy();
                expect(src!.includes('webview://')).toBeTruthy();
                expect(src!.includes('file://')).toBeTruthy();
                expect(src!.endsWith(`${publicPathBasename}/`)).toBeTruthy();
            });
        });
    });

    describe('serializer', () => {
        it('registers when the manager is activated', () => {
            expect(vscode.window.registerWebviewPanelSerializer).toHaveBeenCalled();
        });

        it('recreates a webview panel when the serializer deserialize method is called', () => {
            const serializer = (vscode.window.registerWebviewPanelSerializer as jest.Mock).mock.calls[0][1];
            const panelToRevive = new MockWebviewPanel();

            serializer.deserializeWebviewPanel(
                panelToRevive as unknown as vscode.WebviewPanel, {}
            );

            expect(mockCreateWebviewPanel).not.toHaveBeenCalled();
            expect(panelToRevive.webview.html).not.toBeFalsy();
            expect(createListener).toHaveBeenCalledTimes(1);
        });
    });

    describe('sendMessage', () => {
        it('sends a message to the active webview if there is one', () => {
            webviewManager.sendMessage({ in: 'Test message' });
            webviewManager.createOrShowPanel();
            webviewManager.sendMessage({ in: 'Another test message' });

            expect(mockWebviewPanel.webview.postMessage).toHaveBeenCalledTimes(1);
            expect(mockWebviewPanel.webview.postMessage).toHaveBeenCalledWith({ in: 'Another test message' });
        });
    });

    describe('onDidReceiveMessage', () => {
        it('fires when a webview sends a message', () => {
            webviewManager.createOrShowPanel();
            const message: MessageOut = { out: 'Test message' };
            mockWebviewPanel.receiveMessageEmitter.fire(message);

            expect(messageReceivedListener).toHaveBeenCalledWith(message);
        });
    });

    describe('disposePanel', () => {
        let initialPanel: MockWebviewPanel;

        beforeEach(() => {
            initialPanel = new MockWebviewPanel();

            const serializer = (vscode.window.registerWebviewPanelSerializer as jest.Mock).mock.calls[0][1];
            serializer.deserializeWebviewPanel(initialPanel as unknown as vscode.WebviewPanel, {});

            webviewManager.disposePanel();
        });

        it('disposes the active panel if there is one', () => {
            expect(initialPanel.dispose).toHaveBeenCalledTimes(1);
        });

        it('returns false from isPanelActive after disposal', () => {
            expect(webviewManager.isPanelActive).toBe(false);
        });

        it('then a createOrShowPanel call creates a new panel', () => {
            webviewManager.createOrShowPanel();

            expect(mockCreateWebviewPanel).toHaveBeenCalledTimes(1);
        });
    });
});
