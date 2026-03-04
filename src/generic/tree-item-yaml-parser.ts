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
import * as fsUtils from '../utils/fs-utils';
import { CTreeItem, ITreeItem, ETreeItemKind } from './tree-item';
import { CTreeItemBuilder, ITreeItemBuilder } from './tree-item-builder';
import { GenericTreeItemParser } from './tree-item-parser';


export type YamlComments = {
    comment: string | undefined | null;
    commentBefore: string | undefined | null;
    spaceBefore: boolean | undefined | null;
}

export class GenericTreeItemYamlParser<T extends ITreeItem<T>> extends GenericTreeItemParser<T> {
    yamlDocument?: YAML.Document;
    useAttributes?: boolean;
    /**
     * YAML schema used to save the document.
     * It is set to 'core' by default, but ensures all strings are plain
     */
    protected plainSchema = GenericTreeItemYamlParser.createPlainSchema();
    protected previousSpaceBefore: boolean = false;

    constructor(builder: ITreeItemBuilder<T>, useAttributes?: boolean) {
        super(builder);
        this.useAttributes = useAttributes;
    }

    protected storeComments(treeItem: ITreeItem<T>, node: YAML.Node | YAML.Document, keyNode?: YAML.Node) {
        const nodeComments =  this.getCommentsFromNode(node, this.previousSpaceBefore);
        if (nodeComments && nodeComments.spaceBefore && YAML.isScalar(node) && !node.value) {
            // workaround YAML parser bug: shift empty line (spaceBefore) to the next level
            this.previousSpaceBefore = true;
            nodeComments.spaceBefore = undefined;
        } else {
            this.previousSpaceBefore = false;
        }
        if (nodeComments) {
            treeItem.setProperty('comments', nodeComments);
        }
        const keyComments = this.getCommentsFromNode(keyNode);
        if (keyComments) {
            treeItem.setProperty('keyComments', keyComments);
        }
    }

    protected getCommentsFromNode(node?: YAML.Node | YAML.Document, previousSpace? : boolean): YamlComments | undefined {
        if (!node) {
            return undefined;
        }
        const nodeComments: YamlComments = {
            comment: node.comment,
            commentBefore: node.commentBefore,
            spaceBefore: (previousSpace === true) || (YAML.isNode(node) ? node.spaceBefore : undefined),
        };
        return (nodeComments.comment || nodeComments.commentBefore || nodeComments.spaceBefore) ? nodeComments : undefined;
    }

    protected addCommentsToNodeOrDocument(node: YAML.Node | YAML.Document, nodeComments?: YamlComments): void {
        node.comment = nodeComments?.comment ?? node.comment;
        node.commentBefore = nodeComments?.commentBefore ?? node.commentBefore;
    }

    protected addCommentsToNode(node: YAML.Node, nodeComments?: YamlComments): YAML.Node {
        this.addCommentsToNodeOrDocument(node, nodeComments);
        node.spaceBefore = nodeComments?.spaceBefore ?? node.spaceBefore;
        return node;
    }

    protected parseDocument(input: string): YAML.Document {
        return YAML.parseDocument(input);
    }

    protected override parseInput(input: string): ITreeItem<T> | undefined {
        this.yamlDocument = this.parseDocument(input);
        if (this.yamlDocument.errors.length > 0) {
            // Report errors
            const fileName = this.builder?.fileName ?? '';
            for (const err of this.yamlDocument.errors) {
                // YAMLError has properties: message, linePos (array of [line, col]), name, etc.
                const line = err.linePos?.[0]?.line ?? 0;
                const col = err.linePos?.[0]?.col ?? 0;
                const errorString = `${fileName}:${line}:${col}: ${err.message}`;
                this.addError(errorString);
            }
            // Continue parsing despite errors to maximize data recovery
        }

        // parse to ITreeItem
        this.parseNode(this.yamlDocument.contents as YAML.YAMLMap, '');
        // store document comments in root item
        const rootItem = this.rootItem;
        if (rootItem) {
            this.storeComments(rootItem, this.yamlDocument);
        }
        return rootItem;
    }

    protected parseNode(node: YAML.Node, tag: string, keyNode?: YAML.Node): void {
        this.builder.preCreateItem();
        const treeItem = this.builder.createItem(tag);
        this.storeComments(treeItem, node, keyNode);
        if (YAML.isScalar(node)) {
            this.parseScalar(node, treeItem);
        } else if (YAML.isMap(node)) {
            treeItem.setKind(ETreeItemKind.Map);
            this.parseMap(node);
        } else if (YAML.isSeq(node)) {
            treeItem.setKind(ETreeItemKind.Sequence);
            this.parseSequence(node);
        }
        this.builder.postCreateItem();
    }

    protected parseScalar(node: YAML.Scalar, treeItem: ITreeItem<T>): void {
        treeItem.setProperty('scalarType', node.type);
        treeItem.setKind(ETreeItemKind.Scalar);
        if (node.value !== null && node.value !== undefined) {
            const text = node.source ? node.source : node.toString();
            treeItem.setText(text);
        }
    }

    protected parseMap(node: YAML.YAMLMap<unknown>): void {
        for (const item of node.items) {
            const key = item.key as YAML.Scalar;
            const value = item.value;
            if (this.useAttributes && YAML.isScalar(value)) {
                this.builder!.setAttribute(key.toString(), value.toString());
            } else {
                this.parseNode(value as YAML.Node<unknown>, key.toString(), key);
            }
        }
    }

    protected parseSequence(node: YAML.YAMLSeq): void {
        for (const item of node.items) {
            this.parseNode(item as YAML.Node, '-');
        }
    }

    public toYamlNode(item: ITreeItem<T>): YAML.Node {
        return this.addCommentsToNode(this.createYamlNode(item), item.getProperty('comments') as YamlComments);
    }

    protected createYamlNode(item: ITreeItem<T>): YAML.Node {
        switch (item?.getKind()) {
            case ETreeItemKind.Scalar:
                return this.toYamlScalar(item);
            case ETreeItemKind.Sequence:
                return this.toYamlSequence(item);
            case ETreeItemKind.Map:
            case ETreeItemKind.Undefined:
            default: // treat default as map
                return this.toYamlMap(item);
        }
    }

    protected toYamlScalar(item: ITreeItem<T>): YAML.Node {
        const text = item.getText();
        const node = new YAML.Scalar(text);
        node.type = (item.scalarType as YAML.Scalar.Type);
        return node;
    }

    protected toYamlSequence(item: ITreeItem<T>): YAML.Node {
        const node = new YAML.YAMLSeq();
        item.getChildren().forEach(child => node.add(this.toYamlNode(child)));
        return node;
    }

    protected toYamlMap(item: ITreeItem<T>): YAML.Node {
        const node = new YAML.YAMLMap();
        item.getAttributes()?.forEach((value, key) => node.set(key, value));
        item.getChildren().forEach(child => node.set(
            this.addCommentsToNode(new YAML.Scalar(child.getTag()), child.getProperty('keyComments') as YamlComments),
            this.toYamlNode(child)));
        return node;
    }

    public toString(root?: ITreeItem<T>) {
        if (root) {
            const yamlNode = this.createYamlNode(root); // comments are added to document
            if (yamlNode) {
                const yamlDoc = new YAML.Document({ defaultKeyType: 'PLAIN', defaultStringType: 'PLAIN', nullStr: '' });
                yamlDoc.schema = this.plainSchema;
                yamlDoc.contents = yamlNode;
                this.addCommentsToNodeOrDocument(yamlDoc, root.getProperty('comments') as YamlComments);
                return yamlDoc.toString({ defaultKeyType: 'PLAIN', defaultStringType: 'PLAIN', nullStr: '' });
            }
        }
        return '';
    }

    static createPlainSchema(): YAML.Schema {
        const schema = new YAML.Schema({ schema: 'core' }).clone();
        schema.tags = schema.tags.map(tag => {
            const suffix = tag.tag.split(':').pop();
            switch (suffix) {
                case 'bool':
                case 'int':
                case 'float':
                    // Redefine the test property for some tags to always return false
                    // that avoids adding double quotes to the plain strings
                    return {
                        ...tag,
                        test: /^$a/
                    } as YAML.ScalarTag;
                default:
                    // Return the tag as-is for other cases
                    return tag;
            }
        });
        return schema;
    };

}

export class CTreeItemYamlParser extends GenericTreeItemYamlParser<CTreeItem> {
    constructor(builder?: CTreeItemBuilder, useAttributes?: boolean) {
        super(builder ? builder : new CTreeItemBuilder(), useAttributes);
    }
}

export const parseYamlToCTreeItem = (input: string, fileName?: string, useAttributes?: boolean): ITreeItem<CTreeItem> | undefined => {
    if (!input && fileName && fsUtils.fileExists(fileName)) {
        input = fsUtils.readTextFile(fileName);
    }
    const parser = new CTreeItemYamlParser(new CTreeItemBuilder(fileName) , useAttributes);
    return parser.parse(input);
};

export const toYamlString = (root?: ITreeItem<CTreeItem>, useAttributes?: boolean): string => {
    if (!root) {
        return '';
    }
    const parser = new CTreeItemYamlParser(new CTreeItemBuilder(), useAttributes);
    return parser.toString(root);
};
