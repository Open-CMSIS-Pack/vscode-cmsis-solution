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

import { COutlineItem } from './tree-structure/solution-outline-item';

export const getGroupPathArray = (groupData: COutlineItem): string[] => {
    let groupPath: string[] = [];

    const groupPathAtt = groupData.getAttribute('groupPath');
    if (groupPathAtt) {
        groupPath = groupPathAtt.split(';');
    }
    return groupPath;
};

export const collectGroupFiles = (node: COutlineItem): COutlineItem[] => {
    const nodeChildren = node.getChildren();
    const files: COutlineItem[] = [];
    if (nodeChildren) {
        const children = nodeChildren as COutlineItem[];
        for (const child of children) {
            if (child.getTag() === 'file') {
                files.push(child);
            } else if (child.getTag() === 'group') {
                // Recursively collect files from subgroups
                const subgroupFiles = collectGroupFiles(child as COutlineItem);
                files.push(...subgroupFiles);
            }
        }
    }
    return files;
};
