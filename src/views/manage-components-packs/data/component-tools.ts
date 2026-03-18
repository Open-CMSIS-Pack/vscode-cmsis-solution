/**
 * Copyright 2025-2026 Arm Limited
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

import { CtAggregate, Api, CtBundle, CtClass, Component, CtRoot, Result, PackReference } from '../../../json-rpc/csolution-rpc-client';
import { BuildContext } from '../components-data';
import { parseComponentId } from './component-parse';

export enum ComponentScope {
    All = 'all',
    Solution = 'solution'
}

export enum ValidationResultCodes {
    UNDEFINED = 'not evaluated yet',
    R_ERROR = 'Error: in condition evaluation (recursion detected, condition is missing)',
    FAILED = 'component not available for selected hardware or compiler',
    MISSING = 'component not found in <packs>',
    MISSING_API = 'required API not available in <packs>',
    MISSING_API_VERSION = 'API version <api_version> not available (version <version> found in pack <pack_id>)',
    UNAVAILABLE = 'this is unavailable due to condition restrictions',
    UNAVAILABLE_PACK = 'this is in installed packs, but pack is not included in project',
    INCOMPATIBLE = 'this is incompatible with other selected components',
    INCOMPATIBLE_VERSION = 'incompatible version of component is selected',
    INCOMPATIBLE_VARIANT = 'incompatible variant of component is selected',
    CONFLICT = 'Select exactly one component from list',
    CONFLICT_ONCE = 'can\'t be selected in combination with',
    INSTALLED = 'matching component is installed, but not selectable because not in active bundle',
    SELECTABLE = 'requires selection of other components',
    FULFILLED = 'required component selected or no dependency exists',
    IGNORED = 'condition/expression is irrelevant for the current context',
}

/**
 * @description Interface for a row of component data used in the component tree/table.
 * Each row contains the component's id, label, name, parsed metadata, variants, and children.
 * The `data` property holds the raw component data, and `parsed` contains extracted fields.
 * @interface ComponentRowDataType
 * @property {string} id - The unique identifier for the component row.
 * @property {string} label - The display label for the component.
 * @property {React.ReactNode} key - The unique key for React rendering.
 * @property {string} name - The name of the component.
 * @property {IComponent} data - The raw component data.
 * @property {INodeComponent} parsed - Parsed metadata from the component id.
 * @property {string[]} variants - Available variants for the component.
 * @property {ComponentRowDataType[]} [children] - Optional child components.
 * @interface
 * @memberof module:component-tools
 */
export interface ComponentRowDataType {
    key: string;
    name: string;
    data: Component;
    aggregate: CtAggregate,
    api?: Api,
    parsed: INodeComponent;
    variants: string[];
    children?: ComponentRowDataType[];
    validation?: Result;
}

export interface PackRowDataType {
    packId: string;
    key: string;
    name: string;
    description: string;
    overviewLink: string;
    versionUsed: string;
    versionTarget: string;
    used: boolean;
    references: PackReference[];
    latestOnlineVersion?: string;
}

export type OriginDataType = {
    type: string;
    label: string;
    path: string;
    relativePath: string;
    versionOperator: string;
    version: string;
    selected: boolean;
}

/**
 * @description Interface for parsed component metadata extracted from the component id.
 * This includes vendor, class, bundle, group, sub, variant, and version information.
 * @interface INodeComponent
 * @property {string} vendor - The vendor of the component.
 * @property {string} class - The class of the component.
 * @property {string} [bundle] - The bundle name (optional).
 * @property {string} [group] - The group name (optional).
 * @property {string} [sub] - The sub-component name (optional).
 * @property {string} [variant] - The variant name (optional).
 * @property {string} [version] - The version string (optional).
 * @interface
 * @memberof module:component-tools
 */
export interface INodeComponent {
    vendor: string;
    class: string;
    bundle?: string;
    group?: string;
    sub?: string;
    variant?: string;
    version?: string;
}

/**
 * @description Function to select components from an aggregate based on the active variant.
 * If no active variant is set, it returns the components of the first variant.
 * @param {Aggregate} a - The aggregate object containing variants and components.
 * @returns {Component[]} - An array of selected components.
 * @function selectComponentsFromAggregate
 * @memberof module:component-tools
 * @private
 * @example
 * const selectedComponents = selectComponentsFromAggregate(aggregate);
 * // selectedComponents will contain the components of the active variant or the first variant.
 */
const selectComponentsFromAggregate = (a: CtAggregate): Component[] => {
    if (a.activeVariant && a.activeVariant !== '') {
        return a.variants
            .sort((a, b) => a.name.localeCompare(b.name))
            .find(v => v.name === a.activeVariant)?.components ?? [];
    }
    return a.variants[0].components;
};

function filterAggregatesByBundle(conditionAggregates: string[] | undefined, parsedComponent: INodeComponent | undefined): string[] | undefined {
    if (!conditionAggregates) return conditionAggregates;
    return conditionAggregates.filter(aggId => {
        const aggregate = parseComponentId(aggId);
        return (!parsedComponent?.bundle || !aggregate?.bundle) || aggregate?.bundle === parsedComponent.bundle;
    });
}

function getConflictOnceValidation(a: CtAggregate, component: Component, validations: Result[] | undefined, validationResult: Result | undefined): Result | undefined {
    if (!validations) return undefined;
    const agg = validations.find(validation => validation.aggregates?.some(aggregateId => aggregateId === a.id));
    if (agg && !validationResult) {
        // Only add CONFLICT_ONCE if not already set
        const newValidation = { ...agg };
        newValidation.aggregates = [...(agg.aggregates?.filter(aId => !component.id.startsWith(aId)) || [])];
        newValidation.result = 'CONFLICT_ONCE';
        newValidation.id = agg.id + '/' + component.id;
        return newValidation;
    }
    return validationResult;
}

/**
 * @description Function to create a tree structure of components from aggregates.
 * Each component is represented as a row with its id, label, name, parsed metadata, variants, and children.
 * The function also includes the instance count and selected status of each component.
 * @param {Aggregate[]} aggregates - An array of aggregates containing components.
 * @param {string} groupName - The name of the group to which the components belong.
 * @returns {ComponentRowDataType[]} - An array of component rows representing the tree structure.
 * @function variantComponents
 * @memberof module:component-tools
 * @private
 */
const variantComponents = (
    aggregates: CtAggregate[],
    groupName: string,
    validations: Result[] | undefined
): ComponentRowDataType[] => {
    const tree: ComponentRowDataType[] = [];

    aggregates
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(a => {
            const components = selectComponentsFromAggregate(a);
            if (components.length === 0) {
                components.push({
                    id: a.id,
                    pack: '',
                    description: `${a.name} ${a.result ? `(${a.result})` : ''}`,
                });
            }
            components.forEach(component => {
                const parsedComponent = parseComponentId(component.id);
                // Find validation result for this component
                let validationResult = validations?.find(v => {
                    const vParsed = parseComponentId(v.id);
                    return vParsed?.class === parsedComponent?.class && vParsed?.group === parsedComponent?.group;

                });
                if (validationResult?.conditions) {
                    validationResult.conditions.forEach(condition => {
                        condition.aggregates = filterAggregatesByBundle(condition.aggregates, parsedComponent);
                    });
                }
                // Handle aggregates that are dependencies (CONFLICT_ONCE logic)
                validationResult = getConflictOnceValidation(a, component, validations, validationResult);
                if ((a.activeVersion ?? '') === (parsedComponent?.version ?? '')) {
                    tree.push({
                        name: parsedComponent?.sub ?? parsedComponent?.group ?? component.id,
                        data: {
                            id: component.id,
                            pack: component.pack,
                            description: component.description,
                            doc: component.doc,
                            maxInstances: component.maxInstances,
                        },
                        aggregate: a,
                        parsed: parsedComponent ?? { vendor: '', class: a.name ?? groupName, variant: '' },
                        variants: a.variants.length > 0 ? a.variants.map(v => v.name) : [],
                        children: [],
                        key: component.id,
                        validation: validationResult,
                    });
                }
            });
        });

    return tree;
};

/**
 * @description Function to create a tree structure of sub-groups from a bundle.
 * Each sub-group is represented as a row with its id, label, name, parsed metadata, variants, and children.
 * The function also includes the instance count and selected status of each component.
 * @param {Bundle} bundle - The bundle object containing groups and aggregates.
 * @param {Class} cclass - The class object to which the bundle belongs.
 * @returns {ComponentRowDataType[]} - An array of component rows representing the sub-groups.
 * @function subGroups
 * @memberof module:component-tools
 * @private
 */
const subGroups = (
    bundle: CtBundle,
    cclass: CtClass,
    validations: Result[] | undefined
): ComponentRowDataType[] => {
    const tree: ComponentRowDataType[] = [];

    (bundle.cgroups || [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(g => {
            const validationResult = validations?.find(v => {
                const c = parseComponentId(v.id);
                return c?.group == g.name && c?.sub === undefined && c?.class === cclass.name;
            });

            tree.push({
                name: g.name,
                data: {
                    id: g.name,
                    pack: '',
                    description: '',
                },
                api: g.api,
                parsed: {
                    vendor: '',
                    class: g.name,
                    variant: '',
                },
                aggregate: {
                    id: g.name,
                    name: '',
                    activeVersion: '',
                    selectedCount: 0,
                    variants: g.aggregates ? g.aggregates.map(a => ({
                        name: a.name,
                        components: selectComponentsFromAggregate(a),
                    })) : [],
                },
                variants: [],
                children: variantComponents(g.aggregates ? g.aggregates : [], g.name, validations),
                key: `${cclass.name}${bundle.name !== '' ? '@' + bundle.name : ''}:${g.name}`,
                validation: validationResult,
            });
        });

    return tree;
};

/**
 * @description Function to fetch the active bundle from a class.
 * If no active bundle is set, it returns the first bundle in the list.
 * If no bundles are available, it returns a default object with empty values.
 * @param {Class} cclass - The class object containing bundles.
 * @returns {Bundle} - The active bundle or a default object with empty values.
 * @function fetchBundle
 * @memberof module:component-tools
 * @private
 */
const fetchBundle = (
    cclass: CtClass
): CtBundle => {
    const none = { name: '', groups: [], bundle: { description: '', doc: '', id: '' } };
    if (cclass.activeBundle === '' || cclass.bundles?.length == 1) {
        return cclass.bundles?.at(0) ?? none;
    }
    return cclass.bundles?.find(b => b.name === cclass.activeBundle) ?? none;
};

/**
 * @description Function to map a component tree into a flat structure of component rows.
 * Each row contains the component's id, label, name, parsed metadata, variants, and children.
 * The function also includes the instance count and selected status of each component.
 * @param {ComponentTree} componentTree - The component tree object containing classes and bundles.
 * @returns {ComponentRowDataType[]} - An array of component rows representing the flat structure.
 * @function mapTree
 * @memberof module:component-tools
 * @private
 */
export const mapTree = (
    componentTree: CtRoot,
    validations: Result[] | undefined
): ComponentRowDataType[] => {
    const tree: ComponentRowDataType[] = [];
    componentTree.classes
        ?.sort((a, b) => a.name.localeCompare(b.name))
        .forEach(c => {
            const ab = fetchBundle(c);

            tree.push({
                name: c.name,
                data: {
                    id: c.name,
                    pack: '',
                    description: ab.bundle?.description ?? c.taxonomy?.description ?? '',
                    doc: ab.bundle?.doc ?? c.taxonomy?.doc ?? undefined,
                },
                parsed: {
                    vendor: '',
                    class: c.name,
                    variant: c.activeBundle,
                },
                aggregate: {
                    id: c.name,
                    name: '',
                    activeVersion: '',
                    selectedCount: 0,
                    variants: [],
                },
                variants: c.bundles?.map(b => b.name) || [],
                children: [...variantComponents(ab.aggregates ?? [], 'n/a', validations), ...subGroups(ab, c, validations)],
                key: `${c.name}`,
            });
        });
    return tree;
};

export const componentNiceName = (component: string | INodeComponent): string => {
    const localComponent = typeof component === 'string' ? parseComponentId(component) : component;
    return `${localComponent?.class}:${localComponent?.sub ? `${localComponent.group}:` : ''}${localComponent?.sub ? localComponent.sub : localComponent?.group}${localComponent?.variant ? `&${localComponent.variant}` : ''}`;
};

/**
 * Builds a name for the build context based on the project name and the build context.
 * If the build context is a string, it appends the project name and the build context.
 * If the build context is an object, it appends the project name, build type, and target type.
 * @param buildContext The build context, which can be a string or an object with buildType and targetType properties.
 * @param {BuildContext} buildContext - The build context, which can be a string or an object with buildType and targetType properties.
 * @returns {string} The constructed build context name.
 */
export const getBuildContextName = (buildContext: BuildContext): string => {
    if (buildContext) {
        const match = new RegExp(/([\w.]+)\.\w+\.\w+$/gi).exec(buildContext.projectPath || 'unknown');
        const project = match ? match[1] : 'unknown';
        return `${project}.${buildContext.buildType}+${buildContext.targetType}`;
    } else {
        return '';
    }
};

/**
 * Parses a build context name into its project, build type, and target type components.
 * @param name The build context name string to parse.
 * @returns An object containing the project, buildType, and targetType.
 */
export const parseBuildContextName = (name: string): {
    project: string;
    buildType?: string;
    targetType?: string;
} => {
    const plus = name.lastIndexOf('+');
    const left = plus >= 0 ? name.slice(0, plus) : name;
    const targetType = plus >= 0 ? name.slice(plus + 1) : undefined;

    const dot = left.lastIndexOf('.');
    const project = dot >= 0 ? left.slice(0, dot) : left;
    const buildType = dot >= 0 ? left.slice(dot + 1) : undefined;

    return { project, buildType, targetType };
};
