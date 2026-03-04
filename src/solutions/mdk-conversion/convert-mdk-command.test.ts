/**
 * Copyright 2022-2026 Arm Limited
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

import 'jest';
import * as path from 'path';
import * as vscode from 'vscode';
import { URI } from 'vscode-uri';
import { commandsProviderFactory, MockCommandsProvider } from '../../vscode-api/commands-provider.factories';
import { ConvertMdkToCsolutionCommand, ParsedConverterOutput, parseConverterOutput } from './convert-mdk-command';
import { MockProcessManager, processManagerFactory } from '../../vscode-api/runner/process-manager.factories';
import { MockOutputChannelProvider, outputChannelProviderFactory } from '../../vscode-api/output-channel-provider.factories';
import { MockWorkspaceFoldersProvider, workspaceFoldersProviderFactory } from '../../vscode-api/workspace-folders-provider.factories';
import { MockMessageProvider, messageProviderFactory } from '../../vscode-api/message-provider.factories';
import { MockWorkspaceFsProvider, workspaceFsProviderFactory } from '../../vscode-api/workspace-fs-provider.factories';
import * as os from 'os';
import { CsolutionGlobalState, GlobalState } from '../../vscode-api/global-state';
import { globalStateFactory } from '../../vscode-api/global-state.factories';
import { CreatedSolution } from '../solution-creator';
import { CMSIS_SOLUTION_OUTPUT_CHANNEL, UV2CSOLUTION_FOLDER, UV2CSOLUTION_PATH_ENV_VAR } from '../../manifest';
import { globSync } from 'glob';

const TEST_INPUT_FILE: vscode.Uri = URI.file(path.join(__dirname, 'DAC_Audio.uvprojx'));
const TEST_OUTPUT_CSOLUTION_FILE: vscode.Uri = URI.file(path.join(__dirname, 'DAC_Audio.csolution.yml'));

// Mock the globSync function
jest.mock('glob', () => ({
    globSync: jest.fn(),
}));

describe('ConvertMdkToCsolutionCommand', () => {
    let convertMdkToCsolution: ConvertMdkToCsolutionCommand;
    let processManager: MockProcessManager;
    let commandsProvider: MockCommandsProvider;
    let outputChannelProvider: MockOutputChannelProvider;
    let workspaceFoldersProvider: MockWorkspaceFoldersProvider;
    let messageProvider: MockMessageProvider;
    let workspaceFsProvider: MockWorkspaceFsProvider;
    let globalStateProvider: GlobalState<CsolutionGlobalState>;
    let environment: NodeJS.ProcessEnv;
    const globSyncMock = globSync as jest.Mock;
    const mockShowOpenDialog = vscode.window.showOpenDialog as jest.Mock;
    const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;

    beforeEach(async () => {
        commandsProvider = commandsProviderFactory();
        processManager = processManagerFactory();
        outputChannelProvider = outputChannelProviderFactory();
        workspaceFoldersProvider = workspaceFoldersProviderFactory();
        messageProvider = messageProviderFactory();
        workspaceFsProvider = workspaceFsProviderFactory();
        globalStateProvider = globalStateFactory();
        environment = {};

        convertMdkToCsolution = new ConvertMdkToCsolutionCommand(
            commandsProvider,
            processManager,
            outputChannelProvider,
            workspaceFoldersProvider,
            messageProvider,
            workspaceFsProvider,
            globalStateProvider,
            environment,
        );

        await convertMdkToCsolution.activate({ subscriptions: [] } as unknown as vscode.ExtensionContext);

        globSyncMock.mockReturnValue([]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('registers the convert command on activation', () => {
        expect(commandsProvider.registerCommand).toHaveBeenCalledTimes(1);
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(ConvertMdkToCsolutionCommand.commandType, expect.anything(), expect.anything());
    });

    it('converts when passed a valid .uvprojx file', async () => {
        const outputLines = ['Test output line 1', 'Test output line 2', `Created solution: ${path.join(__dirname, 'MyNew.csolution.yml')}`];
        processManager.mockOutputLines(outputLines);

        workspaceFoldersProvider.getWorkspaceFolder.mockImplementation((fsPath: string) => fsPath === TEST_INPUT_FILE.fsPath ? {} : undefined);

        await commandsProvider.mockRunRegistered(ConvertMdkToCsolutionCommand.commandType, TEST_INPUT_FILE);

        expect(processManager.spawn).toHaveBeenCalledWith(
            expect.stringContaining(path.resolve(UV2CSOLUTION_FOLDER)),
            [TEST_INPUT_FILE.fsPath],
            {},
            expect.any(Function)
        );

        const outputChannel = outputChannelProvider.mockGetCreatedChannelByName(CMSIS_SOLUTION_OUTPUT_CHANNEL);
        // Plus 1 to account for the command line being printed first
        expect(outputChannel!.appendLine).toHaveBeenCalledTimes(outputLines.length + 1);
        expect(outputChannel!.appendLine.mock.calls[0][0]).toContain('uv2csolution');
        expect(outputChannel!.appendLine.mock.calls[1][0]).toBe(outputLines[0]);
        expect(outputChannel!.appendLine.mock.calls[2][0]).toBe(outputLines[1]);

        expect(commandsProvider.executeCommandIfRegistered).toHaveBeenCalledWith('keil-studio.initialise-project', URI.file(__dirname));
        expect(workspaceFsProvider.writeUtf8File).toHaveBeenCalledWith<Parameters<MockWorkspaceFsProvider['writeUtf8File']>>(
            URI.file(path.join(TEST_INPUT_FILE.fsPath, '../uv2csolution.log')).fsPath,
            outputLines.join(os.EOL),
        );
    });

    describe('shows message when matching .csolution.yml file already exists and', () => {

        it('... skips conversion on Cancel', async () => {
            workspaceFoldersProvider.getWorkspaceFolder.mockImplementation((fsPath: string) => fsPath === TEST_INPUT_FILE.fsPath ? {} : undefined);

            globSyncMock.mockReturnValue([TEST_OUTPUT_CSOLUTION_FILE.fsPath]);
            mockShowInformationMessage.mockResolvedValue('Cancel');

            await commandsProvider.mockRunRegistered(ConvertMdkToCsolutionCommand.commandType, TEST_INPUT_FILE);

            expect(mockShowInformationMessage).toHaveBeenCalledTimes(1);
            expect(processManager.spawn).not.toHaveBeenCalled();
        });

        it('... runs conversion on Overwrite', async () => {
            workspaceFoldersProvider.getWorkspaceFolder.mockImplementation((fsPath: string) => fsPath === TEST_INPUT_FILE.fsPath ? {} : undefined);

            globSyncMock.mockReturnValue([TEST_OUTPUT_CSOLUTION_FILE.fsPath]);
            mockShowInformationMessage.mockResolvedValue('Overwrite');

            await commandsProvider.mockRunRegistered(ConvertMdkToCsolutionCommand.commandType, TEST_INPUT_FILE);

            expect(mockShowInformationMessage).toHaveBeenCalledTimes(1);
            expect(processManager.spawn).toHaveBeenCalledTimes(1);
        });

    });

    it('uses a different version of uv2csolution if the right environment variable is set', async () => {
        const uv2csolutionPath = '/path/to/uv2csolution';
        environment[UV2CSOLUTION_PATH_ENV_VAR] = uv2csolutionPath;

        await commandsProvider.mockRunRegistered(ConvertMdkToCsolutionCommand.commandType, TEST_INPUT_FILE);

        expect(processManager.spawn).toHaveBeenCalledWith(
            uv2csolutionPath,
            [expect.any(String)],
            {},
            expect.any(Function)
        );
    });

    it('shows the open dialog when a Uri is not passed to the command handler', async () => {
        mockShowOpenDialog.mockResolvedValue([TEST_INPUT_FILE]);

        await commandsProvider.mockRunRegistered(ConvertMdkToCsolutionCommand.commandType);

        expect(mockShowOpenDialog).toHaveBeenCalled();
        expect(processManager.spawn).toHaveBeenCalled();
    });

    it('does not run the conversion if the user does not pick a file from the dialog', async () => {
        mockShowOpenDialog.mockResolvedValue([]);

        await commandsProvider.mockRunRegistered(ConvertMdkToCsolutionCommand.commandType);

        expect(mockShowOpenDialog).toHaveBeenCalled();
        expect(processManager.spawn).not.toHaveBeenCalled();
    });

    it('fails when passed an invalid .uvprojx file', async () => {
        const outputLines = ['Test failure line'];
        processManager.mockOutputLinesAndReject(outputLines, 'Not a real file');

        await commandsProvider.mockRunRegistered(ConvertMdkToCsolutionCommand.commandType, TEST_INPUT_FILE);
        expect(outputChannelProvider.mockGetCreatedChannelByName(CMSIS_SOLUTION_OUTPUT_CHANNEL)!.appendLine).toHaveBeenCalledTimes(2);
        expect(commandsProvider.executeCommandIfRegistered).not.toHaveBeenCalled();
        expect(commandsProvider.executeCommand).not.toHaveBeenCalled();
    });

    it('returns a CreatedSolution from the convert method', async () => {
        const solutionFilePath = path.join(__dirname, 'MyNew.csolution.yml');
        const outputLines = [`Created solution: ${solutionFilePath}`];
        processManager.mockOutputLines(outputLines);

        const results = await convertMdkToCsolution.convert(TEST_INPUT_FILE);

        expect(results).toEqual<CreatedSolution>({
            vcpkgConfigured: true,
            solutionFile: URI.file(solutionFilePath),
            solutionDir: URI.file(path.dirname(solutionFilePath)),
            conversionStatus: 'none',
            forceRteUpdate: true,
        });
    });

    describe('parseConverterOutput', () => {
        it('parses output containing an invalid XML error', () => {
            const result = parseConverterOutput([
                '/tools/uv2csolution /workspace/Blinky.uvprojx',
                'Error: XML syntax error on line 444: element <Targets> closed by </Target>',
                'Process failed with exit code 2',
            ]);

            const expected: ParsedConverterOutput = {
                errors: [],
                warnings: [],
                csolutionFileUri: undefined,
            };

            expect(result).toEqual(expected);
        });

        it('parses output containing errors and warning', () => {
            const result = parseConverterOutput([
                '/tools/uv2csolution /workspace/Blinky.uvprojx',
                'Error: 3 error(s), 1 warning(s):',
                'Errors:',
                '\t<Target> "LPCXpresso55S69" <Group> App <File> .\\Blinky.cpp Extension .cpp is not supported',
                '\t<Target> "LPCXpresso55S69" <Group> Board <File> .\\main.cpp Extension .cpp is not supported',
                '\t<Target> "LPCXpresso55S69" <Device> not specified',
                'Warnings:',
                '\t<Target> "LPCXpresso55S69" <PackID> not specified',
                'Process failed with exit code 2',
            ]);

            const expected: ParsedConverterOutput = {
                errors: [
                    '<Target> "LPCXpresso55S69" <Group> App <File> .\\Blinky.cpp Extension .cpp is not supported',
                    '<Target> "LPCXpresso55S69" <Group> Board <File> .\\main.cpp Extension .cpp is not supported',
                    '<Target> "LPCXpresso55S69" <Device> not specified',
                ],
                csolutionFileUri: undefined,
                warnings: [
                    '<Target> "LPCXpresso55S69" <PackID> not specified',
                ],
            };

            expect(result).toEqual(expected);
        });

        it('parses a successful output with one warning', () => {
            const result = parseConverterOutput([
                '/tools/uv2csolution /workspace/Blinky.uvprojx',
                'Created solution: /workspace/Blinky.csolution.yaml',
                'With projects:',
                '- /workspace/App.cproject.yaml',
                'Error: 0 error(s), 1 warning(s):',
                'Warnings:',
                '\t<Target> "LPCXpresso55S69" <PackID> not specified',
                'Process failed with exit code 1',
            ]);

            const expected: ParsedConverterOutput = {
                errors: [],
                csolutionFileUri: URI.file('/workspace/Blinky.csolution.yaml'),
                warnings: [
                    '<Target> "LPCXpresso55S69" <PackID> not specified',
                ],
            };

            expect(result).toEqual(expected);
        });

        it('parses a successful output', () => {
            const result = parseConverterOutput([
                '/tools/uv2csolution /workspace/Blinky.uvprojx',
                'Created solution: /workspace/Blinky.csolution.yaml',
                'With projects:',
                '- /workspace/App.cproject.yaml',
            ]);

            const expected: ParsedConverterOutput = {
                csolutionFileUri: URI.file('/workspace/Blinky.csolution.yaml'),
                errors: [],
                warnings: [],
            };

            expect(result).toEqual(expected);
        });
    });
});
