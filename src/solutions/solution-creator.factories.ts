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

import { faker } from '@faker-js/faker';
import { Uri } from 'vscode';
import { CreatedSolution } from './solution-creator';
import { makeFactory } from '../__test__/test-data-factory';

export const createdSolutionFactory = makeFactory<CreatedSolution>({
    solutionDir: () => Uri.file(faker.system.directoryPath()),
    solutionFile: (r) => Uri.joinPath(r.solutionDir!, `${faker.word.noun()}.csolution.yml`),
    vcpkgConfigured: () => true,
    conversionStatus: () => 'none',
    forceRteUpdate: () => false,
});
