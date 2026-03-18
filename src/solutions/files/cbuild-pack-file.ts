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

import { constructor } from '../../generic/constructor';
import { ETextFileResult } from '../../generic/text-file';
import { CTreeItem } from '../../generic/tree-item';
import { CTreeItemYamlFile, ITreeItemFile } from '../../generic/tree-item-file';

/**
 * Access a <solutionName>.cbuild-pack.yml file
 */
export interface CbuildPackFile extends ITreeItemFile {
    /**
     * Get resolved packs as a map: pack id to array of pack id selections
     */
    get resolvedPacks(): Map<string, string[]>;

    /**
     * Get resolved packs as a map: pack id to array of pack id selections
     */
    set resolvedPacks(packs: Map<string, string[]>);

    /**
     * Removes a package by it's name from the resolved packs
     * @param packName The package name to remove
     */
    unlockPackage(packName: string): void;
}

class CbuildPackFileImpl extends CTreeItemYamlFile implements CbuildPackFile {

    override ensureTopItem(_tag?: string): CTreeItem {
        return super.ensureTopItem('cbuild-pack');
    }

    get resolvedPacks(): Map<string, string[]> {
        const packs = new Map<string, string[]>();
        for (const c of this.ensureTopItem().getGrandChildren('resolved-packs')) {
            const key = c.getValue('resolved-pack');
            if (key) {
                packs.set(key, c.getValuesAsArray('selected-by-pack'));
            }
        }
        return packs;
    }

    set resolvedPacks(packs: Map<string, string[]>) {
        if (packs.size === 0) {
            this.rootItem = undefined;
            return;
        }
        const resolvedPacksItem = this.ensureTopItem().createChild('resolved-packs', true);
        // remove items
        for (const item of resolvedPacksItem.getChildren()) {
            const id = item.getValue('resolved-pack');
            if (!id || !packs.get(id)) {
                resolvedPacksItem.removeChild(item);
            }
        }

        // add/update
        for (const [id, selectedByArray] of packs) {
            const selectedByPack = resolvedPacksItem.createSequenceChildWithValue('resolved-pack', id).createChild('selected-by-pack');
            selectedByPack.fromObject(selectedByArray);
        }
    }

    unlockPackage(packName: string): void {
        const resolvedPacksItem = this.ensureTopItem().getChild('resolved-packs');
        if (resolvedPacksItem) {
            for (const item of resolvedPacksItem.getChildren()) {
                if (item.getChildren().some(selectedByItem => selectedByItem.getValue()?.startsWith(`${packName}@`) || selectedByItem.getValue() === packName)) {
                    resolvedPacksItem.removeChild(item);
                }
            }
        }
    }

    protected override doSave(): ETextFileResult {
        if (this.topItem && this.topItem.getGrandChildren('resolved-packs').length > 0) {
            return super.doSave();
        }
        if (!this.exists()) {
            return ETextFileResult.Unchanged;
        }
        this.unlink(); // delete the file since *.cbuild-pack.yml should not be empty
        return ETextFileResult.Success;
    }

}

export const CbuildPackFile = constructor<typeof CbuildPackFileImpl, CbuildPackFile>(CbuildPackFileImpl);
