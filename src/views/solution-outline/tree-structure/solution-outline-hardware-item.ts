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
import { buildDocFilePath, isWebAddress } from '../../../util';
import { CTreeItem, ITreeItem } from '../../../generic/tree-item';
import path from 'path';
import { FileItemBuilder } from './solution-outline-file-item';
import { CSolution } from '../../../solutions/csolution';
import { SolutionOutlineItemBuilder } from './solution-outline-item-builder';

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

    private createHardwareNode(chardwareItem: COutlineItem, isBoard: boolean, csolution: CSolution, cbuild?: CTreeItem): COutlineItem | undefined {
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
            `- from pack: \`${hardwarePackName}\``;

        chardwareItem.setTag(isBoard ? 'board' : 'device');
        chardwareItem.setAttribute('hardwareName', hardwareName);
        chardwareItem.setAttribute('label', `${isBoard ? 'Board' : 'Device'}: ${hardwareName}`);
        chardwareItem.setAttribute('expandable', '1');
        chardwareItem.setAttribute('iconPath', isBoard ? 'circuit-board' : 'chip');
        chardwareItem.setAttribute('tooltip', tooltip);

        // add dbgconfig file
        this.createDbgConfigNode(chardwareItem, isBoard, cbuild);

        // create children
        this.createBooksNodes(chardwareItem, isBoard, cbuild);

        return chardwareItem;
    }

    private createBooksNodes(chardwareItem: COutlineItem, isBoard: boolean, cbuild?: CTreeItem) {
        if (cbuild) {
            const books = isBoard ? cbuild.getGrandChildren('board-books') : cbuild.getGrandChildren('device-books');
            for (const book of books) {
                this.createBookNode(chardwareItem, book);
            }
        }
    }

    private createBookNode(chardwareItem: COutlineItem, book: ITreeItem<CTreeItem>) {
        const title = book.getValueAsString('title');
        if (!title) {
            return;
        }

        const filePath = buildDocFilePath(book);
        if (!filePath) {
            return;
        }

        const cbookItem = chardwareItem.createChild('book');
        cbookItem.setAttribute('label', title);
        cbookItem.setAttribute('expandable', '0');
        cbookItem.setAttribute('resourcePath', filePath);
        cbookItem.setAttribute('docPath', filePath);
        cbookItem.setAttribute('tooltip', filePath);
        cbookItem.addFeature('docFile');

        const useCommand = isWebAddress(filePath) || !filePath.toLowerCase().endsWith('.md');
        if (useCommand) {
            cbookItem.setAttribute('command', 'cmsis-csolution.openDocFile');
        }
    }

    private createDbgConfigNode(chardwareItem: COutlineItem, isBoard: boolean, cbuild?: CTreeItem) {
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

        const dbgconfFileItem = chardwareItem.createChild('file');
        dbgconfFileItem.setAttribute('label', dbgConfFile);
        dbgconfFileItem.setAttribute('expandable', '0');
        dbgconfFileItem.setAttribute('resourcePath', filePath);
        dbgconfFileItem.setAttribute('tooltip', `\`${filePath}\``);
        dbgconfFileItem.addFeature('file');

        // add merge feature for dbgconf node
        const update = children.find(child => child.getTag() === 'update');
        if (!update) {
            return;
        }

        const base = children.find(child => child.getTag() === 'base');
        if (!base) {
            return;
        }

        const status = children.find(child => child.getTag() === 'status');
        if (!status) {
            return;
        }

        const updateFileName = update.getText();
        file.setAttribute('update', updateFileName);

        const baseFileName = base.getText();
        file.setAttribute('base', baseFileName);

        const statusFileName = status.getText();
        file.setAttribute('status', statusFileName);

        // overwrite tooltip
        dbgconfFileItem.setAttribute('tooltip', '');

        const fileItem = new FileItemBuilder();
        fileItem.addMergeFeature(file, dbgconfFileItem, { skipValidation: true, localPathOverride: filePath });
    }
}
