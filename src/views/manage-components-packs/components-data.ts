/**
 * Copyright 2021-2026 Arm Limited
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

import { groupBy, Grouped } from '../../array';
import { PackId } from '../../packs/pack-id';
import { ComponentRowId, componentRowIdsEqual } from './data/component-row-id';

export interface ComponentOptionId {
    variant: string;
    version: string;
    vendor: string;
}

export type PackMetadata = {
    selectedInSolution: boolean;
    installed: boolean;
}

/**
 * Mutually exclusive options for a cClass-group-sub.
 */
export interface ComponentOption {
    id: ComponentOptionId;
    description: string;
    documentationUrl: string;
    packId: PackId;
    buildContext: BuildContext;
    packMetadata: PackMetadata;
}


export type ComponentOptionInContext = {
    id: ComponentReference;
    buildContext: BuildContext;
    origin: ComponentOrigin;
}

export type ComponentOrigin =
    | { type: 'project', projectId: string }
    | { type: 'layer', layerId: string }


export type SelectedComponentOption = {
    /**
     * cClass, Bundle, Group, SubGroup, Vendor, variant and version of the component reference as present in the YAML file.
     */
    reference: ComponentReference;
    /**
     * Vendor, variant and version of the concrete component if resolution was successful.
     */
    resolvedOption: ComponentOptionId | undefined;
    buildContext: BuildContext;
    origin: ComponentOrigin;
}

export interface Component {
    type: 'component';
    availableOptions: ComponentOption[];
    /**
     * Indicates which options are selected in which build contexts. It deliberately allows multiple selections
     * in the same build context so the user can resolve invalid states.
     */
    selectedOptions: SelectedComponentOption[];
    name: string;
}

export type Doc = {
    documentationUrl: string;
    description: string;
}

export type DocInContext = Doc & {
    buildContext: BuildContext;
}

export interface Group {
    type: 'group';
    name: string;
    docs: DocInContext[];
    components: Component[];
}

export interface Bundle {
    components: Array<Component | Group>;
    /**
     * Empty string is the "default" bundle, i.e. components with no bundle.
     */
    name: string;
    doc: Doc | undefined;
}

export interface CClass {
    availableBundles: Bundle[];
    name: string;
}

/**
 * Request to update a particular component row, possibly affecting multiple build contexts at the same time.
 */
export interface SelectComponentRequest {
    rowId: ComponentRowId;
    remove: ComponentOptionInContext[];
    add: ComponentOptionInContext[];
}

export type ComponentReference = ComponentRowId & ComponentOptionId;

type ProjectId = string;

export type Project = {
    projectId: ProjectId;
    projectName: string;
}

export type HardwareValidation = {
    targetType: string
    error: string
}

export type CurrentTarget =
    { type: 'all' } | { type: 'one', target: string };

export type TargetSetData = {
    label: string;
    key: string;
    path: string;
    relativePath?: string;
    type: 'solution' | 'project' | 'layer';
    children?: TargetSetData[];
}

export type PacksFilterValue = 'solution' | 'all'

export const componentOptionInContextsAreEqual = (option1: ComponentOptionInContext) => (option2: ComponentOptionInContext) =>
    componentReferencesAreEqual(option1.id)(option2.id) && buildContextsEqual(option1.buildContext)(option2.buildContext);

export type UiErrorMessage = {
    type: 'ERROR' | 'WARNING' | 'INFO';
    message: string;
}

export type Layer = {
    path: string;
    name: string;
    type: string;
}

export type BuildContext = {
    targetType: string;
    buildType: string;
    projectPath?: string;
    layers?: Layer[];
}

export const buildOptionId = (componentReference: ComponentReference): ComponentOptionId =>
    ({ vendor: componentReference.vendor, version: componentReference.version, variant: componentReference.variant });

export const buildContextsEqual = (buildContext1: BuildContext) => (buildContext2: BuildContext): boolean =>
    buildContext1.buildType === buildContext2.buildType && buildContext1.targetType === buildContext2.targetType;

/**
 * Find the cclass with the given row ID in the tree of CClasses, or the parent CClass for a group or component row ID.
 */
export const findComponentClass = (cClasses: CClass[], rowId: ComponentRowId): CClass | undefined => cClasses.find(({ name }) => name === rowId.cClass);

/**
 * Find the bundle for the given row ID.
 */
export const findComponentBundle = (cClasses: CClass[], rowId: ComponentRowId): Bundle | undefined => {
    const cClass = findComponentClass(cClasses, rowId);
    return cClass?.availableBundles.find(({ name }) => name === rowId.bundleName);
};

/**
 * Find the group for the given row ID.
 */
export const findComponentGroup = (cClasses: CClass[], rowId: ComponentRowId): Group | undefined => {
    const bundle = findComponentBundle(cClasses, rowId);
    return bundle?.components.find((componentOrGroup): componentOrGroup is Group => componentOrGroup.type === 'group' && componentOrGroup.name === rowId.group);
};

export interface ModifyOrCreateInputs<A, B extends A> {
    predicate: (item: A) => item is B;
    modify: (input: B) => Partial<B>;
    newItem?: B | (() => B);
}

/**
 * Finds an element in the array that matches the predicate, then runs the modify function on that element.
 * Returns a new array that is a shallow copy of the input, but with the matching element replaced with the
 * output from modify merged with the initial item.
 *
 * If no match is found, the create function is called to generate a new element, the modify function is run
 * on it, and then a new array is returned with the new element appended to the original array. If no newItem
 * is provided, the array is returned unmodified.
 *
 * This is useful for building up the tree of components without mutating the input data structure.
 */
export const modifyOrCreate = <A, B extends A>(
    { newItem, modify, predicate }: ModifyOrCreateInputs<A, B>,
    array: A[]
): A[] => {
    const existingIndex = array.findIndex(predicate);
    let baseItem: B | undefined;
    if (existingIndex >= 0) {
        baseItem = array[existingIndex] as B;
    } else if (typeof newItem === 'function') {
        baseItem = (newItem as () => B)();
    } else if (newItem) {
        baseItem = newItem;
    }
    if (!baseItem) return array;
    const modifiedItem = { ...baseItem, ...modify(baseItem) };
    if (existingIndex >= 0) {
        // Replace the existing item
        return [
            ...array.slice(0, existingIndex),
            modifiedItem,
            ...array.slice(existingIndex + 1)
        ];
    } else {
        // Append the new item
        return [...array, modifiedItem];
    }
};

/**
 * Update a component in Bundle, identified by a rowId.
 */
const updateComponentInBundle = (bundle: Bundle, rowId: ComponentRowId, update: (component: Component) => Partial<Component>): Bundle => {
    let components: Array<Component | Group> = bundle.components;

    if (rowId.subGroup) {
        components = modifyOrCreate<Component | Group, Group>({
            predicate: (componentOrGroup): componentOrGroup is Group => componentOrGroup.name === rowId.group && componentOrGroup.type === 'group',
            modify: group => ({
                components: modifyOrCreate({
                    predicate: (component): component is Component => component.type === 'component' && component.name === rowId.subGroup,
                    modify: component => ({ ...component, ...update(component) })
                }, group.components)
            })
        }, bundle.components);
    } else {
        components = modifyOrCreate<Component | Group, Component>({
            predicate: (componentOrGroup): componentOrGroup is Component => componentOrGroup.name === rowId.group && componentOrGroup.type === 'component',
            modify: component => ({ ...component, ...update(component) })
        }, bundle.components);
    }

    return { ...bundle, components };
};

/**
 * Update a component in the tree of CClasses, identified by a rowId.
 */
export const updateComponentInCClasses = (
    cClasses: CClass[],
    rowId: ComponentRowId,
    update: (component: Component) => Partial<Component>
): CClass[] => modifyOrCreate({
    predicate: (cClass): cClass is CClass => cClass.name === rowId.cClass,
    modify: cClass => ({
        availableBundles: modifyOrCreate({
            predicate: (bundle): bundle is Bundle => bundle.name === rowId.bundleName,
            modify: bundle => updateComponentInBundle(bundle, rowId, update)
        }, cClass.availableBundles)
    })
}, cClasses);

export const targetMatches = (targetType: string) => ({ buildContext }: { buildContext: BuildContext }) => buildContext.targetType === targetType;

export const pickAllTargetTypes = (buildContexts: BuildContext[]) => {
    return [...new Set(buildContexts.map(buildContext => buildContext.targetType))];
};

export const filterSelectedOptionAvailableForAllTargets = (selectedOptions: SelectedComponentOption[], optionsAvailableInAllTargets: ComponentOption[]): SelectedComponentOption[] => {
    return selectedOptions.filter(({ resolvedOption }) => optionsAvailableInAllTargets.some(
        ({ id }) => resolvedOption ? componentOptionIdsEqual(id)(resolvedOption) : false)
    );
};

export const findGroupsInAllTargets = <T extends keyof P, P extends { buildContext: BuildContext; }>(groupedSelectedOptions: Grouped<P, T>[], allTargetTypes: string[]): P[] => {
    const filteredGroupedOptions = groupedSelectedOptions.filter(
        ({ items }) => allTargetTypes.every(targetType => items.some(targetMatches(targetType)))
    );
    return filteredGroupedOptions.flatMap(({ items }) => items);
};

/**
 * Filter the selected options from a list of options for the given CurrentTarget state
 */
export const filterSelectedOptionsForTarget = (
    selectedOptions: SelectedComponentOption[],
    currentTarget: CurrentTarget,
    filteredAvailableOptions: ComponentOption[],
    availableBuildContexts: BuildContext[]
): SelectedComponentOption[] => {
    if (currentTarget.type === 'all') {
        const groupedSelectedOptions = groupBy(selectedOptions, 'reference', componentOptionIdsEqual);
        const selectedInAllTargets = findGroupsInAllTargets(groupedSelectedOptions, pickAllTargetTypes(availableBuildContexts));
        const selectedOptionAvailableForAllTargets = filterSelectedOptionAvailableForAllTargets(selectedOptions, filteredAvailableOptions);
        return (selectedInAllTargets.length > 0) ? selectedInAllTargets : selectedOptionAvailableForAllTargets;
    } else if (currentTarget.type === 'one') {
        return selectedOptions.filter(targetMatches(currentTarget.target));
    } else {
        // exhaustive check
        return currentTarget;
    }
};

/**
 * Filter the available options from a list of options for the given CurrentTarget state
 */
export const filterAvailableOptionsForTarget = (options: ComponentOption[], currentTarget: CurrentTarget, availableBuildContexts: BuildContext[]): ComponentOption[] => {
    if (currentTarget.type === 'all') {
        const groupedOptions = groupBy(options, 'id', componentOptionIdsEqual);
        return findGroupsInAllTargets(groupedOptions, pickAllTargetTypes(availableBuildContexts));
    } else if (currentTarget.type === 'one') {
        return options.filter(targetMatches(currentTarget.target));
    } else {
        // exhaustive check
        return currentTarget;
    }
};

export const filterAvailableOptionsForPacks = (options: ComponentOption[], packFilterValue: PacksFilterValue): ComponentOption[] => {
    switch (packFilterValue) {
        case 'all':
            return options;
        case 'solution':
            return options.filter(option => option.packMetadata.selectedInSolution);
    }
};

export type SelectedAndAvailableOptions = {
    selectedOptions: SelectedComponentOption[],
    availableOptions: ComponentOption[],
};

export const filterSelectedAndAvailableOptions = (
    selectedOptions: SelectedComponentOption[],
    availableOptions: ComponentOption[],
    currentTarget: CurrentTarget,
    availableBuildContexts: BuildContext[],
    packFilterValue: PacksFilterValue,
): SelectedAndAvailableOptions => {
    let filteredAvailableOptions = filterAvailableOptionsForPacks(availableOptions, packFilterValue);
    filteredAvailableOptions = filterAvailableOptionsForTarget(filteredAvailableOptions, currentTarget, availableBuildContexts);

    const filteredSelectedOptions = filterSelectedOptionsForTarget(selectedOptions, currentTarget, filteredAvailableOptions, availableBuildContexts);

    return {
        selectedOptions: filteredSelectedOptions,
        availableOptions: filteredAvailableOptions,
    };
};

export type ComponentOptionFilter = ComponentOptionId & {
    primaryField: keyof ComponentOptionId;
    secondaryFields: [keyof ComponentOptionId, keyof ComponentOptionId];
};

export const filterComponentOptions = (options: ComponentOption[], filter: ComponentOptionFilter): ComponentOptionId | undefined => {
    const matchPrimary = options.filter(option =>
        option.id[filter.primaryField] === filter[filter.primaryField]
    ).map(({ id }) => id);

    if (matchPrimary.length === 0) {
        return undefined;
    }

    const matchSecondary: ComponentOptionId[] = [];

    for (const id of matchPrimary) {
        const field0Matches = id[filter.secondaryFields[0]] === filter[filter.secondaryFields[0]];
        const field1Matches = id[filter.secondaryFields[1]] === filter[filter.secondaryFields[1]];

        if (field0Matches && field1Matches) {
            return id;
        } else if (field0Matches || field1Matches) {
            matchSecondary.push(id);
        }
    }

    return matchSecondary[0] || matchPrimary[0];
};

export const componentOptionIdsEqual = (id1: ComponentOptionId) => (id2: ComponentOptionId) =>
    id1.variant === id2.variant &&
    id1.vendor === id2.vendor &&
    id1.version === id2.version;

export const selectedComponentOptionsAreEqual = (option1: SelectedComponentOption) => (option2: SelectedComponentOption): boolean => {
    const referencesEqual = componentReferencesAreEqual(option1.reference)(option2.reference);
    const resolvedOptionsEqual = option1.resolvedOption === undefined
        ? option2.resolvedOption === undefined
        : option2.resolvedOption !== undefined && componentOptionIdsEqual(option1.resolvedOption)(option2.resolvedOption);
    const contextsEqual = buildContextsEqual(option1.buildContext)(option2.buildContext);
    const originsEqual = option1.origin.type === 'layer' && option2.origin.type === 'layer' ? option1.origin.layerId === option2.origin.layerId
        : option1.origin.type === 'project' && option2.origin.type === 'project' ? option1.origin.projectId === option2.origin.projectId
            : false;
    return referencesEqual && resolvedOptionsEqual && contextsEqual && originsEqual;
};

export const componentReferencesAreEqual = (ref1: ComponentReference) => (ref2: ComponentReference) =>
    componentOptionIdsEqual(ref1)(ref2) && componentRowIdsEqual(ref1)(ref2);

export const componentReferenceToRowId = ({ cClass, bundleName, group, subGroup }: ComponentReference): ComponentRowId =>
    ({ cClass, bundleName, group, subGroup });

export const componentReferenceToOptionId = ({ variant, vendor, version }: ComponentReference): ComponentOptionId =>
    ({ variant, vendor, version });
