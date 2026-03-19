/**
 * Copyright 2025-2026 Arm Limited
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

import * as vscode from 'vscode';
import { CommandsProvider } from '../../../vscode-api/commands-provider';
import { PACKAGE_NAME } from '../../../manifest';
import { SolutionOutlineView } from '../solution-outline';

export class FindCommand {
    public static readonly commandListFind = `${PACKAGE_NAME}.list.find`;

    constructor(
        private readonly commandsProvider: CommandsProvider,
    ) { }

    public async activate(context: Pick<vscode.ExtensionContext, 'subscriptions'>) {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(FindCommand.commandListFind, () => this.listFind(), this),
        );
    }

    private async listFind<T = unknown>(): Promise<Thenable<T>> {
        // on initial request the 'list.find' command isn't initialized internally. Need to focus the outline first.
        await vscode.commands.executeCommand(`${SolutionOutlineView.treeViewId}.focus`);
        return vscode.commands.executeCommand('list.find');
    }

}
