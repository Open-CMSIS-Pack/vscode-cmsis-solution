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

import { Uri, ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import * as manifest from '../../../manifest';
import { CommandsProvider } from '../../../vscode-api/commands-provider';
import * as fs from 'fs';
import { Document as YamlDocument } from 'yaml';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import { collectGroupFiles, getGroupPathArray } from '../utils';
import { deleteItemFromExistingGroup } from '../../../solutions/edit/manage-group-items';
import { editYamlFile as defaultEditYamlFile } from '../../../solutions/edit/edit-yaml-file';
import { WorkspaceFsProvider } from '../../../vscode-api/workspace-fs-provider';
import { getFileNameFromPath } from '../../../utils/path-utils';

export class DeleteCommand {
    public static readonly removeCommandId = `${manifest.PACKAGE_NAME}.remove`;
    constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly workspaceFsProvider: WorkspaceFsProvider,
        private readonly editYamlFile = defaultEditYamlFile,
    ) { }

    public async activate(context: Pick<ExtensionContext, 'subscriptions'>) {
        context.subscriptions.push(
            // Delete or remove groups
            this.commandsProvider.registerCommand(DeleteCommand.removeCommandId, async (node: COutlineItem) => {
                await this.confirmDeletion(node);
            }, this),
        );
    }

    public async confirmDeletion(node: COutlineItem): Promise<void> {
        const name = node.getAttribute('label') ?? '';
        if (!name) {
            return;
        }

        const confirmation = await this.setConfirmationMessage(node);
        if (!confirmation || confirmation === 'Cancel') {
            return;
        }
        const isFile = node.getTag() === 'file';
        const isDelete = confirmation === 'Delete';
        await this.delete(isFile, node, name, isDelete);
    }

    public async delete(isFile: boolean, node: COutlineItem, name: string, isDelete: boolean): Promise<void> {
        const projectUriAtt = node.getAttribute('projectUri') ?? '';
        const projectUri = Uri.file(projectUriAtt);
        const fileName = node.getAttribute('fileUri') ?? '';

        const deleted = isFile
            ? await this.deleteFile(projectUri, fileName, isDelete, node)
            : await this.deleteGroup(node, projectUri, name, isDelete);

        if (deleted) {
            if (isDelete) {
                vscode.window.showInformationMessage(`'${name}' has been deleted.`);
            } else {
                vscode.window.showInformationMessage(`'${name}' has been removed.`);
            }
        }
    }

    private async deleteGroup(node: COutlineItem, projectUri: Uri, item: string, isDelete: boolean): Promise<boolean> {
        try {
            // If deleting from filesystem, recursively delete physical files
            if (isDelete) {
                await this.deletePhysicalGroupFiles(node);
            }

            // Remove group from YAML file (this will handle all nested content automatically)
            await this.removeFromYamlFile(projectUri.fsPath, 'group', item, node);

            return true;
        } catch (error) {
            this.reportError('group', node.getAttribute('label') ?? '', error);
            return false;
        }
    }

    /**
     * Delete physical files within a group and its subgroups
     */
    private async deletePhysicalGroupFiles(node: COutlineItem): Promise<void> {
        // Collect all files from this group and its subgroups recursively
        const files = collectGroupFiles(node);
        for (const file of files) {
            const filePath = file.getAttribute('resourcePath') ?? '';
            if (filePath && fs.existsSync(filePath)) {
                const fileUri = Uri.file(filePath);
                await vscode.workspace.fs.delete(fileUri, { useTrash: true });
            }
        }
    }

    private async deleteFile(projectUri: Uri, name: string, isDelete: boolean, node: COutlineItem): Promise<boolean> {
        try {
            const filePath = node.getAttribute('resourcePath') ?? '';
            const fileUri = Uri.file(filePath);

            if (isDelete) {
                if (fs.existsSync(fileUri.fsPath)) {
                    await vscode.workspace.fs.delete(fileUri, { useTrash: true });
                }
            }
            await this.removeFromYamlFile(projectUri.fsPath, 'file', name, node);
            return true;
        } catch (error) {
            this.reportError('file', name, error);
            return false;
        }
    }

    private reportError(type: 'group' | 'file', item: string, error: unknown): void {
        console.error(`Failed to delete ${type} '${item}':`, error);
        vscode.window.showErrorMessage(`Failed to delete the ${type} '${item}'.`);
    }

    private async setConfirmationMessage(item: COutlineItem): Promise<'Remove' | 'Delete' | 'Cancel' | undefined> {

        const name = item.getAttribute('label');
        const fileName = getFileNameFromPath(item.originFilePath);
        const isGroup = item.getTag() === 'group';

        let removeMessage = `Choose Remove to remove '${name}'`;
        if (isGroup) {
            removeMessage += ' and all its content';
        }
        removeMessage += ` from '${fileName}'`;

        let deleteMessage = `Choose Delete to permanently delete '${name}'`;
        if (isGroup) {
            deleteMessage += ' and all its content';
        }

        const files = 'file' + (isGroup ? 's' : '');
        return await vscode.window.showWarningMessage(
            `${removeMessage}\n\n${deleteMessage}`,
            { modal: true, detail: `You can restore deleted ${files} from the Recycle Bin.` },
            'Remove', 'Delete'
        );
    }

    private async removeFromYamlFile(filePath: string, type: 'group' | 'file', name: string, node: COutlineItem) {
        const parentUri = Uri.file(filePath);
        const parentType = this.getParentTypeFromNode(node);

        // Calculate the parent group path (where the item to be deleted resides)
        let groupPath: string[] = [];

        if (type === 'group') {
            // For groups, we need the parent group path (excluding the group itself)
            const fullPath = getGroupPathArray(node);
            groupPath = fullPath.slice(0, -1); // Remove the last element (the group being deleted)
        } else {
            // For files, we need the group path where the file resides
            const parent = node.getParent();
            if (parent) {
                groupPath = getGroupPathArray(parent as COutlineItem);
            }
        }

        const modifications = [(yamlDocument: YamlDocument) => {
            this.removeItem(yamlDocument, type, name, groupPath, parentType);
        }];

        await this.editYamlFile(this.workspaceFsProvider, parentUri, modifications);
    }

    private removeItem(yamlDocument: YamlDocument, type: 'group' | 'file', name: string, groupPath: string[], parentType: 'project' | 'layer'): void {
        const deleted = deleteItemFromExistingGroup(yamlDocument, parentType, groupPath, type, name);

        if (!deleted) {
            console.warn(`Failed to remove ${type}: '${name}' from group path: ${groupPath.join('/')}`);
        }
    }

    private getParentTypeFromNode(node: COutlineItem): 'project' | 'layer' {
        const layerUri = node.getAttribute('layerUri');
        return layerUri ? 'layer' : 'project';
    }

}
