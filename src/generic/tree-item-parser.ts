/**
 * Copyright 2024-2026 Arm Limited
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

import { getIndentString } from '../utils/string-utils';
import { ErrorList } from './error-list';
import { ITextParser } from './text-parser';
import { ITreeItem } from './tree-item';
import { ITreeItemBuilder } from './tree-item-builder';

export interface ITreeItemParser<T extends ITreeItem<T>> extends ITextParser {
    get builder(): ITreeItemBuilder<T>;
    set builder(itemBuilder: ITreeItemBuilder<T>);

    parse(content: string): ITreeItem<T>;

    /** Return root item
     * @return root ITreeItem if parsed successfully
    */
    get rootItem(): ITreeItem<T> | undefined;

    /** Create string representation of the tree
     * @param root root item to convert to string
     * @return formatted string
    */
    toString(root?: ITreeItem<T>): string;
}

/**
 * Creates a tree-like string representation with indentation.
 * @param item The tree item to convert to a string.
 * @param level The current indentation level.
 * @returns The formatted string representation of the tree.
 */
export function toGenericString<T extends ITreeItem<T>>(item: ITreeItem<T>, level: number = 0): string {
    const indent = getIndentString(level);
    let output = indent;
    const tag = item.getTag();
    if (tag) {
        output += tag;
    }

    if (item.getText()) {
        if (output.length > 0) {
            output += ': ';
        }
        output += item.getText();
    }
    if (output.length > 0) {
        output += '\n';
    }

    item.getAttributes()?.forEach((value, key) => {
        output += indent + '  ' + key + '=' + value + '\n';
    });

    item.getChildren().forEach(child => {
        output += toGenericString(child, level + 1);
    });

    return output;
}

export class GenericTreeItemParser<T extends ITreeItem<T>> extends ErrorList implements ITreeItemParser<T> {
    private _builder: ITreeItemBuilder<T>;
    constructor(builder: ITreeItemBuilder<T>) {
        super();
        this._builder = builder;
    }

    get builder(): ITreeItemBuilder<T> {
        return this._builder;
    }
    set builder(itemBuilder: ITreeItemBuilder<T>) {
        this._builder = itemBuilder;
    }

    public parse(text: string): ITreeItem<T>  {
        this.builder.clear();
        const rootItem = this.parseInput(text);
        if (!rootItem) {
            return this.builder.createItem(''); // create default root item
        }
        return rootItem;
    }

    public stringify(obj: T): string {
        return this.toString(obj);
    }

    public get rootItem(): ITreeItem<T> | undefined {
        return this.builder?.root;
    }

    /**
     * Parse input string and create tree items
     * @param input input string to parse
     */
    protected parseInput(input: string): ITreeItem<T> | undefined {
        if (input) {
            const root = this.builder.createItem(''); // create default root item
            root.setText(input);
            return root;
        }
        return undefined;
    }

    /**
     * Generic implementation creates tree-like string representation with indentation
     * @param root root item to convert to string
     * @returns formatted string
     */
    public toString(root?: ITreeItem<T>): string {
        if (!root) {
            return '';
        }
        return toGenericString(root, 0);
    }
}
