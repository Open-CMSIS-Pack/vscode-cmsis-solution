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

import path from 'path';
import { CTreeItem, ITreeItem } from '../../../generic/tree-item';
import { FILE_TAGS } from '../../../solutions/constants';
import { COutlineItem } from './solution-outline-item';
import { setContextMenuAttributes, setHeaderContext, setMergeFileContext } from './solution-outline-utils';
import { matchesContext } from '../../../utils/context-utils';
import { SolutionOutlineItemBuilder } from './solution-outline-item-builder';
import { CSolution } from '../../../solutions/csolution';
import { SolutionRpcData } from '../../../solutions/solution-rpc-data';

export class FileItemBuilder extends SolutionOutlineItemBuilder {
    constructor(
        csolution?: CSolution,
        rpcData?: SolutionRpcData,
        context?: string,
        public readonly topTag?: string,
    ) {
        super(csolution, rpcData, context);
    }

    public createFileNodes(cgroupItem: COutlineItem, files: ITreeItem<CTreeItem>[], docs?: ITreeItem<CTreeItem>[], isApi?: boolean, addContextMenu?: boolean) {
        for (const f of files) {
            const category = f.getValue('category');
            if (category === 'doc') {
                docs?.push(f);
            } else if (f.getValue('attr') !== 'template' && category !== 'include' && category !== 'other') {
                this.createFileNode(cgroupItem, f, isApi, addContextMenu);
            }
        }
        cgroupItem.sortChildrenByGroupThenLabel();
    }

    private createFileNode(cgroupItem: COutlineItem, f: ITreeItem<CTreeItem>, isApi?: boolean, addContextMenu?: boolean) {
        const fileValue = f.getValueForOneOfKeys(FILE_TAGS);
        if (!fileValue) {
            return;
        }

        const hasCmsisRoot = fileValue.startsWith('${CMSIS_');
        const hasAccessSequences = !hasCmsisRoot && fileValue.includes('$');
        const expandedFilePath = this.expandString(fileValue);
        const resourcePath = hasCmsisRoot ? expandedFilePath : f.resolvePath(expandedFilePath);
        const label = hasAccessSequences ? fileValue : path.basename(expandedFilePath);
        const description = isApi ? ' (API)' : undefined;
        const rootFileName = f.rootFileName;

        const cfileItem = this.createFileItem(cgroupItem, label, resourcePath, description);

        // Check if file is excluded based on context restrictions
        if (this.context && !matchesContext(f, this.context)) {
            cfileItem.setAttribute('excluded', '1');
        }

        if (addContextMenu) {
            setContextMenuAttributes(cfileItem, fileValue, rootFileName, this.topTag);
        }

        // add copy header button for header files
        if (expandedFilePath.endsWith('.h')) {
            setHeaderContext(cfileItem);
        }

        // add merge feature
        this.addMergeFeature(f, cfileItem);
    }

    private createFileItem(cgroupItem: COutlineItem, label: string, resourcePath: string, description?: string): COutlineItem {
        const item = cgroupItem.createChild('file');
        item.setAttribute('label', label);
        item.setAttribute('expandable', '0');
        item.setAttribute('resourcePath', resourcePath);
        if (cgroupItem.mutable) {
            item.addFeature('file');
        }
        item.setAttribute('description', description);

        return item as COutlineItem;
    }

    public addMergeFeature(f: ITreeItem<CTreeItem>, cfileItem: COutlineItem, options?: { skipValidation?: boolean; localPathOverride?: string }) {
        // Only config files with a resolvable resource path are eligible.
        // Callers can bypass this when they already validated inputs upstream.
        if (!options?.skipValidation) {
            const attr = f.getValue('attr');
            if (attr !== 'config') {
                return;
            }
            const localPath = cfileItem.getValue('resourcePath');
            if (!localPath) {
                return;
            }
        }

        // Prefer an explicit local path from caller; otherwise fall back to the tree item's resource path.
        const localPath = options?.localPathOverride ?? cfileItem.getValue('resourcePath');
        if (!localPath) {
            return;
        }

        const fileStatus = f.getValue('status');
        if (!fileStatus) {
            return;
        }

        cfileItem.setAttribute('local', localPath);
        setMergeFileContext(cfileItem);
    }
}
