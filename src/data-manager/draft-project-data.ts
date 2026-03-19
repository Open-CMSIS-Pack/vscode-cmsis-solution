/**
 * Copyright 2024-2026 Arm Limited
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

import path from 'path';
import { ExampleProject } from '../solar-search/solar-search-client';
import { PackId } from './pack-data';
import { tmpdir } from 'os';

import extractZip from 'extract-zip';
import { downloadFile } from '../file-download';
import { workspaceFsProvider } from '../vscode-api/workspace-fs-provider';
import { copyFolderRecursive } from '../utils/fs-utils';

import { ExampleProject as CsolutionExampleProject, ExampleEnvironment as CsolutionExampleEnvironment, SolutionTemplate as CsolutionTemplate } from '../json-rpc/csolution-rpc-client';
import { splitPackId } from '../json-rpc/csolution-rpc-helper';


/** Unique ID for all draft projects */
export class DraftProjectId {
    public readonly key: string;

    constructor(
        public readonly name: string,
        public readonly packId?: PackId,
    ) {
        if (packId) {
            this.key = `${packId.key}:${name.toLowerCase()}`;
        } else {
            this.key = `${name.toLowerCase()}`;
        }
    }
}

/**
 * The project format of the draft indicates the required tool set.
 */
export enum DraftProjectFormat {
    /** CMSIS Csolution */
    Csolution = 'Csolution',
    /** MDK uVision project convertible to Csolution */
    uVision = 'uVision',
    /** Unknown or unspecified project format */
    Other = 'Other',
}

/**
 * The type of the draft project.
 */
export enum DraftProjectType {
    /** Ready-to-use example for a specific board/device */
    Example = 'Example',
    /** Application draft to be configured with software layers for a variety of targets */
    RefApp = 'Reference Application',
    /** Naked project template to be completed with user configuration */
    Template = 'Template',
}

/**
 * The origin of the draft project.
 */
export enum DraftProjectSource {
    /** Retrieved via download from a Web resource. */
    Web = 'Web',
    /** Copied from a local resource, e.g. installed pack. */
    Local = 'Local',
}

export interface DraftProjectData {
    get id(): DraftProjectId;
    get name(): string;
    get description(): string;
    get format(): DraftProjectFormat;
    get draftType(): DraftProjectType;
    get draftSource(): DraftProjectSource;
    get pack(): PackId | undefined;

    copyTo(dest: string): Promise<void>;
}

abstract class BaseDraftProjectData implements DraftProjectData {
    get id() {
        return new DraftProjectId(this.name, this.pack);
    }

    abstract get name(): string;
    abstract get description(): string;
    abstract get format(): DraftProjectFormat;
    abstract get draftType(): DraftProjectType;
    abstract get draftSource(): DraftProjectSource;
    abstract get pack(): PackId | undefined;

    abstract copyTo(dest: string): Promise<void>;

    protected static async downloadAndExtract(url: string, dest: string) {
        const exampleZipPath = path.join(tmpdir(), 'example.zip');
        await downloadFile(url, exampleZipPath);
        await extractZip(exampleZipPath, { dir: dest });
        await workspaceFsProvider.delete(exampleZipPath, true, false);
    }
}

export class SolarExampleData extends BaseDraftProjectData {
    constructor(
        private readonly data: ExampleProject,
    ) {
        super();
    }

    public get id() {
        return new DraftProjectId(this.data.id);
    }

    public get name() {
        return this.data.name;
    }

    public get description() {
        return this.data.description;
    }

    public get format() {
        switch (this.data.format.type) {
            case 'csolution':
                return DraftProjectFormat.Csolution;
            case 'uvproj':
                if (this.data.format.convertible) {
                    return DraftProjectFormat.uVision;
                }
                break;
        }
        return DraftProjectFormat.Other;
    }

    public get draftType() {
        return DraftProjectType.Example;
    }

    public get draftSource() {
        return DraftProjectSource.Web;
    }

    public get pack() {
        return undefined;
    }

    public copyTo(dest: string) {
        return BaseDraftProjectData.downloadAndExtract(this.data.download_url, dest);
    }
}

export class CsolutionExampleData extends BaseDraftProjectData {
    protected readonly packId: PackId;
    protected readonly selectedEnvironment: CsolutionExampleEnvironment | undefined;

    constructor(
        private readonly data: CsolutionExampleProject,
        public readonly draftType: DraftProjectType = DraftProjectType.Example,
    ) {
        super();
        const packId = splitPackId(data.pack);
        this.packId = new PackId(packId.vendor, packId.name, packId.version);

        this.selectedEnvironment =
            data.environments.find(env => env.name === 'csolution') ??
            data.environments.find(env => env.name === 'uv') ??
            data.environments.at(0);
    }

    public get id() {
        return new DraftProjectId(this.data.name, this.packId);
    }

    public get name() {
        return this.data.name;
    }

    public get description() {
        return this.data.description;
    }

    public get format() {
        switch (this.selectedEnvironment?.name) {
            case 'csolution':
            case 'cmsis':
                return DraftProjectFormat.Csolution;
            case 'uv':
                return DraftProjectFormat.uVision;
        }
        return DraftProjectFormat.Other;
    }

    public get draftSource() {
        return DraftProjectSource.Local;
    }

    public get pack() {
        return this.packId;
    }

    public async copyTo(dest: string) {
        if (this.data.archive) {
            return extractZip(this.data.archive, { dir: dest });
        } else if (this.selectedEnvironment) {
            return copyFolderRecursive(this.selectedEnvironment?.folder, dest);
        }
        throw new Error(`Cannot copy example project ${this.name}: no archive or folder available.`);
    }
}

export class CsolutionTemplateData extends BaseDraftProjectData {
    protected readonly packId: PackId;

    constructor(
        private readonly data: CsolutionTemplate,
    ) {
        super();
        const packId = splitPackId(data.pack);
        this.packId = new PackId(packId.vendor, packId.name, packId.version);
    }

    public get id() {
        return new DraftProjectId(this.data.name, this.packId);
    }

    public get name() {
        return this.data.name;
    }

    public get description() {
        return this.data.description;
    }

    public get format() {
        return DraftProjectFormat.Csolution;
    }

    public get draftType() {
        return DraftProjectType.Template;
    }

    public get draftSource() {
        return DraftProjectSource.Local;
    }

    public get pack() {
        return this.packId;
    }

    public async copyTo(dest: string) {
        return copyFolderRecursive(this.data.folder, dest);
    }
}
