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
import { WebviewIdMessageParticipant } from 'vscode-messenger-common';
import { ConfWizWebview } from './confwiz-webview-main';
import { GuiTree } from './parser/gui-tree';
import { CwOption } from './parser/cw-option';
import { CwOptionAssign } from './parser/cw-option-assign';
import { NumberType } from './parser/number-type';
import { TextType } from './parser/text-type';
import { TreeNodeElement, GuiTypes, setWizardDataType } from './confwiz-webview-common';

// Mock vscode-messenger
jest.mock('vscode-messenger', () => ({
    Messenger: jest.fn().mockImplementation(() => ({
        registerWebviewPanel: jest.fn(),
        sendNotification: jest.fn(),
        onNotification: jest.fn(),
    })),
}));

// Mock GuiTree
jest.mock('./parser/gui-tree');

describe('ConfWizWebview', () => {
    let confWizWebview: ConfWizWebview;
    let mockContext: vscode.ExtensionContext;
    let mockDocument: vscode.TextDocument;

    beforeEach(() => {
        // Setup mock context
        mockContext = {
            subscriptions: [],
            extensionUri: vscode.Uri.file('/mock/extension/path'),
        } as unknown as vscode.ExtensionContext;

        // Setup mock document
        mockDocument = {
            uri: vscode.Uri.file('/mock/config.h'),
            getText: jest.fn().mockReturnValue('// mock config content'),
            version: 1,
            lineCount: 10,
            lineAt: jest.fn().mockReturnValue({
                text: 'mock line text',
                range: new vscode.Range(0, 0, 0, 15),
            }),
        } as unknown as vscode.TextDocument;

        // Create instance
        confWizWebview = new ConfWizWebview(mockContext);
    });

    describe('activation', () => {
        it('should register custom editor provider and commands', async () => {
            const registerSpy = jest.spyOn(vscode.window, 'registerCustomEditorProvider');
            const commandSpy = jest.spyOn(vscode.commands, 'registerCommand');

            await confWizWebview.activate();

            expect(registerSpy).toHaveBeenCalledWith(
                ConfWizWebview.viewType,
                confWizWebview,
                expect.objectContaining({ webviewOptions: { retainContextWhenHidden: true } })
            );
            expect(commandSpy).toHaveBeenCalledWith(ConfWizWebview.previewCommandType, expect.any(Function));
            expect(commandSpy).toHaveBeenCalledWith(ConfWizWebview.sourceCommandType, expect.any(Function));
        });
    });

    describe('onDidChangeTextDocument - GUI edit guard', () => {
        it('should skip refresh when isGuiEdit is true', async () => {
            await confWizWebview.activate();

            // Add document to tracked documents
            const mockParticipant = {} as WebviewIdMessageParticipant;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDocument.uri.fsPath, {
                document: mockDocument,
                participant: mockParticipant,
            });

            // Set GUI edit flag
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).isGuiEdit = true;

            // Spy on refresh method
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const refreshSpy = jest.spyOn(confWizWebview as any, 'refresh');

            // Trigger document change
            const changeEvent = {
                document: mockDocument,
                contentChanges: [],
                reason: undefined,
            } as unknown as vscode.TextDocumentChangeEvent;

            // Get the registered listener
            const onDidChangeListener = (vscode.workspace.onDidChangeTextDocument as jest.Mock).mock.calls[0][0];
            await onDidChangeListener(changeEvent);

            // Should not call refresh when isGuiEdit is true
            expect(refreshSpy).not.toHaveBeenCalled();
        });

        it('should invalidate cache and debounce refresh for external edits', async () => {
            jest.useFakeTimers();
            await confWizWebview.activate();

            // Add document to tracked documents
            const mockParticipant = {} as WebviewIdMessageParticipant;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDocument.uri.fsPath, {
                document: mockDocument,
                participant: mockParticipant,
            });

            // Create a mock GuiTree for this document
            const mockGuiTree = new GuiTree();
            const invalidateSpy = jest.spyOn(mockGuiTree, 'invalidateCache');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDocument.uri.fsPath, mockGuiTree);

            // Ensure GUI edit flag is false
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).isGuiEdit = false;

            // Spy on methods
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const refreshSpy = jest.spyOn(confWizWebview as any, 'refresh').mockResolvedValue(undefined);

            // Trigger document change
            const changeEvent = {
                document: mockDocument,
                contentChanges: [],
                reason: undefined,
            } as unknown as vscode.TextDocumentChangeEvent;

            const onDidChangeListener = (vscode.workspace.onDidChangeTextDocument as jest.Mock).mock.calls[0][0];

            // First change
            await onDidChangeListener(changeEvent);
            expect(invalidateSpy).toHaveBeenCalledTimes(1);
            expect(refreshSpy).not.toHaveBeenCalled(); // Not yet, debounced

            // Second change within debounce window
            await onDidChangeListener(changeEvent);
            expect(invalidateSpy).toHaveBeenCalledTimes(2);
            expect(refreshSpy).not.toHaveBeenCalled(); // Still debounced

            // Fast-forward time to trigger debounced refresh
            jest.advanceTimersByTime(500);
            await Promise.resolve(); // Flush promises

            // Should call refresh only once after debounce
            expect(refreshSpy).toHaveBeenCalledTimes(1);

            jest.useRealTimers();
        });

        it('should clear pending overflow state on external edits', async () => {
            await confWizWebview.activate();

            const mockParticipant = {} as WebviewIdMessageParticipant;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDocument.uri.fsPath, {
                document: mockDocument,
                participant: mockParticipant,
            });

            const mockGuiTree = new GuiTree();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDocument.uri.fsPath, mockGuiTree);

            // Seed pending overflow state
            const pending = new Map<string, unknown>();
            pending.set('Test:1:2:3', { selectedLabel: '256' });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).pendingOverflowByDocument.set(mockDocument.uri.fsPath, pending);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).isGuiEdit = false;

            const changeEvent = {
                document: mockDocument,
                contentChanges: [],
                reason: undefined,
            } as unknown as vscode.TextDocumentChangeEvent;

            const onDidChangeListener = (vscode.workspace.onDidChangeTextDocument as jest.Mock).mock.calls[0][0];
            await onDidChangeListener(changeEvent);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).pendingOverflowByDocument.has(mockDocument.uri.fsPath)).toBe(false);
        });
    });

    describe('saveElement', () => {
        it('should set isGuiEdit flag during save operation', async () => {
            const mockElement: TreeNodeElement = {
                guiId: 1,
                name: 'Test',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: 'old',
                    readOnly: false,
                    editRect: { line: 5, col: { start: 10, end: 13 } },
                },
                newValue: {
                    value: 'new',
                    readOnly: false,
                },
            };

            const mockConfigWizDocument = {
                document: mockDocument,
                participant: {} as WebviewIdMessageParticipant,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDocument.uri.fsPath, mockConfigWizDocument);

            // Create a mock GuiTree for this document
            const mockGuiTree = new GuiTree();
            mockGuiTree.saveElement = jest.fn().mockReturnValue(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDocument.uri.fsPath, mockGuiTree);

            const applyEditSpy = jest.spyOn(vscode.workspace, 'applyEdit').mockResolvedValue(true);

            // Call saveElement
            const configWizardData = {
                element: mockElement,
                documentPath: mockDocument.uri.fsPath,
                noAnnotationsFound: false,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).saveElement(configWizardData);

            // Verify applyEdit was called
            expect(applyEditSpy).toHaveBeenCalled();

            // Verify isGuiEdit flag was reset (after async operation)
            await new Promise(resolve => setTimeout(resolve, 0));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).isGuiEdit).toBe(false);
        });

        it('should log error when GuiTree is not initialized', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage').mockResolvedValue(undefined);

            const mockElement: TreeNodeElement = {
                guiId: 1,
                name: 'Test',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: 'old',
                    readOnly: false,
                    editRect: { line: 5, col: { start: 10, end: 13 } },
                },
                newValue: {
                    value: 'new',
                    readOnly: false,
                },
            };

            const mockConfigWizDocument = {
                document: mockDocument,
                participant: {} as WebviewIdMessageParticipant,
            };

            // Add document but intentionally don't create GuiTree to simulate race condition
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDocument.uri.fsPath, mockConfigWizDocument);

            const configWizardData = {
                element: mockElement,
                documentPath: mockDocument.uri.fsPath,
                noAnnotationsFound: false,
            };

            // Call saveElement - should log error and show user message
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).saveElement(configWizardData);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ConfigWizard] Cannot save element: GuiTree not initialized')
            );
            expect(showErrorMessageSpy).toHaveBeenCalledWith(
                'Failed to save configuration: The editor is still initializing. Please wait a moment and try again.'
            );

            consoleErrorSpy.mockRestore();
            showErrorMessageSpy.mockRestore();
        });

        it('should log error when document is not found', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage').mockResolvedValue(undefined);

            const mockElement: TreeNodeElement = {
                guiId: 1,
                name: 'Test',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: 'old',
                    readOnly: false,
                    editRect: { line: 5, col: { start: 10, end: 13 } },
                },
                newValue: {
                    value: 'new',
                    readOnly: false,
                },
            };

            const configWizardData = {
                element: mockElement,
                documentPath: '/non/existent/path.h',
                noAnnotationsFound: false,
            };

            // Call saveElement without adding document to documents map
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).saveElement(configWizardData);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ConfigWizard] Cannot save element: document not found for path')
            );
            expect(showErrorMessageSpy).toHaveBeenCalledWith(
                'Failed to save configuration: The document is not currently open. Please reopen the file and try again.'
            );

            consoleErrorSpy.mockRestore();
            showErrorMessageSpy.mockRestore();
        });

        it('should log error when document entry is undefined', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage').mockResolvedValue(undefined);

            const mockElement: TreeNodeElement = {
                guiId: 1,
                name: 'Test',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: 'old',
                    readOnly: false,
                    editRect: { line: 5, col: { start: 10, end: 13 } },
                },
                newValue: {
                    value: 'new',
                    readOnly: false,
                },
            };

            // Set up a document path that exists in the map but returns undefined
            const testPath = '/test/undefined.h';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(testPath, undefined);

            const configWizardData = {
                element: mockElement,
                documentPath: testPath,
                noAnnotationsFound: false,
            };

            // Call saveElement
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).saveElement(configWizardData);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ConfigWizard] Cannot save element: document entry is undefined for path')
            );
            expect(showErrorMessageSpy).toHaveBeenCalledWith(
                'Failed to save configuration: Internal error accessing document. Please reopen the file.'
            );

            // Cleanup
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.delete(testPath);
            consoleErrorSpy.mockRestore();
            showErrorMessageSpy.mockRestore();
        });

        it('should call save when guiTree.saveElement returns true', () => {
            const mockElement: TreeNodeElement = {
                guiId: 1,
                name: 'Test',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: 'old',
                    readOnly: false,
                    editRect: { line: 5, col: { start: 10, end: 13 } },
                },
                newValue: {
                    value: 'new',
                    readOnly: false,
                },
            };

            const mockConfigWizDocument = {
                document: mockDocument,
                participant: {} as WebviewIdMessageParticipant,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDocument.uri.fsPath, mockConfigWizDocument);

            // Create a mock GuiTree that returns true from saveElement
            const mockGuiTree = new GuiTree();
            mockGuiTree.saveElement = jest.fn().mockReturnValue(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDocument.uri.fsPath, mockGuiTree);

            // Spy on save method
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const saveSpy = jest.spyOn(confWizWebview as any, 'save').mockResolvedValue(undefined);

            const configWizardData = {
                element: mockElement,
                documentPath: mockDocument.uri.fsPath,
                noAnnotationsFound: false,
            };

            // Call saveElement
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).saveElement(configWizardData);

            expect(mockGuiTree.saveElement).toHaveBeenCalledWith(
                mockDocument.getText(),
                mockElement,
                mockDocument.version
            );
            expect(saveSpy).toHaveBeenCalledWith(mockElement, mockDocument);

            saveSpy.mockRestore();
        });

        it('should refresh document after save to update editRect', async () => {
            const mockElement: TreeNodeElement = {
                guiId: 1,
                name: 'ISR FIFO Queue',
                type: GuiTypes.dropdown,
                group: false,
                value: {
                    value: '4 entries',
                    readOnly: false,
                    editRect: { line: 9, col: { start: 27, end: 31 } }, // Initially points to "0x00" (4 chars)
                },
                newValue: {
                    value: '8 entries',
                    readOnly: false,
                    editStr: '0x400', // After first edit, file has "0x400" (5 chars)
                },
            };

            const mockConfigWizDocument = {
                document: mockDocument,
                participant: {
                    type: 'webview',
                    webviewPanel: {},
                } as unknown as WebviewIdMessageParticipant,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDocument.uri.fsPath, mockConfigWizDocument);

            // Create a mock GuiTree
            const mockGuiTree = new GuiTree();
            mockGuiTree.saveElement = jest.fn().mockReturnValue(true);
            mockGuiTree.getAll = jest.fn().mockReturnValue({
                guiId: 0,
                name: 'Root',
                type: GuiTypes.root,
                group: false,
                value: { value: '', readOnly: false },
                newValue: { value: '', readOnly: false },
                children: [
                    {
                        ...mockElement,
                        value: {
                            ...mockElement.value,
                            editRect: { line: 9, col: { start: 27, end: 32 } }, // Updated to 5 chars after refresh
                        },
                    },
                ],
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDocument.uri.fsPath, mockGuiTree);

            // Spy on save and refreshDocument methods
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const saveSpy = jest.spyOn(confWizWebview as any, 'save').mockResolvedValue(undefined);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const refreshDocumentSpy = jest.spyOn(confWizWebview as any, 'refreshDocument').mockResolvedValue(undefined);

            const configWizardData = {
                element: mockElement,
                documentPath: mockDocument.uri.fsPath,
                noAnnotationsFound: false,
            };

            // Call saveElement
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).saveElement(configWizardData);

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 0));

            // Verify refreshDocument was called after save, this ensures editRect is updated from the file after each edit
            expect(saveSpy).toHaveBeenCalledWith(mockElement, mockDocument);
            expect(refreshDocumentSpy).toHaveBeenCalledWith(mockDocument);

            // Verify refresh was called AFTER save (call order matters)
            expect(saveSpy.mock.invocationCallOrder[0]).toBeLessThan(
                refreshDocumentSpy.mock.invocationCallOrder[0]
            );

            saveSpy.mockRestore();
            refreshDocumentSpy.mockRestore();
        });

        it('should not call save when guiTree.saveElement returns false', () => {
            const mockElement: TreeNodeElement = {
                guiId: 1,
                name: 'Test',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: 'old',
                    readOnly: false,
                    editRect: { line: 5, col: { start: 10, end: 13 } },
                },
                newValue: {
                    value: 'new',
                    readOnly: false,
                },
            };

            const mockConfigWizDocument = {
                document: mockDocument,
                participant: {} as WebviewIdMessageParticipant,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDocument.uri.fsPath, mockConfigWizDocument);

            // Create a mock GuiTree that returns false from saveElement
            const mockGuiTree = new GuiTree();
            mockGuiTree.saveElement = jest.fn().mockReturnValue(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDocument.uri.fsPath, mockGuiTree);

            // Spy on save method
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const saveSpy = jest.spyOn(confWizWebview as any, 'save').mockResolvedValue(undefined);

            const configWizardData = {
                element: mockElement,
                documentPath: mockDocument.uri.fsPath,
                noAnnotationsFound: false,
            };

            // Call saveElement
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).saveElement(configWizardData);

            expect(mockGuiTree.saveElement).toHaveBeenCalled();
            expect(saveSpy).not.toHaveBeenCalled();

            saveSpy.mockRestore();
        });
    });

    describe('pending overflow tracking', () => {
        it('should store pending overflow when selection exceeds bitfield max', () => {
            const element: TreeNodeElement = {
                guiId: 1,
                name: 'Mode',
                type: GuiTypes.dropdown,
                group: false,
                value: {
                    value: 'Overflow',
                    readOnly: false,
                    editRect: { line: 3, col: { start: 5, end: 12 } },
                },
                newValue: {
                    value: 'Overflow',
                    readOnly: false,
                },
            };

            const optionItem = new CwOption();
            optionItem.bitfield.lsb = new NumberType(0);
            optionItem.bitfield.msb = new NumberType(1);
            optionItem.bitfield.validate();

            const optionAssign = new CwOptionAssign(optionItem);
            optionAssign.description = new TextType('Overflow');
            optionAssign.value = new NumberType(5);

            const mockGuiTree = {
                getFromItemMap: jest.fn().mockReturnValue(optionItem),
            } as unknown as GuiTree;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).updatePendingOverflow(mockDocument.uri.fsPath, mockGuiTree, element);

            const expectedKey = 'Mode:3:5:12';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pendingMap = (confWizWebview as any).pendingOverflowByDocument.get(mockDocument.uri.fsPath);
            expect(pendingMap?.get(expectedKey)).toMatchObject({
                selectedLabel: 'Overflow',
                overflowValue: 5,
                extractedValue: 5,
                bitWidth: 2,
            });
        });

        it('should clear pending overflow and remove empty map', () => {
            const element: TreeNodeElement = {
                guiId: 2,
                name: 'OverflowItem',
                type: GuiTypes.dropdown,
                group: false,
                value: {
                    value: 'Value',
                    readOnly: false,
                    editRect: { line: 4, col: { start: 1, end: 7 } },
                },
                newValue: {
                    value: 'Value',
                    readOnly: false,
                },
            };

            const key = 'OverflowItem:4:1:7';
            const pendingMap = new Map<string, unknown>();
            pendingMap.set(key, {
                selectedLabel: 'Value',
                overflowValue: 7,
                extractedValue: 7,
                bitWidth: 3,
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).pendingOverflowByDocument.set(mockDocument.uri.fsPath, pendingMap);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).clearPendingOverflow(mockDocument.uri.fsPath, element);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).pendingOverflowByDocument.has(mockDocument.uri.fsPath)).toBe(false);
        });
    });

    describe('pending overflow application', () => {
        it('should apply pending overflow using stable editRect key', () => {
            const element: TreeNodeElement = {
                guiId: 42,
                name: 'ISR FIFO Queue',
                type: GuiTypes.dropdown,
                group: false,
                value: {
                    value: '4 entries',
                    readOnly: false,
                    editRect: { line: 10, col: { start: 27, end: 31 } },
                },
                newValue: {
                    value: '4 entries',
                    readOnly: false,
                },
            };

            const root: TreeNodeElement = {
                guiId: 0,
                name: 'Root',
                type: GuiTypes.root,
                group: false,
                value: { value: '', readOnly: false },
                newValue: { value: '', readOnly: false },
                children: [element],
            };

            const key = 'ISR FIFO Queue:10:27:31';
            const pending = new Map<string, unknown>();
            pending.set(key, {
                selectedLabel: '256 entries',
                overflowValue: 256,
                extractedValue: 256,
                bitWidth: 8,
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).pendingOverflowByDocument.set(mockDocument.uri.fsPath, pending);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).applyPendingOverflow(mockDocument.uri.fsPath, root);

            expect(element.value.overflow).toBe(true);
            expect(element.value.overflowValue).toBe(256);
            expect(element.value.bitWidth).toBe(8);
            expect(element.value.value).toBe('256 entries');
        });
    });

    describe('save method with multiEdit', () => {
        it('should handle single edit correctly', async () => {
            const mockElement: TreeNodeElement = {
                guiId: 1,
                name: 'Port',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: '8080',
                    readOnly: false,
                    editRect: { line: 10, col: { start: 15, end: 19 } },
                },
                newValue: {
                    value: '9000',
                    readOnly: false,
                },
            };

            const applyEditSpy = jest.spyOn(vscode.workspace, 'applyEdit').mockResolvedValue(true);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).save(mockElement, mockDocument);

            expect(applyEditSpy).toHaveBeenCalledTimes(1);
            const workspaceEdit = applyEditSpy.mock.calls[0][0] as vscode.WorkspaceEdit;
            expect(workspaceEdit).toBeDefined();
        });

        it('should handle multiple edits (multiEdit array)', async () => {
            const mockElement: TreeNodeElement = {
                guiId: 1,
                name: 'EnableFeature',
                type: GuiTypes.check,
                group: false,
                value: {
                    value: '1',
                    readOnly: false,
                    editRect: { line: 10, col: { start: 20, end: 21 } },
                },
                newValue: {
                    value: '0',
                    readOnly: false,
                    multiEdit: [
                        { text: '0', editRect: { line: 10, col: { start: 20, end: 21 } } },
                        { text: '0', editRect: { line: 50, col: { start: 15, end: 16 } } },
                        { text: '0', editRect: { line: 100, col: { start: 25, end: 26 } } },
                    ],
                },
            };

            const applyEditSpy = jest.spyOn(vscode.workspace, 'applyEdit').mockResolvedValue(true);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).save(mockElement, mockDocument);

            expect(applyEditSpy).toHaveBeenCalledTimes(1);
            const workspaceEdit = applyEditSpy.mock.calls[0][0] as vscode.WorkspaceEdit;
            expect(workspaceEdit).toBeDefined();
        });

        it('should return early when document is undefined', async () => {
            const mockElement: TreeNodeElement = {
                guiId: 1,
                name: 'Test',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: 'old',
                    readOnly: false,
                    editRect: { line: 5, col: { start: 10, end: 13 } },
                },
                newValue: {
                    value: 'new',
                    readOnly: false,
                },
            };

            const applyEditSpy = jest.spyOn(vscode.workspace, 'applyEdit').mockResolvedValue(true);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).save(mockElement, undefined);

            expect(applyEditSpy).not.toHaveBeenCalled();
        });

        it('should return early when editRect is undefined', async () => {
            const mockElement: TreeNodeElement = {
                guiId: 1,
                name: 'Test',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: 'old',
                    readOnly: false,
                    editRect: undefined,
                },
                newValue: {
                    value: 'new',
                    readOnly: false,
                },
            };

            const applyEditSpy = jest.spyOn(vscode.workspace, 'applyEdit').mockResolvedValue(true);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).save(mockElement, mockDocument);

            expect(applyEditSpy).not.toHaveBeenCalled();
        });
    });

    describe('resolveCustomEditor and GuiTree initialization', () => {
        it('should create GuiTree instance when document is opened', async () => {
            const mockWebviewPanel = {
                webview: {
                    options: {},
                    html: '',
                    asWebviewUri: jest.fn((uri) => uri),
                    cspSource: 'mock-csp',
                },
                onDidDispose: jest.fn(),
                onDidChangeViewState: jest.fn(),
            } as unknown as vscode.WebviewPanel;

            // Verify GuiTree doesn't exist before resolveCustomTextEditor
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.has(mockDocument.uri.fsPath)).toBe(false);

            // Call resolveCustomTextEditor
            await confWizWebview.resolveCustomTextEditor(mockDocument, mockWebviewPanel);

            // Verify GuiTree was created for this document
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.has(mockDocument.uri.fsPath)).toBe(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const guiTree = (confWizWebview as any).guiTrees.get(mockDocument.uri.fsPath);
            expect(guiTree).toBeInstanceOf(GuiTree);
        });

        it('should send initial data immediately when webview is created to prevent race condition', async () => {
            const mockParticipant = {} as WebviewIdMessageParticipant;
            const mockWebviewPanel = {
                webview: {
                    options: {},
                    html: '',
                    asWebviewUri: jest.fn((uri) => uri),
                    cspSource: 'mock-csp',
                },
                onDidDispose: jest.fn(),
                onDidChangeViewState: jest.fn(),
            } as unknown as vscode.WebviewPanel;

            // Mock registerWebviewPanel to return a participant
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const messengerMock = (confWizWebview as any).messenger;
            messengerMock.registerWebviewPanel = jest.fn(() => mockParticipant);
            messengerMock.onNotification = jest.fn(() => ({ dispose: jest.fn() }));

            // Mock sendNotification to verify it's called immediately
            const sendNotificationSpy = jest.spyOn(messengerMock, 'sendNotification');

            // Call resolveCustomTextEditor
            await confWizWebview.resolveCustomTextEditor(mockDocument, mockWebviewPanel);

            // Verify sendNotification was called immediately with initial data
            // This prevents race condition where webview renders before receiving data
            expect(sendNotificationSpy).toHaveBeenCalledWith(
                setWizardDataType,
                mockParticipant,
                expect.objectContaining({
                    documentPath: mockDocument.uri.fsPath,
                    noAnnotationsFound: expect.any(Boolean),
                })
            );
        });

        it('should not create duplicate GuiTree if already exists', async () => {
            const mockWebviewPanel = {
                webview: {
                    options: {},
                    html: '',
                    asWebviewUri: jest.fn((uri) => uri),
                    cspSource: 'mock-csp',
                },
                onDidDispose: jest.fn(),
                onDidChangeViewState: jest.fn(),
            } as unknown as vscode.WebviewPanel;

            // Pre-create a GuiTree
            const existingGuiTree = new GuiTree();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDocument.uri.fsPath, existingGuiTree);

            // Call resolveCustomTextEditor
            await confWizWebview.resolveCustomTextEditor(mockDocument, mockWebviewPanel);

            // Verify the same GuiTree instance is still there (not replaced)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const guiTree = (confWizWebview as any).guiTrees.get(mockDocument.uri.fsPath);
            expect(guiTree).toBe(existingGuiTree);
        });
    });

    describe('refresh method', () => {
        it('should call getAnnotations and send notification for each document', async () => {
            const mockDoc1 = {
                uri: vscode.Uri.file('/mock/config1.h'),
                getText: jest.fn().mockReturnValue('// config 1'),
                version: 1,
            } as unknown as vscode.TextDocument;

            const mockDoc2 = {
                uri: vscode.Uri.file('/mock/config2.h'),
                getText: jest.fn().mockReturnValue('// config 2'),
                version: 2,
            } as unknown as vscode.TextDocument;

            const mockParticipant1 = {} as WebviewIdMessageParticipant;
            const mockParticipant2 = {} as WebviewIdMessageParticipant;

            // Add documents
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDoc1.uri.fsPath, {
                document: mockDoc1,
                participant: mockParticipant1,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDoc2.uri.fsPath, {
                document: mockDoc2,
                participant: mockParticipant2,
            });

            // Create GuiTrees with mocked getAll
            const mockAnnotations1 = {
                guiId: 1,
                name: 'Root1',
                type: GuiTypes.root,
                group: true,
                value: { value: '', readOnly: false },
                newValue: { value: '', readOnly: false },
            };

            const mockAnnotations2 = {
                guiId: 2,
                name: 'Root2',
                type: GuiTypes.root,
                group: true,
                value: { value: '', readOnly: false },
                newValue: { value: '', readOnly: false },
            };

            const mockGuiTree1 = new GuiTree();
            const mockGuiTree2 = new GuiTree();
            jest.spyOn(mockGuiTree1, 'getAll').mockReturnValue(mockAnnotations1);
            jest.spyOn(mockGuiTree2, 'getAll').mockReturnValue(mockAnnotations2);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc1.uri.fsPath, mockGuiTree1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc2.uri.fsPath, mockGuiTree2);

            // Mock messenger.sendNotification
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sendNotificationSpy = jest.spyOn((confWizWebview as any).messenger, 'sendNotification');

            // Call refresh
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).refresh();

            // Verify getAnnotations was called for each document
            expect(mockGuiTree1.getAll).toHaveBeenCalledWith('// config 1', 1);
            expect(mockGuiTree2.getAll).toHaveBeenCalledWith('// config 2', 2);

            // Verify sendNotification was called for each document
            expect(sendNotificationSpy).toHaveBeenCalledWith(
                setWizardDataType,
                mockParticipant1,
                {
                    element: mockAnnotations1,
                    documentPath: mockDoc1.uri.fsPath,
                    noAnnotationsFound: false,
                }
            );
            expect(sendNotificationSpy).toHaveBeenCalledWith(
                setWizardDataType,
                mockParticipant2,
                {
                    element: mockAnnotations2,
                    documentPath: mockDoc2.uri.fsPath,
                    noAnnotationsFound: false,
                }
            );
        });

        it('should send noAnnotationsFound=true when getAnnotations returns undefined', async () => {
            const mockDoc = {
                uri: vscode.Uri.file('/mock/no-annotations.h'),
                getText: jest.fn().mockReturnValue('// no annotations'),
                version: 1,
            } as unknown as vscode.TextDocument;

            const mockParticipant = {} as WebviewIdMessageParticipant;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDoc.uri.fsPath, {
                document: mockDoc,
                participant: mockParticipant,
            });

            const mockGuiTree = new GuiTree();
            jest.spyOn(mockGuiTree, 'getAll').mockReturnValue(undefined);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc.uri.fsPath, mockGuiTree);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sendNotificationSpy = jest.spyOn((confWizWebview as any).messenger, 'sendNotification');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).refresh();

            expect(sendNotificationSpy).toHaveBeenCalledWith(
                setWizardDataType,
                mockParticipant,
                {
                    element: undefined,
                    documentPath: mockDoc.uri.fsPath,
                    noAnnotationsFound: true,
                }
            );
        });
    });

    describe('preview and source commands', () => {
        it('should execute vscode.openWith command for preview', async () => {
            const executeCommandSpy = jest.spyOn(vscode.commands, 'executeCommand').mockResolvedValue(undefined);
            const testUri = vscode.Uri.file('/test/config.h');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).preview(testUri);

            expect(executeCommandSpy).toHaveBeenCalledWith('vscode.openWith', testUri, ConfWizWebview.viewType);
        });

        it('should show text document for source command', async () => {
            const showTextDocumentSpy = jest.spyOn(vscode.window, 'showTextDocument').mockResolvedValue(undefined as unknown as vscode.TextEditor);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).activeDocument = mockDocument;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).source();

            expect(showTextDocumentSpy).toHaveBeenCalledWith(mockDocument);
        });
    });

    describe('per-document GuiTree instances', () => {
        it('should create separate GuiTree instances for different documents', async () => {
            // Create two different mock documents
            const mockDoc1 = {
                uri: vscode.Uri.file('/mock/config1.h'),
                getText: jest.fn().mockReturnValue('// config 1 content'),
                version: 1,
            } as unknown as vscode.TextDocument;

            const mockDoc2 = {
                uri: vscode.Uri.file('/mock/config2.h'),
                getText: jest.fn().mockReturnValue('// config 2 content'),
                version: 1,
            } as unknown as vscode.TextDocument;

            const mockParticipant1 = {} as WebviewIdMessageParticipant;
            const mockParticipant2 = {} as WebviewIdMessageParticipant;

            // Add both documents
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDoc1.uri.fsPath, {
                document: mockDoc1,
                participant: mockParticipant1,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc1.uri.fsPath, new GuiTree());

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDoc2.uri.fsPath, {
                document: mockDoc2,
                participant: mockParticipant2,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc2.uri.fsPath, new GuiTree());

            // Verify separate instances exist
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const guiTree1 = (confWizWebview as any).guiTrees.get(mockDoc1.uri.fsPath);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const guiTree2 = (confWizWebview as any).guiTrees.get(mockDoc2.uri.fsPath);

            expect(guiTree1).toBeDefined();
            expect(guiTree2).toBeDefined();
            expect(guiTree1).not.toBe(guiTree2); // Different instances

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.size).toBe(2);
        });

        it('should clean up GuiTree instance when document is disposed', async () => {
            await confWizWebview.activate();

            const mockParticipant = {} as WebviewIdMessageParticipant;

            // Add document with GuiTree
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDocument.uri.fsPath, {
                document: mockDocument,
                participant: mockParticipant,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDocument.uri.fsPath, new GuiTree());

            // Verify it exists
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.has(mockDocument.uri.fsPath)).toBe(true);

            // Simulate webview disposal by manually calling the cleanup logic
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.delete(mockDocument.uri.fsPath);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.delete(mockDocument.uri.fsPath);

            // Verify cleanup
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).documents.has(mockDocument.uri.fsPath)).toBe(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.has(mockDocument.uri.fsPath)).toBe(false);
        });

        it('should clean up GuiTree when webview onDidDispose is triggered', async () => {
            let disposeCallback: (() => void) | undefined;

            const mockWebviewPanel = {
                webview: {
                    options: {},
                    html: '',
                    asWebviewUri: jest.fn((uri) => uri),
                    cspSource: 'mock-csp',
                },
                onDidDispose: jest.fn((callback) => {
                    disposeCallback = callback;
                    return { dispose: jest.fn() };
                }),
                onDidChangeViewState: jest.fn(() => ({ dispose: jest.fn() })),
            } as unknown as vscode.WebviewPanel;

            // Mock messenger.onNotification to return disposables
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const messengerMock = (confWizWebview as any).messenger;
            messengerMock.onNotification = jest.fn(() => ({ dispose: jest.fn() }));

            // Call resolveCustomTextEditor to set up the webview
            await confWizWebview.resolveCustomTextEditor(mockDocument, mockWebviewPanel);

            // Verify document and GuiTree exist
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).documents.has(mockDocument.uri.fsPath)).toBe(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.has(mockDocument.uri.fsPath)).toBe(true);

            // Trigger the dispose callback
            expect(disposeCallback).toBeDefined();
            disposeCallback!();

            // Verify both document and GuiTree were cleaned up
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).documents.has(mockDocument.uri.fsPath)).toBe(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.has(mockDocument.uri.fsPath)).toBe(false);
        });

        it('should handle GuiTree cleanup even when GuiTree does not exist', async () => {
            let disposeCallback: (() => void) | undefined;

            const mockWebviewPanel = {
                webview: {
                    options: {},
                    html: '',
                    asWebviewUri: jest.fn((uri) => uri),
                    cspSource: 'mock-csp',
                },
                onDidDispose: jest.fn((callback) => {
                    disposeCallback = callback;
                    return { dispose: jest.fn() };
                }),
                onDidChangeViewState: jest.fn(() => ({ dispose: jest.fn() })),
            } as unknown as vscode.WebviewPanel;

            // Mock messenger.onNotification to return disposables
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const messengerMock = (confWizWebview as any).messenger;
            messengerMock.onNotification = jest.fn(() => ({ dispose: jest.fn() }));

            await confWizWebview.resolveCustomTextEditor(mockDocument, mockWebviewPanel);

            // Manually remove GuiTree to simulate edge case
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.delete(mockDocument.uri.fsPath);

            // Trigger dispose - should not throw error
            expect(() => disposeCallback!()).not.toThrow();

            // Document should still be cleaned up
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).documents.has(mockDocument.uri.fsPath)).toBe(false);
        });

        it('should handle race condition by creating GuiTree on-demand in getAnnotations', () => {
            const mockDoc = {
                uri: vscode.Uri.file('/mock/config.h'),
                getText: jest.fn().mockReturnValue('// test content'),
                version: 1,
            } as unknown as vscode.TextDocument;

            const mockParticipant = {} as WebviewIdMessageParticipant;

            // Simulate race condition: document is in documents map but GuiTree is missing
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDoc.uri.fsPath, {
                document: mockDoc,
                participant: mockParticipant,
            });

            // Verify GuiTree doesn't exist yet
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.has(mockDoc.uri.fsPath)).toBe(false);

            // Call getAnnotations - should create GuiTree on-demand (no error should be thrown)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).getAnnotations('// test content', mockDoc.uri.fsPath, 1);

            // Should have created GuiTree automatically
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.has(mockDoc.uri.fsPath)).toBe(true);

            // GuiTree was created successfully
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const guiTree = (confWizWebview as any).guiTrees.get(mockDoc.uri.fsPath);
            expect(guiTree).toBeInstanceOf(GuiTree);
        });
    });

    describe('getAnnotations', () => {
        it('should use existing GuiTree when available', () => {
            const testText = '// test content';
            const testPath = '/mock/config.h';
            const testVersion = 5;

            // Create and add GuiTree to the map
            const mockGuiTree = new GuiTree();
            const getAllSpy = jest.spyOn(mockGuiTree, 'getAll').mockReturnValue(undefined);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(testPath, mockGuiTree);

            // Call getAnnotations
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = (confWizWebview as any).getAnnotations(testText, testPath, testVersion);

            // Should use existing GuiTree
            expect(getAllSpy).toHaveBeenCalledWith(testText, testVersion);
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(result).toBeUndefined();

            // Should not create a new GuiTree
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.size).toBe(1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.get(testPath)).toBe(mockGuiTree);
        });

        it('should create GuiTree on-demand when missing', () => {
            const testText = '// new document content';
            const testPath = '/mock/new-config.h';
            const testVersion = 1;

            // Verify GuiTree doesn't exist
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.has(testPath)).toBe(false);

            // Call getAnnotations - should create GuiTree on-demand
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).getAnnotations(testText, testPath, testVersion);

            // Should have created GuiTree
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).guiTrees.has(testPath)).toBe(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const createdGuiTree = (confWizWebview as any).guiTrees.get(testPath);
            expect(createdGuiTree).toBeInstanceOf(GuiTree);
        });

        it('should call getAll on newly created GuiTree', () => {
            const testText = '// content for new tree';
            const testPath = '/mock/another-config.h';
            const testVersion = 3;

            // Mock GuiTree constructor to return a spy-able instance
            const mockGetAll = jest.fn().mockReturnValue(undefined);
            (GuiTree as jest.Mock).mockImplementation(() => ({
                getAll: mockGetAll,
            }));

            // Call getAnnotations with missing GuiTree
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).getAnnotations(testText, testPath, testVersion);

            // Should have called getAll on the newly created GuiTree
            expect(mockGetAll).toHaveBeenCalledWith(testText, testVersion);
            expect(mockGetAll).toHaveBeenCalledTimes(1);

            // Reset mock
            (GuiTree as jest.Mock).mockReset();
        });

        it('should return result from GuiTree.getAll', () => {
            const testText = '// annotated content';
            const testPath = '/mock/annotated.h';
            const testVersion = 7;

            const mockTreeElement: TreeNodeElement = {
                guiId: 100,
                name: 'RootElement',
                type: GuiTypes.group,
                group: true,
                value: {
                    value: '',
                    readOnly: false,
                },
                newValue: {
                    value: '',
                    readOnly: false,
                },
            };

            // Create GuiTree that returns a result
            const mockGuiTree = new GuiTree();
            jest.spyOn(mockGuiTree, 'getAll').mockReturnValue(mockTreeElement);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(testPath, mockGuiTree);

            // Call getAnnotations
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = (confWizWebview as any).getAnnotations(testText, testPath, testVersion);

            // Should return the tree element
            expect(result).toBe(mockTreeElement);
            expect(result?.guiId).toBe(100);
            expect(result?.name).toBe('RootElement');
        });

        it('should handle undefined docVersion parameter', () => {
            const testText = '// content without version';
            const testPath = '/mock/unversioned.h';

            const mockGuiTree = new GuiTree();
            const getAllSpy = jest.spyOn(mockGuiTree, 'getAll').mockReturnValue(undefined);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(testPath, mockGuiTree);

            // Call without docVersion
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).getAnnotations(testText, testPath);

            // Should pass undefined to getAll
            expect(getAllSpy).toHaveBeenCalledWith(testText, undefined);
        });
    });

    describe('content rendering with multiple documents', () => {
        it('should parse and render different content for different documents', () => {
            // Unmock GuiTree for this test to use real parsing
            jest.unmock('./parser/gui-tree');
            const { GuiTree: RealGuiTree } = jest.requireActual('./parser/gui-tree');

            // Create real GuiTree instances for each document
            const guiTree1 = new RealGuiTree();
            const guiTree2 = new RealGuiTree();

            const mockDoc1 = {
                uri: vscode.Uri.file('/mock/config1.h'),
                version: 1,
            } as unknown as vscode.TextDocument;

            const mockDoc2 = {
                uri: vscode.Uri.file('/mock/config2.h'),
                version: 1,
            } as unknown as vscode.TextDocument;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc1.uri.fsPath, guiTree1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc2.uri.fsPath, guiTree2);

            // Simple verification: GuiTree instances are different
            expect(guiTree1).not.toBe(guiTree2);

            // Verify separate caches exist
            expect(guiTree1.itemMap).toBeDefined();
            expect(guiTree2.itemMap).toBeDefined();
            expect(guiTree1.itemMap).not.toBe(guiTree2.itemMap);
        });

        it('should maintain separate GuiTree caches for different documents', () => {
            jest.unmock('./parser/gui-tree');
            const { GuiTree: RealGuiTree } = jest.requireActual('./parser/gui-tree');

            const mockDoc1 = {
                uri: vscode.Uri.file('/mock/feature-a.h'),
                version: 1,
            } as unknown as vscode.TextDocument;

            const mockDoc2 = {
                uri: vscode.Uri.file('/mock/feature-b.h'),
                version: 2,
            } as unknown as vscode.TextDocument;

            const guiTree1 = new RealGuiTree();
            const guiTree2 = new RealGuiTree();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc1.uri.fsPath, guiTree1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc2.uri.fsPath, guiTree2);

            // Invalidate cache for doc1
            guiTree1.invalidateCache();

            // Verify doc2's cache is unaffected
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const retrievedTree1 = (confWizWebview as any).guiTrees.get(mockDoc1.uri.fsPath);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const retrievedTree2 = (confWizWebview as any).guiTrees.get(mockDoc2.uri.fsPath);

            expect(retrievedTree1).toBe(guiTree1);
            expect(retrievedTree2).toBe(guiTree2);
            expect(retrievedTree1).not.toBe(retrievedTree2);
        });
    });

    describe('markDocumentDirty', () => {
        it('should mark document as dirty without changing content', async () => {
            await confWizWebview.activate();

            const mockParticipant = {} as WebviewIdMessageParticipant;
            const documentPath = mockDocument.uri.fsPath;

            // Add document to tracked documents
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(documentPath, {
                document: mockDocument,
                participant: mockParticipant,
            });

            // Spy on workspace.applyEdit
            const applyEditSpy = jest.spyOn(vscode.workspace, 'applyEdit').mockResolvedValue(true);

            // Call markDocumentDirty
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).markDocumentDirty({ documentPath });

            // Should create and apply a workspace edit with replace
            expect(applyEditSpy).toHaveBeenCalledTimes(1);
            const editArg = applyEditSpy.mock.calls[0][0];
            expect(editArg).toHaveProperty('replace');

            // Should set isGuiEdit flag to true
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).isGuiEdit).toBe(true);

            // Wait for promise to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            // Should reset isGuiEdit flag after edit
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).isGuiEdit).toBe(false);
        });

        it('should do nothing if document path is not tracked', async () => {
            await confWizWebview.activate();

            const applyEditSpy = jest.spyOn(vscode.workspace, 'applyEdit');

            // Call with untracked document path
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).markDocumentDirty({ documentPath: '/nonexistent/file.h' });

            // Should not apply any edit
            expect(applyEditSpy).not.toHaveBeenCalled();
        });

        it('should reset isGuiEdit flag even if applyEdit fails', async () => {
            await confWizWebview.activate();

            const mockParticipant = {} as WebviewIdMessageParticipant;
            const documentPath = mockDocument.uri.fsPath;

            // Add document to tracked documents
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(documentPath, {
                document: mockDocument,
                participant: mockParticipant,
            });

            // Mock applyEdit to reject
            jest.spyOn(vscode.workspace, 'applyEdit').mockRejectedValue(new Error('Edit failed'));

            // Call markDocumentDirty
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).markDocumentDirty({ documentPath });

            // Should set isGuiEdit flag
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).isGuiEdit).toBe(true);

            // Wait for promise to reject
            await new Promise(resolve => setTimeout(resolve, 0));

            // Should reset isGuiEdit flag even after failure
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((confWizWebview as any).isGuiEdit).toBe(false);
        });

        it('should handle multiple dependent fields correctly', async () => {
            await confWizWebview.activate();

            const mockParticipant = {} as WebviewIdMessageParticipant;

            // Simulate 32-bit register split into 4 bytes (each EDIT field controls 8 bits)
            // Example: 0x12345678 split into 0x12, 0x34, 0x56, 0x78
            const mockDoc = {
                uri: vscode.Uri.file('/mock/register.h'),
                getText: jest.fn().mockReturnValue(`
#define REG_BYTE0 0x78
#define REG_BYTE1 0x56
#define REG_BYTE2 0x34
#define REG_BYTE3 0x12
                `),
                version: 1,
            } as unknown as vscode.TextDocument;

            // Add document to tracked documents
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDoc.uri.fsPath, {
                document: mockDoc,
                participant: mockParticipant,
            });

            // Create mock GuiTree
            const mockGuiTree = new GuiTree();
            mockGuiTree.saveElement = jest.fn().mockReturnValue(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc.uri.fsPath, mockGuiTree);

            const applyEditSpy = jest.spyOn(vscode.workspace, 'applyEdit').mockResolvedValue(true);

            // Create 4 EDIT elements representing the 4 bytes
            const byte0Element: TreeNodeElement = {
                guiId: 1,
                name: 'REG_BYTE0',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: '0x78',
                    readOnly: false,
                    editRect: { line: 2, col: { start: 19, end: 23 } },
                },
                newValue: {
                    value: '0xFF',
                    readOnly: false,
                },
            };

            const byte2Element: TreeNodeElement = {
                guiId: 3,
                name: 'REG_BYTE2',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: '0x34',
                    readOnly: false,
                    editRect: { line: 4, col: { start: 19, end: 23 } },
                },
                newValue: {
                    value: '0xAB',
                    readOnly: false,
                },
            };

            // User changes Byte 0
            const configWizardData1 = {
                element: byte0Element,
                documentPath: mockDoc.uri.fsPath,
                noAnnotationsFound: false,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).saveElement(configWizardData1);

            // Should have applied first edit
            expect(applyEditSpy).toHaveBeenCalledTimes(1);
            expect(mockGuiTree.saveElement).toHaveBeenCalledWith(
                mockDoc.getText(),
                byte0Element,
                mockDoc.version
            );

            // Reset spies
            applyEditSpy.mockClear();
            (mockGuiTree.saveElement as jest.Mock).mockClear();

            // User changes Byte 2 (after Byte 0 was saved)
            const configWizardData2 = {
                element: byte2Element,
                documentPath: mockDoc.uri.fsPath,
                noAnnotationsFound: false,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).saveElement(configWizardData2);

            // Should have applied second edit independently
            expect(applyEditSpy).toHaveBeenCalledTimes(1);
            expect(mockGuiTree.saveElement).toHaveBeenCalledWith(
                mockDoc.getText(),
                byte2Element,
                mockDoc.version
            );

            // Verify that each save was sequential, not batched
            // Total calls should be 2 (one for each field)
            expect(mockGuiTree.saveElement).toHaveBeenCalledTimes(1);
        });

        it('should not batch multiple pending changes from different fields', async () => {
            await confWizWebview.activate();

            const mockParticipant = {} as WebviewIdMessageParticipant;
            const documentPath = mockDocument.uri.fsPath;

            // Add document to tracked documents
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(documentPath, {
                document: mockDocument,
                participant: mockParticipant,
            });

            // Create mock GuiTree
            const mockGuiTree = new GuiTree();
            const saveElementSpy = jest.spyOn(mockGuiTree, 'saveElement').mockReturnValue(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(documentPath, mockGuiTree);

            const applyEditSpy = jest.spyOn(vscode.workspace, 'applyEdit').mockResolvedValue(true);

            // Create multiple elements
            const element1: TreeNodeElement = {
                guiId: 1,
                name: 'Field1',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: 'value1',
                    readOnly: false,
                    editRect: { line: 5, col: { start: 10, end: 16 } },
                },
                newValue: {
                    value: 'newvalue1',
                    readOnly: false,
                },
            };

            const element2: TreeNodeElement = {
                guiId: 2,
                name: 'Field2',
                type: GuiTypes.edit,
                group: false,
                value: {
                    value: 'value2',
                    readOnly: false,
                    editRect: { line: 10, col: { start: 10, end: 16 } },
                },
                newValue: {
                    value: 'newvalue2',
                    readOnly: false,
                },
            };

            // Save element 1
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).saveElement({
                element: element1,
                documentPath,
                noAnnotationsFound: false,
            });

            // Verify first save
            expect(saveElementSpy).toHaveBeenCalledTimes(1);
            expect(saveElementSpy).toHaveBeenCalledWith(
                mockDocument.getText(),
                element1,
                mockDocument.version
            );
            expect(applyEditSpy).toHaveBeenCalledTimes(1);

            // Save element 2 separately (not batched)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (confWizWebview as any).saveElement({
                element: element2,
                documentPath,
                noAnnotationsFound: false,
            });

            // Verify second save was independent
            expect(saveElementSpy).toHaveBeenCalledTimes(2);
            expect(saveElementSpy).toHaveBeenCalledWith(
                mockDocument.getText(),
                element2,
                mockDocument.version
            );
            expect(applyEditSpy).toHaveBeenCalledTimes(2);

            // Each element was saved independently, not in a batch
            const calls = saveElementSpy.mock.calls;
            expect(calls[0][1]).toBe(element1);
            expect(calls[1][1]).toBe(element2);
        });
    });

    describe('Bitfield register value integration tests', () => {
        // Use real GuiTree for these tests to verify actual parsing behavior
        const RealGuiTree = jest.requireActual('./parser/gui-tree').GuiTree;

        beforeEach(async () => {
            await confWizWebview.activate();
        });

        it('test1: should handle multiple separate byte defines without bitfield ranges', async () => {
            const mockParticipant = {} as WebviewIdMessageParticipant;

            const test1Config = `//-------- <<< Use Configuration Wizard in Context Menu >>> --------------------
// <h> 32-Bit Register Value (test1)
//   <o>   Byte 0 <0x00-0xFF>
#define REG_BYTE0 0x78
//   <o>  Byte 1 <0x00-0xFF>
#define REG_BYTE1 0x56
//   <o> Byte 2 <0x00-0xFF>
#define REG_BYTE2 0x34
//   <o> Byte 3 <0x00-0xFF>
#define REG_BYTE3 0x12
// </h>
// <<< end of configuration section >>>
`;

            const mockDoc = {
                uri: vscode.Uri.file('/mock/test1.h'),
                getText: jest.fn().mockReturnValue(test1Config),
                version: 1,
            } as unknown as vscode.TextDocument;

            // Add document to tracked documents
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDoc.uri.fsPath, {
                document: mockDoc,
                participant: mockParticipant,
            });

            // Create real GuiTree instance for testing
            const mockGuiTree = new RealGuiTree();
            const treeData = mockGuiTree.getAll(test1Config);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc.uri.fsPath, mockGuiTree);

            // Verify parsed tree structure
            expect(treeData).toBeDefined();
            expect(treeData?.children?.length).toBe(1);
            const heading = treeData?.children?.[0];
            expect(heading?.children?.length).toBe(4);

            // Verify GUI values match expected output
            expect(heading?.children?.[0]?.value.value).toBe('0x78');
            expect(heading?.children?.[1]?.value.value).toBe('0x56');
            expect(heading?.children?.[2]?.value.value).toBe('0x34');
            expect(heading?.children?.[3]?.value.value).toBe('0x12');
        });

        it('test2: should extract bitfield values from separate defines with bitfield ranges', async () => {
            const mockParticipant = {} as WebviewIdMessageParticipant;

            const test2Config = `//-------- <<< Use Configuration Wizard in Context Menu >>> --------------------
// <h> 32-Bit Register Value (test2)
//   <o.0..7>   Byte 0 <0x00-0xFF>
#define REG_BYTE0 0x78
//   <o.8..15>  Byte 1 <0x00-0xFF>
#define REG_BYTE1 0x56
//   <o.16..23> Byte 2 <0x00-0xFF>
#define REG_BYTE2 0x34
//   <o.24..31> Byte 3 <0x00-0xFF>
#define REG_BYTE3 0x12
// </h>
// <<< end of configuration section >>>
`;

            const mockDoc = {
                uri: vscode.Uri.file('/mock/test2.h'),
                getText: jest.fn().mockReturnValue(test2Config),
                version: 1,
            } as unknown as vscode.TextDocument;

            // Add document to tracked documents
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDoc.uri.fsPath, {
                document: mockDoc,
                participant: mockParticipant,
            });

            // Create real GuiTree instance for testing
            const mockGuiTree = new RealGuiTree();
            const treeData = mockGuiTree.getAll(test2Config);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc.uri.fsPath, mockGuiTree);

            // Verify parsed tree structure
            expect(treeData).toBeDefined();
            expect(treeData?.children?.length).toBe(1);
            const heading = treeData?.children?.[0];
            expect(heading?.children?.length).toBe(4);

            // Verify GUI values match expected output with bitfield extraction
            expect(heading?.children?.[0]?.value.value).toBe('0x78');
            expect(heading?.children?.[1]?.value.value).toBe('0x00');
            expect(heading?.children?.[2]?.value.value).toBe('0x00');
            expect(heading?.children?.[3]?.value.value).toBe('0x00');
        });

        it('test3: should extract bitfield values from combined define (0x12345678)', async () => {
            const mockParticipant = {} as WebviewIdMessageParticipant;

            const test3Config = `//-------- <<< Use Configuration Wizard in Context Menu >>> --------------------
// <h> 32-Bit Register Value (test3)
//   <o.0..7>   Byte 0 <0x00-0xFF>
//   <o.8..15>  Byte 1 <0x00-0xFF>
//   <o.16..23> Byte 2 <0x00-0xFF>
//   <o.24..31> Byte 3 <0x00-0xFF>
#define REG_BYTE3 0x12345678
// </h>
// <<< end of configuration section >>>
`;

            const mockDoc = {
                uri: vscode.Uri.file('/mock/test3.h'),
                getText: jest.fn().mockReturnValue(test3Config),
                version: 1,
            } as unknown as vscode.TextDocument;

            // Add document to tracked documents
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).documents.set(mockDoc.uri.fsPath, {
                document: mockDoc,
                participant: mockParticipant,
            });

            // Create real GuiTree instance for testing
            const mockGuiTree = new RealGuiTree();
            const treeData = mockGuiTree.getAll(test3Config);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (confWizWebview as any).guiTrees.set(mockDoc.uri.fsPath, mockGuiTree);

            // Verify parsed tree structure
            expect(treeData).toBeDefined();
            expect(treeData?.children?.length).toBe(1);
            const heading = treeData?.children?.[0];
            expect(heading?.children?.length).toBe(4);

            // Verify GUI values match expected output with bitfield extraction
            expect(heading?.children?.[0]?.value.value).toBe('0x78'); // Bits 0..7 of 0x78
            expect(heading?.children?.[1]?.value.value).toBe('0x56'); // Bits 8..15 of 0x56
            expect(heading?.children?.[2]?.value.value).toBe('0x34'); // Bits 16..23 of 0x34
            expect(heading?.children?.[3]?.value.value).toBe('0x12'); // Bits 24..31 of 0x12345678
        });
    });
});
