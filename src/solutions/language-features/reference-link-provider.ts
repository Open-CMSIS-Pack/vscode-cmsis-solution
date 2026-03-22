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

import { CancellationToken, DocumentLink, DocumentLinkProvider, Range, TextDocument, Uri } from 'vscode';
import { parseYamlToCTreeItem } from '../../generic/tree-item-yaml-parser';
import { CTreeItem, ETreeItemKind, ITreeItem } from '../../generic/tree-item';
import type { SolutionManager } from '../solution-manager';

/**
 * Provide links for file references in solution and project files.
 */
export class ReferenceLinkProvider implements DocumentLinkProvider<DocumentLink> {
    constructor(
        private readonly solutionManager: SolutionManager,
    ) {
    }

    public provideDocumentLinks(textDocument: TextDocument, _token?: CancellationToken): DocumentLink[] {
        try {
            const topItem = parseYamlToCTreeItem(textDocument.getText(), textDocument.fileName);

            return (topItem?.filterItems(item => this.isReferenceFileItem(item)) ?? [])?.flatMap((item): DocumentLink[] => {
                const documentLink = this.treeItemToDocumentLink(item, textDocument);
                return documentLink ? [documentLink] : [];
            }) ?? [];
        } catch {
            // If we can't parse the document, we can't provide links
            return [];
        }
    }

    public resolveDocumentLink(link: DocumentLink): DocumentLink {
        return link;
    }

    protected isReferenceFileItem(item: ITreeItem<CTreeItem>): item is CTreeItem {
        const tag = item.getTag();
        return !!tag && this.getReferenceItemTags().includes(tag);
    }

    protected getReferenceItemTags(): string[] {
        return ['file', 'layer', 'project', 'script', 'regions'];
    }

    private treeItemToDocumentLink(item: ITreeItem<CTreeItem> | undefined, textDocument: TextDocument) : DocumentLink | undefined {
        const uri = this.getUriFromItem(item);
        if (!uri) {
            return undefined;
        }
        const range = this.rangeFromItem(item, textDocument);
        return {
            range,
            target: uri,
        };
    }


    private getUriFromItem(item?: ITreeItem<CTreeItem>): Uri | undefined {
        if (!item || item.getKind() !== ETreeItemKind.Scalar) {
            return undefined;
        }
        let text = item.getText();
        if (!text) {
            return undefined;
        }
        const rpcData = this.solutionManager.getRpcData();
        const context = this.getItemContext(item);
        if (rpcData && context !== undefined && context !== null) {
            text = rpcData.expandString(text, context);
        }

        const resolvedPath = item.resolvePath(text);
        return resolvedPath ? Uri.file(resolvedPath) : undefined;
    }

    private rangeFromItem(item: ITreeItem<CTreeItem> | undefined, textDocument: TextDocument): Range {
        return new Range(
            textDocument.positionAt(item?.range?.[0] ?? 0),
            textDocument.positionAt(item?.range?.[1] ?? 0),
        );
    }

    private getItemContext(item: ITreeItem<CTreeItem>): string | undefined {
        const csolution = this.solutionManager.getCsolution();
        if (!csolution) {
            return undefined;
        }
        const rootFileName = item.rootFileName;
        let context = undefined;
        if (rootFileName.includes('.cproject.y')) {
            context = csolution.getContextDescriptor(rootFileName)?.displayName;
        }
        return context ?? csolution.actionContext;
    }
}
