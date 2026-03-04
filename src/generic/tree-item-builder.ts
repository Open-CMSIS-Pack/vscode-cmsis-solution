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

import { CTreeItem, ETreeItemKind, ITreeItem } from './tree-item';

export interface ITreeItemBuilder<T extends ITreeItem<T>> {
    fileName?: string;
    root?: ITreeItem<T>;
    current?: ITreeItem<T>;

    /** Clear internal data
    */
    clear(): void;

    /** create top-level item
     * @param tag item's tag
    */
    createRoot(tag: string): ITreeItem<T>;

    /** create child for given tag and parent
      * @param tag item's tag
    */
    createItem(tag: string, kind?: ETreeItemKind): ITreeItem<T>;

    /** Call to prepare creating a new item */
    preCreateItem(): void;

    /** Call after new item has been fully created*/
    postCreateItem(): void;

    /** Add an attribute to current item
     * @param key attribute key
     * @param value attribute value
    */
    setAttribute(key: string, value: string): void;

    /** Add a text to current item
     * @param text string to set
    */
    setText(text: string): void;

    /** Get current item's kind
     * @return kind current item kind
    */
    getKind(): ETreeItemKind;

    /** Set current item's kind
     * @param kind kind to set
    */
    setKind(kind?: ETreeItemKind): void;

    /** Sets property to the item
     * @param key string key
     * @param value string value or undefined
    */
    setProperty(key: string, value?: unknown): void;
}

export abstract class GenericTreeItemBuilder<T extends ITreeItem<T>> implements ITreeItemBuilder<T> {
    public fileName: string = '';
    public root?: ITreeItem<T>;
    public current?: ITreeItem<T>;
    protected parent?: ITreeItem<T>;
    protected stack: ITreeItem<T>[] = [];

    constructor (fileName? : string) {
        this.fileName = fileName ?? '';
    }

    abstract createRoot(tag: string): ITreeItem<T>;

    clear() {
        this.root = this.current = this.parent = undefined;
        this.stack = [];
    }

    preCreateItem(): void {
        if (this.parent) {
            this.stack.push(this.parent);
        }
        this.parent = this.current;
        this.current = undefined;
    }

    createItem(tag: string, kind?: ETreeItemKind): ITreeItem<T> {
        if (!this.root) {
            this.current = this.root = this.createRoot(tag);
            this.root.rootFileName = this.fileName;
        } else if (this.parent) {
            this.current = this.parent.createChild(tag);
        } else {
            this.current = this.root;
        }
        if (kind) {
            this.setKind(kind);
        }
        return this.current;
    }

    postCreateItem(): void {
        if (this.current && this.current != this.parent) {
            this.current.construct();
        }
        this.current = this.parent;
        this.parent = this.stack.pop();
    }

    setAttribute(key: string, value: string): void {
        if (this.current) {
            this.current.setAttribute(key, value);
        }
    }
    setText(text: string): void {
        if (this.current) {
            // empty text should also be added
            this.current.setText(text);
        }
    }

    getKind(): ETreeItemKind {
        return  this.current ? this.current.getKind() : ETreeItemKind.Undefined;
    }

    setKind(kind: ETreeItemKind): void {
        if (this.current) {
            this.current.setKind(kind);
        }
    }
    setProperty(key: string, value?: unknown): void {
        if (this.current) {
            this.current.setProperty(key, value);
        }
    }

}

export class CTreeItemBuilder extends GenericTreeItemBuilder<CTreeItem> {

    createRoot(tag: string): CTreeItem {
        return new CTreeItem(tag);
    }

}
