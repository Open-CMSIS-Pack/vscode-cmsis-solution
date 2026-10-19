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

import { CTreeItem, ETreeItemKind } from '@open-cmsis-pack/cmsis-common/tree-item';

export const appendSequenceMapEntry = (parent: CTreeItem, containerTag: string, key: string, value: string): CTreeItem => {
    const container = parent.createChild(containerTag, true).setKind(ETreeItemKind.Sequence);
    return container.createChild('-').setKind(ETreeItemKind.Map).setValue(key, value) as CTreeItem;
};

const setStringOrSequence = (item: CTreeItem, key: string, values: readonly string[]): void => {
    item.removeChild(item.getChild(key));
    if (values.length === 1) {
        item.setValue(key, values[0]);
    } else if (values.length > 1) {
        const sequence = item.createChild(key).setKind(ETreeItemKind.Sequence);
        for (const value of values) {
            sequence.createChild('-').setText(value);
        }
    }
};

export const setContextRestrictions = (
    item: CTreeItem,
    forContext: readonly string[] = [],
    notForContext: readonly string[] = [],
): void => {
    setStringOrSequence(item, 'for-context', forContext);
    setStringOrSequence(item, 'not-for-context', notForContext);
};
