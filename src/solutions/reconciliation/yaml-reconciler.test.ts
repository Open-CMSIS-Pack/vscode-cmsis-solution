/**
 * Copyright 2023-2026 Arm Limited
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
import { ReconcileSequenceItemsOperations, reconcileOptionalScalarInMap, reconcileOptionalSequenceInMap, reconcileSequenceItems } from './yaml-reconciler';
import * as YAML from 'yaml';
import { Scalar, YAMLMap, YAMLSeq } from 'yaml';

describe('YAML reconciliation', () => {
    describe('reconcileSequenceItems', () => {
        type Node = { id: string, output: number }
        type Data = { id: string, input: number }

        const operations: ReconcileSequenceItemsOperations<Node, Data> = {
            createNode: ({ id }) => ({ id, output: 0 }),
            nodeMatchesData: ({ id }) => node => node.id === id,
            updateNode: (node, data) => {
                const updated = node.output !== data.input;
                node.output = data.input;
                return updated;
            }
        };

        const testReconcile = reconcileSequenceItems<Node, Data>(operations);

        it('returns undefined given an empty input data and an empty existing nodes', () => {
            const output = testReconcile([], []);

            expect(output).toBe(undefined);
        });

        it('returns empty given an empty input data and a non-empty existing nodes', () => {
            const output = testReconcile([{ id: 'cat', output: 3 }], []);
            expect(output).toEqual([]);
        });

        it('creates new nodes when given a non-empty input data and an empty existing nodes', () => {
            const output = testReconcile([], [{ id: 'dog', input: 4 }, { id: 'cat', input: 2 }]);
            const expected: typeof output = [{ id: 'dog', output: 4 }, { id: 'cat', output: 2 }];
            expect(output).toEqual(expected);
        });

        it('updates an existing node', () => {
            const output = testReconcile([{ id: 'dog', output: 0 }], [{ id: 'dog', input: 4 }]);
            const expected: typeof output = [{ id: 'dog', output: 4 }];
            expect(output).toEqual(expected);
        });

        it('returns undefined when the existing nodes are already consistent with the input data', () => {
            const output = testReconcile([{ id: 'dog', output: 4 }], [{ id: 'dog', input: 4 }]);
            expect(output).toBe(undefined);
        });

        it('returns undefined if the existing nodes are a reordering of the input data', () => {
            const output = testReconcile(
                [{ id: 'dog', output: 0 }, { id: 'cat', output: 1 }],
                [{ id: 'cat', input: 1 }, { id: 'dog', input: 0 }]
            );

            expect(output).toBe(undefined);
        });

        it('returns the updated nodes if the existing nodes are a reordering of the input data with updates', () => {
            const output = testReconcile(
                [{ id: 'dog', output: 0 }, { id: 'cat', output: 0 }],
                [{ id: 'cat', input: 13 }, { id: 'dog', input: 0 }]
            );

            const expected: typeof output = [{ id: 'cat', output: 13 }, { id: 'dog', output: 0 }];
            expect(output).toEqual(expected);
        });
    });

    describe('reconcileOptionalSequenceInMap', () => {
        const testKey = 'the_key';
        type Data = { id: string }

        const operations: ReconcileSequenceItemsOperations<Scalar, Data> = {
            createNode: ({ id }) => new Scalar(id),
            nodeMatchesData: ({ id }) => node => node.value === id
        };

        const testReconcile = reconcileOptionalSequenceInMap<Scalar, Data>(operations, testKey, YAML.isScalar);

        it('returns false and leaves the map unmodified if the key is not present in the input map and there are no new items', () => {
            const map = new YAMLMap();
            map.set('some-key', 'someValue');
            const initialJson = map.toJSON();

            const output = testReconcile(map, []);
            expect(output).toBe(false);
            expect(map.toJSON()).toEqual(initialJson);
        });

        it('returns false and leaves the map unmodified if the key was present in the map but the sequence was empty, and there are no new items', () => {
            const map = new YAMLMap();
            map.set(testKey, new YAMLSeq());
            const initialJson = map.toJSON();

            const output = testReconcile(map, []);
            expect(output).toBe(false);
            expect(map.toJSON()).toEqual(initialJson);
        });

        it('returns true and removes the key from the map if there are no new items', () => {
            const map = new YAMLMap();
            const sequence = new YAMLSeq();
            sequence.add(new Scalar('cat'));
            map.set(testKey, sequence);

            const output = testReconcile(map, []);
            expect(output).toBe(true);
            expect(map.has(testKey)).toBe(false);
        });

        it('returns false and leaves the map unmodified if not all items were valid nodes', () => {
            const map = new YAMLMap();
            const sequence = new YAMLSeq();
            sequence.add(new YAMLMap());
            sequence.add(new YAMLMap());
            map.set(testKey, sequence);
            const initialJson = map.toJSON();

            const output = testReconcile(map, []);
            expect(output).toBe(false);
            expect(map.toJSON()).toEqual(initialJson);
        });

        it('returns false and leaves the map unmodified if the existing items match the input data', () => {
            const map = new YAMLMap();
            map.set('some-key', 'someValue');
            const sequence = new YAMLSeq();
            sequence.add(new Scalar('cat'));
            sequence.add(new Scalar('dog'));
            map.set(testKey, sequence);
            const initialJson = map.toJSON();

            const output = testReconcile(map, [{ id: 'cat' }, { id: 'dog' }]);
            expect(output).toBe(false);
            expect(map.toJSON()).toEqual(initialJson);
        });

        it('returns true and updates the map with the new items when the existing items do not match the input data', () => {
            const map = new YAMLMap();
            const sequence = new YAMLSeq();
            sequence.add(new Scalar('cat'));
            sequence.add(new Scalar('dog'));
            sequence.add(new Scalar('monkey'));
            map.set(testKey, sequence);

            const output = testReconcile(map, [{ id: 'dog' }, { id: 'cat' }]);
            expect(output).toBe(true);

            const newSeq = map.get(testKey) as YAMLSeq;
            expect(newSeq.items.length).toBe(2);
            expect(newSeq.get(0)).toBe('dog');
            expect(newSeq.get(1)).toBe('cat');
        });
    });

    describe('reconcileOptionalScalarInMap', () => {
        it('returns false and leaves the input unmodified if the existing value and input are undefined', () => {
            const map = new YAMLMap();
            map.set('another-key', 'a-value');
            const output = reconcileOptionalScalarInMap(map, 'test-key', undefined);
            expect(output).toBe(false);
            expect(map.toJSON()).toEqual({ 'another-key': 'a-value' });
        });

        it('returns false and leaves the input unmodified if the existing value and input are the same', () => {
            const map = new YAMLMap();
            map.set('another-key', 'a-value');
            map.set('test-key', 'the-value');
            const output = reconcileOptionalScalarInMap(map, 'test-key', 'the-value');
            expect(output).toBe(false);
            expect(map.toJSON()).toEqual({ 'another-key': 'a-value', 'test-key': 'the-value' });
        });

        it('returns true and removes the element from the map if the map contains the key but the input is undefined', () => {
            const map = new YAMLMap();
            map.set('test-key', 'the-value');
            const output = reconcileOptionalScalarInMap(map, 'test-key', undefined);
            expect(output).toBe(true);
            expect(map.toJSON()).toEqual({});
        });

        it('returns true and adds the element to the map if the map does not contain the key but the input is defined', () => {
            const map = new YAMLMap();
            const output = reconcileOptionalScalarInMap(map, 'test-key', 'the-value');
            expect(output).toBe(true);
            expect(map.toJSON()).toEqual({ 'test-key': 'the-value' });
        });

        it('returns true and updates the input if the existing value and input are the different', () => {
            const map = new YAMLMap();
            map.set('test-key', 'initial-value');
            const output = reconcileOptionalScalarInMap(map, 'test-key', 'new-value');
            expect(output).toBe(true);
            expect(map.toJSON()).toEqual({ 'test-key': 'new-value' });
        });
    });
});
