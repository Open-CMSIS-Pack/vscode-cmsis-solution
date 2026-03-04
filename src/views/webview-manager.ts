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

import * as vscode from 'vscode';
import { randomBytes } from 'crypto';
import { URI } from 'vscode-uri';
import { join } from 'path';
import { CommandsProvider } from '../vscode-api/commands-provider';
import { PACK_ASSET_HOST } from './webview-asset-retrieval';

export interface WebviewManagerOptions {
    /**
     * Path to JS file to load in the webview, relative to the extension root
     */
    scriptPath: string;
    /**
     * Title for the panel
     */
    title: string;
    /**
     * The type of the webview panel, as used in the extension activation event
     */
    viewType: string;
    /**
     * Command that opens the panel.
     */
    commandId?: string;
    /***
     * Icon in webview panel tab.
     */
    iconName?: { dark: string, light: string };
    /**
     * Whether to register a webview panel serializer for this view type. Disable when used by custom editors.
     */
    enableSerializer?: boolean;
}

/**
 * Manages the lifecycle and communication with a webview panel.
 * @typeparam In Messages sent to a webview
 * @typeparam Out Messages received from a webview
 */
export class WebviewManager<In, Out> {
    private readonly receiveMessageEmitter = new vscode.EventEmitter<Out>();
    public readonly onDidReceiveMessage = this.receiveMessageEmitter.event;

    private readonly createEmitter = new vscode.EventEmitter<void>();
    public readonly onDidCreate = this.createEmitter.event;

    private readonly disposeEmitter = new vscode.EventEmitter<void>();
    public readonly onDidDispose = this.disposeEmitter.event;

    private readonly scriptUri: vscode.Uri;
    private readonly publicDirUri: vscode.Uri;
    private readonly toDisposeOnClose: vscode.Disposable[] = [];

    private panel: vscode.WebviewPanel | undefined;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly options: WebviewManagerOptions,
        private readonly commandsProvider: CommandsProvider,
    ) {
        this.scriptUri = URI.file(join(context.extensionPath, this.options.scriptPath));
        this.publicDirUri = URI.file(join(context.extensionPath, 'dist/views'));

        const disposables: vscode.Disposable[] = [
            this.createEmitter,
            this.receiveMessageEmitter,
            this.disposeEmitter,
            new vscode.Disposable(() => {
                this.toDisposeOnClose.forEach(disposable => disposable.dispose());
            })
        ];

        if (this.options.enableSerializer !== false) {
            disposables.push(
                vscode.window.registerWebviewPanelSerializer(this.options.viewType, {
                    deserializeWebviewPanel: async webviewPanel => {
                        this.revivePanel(webviewPanel);
                    }
                })
            );
        }

        context.subscriptions.push(...disposables);
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        if (this.options.commandId) {
            context.subscriptions.push(
                this.commandsProvider.registerCommand(this.options.commandId, this.createOrShowPanel, this),
            );
        }
    }

    public attachPanel(panel: vscode.WebviewPanel): void {
        this.panel = panel;
        this.renderPanel(panel);
    }

    public get isPanelActive(): boolean {
        return !!this.panel;
    }

    /**
     * Reveal the panel if it is already created, create a new one otherwise.
     */
    public createOrShowPanel(): void {
        if (this.panel) {
            this.panel.reveal();
        } else {
            this.panel = this.createPanel();
            this.renderPanel(this.panel);
        }
    }

    /**
     * Send a message to the webview if one is open.
     */
    public async sendMessage(message: In): Promise<void> {
        if (this.panel) {
            try {
                await this.panel.webview.postMessage(message);
            } catch (error) {
                console.error(`Failed to send message to webview: ${error}`);
            }
        }
    }

    public disposePanel(): void {
        if (this.panel) {
            this.panel.dispose();
        }
    }

    private revivePanel(panel: vscode.WebviewPanel): void {
        this.panel = panel;
        this.renderPanel(panel);
    }

    private renderPanel(panel: vscode.WebviewPanel): void {
        panel.onDidDispose(() => {
            this.disposeEmitter.fire();
            while (this.toDisposeOnClose.length > 0) {
                this.toDisposeOnClose.pop()?.dispose();
            }

            this.panel = undefined;
        }, undefined, this.context.subscriptions);

        this.renderWebview(panel.webview);
        this.createEmitter.fire();
    }

    private renderWebview(webview: vscode.Webview): void {
        const scriptWebviewUri = webview.asWebviewUri(this.scriptUri);

        // webview.cspSource does not include all CSP sources for VS Code Web
        const webviewUri = webview.asWebviewUri(this.context.extensionUri);
        const baseSource = `${webviewUri.scheme}://${webviewUri.authority}`;
        const cspSource = `${webview.cspSource} ${baseSource}`;

        // Use a nonce for added security. Only scripts with this nonce will be loaded by the browser.
        const nonce = randomBytes(16).toString('base64');
        const contentSecurityPolicy = `default-src ${cspSource}; style-src ${cspSource} 'unsafe-inline'; img-src ${cspSource} ${PACK_ASSET_HOST} data:; script-src 'nonce-${nonce}'`;

        // Webpack public path must end with a trailing slash
        const webpackPublicPath = `${webview.asWebviewUri(this.publicDirUri)}/`;
        const fontAwesomeUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri,
            'dist',
            'views',
            'css',
            'fontawesome.min.css'
        ));

        const fontAwesomeStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri,
            'dist',
            'views',
            'css',
            'solid.min.css'
        ));

        const codiconFontUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'codicon.ttf')
        );

        webview.html = `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}">
                <title>${this.options.title}</title>
                <script nonce="${nonce}">
                    window.cmsisPublicPath = '${webpackPublicPath}';
                    window.cmsisNonce = '${nonce}';
                </script>
                <script defer nonce="${nonce}" src="${scriptWebviewUri}"></script>
                <link rel='preload' as='style' href='${fontAwesomeUri}' >
                <link rel='preload' as='style' href='${fontAwesomeStyleUri}' >
                <link rel='stylesheet' href='${fontAwesomeUri}'>
                <link rel='stylesheet' href='${fontAwesomeStyleUri}'>
                <style>
                    @font-face {
                        font-family: 'cmsis-codicon';
                        src: url('${codiconFontUri}') format('truetype');
                        font-weight: normal;
                        font-style: normal;
                    }
                </style>
            </head>
            <body></body>
            </html>`;

        webview.onDidReceiveMessage((message: Out) => {
            this.receiveMessageEmitter.fire(message);
        }, undefined, this.toDisposeOnClose);
    }

    private createPanel(): vscode.WebviewPanel {
        const panel = vscode.window.createWebviewPanel(
            this.options.viewType,
            this.options.title,
            {
                viewColumn: vscode.ViewColumn.Active
            },
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(this.context.extensionPath),
                    this.publicDirUri
                ],
                enableCommandUris: true,
            }
        );
        if (this.options.iconName) {
            panel.iconPath = {
                light: vscode.Uri.joinPath(this.context.extensionUri, 'media', this.options.iconName.light),
                dark: vscode.Uri.joinPath(this.context.extensionUri, 'media', this.options.iconName.dark),
            };
        }
        return panel;
    }

    public asWebviewUri(localResource: vscode.Uri): string {
        return this.panel?.webview.asWebviewUri(localResource).toString() ?? '';
    }
}
