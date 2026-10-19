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

import 'jest';

import type { Condition, Result } from '../../../json-rpc/csolution-rpc-client';
import type { ComponentRowDataType } from './component-tools';
import {
    getRowValidationSeverity,
    getValidationSeverity,
    selectDominantConditions,
    selectDominantValidations,
} from './validation-severity';

const makeValidation = (result: string, id = result): Result => ({ id, result });

const makeRow = (
    validation?: Result,
    children: ComponentRowDataType[] = []
): ComponentRowDataType => ({
    key: validation?.id ?? 'group',
    name: validation?.id ?? 'group',
    data: {
        id: validation?.id ?? 'group',
        pack: '',
    },
    aggregate: {
        id: validation?.id ?? 'group',
        name: validation?.id ?? 'group',
        variants: [],
    },
    parsed: {
        vendor: '',
        class: '',
    },
    variants: [],
    children,
    validation,
});

describe('validation severity', () => {
    describe('getValidationSeverity', () => {
        it('returns no severity for a missing result', () => {
            expect(getValidationSeverity(undefined)).toBeUndefined();
            expect(getValidationSeverity('')).toBeUndefined();
        });

        it('classifies SELECTABLE as a warning', () => {
            expect(getValidationSeverity('SELECTABLE')).toBe('warning');
        });

        it('classifies every other result as an error', () => {
            expect(getValidationSeverity('MISSING')).toBe('error');
            expect(getValidationSeverity('FULFILLED')).toBe('error');
        });
    });

    describe('getRowValidationSeverity', () => {
        it('returns the direct severity for an individual component', () => {
            expect(getRowValidationSeverity(makeRow(makeValidation('SELECTABLE')))).toBe('warning');
            expect(getRowValidationSeverity(makeRow(makeValidation('MISSING')))).toBe('error');
        });

        it('inherits warning severity from descendants', () => {
            const group = makeRow(undefined, [makeRow(makeValidation('SELECTABLE'))]);

            expect(getRowValidationSeverity(group)).toBe('warning');
        });

        it('gives descendant errors precedence over warnings', () => {
            const group = makeRow(undefined, [
                makeRow(makeValidation('SELECTABLE')),
                makeRow(makeValidation('MISSING')),
            ]);

            expect(getRowValidationSeverity(group)).toBe('error');
        });

        it('returns no severity when the row and descendants have no validation', () => {
            expect(getRowValidationSeverity(makeRow(undefined, [makeRow()]))).toBeUndefined();
        });
    });

    describe('selectDominantValidations', () => {
        it('returns warnings when there are no errors', () => {
            const warnings = [
                makeValidation('SELECTABLE', 'warning-one'),
                makeValidation('SELECTABLE', 'warning-two'),
            ];

            expect(selectDominantValidations(warnings)).toEqual(warnings);
        });

        it('suppresses warnings when errors are present', () => {
            const warning = makeValidation('SELECTABLE', 'warning');
            const error = makeValidation('MISSING', 'error');

            expect(selectDominantValidations([warning, error])).toEqual([error]);
        });

        it('returns an empty list when there are no validation results', () => {
            expect(selectDominantValidations([])).toEqual([]);
        });
    });

    describe('selectDominantConditions', () => {
        it('keeps warning and neutral conditions when there are no errors', () => {
            const conditions: Condition[] = [
                { result: 'SELECTABLE', expression: 'warning' },
                { expression: 'neutral' },
            ];

            expect(selectDominantConditions(conditions)).toEqual(conditions);
        });

        it('suppresses warning conditions when an error condition is present', () => {
            const warning: Condition = { result: 'SELECTABLE', expression: 'warning' };
            const error: Condition = { result: 'MISSING', expression: 'error' };
            const neutral: Condition = { expression: 'neutral' };

            expect(selectDominantConditions([warning, error, neutral])).toEqual([error, neutral]);
        });

        it('returns an empty list for missing conditions', () => {
            expect(selectDominantConditions(undefined)).toEqual([]);
        });
    });
});
