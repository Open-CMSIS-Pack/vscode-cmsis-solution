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

import * as YAML from 'yaml';
import { Scalar, YAMLMap } from 'yaml';
import { BuildContext, Compiler, ComponentData, Device, PackData, ProjectData, SolutionData, TargetTypeData } from '../../core-tools/client/solutions_pb';
import { protoComponentReferencesAreEqual, deserialiseComponentReference, deserialiseCompiler } from '../deserialising/solution-deserialisers';
import { serialiseBoardId, serialiseCompiler, serialiseComponentReference, serialiseDevice } from '../solution-serialisers';
import { serialisePackReference } from '../solution-serialisers';
import { reconcileOptionalScalarInMap, reconcileOptionalSequenceInMap, reconcileSequenceItems } from './yaml-reconciler';
import { ProjectReference } from '../parsing/solution-file';
import { compilerNameToEnum } from '../../core-tools/core-tools-data-building';

export type NewSolutionData = {
    solution: SolutionData.AsObject;
    projectRefs: ProjectReference[];
}

export type DocumentReconciler<A> = (yamlDocument: YAML.Document, data: A)=> boolean

const reconcileSolutionProjects = (map: YAML.YAMLSeq, projects: ProjectReference[]): boolean => {
    const existingValue = map.get('projects');
    const existingSeq = YAML.isSeq(existingValue) ? existingValue : undefined;
    const existingItems: YAMLMap<unknown>[] | undefined  = existingSeq && existingSeq.items.every(YAML.isMap) ? existingSeq.items : undefined;

    const updatedItems = reconcileSequenceItems<YAMLMap<unknown>, ProjectReference>({
        createNode: project => {
            const value = new YAMLMap();
            value.set('project', project.reference);
            return value;
        },
        nodeMatchesData: project => map => {
            return project.reference === map.get('project');
        }
    })(existingItems || [], projects);

    if (updatedItems) {
        const newSeq = existingSeq || new YAML.YAMLSeq();
        newSeq.items = updatedItems;
        map.set('projects', newSeq);
        return true;
    } else {
        return false;
    }
};

const reconcileSolutionTargetTypes = reconcileOptionalSequenceInMap<YAMLMap, TargetTypeData.AsObject>({
    createNode: targetTypeData => {
        const map = new YAMLMap();
        map.set('type', targetTypeData.id?.id);
        return map;
    },
    nodeMatchesData: targetTypeData => map => targetTypeData.id?.id === map.get('type'),
    updateNode: (map, targetTypeData): boolean => {
        const serialisedBoard = targetTypeData.board ? serialiseBoardId(targetTypeData.board) : undefined;
        const boardUpdated = reconcileOptionalScalarInMap(map, 'board', serialisedBoard);

        const serialisedDevice = targetTypeData.device ? serialiseDevice(targetTypeData.device) : undefined;
        const deviceUpdated = reconcileOptionalScalarInMap(map, 'device', serialisedDevice);

        return boardUpdated || deviceUpdated;
    }
}, 'target-types', YAML.isMap);

const reconcileCompiler = (map: YAMLMap, protobufCompiler: Compiler.NameMap[keyof Compiler.NameMap] | undefined): boolean => {
    const existingCompilerString = map.get('compiler', true)?.toString();
    const existingCompiler = existingCompilerString ? deserialiseCompiler(existingCompilerString) : undefined;

    const newCompilerName: string | undefined = compilerNameToEnum.find(c => c.enum === protobufCompiler)?.name;

    if (existingCompiler?.name !== newCompilerName) {
        if (newCompilerName) {
            const newCompiler = { name: newCompilerName, version: existingCompiler?.version };
            map.set('compiler', serialiseCompiler(newCompiler));
        } else {
            map.delete('compiler');
        }
        return true;
    }

    return false;
};

const reconcileDevice = (map: YAMLMap, device: Device.AsObject | undefined): boolean => {
    const existingDeviceString = map.get('device', true)?.toString();
    const newDeviceString = device ? serialiseDevice(device) : undefined;

    if (existingDeviceString !== newDeviceString) {
        if (device) {
            map.set('device', newDeviceString);
        } else {
            map.delete('device');
        }
        return true;
    }
    return false;
};

const reconcilePacks = reconcileOptionalSequenceInMap<YAMLMap, PackData.AsObject>({
    createNode: packData => {
        const map = new YAMLMap();
        if (packData.reference) {
            map.set('pack', serialisePackReference(packData.reference));
        }
        return map;
    },
    nodeMatchesData: packData => map => !!packData.reference && map.get('pack') === serialisePackReference(packData.reference),
}, 'packs', YAML.isMap);

const reconcileContextRestrictionList = (key: 'for-context' | 'not-for-context') => reconcileOptionalSequenceInMap<Scalar<string>, string>({
    createNode: contextRestriction => new Scalar(contextRestriction),
    nodeMatchesData: contextRestriction => scalar => contextRestriction === scalar.value,
}, key, (input: unknown): input is Scalar<string> => YAML.isScalar(input) && typeof input.value === 'string');

const reconcileContextRestrictionString = (
    key: 'for-context' | 'not-for-context',
    existingString: Scalar<unknown>,
    contextList: string[],
    map: YAMLMap<unknown, unknown>,
): boolean => {
    if (contextList.length === 1 && contextList[0] !== existingString.toString()) {
        map.set(key, contextList[0]);
        return true;
    } else if (contextList.length > 1) {
        map.set(key, contextList);
        return true;
    }
    return false;
};

const reconcileContextRestriction = (
    key: 'for-context' | 'not-for-context',
    contexts: BuildContext.AsObject[],
    map: YAMLMap<unknown, unknown>,
): boolean => {
    const contextList = buildContextToList(contexts);
    const contextValue = map.get(key, true);

    if (!contextList.length && contextValue) {
        map.delete(key);
        return true;
    }

    if (contextList.length) {
        const existingString = YAML.isScalar(contextValue) ? contextValue : undefined;
        if (existingString) {
            return reconcileContextRestrictionString(key, existingString, contextList, map);
        } else {
            return reconcileContextRestrictionList(key)(map, contextList);
        }
    }

    return false;
};

const reconcileInstances = (componentData: ComponentData.AsObject, map: YAMLMap<unknown, unknown>): boolean => {
    const instances = map.get('instances', true)?.value;

    if (instances === componentData.instances) {
        return false;
    }

    if (instances === undefined && componentData.instances === 1) {
        return false;
    }

    map.set('instances', componentData.instances);

    return true;
};

const buildContextToList = (buildContexts: BuildContext.AsObject[]): string[] => {
    return buildContexts.map(buildContext => {
        let contextString = '';
        if (buildContext.targetTypeId?.id) {
            contextString += `+${buildContext.targetTypeId.id}`;
        }
        if (buildContext.buildTypeId?.id) {
            contextString += `.${buildContext.buildTypeId.id}`;
        }
        return contextString;
    });
};

const reconcileComponents = reconcileOptionalSequenceInMap<YAMLMap, ComponentData.AsObject>({
    createNode: componentData => {
        const map = new YAMLMap();
        if (componentData.reference) {
            map.set('component', serialiseComponentReference(componentData.reference));
        }
        return map;
    },
    updateNode: (map, componentData) => {
        const forContextUpdated = reconcileContextRestriction('for-context', componentData.forContextsList, map);
        const notForContextUpdated = reconcileContextRestriction('not-for-context', componentData.notForContextsList, map);
        const instancesUpdated = reconcileInstances(componentData, map);
        return forContextUpdated || notForContextUpdated || instancesUpdated;
    },
    nodeMatchesData: componentData => map =>{
        const refsAreEqual = protoComponentReferencesAreEqual(
            deserialiseComponentReference(map.get('component') as string),
            componentData.reference,
        );

        return refsAreEqual;
    },
}, 'components', YAML.isMap);

const reconcileDocument = <A>(contentKey: string, reconcileContent: (map: YAMLMap, data: A) => boolean): DocumentReconciler<A> => (yamlDocument, data) => {
    const content = yamlDocument.get(contentKey);

    if (content && YAML.isMap(content)) {
        const contentWasUpdated = reconcileContent(content, data);

        if (contentWasUpdated) {
            // YAML maps can use "flow" or "block" mapping. "Block" is the standard YAML format.
            // Force block mapping to use standard YAML formatting, e.g. when adding the first component to an empty project.
            content.flow = false;
            return true;
        }
    }

    return false;
};

/**
 * Update a YAML Document to match the given solution data. This assumes that only components and pack lists are different.
 * Returns true if there was an update.
 */
export const reconcileSolutionDocument: DocumentReconciler<NewSolutionData> = reconcileDocument(
    'solution',
    (map, data): boolean => {
        const packsUpdated = reconcilePacks(map, data.solution.packsList);
        const solutionProjectsUpdated = reconcileSolutionProjects(map, data.projectRefs);
        const solutionTargetTypesUpdated = reconcileSolutionTargetTypes(map, data.solution.targetTypesList);
        const compilerUpdated = reconcileCompiler(map, data.solution.compiler?.name);
        return packsUpdated || solutionProjectsUpdated || solutionTargetTypesUpdated || compilerUpdated;
    }
);

/**
 * Update a YAML Document to match the given project data. This assumes that only components and pack lists are different.
 * Returns true if there was an update.
 */
export const reconcileProjectDocument: DocumentReconciler<Pick<ProjectData.AsObject, 'componentsList' | 'packsList' |'device'>> = reconcileDocument(
    'project',
    (map, data): boolean => {
        const componentsUpdated = reconcileComponents(map, data.componentsList);
        const packsUpdated = reconcilePacks(map, data.packsList);
        const deviceUpdated = reconcileDevice(map, data.device);
        return componentsUpdated || packsUpdated || deviceUpdated;
    }
);
