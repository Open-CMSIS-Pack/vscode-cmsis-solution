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

import { Board, MountedDevice, PackFamilyId } from '../solar-search/solar-search-client';
import { DeviceId } from './device-data';
import { PackId } from './pack-data';
import { LazyPromise } from '../generic/lazy';

import { Board as CsolutionBoard, Device as CsolutionDevice, DebugInterface as CsolutionDebugInterface } from '../json-rpc/csolution-rpc-client';
import { splitBoardId, splitDeviceId, splitPackId } from '../json-rpc/csolution-rpc-helper';
import { Optional } from '../generic/type-helper';

export class BoardId {
    public readonly key: string;

    constructor(
        public readonly vendor: string,
        public readonly name: string,
        public readonly revision?: string,
    ) {
        this.key = `${this.vendor}::${this.name}${this.revision ? `:${this.revision}` : ''}`;
    }
}

export interface DebugInterface {
    get adapter(): string;
    get connector(): string;
}

export interface BoardData {
    get id(): BoardId;
    get vendor(): string;
    get name(): string;
    get revision(): string | undefined;
    get description(): Promise<string>;
    get devices(): Promise<DeviceId[]>;
    get pack(): Promise<PackId | undefined>;
    get image(): Promise<string | undefined>;
    get debugInterfaces(): Promise<DebugInterface[]>;
}

abstract class BaseBoardData implements BoardData {
    get id(): BoardId {
        return new BoardId(this.vendor, this.name, this.revision);
    }

    abstract get vendor(): string;
    abstract get name(): string;
    abstract get revision(): string | undefined;
    abstract get description(): Promise<string>;
    abstract get devices(): Promise<DeviceId[]>;
    abstract get pack(): Promise<PackId | undefined>;
    abstract get image(): Promise<string | undefined>;
    abstract get debugInterfaces(): Promise<DebugInterface[]>;
}

export class SolarBoardData extends BaseBoardData {
    constructor(
        private readonly data: Board,
        private readonly details: LazyPromise<Board | undefined> = LazyPromise.resolve(),
        private readonly packFamilyId: LazyPromise<PackFamilyId | undefined> = LazyPromise.resolve(),
    ) {
        super();
    }

    public get vendor() {
        return this.data.vendorName;
    }

    public get name() {
        return this.data.boardName;
    }

    public get revision() {
        return this.data.boardRev;
    }

    public get description() {
        return this.details.thenOrDefault(this.data.description, d => d?.description ?? '');
    }

    public get devices() {
        const createDeviceId = (device: MountedDevice) => new DeviceId(device.vendorName, device.deviceName);
        return this.details.thenOrDefault(this.data.mountedDevices?.map(createDeviceId), d => d?.mountedDevices?.map(createDeviceId) ?? []);
    }

    public get pack() {
        const createPackId = (p: PackFamilyId | undefined) => {
            if (p) {
                return new PackId(p.vendor, p.name, this.data.packVersion);
            }
            return undefined;
        };

        return this.packFamilyId.then(createPackId);
    }

    public get image() {
        return this.details.thenOrDefault(this.data.imageUrl, d => d?.imageUrl);
    }

    get debugInterfaces() {
        return this.details.thenOrDefault(this.data.debugInterfaces, result => result?.debugInterfaces ?? []);
    }
}

export class CsolutionBoardData extends BaseBoardData {
    protected readonly packId: Optional<{ vendor: string; name: string; version?: string }>;
    protected readonly boardId: { vendor: string; name: string; revision?: string };

    constructor(
        private readonly data: CsolutionBoard,
        private readonly details: LazyPromise<CsolutionBoard>,
    ) {
        super();
        this.packId = splitPackId(data.pack);
        const boardId = splitBoardId(data.id);
        this.boardId = {
            vendor: boardId.vendor ?? this.packId?.vendor ?? '<invalid-vendor>',
            name: boardId.name,
            revision: boardId?.revision,
        };
    }

    public get vendor() {
        return this.boardId.vendor;
    }

    public get name() {
        return this.boardId.name;
    }

    public get revision() {
        return this.boardId.revision;
    }

    public get description() {
        return this.details.thenOrDefault(this.data.description, d => d?.description ?? '');
    }

    public get devices() {
        const createDeviceId = (device: CsolutionDevice) => {
            const deviceId = splitDeviceId(device.id);
            return new DeviceId(deviceId.vendor ?? this.boardId.vendor, deviceId.name);
        };
        return this.details.then(d => d.devices?.map(createDeviceId) ?? []);
    }

    public get pack() {
        if (this.packId) {
            return Promise.resolve(new PackId(this.packId.vendor, this.packId.name, this.packId.version));
        }
        return Promise.resolve(undefined);
    }

    public get image() {
        return this.details.then(d => d.image);
    }

    get debugInterfaces() {
        const createDebugInterface = (di: CsolutionDebugInterface): DebugInterface => ({
            adapter: di.adapter,
            connector: di.connector ?? '',
        });
        return this.details.then(d => d.debugInterfaces?.map(createDebugInterface) ?? []);
    }
}
