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
import { expandRootVars, getCmsisPackRoot } from '../utils/path-utils';
import { DocsYamlFile, getWebLocationType } from './docs-yaml-file';

export interface DocManager {
    readonly file: DocsYamlFile;
    initialize(): Promise<ETextFileResult>;
    addCbuildBooks(cbuild: CTreeItem, parentTag: string): void;
    addUserBook(parentId: string, parentTag: string, name: string, title: string, category?: string): void;
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

    addCbuildBooks(cbuild: CTreeItem, parentTag: string): void {
        const parentId = cbuild.getValue(parentTag);
        for (const book of cbuild.getGrandChildren(`${parentTag}-books`)) {
            const name = book.getValue('name');
            const locationType = getWebLocationType(name ?? '');
            const docPath = name && !locationType
                ? book.resolvePath(expandRootVars(name.startsWith('file://') ? fileURLToPath(name) : name))
                : undefined;
            this.addBook(parentId, parentTag, name, book.getValue('title'), book.getValue('category'), docPath);
        }
    }

    addUserBook(parentId: string, parentTag: string, name: string, title: string, category?: string): void {
        const docPath = name && !getWebLocationType(name)
            ? path.resolve(expandRootVars(name.startsWith('file://') ? fileURLToPath(name) : name))
            : undefined;
        this.addBook(parentId, parentTag, name, title, category, docPath, undefined, true);
    }

    private addBook(
        parentId: string | undefined,
        parentTag: string,
        name: string | undefined,
        title: string | undefined,
        category?: string,
        docPath?: string,
        locationType?: string,
        userAdded = false,
    ): void {
        if (!parentId || !name || this.file.getDoc(name, parentId, parentTag)) {
            return;
        }
        locationType ??= getWebLocationType(name) ?? 'L';
        if (docPath !== undefined) {
            const packRootPrefix = /^\$\{CMSIS_PACK_ROOT\}(?:[/\\]|$)/.test(name);
            name = docPath;
            const relativeToPackRoot = path.relative(getCmsisPackRoot(), name);
            if (packRootPrefix || (relativeToPackRoot !== '..'
                && !relativeToPackRoot.startsWith(`..${path.sep}`) && !path.isAbsolute(relativeToPackRoot))) {
                locationType = 'P';
            }
        }
        if (this.file.getDoc(name, parentId, parentTag)) {
            return;
        }
        const doc = this.file.ensureDoc(name, parentId, parentTag);
        doc.title = title;
        doc.category = category;
        doc.path = docPath;
        doc.locationType = locationType;
        if (userAdded) {
            doc.userAdded = true;
        }
    }
}

export const DocManager = constructor<typeof DocManagerImpl, DocManager>(DocManagerImpl);
