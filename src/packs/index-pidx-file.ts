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

import { CTreeItemXmlFile, ITreeItemFile } from '../generic/tree-item-file';
import { constructor } from '../generic/constructor';
import { getCmsisPackRoot } from '../utils/path-utils';


/**
 * Interface to read index-pidx.xml file
 */
export interface IndexPidxFile extends ITreeItemFile {
    /**
     * Returns available packs : id to URL
     * @returns Map<string,string>
     */
    get packIds(): Map<string, string>;

    /**
     * Returns the timestamp from the root index element.
     */
    get timestamp(): string | undefined;
}

export type PackIndexInfo = {
    packIds: Map<string, string>;
    timestamp?: string;
    isIndexCurrent: boolean;
};

export function isPackIndexCurrent(timestamp?: string, today: Date = new Date()): boolean {
    const match = timestamp?.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (!match) {
        return false;
    }

    const [, year, month, day] = match;
    return Number(year) === today.getFullYear() &&
        Number(month) === today.getMonth() + 1 &&
        Number(day) === today.getDate();
}


class IndexPidxFileImpl extends CTreeItemXmlFile implements IndexPidxFile {
    get timestamp(): string | undefined {
        return this.ensureRootItem().getChild('timestamp')?.getText();
    }

    get packIds(): Map<string, string> {
        const packs = new Map<string, string>();
        for (const item of this.ensureRootItem().getGrandChildren('pindex')) {
            const name = item.getAttribute('name');
            const vendor = item.getAttribute('vendor');
            const version = item.getAttribute('version');
            if (!name || !vendor || !version) {
                continue;
            }
            const id = vendor + '::' + name + '@' + version;
            const url = 'https://www.keil.arm.com/packs/' + name.toLowerCase() + '-' + vendor.toLowerCase() + '/versions/';
            packs.set(id, url);
        }
        return packs;
    }
}

export const IndexPidxFile = constructor<typeof IndexPidxFileImpl, IndexPidxFile>(IndexPidxFileImpl);

export async function getLatestAvailablePacks() {
    return (await getLatestAvailablePacksInfo()).packIds;
}

export async function getLatestAvailablePacksInfo(): Promise<PackIndexInfo> {
    const pidxPath = getCmsisPackRoot() + '/.Web/index.pidx';
    const pidx = new IndexPidxFile(pidxPath);
    await pidx.load();
    return {
        packIds: pidx.packIds,
        timestamp: pidx.timestamp,
        isIndexCurrent: isPackIndexCurrent(pidx.timestamp),
    };
}
