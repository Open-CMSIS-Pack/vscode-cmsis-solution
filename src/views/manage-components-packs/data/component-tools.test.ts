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
            expect(placeholder?.validation?.id).toBe('AggregateValidationId/UnknownAggregateId');
            expect(placeholder?.validation?.aggregates).toEqual(['OtherAggregateId']);
        });

        it('attaches validation only to the matching aggregate in the same class and group', () => {
            const aggregateA: CtAggregate = {
                id: 'Vendor::Class:Group:SubA',
                name: 'SubA',
                activeVersion: '1.0.0',
                variants: [{
                    name: 'default',
                    components: [{ id: 'Vendor::Class:Group:SubA@1.0.0', pack: '' }],
                }],
            };
            const aggregateB: CtAggregate = {
                id: 'Vendor::Class:Group:SubB',
                name: 'SubB',
                activeVersion: '1.0.0',
                variants: [{
                    name: 'default',
                    components: [{ id: 'Vendor::Class:Group:SubB@1.0.0', pack: '' }],
                }],
            };
            const validation: Result = {
                id: aggregateB.id,
                result: 'SELECTABLE',
            };
            const root: CtRoot = {
                success: true,
                classes: [{
                    name: 'Class',
                    activeBundle: '',
                    bundles: [{
                        name: '',
                        aggregates: [aggregateB, aggregateA],
                        cgroups: [],
                        bundle: { id: '', description: '', doc: '' },
                    }],
                }],
            };

            const rows = flatTree(mapTree(root, [validation]));
            const rowA = rows.find(row => row.aggregate.id === aggregateA.id);
            const rowB = rows.find(row => row.aggregate.id === aggregateB.id);

            expect(rowA?.validation).toBeUndefined();
            expect(rowB?.validation).toBe(validation);
        });

        it('distinguishes validations by bundle within the same class and group', () => {
            const aggregateA: CtAggregate = {
                id: 'Vendor::Class&BundleA:Group:Sub',
                name: 'BundleA',
                activeVersion: '1.0.0',
                variants: [{
                    name: 'default',
                    components: [{ id: 'Vendor::Class&BundleA:Group:Sub@1.0.0', pack: '' }],
                }],
            };
            const aggregateB: CtAggregate = {
                id: 'Vendor::Class&BundleB:Group:Sub',
                name: 'BundleB',
                activeVersion: '1.0.0',
                variants: [{
                    name: 'default',
                    components: [{ id: 'Vendor::Class&BundleB:Group:Sub@1.0.0', pack: '' }],
                }],
            };
            const validation: Result = {
                id: 'Class&BundleB:Group:Sub',
                result: 'SELECTABLE',
            };
            const root: CtRoot = {
                success: true,
                classes: [{
                    name: 'Class',
                    activeBundle: '',
                    bundles: [{
                        name: '',
                        aggregates: [aggregateA, aggregateB],
                        cgroups: [],
                        bundle: { id: '', description: '', doc: '' },
                    }],
                }],
            };

            const rows = flatTree(mapTree(root, [validation]));
            const rowA = rows.find(row => row.aggregate.id === aggregateA.id);
            const rowB = rows.find(row => row.aggregate.id === aggregateB.id);

            expect(rowA?.validation).toBeUndefined();
            expect(rowB?.validation).toBe(validation);
        });

        it('keeps group validation on the parent instead of attaching it to a child aggregate', () => {
            const childAggregate: CtAggregate = {
                id: 'Vendor::Class:Group:Child',
                name: 'Child',
                activeVersion: '1.0.0',
                variants: [{
                    name: 'default',
                    components: [{ id: 'Vendor::Class:Group:Child@1.0.0', pack: '' }],
                }],
            };
            const validation: Result = {
                id: 'Vendor::Class:Group',
                result: 'SELECTABLE',
            };
            const root: CtRoot = {
                success: true,
                classes: [{
                    name: 'Class',
                    activeBundle: '',
                    bundles: [{
                        name: '',
                        aggregates: [],
                        cgroups: [{ name: 'Group', aggregates: [childAggregate] }],
                        bundle: { id: '', description: '', doc: '' },
                    }],
                }],
            };

            const group = mapTree(root, [validation])[0].children?.find(row => row.name === 'Group');

            expect(group?.validation).toBe(validation);
            expect(group?.children?.[0].validation).toBeUndefined();
        });

        it('uses API metadata for groups and falls back to taxonomy metadata', () => {
            const root: CtRoot = {
                success: true,
                classes: [
                    {
                        name: 'MyClass',
                        activeBundle: '',
                        bundles: [
                            {
                                name: '',
                                aggregates: [],
                                cgroups: [
                                    {
                                        name: 'ApiGroup',
                                        api: { id: 'api', description: 'API description', doc: 'api-doc.html' },
                                        taxonomy: { id: 'taxonomy', description: 'Taxonomy description', doc: 'taxonomy-doc.html' },
                                    },
                                    {
                                        name: 'TaxonomyGroup',
                                        taxonomy: { id: 'taxonomy', description: 'Taxonomy description', doc: 'taxonomy-doc.html' },
                                    },
                                ],
                                bundle: { id: '', description: '', doc: '' },
                            },
                        ],
                    },
                ],
            };

            const groups = mapTree(root, undefined)[0].children;
            const apiGroup = groups?.find(group => group.name === 'ApiGroup');
            const taxonomyGroup = groups?.find(group => group.name === 'TaxonomyGroup');

            expect(apiGroup?.data.description).toBe('API description');
            expect(apiGroup?.data.doc).toBe('api-doc.html');
            expect(taxonomyGroup?.data.description).toBe('Taxonomy description');
            expect(taxonomyGroup?.data.doc).toBe('taxonomy-doc.html');
        });
    });
});
