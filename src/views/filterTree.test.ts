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

import { filterTree } from './filterTree';
import { TreeNode } from 'primereact/treenode';

describe('filterTree', () => {
    const makeNode = (name: string, children?: TreeNode[]): TreeNode => ({
        key: name,
        label: name,
        data: { name },
        children,
    });

    it('returns undefined if nodes is undefined', () => {
        expect(filterTree(undefined, 'foo')).toBeUndefined();
    });

    it('returns empty array if no nodes match', () => {
        const nodes = [makeNode('alpha'), makeNode('beta')];
        expect(filterTree(nodes, 'zzz')).toEqual([]);
    });

    it('returns all nodes if filter is empty', () => {
        const nodes = [makeNode('alpha'), makeNode('beta')];
        expect(filterTree(nodes, '')).toEqual(nodes);
    });

    it('filters nodes by name (case-insensitive)', () => {
        const nodes = [makeNode('Alpha'), makeNode('beta')];
        expect(filterTree(nodes, 'alpha')).toEqual([nodes[0]]);
        expect(filterTree(nodes, 'BETA')).toEqual([nodes[1]]);
    });

    it('includes parent if any child matches', () => {
        const nodes = [
            makeNode('parent', [
                makeNode('child1'),
                makeNode('specialChild'),
            ]),
        ];
        const result = filterTree(nodes, 'special');
        expect(result).toHaveLength(1);
        expect(result![0].children).toHaveLength(1);
        expect(result![0].children![0].data.name).toBe('specialChild');
    });

    it('returns only matching nodes and their matching descendants', () => {
        const nodes = [
            makeNode('root', [
                makeNode('foo'),
                makeNode('bar', [
                    makeNode('baz'),
                    makeNode('qux'),
                ]),
            ]),
        ];
        const result = filterTree(nodes, 'baz');
        expect(result).toHaveLength(1);
        expect(result![0].children).toHaveLength(1);
        expect(result![0].children![0].data.name).toBe('bar');
        expect(result![0].children![0].children).toHaveLength(1);
        expect(result![0].children![0].children![0].data.name).toBe('baz');
    });
});
