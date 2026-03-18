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

import { faker } from '@faker-js/faker';
import {
    boardResponseFactory,
    mockSolarSearchSdk,
    boardProjectResponseFactory,
    cSolutionProjectFactory,
    uvProjectFactory,
    getAllDevicesResponseFactory,
    getDeviceResponseFactory,
    getAllBoardsResponseFactory,
    getAllBoardsWithDetailsResponseFactory,
} from './graphql/sdk.factories';
import { Board, SolarSearchClientImpl } from './solar-search-client';

describe('SolarSearchClient', () => {
    describe('getExamplesForBoard', () => {
        it('returns an empty list if there are no boards returned', async () => {
            const sdk =  mockSolarSearchSdk();
            sdk.getBoard.mockResolvedValue(boardResponseFactory({ results: [] }));
            const client = new SolarSearchClientImpl(sdk);

            const examples = await client.getExamplesForBoard('some-board', 'some-vendor', 'some-revision');

            expect(sdk.getBoard).toHaveBeenCalledWith({ name: 'some-board', vendor: 'some-vendor', revision: 'some-revision' });
            expect(sdk.getBoardProjects).not.toHaveBeenCalled();
            expect(examples).toStrictEqual([]);
        });

        it('returns an empty list if when the board example project count is 0', async () => {
            const sdk =  mockSolarSearchSdk();
            sdk.getBoard.mockResolvedValue(boardResponseFactory({ results: [ { id: 'some-board-id', example_projects_count: 0 } ] }));
            const client = new SolarSearchClientImpl(sdk);

            const examples = await client.getExamplesForBoard('some-board', 'some-vendor', 'some-revision');

            expect(sdk.getBoard).toHaveBeenCalledWith({ name: 'some-board', vendor: 'some-vendor', revision: 'some-revision' });
            expect(sdk.getBoardProjects).not.toHaveBeenCalled();
            expect(examples).toStrictEqual([]);
        });

        it('returns a list of compatible examples for the board', async () => {
            const csolutionExample = cSolutionProjectFactory();
            const validUvProjExample = uvProjectFactory({ convertible: true });
            const invalidUvProjExample = uvProjectFactory({ convertible: false });
            const boardProjects = [csolutionExample, invalidUvProjExample, validUvProjExample];
            const sdk =  mockSolarSearchSdk();
            sdk.getBoard.mockResolvedValue(boardResponseFactory({ results: [ { id: 'some-board-id', example_projects_count: 3 } ] }));
            sdk.getBoardProjects.mockResolvedValue(boardProjectResponseFactory({ boardProjects }));
            const client = new SolarSearchClientImpl(sdk);

            const examples = await client.getExamplesForBoard('some-board', 'some-vendor', 'some-revision');

            expect(sdk.getBoard).toHaveBeenCalledWith({ name: 'some-board', vendor: 'some-vendor', revision: 'some-revision' });
            expect(sdk.getBoardProjects).toHaveBeenCalledWith({ boardId: 'some-board-id', offset: 0, limit: SolarSearchClientImpl.PAGE_SIZE });
            expect(examples).toStrictEqual([
                {
                    name: csolutionExample.name,
                    description: csolutionExample.description,
                    format: { type: 'csolution' },
                    download_url: csolutionExample.download_url,
                    id: csolutionExample.id,
                },
                {
                    name: validUvProjExample.name,
                    description: validUvProjExample.description,
                    format: { type: 'uvproj', convertible: true },
                    download_url: validUvProjExample.download_url,
                    id: validUvProjExample.id,
                }
            ]);
        });

        it('paginates over the responses until it has gotten all projects', async () => {
            const exampleProjectsCountForBoard = SolarSearchClientImpl.PAGE_SIZE * 2;
            const boardProjectsPage1 = faker.helpers.multiple(() => cSolutionProjectFactory(), { count: SolarSearchClientImpl.PAGE_SIZE });
            const boardProjectsPage2 = faker.helpers.multiple(() => cSolutionProjectFactory(), { count: SolarSearchClientImpl.PAGE_SIZE });
            const sdk =  mockSolarSearchSdk();
            sdk.getBoard.mockResolvedValue(boardResponseFactory({ results: [ { id: 'some-board-id', example_projects_count: exampleProjectsCountForBoard } ] }));
            sdk.getBoardProjects.mockResolvedValueOnce(boardProjectResponseFactory({ boardProjects: boardProjectsPage1 }));
            sdk.getBoardProjects.mockResolvedValueOnce(boardProjectResponseFactory({ boardProjects: boardProjectsPage2 }));
            const client = new SolarSearchClientImpl(sdk);

            const examples = await client.getExamplesForBoard('some-board', 'some-vendor', 'some-revision');

            expect(sdk.getBoardProjects).toHaveBeenCalledTimes(2);
            expect(sdk.getBoardProjects).toHaveBeenCalledWith({ boardId: 'some-board-id', offset: 0, limit: SolarSearchClientImpl.PAGE_SIZE });
            expect(sdk.getBoardProjects).toHaveBeenCalledWith({ boardId: 'some-board-id', offset: SolarSearchClientImpl.PAGE_SIZE, limit: SolarSearchClientImpl.PAGE_SIZE });
            expect(examples).toHaveLength(exampleProjectsCountForBoard);
        });
    });

    describe('getAllBoards', () => {
        it('returns an empty list if there are no boards returned', async () => {
            const sdk =  mockSolarSearchSdk();
            sdk.getAllBoards.mockResolvedValue(getAllBoardsResponseFactory());
            const client = new SolarSearchClientImpl(sdk);

            const boards = await client.getAllBoards();

            expect(sdk.getAllBoards).toHaveBeenCalledTimes(1);
            expect(boards).toStrictEqual([]);
        });

        it('returns all boards', async () => {
            const sdk =  mockSolarSearchSdk();
            const query = getAllBoardsResponseFactory({ boards: [{}], repeat: 3 });
            sdk.getAllBoards.mockResolvedValue(query);
            const client = new SolarSearchClientImpl(sdk);

            const boards = await client.getAllBoards();
            const expectedBoards: Board[] = query.boards.map(b => ({
                boardId: b.id,
                boardName: b.name,
                boardRev: b.revision || undefined,
                packFamilyId: b.cmsis?.pack_family_id,
                packVersion: b.cmsis?.cmsis_pack_id.version,
                vendorName: b.vendor.name,
            }));

            expect(sdk.getAllBoards).toHaveBeenCalledTimes(1);
            expect(boards).toEqual(expect.objectContaining(expectedBoards));
        });

        it('filters boards non-originating to a pack', async () => {
            const sdk =  mockSolarSearchSdk();
            const query = getAllBoardsResponseFactory({ boards: [{}, { pack_family_id: null }], repeat: 3 });
            sdk.getAllBoards.mockResolvedValue(query);
            const client = new SolarSearchClientImpl(sdk);

            const boards = await client.getAllBoards();
            const expectedBoards: Board[] = query.boards
                .filter(b => b.cmsis !== null)
                .map(b => ({
                    boardId: b.id,
                    boardName: b.name,
                    boardRev: b.revision || undefined,
                    packFamilyId: b.cmsis?.pack_family_id,
                    packVersion: b.cmsis?.cmsis_pack_id.version,
                    vendorName: b.vendor.name,
                }));

            expect(sdk.getAllBoards).toHaveBeenCalledTimes(1);
            expect(boards).toEqual(expect.objectContaining(expectedBoards));
        });
    });

    describe('getAllBoardsWithDetails', () => {
        it('returns all boards', async () => {
            const sdk =  mockSolarSearchSdk();
            const query = getAllBoardsWithDetailsResponseFactory({ boards: [{}], repeat: 3 });
            sdk.getAllBoardsWithDetails.mockResolvedValue(query);
            const client = new SolarSearchClientImpl(sdk);

            const boards = await client.getAllBoardsWithDetails();
            const expectedBoards: Board[] = query.boards.map(b => ({
                boardId: b.id,
                boardName: b.name,
                boardRev: b.revision || undefined,
                packFamilyId: b.cmsis?.pack_family_id,
                packVersion: b.cmsis?.cmsis_pack_id.version,
                vendorName: b.vendor.name,
                description: b.description || undefined,
                mountedDevices: b.devices.map(d => ({ deviceId: d.id, deviceName: d.name, vendorName: d.vendor.name })),
            }));

            expect(sdk.getAllBoardsWithDetails).toHaveBeenCalledTimes(1);
            expect(boards).toStrictEqual(expectedBoards);
        });
    });

    describe('getAllDevices', () => {
        it('returns an empty list if there are no devices returned', async () => {
            const sdk =  mockSolarSearchSdk();
            sdk.getAllDevices.mockResolvedValue(getAllDevicesResponseFactory());
            const client = new SolarSearchClientImpl(sdk);

            const devices = await client.getAllDevices();

            expect(sdk.getAllDevices).toHaveBeenCalledWith({ offset: 0, limit: 0 });
            expect(devices).toStrictEqual([]);
        });

        it('returns all devices', async () => {
            const sdk =  mockSolarSearchSdk();
            const expectedDevices = [
                {
                    vendorName: 'MyVendorA',
                    familyName: 'MyFamily',
                    subfamilyName: 'MySubFamily',
                    deviceId: 'mydeviceA',
                    deviceName: 'MyDeviceA'
                },
                {
                    vendorName: 'MyVendorA',
                    familyName: 'MyFamily',
                    deviceId: 'mydeviceB',
                    deviceName: 'MyDeviceB'
                },
                {
                    vendorName: 'MyVendorB',
                    familyName: 'MyFamilyB',
                    subfamilyName: 'MySubFamilyB',
                    deviceId: 'mydeviceC',
                    deviceName: 'MyDeviceC'
                }
            ];
            const query = getAllDevicesResponseFactory({ devices: expectedDevices });
            sdk.getAllDevices.mockResolvedValue(query);
            for (const d of expectedDevices) {
                sdk.getDevice.mockResolvedValueOnce(getDeviceResponseFactory(d));
            }
            const client = new SolarSearchClientImpl(sdk);

            const devices = await client.getAllDevices();

            expect(sdk.getAllDevices).toHaveBeenCalledWith({ offset: 0, limit: 0 });
            expect(sdk.getAllDevices).toHaveBeenCalledWith({ offset: 0, limit: SolarSearchClientImpl.PAGE_SIZE });
            expect(devices).toHaveLength(expectedDevices.length);
            expect(devices).toEqual(
                expect.arrayContaining(
                    expectedDevices.map(d => expect.objectContaining(d))
                )
            );
        });

        it('paginates over the responses until it has gotten all devices', async () => {
            const sdk =  mockSolarSearchSdk();

            const total = SolarSearchClientImpl.PAGE_SIZE * 2 - 1;
            sdk.getAllDevices.mockResolvedValueOnce(getAllDevicesResponseFactory({ devices: [{}], total }));
            sdk.getAllDevices.mockResolvedValueOnce(getAllDevicesResponseFactory({ devices: [{}], repeat: SolarSearchClientImpl.PAGE_SIZE, total }));
            sdk.getAllDevices.mockResolvedValueOnce(getAllDevicesResponseFactory({ devices: [{}], repeat: SolarSearchClientImpl.PAGE_SIZE - 1, total }));
            sdk.getDevice.mockResolvedValue(getDeviceResponseFactory());
            const client = new SolarSearchClientImpl(sdk);

            const devices = await client.getAllDevices();

            expect(sdk.getAllDevices).toHaveBeenCalledTimes(3);
            expect(sdk.getAllDevices).toHaveBeenCalledWith({ offset: 0, limit: 0 });
            expect(sdk.getAllDevices).toHaveBeenCalledWith({ offset: 0, limit: SolarSearchClientImpl.PAGE_SIZE });
            expect(sdk.getAllDevices).toHaveBeenCalledWith({ offset: SolarSearchClientImpl.PAGE_SIZE, limit: SolarSearchClientImpl.PAGE_SIZE });
            expect(devices).toHaveLength(total);
        });
    });
});
