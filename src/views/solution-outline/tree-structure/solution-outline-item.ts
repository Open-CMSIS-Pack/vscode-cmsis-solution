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

import { CTreeItem } from '../../../generic/tree-item';

export class COutlineItem extends CTreeItem {
    constructor(tag: string, parent?: COutlineItem) {
        super(tag, parent);
    }

    createItem(tag: string, parent?: COutlineItem): COutlineItem {
        return new COutlineItem(tag, parent);
    }

    createChild(tag: string, checkIfExists?: boolean): COutlineItem {
        return super.createChild(tag, checkIfExists) as COutlineItem;
    }

    getChildItem(tag?: string): COutlineItem | undefined {
        return this.getChild(tag) as COutlineItem;
    }

    getParentItem(tag?: string): COutlineItem | undefined {
        return this.getParent(tag) as COutlineItem;
    }

    getParentOrThis(tag: string): COutlineItem | undefined {
        if (tag && this.getTag() === tag) {
            return this;
        }
        return this.getParentItem(tag) as COutlineItem;
    }


    get parentProject() : COutlineItem | undefined {
        return this.getParentOrThis('project');
    }

    get parentLayer() : COutlineItem | undefined {
        return this.getParentOrThis('layer');
    }

    get cprojectPath() : string | undefined {
        const parentItem = this.parentProject;
        return parentItem?.getResourcePath();
    }

    get clayerPath() : string | undefined {
        const parentItem = this.parentLayer;
        return parentItem?.getResourcePath();
    }


    /**
     * Return path to originating file: project or layer
     * @returns project or layer file path or empty string
     */
    get originFilePath() {
        const layer = this.getAttribute('layerUri');
        if (layer) {
            return layer;
        }
        return this.getValueAsString('projectUri');
    }

    get mutable() {
        return this.getAttribute('mutable') === '1';
    }

    set mutable(mutable: boolean | undefined) {
        this.setAttribute('mutable', mutable ? '1' : undefined);
    }

    /**
     * Get features string
     * @returns string of features separated by ';'
     */
    getFeatures(): string  {
        return this.getAttribute('features') ?? '';
    }

    addFeature(feature: string) {
        const existingFeatures = this.getFeatures();
        const newFeatures = existingFeatures.length > 0 ? existingFeatures + ';' + feature : feature;
        this.setAttribute('features', newFeatures);
    }

    getHeader(): string | undefined {
        const header = this.getAttribute('header');
        if (header) {
            return header;
        }
        if (this.getFeatures().indexOf('header') >= 0) {
            return this.getAttribute('label');
        }
        return undefined;
    }

    getResourcePath(): string | undefined {
        return this.getAttribute('resourcePath');
    }

    sortChildrenByLabel(): void {
        COutlineItem.sortTreeNodesByLabel(this.getChildren() as COutlineItem[]);
    }

    sortChildrenByGroupThenLabel(): void {
        COutlineItem.sortTreeNodesByGroupThenLabel(this.getChildren() as COutlineItem[]);
    }

    static sortTreeNodesByLabel(input?: COutlineItem[]): void {
        input?.sort((a, b) =>
            (a.getAttribute('label') || '').localeCompare(b.getAttribute('label') || ''));
    }

    static sortTreeNodesByGroupThenLabel(input?: COutlineItem[]): void {
        input?.sort((a, b) => {
            const tagA = a.getTag();
            const tagB = b.getTag();

            if (tagA === 'group' && tagB !== 'group') {
                return -1;
            }
            if (tagB === 'group' && tagA !== 'group') {
                return 1;
            }

            return (a.getAttribute('label') || '').localeCompare(b.getAttribute('label') || '');
        });
    }
}
