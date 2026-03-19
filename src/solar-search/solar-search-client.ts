/**
 * Copyright 2023-2026 Arm Limited
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

import { GraphQLClient } from 'graphql-request';
import { GetBoardProjectsQuery, Sdk, getSdk } from './graphql/client/schema';

const SOLAR_SEARCH_API_HOST = 'https://solar-search.api.keil.arm.com/';

// Workaround for Solar Search returning Vendor ARM as Arm
function fixVendorName(vendorName: string) {
    if (vendorName == 'Arm') {
        return 'ARM';
    }
    return vendorName;
}

type BoardId = {
    id: string;
    example_projects_count: number;
}

type CsolutionExample = {
    type: 'csolution';
}

type UvProjExample = {
    type: 'uvproj';
    convertible: boolean;
}

type OtherExample = {
    type: 'other';
}


export type ExampleProjectFormat = CsolutionExample | UvProjExample | OtherExample;

export type ExampleProject = {
    name: string;
    description: string;
    format: ExampleProjectFormat;
    download_url: string;
    id: string;
}

type ProjectResponse = GetBoardProjectsQuery['search_projects']['results'][number];

export const projectReponseToExampleProject = (projectResponse: ProjectResponse): ExampleProject => {
    let format: ExampleProjectFormat;
    if (projectResponse.format.__typename === 'UvProjectFormat') {
        format = { type: 'uvproj', convertible: projectResponse.format.convertible };
    } else {
        format = { type: 'csolution' };
    }

    return {
        name: projectResponse.name,
        description: projectResponse.description,
        format: format,
        download_url: projectResponse.download_url,
        id: projectResponse.id
    };
};

export type Device = {
    vendorName: string;
    familyName: string;
    subfamilyName?: string;
    deviceId: string;
    deviceName: string;
    packVendor?: string;
    packName?: string;
    packVersion?: string;
    description?: string;
    memories?: {
        name: string;
        size: number;
    }[];
    processors?: {
        name: string;
        core: string;
        trustzone: boolean | undefined;
    }[];
};

type GetAllDevicesResult = {
    id: string;
    family: string;
    sub_family?: string | null;
    name: string;
    vendor: {
        name: string;
    };
};

type GetDeviceDetailsResult = {
    id: string;
    name: string;
    description?: string | null;
    vendor: {
        name: string;
    };
    family: {
        name: string;
    };
    sub_family?: {
        name: string;
    } | null;
    memory: Array<{
        name: string;
        size: number;
    }>;
    processors: Array<{
        core: string;
        cortexm_vector_extensions: string;
        digital_signal_processor: string;
        endian: string;
        floating_point_unit: string;
        max_core_clock_frequency: number;
        memory_protection_unit: string;
        trust_zone: string;
    }>;
    source_pack_id: {
        name: string;
        vendor: string;
        version: string;
    };
};

function createDevice(device: GetAllDevicesResult): Device {
    return  {
        vendorName: fixVendorName(device.vendor?.name),
        familyName: device.family,
        subfamilyName: device.sub_family || undefined,
        deviceId: device.id,
        deviceName: device.name,
    };
}

function createDeviceDetails(device: GetDeviceDetailsResult): Device {
    return  {
        vendorName: fixVendorName(device.vendor?.name),
        familyName: device.family.name,
        subfamilyName: device.sub_family?.name || undefined,
        deviceId: device.id,
        deviceName: device.name,
        description: device.description || undefined,
        memories: device.memory.map(m => ({ name: m.name, size: m.size })),
        processors: device.processors.map(p => ({ name: '', core: p.core, trustzone: p.trust_zone ? p.trust_zone === 'TZ' : undefined })),
        packVendor: device.source_pack_id.vendor,
        packName: device.source_pack_id.name,
        packVersion: device.source_pack_id.version,
    };
}

export type PackFamilyId = {
    vendor: string;
    name: string;
}

export type MountedDevice = {
    vendorName: string,
    deviceId: string;
    deviceName: string;
}

export type DebugInterface = {
    adapter: string,
    connector: string,
}

export type Board = {
    vendorName: string;
    boardId: string;
    boardName: string;
    boardRev?: string;
    packFamilyId?: string;
    packVersion?: string;
    description?: string;
    mountedDevices?: MountedDevice[];
    imageUrl?: string;
    debugInterfaces?: DebugInterface[];
};

type GetAllBoardsResult = {
    id: string;
    name: string;
    revision?: string | null;
    description?: string | null;
    vendor: {
        name: string;
    };
    devices?: Array<{
        id: string;
        name: string;
        vendor: {
            name: string;
        };
    }>;
    cmsis?: {
        pack_family_id: string;
        cmsis_pack_id: {
            version: string;
        };
    } | null;
};

type GetBoardDetailsResult = {
    id: string;
    name: string;
    revision?: string | null;
    description?: string | null;
    image_url?: string | null;
    vendor: {
        name: string;
    };
    cmsis?: {
        pack_family_id: string;
        cmsis_pack_id: {
            version: string;
        };
    } | null;
    debug_interfaces: Array<{
        adapter: string;
        connector: string;
    }>;
    devices: Array<{
        id: string;
        name: string;
        vendor: {
            name: string;
        };
    }>;
}

function createBoard(data: GetAllBoardsResult): Board  {
    return {
        vendorName: fixVendorName(data.vendor.name),
        boardId: data.id,
        boardName: data.name,
        boardRev: data.revision ?? undefined,
        packFamilyId: data.cmsis?.pack_family_id,
        packVersion: data.cmsis?.cmsis_pack_id.version,
        description: data.description || undefined,
        mountedDevices: data.devices?.map(d => ({ vendorName: fixVendorName(d.vendor.name), deviceId: d.id, deviceName: d.name })),
    };
}

function createBoardDetails(data: GetBoardDetailsResult): Board {
    return {
        vendorName: fixVendorName(data.vendor.name),
        boardId: data.id,
        boardName: data.name,
        boardRev: data.revision ?? undefined,
        packFamilyId: data.cmsis?.pack_family_id,
        packVersion: data.cmsis?.cmsis_pack_id.version,
        description: data.description ?? undefined,
        imageUrl: data.image_url ?? undefined,
        debugInterfaces: data.debug_interfaces,
        mountedDevices: data.devices.map(d => ({ vendorName: fixVendorName(d.vendor.name), deviceId: d.id, deviceName: d.name })),
    };
}

export interface SolarSearchClient {
    getExamplesForBoard(name: string, vendor: string, revision: string): Promise<ExampleProject[]>;
    getAllDevices(): Promise<Device[]>;
    getDeviceDetails(id: string): Promise<Device | undefined>;
    getAllBoards(): Promise<Board[]>;
    getAllBoardsWithDetails(): Promise<Board[]>;
    getBoardDetails(id: string): Promise<Board | undefined>;
    resolvePackFamilyId(id: string) : Promise<PackFamilyId | undefined>
}

export class SolarSearchClientImpl implements SolarSearchClient {
    public static readonly PAGE_SIZE = 1000;

    constructor(
        private readonly sdk: Sdk = getSdk(new GraphQLClient(SOLAR_SEARCH_API_HOST)),
    ) {}

    private async getBoards(name: string, vendor: string, revision: string): Promise<BoardId[]> {
        const response = await this.sdk.getBoard({ name, vendor, revision });
        return response.search_boards.results;
    }

    private async requestBoardProjectPage(boardId: string, offset: number): Promise<ExampleProject[]> {
        const response = await this.sdk.getBoardProjects({ boardId, offset, limit: SolarSearchClientImpl.PAGE_SIZE });
        return response.search_projects.results.map(project => projectReponseToExampleProject(project));
    }

    private async getBoardProjects(boardId: string, projectCount: number): Promise<ExampleProject[]> {
        const exampleProjects: ExampleProject[] = [];

        let offset = 0;
        while (exampleProjects.length < projectCount) {
            const examples = await this.requestBoardProjectPage(boardId, offset);
            exampleProjects.push(...examples);
            offset += SolarSearchClientImpl.PAGE_SIZE;
        }

        return exampleProjects;
    }

    private exampleIsCompatible(example: ExampleProject): boolean {
        return example.format.type === 'csolution' ||
            example.format.type === 'uvproj' && example.format.convertible;
    }

    public async getExamplesForBoard(name: string, vendor: string, revision: string): Promise<ExampleProject[]> {
        const boards = await this.getBoards(name, vendor, revision);
        if (!boards.length) {
            return [];
        }
        const board = boards[0];
        if (board.example_projects_count === 0) {
            return [];
        }

        const examples = await this.getBoardProjects(board.id, board.example_projects_count);

        return examples.filter(example => this.exampleIsCompatible(example));
    }

    public async getAllDevices(): Promise<Device[]> {
        // first fetch only metadata.total to calculate number of pages
        // this is much faster than fetching the first page at once
        const initialResponse = await this.sdk.getAllDevices({ offset: 0, limit: 0 });
        const total = initialResponse.search_devices?.metadata.total ?? 0;
        const pages = (total + SolarSearchClientImpl.PAGE_SIZE - 1) / SolarSearchClientImpl.PAGE_SIZE;

        // query all pages in parallel
        const responses = Array.from({ length: pages }, (_, i) =>
            this.sdk.getAllDevices({ offset: i * SolarSearchClientImpl.PAGE_SIZE, limit: SolarSearchClientImpl.PAGE_SIZE })
        );

        // await all responses and create flat device list
        const devices = (await Promise.all(responses)).flatMap(r => r.search_devices?.results.map(createDevice) ?? []);

        return devices;
    }

    public async getDeviceDetails(id: string): Promise<Device | undefined> {
        const response = await this.sdk.getDevice({ id });
        if (response.get_device) {
            return createDeviceDetails(response.get_device);
        }
        return undefined;
    }

    public async getAllBoards(): Promise<Board[]> {
        const response = await this.sdk.getAllBoards();
        const result = response.boards
            .filter(b => b.cmsis)   // filter boards not originating to a pack
            .map(b => createBoard(b));
        return result;
    }

    public async getAllBoardsWithDetails(): Promise<Board[]> {
        const response = await this.sdk.getAllBoardsWithDetails();
        const result = response.boards
            .filter(b => b.cmsis)   // filter boards not originating to a pack
            .map(b => createBoard(b));
        return result;

    }

    public async getBoardDetails(id: string) : Promise<Board | undefined> {
        const response = await this.sdk.getBoardDetails({ id });
        if (response.get_board) {
            return createBoardDetails(response.get_board);
        }
        return undefined;
    }

    public async resolvePackFamilyId(id: string) : Promise<PackFamilyId | undefined> {
        const response = await this.sdk.resolvePackFamily({ id });
        const vendor = response.get_pack_family?.cmsis_id.vendor;
        const name = response.get_pack_family?.cmsis_id.name;
        if (vendor && name) {
            return { vendor, name };
        }
        return undefined;
    }
}
