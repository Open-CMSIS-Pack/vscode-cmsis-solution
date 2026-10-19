/**
 * Copyright 2024-2026 Arm Limited
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

import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { appendSequenceMapEntry, setContextRestrictions } from '../files/yaml-creation-helpers';

export type GroupItemData = {
    name: string;
    forContext: string[] | string;
    notForContext: string[] | string;
};

export type FileOrGroup
    = { type: 'file', data: GroupItemData }
    | { type: 'group', data: GroupItemData };

export type GroupItemEditResult = 'changed' | 'duplicate' | 'not-found' | 'invalid-path';

const asArray = (value: string[] | string): string[] => Array.isArray(value) ? value : value ? [value] : [];

export const findGroup = (topItem: CTreeItem, groupPath: readonly string[]): CTreeItem | undefined => {
    let group: CTreeItem | undefined = topItem;
    for (const groupName of groupPath) {
        const nextGroup = group.getChild('groups')?.getChildByValue('group', groupName) as CTreeItem | undefined;
        if (!nextGroup) {
            return undefined;
        }
        group = nextGroup;
    }
    return group;
};

/**
 * Add a file to a group in the given project or layer document
 * @param groupPath Groups that must be expanded to reach the target group, including the target
 */
export const addItemToExistingGroup = (
    topItem: CTreeItem,
    groupPath: readonly string[],
    fileOrGroup: FileOrGroup,
): GroupItemEditResult => {
    const group = findGroup(topItem, groupPath);
    if (!group) {
        return 'invalid-path';
    }
    return addItemToGroupNode(group, fileOrGroup);
};

/**
 * Delete a file or group from a specific group in the given project or layer document
 * @param document The YAML document to modify
 * @param contentKey The key of the content (project or layer)
 * @param groupPath Groups that must be expanded to reach the target group, including the target
 * @param fileOrGroup The file or group to delete
 * @param name The name of the file or group to delete
 */
export const deleteItemFromExistingGroup = (
    topItem: CTreeItem,
    groupPath: readonly string[],
    type: 'file' | 'group',
    name: string,
): GroupItemEditResult => {
    const group = findGroup(topItem, groupPath);
    if (!group) {
        return 'invalid-path';
    }
    return deleteItemFromGroupNode(group, type, name);
};

export const addItemToGroupNode = (group: CTreeItem, fileOrGroup: FileOrGroup): GroupItemEditResult => {
    const containerNodeName = fileOrGroup.type + 's';
    const containerNode = group.getChild(containerNodeName);
    if (containerNode?.getChildByValue(fileOrGroup.type, fileOrGroup.data.name)) {
        return 'duplicate';
    }

    const item = appendSequenceMapEntry(group, containerNodeName, fileOrGroup.type, fileOrGroup.data.name);
    setContextRestrictions(item, asArray(fileOrGroup.data.forContext), asArray(fileOrGroup.data.notForContext));
    return 'changed';
};

export const deleteItemFromGroupNode = (group: CTreeItem, type: 'file' | 'group', name: string): GroupItemEditResult => {
    const containerNodeName = type + 's';
    const containerNode = group.getChild(containerNodeName) as CTreeItem | undefined;
    const item = containerNode?.getChildByValue(type, name);
    if (!containerNode || !item) {
        return 'not-found';
    }

    containerNode.removeChild(item);
    if (containerNode.getChildren().length === 0) {
        group.removeChild(containerNode);
    }
    return 'changed';
};
