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

import { PackageRequirement } from './configure-vcpkg';

export const toolboxRequirement: PackageRequirement = { registry: 'arm', id: 'tools/open-cmsis-pack/cmsis-toolbox', version: '^2.12.0' };
export const cmakeRequirement: PackageRequirement = { registry: 'arm', id: 'tools/kitware/cmake', version: '^3.31.5' };
export const ninjaRequirement: PackageRequirement = { registry: 'arm', id: 'tools/ninja-build/ninja', version: '^1.12.1' };
export const mdkToolboxRequirement: PackageRequirement = { registry: 'arm', id: 'tools/arm/mdk-toolbox', version: '^1.1.0' };
export const armClangRequirement: PackageRequirement = { registry: 'arm', id: 'compilers/arm/armclang', version: '^6.24.0' };
