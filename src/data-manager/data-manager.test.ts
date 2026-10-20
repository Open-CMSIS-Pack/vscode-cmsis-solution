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

import { when } from 'jest-when';

import { DataManager } from './data-manager';
import { DeviceData, DeviceId, SolarDeviceData } from './device-data';
import { boardFactory, cSolutionExampleFactory, deviceFactory, deviceIdFactory, mockSolarSearchClient, uvProjExampleFactory } from '../solar-search/solar-search-client.factories';
import { CsolutionDataSource, SolarDataSource } from './data-source';
import { csolutionServiceFactory } from '../json-rpc/csolution-rpc-client.factory';
import { deviceDataFactory, draftProjectDataFactory, dataSourceFactory, generateDeviceData, generateDraftProjectData, boardDataFactory } from './data-manager.factories';
import { faker } from '@faker-js/faker';
import { buildTreeViewCategories, sortTreeViewCategories } from '../views/common/components/tree-view-builder';
import { TreeViewCategory, TreeViewItem } from '../views/common/components/tree-view';
import { BoardData, BoardId, SolarBoardData } from './board-data';
import { DraftProjectFormat, DraftProjectData, DraftProjectId, DraftProjectSource, DraftProjectType } from './draft-project-data';
import * as packIndex from '../packs/index-pidx-file';
import * as pathUtils from '../utils/path-utils';
import * as fsUtils from '../utils/fs-utils';

describe('pack discovery', () => {
    beforeEach(() => {
        jest.spyOn(packIndex, 'getLatestAvailablePacks').mockResolvedValue(new Map([
            ['ARM::CMSIS@6.0.0', ''], ['Other::Latest@1.0.0', ''],
        ]));
    });

    afterEach(() => jest.restoreAllMocks());

    function setup() {
        const solar = mockSolarSearchClient();
        const rpc = csolutionServiceFactory();
        const manager = new DataManager(new SolarDataSource(solar), new CsolutionDataSource(rpc));
        return { solar, rpc, manager };
    }

    it('uses the RPC pack root for the available-pack index', async () => {
        const { rpc, manager } = setup();
        rpc.getPackRoot.mockReturnValue('/configured/packs');
        rpc.getPacksInfo.mockResolvedValue({ success: true, packs: [] });

        await manager.getPacks();

        expect(packIndex.getLatestAvailablePacks).toHaveBeenCalledWith('/configured/packs');
    });

    it('merges latest indexed packs with installed packs and local descriptions', async () => {
        const { rpc, manager } = setup();
        rpc.getPacksInfo.mockResolvedValue({ success: true, packs: [
            { id: 'ARM::CMSIS@6.0.0', description: 'Local description', references: [{ pack: 'ARM::CMSIS', resolvedPack: 'ARM::CMSIS@6.0.0', path: '/packs/CMSIS', origin: '', selected: false }] },
            { id: 'ARM::CMSIS@5.9.0' },
            { id: 'Local::Private@1.0.0' },
        ] });
        const result = await manager.getPacks();
        expect(result.packs).toEqual([
            expect.objectContaining({ id: 'ARM::CMSIS@5.9.0', installed: true, version: '5.9.0' }),
            expect.objectContaining({ id: 'ARM::CMSIS@6.0.0', installed: true, path: '/packs/CMSIS', description: 'Local description' }),
            expect.objectContaining({ id: 'Local::Private@1.0.0', installed: true }),
            expect.objectContaining({ id: 'Other::Latest@1.0.0', installed: false }),
        ]);
        expect(result).toEqual({ packs: result.packs });
        expect(rpc.getPacksInfo).toHaveBeenCalledWith({ context: '', all: true });
        expect(rpc.loadSolution).not.toHaveBeenCalled();
        expect(JSON.parse(JSON.stringify(result))).toStrictEqual(result);
    });

    it('queries only RPC for installed scope and accepts empty installations', async () => {
        const { rpc, manager } = setup();
        rpc.getPacksInfo.mockResolvedValue({ success: true, packs: [] });
        expect(await manager.getPacks('installed')).toEqual({ packs: [] });
        expect(manager.errors).toEqual([]);
        expect(packIndex.getLatestAvailablePacks).not.toHaveBeenCalled();
        rpc.getPacksInfo.mockResolvedValue({ success: false, message: 'backend failure', packs: [] });
        await expect(manager.getPacks('installed')).rejects.toThrow('backend failure');
        expect(manager.errors).toEqual(['Error: backend failure']);
        await expect(manager.getPacks('used' as 'all')).rejects.toThrow('Unsupported pack scope');
        await expect(manager.getPacks('available' as 'all')).rejects.toThrow('Unsupported pack scope');
    });

    it('returns partial catalog with unknown installation status on RPC failure', async () => {
        const { rpc, manager } = setup();
        rpc.getPacksInfo.mockRejectedValue(new Error('secret backend detail'));
        const partial = await manager.getPacks();
        expect(partial.packs[0].installed).toBeUndefined();
        expect(partial).toEqual({ packs: partial.packs });
        expect(manager.errors).toEqual(['Error: secret backend detail']);
        expect(JSON.stringify(partial)).not.toContain('secret');
        rpc.getPacksInfo.mockResolvedValue({ success: true, packs: [{ id: 'ARM::CMSIS@6.0.0' }] });
        await manager.getPacks('installed');
        expect(manager.errors).toEqual([]);
        jest.mocked(packIndex.getLatestAvailablePacks).mockRejectedValueOnce(new Error('index unavailable'));
        const [all, installed] = await Promise.all([manager.getPacks(), manager.getPacks('installed')]);
        expect(all.packs[0].installed).toBe(true);
        expect(all).toEqual(installed);
        rpc.getPacksInfo.mockRejectedValue(undefined);
        jest.mocked(packIndex.getLatestAvailablePacks).mockRejectedValueOnce(new Error('index unavailable'));
        await expect(manager.getPacks()).rejects.toThrow('No pack catalog source succeeded');
        expect(manager.errors).toEqual(['Error: index unavailable', 'undefined']);
    });

    it('rejects when the index is missing and RPC fails', async () => {
        jest.restoreAllMocks();
        jest.spyOn(pathUtils, 'getCmsisPackRoot').mockReturnValue('/mock/pack/root');
        jest.spyOn(fsUtils, 'fileExists').mockReturnValue(false);
        const { rpc, manager } = setup();
        rpc.getPacksInfo.mockRejectedValue(new Error('RPC unavailable'));

        await expect(manager.getPacks()).rejects.toThrow('No pack catalog source succeeded');
        expect(manager.errors).toEqual([
            expect.stringContaining('Failed to load pack index'),
            'Error: RPC unavailable',
        ]);
    });

    it('retains indexed packs with unknown installation status when an RPC pack ID is malformed', async () => {
        const { rpc, manager } = setup();
        rpc.getPacksInfo.mockResolvedValue({ success: true, packs: [
            { id: 'ARM::CMSIS@6.0.0' },
            { id: 'malformed' },
        ] });

        expect(await manager.getPacks()).toEqual({ packs: [
            { id: 'ARM::CMSIS@6.0.0', version: '6.0.0' },
            { id: 'Other::Latest@1.0.0', version: '1.0.0' },
        ] });
        expect(manager.errors).toEqual(['Error: Invalid pack ID format: malformed']);
        await expect(manager.getPacks('installed')).rejects.toThrow('Invalid pack ID format: malformed');
    });

    it('reads index even when Solar is disabled', async () => {
        const solar = mockSolarSearchClient();
        const rpc = csolutionServiceFactory();
        rpc.getPacksInfo.mockResolvedValue({ success: true, packs: [] });
        const manager = new DataManager(new SolarDataSource(solar, () => false), new CsolutionDataSource(rpc));
        expect((await manager.getPacks()).packs).toHaveLength(2);
        expect((await new DataManager().getPacks()).packs).toHaveLength(2);
    });
});

async function deviceDataExtractor(data: DeviceData) : Promise<DeviceData> {
    await Promise.all([data.pack, data.memories, data.processors, data.description]);
    return {
        id: data.id,
        vendor: data.vendor,
        name: data.name,
        family: data.family,
        subfamily: data.subfamily,
        pack: data.pack,
        memories: data.memories,
        processors: data.processors,
        description: data.description,
    };
}

async function boardDataExtractor(data: BoardData) : Promise<BoardData> {
    await Promise.all([data.description, data.devices, data.debugInterfaces, data.pack, data.image]);
    return {
        id: data.id,
        vendor: data.vendor,
        name: data.name,
        revision: data.revision,
        description: data.description,
        devices: data.devices,
        debugInterfaces: data.debugInterfaces,
        pack: data.pack,
        image: data.image,
    };
}


function generateDeviceTree(devices: DeviceData[]) {
    return buildTreeViewCategories(devices, d => ({ label: d.name, value: d.id }), d => d.vendor, d => d.family);
}

function generateDraftTree(drafts: DraftProjectData[]) {
    const draftCategory = (draft: DraftProjectData) : string => {
        switch (draft.draftType) {
            case 'Example':
                switch (draft.format) {
                    case 'Csolution':
                        return 'Csolution Examples';
                    case 'uVision':
                        return 'uVision Examples';
                }
                return 'Other Examples';
            case 'Reference Application':
                return 'Reference Applications';
            case 'Template':
                return 'Templates';
        }
        return 'Other';
    };

    return buildTreeViewCategories(drafts, d => ({ label: d.name, value: d.id, tooltip: d.description }), d => d.draftSource, draftCategory);
}

describe('Tree View', () => {
    it('Generate device tree view data', () => {
        const optionsA1 = { vendor: faker.word.words(2), family: faker.word.noun(), subfamily: faker.word.noun() };
        const optionsA2 = { ...optionsA1, subfamily: faker.word.noun() };
        const optionsA3 = { ...optionsA1, family: faker.word.noun(), subfamily: faker.word.noun() };
        const optionsB1 = { vendor: faker.word.words(2), family: faker.word.noun(), subfamily: faker.word.noun() };
        const optionsB2 = { ...optionsB1, subfamily: '' };

        const devices: DeviceData[] = [
            generateDeviceData(3, optionsA1), // vendorA, family1, subfamily1.1
            generateDeviceData(2, optionsA2), // vendorA, family1, subfamily1.2
            generateDeviceData(4, optionsA3), // vendorA, family2, subfamily2.1
            generateDeviceData(2, optionsB1), // vendorB, family3, subfamily3.1
            generateDeviceData(7, optionsB2), // vendorB, family3
        ].flat();

        const items = devices.map(d => ({ label: d.name, value: d.id }));

        const expectedTree: TreeViewCategory<DeviceId>[] = [
            {
                header: optionsA1.vendor, items: [], categories: [
                    {
                        header: optionsA1.family, items: items.slice(0, 5), categories: []
                    },
                    {
                        header: optionsA3.family, items: items.slice(5, 9), categories: []
                    },
                ]
            },
            {
                header: optionsB1.vendor, items: [], categories: [
                    {
                        header: optionsB1.family, items: items.slice(9, 18), categories: []
                    },
                ]
            },
        ];

        const tree = generateDeviceTree(devices);

        expect(tree).toEqual(sortTreeViewCategories(expectedTree));
    });

    it('Generate draft project tree view data', () => {
        const drafts = generateDraftProjectData(20);

        const tree = generateDraftTree(drafts);

        const draftItems = (source: DraftProjectSource, type: DraftProjectType, format: DraftProjectFormat) : TreeViewItem<DraftProjectId>[] => {
            return drafts.filter(d => d.draftSource === source)
                .filter(d => d.draftType === type)
                .filter(d => d.format === format)
                .map(d => ({ label: d.name, value: d.id, tooltip: d.description }));
        };

        let expectedTree: TreeViewCategory<DraftProjectId>[] = [
            {
                header: 'Local', items: [], categories: [
                    {
                        header: 'Csolution Examples', categories: [], items: draftItems(DraftProjectSource.Local, DraftProjectType.Example, DraftProjectFormat.Csolution),
                    },
                    {
                        header: 'uVision Examples', categories: [], items: draftItems(DraftProjectSource.Local, DraftProjectType.Example, DraftProjectFormat.uVision),
                    },
                    {
                        header: 'Other Examples', categories: [], items: draftItems(DraftProjectSource.Local, DraftProjectType.Example, DraftProjectFormat.Other),
                    },
                    {
                        header: 'Reference Applications', categories: [], items: draftItems(DraftProjectSource.Local, DraftProjectType.RefApp, DraftProjectFormat.Csolution),
                    },
                    {
                        header: 'Templates', categories: [], items: draftItems(DraftProjectSource.Local, DraftProjectType.Template, DraftProjectFormat.Csolution),
                    }
                ],
            },
            {
                header: 'Web', items: [], categories: [
                    {
                        header: 'Csolution Examples', categories: [], items: draftItems(DraftProjectSource.Web, DraftProjectType.Example, DraftProjectFormat.Csolution),
                    },
                    {
                        header: 'uVision Examples', categories: [], items: draftItems(DraftProjectSource.Web, DraftProjectType.Example, DraftProjectFormat.uVision),
                    },
                    {
                        header: 'Other Examples', categories: [], items: draftItems(DraftProjectSource.Web, DraftProjectType.Example, DraftProjectFormat.Other),
                    },
                    {
                        header: 'Reference Applications', categories: [], items: draftItems(DraftProjectSource.Web, DraftProjectType.RefApp, DraftProjectFormat.Csolution),
                    },
                    {
                        header: 'Templates', categories: [], items: draftItems(DraftProjectSource.Web, DraftProjectType.Template, DraftProjectFormat.Csolution),
                    }
                ],
            }
        ];

        expectedTree.forEach(c =>
            c.categories = c.categories
                .filter(cc => cc.items.length > 0)
                .map(cc => ({ ...cc, items: expect.arrayContaining(cc.items) }))
        );
        expectedTree = expectedTree
            .filter(c => c.categories.length > 0)
            .map(c => ({ ...c, categories: expect.arrayContaining(c.categories) }));

        expect(tree).toEqual(expectedTree);

    });
});

describe('DataManager', () => {
    describe('getAllDevices', () => {
        it('returns an empty set if there are no data sources connected', async () => {
            const dataManager = new DataManager();
            const devices = await dataManager.getAllDevices();
            expect(devices.size).toEqual(0);
        });

        it('returns an empty set if the data source is failing', async () => {
            const dataSource = dataSourceFactory();
            const dataManager = new DataManager(dataSource);

            dataSource.getAllDevices.mockRejectedValue('Data source not accessible!');

            const devices = await dataManager.getAllDevices();
            expect(devices.size).toEqual(0);
        });

        it('returns partial data if some data sources are failing', async () => {
            const dataSourceA = dataSourceFactory();
            const dataSourceB = dataSourceFactory();
            const dataManager = new DataManager(dataSourceA, dataSourceB);
            const deviceData = [ deviceDataFactory() ];

            dataSourceA.getAllDevices.mockRejectedValue('Data source not accessible!');
            dataSourceB.getAllDevices.mockResolvedValue(deviceData);

            const devices = await dataManager.getAllDevices();
            expect(devices.size).toEqual(deviceData.length);
        });

        it('returns devices from solar client', async () => {
            const sDeviceIds = [
                deviceIdFactory(),
                deviceIdFactory(),
            ];
            const sDevices = sDeviceIds.map(deviceFactory);
            const solarClient = mockSolarSearchClient();
            solarClient.getAllDevices.mockResolvedValue(sDeviceIds);

            sDevices.forEach(d =>
                when(solarClient.getDeviceDetails)
                    .calledWith(d.deviceId)
                    .mockResolvedValue(d)
            );

            const solarDataSource = new SolarDataSource(solarClient);
            const dataManager = new DataManager(solarDataSource);
            const devices = await dataManager.getAllDevices();

            const receivedDevices = await Promise.all(devices.map(deviceDataExtractor));
            const expectedDevices = await Promise.all(
                sDevices.map(d => deviceDataExtractor(new SolarDeviceData(d)))
            );

            expect(solarClient.getAllDevices).toHaveBeenCalledTimes(1);

            expect(receivedDevices.length).toBe(sDeviceIds.length);
            expect(receivedDevices).toEqual(
                expect.arrayContaining(expectedDevices)
            );
        });
    });

    describe('getAllBoards', () => {
        it('returns an empty set if there are no search clients connected', async () => {
            const dataManager = new DataManager();
            const boards = await dataManager.getAllBoards();
            expect(boards.size).toEqual(0);
        });

        it('returns an empty set if the data source is failing', async () => {
            const dataSource = dataSourceFactory();
            const dataManager = new DataManager(dataSource);

            dataSource.getAllBoards.mockRejectedValue('Data source not accessible!');

            const boards = await dataManager.getAllBoards();
            expect(boards.size).toEqual(0);
        });

        it('returns partial data if some data sources are failing', async () => {
            const dataSourceA = dataSourceFactory();
            const dataSourceB = dataSourceFactory();
            const dataManager = new DataManager(dataSourceA, dataSourceB);
            const boardData = [ boardDataFactory() ];

            dataSourceA.getAllBoards.mockRejectedValue('Data source not accessible!');
            dataSourceB.getAllBoards.mockResolvedValue(boardData);

            const boards = await dataManager.getAllBoards();
            expect(boards.size).toEqual(boardData.length);
        });

        it('returns boards from solar client', async () => {
            const sBoards = [
                boardFactory(),
                boardFactory(),
            ];
            const solarClient = mockSolarSearchClient();
            solarClient.getAllBoards.mockResolvedValue(sBoards);

            sBoards.forEach(b =>
                when(solarClient.getBoardDetails)
                    .calledWith(b.boardId)
                    .mockResolvedValue(b)
            );

            const solarDataSource = new SolarDataSource(solarClient);
            const dataManager = new DataManager(solarDataSource);
            const boards = await dataManager.getAllBoards();

            expect(solarClient.getAllBoards).toHaveBeenCalledTimes(1);

            const receivedBoards = await Promise.all(boards.map(boardDataExtractor));
            const expectedBoards = await Promise.all(sBoards.map(b => boardDataExtractor(new SolarBoardData(b))));

            expect(receivedBoards.length).toBe(expectedBoards.length);
            expect(receivedBoards).toEqual(
                expect.arrayContaining(expectedBoards)
            );
        });
    });

    describe('getDraftProjects', () => {
        it('returns an empty set if there are no search clients connected', async () => {
            const dataManager = new DataManager();
            const boards = await dataManager.getDraftProjects();
            expect(boards.size).toEqual(0);
        });

        it('returns an empty set if the data source is failing', async () => {
            const dataSource = dataSourceFactory();
            const dataManager = new DataManager(dataSource);

            dataSource.getDraftProjects.mockRejectedValue('Data source not accessible!');

            const boards = await dataManager.getDraftProjects();
            expect(boards.size).toEqual(0);

            expect(dataManager.errors).toEqual(['Data source not accessible!']);
        });

        it('returns partial data if some data sources are failing', async () => {
            const dataSourceA = dataSourceFactory();
            const dataSourceB = dataSourceFactory();
            const dataManager = new DataManager(dataSourceA, dataSourceB);
            const draftProjectData = [ draftProjectDataFactory() ];

            dataSourceA.getDraftProjects.mockRejectedValue('Data source not accessible!');
            dataSourceB.getDraftProjects.mockResolvedValue(draftProjectData);

            const draftProjects = await dataManager.getDraftProjects();
            expect(draftProjects.size).toEqual(draftProjectData.length);

            expect(dataManager.errors).toEqual(['Data source not accessible!']);
        });

        it('returns draft projects from solar client', async () => {
            const solarClient = mockSolarSearchClient();

            const boardId = new BoardId(faker.word.noun(2), faker.word.noun(), faker.system.semver());
            const deviceId = new DeviceId(faker.word.noun(2),faker.word.noun());
            const cmsisExample = cSolutionExampleFactory();
            const uvExample = uvProjExampleFactory();
            solarClient.getExamplesForBoard.mockResolvedValue([cmsisExample, uvExample]);

            const solarDataSource = new SolarDataSource(solarClient);
            const dataManager = new DataManager(solarDataSource);

            const draftProjects = await dataManager.getDraftProjects(boardId, deviceId);

            const expectedProjects: DraftProjectData[] = [
                expect.objectContaining({
                    name: cmsisExample.name,
                    description: cmsisExample.description,
                    format: DraftProjectFormat.Csolution,
                    draftType: DraftProjectType.Example,
                    draftSource: DraftProjectSource.Web,
                    pack: undefined,
                }),
                expect.objectContaining({
                    name: uvExample.name,
                    description: uvExample.description,
                    format: DraftProjectFormat.uVision,
                    draftType: DraftProjectType.Example,
                    draftSource: DraftProjectSource.Web,
                    pack: undefined,
                }),
            ];

            expect(solarClient.getExamplesForBoard).toHaveBeenCalledTimes(1);
            expect(solarClient.getExamplesForBoard).toHaveBeenCalledWith(boardId.name, boardId.vendor, boardId.revision);
            expect(draftProjects.size).toEqual(expectedProjects.length);
            expect([...draftProjects]).toEqual(expect.arrayContaining(expectedProjects));
        });
    });
});
