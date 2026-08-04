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

import 'jest';
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import type { ExtensionContext, WorkspaceFolder } from 'vscode';
import { CreateSolutionWebviewMain } from './create-solution-webview-main';
import { WebviewManager } from '../webview-manager';
import * as Messages from './messages';
import { URI } from 'vscode-uri';
import { waitTimeout } from '../../__test__/test-waits';
import { MockMessageProvider, messageProviderFactory } from '../../vscode-api/message-provider.factories';
import { MockCommandsProvider, commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { MockWorkspaceFoldersProvider, workspaceFoldersProviderFactory } from '../../vscode-api/workspace-folders-provider.factories';
import { newProjectFactory } from './cmsis-solution-types.factories';
import { SolutionCreator } from '../../solutions/solution-creator';
import { dataManagerFactory, MockDataManager } from '../../data-manager/data-manager.factories';
import { pathsEqual } from '../../utils/path-utils';
import { CreateSolutionData } from './create-solution-data';
import { CreateSolutionController } from './create-solution-controller';

jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdir: jest.fn(),
    copyFile: jest.fn(),
    openSync: jest.fn(),
    closeSync: jest.fn(),
    rmdirSync: jest.fn(),
    unlinkSync: jest.fn(),
    constants: {
        O_CREAT: 0,
        O_EXCL: 0,
        O_RDWR: 0,
    },
}));

const WORKSPACE_ROOT_URI = URI.file(path.join(__dirname, 'local'));
const EXTENSION_URI = URI.file(path.join(__dirname, 'extension'));

const mockFsExistsSync = fs.existsSync as jest.Mock;
const mockShowTextDocument = vscode.window.showTextDocument as jest.Mock;

describe('CreateSolutionWebviewMain', () => {
    const requestId = 'request-id';
    const solutionName = 'TEST_SOLUTION';
    const solutionLocation = __dirname;
    const solutionFolder = solutionName;

    const targetTypes = [{ type: 'some-type' }];
    const compiler = 'TEST_COMPILER';

    let webviewManager: {
        onDidReceiveMessage: vscode.Event<Messages.OutgoingMessage>;
        onDidDispose: vscode.Event<void>;
        activate: jest.Mock;
        sendMessage: jest.Mock;
        asWebviewUri: (uri: URI) => string;
    };

    let receiveMessageEmitter: vscode.EventEmitter<Messages.OutgoingMessage>;
    let webviewMain: CreateSolutionWebviewMain;
    let messageProvider: MockMessageProvider;
    let workspaceFoldersProvider: MockWorkspaceFoldersProvider;
    let dataManager: MockDataManager;
    let commandsProvider: MockCommandsProvider;
    let mockOpenDialog: jest.Mock;
    let mockSolutionCreator: jest.Mocked<SolutionCreator>;

    beforeEach(async () => {
        workspaceFoldersProvider = workspaceFoldersProviderFactory();
        (vscode.workspace as unknown as { workspaceFolders: WorkspaceFolder[] }).workspaceFolders = [{ uri: WORKSPACE_ROOT_URI } as WorkspaceFolder];

        receiveMessageEmitter = new vscode.EventEmitter();

        webviewManager = {
            onDidReceiveMessage: receiveMessageEmitter.event,
            onDidDispose: new vscode.EventEmitter<void>().event,
            activate: jest.fn(),
            sendMessage: jest.fn(),
            asWebviewUri: () => 'test-webview-uri',
        };

        messageProvider = messageProviderFactory();
        dataManager = dataManagerFactory();
        commandsProvider = commandsProviderFactory();
        mockOpenDialog = vscode.window.showOpenDialog as jest.Mock;

        mockSolutionCreator = { createSolution: jest.fn() };

        const extensionContext = { extensionUri: EXTENSION_URI } as unknown as ExtensionContext;
        const dataModel = new CreateSolutionData(extensionContext, webviewManager.asWebviewUri, dataManager);
        const controller = new CreateSolutionController(
            dataModel,
            mockSolutionCreator,
            messageProvider,
            commandsProvider,
            workspaceFoldersProvider,
            mockFsExistsSync,
            mockOpenDialog,
        );
        webviewMain = new CreateSolutionWebviewMain(
            webviewManager as unknown as WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>,
            controller,
            dataModel,
        );

        await webviewMain.activate({ subscriptions: [] } as unknown as ExtensionContext);

        mockFsExistsSync.mockResolvedValue(true);
        mockShowTextDocument.mockResolvedValue(undefined);
        messageProvider.showInformationMessage.mockResolvedValue(undefined);
    });

    it('forwards a NEW_SOLUTION request to the solution creator', async () => {
        const projects = [newProjectFactory()];
        receiveMessageEmitter.fire({ type: 'NEW_SOLUTION', requestId, solutionName, projects, gitInit: false, targetTypes, solutionLocation, solutionFolder, packs: [], compiler });

        await waitTimeout();

        expect(mockSolutionCreator.createSolution).toHaveBeenCalledWith({
            solutionName,
            projects,
            targetTypes: [{ type: 'some-type', board: undefined, device: undefined }],
            packs: [],
            gitInit: false,
            solutionLocation,
            solutionFolder,
            compiler,
            showOpenDialog: undefined,
            draftProject: undefined,
        });
    });

    it('sends an error event if creation fails', async () => {
        const errorMessage = 'it blew up 💣';
        mockSolutionCreator.createSolution.mockRejectedValue(new Error(errorMessage));

        const projects = [newProjectFactory()];
        receiveMessageEmitter.fire({ type: 'NEW_SOLUTION', requestId, solutionName, projects, gitInit: false, targetTypes: targetTypes, solutionLocation: '', solutionFolder, packs: [], compiler });

        await waitTimeout();

        expect(messageProvider.showErrorMessage).toHaveBeenCalledWith(`Failed to create solution: ${errorMessage}`);
        expect(webviewManager.sendMessage).toHaveBeenCalledWith({
            type: 'REQUEST_FAILED',
            requestType: 'NEW_SOLUTION',
            requestId,
            errorMessage: `Failed to create solution: ${errorMessage}`,
        });
        expect(webviewManager.sendMessage).not.toHaveBeenCalledWith({
            type: 'REQUEST_SUCCESSFUL',
            requestType: 'NEW_SOLUTION',
            requestId,
        });
    });

    it('waits for forwarded model calls before acknowledging the request', async () => {
        let resolveTargetData!: (value: Awaited<ReturnType<CreateSolutionData['getTargets']>>) => void;
        const targetDataPending = new Promise<Awaited<ReturnType<CreateSolutionData['getTargets']>>>(resolve => {
            resolveTargetData = resolve;
        });
        const getTargets = jest.spyOn(CreateSolutionData.prototype, 'getTargets').mockReturnValue(targetDataPending);

        receiveMessageEmitter.fire({ type: 'DATA_GET_TARGETS', requestId });
        await waitTimeout();

        expect(getTargets).toHaveBeenCalledTimes(1);
        expect(webviewManager.sendMessage).not.toHaveBeenCalledWith({
            type: 'REQUEST_SUCCESSFUL',
            requestType: 'DATA_GET_TARGETS',
            requestId,
        });

        resolveTargetData({ data: { boards: [], devices: [] }, errors: [] });
        await waitTimeout();

        expect(webviewManager.sendMessage).toHaveBeenCalledWith({
            type: 'REQUEST_SUCCESSFUL',
            requestType: 'DATA_GET_TARGETS',
            requestId,
        });
        getTargets.mockRestore();
    });

    it('handles the OPEN_FILE_PICKER message', async () => {
        messageProvider.showInformationMessage.mockResolvedValue({
            title: 'Open',
            isCloseAffordance: false,
        });

        const filePath = path.join(__dirname, 'test', 'path');
        const fileUri = URI.file(filePath);

        mockOpenDialog.mockResolvedValue([fileUri]);

        receiveMessageEmitter.fire({ type: 'OPEN_FILE_PICKER', requestId });

        await waitTimeout();

        const output = pathsEqual(webviewManager.sendMessage.mock.calls[0][0].data.path, filePath);
        expect(output).toBe(true);
    });

    it('sets the default solution location to be the parent directory ', async () => {
        workspaceFoldersProvider.workspaceFolders = [
            { name: 'my-folder-1', index: 0, uri: URI.file(path.join('path', 'to', 'my', 'my-folder-1')) },
            { name: 'my-folder-2', index: 1, uri: URI.file(path.join('path', 'to', 'my', 'my-folder-2')) },
        ];

        receiveMessageEmitter.fire({ type: 'DATA_GET_DEFAULT_LOCATION', requestId });

        await waitTimeout();

        const currentLocation = workspaceFoldersProvider.workspaceFolders[0].uri.fsPath;
        const defaultLocation = path.dirname(currentLocation);
        expect(webviewManager.sendMessage).toHaveBeenCalledWith({ type: 'SOLUTION_LOCATION', requestId, data: { path: defaultLocation } });
    });

    it('sends the name of the connected board when it receives DATA_GET_CONNECTED_DEVICE', async () => {
        const expectedBoardName = 'blorp';
        commandsProvider.executeCommandIfRegistered.mockImplementation(command => {
            if (command === 'device-manager.getBuildTargetName') {
                return Promise.resolve(expectedBoardName);
            } else {
                return Promise.resolve();
            }
        });
        receiveMessageEmitter.fire({ type: 'DATA_GET_CONNECTED_DEVICE', requestId });

        await waitTimeout();

        const expectedMessage: Messages.IncomingMessage = {
            type: 'CONNECTED_BOARD',
            requestId,
            data: { name: expectedBoardName },
        };

        const hardwareInfoMessage = webviewManager.sendMessage.mock.calls.find(callArguments => callArguments[0].type === expectedMessage.type)[0];

        expect(hardwareInfoMessage).toEqual(expectedMessage);
    });
});
