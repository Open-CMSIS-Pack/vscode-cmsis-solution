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

import 'jest';
import * as vscode from 'vscode';
import { waitTimeout } from '../../__test__/test-waits';
import { csolutionFactory, CSolutionMock } from '../../solutions/csolution.factory';
import { SolutionEventHub } from '../../solutions/solution-event-hub';
import { MockSolutionManager, solutionManagerFactory } from '../../solutions/solution-manager.factories';
import { MockCommandsProvider, commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { MockMessageProvider, messageProviderFactory } from '../../vscode-api/message-provider.factories';
import { getMockWebViewManager, MockWebviewManager } from '../__test__/mock-webview-manager';
import { WebviewManager } from '../webview-manager';
import { copyLayerToProject } from './board-layer';
import { ManageLayersWebviewMain } from './manage-layers-webview-main';
import * as Messages from './messages';
import { TargetConfiguration } from './view/state/reducer';

jest.mock('./board-layer', () => ({
    copyLayerToProject: jest.fn().mockResolvedValue(undefined),
}));

describe('ManageLayersWebviewMain', () => {
    let manageLayersWebviewMain: ManageLayersWebviewMain;
    let solutionManager: MockSolutionManager;
    let csolution: CSolutionMock;
    let eventHub: SolutionEventHub;
    let commandsProvider: MockCommandsProvider;
    let messageProvider: MockMessageProvider;
    let webviewManager: MockWebviewManager<Messages.OutgoingMessage>;
    let context: { subscriptions: vscode.Disposable[] };
    let compilerNode: { setValue: jest.Mock };
    let variablesNode: { getChildByValue: jest.Mock; createChild: jest.Mock };
    let variableItem: { setValue: jest.Mock };
    let targetTypeItem: { createChild: jest.Mock };
    let save: jest.Mock;

    const mockedCopyLayerToProject = jest.mocked(copyLayerToProject);

    const configureVariable = {
        name: 'BOARD_LAYER',
        clayer: 'Vendor::Board.Layer',
        description: 'Board layer',
        settings: [{ set: 'Debug' }],
        path: '/source/layer',
        file: 'board.clayer.yml',
        'copy-to': 'Config/Layer',
    };

    const configuredLayer: TargetConfiguration = {
        variables: [{
            variableName: 'BOARD_LAYER',
            variableValue: 'Vendor::Board.Layer',
            description: 'Board layer',
            settings: [{ set: 'Debug' }],
            path: '/source/layer',
            file: 'board.clayer.yml',
            copyTo: 'Config/Layer',
            copyToOrig: 'Config/Layer',
            disabled: false,
        }],
    };

    async function fireOutgoingMessage(message: Messages.OutgoingMessage): Promise<void> {
        webviewManager.didReceiveMessageEmitter.fire(message);
        await waitTimeout();
    }

    async function fireConfigureSolutionDataReady(data: { availableCompilers: string[]; availableConfigurations: Array<{ variables: typeof configureVariable[] }> | undefined }): Promise<void> {
        await eventHub.fireConfigureSolutionDataReady(data);
        await waitTimeout();
    }

    beforeEach(async () => {
        compilerNode = { setValue: jest.fn() };
        variableItem = { setValue: jest.fn().mockReturnThis() };
        variablesNode = {
            getChildByValue: jest.fn().mockReturnValue(undefined),
            createChild: jest.fn().mockReturnValue(variableItem),
        };
        targetTypeItem = {
            createChild: jest.fn().mockReturnValue(variablesNode),
        };
        save = jest.fn().mockResolvedValue(undefined);

        csolution = csolutionFactory({
            solutionDir: 'C:/workspace/solution',
            getActiveTargetType: jest.fn().mockReturnValue('Debug'),
            getDefaultTargetTypeItem: jest.fn().mockReturnValue(targetTypeItem as never),
            csolutionYml: {
                topItem: compilerNode,
                save,
            } as never,
        });

        solutionManager = solutionManagerFactory();
        solutionManager.getCsolution.mockReturnValue(csolution);
        eventHub = new SolutionEventHub();
        commandsProvider = commandsProviderFactory();
        messageProvider = messageProviderFactory();
        webviewManager = getMockWebViewManager<Messages.OutgoingMessage>();
        context = { subscriptions: [] };
        mockedCopyLayerToProject.mockResolvedValue(undefined);

        manageLayersWebviewMain = new ManageLayersWebviewMain(
            context as unknown as vscode.ExtensionContext,
            commandsProvider,
            messageProvider,
            solutionManager,
            eventHub,
            webviewManager as unknown as WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>,
        );

        await manageLayersWebviewMain.activate(context as unknown as vscode.ExtensionContext);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('activates and registers message/event subscriptions', () => {
        expect(webviewManager.activate).toHaveBeenCalledWith(context);
        expect(context.subscriptions).toHaveLength(2);
    });

    it('opens the panel and sends board layer data when configurations are available', async () => {
        await fireConfigureSolutionDataReady({
            availableCompilers: ['AC6', 'GCC'],
            availableConfigurations: [{ variables: [configureVariable] }],
        });

        expect(webviewManager.createOrShowPanel).toHaveBeenCalledTimes(1);
        expect(webviewManager.sendMessage).toHaveBeenCalledWith({
            type: 'BOARD_LAYER_DATA',
            layers: [configuredLayer],
            activeTargetType: 'Debug',
            availableCompilers: ['AC6', 'GCC'],
        });
    });

    it('opens the panel and sends no-data when only multiple compilers are available', async () => {
        await fireConfigureSolutionDataReady({
            availableCompilers: ['AC6', 'GCC'],
            availableConfigurations: undefined,
        });

        expect(webviewManager.createOrShowPanel).toHaveBeenCalledTimes(1);
        expect(webviewManager.sendMessage).toHaveBeenCalledWith({
            type: 'BOARD_LAYER_NODATA',
            activeTargetType: 'Debug',
            availableCompilers: ['AC6', 'GCC'],
        });
    });

    it('auto-applies compiler when exactly one compiler is available', async () => {
        await fireConfigureSolutionDataReady({
            availableCompilers: ['AC6'],
            availableConfigurations: undefined,
        });

        expect(compilerNode.setValue).toHaveBeenCalledWith('compiler', 'AC6');
        expect(save).toHaveBeenCalledTimes(1);
        expect(webviewManager.createOrShowPanel).not.toHaveBeenCalled();
        expect(webviewManager.sendMessage).not.toHaveBeenCalled();
    });

    it('handles CHECK_LAYER_DOES_NOT_EXIST without sending a success acknowledgement', async () => {
        await fireOutgoingMessage({
            type: 'CHECK_LAYER_DOES_NOT_EXIST',
            layerFolder: '__definitely_missing_layer_path__',
            variableId: 7,
        });

        expect(webviewManager.sendMessage).toHaveBeenCalledWith({
            type: 'RESULT_LAYER_EXISTS_CHECK',
            variableId: 7,
            result: false,
        });
        expect(webviewManager.sendMessage).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'REQUEST_SUCCESSFUL' }));
    });

    it('applies layer and compiler from APPLY_CONFIGURE', async () => {
        await fireConfigureSolutionDataReady({
            availableCompilers: ['AC6', 'GCC'],
            availableConfigurations: [{ variables: [configureVariable] }],
        });
        webviewManager.sendMessage.mockClear();
        save.mockClear();

        await fireOutgoingMessage({
            type: 'APPLY_CONFIGURE',
            layer: configuredLayer,
            compiler: 'GCC',
        });

        expect(targetTypeItem.createChild).toHaveBeenCalledWith('variables', true);
        expect(variablesNode.getChildByValue).toHaveBeenCalledWith('BOARD_LAYER');
        expect(variablesNode.createChild).toHaveBeenCalledWith('-', false);
        expect(variableItem.setValue).toHaveBeenNthCalledWith(1, 'BOARD_LAYER', '$SolutionDir()$/Config/Layer/board.clayer.yml');
        expect(variableItem.setValue).toHaveBeenNthCalledWith(2, 'copied-from', 'Vendor::Board.Layer');
        expect(mockedCopyLayerToProject).toHaveBeenCalledWith(configuredLayer, 'C:/workspace/solution');
        expect(compilerNode.setValue).toHaveBeenCalledWith('compiler', 'GCC');
        expect(save).toHaveBeenCalledTimes(2);
        expect(webviewManager.sendMessage).toHaveBeenCalledWith({
            type: 'REQUEST_SUCCESSFUL',
            requestType: 'APPLY_CONFIGURE',
        });
    });

    it('reports apply failures without sending a success acknowledgement', async () => {
        mockedCopyLayerToProject.mockRejectedValueOnce(new Error('copy failed'));
        await fireConfigureSolutionDataReady({
            availableCompilers: ['AC6', 'GCC'],
            availableConfigurations: [{ variables: [configureVariable] }],
        });
        webviewManager.sendMessage.mockClear();

        await fireOutgoingMessage({
            type: 'APPLY_CONFIGURE',
            layer: configuredLayer,
            compiler: 'GCC',
        });

        expect(messageProvider.showErrorMessage).toHaveBeenCalledWith('Failed to apply changes: copy failed');
        expect(webviewManager.sendMessage).toHaveBeenCalledWith({
            type: 'REQUEST_FAILED',
            requestType: 'APPLY_CONFIGURE',
            errorMessage: 'Failed to apply changes: copy failed',
        });
        expect(webviewManager.sendMessage).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'REQUEST_SUCCESSFUL' }));
    });
});