/**
 * Copyright 2024-2026 Arm Limited
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

import { YAMLMap, YAMLSeq, Document as YamlDocument, Node as YamlNode } from 'yaml';
import * as yaml from 'yaml';
import { FileData, GroupData } from '../parsing/common-file-parsing';
import { YamlPathSegment, listItem, mapKey, modifyYamlNodeAtPath } from './edit-yaml';
import { constructContextList } from './common';

export type FileOrGroup
    = { type: 'file', data: FileData }
    | { type: 'group', data: GroupData }

/**
 * Add a file to a group in the given project or layer document
 * @param groupPath Groups that must be expanded to reach the target group, including the target
 */
export const addItemToExistingGroup = (
    document: YamlDocument<YamlNode>,
    contentKey: 'project' | 'layer',
    groupPath: string[],
    fileOrGroup: FileOrGroup,
): void => {
    if (document.contents) {
        const yamlPath = buildPathFromContentToGroup(groupPath, [mapKey(contentKey)]);
        modifyYamlNodeAtPath(
            document.contents,
            yamlPath,
            group => addItemToGroupNode(group, fileOrGroup),
        );
    }
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
    document: YamlDocument<YamlNode>,
    contentKey: 'project' | 'layer',
    groupPath: string[],
    type: 'file' | 'group',
    name: string,
): boolean => {
    if (document.contents) {
        const yamlPath = buildPathFromContentToGroup(groupPath, [mapKey(contentKey)]);
        let deleted = false;
        modifyYamlNodeAtPath(
            document.contents,
            yamlPath,
            group => {
                deleted = deleteItemFromGroupNode(group, type, name);
            },
        );
        return deleted;
    }
    return false;
};

export const buildPathFromContentToGroup = (groupPath: string[], parentPath: YamlPathSegment[]): YamlPathSegment[] => {
    if (groupPath.length === 0) {
        return parentPath;
    } else {
        const [currentGroup, ...remainingGroups] = groupPath;

        return buildPathFromContentToGroup(remainingGroups, [
            ...parentPath,
            mapKey('groups'),
            listItem(node => yaml.isMap(node) && node.get('group') === currentGroup),
        ]);
    }
};

export const addItemToGroupNode = (group: YamlNode, fileOrGroup: FileOrGroup): void => {
    if (!yaml.isMap(group)) {
        return;
    }

    const containerNodeName = fileOrGroup.type + 's';
    const untypedNode = group.get(containerNodeName);
    let containerNode: YAMLSeq;
    if (yaml.isSeq(untypedNode)) {
        containerNode = untypedNode;
        for (const node of containerNode.items) {
            if (yaml.isMap(node) && node.get(fileOrGroup.type) === fileOrGroup.data.name) {
                console.error(`Group '${fileOrGroup.data.name}' already exists`);
                return; //already exists
            }
        }
    } else {
        containerNode = new YAMLSeq();
        group.set(containerNodeName, containerNode);
    }
    containerNode.add(constructFileOrGroupNode(fileOrGroup));
};

export const deleteItemFromGroupNode = (group: YamlNode, type: 'file' | 'group', name: string): boolean => {
    if (!yaml.isMap(group)) {
        return false;
    }

    const containerNodeName = type + 's';
    const containerNode = group.get(containerNodeName);

    if (yaml.isSeq(containerNode)) {
        // Find the item to delete
        const itemIndex = containerNode.items.findIndex(item =>
            yaml.isMap(item) && item.get(type) === name
        );

        if (itemIndex !== -1) {
            // Remove the item
            containerNode.items.splice(itemIndex, 1);

            // If the container is now empty, remove it entirely
            if (containerNode.items.length === 0) {
                group.delete(containerNodeName);
            }
            return true;
        }
    }

    return false;
};

export const constructFileOrGroupNode = (fileOrGroup: FileOrGroup): YAMLMap => {
    const fileOrGroupNode = new YAMLMap();
    fileOrGroupNode.set(fileOrGroup.type, fileOrGroup.data.name);

    const forContexts = constructContextList(fileOrGroup.data.forContext);
    if (forContexts) {
        fileOrGroupNode.set('for-context', forContexts);
    }

    const notForContexts = constructContextList(fileOrGroup.data.notForContext);
    if (notForContexts) {
        fileOrGroupNode.set('not-for-context', notForContexts);
    }

    return fileOrGroupNode;
};
