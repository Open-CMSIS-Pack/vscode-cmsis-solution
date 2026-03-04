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

import path from 'node:path';
import { cloneDeep } from 'lodash';

/**
 * Generic attributed item interface with dynamic properties and map of string attributes
*/
export interface IAttributedItem {

    /** Construct items's internal structures */
    construct(): void;

    /** clear the item */
    clear(): void;

    /** Returns item attributes
    * @param create flag to create the property if not exists
    * @returns map or undefined
   */
    getAttributes(create?: boolean): Map<string, string> | undefined;

    /** Returns attribute value matching specified key or the first attribute
     * @param key string (the first key is used if not specified)
     * @returns string or undefined
    */
    getAttribute(key?: string): string | undefined;

    /** Returns item value matching specified key or the first one
     * @param key string (the first key is used if not specified)
     * @returns string or undefined
    */
    getValue(key?: string): string | undefined;

    /** Returns the first item's key-value pair
     * @returns array of two strings
    */
    getKeyValue(): [string, string];

    /** Returns item's value matching one of the specified key
     * @param keys array of keys/child tags
     * @returns string or undefined
    */
    getValueForOneOfKeys(keys: string[]): string | undefined;

    /** Returns item's value matching specified key or default is the key not found
     * @param keyOrTag string attribute key or child's tag
     * @param defaultValue default string value returned if tem dose not have one, '' if not specified
     * @returns string or defaultValue
    */
    getValueAsString(keyOrTag?: string, defaultValue?: string): string;


    /** Sets attribute value for specified key, remove entry if value is undefined
     * @param key string key
     * @param value string value or undefined
     * @returns this as IAttributedItem
    */
    setAttribute(key: string, value?: string): IAttributedItem;

    /** Sets item value for specified key or tag, remove entry if value is undefined
     * @param keyOrTag string key
     * @param value string value or undefined
     * @returns this as IAttributedItem
    */
    setValue(keyOrTag?: string, value?: string): IAttributedItem;

    /** ReturnSets property to the item
     * @param key string key
     * @param value string value or undefined
     * @returns this as IAttributedItem
    */
    setProperty(key: string, value?: unknown): IAttributedItem;

    /** Get Item's property
     * @param key string key
     * @returns unknown or undefined
    */
    getProperty(key: string): unknown | undefined;


    /** Returns item tag if assigned
     * @returns Item's tag or undefined
    */
    getTag(): string | undefined;

    /** Set item tag
     * @param tag string to set as a tag
     * @returns this as IAttributedItem
    */
    setTag(tag?: string): IAttributedItem;

    /** Returns item text if assigned
     * @returns Item's text ou undefined
    */
    getText(): string | undefined;

    /** Set/unset item text
     * @param text string to set as a text, undefined to unset
     * @returns this as IAttributedItem
    */
    setText(text?: string): IAttributedItem;

    /** Get Item's property
     * @param key string key
     * @returns unknown or undefined
    */
    getProperty(key: string): unknown | undefined;
    /**
     * Checks if item's primary key matches the supplied value
     * @param tagOrValue string tag or value to compare
     * @returns true if tagOrValue matches item's primary key
     * @description Primary key is item's tag or value if tag is not assigned
    */
    matchesPrimaryKey(tagOrValue: string): boolean

    /** Returns item's primary key
     * @returns string or undefined
    */
    getPrimaryKey(): string | undefined;

    /**
     * Copies this item data to the supplied one.
     * @returns A new IAttributedItem instance with the same data.
     */
    copyTo(item: IAttributedItem): void;

    /**
     * Get filename associated with the root item
     * @returns filename as string
    */
    get rootFileName(): string;


    /**
     * Set filename associated with the root item
    */
    set rootFileName(fileName: string | undefined);

    /**
     * Get directory of the file associated with the root item
     * @returns directory as string
     * @see get rootFileName
    */
    get rootFileDir(): string;


    /**
    * Resolves a path relative to the item's root file directory
    * @param pathToResolve path to resolve, relative or absolute or undefined
    * @returns resolved absolute path or empty if pathToResolve is undefined
    */
    resolvePath(pathToResolve: string | undefined): string;
}

/**
 * class implementing generic IAttributedItem interface
 */
export class CAttributedItem implements IAttributedItem {

    protected data: Record<string, unknown> = {};

    constructor(tag?: string) {
        if (tag) {
            this.data.tag = tag;
        }
    }
    /** constructs the item, default implementation does nothing */
    construct(): void {
        // default does nothing
    }

    clear(): void {
        delete this.data.attributes;
    }

    getTag(): string | undefined {
        return this.data.tag as string;
    }

    getText(): string | undefined {
        return this.data.text as string;
    }

    getAttributes(create?: boolean): Map<string, string> | undefined {
        let attrs = this.data.attributes as Map<string, string>;
        if (!attrs && create) {
            attrs = this.data.attributes = new Map();
        }
        return attrs;
    }

    getAttribute(key?: string): string | undefined {
        if (key) {
            return this.getAttributes()?.get(key);
        }
        // return the very first attribute if any
        return this.getAttributes()?.values().next().value;
    }

    getValue(key?: string): string | undefined {
        const value = this.getAttribute(key);
        if (!value && (!key || key === this.getTag())) {
            return this.getText();
        }
        return value;

    }

    getKeyValue(): [string, string] {
        const attributes = this.getAttributes();
        if (attributes) {
            return attributes.entries().next().value ?? ['', ''];
        }
        return [this.getTag() ?? '', this.getValueAsString()];
    }

    getValueAsString(keyOrTag?: string, defaultValue?: string): string {
        const val = this.getValue(keyOrTag);
        if (val) {
            return val;
        }
        return defaultValue ?? '';
    }

    getValueForOneOfKeys(keys: string[]): string | undefined {
        for (const key of keys) {
            const value = this.getValue(key);
            if (value) {
                return value;
            }
        }
        return undefined;
    }

    setAttribute(key: string, value?: string): IAttributedItem {
        if (key) {
            const attributes = this.getAttributes(!!value);
            if (value) {
                attributes!.set(key, value);
            } else if (attributes) {
                attributes.delete(key); // attributes exists if an attribute exists
            }
        }
        return this;
    }

    setValue(keyOrTag?: string, value?: string): IAttributedItem {
        if (!keyOrTag || keyOrTag == this.getTag()) {
            this.setText(value);
        } else {
            this.setAttribute(keyOrTag, value);
        }
        return this;
    }

    setTag(tag: string): IAttributedItem {
        this.data.tag = tag;
        return this;
    }

    setText(text?: string): IAttributedItem {
        this.data.text = text;
        return this;
    }

    getPrimaryKey(): string | undefined {
        const primaryKey = this.getTag();
        if (!primaryKey || primaryKey === '-') {
            return this.getValue();
        }
        return primaryKey;
    }

    matchesPrimaryKey(tagOrValue: string): boolean {
        return tagOrValue ? tagOrValue === this.getPrimaryKey() : false;
    }

    setProperty(key: string, value: unknown): IAttributedItem {
        if (value === null || value === undefined) {
            const props = this.getProperties();
            if (props) {
                delete props[key];
            }
        } else {
            this.getProperties(true)![key] = value;
        }
        return this;
    }

    getProperty(key: string): unknown | undefined {
        return this.getProperties()?.[key];
    }

    protected getProperties(create?: boolean): Record<string, unknown> | undefined {
        let props = this.data.properties as Record<string, unknown>;
        if (!props && create) {
            props = this.data.properties = {};
        }
        return props;
    }

    /**
     * Copy all values of this item, including all attributes, text, tag, and properties to another item.
     */
    copyTo(item: IAttributedItem) {
        // Copy tag
        item.setTag(this.getTag());
        // Copy attributes
        this.getAttributes()?.forEach((value, key) => {
            item.setAttribute(key, value);
        });
        // Copy text
        item.setText(this.getText());
        // Copy properties
        const props = this.getProperties();
        if (props) {
            for (const key of Object.keys(props)) {
                const value = cloneDeep(props[key]);
                item.setProperty(key, value);
            }
        }
    }

    get rootFileName(): string {
        return this.getProperty('fileName') as string;
    }

    set rootFileName(fileName: string | undefined) {
        this.setProperty('fileName', fileName);
    }

    get rootFileDir(): string {
        const fileName = this.rootFileName;
        if (fileName) {
            return path.dirname(fileName);
        }
        return '';
    }

    resolvePath(pathToResolve: string | undefined) {
        if (pathToResolve === undefined) {
            return '';
        }
        return path.resolve(this.rootFileDir, pathToResolve);
    }
}
// end of attributed-item.ts
