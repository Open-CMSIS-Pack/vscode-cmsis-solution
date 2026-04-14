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
const actualPath = jest.requireActual('path') as typeof import('path');

jest.mock('path', () => {
    const pathModule = jest.requireActual('path') as typeof import('path');

    return {
        ...pathModule,
        isAbsolute: jest.fn((filePath: string) => pathModule.isAbsolute(filePath)),
    };
});

import { TestDataHandler } from '../../../__test__/test-data';
import * as vscode from 'vscode';
import { extensionContextFactory } from '../../../vscode-api/extension-context.factories';
import { commandsProviderFactory, MockCommandsProvider } from '../../../vscode-api/commands-provider.factories';
import { MergeCommand } from './merge-command';
import { activeSolutionTrackerFactory, MockActiveSolutionTracker } from '../../../solutions/active-solution-tracker.factories';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import * as child_process from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fsUtils from '../../../utils/fs-utils';

jest.mock('child_process');
jest.mock('os');

describe('MergeCommand', () => {
    let commandsProvider: MockCommandsProvider;
    let activeSolutionTracker: MockActiveSolutionTracker;
    let command: MergeCommand;
    const testDataHandler = new TestDataHandler();
    let tmpDir: string;

    let componentNode: COutlineItem;
    let fileNode: COutlineItem;

    const mockedExec = child_process.exec as jest.MockedFunction<typeof child_process.exec>;
    const mockedExecSync = child_process.execSync as jest.MockedFunction<typeof child_process.execSync>;
    const mockedPath = path as jest.Mocked<typeof path>;

    beforeAll(() => {
        tmpDir = testDataHandler.tmpDir;
    });

    afterAll(() => {
        testDataHandler.dispose();
    });

    beforeEach(async () => {
        jest.restoreAllMocks();
        jest.resetAllMocks();
        mockedPath.isAbsolute.mockImplementation((filePath: string) => actualPath.isAbsolute(filePath));
        testDataHandler.rmTmpDir();
        tmpDir = testDataHandler.tmpDir;

        fsUtils.writeTextFile(path.join(tmpDir, 'component.c'), '// component\n');
        fsUtils.writeTextFile(path.join(tmpDir, 'component.c.update@1.0.0'), '// update\n');
        fsUtils.writeTextFile(path.join(tmpDir, 'component.c.base@1.0.0'), '// base\n');

        commandsProvider = commandsProviderFactory();
        activeSolutionTracker = activeSolutionTrackerFactory();
        command = new MergeCommand(commandsProvider, activeSolutionTracker);

        componentNode = new COutlineItem('component');
        componentNode.setTag('component');
        componentNode.setAttribute('label', 'Component X');
        componentNode.setAttribute('local', path.join(tmpDir, 'component.c'));

        fileNode = new COutlineItem('file');
        fileNode.setTag('file');
        fileNode.setAttribute('label', 'Component X');
        fileNode.setAttribute('local', path.join(tmpDir, 'component.c'));
    });

    describe('activation', () => {
        it('registers the command on activation', async () => {
            await command.activate(extensionContextFactory());

            expect(commandsProvider.registerCommand).toHaveBeenCalledTimes(1);
            expect(commandsProvider.registerCommand).toHaveBeenCalledWith(MergeCommand.mergeFile, expect.any(Function), expect.anything());
        });
    });

    describe('merge file discovery', () => {
        it('shows error if node is not passed', async () => {
            const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');
            // @ts-expect-error - testing behavior when `runVSCodeMerge` receives null
            await command['runVSCodeMerge'](null);
            expect(showErrorMessageSpy).toHaveBeenCalledWith('File data is not available for merge operation.');
        });

        it('shows error if required local file is missing', async () => {
            const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');
            const node = new COutlineItem('file');
            await command['runVSCodeMerge'](node);
            expect(showErrorMessageSpy).toHaveBeenCalledWith('Required local file is missing to perform merge.');
        });

        it('finds update and base files using the highest matching semver sibling', () => {
            fsUtils.writeTextFile(path.join(tmpDir, 'component.c.update@1.2.0'), '// newer update\n');
            fsUtils.writeTextFile(path.join(tmpDir, 'component.c.base@1.2.0'), '// newer base\n');
            fsUtils.writeTextFile(path.join(tmpDir, 'component.c.update@invalid'), '// ignored update\n');
            fsUtils.writeTextFile(path.join(tmpDir, 'component.c.base@invalid'), '// ignored base\n');

            const result = command['findNewestMergeFiles'](path.join(tmpDir, 'component.c'));

            expect(result).toEqual({
                update: path.join(tmpDir, 'component.c.update@1.2.0'),
                base: path.join(tmpDir, 'component.c.base@1.2.0'),
            });
        });

        it('returns undefined siblings when reading the local directory fails', () => {
            jest.spyOn(fsUtils, 'readDirectory').mockImplementation(() => {
                throw new Error('directory unavailable');
            });

            const result = command['findNewestMergeFiles'](path.join(tmpDir, 'component.c'));

            expect(result).toEqual({ update: undefined, base: undefined });
        });
    });

    describe('merge sibling resolution', () => {
        it('resolveNewestMergeSibling filters by prefix and returns the highest valid semver file', () => {
            const result = command['resolveNewestMergeSibling']([
                'component.c.base@1.0.0',
                'component.c.update@1.0.0',
                'component.c.update@2.0.0',
                'component.c.update@invalid',
                'other.c.update@9.9.9',
            ], 'component.c.update@');

            expect(result).toBe('component.c.update@2.0.0');
        });

        it('resolveNewestMergeSibling returns undefined when no file matches the prefix', () => {
            const result = command['resolveNewestMergeSibling']([
                'component.c.base@1.0.0',
                'other.c.update@2.0.0',
            ], 'component.c.update@');

            expect(result).toBeUndefined();
        });

        it('selectNewestMergeSibling ignores non-semver suffixes and picks the latest version', () => {
            const result = command['selectNewestMergeSibling']([
                'component.c.update@1.9.0',
                'component.c.update@invalid',
                'component.c.update@2.0.0-beta.1',
                'component.c.update@2.0.0',
            ]);

            expect(result).toBe('component.c.update@2.0.0');
        });

        it('selectNewestMergeSibling returns undefined when there are no valid semver candidates', () => {
            const result = command['selectNewestMergeSibling']([
                'component.c.update@draft',
                'component.c.update@next',
            ]);

            expect(result).toBeUndefined();
        });
    });

    describe('merge path validation and command construction', () => {
        it('throws for non-absolute merge paths', () => {
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

        it('builds merge command with validated absolute paths', () => {
            const local = path.join(tmpDir, 'local.c');
            const update = path.join(tmpDir, 'update.c');
            const base = path.join(tmpDir, 'base.c');
            const merged = `${local}.merged`;

            const result = command['buildMergeCommand'](
                '/usr/bin/code',
                local,
                update,
                base,
                merged,
            );

            expect(result).toEqual(`"/usr/bin/code" --wait --merge "${local}" "${update}" "${base}" "${merged}"`);
        });

        it('builds merge command with Windows-style absolute paths', () => {
            mockedPath.isAbsolute.mockImplementation((filePath: string) => actualPath.isAbsolute(filePath) || actualPath.win32.isAbsolute(filePath));

            const codePath = 'C:\\Users\\dev\\AppData\\Local\\Programs\\Microsoft VS Code\\bin\\code.cmd';
            const local = 'C:\\workspace\\component.c';
            const update = 'C:\\workspace\\component.update.c';
            const base = 'C:\\workspace\\component.base.c';
            const merged = 'C:\\workspace\\component.c.merged';

            const result = command['buildMergeCommand'](codePath, local, update, base, merged);

            expect(result).toEqual(`"${codePath}" --wait --merge "${local}" "${update}" "${base}" "${merged}"`);
        });
    });

    describe('VS Code executable discovery', () => {
        it('returns Windows VS Code CLI path when found in standard locations', () => {
            const expectedCodePath = path.join('C:', 'Program Files', 'Microsoft VS Code', 'bin', 'code.cmd');
            jest.spyOn(os, 'platform').mockReturnValue('win32');
            jest.spyOn(fsUtils, 'fileExists').mockImplementation((filePath?: string): filePath is string => filePath === expectedCodePath);

            const result = command['getVSCodeExecutablePath']();

            expect(result).toBe(expectedCodePath);
            expect(mockedExecSync).not.toHaveBeenCalled();
        });

        it('shows error if VS Code executable is not found before starting merge', async () => {
            jest.spyOn(os, 'platform').mockReturnValue('linux');
            mockedExecSync.mockImplementation(() => {
                throw new Error('not found');
            });

            const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');
            await command['runVSCodeMerge'](fileNode);
            expect(showErrorMessageSpy).toHaveBeenCalledWith('Visual Studio Code executable not found. Please ensure it is installed and available in your PATH.');
        });
    });

    describe('merge execution flow', () => {
        it('warns and skips post-merge file operations on non-zero merge exit code', async () => {
            const commandPrivate = command as unknown as {
                getVSCodeExecutablePath: () => string | undefined;
                doOpen3WayMerge: (cmd: string) => Promise<number>;
            };
            const deleteFileIfExistsSpy = jest.spyOn(fsUtils, 'deleteFileIfExists');
            const renameFileSpy = jest.spyOn(fsUtils, 'renameFile');
            jest.spyOn(fsUtils, 'copyFile').mockImplementation(() => { });
            jest.spyOn(fsUtils, 'getFileModificationTime').mockReturnValue(1000);
            jest.spyOn(commandPrivate, 'getVSCodeExecutablePath').mockReturnValue('/usr/bin/code');
            jest.spyOn(commandPrivate, 'doOpen3WayMerge').mockResolvedValue(1);

            const warningSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

            await command['runVSCodeMerge'](fileNode);

            expect(warningSpy).toHaveBeenCalledWith('Merge exited with code 1. Conflicts may exist.');
            expect(deleteFileIfExistsSpy).not.toHaveBeenCalled();
            expect(renameFileSpy).not.toHaveBeenCalled();
            expect(activeSolutionTracker.triggerReload).not.toHaveBeenCalled();
        });

        it('handles merge errors gracefully', async () => {
            const codePath = '/usr/bin/code';
            jest.spyOn(os, 'platform').mockReturnValue('linux');
            mockedExecSync.mockReturnValue(codePath);
            jest.spyOn(fsUtils, 'copyFile').mockImplementation(() => { });
            jest.spyOn(fsUtils, 'fileExists').mockReturnValue(true);
            jest.spyOn(fsUtils, 'getFileModificationTime').mockReturnValue(1000);
            mockedExec.mockImplementation((_cmd, _cb) => { throw new Error('unexpected'); });

            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');
            await command['runVSCodeMerge'](fileNode);
            expect(errorSpy).toHaveBeenCalledWith('Merge operations failed:', expect.any(Error));
            expect(showErrorMessageSpy).toHaveBeenCalledWith('Merge operation failed: unexpected');
        });

        it('shows a merge failure message when merge command validation throws', async () => {
            const node = new COutlineItem('file');
            const local = path.join(tmpDir, 'safe-local.c');
            node.setAttribute('local', local);

            const commandPrivate = command as unknown as {
                getVSCodeExecutablePath: () => string | undefined;
                findNewestMergeFiles: (localPath: string) => { update: string | undefined; base: string | undefined };
            };
            jest.spyOn(commandPrivate, 'getVSCodeExecutablePath').mockReturnValue('/usr/bin/code');
            jest.spyOn(commandPrivate, 'findNewestMergeFiles').mockReturnValue({
                update: `${local}.update@1.0.0&unsafe`,
                base: `${local}.base@1.0.0`,
            });
            jest.spyOn(fsUtils, 'copyFile').mockImplementation(() => { });
            jest.spyOn(fsUtils, 'getFileModificationTime').mockReturnValue(1000);

            const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');

            await command['runVSCodeMerge'](node);

            expect(showErrorMessageSpy).toHaveBeenCalledWith('Merge operation failed: Invalid update file: contains unsupported shell-sensitive characters.');
        });

        it('performs post-merge file operations and triggers reload when merged file changes', async () => {
            const local = path.join(tmpDir, 'component.c');
            const update = path.join(tmpDir, 'component.c.update@1.0.0');
            const base = path.join(tmpDir, 'component.c.base@1.0.0');
            const merged = `${local}.merged`;
            const expectedBase = path.join(path.dirname(update), path.basename(update).replaceAll('update', 'base'));
            const node = new COutlineItem('file');
            node.setTag('file');
            node.setAttribute('label', 'Component X');
            node.setAttribute('local', local);

            const commandPrivate = command as unknown as {
                getVSCodeExecutablePath: () => string | undefined;
                doOpen3WayMerge: (cmd: string) => Promise<number>;
            };
            const copyFileSpy = jest.spyOn(fsUtils, 'copyFile').mockImplementation(() => { });
            const getFileModificationTimeSpy = jest.spyOn(fsUtils, 'getFileModificationTime')
                .mockReturnValueOnce(1000)
                .mockReturnValueOnce(2000);
            const deleteFileIfExistsSpy = jest.spyOn(fsUtils, 'deleteFileIfExists').mockImplementation(() => { });
            const renameFileSpy = jest.spyOn(fsUtils, 'renameFile').mockImplementation(() => { });
            jest.spyOn(commandPrivate, 'getVSCodeExecutablePath').mockReturnValue('/usr/bin/code');
            jest.spyOn(commandPrivate, 'doOpen3WayMerge').mockResolvedValue(0);

            await command['runVSCodeMerge'](node);

            expect(copyFileSpy).toHaveBeenCalledWith(local, merged);
            expect(copyFileSpy).toHaveBeenCalledWith(local, `${local}.bak`);
            expect(getFileModificationTimeSpy).toHaveBeenCalledTimes(2);
            expect(deleteFileIfExistsSpy).toHaveBeenCalledWith(local);
            expect(deleteFileIfExistsSpy).toHaveBeenCalledWith(base);
            expect(renameFileSpy).toHaveBeenCalledWith(update, expectedBase);
            expect(renameFileSpy).toHaveBeenCalledWith(merged, local);
            expect(activeSolutionTracker.triggerReload).toHaveBeenCalledTimes(1);
        });
    });
});
