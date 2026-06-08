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

import * as vscode from 'vscode';
import { CommandsProvider } from '../vscode-api/commands-provider';

export type MarkdownPreviewTarget = 'active' | 'beside';
export type MarkdownPreviewMode = 'command' | 'editor';

export type OpenFilePolicyOptions = {
    markdownPreviewTarget?: MarkdownPreviewTarget;
    markdownPreviewMode?: MarkdownPreviewMode;
    configWizard?: {
        viewType: string;
        shouldOpen: (filePath: string) => Promise<boolean>;
    };
};

export async function openFileWithPolicy(
    filePath: string,
    commandsProvider: CommandsProvider,
    options: OpenFilePolicyOptions = {},
): Promise<void> {
    const openInActiveGroup = { viewColumn: vscode.ViewColumn.Active };
    const openInBesideGroup = { viewColumn: vscode.ViewColumn.Beside };
    const markdownPreviewTarget = options.markdownPreviewTarget ?? 'active';
    const markdownPreviewMode = options.markdownPreviewMode ?? 'command';

    if (filePath.toLowerCase().endsWith('.md')) {
        if (markdownPreviewMode === 'editor') {
            try {
                const openOptions = markdownPreviewTarget === 'beside'
                    ? openInBesideGroup
                    : openInActiveGroup;
                await commandsProvider.executeCommand('vscode.openWith', vscode.Uri.file(filePath), 'vscode.markdown.preview.editor', openOptions);
                return;
            } catch {
                // Fall back to markdown commands if editor opening fails.
            }
        }

        const markdownCommand = markdownPreviewTarget === 'beside'
            ? 'markdown.showPreviewToSide'
            : 'markdown.showPreview';

        await commandsProvider.executeCommand(markdownCommand, vscode.Uri.file(filePath));
        return;
    }

    if (options.configWizard && await options.configWizard.shouldOpen(filePath)) {
        await commandsProvider.executeCommand('vscode.openWith', vscode.Uri.file(filePath), options.configWizard.viewType);
        return;
    }

    await commandsProvider.executeCommand('vscode.open', vscode.Uri.file(filePath), openInActiveGroup);
}
