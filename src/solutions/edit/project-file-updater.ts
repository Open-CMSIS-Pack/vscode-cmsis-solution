/**
 * Copyright 2024-2026 Arm Limited
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
import { ComponentInstance, PackReference, UsedItems } from '../../json-rpc/csolution-rpc-client';
import { SolutionManager } from '../solution-manager'; // Import SolutionManager
import { CTreeItemYamlFile } from '../../generic/tree-item-file';
import { ETextFileResult } from '../../generic/text-file';
import { stripVendor, stripVendorAndVersion, stripVersion } from '../../utils/string-utils';
import { CTreeItem, ITreeItem } from '../../generic/tree-item';
import { pathsEqual } from '../../utils/path-utils';
import { backToForwardSlashes } from '../../utils/path-utils';
import { matchesContext } from '../../utils/context-utils';

/**
 * Interface to update cproject.yml and used clayer.yml files
 */
export interface ProjectFileUpdater {
    /**
     * @param context active context
     * @param project primary file to update, (layer files are supplied s component instance property)
     * @param usedItems collection of used components and packs
     */

    updateUsedItems(context: string, projectFile: string, usedItems: UsedItems): Promise<boolean>;
}

const stripVendorVersionPredicate = (itemValue?: string, value?: string): boolean =>
    (stripVendorAndVersion(itemValue) === stripVendorAndVersion(value));

export class ProjectFileUpdaterImpl implements ProjectFileUpdater {

    protected context?: string; // active context to avoid transferring it via function arguments
    constructor(
        private readonly solutionManager: SolutionManager
    ) {

    }

    public async updateUsedItems(context: string, projectFile: string, usedItems: UsedItems): Promise<boolean> {
        const csolution = this.solutionManager.getCsolution();
        if (!csolution || projectFile.length == 0) {
            return false;
        }
        this.context = context;
        // replace all empty origin entries with supplied project filename
        for (const ref of usedItems.packs) {
            if (!ref.origin) {
                ref.origin = projectFile;
            }
        }

        let changed = false;
        if (await this.updateUsedItemsInYmlFile(csolution.solutionPath, usedItems, false)) {
            changed = true;
        }
        if (await this.updateUsedItemsInYmlFile(projectFile, usedItems, true)) {
            changed = true;
        }
        if (await this.updateAllLayerFiles(csolution.clayerYmlRoot, usedItems)) {
            changed = true;
        }
        return changed;
    }

    // Extracted: update all layer files
    private async updateAllLayerFiles(clayerYmlRoot: Map<string, CTreeItem>, usedItems: UsedItems): Promise<boolean> {
        let changed = false;
        for (const [key] of clayerYmlRoot) {
            const fileName = backToForwardSlashes(path.resolve(key));
            if (fileName.endsWith('.cgen.yml') || fileName.endsWith('.cgen.yaml')) {
                continue;
            }
            if (await this.updateUsedItemsInYmlFile(fileName, usedItems, true, true)) {
                changed = true;
            }
        }
        return changed;
    }

    protected async updateUsedItemsInYmlFile(fileName: string, usedItems: UsedItems, updateComponents: boolean, layer?: boolean): Promise<boolean> {
        const ymlFile = new CTreeItemYamlFile();
        const result = await ymlFile.load(fileName);
        if (result === ETextFileResult.Error || result === ETextFileResult.NotExists) {
            return false;
        }
        const top = ymlFile.topItem;
        if (!top) {
            return false;
        }
        if (updateComponents) {
            const layerFile = layer ? fileName : undefined;
            const components = top.createChild('components', true); // ensure components item exists
            this.removeUnusedComponents(components, usedItems.components, layerFile);
            this.addOrUpdateComponents(components, usedItems.components, layerFile);
            this.cleanupEmptyNode(components);
        }

        const packs = top.createChild('packs', true); // ensure packs item exists
        this.removeUnusedPacks(packs, usedItems.packs);
        this.addPacks(packs, usedItems.packs);
        this.cleanupEmptyNode(packs);

        const res = await ymlFile.save();
        return res === ETextFileResult.Success;
    }

    // Remove components not in usedItems
    private removeUnusedComponents(components: CTreeItem, usedComponents: ComponentInstance[], layerFile?: string) {
        for (const c of components.getChildren()) {
            if (!this.isComponentUsed(c, usedComponents, layerFile)) {
                components.removeChild(c);
            }
        }
    }

    protected isComponentUsed(c?: ITreeItem<CTreeItem>, components?: ComponentInstance[], layerFile?: string): boolean {
        if (!c || !components) {
            return false;
        }
        if (!matchesContext(c, this.context)) {
            return true; // should be ignored
        }

        const baseId = stripVendorAndVersion(c.getValue('component'));

        for (const ci of components) {
            if (!pathsEqual(ci.options?.layer, layerFile)) {
                continue;
            }
            if (ci.id === baseId || ci.resolvedComponent && stripVendorAndVersion(ci.resolvedComponent.id) === baseId) {
                return true;
            }
        }
        return false;
    }

    // Add or update components from usedItems
    private addOrUpdateComponents(components: CTreeItem, usedComponents: ComponentInstance[], layerFile?: string) {
        for (const ci of usedComponents) {
            if (!pathsEqual(ci.options?.layer, layerFile)) {
                continue;
            }
            let id = stripVersion(ci.resolvedComponent ? ci.resolvedComponent.id : ci.id);
            if (!id || id.length === 0 || id.endsWith('(API)')) {
                continue;
            }
            let explicitVendor = ci.options?.explicitVendor;
            let explicitVersion = ci.options?.explicitVersion;
            if (explicitVersion) {
                if (!explicitVersion.startsWith('@')) {
                    explicitVersion = '@' + explicitVersion;
                }
                id += explicitVersion;
                explicitVendor = true; // explicit version only make sense for specific vendor
            }
            if (!explicitVendor) {
                id = stripVendor(id);
            }

            const c = this.ensureEntry(components, 'component', id, true);
            c.setValue('component', id);
            if (ci.selectedCount && ci.selectedCount > 1) {
                c.setValue('instances', ci.selectedCount.toString());
            } else {
                c.setValue('instances', undefined); // remove child element
            }
        }
    }

    // Add packs from usedItems
    private addPacks(packs: CTreeItem, usedPacks: PackReference[]) {
        const filename = packs.rootFileName;
        const fileDir = packs.rootFileDir;
        for (const ref of usedPacks) {
            if (ref.selected && pathsEqual(filename, ref.origin)) {
                const entry = this.ensureEntry(packs, 'pack', ref.pack, false);
                if (ref.path) {
                    let packPack = path.resolve(fileDir, ref.path);
                    packPack = backToForwardSlashes(path.relative(fileDir, packPack));
                    entry.setValue('path', packPack);
                } else {
                    entry.setValue('path', undefined);
                }
            }
        }
    }

    // Remove packs not in usedItems if all components are in the same context
    private removeUnusedPacks(packs: CTreeItem, usedPacks: PackReference[]) {
        for (const p of packs.getChildren()) {
            if (!this.isPackUsed(p, usedPacks)) {
                packs.removeChild(p);
            }
        }
    }

    protected isPackUsed(packEntry: ITreeItem<CTreeItem>, refs: PackReference[]): boolean {
        if (!matchesContext(packEntry, this.context)) {
            return true;
        }
        for (const ref of refs) {
            if (ref.selected && packEntry.getValue('pack') === ref.pack && pathsEqual(ref.origin, packEntry.rootFileName)) {
                return true;
            }
        }
        return false;
    }

    // Remove node if it has no children
    private cleanupEmptyNode(node: CTreeItem) {
        if (node.getChildren().length < 1) {
            node.getParent()?.removeChild(node);
        }
    }

    protected ensureEntry(parent: CTreeItem, key: string, id: string, ignoreVersionVendor: boolean) {
        const entries = parent.getChildren().filter(c => {
            const cid = c.getValue(key);
            return (ignoreVersionVendor ? stripVendorVersionPredicate(cid, id) : cid === id);
        });
        let entry = entries.find(c => matchesContext(c, this.context));
        if (!entry) {
            const lastEntry = entries[entries.length - 1];
            const index = lastEntry ? parent.indexOfChild(lastEntry) + 1 : -1;
            entry = parent.createChild('-', false, index).setValue(key, id);
            if (lastEntry) {
                // there are entries for other contexts, add our
                entry.setValue('for-context', this.context);
            }
        }
        return entry;
    }
}
