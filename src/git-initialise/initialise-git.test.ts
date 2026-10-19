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
import { mkdtemp, readFile, rm } from 'fs/promises';
import os from 'os';
import path from 'path';
import { commandsProviderFactory, MockCommandsProvider } from '../vscode-api/commands-provider.factories';
import { TEMPLATES_FOLDER } from '../manifest';
import { GitExtension } from './git';
import { initialiseGit } from './initialise-git';

describe('initialiseGit', () => {
    const getExtension = vscode.extensions.getExtension as jest.MockedFunction<typeof vscode.extensions.getExtension>;
    let commandsProvider: MockCommandsProvider;
    let solutionDir: string;

    beforeEach(async () => {
        getExtension.mockReset();
        commandsProvider = commandsProviderFactory();
        solutionDir = await mkdtemp(path.join(os.tmpdir(), 'cmsis-initialise-git-'));
    });

    afterEach(async () => {
        await rm(solutionDir, { recursive: true, force: true });
    });

    it.each([
        { name: 'the VS Code Git API', extensionAvailable: true, exportsAvailable: true, expectedGitCalls: 1 },
        { name: 'the git.init fallback when the extension is unavailable', extensionAvailable: false, exportsAvailable: false, expectedGitCalls: 0 },
        { name: 'the git.init fallback when extension exports are unavailable', extensionAvailable: true, exportsAvailable: false, expectedGitCalls: 0 },
    ])('uses $name and copies the template gitignore', async ({ extensionAvailable, exportsAvailable, expectedGitCalls }) => {
        const gitInit = jest.fn();
        const getAPI = jest.fn().mockReturnValue({ init: gitInit });
        const gitExtension = extensionAvailable
            ? { exports: exportsAvailable ? { getAPI } : undefined } as unknown as vscode.Extension<GitExtension>
            : undefined;
        getExtension.mockReturnValue(gitExtension);

        await initialiseGit(solutionDir, commandsProvider);

        expect(getExtension).toHaveBeenCalledWith('vscode.git');
        expect(getAPI).toHaveBeenCalledTimes(expectedGitCalls);
        expect(gitInit).toHaveBeenCalledTimes(expectedGitCalls);
        expect(commandsProvider.executeCommand).toHaveBeenCalledTimes(1 - expectedGitCalls);
        if (expectedGitCalls) {
            expect(getAPI).toHaveBeenCalledWith(1);
            expect(gitInit).toHaveBeenCalledWith(vscode.Uri.from({ scheme: 'file', path: solutionDir }));
        } else {
            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('git.init', solutionDir);
        }
        await expect(readFile(path.join(solutionDir, '.gitignore'), 'utf8')).resolves.toBe(
            await readFile(path.join(TEMPLATES_FOLDER, 'git', '.gitignore'), 'utf8')
        );
    });

    it('propagates a gitignore copy failure', async () => {
        getExtension.mockReturnValue(undefined);
        const missingSolutionDir = path.join(solutionDir, 'missing');

        await expect(initialiseGit(missingSolutionDir, commandsProvider)).rejects.toMatchObject({ code: 'ENOENT' });

        expect(commandsProvider.executeCommand).toHaveBeenCalledWith('git.init', missingSolutionDir);
    });
});
