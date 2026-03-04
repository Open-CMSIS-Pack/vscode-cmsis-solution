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

import { CAttributedItem, IAttributedItem } from './attributed-item';


/** An enum to describe ITreeItem kind */
export enum ETreeItemKind {
    Undefined = 0,
    Scalar = 1,
    Sequence = 2,
    Map = 3,
}

/**
 * Generic tree item interface with dynamic properties, dynamic string attributes, children and parent chains
*/
export interface ITreeItem<T extends ITreeItem<T>> extends IAttributedItem {

    /** Returns the item as plain JavaScript object
     * @returns value, array, or object
     */
    toObject(): unknown;

    /** Updates the item data with the supplied object
     * @param obj Any value to store
     * @returns this as ITreeItem<T>
     */
    fromObject(obj: unknown): ITreeItem<T>

    /**
     * Returns YAML scalar type for scalar items
     * YAML scalar type string ('PLAIN', 'QUOTE_DOUBLE', 'QUOTE_SINGLE') or undefined
     */
    get scalarType(): string | undefined;

    /**
     * Sets YAML scalar type for scalar items
     * @param scalarType YAML scalar type string ('PLAIN', 'QUOTE_DOUBLE', 'QUOTE_SINGLE') or undefined
     */
    set scalarType(scalarType: string | undefined);

    /**
     * Checks if this item is 'PLAIN' scalar type
     */
    get isPlain(): boolean;

    /** Returns item's parent matching tag
     * @param tag optional parent's tag
     * @returns parent item or undefined
    */
    getParent(tag?: string): ITreeItem<T> | undefined;

    /** Returns item's top-level root item
     * @returns root item as ITreeItem<T>
    */
    getRoot(): ITreeItem<T>;

    /** Returns kind of the item
     * @returns kind as ETreeItemKind
     * @see ETreeItemKind
     * @see setKind
     * @see isSequence
     * @see isMap
    */
    getKind(): ETreeItemKind;

    /**Set item's kind
     * @param kind kind to set
     * @returns this as ITreeItem<T>
    */
    setKind(kind: ETreeItemKind): ITreeItem<T>;

    /** Checks if item's kind is ETreeItemKind.Sequence
     * @returns true if the item is a sequence
     * @see ETreeItemKind
    */
    isSequence(): boolean;

    /** Checks if item's kind is ETreeItemKind.Map
     * @returns true if the item is a map
     * @see ETreeItemKind
    */
    isMap(): boolean;

    /** Returns values of a sequence children matching specified key or sequence members
      * @param keyOrTag string attribute key or child's tag
      * @returns array of string values, empty array if not found
    */
    getSequenceValues(keyOrTag?: string): string[];

    /** Returns item values matching specified key or sequence members
     * @param keyOrTag string attribute key or child's tag
     * @returns array of string values, empty array if not found
    */
    getValuesAsArray(keyOrTag?: string): string[];

    /**
     * Returns item's tree path from the root as array of primary keys
     * @returns array of strings
     */
    getTreePath(): string[];

    /** Returns item children
     * @param create flag to create the property if not exists
     * @return array of items as ITreeItem<T>[] or empty array
     * @see addChild
    */
    getChildren(create?: boolean): ITreeItem<T>[];

    /**
     * Returns children of the first child matching given tag
     * @param tag optional child's tag or primary key
     * @return array of items as ITreeItem<T>[] or empty array
    */
    getGrandChildren(tag?: string): ITreeItem<T>[];

    /**
     * Returns first child matching given tag
     * @param tag optional child's tag or primary key value
     * @return first child matching the tag or undefined
     * @see getChildByValue
     * @see getGrandChildren
     * @see getChildren
     * @see addChild
     * @see removeChild
     */
    getChild(tag?: string): ITreeItem<T> | undefined;

    /**
     * Returns first child that has supplied value
     * @param key value key tag
     * @param value item's value to match
     * @param predicate optional custom comparison function for value matching
     * @returns first child containing matching value or undefined
     */
    getChildByValue(
        key: string,
        value?: string,
        predicate?: (itemValue?: string, value?: string) => boolean
    ): ITreeItem<T> | undefined;

    /**
     * Ensures a child with given key and value exists in the sequence
     * @param key value key tag
     * @param value item's value to match
     * @param predicate optional custom comparison function for value matching
     * @returns first child containing matching value or newly created child
     */
    createSequenceChildWithValue(
        key: string,
        value?: string,
        predicate?: (itemValue?: string, value?: string) => boolean
    ): ITreeItem<T>;

    /**
     * Returns first child matching tag chain
     * @param treePath array of tags/ primary key values
     * @returns first child matching the path or undefined
    */
    findChild(treePath: string[]): ITreeItem<T> | undefined

    /**
     * Returns true if a child is already in the child collection
     * @param c child to check
     * @returns true if the child is already in the collection
     * @see addChild
    */
    hasChild(c?: ITreeItem<T>): boolean;

    /**
     * Returns index of a child  in the child collection
     * @param c child to get index of
     * @returns zero-based index or -1 if not found
     * @see hasChild
    */
    indexOfChild(c?: ITreeItem<T>): number;

    /**
     * Returns child at specified index
     * @param index zero-based number
     * @returns child at index or undefined
     * @see indexOfChild
    */
    childAtIndex(index: number): ITreeItem<T> | undefined;

    /**
     * Adds a child and returns the supplied item
     * @param c child to add
     * @param checkIfExists an optional flag to check if child is already added
     * @param insertAt optional index to insert (>=0 && < length), append otherwise
     * @returns created item as ITreeItem<T>
    */
    addChild(c: ITreeItem<T>, checkIfExists?: boolean, insertAt?: number): ITreeItem<T>;

    /**
     * Removes a child
     * @param c child to remove
     */
    removeChild(c?: ITreeItem<T>): void;

    /**
     * Removes all children with tags matching any in the supplied array.
     * @param tags Array of tags to remove
     */
    removeChildrenWithTags(tags: string[]): void;

    /**
     * Removes all children whose tags are NOT in the supplied array.
     * @param tags Array of tags to keep
     */
    removeChildrenNotInTags(tags: string[]): void;

    /** Factory method to create a new item
     * @param tag child's tag
     * @param parent child's parent
     * @return newly created item as ITreeItem<T>
    */
    createItem(tag?: string, parent?: ITreeItem<T>): ITreeItem<T>;

    /** Factory method to create a new item and add it as a child
     * @param tag child's tag
     * @param checkIfExists an optional flag to check if child is already exists
     * @param insertAt optional index to insert (>=0 && < length), append otherwise
     * @return newly created or existing child as ITreeItem<T>
    */
    createChild(tag?: string, checkIfExists?: boolean, insertAt?: number): ITreeItem<T>;

    /** Sets attribute value for specified key, remove entry if value is undefined
      * @param key string key
      * @param value string value or undefined
      * @returns this as ITreeItem<T>
    */
    setAttribute(key: string, value?: string): ITreeItem<T>;

    /** Sets item value for specified key or tag, remove entry if value is undefined
     * @param keyOrTag string key
     * @param value string value or undefined
     * @returns this as ITreeItem<T>
    */
    setValue(keyOrTag?: string, value?: string): ITreeItem<T>;

    /** Set item tag
     * @param tag string to set as a tag
     * @returns this as ITreeItem<T>
    */
    setTag(tag: string): ITreeItem<T>;

    /** Set/unset item text
     * @returns this as ITreeItem<T>
     * @param text string to set as a text, undefined to unset
     * @returns this as ITreeItem<T>
    */
    setText(text?: string): ITreeItem<T>;

    /**
     * Creates a deep clone of this item and its children.
     * parent: optional new parent
     * @returns A new ITreeItem<T> instance with the same structure and data.
     */
    clone(parent?: ITreeItem<T>): ITreeItem<T>;
}

/**
 * class implementing generic ITreeItem interface
 */
export class GenericTreeItem<T extends GenericTreeItem<T>> extends CAttributedItem implements ITreeItem<T> {
    constructor(tag?: string, parent?: ITreeItem<T>) {
        super(tag);
        this.data.parent = parent;
    }

    toObject(): unknown {
        switch (this.getKind()) {
            case ETreeItemKind.Scalar: {
                const text = this.getText();
                if (!text) {
                    return null;
                } else if (this.isPlain)
                    try {
                        return JSON.parse(text);
                    } catch {
                        // fall through
                    }
                return text;
            }
            case ETreeItemKind.Sequence:
                return this.getChildren().map(child => child.toObject());
            case ETreeItemKind.Map: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const obj = {} as any;
                this.getAttributes()?.forEach((value, key) => obj[key] = value);
                this.getChildren().forEach(child => child.getTag() ? obj[child.getTag()!] = child.toObject() : undefined);
                return obj;
            }
            default:
                return {};
        }
    }

    private scalarTypeForObject(obj: unknown): string | undefined {
        switch (typeof obj) {
            case 'number':
            case 'boolean':
                return 'PLAIN';
            case 'string':  {
                try {
                    const v = JSON.parse(obj);
                    switch (typeof v) {
                        case 'number':
                        case 'boolean':
                            return 'QUOTE_DOUBLE';
                    }
                } catch {
                    // fall through
                }
            }
        }
        return undefined;
    }

    fromObject(obj: unknown) {
        switch (typeof obj) {
            case 'number':
            case 'boolean':
            case 'string': {
                this.setKind(ETreeItemKind.Scalar);
                this.setText(obj.toString());
                this.scalarType = this.scalarTypeForObject(obj);
                this.removeChildrenNotInTags([]);
                break;
            }
            case 'object':
                this.setText(undefined);
                if (Array.isArray(obj)) {
                    this.setKind(ETreeItemKind.Sequence);
                    for (let i = 0; i < obj.length; i++) {
                        let child = this.childAtIndex(i);
                        if (!child) {
                            child = this.createChild('-');
                        }
                        child.fromObject(obj[i]);
                    }
                    // truncate children if needed
                    if (this.getChildren().length > obj.length) {
                        this.getChildren().length = obj.length;
                    }
                } else if (obj) {
                    this.setKind(ETreeItemKind.Map);
                    this.removeChildrenNotInTags(Object.keys(obj));
                    for (const [key, value] of Object.entries(obj)) {
                        const child = this.createChild(key, true);
                        child.fromObject(value);
                    }
                } else {
                    this.removeChildrenNotInTags([]);
                    this.setKind(ETreeItemKind.Scalar);
                }
                break;
        }
        return this;
    }

    clear(): void {
        super.clear();
        delete this.data.children;
    }

    getParent(tag?: string): ITreeItem<T> | undefined {
        const parent = this.data.parent as ITreeItem<T>;
        if (!parent || !tag) {
            return parent;
        }
        if (parent.getTag() === tag) {
            return parent;
        }
        return parent.getParent(tag);
    }

    getRoot(): ITreeItem<T> {
        const parent = this.getParent();
        if (parent) {
            return parent.getRoot();
        }
        return this;
    }

    getKind(): ETreeItemKind {
        let kind = this.data.kind as ETreeItemKind;
        if (kind) {
            return kind;
        }
        kind = ETreeItemKind.Undefined;
        const child = this.getChild();
        if (child) {
            kind = child.getTag() === '-' ? ETreeItemKind.Sequence : ETreeItemKind.Map;
        } else if (this.getText() !== undefined) {
            kind = ETreeItemKind.Scalar;
        }
        this.setKind(kind);
        return kind;
    }

    setKind(kind: ETreeItemKind): ITreeItem<T> {
        this.data.kind = kind;
        return this;
    }

    isSequence(): boolean {
        return this.getKind() == ETreeItemKind.Sequence;
    }

    isMap(): boolean {
        return this.getKind() == ETreeItemKind.Map;
    }

    get scalarType(): string | undefined {
        return this.getProperty('scalarType') as string;
    }

    set scalarType(scalarType: string | undefined) {
        this.setProperty('scalarType', scalarType);
    }

    get isPlain(): boolean {
        return this.scalarType === 'PLAIN';
    }

    getKeyValue(): [string, string] {
        const keyVal = super.getKeyValue();
        if (!keyVal[0] || keyVal[0] === '-') {
            const child = this.getChild();
            if (child) {
                return child.getKeyValue();
            }
        }
        return keyVal;
    }

    getValue(keyOrTag?: string): string | undefined {
        const val = super.getValue(keyOrTag);
        if (!val) {
            const child = this.getChild(keyOrTag);
            if (child) {
                return child.getText();
            }
        }
        return val;
    }

    setValue(keyOrTag?: string, value?: string): ITreeItem<T> {
        if (!keyOrTag || keyOrTag == this.getTag()) {
            this.setText(value);
        } else if (value !== undefined) {
            this.createChild(keyOrTag, true).setText(value);
        } else {
            this.removeChild(this.getChild(keyOrTag));
        }
        return this;
    }

    setAttribute(key: string, value?: string): ITreeItem<T> {
        super.setAttribute(key, value);
        return this;
    }

    setTag(tag: string): ITreeItem<T> {
        super.setTag(tag);
        return this;
    }

    setText(text?: string): ITreeItem<T> {
        super.setText(text);
        return this;
    }

    getSequenceValues(keyOrTag?: string): string[] {
        const values: string[] = [];
        for (const c of this.getChildren()) {
            const v = c.getValue(keyOrTag);
            if (v) {
                values.push(v);
            }
        }
        return values;
    }

    getValuesAsArray(keyOrTag?: string): string[] {
        if (this.isSequence()) {
            return this.getSequenceValues(keyOrTag);
        }
        const child = keyOrTag ? this.getChild(keyOrTag) : this;
        if (child && child.isSequence()) {
            return child.getSequenceValues();
        } else {
            const value = this.getValue(keyOrTag);
            return value ? [value] : [];
        }
    }

    getTreePath(): string[] {
        const parent = this.getParent();
        const treePath = parent ? parent.getTreePath() : [];
        const primaryKey = this.getPrimaryKey();
        if (primaryKey) {
            treePath.push(primaryKey);
        }
        return treePath;
    }

    getChildren(create?: boolean): ITreeItem<T>[] {
        let children = this.data.children as ITreeItem<T>[];
        if (create && !children) {
            children = this.data.children = [];
        }
        return children ?? [];
    }

    getGrandChildren(tag?: string): ITreeItem<T>[] {
        const child = this.getChild(tag);
        if (child) {
            return child.getChildren();
        }
        return [];
    }

    getChild(tag?: string): ITreeItem<T> | undefined {
        return this.getChildren().find(c => !tag || c.getTag() === tag || c.matchesPrimaryKey(tag));
    }

    getChildByValue(key: string, value?: string, predicate?: (itemValue?: string, value?: string) => boolean): ITreeItem<T> | undefined {
        const children = this.getChildren();
        if (!children) {
            return undefined;
        }
        if (predicate) {
            return children.find(c => predicate(c.getValue(key), value));
        }
        return children.find(c => {
            const itemValue = c.getValue(key);
            return value ? itemValue === value : itemValue !== undefined;
        });
    }

    createSequenceChildWithValue(key: string, value?: string,
        predicate?: (itemValue?: string, value?: string) => boolean): ITreeItem<T> {
        let child = this.getChildByValue(key, value, predicate);
        if (!child) {
            child = this.createChild('-', false).setValue(key, value);
        }
        return child;
    }

    hasChild(c?: ITreeItem<T>): boolean {
        return this.indexOfChild(c) >= 0;
    }

    indexOfChild(c?: ITreeItem<T>): number {
        return c ? this.getChildren().indexOf(c) : -1;
    }

    childAtIndex(index: number): ITreeItem<T> | undefined {
        return this.getChildren().at(index);
    }

    findChild(tags: string[]): ITreeItem<T> | undefined {
        let c: ITreeItem<T> | undefined = this;
        for (const tag of tags) {
            c = c.getChild(tag);
            if (!c) {
                return undefined;
            }
        }
        return c;
    }

    createItem(tag?: string, parent?: ITreeItem<T>): ITreeItem<T> {
        return new GenericTreeItem(tag, parent);
    }

    createChild(tag?: string, checkIfExists?: boolean, insertAt?: number): ITreeItem<T> {
        if (checkIfExists) {
            const c = this.getChild(tag);
            if (c) {
                return c;
            }
        }
        return this.addChild(this.createItem(tag, this), false, insertAt);
    }

    addChild(c: ITreeItem<T>, checkIfExists?: boolean, insertAt?: number): ITreeItem<T> {
        const children = this.getChildren(true);
        if (checkIfExists && this.hasChild(c)) {
            return c;
        }
        if (typeof insertAt === 'number' && insertAt >= 0 && insertAt <= children.length) {
            children.splice(insertAt, 0, c);
            return c;
        }
        children.push(c);
        return c;
    }

    removeChild(c?: ITreeItem<T>): void {
        if (this.hasChild(c)) {
            this.data.children = this.getChildren()!.filter(child => !(child === c));
        }
    }

    /**
     * Removes all children with tags matching any in the supplied array.
     * @param tags Array of tags to remove
     */
    removeChildrenWithTags(tags: string[]): void {
        if (!tags?.length) {
            return;
        }
        this.data.children = this.getChildren().filter(
            child => { const tag = child.getTag() ?? ''; return !tags.includes(tag); });
    }

    /**
     * Removes all children whose tags are NOT in the supplied array.
     * @param tags Array of tags to keep
     */
    removeChildrenNotInTags(tags: string[]): void {
        if (!tags?.length) {
            this.data.children = [];
            return;
        }
        this.data.children = this.getChildren().filter(
            child => { const tag = child.getTag() ?? ''; return tags.includes(tag); });
    }

    override get rootFileName(): string {
        const root = this.getRoot();
        if (root && root !== this) {
            // if the root is not this item, then get the file name from the root
            return root.rootFileName;
        }
        return super.rootFileName;
    }

    override set rootFileName(fileName: string | undefined) {
        super.rootFileName = fileName;
    }

    override copyTo(item: ITreeItem<T>) {
        super.copyTo(item);
        item.setKind(this.getKind());
    }

    /**
     * Creates a deep clone of this item and its children.
     * @returns a new ITreeItem<T> instance with the same structure and data.
     */
    clone(parent?: ITreeItem<T>): ITreeItem<T> {
        const cloned = parent ?
            parent.createItem(this.getTag(), parent) :
            this.createItem(this.getTag());
        // copy data
        this.copyTo(cloned);
        // Clone children recursively
        for (const child of this.getChildren()) {
            cloned.addChild(child.clone(cloned));
        }
        return cloned;
    }
}

/**
 * Class with default non-generic implementation of ITreeItem interface
 */
export class CTreeItem extends GenericTreeItem<CTreeItem> {
    constructor(tag?: string, parent?: ITreeItem<CTreeItem>) {
        super(tag, parent);
    }

    override createItem(tag?: string, parent?: CTreeItem): CTreeItem {
        return new CTreeItem(tag, parent);
    }

    override createChild(tag?: string, checkIfExists?: boolean, insertAt?: number): CTreeItem {
        return super.createChild(tag, checkIfExists, insertAt) as CTreeItem;
    }

    getChildItem(tag?: string): CTreeItem | undefined {
        return this.getChild(tag) as CTreeItem;
    }

    getParentItem(tag?: string): CTreeItem | undefined {
        return this.getParent(tag) as CTreeItem;
    }
}

// end of tree-item.ts
