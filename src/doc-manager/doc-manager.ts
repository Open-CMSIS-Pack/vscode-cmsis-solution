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

import { lstatSync, mkdirSync, rmSync, statSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { constructor } from '@open-cmsis-pack/cmsis-common/constructor';
import { ETextFileResult, TextFileErrorReporter } from '@open-cmsis-pack/cmsis-common/text-file';
import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { Event, EventEmitter } from 'vscode';
import { expandRootVars, pathIsAncestor, pathsEqual } from '../utils/path-utils';
import { copyFile, fileExists } from '../utils/fs-utils';
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
    addUserBook(parentId: string, parentTag: string, name: string, title: string, category?: string, confirmOverwrite?: DocumentConfirmation): Promise<IDocRef | undefined | null>;
    downloadDocument(parentId: string, parentTag: string, name: string, confirmOverwrite?: DocumentConfirmation): Promise<void>;
    importDocument(parentId: string, parentTag: string, name: string, localPath: string, confirmOverwrite?: DocumentConfirmation): Promise<boolean | null>;
    removeDocument(parentId: string, parentTag: string, name: string): Promise<boolean>;
}

class DocManagerImpl implements DocManager {
    protected static errorReporter: TextFileErrorReporter = () => {};
    public readonly file = new DocsYamlFile();
    private readonly changeEmitter = new EventEmitter<void>();
    public readonly onDidChange = this.changeEmitter.event;
    private pendingUpdate: Promise<unknown> = Promise.resolve();

    private readonly armDocs: ArmDocs;

    constructor(catalogFileName?: string, private readonly downloader = new DocDownload()) {
        this.armDocs = new ArmDocs(catalogFileName);
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
                const destination = doc.getDestinationPath();
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

    private update<T>(operation: () => Promise<T>, notify = true): Promise<T | undefined> {
        const result = this.pendingUpdate.then(async () => {
            if (await this.file.load() === ETextFileResult.Error) {
                return undefined;
            }
            const value = await operation();
            if (value === null || value === false) {
                return value;
            }
            const saved = await this.file.save();
            if (saved === ETextFileResult.Error) {
                return undefined;
            }
            if (notify && saved === ETextFileResult.Success) {
                this.changeEmitter.fire();
            }
            return value;
        });
        this.pendingUpdate = result.catch(() => {});
        return result;
    }

    async addUserBook(parentId: string, parentTag: string, name: string, title: string, category?: string, confirmOverwrite?: DocumentConfirmation): Promise<IDocRef | undefined | null> {
        return this.update(async () => {
            const docParentId = getDocParentId(parentId, parentTag);

            if (!docParentId || !name) {
                return;
            }
            if (getWebLocationType(name)) {
                const doc = this.addBook(docParentId, parentTag, name, title, category, undefined, 'user');
                if (doc) {
                    doc.mode = 'user';
                }
                return doc;
            }
            let source: string;
            try {
                source = path.resolve(expandRootVars(name.startsWith('file://') ? fileURLToPath(name) : name));
            } catch (error) {
                DocManagerImpl.errorReporter(`Import failed: ${name}: ${String(error)}`);
                return undefined;
            }
            const existing = this.file.getDocs(docParentId, parentTag).find(doc => doc.mode === 'user' && !doc.isWeb()
                && pathsEqual(path.basename(doc.name), path.basename(source)));
            // Calculate a new record's destination without changing the live inventory before copying succeeds.
            const candidate = existing ?? new DocsYamlFile(this.file.fileName).ensureDoc(source, docParentId, parentTag);
            candidate.mode = 'user';
            const destination = await this.copyDocument(candidate, source, confirmOverwrite);
            if (destination === null || destination === undefined) {
                return destination;
            }
            const doc = existing ?? this.addBook(docParentId, parentTag, source, title, category, undefined, 'user')!;
            doc.mode = 'user';
            doc.path = destination;
            return doc;
        });
    }

    async downloadDocument(parentId: string, parentTag: string, name: string, confirmOverwrite?: DocumentConfirmation): Promise<void> {
        let downloadError: string | undefined;
        try {
            await this.file.load();
            const doc = this.file.getDoc(name, parentId, parentTag);
            if (!doc || doc.mode === 'user' || doc.locationType !== 'W') {
                return;
            }
            const destination = doc.getDestinationPath();
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
        await this.update(async () => {
            const doc = this.file.getDoc(name, parentId, parentTag);
            if (!doc) {
                return;
            }
            if (downloadError !== undefined) {
                doc.error = downloadError;
            }
        });
    }

    async importDocument(parentId: string, parentTag: string, name: string, localPath: string, confirmOverwrite?: DocumentConfirmation): Promise<boolean | null> {
        if (!localPath) {
            return false;
        }

        const result = await this.update(async () => {
            const doc = this.file.getDoc(name, parentId, parentTag);
            if (!doc || doc.mode === 'user' || doc.locationType == 'P') {
                return false;
            }
            const destination = await this.copyDocument(doc, localPath, confirmOverwrite);
            if (destination === null || destination === undefined) {
                return destination;
            }
            doc.path = destination;
            return true;
        });
        return result === undefined ? false : result;
    }

    private async copyDocument(doc: IDocRef, localPath: string, confirmOverwrite?: DocumentConfirmation): Promise<string | undefined | null> {
        try {
            const source = path.resolve(expandRootVars(localPath.startsWith('file://') ? fileURLToPath(localPath) : localPath));
            if (!statSync(source).isFile()) {
                throw new Error('The selected document must be a file.');
            }
            const destination = doc.getDestinationPath(source);
            this.validateManagedPath(destination);
            if (pathsEqual(source, destination)) {
                return destination;
            }
            if (fileExists(destination)) {
                if (!statSync(destination).isFile()) {
                    throw new Error('The document destination must be a file.');
                }
                if (!confirmOverwrite || !await confirmOverwrite([destination])) {
                    return null;
                }
            }
            mkdirSync(path.dirname(destination), { recursive: true });
            copyFile(source, destination);
            return destination;
        } catch (error) {
            DocManagerImpl.errorReporter(`Import failed: ${localPath}: ${String(error)}`);
            return undefined;
        }
    }

    private get managedRoot(): string {
        return path.resolve(path.dirname(this.file.fileName), 'docs');
    }

    private validateManagedPath(destination: string): void {
        const root = this.managedRoot;
        if (!pathIsAncestor(root, destination)) {
            throw new Error('The document destination must be inside the managed root.');
        }
        // Reject junctions and symbolic links that could redirect copying or recursive deletion outside the root.
        for (let directory = path.dirname(destination); pathsEqual(root, directory) || pathIsAncestor(root, directory); directory = path.dirname(directory)) {
            if (fileExists(directory) && lstatSync(directory).isSymbolicLink()) {
                throw new Error('Managed document directories must not be symbolic links.');
            }
        }
    }

    async removeDocument(parentId: string, parentTag: string, name: string): Promise<boolean> {
        return await this.update(async () => {
            const doc = this.file.getDoc(name, parentId, parentTag);
            if (doc?.mode !== 'user') {
                return false;
            }
            try {
                if (doc.path && pathIsAncestor(this.managedRoot, doc.path)) {
                    const destination = doc.getDestinationPath();
                    if (pathsEqual(doc.path, destination)) {
                        this.validateManagedPath(destination);
                        rmSync(path.dirname(destination), { recursive: true, force: true });
                    }
                }
            } catch (error) {
                DocManagerImpl.errorReporter(`Remove document failed: ${name}: ${String(error)}`);
                return false;
            }
            doc.remove();
            return true;
        }) ?? false;
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
