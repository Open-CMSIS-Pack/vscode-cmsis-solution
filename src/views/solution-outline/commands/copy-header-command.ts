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

type HeaderOrigin = 'api' | 'component';

interface HeaderChoice {
    include: string;
    origins: readonly HeaderOrigin[];
    resourcePaths: readonly string[];
}

interface HeaderQuickPickItem extends vscode.QuickPickItem {
    choice: HeaderChoice;
}

function createHeaderChoices(items: readonly COutlineItem[]): HeaderChoice[] {
    const choicesByInclude = new Map<string, HeaderChoice>();

    for (const item of items) {
        const include = item.getHeader();
        if (!include) {
            continue;
        }
        const origin = item.isApiHeader() ? 'api' : 'component';
        const resourcePath = item.getResourcePath();
        const existingChoice = choicesByInclude.get(include);
        if (!existingChoice) {
            choicesByInclude.set(include, {
                include,
                origins: [origin],
                resourcePaths: resourcePath ? [resourcePath] : [],
            });
            continue;
        }

        const hasOrigin = existingChoice.origins.includes(origin);
        const hasResourcePath = !resourcePath || existingChoice.resourcePaths.includes(resourcePath);
        if (!hasOrigin || !hasResourcePath) {
            choicesByInclude.set(include, {
                ...existingChoice,
                origins: hasOrigin ? existingChoice.origins : [...existingChoice.origins, origin],
                resourcePaths: hasResourcePath
                    ? existingChoice.resourcePaths
                    : [...existingChoice.resourcePaths, resourcePath!],
            });
        }
    }

    return [...choicesByInclude.values()];
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

                if (choices.length === 1) {
                    await this.copy(choices[0].include);
                    return;
                }

                const selectedItem = await this.vscodeWindow.showQuickPick(
                    choices.map(choice => this.createQuickPickItem(choice)),
                    {
                        placeHolder: 'Select a header to copy',
                        matchOnDescription: true,
                    }
                );
                if (selectedItem) {
                    await this.copy(selectedItem.choice.include);
                }
            }, this),
        );
    }

    private createQuickPickItem(choice: HeaderChoice): HeaderQuickPickItem {
        const description = choice.origins
            .map(origin => origin === 'api' ? 'API' : 'Component')
            .join(' · ');
        return {
            label: choice.include,
            description,
            detail: choice.resourcePaths.length > 0 ? choice.resourcePaths.join(' · ') : undefined,
            choice,
        };
    }

    public async copy(header : string): Promise<void> {
        const incText = `#include "${header}"\n`;
        await vscode.env.clipboard.writeText(incText);
    }
}
