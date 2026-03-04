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

import { DebugAdapter } from '../../../../debug/debug-adapters-yaml-file';

/**
 * Specifies the type of data to load for a project or image.
*
* - 'image+symbols': Load both the binary image and its debug symbols. Use when both are needed for debugging.
* - 'symbols': Load only the debug symbols. Use when the image is already loaded or not needed.
* - 'image': Load only the binary image. Use when symbols are not required.
* - 'none': Do not load either image or symbols. Use when no loading is required.
*/
export type LoadType = 'image+symbols' | 'symbols' | 'image' | 'none';

export type BoardReference = {
    name: string;
    vendor?: string;
    revision?: string;
};

export type DeviceReference = {
    name: string;
    vendor?: string;
    processor?: string;
};


export type ImageSelection = {
    name: string;
    path: string;
    selected: boolean;
    loadOffset?: string | undefined;
    load?: LoadType;
    device?: string; // Pname without leading ':'
}

export type ProjectSelection = ImageSelection & {
    buildTypes: string[];
    selectedBuildType: string;
    projectType?: string; // optional project type
}

export type GenericPropertyList = {
    [key: string]: string | [string] | number | object | undefined;
};


export type TargetSet = {
    name: string;
    images?: ImageSelection[];
    debugger?: GenericPropertyList
};

export type TargetType = {
    name: string;
    board?: string;
    device?: string;
    compiler?: string;
    targetSets?: TargetSet[];
    selectedSet?: string; // used to track the currently selected target set
}


export type SolutionData = {
    solutionName: string;
    solutionPath: string;
    targets: TargetType[];
    selectedTarget: TargetType | undefined;
    projects: ProjectSelection[];
    images?: ImageSelection[];
    availableCoreNames: string[];
}

export type ActiveTargetSet = {
    project: string | undefined;
    set: string | undefined;
}

export type Config = {
    available: string[]
    selected: {
        solution: string | undefined,
        projects: Record<string, string | undefined>,
    }
}


export type ManageSolutionState = {
    solutionData: SolutionData;
    debugAdapters: DebugAdapter[];
    debugger: string | undefined;
    isDirty: boolean;
    autoUpdate: boolean;
    busy: boolean;
}

export function getSelectedTargetSet(tt?: TargetType): TargetSet | undefined {
    const targetSets = tt?.targetSets;
    if (!targetSets) {
        return undefined;
    }
    const selectedSet = tt?.selectedSet;
    for (const ts of targetSets) {
        if (ts.name === selectedSet || (!ts.name && !selectedSet)) {
            return ts;
        }
    }
    return undefined;
}

