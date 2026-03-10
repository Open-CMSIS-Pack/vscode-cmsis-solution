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

import path from 'path';
import fs from 'fs';
import os from 'os';
import { OpenCommand } from './open-command';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import { IOpenFileExternal } from '../../../open-file-external-if';
import { openFileExternalFactory } from '../../../open-file-external.factories';
import { extensionContextFactory } from '../../../vscode-api/extension-context.factories';
import { commandsProviderFactory, MockCommandsProvider } from '../../../vscode-api/commands-provider.factories';
import { activeSolutionLoadStateFactory, solutionManagerFactory } from '../../../solutions/solution-manager.factories';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
import type { CTreeItem } from '../../../generic/tree-item';
import type { CSolution } from '../../../solutions/csolution';
import { README_FILE_PATH } from '../../../manifest';

describe('OpenCommand', () => {
    let commandsProvider: MockCommandsProvider;
    const mockOpenFileExternal: IOpenFileExternal = openFileExternalFactory();
    let testFolder: string;
    let testFile: string;

    beforeEach(async () => {
        commandsProvider = commandsProviderFactory();
        testFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'jest-'));
        testFile = `${testFolder}/jtest.txt`;
        fs.writeFileSync(testFile, 'test content');
    });

    afterEach(() => {
        jest.restoreAllMocks();
        fs.rmSync(testFolder, { recursive: true, force: true });
    });

    it('registers the command on activation', async () => {
        const openCommand = new OpenCommand(solutionManagerFactory(), commandsProvider, mockOpenFileExternal);

        await openCommand.activate(extensionContextFactory());

        const expectedCommands = [OpenCommand.openSolutionCommandId, OpenCommand.openProjectCommandId, OpenCommand.openPrjConfCommandId,
            OpenCommand.openLayerCommandId, OpenCommand.openLinkerCommandId, OpenCommand.openDocCommandId, OpenCommand.openHelpCommandId,
            OpenCommand.openZephyrTerminalCommandId];

        expect(commandsProvider.registerCommand).toHaveBeenCalledTimes(expectedCommands.length);
        expectedCommands.forEach(commandId => {
            expect(commandsProvider.registerCommand).toHaveBeenCalledWith(commandId, expect.any(Function), expect.anything());
        });
    });

    it('opens and shows the csolution file from the path', async () => {
        const solutionPath = path.join('a', 'path', 'to', 'my-solution.csolution.yml');
        const mockSolutionManager = solutionManagerFactory({
            loadState: activeSolutionLoadStateFactory({ solutionPath: solutionPath }),
        });
        const openCommand = new OpenCommand(mockSolutionManager, commandsProvider, mockOpenFileExternal);
        await openCommand.activate(extensionContextFactory());

        await commandsProvider.mockRunRegistered(OpenCommand.openSolutionCommandId, solutionPath);

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', Uri.file(solutionPath));
    });

    it('opens and shows the cproject file from the path', async () => {
        const openCommand = new OpenCommand(solutionManagerFactory(), commandsProvider, mockOpenFileExternal);
        await openCommand.activate(extensionContextFactory());
        const TEST_PROJECT_PATH = path.join('some', 'path', 'to', 'Test.cproject.yml');

        const fileItem = new COutlineItem('file');
        fileItem.setAttribute('label', 'label');
        fileItem.setAttribute('resourcePath', TEST_PROJECT_PATH);
        fileItem.addFeature('projectFile');

        await commandsProvider.mockRunRegistered(OpenCommand.openProjectCommandId, fileItem);

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', Uri.file(TEST_PROJECT_PATH));
    });

    it('opens and shows the clayer file from the path', async () => {
        const openCommand = new OpenCommand(solutionManagerFactory(), commandsProvider, mockOpenFileExternal);
        await openCommand.activate(extensionContextFactory());
        const TEST_LAYER_PATH = path.join('some', 'path', 'to', 'Test.clayer.yml');

        const layerFile = new COutlineItem('file');
        layerFile.setAttribute('label', 'label');
        layerFile.setAttribute('resourcePath', TEST_LAYER_PATH);
        layerFile.addFeature('layerFile');

        await commandsProvider.mockRunRegistered(OpenCommand.openLayerCommandId, layerFile);

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', Uri.file(TEST_LAYER_PATH));
    });

    it('opens and shows the linker map file from the path', async () => {
        const openCommand = new OpenCommand(solutionManagerFactory(), commandsProvider, mockOpenFileExternal);
        await openCommand.activate(extensionContextFactory());
        const TEST_LINKER_PATH = path.join('some', 'path', 'to', 'myFile.axf.map');

        const linkerMapFile = new COutlineItem('file');
        linkerMapFile.setAttribute('label', 'label');
        linkerMapFile.setAttribute('resourcePath', TEST_LINKER_PATH);
        linkerMapFile.addFeature('linkerMapFile');

        await commandsProvider.mockRunRegistered(OpenCommand.openLinkerCommandId, linkerMapFile);

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', Uri.file(TEST_LINKER_PATH));
    });

    it('opens and shows the prj.conf file for West project', async () => {
        const openCommand = new OpenCommand(solutionManagerFactory(), commandsProvider, mockOpenFileExternal);
        await openCommand.activate(extensionContextFactory());
        const TEST_PRJ_CONF_PATH = path.join('some', 'path', 'to', 'zephyr-app', 'prj.conf');

        const prjConfFile = new COutlineItem('project');
        prjConfFile.setAttribute('label', 'core0.Debug+CM0');
        prjConfFile.setAttribute('prjConfPath', TEST_PRJ_CONF_PATH);
        prjConfFile.setAttribute('resourcePath', path.join('some', 'path', 'core0.cproject-west.yml'));

        await commandsProvider.mockRunRegistered(OpenCommand.openPrjConfCommandId, prjConfFile);

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', Uri.file(TEST_PRJ_CONF_PATH));
    });

    it('opens and shows a doc file from the path', async () => {
        const openCommand = new OpenCommand(solutionManagerFactory(), commandsProvider, mockOpenFileExternal);
        await openCommand.activate(extensionContextFactory());

        const fileItem = new COutlineItem('file');
        fileItem.setAttribute('label', 'label');
        fileItem.setAttribute('docPath', testFile);
        fileItem.addFeature('docFile');

        jest.spyOn(mockOpenFileExternal, 'openFile');
        await commandsProvider.mockRunRegistered(OpenCommand.openDocCommandId, fileItem);

        expect(mockOpenFileExternal.openFile).toHaveBeenCalledWith(testFile);
    });

    it('opens the readme file when the help command is invoked', async () => {
        const openCommand = new OpenCommand(solutionManagerFactory(), commandsProvider, mockOpenFileExternal);
        await openCommand.activate(extensionContextFactory());

        jest.spyOn(mockOpenFileExternal, 'openFile');

        await commandsProvider.mockRunRegistered(OpenCommand.openHelpCommandId);

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', Uri.file(README_FILE_PATH));
        expect(mockOpenFileExternal.openFile).not.toHaveBeenCalledWith(README_FILE_PATH);
    });

    it('opens the Keil Studio guide when the help command is invoked', async () => {
        jest.spyOn(vscode.extensions, 'getExtension').mockReturnValue({
            extensionPath: '/path/to/keil-pack-extension',
        } as unknown as vscode.Extension<void>);

        const openCommand = new OpenCommand(solutionManagerFactory(), commandsProvider, mockOpenFileExternal);
        await openCommand.activate(extensionContextFactory());

        jest.spyOn(mockOpenFileExternal, 'openFile');

        await commandsProvider.mockRunRegistered(OpenCommand.openHelpCommandId);

        expect(mockOpenFileExternal.openFile).toHaveBeenCalledWith('/path/to/keil-pack-extension/guide/index.html');
    });

    it('opens zephyr terminal for matching context', async () => {
        const mockTerminal = { show: jest.fn() } as unknown as vscode.Terminal;
        const createTerminalSpy = jest.spyOn(vscode.window, 'createTerminal').mockReturnValue(mockTerminal);
        const mockCbuildMap = new Map<string, CTreeItem>([
            [path.join('build', 'core0.Debug.cbuild.yml'), new COutlineItem('file')],
        ]);
        const mockSolutionManager = solutionManagerFactory();
        jest.spyOn(mockSolutionManager, 'getCsolution').mockReturnValue({ cbuildYmlRoot: mockCbuildMap } as Partial<CSolution> as CSolution);

        const openCommand = new OpenCommand(mockSolutionManager, commandsProvider, mockOpenFileExternal);
        await openCommand.activate(extensionContextFactory());

        const node = new COutlineItem('project');
        node.setAttribute('label', 'core0.Debug');

        await commandsProvider.mockRunRegistered(OpenCommand.openZephyrTerminalCommandId, node);

        expect(createTerminalSpy).toHaveBeenCalledWith({
            name: 'Zephyr core0',
            cwd: path.join('build'),
        });
        expect(mockTerminal.show).toHaveBeenCalled();
    });
});
