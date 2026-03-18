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

import { Board, Device, PackFamilyId, SolarSearchClient } from '../solar-search/solar-search-client';
import { CsolutionDeviceData, DeviceData, DeviceId, SolarDeviceData } from './device-data';
import { BoardId, BoardData, SolarBoardData, CsolutionBoardData } from './board-data';
import { LazyPromise } from '../generic/lazy';
import { CsolutionExampleData, CsolutionTemplateData, DraftProjectData, DraftProjectType, SolarExampleData } from './draft-project-data';
import { CsolutionService } from '../json-rpc/csolution-rpc-client';

/**
 * A Data source to connect Data Manager to a specific data provider.
 */
export interface DataSource {
    /**
     * Whether the data source is enabled.
     * Disabled data sources are skipped.
     */
    get enabled(): boolean;

    /**
     * Get all available boards registered in pack index.
     * @param details - if true, include detailed information about boards
     * @returns A collection of all boards
     */
    getAllBoards(details: boolean): Promise<BoardData[]>;

    /**
     * Get all available devices registered in pack index.
     * @returns A collection of all devices
     */
    getAllDevices(): Promise<DeviceData[]>;

    /**
     * Search for draft projects matching the given board and/or device.
     * Draft projects can be downloadable web examples and examples,
     * reference applications, or templates shipped in a pack.
     * @param boardId Optional board id as a filter
     * @param deviceId Optional device id as a filter
     */
    getDraftProjects(boardId?: BoardId, deviceId?: DeviceId): Promise<DraftProjectData[]>;
}

abstract class BaseDataSource implements DataSource {

    constructor(
        private readonly _enabled: () => boolean = () => true,
    ) {}

    public get enabled(): boolean {
        return this._enabled();
    }

    abstract getAllBoards(details: boolean): Promise<BoardData[]>;
    abstract getAllDevices(): Promise<DeviceData[]>;
    abstract getDraftProjects(boardId?: BoardId, deviceId?: DeviceId): Promise<DraftProjectData[]>;
}

class DataSourceError<T> extends Error {
    constructor(
        message: string,
        public readonly cause: T,
    ) {
        super(message);
    }
}

/**
 * A DataSource connecting to a SolarSearchClient
 */
export class SolarDataSource extends BaseDataSource {

    /**
     * Create a new SolarDataSource
     * @param client The solar search client to use for queries.
     * @param enabled Optional function to determine if the data source is enabled.
     */
    constructor(
        private readonly client: SolarSearchClient,
        enabled: () => boolean = () => true,
    ) {
        super(enabled);
    }

    private createBoardData(board: Board) {
        return new SolarBoardData(
            board,
            this.getBoardDetails(board.boardId),
            this.resolvePackFamilyId(board.packFamilyId),
        );
    }

    private static wrapErrors<T>(promise: Promise<T>): Promise<T> {
        return promise.catch(err => {
            throw new DataSourceError('Web service could not be reached', err);
        });
    }

    public getAllBoards(details: boolean): Promise<BoardData[]> {
        const boards = details ? this.client.getAllBoardsWithDetails() : this.client.getAllBoards();
        return SolarDataSource.wrapErrors(boards).then(r => r.map(this.createBoardData, this));
    }

    public getAllDevices(): Promise<DeviceData[]> {
        const createDeviceData = (device: Device) => new SolarDeviceData(
            device,
            this.getDeviceDetails(device.deviceId),
        );
        const devices = this.client.getAllDevices();
        return SolarDataSource.wrapErrors(devices).then(r => r.map(createDeviceData));
    }

    public getDraftProjects(boardId?: BoardId, _?: DeviceId): Promise<DraftProjectData[]> {
        if (boardId === undefined) {
            return Promise.resolve([]);
        }
        const examples = this.client.getExamplesForBoard(boardId.name, boardId.vendor, boardId.revision ?? '');
        return SolarDataSource.wrapErrors(examples).then(r =>
            r.filter(prj => prj.format.type !== 'uvproj' || prj.format.convertible)
                .map(prj => new SolarExampleData(prj))
        );
    }

    protected getBoardDetails(id: string): LazyPromise<Board | undefined> {
        return LazyPromise.resolve(() => this.client.getBoardDetails(id));
    }

    protected getDeviceDetails(id: string): LazyPromise<Device | undefined> {
        return LazyPromise.resolve(() => this.client.getDeviceDetails(id));
    }

    protected resolvePackFamilyId(id: string | undefined): LazyPromise<PackFamilyId | undefined> {
        if (!id) {
            return LazyPromise.resolve();
        }
        return LazyPromise.resolve(() => this.client.resolvePackFamilyId(id));
    }
}

/**
 * DataSource connecting to csolution service via JSON-RPC.
 */
export class CsolutionDataSource extends BaseDataSource {

    constructor(
        private readonly service: CsolutionService,
    ) {
        super();
    }

    public async getAllBoards(_details: boolean) {
        const boards = await this.service.getBoardList({ context: '', vendor: '', namePattern: '' });
        return boards.boards.map(b => new CsolutionBoardData(b, this.getBoardInfo(b.id)));
    }

    public async getAllDevices() {
        const devices = await this.service.getDeviceList({ context: '', vendor: '', namePattern: '' });
        return devices.devices.map(d => new CsolutionDeviceData(d, this.getDeviceInfo(d.id)));
    }

    public async getDraftProjects(boardId?: BoardId, deviceId?: DeviceId): Promise<DraftProjectData[]> {
        const drafts = await this.service.getDraftProjects({ filter: { board: boardId?.key, device: deviceId?.key, environments: [ 'csolution', 'cmsis', 'uv' ] } });

        const examples = drafts.examples?.map(e => new CsolutionExampleData(e, DraftProjectType.Example)) ?? [];
        const refApps = drafts.refApps?.map(e => new CsolutionExampleData(e, DraftProjectType.RefApp)) ?? [];
        const templates = drafts.templates?.map(t => new CsolutionTemplateData(t)) ?? [];

        const sortedExamples = examples.sort((a, b) => a.pack.compare(b.pack));
        const sortedRefApps = refApps.sort((a, b) => a.pack.compare(b.pack));
        const sortedTemplates = templates.sort((a, b) => a.pack.compare(b.pack));

        return [ ...sortedTemplates, ...sortedRefApps, ...sortedExamples ];
    }

    private getBoardInfo(boardId: string) {
        return LazyPromise.resolve(() => this.service.getBoardInfo({ id: boardId }).then(r => r.board));
    }

    private getDeviceInfo(deviceId: string) {
        return LazyPromise.resolve(() => this.service.getDeviceInfo({ id: deviceId }).then(r => r.device));
    }

}

