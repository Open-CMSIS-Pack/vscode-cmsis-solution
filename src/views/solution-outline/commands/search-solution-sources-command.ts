/**
 * Copyright 2026 Arm Limited
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

import path from 'node:path';
import * as vscode from 'vscode';
import { SEARCH_SOLUTION_SOURCES_COMMAND_ID } from '../../../manifest';
import { SolutionManager } from '../../../solutions/solution-manager';
import { CommandsProvider } from '../../../vscode-api/commands-provider';
import { MessageProvider } from '../../../vscode-api/message-provider';
import { WorkspaceFsProvider } from '../../../vscode-api/workspace-fs-provider';

const escapeGlobLiteral = (value: string): string => value.replace(/[?*[\]{},()]/g, character => {
    // The empty brace expression keeps VS Code's glob-aware comma splitter balanced without matching another character.
    return character === '{' ? '[{]{}' : `[${character}]`;
});

export const encodeSearchFileInclude = (fileName: string): string => {
    const normalizedPath = path.normalize(fileName).replace(/\\/g, '/');
    const basenameStart = normalizedPath.lastIndexOf('/') + 1;
    const directory = escapeGlobLiteral(normalizedPath.substring(0, basenameStart));
    const basename = normalizedPath.substring(basenameStart);

    if (!basename) {
        return directory;
    }

    const firstCharacter = escapeGlobLiteral(basename[0]);
    const literalFirstCharacter = firstCharacter === basename[0] ? `{${firstCharacter}}` : firstCharacter;
    return `${directory}${literalFirstCharacter}${escapeGlobLiteral(basename.substring(1))}`;
};

export class SearchSolutionSourcesCommand {
    public static readonly commandId = SEARCH_SOLUTION_SOURCES_COMMAND_ID;

    constructor(
        private readonly solutionManager: SolutionManager,
        private readonly commandsProvider: CommandsProvider,
        private readonly workspaceFsProvider: WorkspaceFsProvider,
        private readonly messageProvider: MessageProvider,
    ) { }

    public async activate(context: Pick<vscode.ExtensionContext, 'subscriptions'>): Promise<void> {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(SearchSolutionSourcesCommand.commandId, this.search, this),
        );
    }

    private async search(): Promise<void> {
        const solution = this.solutionManager.getCsolution();
        if (!solution) {
            await this.messageProvider.showWarningMessage('No active CMSIS solution is available to search.');
            return;
        }

        const sourceFiles = solution.getSourceFiles();
        if (!sourceFiles.length) {
            await this.messageProvider.showWarningMessage('The active CMSIS solution does not contain any searchable source files.');
            return;
        }

        const existingFiles = (await Promise.all(
            sourceFiles.map(async fileName => await this.workspaceFsProvider.isFile(fileName) ? fileName : undefined)
        )).filter((fileName): fileName is string => !!fileName);

        if (!existingFiles.length) {
            await this.messageProvider.showWarningMessage('No existing source files were found for the active CMSIS solution.');
            return;
        }

        const filesToInclude = existingFiles.map(encodeSearchFileInclude).join(', ');
        await this.commandsProvider.executeCommand('workbench.action.findInFiles', {
            filesToInclude,
            triggerSearch: false,
            showIncludesExcludes: true,
        });
    }
}
