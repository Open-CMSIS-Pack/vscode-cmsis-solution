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

import { CsolutionApiV2 } from '../../api/csolution-api-v2';
import { BoardData, BoardId } from '../data-manager/board-data';
import { DataManager } from '../data-manager/data-manager';
import { DeviceData, DeviceId } from '../data-manager/device-data';
import { DraftProjectData } from '../data-manager/draft-project-data';
import { PackReference } from '../solutions/parsing/common-file-parsing';
import { TargetType } from '../solutions/parsing/solution-file';
import { SolutionCreator } from '../solutions/solution-creator';
import { BuildTaskDefinition } from '../tasks/build/build-task-definition';
import { BuildTaskProvider, BuildTaskProviderImpl } from '../tasks/build/build-task-provider';
import { NewSolutionMessage } from '../views/create-solutions/messages';

function deviceFilterPredicate(filter: CsolutionApiV2.DeviceFilter) {
    return (device: DeviceId | DeviceData) => {
        let result = true;
        if (filter.vendor) {
            result &&= (device.vendor === filter.vendor);
        }
        if (filter.name) {
            const regex = new RegExp(filter.name);
            result &&= !!device.name.match(regex);
        }
        return result;
    };
}

async function boardFilterMatches(filter: CsolutionApiV2.BoardFilter, board: BoardId | BoardData) {
    let result = true;
    if (filter.vendor) {
        result &&= (board.vendor === filter.vendor);
    }
    if (filter.name) {
        const regex = new RegExp(filter.name);
        result &&= !!board.name.match(regex);
    }
    if (filter.revision) {
        const regex = new RegExp(filter.revision);
        result &&= !!board.revision?.match(regex);
    }
    if (('devices' in board) && filter.mountedDevice) {
        const devices = await board.devices;
        result &&= devices.some(deviceFilterPredicate(filter.mountedDevice));
    }
    return result;
}

function createPackReference(pack: CsolutionApiV2.PackId) {
    return {
        pack: `${pack.vendor}::${pack.name}`,
        forContext: '',
        notForContext: ''
    };
}

async function pushPackReference(packs: PackReference[], pack: Promise<CsolutionApiV2.PackId | undefined> | undefined) {
    const resolvedPack = await pack;
    if (resolvedPack) {
        packs.push(createPackReference(resolvedPack));
    }
}

async function newSolutionToNewSolutionMessage(options: CsolutionApiV2.CreateNewSolutionOptions): Promise<NewSolutionMessage> {
    const packs: PackReference[] = [];
    const targetTypes: TargetType[] = [];
    const board = options.board?.id;
    const device = options.device?.id ?? await options.board?.devices.then(d => d[0]);

    const type = board?.name ?? device?.name;
    if (type) {
        targetTypes.push({
            type: type,
            board: board?.key,
            device: device?.key,
        });
    }

    await pushPackReference(packs, options.board?.pack);
    await pushPackReference(packs, options.device?.pack);

    return {
        type: 'NEW_SOLUTION',
        solutionName: '',
        solutionLocation: options.folder,
        solutionFolder: '',
        compiler: '',
        projects: [],
        gitInit: options.git ?? false,
        targetTypes: targetTypes,
        packs: packs,
        selectedTemplate: {
            type: 'dataManagerApp',
            value: {
                name: options.draft.name,
                description: options.draft.description,
                objectId: options.draft.id.key,
                draftType: options.draft.draftType,
            },
        },
        dataManagerObject: options.draft as DraftProjectData,
    };
}

export class CsolutionApiV2Impl implements CsolutionApiV2 {

    constructor(
        private readonly dataManager: DataManager,
        private readonly solutionCreator: SolutionCreator,
        private readonly buildTaskProvider: BuildTaskProvider,
    ) {}

    public dispose() {
        // nothing to dispose
    }

    public async getBoards(filter?: CsolutionApiV2.BoardFilter) {
        const details = !!filter?.mountedDevice;
        const boards = await this.dataManager.getAllBoards(details);
        if (filter) {
            for (const board of boards) {
                const match = await boardFilterMatches(filter, board);
                if (!match) {
                    boards.delete(board);
                }
            }
        }
        return boards.toArray() as CsolutionApiV2.BoardData[];
    }

    public async getDevices(filter?: CsolutionApiV2.DeviceFilter) {
        const devices = await this.dataManager.getAllDevices();
        if (filter) {
            for (const device of devices) {
                const match = deviceFilterPredicate(filter)(device);
                if (!match) {
                    devices.delete(device);
                }
            }
        }
        return devices.toArray() as CsolutionApiV2.DeviceData[];
    }

    public async getDraftProjects(board?: CsolutionApiV2.BoardId, device?: CsolutionApiV2.DeviceId) {
        const drafts = await this.dataManager.getDraftProjects(board, device);
        return drafts.toArray() as CsolutionApiV2.DraftProjectData[];
    }

    public async createNewSolution(options: CsolutionApiV2.CreateNewSolutionOptions) {
        const message = await newSolutionToNewSolutionMessage(options);
        await this.solutionCreator.createSolution(message);
    }

    public build(options?: Partial<CsolutionApiV2.BuildOptions>) {
        const taskDefinition: BuildTaskDefinition = {
            type: BuildTaskProviderImpl.taskType,
            clean: !!options?.clean,
            rebuild: !!options?.rebuild,
            downloadPacks: !!options?.packs,
            updateRte: !!options?.updateRte,
        };
        const task = this.buildTaskProvider.createTask(taskDefinition);
        return vscode.tasks.executeTask(task);
    }

}
