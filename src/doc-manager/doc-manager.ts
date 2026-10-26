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
import { fileURLToPath } from 'node:url';
import { constructor } from '@open-cmsis-pack/cmsis-common/constructor';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { CTreeItem, ETreeItemKind } from '@open-cmsis-pack/cmsis-common/tree-item';
import { Event, EventEmitter } from 'vscode';
import { expandRootVars } from '../utils/path-utils';
import { DocsYamlFile, getDocParentId, getWebLocationType, IDocRef } from './docs-yaml-file';
import { ArmDocs, armDocName, armDocRef, cbuildCore } from './arm-docs';

export interface DocManager {
    readonly file: DocsYamlFile;
    readonly onDidChange: Event<void>;
    dispose(): void;
    initialize(docsDirectory: string): Promise<ETextFileResult>;
    addBooks(cbuild: CTreeItem): Promise<void>;
    getBooks(parentId: string, parentTag: string, cbuild?: CTreeItem): readonly IDocRef[];
    addUserBook(parentId: string, parentTag: string, name: string, title: string, category?: string): Promise<IDocRef | undefined>;
    setLocalPath(parentId: string, parentTag: string, name: string, localPath: string): Promise<boolean>;
    removeDocument(parentId: string, parentTag: string, name: string): Promise<boolean>;
}

class DocManagerImpl implements DocManager {
    public readonly file = new DocsYamlFile();
    private readonly changeEmitter = new EventEmitter<void>();
    public readonly onDidChange = this.changeEmitter.event;
    private pendingUpdate: Promise<unknown> = Promise.resolve();

    private armDocs?: ArmDocs;

    constructor(catalogFileName?: string) {
        this.armDocs = new ArmDocs(catalogFileName);
    }

    dispose(): void {
        this.changeEmitter.dispose();
    }

    async initialize(docsDirectory: string): Promise<ETextFileResult> {
        if (this.armDocs && !this.armDocs.isLoaded) {
            await this.armDocs.load().catch(() => {
                this.armDocs = undefined;
            });
        }
        const fileName = path.join(docsDirectory, 'docs.yml');
        if (this.file.fileName !== fileName) {
            this.file.clear();
            this.file.fileName = fileName;
        }
        this.file.parser?.clearErrors();
        const result = await this.file.load();
        if (this.file.parser?.hasErrors()) {
            this.file.addError(`${this.file.fileName}: Failed to parse:`);
            for (const error of this.file.parser.errors) {
                this.file.addError(error);
            }
            this.file.rootItem = undefined;
            return ETextFileResult.Error;
        }
        if (result === ETextFileResult.Error) {
            return result;
        }
        if (result === ETextFileResult.NotExists) {
            this.file.ensureTopItem().setKind(ETreeItemKind.Map);
        }
        const booksAdded = this.addArmBooks();
        return result === ETextFileResult.NotExists || booksAdded ? this.file.save() : result;
    }

    async addBooks(cbuild: CTreeItem): Promise<void> {
        if (!cbuild.getValue('device') && !cbuild.getValue('board')) {
            return;
        }
        await this.update(async () => {
            await this.reload();
            this.addCbuildBooks(cbuild, 'device');
            this.addCbuildBooks(cbuild, 'board');
            await this.file.save();
        });
    }

    private addCbuildBooks(cbuild: CTreeItem, parentTag: string): void {
        const parentId = getDocParentId(cbuild.getValue(parentTag), parentTag);
        if (!parentId) {
            return;
        }
        this.file.ensureParent(parentId, parentTag, cbuild.getValue(`${parentTag}-pack`));
        for (const book of cbuild.getGrandChildren(`${parentTag}-books`)) {
            const name = book.getValue('name');
            const docPath = name && !getWebLocationType(name)
                ? book.resolvePath(expandRootVars(name.startsWith('file://') ? fileURLToPath(name) : name))
                : undefined;
            this.addBook(parentId, parentTag, name, book.getValue('title'), book.getValue('category'), docPath);
        }
    }

    private addArmBooks(): boolean {
        if (!this.armDocs) {
            return false;
        }
        let changed = false;
        for (const [core, entries] of this.armDocs.forAllCores()) {
            for (const entry of entries) {
                const name = armDocName(entry);
                const existing = this.file.getDoc(name, core, 'core');
                const doc = existing ?? this.file.ensureDoc(name, core, 'core');
                changed ||= !existing || doc.id === undefined || doc.version === undefined
                    || (doc.format === undefined && entry.format !== undefined);
                if (!existing) {
                    doc.title = entry.title;
                    doc.category = entry.kind;
                }
                doc.id ??= entry.docId;
                doc.version ??= entry.version;
                doc.format ??= entry.format;
            }
        }
        return changed;
    }

    getBooks(parentId: string, parentTag: string, cbuild?: CTreeItem): readonly IDocRef[] {
        const hardwareBooks = this.file.getDocs(parentId, parentTag);
        if (parentTag !== 'device') {
            return hardwareBooks;
        }
        const core = cbuildCore(cbuild);
        const stored = this.file.getDocs(core, 'core');
        const selected = this.armDocs?.forTarget([core], cbuild?.getValue('device'))
            .map(entry => stored.find(doc => doc.name === armDocName(entry)))
            .filter((doc): doc is IDocRef => doc !== undefined) ?? [];
        return [...hardwareBooks, ...selected, ...stored.filter(doc => !armDocRef(doc.name))];
    }

    private update<T>(operation: () => Promise<T>): Promise<T> {
        const result = this.pendingUpdate.then(operation);
        this.pendingUpdate = result.catch(() => {});
        return result;
    }

    private async reload(): Promise<void> {
        const result = await this.file.load();
        if (result === ETextFileResult.Error || this.file.parser?.hasErrors()) {
            throw new Error('Failed to load the document inventory.');
        }
    }

    async addUserBook(parentId: string, parentTag: string, name: string, title: string, category?: string): Promise<IDocRef | undefined> {
        return this.update(async () => {
            const docParentId = getDocParentId(parentId, parentTag);

            if (!docParentId || !name) {
                return;
            }
            const docPath = name && !getWebLocationType(name)
                ? path.resolve(expandRootVars(name.startsWith('file://') ? fileURLToPath(name) : name))
                : undefined;
            await this.file.load(); // refresh inventory, could have been changed externally
            const doc = this.addBook(docParentId, parentTag, name, title, category, docPath, 'user');
            if (doc) {
                doc.mode = 'user';
            }
            const result = await this.save();
            return result === ETextFileResult.Error ? undefined : doc;
        });
    }

    async setLocalPath(parentId: string, parentTag: string, name: string, localPath: string): Promise<boolean> {
        return this.update(async () => {
            await this.file.load(); // refresh inventory, could have been changed externally
            const doc = this.file.getDoc(name, parentId, parentTag);
            if (!doc || doc.locationType !== 'W' || !localPath || getWebLocationType(localPath)) {
                return false;
            }
            const resolved = path.resolve(expandRootVars(localPath.startsWith('file://') ? fileURLToPath(localPath) : localPath));
            for (const reference of this.file.findDocs(name)) {
                reference.path = resolved;
                reference.error = undefined;
            }
            return await this.save() !== ETextFileResult.Error;
        });
    }

    async removeDocument(parentId: string, parentTag: string, name: string): Promise<boolean> {
        return this.update(async () => {
            await this.file.load();
            const doc = this.file.getDoc(name, parentId, parentTag);
            if (doc?.mode !== 'user') {
                return false;
            }
            doc.remove();
            return await this.save() !== ETextFileResult.Error;
        });
    }

    private async save(): Promise<ETextFileResult> {
        const result = await this.file.save();
        if (result === ETextFileResult.Success) {
            this.changeEmitter.fire();
        }
        return result;
    }

    private addBook(
        parentId: string | undefined,
        parentTag: string,
        name: string | undefined,
        title: string | undefined,
        category?: string,
        docPath?: string,
        mode?: 'user',
    ): IDocRef | undefined {
        if (!parentId || !name) {
            return undefined;
        }
        let existing = this.file.getDoc(name, parentId, parentTag);
        if (existing) {
            return existing;
        }
        if (docPath !== undefined) {
            name = docPath;
        }
        existing = this.file.getDoc(name, parentId, parentTag);
        if (existing) {
            return existing;
        }
        const doc = this.file.ensureDoc(name, parentId, parentTag);
        doc.title = title;
        doc.category = category;
        doc.path = docPath;
        doc.mode = mode;
        return doc;
    }
}

export const DocManager = constructor<typeof DocManagerImpl, DocManager>(DocManagerImpl);
