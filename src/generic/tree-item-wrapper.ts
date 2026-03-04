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

import { CTreeItem, ETreeItemKind, ITreeItem } from './tree-item';

/**
 * Interface for a wrapper around a tree item.
 * @template T - The type of tree item.
 */
export interface ITreeItemWrap {
    /**
     * Gets the wrapped tree item, or undefined if not set.
     */
    get item(): ITreeItem<CTreeItem> | undefined;

    /**
     * Sets the wrapped tree item
     */
    set item(item: ITreeItem<CTreeItem> | undefined);

    /**
     * Returns item name, classes must implement the method
     */
    get name(): string | undefined;

    /**
     * Sets item name, classes must implement the method
     */
    set name(name: string);

    /**
     * Ensures a tree item exists and returns it.
     * @param tag Optional string attribute key or child's tag.
     * @param parent Optional parent tree item to associate with the new item.
     * @returns The ensured tree item.
     */
    ensureItem(tag?: string, parent?: ITreeItem<CTreeItem>): ITreeItem<CTreeItem>;

    /**
       * Remove this item from parent
    */
    remove(): void;

    /** Returns item's value matching specified key or undefined is the key not found
     * @param keyOrTag string attribute key or child's tag
     * @returns string or undefined
    */
    getValue(keyOrTag?: string): string | undefined;

    /** Sets item's value for specified key
     * @param keyOrTag string attribute key or child's tag
     * @param value to set
     * @returns this
    */
    setValue(keyOrTag?: string, value?: string): ITreeItemWrap;
}

type WrapConstructor<WT extends ITreeItemWrap> = new (item: ITreeItem<CTreeItem>, name?: string) => WT;

/**
 * Base implementation of a tree item wrapper.
 */
export class CTreeItemWrap implements ITreeItemWrap {
    protected _item?: ITreeItem<CTreeItem>;

    /**
     * Constructs a new wrapper for the given tree item.
     * @param item Optional tree item to wrap.
     */
    constructor(item?: ITreeItem<CTreeItem>) {
        this._item = item;
    }

    public get item(): ITreeItem<CTreeItem> | undefined {
        return this._item;
    }

    public set item(item: ITreeItem<CTreeItem> | undefined) {
        this._item = item;
    }

    public ensureItem(tag?: string, parent?: ITreeItem<CTreeItem>): ITreeItem<CTreeItem> {
        if (!this._item) {
            this._item = new CTreeItem(tag, parent);
            if (parent) {
                parent.addChild(this._item);
            }
        }
        return this._item as CTreeItem;
    }

    public get object() {
        return this.item?.toObject();
    }

    public set object(obj: unknown) {
        this.ensureItem().fromObject(obj);
    }

    public getValue(keyOrTag?: string): string | undefined {
        return this.item?.getValue(keyOrTag);
    }

    public setValue(keyOrTag?: string, value?: string): ITreeItemWrap {
        this.ensureItem().setValue(keyOrTag, value);
        return this;
    }

    get name(): string {
        if (!this.item) {
            return '';
        }
        const key = this.nameKey;
        if (key) {
            return this.item.getValueAsString(key);
        }
        return this.item.getTag() || '';
    }

    set name(name: string | undefined) {
        if (!this.item) {
            return;
        }
        const key = this.nameKey;
        if (key) {
            this.item.createChild(key, true).setText(name).setKind(ETreeItemKind.Scalar);
        } else if (name) {
            this.item.setTag(name);
        }
    }

    get nameKey(): string {
        return '';
    }

    /**
     * Returns children of the first child matching given tag or this children
     * @param tag optional child's tag
     * @return array of items as ITreeItem<CTreeItem>[] or empty array
    */
    public getChildTreeItems(tag?: string): ITreeItem<CTreeItem>[] {
        if (!this.item) {
            return [];
        }
        if (tag) {
            return this.item.getGrandChildren(tag);
        }
        return this.item.getChildren();
    }

    /**
     * Returns names of child items
     * @param containerTag optional child item tag to get grandChildren
     * @param nameKey value key corresponding name
     * @return string array of ITreeItem names
     */
    public getChildItemNames(containerTag?: string, nameKey?: string): string[] {
        const names: string[] = [];
        for (const child of this.getChildTreeItems(containerTag)) {
            const name = child.getValueAsString(nameKey);
            if (name != null || !nameKey) {
                names.push(child.getValueAsString(nameKey));
            }
        }
        return names;
    }


    /**
     * Retrieves an array of wrapped child items using the specified wrapper class.
     *
     * @typeParam WT - The type of the wrapper class to instantiate for each child item.
     * @param tag - Optional tag to filter child items. If provided, only children with the matching tag are wrapped.
     * @param WrapperClass - The constructor function for the wrapper class, which takes an `ITreeItem<CTreeItem>` as its argument.
     * @returns An array of wrapped child items of type `WT`.
     */
    protected getWrapArray<WT extends ITreeItemWrap>(WrapperClass: WrapConstructor<WT>,
        containerTag?: string,
        nameKey?: string): WT[] {
        const wraps: WT[] = [];
        for (const child of this.getChildTreeItems(containerTag)) {
            if (!nameKey || child.getChild(nameKey)) {
                wraps.push(this.createWrap(WrapperClass, child));
            }
        }
        return wraps;
    }

    protected getWrap<WT extends ITreeItemWrap>(
        WrapperClass: WrapConstructor<WT>,
        containerTag?: string,
        name?: string,
        nameKey?: string
    ): WT | undefined {
        const wraps = this.getWrapArray(WrapperClass, containerTag, nameKey);
        if (nameKey === undefined) {
            nameKey = this.nameKey;
        }
        for (const wrap of wraps) {
            if (wrap.name === name) {
                return wrap;
            }
            const val = wrap.getValue(nameKey);
            if (val === name || (!val && !name)) { // we should consider situations '' === undefined
                return wrap;
            }
        }
        return (wraps.length > 0 && !name) ? wraps[0] : undefined;
    }


    protected addWrap<WT extends ITreeItemWrap>(
        WrapperClass: WrapConstructor<WT>,
        containerTag: string,
        name: string | undefined,
        nameKey: string
    ): WT {
        let wrap = this.getWrap(WrapperClass, containerTag, name, nameKey);
        if (!wrap) {
            const tsParent = this.ensureItem('-').createChild(containerTag, true);
            const tsItem = tsParent.createChild('-', false, 0);
            // explicitly create child with nameKey to support name === undefined
            tsItem.createChild(nameKey).setText(name).setKind(ETreeItemKind.Scalar);
            wrap = this.createWrap(WrapperClass, tsItem);
        }
        return wrap;
    }

    protected createWrap<WT extends ITreeItemWrap>(
        WrapperClass: WrapConstructor<WT>,
        item: ITreeItem<CTreeItem>
    ): WT {
        return new WrapperClass(item);
    }

    public remove(): void {
        if (this.item) {
            this.item.getParent()?.removeChild(this.item);
        }
    }

    protected wrapHelpers<T extends CTreeItemWrap>(
        WrapperClass: WrapConstructor<T>,
        containerTag: string,
        nameKey: string
    ) {
        return {
            array: (all?: boolean) => this.getWrapArray(WrapperClass, containerTag, all ? undefined : nameKey),
            names: () => this.getChildItemNames(containerTag, nameKey),
            get: (name?: string) => this.getWrap(WrapperClass, containerTag, name, nameKey),
            add: (name?: string) => this.addWrap(WrapperClass, containerTag, name, nameKey),
            purge: () => {
                const containerItem = this.item?.getChild(containerTag);
                if (containerItem && containerItem.getChildren().length === 0) {
                    this.item?.removeChild(containerItem);
                }
            }
        };
    }

}

// end of tree-item-wrapper.ts
