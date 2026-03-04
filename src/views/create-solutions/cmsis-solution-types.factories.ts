/**
 * Copyright 2023-2026 Arm Limited
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

import { Tz } from '../../core-tools/client/packs_pb';
import { boardIdFactory, deviceReferenceFactory, packIdFactory } from '../../core-tools/core-tools-service.factories';
import { BoardHardwareOption, DeviceHardwareOption, NewProject, ProcessorInfo } from './cmsis-solution-types';
import { faker } from '@faker-js/faker';
import { makeFactory } from '../../__test__/test-data-factory';

export const deviceHardwareOptionFactory = makeFactory<DeviceHardwareOption>({
    id: () => deviceReferenceFactory().toObject(),
    key: () => faker.string.uuid(),
    pack: () => packIdFactory().toObject(),
    processors: () => [ processorInfoFactory() ]
});

export const processorInfoFactory = makeFactory<ProcessorInfo>({
    name: () => faker.word.noun(),
    core: () => `Cortex-M${faker.number.int()}`,
    tz: () => faker.helpers.arrayElement(Object.values(Tz)) ,
});

export const boardHardwareOptionFactory = makeFactory<BoardHardwareOption>({
    id: () => boardIdFactory().toObject(),
    key: () => faker.string.uuid(),
    pack: () => packIdFactory().toObject(),
    mountedDevices: () => [ deviceHardwareOptionFactory() ],
    unresolvedDevices: () => [],
});

export const newProjectFactory = makeFactory<NewProject>({
    name: () => faker.word.noun(),
    processorName: () => faker.word.noun(),
    trustzone: () => 'off',
});
