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

import { TableRowSelection } from 'antd/es/table/interface';
import { ComponentRowDataType } from '../../../data/component-tools';
import { isInActiveLayer } from '../../helpers/components-packs-helpers';
import { flatTree } from '../../../data/component-tree';
import { TargetSetData } from '../../../components-data';

/**
 * Returns Ant Design Table row selection config for component selection.
 * - Only allows selection for leaf nodes in the active layer.
 * - Updates selection state via onChangeComponentValue.
 */
export const rowSelection = (
    treeNodes: ComponentRowDataType[],
    onChangeComponentValue: (record: ComponentRowDataType) => void,
    state: { activeLayer?: string, selectedTargetType: TargetSetData | undefined }
): TableRowSelection<ComponentRowDataType> => ({
    selectedRowKeys: flatTree(treeNodes)
        .filter(c => c.aggregate?.selectedCount)
        .map((node) => node.data.id),
    onSelect: (record, selected) => {
        if (!record.aggregate) return;

        const { aggregate } = record;
        aggregate.selectedCount = selected ? 1 : 0;

        const layer = /\.clayer\.ya?ml$/i.test(state.selectedTargetType?.path || '') ? state.selectedTargetType?.path : '';
        aggregate.options = {
            ...aggregate.options,
            layer: layer,
        };

        onChangeComponentValue(record);
    },
    getCheckboxProps: (record: ComponentRowDataType) => ({
        disabled: !isInActiveLayer(record, state) && record.aggregate.selectedCount ? true : false,
        type: 'checkbox',
        name: record.name,
        className: record.children && record.children.length > 0 ? 'hidden' : '',
        id: record.data.id,
    }),
    hideSelectAll: true,
});
