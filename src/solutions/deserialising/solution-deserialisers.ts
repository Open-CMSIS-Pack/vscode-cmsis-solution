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

import { ComponentReference } from '../../core-tools/client/solutions_pb';
import { BuildContext } from '../../views/manage-components-packs/components-data';
import { DeviceReference, PackReference, BoardReference, Compiler } from './solution-data';

export const deserialiseDeviceReference = (deviceString: string): DeviceReference => {
    const deviceVendor = splitVendor(deviceString);
    const deviceNameProcessor = splitNameGeneric(deviceVendor.nameGeneric);
    const deviceReference: DeviceReference = {
        vendor: deviceVendor.vendor?.trim(),
        name: deviceNameProcessor.name.trim(),
        processor: deviceNameProcessor.generic?.trim(),
    };
    return deviceReference;
};

// https://github.com/Open-CMSIS-Pack/devtools/blob/tools/projmgr/2.2.1/tools/projmgr/schemas/common.schema.json#L994
const packIDRegex = /^([\w .-]+)((::[\w .*-]+)(@(>=)?(\d+\.\d+\.\d+((\+|-)[\w.+-]+)?))?)?$/g;
export const deserialisePackReference = (packString: string): PackReference => {
    const matchList = [...packString.matchAll(packIDRegex)];
    if (matchList.length < 1) {
        return { vendor: '', name: undefined, version: undefined };
    }
    const matches = matchList[0];
    const packReference: PackReference = {
        vendor: matches[1].trim(),
        name: matches[3]?.replace(/::/g, '').trim(),
        version: matches[4]?.replace(/@/g, '').trim()
    };
    return packReference;
};

export const deserialiseBoardReference = (boardString: string): BoardReference => {
    const boardVendor = splitVendor(boardString);
    const boardNameProcessor = splitNameGeneric(boardVendor.nameGeneric);
    const boardReference: BoardReference = {
        vendor: boardVendor.vendor?.trim(),
        name: boardNameProcessor.name.trim(),
        revision: boardNameProcessor.generic?.trim(),
    };
    return boardReference;
};

export const deserialiseCompiler = (compilerString: string): Compiler => {
    const compilerVersionSeparator = '@';
    const splitCompiler = compilerString.split(compilerVersionSeparator);
    const compiler: Compiler = {
        name: splitCompiler[0].trim(),
        version: splitCompiler[1]?.trim()
    };
    return compiler;
};

// Csolution schema component ID regex: https://github.com/Open-CMSIS-Pack/devtools/blob/14c51279947906835d0322c55a78a9d7bef14ede/tools/projmgr/schemas/common.schema.json#L589
// Allowed characters in component ID parts: https://github.com/Open-CMSIS-Pack/Open-CMSIS-Pack-Spec/blob/fe33b2e6cc980256e1c3c16120200feb2c639c02/schema/PACK.xsd#L367-L373
const componentIDRegex = /^([\w \\/\\.+-]+::)?([\w '\\(\\)\\/\\.+-]+)(&[\w \\/\\.+-]+)?(:[\w '\\(\\)\\/\\.+-]+)(:[\w '\\(\\)\\/\\.+-]+)?(&[\w '\\(\\)\\/\\.+-]+)?(@(>=)?(\d+\.\d+\.\d+((\+|\\-)[\w.\\/+-]+)?))?$/g;
export const deserialiseComponentReference = (componentString: string): ComponentReference.AsObject => {
    const matchList = [...componentString.matchAll(componentIDRegex)];
    if (matchList.length < 1) {
        return {
            bundleName: '',
            className: '',
            group: '',
            subgroup: '',
            vendor: '',
            version: '',
            variant: '',
        };
    }
    const matches = matchList[0];
    const componentReference: ComponentReference.AsObject = {
        className: matches[2].trim(),
        group: matches[4]?.replace(/:/, '').trim(),
        vendor: matches[1]?.replace(/::/, '').trim() || '',
        bundleName: matches[3]?.replace(/&/, '').trim() || '',
        subgroup: matches[5]?.replace(/:/, '').trim() || '',
        variant: matches[6]?.replace(/&/, '').trim() || '',
        version: matches[7]?.replace(/@/, '').trim() || '',
    };
    return componentReference;
};

export const protoComponentReferencesAreEqual = (ref1?: ComponentReference.AsObject, ref2?: ComponentReference.AsObject): boolean => {
    if (!ref1 || !ref2) {
        return ref1 === ref2;
    }
    return ref1.bundleName === ref2.bundleName &&
        ref1.className === ref2.className &&
        ref1.group === ref2.group &&
        ref1.subgroup === ref2.subgroup &&
        ref1.variant === ref2.variant &&
        ref1.vendor === ref2.vendor &&
        ref1.version === ref2.version;
};

const buildContextIDRegex = /^(((^[.][^.+\s]*)|(^[+][^.+\s]*))|((^[.][^.+\s]*)[+][^.+\s]*|(^[+][^.+\s]*)[.][^.+\s]*))$/g;
export const deserialiseBuildContextID = (buildContextIDString: string): Partial<BuildContext> => {
    const targetTypePrefix = '+';
    const buildTypePrefix = '.';
    const matchList = [...buildContextIDString.matchAll(buildContextIDRegex)];
    if (matchList.length < 1) {
        return { targetType: undefined, buildType: undefined };
    }
    const buildContextStr = matchList[0][0]?.trim();
    const includesPrefixes = buildContextStr.includes(targetTypePrefix) && buildContextStr.includes(buildTypePrefix);
    const buildContextID: BuildContext = {
        targetType: includesPrefixes ? splitBuildContext(buildContextStr, targetTypePrefix, buildTypePrefix) : buildContextStr.split(targetTypePrefix)[1],
        buildType: includesPrefixes ? splitBuildContext(buildContextStr, buildTypePrefix, targetTypePrefix) : buildContextStr.split(buildTypePrefix)[1]
    };
    return buildContextID;
};

export const splitBuildContext = (buildContextStr: string, prefix1: string, prefix2: string): string => buildContextStr.split(prefix1)[1].split(prefix2)[0];

export const splitVendor = (str: string): { vendor: string | undefined, nameGeneric: string } => {
    const vendorSeparator = '::';
    if (!str.includes(vendorSeparator)) {
        return { vendor: undefined, nameGeneric: str };
    }
    const splitVendor = str.split(vendorSeparator);
    return { vendor: splitVendor[0], nameGeneric: splitVendor[1] };
};

export const splitNameGeneric = (str: string): { name: string, generic: string | undefined } => {
    const nameVersionSeparator = ':';
    const splitNameGeneric = str.split(nameVersionSeparator);
    return { name: splitNameGeneric[0], generic: splitNameGeneric[1] };
};
