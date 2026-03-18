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
import * as YAML from 'yaml';
import type { ExtensionContext, WorkspaceFolder } from 'vscode';
import { CreateSolutionWebviewMain } from './create-solution-webview-main';
import { WebviewManager } from '../webview-manager';
import * as Messages from './messages';
import { URI, Utils as UriUtils } from 'vscode-uri';
import { waitTimeout } from '../../__test__/test-waits';
import { MockMessageProvider, messageProviderFactory } from '../../vscode-api/message-provider.factories';
import { MockCommandsProvider, commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { workspaceFsProviderFactory } from '../../vscode-api/workspace-fs-provider.factories';
import { MockWorkspaceFsProvider } from '../../vscode-api/workspace-fs-provider.factories';
import { newSolution } from '../../solutions/parsing/solution-file-parsing';
import { newProject } from '../../solutions/parsing/project-file-parsing';
import { createSolutionData } from '../../core-tools/core-tools-data-building';
import { MockWorkspaceFoldersProvider, workspaceFoldersProviderFactory } from '../../vscode-api/workspace-folders-provider.factories';
import { NewProject } from './cmsis-solution-types';
import { ComponentData } from '../../solutions/parsing/common-file-parsing';
import { newProjectFactory } from './cmsis-solution-types.factories';
import { processorDataFactory } from '../../solutions/parsing/processor-data-parsing.factories';
import { MockSolutionInitialiser, SolutionInitialiserFactory } from '../../solutions/solution-initialiser.factory';
import { SolutionCreator, SolutionCreatorImp } from '../../solutions/solution-creator';
import { PROJECT_SUFFIX } from '../../solutions/constants';
import { dataManagerFactory, MockDataManager } from '../../data-manager/data-manager.factories';
import { CreateSolutionFromDataManager } from '../../solutions/create-solution-from-data-manager';
import { pathsEqual } from '../../utils/path-utils';

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
const mockFsMkdir = fs.mkdir as unknown as jest.Mock;
const mockFsCopyFile = fs.copyFile as unknown as jest.Mock;
const mockShowTextDocument = vscode.window.showTextDocument as jest.Mock;

describe('CreateSolutionWebviewMain', () => {
    const solutionName = 'TEST_SOLUTION';
    const solutionLocation = __dirname;
    const solutionFolder = solutionName;
    const solutionPath = UriUtils.joinPath(URI.file(solutionLocation), solutionName, `${solutionName}.csolution.yml`).fsPath;
    const solutionDir = path.dirname(solutionPath);

    const targetTypes = [{ type: 'some-type', misc: [] }];
    const compiler = 'TEST_COMPILER';

    const createProjectPath = (project: NewProject) => UriUtils.joinPath(URI.file(solutionDir), project.name, project.name + PROJECT_SUFFIX).fsPath;

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
    let workspaceFsProvider: MockWorkspaceFsProvider;
    let workspaceFoldersProvider: MockWorkspaceFoldersProvider;
    let dataManager: MockDataManager;
    let commandsProvider: MockCommandsProvider;
    let mockReconcileSolutionFiles: jest.Mock;
    let mockSolutionInitialiser: MockSolutionInitialiser;
    let mockCreateSolutionFromDataManager: jest.MockedFunction<CreateSolutionFromDataManager>;
    let mockOpenDialog: jest.Mock;
    let mockSolutionCreator: SolutionCreator;

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
        workspaceFsProvider = workspaceFsProviderFactory();
        dataManager = dataManagerFactory();
        commandsProvider = commandsProviderFactory();
        mockReconcileSolutionFiles = jest.fn();
        mockCreateSolutionFromDataManager = jest.fn();
        mockSolutionInitialiser = SolutionInitialiserFactory();
        mockOpenDialog = vscode.window.showOpenDialog as jest.Mock;

        mockSolutionCreator = new SolutionCreatorImp(mockCreateSolutionFromDataManager, mockSolutionInitialiser, workspaceFsProvider, mockReconcileSolutionFiles);

        webviewMain = new CreateSolutionWebviewMain(mockSolutionCreator, { extensionUri: EXTENSION_URI } as unknown as ExtensionContext, messageProvider, commandsProvider, workspaceFoldersProvider, dataManager, webviewManager as unknown as WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>);

        await webviewMain.activate({ subscriptions: [] } as unknown as ExtensionContext);

        mockFsMkdir.mockImplementation((_path: string, _options: fs.MakeDirectoryOptions, callback: () => void) => {
            callback();
        });
        mockFsCopyFile.mockImplementation((_src: string, _dest: string, callback: () => void) => {
            callback();
        });

        workspaceFsProvider.readUtf8File.mockResolvedValue('solution: {}');
        mockFsExistsSync.mockResolvedValue(true);
        mockShowTextDocument.mockResolvedValue(undefined);
        messageProvider.showInformationMessage.mockResolvedValue(undefined);
    });

    it('creates a solution with correct project templates when it receives a SOLUTION_NEW message', async () => {
        const basicProject = newProjectFactory({ trustzone: 'off' });
        const basicProjectPath = createProjectPath(basicProject);
        const secureProject = newProjectFactory({ trustzone: 'secure' });
        const secureProjectPath = createProjectPath(secureProject);
        const nonSecureProject = newProjectFactory({ trustzone: 'non-secure' });
        const nonSecureProjectPath = createProjectPath(nonSecureProject);
        const components: ComponentData[] = [
            { reference: 'ARM::CMSIS:CORE', forContext: [], notForContext: [], instances: 1 },
            { reference: 'Device:Startup', forContext: [], notForContext: [], instances: 1 },
        ];

        const projects = [basicProject, secureProject, nonSecureProject];

        const expectedSolution = newSolution(solutionPath, [`${secureProject.name}/${secureProject.name}.cproject.yml`, `${nonSecureProject.name}/${nonSecureProject.name}.cproject.yml`, `${basicProject.name}/${basicProject.name}.cproject.yml`], targetTypes, [], compiler);
        const newBasicProject = newProject(basicProjectPath, basicProject.processorName, processorDataFactory({ trustzone: basicProject.trustzone }), components);
        const newSecureProject = newProject(secureProjectPath, secureProject.processorName, processorDataFactory({ trustzone: secureProject.trustzone }), components);
        const newNonSecureProject = newProject(nonSecureProjectPath, nonSecureProject.processorName, processorDataFactory({ trustzone: nonSecureProject.trustzone }), components);

        receiveMessageEmitter.fire({ type: 'NEW_SOLUTION', solutionName, projects, gitInit: false, targetTypes: targetTypes, solutionLocation, solutionFolder, packs: [], compiler });

        await waitTimeout();

        expect(mockReconcileSolutionFiles).toHaveBeenCalledWith(
            workspaceFsProvider,
            solutionPath,
            expectedSolution.value.projects,
            createSolutionData({
                solution: { file: expectedSolution, cloneYamlDocument: () => new YAML.Document() },
                projects: [
                    { file: newSecureProject, cloneYamlDocument: () => new YAML.Document(), referencePath: `${secureProject.name}/${secureProject.name}.cproject.yml` },
                    { file: newNonSecureProject, cloneYamlDocument: () => new YAML.Document(), referencePath: `${nonSecureProject.name}/${nonSecureProject.name}.cproject.yml` },
                    { file: newBasicProject, cloneYamlDocument: () => new YAML.Document(), referencePath: `${basicProject.name}/${basicProject.name}.cproject.yml` },
                ],
                layers: [],
            }).toObject(),
        );
    });

    it('creates a directory for the solution and each project', async () => {
        const project1 = newProjectFactory();
        const project1Dir = path.dirname(createProjectPath(project1));
        const project2 = newProjectFactory();
        const project2Dir = path.dirname(createProjectPath(project2));

        receiveMessageEmitter.fire({ type: 'NEW_SOLUTION', solutionName, projects: [project1, project2], gitInit: false, targetTypes: targetTypes, solutionLocation, solutionFolder, packs: [], compiler });

        await waitTimeout();

        expect(mockFsMkdir).toHaveBeenCalledWith(solutionDir, { recursive: true }, expect.any(Function));
        expect(mockFsMkdir).toHaveBeenCalledWith(project1Dir, { recursive: true }, expect.any(Function));
        expect(mockFsMkdir).toHaveBeenCalledWith(project2Dir, { recursive: true }, expect.any(Function));
    });

    it('initialises the solution after creation', async () => {
        const message: Messages.NewSolutionMessage = { type: 'NEW_SOLUTION', solutionName, projects: [newProjectFactory()], gitInit: false, targetTypes: targetTypes, solutionLocation, solutionFolder, packs: [], compiler };
        receiveMessageEmitter.fire(message);

        await waitTimeout();

        expect(mockSolutionInitialiser.initialiseSolution).toHaveBeenCalled();
    });

    it('creates c, project and solution files for a new solution', async () => {
        const project = newProjectFactory();
        const projectPath = path.join(solutionDir, project.name, project.name + PROJECT_SUFFIX);
        const cPath = path.join(solutionDir, project.name, 'main.c');

        receiveMessageEmitter.fire({ type: 'NEW_SOLUTION', solutionName, projects: [project], gitInit: false, targetTypes: targetTypes, solutionLocation, solutionFolder, packs: [], compiler });

        await waitTimeout();

        expect(mockFsCopyFile).toHaveBeenNthCalledWith(1, path.resolve(__dirname, '..', '..', '..', 'templates', 'template.csolution.yml'), solutionPath, expect.any(Function));
        expect(mockFsCopyFile).toHaveBeenNthCalledWith(2, path.resolve(__dirname, '..', '..', '..', 'templates', 'template.cproject.yml'), projectPath, expect.any(Function));
        expect(mockFsCopyFile).toHaveBeenNthCalledWith(3, path.resolve(__dirname, '..', '..', '..', 'templates', 'c', 'main.c'), cPath, expect.any(Function));
    });

    it('sends an error event if creation fails', async () => {
        const errorMessage = 'it blew up 💣';
        mockReconcileSolutionFiles.mockRejectedValue(new Error(errorMessage));

        const projects = [newProjectFactory()];
        receiveMessageEmitter.fire({ type: 'NEW_SOLUTION', solutionName, projects, gitInit: false, targetTypes: targetTypes, solutionLocation: '', solutionFolder, packs: [], compiler });

        await waitTimeout();

        expect(messageProvider.showErrorMessage).toHaveBeenCalledWith(`Failed to create solution: ${errorMessage}`);
    });

    it('handles the OPEN_FILE_PICKER message', async () => {
        messageProvider.showInformationMessage.mockResolvedValue({
            title: 'Open',
            isCloseAffordance: false,
        });

        const filePath = path.join(__dirname, 'test', 'path');
        const fileUri = URI.file(filePath);

        mockOpenDialog.mockResolvedValue([fileUri]);

        receiveMessageEmitter.fire({ type: 'OPEN_FILE_PICKER' });

        await waitTimeout();

        const output = pathsEqual(webviewManager.sendMessage.mock.calls[0][0].data.path, filePath);
        expect(output).toBe(true);
    });

    it('sets the default solution location to be the parent directory ', async () => {
        workspaceFoldersProvider.workspaceFolders = [
            { name: 'my-folder-1', index: 0, uri: URI.file(path.join('path', 'to', 'my', 'my-folder-1')) },
            { name: 'my-folder-2', index: 1, uri: URI.file(path.join('path', 'to', 'my', 'my-folder-2')) },
        ];

        receiveMessageEmitter.fire({ type: 'DATA_GET_DEFAULT_LOCATION' });

        const currentLocation = workspaceFoldersProvider.workspaceFolders[0].uri.fsPath;
        const defaultLocation = path.dirname(currentLocation);
        expect(webviewManager.sendMessage).toHaveBeenCalledWith({ type: 'SOLUTION_LOCATION', data: { path: defaultLocation } });
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
        receiveMessageEmitter.fire({ type: 'DATA_GET_CONNECTED_DEVICE' });

        await waitTimeout();

        const expectedMessage: Messages.IncomingMessage = {
            type: 'CONNECTED_BOARD',
            data: { name: expectedBoardName },
        };

        const hardwareInfoMessage = webviewManager.sendMessage.mock.calls.find(callArguments => callArguments[0].type === expectedMessage.type)[0];

        expect(hardwareInfoMessage).toEqual(expectedMessage);
    });
});
