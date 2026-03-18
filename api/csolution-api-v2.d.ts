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

import * as vscode from 'vscode';

export namespace CsolutionApiV2 {

/** Unique id to identify a pack  */
export interface PackId {
    get key(): string;
    get vendor(): string,
    get name(): string,
    get version(): string | undefined,
}

/** Unique id to identify a device */
export interface DeviceId {
    get key(): string;
    get vendor(): string,
    get name(): string,
}

/** Unique id to identify a board */
export interface BoardId {
    get key(): string;
    get vendor(): string,
    get name(): string,
    get revision(): string | undefined,
}

/** Unique id to identify a draft project */
export class DraftProjectId {
    get key(): string;
    get name(): string;
    get packId(): PackId | undefined;
}

/** Debug interface provided by a board */
export interface DebugInterface {
    get adapter(): string;
    get connector(): string;
}

/** Description of a development board */
export interface BoardData {
    /** Unique board identifier */
    get id(): BoardId;
    /** Name of the board vendor */
    get vendor(): string;
    /** Name of the board */
    get name(): string;
    /** (Optional) board revision specifier */
    get revision(): string | undefined;
    /**
     * List of compatible devices
     * The first element is considered the "mounted device", i.e.,
     * the device the board is usually equipped with by default.
     */
    get devices(): Promise<DeviceId[]>;
    /**
     * Unique id of the pack this board is specified in.
     * This is typically considered the Board Support Pack (BSP).
     */
    get pack(): Promise<PackId | undefined>;
    /** (Optional) An image of the board. */
    get image(): Promise<string | undefined>;
    /** List of provided debug interfaces. */
    get debugInterfaces(): Promise<DebugInterface[]>;
}

/** Memory details for a device. */
export interface DeviceMemory {
    /** Name of the memory, unique per device */
    get name(): string;
    /** Size of the memory in bytes */
    get size(): number;
}

/** Processor details for a device */
export interface DeviceProcessor {
    /** Name of the processor, unique per device */
    get name(): string;
    /** Name of the implemented processor core, e.g., Cortex-M33 */
    get core(): string;
    /** Is the processor TrustZone enabled? */
    get trustzone(): boolean | undefined;
}

/** Details about a device */
export interface DeviceData {
    /** Unique identifier */
    get id(): DeviceId;
    /** Device vendor name */
    get vendor(): string;
    /** Device name */
    get name(): string;
    /** Device family name */
    get family(): string;
    /** (Optional) Device subfamily name */
    get subfamily(): string | undefined;
    /**
     * (Optional) Identifier of the pack this device is defined in.
     * This is usually considered the Device Family Pack (DFP).
    */
    get pack(): Promise<PackId | undefined>;
    /** List of memories the device is equipped with. */
    get memories(): Promise<DeviceMemory[]>;
    /** List of processors the device is equipped with. */
    get processors(): Promise<DeviceProcessor[]>;
    /** Description for the device */
    get description(): Promise<string>;
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
    Template ='Template',
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

/** Details about a project draft (example, template, or reference application) */
export interface DraftProjectData {
    /** Unique identifier for the draft project. */
    get id(): DraftProjectId;
    /** Name of the project */
    get name(): string;
    /** Description of the project */
    get description(): string;
    /** Project format, i.e., indicates the required toolset for building. */
    get format(): DraftProjectFormat;
    /** The type of draft, e.g., example, template, or reference application. */
    get draftType(): DraftProjectType;
    /** The source of the draft, e.g., a local pack or download from a web resource. */
    get draftSource(): DraftProjectSource;
    /** (Optional) The pack identifier this draft is shipped in. */
    get pack(): PackId | undefined;
}

/** Filter for devices */
export type DeviceFilter = {
    /** Optional vendor name */
    vendor?: string,
    /** Optional device name pattern (reg exp)  */
    name?: string,
}

/** Filter for boards */
export type BoardFilter = {
    /** Optional vendor name */
    vendor?: string,
    /** Optional board name pattern (reg exp)  */
    name?: string,
    /** Optional revision tag pattern (reg exp)  */
    revision?: string,
    /** Optional device filter applied to mounted devices */
    mountedDevice?: DeviceFilter,
};

export type CreateNewSolutionOptions = {
    draft: CsolutionApiV2.DraftProjectData,
    board?: CsolutionApiV2.BoardData,
    device?: CsolutionApiV2.DeviceData,
    folder: string,
    git?: boolean,
};

/** Options for cbuild command */
export type BuildOptions = {
    /** Remove intermediate and output directories (--clean) */
    clean: boolean,
    /** Remove intermediate and output directories and rebuild (--rebuild) */
    rebuild: boolean,
    /** Update the RTE directory and files (--update-rte) */
    updateRte: boolean,
    /** Download missing software packs with cpackget (--packs) */
    packs: boolean,
};

}

export interface CsolutionApiV2 {

    /**
     * List available CMSIS boards.
     * @param filter Optional filter to retrieve only boards matching certain conditions.
     */
    getBoards(filter?: CsolutionApiV2.BoardFilter): Promise<CsolutionApiV2.BoardData[]>;

    /**
     * List available CMSIS devices.
     * @param filter Optional filter to retrieve only devices matching certain conditions.
     */
    getDevices(filter?: CsolutionApiV2.DeviceFilter): Promise<CsolutionApiV2.DeviceData[]>;

    /**
     * Get draft projects for the given board and/or device.
     *
     * @param board The board to filter project drafts for.
     * @param device The device to filter project drafts for.
     *
     * @returns List of available project drafts
     */
    getDraftProjects(board?: CsolutionApiV2.BoardId, device?: CsolutionApiV2.DeviceId): Promise<CsolutionApiV2.DraftProjectData[]>;

    /**
     * Create a new solution from the selected draft for the given target.
     *
     * The project draft is copied from its source to given target folder.
     *
     * @param options Create options to specify project draft and target folder.
     */
    createNewSolution(options: CsolutionApiV2.CreateNewSolutionOptions): Promise<void>;

    /**
     * Execute build commands for the active context set.
     *
     * @param options Optional options to be used for executing build command.
     */
    build(options?: Partial<CsolutionApiV2.BuildOptions>): Thenable<vscode.TaskExecution>;
}
