/**
 * Copyright 2025-2026 Arm Limited
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

import * as vscode from 'vscode';
import { TreeItemCollapsibleState } from 'vscode';
import { COutlineItem } from './tree-structure/solution-outline-item';

export interface TreeViewProvider<A extends COutlineItem> {
    updateTree(tree?: A): void;
    setDescription(description: string): void;
    setTitle(title: string): void;
    setBadge(badgeSettings: ViewBadge): void;
    registerVisibilityChangeEvent(whenVisibilityChange: () => void): vscode.Disposable;
    activate(context: Pick<vscode.ExtensionContext, 'subscriptions' | 'globalState' | 'workspaceState'>): void;
}

export interface ViewBadge {
    tooltip: string;
    value: number;
}

export function createItemCommand(element: COutlineItem): vscode.Command | undefined {
    const command = element.getAttribute('command');
    if (command) {
        return {
            command,
            title: element.getAttribute('description') ?? '',
            arguments: [element],
        };
    }
    const tag = element.getTag();
    if (tag === 'project' || tag === 'layer') {
        return undefined; // open only explicitly via action button
    }

    const resourcePath = element.getAttribute('resourcePath');
    if (!resourcePath) {
        return undefined;
    }

    const uri = vscode.Uri.file(resourcePath);
    const isMarkdown = uri.fsPath.toLowerCase().endsWith('.md');

    return {
        command: isMarkdown ? 'markdown.showPreview' : 'vscode.open',
        title: isMarkdown ? 'Open Preview' : 'Open',
        arguments: [uri],
    };
}

const CMSIS_Outline_TreeState = 'CMSIS_Outline_TreeState';

export class TreeViewProviderImpl<A extends COutlineItem> implements TreeViewProvider<A>, vscode.TreeDataProvider<COutlineItem> {
    private readonly _onDidChangeTreeData: vscode.EventEmitter<COutlineItem | undefined | null | void> = new vscode.EventEmitter<COutlineItem | undefined | null | void>();
    public readonly onDidChangeTreeData: vscode.Event<COutlineItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private tree?: COutlineItem;
    private readonly treeView: vscode.TreeView<COutlineItem>;
    private context?: Pick<vscode.ExtensionContext, 'subscriptions' | 'workspaceState'>;

    constructor(treeId: string) {
        this.treeView = vscode.window.createTreeView(treeId, { treeDataProvider: this, showCollapseAll: false });
    }
    public activate(context: Pick<vscode.ExtensionContext, 'subscriptions' | 'globalState' | 'workspaceState'>) {
        this.context = context;
        this.treeView.onDidCollapseElement(e => this.saveExpandedState(e.element, TreeItemCollapsibleState.Collapsed));
        this.treeView.onDidExpandElement(e => this.saveExpandedState(e.element, TreeItemCollapsibleState.Expanded));
        context.subscriptions.push(this.treeView);
    }

    private saveExpandedState(element: COutlineItem, isExpanded: TreeItemCollapsibleState): void {
        const expandableAttr = element.getAttribute('expandable');
        if (!this.context || !expandableAttr) {
            return;
        }

        const elementId = this.constructItemId(element);
        if (elementId) {
            const state = this.context.workspaceState.get<{ [key: string]: TreeItemCollapsibleState }>(CMSIS_Outline_TreeState, {});
            state[elementId] = isExpanded;
            this.context.workspaceState.update(CMSIS_Outline_TreeState, state);
        }
    }

    private restoreExpandedState(element: COutlineItem): TreeItemCollapsibleState {
        const expandableAttr = element.getAttribute('expandable');
        if (!expandableAttr) {
            return TreeItemCollapsibleState.None;
        }

        let expandable: TreeItemCollapsibleState;
        switch (expandableAttr) {
            case '1':
                expandable = vscode.TreeItemCollapsibleState.Collapsed;
                break;
            case '2':
                expandable = vscode.TreeItemCollapsibleState.Expanded;
                break;
            default:
                expandable = vscode.TreeItemCollapsibleState.None;
                break;
        }

        const elementId = this.constructItemId(element);
        const state = this.context?.workspaceState.get<{ [key: string]: TreeItemCollapsibleState }>(CMSIS_Outline_TreeState, {});
        const isExpanded = state ? state[elementId] : expandable;
        return isExpanded ? isExpanded : expandable;
    }

    public setBadge(badgeSettings: ViewBadge) {
        // The VS Code types for TreeView incorrectly omit the badge property, so type cast here
        (this.treeView as { badge?: ViewBadge }).badge = badgeSettings;
    }

    public setDescription(description: string): void {
        this.treeView.description = description;
    }

    public setTitle(title: string): void {
        this.treeView.title = title;
    }

    public updateTree(tree?: COutlineItem): void {
        this.tree = tree;
        this.refresh();
    }

    public registerVisibilityChangeEvent(whenVisibilityChange: () => void): vscode.Disposable {
        return this.treeView.onDidChangeVisibility(whenVisibilityChange);
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    public getTreeItem(element: COutlineItem): vscode.TreeItem {
        const label = element.getAttribute('label') ?? '';
        const collapsedState = this.restoreExpandedState(element);

        const treeItem = new vscode.TreeItem(label, collapsedState);
        treeItem.description = element.getAttribute('description');

        const icon = element.getAttribute('iconPath');
        treeItem.iconPath = icon ? new vscode.ThemeIcon(icon as string) : undefined;

        treeItem.contextValue = element.getFeatures();

        const command = createItemCommand(element);
        if (command) {
            treeItem.command = command;
        }

        const resourcePath = element.getAttribute('resourcePath');
        if (resourcePath) {
            treeItem.resourceUri = vscode.Uri.file(resourcePath);
        }

        const tooltip = element.getAttribute('tooltip');
        treeItem.tooltip = tooltip ? new vscode.MarkdownString(tooltip) : undefined;

        return treeItem;
    }

    public getChildren(element?: COutlineItem): COutlineItem[] {
        return element
            ? element.getChildren() as COutlineItem[]
            : this.tree?.getChildren() as COutlineItem[];
    }

    public getParent(element: COutlineItem): COutlineItem | undefined {
        return element.getParent() as COutlineItem | undefined;
    }

    private constructItemId(element?: COutlineItem): string {
        if (!element) {
            return '';
        }
        return this.constructItemId(this.getParent(element)) + '.' + element.getAttribute('label');
    }
}
