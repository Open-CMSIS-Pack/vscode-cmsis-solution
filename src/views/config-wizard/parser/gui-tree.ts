/**
 * Copyright 2026 Arm Limited
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

/*
 * Copyright (C) 2023-2026 Arm Limited
 */

import { Parser } from './parser';
import { TreeNodeElement, GuiTypes } from '../confwiz-webview-common';
import { CwItem } from './cw-item';
import { LogErr, ClearErrors, GetErrors } from './error';


export class GuiTree {
    private index = 0;
    private _itemMap: CwItem[] = [];
    private _cachedLines: string[] | undefined;
    private _cachedDocVersion: number | undefined;

    public get itemMap(): CwItem[] {
        return this._itemMap;
    }
    public addToItemMap(value: CwItem, index: number) {
        this._itemMap[index] = value;
    }
    public getFromItemMap(index: number): CwItem {
        return this._itemMap[index];
    }

    public invalidateCache(): void {
        this._cachedLines = undefined;
        this._cachedDocVersion = undefined;
    }

    private getCachedLines(docText: string, docVersion?: number): string[] {
        // If cache is valid and document version matches, reuse cached lines
        if (this._cachedLines && docVersion !== undefined && docVersion === this._cachedDocVersion) {
            return this._cachedLines;
        }

        // Otherwise, split lines. Only cache if docVersion is defined.
        const lines = docText.split('\n');
        if (docVersion !== undefined) {
            this._cachedLines = lines;
            this._cachedDocVersion = docVersion;
        }
        return lines;
    }

    private createGuiItem(item: CwItem): TreeNodeElement {
        const guiItem: TreeNodeElement = {
            guiId: this.index,
            name: item.getItemText(),
            type: GuiTypes.none,
            group: false,
            children: [],
            value: { value: ', ', readOnly: false },
            newValue: { value: '', readOnly: false }
        };

        return guiItem;
    }

    protected addToTree(item: CwItem, node: TreeNodeElement, lines: string[]): boolean {
        const currentIndex = ++this.index;
        const guiItem = this.createGuiItem(item);

        if (!item.getGuiItem(guiItem)) {
            return false;
        }
        switch (item.getType()) {    // end depth of tree, debug, will be deleted later
            case 'Default':
            case 'Info':
            case 'OptionAssign':
            case 'Range':
            case 'Format':
            case 'MathOperation': {
                const text: string = 'Add sub-object to ' + item.getType();
                LogErr(text, item.lineNo);
                return false;
            }
        }

        guiItem.value = item.getGuiValue(lines); // must be fetched here because of parameter 'lines'
        guiItem.guiId = currentIndex;

        this.addToItemMap(item, currentIndex);
        item.setGuiId(currentIndex);
        node.children?.push(guiItem);
        const children = item.getChildren();
        for (const child of children) {
            this.addToTree(child, guiItem, lines);
        }

        return false;
    }

    public getAll(text: string, docVersion?: number): TreeNodeElement | undefined {
        const startTime = new Date().getTime();

        ClearErrors();

        const lines = this.getCachedLines(text, docVersion);
        const parser = new Parser();
        const rootItem = parser.parse(lines);
        if (rootItem === undefined) {
            return undefined;
        }

        this.index = 0;
        this._itemMap[this.index] = rootItem;
        rootItem.setGuiId(this.index);
        const guiItem = this.createGuiItem(rootItem);
        rootItem.getGuiItem(guiItem);
        guiItem.type = GuiTypes.root;

        const rootNode = guiItem;

        const children = rootItem.getChildren();
        for (const child of children) {
            this.addToTree(child, rootNode, lines);
        }

        const errors = GetErrors();
        if (errors.length) {
            rootNode.errors = errors;
        }

        const elapsedTime = new Date().getTime() - startTime;
        console.log(`ConfigWizard parsing values, took ${elapsedTime / 1000}s`);

        return rootNode;
    }

    public saveElement(docText: string, element: TreeNodeElement, docVersion?: number): boolean {
        if (docText === undefined) {
            return false;
        }

        const lines = this.getCachedLines(docText, docVersion);
        const item = this.getFromItemMap(element.guiId);
        if (item === undefined) {
            return false;
        }

        return item.setGuiValue(lines, element.newValue);
    }
}
