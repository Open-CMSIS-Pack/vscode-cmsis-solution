/**
 * Copyright 2025-2026 Arm Limited
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

import { string, number, arrayOf, optional, unionOf, InferType, Schema } from '../../generic/schema';
import { SemVer, parse } from 'semver';
import { Optional } from '../../generic/type-helper';
import { YamlFile } from '../../generic/yaml-file';

export const DebugTopologySchema = new Schema({
    processors: optional(arrayOf({
        pname: optional(string),
    })),
});

const ImageLoadTypes = ['none', 'image', 'symbols', 'image+symbols'] as const;
type ImageLoadType = typeof ImageLoadTypes[number];

export const CbuildRunYamlSchema = new Schema({
    'cbuild-run': {
        'generated-by': optional(string),
        solution: optional(string),
        'target-type': optional(string),
        device: optional(string),
        output: arrayOf({
            file: string,
            type: string,
            info: optional(string),
            load: string,
            'load-offset': optional(unionOf(string, number)),
            pname: optional(string),
        }),
        debugger: {
            name: string,
            info: optional(string),
            protocol: optional(string),
            clock: optional(unionOf(string, number)),
            'start-pname': optional(string),
            gdbserver: optional(arrayOf({
                port: unionOf(string, number),
                pname: optional(string),
            })),
            'probe-id': optional(string),
            'telnet': optional(arrayOf({
                mode: string,
                port: number,
                pname: optional(string),
                file: optional(string),
            })),
        },
        'debug-topology': optional(DebugTopologySchema),
    },
});

export type DebugTopology = InferType<typeof DebugTopologySchema>;
export type CbuildRunYaml = InferType<typeof CbuildRunYamlSchema>;

export class CbuildRunYamlFile extends YamlFile {
    private _parsedContent: Optional<CbuildRunYaml>;

    constructor(fileName?: string) {
        super(fileName);
        this.readOnly = true;
        this._parsedContent = undefined;
    }

    public override parse(): unknown {
        this._parsedContent = undefined;
        return super.parse();
    }

    protected get parsedContent(): CbuildRunYaml {
        if (this._parsedContent === undefined) {
            this._parsedContent = CbuildRunYamlSchema.parse(this.object);
        }
        return this._parsedContent;
    }

    public getToolVersion() : [string | undefined, SemVer | undefined] {
        const generatedBy = this.parsedContent['cbuild-run']['generated-by'];
        if (generatedBy) {
            const [tool, version] = generatedBy.split(' version ');
            return [tool, parse(version) || undefined];
        }
        return [undefined, undefined];
    }

    public getSolution() {
        return this.resolvePath(this.parsedContent['cbuild-run'].solution);
    }

    public getDevice() {
        return this.parsedContent['cbuild-run'].device;
    }

    public getTargetType() {
        return this.parsedContent['cbuild-run']?.['target-type'];
    }

    public getDebugger() {
        return this.parsedContent['cbuild-run'].debugger;
    }

    public getProcessors() {
        return this.parsedContent['cbuild-run']?.['debug-topology']?.processors || [];
    }

    public getTelnet() {
        return this.parsedContent['cbuild-run'].debugger.telnet ?? [];
    }

    protected imageTypeFilter(filter: { image?: boolean, symbols?: boolean }) : Set<ImageLoadType> {
        const imageLoadTypes = new Set(ImageLoadTypes);
        if (filter.image === true) {
            imageLoadTypes.delete('none');
            imageLoadTypes.delete('symbols');
        } else if (filter.image === false) {
            imageLoadTypes.delete('image');
            imageLoadTypes.delete('image+symbols');
        }
        if (filter.symbols === true) {
            imageLoadTypes.delete('none');
            imageLoadTypes.delete('image');
        } else if (filter.symbols === false) {
            imageLoadTypes.delete('symbols');
            imageLoadTypes.delete('image+symbols');
        }
        return imageLoadTypes;
    }

    public getImages(filter?: { image?: boolean, symbols?: boolean}) {
        const images = this.parsedContent['cbuild-run']?.output?.map(o => ({ ...o, file: this.resolvePath(o.file) }));
        if (filter) {
            const imageTypes = this.imageTypeFilter(filter);
            return images.filter((img) => imageTypes.has((img.load as ImageLoadType | undefined) ?? 'image+symbols'));
        }
        return images;
    }

}
