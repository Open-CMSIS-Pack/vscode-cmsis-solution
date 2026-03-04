/**
 * Copyright 2022-2026 Arm Limited
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

import { BoardId, DebugInterface, DeviceReference, PackId, Tz, TzMap } from '../../core-tools/client/packs_pb';

export type DeviceHardwareOption = {
    id: DeviceReference.AsObject;
    key: string;
    pack?: PackId.AsObject,
    processors: ProcessorInfo[];
}

export type BoardHardwareOption = {
    id: BoardId.AsObject;
    key: string;
    pack?: PackId.AsObject,
    mountedDevices: DeviceHardwareOption[];
    unresolvedDevices: DeviceReference.AsObject[];
}

export const labelForHardwareOption = (hardwareOption: BoardHardwareOption | DeviceHardwareOption): string => {
    const hardwareId: { name: string, revision?: string } = hardwareOption.id;
    const revisionString = hardwareId.revision ? ` (${hardwareId.revision})` : '';
    return `${hardwareId.name}${revisionString}`;
};

export type HardwareInfo = {
    memoryInfo: MemoryInfo;
    image: string;
    debugInterfacesList: DebugInterface.AsObject[];
    deviceInfo?: DeviceHardwareOption;
    boardInfo?: BoardHardwareOption;
}

export type ProcessorInfo = {
    tz: TzMap[keyof TzMap];
    core: string;
    name: string;
}

export type MemoryInfo = {
    [key: string]: { size: number, count: number }
}

export const compareDeviceId = (ref1: DeviceReference.AsObject | undefined) => (ref2: DeviceReference.AsObject | undefined): boolean => {
    if (!ref1 || !ref2) { return false; }
    return ref1.name === ref2.name && ref1.vendor === ref2.vendor;
};

export const compareBoardId = (id1: BoardId.AsObject) => (id2: BoardId.AsObject): boolean => {
    return id1.vendor === id2.vendor && id1.name === id2.name && id1.revision === id2.revision;
};

export type NewProject = {
    name: string;
    processorName: string;
    trustzone: Trustzone
}

export type Trustzone = 'off' | 'secure' | 'non-secure'

export const debugInterfaceAdaptersAreEqual = (interface1: DebugInterface.AsObject | undefined) => (interface2: DebugInterface.AsObject | undefined): boolean => {
    if (!interface1 || !interface2) { return false; }
    return interface1.adapter === interface2.adapter;
};

export const validTrustZone = (processor: ProcessorInfo): boolean => processor.tz === Tz.TZ;
