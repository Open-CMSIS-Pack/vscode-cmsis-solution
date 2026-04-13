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

import React from 'react';
import { ComponentRowDataType } from '../../../data/component-tools';
import { Tooltip } from 'antd';
import { validationIds } from './render-warning-cell';
import { EditFilled } from '@ant-design/icons';

/**
 * Renders the name cell with a tooltip that shows additional information about the component.
 * @param value The name of the component to render
 * @param record The record of the row
 * @returns The rendered cell with the component name and a tooltip
 */
export const renderNameCell = (value: string, record: ComponentRowDataType, openFile: (link: string, external?: boolean, focusOn?: string) => void): React.ReactNode => {
    // Count all leaf subs and grandsubs
    const getLeafCount = (nodes?: ComponentRowDataType[]): number =>
        nodes?.reduce((acc, node) => acc + (node.children?.length ? getLeafCount(node.children) : 1), 0) ?? 0;
    const getSelectedLeafCount = (nodes?: ComponentRowDataType[]): number =>
        nodes?.reduce((acc, node) => acc + (node.children?.length ? getSelectedLeafCount(node.children) : (node.aggregate?.selectedCount ? 1 : 0)), 0) ?? 0;
    const allLeafs = getLeafCount(record.children);
    const selectedLeafs = getSelectedLeafCount(record.children);
    const selectedCount = record.aggregate?.selectedCount ?? 0;

    const instances = record.data.maxInstances
        ? '' //(<span className='faded'>(Y {selectedCount} of {record.data.maxInstances})</span>)
        : allLeafs !== 0
            ? (<span className='faded'>({selectedLeafs} of {allLeafs})</span>)
            : '';

    const vids = validationIds(record, undefined, 'name-col');

    const tooltTipContent = (
        <div>
            <ul style={{ paddingLeft: '30px' }}>
                <li>{record.api ? 'API' : 'component'}: {record.data.id}</li>
                {record.data.pack && <li>from pack: {record.data.pack}</li>}
                {allLeafs !== 0 && <li>selected: {selectedLeafs} of {allLeafs}</li>}
                {selectedCount > 0 && (<li>in: <a title='Edit File' onClick={() => openFile(record.aggregate.options?.layer || '', false, 'components:')} ><EditFilled /></a> ./{record.aggregate.options?.layer}</li>)}
                {vids.length > 0 && (
                    <li>validation issues:
                        <ul>{vids}</ul>
                    </li>
                )}
            </ul>
        </div>
    );

    // Prevent clicks on the tooltip from expanding/collapsing the row
    const preventTooltipClicks = (e: React.MouseEvent<HTMLElement>) => {
        let element = e.target as HTMLElement | null;
        while (element) {
            if (element.classList?.contains('ant-tooltip-inner')) {
                e.stopPropagation();
                break;
            }
            element = element.parentElement;
        }
    };

    return (
        <div onClick={preventTooltipClicks}>
            <Tooltip placement='right' title={tooltTipContent} mouseEnterDelay={1.0} mouseLeaveDelay={0.3} trigger={['hover']}>
                <span style={{ whiteSpace: 'nowrap' }}>
                    {value} {record.api ? '(API)' : ''} {instances}
                </span>
            </Tooltip>
        </div>
    );
};
