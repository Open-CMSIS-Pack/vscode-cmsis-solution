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

import { COutlineItem } from './solution-outline-item';
import { isWebAddress } from '../../../util';
import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import path from 'path';
import { FileItemBuilder } from './solution-outline-file-item';
import { CSolution } from '../../../solutions/csolution';
import { SolutionOutlineItemBuilder } from './solution-outline-item-builder';
import { buildPackOverviewLink } from './pack-tooltip';
import { IDocRef } from '../../../doc-manager/docs-yaml-file';

export class HardwareItemBuilder extends SolutionOutlineItemBuilder {

    public createHardwareNodes(csolution: CSolution, cbuild?: CTreeItem): Map<string, COutlineItem> {
        const hardwareTreeNodes = new Map<string, COutlineItem>();

        this.addHardwareNode(hardwareTreeNodes, csolution, true, cbuild);
        this.addHardwareNode(hardwareTreeNodes, csolution, false, cbuild);

        return hardwareTreeNodes;
    }

    private addHardwareNode(hardwareTreeNodes: Map<string, COutlineItem>, csolution: CSolution, isBoard: boolean, cbuild?: CTreeItem): void {
        const hardwareType = isBoard ? 'board' : 'device';
        const hardwareItem = this.createHardwareNode(new COutlineItem(hardwareType), isBoard, csolution, cbuild);

        if (hardwareItem) {
            const hardwareName = hardwareItem.getAttribute('hardwareName');
            if (hardwareName) {
                hardwareTreeNodes.set(hardwareName, hardwareItem);
            }
        }
    }

    private createHardwareNode(hardwareItem: COutlineItem, isBoard: boolean, csolution: CSolution, cbuild?: CTreeItem): COutlineItem | undefined {
        const boardName = csolution.getBoardName();
        const deviceName = csolution.getDeviceNameWithVendor();
        const hardwareName = isBoard ? boardName : deviceName;

        if (hardwareName == '') {
            return undefined;
        }

        const boardPackName = csolution.getBoardPack();
        const devicePackName = csolution.getDevicePack();
        const hardwarePackName = isBoard ? boardPackName : devicePackName;

        const tooltip =
            `- ${isBoard ? 'board' : 'device'}: \`${hardwareName}\`\n` +
            `- from pack: \`${hardwarePackName}\`${buildPackOverviewLink(hardwarePackName)}`;

        hardwareItem.setTag(isBoard ? 'board' : 'device');
        hardwareItem.setAttribute('hardwareName', hardwareName);
        hardwareItem.setAttribute('label', `${isBoard ? 'Board' : 'Device'}: ${hardwareName}`);
        hardwareItem.setAttribute('expandable', '1');
        hardwareItem.setAttribute('iconPath', isBoard ? 'circuit-board' : 'chip');
        hardwareItem.setAttribute('tooltip', tooltip);

        // add dbgconfig file
        this.createDbgConfigNode(hardwareItem, isBoard, cbuild);

        // create children
        this.createBooksNodes(hardwareItem, isBoard ? 'board' : 'device', cbuild);

        return hardwareItem;
    }

    private createBooksNodes(hardwareItem: COutlineItem, parentTag: 'board' | 'device', cbuild?: CTreeItem) {
        if (!cbuild || !this.docManager) {
            return;
        }
        const parentId = cbuild.getValue(parentTag);
        if (!parentId) {
            return;
        }

        for (const doc of this.docManager.file.getDocs(parentId, parentTag)) {
            this.createBookNode(hardwareItem, doc);
        }
    }

    private createBookNode(hardwareItem: COutlineItem, doc: IDocRef) {
        const title = doc.title;
        if (!title) {
            return;
        }

        const filePath = doc.path ?? doc.name;
        if (!filePath) {
            return;
        }

        const bookItem = hardwareItem.createChild('book');
        bookItem.setAttribute('label', title);
        bookItem.setAttribute('expandable', '0');
        bookItem.setAttribute('resourcePath', filePath);
        bookItem.setAttribute('docPath', filePath);
        bookItem.setAttribute('tooltip', filePath);
        bookItem.addFeature('docFile');

        const useCommand = isWebAddress(filePath) || !filePath.toLowerCase().endsWith('.md');
        if (useCommand) {
            bookItem.setAttribute('command', 'cmsis-csolution.openDocFile');
        }
    }

    private createDbgConfigNode(hardwareItem: COutlineItem, isBoard: boolean, cbuild?: CTreeItem) {
        if (!cbuild || isBoard) {
            return;
        }

        const dbgConfig = cbuild.getChild('dbgconf');
        if (!dbgConfig) {
            return;
        }

        const children = dbgConfig.getGrandChildren();
        if (!children || children.length === 0) {
            return;
        }

        const file = children.find(child => child.getTag() === 'file');
        if (!file) {
            return;
        }

        const fileName = file.getText() ?? '';
        const filePath = file.resolvePath(fileName);
        const dbgConfFile = path.basename(fileName);
        const dbgConfigEntry = file.getParent();

        const dbgconfFileItem = hardwareItem.createChild('file');
        dbgconfFileItem.setAttribute('label', dbgConfFile);
        dbgconfFileItem.setAttribute('expandable', '0');
        dbgconfFileItem.setAttribute('resourcePath', filePath);
        dbgconfFileItem.setAttribute('tooltip', `\`${filePath}\``);
        dbgconfFileItem.addFeature('file');

        // add merge feature for dbgconf node
        const fileItem = new FileItemBuilder(this.csolution, this.rpcData, this.docManager, this.context);
        fileItem.addMergeFeature(dbgConfigEntry ?? file, dbgconfFileItem);
    }
}
