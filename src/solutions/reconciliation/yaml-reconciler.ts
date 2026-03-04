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
import { YAMLMap, YAMLSeq } from 'yaml';

export type ReconcileSequenceItemsOperations<N, A> = {
    nodeMatchesData: (data: A) => (node: N)  => boolean;
    createNode: (data: A) => N;
    /**
     * Update the node according to the data. Return true if there was a change.
     */
    updateNode?: (node: N, data: A) => boolean;
}

/**
 * Reconcile the existing nodes with the new data, aiming to keep the original nodes if possible.
 * Returns undefined if there were no changes.
 */
export const reconcileSequenceItems = <N, A>(
    { updateNode, nodeMatchesData, createNode }: ReconcileSequenceItemsOperations<N, A>
) => (existingNodes: N[], inputData: A[]): N[] | undefined => {
        let updated = false;

        const newData = inputData.map((data): N => {
            const existingNode = existingNodes.find(nodeMatchesData(data));
            const node = existingNode || createNode(data);
            updated = updated || !existingNode;
            if (updateNode) {
                const didUpdateNode = updateNode(node, data);
                updated = updated || didUpdateNode;
            }
            return node;
        });

        updated = updated || newData.length !== existingNodes.length;
        return updated ? newData : undefined;
    };

/**
 * Reconcile the sequence at a key in a map with the new data.
 * Remove the value from the map if there are no items.
 */
export const reconcileOptionalSequenceInMap = <N, A>(
    reconcileOperations: ReconcileSequenceItemsOperations<N, A>,
    key: string,
    valueIsNode: (input: unknown) => input is N,
) => (map: YAMLMap, inputData: A[]): boolean => {
        const existingValue = map.get(key);
        const existingSeq = YAML.isSeq(existingValue) ? existingValue : undefined;
        const existingItems: N[] | undefined  = existingSeq && existingSeq.items.every(valueIsNode) ? existingSeq.items : undefined;
        const updatedItems = reconcileSequenceItems(reconcileOperations)(existingItems || [], inputData);

        if (updatedItems) {
            if (updatedItems.length === 0) {
                map.delete(key);
            } else {
                const newSeq = existingSeq || new YAMLSeq();
                newSeq.items = updatedItems;
                map.set(key, newSeq);
            }
            return true;
        } else {
            return false;
        }
    };

export const reconcileOptionalScalarInMap = (map: YAMLMap, key: string, input: string | undefined): boolean => {
    const existingValue = map.get(key, false);

    if (input === undefined) {
        if (existingValue !== undefined) {
            map.delete(key);
            return true;
        }
    } else if (typeof existingValue !== 'string' || existingValue !== input) {
        map.set(key, input);
        return true;
    }

    return false;
};
