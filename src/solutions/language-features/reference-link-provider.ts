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
import { getCmsisPackRoot } from '../../utils/path-utils';

/**
 * Provide links for file references in solution, project, and layer files as well as for *.cbuild*.yml files.
 *
 */
export class ReferenceLinkProvider implements DocumentLinkProvider<DocumentLink> {
    private static readonly REFERENCE_ITEM_TAGS = ['file', 'layer', 'project', 'script', 'regions',
        'solution', 'csolution', 'cbuild', 'clayer', 'cproject'];

    constructor(
        private readonly solutionManager: SolutionManager,
        private readonly cbuildFile?: boolean,
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
        if (!item || item.getKind() !== ETreeItemKind.Scalar || !item.getText())
            return false;
        const tag = item.getTag();
        if (!tag || !this.getReferenceItemTags().includes(tag)) {
            return false;
        }
        // in case of cbuild-ids.yml we can only expand links under 'cbuilds' section
        if (tag === 'clayer' && !item.getParent('cbuilds')) {
            return false;
        }
        // in case of cbuild-ids.yml 'project' under 'cbuilds' is just a name, not path
        if (tag === 'project' && !!item.getParent('cbuilds')) {
            return false;
        }
        return true;
    }

    protected getReferenceItemTags(): string[] {
        return ReferenceLinkProvider.REFERENCE_ITEM_TAGS;
    }

    private treeItemToDocumentLink(item: ITreeItem<CTreeItem>, textDocument: TextDocument): DocumentLink | undefined {
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


    private getUriFromItem(item: ITreeItem<CTreeItem>): Uri | undefined {
        let text = item.getText();
        if (!text) {
            return undefined;
        }

        // generated files can contain references to files in packs directory
        if (text.startsWith('${CMSIS_PACK_ROOT}')) {
            return Uri.file(text.replace('${CMSIS_PACK_ROOT}', getCmsisPackRoot()));
        }
        if (!this.cbuildFile) { // generated files have all sequences expanded
            const rpcData = this.solutionManager.getRpcData();
            const context = this.getItemContext(item);
            if (rpcData && context) {
                text = rpcData.expandString(text, context);
            }
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
