/**
 * Copyright 2023-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { faker } from '@faker-js/faker';
import { CsolutionProjectFormat, DeviceSearchResult, GetAllBoardsQuery, GetAllBoardsWithDetailsQuery, GetAllDevicesQuery, GetBoardProjectsQuery, GetBoardQuery, GetDeviceQuery, GroupedFamilyResult, GroupedSubFamilyResult, Project, ProjectFormat, ProjectFormatType, Sdk, UvProjectFormat } from './client/schema';

type MockSolarSearchSdk = jest.Mocked<Sdk>

export const mockSolarSearchSdk = (): MockSolarSearchSdk => ({
    getBoard: jest.fn(),
    getBoardProjects: jest.fn(),
    getAllDevices: jest.fn(),
    getDevice: jest.fn(),
    getAllBoards: jest.fn(),
    getBoardDetails: jest.fn(),
    resolvePackFamily: jest.fn(),
    getAllBoardsWithDetails: jest.fn(),
});

type SolarBoardFactoryOptions = {
    results: Array<{id: string, example_projects_count: number}>
}

export const boardResponseFactory = (options?: SolarBoardFactoryOptions): GetBoardQuery => ({
    search_boards: {
        results: options?.results ?? faker.helpers.multiple(() => ({ id: faker.word.noun(), example_projects_count: faker.number.int() }))
    }
});

const projectFactory = (format: ProjectFormat): Project => {
    return {
        name: faker.word.noun(),
        description: faker.word.words(),
        download_url: faker.internet.url(),
        format,
        board_id: faker.word.noun(),
        id: faker.word.noun(),
        toolchains: [],
        origin: {},
    };
};

export const cSolutionProjectFactory = (): Project => {
    const format: CsolutionProjectFormat = {
        __typename: 'CsolutionProjectFormat',
        type: ProjectFormatType.Csolution,
    };

    return projectFactory(format);
};

export type UvProjectFactoryOptions = {
    convertible: boolean;
}

export const uvProjectFactory = (options?: UvProjectFactoryOptions): Project => {
    const format: UvProjectFormat = {
        __typename: 'UvProjectFormat',
        type: ProjectFormatType.Uvprojx,
        convertible: options?.convertible ?? true,
    };

    return projectFactory(format);
};

export type BoardProjectResponseFactoryOptions = {
    boardProjects?: Project[];
}

export const boardProjectResponseFactory = (options?: BoardProjectResponseFactoryOptions): GetBoardProjectsQuery => {
    const examples = options?.boardProjects ?? faker.helpers.multiple(() => cSolutionProjectFactory());
    return {
        search_projects: {
            results: examples,
        }
    };
};


export type GetDeviceResponseFactoryOptions = {
    packVendor?: string;
    packName?: string;
    packVersion?: string;
    vendorId?: string;
    vendorName?: string;
    familyId?: string;
    familyName?: string;
    subfamilyId?: string;
    subfamilyName?: string;
    deviceId?: string;
    deviceName?: string;
    cores?: string[];
    description?: string | null;
}

export type GetAllDevicesResponseFactoryOptions = {
    devices?: GetDeviceResponseFactoryOptions[];
    repeat?: number;
    total?: number;
};

export const getAllDevicesResponseFactory = (options?: GetAllDevicesResponseFactoryOptions): GetAllDevicesQuery => {
    const vendorIds: {[name: string]: string} = {};
    const vendorNames: {[id: string]: string} = {};
    const familyIds: {[name: string]: string} = {};
    const families: {[id: string]: { vendor: string, result: GroupedFamilyResult}} = {};
    const subfamilyIds: {[name: string]: string} = {};
    const subfamilies: {[id: string]: { family: string, result: GroupedSubFamilyResult}} = {};

    const results: DeviceSearchResult[] = [];

    for (let i = 0; i < (options?.repeat ?? 1); i++) {
        for (const d of options?.devices ?? []) {
            // explicit vendor id takes precedence
            const vendorId = d.vendorId ?? vendorIds[d.vendorName ?? ''] ?? faker.string.uuid();
            const vendorName = vendorNames[vendorId] ?? d.vendorName ?? faker.word.words(2);
            const familyId = d.familyId ?? familyIds[d.familyName ?? ''] ?? faker.string.uuid();
            const familyName = families[familyId]?.result.name ?? d.familyName ?? faker.word.noun();
            const subfamilyId = d.subfamilyId ?? subfamilyIds[d.subfamilyName ?? ''] ?? (d.subfamilyName ? faker.string.uuid() : undefined) ;
            const subfamilyName = subfamilies[subfamilyId]?.result.name ?? d.subfamilyName ?? (subfamilyId ? faker.word.noun() : undefined);

            vendorIds[vendorName] = vendorId;
            vendorNames[vendorId] = vendorName;
            familyIds[familyName] = familyId;
            if (subfamilyId) {
                subfamilyIds[subfamilyName] = subfamilyId;
            }

            results.push({
                family: familyName,
                sub_family: subfamilyName,
                vendor: {
                    slug: '',
                    name: vendorName,
                },
                id: d.deviceId ?? faker.string.uuid(),
                name: d.deviceName ?? faker.word.noun(),
                cores: d.cores ?? [faker.word.noun()],
                highlights: {}
            });
        }
    }

    const metadata = { total: options?.total ?? results.length };

    return { search_devices: { metadata, results } };
};

export const getDeviceResponseFactory = (options?: GetDeviceResponseFactoryOptions): GetDeviceQuery => {
    const subfamilyId = options?.subfamilyId ?? (options?.subfamilyName ? faker.string.uuid() : undefined) ;
    const subfamilyName = options?.subfamilyName ?? (subfamilyId ? faker.word.noun() : undefined);
    return { get_device: {
        id: options?.deviceId ?? faker.string.uuid(),
        name: options?.deviceName ?? faker.word.noun(),
        description: undefined, // FIXME
        vendor: { name: options?.vendorName ?? faker.word.words(2) },
        family: { id: options?.familyId ?? faker.string.uuid(), name: options?.familyName ?? faker.word.noun() },
        sub_family: (!!subfamilyId && !!subfamilyName) ? { id: subfamilyId, name: subfamilyName } : undefined,
        memory: [],
        processors: [],
        source_pack_id: {
            vendor: options?.packVendor ?? faker.word.words(2),
            name: options?.packName ?? faker.word.noun(),
            version: options?.packVersion ?? faker.system.semver()
        },
    } };
};

export type GetBoardResponseFactoryOptions = {
    vendor?: string,
    name?: string,
    revision?: string,
    pack_family_id?: string | null,
    pack_version?: string,
};

export type GetAllBoardsResponseFactoryOptions = {
    boards?: GetBoardResponseFactoryOptions[];
    repeat?: number;
    total?: number;
};

export type BoardQuery = {
    id: string,
    name: string,
    revision?: string | null,
    vendor: {
        name: string ,
    },
    cmsis?: {
        pack_family_id: string,
        cmsis_pack_id: {
            version: string,
        },
    } | null,
};

export function getAllBoardsResponseFactory(options?: GetAllBoardsResponseFactoryOptions): GetAllBoardsQuery {
    const boards: BoardQuery[] = [];
    for (let i = 0; i < (options?.repeat ?? 1); i++) {
        for (const b of options?.boards ?? []) {
            boards.push(getBoardResponseFactory(b));
        }
    }
    return { boards };
}

export function getBoardResponseFactory(options?: GetBoardResponseFactoryOptions): BoardQuery {
    const id = faker.string.uuid();
    const name = options?.name ?? faker.word.noun();
    const vendor = { name: options?.vendor ?? faker.word.words(2) };
    const cmsis = options?.pack_family_id !== null ? {
        pack_family_id:  options?.pack_family_id ?? `${name}::${name}`,
        cmsis_pack_id: {
            version: options?.pack_version ?? faker.system.semver(),
        }
    } : null;
    return {
        id,
        name,
        vendor,
        cmsis,
    };
}


export type GetBoardWithDetailsResponseFactoryOptions = {
    vendor?: string,
    name?: string,
    revision?: string,
    description?: string | null;
    pack_family_id?: string | null,
    pack_version?: string,
    devices?: {
        id: string;
        name: string;
        vendor: {
            name: string;
        };
    }[];
};

export type GetAllBoardsWithDetailsResponseFactoryOptions = {
    boards?: GetBoardWithDetailsResponseFactoryOptions[];
    repeat?: number;
    total?: number;
};

export type BoardWithDetailsQuery = {
    id: string,
    name: string,
    revision?: string | null,
    description?: string | null;
    vendor: {
        name: string ,
    },
    devices: {
        id: string;
        name: string;
        vendor: {
            name: string;
        };
    }[];
    cmsis?: {
        pack_family_id: string,
        cmsis_pack_id: {
            version: string,
        },
    } | null,
};

export function getAllBoardsWithDetailsResponseFactory(options?: GetAllBoardsWithDetailsResponseFactoryOptions): GetAllBoardsWithDetailsQuery {
    const boards: BoardWithDetailsQuery[] = [];
    for (let i = 0; i < (options?.repeat ?? 1); i++) {
        for (const b of options?.boards ?? []) {
            boards.push(getBoardWithDetailsResponseFactory(b));
        }
    }
    return { boards };
}

export function getBoardWithDetailsResponseFactory(options?: GetBoardWithDetailsResponseFactoryOptions): BoardWithDetailsQuery {
    const id = faker.string.uuid();
    const name = options?.name ?? faker.word.noun();
    const vendor = { name: options?.vendor ?? faker.word.words(2) };
    const description = options?.description ?? faker.lorem.sentence(8);
    const devices = options?.devices ?? [{
        id: faker.string.uuid(),
        name: faker.word.noun(),
        vendor: { name: faker.word.words(2) },
    }];
    const cmsis = options?.pack_family_id !== null ? {
        pack_family_id:  options?.pack_family_id ?? `${name}::${name}`,
        cmsis_pack_id: {
            version: options?.pack_version ?? faker.system.semver(),
        }
    } : null;
    return {
        id,
        name,
        vendor,
        description,
        devices,
        cmsis,
    };
}
