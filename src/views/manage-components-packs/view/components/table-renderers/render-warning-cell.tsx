/**
 * Copyright (C) 2025-2026 Arm Limited
 */

import React, { ComponentState } from 'react';
import { componentNiceName, ComponentRowDataType } from '../../../data/component-tools';
import { getValidationMessage, warningIcon } from '../../helpers/components-packs-helpers';
import { Tooltip } from 'antd';

/**
 * Entry for validation tooltip: id and result.
 */
type ValidationTooltipEntry = { id: string; result?: string };

/**
 * Recursively collect all validation IDs and results from a node and its descendants.
 * Returns an array of ValidationTooltipEntry objects.
 */
const collectValidationIds = (node: ComponentRowDataType, state: ComponentState): ValidationTooltipEntry[] => {
    const ids: ValidationTooltipEntry[] = [];
    if (node.validation?.id) ids.push({ id: node.validation.id, result: getValidationMessage(node, state) });
    node.children?.forEach(child => ids.push(...collectValidationIds(child, state)));
    return ids;
};

/**
 * Returns a list of validation ID list items for a record's children.
 * Uses a composite key for React list rendering to ensure uniqueness across columns.
 */
export const validationIds = (record: ComponentRowDataType, state: ComponentState, columnKey?: string): React.ReactNode[] => {
    const ids = collectValidationIds(record, state);
    return ids
        .filter((entry, index, self) => self.findIndex(e => e.id === entry.id) === index)
        .map(({ id, result }, idx) => {
            const compId = id.indexOf('/') > 0 ? id.split('/')[1] : id;
            return (
                <li key={`${id}-${columnKey ?? 'no-col'}-${record.data.id}-${idx}`}>
                    {componentNiceName(compId)} - {result}
                </li>
            );
        });
};

/**
 * Returns true if the record or any descendant has a validation ID.
 */
export const hasValidation = (record: ComponentRowDataType): boolean =>
    (!!record.validation?.id && record.validation.id.indexOf(record.key) >= 0) || (record.children?.some(hasValidation) ?? false);

/**
 * Renders a warning icon with a tooltip if the record or its descendants have validation issues.
 * @param record The component row data
 * @returns The rendered warning cell or null
 */
export const renderWarningCell = (
    record: ComponentRowDataType,
    state: ComponentState
): React.ReactNode => {
    // Use a unique columnKey for this column
    const vids = validationIds(record, state, 'warning-col');
    if (!hasValidation(record)) return null;
    const tooltTipContent = (
        <div>
            <ul style={{ paddingLeft: '30px' }}>
                {vids.length > 0 && (
                    <li>validation issues:
                        <ul>{vids}</ul>
                    </li>
                )}
            </ul>
        </div>
    );
    return (
        <Tooltip placement='right' title={tooltTipContent} mouseEnterDelay={1.0} mouseLeaveDelay={0.3} trigger={['hover']}>
            {warningIcon('error')}
        </Tooltip>
    );
};
