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

import path from 'path';
import { faker } from '@faker-js/faker';
import { Config, SolutionData, ImageSelection, ProjectSelection, TargetType } from './manage-solution-state';

export type SelectionFactoryOptions = {
    buildTypes?: string[],
    selected?: boolean,
}

export const targetTypeModelFactory = (props?: TargetType): TargetType => ({
    name: props?.name || faker.word.noun(),
    board: props?.board || faker.word.noun(),
    device: props?.device || faker.word.noun(),
    compiler: props && 'compiler' in props ? props.compiler : 'AC6',
    selectedSet: props?.selectedSet,
    targetSets: props?.targetSets,
});


export const projectSelectionFactory = (options?: SelectionFactoryOptions): ProjectSelection => {
    const name = faker.word.noun();
    const buildTypes = options?.buildTypes ?? faker.helpers.multiple(() => faker.word.noun());
    return {
        name,
        path: path.join(faker.system.directoryPath(), `${name}.cproject.yml`),
        buildTypes,
        selectedBuildType: buildTypes?.[0] ?? '',
        load: 'none',
        selected: options?.selected ?? true,
    };
};

export const imageSelectionFactory = (options?: SelectionFactoryOptions): ImageSelection => {
    const name = faker.word.noun();
    return {
        name,
        path: path.join(faker.system.directoryPath(), `${name}.afx`),
        load: 'none',
        loadOffset: '0x0',
        selected: options?.selected ?? true,
    };
};

export type SolutionDataFactoryOptions = {
    projects?: ProjectSelection[];
    images?: ImageSelection[];
}

export const solutionDataFactory = (options?: SolutionDataFactoryOptions): SolutionData => {
    const targets = faker.helpers.multiple(() => targetTypeModelFactory());
    return {
        solutionName: faker.word.noun(),
        solutionPath: path.join(faker.system.directoryPath(), `${faker.word.noun()}.csolution.yml`),
        targets,
        projects: options?.projects ?? faker.helpers.multiple(() => projectSelectionFactory()),
        images: options?.images ?? faker.helpers.multiple(() => imageSelectionFactory()),
        selectedTarget: targets[0],
        availableCoreNames: faker.helpers.multiple(() => faker.word.noun()),
    };
};

export const configFactory = (): Config => {
    const options = [faker.word.noun(), faker.word.noun()];
    return {
        available: options,
        selected: {
            solution: options[0],
            projects: {},
        },
    };
};
