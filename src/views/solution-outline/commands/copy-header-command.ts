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

import { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import * as manifest from '../../../manifest';
import { CommandsProvider } from '../../../vscode-api/commands-provider';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import { formatHeaderIncludeForClipboard } from './header-include-formatting';


function createHeaderChoices(items: readonly COutlineItem[]) {
    const choices : string[] = [];

    for (const item of items) {
        const include = item.getHeader();
        if (include) {
            choices.push(include);
        }
    }
    return choices;
}

export class CopyHeaderCommand {
    public static readonly copyHeaderCommandId = `${manifest.PACKAGE_NAME}.copyHeaderFile`;

    constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly vscodeWindow: Pick<typeof vscode.window, 'showQuickPick'> = vscode.window,
    ) { }

    public async activate(context: Pick<ExtensionContext, 'subscriptions'>) {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(CopyHeaderCommand.copyHeaderCommandId, async (node: COutlineItem) => {
                const choices = createHeaderChoices(node.getHeaders());
                if (choices.length === 0) {
                    return;
                }
                const componentName = node.getParentOrThis('component')?.getAttribute('label');

                if (choices.length === 1) {
                    await this.copy(choices[0], componentName);
                    return;
                }
                const origin = componentName ? ` from ${componentName} component` : '';

                const selectedInclude = await this.vscodeWindow.showQuickPick(
                    choices.map(choice => this.createQuickPickItem(choice)),
                    {
                        placeHolder: `Select a header to copy${origin}`,
                    }
                );
                if (selectedInclude) {
                    await this.copy(selectedInclude, componentName);
                }
            }, this),
        );
    }

    private createQuickPickItem(include: string): string {
        return include;
    }

    private async copy(include: string, componentName? :string): Promise<void> {
        const includeText = formatHeaderIncludeForClipboard(include, componentName);
        await vscode.env.clipboard.writeText(includeText);
    }
}
