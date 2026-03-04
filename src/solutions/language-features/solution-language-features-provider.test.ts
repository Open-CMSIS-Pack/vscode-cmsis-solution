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

import 'jest';
import { SolutionLanguageFeaturesProvider, projectSelectors, solutionSelectors } from './solution-language-features-provider';
import type { DocumentLink, DocumentLinkProvider } from 'vscode';

describe('SolutionLanguageFeaturesProvider', () => {
    it('registers document link providers for solution and project files on activation', async () => {
        const registerDocumentLinkProvider = jest.fn();
        const provider = new SolutionLanguageFeaturesProvider({ registerDocumentLinkProvider });

        await provider.activate({ subscriptions: [] });

        const expectedLinkProvider: DocumentLinkProvider<DocumentLink> = {
            resolveDocumentLink: expect.any(Function),
            provideDocumentLinks: expect.any(Function),
        };

        expect(registerDocumentLinkProvider).toHaveBeenCalledWith(solutionSelectors, expectedLinkProvider);
        expect(registerDocumentLinkProvider).toHaveBeenCalledWith(projectSelectors, expectedLinkProvider);
    });
});
