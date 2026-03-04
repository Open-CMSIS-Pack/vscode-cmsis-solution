/**
 * Copyright 2024-2026 Arm Limited
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

import * as YAML from 'yaml';
import { it } from '@jest/globals';
import { CTreeItem, ETreeItemKind } from './tree-item';
import { parseYamlToCTreeItem, toYamlString } from './tree-item-yaml-parser';

describe('CTreeItem', () => {
    it('test CTreeItem for proper call chaining', () => {
        const root = new CTreeItem().
            setTag('root').
            setText('text').
            setAttribute('attr', 'val').
            setValue('c', 'value');
        expect(root).toBeInstanceOf(CTreeItem);
        expect(root.getTag()).toEqual('root');
        expect(root.getText()).toEqual('text');
        expect(root.getAttribute('attr')).toEqual('val');
        expect(root.getValue('c')).toEqual('value');
        expect(root.getChild('c')).toBeInstanceOf(CTreeItem);
    });

    it('test CTreeItem generic methods to manipulate  items', () => {
        const root = new CTreeItem('rootInitial');
        expect(root.getTag()).toEqual('rootInitial');
        expect(root.setTag('root')).toEqual(root);
        expect(root.getTag()).toEqual('root');
        expect(root.setAttribute('foo', 'bar')).toEqual(root);
        expect(root.getAttribute('foo')).toEqual('bar');
        expect(root.getAttribute()).toEqual('bar');
        expect(root.getValue('foo')).toEqual('bar');
        expect(root.getValue()).toEqual('bar');
        expect(!root.getAttribute('undefined'));
        expect(!root.getValue('undefined'));

        const c111 = root.createChild('c1').createChild('c11').createChild('c111');
        expect(root.findChild(['c1', 'c11', 'c111'])).toEqual(c111);

        const c1 = root.getChild('c1')!;
        expect(root.hasChild(c1)).toBeTruthy();
        expect(root.getChild()).toEqual(c1);

        expect(root.getChild('undefined')).toEqual(undefined);

        expect(c1.getParent()).toEqual(root);
        expect(c111.getRoot()).toEqual(root);
        expect(c111.getParent('c1')).toEqual(c1);

        expect(c1.getValue()).toEqual(undefined);
        const c11 = c1.getChild();
        expect(c11!.getTag()).toEqual('c11');
        const c2 = c1.createChild('c2');
        expect(root.getGrandChildren('c1')!.length).toEqual(2);

        c1.removeChild(c11);
        expect(root.getGrandChildren('c1')!.length).toEqual(1);
        expect(c2.getPrimaryKey()).toEqual('c2');

        expect(c2.setText('text')).toEqual(c2);;
        expect(c2.getValue()).toEqual('text');
        expect(c2.getKeyValue()).toEqual(['c2', 'text']);
        expect(c2.getValuesAsArray()).toEqual(['text']);
        expect(c1.getValue('c2')).toEqual('text');

        expect(c1.setAttribute('c2', 'attribute')).toEqual(c1);
        expect(c1.getValue('c2')).toEqual('attribute');
        expect(c1.getValue()).toEqual('attribute');
        c1.setAttribute('c2');
        expect(c1.getValue('c2')).toEqual('text');
        c2.setValue(undefined, 'text2'); // sets 'this' value
        expect(c2.getValue()).toEqual('text2');
        expect(c1.getValue('c2')).toEqual('text2');

        c1.setTag('-');
        expect(c1.getPrimaryKey()).toEqual('text2');
        expect(c1.getValue('c2')).toEqual('text2');
        expect(c1.getKeyValue()).toEqual(['c2', 'text2']);

        c1.setValue('c2', 'text3');
        expect(c1.getValue('c2')).toEqual('text3');
        expect(c1.getChild('c2')).toEqual(c2); // no change in children

        c1.setValue('c2'); // effectively removes value
        expect(c1.getValue('c2')).toEqual(undefined);
        expect(c1.getChild('c2')).toEqual(undefined);

        c1.setValue('c2', 'text4');
        expect(c1.getValue('c2')).toEqual('text4');
        expect(c1.getChild('c2')).not.toEqual(undefined);
        expect(c1.getChild('c2')).not.toEqual(c2); // no change in children

        c1.setValue('foo', 'bar');
        expect(root.getChildByValue('foo', 'bar')).toEqual(c1);
        expect(root.getChildByValue('foo')).toEqual(c1);
        expect(root.getChildByValue('foo', 'other')).toEqual(undefined);


        c1.setAttribute('', 'noKey');
        expect(!c1.getAttribute(''));
        c1.setAttribute('.', 'dot');
        expect(c1.getAttribute('.')).toEqual('dot');

        root.removeChild(c1);
        expect(root.getChild()).toEqual(undefined);
        expect(root.getGrandChildren().length).toEqual(0);
        expect(root.getChildren().length).toEqual(0);

        const seq = root.createChild('seq');
        const data = seq.createChild('-');
        data.setText('data');
        expect(seq.getKind()).toEqual(ETreeItemKind.Sequence);
        expect(data.getKind()).toEqual(ETreeItemKind.Scalar);
    });

    it('toObject converts item tree to plain object', async () => {
        const myObject = {
            'target-types': [{
                'type': 'Debug',
                'num': 42,
                'numAsString': '43',
                'valid': true,
                'boolAsString': 'false',
                'target-set': [{
                    'set': null,
                    'info': 'Default target set',
                    'images': [{
                        'name': 'image1',
                        'load': 'image+symbols',
                    }],
                    'debugger': [{
                        'name': 'GDB',
                        'protocol': 'swd',
                    }],
                }],
            }],
        };

        const myObjectYml = YAML.stringify(myObject, { indent: 2 });
        const itemTree = parseYamlToCTreeItem(myObjectYml) as CTreeItem;
        const itemAsObject = itemTree.toObject();
        expect(itemAsObject).toEqual(myObject);

    });

    it('fromObject converts plain object to item tree', async () => {
        const myObject = {
            'target-types': [{
                'type': 'Debug',
                'num': 42,
                'numAsString': '43',
                'valid': true,
                'boolAsString': 'false',
                'target-set': [{
                    'set': null,
                    'info': 'Default target set',
                    'images': [{
                        'name': 'image1',
                        'load': 'image+symbols',
                    },
                    {
                        'name': 'image2',
                        'load': 'symbols only',
                    }],
                    'debugger': [{
                        'name': 'GDB',
                        'protocol': 'swd',
                    }],
                }],
            }],
        };
        const myObjectYml = YAML.stringify(myObject, { indent: 2, nullStr: '' });

        const itemTree = new CTreeItem();
        itemTree.fromObject(myObject);

        const itemAsYml = toYamlString(itemTree);
        expect(itemAsYml).toEqual(myObjectYml);

        // modify tree
        let targetSet = itemTree.getChild('target-types')?.getChild()?.getChild('target-set')?.getChild();
        expect(targetSet).toBeDefined();
        targetSet?.setProperty('foo', 'bar');
        targetSet?.setValue('new', 'value');
        targetSet?.setValue('info', 'modified');
        targetSet?.getChild('info')?.setProperty('magic', 42);
        targetSet?.getChild('images')?.createChild('-').setValue('name', 'baz');
        targetSet?.getChild('debugger')?.clear();
        let itemAsObject = itemTree.toObject();
        expect(itemAsObject).not.toEqual(myObject);

        // test that the second assignment
        itemTree.fromObject(myObject);
        // object should match the initial one, but properties remain
        itemAsObject = itemTree.toObject();
        expect(itemAsObject).toEqual(myObject);

        targetSet = itemTree.getChild('target-types')?.getChild()?.getChild('target-set')?.getChild();
        expect(targetSet?.getProperty('foo')).toEqual('bar');
        expect(targetSet?.getChild('info')?.getProperty('magic')).toEqual(42);
    });

    it('fromObject handles different item kinds correctly', () => {
        const itemTree = new CTreeItem();
        itemTree.fromObject('some text');

        expect(itemTree.getKind()).toEqual(ETreeItemKind.Scalar);
        expect(itemTree.getText()).toEqual('some text');
        expect(itemTree.getChildren().length).toEqual(0);

        itemTree.fromObject(['item1', 'item2']);
        expect(itemTree.getKind()).toEqual(ETreeItemKind.Sequence);
        expect(itemTree.getText()).toBeUndefined();
        expect(itemTree.getChildren().length).toEqual(2);

        itemTree.fromObject(42);
        expect(itemTree.getKind()).toEqual(ETreeItemKind.Scalar);
        expect(itemTree.getText()).toEqual('42');
        expect(itemTree.getChildren().length).toEqual(0);
    });

    it('addChild and createChild support insertAt parameter', () => {
        const root = new CTreeItem('root');
        const c1 = root.createChild('c1');
        const c2 = root.createChild('c2');
        const c3 = new CTreeItem('c3');

        // Insert c3 at position 0 (should be first child)
        root.addChild(c3, false, 0);
        let children = root.getChildren();
        expect(children[0]).toBe(c3);
        expect(children[1]).toBe(c1);
        expect(children[2]).toBe(c2);

        // Insert c4 at position 2 (between c1 and c2)
        const c4 = new CTreeItem('c4');
        root.addChild(c4, false, 2);
        children = root.getChildren();
        expect(children[0]).toBe(c3);
        expect(children[1]).toBe(c1);
        expect(children[2]).toBe(c4);
        expect(children[3]).toBe(c2);

        // createChild with insertAt
        const c5 = root.createChild('c5', false, 1);
        children = root.getChildren();
        expect(children[1]).toBe(c5);
        expect(children.map(c => c.getTag())).toEqual(['c3', 'c5', 'c1', 'c4', 'c2']);
    });
    it('addChild handles insertAt edge cases: -1, 0, and larger than array size', () => {
        const root = new CTreeItem('root');
        const c1 = new CTreeItem('c1');
        const c2 = new CTreeItem('c2');
        const c3 = new CTreeItem('c3');
        root.addChild(c1);
        root.addChild(c2);

        // insertAt = -1 (should append to end)
        root.addChild(c3, false, -1);
        let children = root.getChildren();
        expect(children.map(c => c.getTag())).toEqual(['c1', 'c2', 'c3']);

        // insertAt = 0 (should insert at start)
        const c4 = new CTreeItem('c4');
        root.addChild(c4, false, 0);
        children = root.getChildren();
        expect(children.map(c => c.getTag())).toEqual(['c4', 'c1', 'c2', 'c3']);

        // insertAt larger than array size (should append to end)
        const c5 = new CTreeItem('c5');
        root.addChild(c5, false, 100);
        children = root.getChildren();
        expect(children.map(c => c.getTag())).toEqual(['c4', 'c1', 'c2', 'c3', 'c5']);
    });
    it('addChild and createChild append to end when insertAt is not specified', () => {
        const root = new CTreeItem('root');
        const c1 = new CTreeItem('c1');
        const c2 = new CTreeItem('c2');
        root.addChild(c1);
        root.addChild(c2);
        let children = root.getChildren();
        expect(children[0]).toBe(c1);
        expect(children[1]).toBe(c2);

        // createChild without insertAt should append
        const c3 = root.createChild('c3');
        children = root.getChildren();
        expect(root.indexOfChild(c3)).toBe(2);
        expect(root.childAtIndex(2)).toBe(c3);
        expect(root.childAtIndex(2)).toBe(c3);
        expect(root.childAtIndex(4)).toBeUndefined();
        expect(root.childAtIndex(-1)).toBe(c3);
        expect(root.childAtIndex(-4)).toBeUndefined();
        expect(children.map(c => c.getTag())).toEqual(['c1', 'c2', 'c3']);
    });
    it('createSequenceChildWithValue ensures child in a sequence', () => {
        const root = new CTreeItem('root');
        const c1 = root.createSequenceChildWithValue('foo', 'bar');
        expect(root.indexOfChild(c1)).toBe(0);
        const c2 = root.createSequenceChildWithValue('foo', 'bar');
        expect(c2).toEqual(c1);
        const c3 = root.createSequenceChildWithValue('foo', 'baz');
        expect(root.indexOfChild(c3)).toBe(1);
        expect(root.getChildByValue('foo', 'baz')).toEqual(c3);
        const compareFirstChar = (itemValue?: string, value?: string): boolean => (itemValue?.[0] === value?.[0]);
        expect(root.getChildByValue('foo', 'b', compareFirstChar)).toEqual(c1);
        expect(root.getChildByValue('foo', 'z', compareFirstChar)).toBe(undefined);
    });
    it('clone creates a deep copy of the item and its children', () => {
        const root = new CTreeItem('root');
        root.setKind(ETreeItemKind.Map);
        root.setText('rootText');
        root.setAttribute('attr', 'value');
        root.setProperty('custom', { foo: 'bar' });

        const child1 = root.createChild('child1');
        child1.setText('childText');
        child1.setAttribute('childAttr', 'childValue');
        child1.setProperty('childProp', [1, 2, 3]);

        const child2 = root.createChild('child2');
        child2.setKind(ETreeItemKind.Sequence);

        const clone = root.clone();

        // Check root properties
        expect(clone.getKind()).toBe(ETreeItemKind.Map);
        expect(clone.getTag()).toBe('root');
        expect(clone.getText()).toBe('rootText');
        expect(clone.getAttribute('attr')).toBe('value');
        expect(clone.getProperty('custom')).toEqual({ foo: 'bar' });
        expect(clone).not.toBe(root);

        // Check children
        const cloneChild1 = clone.getChild('child1')!;
        expect(cloneChild1.getTag()).toBe('child1');
        expect(cloneChild1.getText()).toBe('childText');
        expect(cloneChild1.getAttribute('childAttr')).toBe('childValue');
        expect(cloneChild1.getProperty('childProp')).toEqual([1, 2, 3]);
        expect(cloneChild1).not.toBe(child1);

        const cloneChild2 = clone.getChild('child2')!;
        expect(cloneChild2.getTag()).toBe('child2');
        expect(cloneChild2.getKind()).toBe(ETreeItemKind.Sequence);
        expect(cloneChild2).not.toBe(child2);
    });

    it('removeChildrenWithTags removes children with specified tags', () => {
        const root = new CTreeItem('root');
        root.createChild('c1');
        root.createChild('c2');
        root.createChild('c3');
        expect(root.getChildren().map(c => c.getTag())).toEqual(['c1', 'c2', 'c3']);

        root.removeChildrenWithTags(['c2', 'c3']);
        const tags = root.getChildren().map(c => c.getTag());
        expect(tags).toEqual(['c1']);
    });

    it('removeChildrenNotInTags removes children not in the supplied tags', () => {
        const root = new CTreeItem('root');
        root.createChild('c1');
        root.createChild('c2');
        root.createChild('c3');
        expect(root.getChildren().map(c => c.getTag())).toEqual(['c1', 'c2', 'c3']);

        root.removeChildrenNotInTags(['c2']);
        const tags = root.getChildren().map(c => c.getTag());
        expect(tags).toEqual(['c2']);
    });

    it('removeChildrenWithTags with empty array does nothing', () => {
        const root = new CTreeItem('root');
        root.createChild('c1');
        root.createChild('c2');
        root.removeChildrenWithTags([]);
        expect(root.getChildren().map(c => c.getTag())).toEqual(['c1', 'c2']);
    });

    it('removeChildrenNotInTags with empty array removes all children', () => {
        const root = new CTreeItem('root');
        root.createChild('c1');
        root.createChild('c2');
        root.removeChildrenNotInTags([]);
        expect(root.getChildren().length).toBe(0);
    });
});
