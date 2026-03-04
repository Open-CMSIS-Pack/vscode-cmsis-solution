/**
 * Copyright 2025-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'jest';

import { CtAggregate, CtRoot, Result } from '../../../json-rpc/csolution-rpc-client';
import { flatTree } from './component-tree';
import { mapTree } from './component-tools';

describe('component-tools', () => {
    describe('mapTree / variantComponents', () => {
        it('creates a placeholder leaf row when an aggregate has no components', () => {
            const aggregate: CtAggregate = {
                id: 'UnknownAggregateId',
                name: 'UnknownAggregateName',
                result: 'MISSING',
                selectedCount: 1,
                variants: [
                    {
                        name: 'default',
                        components: [],
                    },
                ],
            };

            const root: CtRoot = {
                success: true,
                classes: [
                    {
                        name: 'MyClass',
                        activeBundle: '',
                        bundles: [
                            {
                                name: '',
                                aggregates: [aggregate],
                                cgroups: [],
                                bundle: { id: '', description: '', doc: '' },
                            },
                        ],
                    },
                ],
            };

            const tree = mapTree(root, undefined);
            const placeholder = flatTree(tree).find(node => node.data.id === aggregate.id);

            expect(placeholder).toBeDefined();
            expect(placeholder?.data.pack).toBe('');
            expect(placeholder?.data.description).toContain('UnknownAggregateName');
            expect(placeholder?.data.description).toContain('(MISSING)');
            expect(placeholder?.aggregate.selectedCount).toBe(1);
            expect(placeholder?.children).toEqual([]);

            // When parseComponentId fails (e.g. aggregate ids), we fall back to the aggregate name.
            expect(placeholder?.parsed.class).toBe('UnknownAggregateName');
        });

        it('adds a derived CONFLICT_ONCE validation when an aggregate-level validation exists', () => {
            const aggregate: CtAggregate = {
                id: 'UnknownAggregateId',
                name: 'UnknownAggregateName',
                variants: [
                    {
                        name: 'default',
                        components: [],
                    },
                ],
            };

            const root: CtRoot = {
                success: true,
                classes: [
                    {
                        name: 'MyClass',
                        activeBundle: '',
                        bundles: [
                            {
                                name: '',
                                aggregates: [aggregate],
                                cgroups: [],
                                bundle: { id: '', description: '', doc: '' },
                            },
                        ],
                    },
                ],
            };

            const validations: Result[] = [
                {
                    id: 'AggregateValidationId',
                    result: 'CONFLICT_ONCE',
                    aggregates: ['UnknownAggregateId', 'OtherAggregateId'],
                },
            ];

            const tree = mapTree(root, validations);
            const placeholder = flatTree(tree).find(node => node.data.id === aggregate.id);

            expect(placeholder?.validation?.result).toBe('CONFLICT_ONCE');
            expect(placeholder?.validation?.id).toBe('AggregateValidationId');
            expect(placeholder?.validation?.aggregates).toEqual(['UnknownAggregateId', 'OtherAggregateId']);
        });
    });
});
