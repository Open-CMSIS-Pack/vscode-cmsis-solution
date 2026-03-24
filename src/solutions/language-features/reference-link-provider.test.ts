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
import { ReferenceLinkProvider } from './reference-link-provider';
import { URI as Uri, Utils as UriUtils } from 'vscode-uri';
import * as path from 'path';
import { solutionManagerFactory } from '../solution-manager.factories';
import { SolutionRpcDataMock } from '../solution-rpc-data.factory';
import * as pathUtils from '../../utils/path-utils';

describe('ReferenceLinkProvider', () => {
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

        const provider = new ReferenceLinkProvider(solutionManagerFactory());
        const output = provider.provideDocumentLinks(textDocument, { isCancellationRequested: false, onCancellationRequested: jest.fn() });

        expect(output).toEqual([]);
    });

    it('returns links for link nodes that can be parsed', () => {
        const parsableDoc = `
            project:
                files:
                    - file: ./file1.c
                linker:
                    - script: ./my.sct
                layers:
                    - layer: ./$Board-layer$
        `;

        const documentFileName = path.join(__dirname, 'my.cproject.yml');
        const documentUri = Uri.file(documentFileName);
        const textDocument = textDocumentFactory({ uri: documentUri, fileName: documentFileName });
        textDocument.getText.mockReturnValue(parsableDoc);

        const solutionManager = solutionManagerFactory();
        const csolution = solutionManager.getCsolution();
        jest.spyOn(csolution!, 'actionContext', 'get').mockReturnValue('my.Build+Target');
        const rpcData = solutionManager.getRpcData() as SolutionRpcDataMock;
        rpcData.seedVariables('my.Build+Target', { 'Board-layer': 'mylayer.clayer.yml' });

        const provider = new ReferenceLinkProvider(solutionManager, false);
        const output = provider.provideDocumentLinks(textDocument, { isCancellationRequested: false, onCancellationRequested: jest.fn() });

        expect(output).toEqual([
            expect.objectContaining({ target: expect.objectContaining({ fsPath: UriUtils.joinPath(documentUri, '../file1.c').fsPath }) }),
            expect.objectContaining({ target: expect.objectContaining({ fsPath: UriUtils.joinPath(documentUri, '../my.sct').fsPath }) }),
            expect.objectContaining({ target: expect.objectContaining({ fsPath: UriUtils.joinPath(documentUri, '../mylayer.clayer.yml').fsPath }) }),
        ]);
    });

    it('returns links for cbuild files without expanding RPC variables', () => {
        jest.spyOn(pathUtils, 'getCmsisPackRoot').mockReturnValue('TEST_CMSIS_PACK_ROOT');

        const cbuildDoc = `
            build-idx:
                csolution: ./my.csolution.yml
                cbuilds:
                    - cbuild: ./my/debug/my.cbuild.yml
                      clayers:
                        - clayer: my.clayer.yml
                cprojects:
                    - cproject: my/my.cproject.yml
                      clayers:
                        - clayer: my/$Board-layer$
                files:
                    - file: \${CMSIS_PACK_ROOT}/myPack/0.0.1/myfile.yml
        `;

        const documentFileName = path.join(__dirname, 'my.cbuild-idx.yml');
        const documentUri = Uri.file(documentFileName);
        const textDocument = textDocumentFactory({ uri: documentUri, fileName: documentFileName });
        textDocument.getText.mockReturnValue(cbuildDoc);

        const solutionManager = solutionManagerFactory();
        const provider = new ReferenceLinkProvider(solutionManager, true);
        const output = provider.provideDocumentLinks(textDocument, { isCancellationRequested: false, onCancellationRequested: jest.fn() });
        const outputPaths = output
            .map(link => link.target?.fsPath)
            .filter((target): target is string => !!target);

        const expectedPaths = [
            UriUtils.joinPath(documentUri, '../my.csolution.yml').fsPath,
            UriUtils.joinPath(documentUri, '../my/debug/my.cbuild.yml').fsPath,
            UriUtils.joinPath(documentUri, '../my.clayer.yml').fsPath,
            UriUtils.joinPath(documentUri, '../my/my.cproject.yml').fsPath,
            path.join(path.sep, 'TEST_CMSIS_PACK_ROOT', 'myPack', '0.0.1', 'myfile.yml'),
        ];

        expectedPaths.forEach(expectedPath => {
            expect(outputPaths.some(outputPath => pathUtils.pathsEqual(outputPath, expectedPath))).toBe(true);
        });
    });
});
