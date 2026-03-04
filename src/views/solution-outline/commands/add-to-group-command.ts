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

import { Uri, ExtensionContext, QuickPickItem } from 'vscode';
import * as vscode from 'vscode';
import _ from 'lodash';
import { FileOrGroup, addItemToExistingGroup } from '../../../solutions/edit/manage-group-items';
import { editYamlFile as defaultEditYamlFile } from '../../../solutions/edit/edit-yaml-file';
import { FileData, GroupData } from '../../../solutions/parsing/common-file-parsing';
import * as path from 'path';
import { WorkspaceFsProvider } from '../../../vscode-api/workspace-fs-provider';
import * as manifest from '../../../manifest';
import { CommandsProvider } from '../../../vscode-api/commands-provider';
import { Document as YamlDocument } from 'yaml';
import { CodeTemplate, buildTemplatesFromCbuild } from './user-code-templates';
import { SolutionManager } from '../../../solutions/solution-manager';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import { backToForwardSlashes, getCmsisPackRoot } from '../../../utils/path-utils';
import { collectGroupFiles, getGroupPathArray } from '../utils';

const parentFileUriFromGroupData = (groupData: COutlineItem): Uri => {
    const projectUri = groupData.getAttribute('projectUri') ?? '';
    const uri = Uri.file(projectUri);

    const layerUri = groupData.getAttribute('layerUri');
    if (layerUri) {
        return Uri.file(layerUri);
    }

    return uri;
};
const projectRootFromGroupData = (groupData: COutlineItem): Uri => Uri.joinPath(parentFileUriFromGroupData(groupData), '..');
const groupNameFromPath = (groupPath: string[]) => _.tail(groupPath);
const getParentTypeFromGroupData = (groupData: COutlineItem): 'project' | 'layer' => {
    const layerUri = groupData.getAttribute('layerUri');
    return layerUri ? 'layer' : 'project';
};

export const addNewFileOption = {
    id: 'AddNewFile',
    label: 'Add New File',
    detail: 'Create a new file and add it to this group'
} as const;

export const addExistingFileOption = {
    id: 'AddExistingFile',
    label: 'Add Existing File',
    detail: 'Choose a file on disk to add to this group',
} as const;

export const addNewGroupOption = {
    id: 'AddNewGroup',
    label: 'Add New Group',
    detail: 'Add a new group'
} as const;

// make a separator for the 'Folder' group
const templateSeparator = {
    id: 'separator',
    label: 'From CMSIS-packs',
    kind: vscode.QuickPickItemKind.Separator
} as const;

export const addFromCodeTemplateOption = {
    id: 'AddComponentCodeTemplate',
    label: 'Add From Component Code Template',
    detail: 'Apply a template provided by a software component',
} as const;

const groupOptions = [
    addNewFileOption,
    addExistingFileOption,
    addNewGroupOption,
    templateSeparator,
    addFromCodeTemplateOption,] as const;

const projectOptions = [
    addNewGroupOption,
    templateSeparator,] as const;

type AddFileToGroupOption = (typeof addNewFileOption | typeof addExistingFileOption | typeof addFromCodeTemplateOption)['id'];

export class AddToGroupCommand {
    public static readonly addToGroupCommandId = `${manifest.PACKAGE_NAME}.addToGroup`;

    constructor(
        private readonly workspaceFsProvider: WorkspaceFsProvider,
        private readonly commandsProvider: CommandsProvider,
        private readonly solutionManager: Pick<SolutionManager, 'loadState' | 'getCsolution'>,
        private readonly vscodeWindow: Pick<typeof vscode.window, 'showInputBox' | 'showSaveDialog' | 'showOpenDialog' | 'showQuickPick'> = vscode.window,
        private readonly editYamlFile = defaultEditYamlFile,
    ) { }

    public async activate(context: Pick<ExtensionContext, 'subscriptions'>) {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(AddToGroupCommand.addToGroupCommandId, async (node: COutlineItem) => {
                const type = node.getAttribute('type');
                if (type === 'group') {
                    await this.addToGroup(node, groupOptions);
                } else if (type === 'projectFile') {
                    await this.addToGroup(node, projectOptions);
                } else {
                    console.error(`Tried to execute ${AddToGroupCommand.addToGroupCommandId} without a group`);
                }
            }, this),
        );
    }

    private async addToGroup(groupData: COutlineItem, options: typeof groupOptions | typeof projectOptions): Promise<void> {
        const chosenOption = await this.vscodeWindow.showQuickPick(options);
        if (!chosenOption || chosenOption.id === templateSeparator.id) {
            return;
        }

        if (chosenOption.id === addNewGroupOption.id) {
            this.addGroup(groupData);
        } else {
            const filesToAdd = await this.getFilesToAddForOption(groupData, chosenOption.id);

            // Check if files already exist in the group
            const newFiles = this.checkFilesInGroups(groupData, filesToAdd);

            if (newFiles.length > 0) {
                this.addFiles(groupData, newFiles);
            }
        }
    }

    private checkFilesInGroups(groupData: COutlineItem, filesToAdd: Uri[]): Uri[] {
        const parent = groupData.getParent();
        const projectNode = parent?.getRoot().getChild('project');

        if (!projectNode) {
            return filesToAdd; // No project structure means no duplicates possible
        }

        const existingFilesMap = new Map<Uri, string>();
        const projectFiles = collectGroupFiles(projectNode as COutlineItem);
        const uniqueFiles: Uri[] = [];

        for (const fileToAdd of filesToAdd) {
            // look fileToAdd in projectFiles
            const fileInProject = projectFiles.find(file => file.getAttribute('resourcePath') === fileToAdd.fsPath);
            if (fileInProject) {
                const fileGroup = fileInProject.getParent()?.getAttribute('label') ?? '';
                existingFilesMap.set(fileToAdd, fileGroup);
            } else {
                uniqueFiles.push(fileToAdd);
            }
        }

        if (existingFilesMap.size > 0) {
            const details = [...existingFilesMap]
                .map(([key, value]) => `• "${path.basename(key.fsPath)}" already exists in the group "${value}"`)
                .join('\n');

            vscode.window.showErrorMessage(
                'The following file(s) cannot be added:',
                { modal: true, detail: details }
            );
        }

        return uniqueFiles;
    }

    private async addGroup(groupData: COutlineItem) {
        const name = await this.vscodeWindow.showInputBox({
            title: 'Add New Group', validateInput: (value) => {
                return value ? undefined : 'Name cannot be empty';
            },
        });
        if (name) {
            this.addGroupToGroup(groupData, name);
        }
    }

    private async addFiles(groupData: COutlineItem, filesToAdd: Uri[]) {
        if (filesToAdd.length > 0) {
            await this.addFileUrisToGroup(groupData, filesToAdd);
            for (const fileUri of filesToAdd) {
                this.commandsProvider.executeCommand('vscode.open', fileUri);
            }
        }
    }

    private async getFilesToAddForOption(groupData: COutlineItem, optionLabel: AddFileToGroupOption): Promise<Uri[]> {
        switch (optionLabel) {
            case 'AddNewFile':
                return this.addNewFile(groupData);
            case 'AddExistingFile':
                return this.addFile(groupData, 'Add File to ', true, false);
            case 'AddComponentCodeTemplate':
                return this.addFromCodeTemplate(groupData);
        }
    }

    private async addNewFile(groupData: COutlineItem): Promise<Uri[]> {
        const newFileUri = await this.vscodeWindow.showSaveDialog({
            defaultUri: projectRootFromGroupData(groupData),
            saveLabel: 'Save',
            title: `Add New File to ${groupNameFromPath(getGroupPathArray(groupData))}`,
        });

        if (newFileUri) {
            await this.workspaceFsProvider.writeUtf8File(newFileUri.fsPath, '');
            return [newFileUri];
        } else {
            return [];
        }
    }

    private async addFile(groupData: COutlineItem, title: string, canSelectFiles: boolean, canSelectFolders: boolean): Promise<Uri[]> {
        const result = await this.vscodeWindow.showOpenDialog({
            defaultUri: projectRootFromGroupData(groupData),
            openLabel: 'Add',
            title: title + `${groupNameFromPath(getGroupPathArray(groupData))}`,
            canSelectFiles: canSelectFiles,
            canSelectFolders: canSelectFolders,
            canSelectMany: true,
        });

        return result ?? [];
    }

    private async addFromCodeTemplate(groupData: COutlineItem): Promise<Uri[]> {
        // Pass a promise to showQuickPick so VS Code shows a loading spinner while the components load
        const templateResult = await this.selectTemplate();
        if (!templateResult) {
            return [];
        }

        const targetResult = await this.addFile(groupData, 'Add Template Files to ', false, true);
        if (targetResult.length === 0) {
            return [];
        }

        // Call copyTemplateFiles and ensure the result is an array of Uri
        return await this.copyTemplateFiles(templateResult.template, templateResult.index, targetResult[0]);
    }

    private async copyTemplateFiles(template: CodeTemplate, index: number | undefined, targetFolder: vscode.Uri): Promise<Uri[]> {
        const filesToAdd = await template.copy(targetFolder.fsPath, index);
        if (Array.isArray(filesToAdd) && filesToAdd.length > 0) {
            return filesToAdd.map(f => vscode.Uri.file(f));
        }
        return [];
    }

    private async selectTemplate() {
        return await this.vscodeWindow.showQuickPick(this.getCodeTemplateQuickPickItems(), { matchOnDescription: true });
    }

    private async getCodeTemplateQuickPickItems(): Promise<Array<Pick<QuickPickItem, 'label' | 'description'> & { template: CodeTemplate } & { index?: number }>> {
        let codeTemplates: CodeTemplate[] = [];

        const csolution = this.solutionManager.getCsolution();
        const loadState = this.solutionManager.loadState;

        if (loadState.solutionPath && csolution?.csolutionYml && csolution.cbuildYmlRoot.size > 0) {
            codeTemplates = buildTemplatesFromCbuild(csolution, getCmsisPackRoot());
        }

        // For each template, create a quick pick item for each instance
        const quickPickItems: Array<Pick<QuickPickItem, 'label' | 'description'> & { template: CodeTemplate } & { index?: number }> = [];
        for (const template of codeTemplates) {
            for (let index = 0; index < template.instances; index++) {
                const description = template.getDescription(index);
                quickPickItems.push({
                    label: template.component,
                    description,
                    template: template,
                    index: (template.useIndex) ? index : undefined,
                });
            }
        }
        return quickPickItems.sort((item1, item2) => item1.label.localeCompare(item2.label));
    }

    private async addFileUrisToGroup(
        groupData: COutlineItem,
        fileUris: Uri[],
    ): Promise<void> {
        const parentUri = parentFileUriFromGroupData(groupData);
        const modifications = fileUris.map((fileUri): FileOrGroup => {
            const fileData: FileData = {
                name: backToForwardSlashes(path.relative(path.resolve(parentUri.fsPath, '..'), fileUri.fsPath)),
                forContext: [],
                notForContext: [],
            };

            return { type: 'file', data: fileData };
        });

        return this.addFilesOrGroupsToGroup(groupData, modifications);
    }

    private async addGroupToGroup(
        parentGroupData: COutlineItem,
        newGroupName: string,
    ): Promise<void> {

        const groupData: GroupData = {
            name: newGroupName,
            files: [],
            groups: [],
            forContext: [],
            notForContext: [],
        };
        return this.addFilesOrGroupsToGroup(parentGroupData, [{ type: 'group', data: groupData }]);
    }

    private async addFilesOrGroupsToGroup(
        parentGroupData: COutlineItem,
        fileOrGroups: FileOrGroup[],
    ): Promise<void> {
        const parentUri = parentFileUriFromGroupData(parentGroupData);
        const parentType = getParentTypeFromGroupData(parentGroupData);
        const groupPath = getGroupPathArray(parentGroupData);

        const modifications = fileOrGroups.map(fileOrGroup => {
            return (yamlDocument: YamlDocument) => {
                addItemToExistingGroup(yamlDocument, parentType, groupPath, fileOrGroup);
            };
        });

        await this.editYamlFile(this.workspaceFsProvider, parentUri, modifications);
    }
}
