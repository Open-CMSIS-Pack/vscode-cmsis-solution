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

import 'jest';
import { textDocumentFactory } from '../../vscode-api/text-document.factories';
import { createReferenceLinkProvider } from './reference-link-provider';
import { URI as Uri, Utils as UriUtils } from 'vscode-uri';
import * as path from 'path';

describe('createReferenceLinkProvider', () => {
    it('returns no links if the document cannot be parsed', () => {
        const unparsableDoc = `
            notMe:
                - Listing
                - Things
            nothing:
                animal: cat
        `;

        const textDocument = textDocumentFactory();
        textDocument.getText.mockReturnValue(unparsableDoc);

        const provider = createReferenceLinkProvider({ referenceNode: 'sublayer', parentNode: 'layer', listNode: 'sublayers' });
        const output = provider.provideDocumentLinks(textDocument, { isCancellationRequested: false, onCancellationRequested: jest.fn() });

        expect(output).toEqual([]);
    });

    it('returns links for link nodes that can be parsed', () => {
        const parsableDoc = `
            layer:
                sublayers:
                    - sublayer: ./file1.sublayer.yml
                    - sublayer: ./file2.sublayer.yml
        `;

        const documentUri = Uri.file(path.join(__dirname, 'my.clayer.yml'));
        const textDocument = textDocumentFactory({ uri: documentUri });
        textDocument.getText.mockReturnValue(parsableDoc);

        const provider = createReferenceLinkProvider({ referenceNode: 'sublayer', parentNode: 'layer', listNode: 'sublayers' });
        const output = provider.provideDocumentLinks(textDocument, { isCancellationRequested: false, onCancellationRequested: jest.fn() });

        expect(output).toEqual([
            expect.objectContaining({ target: UriUtils.joinPath(documentUri, '../file1.sublayer.yml') }),
            expect.objectContaining({ target: UriUtils.joinPath(documentUri, '../file2.sublayer.yml') }),
        ]);
    });
});
