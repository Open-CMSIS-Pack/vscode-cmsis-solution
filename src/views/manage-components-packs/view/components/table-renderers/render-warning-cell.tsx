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

import React, { ComponentState } from 'react';
import { componentNiceName, ComponentRowDataType } from '../../../data/component-tools';
import { getRowValidationSeverity, selectDominantValidations } from '../../../data/validation-severity';
import { getValidationMessage, warningIcon } from '../../helpers/components-packs-helpers';
import { Tooltip } from 'antd';
import { Result } from '../../../../../json-rpc/csolution-rpc-client';

/**
 * Entry for validation tooltip: id and result.
 */
type ValidationTooltipEntry = { validation: Result; result?: string };

/**
 * Recursively collect all validation IDs and results from a node and its descendants.
 * Returns an array of ValidationTooltipEntry objects.
 */
const collectValidations = (node: ComponentRowDataType, state: ComponentState): ValidationTooltipEntry[] => {
    const validations: ValidationTooltipEntry[] = [];
    if (node.validation?.id) validations.push({ validation: node.validation, result: getValidationMessage(node, state) });
    node.children?.forEach(child => validations.push(...collectValidations(child, state)));
    return validations;
};

/**
 * Returns a list of validation ID list items for a record's children.
 * Uses a composite key for React list rendering to ensure uniqueness across columns.
 */
export const validationIds = (record: ComponentRowDataType, state: ComponentState, columnKey?: string): React.ReactNode[] => {
    const validations = collectValidations(record, state);
    const dominantValidations = new Set(selectDominantValidations(validations.map(entry => entry.validation)));
    return validations
        .filter(entry => dominantValidations.has(entry.validation))
        .filter((entry, index, self) => self.findIndex(e => e.validation.id === entry.validation.id) === index)
        .map(({ validation: { id }, result }, idx) => {
            const compId = id.indexOf('/') > 0 ? id.split('/')[1] : id;
            return (
                <li key={`${id}-${columnKey ?? 'no-col'}-${record.data.id}-${idx}`}>
                    {componentNiceName(compId)} - {result}
                </li>
            );
        });
};

/**
 * Returns true if the record or any descendant has a validation issue.
 */
export const hasValidation = (record: ComponentRowDataType): boolean =>
    getRowValidationSeverity(record) !== undefined;

/**
 * Renders a warning icon with a tooltip if the record or its descendants have validation issues.
 * @param record The component row data
 * @returns The rendered warning cell or null
 */
export const renderWarningCell = (
    record: ComponentRowDataType,
    state: ComponentState
): React.ReactNode => {
    const severity = getRowValidationSeverity(record);
    if (!severity) return null;

    // Use a unique columnKey for this column
    const vids = validationIds(record, state, 'warning-col');
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
            {warningIcon(severity)}
        </Tooltip>
    );
};
