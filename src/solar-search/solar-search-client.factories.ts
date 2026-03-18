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

import { faker } from '@faker-js/faker';
import { Board, Device, ExampleProject, MountedDevice, SolarSearchClient } from './solar-search-client';

export type MockSolarSearchClient = jest.Mocked<SolarSearchClient>;

export const mockSolarSearchClient = (): MockSolarSearchClient => ({
    getExamplesForBoard: jest.fn(),
    getAllDevices: jest.fn(),
    getAllBoards: jest.fn(),
    getAllBoardsWithDetails: jest.fn(),
    getDeviceDetails: jest.fn(),
    getBoardDetails: jest.fn(),
    resolvePackFamilyId: jest.fn(),
});

export const cSolutionExampleFactory = (name?: string): ExampleProject => ({
    name: name ?? faker.word.noun(),
    description: faker.word.words(),
    download_url: faker.internet.url(),
    format: { type: 'csolution' },
    id: faker.word.noun()
});

export type UvProjectFactoryOptions = {
    convertible: boolean;
}

export const uvProjExampleFactory = (options?: UvProjectFactoryOptions): ExampleProject => ({
    name: faker.word.noun(),
    description: faker.word.words(),
    download_url: faker.internet.url(),
    format: { type: 'uvproj', convertible: options?.convertible ?? true },
    id: faker.word.noun()
});

export function deviceIdFactory(options?: Partial<Device>) : Device {
    const vendorName = options?.vendorName ?? faker.word.words(2);
    const familyName = options?.familyName ?? faker.word.noun();
    const deviceId = options?.deviceId ?? faker.string.uuid();
    const deviceName = options?.deviceName ?? faker.word.noun();
    return {
        ...options,
        vendorName,
        familyName,
        deviceId,
        deviceName,
    };
}

export function deviceFactory(options?: Partial<Device>) : Device {
    const packVendor = options?.packVendor ?? faker.word.noun();
    const packName = options?.packName ?? faker.word.noun();
    const description = options?.description ?? faker.lorem.sentence();
    const memories = options?.memories ?? [{ name: faker.word.noun(), size: faker.number.int() }];
    const processors = options?.processors ?? [{ name: faker.word.noun(), core: faker.word.noun(), trustzone: false }];
    return deviceIdFactory({
        ...options,
        packVendor,
        packName,
        description,
        memories,
        processors,
    });
}

export function boardFactory(options?: Partial<Board>) : Board {
    const vendorName = options?.vendorName ?? faker.word.words(2);
    const boardId = options?.boardId ?? faker.string.uuid();
    const boardName = options?.boardName ?? faker.word.noun();
    const description = options?.description ?? faker.lorem.sentence();
    const mountedDevices = options?.mountedDevices ?? [{ vendorName, deviceId: faker.string.uuid(), deviceName: faker.word.noun() }];
    return {
        ...options,
        vendorName,
        boardId,
        boardName,
        description,
        mountedDevices,
    };
}

type Factory<T> = (options?: Partial<T>) => T;

type Initializer<T> = {
    [P in keyof T]: (result: Partial<T>) => T[P];
};

function makeFactory<T extends object>(initializer: Initializer<T>): Factory<T> {
    const factory = (options?: Partial<T>) => {
        const result = { ...options } as T;
        for (const key in initializer) {
            if (!(key in result)) {
                result[key] = initializer[key].call(result, result);
            }
        }
        return result;
    };
    return factory;
}

export const mountedDevicesFactory = makeFactory<MountedDevice>({
    vendorName: () => faker.word.words(2),
    deviceName: () => faker.word.noun(),
    deviceId: () => faker.string.uuid(),
});
