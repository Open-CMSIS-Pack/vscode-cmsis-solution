/**
 * Copyright 2023-2026 Arm Limited
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
import { PACKAGE_NAME } from '../../manifest';
import { SolutionLoadState, SolutionLoadStateChangeEvent, SolutionManager } from '../../solutions/solution-manager';
import { TreeViewProvider } from './treeview-provider';
import { CsolutionGlobalState, GlobalState } from '../../vscode-api/global-state';
import { SolutionOutlineTree } from './tree-structure/solution-outline-tree';
import { COutlineItem } from './tree-structure/solution-outline-item';
import { CSolution } from '../../solutions/csolution';
import { TreeViewFileDecorationProvider } from './treeview-decoration-provider';

export class SolutionOutlineView {
    public static readonly treeViewId = `${PACKAGE_NAME}.outline`;
    private solutionPath?: string;
    private treeUpdateCount = 0;

    constructor(
        private readonly solutionManager: SolutionManager,
        private readonly treeViewProvider: TreeViewProvider<COutlineItem>,
        private readonly globalStateProvider: GlobalState<CsolutionGlobalState>,
        private readonly treeViewFileDecorationProvider: TreeViewFileDecorationProvider,
        private readonly solutionOutlineTree = new SolutionOutlineTree()
    ) { }

    public async activate(context: Pick<vscode.ExtensionContext, 'subscriptions' | 'globalState' | 'workspaceState'>): Promise<void> {
        if (!this.globalStateProvider.get('panelSeen')) {
            this.treeViewProvider.setBadge({ tooltip: '', value: 1 });
        }
        context.subscriptions.push(
            this.treeViewProvider.registerVisibilityChangeEvent(() => {
                this.hasSeen();
            }),
            this.solutionManager.onDidChangeLoadState(this.handleChangeLoadState, this),
        );
        this.treeViewProvider.activate(context);
    }

    public hasSeen() {
        this.globalStateProvider.update('panelSeen', true);
        this.treeViewProvider.setBadge({ tooltip: '', value: 0 });
    }

    private async handleChangeLoadState(e: SolutionLoadStateChangeEvent) {
        await this.updateTree(e.newState);
        if (this.solutionPath !== e.newState.solutionPath) {
            this.solutionPath = e.newState.solutionPath;
            vscode.commands.executeCommand(`${SolutionOutlineView.treeViewId}.open`, { preserveFocus: true });
        }
    }

    private async updateTree(loadState: SolutionLoadState) {
        this.treeUpdateCount++;
        const thisTreeUpdateNumber = this.treeUpdateCount;
        const csolution = this.solutionManager.getCsolution();

        if (loadState.solutionPath && csolution) {
            this.treeViewProvider.setDescription(csolution.getActiveTargetSetName() ?? '');
            this.treeViewProvider.setTitle(csolution.solutionName);
        } else {
            this.treeViewProvider.setDescription('');
            this.treeViewProvider.setTitle('');
        }
        this.createTree(loadState, csolution, thisTreeUpdateNumber);
    }

    private createTree(loadState: SolutionLoadState, csolution: CSolution | undefined, thisTreeUpdateNumber: number) {
        if (loadState.solutionPath) {
            if (this.treeUpdateCount !== thisTreeUpdateNumber) {
                return;
            }
            const tree = this.solutionOutlineTree.createTree(csolution);
            this.treeViewProvider.updateTree(tree);
            this.treeViewFileDecorationProvider.setTreeRoot(tree);
        } else if (!loadState.solutionPath) {
            this.treeViewProvider.updateTree();
            this.treeViewFileDecorationProvider.setTreeRoot(undefined);
        }
    }
}
