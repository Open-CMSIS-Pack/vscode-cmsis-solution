/**
 * Copyright 2023-2026 Arm Limited
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
import { ComponentRowId, componentRowIdsEqual, componentRowIdToElementId } from './component-row-id';

describe('ComponentRowId', () => {
    describe('componentRowIdToElementId', () => {
        it('creates an id for a group-level component', () => {
            const rowId: ComponentRowId = {
                cClass: 'test_cclass',
                bundleName: 'test_bundle',
                group: 'test_group',
                subGroup: '',
            };

            const output = componentRowIdToElementId(rowId);
            expect(output).toContain(rowId.cClass);
            expect(output).toContain(rowId.bundleName);
            expect(output).toContain(rowId.group);
        });

        it('creates an id for a sub-group-level component', () => {
            const rowId: ComponentRowId = {
                cClass: 'test_cclass',
                bundleName: 'test_bundle',
                group: 'test_group',
                subGroup: 'test_sub_group',
            };

            const output = componentRowIdToElementId(rowId);
            expect(output).toContain(rowId.cClass);
            expect(output).toContain(rowId.bundleName);
            expect(output).toContain(rowId.group);
            expect(output).toContain(rowId.subGroup);
        });
    });

    describe('componentRowIdsEqual', () => {
        it('returns true if all properties are the same', () => {
            const rowId = {
                bundleName: 'Some bundle',
                cClass: 'Some cclass',
                group: 'Some group',
                subGroup: 'Some subgroup'
            };

            const result = componentRowIdsEqual(rowId)(rowId);

            expect(result).toBe(true);
        });

        it('returns false if bundle names are different', () => {
            const rowId = {
                cClass: 'Some cclass',
                group: 'Some group',
                subGroup: 'Some subgroup'
            };

            const result = componentRowIdsEqual({ ...rowId, bundleName: 'Some bundle' })({ ...rowId, bundleName: 'Another bundle' });

            expect(result).toBe(false);
        });

        it('returns false if cclasses are different', () => {
            const rowId = {
                bundleName: 'Some bundle',
                group: 'Some group',
                subGroup: 'Some subgroup'
            };

            const result = componentRowIdsEqual({ ...rowId, cClass: 'Some cclass' })({ ...rowId, cClass: 'Another cclass' });

            expect(result).toBe(false);
        });

        it('returns false if groups are different', () => {
            const rowId = {
                bundleName: 'Some bundle',
                cClass: 'Some cclass',
                subGroup: 'Some subgroup'
            };

            const result = componentRowIdsEqual({ ...rowId, group: 'Some group' })({ ...rowId, group: 'Another group' });

            expect(result).toBe(false);
        });

        it('returns false if sub groups are different', () => {
            const rowId = {
                bundleName: 'Some bundle',
                cClass: 'Some cclass',
                group: 'Some group'
            };

            const result = componentRowIdsEqual({ ...rowId, subGroup: 'Some subgroup' })({ ...rowId, subGroup: 'Another subgroup' });

            expect(result).toBe(false);
        });
    });
});
