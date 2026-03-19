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

import { CtRoot, CtAggregate, CtClass, Component } from '../../../json-rpc/csolution-rpc-client';

/**
 * Traverses a component tree and applies a callback function to each component or aggregate.
 * @param {CtRoot} tree - The component tree object to be traversed.
 * @param {function} callback - The callback function to be applied to each component or aggregate.
 */
export const componentTreeWalker = (tree: CtRoot, callback: (node: Component | CtAggregate | CtClass, type: string) => void): void => {
    const traverseAggregate = (aggregate: CtAggregate) => {
        callback(aggregate, 'aggregate');
        aggregate.variants.forEach(variant => variant.components.forEach(component => callback(component, 'component')));
    };

    tree.classes?.forEach(cls => {
        callback(cls, 'class');
        cls.bundles?.forEach(bundle => {
            bundle.cgroups?.forEach(cgroup => cgroup.aggregates?.forEach(traverseAggregate));
            bundle.aggregates?.forEach(traverseAggregate);
        });
    });
};
