/**
 * Copyright 2026 Arm Limited
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

import { TreeViewCategory } from '../common/components/tree-view';

export type BoardReference = {
    vendor: string;
    name: string;
    revision?: string;
}

export type DeviceReference = {
    vendor: string;
    name: string;
}

export type PackReference = {
    vendor: string;
    name: string;
    version: string;
}

export type ProcessorInfo = {
    name: string;
    core: string;
    supportsTrustZone: boolean;
}

export type DeviceHardwareOption = {
    id: DeviceReference;
    key: string;
    pack?: PackReference;
    processors: ProcessorInfo[];
}

export type BoardHardwareOption = {
    id: BoardReference;
    key: string;
    pack?: PackReference;
    mountedDevices: DeviceHardwareOption[];
}

export type DebugAdapter = {
    adapter: string;
}

export type MemoryInfo = Record<string, { size: number; count: number }>;

export type HardwareInfo = {
    memoryInfo: MemoryInfo;
    image: string;
    debugInterfacesList: DebugAdapter[];
    deviceInfo?: DeviceHardwareOption;
    boardInfo?: BoardHardwareOption;
}

export type HardwareLists = {
    boards: TreeViewCategory<BoardHardwareOption>[];
    devices: TreeViewCategory<DeviceHardwareOption>[];
}

export type Trustzone = 'off' | 'secure' | 'non-secure';

export type NewProject = {
    name: string;
    processorName: string;
    trustzone: Trustzone;
}

export type DraftProjectType = 'Example' | 'Reference Application' | 'Template';

export type DraftProjectDetails = {
    id: string;
    name: string;
    description: string;
    draftType: DraftProjectType;
}

export type SolutionTemplate = {
    name: string;
    description: string;
}

export type DraftProjectSelection =
    | { type: 'template'; value: SolutionTemplate }
    | { type: 'dataManagerApp'; value: DraftProjectDetails };

export type TargetType = {
    type: string;
    board?: string;
    device?: string;
    misc?: string[];
}

export type PackRequirement = {
    pack: string;
    forContext: string[];
    notForContext: string[];
}

export type CreateSolutionSubmission = {
    solutionName: string;
    projects: NewProject[];
    targetTypes: TargetType[];
    packs: PackRequirement[];
    gitInit: boolean;
    solutionLocation: string;
    solutionFolder: string;
    compiler: string;
    selectedDraftId?: string;
    showOpenDialog?: boolean;
}
