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

import { GenericTreeItemParser, toGenericString } from './tree-item-parser';
import { CTreeItem } from './tree-item';
import { CTreeItemBuilder } from './tree-item-builder';


describe('GenericTreeItemParser', () => {
    let builder: CTreeItemBuilder;
    let parser: GenericTreeItemParser<CTreeItem>;

    beforeEach(() => {
        builder = new CTreeItemBuilder();
        parser = new GenericTreeItemParser(builder);
    });

    it('should clear the builder and set fileName when parsing', async () => {
        const input = 'test input';

        const root = parser.parse(input);

        expect(root?.rootFileName).toBe('');
        expect(toGenericString(root as CTreeItem)).toEqual(input + '\n');
    });

    it('should create a default root item if parseInput returns undefined', async () => {

        const result = parser.parse('');

        expect(result).toBe(builder.root);
        expect(result).toBeDefined();
        expect(toGenericString(result as CTreeItem)).toEqual('');
    });

    it('should return the root item if parseInput succeeds', async () => {
        const result = parser.parse('valid input');

        expect(result).toBeDefined();
        expect(result).toBe(builder.root);
        expect(result?.rootFileName).toBe('');
        expect(toGenericString(result as CTreeItem)).toEqual('valid input\n');
    });
});

describe('toGenericString', () => {
    it('should generate an empty string for no values', () => {
        const root = new CTreeItem('');
        const result = toGenericString(root);
        expect(result).toBe('');
    });

    it('should generate a text with line end', () => {
        const root = new CTreeItem('').setText('Root Node');
        const result = toGenericString(root);
        expect(result).toBe('Root Node\n');
    });

    it('should generate a string representation for a single node', () => {
        const root = new CTreeItem('root').setText('Root Node');
        const result = toGenericString(root);
        expect(result).toBe('root: Root Node\n');
    });

    it('should generate a string representation for a tree with attributes', () => {
        const root = new CTreeItem('root').
            setText('Root Node').
            setAttribute('key1', 'value1').
            setAttribute('key2', 'value2');

        const result = toGenericString(root);
        expect(result).toBe(
            'root: Root Node\n' +
            '  key1=value1\n' +
            '  key2=value2\n');
    });

    it('should generate a string representation for a tree with children', () => {
        const root = new CTreeItem('root');
        root.setText('Root Node');
        root.createChild('child1').setText('Child Node 1');
        root.createChild('child2').setText('Child Node 2');

        const result = toGenericString(root);
        expect(result).toBe(
            'root: Root Node\n' +
            '  child1: Child Node 1\n' +
            '  child2: Child Node 2\n'
        );
    });

    it('should generate a string representation for a tree with nested children', () => {
        const root = new CTreeItem('root');
        root.setText('Root Node');
        const child1 = root.createChild('child1');
        root.createChild('child2').setText('Child Node 2');
        child1.setAttribute('key1', 'value1');
        child1.setAttribute('key2', 'value2');
        child1.createChild('grandChild').setText('Grandchild Node');

        const result = toGenericString(root);
        expect(result).toBe(
            'root: Root Node\n' +
            '  child1\n' +
            '    key1=value1\n' +
            '    key2=value2\n' +
            '    grandChild: Grandchild Node\n' +
            '  child2: Child Node 2\n'
        );
    });

    it('should handle an empty node gracefully', () => {
        const root = new CTreeItem('root');
        const result = toGenericString(root);
        expect(result).toBe('root\n');
    });
});
