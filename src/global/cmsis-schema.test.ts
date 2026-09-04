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

import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';

describe('cmsis.json schema', () => {
    const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../../schemas/cmsis.schema.json'), 'utf8'));
    const validate = new Ajv({ strict: true }).compile(schema);

    it.each([
        {},
        { 'force-update-rte': true },
        { activeSolution: '../solutions/example.csolution.yml' },
        { activeSolution: null },
        { solutionSelections: { 'example.csolution.yml': { selectedTargetType: 'Board' } } },
        { solutionSelections: { '../solutions/example.csolution.yaml': { selectedTargetType: 'Board' } } },
        { solutionSelections: { 'example.csolution.yml': { selectedTargetSets: [] } } },
        // Legacy contents are intentionally unconstrained migration inputs.
        { targetSet: { HelloWorld: { activeTargetType: 'FRDM-K32L3A6', 'FRDM-K32L3A6': 1 } } },
        { targetSet: { unknownLegacyShape: true } },
        {
            solutionSelections: {
                'example.csolution.yml': {
                    selectedTargetType: 'Board',
                    selectedTargetSets: [{
                        targetType: { name: 'Board', index: 0 },
                        targetSet: { name: '', index: 0 },
                    }],
                },
            },
        },
    ])('accepts supported settings state %#', settings => {
        expect(validate(settings)).toBe(true);
    });

    it.each([
        { activeSolution: '' },
        { activeSolution: '../solutions/example.yml' },
        { activeSolution: 1 },
        { solutionSelections: { 'example.csolution.yml': { selectedTargetType: { name: 'Board', index: 0 } } } },
        { solutionSelections: { 'example.csolution.yml': { activeTargetType: 'Board' } } },
        { solutionSelections: { example: {} } },
        { solutionSelections: { '/absolute/example.csolution.yml': {} } },
        { solutionSelections: { 'C:/absolute/example.csolution.yml': {} } },
        { solutionSelections: { '..\\example.csolution.yml': {} } },
    ])('rejects invalid settings state %#', settings => {
        expect(validate(settings)).toBe(false);
    });
});
