/**
 * Copyright 2026 Arm Limited
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

/* eslint-disable @typescript-eslint/no-empty-object-type */
// package: solutions
// file: solutionsproto/solutions.proto

import * as jspb from 'google-protobuf';
import * as packsproto_packs_pb from './packs_pb';

export class FilePath extends jspb.Message {
    getPath(): string;
    setPath(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FilePath.AsObject;
    static toObject(includeInstance: boolean, msg: FilePath): FilePath.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FilePath, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FilePath;
    static deserializeBinaryFromReader(message: FilePath, reader: jspb.BinaryReader): FilePath;
}

export namespace FilePath {
  export type AsObject = {
    path: string,
  }
}

export class ProjectInSolution extends jspb.Message {
    hasSolution(): boolean;
    clearSolution(): void;
    getSolution(): SolutionData | undefined;
    setSolution(value?: SolutionData): void;

    hasProjectId(): boolean;
    clearProjectId(): void;
    getProjectId(): ProjectId | undefined;
    setProjectId(value?: ProjectId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ProjectInSolution.AsObject;
    static toObject(includeInstance: boolean, msg: ProjectInSolution): ProjectInSolution.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ProjectInSolution, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ProjectInSolution;
    static deserializeBinaryFromReader(message: ProjectInSolution, reader: jspb.BinaryReader): ProjectInSolution;
}

export namespace ProjectInSolution {
  export type AsObject = {
    solution?: SolutionData.AsObject,
    projectId?: ProjectId.AsObject,
  }
}

export class ProjectId extends jspb.Message {
    getId(): string;
    setId(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ProjectId.AsObject;
    static toObject(includeInstance: boolean, msg: ProjectId): ProjectId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ProjectId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ProjectId;
    static deserializeBinaryFromReader(message: ProjectId, reader: jspb.BinaryReader): ProjectId;
}

export namespace ProjectId {
  export type AsObject = {
    id: string,
  }
}

export class ComponentReference extends jspb.Message {
    getBundleName(): string;
    setBundleName(value: string): void;

    getClassName(): string;
    setClassName(value: string): void;

    getGroup(): string;
    setGroup(value: string): void;

    getSubgroup(): string;
    setSubgroup(value: string): void;

    getVendor(): string;
    setVendor(value: string): void;

    getVersion(): string;
    setVersion(value: string): void;

    getVariant(): string;
    setVariant(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentReference.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentReference): ComponentReference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentReference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentReference;
    static deserializeBinaryFromReader(message: ComponentReference, reader: jspb.BinaryReader): ComponentReference;
}

export namespace ComponentReference {
  export type AsObject = {
    bundleName: string,
    className: string,
    group: string,
    subgroup: string,
    vendor: string,
    version: string,
    variant: string,
  }
}

export class TrackedComponentReference extends jspb.Message {
    hasReference(): boolean;
    clearReference(): void;
    getReference(): ComponentReference | undefined;
    setReference(value?: ComponentReference): void;

    hasOrigin(): boolean;
    clearOrigin(): void;
    getOrigin(): ComponentOrigin | undefined;
    setOrigin(value?: ComponentOrigin): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TrackedComponentReference.AsObject;
    static toObject(includeInstance: boolean, msg: TrackedComponentReference): TrackedComponentReference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TrackedComponentReference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TrackedComponentReference;
    static deserializeBinaryFromReader(message: TrackedComponentReference, reader: jspb.BinaryReader): TrackedComponentReference;
}

export namespace TrackedComponentReference {
  export type AsObject = {
    reference?: ComponentReference.AsObject,
    origin?: ComponentOrigin.AsObject,
  }
}

export class ComponentOrigin extends jspb.Message {
    hasProjectId(): boolean;
    clearProjectId(): void;
    getProjectId(): ProjectId | undefined;
    setProjectId(value?: ProjectId): void;

    hasLayerId(): boolean;
    clearLayerId(): void;
    getLayerId(): LayerId | undefined;
    setLayerId(value?: LayerId): void;

    getOriginCase(): ComponentOrigin.OriginCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentOrigin.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentOrigin): ComponentOrigin.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentOrigin, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentOrigin;
    static deserializeBinaryFromReader(message: ComponentOrigin, reader: jspb.BinaryReader): ComponentOrigin;
}

export namespace ComponentOrigin {
  export type AsObject = {
    projectId?: ProjectId.AsObject,
    layerId?: LayerId.AsObject,
  }

  export enum OriginCase {
    ORIGIN_NOT_SET = 0,
    PROJECT_ID = 1,
    LAYER_ID = 2,
  }
}

export class ProjectInfo extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): ProjectId | undefined;
    setId(value?: ProjectId): void;

    clearContextsList(): void;
    getContextsList(): Array<BuildContext>;
    setContextsList(value: Array<BuildContext>): void;
    addContexts(value?: BuildContext, index?: number): BuildContext;

    clearComponentsList(): void;
    getComponentsList(): Array<ComponentReference>;
    setComponentsList(value: Array<ComponentReference>): void;
    addComponents(value?: ComponentReference, index?: number): ComponentReference;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ProjectInfo.AsObject;
    static toObject(includeInstance: boolean, msg: ProjectInfo): ProjectInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ProjectInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ProjectInfo;
    static deserializeBinaryFromReader(message: ProjectInfo, reader: jspb.BinaryReader): ProjectInfo;
}

export namespace ProjectInfo {
  export type AsObject = {
    id?: ProjectId.AsObject,
    contextsList: Array<BuildContext.AsObject>,
    componentsList: Array<ComponentReference.AsObject>,
  }
}

export class LayerId extends jspb.Message {
    getId(): string;
    setId(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): LayerId.AsObject;
    static toObject(includeInstance: boolean, msg: LayerId): LayerId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: LayerId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): LayerId;
    static deserializeBinaryFromReader(message: LayerId, reader: jspb.BinaryReader): LayerId;
}

export namespace LayerId {
  export type AsObject = {
    id: string,
  }
}

export class SolutionChangeRequest extends jspb.Message {
    hasSolution(): boolean;
    clearSolution(): void;
    getSolution(): SolutionData | undefined;
    setSolution(value?: SolutionData): void;

    hasAddPack(): boolean;
    clearAddPack(): void;
    getAddPack(): packsproto_packs_pb.PackId | undefined;
    setAddPack(value?: packsproto_packs_pb.PackId): void;

    hasRemovePack(): boolean;
    clearRemovePack(): void;
    getRemovePack(): packsproto_packs_pb.PackId | undefined;
    setRemovePack(value?: packsproto_packs_pb.PackId): void;

    getChangeCase(): SolutionChangeRequest.ChangeCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SolutionChangeRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SolutionChangeRequest): SolutionChangeRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SolutionChangeRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SolutionChangeRequest;
    static deserializeBinaryFromReader(message: SolutionChangeRequest, reader: jspb.BinaryReader): SolutionChangeRequest;
}

export namespace SolutionChangeRequest {
  export type AsObject = {
    solution?: SolutionData.AsObject,
    addPack?: packsproto_packs_pb.PackId.AsObject,
    removePack?: packsproto_packs_pb.PackId.AsObject,
  }

  export enum ChangeCase {
    CHANGE_NOT_SET = 0,
    ADD_PACK = 3,
    REMOVE_PACK = 4,
  }
}

export class Device extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    getVendor(): string;
    setVendor(value: string): void;

    getProcessor(): string;
    setProcessor(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Device.AsObject;
    static toObject(includeInstance: boolean, msg: Device): Device.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Device, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Device;
    static deserializeBinaryFromReader(message: Device, reader: jspb.BinaryReader): Device;
}

export namespace Device {
  export type AsObject = {
    name: string,
    vendor: string,
    processor: string,
  }
}

export class DeviceAndToolchainInfo extends jspb.Message {
    hasBuildContext(): boolean;
    clearBuildContext(): void;
    getBuildContext(): BuildContext | undefined;
    setBuildContext(value?: BuildContext): void;

    hasTargetOptions(): boolean;
    clearTargetOptions(): void;
    getTargetOptions(): packsproto_packs_pb.TargetOptions | undefined;
    setTargetOptions(value?: packsproto_packs_pb.TargetOptions): void;

    hasToolchainOptions(): boolean;
    clearToolchainOptions(): void;
    getToolchainOptions(): packsproto_packs_pb.ToolchainOptions | undefined;
    setToolchainOptions(value?: packsproto_packs_pb.ToolchainOptions): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceAndToolchainInfo.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceAndToolchainInfo): DeviceAndToolchainInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceAndToolchainInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceAndToolchainInfo;
    static deserializeBinaryFromReader(message: DeviceAndToolchainInfo, reader: jspb.BinaryReader): DeviceAndToolchainInfo;
}

export namespace DeviceAndToolchainInfo {
  export type AsObject = {
    buildContext?: BuildContext.AsObject,
    targetOptions?: packsproto_packs_pb.TargetOptions.AsObject,
    toolchainOptions?: packsproto_packs_pb.ToolchainOptions.AsObject,
  }
}

export class ProcessorInfo extends jspb.Message {
    hasDevice(): boolean;
    clearDevice(): void;
    getDevice(): Device | undefined;
    setDevice(value?: Device): void;

    hasProcessor(): boolean;
    clearProcessor(): void;
    getProcessor(): packsproto_packs_pb.Processor | undefined;
    setProcessor(value?: packsproto_packs_pb.Processor): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ProcessorInfo.AsObject;
    static toObject(includeInstance: boolean, msg: ProcessorInfo): ProcessorInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ProcessorInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ProcessorInfo;
    static deserializeBinaryFromReader(message: ProcessorInfo, reader: jspb.BinaryReader): ProcessorInfo;
}

export namespace ProcessorInfo {
  export type AsObject = {
    device?: Device.AsObject,
    processor?: packsproto_packs_pb.Processor.AsObject,
  }
}

export class TargetTypeInSolution extends jspb.Message {
    hasSolution(): boolean;
    clearSolution(): void;
    getSolution(): SolutionData | undefined;
    setSolution(value?: SolutionData): void;

    hasTargetTypeId(): boolean;
    clearTargetTypeId(): void;
    getTargetTypeId(): TargetTypeId | undefined;
    setTargetTypeId(value?: TargetTypeId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TargetTypeInSolution.AsObject;
    static toObject(includeInstance: boolean, msg: TargetTypeInSolution): TargetTypeInSolution.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TargetTypeInSolution, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TargetTypeInSolution;
    static deserializeBinaryFromReader(message: TargetTypeInSolution, reader: jspb.BinaryReader): TargetTypeInSolution;
}

export namespace TargetTypeInSolution {
  export type AsObject = {
    solution?: SolutionData.AsObject,
    targetTypeId?: TargetTypeId.AsObject,
  }
}

export class TargetTypeId extends jspb.Message {
    getId(): string;
    setId(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TargetTypeId.AsObject;
    static toObject(includeInstance: boolean, msg: TargetTypeId): TargetTypeId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TargetTypeId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TargetTypeId;
    static deserializeBinaryFromReader(message: TargetTypeId, reader: jspb.BinaryReader): TargetTypeId;
}

export namespace TargetTypeId {
  export type AsObject = {
    id: string,
  }
}

export class TargetTypeInfo extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): TargetTypeId | undefined;
    setId(value?: TargetTypeId): void;

    getType(): string;
    setType(value: string): void;

    hasBoardId(): boolean;
    clearBoardId(): void;
    getBoardId(): packsproto_packs_pb.BoardId | undefined;
    setBoardId(value?: packsproto_packs_pb.BoardId): void;

    getCompiler(): string;
    setCompiler(value: string): void;

    hasDevice(): boolean;
    clearDevice(): void;
    getDevice(): Device | undefined;
    setDevice(value?: Device): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TargetTypeInfo.AsObject;
    static toObject(includeInstance: boolean, msg: TargetTypeInfo): TargetTypeInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TargetTypeInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TargetTypeInfo;
    static deserializeBinaryFromReader(message: TargetTypeInfo, reader: jspb.BinaryReader): TargetTypeInfo;
}

export namespace TargetTypeInfo {
  export type AsObject = {
    id?: TargetTypeId.AsObject,
    type: string,
    boardId?: packsproto_packs_pb.BoardId.AsObject,
    compiler: string,
    device?: Device.AsObject,
  }
}

export class BuildTypeInSolution extends jspb.Message {
    hasSolution(): boolean;
    clearSolution(): void;
    getSolution(): SolutionData | undefined;
    setSolution(value?: SolutionData): void;

    hasBuildTypeId(): boolean;
    clearBuildTypeId(): void;
    getBuildTypeId(): BuildTypeId | undefined;
    setBuildTypeId(value?: BuildTypeId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BuildTypeInSolution.AsObject;
    static toObject(includeInstance: boolean, msg: BuildTypeInSolution): BuildTypeInSolution.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BuildTypeInSolution, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BuildTypeInSolution;
    static deserializeBinaryFromReader(message: BuildTypeInSolution, reader: jspb.BinaryReader): BuildTypeInSolution;
}

export namespace BuildTypeInSolution {
  export type AsObject = {
    solution?: SolutionData.AsObject,
    buildTypeId?: BuildTypeId.AsObject,
  }
}

export class BuildTypeId extends jspb.Message {
    getId(): string;
    setId(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BuildTypeId.AsObject;
    static toObject(includeInstance: boolean, msg: BuildTypeId): BuildTypeId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BuildTypeId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BuildTypeId;
    static deserializeBinaryFromReader(message: BuildTypeId, reader: jspb.BinaryReader): BuildTypeId;
}

export namespace BuildTypeId {
  export type AsObject = {
    id: string,
  }
}

export class BuildTypeInfo extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): BuildTypeId | undefined;
    setId(value?: BuildTypeId): void;

    getType(): string;
    setType(value: string): void;

    getCompiler(): string;
    setCompiler(value: string): void;

    getDebug(): boolean;
    setDebug(value: boolean): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BuildTypeInfo.AsObject;
    static toObject(includeInstance: boolean, msg: BuildTypeInfo): BuildTypeInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BuildTypeInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BuildTypeInfo;
    static deserializeBinaryFromReader(message: BuildTypeInfo, reader: jspb.BinaryReader): BuildTypeInfo;
}

export namespace BuildTypeInfo {
  export type AsObject = {
    id?: BuildTypeId.AsObject,
    type: string,
    compiler: string,
    debug: boolean,
  }
}

export class BuildContext extends jspb.Message {
    hasTargetTypeId(): boolean;
    clearTargetTypeId(): void;
    getTargetTypeId(): TargetTypeId | undefined;
    setTargetTypeId(value?: TargetTypeId): void;

    hasBuildTypeId(): boolean;
    clearBuildTypeId(): void;
    getBuildTypeId(): BuildTypeId | undefined;
    setBuildTypeId(value?: BuildTypeId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BuildContext.AsObject;
    static toObject(includeInstance: boolean, msg: BuildContext): BuildContext.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BuildContext, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BuildContext;
    static deserializeBinaryFromReader(message: BuildContext, reader: jspb.BinaryReader): BuildContext;
}

export namespace BuildContext {
  export type AsObject = {
    targetTypeId?: TargetTypeId.AsObject,
    buildTypeId?: BuildTypeId.AsObject,
  }
}

export class ProjectChangeRequest extends jspb.Message {
    hasSolution(): boolean;
    clearSolution(): void;
    getSolution(): SolutionData | undefined;
    setSolution(value?: SolutionData): void;

    hasProjectId(): boolean;
    clearProjectId(): void;
    getProjectId(): ProjectId | undefined;
    setProjectId(value?: ProjectId): void;

    hasAddComponent(): boolean;
    clearAddComponent(): void;
    getAddComponent(): ComponentSelectionRequest | undefined;
    setAddComponent(value?: ComponentSelectionRequest): void;

    hasRemoveComponent(): boolean;
    clearRemoveComponent(): void;
    getRemoveComponent(): ComponentSelectionRequest | undefined;
    setRemoveComponent(value?: ComponentSelectionRequest): void;

    hasAddPack(): boolean;
    clearAddPack(): void;
    getAddPack(): packsproto_packs_pb.PackId | undefined;
    setAddPack(value?: packsproto_packs_pb.PackId): void;

    getChangeCase(): ProjectChangeRequest.ChangeCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ProjectChangeRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ProjectChangeRequest): ProjectChangeRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ProjectChangeRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ProjectChangeRequest;
    static deserializeBinaryFromReader(message: ProjectChangeRequest, reader: jspb.BinaryReader): ProjectChangeRequest;
}

export namespace ProjectChangeRequest {
  export type AsObject = {
    solution?: SolutionData.AsObject,
    projectId?: ProjectId.AsObject,
    addComponent?: ComponentSelectionRequest.AsObject,
    removeComponent?: ComponentSelectionRequest.AsObject,
    addPack?: packsproto_packs_pb.PackId.AsObject,
  }

  export enum ChangeCase {
    CHANGE_NOT_SET = 0,
    ADD_COMPONENT = 2,
    REMOVE_COMPONENT = 3,
    ADD_PACK = 4,
  }
}

export class ValidationResponse extends jspb.Message {
    hasComponentValidation(): boolean;
    clearComponentValidation(): void;
    getComponentValidation(): ComponentValidation | undefined;
    setComponentValidation(value?: ComponentValidation): void;

    hasPackValidation(): boolean;
    clearPackValidation(): void;
    getPackValidation(): PackValidation | undefined;
    setPackValidation(value?: PackValidation): void;

    hasHardwareValidation(): boolean;
    clearHardwareValidation(): void;
    getHardwareValidation(): HardwareValidation | undefined;
    setHardwareValidation(value?: HardwareValidation): void;

    getValidationResultCase(): ValidationResponse.ValidationResultCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ValidationResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ValidationResponse): ValidationResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ValidationResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ValidationResponse;
    static deserializeBinaryFromReader(message: ValidationResponse, reader: jspb.BinaryReader): ValidationResponse;
}

export namespace ValidationResponse {
  export type AsObject = {
    componentValidation?: ComponentValidation.AsObject,
    packValidation?: PackValidation.AsObject,
    hardwareValidation?: HardwareValidation.AsObject,
  }

  export enum ValidationResultCase {
    VALIDATION_RESULT_NOT_SET = 0,
    COMPONENT_VALIDATION = 3,
    PACK_VALIDATION = 4,
    HARDWARE_VALIDATION = 5,
  }
}

export class AvailableComponentInfo extends jspb.Message {
    hasBuildContext(): boolean;
    clearBuildContext(): void;
    getBuildContext(): BuildContext | undefined;
    setBuildContext(value?: BuildContext): void;

    hasComponentId(): boolean;
    clearComponentId(): void;
    getComponentId(): packsproto_packs_pb.ComponentId | undefined;
    setComponentId(value?: packsproto_packs_pb.ComponentId): void;

    hasDoc(): boolean;
    clearDoc(): void;
    getDoc(): packsproto_packs_pb.Doc | undefined;
    setDoc(value?: packsproto_packs_pb.Doc): void;

    getDefaultVariant(): boolean;
    setDefaultVariant(value: boolean): void;

    hasSourcePackMetadata(): boolean;
    clearSourcePackMetadata(): void;
    getSourcePackMetadata(): SourcePackMetadata | undefined;
    setSourcePackMetadata(value?: SourcePackMetadata): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AvailableComponentInfo.AsObject;
    static toObject(includeInstance: boolean, msg: AvailableComponentInfo): AvailableComponentInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AvailableComponentInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AvailableComponentInfo;
    static deserializeBinaryFromReader(message: AvailableComponentInfo, reader: jspb.BinaryReader): AvailableComponentInfo;
}

export namespace AvailableComponentInfo {
  export type AsObject = {
    buildContext?: BuildContext.AsObject,
    componentId?: packsproto_packs_pb.ComponentId.AsObject,
    doc?: packsproto_packs_pb.Doc.AsObject,
    defaultVariant: boolean,
    sourcePackMetadata?: SourcePackMetadata.AsObject,
  }
}

export class SourcePackMetadata extends jspb.Message {
    getSelectedInSolution(): boolean;
    setSelectedInSolution(value: boolean): void;

    getInstalled(): boolean;
    setInstalled(value: boolean): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SourcePackMetadata.AsObject;
    static toObject(includeInstance: boolean, msg: SourcePackMetadata): SourcePackMetadata.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SourcePackMetadata, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SourcePackMetadata;
    static deserializeBinaryFromReader(message: SourcePackMetadata, reader: jspb.BinaryReader): SourcePackMetadata;
}

export namespace SourcePackMetadata {
  export type AsObject = {
    selectedInSolution: boolean,
    installed: boolean,
  }
}

export class SelectedComponentInfo extends jspb.Message {
    hasBuildContext(): boolean;
    clearBuildContext(): void;
    getBuildContext(): BuildContext | undefined;
    setBuildContext(value?: BuildContext): void;

    hasComponentId(): boolean;
    clearComponentId(): void;
    getComponentId(): packsproto_packs_pb.ComponentId | undefined;
    setComponentId(value?: packsproto_packs_pb.ComponentId): void;

    hasReference(): boolean;
    clearReference(): void;
    getReference(): TrackedComponentReference | undefined;
    setReference(value?: TrackedComponentReference): void;

    clearFilesList(): void;
    getFilesList(): Array<packsproto_packs_pb.ComponentFile>;
    setFilesList(value: Array<packsproto_packs_pb.ComponentFile>): void;
    addFiles(value?: packsproto_packs_pb.ComponentFile, index?: number): packsproto_packs_pb.ComponentFile;

    clearConfigFilesList(): void;
    getConfigFilesList(): Array<ConfigFile>;
    setConfigFilesList(value: Array<ConfigFile>): void;
    addConfigFiles(value?: ConfigFile, index?: number): ConfigFile;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SelectedComponentInfo.AsObject;
    static toObject(includeInstance: boolean, msg: SelectedComponentInfo): SelectedComponentInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SelectedComponentInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SelectedComponentInfo;
    static deserializeBinaryFromReader(message: SelectedComponentInfo, reader: jspb.BinaryReader): SelectedComponentInfo;
}

export namespace SelectedComponentInfo {
  export type AsObject = {
    buildContext?: BuildContext.AsObject,
    componentId?: packsproto_packs_pb.ComponentId.AsObject,
    reference?: TrackedComponentReference.AsObject,
    filesList: Array<packsproto_packs_pb.ComponentFile.AsObject>,
    configFilesList: Array<ConfigFile.AsObject>,
  }
}

export class ConfigFile extends jspb.Message {
    hasSource(): boolean;
    clearSource(): void;
    getSource(): packsproto_packs_pb.AssetReference | undefined;
    setSource(value?: packsproto_packs_pb.AssetReference): void;

    getPath(): string;
    setPath(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ConfigFile.AsObject;
    static toObject(includeInstance: boolean, msg: ConfigFile): ConfigFile.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ConfigFile, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ConfigFile;
    static deserializeBinaryFromReader(message: ConfigFile, reader: jspb.BinaryReader): ConfigFile;
}

export namespace ConfigFile {
  export type AsObject = {
    source?: packsproto_packs_pb.AssetReference.AsObject,
    path: string,
  }
}

export class SelectedLayerInfo extends jspb.Message {
    hasBuildContext(): boolean;
    clearBuildContext(): void;
    getBuildContext(): BuildContext | undefined;
    setBuildContext(value?: BuildContext): void;

    hasLayerId(): boolean;
    clearLayerId(): void;
    getLayerId(): LayerId | undefined;
    setLayerId(value?: LayerId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SelectedLayerInfo.AsObject;
    static toObject(includeInstance: boolean, msg: SelectedLayerInfo): SelectedLayerInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SelectedLayerInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SelectedLayerInfo;
    static deserializeBinaryFromReader(message: SelectedLayerInfo, reader: jspb.BinaryReader): SelectedLayerInfo;
}

export namespace SelectedLayerInfo {
  export type AsObject = {
    buildContext?: BuildContext.AsObject,
    layerId?: LayerId.AsObject,
  }
}

export class ComponentSelectionRequest extends jspb.Message {
    clearBuildContextsList(): void;
    getBuildContextsList(): Array<BuildContext>;
    setBuildContextsList(value: Array<BuildContext>): void;
    addBuildContexts(value?: BuildContext, index?: number): BuildContext;

    hasReference(): boolean;
    clearReference(): void;
    getReference(): ComponentReference | undefined;
    setReference(value?: ComponentReference): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentSelectionRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentSelectionRequest): ComponentSelectionRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentSelectionRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentSelectionRequest;
    static deserializeBinaryFromReader(message: ComponentSelectionRequest, reader: jspb.BinaryReader): ComponentSelectionRequest;
}

export namespace ComponentSelectionRequest {
  export type AsObject = {
    buildContextsList: Array<BuildContext.AsObject>,
    reference?: ComponentReference.AsObject,
  }
}

export class ComponentValidation extends jspb.Message {
    hasComponent(): boolean;
    clearComponent(): void;
    getComponent(): TrackedComponentReference | undefined;
    setComponent(value?: TrackedComponentReference): void;

    hasProjectId(): boolean;
    clearProjectId(): void;
    getProjectId(): ProjectId | undefined;
    setProjectId(value?: ProjectId): void;

    hasBuildContext(): boolean;
    clearBuildContext(): void;
    getBuildContext(): BuildContext | undefined;
    setBuildContext(value?: BuildContext): void;

    getMessage(): string;
    setMessage(value: string): void;

    hasNotFoundInPackCache(): boolean;
    clearNotFoundInPackCache(): void;
    getNotFoundInPackCache(): ComponentNotFoundInPackCache | undefined;
    setNotFoundInPackCache(value?: ComponentNotFoundInPackCache): void;

    hasMatchesManyInPackCache(): boolean;
    clearMatchesManyInPackCache(): void;
    getMatchesManyInPackCache(): ComponentMatchesManyInPackCache | undefined;
    setMatchesManyInPackCache(value?: ComponentMatchesManyInPackCache): void;

    hasNotFoundInPackScope(): boolean;
    clearNotFoundInPackScope(): void;
    getNotFoundInPackScope(): ComponentNotFoundInPackScope | undefined;
    setNotFoundInPackScope(value?: ComponentNotFoundInPackScope): void;

    hasMatchesManyInPackScope(): boolean;
    clearMatchesManyInPackScope(): void;
    getMatchesManyInPackScope(): ComponentMatchesManyInPackScope | undefined;
    setMatchesManyInPackScope(value?: ComponentMatchesManyInPackScope): void;

    hasIncompatibleWithDeviceAndToolchain(): boolean;
    clearIncompatibleWithDeviceAndToolchain(): void;
    getIncompatibleWithDeviceAndToolchain(): ComponentIncompatibleWithDeviceAndToolchain | undefined;
    setIncompatibleWithDeviceAndToolchain(value?: ComponentIncompatibleWithDeviceAndToolchain): void;

    hasHasFailingConditions(): boolean;
    clearHasFailingConditions(): void;
    getHasFailingConditions(): ComponentHasFailingConditions | undefined;
    setHasFailingConditions(value?: ComponentHasFailingConditions): void;

    hasHasUnresolvableDependencies(): boolean;
    clearHasUnresolvableDependencies(): void;
    getHasUnresolvableDependencies(): ComponentHasUnresolvableDependencies | undefined;
    setHasUnresolvableDependencies(value?: ComponentHasUnresolvableDependencies): void;

    hasHasDependenciesIncompatibleWithDeviceAndToolchain(): boolean;
    clearHasDependenciesIncompatibleWithDeviceAndToolchain(): void;
    getHasDependenciesIncompatibleWithDeviceAndToolchain(): ComponentHasDependenciesIncompatibleWithDeviceAndToolchain | undefined;
    setHasDependenciesIncompatibleWithDeviceAndToolchain(value?: ComponentHasDependenciesIncompatibleWithDeviceAndToolchain): void;

    getValidationTypeCase(): ComponentValidation.ValidationTypeCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentValidation.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentValidation): ComponentValidation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentValidation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentValidation;
    static deserializeBinaryFromReader(message: ComponentValidation, reader: jspb.BinaryReader): ComponentValidation;
}

export namespace ComponentValidation {
  export type AsObject = {
    component?: TrackedComponentReference.AsObject,
    projectId?: ProjectId.AsObject,
    buildContext?: BuildContext.AsObject,
    message: string,
    notFoundInPackCache?: ComponentNotFoundInPackCache.AsObject,
    matchesManyInPackCache?: ComponentMatchesManyInPackCache.AsObject,
    notFoundInPackScope?: ComponentNotFoundInPackScope.AsObject,
    matchesManyInPackScope?: ComponentMatchesManyInPackScope.AsObject,
    incompatibleWithDeviceAndToolchain?: ComponentIncompatibleWithDeviceAndToolchain.AsObject,
    hasFailingConditions?: ComponentHasFailingConditions.AsObject,
    hasUnresolvableDependencies?: ComponentHasUnresolvableDependencies.AsObject,
    hasDependenciesIncompatibleWithDeviceAndToolchain?: ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.AsObject,
  }

  export enum ValidationTypeCase {
    VALIDATION_TYPE_NOT_SET = 0,
    NOT_FOUND_IN_PACK_CACHE = 5,
    MATCHES_MANY_IN_PACK_CACHE = 6,
    NOT_FOUND_IN_PACK_SCOPE = 7,
    MATCHES_MANY_IN_PACK_SCOPE = 8,
    INCOMPATIBLE_WITH_DEVICE_AND_TOOLCHAIN = 9,
    HAS_FAILING_CONDITIONS = 10,
    HAS_UNRESOLVABLE_DEPENDENCIES = 11,
    HAS_DEPENDENCIES_INCOMPATIBLE_WITH_DEVICE_AND_TOOLCHAIN = 12,
  }
}

export class ComponentNotFoundInPackCache extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentNotFoundInPackCache.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentNotFoundInPackCache): ComponentNotFoundInPackCache.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentNotFoundInPackCache, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentNotFoundInPackCache;
    static deserializeBinaryFromReader(message: ComponentNotFoundInPackCache, reader: jspb.BinaryReader): ComponentNotFoundInPackCache;
}

export namespace ComponentNotFoundInPackCache {
  export type AsObject = {}
}

export class ComponentNotFoundInPackScope extends jspb.Message {
    clearPackIdsList(): void;
    getPackIdsList(): Array<packsproto_packs_pb.PackId>;
    setPackIdsList(value: Array<packsproto_packs_pb.PackId>): void;
    addPackIds(value?: packsproto_packs_pb.PackId, index?: number): packsproto_packs_pb.PackId;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentNotFoundInPackScope.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentNotFoundInPackScope): ComponentNotFoundInPackScope.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentNotFoundInPackScope, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentNotFoundInPackScope;
    static deserializeBinaryFromReader(message: ComponentNotFoundInPackScope, reader: jspb.BinaryReader): ComponentNotFoundInPackScope;
}

export namespace ComponentNotFoundInPackScope {
  export type AsObject = {
    packIdsList: Array<packsproto_packs_pb.PackId.AsObject>,
  }
}

export class ComponentMatchesManyInPackCache extends jspb.Message {
    clearComponentIdsList(): void;
    getComponentIdsList(): Array<packsproto_packs_pb.ComponentId>;
    setComponentIdsList(value: Array<packsproto_packs_pb.ComponentId>): void;
    addComponentIds(value?: packsproto_packs_pb.ComponentId, index?: number): packsproto_packs_pb.ComponentId;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentMatchesManyInPackCache.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentMatchesManyInPackCache): ComponentMatchesManyInPackCache.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentMatchesManyInPackCache, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentMatchesManyInPackCache;
    static deserializeBinaryFromReader(message: ComponentMatchesManyInPackCache, reader: jspb.BinaryReader): ComponentMatchesManyInPackCache;
}

export namespace ComponentMatchesManyInPackCache {
  export type AsObject = {
    componentIdsList: Array<packsproto_packs_pb.ComponentId.AsObject>,
  }
}

export class ComponentMatchesManyInPackScope extends jspb.Message {
    clearComponentIdsList(): void;
    getComponentIdsList(): Array<packsproto_packs_pb.ComponentId>;
    setComponentIdsList(value: Array<packsproto_packs_pb.ComponentId>): void;
    addComponentIds(value?: packsproto_packs_pb.ComponentId, index?: number): packsproto_packs_pb.ComponentId;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentMatchesManyInPackScope.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentMatchesManyInPackScope): ComponentMatchesManyInPackScope.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentMatchesManyInPackScope, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentMatchesManyInPackScope;
    static deserializeBinaryFromReader(message: ComponentMatchesManyInPackScope, reader: jspb.BinaryReader): ComponentMatchesManyInPackScope;
}

export namespace ComponentMatchesManyInPackScope {
  export type AsObject = {
    componentIdsList: Array<packsproto_packs_pb.ComponentId.AsObject>,
  }
}

export class ComponentIncompatibleWithDeviceAndToolchain extends jspb.Message {
    clearConstraintsList(): void;
    getConstraintsList(): Array<DeviceAndToolchainConstraints>;
    setConstraintsList(value: Array<DeviceAndToolchainConstraints>): void;
    addConstraints(value?: DeviceAndToolchainConstraints, index?: number): DeviceAndToolchainConstraints;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentIncompatibleWithDeviceAndToolchain.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentIncompatibleWithDeviceAndToolchain): ComponentIncompatibleWithDeviceAndToolchain.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentIncompatibleWithDeviceAndToolchain, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentIncompatibleWithDeviceAndToolchain;
    static deserializeBinaryFromReader(message: ComponentIncompatibleWithDeviceAndToolchain, reader: jspb.BinaryReader): ComponentIncompatibleWithDeviceAndToolchain;
}

export namespace ComponentIncompatibleWithDeviceAndToolchain {
  export type AsObject = {
    constraintsList: Array<DeviceAndToolchainConstraints.AsObject>,
  }
}

export class DeviceAndToolchainConstraints extends jspb.Message {
    getAttributeToConstraintMap(): jspb.Map<string, DeviceAndToolchainConstraint>;
    clearAttributeToConstraintMap(): void;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceAndToolchainConstraints.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceAndToolchainConstraints): DeviceAndToolchainConstraints.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceAndToolchainConstraints, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceAndToolchainConstraints;
    static deserializeBinaryFromReader(message: DeviceAndToolchainConstraints, reader: jspb.BinaryReader): DeviceAndToolchainConstraints;
}

export namespace DeviceAndToolchainConstraints {
  export type AsObject = {
    attributeToConstraintMap: Array<[string, DeviceAndToolchainConstraint.AsObject]>,
  }
}

export class DeviceAndToolchainConstraint extends jspb.Message {
    getKind(): DeviceAndToolchainConstraint.KindMap[keyof DeviceAndToolchainConstraint.KindMap];
    setKind(value: DeviceAndToolchainConstraint.KindMap[keyof DeviceAndToolchainConstraint.KindMap]): void;

    getValue(): string;
    setValue(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceAndToolchainConstraint.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceAndToolchainConstraint): DeviceAndToolchainConstraint.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceAndToolchainConstraint, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceAndToolchainConstraint;
    static deserializeBinaryFromReader(message: DeviceAndToolchainConstraint, reader: jspb.BinaryReader): DeviceAndToolchainConstraint;
}

export namespace DeviceAndToolchainConstraint {
  export type AsObject = {
    kind: DeviceAndToolchainConstraint.KindMap[keyof DeviceAndToolchainConstraint.KindMap],
    value: string,
  }

  export interface KindMap {
    MATCH: 0;
    NOT_MATCH: 1;
  }

  export const Kind: KindMap;
}

export class ComponentHasFailingConditions extends jspb.Message {
    clearFixesList(): void;
    getFixesList(): Array<ComponentConditionFixSet>;
    setFixesList(value: Array<ComponentConditionFixSet>): void;
    addFixes(value?: ComponentConditionFixSet, index?: number): ComponentConditionFixSet;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentHasFailingConditions.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentHasFailingConditions): ComponentHasFailingConditions.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentHasFailingConditions, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentHasFailingConditions;
    static deserializeBinaryFromReader(message: ComponentHasFailingConditions, reader: jspb.BinaryReader): ComponentHasFailingConditions;
}

export namespace ComponentHasFailingConditions {
  export type AsObject = {
    fixesList: Array<ComponentConditionFixSet.AsObject>,
  }
}

export class ComponentConditionFixSet extends jspb.Message {
    clearFixesList(): void;
    getFixesList(): Array<ComponentConditionFix>;
    setFixesList(value: Array<ComponentConditionFix>): void;
    addFixes(value?: ComponentConditionFix, index?: number): ComponentConditionFix;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentConditionFixSet.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentConditionFixSet): ComponentConditionFixSet.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentConditionFixSet, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentConditionFixSet;
    static deserializeBinaryFromReader(message: ComponentConditionFixSet, reader: jspb.BinaryReader): ComponentConditionFixSet;
}

export namespace ComponentConditionFixSet {
  export type AsObject = {
    fixesList: Array<ComponentConditionFix.AsObject>,
  }
}

export class ComponentConditionFix extends jspb.Message {
    hasAddDependentComponent(): boolean;
    clearAddDependentComponent(): void;
    getAddDependentComponent(): packsproto_packs_pb.ListComponentsRequest | undefined;
    setAddDependentComponent(value?: packsproto_packs_pb.ListComponentsRequest): void;

    hasRemoveConflictingComponent(): boolean;
    clearRemoveConflictingComponent(): void;
    getRemoveConflictingComponent(): TrackedComponentReference | undefined;
    setRemoveConflictingComponent(value?: TrackedComponentReference): void;

    getTypeCase(): ComponentConditionFix.TypeCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentConditionFix.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentConditionFix): ComponentConditionFix.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentConditionFix, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentConditionFix;
    static deserializeBinaryFromReader(message: ComponentConditionFix, reader: jspb.BinaryReader): ComponentConditionFix;
}

export namespace ComponentConditionFix {
  export type AsObject = {
    addDependentComponent?: packsproto_packs_pb.ListComponentsRequest.AsObject,
    removeConflictingComponent?: TrackedComponentReference.AsObject,
  }

  export enum TypeCase {
    TYPE_NOT_SET = 0,
    ADD_DEPENDENT_COMPONENT = 1,
    REMOVE_CONFLICTING_COMPONENT = 2,
  }
}

export class PackValidation extends jspb.Message {
    getCode(): PackValidation.ResultCodeMap[keyof PackValidation.ResultCodeMap];
    setCode(value: PackValidation.ResultCodeMap[keyof PackValidation.ResultCodeMap]): void;

    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): packsproto_packs_pb.PackId | undefined;
    setPackId(value?: packsproto_packs_pb.PackId): void;

    hasReference(): boolean;
    clearReference(): void;
    getReference(): TrackedPackReference | undefined;
    setReference(value?: TrackedPackReference): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackValidation.AsObject;
    static toObject(includeInstance: boolean, msg: PackValidation): PackValidation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackValidation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackValidation;
    static deserializeBinaryFromReader(message: PackValidation, reader: jspb.BinaryReader): PackValidation;
}

export namespace PackValidation {
  export type AsObject = {
    code: PackValidation.ResultCodeMap[keyof PackValidation.ResultCodeMap],
    packId?: packsproto_packs_pb.PackId.AsObject,
    reference?: TrackedPackReference.AsObject,
  }

  export interface ResultCodeMap {
    PACK_NOT_INSTALLED: 0;
    PACK_FAMILY_UNKNOWN: 1;
    PACK_VERSION_UNKNOWN: 2;
    MANIFEST_ERROR: 3;
  }

  export const ResultCode: ResultCodeMap;
}

export class ComponentHasUnresolvableDependencies extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentHasUnresolvableDependencies.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentHasUnresolvableDependencies): ComponentHasUnresolvableDependencies.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentHasUnresolvableDependencies, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentHasUnresolvableDependencies;
    static deserializeBinaryFromReader(message: ComponentHasUnresolvableDependencies, reader: jspb.BinaryReader): ComponentHasUnresolvableDependencies;
}

export namespace ComponentHasUnresolvableDependencies {
  export type AsObject = {
  }
}

export class ComponentHasDependenciesIncompatibleWithDeviceAndToolchain extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentHasDependenciesIncompatibleWithDeviceAndToolchain): ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentHasDependenciesIncompatibleWithDeviceAndToolchain, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentHasDependenciesIncompatibleWithDeviceAndToolchain;
    static deserializeBinaryFromReader(message: ComponentHasDependenciesIncompatibleWithDeviceAndToolchain, reader: jspb.BinaryReader): ComponentHasDependenciesIncompatibleWithDeviceAndToolchain;
}

export namespace ComponentHasDependenciesIncompatibleWithDeviceAndToolchain {
  export type AsObject = {
  }
}

export class HardwareValidation extends jspb.Message {
    hasHardware(): boolean;
    clearHardware(): void;
    getHardware(): TrackedHardware | undefined;
    setHardware(value?: TrackedHardware): void;

    hasProjectId(): boolean;
    clearProjectId(): void;
    getProjectId(): ProjectId | undefined;
    setProjectId(value?: ProjectId): void;

    hasBuildContext(): boolean;
    clearBuildContext(): void;
    getBuildContext(): BuildContext | undefined;
    setBuildContext(value?: BuildContext): void;

    getMessage(): string;
    setMessage(value: string): void;

    hasError(): boolean;
    clearError(): void;
    getError(): HardwareValidationError | undefined;
    setError(value?: HardwareValidationError): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HardwareValidation.AsObject;
    static toObject(includeInstance: boolean, msg: HardwareValidation): HardwareValidation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HardwareValidation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HardwareValidation;
    static deserializeBinaryFromReader(message: HardwareValidation, reader: jspb.BinaryReader): HardwareValidation;
}

export namespace HardwareValidation {
  export type AsObject = {
    hardware?: TrackedHardware.AsObject,
    projectId?: ProjectId.AsObject,
    buildContext?: BuildContext.AsObject,
    message: string,
    error?: HardwareValidationError.AsObject,
  }
}

export class TrackedHardware extends jspb.Message {
    hasBoardVendor(): boolean;
    clearBoardVendor(): void;
    getBoardVendor(): TrackedElement | undefined;
    setBoardVendor(value?: TrackedElement): void;

    hasBoardName(): boolean;
    clearBoardName(): void;
    getBoardName(): TrackedElement | undefined;
    setBoardName(value?: TrackedElement): void;

    hasBoardRevision(): boolean;
    clearBoardRevision(): void;
    getBoardRevision(): TrackedElement | undefined;
    setBoardRevision(value?: TrackedElement): void;

    hasDeviceVendor(): boolean;
    clearDeviceVendor(): void;
    getDeviceVendor(): TrackedElement | undefined;
    setDeviceVendor(value?: TrackedElement): void;

    hasDeviceName(): boolean;
    clearDeviceName(): void;
    getDeviceName(): TrackedElement | undefined;
    setDeviceName(value?: TrackedElement): void;

    hasDeviceProcessor(): boolean;
    clearDeviceProcessor(): void;
    getDeviceProcessor(): TrackedElement | undefined;
    setDeviceProcessor(value?: TrackedElement): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TrackedHardware.AsObject;
    static toObject(includeInstance: boolean, msg: TrackedHardware): TrackedHardware.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TrackedHardware, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TrackedHardware;
    static deserializeBinaryFromReader(message: TrackedHardware, reader: jspb.BinaryReader): TrackedHardware;
}

export namespace TrackedHardware {
  export type AsObject = {
    boardVendor?: TrackedElement.AsObject,
    boardName?: TrackedElement.AsObject,
    boardRevision?: TrackedElement.AsObject,
    deviceVendor?: TrackedElement.AsObject,
    deviceName?: TrackedElement.AsObject,
    deviceProcessor?: TrackedElement.AsObject,
  }
}

export class TrackedElement extends jspb.Message {
    getValue(): string;
    setValue(value: string): void;

    hasOrigin(): boolean;
    clearOrigin(): void;
    getOrigin(): HardwareOrigin | undefined;
    setOrigin(value?: HardwareOrigin): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TrackedElement.AsObject;
    static toObject(includeInstance: boolean, msg: TrackedElement): TrackedElement.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TrackedElement, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TrackedElement;
    static deserializeBinaryFromReader(message: TrackedElement, reader: jspb.BinaryReader): TrackedElement;
}

export namespace TrackedElement {
  export type AsObject = {
    value: string,
    origin?: HardwareOrigin.AsObject,
  }
}

export class HardwareOrigin extends jspb.Message {
    hasTargetTypeId(): boolean;
    clearTargetTypeId(): void;
    getTargetTypeId(): TargetTypeId | undefined;
    setTargetTypeId(value?: TargetTypeId): void;

    hasProjectId(): boolean;
    clearProjectId(): void;
    getProjectId(): ProjectId | undefined;
    setProjectId(value?: ProjectId): void;

    hasLayerId(): boolean;
    clearLayerId(): void;
    getLayerId(): LayerId | undefined;
    setLayerId(value?: LayerId): void;

    getOriginCase(): HardwareOrigin.OriginCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HardwareOrigin.AsObject;
    static toObject(includeInstance: boolean, msg: HardwareOrigin): HardwareOrigin.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HardwareOrigin, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HardwareOrigin;
    static deserializeBinaryFromReader(message: HardwareOrigin, reader: jspb.BinaryReader): HardwareOrigin;
}

export namespace HardwareOrigin {
  export type AsObject = {
    targetTypeId?: TargetTypeId.AsObject,
    projectId?: ProjectId.AsObject,
    layerId?: LayerId.AsObject,
  }

  export enum OriginCase {
    ORIGIN_NOT_SET = 0,
    TARGET_TYPE_ID = 1,
    PROJECT_ID = 2,
    LAYER_ID = 3,
  }
}

export class HardwareValidationError extends jspb.Message {
    hasBoardNotFound(): boolean;
    clearBoardNotFound(): void;
    getBoardNotFound(): BoardNotFound | undefined;
    setBoardNotFound(value?: BoardNotFound): void;

    hasManyBoardsFound(): boolean;
    clearManyBoardsFound(): void;
    getManyBoardsFound(): ManyBoardsFound | undefined;
    setManyBoardsFound(value?: ManyBoardsFound): void;

    hasUnableToResolveDeviceOnMatchingBoards(): boolean;
    clearUnableToResolveDeviceOnMatchingBoards(): void;
    getUnableToResolveDeviceOnMatchingBoards(): UnableToResolveDeviceOnMatchingBoards | undefined;
    setUnableToResolveDeviceOnMatchingBoards(value?: UnableToResolveDeviceOnMatchingBoards): void;

    hasUnableToResolveDeviceOnBoard(): boolean;
    clearUnableToResolveDeviceOnBoard(): void;
    getUnableToResolveDeviceOnBoard(): UnableToResolveDeviceOnBoard | undefined;
    setUnableToResolveDeviceOnBoard(value?: UnableToResolveDeviceOnBoard): void;

    hasDeviceNotFound(): boolean;
    clearDeviceNotFound(): void;
    getDeviceNotFound(): DeviceNotFound | undefined;
    setDeviceNotFound(value?: DeviceNotFound): void;

    hasProcessorNotFoundOnDevice(): boolean;
    clearProcessorNotFoundOnDevice(): void;
    getProcessorNotFoundOnDevice(): ProcessorNotFoundOnDevice | undefined;
    setProcessorNotFoundOnDevice(value?: ProcessorNotFoundOnDevice): void;

    hasProcessorMustBeSpecified(): boolean;
    clearProcessorMustBeSpecified(): void;
    getProcessorMustBeSpecified(): ProcessorMustBeSpecified | undefined;
    setProcessorMustBeSpecified(value?: ProcessorMustBeSpecified): void;

    getErrorTypeCase(): HardwareValidationError.ErrorTypeCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HardwareValidationError.AsObject;
    static toObject(includeInstance: boolean, msg: HardwareValidationError): HardwareValidationError.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HardwareValidationError, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HardwareValidationError;
    static deserializeBinaryFromReader(message: HardwareValidationError, reader: jspb.BinaryReader): HardwareValidationError;
}

export namespace HardwareValidationError {
  export type AsObject = {
    boardNotFound?: BoardNotFound.AsObject,
    manyBoardsFound?: ManyBoardsFound.AsObject,
    unableToResolveDeviceOnMatchingBoards?: UnableToResolveDeviceOnMatchingBoards.AsObject,
    unableToResolveDeviceOnBoard?: UnableToResolveDeviceOnBoard.AsObject,
    deviceNotFound?: DeviceNotFound.AsObject,
    processorNotFoundOnDevice?: ProcessorNotFoundOnDevice.AsObject,
    processorMustBeSpecified?: ProcessorMustBeSpecified.AsObject,
  }

  export enum ErrorTypeCase {
    ERROR_TYPE_NOT_SET = 0,
    BOARD_NOT_FOUND = 1,
    MANY_BOARDS_FOUND = 2,
    UNABLE_TO_RESOLVE_DEVICE_ON_MATCHING_BOARDS = 3,
    UNABLE_TO_RESOLVE_DEVICE_ON_BOARD = 4,
    DEVICE_NOT_FOUND = 5,
    PROCESSOR_NOT_FOUND_ON_DEVICE = 6,
    PROCESSOR_MUST_BE_SPECIFIED = 7,
  }
}

export class BoardNotFound extends jspb.Message {
    hasBoardConstraints(): boolean;
    clearBoardConstraints(): void;
    getBoardConstraints(): BoardConstraints | undefined;
    setBoardConstraints(value?: BoardConstraints): void;

    hasPackScope(): boolean;
    clearPackScope(): void;
    getPackScope(): PackScope | undefined;
    setPackScope(value?: PackScope): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BoardNotFound.AsObject;
    static toObject(includeInstance: boolean, msg: BoardNotFound): BoardNotFound.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BoardNotFound, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BoardNotFound;
    static deserializeBinaryFromReader(message: BoardNotFound, reader: jspb.BinaryReader): BoardNotFound;
}

export namespace BoardNotFound {
  export type AsObject = {
    boardConstraints?: BoardConstraints.AsObject,
    packScope?: PackScope.AsObject,
  }
}

export class ManyBoardsFound extends jspb.Message {
    hasBoardConstraints(): boolean;
    clearBoardConstraints(): void;
    getBoardConstraints(): BoardConstraints | undefined;
    setBoardConstraints(value?: BoardConstraints): void;

    hasPackScope(): boolean;
    clearPackScope(): void;
    getPackScope(): PackScope | undefined;
    setPackScope(value?: PackScope): void;

    clearBoardsList(): void;
    getBoardsList(): Array<packsproto_packs_pb.BoardId>;
    setBoardsList(value: Array<packsproto_packs_pb.BoardId>): void;
    addBoards(value?: packsproto_packs_pb.BoardId, index?: number): packsproto_packs_pb.BoardId;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ManyBoardsFound.AsObject;
    static toObject(includeInstance: boolean, msg: ManyBoardsFound): ManyBoardsFound.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ManyBoardsFound, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ManyBoardsFound;
    static deserializeBinaryFromReader(message: ManyBoardsFound, reader: jspb.BinaryReader): ManyBoardsFound;
}

export namespace ManyBoardsFound {
  export type AsObject = {
    boardConstraints?: BoardConstraints.AsObject,
    packScope?: PackScope.AsObject,
    boardsList: Array<packsproto_packs_pb.BoardId.AsObject>,
  }
}

export class UnableToResolveDeviceOnMatchingBoards extends jspb.Message {
    hasBoardConstraints(): boolean;
    clearBoardConstraints(): void;
    getBoardConstraints(): BoardConstraints | undefined;
    setBoardConstraints(value?: BoardConstraints): void;

    hasDeviceConstraints(): boolean;
    clearDeviceConstraints(): void;
    getDeviceConstraints(): DeviceConstraints | undefined;
    setDeviceConstraints(value?: DeviceConstraints): void;

    hasPackScope(): boolean;
    clearPackScope(): void;
    getPackScope(): PackScope | undefined;
    setPackScope(value?: PackScope): void;

    clearBoardsList(): void;
    getBoardsList(): Array<packsproto_packs_pb.BoardId>;
    setBoardsList(value: Array<packsproto_packs_pb.BoardId>): void;
    addBoards(value?: packsproto_packs_pb.BoardId, index?: number): packsproto_packs_pb.BoardId;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UnableToResolveDeviceOnMatchingBoards.AsObject;
    static toObject(includeInstance: boolean, msg: UnableToResolveDeviceOnMatchingBoards): UnableToResolveDeviceOnMatchingBoards.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UnableToResolveDeviceOnMatchingBoards, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UnableToResolveDeviceOnMatchingBoards;
    static deserializeBinaryFromReader(message: UnableToResolveDeviceOnMatchingBoards, reader: jspb.BinaryReader): UnableToResolveDeviceOnMatchingBoards;
}

export namespace UnableToResolveDeviceOnMatchingBoards {
  export type AsObject = {
    boardConstraints?: BoardConstraints.AsObject,
    deviceConstraints?: DeviceConstraints.AsObject,
    packScope?: PackScope.AsObject,
    boardsList: Array<packsproto_packs_pb.BoardId.AsObject>,
  }
}

export class UnableToResolveDeviceOnBoard extends jspb.Message {
    hasBoardConstraints(): boolean;
    clearBoardConstraints(): void;
    getBoardConstraints(): BoardConstraints | undefined;
    setBoardConstraints(value?: BoardConstraints): void;

    hasPackScope(): boolean;
    clearPackScope(): void;
    getPackScope(): PackScope | undefined;
    setPackScope(value?: PackScope): void;

    hasBoard(): boolean;
    clearBoard(): void;
    getBoard(): packsproto_packs_pb.BoardId | undefined;
    setBoard(value?: packsproto_packs_pb.BoardId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UnableToResolveDeviceOnBoard.AsObject;
    static toObject(includeInstance: boolean, msg: UnableToResolveDeviceOnBoard): UnableToResolveDeviceOnBoard.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UnableToResolveDeviceOnBoard, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UnableToResolveDeviceOnBoard;
    static deserializeBinaryFromReader(message: UnableToResolveDeviceOnBoard, reader: jspb.BinaryReader): UnableToResolveDeviceOnBoard;
}

export namespace UnableToResolveDeviceOnBoard {
  export type AsObject = {
    boardConstraints?: BoardConstraints.AsObject,
    packScope?: PackScope.AsObject,
    board?: packsproto_packs_pb.BoardId.AsObject,
  }
}

export class DeviceNotFound extends jspb.Message {
    hasDeviceConstraints(): boolean;
    clearDeviceConstraints(): void;
    getDeviceConstraints(): DeviceConstraints | undefined;
    setDeviceConstraints(value?: DeviceConstraints): void;

    hasPackScope(): boolean;
    clearPackScope(): void;
    getPackScope(): PackScope | undefined;
    setPackScope(value?: PackScope): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceNotFound.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceNotFound): DeviceNotFound.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceNotFound, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceNotFound;
    static deserializeBinaryFromReader(message: DeviceNotFound, reader: jspb.BinaryReader): DeviceNotFound;
}

export namespace DeviceNotFound {
  export type AsObject = {
    deviceConstraints?: DeviceConstraints.AsObject,
    packScope?: PackScope.AsObject,
  }
}

export class ProcessorNotFoundOnDevice extends jspb.Message {
    hasPackScope(): boolean;
    clearPackScope(): void;
    getPackScope(): PackScope | undefined;
    setPackScope(value?: PackScope): void;

    getProcessor(): string;
    setProcessor(value: string): void;

    hasDeviceReference(): boolean;
    clearDeviceReference(): void;
    getDeviceReference(): packsproto_packs_pb.DeviceReference | undefined;
    setDeviceReference(value?: packsproto_packs_pb.DeviceReference): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ProcessorNotFoundOnDevice.AsObject;
    static toObject(includeInstance: boolean, msg: ProcessorNotFoundOnDevice): ProcessorNotFoundOnDevice.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ProcessorNotFoundOnDevice, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ProcessorNotFoundOnDevice;
    static deserializeBinaryFromReader(message: ProcessorNotFoundOnDevice, reader: jspb.BinaryReader): ProcessorNotFoundOnDevice;
}

export namespace ProcessorNotFoundOnDevice {
  export type AsObject = {
    packScope?: PackScope.AsObject,
    processor: string,
    deviceReference?: packsproto_packs_pb.DeviceReference.AsObject,
  }
}

export class ProcessorMustBeSpecified extends jspb.Message {
    hasPackScope(): boolean;
    clearPackScope(): void;
    getPackScope(): PackScope | undefined;
    setPackScope(value?: PackScope): void;

    hasDeviceReference(): boolean;
    clearDeviceReference(): void;
    getDeviceReference(): packsproto_packs_pb.DeviceReference | undefined;
    setDeviceReference(value?: packsproto_packs_pb.DeviceReference): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ProcessorMustBeSpecified.AsObject;
    static toObject(includeInstance: boolean, msg: ProcessorMustBeSpecified): ProcessorMustBeSpecified.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ProcessorMustBeSpecified, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ProcessorMustBeSpecified;
    static deserializeBinaryFromReader(message: ProcessorMustBeSpecified, reader: jspb.BinaryReader): ProcessorMustBeSpecified;
}

export namespace ProcessorMustBeSpecified {
  export type AsObject = {
    packScope?: PackScope.AsObject,
    deviceReference?: packsproto_packs_pb.DeviceReference.AsObject,
  }
}

export class BoardConstraints extends jspb.Message {
    getVendor(): string;
    setVendor(value: string): void;

    getName(): string;
    setName(value: string): void;

    getRevision(): string;
    setRevision(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BoardConstraints.AsObject;
    static toObject(includeInstance: boolean, msg: BoardConstraints): BoardConstraints.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BoardConstraints, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BoardConstraints;
    static deserializeBinaryFromReader(message: BoardConstraints, reader: jspb.BinaryReader): BoardConstraints;
}

export namespace BoardConstraints {
  export type AsObject = {
    vendor: string,
    name: string,
    revision: string,
  }
}

export class DeviceConstraints extends jspb.Message {
    getVendor(): string;
    setVendor(value: string): void;

    getName(): string;
    setName(value: string): void;

    getProcessor(): string;
    setProcessor(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceConstraints.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceConstraints): DeviceConstraints.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceConstraints, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceConstraints;
    static deserializeBinaryFromReader(message: DeviceConstraints, reader: jspb.BinaryReader): DeviceConstraints;
}

export namespace DeviceConstraints {
  export type AsObject = {
    vendor: string,
    name: string,
    processor: string,
  }
}

export class PackScope extends jspb.Message {
    clearPackScopeList(): void;
    getPackScopeList(): Array<packsproto_packs_pb.PackId>;
    setPackScopeList(value: Array<packsproto_packs_pb.PackId>): void;
    addPackScope(value?: packsproto_packs_pb.PackId, index?: number): packsproto_packs_pb.PackId;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackScope.AsObject;
    static toObject(includeInstance: boolean, msg: PackScope): PackScope.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackScope, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackScope;
    static deserializeBinaryFromReader(message: PackScope, reader: jspb.BinaryReader): PackScope;
}

export namespace PackScope {
  export type AsObject = {
    packScopeList: Array<packsproto_packs_pb.PackId.AsObject>,
  }
}

export class ComponentClassDoc extends jspb.Message {
    getClassName(): string;
    setClassName(value: string): void;

    hasBundleName(): boolean;
    clearBundleName(): void;
    getBundleName(): string;
    setBundleName(value: string): void;

    hasDoc(): boolean;
    clearDoc(): void;
    getDoc(): packsproto_packs_pb.Doc | undefined;
    setDoc(value?: packsproto_packs_pb.Doc): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentClassDoc.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentClassDoc): ComponentClassDoc.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentClassDoc, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentClassDoc;
    static deserializeBinaryFromReader(message: ComponentClassDoc, reader: jspb.BinaryReader): ComponentClassDoc;
}

export namespace ComponentClassDoc {
  export type AsObject = {
    className: string,
    bundleName: string,
    doc?: packsproto_packs_pb.Doc.AsObject,
  }
}

export class ComponentGroupDoc extends jspb.Message {
    getClassName(): string;
    setClassName(value: string): void;

    getGroup(): string;
    setGroup(value: string): void;

    hasBuildContext(): boolean;
    clearBuildContext(): void;
    getBuildContext(): BuildContext | undefined;
    setBuildContext(value?: BuildContext): void;

    hasDoc(): boolean;
    clearDoc(): void;
    getDoc(): packsproto_packs_pb.Doc | undefined;
    setDoc(value?: packsproto_packs_pb.Doc): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentGroupDoc.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentGroupDoc): ComponentGroupDoc.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentGroupDoc, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentGroupDoc;
    static deserializeBinaryFromReader(message: ComponentGroupDoc, reader: jspb.BinaryReader): ComponentGroupDoc;
}

export namespace ComponentGroupDoc {
  export type AsObject = {
    className: string,
    group: string,
    buildContext?: BuildContext.AsObject,
    doc?: packsproto_packs_pb.Doc.AsObject,
  }
}

export class SelectedPackInfo extends jspb.Message {
    hasBuildContext(): boolean;
    clearBuildContext(): void;
    getBuildContext(): BuildContext | undefined;
    setBuildContext(value?: BuildContext): void;

    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): packsproto_packs_pb.PackId | undefined;
    setPackId(value?: packsproto_packs_pb.PackId): void;

    hasReference(): boolean;
    clearReference(): void;
    getReference(): TrackedPackReference | undefined;
    setReference(value?: TrackedPackReference): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SelectedPackInfo.AsObject;
    static toObject(includeInstance: boolean, msg: SelectedPackInfo): SelectedPackInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SelectedPackInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SelectedPackInfo;
    static deserializeBinaryFromReader(message: SelectedPackInfo, reader: jspb.BinaryReader): SelectedPackInfo;
}

export namespace SelectedPackInfo {
  export type AsObject = {
    buildContext?: BuildContext.AsObject,
    packId?: packsproto_packs_pb.PackId.AsObject,
    reference?: TrackedPackReference.AsObject,
  }
}

export class PackReference extends jspb.Message {
    getVendor(): string;
    setVendor(value: string): void;

    hasName(): boolean;
    clearName(): void;
    getName(): string;
    setName(value: string): void;

    hasVersion(): boolean;
    clearVersion(): void;
    getVersion(): string;
    setVersion(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackReference.AsObject;
    static toObject(includeInstance: boolean, msg: PackReference): PackReference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackReference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackReference;
    static deserializeBinaryFromReader(message: PackReference, reader: jspb.BinaryReader): PackReference;
}

export namespace PackReference {
  export type AsObject = {
    vendor: string,
    name: string,
    version: string,
  }
}

export class TrackedPackReference extends jspb.Message {
    hasReference(): boolean;
    clearReference(): void;
    getReference(): PackReference | undefined;
    setReference(value?: PackReference): void;

    hasOrigin(): boolean;
    clearOrigin(): void;
    getOrigin(): PackOrigin | undefined;
    setOrigin(value?: PackOrigin): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TrackedPackReference.AsObject;
    static toObject(includeInstance: boolean, msg: TrackedPackReference): TrackedPackReference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TrackedPackReference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TrackedPackReference;
    static deserializeBinaryFromReader(message: TrackedPackReference, reader: jspb.BinaryReader): TrackedPackReference;
}

export namespace TrackedPackReference {
  export type AsObject = {
    reference?: PackReference.AsObject,
    origin?: PackOrigin.AsObject,
  }
}

export class Solution extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Solution.AsObject;
    static toObject(includeInstance: boolean, msg: Solution): Solution.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Solution, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Solution;
    static deserializeBinaryFromReader(message: Solution, reader: jspb.BinaryReader): Solution;
}

export namespace Solution {
  export type AsObject = {
  }
}

export class PackOrigin extends jspb.Message {
    hasSolution(): boolean;
    clearSolution(): void;
    getSolution(): Solution | undefined;
    setSolution(value?: Solution): void;

    hasProjectId(): boolean;
    clearProjectId(): void;
    getProjectId(): ProjectId | undefined;
    setProjectId(value?: ProjectId): void;

    hasLayerId(): boolean;
    clearLayerId(): void;
    getLayerId(): LayerId | undefined;
    setLayerId(value?: LayerId): void;

    getOriginCase(): PackOrigin.OriginCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackOrigin.AsObject;
    static toObject(includeInstance: boolean, msg: PackOrigin): PackOrigin.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackOrigin, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackOrigin;
    static deserializeBinaryFromReader(message: PackOrigin, reader: jspb.BinaryReader): PackOrigin;
}

export namespace PackOrigin {
  export type AsObject = {
    solution?: Solution.AsObject,
    projectId?: ProjectId.AsObject,
    layerId?: LayerId.AsObject,
  }

  export enum OriginCase {
    ORIGIN_NOT_SET = 0,
    SOLUTION = 1,
    PROJECT_ID = 2,
    LAYER_ID = 3,
  }
}

export class SolutionData extends jspb.Message {
    clearTargetTypesList(): void;
    getTargetTypesList(): Array<TargetTypeData>;
    setTargetTypesList(value: Array<TargetTypeData>): void;
    addTargetTypes(value?: TargetTypeData, index?: number): TargetTypeData;

    clearBuildTypesList(): void;
    getBuildTypesList(): Array<BuildTypeData>;
    setBuildTypesList(value: Array<BuildTypeData>): void;
    addBuildTypes(value?: BuildTypeData, index?: number): BuildTypeData;

    clearProjectsList(): void;
    getProjectsList(): Array<ProjectData>;
    setProjectsList(value: Array<ProjectData>): void;
    addProjects(value?: ProjectData, index?: number): ProjectData;

    clearPacksList(): void;
    getPacksList(): Array<PackData>;
    setPacksList(value: Array<PackData>): void;
    addPacks(value?: PackData, index?: number): PackData;

    clearLayersList(): void;
    getLayersList(): Array<LayerData>;
    setLayersList(value: Array<LayerData>): void;
    addLayers(value?: LayerData, index?: number): LayerData;

    hasProcessor(): boolean;
    clearProcessor(): void;
    getProcessor(): ProcessorData | undefined;
    setProcessor(value?: ProcessorData): void;

    hasCompiler(): boolean;
    clearCompiler(): void;
    getCompiler(): Compiler | undefined;
    setCompiler(value?: Compiler): void;

    hasDefaultConfiguration(): boolean;
    clearDefaultConfiguration(): void;
    getDefaultConfiguration(): DefaultConfigurationData | undefined;
    setDefaultConfiguration(value?: DefaultConfigurationData): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SolutionData.AsObject;
    static toObject(includeInstance: boolean, msg: SolutionData): SolutionData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SolutionData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SolutionData;
    static deserializeBinaryFromReader(message: SolutionData, reader: jspb.BinaryReader): SolutionData;
}

export namespace SolutionData {
  export type AsObject = {
    targetTypesList: Array<TargetTypeData.AsObject>,
    buildTypesList: Array<BuildTypeData.AsObject>,
    projectsList: Array<ProjectData.AsObject>,
    packsList: Array<PackData.AsObject>,
    layersList: Array<LayerData.AsObject>,
    processor?: ProcessorData.AsObject,
    compiler?: Compiler.AsObject,
    defaultConfiguration?: DefaultConfigurationData.AsObject,
  }
}

export class TargetTypeData extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): TargetTypeId | undefined;
    setId(value?: TargetTypeId): void;

    hasBoard(): boolean;
    clearBoard(): void;
    getBoard(): BoardReference | undefined;
    setBoard(value?: BoardReference): void;

    hasDevice(): boolean;
    clearDevice(): void;
    getDevice(): Device | undefined;
    setDevice(value?: Device): void;

    hasProcessor(): boolean;
    clearProcessor(): void;
    getProcessor(): ProcessorData | undefined;
    setProcessor(value?: ProcessorData): void;

    hasCompiler(): boolean;
    clearCompiler(): void;
    getCompiler(): Compiler | undefined;
    setCompiler(value?: Compiler): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TargetTypeData.AsObject;
    static toObject(includeInstance: boolean, msg: TargetTypeData): TargetTypeData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TargetTypeData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TargetTypeData;
    static deserializeBinaryFromReader(message: TargetTypeData, reader: jspb.BinaryReader): TargetTypeData;
}

export namespace TargetTypeData {
  export type AsObject = {
    id?: TargetTypeId.AsObject,
    board?: BoardReference.AsObject,
    device?: Device.AsObject,
    processor?: ProcessorData.AsObject,
    compiler?: Compiler.AsObject,
  }
}

export class BuildTypeData extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): BuildTypeId | undefined;
    setId(value?: BuildTypeId): void;

    hasProcessor(): boolean;
    clearProcessor(): void;
    getProcessor(): ProcessorData | undefined;
    setProcessor(value?: ProcessorData): void;

    hasCompiler(): boolean;
    clearCompiler(): void;
    getCompiler(): Compiler | undefined;
    setCompiler(value?: Compiler): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BuildTypeData.AsObject;
    static toObject(includeInstance: boolean, msg: BuildTypeData): BuildTypeData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BuildTypeData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BuildTypeData;
    static deserializeBinaryFromReader(message: BuildTypeData, reader: jspb.BinaryReader): BuildTypeData;
}

export namespace BuildTypeData {
  export type AsObject = {
    id?: BuildTypeId.AsObject,
    processor?: ProcessorData.AsObject,
    compiler?: Compiler.AsObject,
  }
}

export class ProjectData extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): ProjectId | undefined;
    setId(value?: ProjectId): void;

    clearComponentsList(): void;
    getComponentsList(): Array<ComponentData>;
    setComponentsList(value: Array<ComponentData>): void;
    addComponents(value?: ComponentData, index?: number): ComponentData;

    clearForContextsList(): void;
    getForContextsList(): Array<BuildContext>;
    setForContextsList(value: Array<BuildContext>): void;
    addForContexts(value?: BuildContext, index?: number): BuildContext;

    clearNotForContextsList(): void;
    getNotForContextsList(): Array<BuildContext>;
    setNotForContextsList(value: Array<BuildContext>): void;
    addNotForContexts(value?: BuildContext, index?: number): BuildContext;

    clearPacksList(): void;
    getPacksList(): Array<PackData>;
    setPacksList(value: Array<PackData>): void;
    addPacks(value?: PackData, index?: number): PackData;

    clearLayersList(): void;
    getLayersList(): Array<IncludedLayer>;
    setLayersList(value: Array<IncludedLayer>): void;
    addLayers(value?: IncludedLayer, index?: number): IncludedLayer;

    hasBoard(): boolean;
    clearBoard(): void;
    getBoard(): BoardReference | undefined;
    setBoard(value?: BoardReference): void;

    hasDevice(): boolean;
    clearDevice(): void;
    getDevice(): Device | undefined;
    setDevice(value?: Device): void;

    hasProcessor(): boolean;
    clearProcessor(): void;
    getProcessor(): ProcessorData | undefined;
    setProcessor(value?: ProcessorData): void;

    hasCompiler(): boolean;
    clearCompiler(): void;
    getCompiler(): Compiler | undefined;
    setCompiler(value?: Compiler): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ProjectData.AsObject;
    static toObject(includeInstance: boolean, msg: ProjectData): ProjectData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ProjectData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ProjectData;
    static deserializeBinaryFromReader(message: ProjectData, reader: jspb.BinaryReader): ProjectData;
}

export namespace ProjectData {
  export type AsObject = {
    id?: ProjectId.AsObject,
    componentsList: Array<ComponentData.AsObject>,
    forContextsList: Array<BuildContext.AsObject>,
    notForContextsList: Array<BuildContext.AsObject>,
    packsList: Array<PackData.AsObject>,
    layersList: Array<IncludedLayer.AsObject>,
    board?: BoardReference.AsObject,
    device?: Device.AsObject,
    processor?: ProcessorData.AsObject,
    compiler?: Compiler.AsObject,
  }
}

export class PackData extends jspb.Message {
    hasReference(): boolean;
    clearReference(): void;
    getReference(): PackReference | undefined;
    setReference(value?: PackReference): void;

    clearForContextsList(): void;
    getForContextsList(): Array<BuildContext>;
    setForContextsList(value: Array<BuildContext>): void;
    addForContexts(value?: BuildContext, index?: number): BuildContext;

    clearNotForContextsList(): void;
    getNotForContextsList(): Array<BuildContext>;
    setNotForContextsList(value: Array<BuildContext>): void;
    addNotForContexts(value?: BuildContext, index?: number): BuildContext;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackData.AsObject;
    static toObject(includeInstance: boolean, msg: PackData): PackData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackData;
    static deserializeBinaryFromReader(message: PackData, reader: jspb.BinaryReader): PackData;
}

export namespace PackData {
  export type AsObject = {
    reference?: PackReference.AsObject,
    forContextsList: Array<BuildContext.AsObject>,
    notForContextsList: Array<BuildContext.AsObject>,
  }
}

export class ComponentData extends jspb.Message {
    hasReference(): boolean;
    clearReference(): void;
    getReference(): ComponentReference | undefined;
    setReference(value?: ComponentReference): void;

    clearForContextsList(): void;
    getForContextsList(): Array<BuildContext>;
    setForContextsList(value: Array<BuildContext>): void;
    addForContexts(value?: BuildContext, index?: number): BuildContext;

    clearNotForContextsList(): void;
    getNotForContextsList(): Array<BuildContext>;
    setNotForContextsList(value: Array<BuildContext>): void;
    addNotForContexts(value?: BuildContext, index?: number): BuildContext;

    getInstances(): number;
    setInstances(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentData.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentData): ComponentData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentData;
    static deserializeBinaryFromReader(message: ComponentData, reader: jspb.BinaryReader): ComponentData;
}

export namespace ComponentData {
  export type AsObject = {
    reference?: ComponentReference.AsObject,
    forContextsList: Array<BuildContext.AsObject>,
    notForContextsList: Array<BuildContext.AsObject>,
    instances: number,
  }
}

export class ProcessorData extends jspb.Message {
    getFpu(): FpuMap[keyof FpuMap];
    setFpu(value: FpuMap[keyof FpuMap]): void;

    getTrustzone(): TrustzoneMap[keyof TrustzoneMap];
    setTrustzone(value: TrustzoneMap[keyof TrustzoneMap]): void;

    getEndian(): EndianMap[keyof EndianMap];
    setEndian(value: EndianMap[keyof EndianMap]): void;

    getDsp(): DspMap[keyof DspMap];
    setDsp(value: DspMap[keyof DspMap]): void;

    getMve(): MveMap[keyof MveMap];
    setMve(value: MveMap[keyof MveMap]): void;

    getBranchProtection(): BranchProtectionMap[keyof BranchProtectionMap];
    setBranchProtection(value: BranchProtectionMap[keyof BranchProtectionMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ProcessorData.AsObject;
    static toObject(includeInstance: boolean, msg: ProcessorData): ProcessorData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ProcessorData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ProcessorData;
    static deserializeBinaryFromReader(message: ProcessorData, reader: jspb.BinaryReader): ProcessorData;
}

export namespace ProcessorData {
  export type AsObject = {
    fpu: FpuMap[keyof FpuMap],
    trustzone: TrustzoneMap[keyof TrustzoneMap],
    endian: EndianMap[keyof EndianMap],
    dsp: DspMap[keyof DspMap],
    mve: MveMap[keyof MveMap],
    branchProtection: BranchProtectionMap[keyof BranchProtectionMap],
  }
}

export class Compiler extends jspb.Message {
    getName(): Compiler.NameMap[keyof Compiler.NameMap];
    setName(value: Compiler.NameMap[keyof Compiler.NameMap]): void;

    hasVersion(): boolean;
    clearVersion(): void;
    getVersion(): string;
    setVersion(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Compiler.AsObject;
    static toObject(includeInstance: boolean, msg: Compiler): Compiler.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Compiler, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Compiler;
    static deserializeBinaryFromReader(message: Compiler, reader: jspb.BinaryReader): Compiler;
}

export namespace Compiler {
  export type AsObject = {
    name: Compiler.NameMap[keyof Compiler.NameMap],
    version: string,
  }

  export interface NameMap {
    GCC: 0;
    AC6: 1;
    IAR: 2;
    CLANG: 3;
  }

  export const Name: NameMap;
}

export class BoardReference extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    hasVendor(): boolean;
    clearVendor(): void;
    getVendor(): string;
    setVendor(value: string): void;

    hasRevision(): boolean;
    clearRevision(): void;
    getRevision(): string;
    setRevision(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BoardReference.AsObject;
    static toObject(includeInstance: boolean, msg: BoardReference): BoardReference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BoardReference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BoardReference;
    static deserializeBinaryFromReader(message: BoardReference, reader: jspb.BinaryReader): BoardReference;
}

export namespace BoardReference {
  export type AsObject = {
    name: string,
    vendor: string,
    revision: string,
  }
}

export class LayerData extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): LayerId | undefined;
    setId(value?: LayerId): void;

    clearComponentsList(): void;
    getComponentsList(): Array<ComponentData>;
    setComponentsList(value: Array<ComponentData>): void;
    addComponents(value?: ComponentData, index?: number): ComponentData;

    clearPacksList(): void;
    getPacksList(): Array<PackData>;
    setPacksList(value: Array<PackData>): void;
    addPacks(value?: PackData, index?: number): PackData;

    hasBoard(): boolean;
    clearBoard(): void;
    getBoard(): BoardReference | undefined;
    setBoard(value?: BoardReference): void;

    hasCompiler(): boolean;
    clearCompiler(): void;
    getCompiler(): Compiler | undefined;
    setCompiler(value?: Compiler): void;

    hasDevice(): boolean;
    clearDevice(): void;
    getDevice(): Device | undefined;
    setDevice(value?: Device): void;

    hasProcessor(): boolean;
    clearProcessor(): void;
    getProcessor(): ProcessorData | undefined;
    setProcessor(value?: ProcessorData): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): LayerData.AsObject;
    static toObject(includeInstance: boolean, msg: LayerData): LayerData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: LayerData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): LayerData;
    static deserializeBinaryFromReader(message: LayerData, reader: jspb.BinaryReader): LayerData;
}

export namespace LayerData {
  export type AsObject = {
    id?: LayerId.AsObject,
    componentsList: Array<ComponentData.AsObject>,
    packsList: Array<PackData.AsObject>,
    board?: BoardReference.AsObject,
    compiler?: Compiler.AsObject,
    device?: Device.AsObject,
    processor?: ProcessorData.AsObject,
  }
}

export class IncludedLayer extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): LayerId | undefined;
    setId(value?: LayerId): void;

    clearForContextsList(): void;
    getForContextsList(): Array<BuildContext>;
    setForContextsList(value: Array<BuildContext>): void;
    addForContexts(value?: BuildContext, index?: number): BuildContext;

    clearNotForContextsList(): void;
    getNotForContextsList(): Array<BuildContext>;
    setNotForContextsList(value: Array<BuildContext>): void;
    addNotForContexts(value?: BuildContext, index?: number): BuildContext;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): IncludedLayer.AsObject;
    static toObject(includeInstance: boolean, msg: IncludedLayer): IncludedLayer.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: IncludedLayer, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): IncludedLayer;
    static deserializeBinaryFromReader(message: IncludedLayer, reader: jspb.BinaryReader): IncludedLayer;
}

export namespace IncludedLayer {
  export type AsObject = {
    id?: LayerId.AsObject,
    forContextsList: Array<BuildContext.AsObject>,
    notForContextsList: Array<BuildContext.AsObject>,
  }
}

export class DefaultConfigurationData extends jspb.Message {
    hasCompiler(): boolean;
    clearCompiler(): void;
    getCompiler(): Compiler | undefined;
    setCompiler(value?: Compiler): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DefaultConfigurationData.AsObject;
    static toObject(includeInstance: boolean, msg: DefaultConfigurationData): DefaultConfigurationData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DefaultConfigurationData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DefaultConfigurationData;
    static deserializeBinaryFromReader(message: DefaultConfigurationData, reader: jspb.BinaryReader): DefaultConfigurationData;
}

export namespace DefaultConfigurationData {
  export type AsObject = {
    compiler?: Compiler.AsObject,
  }
}

export interface FpuMap {
  FPU_UNSPECIFIED: 0;
  FPU_SP: 1;
  FPU_DP: 2;
  FPU_OFF: 3;
}

export const Fpu: FpuMap;

export interface TrustzoneMap {
  TRUSTZONE_UNSPECIFIED: 0;
  TRUSTZONE_SECURE: 1;
  TRUSTZONE_NON_SECURE: 2;
  TRUSTZONE_OFF: 3;
}

export const Trustzone: TrustzoneMap;

export interface EndianMap {
  ENDIAN_UNSPECIFIED: 0;
  ENDIAN_LITTLE: 1;
  ENDIAN_BIG: 2;
}

export const Endian: EndianMap;

export interface DspMap {
  DSP_UNSPECIFIED: 0;
  DSP_ON: 1;
  DSP_OFF: 2;
}

export const Dsp: DspMap;

export interface MveMap {
  MVE_UNSPECIFIED: 0;
  MVE_FP: 1;
  MVE_INT: 2;
  MVE_OFF: 3;
}

export const Mve: MveMap;

export interface BranchProtectionMap {
  BRANCH_PROTECTION_UNSPECIFIED: 0;
  BRANCH_PROTECTION_BTI: 1;
  BRANCH_PROTECTION_BTI_SIGNRET: 2;
  BRANCH_PROTECTION_OFF: 3;
}

export const BranchProtection: BranchProtectionMap;

