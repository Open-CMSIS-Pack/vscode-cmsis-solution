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

export interface DocManager {
    readonly file: DocsYamlFile;
    readonly onDidChange: Event<void>;
    dispose(): void;
    initialize(docsDirectory: string): Promise<ETextFileResult>;
    addCbuildBooks(cbuild: CTreeItem, parentTag: string): Promise<void>;
    addUserBook(parentId: string, parentTag: string, name: string, title: string, category?: string): Promise<IDocRef | undefined>;
    setLocalPath(parentId: string, parentTag: string, name: string, localPath: string): Promise<boolean>;
    removeDocument(parentId: string, parentTag: string, name: string): Promise<boolean>;
}

class DocManagerImpl implements DocManager {
    public readonly file = new DocsYamlFile();
    private readonly changeEmitter = new EventEmitter<void>();
    public readonly onDidChange = this.changeEmitter.event;

    dispose(): void {
        this.changeEmitter.dispose();
    }

    async initialize(docsDirectory: string): Promise<ETextFileResult> {
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
        if (result !== ETextFileResult.NotExists) {
            if (result === ETextFileResult.Success) {
                this.changeEmitter.fire();
            }
            return result;
        }
        this.file.ensureTopItem().setKind(ETreeItemKind.Map);
        return this.save();
    }

    async addCbuildBooks(cbuild: CTreeItem, parentTag: string): Promise<void> {
        const docParentId = getDocParentId(cbuild.getValue(parentTag), parentTag);
        if (!docParentId) {
            return;
        }
        await this.file.load(); // refresh inventory, could have been changed externally
        this.file.ensureParent(docParentId, parentTag, cbuild.getValue(`${parentTag}-pack`));
        for (const book of cbuild.getGrandChildren(`${parentTag}-books`)) {
            const name = book.getValue('name');
            const locationType = getWebLocationType(name ?? '');
            const docPath = name && !locationType
                ? book.resolvePath(expandRootVars(name.startsWith('file://') ? fileURLToPath(name) : name))
                : undefined;
            this.addBook(docParentId, parentTag, name, book.getValue('title'), book.getValue('category'), docPath);
        }
        await this.file.save(); // do not emit, refresh will done on solution state change
    }

    async addUserBook(parentId: string, parentTag: string, name: string, title: string, category?: string): Promise<IDocRef | undefined> {
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
    }

    async setLocalPath(parentId: string, parentTag: string, name: string, localPath: string): Promise<boolean> {
        await this.file.load(); // refresh inventory, could have been changed externally
        const doc = this.file.getDoc(name, parentId, parentTag);
        if (!doc || doc.locationType !== 'W' || !localPath || getWebLocationType(localPath)) {
            return false;
        }
        doc.path = path.resolve(expandRootVars(localPath.startsWith('file://') ? fileURLToPath(localPath) : localPath));
        return await this.save() !== ETextFileResult.Error;
    }

    async removeDocument(parentId: string, parentTag: string, name: string): Promise<boolean> {
        await this.file.load();
        const doc = this.file.getDoc(name, parentId, parentTag);
        if (doc?.mode !== 'user') {
            return false;
        }
        doc.remove();
        return await this.save() !== ETextFileResult.Error;
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
