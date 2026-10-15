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

import { constructor } from '@open-cmsis-pack/cmsis-common/constructor';
import { CTreeItem, ETreeItemKind, ITreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { CTreeItemYamlFile, ITreeItemFile } from '@open-cmsis-pack/cmsis-common/tree-item-file';
import { CTreeItemWrap, ITreeItemWrap } from '@open-cmsis-pack/cmsis-common/tree-item-wrapper';

export interface IDocRef extends ITreeItemWrap {
    get name(): string;
    set name(value: string | undefined);
    path: string | undefined;
    get title(): string;
    set title(value: string | undefined);
    category: string | undefined;
}

export interface IDocParent extends ITreeItemWrap {
    readonly tag: string;
    readonly id: string;
    readonly docs: readonly IDocRef[];
    getDoc(name: string): IDocRef | undefined;
    getDocByPath(path: string): IDocRef | undefined;
    ensureDoc(name: string): IDocRef;
    removeDoc(name: string): boolean;
}

export interface DocsYamlFile extends ITreeItemFile {
    getDocParents(parentTag?: string): readonly IDocParent[];
    getDocParent(parentId: string, parentTag?: string): IDocParent | undefined;
    getDocs(parentId: string, parentTag?: string): readonly IDocRef[];
    getDoc(name: string, parentId: string, parentTag?: string): IDocRef | undefined;
    getDocByPath(path: string, parentId: string, parentTag?: string): IDocRef | undefined;
    findDocs(name: string, parentTag?: string): IDocRef[];

    ensureParent(parentId: string, parentTag: string): CTreeItem;
    ensureDoc(name: string, parentId: string, parentTag: string): IDocRef;
    removeDoc(name: string, parentId: string, parentTag?: string): boolean;
}

class DocRefWrap extends CTreeItemWrap implements IDocRef {
    override get nameKey(): string { return 'name'; }
    get path(): string | undefined { return this.getValue('path'); }
    set path(value: string | undefined) { this.setValue('path', value); }
    get title(): string { return this.getValue('title') || this.name || this.path || ''; }
    set title(value: string | undefined) { this.setValue('title', value); }
    get category(): string | undefined { return this.getValue('category'); }
    set category(value: string | undefined) { this.setValue('category', value); }
}

class DocParentWrap extends CTreeItemWrap implements IDocParent {
    constructor(item: ITreeItem<CTreeItem>, public readonly tag: string) {
        super(item);
    }

    override get nameKey(): string { return this.tag; }
    get id(): string { return this.getValue(this.tag) ?? ''; }

    get docs(): readonly IDocRef[] {
        return (this.item?.getGrandChildren('docs') ?? []).map(item => new DocRefWrap(item));
    }

    getDoc(name: string): IDocRef | undefined {
        return this.docs.find(doc => doc.name === name);
    }

    getDocByPath(path: string): IDocRef | undefined {
        return this.docs.find(doc => doc.path === path);
    }

    ensureDoc(name: string): IDocRef {
        const existing = this.getDoc(name);
        if (existing) {
            return existing;
        }
        const sequence = this.item!.createChild('docs', true).setKind(ETreeItemKind.Sequence);
        const item = sequence.createChild('-').setKind(ETreeItemKind.Map);
        item.setValue('name', name);
        return new DocRefWrap(item);
    }

    removeDoc(name: string): boolean {
        const doc = this.getDoc(name);
        if (!doc) {
            return false;
        }
        doc.remove();
        return true;
    }
}

class DocsYamlFileImpl extends CTreeItemYamlFile implements DocsYamlFile {

    public override ensureTopItem(): CTreeItem {
        return super.ensureTopItem('docs');
    }

    getDocParents(parentTag?: string): readonly IDocParent[] {

        const parentTags = parentTag !== undefined ? [parentTag] : (this.topItem?.getChildren() ?? [])
            .map(item => item.getTag() ?? '')
            .filter(tag => tag.endsWith('s'))
            .map(tag => tag.slice(0, -1));
        return parentTags.flatMap(tag => (this.topItem?.getGrandChildren(`${tag}s`) ?? [])
            .flatMap(item => {
                const parentItem = item.getChild(tag);
                return parentItem ? [new DocParentWrap(item, tag)] : [];
            }));
    }

    getDocParent(parentId: string, parentTag?: string): IDocParent | undefined {
        return this.getDocParents(parentTag).find(docParent => docParent.id === parentId);
    }

    getDocs(parentId: string, parentTag?: string): readonly IDocRef[] {
        return this.getDocParents(parentTag).filter(docParent => docParent.id === parentId)
            .flatMap(docParent => docParent.docs);
    }

    getDoc(name: string, parentId: string, parentTag?: string): IDocRef | undefined {
        return this.getDocs(parentId, parentTag).find(doc => doc.name === name);
    }

    findDocs(name: string, parentTag?: string): IDocRef[] {
        return this.getDocParents(parentTag).flatMap(docParent => docParent.docs)
            .filter(doc => doc.name === name);
    }


    getDocByPath(path: string, parentId: string, parentTag?: string): IDocRef | undefined {
        return this.getDocs(parentId, parentTag).find(doc => doc.path === path);
    }

    ensureParent(parentId: string, parentTag: string): CTreeItem {
        const existing = this.getDocParent(parentId, parentTag);
        if (existing) {
            return existing.item as CTreeItem;
        }
        const sequence = this.ensureTopItem().createChild(`${parentTag}s`, true).setKind(ETreeItemKind.Sequence);
        const item = sequence.createSequenceChildWithValue(parentTag, parentId, (itemValue, value) => itemValue === value);
        return item as CTreeItem;
    }

    ensureDoc(name: string, parentId: string, parentTag: string): IDocRef {
        return this.getDoc(name, parentId, parentTag) ?? new DocParentWrap(this.ensureParent(parentId, parentTag), parentTag).ensureDoc(name);
    }

    removeDoc(name: string, parentId: string, parentTag?: string): boolean {
        const doc = this.getDoc(name, parentId, parentTag);
        if (!doc) {
            return false;
        }
        doc.remove();
        return true;
    }
}

export const DocsYamlFile = constructor<typeof DocsYamlFileImpl, DocsYamlFile>(DocsYamlFileImpl);
