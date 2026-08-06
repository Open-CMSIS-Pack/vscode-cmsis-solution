/**
 * Copyright 2022-2026 Arm Limited
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

import { BoardHardwareOption, BoardReference, DebugAdapter, DeviceHardwareOption, DeviceReference, ProcessorInfo } from './create-solution-dto';

export type {
    BoardHardwareOption,
    DeviceHardwareOption,
    HardwareInfo,
    MemoryInfo,
    NewProject,
    ProcessorInfo,
    Trustzone,
} from './create-solution-dto';

export const labelForHardwareOption = (hardwareOption: BoardHardwareOption | DeviceHardwareOption): string => {
    const hardwareId: { name: string, revision?: string } = hardwareOption.id;
    const revisionString = hardwareId.revision ? ` (${hardwareId.revision})` : '';
    return `${hardwareId.name}${revisionString}`;
};

export const compareDeviceId = (ref1: DeviceReference | undefined) => (ref2: DeviceReference | undefined): boolean => {
    if (!ref1 || !ref2) { return false; }
    return ref1.name === ref2.name && ref1.vendor === ref2.vendor;
};

export const compareBoardId = (id1: BoardReference) => (id2: BoardReference): boolean => {
    return id1.vendor === id2.vendor && id1.name === id2.name && id1.revision === id2.revision;
};

export const debugInterfaceAdaptersAreEqual = (interface1: DebugAdapter | undefined) => (interface2: DebugAdapter | undefined): boolean => {
    if (!interface1 || !interface2) { return false; }
    return interface1.adapter === interface2.adapter;
};

export const validTrustZone = (processor: ProcessorInfo): boolean => processor.supportsTrustZone;
