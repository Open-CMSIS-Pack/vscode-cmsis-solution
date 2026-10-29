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

import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { constructor } from '@open-cmsis-pack/cmsis-common/constructor';
import { ETextFileResult, TextFileErrorReporter } from '@open-cmsis-pack/cmsis-common/text-file';
import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { Event, EventEmitter } from 'vscode';
import { expandRootVars, pathsEqual } from '../utils/path-utils';
import { fileExists } from '../utils/fs-utils';
import { DocsYamlFile, getDocParentId, getWebLocationType, IDocRef } from './docs-yaml-file';
import { ArmDocs, armDocName, cbuildCore } from './arm-docs';
import { DocDownload } from './doc-download';

export type DocumentConfirmation = (existingPaths: readonly string[]) => Promise<boolean>;

export interface DocManager {
    readonly file: DocsYamlFile;
    readonly onDidChange: Event<void>;
    dispose(): void;
    initialize(docsDirectory: string): Promise<ETextFileResult>;
    addBooks(cbuild: CTreeItem): Promise<void>;
    getBooks(parentId: string, parentTag: string, cbuild?: CTreeItem): readonly IDocRef[];
    getArmBooks(cbuild?: CTreeItem): readonly IDocRef[];
    addUserBook(parentId: string, parentTag: string, name: string, title: string, category?: string, confirmReplace?: DocumentConfirmation): Promise<IDocRef | undefined | null>;
    downloadDocument(parentId: string, parentTag: string, name: string, confirmOverwrite?: DocumentConfirmation): Promise<void>;
    setLocalPath(parentId: string, parentTag: string, name: string, localPath: string, confirmReplace?: DocumentConfirmation): Promise<boolean | null>;
    removeDocument(parentId: string, parentTag: string, name: string): Promise<boolean>;
}

class DocManagerImpl implements DocManager {
    protected static errorReporter: TextFileErrorReporter = () => {};
    public readonly file = new DocsYamlFile();
    private readonly changeEmitter = new EventEmitter<void>();
    public readonly onDidChange = this.changeEmitter.event;
    private pendingUpdate: Promise<unknown> = Promise.resolve();

    private readonly armDocs: ArmDocs;
    private readonly destinationRoot: string;

    constructor(catalogFileName?: string, private readonly downloader = new DocDownload(), destinationRoot = path.join(os.homedir(), '.cmsis', 'docs')) {
        this.armDocs = new ArmDocs(catalogFileName);
        this.destinationRoot = path.resolve(destinationRoot);
    }

    static setErrorReporter(reporter?: TextFileErrorReporter): void {
        DocManagerImpl.errorReporter = reporter ?? (() => {});
    }

    dispose(): void {
        this.changeEmitter.dispose();
    }

    async initialize(docsDirectory: string): Promise<ETextFileResult> {
        if (!this.armDocs.isLoaded) {
            await this.armDocs.load();
        }
        const fileName = path.join(docsDirectory, 'docs.yml');
        if (this.file.fileName !== fileName) {
            this.file.clear();
            this.file.fileName = fileName;
        }
        await this.file.load();
        this.addArmBooks();
        for (const parent of this.file.getDocParents()) {
            for (const doc of parent.docs) {
                if (doc.path === undefined) {
                    continue;
                }
                if (!fileExists(doc.path)) {
                    doc.error = 'File not exists';
                } else if (doc.error === 'File not exists') {
                    doc.error = undefined;
                }
            }
        }
        return this.file.save();
    }

    async addBooks(cbuild: CTreeItem): Promise<void> {
        if (!cbuild.getValue('device') && !cbuild.getValue('board')) {
            return;
        }
        await this.update(async () => {
            this.addCbuildBooks(cbuild, 'device');
            this.addCbuildBooks(cbuild, 'board');
        }, false);
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

    private addArmBooks(): void {
        for (const entry of this.armDocs.all()) {
            const doc = this.file.ensureDoc(armDocName(entry), 'arm-docs', 'common');
            doc.title = entry.title;
            doc.category = entry.kind;
            doc.id = entry.docId;
            doc.version = entry.version;
            doc.format = entry.format;
            doc.metadataUrl = `https://documentation-service.arm.com/documentation/${entry.docId}/${entry.version}`;
            if (!fileExists(doc.path)) {
                const destination = doc.getDestinationPath(this.destinationRoot);
                if (fileExists(destination)) {
                    doc.path = destination;
                }
            }
        }
    }

    getBooks(parentId: string, parentTag: string, cbuild?: CTreeItem): readonly IDocRef[] {
        const hardwareBooks = this.file.getDocs(parentId, parentTag);
        if (parentTag !== 'device') {
            return hardwareBooks;
        }
        return [...hardwareBooks, ...this.getArmBooks(cbuild)];
    }

    getArmBooks(cbuild?: CTreeItem): readonly IDocRef[] {
        const stored = this.file.getDocs('arm-docs', 'common');
        return this.armDocs.getDockIDs(cbuildCore(cbuild)).flatMap(id => {
            const doc = stored.find(candidate => candidate.id === id);
            return doc ? [doc] : [];
        });
    }

    private update<T>(operation: () => Promise<T>, notify = true): Promise<T> {
        const result = this.pendingUpdate.then(async () => {
            await this.file.load();
            const value = await operation();
            if (value === null) {
                return value;
            }
            const saved = await this.file.save();
            if (notify && saved === ETextFileResult.Success) {
                this.changeEmitter.fire();
            }
            return value;
        });
        this.pendingUpdate = result.catch(() => {});
        return result;
    }

    async addUserBook(parentId: string, parentTag: string, name: string, title: string, category?: string, confirmReplace?: DocumentConfirmation): Promise<IDocRef | undefined | null> {
        return this.update(async () => {
            const docParentId = getDocParentId(parentId, parentTag);

            if (!docParentId || !name) {
                return;
            }
            const docPath = name && !getWebLocationType(name)
                ? path.resolve(expandRootVars(name.startsWith('file://') ? fileURLToPath(name) : name))
                : undefined;
            if (docPath && confirmReplace) {
                const localDocs = this.file.getDocs(docParentId, parentTag)
                    .filter(doc => doc.mode === 'user' && !doc.isWeb());
                const existing = localDocs.find(doc => pathsEqual(doc.path ?? doc.name, docPath))
                    ?? localDocs.find(doc => pathsEqual(path.basename(doc.path ?? doc.name), path.basename(docPath)));
                if (existing && !pathsEqual(existing.path ?? existing.name, docPath)) {
                    if (!await confirmReplace([existing.path ?? existing.name])) {
                        return null;
                    }
                    existing.name = docPath;
                    existing.path = docPath;
                    return existing;
                }
                if (existing) {
                    return existing;
                }
            }
            const doc = this.addBook(docParentId, parentTag, name, title, category, docPath, 'user');
            if (doc) {
                doc.mode = 'user';
            }
            return doc;
        });
    }

    async downloadDocument(parentId: string, parentTag: string, name: string, confirmOverwrite?: DocumentConfirmation): Promise<void> {
        let downloadError: string | undefined;
        try {
            await this.file.load();
            const doc = this.file.getDoc(name, parentId, parentTag);
            if (!doc || !doc.isWebDoc()) {
                return;
            }
            const destination = doc.getDestinationPath(this.destinationRoot);
            if (confirmOverwrite && fileExists(destination) && !await confirmOverwrite([destination])) {
                return;
            }
            doc.path = destination;
            const isCommon = doc.parentTag === 'common';
            await this.downloader.downloadDoc(doc.downloadUrl, destination, isCommon, isCommon ? doc.id : undefined);
        } catch (error) {
            const reason = error instanceof Error ? error.message : error ? String(error) : 'Error downloading file';
            downloadError = 'Download failed';
            DocManagerImpl.errorReporter(`Error : download failed ${name} : ${reason}`);
        }
        return this.update(async () => {
            const doc = this.file.getDoc(name, parentId, parentTag);
            if (!doc) {
                return;
            }
            if (downloadError !== undefined) {
                doc.error = downloadError;
            }
        });
    }

    async setLocalPath(parentId: string, parentTag: string, name: string, localPath: string, confirmReplace?: DocumentConfirmation): Promise<boolean | null> {
        return this.update(async () => {
            const doc = this.file.getDoc(name, parentId, parentTag);
            if (!doc || doc.locationType !== 'W' || !localPath || getWebLocationType(localPath)) {
                return false;
            }
            const resolved = path.resolve(expandRootVars(localPath.startsWith('file://') ? fileURLToPath(localPath) : localPath));
            const references = this.file.findDocs(name);
            const existingPaths = references.map(reference => reference.path)
                .filter((existingPath): existingPath is string => fileExists(existingPath) && !pathsEqual(existingPath, resolved))
                .filter((existingPath, index, paths) => paths.findIndex(candidate => pathsEqual(candidate, existingPath)) === index);
            if (confirmReplace && existingPaths.length > 0 && !await confirmReplace(existingPaths)) {
                return null;
            }
            for (const reference of references) {
                reference.path = resolved;
            }
            return true;
        });
    }

    async removeDocument(parentId: string, parentTag: string, name: string): Promise<boolean> {
        return this.update(async () => {
            const doc = this.file.getDoc(name, parentId, parentTag);
            if (doc?.mode !== 'user') {
                return false;
            }
            doc.remove();
            return true;
        });
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

export const DocManager = constructor<typeof DocManagerImpl, DocManager>(DocManagerImpl) as
    ReturnType<typeof constructor<typeof DocManagerImpl, DocManager>> & Pick<typeof DocManagerImpl, 'setErrorReporter'>;
