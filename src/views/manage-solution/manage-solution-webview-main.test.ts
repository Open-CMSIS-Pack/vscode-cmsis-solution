/**
 * Copyright 2024-2026 Arm Limited
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import 'jest';
import * as path from 'path';
import * as vscode from 'vscode';
import * as manifest from '../../manifest';
import { URI } from 'vscode-uri';
import { waitTimeout } from '../../__test__/test-waits';
import { commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { getMockWebViewManager, MockWebviewManager } from '../__test__/mock-webview-manager';
import { manageSolutionWebviewMainFactory } from './manage-solution-webview-main.factories';
import { ManageSolutionController } from './manage-solution-controller';
import { solutionDataFactory } from './view/state/manage-solution-state.factories';
import { solutionManagerFactory } from '../../solutions/solution-manager.factories';
import * as Messages from './messages';
import { SolutionLoadStateChangeEvent } from '../../solutions/solution-manager';
import { ETextFileResult } from '../../generic/text-file';
import { configurationProviderFactory } from '../../vscode-api/configuration-provider.factories';
import { csolutionFactory } from '../../solutions/csolution.factory';


// Helper for firing a message and waiting (now inside describe, uses local webviewManager)
describe('ContextSelectionWebviewMain', () => {
    let context: { subscriptions: vscode.Disposable[], extensionPath: string };
    let webviewManager: MockWebviewManager<Messages.OutgoingMessage>;

    const originalConsoleError = console.error;
    // Disable error logging
    beforeAll(() => { console.error = () => { }; });

    // Restore original console.error
    afterAll(() => { console.error = originalConsoleError; });

    // Helper for firing a message and waiting (now inside describe, uses local webviewManager)
    async function fireAndWait(type: string, payload?: object) {
        webviewManager.didReceiveMessageEmitter.fire({ type: type as any, ...(payload || {}) });
        await waitTimeout();
    }

    beforeEach(async () => {
        context = { subscriptions: [], extensionPath: '' };
        webviewManager = getMockWebViewManager<Messages.OutgoingMessage>();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('sends selected context data on GET_CONTEXT_SELECTION_DATA', async () => {
        const main = manageSolutionWebviewMainFactory({
            webviewManager
        });
        await main.activate(context as unknown as vscode.ExtensionContext);

        await fireAndWait('GET_CONTEXT_SELECTION_DATA');

        expect(webviewManager.sendMessage).toHaveBeenCalledWith({
            type: 'DATA_CONTEXT_SELECTION',
            data: main.controller.solutionData
        });
    });

    it('opens a file on OPEN_FILE message', async () => {
        const commandsProvider = commandsProviderFactory();
        const main = manageSolutionWebviewMainFactory({
            webviewManager,
            commandsProvider
        });
        await main.activate(context as unknown as vscode.ExtensionContext);

        const filePath = 'my/lovely/file/path/poem.txt';
        await fireAndWait('OPEN_FILE', { path: filePath });

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', URI.file(filePath));
    });

    describe('unlinking', () => {
        it('removes an image via controller when UNLINK_IMAGE received', async () => {
            const main = manageSolutionWebviewMainFactory({
                webviewManager
            });
            // Seed controller images
            await main.activate(context as vscode.ExtensionContext);

            main.controller.activeTargetSetWrap.addImage('path/to/image.bin');
            main.controller.activeTargetSetWrap.addImage('another/image.bin');
            const initial = main.controller.activeTargetSetWrap.imageNames;
            expect(initial).toEqual(['another/image.bin', 'path/to/image.bin']);

            await fireAndWait('UNLINK_IMAGE', { image: 'path/to/image.bin' });

            const remaining = main.controller.activeTargetSetWrap.imageNames;
            expect(remaining).toEqual(['another/image.bin']);
        });

        it('does nothing if image does not exist', async () => {
            const main = manageSolutionWebviewMainFactory({
                webviewManager
            });
            main.controller.activeTargetSetWrap.addImage('only/image.bin');
            await main.activate(context as vscode.ExtensionContext);

            await fireAndWait('UNLINK_IMAGE', { image: 'missing/image.bin' });

            const remaining = main.controller.activeTargetSetWrap.imageNames;
            expect(remaining).toEqual(['only/image.bin']);
        });
    });

    it('sets debugger on SET_DEBUGGER', async () => {
        const main = manageSolutionWebviewMainFactory({
            webviewManager
        });
        await main.activate(context as unknown as vscode.ExtensionContext);

        await fireAndWait('SET_DEBUGGER', { name: 'debugger1' });

        expect(webviewManager.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'DEBUGGER', data: expect.any(String) })
        );
    });

    it('updates context on SET_SELECTED_CONTEXTS', async () => {
        const initial = solutionDataFactory();
        const updated = solutionDataFactory();
        updated.targets[0].name = 'updatedTarget';

        const main = manageSolutionWebviewMainFactory({
            webviewManager
        });
        await main.activate(context as unknown as vscode.ExtensionContext);
        main.controller.solutionData = initial;

        await fireAndWait('SET_SELECTED_CONTEXTS', { data: updated });

        expect(main.controller.solutionData.targets[0].name).toBe('updatedTarget');
    });

    describe('snapshot and edit recording', () => {
        it('invokes onEdit with before/after snapshots for SET_SELECTED_CONTEXTS', async () => {
            const onEdit = jest.fn();
            const main = manageSolutionWebviewMainFactory({
                webviewManager,
                onEdit
            });
            await main.activate(context as unknown as vscode.ExtensionContext);

            const beforeSnapshot = main.getSolutionSnapshot();
            const updated = solutionDataFactory();
            updated.targets[0].name = 'edited-target';

            await fireAndWait('SET_SELECTED_CONTEXTS', { data: updated });

            expect(onEdit).toHaveBeenCalledTimes(1);
            const [label, before, after] = onEdit.mock.calls[0];
            expect(label).toBe('SET_SELECTED_CONTEXTS');
            expect(before).toEqual(beforeSnapshot);
            expect(after.targets[0].name).toBe('edited-target');
        });

        it('getSolutionSnapshot returns a detached clone', async () => {
            const main = manageSolutionWebviewMainFactory({ webviewManager });
            await main.activate(context as unknown as vscode.ExtensionContext);

            const snapshot = main.getSolutionSnapshot();
            snapshot.targets[0].name = 'mutated-outside';

            expect(main.getSolutionSnapshot().targets[0].name).not.toBe('mutated-outside');
        });

        it('applySnapshot applies snapshots (undo/redo style) and emits dirty state updates', async () => {
            const main = manageSolutionWebviewMainFactory({ webviewManager });
            await main.activate(context as unknown as vscode.ExtensionContext);

            const setSolutionDataSpy = jest.spyOn(main.controller, 'solutionData', 'set');
            jest.spyOn(main as any, 'isDirty', 'get')
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(false);

            const undoSnapshot = solutionDataFactory();
            undoSnapshot.targets[0].name = 'undo-target';
            const redoSnapshot = solutionDataFactory();
            redoSnapshot.targets[0].name = 'redo-target';

            await main.applySnapshot(undoSnapshot);
            await main.applySnapshot(redoSnapshot);

            expect(setSolutionDataSpy).toHaveBeenNthCalledWith(1, expect.objectContaining({
                targets: expect.arrayContaining([expect.objectContaining({ name: 'undo-target' })])
            }));
            expect(setSolutionDataSpy).toHaveBeenNthCalledWith(2, expect.objectContaining({
                targets: expect.arrayContaining([expect.objectContaining({ name: 'redo-target' })])
            }));

            const dirtyMessages = webviewManager.sendMessage.mock.calls
                .map(c => c[0])
                .filter(m => m.type === 'IS_DIRTY')
                .map(m => m.data);
            expect(dirtyMessages).toEqual(expect.arrayContaining([true, false]));
        });
    });

    it('toggles debugger enabled state on TOGGLE_DEBUGGER', async () => {
        const main = manageSolutionWebviewMainFactory({
            webviewManager
        });
        await main.activate(context as unknown as vscode.ExtensionContext);

        await fireAndWait('TOGGLE_DEBUGGER', { value: true });
        await fireAndWait('TOGGLE_DEBUGGER', { value: false });

        // Expect messages reflecting state changes (two DEBUGGER sends)
        const debuggerMessages = webviewManager.sendMessage.mock.calls
            .filter(c => c[0].type === 'DEBUGGER');
        expect(debuggerMessages.length).toBeGreaterThanOrEqual(2);
    });

    it('updates debug adapter section on TOGGLE_DEBUG_ADAPTER_SECTION', async () => {
        const main = manageSolutionWebviewMainFactory({
            webviewManager
        });
        await main.activate(context as unknown as vscode.ExtensionContext);

        await fireAndWait('TOGGLE_DEBUG_ADAPTER_SECTION', { section: 'connection' });

        expect(webviewManager.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'DEBUG_ADAPTERS' })
        );
    });

    describe('onDidChangeLoadState callback', () => {
        it('calls sendContextData when transitioning to active state', async () => {
            const solutionManager = solutionManagerFactory();
            const main = manageSolutionWebviewMainFactory({
                solutionManager,
                webviewManager
            });
            (main as any).webviewManager.isPanelActive = jest.fn().mockReturnValue(true); // Simulate active panel

            // Spy on sendContextData to verify it gets called
            const sendContextDataSpy = jest.spyOn(main as any, 'sendContextData').mockResolvedValue(undefined);

            await main.activate(context as vscode.ExtensionContext);

            solutionManager.fireOnDidChangeLoadState!(
                { converted: true, loaded: true, solutionPath: '/path/to/solution.csolution.yml' },
                { converted: true, loaded: false, solutionPath: '/path/to/solution.csolution.yml' }
            );

            expect(sendContextDataSpy).toHaveBeenCalled();
            expect(webviewManager.sendMessage).toHaveBeenCalledWith({ type: 'IS_BUSY', data: true });
        });

        it('calls sendContextData when transitioning from idle to active', async () => {
            const solutionManager = solutionManagerFactory();
            const main = manageSolutionWebviewMainFactory({
                solutionManager,
                webviewManager
            });
            (main as any).webviewManager.isPanelActive = jest.fn().mockReturnValue(true); // Simulate active panel

            const sendContextDataSpy = jest.spyOn(main as any, 'sendContextData').mockResolvedValue(undefined);

            await main.activate(context as vscode.ExtensionContext);

            // Create specific transition event
            const event: SolutionLoadStateChangeEvent = {
                previousState: { solutionPath: undefined },
                newState: { solutionPath: '/path/to/solution.csolution.yml' }
            };

            solutionManager.onDidChangeLoadStateEmitter!.fire(event);

            expect(sendContextDataSpy).toHaveBeenCalled();
        });

        it('does call sendContextData when transitioning from active to idle', async () => {
            const solutionManager = solutionManagerFactory();
            const main = manageSolutionWebviewMainFactory({
                solutionManager,
                webviewManager
            });

            const sendContextDataSpy = jest.spyOn(main as any, 'sendContextData').mockResolvedValue(undefined);

            await main.activate(context as vscode.ExtensionContext);

            const event: SolutionLoadStateChangeEvent = {
                previousState: { solutionPath: '/path' },
                newState: { solutionPath: undefined }
            };

            solutionManager.onDidChangeLoadStateEmitter!.fire(event);

            expect(sendContextDataSpy).not.toHaveBeenCalled();
        });

        it('clears context and disposes panel when active solution is removed', async () => {
            const solutionManager = solutionManagerFactory();
            const main = manageSolutionWebviewMainFactory({
                solutionManager,
                webviewManager
            });

            (main as any).webviewManager.isPanelActive = true;
            const clearContextSpy = jest.spyOn(main as any, 'clearContext').mockResolvedValue(undefined);
            const sendContextDataSpy = jest.spyOn(main as any, 'sendContextData').mockResolvedValue(undefined);
            const disposeSpy = jest.spyOn((main as any).webviewManager, 'disposePanel');

            await (main as any).handleSolutionLoadChange({
                previousState: { solutionPath: '/path/to/solution.csolution.yml', converted: true, loaded: true },
                newState: { solutionPath: undefined, converted: true, loaded: true }
            });

            expect(clearContextSpy).toHaveBeenCalledTimes(1);
            expect(disposeSpy).toHaveBeenCalledTimes(1);
            expect(sendContextDataSpy).not.toHaveBeenCalled();
        });
    });

    describe('ContextSelectionWebviewMain activate', () => {
        let context: { subscriptions: vscode.Disposable[], extensionPath: string };
        let webviewManager: MockWebviewManager<Messages.OutgoingMessage>;

        async function fire(type: string, payload?: object) {
            webviewManager.didReceiveMessageEmitter.fire({ type: type as any, ...(payload || {}) });
            await waitTimeout();
        }

        beforeEach(() => {
            context = { subscriptions: [], extensionPath: '' };
            webviewManager = getMockWebViewManager<Messages.OutgoingMessage>();
            jest.clearAllMocks();
        });

        it('calls webviewManager.activate', async () => {
            const main = manageSolutionWebviewMainFactory({ webviewManager });
            const activateSpy = jest.spyOn(webviewManager, 'activate');
            await main.activate(context as unknown as vscode.ExtensionContext);
            expect(activateSpy).toHaveBeenCalled();
        });

        it('registers message handler and sends context data on GET_CONTEXT_SELECTION_DATA', async () => {
            const main = manageSolutionWebviewMainFactory({ webviewManager });
            await main.activate(context as unknown as vscode.ExtensionContext);
            await fire('GET_CONTEXT_SELECTION_DATA');
            const sentTypes = webviewManager.sendMessage.mock.calls.map(c => c[0].type);
            expect(sentTypes).toContain('DATA_CONTEXT_SELECTION');
        });

        it('subscribes to configuration changes and sends AUTO_UPDATE', async () => {
            const settings = {
                [`${manifest.PACKAGE_NAME}.${manifest.CONFIG_AUTO_DEBUG_LAUNCH}`]: true,
            };
            const configurationProvider = configurationProviderFactory(settings);
            const main = manageSolutionWebviewMainFactory({ webviewManager, configurationProvider });
            await main.activate(context as unknown as vscode.ExtensionContext);
            await configurationProvider.setConfigVariable(manifest.CONFIG_AUTO_DEBUG_LAUNCH, false);
            expect(webviewManager.sendMessage).toHaveBeenCalledWith({ type: 'AUTO_UPDATE', data: false });
        });

        it('does not show warning message on dispose when not dirty', async () => {
            const main = manageSolutionWebviewMainFactory({ webviewManager });
            await main.activate(context as unknown as vscode.ExtensionContext);
            await fire('GET_CONTEXT_SELECTION_DATA');
            jest.spyOn(main.controller.cmsisJsonFile, 'isModified').mockReturnValue(false);
            jest.spyOn(main.controller.csolutionYml, 'isModified').mockReturnValue(false);
            const warnSpy = jest.spyOn(vscode.window, 'showWarningMessage').mockResolvedValue(undefined);
            webviewManager.didDisposeEmitter.fire();
            await waitTimeout();
            expect(warnSpy).not.toHaveBeenCalled();
        });
    });

    describe('openFile handling', () => {
        it('calls vscode.open (commandsProvider.executeCommand) on OPEN_FILE and not external opener', async () => {
            const commandsProvider = commandsProviderFactory();
            const openFileExternal = { openFile: jest.fn() };
            const main = manageSolutionWebviewMainFactory({
                webviewManager,
                commandsProvider,
                openFileExternal
            });
            await main.activate(context as unknown as vscode.ExtensionContext);

            const filePath = '/tmp/some/file.txt';
            webviewManager.didReceiveMessageEmitter.fire({ type: 'OPEN_FILE' as any, path: filePath });
            await waitTimeout();

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', URI.file(filePath));
            expect(openFileExternal.openFile).not.toHaveBeenCalled();
        });

        it('calls external opener on OPEN_HELP and not vscode.open', async () => {
            const commandsProvider = commandsProviderFactory();
            const openFileExternal = { openFile: jest.fn() };
            const main = manageSolutionWebviewMainFactory({
                webviewManager,
                commandsProvider,
                openFileExternal
            });
            await main.activate(context as unknown as vscode.ExtensionContext);

            webviewManager.didReceiveMessageEmitter.fire({ type: 'OPEN_HELP' as any });
            await waitTimeout();

            expect(openFileExternal.openFile).toHaveBeenCalledWith(expect.stringContaining('manage_settings.html'));
            expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
        });
    });

    it('calls setActiveTargetSet and sendContextData on SET_SELECTED_TARGET', async () => {
        const main = manageSolutionWebviewMainFactory({ webviewManager });
        await main.activate(context as unknown as vscode.ExtensionContext);

        // Force controller creation and spy
        const controller = main.controller;
        const setActiveSpy = jest.spyOn(controller, 'setActiveTargetSet').mockReturnValue(true as any);
        const sendContextDataSpy = jest.spyOn(main as any, 'sendContextData').mockResolvedValue(undefined);

        await fireAndWait('SET_SELECTED_TARGET', { target: 'myTarget', set: 'mySet' });

        expect(setActiveSpy).toHaveBeenCalledWith('myTarget', 'mySet');
        expect(sendContextDataSpy).toHaveBeenCalled();
    });

    describe('updateDebuggerParameter', () => {
        let context: { subscriptions: vscode.Disposable[], extensionPath: string };
        let webviewManager: MockWebviewManager<Messages.OutgoingMessage>;

        async function fireAndWait(type: string, payload?: object) {
            webviewManager.didReceiveMessageEmitter.fire({ type: type as any, ...(payload || {}) });
            await waitTimeout();
        }

        beforeEach(() => {
            context = { subscriptions: [], extensionPath: '' };
            webviewManager = getMockWebViewManager<Messages.OutgoingMessage>();
            jest.clearAllMocks();
        });

        it('invokes setDebuggerParameter with stringified value and sends DEBUG_ADAPTERS + DATA_CONTEXT_SELECTION', async () => {
            const main = manageSolutionWebviewMainFactory({ webviewManager });
            await main.activate(context as unknown as vscode.ExtensionContext);

            const spy = jest.spyOn(main.controller, 'setDebuggerParameter');

            await fireAndWait('SET_DEBUG_ADAPTER_PROPERTY', {
                service: 'gdb',
                key: 'port',
                value: 3333
            });

            expect(spy).toHaveBeenCalledWith('gdb', 'port', '3333');
            const sentTypes = webviewManager.sendMessage.mock.calls.map(c => c[0].type);
            expect(sentTypes).toContain('DEBUG_ADAPTERS');
            expect(sentTypes).toContain('DATA_CONTEXT_SELECTION');
        });
    });

    it('resets wasDirty after saving changes', async () => {
        const main = manageSolutionWebviewMainFactory({ webviewManager });

        const controller = main.controller;
        const saveSpy = jest.spyOn(controller, 'saveSolution').mockResolvedValue(undefined as any);
        const setBusyStateSpy = jest.spyOn(main as any, 'setBusyState').mockResolvedValue(undefined);
        const sendContextDataSpy = jest.spyOn(main as any, 'sendContextData').mockResolvedValue(undefined);
        jest.spyOn(main as any, 'isDirty', 'get').mockReturnValue(true);
        (main as any).wasDirty = true;

        await (main as any).saveChanges();

        expect(setBusyStateSpy).toHaveBeenNthCalledWith(1, true);
        expect(saveSpy).toHaveBeenCalledWith((main as any).solutionManager);
        expect(setBusyStateSpy).toHaveBeenNthCalledWith(2, false);
        expect(sendContextDataSpy).toHaveBeenCalled();
        expect((main as any).wasDirty).toBe(false);
    });

    it('returns NotExists when no solution loaded', async () => {
        const solutionManager = solutionManagerFactory();
        jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(undefined);

        const webviewManager = getMockWebViewManager<Messages.OutgoingMessage>();

        const main = manageSolutionWebviewMainFactory({ solutionManager, webviewManager });

        // Directly call the original loadSolution (no mock to restore)
        delete (main as any).loadSolution;
        const result = await main['loadSolution']();

        expect(result).toBe(ETextFileResult.NotExists);
    });

    it('recreates controller when loading a different solution path', async () => {
        const solutionManager = solutionManagerFactory();
        const webviewManager = getMockWebViewManager<Messages.OutgoingMessage>();
        const globalSolution = csolutionFactory({ solutionPath: path.join('new', 'solution.csolution.yml') });
        globalSolution.getDefaultDebugAdapterName = jest.fn().mockResolvedValue('default-adapter');
        solutionManager.getCsolution.mockReturnValue(globalSolution);

        const main = manageSolutionWebviewMainFactory({ solutionManager, webviewManager });
        delete (main as any).loadSolution; // use real implementation

        const initialController = main.controller;
        initialController.csolutionYml.fileName = path.join('old', 'solution.csolution.yml');

        const replacementController = new ManageSolutionController();
        jest.spyOn(replacementController as any, 'loadSolution').mockResolvedValue(ETextFileResult.Success);
        const createControllerSpy = jest.spyOn(main as any, 'createController').mockReturnValue(replacementController as any);

        const result = await (main as any).loadSolution();

        expect(createControllerSpy).toHaveBeenCalled();
        expect((main as any)._controller).toBe(replacementController);
        expect(replacementController.loadSolution).toHaveBeenCalledWith(globalSolution.solutionPath, 'default-adapter');
        expect(result).toBe(ETextFileResult.Success);
    });

    describe('selectFileDialog', () => {
        it('sends FILE_SELECTED with relative path and respects defaultUri', async () => {
            const main = manageSolutionWebviewMainFactory({ webviewManager });
            await main.activate(context as unknown as vscode.ExtensionContext);

            const rootDir = path.resolve('root');
            const solutionPath = path.join(rootDir, 'solution.csolution.yml');
            main.controller.csolutionYml.fileName = solutionPath;

            const filePath = path.join(rootDir, 'images', 'app.axf');
            const defaultPath = path.join(rootDir, 'images', 'seed.bin');
            const showOpenDialogSpy = jest.spyOn(vscode.window, 'showOpenDialog').mockResolvedValue([
                URI.file(filePath) as unknown as vscode.Uri
            ]);

            await fireAndWait('SELECT_FILE', {
                targetElementId: 'image-path',
                options: {
                    defaultUri: defaultPath,
                    canSelectMany: false,
                    openLabel: 'Select File',
                    title: 'Select File',
                }
            });

            const dialogOptions = showOpenDialogSpy.mock.calls[0][0];
            expect(dialogOptions?.defaultUri?.toString()).toBe(URI.file(path.dirname(defaultPath)).toString());
            expect(webviewManager.sendMessage).toHaveBeenCalledWith({
                type: 'FILE_SELECTED',
                data: ['images/app.axf'],
                for: 'image-path'
            });
        });
    });

});
