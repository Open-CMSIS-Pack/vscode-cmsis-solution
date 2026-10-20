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

import * as path from 'node:path';
import * as vscode from 'vscode';
import { PACKAGE_NAME } from '../../../manifest';
import { SolutionManager } from '../../../solutions/solution-manager';
import { CommandsProvider } from '../../../vscode-api/commands-provider';
import { COutlineItem } from '../tree-structure/solution-outline-item';

export class DocumentCommand {
    public static readonly addCommandId = `${PACKAGE_NAME}.addDocument`;
    public static readonly setLocalPathCommandId = `${PACKAGE_NAME}.setDocumentLocalPath`;
    public static readonly removeCommandId = `${PACKAGE_NAME}.removeDocument`;

    constructor(
        private readonly solutionManager: SolutionManager,
        private readonly commandsProvider: CommandsProvider,
        private readonly window: Pick<typeof vscode.window, 'showOpenDialog' | 'showWarningMessage' | 'showErrorMessage'> = vscode.window,
    ) { }

    public async activate(context: Pick<vscode.ExtensionContext, 'subscriptions'>): Promise<void> {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(DocumentCommand.addCommandId, this.addDocument, this),
            this.commandsProvider.registerCommand(DocumentCommand.setLocalPathCommandId, this.setLocalPath, this),
            this.commandsProvider.registerCommand(DocumentCommand.removeCommandId, this.removeDocument, this),
        );
    }

    private getTarget(node?: COutlineItem): { parentId: string; parentTag: 'board' | 'device' } | undefined {
        if (node) {
            const parentTag = node.getAttribute('docParentTag');
            const parentId = node.getAttribute('docParentId');
            return parentId && (parentTag === 'board' || parentTag === 'device')
                ? { parentId, parentTag } : undefined;
        }
        const solution = this.solutionManager.getCsolution();
        const targetType = solution?.getActiveTargetTypeWrap();
        const parentTag = targetType?.board ? 'board' : 'device';
        const parentId = parentTag === 'board'
            ? solution?.getBoardName() || targetType?.board
            : solution?.getDeviceNameWithVendor() || targetType?.device;
        return parentId ? { parentId, parentTag } : undefined;
    }

    private async addDocument(node?: COutlineItem): Promise<void> {
        const target = (!node || node.getTag() === 'board' || node.getTag() === 'device') ? this.getTarget(node) : undefined;
        if (!target) {
            await this.window.showWarningMessage('Select a board or device, or activate a target type with board or device hardware.');
            return;
        }
        const localPath = await this.pickDocument('Add Document');
        if (!localPath) {
            return;
        }
        const doc = await this.solutionManager.getDocManager().addUserBook(
            target.parentId, target.parentTag, localPath, path.basename(localPath),
        );
        if (!doc) {
            await this.window.showErrorMessage('Failed to save the document inventory.');
        }
    }

    private async setLocalPath(node?: COutlineItem): Promise<void> {
        const target = node?.getTag() === 'book' ? this.getTarget(node) : undefined;
        const name = node?.getAttribute('docName');
        if (!target || !name) {
            return;
        }
        const manager = this.solutionManager.getDocManager();
        const doc = manager.file.getDoc(name, target.parentId, target.parentTag);
        if (doc?.locationType !== 'W') {
            return;
        }
        const localPath = await this.pickDocument('Set Local Path');
        if (!localPath || manager.file.getDoc(name, target.parentId, target.parentTag)?.item !== doc.item) {
            return;
        }
        if (!await manager.setLocalPath(target.parentId, target.parentTag, name, localPath)) {
            await this.window.showErrorMessage('Failed to save the document inventory.');
        }
    }

    private async removeDocument(node?: COutlineItem): Promise<void> {
        const target = node?.getTag() === 'book' ? this.getTarget(node) : undefined;
        const name = node?.getAttribute('docName');
        if (!target || !name) {
            return;
        }
        const manager = this.solutionManager.getDocManager();
        if (manager.file.getDoc(name, target.parentId, target.parentTag)?.mode !== 'user') {
            return;
        }
        if (!await manager.removeDocument(target.parentId, target.parentTag, name)) {
            await this.window.showErrorMessage('Failed to save the document inventory.');
        }
    }

    private async pickDocument(title: string): Promise<string | undefined> {
        const manager = this.solutionManager.getDocManager();
        const fileName = manager.file.fileName;
        const root = manager.file.rootItem;
        const solution = this.solutionManager.getCsolution();
        const targetName = solution?.getActiveTargetType();
        const board = solution?.getActiveTargetTypeWrap()?.board;
        const device = solution?.getActiveTargetTypeWrap()?.device;
        const selected = await this.window.showOpenDialog({
            title,
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
        });
        if (!selected?.length || selected[0].scheme !== 'file') {
            return;
        }
        if (this.solutionManager.getDocManager() !== manager || manager.file.fileName !== fileName || manager.file.rootItem !== root
            || this.solutionManager.getCsolution() !== solution || solution?.getActiveTargetType() !== targetName
            || solution?.getActiveTargetTypeWrap()?.board !== board || solution?.getActiveTargetTypeWrap()?.device !== device) {
            await this.window.showWarningMessage('The document inventory or active target changed. Run the command again.');
            return;
        }
        return selected[0].fsPath;
    }
}
