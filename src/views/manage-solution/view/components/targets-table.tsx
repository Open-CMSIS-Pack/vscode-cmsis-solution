/**
 * Copyright 2024-2026 Arm Limited
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

import * as React from 'react';
import { SolutionUpdateAction } from '../state/reducer';
import { CompactDropdown } from '../../../common/components/compact-dropdown';
import { TargetType } from '../state/manage-solution-state';
import { Radio } from 'antd';

export interface TargetsTableProps {
    options: TargetType[];
    selectedTarget: TargetType | undefined;
    updateSelectedTarget: (action: SolutionUpdateAction) => void;
    addContext: () => void;
}

export const TargetsTable = (props: TargetsTableProps) => {

    const targetTypeSelection = (option: TargetType): void => {
        const target = option.name;
        const hasDefault = option.targetSets?.some(set => !set.name) ?? false;
        const set = option.selectedSet || (hasDefault ? '<default>' : option.targetSets?.[0]?.name);
        props.updateSelectedTarget({ type: 'SET_SELECTED_TARGET', target, set });
    };

    const targetSetSelection = (value: string, option: TargetType): void => {
        option.selectedSet = value === '<default>' ? undefined : value;
        props.updateSelectedTarget({ type: 'SET_SELECTED_TARGET', target: option.name, set: value });
    };

    return (
        <table className='active-target-table'>
            <thead>
                <tr>
                    <th className="select-column">
                        {/* <Button
                            icon={<PlusSquareOutlined />}
                            onClick={() => props.addContext()}
                            className='add-button'
                        /> */}
                    </th>
                    <th className='column-name'>Target Type</th>
                    <th className='column-set'>Target Set</th>
                    <th className='column-board'>Board</th>
                    <th className='column-device'>Device</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {props.options.map((option, i) => (<tr key={i} className="target-option">
                    <td className="select-column">
                        <Radio checked={option.name === props.selectedTarget?.name}
                            name='target-selected'
                            onChange={() => targetTypeSelection(option)}
                        />
                    </td>
                    <td className="target-type">{option.name}</td>
                    <td className="target-set">
                        <CompactDropdown
                            available={option.targetSets?.map(set => set.name || '<default>') || ['<default>']}
                            selected={option.selectedSet || '<default>'}
                            onChange={value => targetSetSelection(value, option)}
                        />
                    </td>
                    <td className="board-name">{option.board}</td>
                    <td className="device-name">{option.device}</td>
                    <td></td>
                </tr>))}
            </tbody>
        </table>
    );
};
