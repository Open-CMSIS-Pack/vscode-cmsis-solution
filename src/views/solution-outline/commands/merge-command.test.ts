/**
 * Copyright 2025-2026 Arm Limited
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

jest.mock('vscode', () => ({
    window: {
        showErrorMessage: jest.fn(),
        showWarningMessage: jest.fn(),
    }
}));
import * as vscode from 'vscode';
import { extensionContextFactory } from '../../../vscode-api/extension-context.factories';
import { commandsProviderFactory, MockCommandsProvider } from '../../../vscode-api/commands-provider.factories';
import { MergeCommand } from './merge-command';
import { activeSolutionTrackerFactory, MockActiveSolutionTracker } from '../../../solutions/active-solution-tracker.factories';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as os from 'os';

jest.mock('fs');
jest.mock('child_process');
jest.mock('os');
jest.mock('path');

describe('MergeCommand', () => {
    let commandsProvider: MockCommandsProvider;
    let activeSolutionTracker: MockActiveSolutionTracker;
    let command: MergeCommand;

    let componentNode: COutlineItem;
    let fileNode: COutlineItem;

    const mockedFs = fs as jest.Mocked<typeof fs>;
    const mockedExec = child_process.exec as jest.MockedFunction<typeof child_process.exec>;
    const mockedExecSync = child_process.execSync as jest.MockedFunction<typeof child_process.execSync>;

    beforeEach(async () => {
        commandsProvider = commandsProviderFactory();
        activeSolutionTracker = activeSolutionTrackerFactory();
        command = new MergeCommand(commandsProvider, activeSolutionTracker);

        componentNode = new COutlineItem('component');
        componentNode.setTag('component');
        componentNode.setAttribute('label', 'Component X');
        componentNode.setAttribute('local', 'localPath');
        componentNode.setAttribute('update', 'updatePath');
        componentNode.setAttribute('base', 'basePath');

        fileNode = new COutlineItem('file');
        fileNode.setTag('file');
        fileNode.setAttribute('label', 'Component X');
        fileNode.setAttribute('local', 'localPath');
        fileNode.setAttribute('update', 'updatePath');
        fileNode.setAttribute('base', 'basePath');


        jest.clearAllMocks();
    });

    it('registers the command on activation', async () => {
        await command.activate(extensionContextFactory());

        expect(commandsProvider.registerCommand).toHaveBeenCalledTimes(1);
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(MergeCommand.mergeFile, expect.any(Function), expect.anything());
    });

    it('shows error if node is not passed', async () => {
        const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');
        // @ts-expect-error - testing behavior when `runVSCodeMerge` receives null
        await command['runVSCodeMerge'](null);
        expect(showErrorMessageSpy).toHaveBeenCalledWith('File data is not available for merge operation.');
    });

    it('shows error if required file attributes are missing', async () => {
        const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');
        const node = new COutlineItem('file');
        await command['runVSCodeMerge'](node);
        expect(showErrorMessageSpy).toHaveBeenCalledWith('Required local file is missing to perform merge.');
    });

    it('shows error if VS Code executable not found', async () => {
        jest.spyOn(os, 'platform').mockReturnValue('linux');
        mockedExecSync.mockImplementation(() => {
            throw new Error('not found');
        });

        const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');
        await command['runVSCodeMerge'](fileNode);
        expect(showErrorMessageSpy).toHaveBeenCalledWith('Visual Studio Code executable not found. Please ensure it is installed and available in your PATH.');
    });

    it('handles merge errors gracefully', async () => {
        const codePath = '/usr/bin/code';
        jest.spyOn(os, 'platform').mockReturnValue('linux');
        mockedExecSync.mockReturnValue(codePath);
        mockedFs.copyFileSync.mockImplementation(() => { });
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.statSync.mockReturnValue({ mtimeMs: 1000 } as fs.Stats);
        mockedExec.mockImplementation((_cmd, _cb) => { throw new Error('unexpected'); });

        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        await command['runVSCodeMerge'](fileNode);
        expect(errorSpy).toHaveBeenCalledWith('Merge operations failed:', expect.any(Error));
    });
});
