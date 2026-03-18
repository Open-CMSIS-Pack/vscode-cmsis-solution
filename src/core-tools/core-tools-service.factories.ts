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

import {
    BoardId,
    ComponentFile,
    ComponentId,
    DeviceReference,
    PackId as ProtoPackId,
    PackFileReference,
    RefApp,
    ExampleEnvironment,
} from './client/packs_pb';
import {
    BuildContext,
    BuildTypeId,
    ComponentReference,
    ComponentOrigin,
    ConfigFile,
    LayerId,
    PackReference,
    ProjectId,
    SelectedComponentInfo,
    TargetTypeId,
    TrackedComponentReference,
    PackData,
} from './client/solutions_pb';
import { faker } from '@faker-js/faker';

// Used by: core-tools-data-building.test.ts
const projectIdFactory = (id?: string): ProjectId => {
    const projectId = new ProjectId();
    projectId.setId(id || faker.word.noun());
    return projectId;
};

// Used by: core-tools-data-building.test.ts
const layerIdFactory = (id: string): LayerId => {
    const layerId = new LayerId();
    layerId.setId(id);
    return layerId;
};

export type ComponentOriginFactoryOptions = {
    projectId?: string;
    layerId?: string;
}

// Used by: component-id.test.ts
export const componentOriginFactory = (options?: ComponentOriginFactoryOptions): ComponentOrigin => {
    const origin = new ComponentOrigin;
    if (options?.layerId) {
        origin.setLayerId(layerIdFactory(options.layerId));
    } else {
        origin.setProjectId(projectIdFactory(options?.projectId || faker.word.noun()));
    }
    return origin;
};

type ComponentFactoryOptions = {
    bundle?: string;
    class?: string;
    variant?: string;
    vendor?: string;
    version?: string;
    group?: string;
    subgroup?: string;
}

// Used by: component-id.test.ts
export const componentReferenceFactory = (options?: ComponentFactoryOptions): ComponentReference => {
    const ref = new ComponentReference();
    ref.setBundleName(options?.bundle ?? '');
    ref.setVariant(options?.variant ?? '');
    ref.setVersion(options?.version ?? '');
    ref.setVendor(options?.vendor ?? '');
    ref.setClassName(options?.class ?? faker.word.noun());
    ref.setGroup(options?.group ?? faker.word.noun());
    ref.setSubgroup(options?.subgroup ?? '');
    return ref;
};

type TrackedComponentFactoryOptions = {
    reference?: ComponentReference;
    origin?: ComponentOrigin;
}

// Used by: component-id.test.ts
export const trackedComponentReferenceFactory = (options?: TrackedComponentFactoryOptions): TrackedComponentReference => {
    const ref = new TrackedComponentReference();
    ref.setReference(options?.reference ?? componentReferenceFactory());
    ref.setOrigin(options?.origin ?? componentOriginFactory());
    return ref;
};

export type PackIdFactoryOptions = {
    name?: string;
    vendor?: string;
    version?: string;
}

// Used by: cmsis-solution-types.factories.ts
export const packIdFactory = (options?: PackIdFactoryOptions): ProtoPackId => {
    const packId = new ProtoPackId();
    packId.setName(options?.name || faker.word.noun());
    packId.setVendor(options?.vendor || faker.word.noun());
    packId.setVersion(options?.version || faker.system.semver());
    return packId;
};

const emptyPackIdFactory = () => {
    return new ProtoPackId();
};

export type ComponentIdFactoryOptions = ComponentFactoryOptions & {
    packId?: PackIdFactoryOptions;
}

// Used by: component-id.test.ts
export const componentIdFactory = (options?: ComponentIdFactoryOptions): ComponentId => {
    const componentId = new ComponentId();
    componentId.setClassName(options?.class ?? '');
    componentId.setBundleName(options?.bundle ?? '');
    componentId.setGroup(options?.group ?? '');
    componentId.setSubgroup(options?.subgroup ?? '');
    componentId.setVendor(options?.vendor ?? '');
    componentId.setVariant(options?.variant ?? '');
    componentId.setVersion(options?.version ?? '');
    componentId.setPackId(options?.packId ? packIdFactory(options?.packId) : emptyPackIdFactory());
    return componentId;
};

export type BuildTypeIdFactoryOptions = {
    type?: string;
}

const buildTypeIdFactory = ({ type }: BuildTypeIdFactoryOptions): BuildTypeId => {
    const buildTypeId = new BuildTypeId();
    buildTypeId.setId(type || faker.word.noun());
    return buildTypeId;
};

export type TargetTypeIdFactoryOptions = {
    type: string;
}

const targetTypeIdFactory = ({ type }: TargetTypeIdFactoryOptions): TargetTypeId => {
    const targetTypeId = new TargetTypeId();
    targetTypeId.setId(type);
    return targetTypeId;
};

export type BuildContextFactoryOptions = {
    buildType?: string;
    targetType?: string;
}

const buildContextFactory = (options?: BuildContextFactoryOptions): BuildContext => {
    const buildContext = new BuildContext();
    buildContext.setBuildTypeId(buildTypeIdFactory({ type: options?.buildType ?? faker.word.noun() }));
    buildContext.setTargetTypeId(targetTypeIdFactory({ type: options?.targetType ?? faker.word.noun() }));
    return buildContext;
};

export type PackReferenceFactoryOptions = {
    name?: string;
    vendor?: string;
    version?: string
}

const packReferenceFactory = (options?: PackReferenceFactoryOptions): PackReference => {
    const packReference = new PackReference();
    const referenceData = options || { name: faker.word.noun(), vendor: faker.word.noun(), version: faker.number.int().toString() };
    packReference.setName(referenceData.name || '');
    packReference.setVendor(referenceData.vendor || '');
    packReference.setVersion(referenceData.version || '');
    return packReference;
};

export type PackDataFactoryOptions = {
    reference?: PackReferenceFactoryOptions
    forContextsList?: BuildContextFactoryOptions[]
    notForContextsList?: BuildContextFactoryOptions[]
}

// Used by: core-tools-data-building.test.ts
export const packDataFactory = (options?: PackDataFactoryOptions): PackData => {
    const packData = new PackData();
    packData.setReference(packReferenceFactory(options?.reference));
    packData.setForContextsList(options?.forContextsList?.map(buildContextFactory) || []);
    packData.setNotForContextsList(options?.notForContextsList?.map(buildContextFactory) || []);
    return packData;
};

// Used by: cmsis-solution-types.factories.ts
export function deviceReferenceFactory(options?: Partial<DeviceReference.AsObject>): DeviceReference {
    const deviceReference = new DeviceReference();
    deviceReference.setName(options?.name || faker.word.noun());
    deviceReference.setVendor(options?.vendor || faker.word.noun());
    return deviceReference;
}

const componentIdFromReference = (reference: TrackedComponentReference): ComponentId => componentIdFactory({
    bundle: reference.getReference()?.getBundleName(),
    variant: reference.getReference()?.getVariant(),
    vendor: reference.getReference()?.getVendor(),
    version: reference.getReference()?.getVersion(),
    class: reference.getReference()?.getClassName(),
    group: reference.getReference()?.getGroup(),
    subgroup: reference.getReference()?.getSubgroup(),
});

export type SelectedComponentInfoFactoryOptions = {
    buildContext?: BuildContext;
    reference?: TrackedComponentReference;
    filesList?: ComponentFile[];
    configFilesList?: ConfigFile[];
} & ({
    isResolved: false;
} | {
    isResolved: true;
    id?: ComponentId;
})

// Used by: component-id.test.ts
export const selectedComponentInfoFactory = (options?: SelectedComponentInfoFactoryOptions): SelectedComponentInfo => {
    const reference = options?.reference ?? trackedComponentReferenceFactory();
    const info = new SelectedComponentInfo();
    info.setBuildContext(options?.buildContext);
    info.setReference(reference);
    info.setFilesList(options?.filesList ?? []);
    info.setConfigFilesList(options?.configFilesList ?? []);
    if (options?.isResolved) {
        if (options.id) {
            info.setComponentId(options.id);
        } else {
            info.setComponentId(componentIdFromReference(reference));
        }
    } else {
        // Core Tools returns an ID with all blank properties when unresolved
        info.setComponentId(new ComponentId());
    }

    return info;
};

export type BoardIdFactoryOptions = {
    name: string;
    vendor: string;
    revision: string;
}

// Used by: cmsis-solution-types.factories.ts, cmsis-solution-types.test.ts
export const boardIdFactory = (options?: Partial<BoardIdFactoryOptions>): BoardId => {
    const boardId = new BoardId();
    boardId.setName(options?.name ?? faker.word.noun());
    boardId.setVendor(options?.vendor ?? faker.word.noun());
    boardId.setRevision(options?.revision ?? faker.word.noun());
    return boardId;
};

function packFileReferenceFactory(options?: Partial<PackFileReference.AsObject>): PackFileReference {
    const packFileReference = new PackFileReference();
    packFileReference.setPackId(packIdFactory(options?.packId));
    packFileReference.setPath(options?.path ?? faker.system.filePath());
    return packFileReference;
}

function exampleEnvironmentFactory(options?: Partial<ExampleEnvironment.AsObject>) {
    const result = new ExampleEnvironment();
    result.setFolder(packFileReferenceFactory(options?.folder));
    result.setProjectFile(packFileReferenceFactory(options?.projectFile ?? { path: 'example.csolution' }));
    result.setToolchain(options?.toolchain ?? 'csolution');
    return result;
}

function environmentsListFactory(options: Partial<ExampleEnvironment.AsObject>[] = [{}]): ExampleEnvironment[] {
    return options.map(exampleEnvironmentFactory);
}

// Used by: reducer.test.ts
export function refAppFactory(options?: Partial<RefApp.AsObject>): RefApp.AsObject {
    const refApp = new RefApp();
    const pack = packIdFactory(options?.pack);
    const folder = packFileReferenceFactory(options?.folder ?? { packId: pack.toObject(), path: faker.system.directoryPath() });
    const envs = environmentsListFactory(options?.environmentsList ?? [{ folder: { ...folder.toObject() }, projectFile: { ...folder.toObject(), path: 'example.csolution' } }]);
    refApp.setPack(pack);
    refApp.setName(options?.name ?? faker.lorem.words(3));
    refApp.setDescription(options?.description ?? faker.lorem.sentence());
    refApp.setFolder(folder);
    refApp.setEnvironmentsList(envs);
    return refApp.toObject();
}

