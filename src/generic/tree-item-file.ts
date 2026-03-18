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

import { CTreeItem } from './tree-item';
import { ITreeItemBuilder } from './tree-item-builder';
import { ITextFile, TextFile } from './text-file';
import { ITreeItemParser } from './tree-item-parser';
import { CTreeItemYamlParser } from './tree-item-yaml-parser';
import { CTreeItemJsonParser } from './tree-item-json-parser';
import { CTreeItemXmlParser } from './tree-item-xml-parser';

/**
 * Interface for tree item file abstraction.
 */
export interface ITreeItemFile extends ITextFile {
    /**
     * Gets the root tree item.
     */
    get rootItem(): CTreeItem | undefined;
    /**
     * Sets the root tree item.
     */
    set rootItem(root: CTreeItem | undefined);

    /**
     * Creates root item if not exists
     * @see rootItem
     */
    ensureRootItem() : CTreeItem;

    /**
     * Gets the top tree item (first child of root).
     */
    get topItem(): CTreeItem | undefined;

    /**
     * Creates root item and top if not exists
     * @param tag optional tag for top item
     * @see topItem
     */
    ensureTopItem(tag? : string): CTreeItem;
}

/**
 * Generic tree item file class for handling tree-structured files.
 */
export class CTreeItemFile extends TextFile implements ITreeItemFile {

    /**
     * Constructs a CTreeItemFile.
     * @param fileName Optional file name.
     * @param parser Optional tree item parser.
     */
    constructor(fileName?: string, parser?:  ITreeItemParser<CTreeItem>) {
        super(fileName ? fileName : '', parser);
    }

    /**
     * Gets the parser for this file.
     */
    public get parser(): ITreeItemParser<CTreeItem> | undefined {
        return this.textParser as ITreeItemParser<CTreeItem>;
    }

    /**
     * Sets the parser for this file.
     */
    public set parser(parser: ITreeItemParser<CTreeItem>) {
        this.textParser = parser;
    }

    /**
     * Gets the builder for this file.
     */
    get builder(): ITreeItemBuilder<CTreeItem> | undefined {
        return this.parser?.builder;
    }

    /**
     * Sets the builder for this file.
     */
    set builder(itemBuilder: ITreeItemBuilder<CTreeItem>) {
        if (this.parser) {
            this.parser.builder = itemBuilder;
        }
    }

    /**
     * Gets the file name.
     */
    public override get fileName(): string {
        return super.fileName;
    }

    /**
     * Sets the file name and updates the builder's file name if present.
     */
    public override set fileName(value: string) {
        if (value !== this.fileName) {
            super.fileName = value;
            if (this.builder) {
                this.builder.fileName = value;
            }
        }
    }

    /**
     * Parses the file content and sets the file name property on the root item.
     * @returns The root CTreeItem.
     */
    public override parse(): CTreeItem {
        const root = super.parser?.parse(this.text) as CTreeItem;
        if (root) {
            root.rootFileName = this.fileName;
        }
        return root;
    }

    /**
     * Gets the content as a CTreeItem.
     */
    public override get content(): CTreeItem | undefined {
        return super.content as CTreeItem;
    }

    public override set content(content: CTreeItem | undefined) {
        super.content = content;
    }


    /**
     * Gets the object representation of the root item.
     */
    public override get object(): object {
        return this.rootItem ? this.rootItem.toObject() as object : {};
    }

    /**
     * Gets the root tree item.
     */
    public get rootItem(): CTreeItem | undefined {
        return this.content;
    }

    /**
     * Sets the root tree item.
     */
    public set rootItem(item: CTreeItem | undefined) {
        this.contentObject = item;
    }

    /**
     * Creates root item if not exists
     * @see rootItem
     */
    public ensureRootItem(): CTreeItem {
        if (!this.rootItem) {
            this.builder?.clear(); // needs to be cleared so that createRoot() is called
            this.rootItem = this.builder?.createItem('') as CTreeItem;
        }
        return this.rootItem;
    }

    /**
     * Gets the top tree item (first child of root).
     */
    public get topItem(): CTreeItem | undefined {
        return this.rootItem?.getChildItem();
    }

    /**
     * Creates root item and top if not exists
     * @param tag optional tag for top item
     * @see topItem
     */
    public ensureTopItem(tag? : string): CTreeItem {
        return this.ensureRootItem().createChild(tag, true);
    }
}

/**
 * Tree item file class for YAML files.
 */
export class CTreeItemYamlFile extends CTreeItemFile {
    /**
     * Constructs a CTreeItemYamlFile.
     * @param fileName Optional file name.
     * @param parser Optional YAML parser.
     */
    constructor(fileName?: string, parser?: ITreeItemParser<CTreeItem>) {
        super(fileName ? fileName : '',
            parser ? parser : new CTreeItemYamlParser());
    }
}

/**
 * Tree item file class for JSON files.
 */
export class CTreeItemJsonFile extends CTreeItemFile {
    /**
     * Constructs a CTreeItemJsonFile.
     * @param fileName Optional file name.
     * @param parser Optional JSON parser.
     */
    constructor(fileName?: string, parser?: ITreeItemParser<CTreeItem>) {
        super(fileName ? fileName : '',
            parser ? parser : new CTreeItemJsonParser());
    }
}

/**
 * Tree item file class for XML files.
 */
export class CTreeItemXmlFile extends CTreeItemFile {
    /**
     * Constructs a CTreeItemXmlFile.
     * @param fileName Optional file name.
     * @param parser Optional XML parser.
     */
    constructor(fileName?: string, parser?: ITreeItemParser<CTreeItem>) {
        super(fileName ? fileName : '',
            parser ? parser : new CTreeItemXmlParser());
    }
}
