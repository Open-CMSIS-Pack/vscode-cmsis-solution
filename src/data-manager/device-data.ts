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

import { Device } from '../solar-search/solar-search-client';
import { PackId } from './pack-data';
import { LazyPromise } from '../generic/lazy';
import { Device as CsolutionDevice } from '../json-rpc/csolution-rpc-client';
import { Optional } from '../generic/type-helper';
import { splitPackId, splitDeviceId } from '../json-rpc/csolution-rpc-helper';


export class DeviceId {
    public readonly key: string;

    constructor(
        public readonly vendor: string,
        public readonly name: string,
    ) {
        this.key = `${this.vendor}::${this.name}`;
    }
}

export interface DeviceMemory {
    get name(): string;
    get size(): number;
}

export interface DeviceProcessor {
    get name(): string;
    get core(): string;
    get trustzone(): boolean | undefined;
}

export interface DeviceData {
    get id(): DeviceId;
    get vendor(): string;
    get name(): string;
    get family(): string;
    get subfamily(): string | undefined;
    get pack(): Promise<PackId | undefined>;
    get memories(): Promise<DeviceMemory[]>;
    get processors(): Promise<DeviceProcessor[]>;
    get description(): Promise<string>;
}

abstract class BaseDeviceData implements DeviceData {

    public get id(): DeviceId {
        return new DeviceId(this.vendor, this.name);
    }

    abstract get vendor(): string;
    abstract get name(): string;
    abstract get family(): string;
    abstract get subfamily(): string | undefined;
    abstract get pack(): Promise<PackId | undefined>;
    abstract get memories(): Promise<DeviceMemory[]>;
    abstract get processors(): Promise<DeviceProcessor[]>;
    abstract get description(): Promise<string>;
}

export class SolarDeviceData extends BaseDeviceData {
    constructor(
        private readonly data: Device,
        private readonly details: LazyPromise<Device | undefined> = LazyPromise.resolve(),
    ) {
        super();
    }

    public get vendor(): string {
        return this.data.vendorName;
    }

    public get name(): string {
        return this.data.deviceName;
    }

    public get family(): string {
        return this.data.familyName;
    }

    public get subfamily(): string | undefined {
        return this.data.subfamilyName;
    }

    public get pack(): Promise<PackId | undefined> {
        const createPackId = (device: Device | undefined): PackId | undefined => {
            if (!device || !device.packVendor || !device.packName) {
                return undefined;
            }
            return new PackId(device.packVendor, device.packName, device.packVersion);
        };
        return this.details.thenOrDefault(createPackId(this.data), createPackId);
    }

    public get memories(): Promise<DeviceMemory[]> {
        return this.details.thenOrDefault(this.data.memories, d => d?.memories ?? []);
    }

    public get processors(): Promise<DeviceProcessor[]> {
        return this.details.thenOrDefault(this.data.processors, d => d?.processors || []);
    }

    get description(): Promise<string> {
        return this.details.thenOrDefault(this.data.description, d => d?.description || '');
    }
}

export class CsolutionDeviceData extends BaseDeviceData {
    protected readonly packId: Optional<{ vendor: string; name: string; version?: string; }>;
    protected readonly deviceId: { vendor: string; name: string; };


    constructor(
        private readonly data: CsolutionDevice,
        private readonly details: LazyPromise<CsolutionDevice>,
    ) {
        super();
        this.packId = splitPackId(data.pack);
        const deviceId = splitDeviceId(data.id);
        this.deviceId = {
            vendor: deviceId.vendor ?? this.packId?.vendor ?? '<invalid-vendor>',
            name: deviceId.name,
        };
    }

    public get vendor(): string {
        return this.deviceId.vendor;
    }

    public get name(): string {
        return this.deviceId.name;
    }

    public get family(): string {
        return this.data.family ?? '';
    }

    public get subfamily(): string | undefined {
        return this.data.subFamily;
    }

    public get pack(): Promise<PackId | undefined> {
        if (this.packId) {
            return Promise.resolve(new PackId(this.packId.vendor, this.packId.name, this.packId.version));
        }
        return Promise.resolve(undefined);
    }

    public get memories(): Promise<DeviceMemory[]> {
        return this.details.then(d => d.memories?.map(m => ({
            name: m.name ?? '',
            size: Number(m.size ?? 0),
        })) ?? []);
    }

    public get processors(): Promise<DeviceProcessor[]> {
        return this.details.then(d => d.processors?.map(p => ({
            name: p.name ?? '',
            core: p.core,
            trustzone: p.attributes?.['Dtz'] ? p.attributes['Dtz'] === 'TZ' : undefined
        })) ?? []);
    }

    get description(): Promise<string> {
        return this.details.then(d => d.description ?? '');
    }
}
