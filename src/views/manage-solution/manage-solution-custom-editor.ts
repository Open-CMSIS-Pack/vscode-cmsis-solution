/**
 * Copyright 2026 Arm Limited
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
import * as manifest from '../../manifest';
import { ManageSolutionWebviewMain } from './manage-solution-webview-main';
import { WebviewManager } from '../webview-manager';
import { MANAGE_SOLUTION_WEBVIEW_OPTIONS } from './manage-solution-webview-main';
import { IncomingMessage, OutgoingMessage } from './messages';
import { SolutionManager } from '../../solutions/solution-manager';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { IOpenFileExternal } from '../../open-file-external-if';
import { ConfigurationProvider } from '../../vscode-api/configuration-provider';
import { CsolutionService } from '../../json-rpc/csolution-rpc-client';
import { SolutionData } from './view/state/manage-solution-state';
import { COMMAND_OPEN_SOLUTION } from '../../solutions/active-solution-tracker';

type EditEntry = {
    label: string;
    before: SolutionData;
    after: SolutionData;
};

/**
 * Custom editor document for the manage solution editor. Holds the edit history and delegates undo/redo to the webview main instance.
 */
class ManageSolutionDocument implements vscode.CustomDocument {
    private readonly _onDidDispose = new vscode.EventEmitter<void>();

    public readonly onDidDispose = this._onDidDispose.event;

    private history: EditEntry[] = [];
    private historyIndex = -1;
    private backupSnapshot?: SolutionData;
    private webviewMain?: ManageSolutionWebviewMain;

    constructor(
        public readonly uri: vscode.Uri,
        private readonly onDidChangeContent: (event: vscode.CustomDocumentEditEvent<ManageSolutionDocument>) => void,
        backupSnapshot?: SolutionData,
    ) {
        this.backupSnapshot = backupSnapshot;
    }

    public consumeBackupSnapshot(): SolutionData | undefined {
        const snapshot = this.backupSnapshot;
        this.backupSnapshot = undefined;
        return snapshot;
    }

    public setWebviewMain(webviewMain: ManageSolutionWebviewMain): void {
        this.webviewMain = webviewMain;
    }

    public getWebviewMain(): ManageSolutionWebviewMain {
        if (!this.webviewMain) {
            throw new Error('ManageSolutionDocument webviewMain has not been initialized yet.');
        }
        return this.webviewMain;
    }

    public dispose(): void {
        this._onDidDispose.fire();
        this._onDidDispose.dispose();
    }

    public recordEdit(label: string, before: SolutionData, after: SolutionData): void {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push({ label, before, after });
        this.historyIndex = this.history.length - 1;

        this.onDidChangeContent({
            document: this,
            label,
            undo: async () => {
                await this.getWebviewMain().applySnapshot(before);
                this.historyIndex = Math.max(-1, this.historyIndex - 1);
            },
            redo: async () => {
                await this.getWebviewMain().applySnapshot(after);
                this.historyIndex = Math.min(this.history.length - 1, this.historyIndex + 1);
            },
        });
    }

    public clearEditHistory(): void {
        this.history = [];
        this.historyIndex = -1;
    }
}

export class ManageSolutionCustomEditorProvider implements vscode.CustomEditorProvider<ManageSolutionDocument> {
    public static readonly viewType = 'cmsis.manageSolution';

    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<ManageSolutionDocument>>();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

    private webviewManager?: WebviewManager<IncomingMessage, OutgoingMessage>;
    private webviewMain?: ManageSolutionWebviewMain;
    private activeDocument?: ManageSolutionDocument;
    private isWebviewMainActivated = false;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly solutionManager: SolutionManager,
        private readonly commandsProvider: CommandsProvider,
        private readonly openFileExternal: IOpenFileExternal,
        private readonly configurationProvider: ConfigurationProvider,
        private readonly csolutionService: CsolutionService,
    ) { }

    private getOrCreateWebviewMain(): ManageSolutionWebviewMain {
        if (!this.webviewManager) {
            this.webviewManager = new WebviewManager<IncomingMessage, OutgoingMessage>(
                this.context,
                { ...MANAGE_SOLUTION_WEBVIEW_OPTIONS, enableSerializer: false, commandId: undefined },
                this.commandsProvider,
            );
        }

        if (!this.webviewMain) {
            this.webviewMain = new ManageSolutionWebviewMain(
                this.context,
                this.solutionManager,
                this.commandsProvider,
                this.openFileExternal,
                this.configurationProvider,
                this.csolutionService,
                (label, before, after) => this.activeDocument?.recordEdit(label, before, after),
                this.webviewManager,
            );
        }

        return this.webviewMain;
    }

    public async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext,
        cancellationToken: vscode.CancellationToken,
    ): Promise<ManageSolutionDocument> {
        // The webview main owns the controller and state and is created in resolveCustomEditor.
        // The document only stores history and (optionally) a restored snapshot until the panel is resolved.

        let backupSnapshot: SolutionData | undefined;
        const backupId = openContext.backupId;
        if (backupId && !cancellationToken.isCancellationRequested) {
            try {
                const backupUri = vscode.Uri.parse(backupId);
                const backupBytes = await vscode.workspace.fs.readFile(backupUri);
                if (!cancellationToken.isCancellationRequested) {
                    backupSnapshot = JSON.parse(new TextDecoder().decode(backupBytes)) as SolutionData;
                }
            } catch (error) {
                console.warn('Failed to restore manage solution backup snapshot:', error);
            }
        }

        return new ManageSolutionDocument(uri, e => this._onDidChangeCustomDocument.fire(e), backupSnapshot);
    }

    public async resolveCustomEditor(
        document: ManageSolutionDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken,
    ): Promise<void> {
        if (token.isCancellationRequested) {
            return;
        }

        await this.commandsProvider.executeCommand(COMMAND_OPEN_SOLUTION, document.uri.fsPath);

        if (token.isCancellationRequested) {
            return;
        }
        // Reuse a long-lived webview main and attach it to the current panel.
        const webviewMain = this.getOrCreateWebviewMain();
        this.activeDocument = document;

        document.setWebviewMain(webviewMain);

        webviewPanel.webview.options = {
            enableScripts: true,
            enableCommandUris: true,
            localResourceRoots: [
                this.context.extensionUri,
                vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
                vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'views'),
            ],
        };

        webviewMain.attachToPanel(webviewPanel);
        if (!this.isWebviewMainActivated) {
            await webviewMain.activate(this.context);
            this.isWebviewMainActivated = true;
        }
        const backupSnapshot = document.consumeBackupSnapshot();
        if (backupSnapshot) {
            await webviewMain.applySnapshot(backupSnapshot);
        } else {
            // don't await this, let the webview load and render before we send the data
            webviewMain.sendContextData();
        }
    }

    public async saveCustomDocument(document: ManageSolutionDocument, _cancellation: vscode.CancellationToken): Promise<void> {
        await document.getWebviewMain().saveChanges();
    }

    public async saveCustomDocumentAs(document: ManageSolutionDocument, targetResource: vscode.Uri, _cancellation: vscode.CancellationToken): Promise<void> {
        await this.saveCustomDocument(document, _cancellation);
        await vscode.workspace.fs.copy(document.uri, targetResource, { overwrite: true });
    }

    public async revertCustomDocument(document: ManageSolutionDocument, _cancellation: vscode.CancellationToken): Promise<void> {
        this.activeDocument = document;
        await document.getWebviewMain().revertToDisk();
        document.clearEditHistory();
    }

    public async backupCustomDocument(document: ManageSolutionDocument, context: vscode.CustomDocumentBackupContext, _cancellation: vscode.CancellationToken): Promise<vscode.CustomDocumentBackup> {
        const snapshot = document.getWebviewMain().getSolutionSnapshot();
        const data = new TextEncoder().encode(JSON.stringify(snapshot, undefined, 2));
        await vscode.workspace.fs.writeFile(context.destination, data);
        return {
            id: context.destination.toString(),
            delete: () => vscode.workspace.fs.delete(context.destination).then(() => { return; }),
        };
    }
}

export function registerManageSolutionCommand(
    commandsProvider: CommandsProvider,
    solutionManager: SolutionManager,
): vscode.Disposable {
    const getSolutionUri = (resource?: vscode.Uri): vscode.Uri | undefined => {
        if (resource && resource.fsPath.endsWith('.csolution.yml')) {
            return resource;
        }

        const activeUri = vscode.window.activeTextEditor?.document?.uri;
        if (activeUri && activeUri.fsPath.endsWith('.csolution.yml')) {
            return activeUri;
        }

        const csolution = solutionManager.getCsolution();
        if (csolution?.solutionPath) {
            return vscode.Uri.file(csolution.solutionPath);
        }

        return undefined;
    };

    const openUiEditor = async (resource?: vscode.Uri): Promise<void> => {
        const solutionUri = getSolutionUri(resource);
        if (!solutionUri) {
            void vscode.window.showWarningMessage('No active solution. Open a .csolution.yml first.');
            return;
        }

        await commandsProvider.executeCommand('vscode.openWith', solutionUri, ManageSolutionCustomEditorProvider.viewType);
    };

    const openTextEditor = async (resource?: vscode.Uri): Promise<void> => {
        const solutionUri = getSolutionUri(resource);
        if (!solutionUri) {
            void vscode.window.showWarningMessage('No active solution. Open a .csolution.yml first.');
            return;
        }

        await commandsProvider.executeCommand('vscode.openWith', solutionUri, 'default');
    };

    return vscode.Disposable.from(
        commandsProvider.registerCommand(
            `${manifest.PACKAGE_NAME}.manageSolution`,
            async () => {
                await openUiEditor();
            }
        ),
        commandsProvider.registerCommand(
            `${manifest.PACKAGE_NAME}.openManageSolutionUiEditor`,
            async (resource?: vscode.Uri) => {
                await openUiEditor(resource);
            }
        ),
        commandsProvider.registerCommand(
            `${manifest.PACKAGE_NAME}.openManageSolutionTextEditor`,
            async (resource?: vscode.Uri) => {
                await openTextEditor(resource);
            }
        ),
    );
}
