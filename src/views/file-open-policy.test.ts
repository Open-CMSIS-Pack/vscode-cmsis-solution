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
import { Uri } from 'vscode';
import * as vscode from 'vscode';
import { openFileWithPolicy } from './file-open-policy';
import { commandsProviderFactory, MockCommandsProvider } from '../vscode-api/commands-provider.factories';

describe('openFileWithPolicy', () => {
    let commandsProvider: MockCommandsProvider;

    beforeEach(() => {
        commandsProvider = commandsProviderFactory();
    });

    describe('markdown files', () => {
        it('opens markdown preview in the active editor by default', async () => {
            await openFileWithPolicy('docs/readme.md', commandsProvider);

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('markdown.showPreview', Uri.file('docs/readme.md'));
        });

        it('opens markdown preview to the side when requested', async () => {
            await openFileWithPolicy('docs/readme.md', commandsProvider, { markdownPreviewTarget: 'beside' });

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('markdown.showPreviewToSide', Uri.file('docs/readme.md'));
        });

        it('opens markdown preview editor to the side when editor mode is requested', async () => {
            await openFileWithPolicy('docs/readme.md', commandsProvider, {
                markdownPreviewTarget: 'beside',
                markdownPreviewMode: 'editor',
            });

            expect(commandsProvider.executeCommand).toHaveBeenCalledTimes(1);
            expect(commandsProvider.executeCommand).toHaveBeenCalledWith(
                'vscode.openWith',
                Uri.file('docs/readme.md'),
                'vscode.markdown.preview.editor',
                { viewColumn: vscode.ViewColumn.Beside }
            );
        });

        it('opens markdown preview editor in the active group when editor mode targets active', async () => {
            await openFileWithPolicy('docs/readme.md', commandsProvider, {
                markdownPreviewTarget: 'active',
                markdownPreviewMode: 'editor',
            });

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith(
                'vscode.openWith',
                Uri.file('docs/readme.md'),
                'vscode.markdown.preview.editor',
                { viewColumn: vscode.ViewColumn.Active }
            );
        });

        it('falls back to markdown preview command when preview editor opening fails', async () => {
            commandsProvider.executeCommand
                .mockRejectedValueOnce(new Error('openWith failed'))
                .mockResolvedValueOnce(undefined as never);

            await openFileWithPolicy('docs/readme.md', commandsProvider, {
                markdownPreviewTarget: 'beside',
                markdownPreviewMode: 'editor',
            });

            expect(commandsProvider.executeCommand).toHaveBeenNthCalledWith(
                1,
                'vscode.openWith',
                Uri.file('docs/readme.md'),
                'vscode.markdown.preview.editor',
                { viewColumn: vscode.ViewColumn.Beside }
            );
            expect(commandsProvider.executeCommand).toHaveBeenNthCalledWith(
                2,
                'markdown.showPreviewToSide',
                Uri.file('docs/readme.md')
            );
        });
    });

    describe('non-markdown files', () => {
        it('opens regular files in the default editor when no config-wizard routing applies', async () => {
            await openFileWithPolicy('src/main.c', commandsProvider);

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', Uri.file('src/main.c'), { viewColumn: vscode.ViewColumn.Active });
        });

        it('opens files in config wizard when routing predicate returns true', async () => {
            const shouldOpen = jest.fn().mockResolvedValue(true);

            await openFileWithPolicy('src/config.h', commandsProvider, {
                configWizard: {
                    viewType: 'cmsis-csolution.configWizard',
                    shouldOpen,
                },
            });

            expect(shouldOpen).toHaveBeenCalledWith('src/config.h');
            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.openWith', Uri.file('src/config.h'), 'cmsis-csolution.configWizard');
        });
    });
});
