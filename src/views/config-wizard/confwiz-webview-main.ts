/**
 * Copyright 2022-2026 Arm Limited
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
import { Messenger } from 'vscode-messenger';
import { WebviewIdMessageParticipant } from 'vscode-messenger-common';
import * as manifest from '../../manifest';
import {
    ConfigWizardData,
    logMessageType,
    markDocumentDirty,
    readyType,
    saveElement,
    setPanelActiveType,
    setWizardDataType,
    TreeNodeElement
} from './confwiz-webview-common';
import { GuiTree } from './parser/gui-tree';
import { CwOption } from './parser/cw-option';
import { NumberType } from './parser/number-type';

interface ConfigWizDocument {
    document: vscode.TextDocument;
    participant: WebviewIdMessageParticipant;
}

interface PendingOverflow {
    selectedLabel: string;
    overflowValue: number;
    extractedValue: number;
    bitWidth: number;
}

export class ConfWizWebview implements vscode.CustomTextEditorProvider {
    public static viewType = `${manifest.PACKAGE_NAME}.configWizard`;
    public static previewCommandType = `${manifest.PACKAGE_NAME}.showConfigWizardPreview`;
    public static sourceCommandType = `${manifest.PACKAGE_NAME}.showConfigWizardSource`;

    private static readonly REFRESH_DEBOUNCE_MS = 500;

    protected participant: WebviewIdMessageParticipant | undefined;
    protected documents: Map<string, ConfigWizDocument> = new Map<string, ConfigWizDocument>();
    private activeDocument: vscode.TextDocument | undefined;
    protected viewColumn: vscode.ViewColumn | undefined;
    private isGuiEdit = false;
    private refreshTimeout: NodeJS.Timeout | undefined;
    private readonly guiTrees: Map<string, GuiTree> = new Map<string, GuiTree>();
    private readonly pendingOverflowByDocument: Map<string, Map<string, PendingOverflow>> = new Map<string, Map<string, PendingOverflow>>();

    public constructor(
        protected context: vscode.ExtensionContext,
        protected extensionUri = context.extensionUri,
        protected messenger = new Messenger({ ignoreHiddenViews: false })
    ) { }

    public async activate(): Promise<void> {
        this.context.subscriptions.push(
            vscode.window.registerCustomEditorProvider(ConfWizWebview.viewType, this, { webviewOptions: { retainContextWhenHidden: true } }),
            vscode.commands.registerCommand(ConfWizWebview.previewCommandType, async (uri: vscode.Uri | undefined) => this.preview(uri)),
            vscode.commands.registerCommand(ConfWizWebview.sourceCommandType, () => this.source()),
            vscode.workspace.onDidChangeWorkspaceFolders(this.refresh, this),
            vscode.workspace.onDidChangeTextDocument(async event => {
                if (this.documents.has(event.document.uri.fsPath)) {
                    if (this.isGuiEdit) {
                        // GUI edit: skip refresh entirely (webview already has correct state)
                        return;
                    }

                    // External change: clear pending overflow state for this document
                    if (this.pendingOverflowByDocument.has(event.document.uri.fsPath)) {
                        this.pendingOverflowByDocument.delete(event.document.uri.fsPath);
                    }

                    // External change: invalidate cache for this specific document
                    const guiTree = this.guiTrees.get(event.document.uri.fsPath);
                    if (guiTree) {
                        guiTree.invalidateCache();
                    }

                    // Debounce refresh to avoid excessive calls during typing
                    if (this.refreshTimeout) {
                        clearTimeout(this.refreshTimeout);
                    }
                    this.refreshTimeout = setTimeout(async () => {
                        await this.refresh();
                        this.refreshTimeout = undefined;
                    }, ConfWizWebview.REFRESH_DEBOUNCE_MS);
                }
            })
        );
    }

    protected async preview(uri: vscode.Uri | undefined): Promise<void> {
        vscode.commands.executeCommand('vscode.openWith', uri, ConfWizWebview.viewType);
    }

    public async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel): Promise<void> {
        // this.document = document;
        const distPathUri = vscode.Uri.joinPath(this.extensionUri, 'dist/views');
        const mediaPathUri = vscode.Uri.joinPath(this.extensionUri, 'media');

        // Allow scripts in the webview
        webviewPanel.webview.options = {
            enableScripts: true,                            // enable scripts in the webview
            localResourceRoots: [distPathUri, mediaPathUri] // restrict extension's local file access
        };

        // Set the HTML content that will fill the webview view
        webviewPanel.webview.html = await this._getWebviewContent(webviewPanel.webview, this.extensionUri);

        // Sets up an event listener to listen for messages passed from the webview view context
        // and executes code based on the message that is received
        const participant = this.messenger.registerWebviewPanel(webviewPanel);
        this._setWebviewMessageListener(webviewPanel, participant, document);
        this.activeDocument = document;
        if (!this.documents.has(document.uri.fsPath)) {
            this.documents.set(document.uri.fsPath, { document, participant });
        }
        // Ensure a dedicated GuiTree instance exists for this document
        if (!this.guiTrees.has(document.uri.fsPath)) {
            this.guiTrees.set(document.uri.fsPath, new GuiTree());
        }

        // Send initial data immediately to avoid race condition where webview
        // renders before receiving data, causing inconsistent UX ("loading" vs "No annotations found")
        const text = document.getText();
        const annotations = this.getAnnotations(text, document.uri.fsPath, document.version);
        this.messenger.sendNotification(setWizardDataType, participant, {
            element: annotations,
            documentPath: document.uri.fsPath,
            noAnnotationsFound: !annotations
        });
    }

    protected async source(): Promise<void> {
        if (this.activeDocument) {
            vscode.window.showTextDocument(this.activeDocument);
        }
    }

    protected _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
        const toolkitUri = webview.asWebviewUri(vscode.Uri.joinPath(
            extensionUri,
            'dist',
            'views',
            'toolkit.min.js'
        ));

        const mainUri = webview.asWebviewUri(vscode.Uri.joinPath(
            extensionUri,
            'dist',
            'views',
            'configWizard.js'
        ));

        const fontAwesomeUri = webview.asWebviewUri(vscode.Uri.joinPath(
            extensionUri,
            'dist',
            'views',
            'css',
            'fontawesome.min.css'
        ));

        const fontAwesomeStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(
            extensionUri,
            'dist',
            'views',
            'css',
            'solid.min.css'
        ));

        // webview.cspSource does not include all CSP sources for VS Code Web
        const webviewUri = webview.asWebviewUri(extensionUri);
        const baseSource = `${webviewUri.scheme}://${webviewUri.authority}`;
        const cspSource = `${webview.cspSource} ${baseSource}`;

        return `
            <!DOCTYPE html>
            <html lang='en'>
                <head>
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <meta http-equiv='Content-Security-Policy' content="default-src 'none'; script-src ${cspSource}; style-src ${cspSource} 'unsafe-inline'; font-src ${cspSource};">
                    <script type='module' src='${toolkitUri}'></script>
                    <script type='module' src='${mainUri}'></script>
                    <link rel='preload' as='style' href='${fontAwesomeUri}' >
                    <link rel='preload' as='style' href='${fontAwesomeStyleUri}' >
                    <link rel='stylesheet' href='${fontAwesomeUri}'>
                    <link rel='stylesheet' href='${fontAwesomeStyleUri}'>
                </head>
                <body>
                    <div id='root'></div>
                </body>
            </html>
        `;
    }

    protected async refresh(): Promise<void> {
        for (const documentTuple of this.documents) {
            const configWizDocument = documentTuple[1];
            await this.refreshDocument(configWizDocument.document);
        }
    }

    private async refreshDocument(document: vscode.TextDocument): Promise<void> {
        const configWizDocument = this.documents.get(document.uri.fsPath);
        if (!configWizDocument) return;

        const text = document.getText();
        const documentPath = document.uri.fsPath;
        const annotations = this.getAnnotations(text, documentPath, document.version);
        this.messenger.sendNotification(setWizardDataType, configWizDocument.participant, {
            element: annotations,
            documentPath: documentPath,
            noAnnotationsFound: !annotations
        });
    }

    protected _setWebviewMessageListener(webview: vscode.WebviewPanel, participant: WebviewIdMessageParticipant, document: vscode.TextDocument): void {
        const disposables = [
            this.messenger.onNotification(readyType, () => this.refresh(), { sender: participant }),
            this.messenger.onNotification(saveElement, this.saveElement.bind(this), { sender: participant }),
            this.messenger.onNotification(markDocumentDirty, this.markDocumentDirty.bind(this), { sender: participant }),
            this.messenger.onNotification(logMessageType, message => console.info(message), { sender: participant }),
        ];

        webview.onDidDispose(() => {
            if (this.documents.has(document.uri.fsPath)) {
                this.documents.delete(document.uri.fsPath);
            }
            // Clean up the dedicated GuiTree instance for this document
            if (this.guiTrees.has(document.uri.fsPath)) {
                this.guiTrees.delete(document.uri.fsPath);
            }
            if (this.pendingOverflowByDocument.has(document.uri.fsPath)) {
                this.pendingOverflowByDocument.delete(document.uri.fsPath);
            }
            disposables.forEach(disposible => disposible.dispose());

            // Clear pending refresh timeout to prevent memory leaks
            if (this.refreshTimeout) {
                clearTimeout(this.refreshTimeout);
                this.refreshTimeout = undefined;
            }
        });
        webview.onDidChangeViewState((event: vscode.WebviewPanelOnDidChangeViewStateEvent) => this.viewStateChanged(event, document));
    }

    private viewStateChanged(event: vscode.WebviewPanelOnDidChangeViewStateEvent, document: vscode.TextDocument) {
        const configWizDocument = this.documents.get(document.uri.fsPath);
        if (configWizDocument) {
            this.messenger.sendNotification(setPanelActiveType, configWizDocument.participant, { active: event.webviewPanel.active });
        }

        if (event.webviewPanel.active) {
            this.activeDocument = document;
        } else if (this.activeDocument && this.activeDocument.uri.path === document.uri.path) {
            this.activeDocument = undefined;
        }
    }

    private markDocumentDirty(data: { documentPath: string }) {
        if (!this.documents.has(data.documentPath)) {
            return;
        }

        const configWizDocument = this.documents.get(data.documentPath);
        if (!configWizDocument) {
            return;
        }

        // Create a minimal edit to mark the document as dirty
        // We replace a single character at the end with itself
        // This creates actual undo history, marking the document dirty
        const edit = new vscode.WorkspaceEdit();
        const document = configWizDocument.document;
        const lastLine = document.lineCount - 1;
        const lastLineText = document.lineAt(lastLine).text;
        const lastChar = lastLineText.length;
        const endPosition = new vscode.Position(lastLine, lastChar);

        // Replace end position with empty string (no-op that still triggers dirty state)
        edit.replace(document.uri, new vscode.Range(endPosition, endPosition), '');

        // Mark as GUI edit to prevent cache invalidation
        this.isGuiEdit = true;
        vscode.workspace.applyEdit(edit).then(() => {
            this.isGuiEdit = false;
        }, () => {
            this.isGuiEdit = false;
        });
    }

    private async saveElement(configWizardData: ConfigWizardData) {
        if (!this.documents.has(configWizardData.documentPath)) {
            console.error(`[ConfigWizard] Cannot save element: document not found for path ${configWizardData.documentPath}`);
            vscode.window.showErrorMessage('Failed to save configuration: The document is not currently open. Please reopen the file and try again.');
            return;
        }

        const configWizDocument = this.documents.get(configWizardData.documentPath);
        if (!configWizDocument) {
            console.error(`[ConfigWizard] Cannot save element: document entry is undefined for path ${configWizardData.documentPath}`);
            vscode.window.showErrorMessage('Failed to save configuration: Internal error accessing document. Please reopen the file.');
            return;
        }

        const guiTree = this.guiTrees.get(configWizardData.documentPath);
        if (!guiTree) {
            console.error(`[ConfigWizard] Cannot save element: GuiTree not initialized for document ${configWizardData.documentPath}. This may indicate a race condition during initialization.`);
            vscode.window.showErrorMessage('Failed to save configuration: The editor is still initializing. Please wait a moment and try again.');
            return;
        }

        const docText = configWizDocument.document.getText();
        if (guiTree.saveElement(docText, configWizardData.element, configWizDocument.document.version)) { // must update
            this.updatePendingOverflow(configWizardData.documentPath, guiTree, configWizardData.element);
            await this.save(configWizardData.element, configWizDocument.document);
            // BUGFIX #476: Refresh after GUI edit to update editRect and all cached state from file
            // Without this, editRect points to stale positions, causing incorrect replacements
            await this.refreshDocument(configWizDocument.document);
        }
    }

    protected getAnnotations(text: string, documentPath: string, docVersion?: number): TreeNodeElement | undefined {
        let guiTree = this.guiTrees.get(documentPath);
        if (!guiTree) {
            // Create GuiTree on-demand if missing (handles race conditions)
            guiTree = new GuiTree();
            this.guiTrees.set(documentPath, guiTree);
        }
        const root = guiTree.getAll(text, docVersion);
        if (root) {
            this.applyPendingOverflow(documentPath, root);
        }
        return root;
    }

    private updatePendingOverflow(documentPath: string, guiTree: GuiTree, element: TreeNodeElement): void {
        const item = guiTree.getFromItemMap(element.guiId);
        if (!(item instanceof CwOption) || !item.isDropdown || !item.bitfield.isValid()) {
            this.clearPendingOverflow(documentPath, element);
            return;
        }

        const selectedLabel = element.newValue?.value ?? element.value?.value;
        if (!selectedLabel) {
            this.clearPendingOverflow(documentPath, element);
            return;
        }

        const option = item.getOptionFromGui(selectedLabel);
        if (!option || !(option.value instanceof NumberType)) {
            this.clearPendingOverflow(documentPath, element);
            return;
        }

        const selectedValue = option.value.val;
        const maxValue = item.bitfield.getMaxValue();
        if (selectedValue <= maxValue) {
            this.clearPendingOverflow(documentPath, element);
            return;
        }

        const key = this.getOverflowKey(element);
        if (!key) {
            this.clearPendingOverflow(documentPath, element);
            return;
        }

        const pending: PendingOverflow = {
            selectedLabel,
            overflowValue: selectedValue,
            extractedValue: selectedValue,
            bitWidth: item.bitfield.getBitWidth()
        };

        let pendingMap = this.pendingOverflowByDocument.get(documentPath);
        if (!pendingMap) {
            pendingMap = new Map<string, PendingOverflow>();
            this.pendingOverflowByDocument.set(documentPath, pendingMap);
        }
        pendingMap.set(key, pending);
    }

    private clearPendingOverflow(documentPath: string, element: TreeNodeElement): void {
        const pendingMap = this.pendingOverflowByDocument.get(documentPath);
        if (!pendingMap) {
            return;
        }
        const key = this.getOverflowKey(element);
        if (!key) {
            return;
        }
        pendingMap.delete(key);
        if (pendingMap.size === 0) {
            this.pendingOverflowByDocument.delete(documentPath);
        }
    }

    private applyPendingOverflow(documentPath: string, root: TreeNodeElement): void {
        const pendingMap = this.pendingOverflowByDocument.get(documentPath);
        if (!pendingMap || pendingMap.size === 0) {
            return;
        }

        const visit = (node: TreeNodeElement): void => {
            const key = this.getOverflowKey(node);
            const pending = key ? pendingMap.get(key) : undefined;
            if (pending) {
                node.value.overflow = true;
                node.value.overflowValue = pending.overflowValue;
                node.value.extractedValue = pending.extractedValue;
                node.value.bitWidth = pending.bitWidth;
                node.value.value = pending.selectedLabel;
            }

            if (node.children) {
                for (const child of node.children) {
                    visit(child);
                }
            }
        };

        visit(root);
    }

    private getOverflowKey(element: TreeNodeElement): string | undefined {
        const editRect = element.value.editRect;
        if (!editRect) {
            return undefined;
        }

        const name = element.name ?? '';
        const line = editRect.line;
        const start = editRect.col.start;
        const end = editRect.col.end;
        return `${name}:${line}:${start}:${end}`;
    }

    protected async save(element: TreeNodeElement, document: vscode.TextDocument): Promise<void> {
        if (!document) {
            return;
        }

        const editRect = element.value.editRect;
        const editText = element.newValue.editStr ?? element.newValue.value;

        if (editRect == undefined || editText == undefined) {
            return;
        }

        const edit = new vscode.WorkspaceEdit();
        const multiEditArr = element.newValue.multiEdit;
        if (multiEditArr === undefined) {
            edit.replace(
                document.uri,
                new vscode.Range(editRect.line, editRect.col.start, editRect.line, editRect.col.end),
                editText
            );
        } else {
            for (const multiEdit of multiEditArr) {
                edit.replace(
                    document.uri,
                    new vscode.Range(multiEdit.editRect.line, multiEdit.editRect.col.start, multiEdit.editRect.line, multiEdit.editRect.col.end),
                    multiEdit.text
                );
            }
        }

        // Mark as GUI edit to prevent cache invalidation in onDidChangeTextDocument
        this.isGuiEdit = true;
        try {
            await vscode.workspace.applyEdit(edit);
        } finally {
            // Reset flag after edit completes
            this.isGuiEdit = false;
        }
    }
}
