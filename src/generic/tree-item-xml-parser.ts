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

import * as fsUtils from '../utils/fs-utils';
import { CTreeItem, ITreeItem } from './tree-item';
import { CTreeItemBuilder, ITreeItemBuilder } from './tree-item-builder';
import { GenericTreeItemParser } from './tree-item-parser';
import { SAXParser } from 'sax-ts';
import { getIndentString } from '../utils/string-utils';

const specialXmlChars: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&apos;': "'",
    '&quot;': '"',
};

export function encodeXmlChars(input: string): string {
    if (!input) {
        return input;
    }

    let result = input;
    for (const [encoded, decoded] of Object.entries(specialXmlChars)) {
        result = result.replaceAll(decoded, encoded);
    }
    return result;
}

function addXmlComments(indent : string,  comments? : string[]): string {
    let output = '';
    if (comments && comments.length > 0) {
        comments.forEach(comment => {
            output += indent + '<!--' + comment as string + '-->\n';
        });
    }
    return output;

}

/**
 * Creates an XML string representation with indentation.
 * @param item The tree item to convert to an XML string.
 * @param level The current indentation level.
 * @returns The formatted XML string representation of the tree.
 */
export function toXmlString<T extends ITreeItem<T>>(item: ITreeItem<T>, level: number = 0): string {
    const indent = getIndentString(level);
    let output = '';
    const metaLines = item.getProperty('meta') as string[];
    if (metaLines) {
        metaLines.forEach(metaLine => {
            output += metaLine + '\n';
        });
    }
    output += addXmlComments(indent, item.getProperty('commentsBefore') as string[]);

    output += indent + '<' + item.getTag();
    item.getAttributes()?.forEach((value, key) => {
        output += ' ' + key + '="' + encodeXmlChars(value) + '"';
    });
    const text = item.getText();
    const children = item.getChildren();
    if (children.length > 0) {
        output += '>\n';
        children.forEach(child => {
            output += toXmlString(child, level + 1);
        });
        output += addXmlComments(indent, item.getProperty('comments') as string[]);
        output += indent + '</' + item.getTag() + '>\n';
    } else if (text) {
        output += '>' + encodeXmlChars(text) + '</' + item.getTag() + '>\n';
    } else {
        output += '/>\n';
    }
    return output;
}


export class GenericTreeItemXmlParser<T extends ITreeItem<T>> extends GenericTreeItemParser<T> {

    protected parser: SAXParser;
    protected metaLines: string[] = []; // leading lines with instructions and doctype
    protected comments: string[] = [];  // comments

    constructor(builder: ITreeItemBuilder<T>, strict: boolean = true, options?: unknown) {
        super(builder);
        this.parser = new SAXParser(strict, options);
        this.setupHandlers();
    }

    protected override parseInput(input: string): ITreeItem<T> | undefined {
        this.metaLines = [];
        try {
            this.parser.write(input).close();
        } catch (error) {
            this.onError(error as Error);
        }
        const root = this.rootItem;
        if (root && this.metaLines.length > 0) {
            root.setProperty('meta', this.metaLines);
            this.metaLines = [];
        }
        return root;
    }

    private setupHandlers(): void {
        this.parser.onerror = this.onError.bind(this);
        this.parser.ontext = this.onText.bind(this);
        this.parser.onopentag = this.onOpenTag.bind(this);
        this.parser.onclosetag = this.onCloseTag.bind(this);
        this.parser.oncomment = this.onComment.bind(this);
        this.parser.onend = this.onEnd.bind(this);
        this.parser.onprocessinginstruction = this.onProcessingInstruction.bind(this);
        this.parser.ondoctype = this.onDocType.bind(this);
    }

    // Handler methods
    protected onError(error: Error): void {
        const fileName = this.builder?.fileName ?? '';
        const msg = error.message.replaceAll('\n', ' ');
        const err = `${fileName}: ${msg}`;
        this.addError(err);
        console.error(err);
    }

    protected onOpenTag(node: { name: string; attributes: Record<string, string> }): void {
        this.builder.preCreateItem();
        const currentItem = this.builder.createItem(node.name);
        Object.entries(node.attributes).forEach(([key, value]) => {
            this.builder.setAttribute(key, value);
        });
        if (this.comments.length > 0) {
            currentItem.setProperty('commentsBefore', this.comments);
            this.comments = [];
        }
    }

    protected onCloseTag(_tagName: string): void {
        if (this.builder.current  && this.comments.length > 0) {
            this.builder.current.setProperty('comments', this.comments);
            this.comments = [];
        }
        this.builder.postCreateItem();
    }

    protected onText(text: string): void {
        this.builder.setText(text);
    }

    protected onComment(comment: string): void {
        this.comments.push(comment);
    }

    protected onEnd(): void {
        // no processing
    }

    protected onProcessingInstruction(node: { name: string; body: string }): void {

        this.metaLines.push('<?' + node.name.trim() + ' ' + node.body.trim() + '?>');
    }

    protected onDocType(doctype: string): void {
        this.metaLines.push('<!DOCTYPE ' + doctype.trim() + '>');
    }

    public toString(root?: ITreeItem<T>) {
        if (root) {
            return toXmlString(root);
        }
        return '';
    }
}

export class CTreeItemXmlParser extends GenericTreeItemXmlParser<CTreeItem> {
    constructor(builder?: CTreeItemBuilder) {
        super(builder ? builder : new CTreeItemBuilder());
    }
}

export const parseXmlToCTreeItem = (input: string, fileName?: string): ITreeItem<CTreeItem> | undefined => {
    if (!input && fileName && fsUtils.fileExists(fileName)) {
        input = fsUtils.readTextFile(fileName);
    }
    const parser = new CTreeItemXmlParser(new CTreeItemBuilder(fileName));
    return parser.parse(input);
};
