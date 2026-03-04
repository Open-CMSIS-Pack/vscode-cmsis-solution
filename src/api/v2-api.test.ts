/**
 * Copyright 2024-2026 Arm Limited
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

import * as vscode from 'vscode';

import { faker } from '@faker-js/faker';
import { CsolutionApiV2 } from '../../api/csolution-api-v2';
import { BoardData } from '../data-manager/board-data';
import { boardDataFactory, dataManagerFactory, deviceDataFactory, deviceIdFactory, draftProjectDataFactory, MockDataManager } from '../data-manager/data-manager.factories';
import { DataSet } from '../data-manager/dataset';
import { DeviceData } from '../data-manager/device-data';
import { DraftProjectData } from '../data-manager/draft-project-data';
import { SolutionCreator } from '../solutions/solution-creator';
import { createdSolutionFactory } from '../solutions/solution-creator.factories';
import { BuildTaskDefinition } from '../tasks/build/build-task-definition';
import { BuildTaskProvider, BuildTaskProviderImpl } from '../tasks/build/build-task-provider';
import { NewSolutionMessage } from '../views/create-solutions/messages';
import { CsolutionApiV2Impl } from './v2-api';

describe('CsolutionApiV2Impl', () => {

    let mockDataManager: MockDataManager;
    let mockSolutionCreator:  jest.Mocked<SolutionCreator>;
    let mockBuildTaskProvider: jest.Mocked<BuildTaskProvider>;

    let api: CsolutionApiV2;

    beforeEach(() => {
        mockDataManager = dataManagerFactory();
        mockSolutionCreator = { createSolution: jest.fn() };
        mockBuildTaskProvider = {
            createTask: jest.fn(),
            terminateTask: jest.fn().mockReturnValue(false),
            getActiveTaskRunner: jest.fn().mockReturnValue(undefined)
        };

        api = new CsolutionApiV2Impl(mockDataManager, mockSolutionCreator, mockBuildTaskProvider);
    });

    it('getBoards', async () => {
        const data = new DataSet<BoardData>();

        data.add(boardDataFactory());
        data.add(boardDataFactory());

        mockDataManager.getAllBoards.mockResolvedValue(data);

        const boards = await api.getBoards();

        expect(boards).toEqual(data.toArray());
        expect(mockDataManager.getAllBoards).toHaveBeenCalledWith(false);
    });

    it('getBoards with board vendor filter', async () => {
        const data = new DataSet<BoardData>();

        const aBoard = boardDataFactory();
        data.add(boardDataFactory());
        data.add(boardDataFactory());
        data.add(aBoard);
        data.add(boardDataFactory());

        mockDataManager.getAllBoards.mockResolvedValue(data);

        const boards = await api.getBoards({ vendor: aBoard.vendor });

        expect(boards).toEqual([aBoard]);
        expect(mockDataManager.getAllBoards).toHaveBeenCalledWith(false);
    });

    it('getBoards with mounted device vendor filter', async () => {
        const data = new DataSet<BoardData>();

        const deviceId = deviceIdFactory();
        const aBoard = boardDataFactory({ devices: Promise.resolve([deviceId]) });
        data.add(boardDataFactory());
        data.add(boardDataFactory());
        data.add(aBoard);
        data.add(boardDataFactory());

        mockDataManager.getAllBoards.mockResolvedValue(data);

        const boards = await api.getBoards({ mountedDevice: { vendor: deviceId.vendor } });

        expect(boards).toEqual([aBoard]);
        expect(mockDataManager.getAllBoards).toHaveBeenCalledWith(true);
    });

    it('getDevices', async () => {
        const data = new DataSet<DeviceData>();

        data.add(deviceDataFactory());
        data.add(deviceDataFactory());

        mockDataManager.getAllDevices.mockResolvedValue(data);

        const devices = await api.getDevices();

        expect(devices).toEqual(data.toArray());
    });

    it('getDevices with vendor filter', async () => {
        const data = new DataSet<DeviceData>();

        const aDevice = deviceDataFactory();
        data.add(deviceDataFactory());
        data.add(aDevice);
        data.add(deviceDataFactory());
        data.add(deviceDataFactory());

        mockDataManager.getAllDevices.mockResolvedValue(data);

        const devices = await api.getDevices({ vendor: aDevice.vendor });

        expect(devices).toEqual([aDevice]);
    });

    it('getDevices with name pattern', async () => {
        const data = new DataSet<DeviceData>();

        const PREFIX = 'MyFamily-' as const;
        const aDevice = deviceDataFactory({ name: PREFIX + faker.word.noun() });
        const anotherDevice = deviceDataFactory({ name: PREFIX + faker.word.noun() });

        data.add(deviceDataFactory());
        data.add(aDevice);
        data.add(deviceDataFactory());
        data.add(anotherDevice);

        mockDataManager.getAllDevices.mockResolvedValue(data);

        const devices = await api.getDevices({ name: PREFIX });

        expect(devices).toEqual([aDevice, anotherDevice]);
    });

    it('getDraftProjects', async () => {
        const data = new DataSet<DraftProjectData>();

        data.add(draftProjectDataFactory());
        data.add(draftProjectDataFactory());

        mockDataManager.getDraftProjects.mockResolvedValue(data);

        const drafts = await api.getDraftProjects();

        expect(drafts).toEqual(data.toArray());
    });

    it('createNewSolution', async () => {
        const device = deviceDataFactory();
        const devicePack = await device.pack;
        const board = boardDataFactory({ devices: Promise.resolve([ device.id ]) });
        const boardPack = await board.pack;
        const draft = draftProjectDataFactory();
        const options: CsolutionApiV2.CreateNewSolutionOptions = {
            device: device as CsolutionApiV2.DeviceData,
            board: board as CsolutionApiV2.BoardData,
            draft: draft as CsolutionApiV2.DraftProjectData,
            folder: '/path/to/newSolutionFolder',
        };

        mockSolutionCreator.createSolution.mockResolvedValue(createdSolutionFactory());

        await api.createNewSolution(options);

        const expectedMessage: NewSolutionMessage = {
            type: 'NEW_SOLUTION',
            solutionName: '',
            projects: [],
            targetTypes: [{
                type: board.name,
                device: device.id.key,
                board: board.id.key,
            }],
            packs: expect.arrayContaining([{
                pack: `${devicePack?.vendor}::${devicePack?.name}`,
                forContext: '',
                notForContext: ''
            }, {
                pack: `${boardPack?.vendor}::${boardPack?.name}`,
                forContext: '',
                notForContext: ''
            }]),
            gitInit: false,
            solutionLocation: options.folder,
            solutionFolder: '',
            compiler: '',
            selectedTemplate: expect.objectContaining({
                type: 'dataManagerApp',
            }),
            dataManagerObject: draft,
        };

        expect(mockSolutionCreator.createSolution).toHaveBeenCalledWith(expectedMessage);
    });

    it('build', async () => {
        const options: CsolutionApiV2.BuildOptions = {
            clean: false,
            rebuild: false,
            updateRte: false,
            packs: false
        };

        const task = {} as jest.Mocked<vscode.Task>;

        mockBuildTaskProvider.createTask.mockReturnValue(task);
        const executeTaskMock = jest.spyOn(vscode.tasks, 'executeTask');
        const taskExecutionMock = {} as vscode.TaskExecution;
        executeTaskMock.mockResolvedValue(taskExecutionMock);

        const result = api.build(options);

        const expectedTaskDefinition: BuildTaskDefinition = {
            type: BuildTaskProviderImpl.taskType,
            clean: false,
            rebuild: false,
            downloadPacks: false,
            updateRte: false,
        };
        expect(result).resolves.toEqual(taskExecutionMock);
        expect(executeTaskMock).toHaveBeenCalledWith(task);
        expect(mockBuildTaskProvider.createTask).toHaveBeenCalledWith(expectedTaskDefinition);
    });
});
