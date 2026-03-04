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

import * as fsUtils from '../utils/fs-utils';
import { CTreeItem, ETreeItemKind, ITreeItem } from './tree-item';
import { CTreeItemBuilder, ITreeItemBuilder } from './tree-item-builder';
import { GenericTreeItemParser } from './tree-item-parser';
import { visit, JSONVisitor, JSONPath, ParseErrorCode, printParseErrorCode } from 'jsonc-parser';
import { getIndentString } from '../utils/string-utils';

export function getJsonIndentString(level: number) {
    return getIndentString(level, 4);
}

function addComments(indent: string, comments?: string[]): string {
    let output = '';
    if (comments && comments.length > 0) {
        comments.forEach(comment => {
            output += indent + comment + '\n';
        });
    }
    return output;
}

function isPlain<T extends ITreeItem<T>>(item?: ITreeItem<T>): boolean {
    if (item) {
        return (item.getProperty('scalarType') as string) === 'PLAIN';
    }
    return true; // no quotes on null item
}

function isEol<T extends ITreeItem<T>>(item?: ITreeItem<T>): boolean {
    if (item) {
        return !(item.getProperty('eol') === false);
    }
    return false; // no EOL on null item
}

function quoteString(input: string, plain?: boolean): string {
    if (plain) {
        return input;
    }
    return JSON.stringify(input);
}

/**
 * Creates a JSON string representation with indentation.
 * @param item The tree item to convert to a JSON string.
 * @param level The current indentation level.
 * @returns The formatted JSON string representation of the tree.
 */
export function toJsonString<T extends ITreeItem<T>>(item: ITreeItem<T>, level: number = 0, comma: boolean = false): string {
    const indent = getJsonIndentString(level);

    const children = item.getChildren();
    const text = item.getText();
    const tag = item.getTag() ?? '';

    let output = addComments(indent, item.getProperty('commentsBefore') as string[]);

    output += indent;
    if (tag && tag !== '-') {
        output += quoteString(tag) + ': ';
    }
    const kind = item.getKind();
    if (kind === ETreeItemKind.Scalar || text !== undefined) {
        output += quoteString(text ?? '', isPlain(item));
    } else if (children.length > 0) {
        if (kind === ETreeItemKind.Sequence) {
            output += '[\n';
        } else if (kind === ETreeItemKind.Map) {
            output += '{\n';
        }
        for (let i = 0; i < children.length; i++) {
            const lastElement = (i === (children.length - 1));
            output += toJsonString(children[i], level + 1, !lastElement);
        }
        if (kind === ETreeItemKind.Sequence) {
            output += indent + ']';
        } else if (kind === ETreeItemKind.Map) {
            output += indent + '}';
        }
    } else {
        if (kind === ETreeItemKind.Sequence) {
            output += '[]';
        } else if (kind === ETreeItemKind.Map) {
            output += '{}';
        }
    }
    if (comma) {
        output += ',';
    }
    const inlineComment = item.getProperty('comment') as string;
    if (inlineComment) {
        output += ' ' + inlineComment;
    }
    if (isEol(item)) {
        output += '\n';
    }
    output += addComments(indent, item.getProperty('commentsAfter') as string[]);
    return output;
}

export class GenericTreeItemJsonParser<T extends ITreeItem<T>> extends GenericTreeItemParser<T> {
    protected comments: string[] = [];
    protected creationStack: ITreeItem<T>[] = [];
    protected lineToItem = new Map<number, ITreeItem<T>>;
    /**
     * Tracks whether a trailing comma was encountered in the JSON structure.
     * This is crucial for distinguishing between an empty continuation and a legitimate object/array end.
     */
    protected comma = false;

    constructor(builder: ITreeItemBuilder<T>) {
        super(builder);
    }

    protected override parseInput(input: string): ITreeItem<T> | undefined {
        this.clearErrors();
        this.comments = [];
        this.lineToItem.clear();

        this.createItem('', 0);
        this.doParse(input);
        this.postCreateItem();
        const root = this.builder.root;
        if (!input.endsWith('\n')) {
            root?.setProperty('eol', false);
        }
        if (this.errors.length > 0) {
            return undefined;
        }
        return root;
    }

    protected pushCurrent() {
        if (this.builder.current) {
            this.creationStack.push(this.builder.current);
        }
    }

    protected popCurrent(): boolean {
        const current = this.creationStack.pop();
        if (!current) {
            return false;
        }
        if (this.comma) {
            // nothing has been created after comma
            this.comma = false;
            return false;
        }
        return !!current.getText() || current.getChildren().length > 0;
    }

    protected createItem(tag: string, startLine: number, kind: ETreeItemKind = ETreeItemKind.Map) {
        this.comma = false;
        this.builder.preCreateItem();
        const item = this.builder.createItem(tag, kind);
        this.lineToItem.set(startLine, item);

        if (this.comments.length > 0) {
            this.builder.setProperty('commentsBefore', this.comments);
            this.comments = [];
        }
    }

    protected postCreateItem() {
        if (this.comments.length > 0) {
            this.builder.setProperty('commentsAfter', this.comments);
            this.comments = [];
        }
        this.builder.postCreateItem();
    }

    protected doParse(input: string) {
        // Use visitor pattern to build tree structure
        const visitor: JSONVisitor = {
            onObjectBegin: (_offset: number, _length: number, startLine: number, _startCharacter: number, _pathSupplier: () => JSONPath) => {
                // assume object has no content yet
                this.pushCurrent();
                // create an item for an element array, for cases onObjectProperty creates a new item
                if (this.builder.getKind() === ETreeItemKind.Sequence) {
                    this.createItem('-', startLine);
                } else {
                    this.builder.setKind(ETreeItemKind.Map); // assume it is a map
                }
                // for other cases onObjectProperty creates a new item
            },

            onObjectEnd: (_offset: number, _length: number, _startLine: number, _startCharacter: number) => {
                if (this.popCurrent()) {
                    this.postCreateItem();
                }
            },

            onObjectProperty: (property: string, _offset: number, _length: number, startLine: number, _startCharacter: number, _pathSupplier: () => JSONPath) => {
                // Note: We set kind to Scalar here because onObjectProperty is called before onObjectBegin.
                // The kind will be updated to Map in onObjectBegin, as per the visitor call sequence defined by jsonc-parser.
                // This relies on the parser always calling onObjectBegin after onObjectProperty for object properties.
                this.createItem(property, startLine, ETreeItemKind.Scalar);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onLiteralValue: (value: any, _offset: number, _length: number, startLine: number, _startCharacter: number, _pathSupplier: () => JSONPath) => {
                if (this.builder.getKind() === ETreeItemKind.Sequence) {
                    this.createItem('-', startLine);
                }
                // scalar
                const str = String(value);
                if (typeof value !== 'string') {
                    this.builder.setProperty('scalarType', 'PLAIN');
                }
                this.builder.setText(str);
                this.builder.setKind(ETreeItemKind.Scalar);
            },

            onArrayBegin: (_offset: number, _length: number, startLine: number, _startCharacter: number, _pathSupplier: () => JSONPath) => {
                this.pushCurrent();
                if (this.builder.getKind() === ETreeItemKind.Sequence) {
                    this.createItem('-', startLine);
                }
                this.builder.setKind(ETreeItemKind.Sequence);
            },

            onArrayEnd: (_offset: number, _length: number, _startLine: number, _startCharacter: number) => {
                if (this.popCurrent()) {
                    this.postCreateItem();
                }
            },

            onSeparator: (character: string, _offset: number, _length: number, _startLine: number, _startCharacter: number) => {
                if (!this.comma && character === ',') {
                    this.postCreateItem();
                    this.comma = true;
                }
            },

            onComment: (offset: number, length: number, startLine: number, _startCharacter: number) => {
                // Comments can be extracted from the original input using offset and length
                const commentText = input.substring(offset, offset + length);
                const item = this.lineToItem.get(startLine);
                if (item) {
                    item.setProperty('comment', commentText);
                } else {
                    this.comments.push(commentText);
                }
            },

            onError: (errorCode: ParseErrorCode, _offset: number, _length: number, startLine: number, startCharacter: number) => {
                const filename = this.builder?.fileName ?? '';
                const err = `${filename}:${startLine + 1}:${startCharacter + 1}: ${printParseErrorCode(errorCode)}`;
                this.addError(err);
            }
        };

        visit(input, visitor);
    }

    public toString(root?: ITreeItem<T>): string {
        if (root) {
            return toJsonString(root);
        }
        return '';
    }
}

export class CTreeItemJsonParser extends GenericTreeItemJsonParser<CTreeItem> {
    constructor(builder?: CTreeItemBuilder) {
        super(builder ? builder : new CTreeItemBuilder());
    }
}

export const parseJsonToCTreeItem = (input: string, fileName?: string): ITreeItem<CTreeItem> | undefined => {
    if (!input && fileName && fsUtils.fileExists(fileName)) {
        input = fsUtils.readTextFile(fileName);
    }
    const parser = new CTreeItemJsonParser(new CTreeItemBuilder(fileName));
    return parser.parse(input);
};
