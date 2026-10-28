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
import { getDocParentId } from '../../../doc-manager/docs-yaml-file';

export class DocumentCommand {
    public static readonly addCommandId = `${PACKAGE_NAME}.addDocument`;
    public static readonly downloadCommandId = `${PACKAGE_NAME}.downloadDocument`;
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
            this.commandsProvider.registerCommand(DocumentCommand.downloadCommandId, this.downloadDocument, this),
            this.commandsProvider.registerCommand(DocumentCommand.setLocalPathCommandId, this.setLocalPath, this),
            this.commandsProvider.registerCommand(DocumentCommand.removeCommandId, this.removeDocument, this),
        );
    }

    private getTarget(node?: COutlineItem): { parentId: string; parentTag: string } | undefined {
        if (node) {
            const isHardware = node.getFeatures().split(';').includes('docParent');
            const parentTag = isHardware ? node.getTag() : node.getAttribute('docParentTag');
            const parentId = isHardware
                ? getDocParentId(node.getAttribute('hardwareName'), parentTag)
                : node.getAttribute('docParentId');
            return parentId && parentTag ? { parentId, parentTag } : undefined;
        }
        const solution = this.solutionManager.getCsolution();
        const targetType = solution?.getActiveTargetTypeWrap();
        const parentTag = targetType?.board ? 'board' : 'device';
        const parentId = getDocParentId(parentTag === 'board'
            ? solution?.getBoardName() || targetType?.board
            : solution?.getDeviceNameWithVendor() || targetType?.device, parentTag);
        return parentId ? { parentId, parentTag } : undefined;
    }

    private async addDocument(node?: COutlineItem): Promise<void> {
        const localPath = await this.pickDocument('Add Document');
        if (!localPath) {
            return;
        }
        const manager = this.solutionManager.getDocManager();
        const target = (!node || node.getFeatures().split(';').includes('docParent')) ? this.getTarget(node) : undefined;
        if (!target) {
            await this.window.showWarningMessage('Select a board or device, or activate a target type with board or device hardware.');
            return;
        }
        const doc = await manager.addUserBook(
            target.parentId, target.parentTag, localPath, path.basename(localPath),
            undefined, existingPaths => this.confirmReplacement(
                'A document with the same filename already exists. Replace its location?', 'Replace',
                `${existingPaths.join('\n')}\n\nNew location: ${localPath}\n\nThe existing file will not be changed.`,
            ),
        );
        if (doc === undefined) {
            await this.window.showErrorMessage('Failed to save the document inventory.');
        }
    }

    private async downloadDocument(node?: COutlineItem): Promise<void> {
        const target = node?.getFeatures().split(';').includes('webDoc') ? this.getTarget(node) : undefined;
        const name = node?.getAttribute('docName');
        if (!target || !name) {
            return;
        }
        const manager = this.solutionManager.getDocManager();
        await manager.downloadDocument(target.parentId, target.parentTag, name, existingPaths => this.confirmReplacement(
            'The download destination already exists. Overwrite it?', 'Overwrite', existingPaths.join('\n'),
        ));
    }

    private async setLocalPath(node?: COutlineItem): Promise<void> {
        const localPath = await this.pickDocument('Set Local Path');
        if (!localPath) {
            return;
        }
        const manager = this.solutionManager.getDocManager();
        const target = node?.getFeatures().split(';').includes('webDoc') ? this.getTarget(node) : undefined;
        const name = node?.getAttribute('docName');
        if (!target || !name) {
            return;
        }
        const result = await manager.setLocalPath(target.parentId, target.parentTag, name, localPath, existingPaths => this.confirmReplacement(
            'This document already has an existing local file. Replace its local path?', 'Replace',
            `${existingPaths.join('\n')}\n\nNew location: ${localPath}\n\nAll references to this document will use the new path. Existing files will not be changed.`,
        ));
        if (result === false) {
            await this.window.showErrorMessage('Failed to save the document inventory.');
        }
    }

    private async removeDocument(node?: COutlineItem): Promise<void> {
        const manager = this.solutionManager.getDocManager();
        const target = node?.getFeatures().split(';').includes('userDoc') ? this.getTarget(node) : undefined;
        const name = node?.getAttribute('docName');
        if (!target || !name) {
            return;
        }
        if (!await manager.removeDocument(target.parentId, target.parentTag, name)) {
            await this.window.showErrorMessage('Failed to save the document inventory.');
        }
    }

    private async confirmReplacement(message: string, action: string, detail: string): Promise<boolean> {
        return await this.window.showWarningMessage(message, { modal: true, detail }, action) === action;
    }

    private async pickDocument(title: string): Promise<string | undefined> {
        const selected = await this.window.showOpenDialog({
            title,
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: { Documents: ['md', 'pdf', 'txt'] },
        });
        if (!selected?.length || selected[0].scheme !== 'file') {
            return;
        }
        return selected[0].fsPath;
    }
}
