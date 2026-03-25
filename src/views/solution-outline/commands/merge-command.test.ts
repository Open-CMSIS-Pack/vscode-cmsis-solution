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
import * as path from 'path';

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
    const mockedPath = path as jest.Mocked<typeof path>;

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

    it('shows error if update file attribute is missing', async () => {
        const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');
        const node = new COutlineItem('file');
        node.setAttribute('local', '/tmp/local.c');

        await command['runVSCodeMerge'](node);

        expect(showErrorMessageSpy).toHaveBeenCalledWith('Required update file is missing to perform merge.');
    });

    it('shows error if base file attribute is missing', async () => {
        const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');
        const node = new COutlineItem('file');
        node.setAttribute('local', '/tmp/local.c');
        node.setAttribute('update', '/tmp/update.c');

        await command['runVSCodeMerge'](node);

        expect(showErrorMessageSpy).toHaveBeenCalledWith('Required base file is missing to perform merge.');
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

    it('warns and skips post-merge file operations on non-zero merge exit code', async () => {
        const commandPrivate = command as unknown as {
            getVSCodeExecutablePath: () => string | undefined;
            doOpen3WayMerge: (cmd: string) => Promise<number>;
        };
        jest.spyOn(commandPrivate, 'getVSCodeExecutablePath').mockReturnValue('/usr/bin/code');
        jest.spyOn(commandPrivate, 'doOpen3WayMerge').mockResolvedValue(1);
        mockedPath.resolve.mockImplementation((p: string) => p);
        mockedPath.isAbsolute.mockReturnValue(true);
        mockedFs.copyFileSync.mockImplementation(() => { });
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.statSync.mockReturnValue({ mtimeMs: 1000 } as fs.Stats);

        const warningSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

        await command['runVSCodeMerge'](fileNode);

        expect(warningSpy).toHaveBeenCalledWith('Merge exited with code 1. Conflicts may exist.');
        expect(mockedFs.unlinkSync).not.toHaveBeenCalled();
        expect(mockedFs.renameSync).not.toHaveBeenCalled();
        expect(activeSolutionTracker.triggerReload).not.toHaveBeenCalled();
    });

    it('performs post-merge file operations and triggers reload when merged file changes', async () => {
        const commandPrivate = command as unknown as {
            getVSCodeExecutablePath: () => string | undefined;
            doOpen3WayMerge: (cmd: string) => Promise<number>;
        };
        jest.spyOn(commandPrivate, 'getVSCodeExecutablePath').mockReturnValue('/usr/bin/code');
        jest.spyOn(commandPrivate, 'doOpen3WayMerge').mockResolvedValue(0);
        mockedPath.resolve.mockImplementation((p: string) => p);
        mockedPath.isAbsolute.mockReturnValue(true);
        mockedPath.basename.mockReturnValue('component.update.c');
        mockedPath.dirname.mockReturnValue('/tmp');
        mockedPath.join.mockReturnValue('/tmp/component.base.c');
        mockedFs.copyFileSync.mockImplementation(() => { });
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.statSync
            .mockReturnValueOnce({ mtimeMs: 1000 } as fs.Stats)
            .mockReturnValueOnce({ mtimeMs: 2000 } as fs.Stats);

        await command['runVSCodeMerge'](fileNode);

        expect(mockedFs.copyFileSync).toHaveBeenCalledWith('localPath', 'localPath.merged');
        expect(mockedFs.copyFileSync).toHaveBeenCalledWith('localPath', 'localPath.bak');
        expect(mockedFs.unlinkSync).toHaveBeenCalledWith('localPath');
        expect(mockedFs.unlinkSync).toHaveBeenCalledWith('basePath');
        expect(mockedFs.renameSync).toHaveBeenCalledWith('updatePath', '/tmp/component.base.c');
        expect(mockedFs.renameSync).toHaveBeenCalledWith('localPath.merged', 'localPath');
        expect(activeSolutionTracker.triggerReload).toHaveBeenCalledTimes(1);
    });

    it('builds merge command with validated absolute paths', () => {
        mockedPath.isAbsolute.mockReturnValue(true);

        const result = command['buildMergeCommand'](
            '/usr/bin/code',
            '/tmp/local.c',
            '/tmp/update.c',
            '/tmp/base.c',
            '/tmp/local.c.merged',
        );

        expect(result).toEqual('"/usr/bin/code" --wait --merge "/tmp/local.c" "/tmp/update.c" "/tmp/base.c" "/tmp/local.c.merged"');
    });

    it('throws for non-absolute merge paths', () => {
        mockedPath.isAbsolute.mockReturnValue(false);

        expect(() => command['assertMergeFilePath']('relative/path', 'local file')).toThrow('Invalid local file: path must be absolute.');
    });

    it('throws for shell-sensitive characters in merge paths', () => {
        mockedPath.isAbsolute.mockReturnValue(true);

        expect(() => command['assertMergeFilePath']('C:/safe/path&bad', 'local file')).toThrow('Invalid local file: contains unsupported shell-sensitive characters.');
    });

    it('throws for double quotes in merge paths', () => {
        mockedPath.isAbsolute.mockReturnValue(true);

        expect(() => command['assertMergeFilePath']('C:/safe/"quoted"/path', 'local file')).toThrow('Invalid local file: contains unsupported shell-sensitive characters.');
    });

    it('throws for single quotes in merge paths', () => {
        mockedPath.isAbsolute.mockReturnValue(true);

        expect(() => command['assertMergeFilePath']("C:/safe/'quoted'/path", 'local file')).toThrow('Invalid local file: contains unsupported shell-sensitive characters.');
    });

    it.each([
        ['ampersand', 'C:/safe/path&bad'],
        ['pipe', 'C:/safe/path|bad'],
        ['input redirection', 'C:/safe/path<bad'],
        ['output redirection', 'C:/safe/path>bad'],
        ['caret', 'C:/safe/path^bad'],
        ['percent', 'C:/safe/path%bad'],
        ['double quote', 'C:/safe/path"bad'],
        ['single quote', "C:/safe/path'bad"],
        ['line feed', 'C:/safe/path\nbad'],
        ['carriage return', 'C:/safe/path\rbad'],
    ])('rejects shell-sensitive edge case: %s', (_label, filePath) => {
        mockedPath.isAbsolute.mockReturnValue(true);

        expect(() => command['assertMergeFilePath'](filePath, 'local file')).toThrow('Invalid local file: contains unsupported shell-sensitive characters.');
    });
});
