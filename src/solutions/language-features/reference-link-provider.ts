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

import * as YAML from 'yaml';
import { DocumentLink, DocumentLinkProvider, TextDocument, Uri } from 'vscode';
import { readMapFromMap, readSeqFromMap, requireMap } from '../parsing/yaml-file-parsing';
import { rangeFromYamlNode } from './yaml-range';

export type ReferenceLinkProviderOptions = {
    /**
     * Name of the root node for the YAML file, e.g., solution.
     */
    parentNode: string;

    /**
     * Name of the node containing the list of linkable references, e.g., projects.
     */
    listNode: string;

    /**
     * Name of the node on the linkable reference, e.g., project.
     */
    referenceNode: string;
}

const projectNodeToDocumentLink = (
    textDocument: TextDocument,
    options: ReferenceLinkProviderOptions,
    projectNode: YAML.YAMLMap,
): DocumentLink | undefined => {
    const projectScalar = projectNode.get(options.referenceNode, true);

    if (projectScalar && typeof projectScalar.value === 'string') {
        return {
            range: rangeFromYamlNode(textDocument, projectScalar),
            target: Uri.joinPath(textDocument.uri, '..', projectScalar.value),
        };
    }

    return undefined;
};

/**
 * Provide links for file references in solution and project files.
 */
export const createReferenceLinkProvider = (options: ReferenceLinkProviderOptions): DocumentLinkProvider<DocumentLink> => ({
    provideDocumentLinks: (textDocument: TextDocument): DocumentLink[] => {
        try {
            const yamlDocument = YAML.parseDocument(textDocument.getText());
            const root = requireMap(yamlDocument.contents);
            const parent = readMapFromMap(options.parentNode)(root);
            const list = readSeqFromMap(options.listNode)(parent);
            const itemMaps = list.items.filter(YAML.isMap);

            return itemMaps.flatMap((projectNode): DocumentLink[] => {
                const documentLink = projectNodeToDocumentLink(textDocument, options, projectNode);
                return documentLink ? [documentLink] : [];
            });
        } catch {
            // If we can't parse the document, we can't provide links
            return [];
        }
    },
    resolveDocumentLink: (link: DocumentLink): DocumentLink => link,
});
