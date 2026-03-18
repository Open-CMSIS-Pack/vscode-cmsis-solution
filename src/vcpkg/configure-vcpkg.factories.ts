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

import { PackageInRegistry, PackageRequirement } from './configure-vcpkg';
import { faker } from '@faker-js/faker';
import { Package as EnvironmentManagerPackage } from '@arm-software/vscode-environment-manager';

export const packageInRegistryFactory = (options?: Partial<PackageInRegistry>): PackageInRegistry => ({
    id: options?.id ?? faker.word.noun(),
    registry: options?.registry ?? faker.word.noun(),
});

export const packageRequirementFactory = (options?: Partial<PackageRequirement>): PackageRequirement => ({
    ...packageInRegistryFactory(options),
    version: options?.version ?? faker.number.int().toString(),
});

export const environmentManagerPackageFactory = (options?: Partial<EnvironmentManagerPackage>): EnvironmentManagerPackage => ({
    ...packageInRegistryFactory(options),
    description: options?.description ?? faker.lorem.sentence(),
    name: options?.name,
    releases: options?.releases ?? [
        { version: faker.system.semver() }
    ],
});
