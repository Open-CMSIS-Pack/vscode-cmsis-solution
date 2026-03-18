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

import { Node as YamlNode } from 'yaml';
import * as yaml from 'yaml';

export type MapKeyYamlPathSegment = { type: 'map-key', key: string };
export type ListItemYamlPathSegment = { type: 'list-item', predicate: (node: YamlNode) => boolean };

/**
 * Part of a path to a YAML node in a document.
 * For example, following a key in a map or searching for an item in list.
 */
export type YamlPathSegment = MapKeyYamlPathSegment | ListItemYamlPathSegment;

export const mapKey = (key: string): MapKeyYamlPathSegment => ({ type: 'map-key', key });
export const listItem = (predicate: (node: YamlNode) => boolean): ListItemYamlPathSegment => ({ type: 'list-item', predicate });

export const modifyYamlNodeAtPath = (
    node: YamlNode,
    path: YamlPathSegment[],
    modify: (node: YamlNode) => void,
): void => {
    const nodeAtPath = getYamlNodeAtPath(node, path);
    if (nodeAtPath) {
        modify(nodeAtPath);
    }
};

export const getYamlNodeAtPath = (node: YamlNode, path: YamlPathSegment[]): YamlNode | undefined => {
    const [currentPathSegment, ...remainingPath] = path;

    if (!currentPathSegment) {
        return node;
    }

    const nextNode = followPathSegment(node, currentPathSegment);
    return nextNode ? getYamlNodeAtPath(nextNode, remainingPath) : undefined;
};

const followPathSegment = (node: YamlNode, pathSegment: YamlPathSegment): YamlNode | undefined => {
    switch (pathSegment.type) {
        case 'list-item': return followListItemPathSegment(node, pathSegment);
        case 'map-key': return followMapKeyPathSegment(node, pathSegment);
    }
};

export const followListItemPathSegment = (node: YamlNode, pathSegment: ListItemYamlPathSegment): YamlNode | undefined => {
    if (yaml.isSeq(node)) {
        return node.items.find(
            (item): item is YamlNode => yaml.isNode(item) && pathSegment.predicate(item)
        );
    }
    return undefined;
};

export const followMapKeyPathSegment = (node: YamlNode, pathSegment: MapKeyYamlPathSegment): YamlNode | undefined => {
    if (yaml.isMap(node)) {
        const valueAtKey = node.get(pathSegment.key);
        return yaml.isNode(valueAtKey) ? valueAtKey : undefined;
    }
    return undefined;
};
