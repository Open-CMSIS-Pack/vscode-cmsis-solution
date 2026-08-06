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

type DeviceId = {
    name: string;
    processor?: string;
};

type BoardId = {
    name: string;
    revision?: string;
};

type VendorId = {
    vendor?: string;
    name: string;
};

type Device = DeviceId & VendorId;

type Board = BoardId & VendorId;

type Compiler = {
    name?: string;
    version?: string;
};

type PackReference = VendorId & {
    version?: string;
};

type ComponentReference = {
    className: string;
    bundleName?: string;
    group: string;
    subgroup?: string;
    vendor?: string;
    variant?: string;
    version?: string;
};

const serialiseVendor = (vendor?: string): string => vendor ? `${vendor}::` : '';

export const serialiseDeviceWithoutVendor = (id: DeviceId): string => {
    return `${id.name}${id.processor ? ':' + id.processor : ''}`;
};

export const serialiseBoardIdWithoutVendor = (id: BoardId): string => {
    return `${id.name}${id.revision ? ':' + id.revision : ''}`;
};

// Retained until the legacy parsing and reconciliation stages are removed.
export const serialiseDevice = (id: Device): string => {
    return `${serialiseVendor(id.vendor)}${serialiseDeviceWithoutVendor(id)}`;
};

export const serialiseBoardId = (id: Board): string => {
    return `${serialiseVendor(id.vendor)}${serialiseBoardIdWithoutVendor(id)}`;
};

export const serialiseCompiler = (compiler: Compiler): string => {
    return `${compiler.name ?? ''}${compiler.version ? `@${compiler.version}` : ''}`;
};

export const serialisePackReference = (pack?: PackReference): string => {
    return `${pack?.vendor}::${pack?.name}`;
};

export const serialiseComponentReference = (component: ComponentReference): string => {
    const bundle = component.bundleName ? `&${component.bundleName}` : '';
    const subgroup = component.subgroup ? `:${component.subgroup}` : '';
    const variant = component.variant ? `&${component.variant}` : '';
    const version = component.version ? `@${component.version}` : '';
    return `${serialiseVendor(component.vendor)}${component.className}${bundle}:${component.group}${subgroup}${variant}${version}`;
};
