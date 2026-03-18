/**
 * Copyright 2023-2026 Arm Limited
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

import { ProcessorData } from './processor-data-parsing';
import { PackReference } from './common-file-parsing';

export type SolutionFile<A> = {
    path: string;
    value: A;
}

export type BuildType = {
    type: string;
    compiler?: string;
    processor?: ProcessorData;
    optimize?: string;
    debug?: string;
}

export type Variable = {
    name: string;
    value: string;
}

export type TargetType = {
    type: string;
    board?: string;
    device?: string;
    compiler?: string;
    processor?: ProcessorData;
    variables?: Variable[];
}

export type ProjectReference = {
    reference: string;
    forContext: string[] | string;
    notForContext: string[] | string;
}

export type Solution = {
    projects: ProjectReference[];
    targetTypes: TargetType[];
    buildTypes: BuildType[];
    packs: PackReference[];
    compiler?: string;
    processor?: ProcessorData;
    cdefault?: boolean;
    createdFor?: string;
}

export const DEFAULT_BUILD_TYPES: BuildType[] = [
    { type: 'Debug', compiler: 'AC6' },
    { type: 'Release', compiler: 'AC6' },
];
