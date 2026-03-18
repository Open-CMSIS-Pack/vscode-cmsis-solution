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
import { DataSource } from './data-source';
import { DeviceData, DeviceId } from './device-data';
import { DataManager } from './data-manager';
import { PackId } from './pack-data';
import { BoardData, BoardId } from './board-data';
import { DraftProjectFormat, DraftProjectData, DraftProjectId, DraftProjectSource, DraftProjectType } from './draft-project-data';
import { makeFactory, makeGenerator } from '../__test__/test-data-factory';

export type MockDataManager = jest.Mocked<DataManager>;

export const dataManagerFactory = (): MockDataManager => ({
    errors: [],
    getAllBoards: jest.fn(),
    getAllDevices: jest.fn(),
    getDraftProjects: jest.fn(),
});

export type MockDataSource = jest.Mocked<DataSource>;

export const dataSourceFactory = (): MockDataSource => ({
    enabled: true,
    getAllBoards: jest.fn(),
    getAllDevices: jest.fn(),
    getDraftProjects: jest.fn(),
});

export const deviceIdFactory = makeFactory<DeviceId>({
    vendor: () => faker.word.words(2),
    name: () => faker.word.noun(),
    key: (r) => `${r.vendor}::${r.name}`,
});

export const deviceDataFactory = makeFactory<DeviceData>({
    vendor: (r) => r.id?.vendor ?? faker.word.words(2),
    name: (r) => r.id?.name ?? faker.word.noun(),
    id: (r) => new DeviceId(r.vendor!, r.name!),
    family: () => faker.word.noun(),
    subfamily: (r) => (r.subfamily === '') ? undefined : faker.word.noun(),
    pack: (r) => Promise.resolve(new PackId(r.vendor!, faker.word.noun(), faker.system.semver())),
    memories: () => Promise.resolve([]),
    processors: () => Promise.resolve([]),
    description: () => Promise.resolve(faker.lorem.sentence(8)),
});

export const generateDeviceData = makeGenerator(deviceDataFactory);

export const boardDataFactory = makeFactory<BoardData>({
    vendor: (r) => r.id?.vendor ?? faker.word.words(2),
    name: (r) => r.id?.name ?? faker.word.noun(),
    revision: (r) => r.id?.revision ?? faker.system.semver(),
    id: (r) => new BoardId(r.vendor!, r.name!, r.revision!),
    devices: () => Promise.resolve([]),
    pack: (r) => Promise.resolve(new PackId(r.vendor!, faker.word.noun(), faker.system.semver())),
    image: () => Promise.resolve(''),
    debugInterfaces: () => Promise.resolve([]),
    description: () => Promise.resolve(faker.lorem.sentence(8)),
});

export const draftProjectDataFactory = makeFactory<DraftProjectData>({
    name: (r) => r.id?.name ?? faker.word.words(2),
    id: (r) => new DraftProjectId(r.name!, r.pack),
    description: () => faker.lorem.sentence(8),
    format: () => faker.helpers.enumValue(DraftProjectFormat),
    draftType: () => faker.helpers.enumValue(DraftProjectType),
    draftSource: () => faker.helpers.enumValue(DraftProjectSource),
    pack: () => undefined,
    copyTo: () => jest.fn(),
});

export const generateDraftProjectData = makeGenerator(draftProjectDataFactory);
