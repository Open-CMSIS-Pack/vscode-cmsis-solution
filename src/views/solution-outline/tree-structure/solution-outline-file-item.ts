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

import path from 'path';
import { CTreeItem, ITreeItem } from '../../../generic/tree-item';
import { FILE_TAGS } from '../../../solutions/constants';
import { COutlineItem } from './solution-outline-item';
import { getStatusTooltip, setContextMenuAttributes, setHeaderContext, setMergeDescription, setMergeFileContext } from './solution-outline-utils';
import { getCmsisPackRoot } from '../../../utils/path-utils';
import { matchesContext } from '../../../utils/context-utils';

export class FileItem {
    constructor(private readonly activeContext?: string) { }

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

        const hasCmsisPackRoot = fileValue.indexOf('${CMSIS_PACK_ROOT}') !== -1;
        const filePath = this.resolveFilePath(hasCmsisPackRoot, fileValue);
        const fileBaseName = path.basename(filePath);
        const resourcePath = hasCmsisPackRoot ? filePath : f.resolvePath(filePath);
        const description = isApi ? ' (API)' : undefined;
        const rootFileName = f.rootFileName;

        const cfileItem = this.createFileItem(cgroupItem, fileBaseName, resourcePath, description);

        // Check if file is excluded based on context restrictions
        if (this.activeContext && !matchesContext(f, this.activeContext)) {
            cfileItem.setAttribute('excluded', '1');
        }

        if (addContextMenu) {
            setContextMenuAttributes(cfileItem, filePath, rootFileName);
        }

        // add copy header button for header files
        if (fileBaseName.endsWith('.h')) {
            setHeaderContext(cfileItem);
        }

        // add merge feature
        this.addMergeFeature(f, cfileItem);
    }

    private resolveFilePath(hasCmsisPackRoot: boolean, fileValue: string): string {
        if (hasCmsisPackRoot) {
            return fileValue.replace('${CMSIS_PACK_ROOT}', getCmsisPackRoot());
        }
        return fileValue;
    }

    private createFileItem(cgroupItem: COutlineItem, fileBaseName: string, resourcePath: string, description?: string): COutlineItem {
        const item = cgroupItem.createChild(fileBaseName);
        item.setTag('file');
        item.setAttribute('label', fileBaseName);
        item.setAttribute('expandable', '0');
        item.setAttribute('resourcePath', resourcePath);
        if (cgroupItem.mutable) {
            item.addFeature('file');
        }
        item.setAttribute('description', description);

        return item as COutlineItem;
    }

    public addMergeFeature(f: ITreeItem<CTreeItem>, cfileItem: COutlineItem, options?: { skipValidation?: boolean; localPathOverride?: string }) {
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

        // use override if provided, else use resourcePath
        const localPath = options?.localPathOverride ?? cfileItem.getValue('resourcePath');

        const update = f.getValue('update');
        if (!update) {
            return;
        }

        const base = f.getValue('base');
        if (!base) {
            return;
        }

        const fileStatus = f.getValue('status');
        if (!fileStatus) {
            return;
        }

        // resolve paths
        const rootFileName = f.rootFileName;
        const dir = path.dirname(rootFileName);
        const updatePath = path.join(dir, update);
        const basePath = path.join(dir, base);

        // assign merge context
        setMergeFileContext(cfileItem);

        // assign description
        setMergeDescription(cfileItem, fileStatus);

        // set tooltip
        const existingTooltip = cfileItem.getValue('tooltip');
        const label = cfileItem.getValue('label');

        if (label) {
            const statusTooltip = getStatusTooltip(label, fileStatus);

            if (existingTooltip) {
                cfileItem.setAttribute('tooltip', existingTooltip + '\n' + statusTooltip);
            } else {
                cfileItem.setAttribute('tooltip', statusTooltip);
            }
        }

        cfileItem.setAttribute('local', localPath);
        cfileItem.setAttribute('update', updatePath);
        cfileItem.setAttribute('base', basePath);
    }
}
