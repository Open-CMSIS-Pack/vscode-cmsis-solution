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

export type MarkdownPreviewTarget = 'active' | 'beside' | 'beside-reuse';
export type MarkdownPreviewMode = 'command' | 'editor';

export type OpenFilePolicyOptions = {
    markdownPreviewTarget?: MarkdownPreviewTarget;
    markdownPreviewMode?: MarkdownPreviewMode;
    viewColumn?: vscode.ViewColumn;
    selection?: vscode.Range;
    configWizard?: {
        viewType: string;
        shouldOpen: (filePath: string) => Promise<boolean>;
    };
};

const markdownPreviewViewType = 'vscode.markdown.preview.editor';

function isMarkdownPreviewTab(tab: vscode.Tab): boolean {
    return tab.input instanceof vscode.TabInputCustom &&
        tab.input.viewType === markdownPreviewViewType;
}

function isMarkdownSourceTab(tab: vscode.Tab): boolean {
    return tab.input instanceof vscode.TabInputText &&
        tab.input.uri.fsPath.toLowerCase().endsWith('.md');
}

function getReusableMarkdownTabs(): vscode.Tab[] {
    return vscode.window.tabGroups.all.flatMap(group =>
        group.tabs.filter(tab => isMarkdownPreviewTab(tab) || isMarkdownSourceTab(tab))
    );
}

function getReusableMarkdownViewColumn(tabs: vscode.Tab[]): vscode.ViewColumn | undefined {
    const previewGroup = vscode.window.tabGroups.all.find(group =>
        group.tabs.some(tab => tabs.includes(tab))
    );

    return previewGroup?.viewColumn;
}

async function getMarkdownPreviewOpenOptions(target: MarkdownPreviewTarget): Promise<vscode.TextDocumentShowOptions> {
    if (target === 'active') {
        return { viewColumn: vscode.ViewColumn.Active };
    }

    if (target === 'beside-reuse') {
        const reusableTabs = getReusableMarkdownTabs();
        const viewColumn = getReusableMarkdownViewColumn(reusableTabs) ?? vscode.ViewColumn.Beside;

        if (reusableTabs.length > 0) {
            await vscode.window.tabGroups.close(reusableTabs, true);
        }

        return { viewColumn };
    }

    return { viewColumn: vscode.ViewColumn.Beside };
}

export async function openFileWithPolicy(
    filePath: string,
    commandsProvider: CommandsProvider,
    options: OpenFilePolicyOptions = {},
): Promise<void> {
    const openInTargetGroup: vscode.TextDocumentShowOptions = {
        viewColumn: options.viewColumn ?? vscode.ViewColumn.Active,
        ...(options.selection ? { selection: options.selection } : {}),
    };
    const markdownPreviewTarget = options.markdownPreviewTarget ?? 'active';
    const markdownPreviewMode = options.markdownPreviewMode ?? 'command';

    if (filePath.toLowerCase().endsWith('.md')) {
        if (markdownPreviewMode === 'editor') {
            try {
                const openOptions = options.viewColumn === undefined
                    ? await getMarkdownPreviewOpenOptions(markdownPreviewTarget)
                    : openInTargetGroup;
                await commandsProvider.executeCommand('vscode.openWith', vscode.Uri.file(filePath), markdownPreviewViewType, openOptions);
                return;
            } catch {
                // Fall back to markdown commands if editor opening fails.
            }
        }

        const markdownCommand = markdownPreviewTarget === 'active'
            ? 'markdown.showPreview'
            : 'markdown.showPreviewToSide';

        await commandsProvider.executeCommand(markdownCommand, vscode.Uri.file(filePath));
        return;
    }

    if (options.configWizard && await options.configWizard.shouldOpen(filePath)) {
        if (options.viewColumn !== undefined || options.selection !== undefined) {
            await commandsProvider.executeCommand('vscode.openWith', vscode.Uri.file(filePath), options.configWizard.viewType, openInTargetGroup);
        } else {
            await commandsProvider.executeCommand('vscode.openWith', vscode.Uri.file(filePath), options.configWizard.viewType);
        }
        return;
    }

    await commandsProvider.executeCommand('vscode.open', vscode.Uri.file(filePath), openInTargetGroup);
}
