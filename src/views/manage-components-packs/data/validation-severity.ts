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

import type { Condition, Result } from '../../../json-rpc/csolution-rpc-client';
import type { ComponentRowDataType } from './component-tools';

export type ValidationSeverity = 'warning' | 'error';

export const getValidationSeverity = (result: string | undefined): ValidationSeverity | undefined => {
    if (!result) return undefined;
    return result === 'SELECTABLE' ? 'warning' : 'error';
};

export const getRowValidationSeverity = (row: ComponentRowDataType): ValidationSeverity | undefined => {
    const severities = [
        getValidationSeverity(row.validation?.result),
        ...(row.children ?? []).map(getRowValidationSeverity),
    ];

    if (severities.includes('error')) return 'error';
    if (severities.includes('warning')) return 'warning';
    return undefined;
};

export const selectDominantValidations = (validations: Result[]): Result[] => {
    const errors = validations.filter(validation => getValidationSeverity(validation.result) === 'error');
    return errors.length > 0
        ? errors
        : validations.filter(validation => getValidationSeverity(validation.result) === 'warning');
};

export const selectDominantConditions = (conditions: Condition[] | undefined): Condition[] => {
    if (!conditions) return [];

    const hasError = conditions.some(condition => getValidationSeverity(condition.result) === 'error');
    return hasError
        ? conditions.filter(condition => getValidationSeverity(condition.result) !== 'warning')
        : conditions;
};
