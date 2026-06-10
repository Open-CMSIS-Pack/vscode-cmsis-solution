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
    type MockTabGroups = Omit<vscode.TabGroups, 'all' | 'close'> & {
        all: vscode.TabGroup[];
        close: jest.Mock;
    };

    const tabGroups = vscode.window.tabGroups as unknown as MockTabGroups;
    let commandsProvider: MockCommandsProvider;

    beforeEach(() => {
        commandsProvider = commandsProviderFactory();
        tabGroups.all = [];
        tabGroups.close.mockClear();
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

        it('opens markdown preview editor to the side when reuse is requested and no preview is open', async () => {
            await openFileWithPolicy('docs/readme.md', commandsProvider, {
                markdownPreviewTarget: 'beside-reuse',
                markdownPreviewMode: 'editor',
            });

            expect(vscode.window.tabGroups.close).not.toHaveBeenCalled();
            expect(commandsProvider.executeCommand).toHaveBeenCalledWith(
                'vscode.openWith',
                Uri.file('docs/readme.md'),
                'vscode.markdown.preview.editor',
                { viewColumn: vscode.ViewColumn.Beside }
            );
        });

        it('closes existing markdown preview tabs and reuses their editor group', async () => {
            const previewTab = {
                input: new vscode.TabInputCustom(Uri.file('docs/old.md'), 'vscode.markdown.preview.editor'),
            } as vscode.Tab;
            const otherCustomEditorTab = {
                input: new vscode.TabInputCustom(Uri.file('src/config.h'), 'cmsis-csolution.configWizard'),
            } as vscode.Tab;
            const previewColumn = 3 as vscode.ViewColumn;

            tabGroups.all = [{
                isActive: false,
                viewColumn: previewColumn,
                activeTab: previewTab,
                tabs: [otherCustomEditorTab, previewTab],
            }];

            await openFileWithPolicy('docs/readme.md', commandsProvider, {
                markdownPreviewTarget: 'beside-reuse',
                markdownPreviewMode: 'editor',
            });

            expect(vscode.window.tabGroups.close).toHaveBeenCalledWith([previewTab], true);
            expect(commandsProvider.executeCommand).toHaveBeenCalledWith(
                'vscode.openWith',
                Uri.file('docs/readme.md'),
                'vscode.markdown.preview.editor',
                { viewColumn: previewColumn }
            );
        });

        it('closes existing markdown source tabs and reuses their editor group', async () => {
            const sourceTab = {
                input: new vscode.TabInputText(Uri.file('docs/old.md')),
            } as vscode.Tab;
            const otherTextTab = {
                input: new vscode.TabInputText(Uri.file('src/main.c')),
            } as vscode.Tab;
            const sourceColumn = 3 as vscode.ViewColumn;

            tabGroups.all = [{
                isActive: false,
                viewColumn: sourceColumn,
                activeTab: sourceTab,
                tabs: [otherTextTab, sourceTab],
            }];

            await openFileWithPolicy('docs/readme.md', commandsProvider, {
                markdownPreviewTarget: 'beside-reuse',
                markdownPreviewMode: 'editor',
            });

            expect(vscode.window.tabGroups.close).toHaveBeenCalledWith([sourceTab], true);
            expect(commandsProvider.executeCommand).toHaveBeenCalledWith(
                'vscode.openWith',
                Uri.file('docs/readme.md'),
                'vscode.markdown.preview.editor',
                { viewColumn: sourceColumn }
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

        it('opens regular files in the requested view column', async () => {
            const targetColumn = 3 as vscode.ViewColumn;

            await openFileWithPolicy('src/main.c', commandsProvider, {
                viewColumn: targetColumn,
            });

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', Uri.file('src/main.c'), { viewColumn: targetColumn });
        });

        it('forwards selection for regular file opens', async () => {
            const targetColumn = 3 as vscode.ViewColumn;
            const selection = new vscode.Range(1, 2, 3, 4);

            await openFileWithPolicy('src/main.c', commandsProvider, {
                viewColumn: targetColumn,
                selection,
            });

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith('vscode.open', Uri.file('src/main.c'), {
                viewColumn: targetColumn,
                selection,
            });
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

        it('forwards view column and selection for config wizard opens when provided', async () => {
            const shouldOpen = jest.fn().mockResolvedValue(true);
            const targetColumn = 4 as vscode.ViewColumn;
            const selection = new vscode.Range(5, 0, 5, 10);

            await openFileWithPolicy('src/config.h', commandsProvider, {
                viewColumn: targetColumn,
                selection,
                configWizard: {
                    viewType: 'cmsis-csolution.configWizard',
                    shouldOpen,
                },
            });

            expect(shouldOpen).toHaveBeenCalledWith('src/config.h');
            expect(commandsProvider.executeCommand).toHaveBeenCalledWith(
                'vscode.openWith',
                Uri.file('src/config.h'),
                'cmsis-csolution.configWizard',
                {
                    viewColumn: targetColumn,
                    selection,
                }
            );
        });
    });
});
