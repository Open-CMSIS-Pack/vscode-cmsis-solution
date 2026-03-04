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

import { DocumentSelector, ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import { createReferenceLinkProvider } from './reference-link-provider';

export const solutionSelectors: Readonly<DocumentSelector> = [
    { pattern: '**/*.csolution.yml' },
    { pattern: '**/*.csolution.yaml' },
];

export const projectSelectors: Readonly<DocumentSelector> = [
    { pattern: '**/*.cproject.yml' },
    { pattern: '**/*.cproject.yaml' },
];

export class SolutionLanguageFeaturesProvider {
    constructor(
        private readonly languages: Pick<typeof vscode['languages'], 'registerDocumentLinkProvider'> = vscode.languages,
    ) {}

    public async activate(context: Pick<ExtensionContext, 'subscriptions'>) {
        context.subscriptions.push(
            this.languages.registerDocumentLinkProvider(solutionSelectors, createReferenceLinkProvider({
                parentNode: 'solution',
                listNode: 'projects',
                referenceNode: 'project',
            })),
            this.languages.registerDocumentLinkProvider(projectSelectors, createReferenceLinkProvider({
                parentNode: 'project',
                listNode: 'layers',
                referenceNode: 'layer',
            })),
        );
    }
}
