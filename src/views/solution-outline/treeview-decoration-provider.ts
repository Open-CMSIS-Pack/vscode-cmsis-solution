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

import * as vscode from 'vscode';
import { FileDecorationProviderManager } from '../../vscode-api/file-decoration-provider-manager';
import { ThemeProvider } from '../../vscode-api/theme-provider';
import { URI } from 'vscode-uri';
import { getCmsisPackRoot } from '../../utils/path-utils';
import { COutlineItem } from './tree-structure/solution-outline-item';
import * as manifest from '../../manifest';
import { getOutlineItemResourceUri, solutionOutlineUriScheme } from './treeview-provider';

export class TreeViewFileDecorationProvider implements vscode.FileDecorationProvider {
    static readonly badge: string = 'P';
    static readonly tooltip: string = 'Pack sourced';
    static readonly themeColor: string = 'descriptionForeground';

    static readonly mergeBadge: string = 'N';
    static readonly mergeTooltip: string = 'New Version Available for Merge';
    static readonly mergeColor: string = 'charts.blue';

    static readonly excludedBadge: string = 'X';
    static readonly excludedTooltip: string = 'Excluded from build';
    static readonly contextExcludedTooltip: string = 'Excluded from current context';
    static readonly excludedColor: string = 'errorForeground';

    private readonly _onDidChangeFileDecorations: vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined> = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    public readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> = this._onDidChangeFileDecorations.event;

    private treeRoot?: COutlineItem;

    constructor(
        private readonly fileDecorationProviderManager: FileDecorationProviderManager,
        private readonly themeProvider: ThemeProvider
    ) { }

    public setTreeRoot(tree?: COutlineItem): void {
        this.treeRoot = tree;
        this.refresh();
    }

    public refresh(): void {
        this._onDidChangeFileDecorations.fire(undefined);
    }

    public provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
        if (uri.scheme !== 'file' && uri.scheme !== solutionOutlineUriScheme) {
            return undefined;
        }

        const outlineItem = this.findOutlineItemByUri(this.treeRoot, uri);
        if (outlineItem?.getAttribute('excluded') === '1') {
            return {
                badge: TreeViewFileDecorationProvider.excludedBadge,
                tooltip: uri.scheme === solutionOutlineUriScheme
                    ? TreeViewFileDecorationProvider.contextExcludedTooltip
                    : TreeViewFileDecorationProvider.excludedTooltip,
                color: this.themeProvider.getThemeColor(TreeViewFileDecorationProvider.excludedColor),
            };
        }

        if (uri.scheme !== 'file') {
            return undefined;
        }

        // Merge-enabled files have higher priority than pack-sourced files
        const features = outlineItem?.getFeatures().split(';') ?? [];
        if (features.includes(manifest.MERGE_FILE_CONTEXT)) {
            return {
                badge: TreeViewFileDecorationProvider.mergeBadge,
                tooltip: TreeViewFileDecorationProvider.mergeTooltip,
                color: this.themeProvider.getThemeColor(TreeViewFileDecorationProvider.mergeColor),
            };
        }

        // Check for pack-sourced files
        const cmsisPackRoot = getCmsisPackRoot();
        const cmsisPackRootUri = URI.file(cmsisPackRoot);

        const cmsisPackRootFsPath = cmsisPackRootUri.fsPath;
        const fileFsPath = uri.fsPath;

        if (fileFsPath.startsWith(cmsisPackRootFsPath)) {
            return {
                badge: TreeViewFileDecorationProvider.badge,
                tooltip: TreeViewFileDecorationProvider.tooltip,
                color: this.themeProvider.getThemeColor(TreeViewFileDecorationProvider.themeColor),
            };
        }
        return undefined; // No decoration for other items
    }

    private findOutlineItemByUri(tree: COutlineItem | undefined, uri: vscode.Uri): COutlineItem | undefined {
        if (!tree) {
            return undefined;
        }

        const searchInNode = (node: COutlineItem): COutlineItem | undefined => {
            const nodeUri = getOutlineItemResourceUri(node);
            const isMatch = uri.scheme === 'file'
                ? node.getTag() === 'file' && nodeUri?.fsPath === uri.fsPath
                : nodeUri?.scheme === uri.scheme && nodeUri.path === uri.path;
            if (isMatch) {
                return node;
            }

            for (const child of node.getChildren()) {
                const found = searchInNode(child as COutlineItem);
                if (found) {
                    return found;
                }
            }

            return undefined;
        };

        return searchInNode(tree);
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.fileDecorationProviderManager.registerFileDecorationProvider(this),
            this._onDidChangeFileDecorations
        );
    }
}
