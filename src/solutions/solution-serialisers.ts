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

import { BoardId, DeviceReference } from '../core-tools/client/packs_pb';
import { ComponentReference, Device, PackReference } from '../core-tools/client/solutions_pb';
import { Compiler } from './deserialising/solution-data';

export const serialiseDeviceReference = (id: DeviceReference.AsObject) => `${id.vendor}::${id.name}`;

export const serialiseDevice = (id: Device.AsObject): string => {
    return `${id.vendor ? id.vendor + '::' : ''}${id.name}${id.processor ? ':' + id.processor : ''}`;
};

export const serialiseDeviceWithoutVendor = (id: Device.AsObject): string => {
    return `${id.name}${id.processor ? ':' + id.processor : ''}`;
};

export const serialiseBoardId = (id: BoardId.AsObject): string => {
    return `${id.vendor ? id.vendor + '::' : ''}${id.name}${id.revision ? ':' + id.revision : ''}`;
};

export const serialiseBoardIdWithoutVendor = (id: BoardId.AsObject): string => {
    return `${id.name}${id.revision ? ':' + id.revision : ''}`;
};

export const serialiseCompiler = (compiler: Compiler): string => {
    return `${compiler.name ?? ''}${compiler.version ? `@${compiler.version}` : ''}`;
};

export const serialisePackReference = (pack?: PackReference.AsObject): string => {
    return `${pack?.vendor}::${pack?.name}`;
};

export const serialiseComponentReference = (component: ComponentReference.AsObject) => {
    const vendorString = component.vendor ? `${component.vendor}::` : '';
    const bundleString = component.bundleName ? `&${component.bundleName}` : '';
    const variantString = component.variant ? `&${component.variant}` : '';
    const versionString = component.version ? `@${component.version}` : '';
    const subgroupString = component.subgroup ? `:${component.subgroup}` : '';
    return `${vendorString}${component.className}${bundleString}:${component.group}${subgroupString}${variantString}${versionString}`;
};
