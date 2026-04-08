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

import * as path from 'path';
import * as manifest from '../../manifest';
import { COutlineItem } from './tree-structure/solution-outline-item';

export interface MergeNodeResolver {
    setTreeRoot(tree?: COutlineItem): void;
    findMergeNodeByLocalPath(localPath: string): COutlineItem | undefined;
}

export class MergeNodeResolverImpl implements MergeNodeResolver {
    private treeRoot?: COutlineItem;

    public setTreeRoot(tree?: COutlineItem): void {
        this.treeRoot = tree;
    }

    public findMergeNodeByLocalPath(localPath: string): COutlineItem | undefined {
        const root = this.treeRoot;
        if (!root || !localPath) {
            return undefined;
        }

        const normalizedTarget = this.normalizeFsPath(localPath);

        const searchInNode = (node: COutlineItem): COutlineItem | undefined => {
            const features = node.getFeatures().split(';');
            const nodeLocal = node.getAttribute('local');
            if (features.includes(manifest.MERGE_FILE_CONTEXT) && nodeLocal && this.normalizeFsPath(nodeLocal) === normalizedTarget) {
                return node;
            }

            for (const child of node.getChildren()) {
                const found = searchInNode(child as COutlineItem);
                if (found) {
                    return found;
                }
            }

            return undefined;
        };

        return searchInNode(root);
    }

    private normalizeFsPath(filePath: string): string {
        const normalized = path.normalize(filePath);
        return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
    }
}
