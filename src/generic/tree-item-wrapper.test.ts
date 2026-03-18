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

import { CTreeItem, ITreeItem } from './tree-item';
import { CTreeItemWrap } from './tree-item-wrapper';

// Extended wrapper for testing getWrapArray and addWrap
class TestWrap extends CTreeItemWrap {
    constructor(item?: ITreeItem<CTreeItem>) {
        super(item);
    }
    // Optionally override nameKey for testing
    override get nameKey(): string {
        return 'unit';
    }
}

class TestWrapContainer extends CTreeItemWrap {
    constructor(item?: ITreeItem<CTreeItem>) {
        super(item);
    }
    // Optionally override nameKey for testing
    override get nameKey(): string {
        return 'units';
    }

    private readonly unitWrapHelpers = this.wrapHelpers(TestWrap, 'units', 'unit');
    get unitsWrapArray() { return this.unitWrapHelpers.array(); }
    get unitWrapNames() { return this.unitWrapHelpers.names(); }
    getUnitWrap = (name?: string) => this.unitWrapHelpers.get(name);
    addUnitWrap = (name?: string) => this.unitWrapHelpers.add(name);

    private readonly testWrapHelpers = this.wrapHelpers(TestWrap, 'units', 'test');
    get testWrapArray() { return this.testWrapHelpers.array(true); }
    get testWrapNames() { return this.testWrapHelpers.names(); }
    getTestWrap = (name?: string) => this.testWrapHelpers.get(name);
    addTestWrap = (name?: string) => this.testWrapHelpers.add(name);
}


describe('CTreeItemWrapper', () => {
    it('should return undefined if no item is set', () => {
        const wrapper = new CTreeItemWrap();
        expect(wrapper.item).toBeUndefined();
    });

    it('should return the CTreeItem if set', () => {
        const item = new CTreeItem();
        const wrapper = new CTreeItemWrap(item);
        expect(wrapper.item).toBe(item);
    });

    it('ensureItem should create and return a CTreeItem if not set', () => {
        const wrapper = new CTreeItemWrap();
        const ensured = wrapper.ensureItem();
        expect(ensured).toBeInstanceOf(CTreeItem);
        expect(wrapper.item).toBe(ensured);
    });

    it('ensureItem should return the existing CTreeItem if already set', () => {
        const item = new CTreeItem();
        const wrapper = new CTreeItemWrap(item);
        const ensured = wrapper.ensureItem();
        expect(ensured).toBe(item);
    });

    it('should set and get item', () => {
        const wrapper = new CTreeItemWrap();
        const item = new CTreeItem();
        wrapper.item = item;
        expect(wrapper.item).toBe(item);
    });

    it('should allow ensureItem with tag and parent parameters', () => {
        const parent = new CTreeItem();
        const wrapper = new CTreeItemWrap();
        const ensured = wrapper.ensureItem('myTag', parent);
        expect(ensured).toBeInstanceOf(CTreeItem);
        expect(ensured.getParent()).toBe(parent);
        expect(parent.getChild('myTag')).toBe(ensured);
        expect(wrapper.name).toBe('myTag');
    });

    it('should get value from wrapped item using getValue', () => {
        const item = new CTreeItem();
        item.setValue('key', 'value');
        const wrapper = new CTreeItemWrap(item);
        expect(wrapper.item?.getValue('key')).toBe('value');
    });

    it('should get and set object', () => {
        const item = new CTreeItem();
        item.setValue('key', 'value');
        const wrapper = new CTreeItemWrap(item);
        const obj = wrapper.object;
        expect(obj).toEqual({ key: 'value' });
        const wrapper1 = new CTreeItemWrap();
        wrapper1.object = obj;
        expect(wrapper1.item?.getValue('key')).toBe('value');
    });


    it('should return empty array if no children exist', () => {
        const parent = new CTreeItem();
        const wrapper = new CTreeItemWrap(parent);
        const items = wrapper.getChildTreeItems();
        expect(items.length).toEqual(0);
        const names = wrapper.getChildItemNames();
        expect(names).toEqual([]);
    });

    it('should get child items from wrapped item using getChildItems', () => {
        const parent = new CTreeItem();
        const child1 = parent.createChild('child1').setText('c1');
        const child2 = parent.createChild('child2').setText('c2');;
        const child11 = child1.createChild('child11');
        const child12 = child1.createChild('child12');
        const wrapper = new CTreeItemWrap(parent);
        const children = wrapper.getChildTreeItems();
        expect(children).toContain(child1);
        expect(children).toContain(child2);
        expect(children?.length).toBe(2);
        const childNames = wrapper.getChildItemNames();
        expect(childNames).toEqual(['c1', 'c2']);

        const grandChildren = wrapper.getChildTreeItems('child1');
        expect(grandChildren).toContain(child11);
        expect(grandChildren).toContain(child12);
        expect(grandChildren?.length).toBe(2);
    });

    it('getWrapArray should wrap all children with the given wrapper', () => {
        const parent = new CTreeItem();
        const container = parent.createChild('units');
        const child1 = container.createChild('-').setValue('unit', 'child1');
        const child2 = container.createChild('-').setValue('unit', 'child2');
        const child3 = container.createChild('-').setValue('test', 'test1');
        const wrapper = new TestWrapContainer(parent);

        const wraps = wrapper.testWrapArray;
        expect(wraps.length).toBe(3);
        expect(wraps[0]).toBeInstanceOf(TestWrap);
        expect(wraps[0].name).toEqual('child1');
        expect(wraps[2]).toBeInstanceOf(TestWrap);
        expect(wraps[2].getValue('test')).toEqual('test1');
        expect(wraps.map(w => w.item)).toEqual([child1, child2, child3]);
        expect(wrapper.unitsWrapArray.length).toEqual(2);
        expect(wrapper.testWrapArray.length).toEqual(3);
        const added = wrapper.addTestWrap('testAdded');
        expect(wrapper.testWrapArray.length).toEqual(4);
        expect(wrapper.unitsWrapArray.length).toEqual(2);
        added.remove();
        expect(wrapper.testWrapArray.length).toEqual(3);
    });

    it('addWrap should add and return a wrapped child with default names', () => {
        const parent = new CTreeItem();
        const wrapper = new TestWrapContainer(parent);

        const wraps = wrapper.testWrapArray;
        expect(wraps.length).toBe(0);

        // addWrap is protected, so we need to access it via a subclass or cast
        const unitWrap = wrapper.addUnitWrap();
        expect(unitWrap).toBeInstanceOf(TestWrap);
        expect(unitWrap.name).toEqual('');
        expect(unitWrap.item?.getChild()?.getTag()).toEqual('unit');
        expect(unitWrap.item?.getValue('unit')).toBeUndefined();
        expect(wrapper.testWrapArray.length).toBe(1);
        expect(wrapper.unitsWrapArray.length).toBe(1);

        // Should not add duplicate if called again with same name/tag
        const unitWrap2 = wrapper.addUnitWrap('');
        expect(unitWrap2).toEqual(unitWrap);
        expect(wrapper.testWrapArray.length).toBe(1);
        expect(wrapper.unitsWrapArray.length).toBe(1);

        expect(wrapper.getUnitWrap('')).toEqual(unitWrap);
        expect(wrapper.getUnitWrap()).toEqual(unitWrap);

        // Should add a new one if name is different
        const unitWrap3 = wrapper.addUnitWrap('bar');
        expect(unitWrap3).not.toEqual(unitWrap);
        expect(unitWrap3.name).toBe('bar');
        expect(wrapper.testWrapArray.length).toBe(2);
        expect(wrapper.unitsWrapArray.length).toBe(2);

    });

    it('addWrap should add and return a wrapped child with the given name and tag', () => {
        const parent = new CTreeItem();
        const wrapper = new TestWrapContainer(parent);

        const wraps = wrapper.testWrapArray;
        expect(wraps.length).toBe(0);

        // addWrap is protected, so we need to access it via a subclass or cast
        const unitWrap = wrapper.addUnitWrap('foo');
        expect(unitWrap).toBeInstanceOf(TestWrap);
        expect(unitWrap.name).toBe('foo');
        expect(wrapper.testWrapArray.length).toBe(1);
        expect(wrapper.unitsWrapArray.length).toBe(1);

        // Should not add duplicate if called again with same name/tag
        const unitWrap2 = wrapper.addUnitWrap('foo');
        expect(unitWrap2).toEqual(unitWrap);
        expect(wrapper.testWrapArray.length).toBe(1);
        expect(wrapper.unitsWrapArray.length).toBe(1);

        // Should add a new one if name is different
        const unitWrap3 = wrapper.addUnitWrap('bar');
        expect(unitWrap3).not.toEqual(unitWrap);
        expect(unitWrap3.name).toBe('bar');
        expect(wrapper.testWrapArray.length).toBe(2);
        expect(wrapper.unitsWrapArray.length).toBe(2);

    });
});
