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
        if (result !== ETextFileResult.Success) {
            throw new Error('Failed to load the Arm document catalog.');
        }
        this.catalog = file.content as ArmCatalog;
    }

    forAllCores(): Map<string, ArmDoc[]> {
        const catalog = this.catalog;
        if (!catalog) {
            return new Map();
        }
        const cores = new Set([...Object.keys(catalog.coreArch), ...catalog.docs.flatMap(doc => doc.cores ?? [])]
            .map(normalizeCore));
        return new Map([...cores].map(core => [core, catalog.docs
            .filter(doc => doc.kind === 'npu' || doc.all
                || doc.cores?.some(name => normalizeCore(name) === core)
                || doc.archs?.includes(catalog.coreArch[core]))
            .sort((left, right) => (catalog.kindOrder[left.kind] ?? 99) - (catalog.kindOrder[right.kind] ?? 99))]));
    }

    forTarget(cores: readonly string[], device = '', npus: readonly string[] = []): ArmDoc[] {
        const catalog = this.catalog;
        if (!catalog) {
            return [];
        }
        const coreNames = new Set(cores.map(normalizeCore).filter(Boolean));
        const architectures = new Set([...coreNames].map(core => catalog.coreArch[core]).filter(Boolean));
        const npuNames = new Set(npus.map(npu => npu.toLowerCase().replace(/ethos[\s-]*u\s*(\d+)/i, 'ethos-u$1')));
        const deviceName = device.split('::').pop()?.split(':')[0] ?? '';
        for (const known of catalog.knownNpus) {
            if (new RegExp(known.pattern, 'i').test(deviceName)) {
                npuNames.add(known.npu.toLowerCase());
            }
        }
        const selected = catalog.docs.filter(doc => {
            if (doc.kind === 'gug') {
                return false;
            }
            if (doc.kind === 'npu') {
                return doc.npus?.some(npu => npuNames.has(npu.toLowerCase()));
            }
            if (coreNames.size === 0) {
                return false;
            }
            return doc.all || doc.cores?.some(core => coreNames.has(normalizeCore(core)))
                || doc.archs?.some(arch => architectures.has(arch));
        });
        return selected.sort((left, right) => (catalog.kindOrder[left.kind] ?? 99) - (catalog.kindOrder[right.kind] ?? 99));
    }

    metadataUrl(name: string): string | undefined {
        const ref = armDocRef(name);
        return ref ? `https://documentation-service.arm.com/documentation/${ref.id}/${ref.version}` : undefined;
    }
}
