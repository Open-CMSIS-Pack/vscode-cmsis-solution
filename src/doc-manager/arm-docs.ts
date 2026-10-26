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
import { JsonFile } from '@open-cmsis-pack/cmsis-common/json-file';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';

export interface ArmDoc {
    docId: string;
    version: string;
    title: string;
    kind: string;
    format?: string;
    cores?: string[];
    archs?: string[];
    npus?: string[];
    all?: boolean;
}

interface ArmCatalog {
    docs: ArmDoc[];
    kindOrder: Record<string, number>;
    coreArch: Record<string, string>;
    knownNpus: { pattern: string; npu: string }[];
}

export function normalizeCore(core: string): string {
    return core.trim().toLowerCase().replace(/^cortex-m0(?:plus|p)$/, 'cortex-m0+');
}

export function armDocName(doc: ArmDoc): string {
    return `https://developer.arm.com/documentation/${doc.docId}/${doc.version}`;
}

export function armDocRef(name: string): { id: string; version: string } | undefined {
    const match = /^https:\/\/developer\.arm\.com\/documentation\/([a-z]{3}\d{4}|\d{6,7})\/([a-z0-9._-]+)\/?$/i.exec(name);
    return match ? { id: match[1].toLowerCase(), version: match[2] } : undefined;
}

export function cbuildCore(cbuild?: CTreeItem): string {
    return normalizeCore(cbuild?.getChild('processor')?.getValue('core') ?? '');
}

export class ArmDocs {
    private catalog?: ArmCatalog;
    private loading?: Promise<void>;

    constructor(private readonly catalogFileName = path.join(__dirname, 'arm-docs.json')) { }

    get isLoaded(): boolean {
        return this.catalog !== undefined;
    }

    async load(): Promise<void> {
        this.loading ??= this.loadCatalog();
        await this.loading;
    }

    private async loadCatalog(): Promise<void> {
        const file = new JsonFile(this.catalogFileName);
        const result = await file.load();
        if (result === ETextFileResult.Success) {
            this.catalog = file.content as ArmCatalog;
        }
    }

    all(): readonly ArmDoc[] {
        return this.catalog?.docs ?? [];
    }

    getDockIDs(core: string): string[] {
        const catalog = this.catalog;
        if (!catalog) {
            return [];
        }
        const coreName = normalizeCore(core);
        const architecture = catalog.coreArch[coreName];
        return [...new Set(catalog.docs
            .filter(doc => doc.cores?.some(name => normalizeCore(name) === coreName)
                || doc.archs?.some(arch => arch === architecture))
            .map(doc => doc.docId))];
    }

    metadataUrl(name: string): string | undefined {
        const ref = armDocRef(name);
        return ref ? `https://documentation-service.arm.com/documentation/${ref.id}/${ref.version}` : undefined;
    }
}
