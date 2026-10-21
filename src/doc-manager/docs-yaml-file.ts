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

import * as path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { constructor } from '@open-cmsis-pack/cmsis-common/constructor';
import { CTreeItem, ETreeItemKind, ITreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { CTreeItemYamlFile, ITreeItemFile } from '@open-cmsis-pack/cmsis-common/tree-item-file';
import { CTreeItemWrap, ITreeItemWrap } from '@open-cmsis-pack/cmsis-common/tree-item-wrapper';
import { comparePackIds, splitVendorNameId } from '../data-manager/pack-data';
import { isWebAddress } from '../util';
import { expandRootVars, getCmsisPackRoot } from '../utils/path-utils';

export interface IDocRef extends ITreeItemWrap {
    get name(): string;
    set name(value: string | undefined);
    path: string | undefined;
    get title(): string;
    set title(value: string | undefined);
    category: string | undefined;
    readonly locationType: string;
    readonly indexDir: string | undefined;
    mode: 'user' | undefined;
    error: string | undefined;
    isWebDoc(): boolean;
    isWeb(): boolean;
    isDownloaded(): boolean;
}

export interface IDocParent extends ITreeItemWrap {
    readonly tag: string;
    readonly id: string;
    packId: string | undefined;
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

    ensureParent(parentId: string, parentTag: string, packId?: string): CTreeItem;
    ensureDoc(name: string, parentId: string, parentTag: string): IDocRef;
    removeDoc(name: string, parentId: string, parentTag?: string): boolean;
}

export function getWebLocationType(name: string): 'W' | 'H' | undefined {
    const isFileUrl = name.startsWith('file://');
    if (!isWebAddress(name) && !isFileUrl) {
        return undefined;
    }
    try {
        const url = new URL(name.startsWith('www.') ? `https://${name}` : name);
        if (isFileUrl && (!url.hostname || url.hostname === 'localhost')) {
            return undefined;
        }
        const extension = url.pathname.endsWith('/') ? '' : path.posix.extname(url.pathname).toLowerCase();
        return extension && extension !== '.' && extension !== '.html' && extension !== '.htm' ? 'W' : 'H';
    } catch {
        return 'H';
    }
}

class DocRefWrap extends CTreeItemWrap implements IDocRef {
    constructor(item: ITreeItem<CTreeItem>, private readonly parent?: IDocParent) {
        super(item);
    }

    override get nameKey(): string { return 'name'; }
    get path(): string | undefined { return this.getValue('path'); }
    set path(value: string | undefined) { this.setValue('path', value); }
    get title(): string { return this.getValue('title') || this.name || this.path || ''; }
    set title(value: string | undefined) { this.setValue('title', value); }
    get category(): string | undefined { return this.getValue('category'); }
    set category(value: string | undefined) { this.setValue('category', value); }
    get locationType(): string {
        const name = this.name || this.path || '';
        const webLocationType = getWebLocationType(name);
        if (webLocationType) {
            return webLocationType;
        }
        if (/^\$\{CMSIS_PACK_ROOT\}(?:[/\\]|$)/.test(name)) {
            return 'P';
        }
        const absoluteName = path.resolve(expandRootVars(name.startsWith('file://') ? fileURLToPath(name) : name));
        const relativeToPackRoot = path.relative(getCmsisPackRoot(), absoluteName);
        return relativeToPackRoot !== '..' && !relativeToPackRoot.startsWith(`..${path.sep}`)
            && !path.isAbsolute(relativeToPackRoot) ? 'P' : 'L';
    }
    get indexDir(): string | undefined {
        const locationType = this.locationType;
        if (locationType === 'H') {
            return undefined;
        }
        const { vendor = '', name } = splitVendorNameId(this.parent?.id ?? '');
        const source = this.name || this.path || '';
        const basename = this.getBasename(source, locationType);
        return this.item?.resolvePath(path.join('docs', vendor, name, basename));
    }
    get mode(): 'user' | undefined { return this.getValue('mode') === 'user' ? 'user' : undefined; }
    set mode(value: 'user' | undefined) { this.setValue('mode', value); }
    get error(): string | undefined { return this.getValue('error'); }
    set error(value: string | undefined) { this.setValue('error', value); }
    isWebDoc(): boolean { return getWebLocationType(this.name) === 'W'; }
    isWeb(): boolean { return getWebLocationType(this.name) !== undefined; }
    isDownloaded(): boolean { return this.locationType === 'W' && this.path !== undefined; }

    private getBasename(source: string, locationType: string): string {
        return locationType === 'W'
            ? path.posix.parse(new URL(source.startsWith('www.') ? `https://${source}` : source).pathname).name
            : path.parse(source.startsWith('file://') ? fileURLToPath(source) : source).name;
    }
}

class DocParentWrap extends CTreeItemWrap implements IDocParent {
    constructor(item: ITreeItem<CTreeItem>, public readonly tag: string) {
        super(item);
    }

    override get nameKey(): string { return this.tag; }
    get id(): string { return this.getValue(this.tag) ?? ''; }
    get packId(): string | undefined { return this.getValue('pack'); }
    set packId(value: string | undefined) {
        if (!value) {
            return;
        }
        const currentPackId = this.packId;
        if (currentPackId === value || (currentPackId !== undefined && comparePackIds(currentPackId, value) >= 0)) {
            return;
        }
        for (const doc of this.docs) {
            if (doc.mode !== 'user') {
                doc.remove();
            }
        }
        this.setValue('pack', value);
    }

    get docs(): readonly IDocRef[] {
        return (this.item?.getGrandChildren('docs') ?? []).map(item => new DocRefWrap(item, this));
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
        return new DocRefWrap(item, this);
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

    public override get fileName(): string { return super.fileName; }
    public override set fileName(value: string) {
        super.fileName = value;
        if (this.rootItem) {
            this.rootItem.rootFileName = value;
        }
    }

    public override ensureRootItem(): CTreeItem {
        const root = super.ensureRootItem();
        root.rootFileName = this.fileName;
        return root;
    }

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

    ensureParent(parentId: string, parentTag: string, packId?: string): CTreeItem {
        let parent = this.getDocParent(parentId, parentTag);
        if (!parent) {
            const sequence = this.ensureTopItem().createChild(`${parentTag}s`, true).setKind(ETreeItemKind.Sequence);
            const item = sequence.createSequenceChildWithValue(parentTag, parentId, (itemValue, value) => itemValue === value);
            parent = new DocParentWrap(item, parentTag);
        }
        if (packId) {
            parent.packId = packId;
        }
        return parent.item as CTreeItem;
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
