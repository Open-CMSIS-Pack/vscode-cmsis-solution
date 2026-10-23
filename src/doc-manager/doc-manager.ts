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
import { link, mkdir, open, rm, stat } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { JsonFile } from '@open-cmsis-pack/cmsis-common/json-file';
import { fileURLToPath } from 'node:url';
import { constructor } from '@open-cmsis-pack/cmsis-common/constructor';
import { ETextFileResult, TextFileErrorReporter } from '@open-cmsis-pack/cmsis-common/text-file';
import { CTreeItem, ETreeItemKind } from '@open-cmsis-pack/cmsis-common/tree-item';
import { Event, EventEmitter } from 'vscode';
import { downloadFile } from '../file-download';
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
    resolveDocument(parentId: string, parentTag: string, name: string): Promise<string | undefined>;
    addUserBook(parentId: string, parentTag: string, name: string, title: string, category?: string): Promise<IDocRef | undefined>;
    setLocalPath(parentId: string, parentTag: string, name: string, localPath: string): Promise<boolean>;
    removeDocument(parentId: string, parentTag: string, name: string): Promise<boolean>;
}

class DocManagerImpl implements DocManager {
    private static errorReporter: TextFileErrorReporter = () => {};
    public readonly file = new DocsYamlFile();
    private readonly changeEmitter = new EventEmitter<void>();
    public readonly onDidChange = this.changeEmitter.event;
    private readonly downloads = new Map<string, Promise<string | undefined>>();
    private pendingUpdate: Promise<unknown> = Promise.resolve();

    private readonly armDocs: ArmDocs;

    constructor(catalogFileName?: string) {
        this.armDocs = new ArmDocs(catalogFileName);
    }

    static setErrorReporter(reporter?: TextFileErrorReporter): void {
        DocManagerImpl.errorReporter = reporter ?? (() => {});
    }

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

    async addBooks(cbuild: CTreeItem): Promise<void> {
        const core = cbuildCore(cbuild);
        if (!core && !cbuild.getValue('device') && !cbuild.getValue('board')) {
            return;
        }
        if (core) {
            await this.armDocs.load();
        }
        await this.update(async () => {
            await this.reload();
            this.addCbuildBooks(cbuild, 'device');
            this.addCbuildBooks(cbuild, 'board');
            this.addArmBooks(cbuild);
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

    private addArmBooks(cbuild: CTreeItem): void {
        const core = cbuildCore(cbuild);
        if (!core) {
            return;
        }
        for (const entry of this.armDocs.forTarget([core], cbuild.getValue('device'))) {
            const name = armDocName(entry);
            const existing = this.file.getDoc(name, core, 'core');
            const sharedPath = this.file.findDocs(name).find(doc => doc.path)?.path;
            const doc = existing ?? this.file.ensureDoc(name, core, 'core');
            if (!existing) {
                doc.title = entry.title;
                doc.category = entry.kind;
                doc.id = entry.docId;
                doc.version = entry.version;
            }
            doc.format ??= entry.format;
            if (!doc.path && sharedPath) {
                doc.path = sharedPath;
            }
        }
    }

    getBooks(parentId: string, parentTag: string, cbuild?: CTreeItem): readonly IDocRef[] {
        const hardwareBooks = this.file.getDocs(parentId, parentTag);
        if (parentTag !== 'device') {
            return hardwareBooks;
        }
        const core = cbuildCore(cbuild);
        const stored = this.file.getDocs(core, 'core');
        const selected = this.armDocs.forTarget([core], cbuild?.getValue('device'))
            .map(entry => stored.find(doc => doc.name === armDocName(entry)))
            .filter((doc): doc is IDocRef => doc !== undefined);
        return [...hardwareBooks, ...selected, ...stored.filter(doc => !armDocRef(doc.name))];
    }

    resolveDocument(parentId: string, parentTag: string, name: string): Promise<string | undefined> {
        const doc = this.file.getDoc(name, parentId, parentTag);
        if (!doc || doc.locationType !== 'W') {
            return Promise.resolve(doc?.path ?? doc?.name);
        }
        const existing = this.downloads.get(name);
        if (existing) {
            return existing;
        }
        const pending = this.downloadDocument(doc).finally(() => this.downloads.delete(name));
        this.downloads.set(name, pending);
        return pending;
    }

    private async downloadDocument(reference: IDocRef): Promise<string | undefined> {
        const name = reference.name;
        try {
            const pdf = reference.format?.toLowerCase() === 'pdf' || /\.pdf$/i.test(new URL(name.startsWith('www.') ? `https://${name}` : name).pathname);
            const candidates = await this.update(async () => {
                await this.reload();
                const docs = this.file.findDocs(name);
                return docs.map(doc => doc.path);
            });
            let localPath: string | undefined;
            for (const candidate of candidates) {
                if (await isCachedFile(candidate, pdf)) {
                    localPath = candidate;
                    break;
                }
            }
            localPath ??= await this.download(reference, pdf);
            await this.update(async () => {
                await this.reload();
                for (const doc of this.file.findDocs(name)) {
                    doc.path = localPath;
                    doc.error = undefined;
                }
                if (await this.save() === ETextFileResult.Error) {
                    throw new Error('Failed to save the downloaded document path.');
                }
            });
            return localPath;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            await this.update(async () => {
                for (const doc of this.file.findDocs(name)) {
                    doc.path = undefined;
                    doc.error = message;
                }
                await this.save();
            }).catch(() => undefined);
            try {
                DocManagerImpl.errorReporter(message);
            } catch {
                return undefined;
            }
            return undefined;
        }
    }

    private update<T>(operation: () => Promise<T>): Promise<T> {
        const result = this.pendingUpdate.then(operation);
        this.pendingUpdate = result.catch(() => {});
        return result;
    }

    private async download(doc: IDocRef, pdf: boolean): Promise<string> {
        const name = doc.name;
        const ref = armDocRef(name);
        const metadataUrl = this.armDocs.metadataUrl(name);
        let resource = { url: name.startsWith('www.') ? `https://${name}` : name, name: path.posix.basename(new URL(name.startsWith('www.') ? `https://${name}` : name).pathname) };
        if (metadataUrl) {
            const metadata = new JsonFile(path.join(this.file.fileDir, `${randomUUID()}.json`));
            try {
                await mkdir(this.file.fileDir, { recursive: true });
                await downloadFile(metadataUrl, metadata.fileName);
                if ((await stat(metadata.fileName)).size > 2 * 1024 * 1024) {
                    throw new Error('Arm document metadata is too large.');
                }
                const result = await metadata.load();
                if (result === ETextFileResult.Error || metadata.parser?.hasErrors()) {
                    throw new Error('Invalid Arm document metadata.');
                }
                resource = this.armDocs.resource(name, metadata.content);
            } finally {
                await rm(metadata.fileName, { force: true });
            }
        }
        if (new URL(resource.url).protocol !== 'https:') {
            throw new Error('Document download requires HTTPS.');
        }
        const identity = ref?.id ?? createHash('sha256').update(name).digest('hex').slice(0, 12);
        const safeName = resource.name.replace(/[^a-z0-9._-]/gi, '_').replace(/[. ]+$/, '');
        const baseName = (/^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(safeName) ? `${identity}_${safeName}` : safeName)
            .replace(/\.pdf$/i, pdf ? '' : '.pdf').slice(0, 160) || identity;
        const extension = pdf ? '.pdf' : '';
        const directory = path.join(this.file.fileDir, 'docs', ref ? 'arm' : 'web', identity);
        await mkdir(directory, { recursive: true });
        let target = path.join(directory, `${baseName}${extension}`);
        const temporary = `${target}.${randomUUID()}.part`;
        try {
            await downloadFile(resource.url, temporary);
            if ((await stat(temporary)).size > 100 * 1024 * 1024) {
                throw new Error('Document is too large.');
            }
            if (pdf && !await isCachedFile(temporary, true)) {
                throw new Error('Invalid PDF response.');
            }
            try {
                await link(temporary, target);
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
                    throw error;
                }
                target = path.join(directory, `${baseName}-${createHash('sha256').update(name).digest('hex').slice(0, 12)}${extension}`);
                try {
                    await link(temporary, target);
                } catch (collision) {
                    if ((collision as NodeJS.ErrnoException).code !== 'EEXIST' || !await isCachedFile(target, pdf)) {
                        throw collision;
                    }
                }
            }
            return target;
        } finally {
            await rm(temporary, { force: true });
        }
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

export const DocManager = constructor<typeof DocManagerImpl, DocManager>(DocManagerImpl) as
    ReturnType<typeof constructor<typeof DocManagerImpl, DocManager>> & Pick<typeof DocManagerImpl, 'setErrorReporter'>;

async function isCachedFile(fileName: string | undefined, pdf: boolean): Promise<boolean> {
    if (!fileName) {
        return false;
    }
    try {
        if (!pdf) {
            return (await stat(fileName)).isFile();
        }
        const file = await open(fileName, 'r');
        try {
            const signature = Buffer.alloc(5);
            await file.read(signature, 0, 5, 0);
            return signature.toString('ascii') === '%PDF-';
        } finally {
            await file.close();
        }
    } catch {
        return false;
    }
}
