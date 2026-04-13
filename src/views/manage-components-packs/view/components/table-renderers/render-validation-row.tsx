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

import React from 'react';
import { componentNiceName, ComponentRowDataType } from '../../../data/component-tools';
import { Dropdown, Button, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { MessageHandler } from '../../../../message-handler';
import { IncomingMessage, OutgoingMessage } from '../../../messages';
import { focusComponentInTree, getValidationMessage } from '../../helpers/components-packs-helpers';
import { Condition } from '../../../../../json-rpc/csolution-rpc-client';
import { findComponentById } from '../../../data/component-tree';
import { TargetSetData } from '../../../components-data';
import { hasValidation } from './render-warning-cell';

/**
 * Renders the validation row for a component.
 * @param record The component row data
 * @returns The rendered validation row
 */
export const renderValidation = (
    record: ComponentRowDataType,
    expandedRowKeys: string[],
    setExpandedRowKeys: React.Dispatch<React.SetStateAction<string[]>>,
    state: { componentTree: ComponentRowDataType[], componentScope: string, selectedTargetType: TargetSetData | undefined },
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>,
    dropdownKey: number,
    setDropdownKey: React.Dispatch<React.SetStateAction<number>>,
    componentRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
): React.ReactNode => {
    if (!record.validation?.id || !hasValidation(record)) {
        return null;
    }

    // Event handler for resolving a component
    const onClickResolveComponent = (selectedAggregate: string): React.MouseEventHandler<HTMLElement> | undefined => () => {
        const finder = /\.clayer\.ya?ml$/i;
        function findAndResolve(nodes: ComponentRowDataType[]): boolean {
            for (const node of nodes) {
                if (node.key.startsWith(selectedAggregate)) {
                    node.aggregate.selectedCount = 1;
                    node.aggregate.activeVariant = node.variants.length > 0 ? node.variants[0] : undefined;

                    const layer = finder.test(state.selectedTargetType?.path || '') ? state.selectedTargetType?.path : '';
                    node.aggregate.options = {
                        ...node.aggregate.options,
                        layer: layer,
                    };

                    messageHandler.push({ type: 'CHANGE_COMPONENT_VALUE', componentData: node });
                    return true;
                }
                if (node.children && findAndResolve(node.children)) {
                    return true;
                }
            }
            return false;
        }
        return findAndResolve(state.componentTree);
    };

    // Event handler for focusing a component
    const onClickFocusComponent = (selectedAggregate: string): React.MouseEventHandler<HTMLElement> | undefined => () => {
        focusComponentInTree(selectedAggregate, expandedRowKeys, setExpandedRowKeys, componentRefs);
    };

    // Lookup dependency
    const getDependency = (defaultAggregate: string) => findComponentById(state.componentTree, defaultAggregate);

    // Focus button
    const focusButton = (defaultAggregate: string) => (
        <Button
            onClick={onClickFocusComponent(defaultAggregate)}
            color="primary"
            variant="link"
            aria-label="Focus component"
            title="Focus"
        >
            <span className="codicon codicon-eye" style={{ fontSize: 16, verticalAlign: 'text-bottom' }} />
        </Button>
    );

    // Render validation conditions as rows
    const renderValidationConditions = (record: ComponentRowDataType): React.ReactNode =>
        record.validation?.conditions?.flatMap((condition, cidx) => renderValidationRow(cidx, condition)) ?? null;

    // Render validation aggregates as rows
    const renderValidationAggregates = (record: ComponentRowDataType): React.ReactNode =>
        record.validation?.aggregates?.flatMap((aggregate, cidx) => renderAggregateRow(cidx, aggregate)) ?? null;

    // Render a single aggregate row
    const renderAggregateRow = (cidx: number, aggregate: string): React.ReactNode => {
        const dependency = getDependency(aggregate);
        return (
            <tr key={`aggregate-${cidx}`}>
                <td>{componentNiceName(dependency?.aggregate.id || aggregate)}</td>
                <td>{dependency?.data.description || "couldn't find component"}</td>
            </tr>
        );
    };

    // Render a single validation row (condition)
    const renderValidationRow = (cidx: number, condition: Condition): React.ReactNode => {
        const defaultAggregate = condition.selectedAggregate || condition.aggregates?.at(0) || condition.expression?.split(' ').pop() || '';
        const dependency = getDependency(defaultAggregate);
        const aggregateId = dependency?.aggregate.id || defaultAggregate;
        return [
            <tr key={`content-${aggregateId}-${cidx}`}>
                {Array.isArray(condition.aggregates) && condition.aggregates.length > 0 && (
                    <>
                        <td>
                            {condition.aggregates.length > 1 ? (
                                <Space>
                                    <Dropdown
                                        key={dropdownKey}
                                        menu={{
                                            items: condition.aggregates.map(aggregate => ({
                                                key: aggregate,
                                                label: componentNiceName(aggregate),
                                            })),
                                            onClick: (e) => {
                                                condition.selectedAggregate = e.key;
                                                setDropdownKey((prevKey) => prevKey + 1);
                                            },
                                        }}
                                        trigger={['click']}
                                    >
                                        <Button>
                                            <Space>
                                                {componentNiceName(defaultAggregate)}
                                                <DownOutlined />
                                            </Space>
                                        </Button>
                                    </Dropdown>
                                    {focusButton(defaultAggregate)}
                                </Space>
                            ) : (
                                <>
                                    {componentNiceName(defaultAggregate)}
                                    {focusButton(defaultAggregate)}
                                </>
                            )}
                        </td>
                        <td>{dependency?.data.description || "couldn't find component"}</td>
                    </>
                )}
            </tr>,
            <tr key={`apply-${aggregateId}-${cidx}`}>
                <td colSpan={2}>
                    {aggregateId && (
                        <Button onClick={onClickResolveComponent(aggregateId)} color='primary'>
                            Apply
                        </Button>
                    )}
                </td>
            </tr>
        ];
    };

    return (
        <div className="validation-row">
            {record.name}: {getValidationMessage(record, state)}<br />
            <table className='validation-table'>
                <colgroup>
                    <col style={{ width: '50%' }}></col>
                    <col style={{ width: '50%' }}></col>
                </colgroup>
                <tbody>
                    {renderValidationConditions(record)}
                    {renderValidationAggregates(record)}
                </tbody>
            </table>
        </div>
    );
};
