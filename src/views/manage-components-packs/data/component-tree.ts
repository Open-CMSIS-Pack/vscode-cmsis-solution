/**
 * Copyright 2026 Arm Limited
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

import { ComponentRowDataType } from './component-tools';
import { parseComponentId } from './component-parse';

const componentIdMatches = (aId: string, bId: string): boolean => {
    const a = parseComponentId(aId);
    const b = parseComponentId(bId);
    if (!a || !b) return false;
    if (b.class && a.class !== b.class) return false;
    if (b.bundle && a.bundle !== b.bundle) return false;
    if (b.group && a.group !== b.group) return false;
    if (b.sub && a.sub !== b.sub) return false;
    return true;
};

/**
 * Recursively searches for a component in the tree by its id.
 * @param {ComponentRowDataType[]} tree - The tree to search.
 * @param {string} id - The id of the component to find.
 * @returns {ComponentRowDataType | undefined} - The found component or undefined.
 */
export const findComponentById = (tree: ComponentRowDataType[], id: string): ComponentRowDataType | undefined => {
    for (const node of tree) {
        if (componentIdMatches(node.data.id, id)) {
            return node;
        }
        if (node.children) {
            const found = findComponentById(node.children, id);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
};

/**
 * Flattens a tree structure of component rows into a flat array.
 * @param {ComponentRowDataType[]} tree - The tree structure of component rows to be flattened.
 * @returns {ComponentRowDataType[]} - A flat array of component rows.
 */
export const flatTree = (tree: ComponentRowDataType[]): ComponentRowDataType[] => {
    if (!tree?.length) {
        return [];
    }
    return tree.reduce((totalItems: ComponentRowDataType[], item: ComponentRowDataType) => {
        totalItems.push(item);
        return totalItems.concat(flatTree(item.children ?? []));
    }, []);
};
