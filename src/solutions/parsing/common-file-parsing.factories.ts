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

import { faker } from '@faker-js/faker';
import { ComponentData, FileData, GroupData, PackReference } from './common-file-parsing';

export const fileDataFactory = (options?: Partial<FileData>): FileData => ({
    name: options?.name ?? faker.system.fileName(),
    forContext: options?.forContext ?? [],
    notForContext: options?.notForContext ?? [],
});

export const groupDataFactory = (options?: Partial<GroupData>): GroupData => ({
    name: options?.name ?? faker.word.noun(),
    files: options?.files ?? [],
    groups: options?.groups ?? [],
    forContext: options?.forContext ?? [],
    notForContext: options?.notForContext ?? [],
});

export const componentDataFactory = (options?: Partial<ComponentData>): ComponentData => ({
    reference: options?.reference ?? `${faker.word.noun()}:${faker.word.noun()}`,
    forContext: options?.forContext ?? [],
    notForContext: options?.notForContext ?? [],
    instances: options?.instances ?? 1,
});

export const packReferenceModelFactory = (): PackReference => ({
    pack: `${faker.word.noun()}::${faker.word.noun()}@1.2.3`,
    forContext: [],
    notForContext: [],
});
