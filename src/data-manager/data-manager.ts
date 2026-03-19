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

import { DataSource } from './data-source';
import { DataSet } from './dataset';
import { DeviceData, DeviceId } from './device-data';
import { BoardData, BoardId } from './board-data';
import { DraftProjectData } from './draft-project-data';

/**
 * Data Manager provides access to configurable data sources.
 * Requests are forwarded to data sources and results are aggregated
 */
export interface DataManager {
    /**
     * Errors encountered during the last data retrieval operation.
     */
    readonly errors: string[];

    /**
     * Get all available boards registered in pack index.
     * @param details - if true, include detailed information about boards
     * @returns A set of all boards
     */
    getAllBoards(details?: boolean): Promise<DataSet<BoardData>>;

    /**
     * Get all available devices registered in pack index.
     * @returns A set of all devices
     */
    getAllDevices(): Promise<DataSet<DeviceData>>;

    /**
     * Search for draft projects matching the given board and/or device.
     * Draft projects can be downloadable web examples and examples,
     * reference applications, or templates shipped in a pack.
     * @param boardId Optional board id as a filter
     * @param deviceId Optional device id as a filter
     */
    getDraftProjects(boardId?: BoardId, deviceId?: DeviceId): Promise<DataSet<DraftProjectData>>;
}

/**
 * Aggregate an array of settled promises into a DataSet
 * @param results Query results e.g. from data sources
 * @returns The aggregated DataSet
 * @template T - The type of data elements
 */
function toDataSet<T extends { id: unknown }>(results: PromiseSettledResult<T[]>[]) : DataSet<T> {
    const values = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value);
    return new DataSet(values);
}

class DataManagerImpl implements DataManager {
    private readonly _sources: DataSource[];
    private _errors: string[] = [];

    constructor(
        ...sources: DataSource[]
    ) {
        this._sources = sources;
    }

    private get sources() {
        return this._sources.filter(src => src.enabled);
    }

    private async requestAll<T extends { id: unknown }>(callbackfn: (value: DataSource) => Promise<T[]>) {
        const requests = this.sources.map(callbackfn);
        const data = await Promise.allSettled(requests);
        this._errors = data
            .filter(d => d.status === 'rejected')
            .map(d => typeof(d.reason) === 'object' && 'message' in d.reason ? d.reason.message : d.reason.toString());
        return toDataSet(data);
    }

    public get errors() {
        return this._errors;
    }

    public async getAllBoards(details = false) {
        return this.requestAll(src => src.getAllBoards(details));
    }

    public async getAllDevices() {
        return this.requestAll(src => src.getAllDevices());
    }

    public async getDraftProjects(boardId?: BoardId, deviceId?: DeviceId) {
        return this.requestAll(src => src.getDraftProjects(boardId, deviceId));
    }
}

interface DataManagerConstructor {
    /**
     * Create a new instance of DataManager
     * @param sources - Data sources to be used in ascending priority order.
     *                  Data elements returned from a higher priority source
     *                  will override data from a lower priority source.
     */
    new (...sources: DataSource[]): DataManager;
}

export const DataManager: DataManagerConstructor = DataManagerImpl;
