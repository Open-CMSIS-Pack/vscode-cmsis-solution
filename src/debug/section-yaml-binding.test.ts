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

import { resolveSectionYamlBinding } from './section-yaml-binding';
import { UISectionYamlNode } from './debug-adapters-yaml-file';

describe('resolveSectionYamlBinding', () => {
    it('treats the string form and default map form identically', () => {
        expect(resolveSectionYamlBinding('connection')).toEqual(resolveSectionYamlBinding({ name: 'connection' }));
    });

    it('retains declaration order for canonical write values and read aliases', () => {
        expect(resolveSectionYamlBinding({
            name: 'arbitrary-marker', kind: 'sequence',
            select: { node: 'state', selected: ['ready', 'streaming'], unselected: 'paused' },
        })).toEqual({
            name: 'arbitrary-marker', kind: 'sequence',
            select: { node: 'state', selected: ['ready', 'streaming'], unselected: ['paused'] },
        });
        expect(resolveSectionYamlBinding({
            name: 'connection', select: { node: 'state', selected: 'ready', unselected: ['paused', 'idle'] },
        }).select).toEqual({ node: 'state', selected: ['ready'], unselected: ['paused', 'idle'] });
    });

    it('retains the optional marker flag only when explicitly supplied', () => {
        expect(resolveSectionYamlBinding({ name: 'pname', value: null, optional: true }))
            .toEqual({ name: 'pname', value: null, kind: 'map', optional: true });
        expect(resolveSectionYamlBinding({ name: 'trace-buffer', value: null }).optional).toBeUndefined();
        expect(resolveSectionYamlBinding({ name: 'trace-buffer', value: null, optional: false }).optional).toBe(false);
    });

    it.each([
        null, 42, '', {}, { name: 1 }, { name: 'x', kind: 'list' },
        { name: 'x', value: null, optional: 'true' }, { name: 'x', optional: true },
        { name: 'x', select: null }, { name: 'x', select: {} },
        { name: 'x', select: { node: '', selected: 'yes', unselected: 'no' } },
        { name: 'x', select: { node: 'state', selected: [], unselected: 'no' } },
        { name: 'x', select: { node: 'state', selected: 'yes', unselected: [] } },
        { name: 'x', select: { node: 'state', selected: true, unselected: 'no' } },
        { name: 'x', select: { node: 'state', selected: ['yes', 1], unselected: 'no' } },
        { name: 'x', select: { node: 'state', selected: 'yes', unselected: false } },
        { name: 'x', select: { node: 'state', selected: 'yes', unselected: 'yes' } },
        { name: 'x', select: { node: 'state', selected: ['yes', 'alias'], unselected: ['no', 'alias'] } },
    ])('rejects malformed or overlapping instructions: %j', invalid => {
        expect(() => resolveSectionYamlBinding(invalid as UISectionYamlNode)).toThrow();
    });
});
