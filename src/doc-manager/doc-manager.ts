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
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { CTreeItem, ETreeItemKind, ITreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { isWebAddress } from '../util';
import { expandRootVars } from '../utils/path-utils';
import { DocsYamlFile } from './docs-yaml-file';

export interface DocManager {
    readonly file: DocsYamlFile;
    initialize(): Promise<ETextFileResult>;
    addBooks(cbuild: CTreeItem, parentTag: string): void;
    addBooksFromCbuild(cbuild: CTreeItem): void;
    addBook(book: ITreeItem<CTreeItem>, parentId: string | undefined, parentTag: string): void;
}

class DocManagerImpl implements DocManager {
    public readonly file: DocsYamlFile;

    constructor(docsDirectory: string) {
        this.file = new DocsYamlFile(path.join(docsDirectory, 'docs.yml'));
    }

    async initialize(): Promise<ETextFileResult> {
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
            return result;
        }
        this.file.ensureTopItem().setKind(ETreeItemKind.Map);
        return this.file.save();
    }

    addBooks(cbuild: CTreeItem, parentTag: string): void {
        const parentId = cbuild.getValue(parentTag);
        for (const book of cbuild.getGrandChildren(`${parentTag}-books`)) {
            this.addBook(book, parentId, parentTag);
        }
    }

    addBooksFromCbuild(cbuild: CTreeItem): void {
        this.addBooks(cbuild, 'board');
        this.addBooks(cbuild, 'device');
    }

    addBook(book: ITreeItem<CTreeItem>, parentId: string | undefined, parentTag: string): void {
        let name = book.getValue('name');
        if (!parentId || !name || this.file.getDoc(name, parentId, parentTag)) {
            return;
        }
        let docPath: string | undefined;
        if (!isWebAddress(name)) {
            const fileUrl = name.startsWith('file://') ? new URL(name) : undefined;
            if (!fileUrl || !fileUrl.hostname || fileUrl.hostname === 'localhost') {
                name = book.resolvePath(expandRootVars(fileUrl ? fileURLToPath(fileUrl) : name));
                docPath = name;
            }
        }
        if (this.file.getDoc(name, parentId, parentTag)) {
            return;
        }
        const doc = this.file.ensureDoc(name, parentId, parentTag);
        doc.title = book.getValue('title');
        doc.category = book.getValue('category');
        doc.path = docPath;
    }
}

export const DocManager = constructor<typeof DocManagerImpl, DocManager>(DocManagerImpl);
