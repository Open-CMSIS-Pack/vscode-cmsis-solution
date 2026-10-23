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

interface ArmResource {
    href?: string;
    name?: string;
    extension?: string;
    contentType?: string;
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

    async load(): Promise<void> {
        if (!this.loading) {
            this.loading = this.loadCatalog().catch(error => {
                this.loading = undefined;
                throw error;
            });
        }
        await this.loading;
    }

    private async loadCatalog(): Promise<void> {
        const file = new JsonFile(this.catalogFileName);
        const result = await file.load();
        const catalog = file.content as ArmCatalog | undefined;
        if (result > ETextFileResult.Success || file.parser?.hasErrors() || !Array.isArray(catalog?.docs)
            || !catalog?.coreArch || !catalog.kindOrder || !Array.isArray(catalog.knownNpus)
            || catalog.docs.some(doc => !armDocRef(armDocName(doc)) || !doc.title || !doc.kind)) {
            throw new Error('Failed to load the Arm document catalog.');
        }
        this.catalog = catalog;
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
        return catalog.docs.filter(doc => doc.kind !== 'gug' && (doc.kind === 'npu'
            ? doc.npus?.some(npu => npuNames.has(npu.toLowerCase()))
            : coreNames.size > 0 && (doc.all || doc.cores?.some(core => coreNames.has(normalizeCore(core)))
                || doc.archs?.some(arch => architectures.has(arch)))))
            .sort((left, right) => (catalog.kindOrder[left.kind] ?? 99) - (catalog.kindOrder[right.kind] ?? 99));
    }

    metadataUrl(name: string): string | undefined {
        const ref = armDocRef(name);
        return ref ? `https://documentation-service.arm.com/documentation/${ref.id}/${ref.version}` : undefined;
    }

    resource(name: string, metadata: unknown): { url: string; name: string } {
        const ref = armDocRef(name);
        const metadataUrl = this.metadataUrl(name);
        if (!ref || !metadataUrl) {
            throw new Error('Not an Arm document URL.');
        }
        const document = metadata as { _links?: { resources?: ArmResource[] } } | undefined;
        const resources = document?._links?.resources;
        const pdfs = Array.isArray(resources) ? resources.filter(resource => typeof resource.href === 'string'
            && (resource.extension?.toLowerCase() === 'pdf' || resource.contentType?.toLowerCase() === 'application/pdf')) : [];
        const resource = pdfs.find(pdf => pdf.name?.toLowerCase().startsWith(ref.id)) ?? pdfs[0];
        if (!resource?.href) {
            throw new Error('This Arm document has no PDF resource.');
        }
        return { url: new URL(resource.href, metadataUrl).href, name: resource.name ?? `${ref.id}_${ref.version}.pdf` };
    }
}
