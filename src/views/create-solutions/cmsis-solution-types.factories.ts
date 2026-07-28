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

import { BoardHardwareOption, DeviceHardwareOption, NewProject, ProcessorInfo } from './cmsis-solution-types';
import { faker } from '@faker-js/faker';
import { makeFactory } from '../../__test__/test-data-factory';

export const deviceHardwareOptionFactory = makeFactory<DeviceHardwareOption>({
    id: () => ({ vendor: faker.company.name(), name: faker.word.noun() }),
    key: () => faker.string.uuid(),
    pack: () => ({ vendor: faker.company.name(), name: faker.word.noun(), version: faker.system.semver() }),
    processors: () => [ processorInfoFactory() ]
});

export const processorInfoFactory = makeFactory<ProcessorInfo>({
    name: () => faker.word.noun(),
    core: () => `Cortex-M${faker.number.int()}`,
    supportsTrustZone: () => faker.datatype.boolean(),
});

export const boardHardwareOptionFactory = makeFactory<BoardHardwareOption>({
    id: () => ({ vendor: faker.company.name(), name: faker.word.noun(), revision: faker.system.semver() }),
    key: () => faker.string.uuid(),
    pack: () => ({ vendor: faker.company.name(), name: faker.word.noun(), version: faker.system.semver() }),
    mountedDevices: () => [ deviceHardwareOptionFactory() ],
    unresolvedDevices: () => [],
});

export const newProjectFactory = makeFactory<NewProject>({
    name: () => faker.word.noun(),
    processorName: () => faker.word.noun(),
    trustzone: () => 'off',
});
