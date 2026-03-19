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

// package: packs
// file: packsproto/packs.proto

import * as jspb from 'google-protobuf';
import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';

export class ManifestId extends jspb.Message {
    getVendor(): string;
    setVendor(value: string): void;

    getName(): string;
    setName(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ManifestId.AsObject;
    static toObject(includeInstance: boolean, msg: ManifestId): ManifestId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ManifestId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ManifestId;
    static deserializeBinaryFromReader(message: ManifestId, reader: jspb.BinaryReader): ManifestId;
}

export namespace ManifestId {
  export type AsObject = {
    vendor: string,
    name: string,
  }
}

export class DownloadPdscManifestFilesRequest extends jspb.Message {
    clearManifestIdsList(): void;
    getManifestIdsList(): Array<ManifestId>;
    setManifestIdsList(value: Array<ManifestId>): void;
    addManifestIds(value?: ManifestId, index?: number): ManifestId;

    getForce(): boolean;
    setForce(value: boolean): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DownloadPdscManifestFilesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DownloadPdscManifestFilesRequest): DownloadPdscManifestFilesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DownloadPdscManifestFilesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DownloadPdscManifestFilesRequest;
    static deserializeBinaryFromReader(message: DownloadPdscManifestFilesRequest, reader: jspb.BinaryReader): DownloadPdscManifestFilesRequest;
}

export namespace DownloadPdscManifestFilesRequest {
  export type AsObject = {
    manifestIdsList: Array<ManifestId.AsObject>,
    force: boolean,
  }
}

export class PackDownloadRequest extends jspb.Message {
    getVendor(): string;
    setVendor(value: string): void;

    getName(): string;
    setName(value: string): void;

    hasAll(): boolean;
    clearAll(): void;
    getAll(): boolean;
    setAll(value: boolean): void;

    hasSemver(): boolean;
    clearSemver(): void;
    getSemver(): string;
    setSemver(value: string): void;

    hasLatest(): boolean;
    clearLatest(): void;
    getLatest(): boolean;
    setLatest(value: boolean): void;

    hasCurrent(): boolean;
    clearCurrent(): void;
    getCurrent(): boolean;
    setCurrent(value: boolean): void;

    getVersionCase(): PackDownloadRequest.VersionCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackDownloadRequest.AsObject;
    static toObject(includeInstance: boolean, msg: PackDownloadRequest): PackDownloadRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackDownloadRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackDownloadRequest;
    static deserializeBinaryFromReader(message: PackDownloadRequest, reader: jspb.BinaryReader): PackDownloadRequest;
}

export namespace PackDownloadRequest {
  export type AsObject = {
    vendor: string,
    name: string,
    all: boolean,
    semver: string,
    latest: boolean,
    current: boolean,
  }

  export enum VersionCase {
    VERSION_NOT_SET = 0,
    ALL = 3,
    SEMVER = 4,
    LATEST = 5,
    CURRENT = 6,
  }
}

export class PackDownloadRequests extends jspb.Message {
    clearRequestsList(): void;
    getRequestsList(): Array<PackDownloadRequest>;
    setRequestsList(value: Array<PackDownloadRequest>): void;
    addRequests(value?: PackDownloadRequest, index?: number): PackDownloadRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackDownloadRequests.AsObject;
    static toObject(includeInstance: boolean, msg: PackDownloadRequests): PackDownloadRequests.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackDownloadRequests, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackDownloadRequests;
    static deserializeBinaryFromReader(message: PackDownloadRequests, reader: jspb.BinaryReader): PackDownloadRequests;
}

export namespace PackDownloadRequests {
  export type AsObject = {
    requestsList: Array<PackDownloadRequest.AsObject>,
  }
}

export class DownloadPacksRequest extends jspb.Message {
    hasAll(): boolean;
    clearAll(): void;
    getAll(): boolean;
    setAll(value: boolean): void;

    hasPackList(): boolean;
    clearPackList(): void;
    getPackList(): PackDownloadRequests | undefined;
    setPackList(value?: PackDownloadRequests): void;

    getRequestCase(): DownloadPacksRequest.RequestCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DownloadPacksRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DownloadPacksRequest): DownloadPacksRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DownloadPacksRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DownloadPacksRequest;
    static deserializeBinaryFromReader(message: DownloadPacksRequest, reader: jspb.BinaryReader): DownloadPacksRequest;
}

export namespace DownloadPacksRequest {
  export type AsObject = {
    all: boolean,
    packList?: PackDownloadRequests.AsObject,
  }

  export enum RequestCase {
    REQUEST_NOT_SET = 0,
    ALL = 1,
    PACK_LIST = 2,
  }
}

export class DownloadResponse extends jspb.Message {
    getType(): DownloadResponse.TypeMap[keyof DownloadResponse.TypeMap];
    setType(value: DownloadResponse.TypeMap[keyof DownloadResponse.TypeMap]): void;

    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

    getResult(): DownloadResponse.ResultMap[keyof DownloadResponse.ResultMap];
    setResult(value: DownloadResponse.ResultMap[keyof DownloadResponse.ResultMap]): void;

    getMessage(): string;
    setMessage(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DownloadResponse.AsObject;
    static toObject(includeInstance: boolean, msg: DownloadResponse): DownloadResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DownloadResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DownloadResponse;
    static deserializeBinaryFromReader(message: DownloadResponse, reader: jspb.BinaryReader): DownloadResponse;
}

export namespace DownloadResponse {
  export type AsObject = {
    type: DownloadResponse.TypeMap[keyof DownloadResponse.TypeMap],
    packId?: PackId.AsObject,
    result: DownloadResponse.ResultMap[keyof DownloadResponse.ResultMap],
    message: string,
  }

  export interface TypeMap {
    PIDX: 0;
    PDSC: 1;
    PACK: 2;
  }

  export const Type: TypeMap;

  export interface ResultMap {
    SUCCESS: 0;
    FAILURE: 1;
    SKIPPED: 2;
  }

  export const Result: ResultMap;
}

export class CleanupRequest extends jspb.Message {
    getDryRun(): boolean;
    setDryRun(value: boolean): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CleanupRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CleanupRequest): CleanupRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CleanupRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CleanupRequest;
    static deserializeBinaryFromReader(message: CleanupRequest, reader: jspb.BinaryReader): CleanupRequest;
}

export namespace CleanupRequest {
  export type AsObject = {
    dryRun: boolean,
  }
}

export class CleanupResponse extends jspb.Message {
    getType(): CleanupResponse.TypeMap[keyof CleanupResponse.TypeMap];
    setType(value: CleanupResponse.TypeMap[keyof CleanupResponse.TypeMap]): void;

    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

    getResult(): CleanupResponse.ResultMap[keyof CleanupResponse.ResultMap];
    setResult(value: CleanupResponse.ResultMap[keyof CleanupResponse.ResultMap]): void;

    getMessage(): string;
    setMessage(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CleanupResponse.AsObject;
    static toObject(includeInstance: boolean, msg: CleanupResponse): CleanupResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CleanupResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CleanupResponse;
    static deserializeBinaryFromReader(message: CleanupResponse, reader: jspb.BinaryReader): CleanupResponse;
}

export namespace CleanupResponse {
  export type AsObject = {
    type: CleanupResponse.TypeMap[keyof CleanupResponse.TypeMap],
    packId?: PackId.AsObject,
    result: CleanupResponse.ResultMap[keyof CleanupResponse.ResultMap],
    message: string,
  }

  export interface TypeMap {
    PIDX: 0;
    PDSC: 1;
    PACK: 2;
  }

  export const Type: TypeMap;

  export interface ResultMap {
    DELETED: 0;
    UNABLE_TO_DELETE: 1;
    SKIPPED: 2;
  }

  export const Result: ResultMap;
}

export class ListComponentsRequest extends jspb.Message {
    hasTargetOptions(): boolean;
    clearTargetOptions(): void;
    getTargetOptions(): TargetOptions | undefined;
    setTargetOptions(value?: TargetOptions): void;

    hasToolchainOptions(): boolean;
    clearToolchainOptions(): void;
    getToolchainOptions(): ToolchainOptions | undefined;
    setToolchainOptions(value?: ToolchainOptions): void;

    hasFilter(): boolean;
    clearFilter(): void;
    getFilter(): ComponentFilter | undefined;
    setFilter(value?: ComponentFilter): void;

    hasPackScope(): boolean;
    clearPackScope(): void;
    getPackScope(): PackScope | undefined;
    setPackScope(value?: PackScope): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListComponentsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListComponentsRequest): ListComponentsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListComponentsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListComponentsRequest;
    static deserializeBinaryFromReader(message: ListComponentsRequest, reader: jspb.BinaryReader): ListComponentsRequest;
}

export namespace ListComponentsRequest {
  export type AsObject = {
    targetOptions?: TargetOptions.AsObject,
    toolchainOptions?: ToolchainOptions.AsObject,
    filter?: ComponentFilter.AsObject,
    packScope?: PackScope.AsObject,
  }
}

export class PackScope extends jspb.Message {
    hasPackScopePreset(): boolean;
    clearPackScopePreset(): void;
    getPackScopePreset(): PackScopePresetMap[keyof PackScopePresetMap];
    setPackScopePreset(value: PackScopePresetMap[keyof PackScopePresetMap]): void;

    hasPackIds(): boolean;
    clearPackIds(): void;
    getPackIds(): PackIds | undefined;
    setPackIds(value?: PackIds): void;

    getPackScopeCase(): PackScope.PackScopeCase;
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
    packScopePreset: PackScopePresetMap[keyof PackScopePresetMap],
    packIds?: PackIds.AsObject,
  }

  export enum PackScopeCase {
    PACK_SCOPE_NOT_SET = 0,
    PACK_SCOPE_PRESET = 1,
    PACK_IDS = 2,
  }
}

export class PackIds extends jspb.Message {
    clearPackIdsList(): void;
    getPackIdsList(): Array<PackId>;
    setPackIdsList(value: Array<PackId>): void;
    addPackIds(value?: PackId, index?: number): PackId;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackIds.AsObject;
    static toObject(includeInstance: boolean, msg: PackIds): PackIds.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackIds, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackIds;
    static deserializeBinaryFromReader(message: PackIds, reader: jspb.BinaryReader): PackIds;
}

export namespace PackIds {
  export type AsObject = {
    packIdsList: Array<PackId.AsObject>,
  }
}

export class ListBoardsRequest extends jspb.Message {
    getIncludeDeprecated(): boolean;
    setIncludeDeprecated(value: boolean): void;

    hasFilter(): boolean;
    clearFilter(): void;
    getFilter(): BoardFilter | undefined;
    setFilter(value?: BoardFilter): void;

    getPackScopePreset(): PackScopePresetMap[keyof PackScopePresetMap];
    setPackScopePreset(value: PackScopePresetMap[keyof PackScopePresetMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListBoardsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListBoardsRequest): ListBoardsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListBoardsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListBoardsRequest;
    static deserializeBinaryFromReader(message: ListBoardsRequest, reader: jspb.BinaryReader): ListBoardsRequest;
}

export namespace ListBoardsRequest {
  export type AsObject = {
    includeDeprecated: boolean,
    filter?: BoardFilter.AsObject,
    packScopePreset: PackScopePresetMap[keyof PackScopePresetMap],
  }
}

export class GetBoardRequest extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): BoardId | undefined;
    setId(value?: BoardId): void;

    getPackScopePreset(): PackScopePresetMap[keyof PackScopePresetMap];
    setPackScopePreset(value: PackScopePresetMap[keyof PackScopePresetMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetBoardRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetBoardRequest): GetBoardRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetBoardRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetBoardRequest;
    static deserializeBinaryFromReader(message: GetBoardRequest, reader: jspb.BinaryReader): GetBoardRequest;
}

export namespace GetBoardRequest {
  export type AsObject = {
    id?: BoardId.AsObject,
    packScopePreset: PackScopePresetMap[keyof PackScopePresetMap],
  }
}

export class ListDevicesRequest extends jspb.Message {
    getPackScopePreset(): PackScopePresetMap[keyof PackScopePresetMap];
    setPackScopePreset(value: PackScopePresetMap[keyof PackScopePresetMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListDevicesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListDevicesRequest): ListDevicesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListDevicesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListDevicesRequest;
    static deserializeBinaryFromReader(message: ListDevicesRequest, reader: jspb.BinaryReader): ListDevicesRequest;
}

export namespace ListDevicesRequest {
  export type AsObject = {
    packScopePreset: PackScopePresetMap[keyof PackScopePresetMap],
  }
}

export class GetDeviceEntryRequest extends jspb.Message {
    hasReference(): boolean;
    clearReference(): void;
    getReference(): DeviceReference | undefined;
    setReference(value?: DeviceReference): void;

    getPackScopePreset(): PackScopePresetMap[keyof PackScopePresetMap];
    setPackScopePreset(value: PackScopePresetMap[keyof PackScopePresetMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetDeviceEntryRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetDeviceEntryRequest): GetDeviceEntryRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetDeviceEntryRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetDeviceEntryRequest;
    static deserializeBinaryFromReader(message: GetDeviceEntryRequest, reader: jspb.BinaryReader): GetDeviceEntryRequest;
}

export namespace GetDeviceEntryRequest {
  export type AsObject = {
    reference?: DeviceReference.AsObject,
    packScopePreset: PackScopePresetMap[keyof PackScopePresetMap],
  }
}

export class GetExampleRequest extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): ExampleId | undefined;
    setId(value?: ExampleId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetExampleRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetExampleRequest): GetExampleRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetExampleRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetExampleRequest;
    static deserializeBinaryFromReader(message: GetExampleRequest, reader: jspb.BinaryReader): GetExampleRequest;
}

export namespace GetExampleRequest {
  export type AsObject = {
    id?: ExampleId.AsObject,
  }
}

export class ListRefAppsRequest extends jspb.Message {
    hasFilter(): boolean;
    clearFilter(): void;
    getFilter(): BoardFilter | undefined;
    setFilter(value?: BoardFilter): void;

    getPackScopePreset(): PackScopePresetMap[keyof PackScopePresetMap];
    setPackScopePreset(value: PackScopePresetMap[keyof PackScopePresetMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListRefAppsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListRefAppsRequest): ListRefAppsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListRefAppsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListRefAppsRequest;
    static deserializeBinaryFromReader(message: ListRefAppsRequest, reader: jspb.BinaryReader): ListRefAppsRequest;
}

export namespace ListRefAppsRequest {
  export type AsObject = {
    filter?: BoardFilter.AsObject,
    packScopePreset: PackScopePresetMap[keyof PackScopePresetMap],
  }
}

export class ListTemplatesRequest extends jspb.Message {
    hasBoard(): boolean;
    clearBoard(): void;
    getBoard(): BoardConstraints | undefined;
    setBoard(value?: BoardConstraints): void;

    hasDevice(): boolean;
    clearDevice(): void;
    getDevice(): DeviceConstraints | undefined;
    setDevice(value?: DeviceConstraints): void;

    getPackScopePreset(): PackScopePresetMap[keyof PackScopePresetMap];
    setPackScopePreset(value: PackScopePresetMap[keyof PackScopePresetMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListTemplatesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListTemplatesRequest): ListTemplatesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListTemplatesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListTemplatesRequest;
    static deserializeBinaryFromReader(message: ListTemplatesRequest, reader: jspb.BinaryReader): ListTemplatesRequest;
}

export namespace ListTemplatesRequest {
  export type AsObject = {
    board?: BoardConstraints.AsObject,
    device?: DeviceConstraints.AsObject,
    packScopePreset: PackScopePresetMap[keyof PackScopePresetMap],
  }
}

export class ServiceVersion extends jspb.Message {
    getVersion(): string;
    setVersion(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ServiceVersion.AsObject;
    static toObject(includeInstance: boolean, msg: ServiceVersion): ServiceVersion.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ServiceVersion, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ServiceVersion;
    static deserializeBinaryFromReader(message: ServiceVersion, reader: jspb.BinaryReader): ServiceVersion;
}

export namespace ServiceVersion {
  export type AsObject = {
    version: string,
  }
}

export class CacheInitialisationStatus extends jspb.Message {
    getInitialised(): boolean;
    setInitialised(value: boolean): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CacheInitialisationStatus.AsObject;
    static toObject(includeInstance: boolean, msg: CacheInitialisationStatus): CacheInitialisationStatus.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CacheInitialisationStatus, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CacheInitialisationStatus;
    static deserializeBinaryFromReader(message: CacheInitialisationStatus, reader: jspb.BinaryReader): CacheInitialisationStatus;
}

export namespace CacheInitialisationStatus {
  export type AsObject = {
    initialised: boolean,
  }
}

export class CacheStatus extends jspb.Message {
    hasIndexStatus(): boolean;
    clearIndexStatus(): void;
    getIndexStatus(): IndexStatus | undefined;
    setIndexStatus(value?: IndexStatus): void;

    clearPackStatusList(): void;
    getPackStatusList(): Array<PackStatus>;
    setPackStatusList(value: Array<PackStatus>): void;
    addPackStatus(value?: PackStatus, index?: number): PackStatus;

    hasModTime(): boolean;
    clearModTime(): void;
    getModTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setModTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CacheStatus.AsObject;
    static toObject(includeInstance: boolean, msg: CacheStatus): CacheStatus.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CacheStatus, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CacheStatus;
    static deserializeBinaryFromReader(message: CacheStatus, reader: jspb.BinaryReader): CacheStatus;
}

export namespace CacheStatus {
  export type AsObject = {
    indexStatus?: IndexStatus.AsObject,
    packStatusList: Array<PackStatus.AsObject>,
    modTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class IndexStatus extends jspb.Message {
    hasIndexTimestamp(): boolean;
    clearIndexTimestamp(): void;
    getIndexTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setIndexTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): void;

    getPackFamilyCount(): number;
    setPackFamilyCount(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): IndexStatus.AsObject;
    static toObject(includeInstance: boolean, msg: IndexStatus): IndexStatus.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: IndexStatus, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): IndexStatus;
    static deserializeBinaryFromReader(message: IndexStatus, reader: jspb.BinaryReader): IndexStatus;
}

export namespace IndexStatus {
  export type AsObject = {
    indexTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    packFamilyCount: number,
  }
}

export class PackStatus extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    getVendor(): string;
    setVendor(value: string): void;

    getCurrentVersion(): string;
    setCurrentVersion(value: string): void;

    getLatestVersion(): string;
    setLatestVersion(value: string): void;

    getAllVersionsInstalled(): boolean;
    setAllVersionsInstalled(value: boolean): void;

    getCurrentVersionInstalled(): boolean;
    setCurrentVersionInstalled(value: boolean): void;

    getAnyVersionInstalled(): boolean;
    setAnyVersionInstalled(value: boolean): void;

    clearExpectedVersionsList(): void;
    getExpectedVersionsList(): Array<string>;
    setExpectedVersionsList(value: Array<string>): void;
    addExpectedVersions(value: string, index?: number): string;

    clearInstalledVersionsList(): void;
    getInstalledVersionsList(): Array<string>;
    setInstalledVersionsList(value: Array<string>): void;
    addInstalledVersions(value: string, index?: number): string;

    clearMissingVersionsList(): void;
    getMissingVersionsList(): Array<string>;
    setMissingVersionsList(value: Array<string>): void;
    addMissingVersions(value: string, index?: number): string;

    clearUnlistedVersionsList(): void;
    getUnlistedVersionsList(): Array<string>;
    setUnlistedVersionsList(value: Array<string>): void;
    addUnlistedVersions(value: string, index?: number): string;

    getUnlistedPackFamily(): boolean;
    setUnlistedPackFamily(value: boolean): void;

    getDeprecatedPackFamily(): boolean;
    setDeprecatedPackFamily(value: boolean): void;

    getIncompleteVersionInformation(): boolean;
    setIncompleteVersionInformation(value: boolean): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackStatus.AsObject;
    static toObject(includeInstance: boolean, msg: PackStatus): PackStatus.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackStatus, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackStatus;
    static deserializeBinaryFromReader(message: PackStatus, reader: jspb.BinaryReader): PackStatus;
}

export namespace PackStatus {
  export type AsObject = {
    name: string,
    vendor: string,
    currentVersion: string,
    latestVersion: string,
    allVersionsInstalled: boolean,
    currentVersionInstalled: boolean,
    anyVersionInstalled: boolean,
    expectedVersionsList: Array<string>,
    installedVersionsList: Array<string>,
    missingVersionsList: Array<string>,
    unlistedVersionsList: Array<string>,
    unlistedPackFamily: boolean,
    deprecatedPackFamily: boolean,
    incompleteVersionInformation: boolean,
  }
}

export class PackLoadStatus extends jspb.Message {
    getPacksLoaded(): number;
    setPacksLoaded(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackLoadStatus.AsObject;
    static toObject(includeInstance: boolean, msg: PackLoadStatus): PackLoadStatus.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackLoadStatus, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackLoadStatus;
    static deserializeBinaryFromReader(message: PackLoadStatus, reader: jspb.BinaryReader): PackLoadStatus;
}

export namespace PackLoadStatus {
  export type AsObject = {
    packsLoaded: number,
  }
}

export class BoardId extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    getVendor(): string;
    setVendor(value: string): void;

    getRevision(): string;
    setRevision(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BoardId.AsObject;
    static toObject(includeInstance: boolean, msg: BoardId): BoardId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BoardId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BoardId;
    static deserializeBinaryFromReader(message: BoardId, reader: jspb.BinaryReader): BoardId;
}

export namespace BoardId {
  export type AsObject = {
    name: string,
    vendor: string,
    revision: string,
  }
}

export class BoardFilter extends jspb.Message {
    hasName(): boolean;
    clearName(): void;
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
    toObject(includeInstance?: boolean): BoardFilter.AsObject;
    static toObject(includeInstance: boolean, msg: BoardFilter): BoardFilter.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BoardFilter, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BoardFilter;
    static deserializeBinaryFromReader(message: BoardFilter, reader: jspb.BinaryReader): BoardFilter;
}

export namespace BoardFilter {
  export type AsObject = {
    name: string,
    vendor: string,
    revision: string,
  }
}

export class PackFamilyId extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    getVendor(): string;
    setVendor(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackFamilyId.AsObject;
    static toObject(includeInstance: boolean, msg: PackFamilyId): PackFamilyId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackFamilyId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackFamilyId;
    static deserializeBinaryFromReader(message: PackFamilyId, reader: jspb.BinaryReader): PackFamilyId;
}

export namespace PackFamilyId {
  export type AsObject = {
    name: string,
    vendor: string,
  }
}

export class PackId extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    getVendor(): string;
    setVendor(value: string): void;

    getVersion(): string;
    setVersion(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackId.AsObject;
    static toObject(includeInstance: boolean, msg: PackId): PackId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackId;
    static deserializeBinaryFromReader(message: PackId, reader: jspb.BinaryReader): PackId;
}

export namespace PackId {
  export type AsObject = {
    name: string,
    vendor: string,
    version: string,
  }
}

export class PackDeprecation extends jspb.Message {
    getDeprecated(): boolean;
    setDeprecated(value: boolean): void;

    hasDeprecationDate(): boolean;
    clearDeprecationDate(): void;
    getDeprecationDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setDeprecationDate(value?: google_protobuf_timestamp_pb.Timestamp): void;

    hasReplacement(): boolean;
    clearReplacement(): void;
    getReplacement(): PackFamilyId | undefined;
    setReplacement(value?: PackFamilyId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackDeprecation.AsObject;
    static toObject(includeInstance: boolean, msg: PackDeprecation): PackDeprecation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackDeprecation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackDeprecation;
    static deserializeBinaryFromReader(message: PackDeprecation, reader: jspb.BinaryReader): PackDeprecation;
}

export namespace PackDeprecation {
  export type AsObject = {
    deprecated: boolean,
    deprecationDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    replacement?: PackFamilyId.AsObject,
  }
}

export class PackContents extends jspb.Message {
    getDefinesdevices(): boolean;
    setDefinesdevices(value: boolean): void;

    getDefinesboards(): boolean;
    setDefinesboards(value: boolean): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackContents.AsObject;
    static toObject(includeInstance: boolean, msg: PackContents): PackContents.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackContents, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackContents;
    static deserializeBinaryFromReader(message: PackContents, reader: jspb.BinaryReader): PackContents;
}

export namespace PackContents {
  export type AsObject = {
    definesdevices: boolean,
    definesboards: boolean,
  }
}

export class PackFamilyInfo extends jspb.Message {
    hasPackFamilyId(): boolean;
    clearPackFamilyId(): void;
    getPackFamilyId(): PackFamilyId | undefined;
    setPackFamilyId(value?: PackFamilyId): void;

    hasCurrentRelease(): boolean;
    clearCurrentRelease(): void;
    getCurrentRelease(): PackReleaseInfo | undefined;
    setCurrentRelease(value?: PackReleaseInfo): void;

    hasLatestRelease(): boolean;
    clearLatestRelease(): void;
    getLatestRelease(): PackReleaseInfo | undefined;
    setLatestRelease(value?: PackReleaseInfo): void;

    getDescription(): string;
    setDescription(value: string): void;

    clearKeywordsList(): void;
    getKeywordsList(): Array<string>;
    setKeywordsList(value: Array<string>): void;
    addKeywords(value: string, index?: number): string;

    clearReleasesList(): void;
    getReleasesList(): Array<PackReleaseInfo>;
    setReleasesList(value: Array<PackReleaseInfo>): void;
    addReleases(value?: PackReleaseInfo, index?: number): PackReleaseInfo;

    hasDeprecation(): boolean;
    clearDeprecation(): void;
    getDeprecation(): PackDeprecation | undefined;
    setDeprecation(value?: PackDeprecation): void;

    hasContents(): boolean;
    clearContents(): void;
    getContents(): PackContents | undefined;
    setContents(value?: PackContents): void;

    hasOverview(): boolean;
    clearOverview(): void;
    getOverview(): PackFileReference | undefined;
    setOverview(value?: PackFileReference): void;

    hasRepository(): boolean;
    clearRepository(): void;
    getRepository(): PackRepository | undefined;
    setRepository(value?: PackRepository): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackFamilyInfo.AsObject;
    static toObject(includeInstance: boolean, msg: PackFamilyInfo): PackFamilyInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackFamilyInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackFamilyInfo;
    static deserializeBinaryFromReader(message: PackFamilyInfo, reader: jspb.BinaryReader): PackFamilyInfo;
}

export namespace PackFamilyInfo {
  export type AsObject = {
    packFamilyId?: PackFamilyId.AsObject,
    currentRelease?: PackReleaseInfo.AsObject,
    latestRelease?: PackReleaseInfo.AsObject,
    description: string,
    keywordsList: Array<string>,
    releasesList: Array<PackReleaseInfo.AsObject>,
    deprecation?: PackDeprecation.AsObject,
    contents?: PackContents.AsObject,
    overview?: PackFileReference.AsObject,
    repository?: PackRepository.AsObject,
  }
}

export class PackRepository extends jspb.Message {
    getType(): string;
    setType(value: string): void;

    getUrl(): string;
    setUrl(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackRepository.AsObject;
    static toObject(includeInstance: boolean, msg: PackRepository): PackRepository.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackRepository, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackRepository;
    static deserializeBinaryFromReader(message: PackRepository, reader: jspb.BinaryReader): PackRepository;
}

export namespace PackRepository {
  export type AsObject = {
    type: string,
    url: string,
  }
}

export class PackReleaseInfo extends jspb.Message {
    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

    hasReleaseDate(): boolean;
    clearReleaseDate(): void;
    getReleaseDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setReleaseDate(value?: google_protobuf_timestamp_pb.Timestamp): void;

    getDownloadUrl(): string;
    setDownloadUrl(value: string): void;

    getReleaseNote(): string;
    setReleaseNote(value: string): void;

    getIsPrerelease(): boolean;
    setIsPrerelease(value: boolean): void;

    getInstallSpecification(): string;
    setInstallSpecification(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackReleaseInfo.AsObject;
    static toObject(includeInstance: boolean, msg: PackReleaseInfo): PackReleaseInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackReleaseInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackReleaseInfo;
    static deserializeBinaryFromReader(message: PackReleaseInfo, reader: jspb.BinaryReader): PackReleaseInfo;
}

export namespace PackReleaseInfo {
  export type AsObject = {
    packId?: PackId.AsObject,
    releaseDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    downloadUrl: string,
    releaseNote: string,
    isPrerelease: boolean,
    installSpecification: string,
  }
}

export class AssetReference extends jspb.Message {
    hasPackFileReference(): boolean;
    clearPackFileReference(): void;
    getPackFileReference(): PackFileReference | undefined;
    setPackFileReference(value?: PackFileReference): void;

    hasUrl(): boolean;
    clearUrl(): void;
    getUrl(): string;
    setUrl(value: string): void;

    getAssetReferenceCase(): AssetReference.AssetReferenceCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AssetReference.AsObject;
    static toObject(includeInstance: boolean, msg: AssetReference): AssetReference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AssetReference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AssetReference;
    static deserializeBinaryFromReader(message: AssetReference, reader: jspb.BinaryReader): AssetReference;
}

export namespace AssetReference {
  export type AsObject = {
    packFileReference?: PackFileReference.AsObject,
    url: string,
  }

  export enum AssetReferenceCase {
    ASSET_REFERENCE_NOT_SET = 0,
    PACK_FILE_REFERENCE = 1,
    URL = 2,
  }
}

export class PackFileReference extends jspb.Message {
    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

    getPath(): string;
    setPath(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PackFileReference.AsObject;
    static toObject(includeInstance: boolean, msg: PackFileReference): PackFileReference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PackFileReference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PackFileReference;
    static deserializeBinaryFromReader(message: PackFileReference, reader: jspb.BinaryReader): PackFileReference;
}

export namespace PackFileReference {
  export type AsObject = {
    packId?: PackId.AsObject,
    path: string,
  }
}

export class AbsolutePackFilePath extends jspb.Message {
    getPath(): string;
    setPath(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AbsolutePackFilePath.AsObject;
    static toObject(includeInstance: boolean, msg: AbsolutePackFilePath): AbsolutePackFilePath.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AbsolutePackFilePath, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AbsolutePackFilePath;
    static deserializeBinaryFromReader(message: AbsolutePackFilePath, reader: jspb.BinaryReader): AbsolutePackFilePath;
}

export namespace AbsolutePackFilePath {
  export type AsObject = {
    path: string,
  }
}

export class DebugInterface extends jspb.Message {
    getAdapter(): string;
    setAdapter(value: string): void;

    getConnector(): string;
    setConnector(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DebugInterface.AsObject;
    static toObject(includeInstance: boolean, msg: DebugInterface): DebugInterface.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DebugInterface, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DebugInterface;
    static deserializeBinaryFromReader(message: DebugInterface, reader: jspb.BinaryReader): DebugInterface;
}

export namespace DebugInterface {
  export type AsObject = {
    adapter: string,
    connector: string,
  }
}

export class BoardFeature extends jspb.Message {
    getType(): string;
    setType(value: string): void;

    getName(): string;
    setName(value: string): void;

    getCategory(): string;
    setCategory(value: string): void;

    getDetail(): string;
    setDetail(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BoardFeature.AsObject;
    static toObject(includeInstance: boolean, msg: BoardFeature): BoardFeature.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BoardFeature, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BoardFeature;
    static deserializeBinaryFromReader(message: BoardFeature, reader: jspb.BinaryReader): BoardFeature;
}

export namespace BoardFeature {
  export type AsObject = {
    type: string,
    name: string,
    category: string,
    detail: string,
  }
}

export class DeviceFeature extends jspb.Message {
    getType(): string;
    setType(value: string): void;

    getName(): string;
    setName(value: string): void;

    getCategory(): string;
    setCategory(value: string): void;

    getDetail(): string;
    setDetail(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceFeature.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceFeature): DeviceFeature.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceFeature, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceFeature;
    static deserializeBinaryFromReader(message: DeviceFeature, reader: jspb.BinaryReader): DeviceFeature;
}

export namespace DeviceFeature {
  export type AsObject = {
    type: string,
    name: string,
    category: string,
    detail: string,
  }
}

export class Processor extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    getCore(): string;
    setCore(value: string): void;

    getUnits(): number;
    setUnits(value: number): void;

    getFpu(): FpuMap[keyof FpuMap];
    setFpu(value: FpuMap[keyof FpuMap]): void;

    getMpu(): MpuMap[keyof MpuMap];
    setMpu(value: MpuMap[keyof MpuMap]): void;

    getTz(): TzMap[keyof TzMap];
    setTz(value: TzMap[keyof TzMap]): void;

    getDsp(): DspMap[keyof DspMap];
    setDsp(value: DspMap[keyof DspMap]): void;

    getMve(): MveMap[keyof MveMap];
    setMve(value: MveMap[keyof MveMap]): void;

    getEndian(): EndianMap[keyof EndianMap];
    setEndian(value: EndianMap[keyof EndianMap]): void;

    getClock(): number;
    setClock(value: number): void;

    getCoreVersion(): string;
    setCoreVersion(value: string): void;

    clearFeaturesList(): void;
    getFeaturesList(): Array<DeviceFeature>;
    setFeaturesList(value: Array<DeviceFeature>): void;
    addFeatures(value?: DeviceFeature, index?: number): DeviceFeature;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Processor.AsObject;
    static toObject(includeInstance: boolean, msg: Processor): Processor.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Processor, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Processor;
    static deserializeBinaryFromReader(message: Processor, reader: jspb.BinaryReader): Processor;
}

export namespace Processor {
  export type AsObject = {
    name: string,
    core: string,
    units: number,
    fpu: FpuMap[keyof FpuMap],
    mpu: MpuMap[keyof MpuMap],
    tz: TzMap[keyof TzMap],
    dsp: DspMap[keyof DspMap],
    mve: MveMap[keyof MveMap],
    endian: EndianMap[keyof EndianMap],
    clock: number,
    coreVersion: string,
    featuresList: Array<DeviceFeature.AsObject>,
  }
}

export class BoardImage extends jspb.Message {
    hasSmall(): boolean;
    clearSmall(): void;
    getSmall(): AssetReference | undefined;
    setSmall(value?: AssetReference): void;

    hasLarge(): boolean;
    clearLarge(): void;
    getLarge(): AssetReference | undefined;
    setLarge(value?: AssetReference): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BoardImage.AsObject;
    static toObject(includeInstance: boolean, msg: BoardImage): BoardImage.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BoardImage, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BoardImage;
    static deserializeBinaryFromReader(message: BoardImage, reader: jspb.BinaryReader): BoardImage;
}

export namespace BoardImage {
  export type AsObject = {
    small?: AssetReference.AsObject,
    large?: AssetReference.AsObject,
  }
}

export class DeviceMemory extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    getSize(): number;
    setSize(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceMemory.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceMemory): DeviceMemory.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceMemory, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceMemory;
    static deserializeBinaryFromReader(message: DeviceMemory, reader: jspb.BinaryReader): DeviceMemory;
}

export namespace DeviceMemory {
  export type AsObject = {
    name: string,
    size: number,
  }
}

export class DeviceReference extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    getVendor(): string;
    setVendor(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceReference.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceReference): DeviceReference.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceReference, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceReference;
    static deserializeBinaryFromReader(message: DeviceReference, reader: jspb.BinaryReader): DeviceReference;
}

export namespace DeviceReference {
  export type AsObject = {
    name: string,
    vendor: string,
  }
}

export class DeviceFamilyInfo extends jspb.Message {
    hasDeviceFamily(): boolean;
    clearDeviceFamily(): void;
    getDeviceFamily(): DeviceReference | undefined;
    setDeviceFamily(value?: DeviceReference): void;

    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

    getDescription(): string;
    setDescription(value: string): void;

    clearProcessorsList(): void;
    getProcessorsList(): Array<Processor>;
    setProcessorsList(value: Array<Processor>): void;
    addProcessors(value?: Processor, index?: number): Processor;

    clearMemoryList(): void;
    getMemoryList(): Array<DeviceMemory>;
    setMemoryList(value: Array<DeviceMemory>): void;
    addMemory(value?: DeviceMemory, index?: number): DeviceMemory;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceFamilyInfo.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceFamilyInfo): DeviceFamilyInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceFamilyInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceFamilyInfo;
    static deserializeBinaryFromReader(message: DeviceFamilyInfo, reader: jspb.BinaryReader): DeviceFamilyInfo;
}

export namespace DeviceFamilyInfo {
  export type AsObject = {
    deviceFamily?: DeviceReference.AsObject,
    packId?: PackId.AsObject,
    description: string,
    processorsList: Array<Processor.AsObject>,
    memoryList: Array<DeviceMemory.AsObject>,
  }
}

export class DeviceSubFamilyInfo extends jspb.Message {
    hasDeviceSubFamily(): boolean;
    clearDeviceSubFamily(): void;
    getDeviceSubFamily(): DeviceReference | undefined;
    setDeviceSubFamily(value?: DeviceReference): void;

    hasDeviceFamily(): boolean;
    clearDeviceFamily(): void;
    getDeviceFamily(): DeviceReference | undefined;
    setDeviceFamily(value?: DeviceReference): void;

    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

    getDescription(): string;
    setDescription(value: string): void;

    clearProcessorsList(): void;
    getProcessorsList(): Array<Processor>;
    setProcessorsList(value: Array<Processor>): void;
    addProcessors(value?: Processor, index?: number): Processor;

    clearMemoryList(): void;
    getMemoryList(): Array<DeviceMemory>;
    setMemoryList(value: Array<DeviceMemory>): void;
    addMemory(value?: DeviceMemory, index?: number): DeviceMemory;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceSubFamilyInfo.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceSubFamilyInfo): DeviceSubFamilyInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceSubFamilyInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceSubFamilyInfo;
    static deserializeBinaryFromReader(message: DeviceSubFamilyInfo, reader: jspb.BinaryReader): DeviceSubFamilyInfo;
}

export namespace DeviceSubFamilyInfo {
  export type AsObject = {
    deviceSubFamily?: DeviceReference.AsObject,
    deviceFamily?: DeviceReference.AsObject,
    packId?: PackId.AsObject,
    description: string,
    processorsList: Array<Processor.AsObject>,
    memoryList: Array<DeviceMemory.AsObject>,
  }
}

export class DeviceGroupInfo extends jspb.Message {
    hasDeviceGroup(): boolean;
    clearDeviceGroup(): void;
    getDeviceGroup(): DeviceReference | undefined;
    setDeviceGroup(value?: DeviceReference): void;

    hasDeviceSubFamily(): boolean;
    clearDeviceSubFamily(): void;
    getDeviceSubFamily(): DeviceReference | undefined;
    setDeviceSubFamily(value?: DeviceReference): void;

    hasDeviceFamily(): boolean;
    clearDeviceFamily(): void;
    getDeviceFamily(): DeviceReference | undefined;
    setDeviceFamily(value?: DeviceReference): void;

    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

    getDescription(): string;
    setDescription(value: string): void;

    clearProcessorsList(): void;
    getProcessorsList(): Array<Processor>;
    setProcessorsList(value: Array<Processor>): void;
    addProcessors(value?: Processor, index?: number): Processor;

    clearMemoryList(): void;
    getMemoryList(): Array<DeviceMemory>;
    setMemoryList(value: Array<DeviceMemory>): void;
    addMemory(value?: DeviceMemory, index?: number): DeviceMemory;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceGroupInfo.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceGroupInfo): DeviceGroupInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceGroupInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceGroupInfo;
    static deserializeBinaryFromReader(message: DeviceGroupInfo, reader: jspb.BinaryReader): DeviceGroupInfo;
}

export namespace DeviceGroupInfo {
  export type AsObject = {
    deviceGroup?: DeviceReference.AsObject,
    deviceSubFamily?: DeviceReference.AsObject,
    deviceFamily?: DeviceReference.AsObject,
    packId?: PackId.AsObject,
    description: string,
    processorsList: Array<Processor.AsObject>,
    memoryList: Array<DeviceMemory.AsObject>,
  }
}

export class DeviceInfo extends jspb.Message {
    hasDeviceId(): boolean;
    clearDeviceId(): void;
    getDeviceId(): DeviceReference | undefined;
    setDeviceId(value?: DeviceReference): void;

    hasDeviceGroup(): boolean;
    clearDeviceGroup(): void;
    getDeviceGroup(): DeviceReference | undefined;
    setDeviceGroup(value?: DeviceReference): void;

    hasDeviceSubFamily(): boolean;
    clearDeviceSubFamily(): void;
    getDeviceSubFamily(): DeviceReference | undefined;
    setDeviceSubFamily(value?: DeviceReference): void;

    hasDeviceFamily(): boolean;
    clearDeviceFamily(): void;
    getDeviceFamily(): DeviceReference | undefined;
    setDeviceFamily(value?: DeviceReference): void;

    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

    getDescription(): string;
    setDescription(value: string): void;

    clearProcessorsList(): void;
    getProcessorsList(): Array<Processor>;
    setProcessorsList(value: Array<Processor>): void;
    addProcessors(value?: Processor, index?: number): Processor;

    clearMemoryList(): void;
    getMemoryList(): Array<DeviceMemory>;
    setMemoryList(value: Array<DeviceMemory>): void;
    addMemory(value?: DeviceMemory, index?: number): DeviceMemory;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceInfo.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceInfo): DeviceInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceInfo;
    static deserializeBinaryFromReader(message: DeviceInfo, reader: jspb.BinaryReader): DeviceInfo;
}

export namespace DeviceInfo {
  export type AsObject = {
    deviceId?: DeviceReference.AsObject,
    deviceGroup?: DeviceReference.AsObject,
    deviceSubFamily?: DeviceReference.AsObject,
    deviceFamily?: DeviceReference.AsObject,
    packId?: PackId.AsObject,
    description: string,
    processorsList: Array<Processor.AsObject>,
    memoryList: Array<DeviceMemory.AsObject>,
  }
}

export class DeviceEntryInfo extends jspb.Message {
    hasDeviceFamily(): boolean;
    clearDeviceFamily(): void;
    getDeviceFamily(): DeviceFamilyInfo | undefined;
    setDeviceFamily(value?: DeviceFamilyInfo): void;

    hasDeviceSubFamily(): boolean;
    clearDeviceSubFamily(): void;
    getDeviceSubFamily(): DeviceSubFamilyInfo | undefined;
    setDeviceSubFamily(value?: DeviceSubFamilyInfo): void;

    hasDeviceGroup(): boolean;
    clearDeviceGroup(): void;
    getDeviceGroup(): DeviceGroupInfo | undefined;
    setDeviceGroup(value?: DeviceGroupInfo): void;

    hasDevice(): boolean;
    clearDevice(): void;
    getDevice(): DeviceInfo | undefined;
    setDevice(value?: DeviceInfo): void;

    getEntryCase(): DeviceEntryInfo.EntryCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceEntryInfo.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceEntryInfo): DeviceEntryInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceEntryInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceEntryInfo;
    static deserializeBinaryFromReader(message: DeviceEntryInfo, reader: jspb.BinaryReader): DeviceEntryInfo;
}

export namespace DeviceEntryInfo {
  export type AsObject = {
    deviceFamily?: DeviceFamilyInfo.AsObject,
    deviceSubFamily?: DeviceSubFamilyInfo.AsObject,
    deviceGroup?: DeviceGroupInfo.AsObject,
    device?: DeviceInfo.AsObject,
  }

  export enum EntryCase {
    ENTRY_NOT_SET = 0,
    DEVICE_FAMILY = 1,
    DEVICE_SUB_FAMILY = 2,
    DEVICE_GROUP = 3,
    DEVICE = 4,
  }
}

export class Book extends jspb.Message {
    getTitle(): string;
    setTitle(value: string): void;

    getCategory(): string;
    setCategory(value: string): void;

    hasFile(): boolean;
    clearFile(): void;
    getFile(): AssetReference | undefined;
    setFile(value?: AssetReference): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Book.AsObject;
    static toObject(includeInstance: boolean, msg: Book): Book.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Book, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Book;
    static deserializeBinaryFromReader(message: Book, reader: jspb.BinaryReader): Book;
}

export namespace Book {
  export type AsObject = {
    title: string,
    category: string,
    file?: AssetReference.AsObject,
  }
}

export class BoardInfo extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): BoardId | undefined;
    setId(value?: BoardId): void;

    getIsDeprecated(): boolean;
    setIsDeprecated(value: boolean): void;

    getSummary(): string;
    setSummary(value: string): void;

    getDescription(): string;
    setDescription(value: string): void;

    clearFeaturesList(): void;
    getFeaturesList(): Array<BoardFeature>;
    setFeaturesList(value: Array<BoardFeature>): void;
    addFeatures(value?: BoardFeature, index?: number): BoardFeature;

    clearMountedDevicesList(): void;
    getMountedDevicesList(): Array<DeviceReference>;
    setMountedDevicesList(value: Array<DeviceReference>): void;
    addMountedDevices(value?: DeviceReference, index?: number): DeviceReference;

    clearExamplesList(): void;
    getExamplesList(): Array<ExampleId>;
    setExamplesList(value: Array<ExampleId>): void;
    addExamples(value?: ExampleId, index?: number): ExampleId;

    clearDebugInterfacesList(): void;
    getDebugInterfacesList(): Array<DebugInterface>;
    setDebugInterfacesList(value: Array<DebugInterface>): void;
    addDebugInterfaces(value?: DebugInterface, index?: number): DebugInterface;

    hasImage(): boolean;
    clearImage(): void;
    getImage(): BoardImage | undefined;
    setImage(value?: BoardImage): void;

    clearBooksList(): void;
    getBooksList(): Array<Book>;
    setBooksList(value: Array<Book>): void;
    addBooks(value?: Book, index?: number): Book;

    clearCompatibleDevicesList(): void;
    getCompatibleDevicesList(): Array<DeviceReference>;
    setCompatibleDevicesList(value: Array<DeviceReference>): void;
    addCompatibleDevices(value?: DeviceReference, index?: number): DeviceReference;

    hasPack(): boolean;
    clearPack(): void;
    getPack(): PackId | undefined;
    setPack(value?: PackId): void;

    hasUuid(): boolean;
    clearUuid(): void;
    getUuid(): string;
    setUuid(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BoardInfo.AsObject;
    static toObject(includeInstance: boolean, msg: BoardInfo): BoardInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BoardInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BoardInfo;
    static deserializeBinaryFromReader(message: BoardInfo, reader: jspb.BinaryReader): BoardInfo;
}

export namespace BoardInfo {
  export type AsObject = {
    id?: BoardId.AsObject,
    isDeprecated: boolean,
    summary: string,
    description: string,
    featuresList: Array<BoardFeature.AsObject>,
    mountedDevicesList: Array<DeviceReference.AsObject>,
    examplesList: Array<ExampleId.AsObject>,
    debugInterfacesList: Array<DebugInterface.AsObject>,
    image?: BoardImage.AsObject,
    booksList: Array<Book.AsObject>,
    compatibleDevicesList: Array<DeviceReference.AsObject>,
    pack?: PackId.AsObject,
    uuid: string,
  }
}

export class BoardFeatureDefaultNameMap extends jspb.Message {
    getDefaultNamesMap(): jspb.Map<string, string>;
    clearDefaultNamesMap(): void;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BoardFeatureDefaultNameMap.AsObject;
    static toObject(includeInstance: boolean, msg: BoardFeatureDefaultNameMap): BoardFeatureDefaultNameMap.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BoardFeatureDefaultNameMap, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BoardFeatureDefaultNameMap;
    static deserializeBinaryFromReader(message: BoardFeatureDefaultNameMap, reader: jspb.BinaryReader): BoardFeatureDefaultNameMap;
}

export namespace BoardFeatureDefaultNameMap {
  export type AsObject = {
    defaultNamesMap: Array<[string, string]>,
  }
}

export class ExampleId extends jspb.Message {
    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

    getName(): string;
    setName(value: string): void;

    getBoardName(): string;
    setBoardName(value: string): void;

    getBoardVendor(): string;
    setBoardVendor(value: string): void;

    getBoardDeviceVendor(): string;
    setBoardDeviceVendor(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ExampleId.AsObject;
    static toObject(includeInstance: boolean, msg: ExampleId): ExampleId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ExampleId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ExampleId;
    static deserializeBinaryFromReader(message: ExampleId, reader: jspb.BinaryReader): ExampleId;
}

export namespace ExampleId {
  export type AsObject = {
    packId?: PackId.AsObject,
    name: string,
    boardName: string,
    boardVendor: string,
    boardDeviceVendor: string,
  }
}

export class Example extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): ExampleId | undefined;
    setId(value?: ExampleId): void;

    getName(): string;
    setName(value: string): void;

    getDescription(): string;
    setDescription(value: string): void;

    getVersion(): string;
    setVersion(value: string): void;

    clearCategoriesList(): void;
    getCategoriesList(): Array<string>;
    setCategoriesList(value: Array<string>): void;
    addCategories(value: string, index?: number): string;

    clearComponentsList(): void;
    getComponentsList(): Array<RelatedComponent>;
    setComponentsList(value: Array<RelatedComponent>): void;
    addComponents(value?: RelatedComponent, index?: number): RelatedComponent;

    clearKeywordsList(): void;
    getKeywordsList(): Array<string>;
    setKeywordsList(value: Array<string>): void;
    addKeywords(value: string, index?: number): string;

    clearEnvironmentsList(): void;
    getEnvironmentsList(): Array<ExampleEnvironment>;
    setEnvironmentsList(value: Array<ExampleEnvironment>): void;
    addEnvironments(value?: ExampleEnvironment, index?: number): ExampleEnvironment;

    hasDocumentation(): boolean;
    clearDocumentation(): void;
    getDocumentation(): AssetReference | undefined;
    setDocumentation(value?: AssetReference): void;

    hasPack(): boolean;
    clearPack(): void;
    getPack(): PackId | undefined;
    setPack(value?: PackId): void;

    hasFolder(): boolean;
    clearFolder(): void;
    getFolder(): PackFileReference | undefined;
    setFolder(value?: PackFileReference): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Example.AsObject;
    static toObject(includeInstance: boolean, msg: Example): Example.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Example, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Example;
    static deserializeBinaryFromReader(message: Example, reader: jspb.BinaryReader): Example;
}

export namespace Example {
  export type AsObject = {
    id?: ExampleId.AsObject,
    name: string,
    description: string,
    version: string,
    categoriesList: Array<string>,
    componentsList: Array<RelatedComponent.AsObject>,
    keywordsList: Array<string>,
    environmentsList: Array<ExampleEnvironment.AsObject>,
    documentation?: AssetReference.AsObject,
    pack?: PackId.AsObject,
    folder?: PackFileReference.AsObject,
  }
}

export class RefAppId extends jspb.Message {
    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

    getName(): string;
    setName(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RefAppId.AsObject;
    static toObject(includeInstance: boolean, msg: RefAppId): RefAppId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RefAppId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RefAppId;
    static deserializeBinaryFromReader(message: RefAppId, reader: jspb.BinaryReader): RefAppId;
}

export namespace RefAppId {
  export type AsObject = {
    packId?: PackId.AsObject,
    name: string,
  }
}

export class RefApp extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): RefAppId | undefined;
    setId(value?: RefAppId): void;

    getName(): string;
    setName(value: string): void;

    getDescription(): string;
    setDescription(value: string): void;

    getVersion(): string;
    setVersion(value: string): void;

    clearCategoriesList(): void;
    getCategoriesList(): Array<string>;
    setCategoriesList(value: Array<string>): void;
    addCategories(value: string, index?: number): string;

    clearComponentsList(): void;
    getComponentsList(): Array<RelatedComponent>;
    setComponentsList(value: Array<RelatedComponent>): void;
    addComponents(value?: RelatedComponent, index?: number): RelatedComponent;

    clearKeywordsList(): void;
    getKeywordsList(): Array<string>;
    setKeywordsList(value: Array<string>): void;
    addKeywords(value: string, index?: number): string;

    clearEnvironmentsList(): void;
    getEnvironmentsList(): Array<ExampleEnvironment>;
    setEnvironmentsList(value: Array<ExampleEnvironment>): void;
    addEnvironments(value?: ExampleEnvironment, index?: number): ExampleEnvironment;

    hasDocumentation(): boolean;
    clearDocumentation(): void;
    getDocumentation(): AssetReference | undefined;
    setDocumentation(value?: AssetReference): void;

    hasPack(): boolean;
    clearPack(): void;
    getPack(): PackId | undefined;
    setPack(value?: PackId): void;

    hasFolder(): boolean;
    clearFolder(): void;
    getFolder(): PackFileReference | undefined;
    setFolder(value?: PackFileReference): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RefApp.AsObject;
    static toObject(includeInstance: boolean, msg: RefApp): RefApp.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RefApp, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RefApp;
    static deserializeBinaryFromReader(message: RefApp, reader: jspb.BinaryReader): RefApp;
}

export namespace RefApp {
  export type AsObject = {
    id?: RefAppId.AsObject,
    name: string,
    description: string,
    version: string,
    categoriesList: Array<string>,
    componentsList: Array<RelatedComponent.AsObject>,
    keywordsList: Array<string>,
    environmentsList: Array<ExampleEnvironment.AsObject>,
    documentation?: AssetReference.AsObject,
    pack?: PackId.AsObject,
    folder?: PackFileReference.AsObject,
  }
}

export class TemplateId extends jspb.Message {
    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

    getName(): string;
    setName(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TemplateId.AsObject;
    static toObject(includeInstance: boolean, msg: TemplateId): TemplateId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TemplateId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TemplateId;
    static deserializeBinaryFromReader(message: TemplateId, reader: jspb.BinaryReader): TemplateId;
}

export namespace TemplateId {
  export type AsObject = {
    packId?: PackId.AsObject,
    name: string,
  }
}

export class Template extends jspb.Message {
    hasId(): boolean;
    clearId(): void;
    getId(): TemplateId | undefined;
    setId(value?: TemplateId): void;

    getName(): string;
    setName(value: string): void;

    hasFolder(): boolean;
    clearFolder(): void;
    getFolder(): PackFileReference | undefined;
    setFolder(value?: PackFileReference): void;

    getProjectFile(): string;
    setProjectFile(value: string): void;

    hasCopyTo(): boolean;
    clearCopyTo(): void;
    getCopyTo(): string;
    setCopyTo(value: string): void;

    hasDescription(): boolean;
    clearDescription(): void;
    getDescription(): string;
    setDescription(value: string): void;

    hasPack(): boolean;
    clearPack(): void;
    getPack(): PackId | undefined;
    setPack(value?: PackId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Template.AsObject;
    static toObject(includeInstance: boolean, msg: Template): Template.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Template, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Template;
    static deserializeBinaryFromReader(message: Template, reader: jspb.BinaryReader): Template;
}

export namespace Template {
  export type AsObject = {
    id?: TemplateId.AsObject,
    name: string,
    folder?: PackFileReference.AsObject,
    projectFile: string,
    copyTo: string,
    description: string,
    pack?: PackId.AsObject,
  }
}

export class RelatedComponent extends jspb.Message {
    getClassName(): string;
    setClassName(value: string): void;

    getGroup(): string;
    setGroup(value: string): void;

    getSubgroup(): string;
    setSubgroup(value: string): void;

    getVersion(): string;
    setVersion(value: string): void;

    getVendor(): string;
    setVendor(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RelatedComponent.AsObject;
    static toObject(includeInstance: boolean, msg: RelatedComponent): RelatedComponent.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RelatedComponent, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RelatedComponent;
    static deserializeBinaryFromReader(message: RelatedComponent, reader: jspb.BinaryReader): RelatedComponent;
}

export namespace RelatedComponent {
  export type AsObject = {
    className: string,
    group: string,
    subgroup: string,
    version: string,
    vendor: string,
  }
}

export class ExampleEnvironment extends jspb.Message {
    getToolchain(): string;
    setToolchain(value: string): void;

    hasProjectFile(): boolean;
    clearProjectFile(): void;
    getProjectFile(): PackFileReference | undefined;
    setProjectFile(value?: PackFileReference): void;

    hasFolder(): boolean;
    clearFolder(): void;
    getFolder(): PackFileReference | undefined;
    setFolder(value?: PackFileReference): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ExampleEnvironment.AsObject;
    static toObject(includeInstance: boolean, msg: ExampleEnvironment): ExampleEnvironment.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ExampleEnvironment, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ExampleEnvironment;
    static deserializeBinaryFromReader(message: ExampleEnvironment, reader: jspb.BinaryReader): ExampleEnvironment;
}

export namespace ExampleEnvironment {
  export type AsObject = {
    toolchain: string,
    projectFile?: PackFileReference.AsObject,
    folder?: PackFileReference.AsObject,
  }
}

export class ComponentFilter extends jspb.Message {
    hasBundleName(): boolean;
    clearBundleName(): void;
    getBundleName(): string;
    setBundleName(value: string): void;

    hasClassName(): boolean;
    clearClassName(): void;
    getClassName(): string;
    setClassName(value: string): void;

    hasGroup(): boolean;
    clearGroup(): void;
    getGroup(): string;
    setGroup(value: string): void;

    hasSubgroup(): boolean;
    clearSubgroup(): void;
    getSubgroup(): string;
    setSubgroup(value: string): void;

    hasVendor(): boolean;
    clearVendor(): void;
    getVendor(): string;
    setVendor(value: string): void;

    hasVersion(): boolean;
    clearVersion(): void;
    getVersion(): string;
    setVersion(value: string): void;

    hasVariant(): boolean;
    clearVariant(): void;
    getVariant(): string;
    setVariant(value: string): void;

    hasApiVersion(): boolean;
    clearApiVersion(): void;
    getApiVersion(): string;
    setApiVersion(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentFilter.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentFilter): ComponentFilter.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentFilter, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentFilter;
    static deserializeBinaryFromReader(message: ComponentFilter, reader: jspb.BinaryReader): ComponentFilter;
}

export namespace ComponentFilter {
  export type AsObject = {
    bundleName: string,
    className: string,
    group: string,
    subgroup: string,
    vendor: string,
    version: string,
    variant: string,
    apiVersion: string,
  }
}

export class TargetOptions extends jspb.Message {
    hasName(): boolean;
    clearName(): void;
    getName(): string;
    setName(value: string): void;

    hasVendor(): boolean;
    clearVendor(): void;
    getVendor(): string;
    setVendor(value: string): void;

    hasProcessorName(): boolean;
    clearProcessorName(): void;
    getProcessorName(): string;
    setProcessorName(value: string): void;

    getFpu(): FpuMap[keyof FpuMap];
    setFpu(value: FpuMap[keyof FpuMap]): void;

    getMpu(): MpuMap[keyof MpuMap];
    setMpu(value: MpuMap[keyof MpuMap]): void;

    getEndian(): EndianMap[keyof EndianMap];
    setEndian(value: EndianMap[keyof EndianMap]): void;

    getTz(): TzMap[keyof TzMap];
    setTz(value: TzMap[keyof TzMap]): void;

    getSecure(): SecureMap[keyof SecureMap];
    setSecure(value: SecureMap[keyof SecureMap]): void;

    getDsp(): DspMap[keyof DspMap];
    setDsp(value: DspMap[keyof DspMap]): void;

    getMve(): MveMap[keyof MveMap];
    setMve(value: MveMap[keyof MveMap]): void;

    hasCdecp(): boolean;
    clearCdecp(): void;
    getCdecp(): string;
    setCdecp(value: string): void;

    getPacbti(): PacbtiMap[keyof PacbtiMap];
    setPacbti(value: PacbtiMap[keyof PacbtiMap]): void;

    hasBoardvendor(): boolean;
    clearBoardvendor(): void;
    getBoardvendor(): string;
    setBoardvendor(value: string): void;

    hasBoardname(): boolean;
    clearBoardname(): void;
    getBoardname(): string;
    setBoardname(value: string): void;

    hasBoardrevision(): boolean;
    clearBoardrevision(): void;
    getBoardrevision(): string;
    setBoardrevision(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TargetOptions.AsObject;
    static toObject(includeInstance: boolean, msg: TargetOptions): TargetOptions.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TargetOptions, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TargetOptions;
    static deserializeBinaryFromReader(message: TargetOptions, reader: jspb.BinaryReader): TargetOptions;
}

export namespace TargetOptions {
  export type AsObject = {
    name: string,
    vendor: string,
    processorName: string,
    fpu: FpuMap[keyof FpuMap],
    mpu: MpuMap[keyof MpuMap],
    endian: EndianMap[keyof EndianMap],
    tz: TzMap[keyof TzMap],
    secure: SecureMap[keyof SecureMap],
    dsp: DspMap[keyof DspMap],
    mve: MveMap[keyof MveMap],
    cdecp: string,
    pacbti: PacbtiMap[keyof PacbtiMap],
    boardvendor: string,
    boardname: string,
    boardrevision: string,
  }
}

export class ToolchainOptions extends jspb.Message {
    hasCompiler(): boolean;
    clearCompiler(): void;
    getCompiler(): string;
    setCompiler(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ToolchainOptions.AsObject;
    static toObject(includeInstance: boolean, msg: ToolchainOptions): ToolchainOptions.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ToolchainOptions, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ToolchainOptions;
    static deserializeBinaryFromReader(message: ToolchainOptions, reader: jspb.BinaryReader): ToolchainOptions;
}

export namespace ToolchainOptions {
  export type AsObject = {
    compiler: string,
  }
}

export class ComponentInfo extends jspb.Message {
    hasComponentId(): boolean;
    clearComponentId(): void;
    getComponentId(): ComponentId | undefined;
    setComponentId(value?: ComponentId): void;

    getDescription(): string;
    setDescription(value: string): void;

    getIsDeviceSpecific(): boolean;
    setIsDeviceSpecific(value: boolean): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentInfo.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentInfo): ComponentInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentInfo;
    static deserializeBinaryFromReader(message: ComponentInfo, reader: jspb.BinaryReader): ComponentInfo;
}

export namespace ComponentInfo {
  export type AsObject = {
    componentId?: ComponentId.AsObject,
    description: string,
    isDeviceSpecific: boolean,
  }
}

export class ComponentId extends jspb.Message {
    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

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
    toObject(includeInstance?: boolean): ComponentId.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentId): ComponentId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentId;
    static deserializeBinaryFromReader(message: ComponentId, reader: jspb.BinaryReader): ComponentId;
}

export namespace ComponentId {
  export type AsObject = {
    packId?: PackId.AsObject,
    bundleName: string,
    className: string,
    group: string,
    subgroup: string,
    vendor: string,
    version: string,
    variant: string,
  }
}

export class Doc extends jspb.Message {
    hasDoc(): boolean;
    clearDoc(): void;
    getDoc(): AssetReference | undefined;
    setDoc(value?: AssetReference): void;

    getDescription(): string;
    setDescription(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Doc.AsObject;
    static toObject(includeInstance: boolean, msg: Doc): Doc.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Doc, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Doc;
    static deserializeBinaryFromReader(message: Doc, reader: jspb.BinaryReader): Doc;
}

export namespace Doc {
  export type AsObject = {
    doc?: AssetReference.AsObject,
    description: string,
  }
}

export class ComponentFile extends jspb.Message {
    hasFile(): boolean;
    clearFile(): void;
    getFile(): AssetReference | undefined;
    setFile(value?: AssetReference): void;

    getCategory(): ComponentFile.CategoryMap[keyof ComponentFile.CategoryMap];
    setCategory(value: ComponentFile.CategoryMap[keyof ComponentFile.CategoryMap]): void;

    getLanguage(): ComponentFile.LanguageMap[keyof ComponentFile.LanguageMap];
    setLanguage(value: ComponentFile.LanguageMap[keyof ComponentFile.LanguageMap]): void;

    getAttribute(): ComponentFile.AttributeMap[keyof ComponentFile.AttributeMap];
    setAttribute(value: ComponentFile.AttributeMap[keyof ComponentFile.AttributeMap]): void;

    hasComponentId(): boolean;
    clearComponentId(): void;
    getComponentId(): ComponentId | undefined;
    setComponentId(value?: ComponentId): void;

    hasApiId(): boolean;
    clearApiId(): void;
    getApiId(): ApiId | undefined;
    setApiId(value?: ApiId): void;

    getSelect(): string;
    setSelect(value: string): void;

    getSourceCase(): ComponentFile.SourceCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentFile.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentFile): ComponentFile.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentFile, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentFile;
    static deserializeBinaryFromReader(message: ComponentFile, reader: jspb.BinaryReader): ComponentFile;
}

export namespace ComponentFile {
  export type AsObject = {
    file?: AssetReference.AsObject,
    category: ComponentFile.CategoryMap[keyof ComponentFile.CategoryMap],
    language: ComponentFile.LanguageMap[keyof ComponentFile.LanguageMap],
    attribute: ComponentFile.AttributeMap[keyof ComponentFile.AttributeMap],
    componentId?: ComponentId.AsObject,
    apiId?: ApiId.AsObject,
    select: string,
  }

  export interface CategoryMap {
    UNKNOWN_CATEGORY: 0;
    DOC: 1;
    HEADER: 2;
    INCLUDE: 3;
    LIBRARY: 4;
    OBJECT: 5;
    SOURCE: 6;
    LINKER_SCRIPT: 7;
    UTILITY: 8;
    IMAGE: 9;
    PRE_INCLUDE_GLOBAL: 10;
    PRE_INCLUDE_LOCAL: 11;
  }

  export const Category: CategoryMap;

  export interface LanguageMap {
    UNKNOWN_LANGUAGE: 0;
    ASM: 1;
    C: 2;
    CPP: 3;
    C_CPP: 4;
    LINK: 5;
  }

  export const Language: LanguageMap;

  export interface AttributeMap {
    UNKNOWN_ATTRIBUTE: 0;
    CONFIG: 1;
    TEMPLATE: 2;
  }

  export const Attribute: AttributeMap;

  export enum SourceCase {
    SOURCE_NOT_SET = 0,
    COMPONENT_ID = 5,
    API_ID = 6,
  }
}

export class ApiId extends jspb.Message {
    hasPackId(): boolean;
    clearPackId(): void;
    getPackId(): PackId | undefined;
    setPackId(value?: PackId): void;

    getClassName(): string;
    setClassName(value: string): void;

    getGroup(): string;
    setGroup(value: string): void;

    getVersion(): string;
    setVersion(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ApiId.AsObject;
    static toObject(includeInstance: boolean, msg: ApiId): ApiId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ApiId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ApiId;
    static deserializeBinaryFromReader(message: ApiId, reader: jspb.BinaryReader): ApiId;
}

export namespace ApiId {
  export type AsObject = {
    packId?: PackId.AsObject,
    className: string,
    group: string,
    version: string,
  }
}

export class ResolveHardwareRequest extends jspb.Message {
    hasBoard(): boolean;
    clearBoard(): void;
    getBoard(): BoardConstraints | undefined;
    setBoard(value?: BoardConstraints): void;

    hasDevice(): boolean;
    clearDevice(): void;
    getDevice(): DeviceConstraints | undefined;
    setDevice(value?: DeviceConstraints): void;

    hasScope(): boolean;
    clearScope(): void;
    getScope(): PackScope | undefined;
    setScope(value?: PackScope): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ResolveHardwareRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ResolveHardwareRequest): ResolveHardwareRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ResolveHardwareRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ResolveHardwareRequest;
    static deserializeBinaryFromReader(message: ResolveHardwareRequest, reader: jspb.BinaryReader): ResolveHardwareRequest;
}

export namespace ResolveHardwareRequest {
  export type AsObject = {
    board?: BoardConstraints.AsObject,
    device?: DeviceConstraints.AsObject,
    scope?: PackScope.AsObject,
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

export class ResolvedHardware extends jspb.Message {
    hasBoard(): boolean;
    clearBoard(): void;
    getBoard(): BoardId | undefined;
    setBoard(value?: BoardId): void;

    hasBsp(): boolean;
    clearBsp(): void;
    getBsp(): PackId | undefined;
    setBsp(value?: PackId): void;

    hasDevice(): boolean;
    clearDevice(): void;
    getDevice(): DeviceReference | undefined;
    setDevice(value?: DeviceReference): void;

    getProcessorName(): string;
    setProcessorName(value: string): void;

    hasDfp(): boolean;
    clearDfp(): void;
    getDfp(): PackId | undefined;
    setDfp(value?: PackId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ResolvedHardware.AsObject;
    static toObject(includeInstance: boolean, msg: ResolvedHardware): ResolvedHardware.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ResolvedHardware, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ResolvedHardware;
    static deserializeBinaryFromReader(message: ResolvedHardware, reader: jspb.BinaryReader): ResolvedHardware;
}

export namespace ResolvedHardware {
  export type AsObject = {
    board?: BoardId.AsObject,
    bsp?: PackId.AsObject,
    device?: DeviceReference.AsObject,
    processorName: string,
    dfp?: PackId.AsObject,
  }
}

export interface PackScopePresetMap {
  PACK_SCOPE_PRESET_UNSPECIFIED: 0;
  PACK_SCOPE_PRESET_CURRENT: 1;
  PACK_SCOPE_PRESET_INSTALLED: 2;
  PACK_SCOPE_PRESET_LATEST: 3;
}

export const PackScopePreset: PackScopePresetMap;

export interface FpuMap {
  FPU_UNSPECIFIED: 0;
  FPU_NO: 1;
  FPU: 2;
  FPU_SP: 3;
  FPU_DP: 4;
}

export const Fpu: FpuMap;

export interface MpuMap {
  MPU_UNSPECIFIED: 0;
  MPU_NO: 1;
  MPU: 2;
}

export const Mpu: MpuMap;

export interface TzMap {
  TZ_UNSPECIFIED: 0;
  TZ_NO: 1;
  TZ: 2;
}

export const Tz: TzMap;

export interface SecureMap {
  SECURE_UNSPECIFIED: 0;
  SECURE_NON_SECURE: 1;
  SECURE: 2;
  SECURE_TZ_DISABLED: 3;
}

export const Secure: SecureMap;

export interface DspMap {
  DSP_UNSPECIFIED: 0;
  DSP_NO: 1;
  DSP: 2;
}

export const Dsp: DspMap;

export interface MveMap {
  MVE_UNSPECIFIED: 0;
  MVE_NO: 1;
  MVE: 2;
  MVE_FP: 3;
}

export const Mve: MveMap;

export interface PacbtiMap {
  PACBTI_UNSPECIFIED: 0;
  PACBTI_NO: 1;
  PACBTI: 2;
}

export const Pacbti: PacbtiMap;

export interface EndianMap {
  ENDIAN_UNSPECIFIED: 0;
  ENDIAN_LITTLE: 1;
  ENDIAN_BIG: 2;
  ENDIAN_CONFIGURABLE: 3;
}

export const Endian: EndianMap;

