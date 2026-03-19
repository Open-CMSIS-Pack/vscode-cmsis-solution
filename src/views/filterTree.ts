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

import { TreeNode } from 'primereact/treenode';
import { TreeNodeElement } from './config-wizard/confwiz-webview-common';

export function filterTree(nodes: TreeNode[] | undefined, filter: string): TreeNode[] | undefined {
    if (!nodes) {
        return undefined;
    }

    return nodes.map(node => {
        const data = node.data as TreeNodeElement;
        const matches = data.name.toLowerCase().includes(filter.toLowerCase());
        // Recursively filter children
        const filteredChildren = filterTree(node.children, filter);
        // Include the node if it matches or if any of its children match
        if (matches || (filteredChildren && filteredChildren.length > 0)) {
            return {
                ...node,
                children: filteredChildren, // Include filtered children
            };
        }
        return undefined; // Exclude nodes that don't match
    }).filter(node => !!node); // Remove undefined values
}
