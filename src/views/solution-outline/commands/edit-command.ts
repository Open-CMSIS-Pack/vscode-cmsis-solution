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
import * as yaml from 'yaml';
import { CommandsProvider } from '../../../vscode-api/commands-provider';
import * as manifest from '../../../manifest';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import { getGroupPathArray } from '../utils';
import { buildPathFromContentToGroup } from '../../../solutions/edit/manage-group-items';
import { getYamlNodeAtPath, listItem, mapKey } from '../../../solutions/edit/edit-yaml';
import { readTextFile } from '../../../utils/fs-utils';

export class EditCommand {
    public static readonly editCommandId = `${manifest.PACKAGE_NAME}.edit`;

    constructor(
        private readonly commandsProvider: CommandsProvider,
    ) { }

    public async activate(context: Pick<vscode.ExtensionContext, 'subscriptions'>) {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(EditCommand.editCommandId, async (node: COutlineItem) => {
                await this.editGroup(node);
            }, this),
        );
    }

    private async editGroup(node: COutlineItem): Promise<void> {
        if (node.getTag() !== 'group') {
            return;
        }

        const filePath = node.originFilePath;
        if (!filePath) {
            return;
        }

        const groupPath = getGroupPathArray(node);
        if (groupPath.length === 0) {
            return;
        }

        const parentType = this.getParentTypeFromNode(node);
        const offset = this.findGroupOffset(filePath, parentType, groupPath) ?? 0;

        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
        const position = document.positionAt(offset);
        await vscode.window.showTextDocument(document, {
            selection: new vscode.Range(position, position),
            preview: false,
        });
    }

    private findGroupOffset(filePath: string, parentType: 'project' | 'layer', groupPath: string[]): number | undefined {
        const input = readTextFile(filePath);
        if (!input) {
            return undefined;
        }

        const yamlDocument = yaml.parseDocument(input);
        const contents = yamlDocument.contents;
        if (!contents) {
            return undefined;
        }

        const targetGroupName = groupPath[groupPath.length - 1];
        if (!targetGroupName) {
            return undefined;
        }

        const pathToParentGroup = buildPathFromContentToGroup(groupPath.slice(0, -1), [mapKey(parentType)]);
        const pathToTargetGroup = [
            ...pathToParentGroup,
            mapKey('groups'),
            listItem(item => yaml.isMap(item) && item.get('group') === targetGroupName),
        ];

        const targetGroupNode = getYamlNodeAtPath(contents, pathToTargetGroup);
        return (targetGroupNode && yaml.isNode(targetGroupNode) && targetGroupNode.range)
            ? targetGroupNode.range[0]
            : undefined;
    }

    private getParentTypeFromNode(node: COutlineItem): 'project' | 'layer' {
        return node.getAttribute('layerUri') ? 'layer' : 'project';
    }
}
