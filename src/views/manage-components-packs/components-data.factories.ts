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
import { componentRowIdFactory, ComponentRowIdFactoryOptions } from './data/component-row-id.factories';
import { BuildContext, Bundle, CClass, Component, ComponentOption, ComponentOptionId, ComponentOrigin, ComponentReference, Group, PackMetadata, SelectedComponentOption } from './components-data';

export type buildContextFactoryOptions = {
    targetType: string,
    buildType: string,
}

export const buildContextFactory = (options?: buildContextFactoryOptions): BuildContext => {
    return {
        targetType: options?.targetType || double_faker_sample(),
        buildType: options?.buildType || double_faker_sample(),
    };
};

export type PackMetadataFactoryOptions = {
    selectedInSolution?: boolean
    installed?: boolean
}

export const packMetadataFactory = (options?: PackMetadataFactoryOptions): PackMetadata => {
    return {
        selectedInSolution: options?.selectedInSolution ?? faker.datatype.boolean(),
        installed: options?.installed ?? faker.datatype.boolean(),
    };
};

type ComponentOptionIdFactoryOptions = {
    vendor?: string;
    variant?: string;
    version?: string;
}

const double_faker_sample = () => faker.word.sample() + '_' + faker.word.sample();

export const componentOptionIdFactory = (options?: ComponentOptionIdFactoryOptions): ComponentOptionId => ({
    vendor: options?.vendor ?? double_faker_sample(),
    variant: options?.variant ?? double_faker_sample(),
    version: options?.version ?? faker.system.semver(),
});

export type ComponentReferenceFactoryOptions = ComponentOptionIdFactoryOptions & ComponentRowIdFactoryOptions

export const componentReferenceFactory = (options?: ComponentReferenceFactoryOptions): ComponentReference => ({
    ...componentRowIdFactory(options),
    ...componentOptionIdFactory(options),
});

export type ComponentOptionFactoryOptions = {
    id?: ComponentOptionId;
    buildContext?: BuildContext;
    description?: string;
    documentationUrl?: string;
    origin?: ComponentOrigin;
    packMetadata?: PackMetadataFactoryOptions;
}

export const componentOptionFactory = (options?: ComponentOptionFactoryOptions): ComponentOption => {
    const id = options?.id ?? { vendor: double_faker_sample(), variant: double_faker_sample(), version: faker.system.semver() };

    return {
        id,
        buildContext: options?.buildContext || buildContextFactory(),
        description: options?.description || faker.word.words(),
        documentationUrl: options?.documentationUrl || faker.internet.url(),
        packId: { vendor: id.vendor, name: double_faker_sample(), version: faker.system.semver() },
        packMetadata: packMetadataFactory(options?.packMetadata),
    };
};

export type SelectedComponentOptionFactoryOptions = {
    buildContext?: BuildContext;
    resolvedOption?: ComponentOptionId;
    referenceOption?: ComponentOptionId;
    reference?: ComponentReference;
    origin?: ComponentOrigin;
}
export const selectedComponentOptionFactory = (options?: SelectedComponentOptionFactoryOptions): SelectedComponentOption => {
    const optionId: ComponentOptionId = options?.resolvedOption ?? { vendor: double_faker_sample(), variant: '', version: faker.system.semver() };
    const optionIdExchange: ComponentReference = options?.reference ?? { ...optionId, cClass: 'Test CClass', bundleName: 'Test bundle', group: 'Test Group', subGroup: '' };
    return {
        buildContext: options?.buildContext ?? buildContextFactory(),
        resolvedOption: optionId,
        reference: optionIdExchange,
        origin: options?.origin || { projectId: '', type: 'project' }
    };
};

export type ComponentFactoryOptions = {
    name?: string;
    availableOptions?: ComponentOption[];
    selectedOptions?: SelectedComponentOption[];
    // If set, the default available option will be for this context
    defaultBuildContext?: BuildContext;
    // If available and selected options are not provided, this will be the option ID
    defaultOptionId?: ComponentOptionId;
    // If true, a selected option will be created to match the available option (overridden by availableOptions and selectedOptions)
    isSelected?: boolean;
}

export const componentFactory = (options?: ComponentFactoryOptions): Component => {
    const buildContext = options?.defaultBuildContext ?? buildContextFactory();
    const optionId: ComponentOptionId = options?.defaultOptionId ?? { vendor: double_faker_sample(), variant: '', version: faker.system.semver() };
    return {
        type: 'component',
        name: options?.name ?? double_faker_sample(),
        availableOptions: options?.availableOptions ?? [
            componentOptionFactory({ buildContext, id: optionId })
        ],
        selectedOptions: options?.selectedOptions ?? (options?.isSelected ? [selectedComponentOptionFactory({ buildContext, resolvedOption: optionId })] : [])
    };
};

export type GroupFactoryOptions = {
    name?: string;
    components?: Component[];
    // If set, the default available option will be for this context
    defaultBuildContext?: BuildContext;
}

export const groupFactory = (options?: GroupFactoryOptions): Group => {
    return {
        type: 'group',
        name: options?.name ?? double_faker_sample(),
        docs: [
            {
                description: faker.word.words(),
                documentationUrl: faker.internet.url(),
                buildContext: options?.defaultBuildContext ?? buildContextFactory()
            }
        ],
        components: options?.components ?? [
            componentFactory({ defaultBuildContext: options?.defaultBuildContext })
        ],
    };
};

export type BundleFactoryOptions = {
    name?: string;
    components?: Bundle['components'];
    defaultBuildContext?: BuildContext;
}

export const bundleFactory = (options?: BundleFactoryOptions): Bundle => ({
    name: options?.name ?? double_faker_sample(),
    doc: {
        description: faker.word.words(),
        documentationUrl: faker.internet.url(),
    },
    components: options?.components ?? [componentFactory({ defaultBuildContext: options?.defaultBuildContext })]
});

export type CClassFactoryOptions = Partial<CClass>;

export const cclassFactory = (options?: CClassFactoryOptions): CClass => ({
    name: options?.name ?? double_faker_sample(),
    availableBundles: options?.availableBundles ?? [bundleFactory()]
});
