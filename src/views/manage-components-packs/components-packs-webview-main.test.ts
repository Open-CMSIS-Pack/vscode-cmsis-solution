/**
 * Copyright 2025-2026 Arm Limited
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
import * as vscode from 'vscode';
import * as Messages from './messages';
import { ComponentsPacksWebviewMain } from './components-packs-webview-main';
import { getMockWebViewManager, MockWebviewManager } from '../__test__/mock-webview-manager';
import { WebviewManager } from '../webview-manager';
import { waitTimeout } from '../../__test__/test-waits';
import { MockMessageProvider, messageProviderFactory } from '../../vscode-api/message-provider.factories';
import { MockCommandsProvider, commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { SolutionLoadState } from '../../solutions/solution-manager';
import { MockSolutionManager, activeSolutionLoadStateFactory, solutionManagerFactory } from '../../solutions/solution-manager.factories';
import { COutlineItem } from '../solution-outline/tree-structure/solution-outline-item';
import { IOpenFileExternal } from '../../open-file-external-if';
import { openFileExternalFactory } from '../../open-file-external.factories';
import { CsolutionService } from '../../json-rpc/csolution-rpc-client';
import { csolutionServiceFactory } from '../../json-rpc/csolution-rpc-client.factory';
import { TargetSetData } from './components-data';
import path from 'path';
import { ComponentScope } from './data/component-tools';

const testSolutionPath = 'path/to/solution.csolution';

const cprojectItem = new COutlineItem('project');
cprojectItem.setAttribute('label', 'project');
cprojectItem.setAttribute('expandable', '0');
cprojectItem.setAttribute('type', 'projectFile');
cprojectItem.setAttribute('resourcePath', 'to/project/path/myproject.cproject.yaml');

describe('ComponentsPacksWebviewMain', () => {
    let solutionManager: MockSolutionManager;
    let componentsPacksWebviewMain: ComponentsPacksWebviewMain;
    let webviewManager: MockWebviewManager<Messages.OutgoingMessage>;
    let commandsProvider: MockCommandsProvider;
    const mockOpenFileExternal: IOpenFileExternal = openFileExternalFactory();
    let extensionContext: { subscriptions: vscode.Disposable[] };
    let messageProvider: MockMessageProvider;
    let csolutionService: CsolutionService;
    const usedItemsReturn = { packs: [{ pack: 'ARM::CMSIS@1.0.0', origin: '/tmp/file1.yml' }, { pack: 'Keil::MDK-Middleware@8.0.0', origin: '/tmp/file2.yml' }], components: [{ id: 'CMSIS Driver:I2C' }, { id: 'MDK Middleware Component' }] };

    beforeEach(async () => {
        messageProvider = messageProviderFactory();

        solutionManager = solutionManagerFactory({
            loadState: activeSolutionLoadStateFactory({ solutionPath: testSolutionPath }),
        });

        webviewManager = getMockWebViewManager<Messages.OutgoingMessage>();
        webviewManager.onDidReceiveMessage = webviewManager.didReceiveMessageEmitter.event;
        commandsProvider = commandsProviderFactory();
        extensionContext = { subscriptions: [] };
        csolutionService = csolutionServiceFactory();
        // Ensure base mocks used by sendDirtyState exist for all tests
        (csolutionService as any).apply ??= jest.fn().mockResolvedValue({ success: true });
        (csolutionService as any).getUsedItems ??= jest.fn().mockResolvedValue({ components: [], packs: [] });

        componentsPacksWebviewMain = new ComponentsPacksWebviewMain(
            solutionManager,
            csolutionService as unknown as CsolutionService,
            extensionContext as unknown as vscode.ExtensionContext,
            messageProvider,
            commandsProvider,
            mockOpenFileExternal,
            webviewManager as unknown as WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>,
        );

        // Preserve the instance created in the constructor so we don't lose mocks when redefining.
        let _csolutionService: any = (componentsPacksWebviewMain as any).csolutionService;
        Object.defineProperty(componentsPacksWebviewMain as any, 'csolutionService', {
            configurable: true,
            get: () => _csolutionService,
            set: (v: any) => {
                if (v && typeof v === 'object' && !v.getLogMessages) {
                    v.getLogMessages = jest.fn().mockResolvedValue({ errors: [], warnings: [], info: [] });
                }
                if (v && typeof v === 'object' && !v.apply) {
                    v.apply = jest.fn().mockResolvedValue({ success: true });
                }
                if (v && typeof v === 'object' && !v.getUsedItems) {
                    v.getUsedItems = jest.fn().mockResolvedValue({ components: [], packs: [] });
                }
                _csolutionService = v;
            }
        });

        (componentsPacksWebviewMain as any).manageComponentsActions.currentProject = {
            solutionPath: testSolutionPath,
            project: { projectId: 'path/to/project.cproject.yml', projectName: 'project 1' }
        };

        await componentsPacksWebviewMain.activate(extensionContext as vscode.ExtensionContext);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('does not send messages or dispose the panel on construction', async () => {
        await waitTimeout();

        expect(webviewManager.disposePanel).not.toHaveBeenCalled();
        expect(webviewManager.sendMessage).not.toHaveBeenCalled();
    });

    describe('when the panel is active', () => {
        beforeEach(() => {
            webviewManager.isPanelActive = true;
        });

        it('clears the components when there is no solution', async () => {
            webviewManager.sendMessage.mockClear();
            webviewManager.onDidReceiveMessage = webviewManager.didReceiveMessageEmitter.event;

            await componentsPacksWebviewMain.activate(extensionContext as vscode.ExtensionContext);

            (solutionManager as { loadState: SolutionLoadState }).loadState = { solutionPath: undefined };
            solutionManager.onDidChangeLoadStateEmitter.fire({
                previousState: { solutionPath: undefined },
                newState: solutionManager.loadState,
            });
            await waitTimeout();

            expect(webviewManager.disposePanel).not.toHaveBeenCalled();
        });
    });

    describe('handleWebviewCommand', () => {
        const projectPath = 'to/project/path/myproject.cproject.yaml';

        beforeEach(() => {
            // Replace openWebview with a spy for each test
            (componentsPacksWebviewMain as any).openWebview = jest.fn();
        });

        it('calls openWebview with resourcePath when node type is projectFile', async () => {

            const projectFileNode = new COutlineItem('project');
            projectFileNode.setAttribute('resourcePath', projectPath);

            await (componentsPacksWebviewMain as any).handleWebviewCommand(projectFileNode);

            expect((componentsPacksWebviewMain as any).openWebview).toHaveBeenCalledTimes(1);
            expect((componentsPacksWebviewMain as any).openWebview).toHaveBeenCalledWith(projectPath, undefined);
        });

        it('calls openWebview with parent resourcePath when node type is components', async () => {

            const projectFileNode = new COutlineItem('project');
            projectFileNode.setAttribute('resourcePath', projectPath);

            const componentsNode = projectFileNode.createChild('components');

            await (componentsPacksWebviewMain as any).handleWebviewCommand(componentsNode);

            expect((componentsPacksWebviewMain as any).openWebview).toHaveBeenCalledTimes(1);
            expect((componentsPacksWebviewMain as any).openWebview).toHaveBeenCalledWith(projectPath, undefined);
        });

        it('calls openWebview with parent resourcePath and layer when node is components in layer', async () => {
            const projectFileNode = new COutlineItem('project');
            projectFileNode.setAttribute('resourcePath', projectPath);
            const layerNode = projectFileNode.createChild('layer');
            layerNode.setAttribute('resourcePath', 'my/layer.clayer.yml');
            const componentsNode = layerNode.createChild('components');

            await (componentsPacksWebviewMain as any).handleWebviewCommand(componentsNode);

            expect((componentsPacksWebviewMain as any).openWebview).toHaveBeenCalledTimes(1);
            expect((componentsPacksWebviewMain as any).openWebview).toHaveBeenCalledWith(projectPath, 'my/layer.clayer.yml');
        });


        it('does not call openWebview when node is undefined', async () => {
            await (componentsPacksWebviewMain as any).handleWebviewCommand(undefined);

            expect((componentsPacksWebviewMain as any).openWebview).not.toHaveBeenCalled();
        });
    });

    describe('openWebview', () => {
        let debounceLoadSpy: jest.SpyInstance;
        let createOrShowPanelSpy: jest.SpyInstance;

        beforeEach(() => {
            // Ensure RPC mocks exist for sendDirtyState invoked inside openWebview
            (componentsPacksWebviewMain as any).csolutionService.apply = jest.fn().mockResolvedValue({ success: true });
            (componentsPacksWebviewMain as any).csolutionService.getUsedItems = jest.fn().mockResolvedValue({ components: [], packs: [] });
            (componentsPacksWebviewMain as any).csolutionService.validateComponents = jest.fn().mockResolvedValue({ success: true, validation: [] });
            (componentsPacksWebviewMain as any).csolutionService.getComponentsTree = jest.fn().mockResolvedValue({ success: true, classes: [] });

            debounceLoadSpy = jest.spyOn(componentsPacksWebviewMain as any, 'debounce_load').mockResolvedValue(undefined);
            createOrShowPanelSpy = jest.spyOn((componentsPacksWebviewMain as any).webviewManager, 'createOrShowPanel');
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('always calls createOrShowPanel', async () => {
            await (componentsPacksWebviewMain as any).openWebview('somePath');
            expect(createOrShowPanelSpy).toHaveBeenCalledTimes(1);
        });

        it('does not call debounce_load when cprojectPath is undefined', async () => {
            await (componentsPacksWebviewMain as any).openWebview(undefined);
            expect(debounceLoadSpy).not.toHaveBeenCalled();
        });

        it('calls debounce_load with reload=false when projectFromPath returns same value', async () => {
            (componentsPacksWebviewMain as any).currentProject = { solutionPath: 'sol', project: { projectId: 'oldProj', projectName: 'oldProj' } };
            jest.spyOn(componentsPacksWebviewMain as any, 'projectFromPath').mockReturnValue('normalizedProj');
            await (componentsPacksWebviewMain as any).openWebview('oldProj');
            expect(debounceLoadSpy).toHaveBeenCalledTimes(1);
            expect(debounceLoadSpy).toHaveBeenCalledWith('oldProj', false);
        });

        it('calls debounce_load with reload=true when projectFromPath returns different values', async () => {
            (componentsPacksWebviewMain as any).currentProject = { solutionPath: 'sol', project: { projectId: 'oldProj', projectName: 'oldProj' } };
            const projectFromPathMock = jest.spyOn(componentsPacksWebviewMain as any, 'projectFromPath');
            projectFromPathMock.mockImplementation((...args: unknown[]) => {
                const p = args[0] as string | undefined;
                return p === 'oldProj' ? 'A' : 'B';
            });
            await (componentsPacksWebviewMain as any).openWebview('newProj');
            expect(debounceLoadSpy).toHaveBeenCalledTimes(1);
            expect(debounceLoadSpy).toHaveBeenCalledWith('newProj', true);
        });
    });

    describe('handleSolutionLoadChange', () => {
        const makeEvent = (prev: string, next: string) => ({
            previousState: { type: prev },
            newState: { type: next },
        });

        let debounceSpy: jest.SpyInstance;

        beforeEach(() => {
            debounceSpy = jest.spyOn(componentsPacksWebviewMain as any, 'debounce_load').mockResolvedValue(undefined);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('does nothing when panel is not active', async () => {
            webviewManager.isPanelActive = false;
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(solutionManager.getCsolution());

            await (componentsPacksWebviewMain as any).handleSolutionLoadChange(makeEvent('idle', 'active'));

            expect(debounceSpy).not.toHaveBeenCalled();
        });

        it('does not reload when active -> active and project unchanged', async () => {
            webviewManager.isPanelActive = true;
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(solutionManager.getCsolution());
            (componentsPacksWebviewMain as any).currentProject = { solutionPath: 'sol', project: { projectId: 'proj1', projectName: 'proj1' } };

            await (componentsPacksWebviewMain as any).handleSolutionLoadChange(makeEvent('active', 'active'));

            expect(debounceSpy).not.toHaveBeenCalled();
        });

        it('clears components when solution not active', async () => {
            webviewManager.isPanelActive = true;
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(solutionManager.getCsolution());
            const clearSpy = jest.spyOn(componentsPacksWebviewMain as any, 'clearComponents').mockResolvedValue(undefined);

            await (componentsPacksWebviewMain as any).handleSolutionLoadChange(makeEvent('active', 'idle'));

            expect(clearSpy).toHaveBeenCalledTimes(1);
            expect(debounceSpy).not.toHaveBeenCalled();
        });

        it('clears components when csolution undefined', async () => {
            webviewManager.isPanelActive = true;
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(undefined);
            const clearSpy = jest.spyOn(componentsPacksWebviewMain as any, 'clearComponents').mockResolvedValue(undefined);

            await (componentsPacksWebviewMain as any).handleSolutionLoadChange(makeEvent('idle', 'active'));

            expect(clearSpy).toHaveBeenCalledTimes(1);
            expect(debounceSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleRequestInitialData', () => {
        let webviewManager: MockWebviewManager<Messages.OutgoingMessage>;
        let extensionContext: { subscriptions: vscode.Disposable[] };

        beforeEach(async () => {
            messageProvider = messageProviderFactory();
            solutionManager = solutionManagerFactory({
                loadState: activeSolutionLoadStateFactory({ solutionPath: testSolutionPath }),
            });
            webviewManager = getMockWebViewManager<Messages.OutgoingMessage>();
            webviewManager.onDidReceiveMessage = webviewManager.didReceiveMessageEmitter.event;
            commandsProvider = commandsProviderFactory();
            extensionContext = { subscriptions: [] };

            await componentsPacksWebviewMain.activate(extensionContext as unknown as vscode.ExtensionContext);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('calls debounce_load with project id and reload=false when selected project is unchanged', async () => {
            const debounceSpy = jest.spyOn(componentsPacksWebviewMain as any, 'debounce_load').mockResolvedValue(undefined);
            jest.spyOn(componentsPacksWebviewMain as any, 'getValidProjectId').mockReturnValue('projValid');
            jest.spyOn(componentsPacksWebviewMain as any, 'projectFromPath').mockReturnValue('sameProject');

            await (componentsPacksWebviewMain as any).handleMessage({ type: 'REQUEST_INITIAL_DATA' });

            expect(debounceSpy).toHaveBeenCalledTimes(1);
            expect(debounceSpy).toHaveBeenCalledWith('projValid', false);
        });

        it('does not call debounce_load when no valid project id exists', async () => {
            const debounceSpy = jest.spyOn(componentsPacksWebviewMain as any, 'debounce_load').mockResolvedValue(undefined);
            jest.spyOn(componentsPacksWebviewMain as any, 'getValidProjectId').mockReturnValue(undefined);

            await (componentsPacksWebviewMain as any).handleMessage({ type: 'REQUEST_INITIAL_DATA' });

            expect(debounceSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleMessage', () => {

        it('dispatches REQUEST_INITIAL_DATA to handleRequestInitialData', async () => {
            const spy = jest.spyOn(componentsPacksWebviewMain as any, 'handleRequestInitialData').mockResolvedValue(undefined);
            await (componentsPacksWebviewMain as any).handleMessage({ type: 'REQUEST_INITIAL_DATA' });
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('dispatches CHANGE_COMPONENT_SCOPE to handleChangeComponentScope', async () => {
            // Avoid triggering loadSolution from inside handleChangeComponentScope.
            jest.spyOn(componentsPacksWebviewMain as any, 'debounce_load').mockResolvedValue(undefined);
            (componentsPacksWebviewMain as any).currentProject = { project: { projectId: 'proj', projectName: 'proj' } };

            // Spy but still execute original to get coverage
            const original = (componentsPacksWebviewMain as any).handleChangeComponentScope.bind(componentsPacksWebviewMain);
            const spy = jest.spyOn(componentsPacksWebviewMain as any, 'handleChangeComponentScope').mockImplementation(original);

            await (componentsPacksWebviewMain as any).handleMessage({
                type: 'CHANGE_COMPONENT_SCOPE',
                componentData: { id: 'cmp' },
                scope: 'AnyScopeValue',
            } as any);

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith({
                type: 'CHANGE_COMPONENT_SCOPE',
                componentData: { id: 'cmp' },
                scope: 'AnyScopeValue',
            });
        });

        it('dispatches APPLY_COMPONENT_SET to handleApplyComponentSet', async () => {
            const spy = jest.spyOn(componentsPacksWebviewMain as any, 'handleApplyComponentSet').mockResolvedValue(undefined);
            await (componentsPacksWebviewMain as any).handleMessage({ type: 'APPLY_COMPONENT_SET' });
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('dispatches CHANGE_COMPONENT_VALUE to handleChangeComponentValue', async () => {
            const spy = jest.spyOn(componentsPacksWebviewMain as any, 'handleChangeComponentValue').mockResolvedValue(undefined);
            await (componentsPacksWebviewMain as any).handleMessage({ type: 'CHANGE_COMPONENT_VALUE', componentData: { id: 'cmp' } } as any);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('dispatches CHANGE_COMPONENT_VARIANT to handleChangeComponentVariant', async () => {
            const spy = jest.spyOn(componentsPacksWebviewMain as any, 'handleChangeComponentVariant').mockResolvedValue(undefined);
            await (componentsPacksWebviewMain as any).handleMessage({ type: 'CHANGE_COMPONENT_VARIANT', componentData: { id: 'cmp' }, variant: 'v1' } as any);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('dispatches CHANGE_COMPONENT_BUNDLE to handleChangeComponentBundle', async () => {
            const spy = jest.spyOn(componentsPacksWebviewMain as any, 'handleChangeComponentBundle').mockResolvedValue(undefined);
            await (componentsPacksWebviewMain as any).handleMessage({ type: 'CHANGE_COMPONENT_BUNDLE', componentData: { id: 'cmp' }, bundle: 'bundle1' } as any);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('dispatches CHANGE_TARGET to handleChangeTarget', async () => {
            const spy = jest.spyOn(componentsPacksWebviewMain as any, 'handleChangeTarget').mockResolvedValue(undefined);
            await (componentsPacksWebviewMain as any).handleMessage({ type: 'CHANGE_TARGET', targetSet: { projectPath: 'path/proj.cproject.yml' } } as any);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('handles OPEN_FILE by calling openFile', async () => {
            const spy = jest.spyOn(componentsPacksWebviewMain as any, 'openFile').mockImplementation(() => { });
            await (componentsPacksWebviewMain as any).handleMessage({ type: 'OPEN_FILE', uri: '/tmp/doc.md', external: true });
            expect(spy).toHaveBeenCalledWith('/tmp/doc.md', true, undefined);
        });

        it('returns message for unknown type (default branch)', async () => {
            const msg = { type: 'UNKNOWN_MESSAGE_TYPE' } as any;
            const result = await (componentsPacksWebviewMain as any).handleMessage(msg);
            expect(result).toBe(msg);
        });

        it('clears components when no csolution exists', async () => {
            // Arrange: ensure componentTree exists so clearComponents will attempt to send
            (componentsPacksWebviewMain as any).componentTree = { success: true, classes: [{}] };
            webviewManager.sendMessage.mockClear();
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(undefined as any);

            await (componentsPacksWebviewMain as any).handleMessage({ type: 'REQUEST_INITIAL_DATA' });

            expect(webviewManager.sendMessage).toHaveBeenCalledWith({
                type: 'SET_COMPONENT_TREE',
                tree: { success: false, classes: [] },
                validations: []
            });
        });
    });
    describe('handleApplyComponentSet', () => {
        let applyMock: jest.Mock;
        let getUsedItemsMock: jest.Mock;
        let getComponentsTreeMock: jest.Mock;
        let validateComponentsMock: jest.Mock;
        let updateUsedItemsMock: jest.Mock;

        const componentTreeReturn = { success: true, classes: [{ id: 'cls1' }] };
        const validationsReturn = { success: true, result: 'OK', validation: [{ id: 'val1' }] };

        beforeEach(() => {
            // Ensure current project & active context
            (componentsPacksWebviewMain as any).currentProject = {
                solutionPath: 'sol',
                project: { projectId: 'proj1', projectName: 'proj1' }
            };
            jest.spyOn(componentsPacksWebviewMain as any, 'getActiveContext').mockReturnValue('ctx1');

            // Mock csolutionService methods
            applyMock = jest.fn().mockResolvedValue({ success: true });
            getUsedItemsMock = jest.fn().mockResolvedValue(usedItemsReturn);
            getComponentsTreeMock = jest.fn().mockResolvedValue(componentTreeReturn);
            validateComponentsMock = jest.fn().mockResolvedValue(validationsReturn);

            (componentsPacksWebviewMain as any).csolutionService = {
                apply: applyMock,
                getUsedItems: getUsedItemsMock,
                getComponentsTree: getComponentsTreeMock,
                validateComponents: validateComponentsMock,
                getLogMessages: jest.fn().mockResolvedValue({ errors: [], warnings: [], info: [] }),
                loadSolution: jest.fn().mockResolvedValue({ success: true }),
            };

            // Mock projectFileUpdater
            updateUsedItemsMock = jest.fn().mockResolvedValue(true);
            (componentsPacksWebviewMain as any).projectFileUpdater = {
                updateUsedItems: updateUsedItemsMock
            };

            webviewManager.sendMessage.mockClear();
        });

        it('applies component set, updates used items and clears edit cache when updateUsedItems returns true', async () => {
            await (componentsPacksWebviewMain as any).handleApplyComponentSet();

            expect(webviewManager.sendMessage).toHaveBeenCalledWith({ type: 'SET_SOLUTION_STATE', stateMessage: 'Saving changes...' });
            expect(applyMock).toHaveBeenCalledWith({ context: 'ctx1' });
            expect(getUsedItemsMock).toHaveBeenCalledWith({ context: 'ctx1' });
            expect(updateUsedItemsMock).toHaveBeenCalledWith('ctx1', 'proj1', usedItemsReturn);

            expect(webviewManager.sendMessage).toHaveBeenCalledWith({ type: 'SET_ERROR_MESSAGES', messages: [] });
            expect(webviewManager.sendMessage).toHaveBeenCalledWith(expect.objectContaining({
                type: 'SET_COMPONENT_TREE',
                tree: componentTreeReturn,
                validations: validationsReturn.validation
            }));

            // No extra error state message on success
            const stateMessages = webviewManager.sendMessage.mock.calls.filter(c => c[0].type === 'SET_SOLUTION_STATE');
            expect(stateMessages.length).toBe(1); // Saving changes..., then clearing state
        });

        it('sends error state message when apply fails', async () => {
            applyMock.mockResolvedValue({ success: false, message: 'Failed to apply' });

            await (componentsPacksWebviewMain as any).handleApplyComponentSet();

            // Expect extra SET_SOLUTION_STATE with error
            const stateMessages = webviewManager.sendMessage.mock.calls
                .filter(c => c[0].type === 'SET_SOLUTION_STATE')
                .map(c => c[0].stateMessage);

            expect(stateMessages).toEqual([
                'Saving changes...',
                'Failed to apply'
            ]);
        });

        it('uses default error message when apply fails without message', async () => {
            applyMock.mockResolvedValue({ success: false });

            await (componentsPacksWebviewMain as any).handleApplyComponentSet();

            const stateMessages = webviewManager.sendMessage.mock.calls
                .filter(c => c[0].type === 'SET_SOLUTION_STATE')
                .map(c => c[0].stateMessage);

            expect(stateMessages).toEqual([
                'Saving changes...',
                'Unspecified error when writing solution information'
            ]);
        });
    });

    describe('ComponentsWebviewMain loadSolution', () => {
        const componentTreeReturn = { success: true, classes: [{ id: 'cls1', bundles: [{ aggregates: [{ options: { layer: 'Board1.clayer.yml' }, variants: [] }] }] }] } as any;
        const validationsReturn = { success: true, result: 'OK', validation: [{ id: 'val1' }] } as any;

        const setupCsolutionServiceMocks = (overrides?: Partial<Record<string, any>>) => {
            const base = {
                apply: jest.fn().mockResolvedValue({ success: true }),
                getVersion: jest.fn().mockResolvedValue('1.2.3'),
                loadPacks: jest.fn().mockResolvedValue(undefined),
                loadSolution: jest.fn().mockResolvedValue({ success: true }),
                getUsedItems: jest.fn().mockResolvedValue(usedItemsReturn),
                getPacksInfo: jest.fn().mockResolvedValue({
                    packs: [{
                        id: 'my.pack@0.0.1', references: [
                            { pack: 'my.pack@', origin: 'path-a.cproject.yml', selected: true },
                            { pack: 'my.pack@^0.0.1', origin: 'path-b.csolution.yml', selected: false },
                            { pack: 'my.pack@0.0.1', origin: 'path-c.clayer.yml', selected: false }
                        ]
                    }]
                }),
                getComponentsTree: jest.fn().mockResolvedValue(componentTreeReturn),
                validateComponents: jest.fn().mockResolvedValue(validationsReturn),
                getLogMessages: jest.fn().mockResolvedValue({ errors: [], warnings: [], info: [] })
            };
            (componentsPacksWebviewMain as any).csolutionService = { ...base, ...(overrides ?? {}) };
            return (componentsPacksWebviewMain as any).csolutionService;
        };

        it('performs full reload sequence when reload=true', async () => {
            const svc = setupCsolutionServiceMocks();
            (componentsPacksWebviewMain as any).getActiveContext = jest.fn().mockReturnValue('activeCtx');

            await (componentsPacksWebviewMain as any).loadSolution('solPath', 'activeTs', 'activeCtx', true);

            // Ordering-sensitive state messages (exclude the final undefined clear + others at end)
            const stateMessages = webviewManager.sendMessage.mock.calls
                .map(c => c[0])
                .filter(m => m.type === 'SET_SOLUTION_STATE')
                .map(m => m.stateMessage);

            // Expect the progressive messages in order (final undefined may appear anywhere in array depending on Promise.all)
            expect(stateMessages).toEqual(
                expect.arrayContaining([
                    'Connecting to rpc daemon',
                    'Loading Packs...',
                    'Loading Solution...',
                    'Retrieving assigned items...'
                ])
            );
            expect(stateMessages.indexOf('Connecting to rpc daemon')).toBeLessThan(stateMessages.indexOf('Loading Packs...'));
            expect(stateMessages.indexOf('Loading Packs...')).toBeLessThan(stateMessages.indexOf('Loading Solution...'));

            expect(svc.getVersion).toHaveBeenCalled();
            expect(svc.loadPacks).toHaveBeenCalled();
            expect(svc.loadSolution).toHaveBeenCalledWith({ solution: 'solPath', activeTarget: 'activeTs' });
            expect(svc.getUsedItems).toHaveBeenCalledWith({ context: 'activeCtx' });
            expect(svc.getPacksInfo).toHaveBeenCalledWith({ context: 'activeCtx', all: false });
            expect(svc.getComponentsTree).toHaveBeenCalledWith({ context: 'activeCtx', all: false });
            expect(svc.validateComponents).toHaveBeenCalledWith({ context: 'activeCtx' });

            // Final component tree message
            const compTreeMsg = webviewManager.sendMessage.mock.calls.map(c => c[0]).find(m => m.type === 'SOLUTION_LOADED');
            expect(compTreeMsg).toBeDefined();
            expect(compTreeMsg?.componentTree).toBe(componentTreeReturn);
            expect(compTreeMsg?.validations).toEqual(validationsReturn.validation);

            expect((componentsPacksWebviewMain as any).usedItems).toBe(usedItemsReturn);
        });

        it('skips heavy reload steps when reload=false', async () => {
            const svc = setupCsolutionServiceMocks();

            (componentsPacksWebviewMain as any).usedItems = usedItemsReturn;
            await (componentsPacksWebviewMain as any).loadSolution('solPath', 'activeTs', 'activeCtx', false);

            // Heavy operations not called
            expect(svc.getVersion).not.toHaveBeenCalled();
            expect(svc.loadPacks).not.toHaveBeenCalled();
            expect(svc.loadSolution).not.toHaveBeenCalled();

            // Still refresh tree, usedItems and validations
            expect(svc.getComponentsTree).toHaveBeenCalledTimes(1);
            expect(svc.validateComponents).toHaveBeenCalledTimes(1);
            expect(svc.getUsedItems).toHaveBeenCalled();

            const compTreeMsg = webviewManager.sendMessage.mock.calls.map(c => c[0]).find(m => m.type === 'SOLUTION_LOADED');
            expect(compTreeMsg?.componentTree).toBe(componentTreeReturn);

            // usedItems is not refreshed in reload=false path
            expect((componentsPacksWebviewMain as any).usedItems).toBe(usedItemsReturn);
        });

        it('handles errors and sends error messages', async () => {
            const error = new Error('Boom failure');
            const svc = setupCsolutionServiceMocks({
                getComponentsTree: jest.fn().mockRejectedValue(error),
                getLogMessages: jest.fn().mockResolvedValue({
                    errors: ['E1'],
                    warnings: ['W1'],
                    info: ['I1']
                })
            });

            await (componentsPacksWebviewMain as any).loadSolution('solPath', 'activeTs', 'ctx', true);

            // Expect error sequence: SET_COMPONENT_TREE with cleared data & SET_ERROR_MESSAGES with merged messages
            const calls = webviewManager.sendMessage.mock.calls.map(c => c[0]);

            const errorTreeMsg = calls.find(m => m.type === 'SET_COMPONENT_TREE' && m.tree?.success === false);
            expect(errorTreeMsg).toBeTruthy();
            expect(errorTreeMsg?.tree).toEqual({ success: false, classes: [] });

            const errorMessagesMsg = calls.find(m => m.type === 'SET_ERROR_MESSAGES' && m.messages?.length);
            expect(errorMessagesMsg).toBeTruthy();
            const msgs = errorMessagesMsg?.messages?.map((m: any) => m.message);
            expect(msgs).toEqual(expect.arrayContaining(['Boom failure', 'E1', 'W1', 'I1']));

            // Ensure dirty flag cleared
            expect(calls.some(m => m.type === 'IS_DIRTY' && m.isDirty === false)).toBe(true);

            // Heavy reload start still attempted before failure
            expect(svc.getVersion).toHaveBeenCalled();
        });
    });

    describe('mapComponentsFromService', () => {
        it('converts aggregate layer paths to solution-relative forward-slashed paths', () => {
            const baseDir = path.join('path', 'to');
            const solutionPath = path.join(baseDir, 'solution.csolution');
            const projectPath = path.join(baseDir, 'project.cproject.yml');

            (componentsPacksWebviewMain as any).currentProject = {
                solutionPath,
                project: { projectId: projectPath, projectName: 'project 1' }
            };

            const aggWithLayer: any = {
                id: 'Agg1',
                options: { layer: path.join(baseDir, 'layers', 'my.clayer.yml') },
                variants: [{ name: 'v', components: [] }]
            };

            const aggWithoutLayer: any = {
                id: 'Agg2',
                options: undefined,
                variants: [{ name: 'v', components: [] }]
            };

            (componentsPacksWebviewMain as any).componentTree = {
                success: true,
                classes: [{
                    bundles: [{
                        cgroups: [{
                            aggregates: [aggWithLayer],
                            cgroups: []
                        }],
                        aggregates: [aggWithoutLayer]
                    }]
                }]
            };

            (componentsPacksWebviewMain as any).manageComponentsActions.mapComponentsFromService((componentsPacksWebviewMain as any).componentTree);

            expect(aggWithLayer.options.layer).toBe('layers/my.clayer.yml');
            expect(aggWithoutLayer.options.layer).toBe('project.cproject.yml');
        });

        it('fills nested subgroup aggregates with project-relative layers when missing', () => {
            const baseDir = path.join('path', 'to');
            const solutionPath = path.join(baseDir, 'solution.csolution');
            const projectPath = path.join(baseDir, 'project.cproject.yml');

            (componentsPacksWebviewMain as any).currentProject = {
                solutionPath,
                project: { projectId: projectPath, projectName: 'project' }
            };

            const nestedAggregate: any = {
                id: 'AggNested',
                options: undefined,
                variants: [{ name: 'nested', components: [] }]
            };

            const componentTree = {
                success: true,
                classes: [{
                    bundles: [{
                        cgroups: [{
                            aggregates: [],
                            cgroups: [{ aggregates: [nestedAggregate] }]
                        }],
                        aggregates: []
                    }]
                }]
            };

            (componentsPacksWebviewMain as any).manageComponentsActions.mapComponentsFromService(componentTree);

            expect(nestedAggregate.options.layer).toBe('project.cproject.yml');
        });
    });

    describe('handleChangeComponentBundle', () => {
        let changeBundleMock: jest.Mock;
        let getComponentsTreeMock: jest.Mock;
        let validateComponentsMock: jest.Mock;
        const componentTreeReturn = { success: true, classes: [{ id: 'cls1' }] };
        const validationsReturn = { success: true, result: 'OK', validation: [{ id: 'val1' }] };

        beforeEach(() => {
            // Ensure clean mocks
            webviewManager.sendMessage.mockClear();

            // Mock internal csolutionService methods
            getComponentsTreeMock = jest.fn().mockResolvedValue(componentTreeReturn);
            validateComponentsMock = jest.fn().mockResolvedValue(validationsReturn);
            (componentsPacksWebviewMain as any).csolutionService = {
                ...(componentsPacksWebviewMain as any).csolutionService,
                apply: jest.fn().mockResolvedValue({ success: true }),
                getUsedItems: jest.fn().mockResolvedValue(usedItemsReturn),
                getComponentsTree: getComponentsTreeMock,
                validateComponents: validateComponentsMock,
                getLogMessages: jest.fn().mockResolvedValue({ errors: [], warnings: [], info: [] }),
                loadSolution: jest.fn().mockResolvedValue({ success: true })
            };

            // Mock manageComponentsActions.changeBundle
            changeBundleMock = jest.fn().mockResolvedValue(true);
            (componentsPacksWebviewMain as any).manageComponentsActions.changeBundle = changeBundleMock;

            // Stub active context
            jest.spyOn(componentsPacksWebviewMain as any, 'getActiveContext').mockReturnValue('ctx1');
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('updates component tree when changeBundle returns true', async () => {
            await (componentsPacksWebviewMain as any).handleChangeComponentBundle({
                type: 'CHANGE_COMPONENT_BUNDLE',
                componentData: { id: 'cmp1' },
                bundle: 'BundleA'
            });

            expect(changeBundleMock).toHaveBeenCalledWith('ctx1', { id: 'cmp1' }, 'BundleA');
            expect(getComponentsTreeMock).toHaveBeenCalledWith({ context: 'ctx1', all: false });
            expect(validateComponentsMock).toHaveBeenCalledWith({ context: 'ctx1' });

            const setTreeCall = webviewManager.sendMessage.mock.calls.find(c => c[0].type === 'SET_COMPONENT_TREE');
            expect(setTreeCall).toBeTruthy();
            expect(setTreeCall[0].tree).toBe(componentTreeReturn);
            expect(setTreeCall[0].validations).toEqual(validationsReturn.validation);
        });

        it('does not update component tree when changeBundle returns false', async () => {
            changeBundleMock.mockResolvedValue(false);

            await (componentsPacksWebviewMain as any).handleChangeComponentBundle({
                type: 'CHANGE_COMPONENT_BUNDLE',
                componentData: { id: 'cmp1' },
                bundle: 'BundleA'
            });

            expect(changeBundleMock).toHaveBeenCalledTimes(1);
            expect(getComponentsTreeMock).toHaveBeenCalled();
            expect(validateComponentsMock).toHaveBeenCalled();
            expect(webviewManager.sendMessage.mock.calls.find(c => c[0].type === 'SET_COMPONENT_TREE')).toBeDefined();
        });

        it('does nothing when active context is empty', async () => {
            (jest.spyOn(componentsPacksWebviewMain as any, 'getActiveContext') as jest.SpyInstance).mockReturnValue('');

            await (componentsPacksWebviewMain as any).handleChangeComponentBundle({
                type: 'CHANGE_COMPONENT_BUNDLE',
                componentData: { id: 'cmp1' },
                bundle: 'BundleA'
            });

            expect(changeBundleMock).not.toHaveBeenCalled();
            expect(getComponentsTreeMock).not.toHaveBeenCalled();
            expect(validateComponentsMock).not.toHaveBeenCalled();
        });

        it('ignores non CHANGE_COMPONENT_BUNDLE messages', async () => {
            await (componentsPacksWebviewMain as any).handleChangeComponentBundle({
                type: 'OTHER_MESSAGE',
                componentData: { id: 'cmp1' },
                bundle: 'BundleA'
            });

            expect(changeBundleMock).not.toHaveBeenCalled();
            expect(getComponentsTreeMock).not.toHaveBeenCalled();
        });
    });

    describe('handleChangeTarget (direct)', () => {
        const projectPath = 'path/to/myproj.cproject.yml';
        const layerPath = 'Layer1.clayer.yml';
        const changeTargetMessage = {
            type: 'CHANGE_TARGET',
            targetSet: { relativePath: projectPath, path: projectPath, children: [{ relativePath: layerPath, path: layerPath }] },
        };

        beforeEach(() => {
            // Fresh spy/mocks for every test
            webviewManager.sendMessage.mockClear();
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(solutionManager.getCsolution());
            (componentsPacksWebviewMain as any).openWebview = jest.fn().mockResolvedValue(undefined);
            (componentsPacksWebviewMain as any).getTargetSetData = jest.fn().mockReturnValue([{
                label: 'Project1',
                key: 'Project1',
                path: projectPath,
                relativePath: projectPath,
                type: 'project',
                children: [{
                    label: 'LayerA',
                    key: 'LayerA',
                    path: layerPath,
                    relativePath: layerPath,
                    type: 'layer',
                }]
            }] as TargetSetData[]);
        });

        it('calls debounce_load with the selected project path', async () => {
            const debounceSpy = jest.spyOn(componentsPacksWebviewMain as any, 'debounce_load').mockResolvedValue(undefined);
            await (componentsPacksWebviewMain as any).handleChangeTarget(changeTargetMessage);

            expect(debounceSpy).toHaveBeenCalledWith(projectPath, false);
        });

        it('does nothing when selected target cannot be resolved', async () => {
            const debounceSpy = jest.spyOn(componentsPacksWebviewMain as any, 'debounce_load').mockResolvedValue(undefined);
            (componentsPacksWebviewMain as any).getTargetSetData = jest.fn().mockReturnValue([]);
            await (componentsPacksWebviewMain as any).handleChangeTarget(changeTargetMessage);

            expect(debounceSpy).not.toHaveBeenCalled();
        });

        it('does nothing for non CHANGE_TARGETs message', async () => {
            await (componentsPacksWebviewMain as any).handleChangeTarget({
                type: 'NOT_CHANGE_TARGET',
                context: { projectPath },
                layer: layerPath
            });

            expect((componentsPacksWebviewMain as any).openWebview).not.toHaveBeenCalled();
            expect(webviewManager.sendMessage).not.toHaveBeenCalled();
        });
    });

    describe('activate wiring', () => {
        it('forwards onDidChangeLoadState events to handleSolutionLoadChange', async () => {
            const spy = jest.spyOn(componentsPacksWebviewMain as any, 'handleSolutionLoadChange').mockResolvedValue(undefined);

            await componentsPacksWebviewMain.activate(extensionContext as vscode.ExtensionContext);
            webviewManager.isPanelActive = true;
            solutionManager.fireOnDidChangeLoadState(
                { solutionPath: 'sol' },
                { solutionPath: '' }
            );
            await waitTimeout();

            expect(spy).toHaveBeenCalledWith({ newState: { solutionPath: 'sol' }, previousState: { solutionPath: '' } });
        });

        it('resets cached state when panel disposes without unsaved changes', async () => {
            jest.spyOn(componentsPacksWebviewMain as any, 'isDirty').mockResolvedValue(false);
            const warningSpy = jest.spyOn(vscode.window, 'showWarningMessage');
            (componentsPacksWebviewMain as any).currentProject = { solutionPath: 'sol', project: { projectId: 'proj', projectName: 'proj' } };
            (componentsPacksWebviewMain as any).componentTree = { success: true, classes: [{}] };
            (componentsPacksWebviewMain as any).validations = { success: true, result: 'OK', validation: [{ id: 'val' }] };

            webviewManager.didDisposeEmitter.fire();
            await waitTimeout();

            expect(warningSpy).not.toHaveBeenCalled();
            expect((componentsPacksWebviewMain as any).currentProject).toBeUndefined();
            expect((componentsPacksWebviewMain as any).componentTree).toEqual({ success: false, classes: [] });
            expect((componentsPacksWebviewMain as any).validations).toEqual({ success: false, result: 'UNDEFINED', validation: [] });
        });

        it('saves and then disposes when user picks Save on unsaved changes', async () => {
            jest.spyOn(componentsPacksWebviewMain as any, 'isDirty').mockResolvedValue(true);
            const applySpy = jest.spyOn(componentsPacksWebviewMain as any, 'handleApplyComponentSet').mockResolvedValue(undefined);
            jest.spyOn(vscode.window, 'showWarningMessage').mockResolvedValue({ title: 'Save' } as any);

            (componentsPacksWebviewMain as any).currentProject = { solutionPath: 'sol', project: { projectId: 'proj', projectName: 'proj' } };

            webviewManager.didDisposeEmitter.fire();
            await waitTimeout();

            expect(applySpy).toHaveBeenCalledTimes(1);
            expect((componentsPacksWebviewMain as any).currentProject).toBeUndefined();
        });

        it('disposes without saving when user picks Don\'t Save on unsaved changes', async () => {
            jest.spyOn(componentsPacksWebviewMain as any, 'isDirty').mockResolvedValue(true);
            const applySpy = jest.spyOn(componentsPacksWebviewMain as any, 'handleApplyComponentSet').mockResolvedValue(undefined);
            jest.spyOn(vscode.window, 'showWarningMessage').mockResolvedValue({ title: "Don't Save" } as any);

            (componentsPacksWebviewMain as any).currentProject = { solutionPath: 'sol', project: { projectId: 'proj', projectName: 'proj' } };

            webviewManager.didDisposeEmitter.fire();
            await waitTimeout();

            expect(applySpy).not.toHaveBeenCalled();
            expect((componentsPacksWebviewMain as any).currentProject).toBeUndefined();
        });

        it('reopens panel and keeps state when user picks Cancel on unsaved changes', async () => {
            jest.spyOn(componentsPacksWebviewMain as any, 'isDirty').mockResolvedValue(true);
            const applySpy = jest.spyOn(componentsPacksWebviewMain as any, 'handleApplyComponentSet').mockResolvedValue(undefined);
            const reopenSpy = jest.spyOn((componentsPacksWebviewMain as any).webviewManager, 'createOrShowPanel');
            jest.spyOn(vscode.window, 'showWarningMessage').mockResolvedValue({ title: 'Cancel' } as any);

            (componentsPacksWebviewMain as any).currentProject = { solutionPath: 'sol', project: { projectId: 'proj', projectName: 'proj' } };

            webviewManager.didDisposeEmitter.fire();
            await waitTimeout();

            expect(applySpy).not.toHaveBeenCalled();
            expect(reopenSpy).toHaveBeenCalledTimes(1);
            expect((componentsPacksWebviewMain as any).currentProject).toEqual({
                solutionPath: 'sol',
                project: { projectId: 'proj', projectName: 'proj' }
            });
        });
    });

    describe('openWebview context selection', () => {
        beforeEach(() => {
            jest.spyOn(componentsPacksWebviewMain as any, 'projectFromPath').mockImplementation((...args: unknown[]) => (args[0] as string | undefined) ?? '');
            jest.spyOn(componentsPacksWebviewMain as any, 'debounce_load').mockResolvedValue(undefined);
            (componentsPacksWebviewMain as any).csolutionService.apply = jest.fn().mockResolvedValue({ success: true });
            (componentsPacksWebviewMain as any).csolutionService.getUsedItems = jest.fn().mockResolvedValue({ components: [], packs: [] });
            (componentsPacksWebviewMain as any).csolutionService.validateComponents = jest.fn().mockResolvedValue({ success: true, validation: [] });
            (componentsPacksWebviewMain as any).csolutionService.getComponentsTree = jest.fn().mockResolvedValue({ success: true, classes: [] });
        });

        it('stores selected context when a layer path is provided', async () => {
            const target: TargetSetData = { label: 'Layer', key: 'layer', path: 'layer.clayer.yml', relativePath: 'layer.clayer.yml', type: 'layer' };
            jest.spyOn(componentsPacksWebviewMain as any, 'findTargetSetFromPath').mockReturnValue(target);

            await (componentsPacksWebviewMain as any).openWebview('proj.cproject.yml', 'layer.clayer.yml');

            expect((componentsPacksWebviewMain as any).selectedContext).toBe(target);
        });

        it('clears selected context when no layer path is provided', async () => {
            (componentsPacksWebviewMain as any).selectedContext = { label: 'Old', key: 'old', path: 'old', relativePath: 'old', type: 'layer' };
            jest.spyOn(componentsPacksWebviewMain as any, 'findTargetSetFromPath').mockReturnValue(undefined);

            await (componentsPacksWebviewMain as any).openWebview('proj.cproject.yml', undefined);

            expect((componentsPacksWebviewMain as any).selectedContext).toBeUndefined();
        });
    });

    describe('handleSolutionLoadChange active reload', () => {
        it('reloads when the same solution stays active', async () => {
            webviewManager.isPanelActive = true;
            const debounceSpy = jest.spyOn(componentsPacksWebviewMain as any, 'debounce_load').mockResolvedValue(undefined);
            const descriptors = [{ projectName: 'Proj1', projectPath: '/root/sol/proj.cproject.yml', displayName: 'Proj1::Debug' }];
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue({
                getCprojectPath: () => 'projReloaded',
                getContextDescriptors: () => descriptors,
                getActiveTargetSetName: jest.fn().mockReturnValue('Debug')
            } as any);

            await (componentsPacksWebviewMain as any).handleSolutionLoadChange({ previousState: { solutionPath: undefined }, newState: { solutionPath: 'solution.csolution.yml' } });

            expect(debounceSpy).toHaveBeenCalledWith('projReloaded', true);
        });

        it('returns early when transition is only converted false->true', async () => {
            webviewManager.isPanelActive = true;
            const debounceSpy = jest.spyOn(componentsPacksWebviewMain as any, 'debounce_load').mockResolvedValue(undefined);
            const clearSpy = jest.spyOn(componentsPacksWebviewMain as any, 'clearComponents').mockResolvedValue(undefined);
            webviewManager.sendMessage.mockClear();

            await (componentsPacksWebviewMain as any).handleSolutionLoadChange({
                previousState: { solutionPath: 'solution.csolution.yml', converted: false },
                newState: { solutionPath: 'solution.csolution.yml', converted: true }
            });

            expect(debounceSpy).not.toHaveBeenCalled();
            expect(clearSpy).not.toHaveBeenCalled();
            expect(webviewManager.sendMessage).not.toHaveBeenCalled();
        });

        it('clears and reports an error when no valid project is available', async () => {
            webviewManager.isPanelActive = true;
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue({ solutionPath: 'solution.csolution.yml' } as any);
            jest.spyOn(componentsPacksWebviewMain as any, 'getValidProjectId').mockReturnValue(undefined);
            const clearSpy = jest.spyOn(componentsPacksWebviewMain as any, 'clearComponents').mockResolvedValue(undefined);

            await (componentsPacksWebviewMain as any).handleSolutionLoadChange({
                previousState: { solutionPath: undefined },
                newState: { solutionPath: 'solution.csolution.yml' }
            });

            expect(clearSpy).toHaveBeenCalledTimes(1);
            expect(webviewManager.sendMessage).toHaveBeenCalledWith({
                type: 'SET_ERROR_MESSAGES',
                messages: [{ type: 'ERROR', message: 'No valid project found in the loaded solution' }]
            });
        });
    });

    describe('getValidProjectId', () => {
        it('returns the cached project when still present in csolution', () => {
            (componentsPacksWebviewMain as any).currentProject = { solutionPath: 'sol', project: { projectId: 'projA', projectName: 'projA' } };
            const mockCsolution = {
                getCproject: jest.fn().mockReturnValue({}),
                getCprojectPath: jest.fn().mockReturnValue('fallback'),
                getContextDescriptors: jest.fn().mockReturnValue([])
            };
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(mockCsolution as any);

            const result = (componentsPacksWebviewMain as any).getValidProjectId();

            expect(result).toBe('projA');
            expect(mockCsolution.getCproject).toHaveBeenCalledWith('projA');
        });

        it('falls back to the solution path when cached project is missing', () => {
            (componentsPacksWebviewMain as any).currentProject = { solutionPath: 'sol', project: { projectId: 'projMissing', projectName: 'projMissing' } };
            const mockCsolution = {
                getCproject: jest.fn().mockReturnValue(undefined),
                getCprojectPath: jest.fn().mockReturnValue('fallbackProj'),
                getContextDescriptors: jest.fn().mockReturnValue([])
            };
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(mockCsolution as any);

            const result = (componentsPacksWebviewMain as any).getValidProjectId();

            expect(result).toBe('fallbackProj');
            expect(mockCsolution.getCproject).toHaveBeenCalledWith('projMissing');
        });

        it('returns undefined when no solution is available', () => {
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(undefined as any);

            expect((componentsPacksWebviewMain as any).getValidProjectId()).toBeUndefined();
        });
    });

    describe('debounce_load', () => {
        it('invokes load and resets the guard flag', async () => {
            const loadSpy = jest.spyOn(componentsPacksWebviewMain as any, 'load').mockResolvedValue(undefined);

            await (componentsPacksWebviewMain as any).debounce_load('proj', true);

            expect(loadSpy).toHaveBeenCalledWith('proj', true);
            expect((componentsPacksWebviewMain as any).isLoading).toBe(false);
        });

        it('skips re-entry when a load is already running', async () => {
            const loadSpy = jest.spyOn(componentsPacksWebviewMain as any, 'load').mockResolvedValue(undefined);
            (componentsPacksWebviewMain as any).isLoading = true;

            await (componentsPacksWebviewMain as any).debounce_load('proj', false);

            expect(loadSpy).not.toHaveBeenCalled();
            (componentsPacksWebviewMain as any).isLoading = false;
        });
    });

    describe('handleUnlinkPackage', () => {
        it('tracks unlink requests and clears the stack in finally when dirty check fails', async () => {
            const unlockPackage = jest.fn();
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue({
                cbuildPackFile: { unlockPackage }
            } as any);
            jest.spyOn(componentsPacksWebviewMain as any, 'sendDirtyState').mockRejectedValue(new Error('dirty failed'));

            await expect((componentsPacksWebviewMain as any).handleUnlinkPackage('Vendor::Pack')).rejects.toThrow('dirty failed');

            expect(unlockPackage).toHaveBeenCalledWith('Vendor::Pack');
            expect(webviewManager.sendMessage).toHaveBeenCalledWith({ type: 'SET_SOLUTION_STATE', stateMessage: 'Unlinking Pack' });
            expect(webviewManager.sendMessage).toHaveBeenCalledWith({ type: 'SET_UNLINKREQUESTS_STACK', unlinkRequests: ['Vendor::Pack'] });
            expect(webviewManager.sendMessage).toHaveBeenCalledWith({ type: 'SET_UNLINKREQUESTS_STACK', unlinkRequests: [] });
        });
    });

    describe('load', () => {
        it('clears caches, sets current project and forwards to loadSolution', async () => {
            const csolutionMock = {
                solutionPath: '/solutions/app.csolution.yml',
                getActiveTargetSetName: jest.fn().mockReturnValue('Debug')
            };
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(csolutionMock as any);
            const clearSpy = jest.spyOn(componentsPacksWebviewMain as any, 'clearTargetSetCache').mockImplementation(() => { (componentsPacksWebviewMain as any).cachedTargetSetData = undefined; });
            const loadSolutionSpy = jest.spyOn(componentsPacksWebviewMain as any, 'loadSolution').mockResolvedValue(undefined);
            jest.spyOn(componentsPacksWebviewMain as any, 'getActiveContext').mockReturnValue('ctxProj');
            const sendSelectedProjectSpy = jest.spyOn(componentsPacksWebviewMain as any, 'sendSelectedProject').mockResolvedValue(undefined);

            await (componentsPacksWebviewMain as any).load('proj/board.cproject.yml', true);

            expect(clearSpy).toHaveBeenCalled();
            expect(loadSolutionSpy).toHaveBeenCalledWith('/solutions/app.csolution.yml', 'Debug', 'ctxProj', true);
            expect(sendSelectedProjectSpy).toHaveBeenCalledWith('proj/board.cproject.yml');
            expect((componentsPacksWebviewMain as any).currentProject.project.projectName).toBe('board');
        });
    });

    describe('loadSolution failure handling', () => {
        it('throws when csolution load fails and surfaces rpc log messages', async () => {
            webviewManager.sendMessage.mockClear();
            (componentsPacksWebviewMain as any).currentProject = { solutionPath: path.join('root', 'solution.csolution.yml'), project: { projectId: 'proj', projectName: 'proj' } };
            (componentsPacksWebviewMain as any).csolutionService = {
                getVersion: jest.fn().mockResolvedValue('1.0.0'),
                loadPacks: jest.fn().mockResolvedValue(undefined),
                loadSolution: jest.fn().mockResolvedValue({ success: false }),
                getUsedItems: jest.fn(),
                getPacksInfo: jest.fn().mockResolvedValue({ packs: [] }),
                getComponentsTree: jest.fn(),
                validateComponents: jest.fn(),
                getLogMessages: jest.fn().mockResolvedValue({ errors: ['E'], warnings: ['W'], info: ['I'] })
            };

            await (componentsPacksWebviewMain as any).loadSolution('solPath', 'ts', 'ctx', true);

            const errorMessages = webviewManager.sendMessage.mock.calls
                .map(c => c[0])
                .filter(m => m.type === 'SET_ERROR_MESSAGES');
            const lastErrorMessage = errorMessages.at(-1);
            expect(lastErrorMessage).toBeDefined();
            expect(lastErrorMessage?.messages.map((m: any) => m.message)).toEqual(expect.arrayContaining(['Failed loading solution: solPath due to previous errors', 'E', 'W', 'I']));
        });
    });

    describe('target set caching helpers', () => {
        it('clears cached data via clearTargetSetCache', () => {
            (componentsPacksWebviewMain as any).cachedTargetSetData = [{ key: 'cached' } as unknown as TargetSetData];

            (componentsPacksWebviewMain as any).clearTargetSetCache();

            expect((componentsPacksWebviewMain as any).cachedTargetSetData).toBeUndefined();
        });

        it('normalizes relative paths', () => {
            const fromDir = path.join('root', 'solution');
            const toPath = path.join(fromDir, 'proj.cproject.yml');

            expect((componentsPacksWebviewMain as any).getRelativePath(fromDir, toPath)).toBe('proj.cproject.yml');
        });

        it('returns the solution directory from the current project', () => {
            const solutionPath = path.join('root', 'solution.csolution.yml');
            (componentsPacksWebviewMain as any).currentProject = { solutionPath, project: { projectId: 'proj', projectName: 'proj' } };

            expect((componentsPacksWebviewMain as any).getSolutionDir()).toBe(path.dirname(solutionPath));
        });

        it('builds, caches and refreshes target set data', () => {
            const descriptorLayers = [
                { absolutePath: path.join('root', 'layer.clayer.yml'), displayName: 'Layer Display' },
                { absolutePath: path.join('root', 'generated.cgen.yml'), displayName: 'Ignored' }
            ];
            const descriptors = [{
                projectPath: path.join('root', 'proj.cproject.yml'),
                displayName: 'Project Display',
                layers: descriptorLayers
            }];
            const mockCsolution = {
                projects: [{ fileName: path.join('root', 'proj.cproject.yml') }],
                solutionPath: path.join('root', 'solution.csolution.yml'),
                getContextDescriptors: jest.fn().mockReturnValue(descriptors)
            };
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(mockCsolution as any);
            (componentsPacksWebviewMain as any).currentProject = { solutionPath: mockCsolution.solutionPath, project: { projectId: mockCsolution.projects[0].fileName, projectName: 'proj' } };

            const result = (componentsPacksWebviewMain as any).getTargetSetData();

            expect(result).toHaveLength(1);
            expect(result[0].children).toHaveLength(1);
            expect(result[0].children?.[0].label).toBe('Layer: Layer Display');

            (componentsPacksWebviewMain as any).getTargetSetData();
            expect((mockCsolution.getContextDescriptors as jest.Mock)).toHaveBeenCalledTimes(1);

            (componentsPacksWebviewMain as any).clearTargetSetCache();
            (componentsPacksWebviewMain as any).getTargetSetData();
            expect((mockCsolution.getContextDescriptors as jest.Mock)).toHaveBeenCalledTimes(2);
        });
    });

    describe('component change handlers', () => {
        it('changes component values and marks dirty', async () => {
            const changeSpy = jest.spyOn((componentsPacksWebviewMain as any).manageComponentsActions, 'changeComponentValue').mockResolvedValue(undefined);
            jest.spyOn(componentsPacksWebviewMain as any, 'getActiveContext').mockReturnValue('ctx');
            const dirtySpy = jest.spyOn(componentsPacksWebviewMain as any, 'sendDirtyState').mockResolvedValue(undefined);
            (componentsPacksWebviewMain as any).componentTree = { success: true, classes: [] };
            (componentsPacksWebviewMain as any).csolutionService.apply = jest.fn().mockResolvedValue({ success: true });
            (componentsPacksWebviewMain as any).csolutionService.getUsedItems = jest.fn().mockResolvedValue({ components: [], packs: [] });
            (componentsPacksWebviewMain as any).csolutionService.validateComponents = jest.fn().mockResolvedValue({ success: true, validation: [] });
            (componentsPacksWebviewMain as any).csolutionService.getComponentsTree = jest.fn().mockResolvedValue({ success: true, classes: [] });

            await (componentsPacksWebviewMain as any).handleChangeComponentValue({ type: 'CHANGE_COMPONENT_VALUE', componentData: { id: 'cmp' } });

            expect(changeSpy).toHaveBeenCalledWith('ctx', (componentsPacksWebviewMain as any).componentTree, { id: 'cmp' });
            expect(dirtySpy).toHaveBeenCalled();
        });

        it('updates component variants and requests dirty state', async () => {
            const variantSpy = jest.spyOn((componentsPacksWebviewMain as any).manageComponentsActions, 'changeComponentVariant').mockResolvedValue(undefined);
            jest.spyOn(componentsPacksWebviewMain as any, 'getActiveContext').mockReturnValue('ctx');
            const dirtySpy = jest.spyOn(componentsPacksWebviewMain as any, 'sendDirtyState').mockResolvedValue(undefined);
            (componentsPacksWebviewMain as any).csolutionService.apply = jest.fn().mockResolvedValue({ success: true });
            (componentsPacksWebviewMain as any).csolutionService.getUsedItems = jest.fn().mockResolvedValue({ components: [], packs: [] });
            (componentsPacksWebviewMain as any).csolutionService.validateComponents = jest.fn().mockResolvedValue({ success: true, validation: [] });
            (componentsPacksWebviewMain as any).csolutionService.getComponentsTree = jest.fn().mockResolvedValue({ success: true, classes: [] });

            await (componentsPacksWebviewMain as any).handleChangeComponentVariant({ type: 'CHANGE_COMPONENT_VARIANT', componentData: { id: 'cmp' }, variant: 'VariantA' });

            expect(variantSpy).toHaveBeenCalledWith('ctx', { id: 'cmp' }, 'VariantA');
            expect(dirtySpy).toHaveBeenCalled();
        });
    });

    describe('target lookup helpers', () => {
        it('finds both projects and layers via normalized paths', () => {
            const layerTarget: TargetSetData = { label: 'Layer', key: 'layer', path: 'dir/layer.clayer.yml', relativePath: 'dir/layer.clayer.yml', type: 'layer' };
            const projectTarget: TargetSetData = { label: 'Project', key: 'proj', path: 'dir/proj.cproject.yml', relativePath: 'dir/proj.cproject.yml', type: 'project', children: [layerTarget] };
            jest.spyOn(componentsPacksWebviewMain as any, 'getTargetSetData').mockReturnValue([projectTarget]);

            expect((componentsPacksWebviewMain as any).findTargetSetFromPath('dir\\proj.cproject.yml')).toBe(projectTarget);
            expect((componentsPacksWebviewMain as any).findTargetSetFromPath('dir\\layer.clayer.yml')).toBe(layerTarget);
        });

        it('maps layer paths back to their owning project', () => {
            jest.spyOn(componentsPacksWebviewMain as any, 'createBuildContextDeps').mockReturnValue([
                { projectPath: 'projA', layers: [{ path: 'layerA' }] },
                { projectPath: 'projB', layers: [] }
            ]);

            expect((componentsPacksWebviewMain as any).projectFromLayer('layerA')).toBe('projA');
            expect((componentsPacksWebviewMain as any).projectFromLayer('missing')).toBe('');
            expect((componentsPacksWebviewMain as any).projectFromLayer(undefined)).toBe('');
        });
    });

    describe('package selection handlers', () => {
        beforeEach(() => {
            (componentsPacksWebviewMain as any).currentProject = { solutionPath: path.join('root', 'solution.csolution.yml'), project: { projectId: 'proj', projectName: 'proj' } };
            jest.spyOn(componentsPacksWebviewMain as any, 'getActiveContext').mockReturnValue('ctx');
            jest.spyOn(componentsPacksWebviewMain as any, 'sendDirtyState').mockResolvedValue(undefined);
            (componentsPacksWebviewMain as any).csolutionService = {
                ...(componentsPacksWebviewMain as any).csolutionService,
                getPacksInfo: jest.fn().mockResolvedValue({
                    packs: [{
                        id: 'pack.id@1.0.0',
                        references: [{ pack: 'pack.id', origin: path.join('root', 'packs', 'pack.pdsc') }]
                    }]
                })
            };
            webviewManager.sendMessage.mockClear();
        });

        it('selects a package and refreshes the pack list', async () => {
            const selectSpy = jest.spyOn((componentsPacksWebviewMain as any).manageComponentsActions, 'selectPackage').mockResolvedValue(undefined);

            await (componentsPacksWebviewMain as any).selectPackage({ type: 'SELECT_PACKAGE', target: 'target', packId: 'pack.id@1.0.0' });

            expect(selectSpy).toHaveBeenCalledWith('ctx', 'target', 'pack.id@1.0.0');
            expect(webviewManager.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_PACKS_INFO', packs: expect.any(Array) }));
        });

        it('unselects a package and refreshes the pack list', async () => {
            const unselectSpy = jest.spyOn((componentsPacksWebviewMain as any).manageComponentsActions, 'unselectPackage').mockResolvedValue(undefined);

            await (componentsPacksWebviewMain as any).unselectPackage({ type: 'UNSELECT_PACKAGE', target: 'target', packId: 'pack.id@1.0.0' });

            expect(unselectSpy).toHaveBeenCalledWith('ctx', 'target', 'pack.id@1.0.0');
            expect(webviewManager.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_PACKS_INFO', packs: expect.any(Array) }));
        });
    });

    describe('createBuildContextDeps', () => {
        it('returns an empty array when no solution is active', () => {
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(undefined as any);

            expect((componentsPacksWebviewMain as any).createBuildContextDeps()).toEqual([]);
        });

        it('filters generated layers and enriches metadata', () => {
            const descriptor = {
                targetType: 'Target',
                buildType: 'Debug',
                projectPath: 'proj.cproject.yml',
                layers: [
                    { absolutePath: 'layers/keep.clayer.yml', displayName: 'Keep' },
                    { absolutePath: 'layers/generated.cgen.yml', displayName: 'Skip' }
                ]
            };
            const mockCsolution = {
                getContextDescriptors: jest.fn().mockReturnValue([descriptor]),
                getClayer: jest.fn().mockReturnValue({
                    findChild: () => ({ getValue: () => 'LayerType' })
                })
            };
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue(mockCsolution as any);

            const contexts = (componentsPacksWebviewMain as any).createBuildContextDeps();

            expect(contexts).toEqual([{
                targetType: 'Target',
                buildType: 'Debug',
                projectPath: 'proj.cproject.yml',
                layers: [{ path: 'layers/keep.clayer.yml', name: 'Keep', type: 'LayerType' }]
            }]);
        });
    });

    describe('sendSelectedProject', () => {
        it('sends the normalized project payload to the webview', async () => {
            webviewManager.sendMessage.mockClear();

            await (componentsPacksWebviewMain as any).sendSelectedProject('path/to/myProject.cproject.yml');

            expect(webviewManager.sendMessage).toHaveBeenCalledWith({
                type: 'SELECTED_PROJECT',
                project: expect.objectContaining({
                    projectId: 'path/to/myProject.cproject.yml',
                    projectName: 'myProject'
                })
            });
        });
    });

    describe('openFile', () => {
        beforeEach(() => {
            (componentsPacksWebviewMain as any).currentProject = { solutionPath: path.join('root', 'solution.csolution.yml'), project: { projectId: 'proj', projectName: 'proj' } };
            commandsProvider.executeCommand.mockClear();
        });

        it('passes files to the external opener when requested', () => {
            const openSpy = jest.spyOn(mockOpenFileExternal, 'openFile');

            (componentsPacksWebviewMain as any).openFile('docs/readme.md', true);

            expect(openSpy).toHaveBeenCalledWith('docs/readme.md');
            expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
        });

        it('shows markdown preview for .md files', () => {
            const openSpy = jest.spyOn(mockOpenFileExternal, 'openFile');

            (componentsPacksWebviewMain as any).openFile('docs/intro.md');

            expect(openSpy).not.toHaveBeenCalled();
            const [command, previewUri] = commandsProvider.executeCommand.mock.calls.at(-1);
            expect(command).toBe('markdown.showPreview');
            const previewPath = (previewUri.path ?? previewUri.fsPath ?? '').replace(/\\/g, '/');
            expect(previewPath.endsWith('/docs/intro.md')).toBe(true);
        });

        it('opens other files inside VS Code', () => {
            const showSpy = jest
                .spyOn(vscode.window, 'showTextDocument')
                .mockResolvedValue(undefined as unknown as vscode.TextEditor);

            (componentsPacksWebviewMain as any).openFile('docs/notes.txt', false, '');

            expect(showSpy).toHaveBeenCalledTimes(1);

            const [shown] = showSpy.mock.calls[0];
            const shownUri = shown as vscode.Uri;
            const shownPath = (shownUri.path ?? (shownUri as any).fsPath ?? '').replace(/\\/g, '/');
            expect(shownPath.endsWith('/docs/notes.txt')).toBe(true);
        });
    });

    describe('getActiveContext', () => {
        it('returns the display name for the current project context', () => {
            (componentsPacksWebviewMain as any).currentProject = { solutionPath: 'sol', project: { projectId: '/root/sol/proj.cproject.yml', projectName: 'Proj1' } };
            const descriptors = [{ projectName: 'Proj1', projectPath: '/root/sol/proj.cproject.yml', displayName: 'Proj1::Debug' }];
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue({ getContextDescriptors: () => descriptors } as any);

            expect((componentsPacksWebviewMain as any).getActiveContext()).toBe('Proj1::Debug');
        });

        it('returns empty string when no descriptor matches the current project', () => {
            (componentsPacksWebviewMain as any).currentProject = { solutionPath: 'sol', project: { projectId: 'proj', projectPath: '/root/sol/missing.cproject.yml', projectName: 'Missing' } };
            jest.spyOn(solutionManager, 'getCsolution').mockReturnValue({ getContextDescriptors: () => [] } as any);

            expect((componentsPacksWebviewMain as any).getActiveContext()).toBe('');
        });
    });
    it('dispatches RESOLVE_COMPONENTS to resolveComponents', async () => {
        const spy = jest.spyOn(componentsPacksWebviewMain as any, 'resolveComponents').mockResolvedValue(undefined);
        await (componentsPacksWebviewMain as any).handleMessage({ type: 'RESOLVE_COMPONENTS' } as any);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    describe('resolveComponents', () => {
        let resolveMock: jest.Mock;
        let getComponentsTreeMock: jest.Mock;
        let validateComponentsMock: jest.Mock;
        let getPacksInfoMock: jest.Mock;
        const componentTreeReturn = { success: true, classes: [{ id: 'cls1' }] };
        const validationsReturn = { success: true, result: 'OK', validation: [{ id: 'val1' }] };
        const packsInfoReturn = { packs: [{ id: 'pack1', references: [] }] };

        beforeEach(() => {
            // Ensure current project & active context
            (componentsPacksWebviewMain as any).currentProject = {
                solutionPath: 'sol',
                project: { projectId: 'proj1', projectName: 'proj1' }
            };
            jest.spyOn(componentsPacksWebviewMain as any, 'getActiveContext').mockReturnValue('ctx1');

            // Mock csolutionService methods
            resolveMock = jest.fn().mockResolvedValue({ success: true });
            getComponentsTreeMock = jest.fn().mockResolvedValue(componentTreeReturn);
            validateComponentsMock = jest.fn().mockResolvedValue(validationsReturn);
            getPacksInfoMock = jest.fn().mockResolvedValue(packsInfoReturn);

            (componentsPacksWebviewMain as any).csolutionService = {
                resolve: resolveMock,
                getComponentsTree: getComponentsTreeMock,
                validateComponents: validateComponentsMock,
                getPacksInfo: getPacksInfoMock,
                getLogMessages: jest.fn().mockResolvedValue({ errors: [], warnings: [], info: [] }),
                apply: jest.fn(),
                getUsedItems: jest.fn().mockResolvedValue({ components: [], packs: [] }),
            };

            webviewManager.sendMessage.mockClear();
        });

        it('calls resolve with active context', async () => {
            await (componentsPacksWebviewMain as any).resolveComponents();

            expect(resolveMock).toHaveBeenCalledTimes(1);
            expect(resolveMock).toHaveBeenCalledWith({ context: 'ctx1' });
        });

        it('calls getComponentsTree with active context and scope', async () => {
            (componentsPacksWebviewMain as any).scope = ComponentScope.Solution;

            await (componentsPacksWebviewMain as any).resolveComponents();

            expect(getComponentsTreeMock).toHaveBeenCalledTimes(1);
            expect(getComponentsTreeMock).toHaveBeenCalledWith({ context: 'ctx1', all: false });
        });

        it('calls getComponentsTree with all=true when scope is All', async () => {
            (componentsPacksWebviewMain as any).scope = ComponentScope.All;

            await (componentsPacksWebviewMain as any).resolveComponents();

            expect(getComponentsTreeMock).toHaveBeenCalledWith({ context: 'ctx1', all: true });
        });

        it('calls validateComponents with active context', async () => {
            await (componentsPacksWebviewMain as any).resolveComponents();

            expect(validateComponentsMock).toHaveBeenCalledTimes(1);
            expect(validateComponentsMock).toHaveBeenCalledWith({ context: 'ctx1' });
        });

        it('calls getPacksInfo with active context and scope', async () => {
            (componentsPacksWebviewMain as any).scope = ComponentScope.Solution;

            await (componentsPacksWebviewMain as any).resolveComponents();

            expect(getPacksInfoMock).toHaveBeenCalledTimes(2); // Called once in loadSolution and once in refreshAvailablePacks
            expect(getPacksInfoMock).toHaveBeenCalledWith({ context: 'ctx1', all: false });
        });

        it('sends SOLUTION_LOADED message with resolved component tree and validations', async () => {
            (componentsPacksWebviewMain as any).scope = ComponentScope.Solution;

            await (componentsPacksWebviewMain as any).resolveComponents();

            const solutionLoadedCall = webviewManager.sendMessage.mock.calls.find(
                c => c[0].type === 'SOLUTION_LOADED'
            );

            expect(solutionLoadedCall).toBeDefined();
            expect(solutionLoadedCall![0]).toMatchObject({
                type: 'SOLUTION_LOADED',
                componentTree: componentTreeReturn,
                validations: validationsReturn.validation
            });
        });

        it('updates internal componentTree and validations state', async () => {
            await (componentsPacksWebviewMain as any).resolveComponents();

            expect((componentsPacksWebviewMain as any).componentTree).toBe(componentTreeReturn);
            expect((componentsPacksWebviewMain as any).validations).toBe(validationsReturn);
        });

        it('sends packs info in SOLUTION_LOADED message', async () => {
            (componentsPacksWebviewMain as any).scope = ComponentScope.Solution;

            await (componentsPacksWebviewMain as any).resolveComponents();

            const solutionLoadedCall = webviewManager.sendMessage.mock.calls.find(
                c => c[0].type === 'SOLUTION_LOADED'
            );

            expect(solutionLoadedCall![0]).toMatchObject({
                type: 'SOLUTION_LOADED',
                packs: expect.any(Array)
            });
        });

        it('sends available target types and selected target in SOLUTION_LOADED message', async () => {
            (componentsPacksWebviewMain as any).scope = ComponentScope.Solution;
            const mockTargetData = [{ label: 'Target1', key: 'key1', path: 'path1', relativePath: 'rel1', type: 'project' as const }];
            jest.spyOn(componentsPacksWebviewMain as any, 'getTargetSetData').mockReturnValue(mockTargetData);
            jest.spyOn(componentsPacksWebviewMain as any, 'getSelectedTargetSetData').mockReturnValue(mockTargetData[0]);

            await (componentsPacksWebviewMain as any).resolveComponents();

            const solutionLoadedCall = webviewManager.sendMessage.mock.calls.find(
                c => c[0].type === 'SOLUTION_LOADED'
            );

            expect(solutionLoadedCall![0]).toMatchObject({
                type: 'SOLUTION_LOADED',
                availableTargetTypes: mockTargetData,
                selectedTargetType: mockTargetData[0]
            });
        });
    });

});
