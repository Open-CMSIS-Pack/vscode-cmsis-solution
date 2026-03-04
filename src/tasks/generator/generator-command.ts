/**
 * Copyright 2025-2026 Arm Limited
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

import * as vscode from 'vscode';
import { PACKAGE_NAME, CMSIS_SOLUTION_OUTPUT_CHANNEL } from '../../manifest';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { COutlineItem } from '../../views/solution-outline/tree-structure/solution-outline-item';
import { OutputChannelProvider } from '../../vscode-api/output-channel-provider';
import { CmsisToolboxManager } from '../../solutions/cmsis-toolbox';
import { SolutionManager } from '../../solutions/solution-manager';

export class GeneratorCommand {
    public static readonly runGeneratorCommandType = `${PACKAGE_NAME}.runGenerator`;

    public constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly solutionManager: SolutionManager,
        private readonly outputChannelProvider: OutputChannelProvider,
        private readonly cmsisToolboxManager: CmsisToolboxManager,
    ) { }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(

            this.commandsProvider.registerCommand(GeneratorCommand.runGeneratorCommandType, async (node: COutlineItem) => {
                if (node.getAttribute('type') === 'component-gen') {
                    await this.handleRunGenerator(node.getAttribute('generator') ?? '', node.getAttribute('cbuild-context') ?? '');
                } else {
                    console.error(`Tried to execute ${GeneratorCommand.runGeneratorCommandType} without a generator component`);
                }
            }, this),
        );
    }

    public async handleRunGenerator(generator: string, context: string): Promise<void> {
        const solutionFilePath = this.solutionManager.getCsolution()?.solutionPath;
        if (!solutionFilePath) {
            vscode.window.showErrorMessage('Solution file does not exist');
            return;
        }

        vscode.window.showInformationMessage(`Starting generator ${generator} for context ${context} ...`);

        const executableArgs = ['run', solutionFilePath, '-g', generator, '-c', context];
        const outputChannel = this.outputChannelProvider.getOrCreate(CMSIS_SOLUTION_OUTPUT_CHANNEL);

        const [result] = await this.cmsisToolboxManager.runCmsisTool('csolution', executableArgs, line => outputChannel.appendLine(line.trimEnd()), undefined,
            undefined, true);

        if (result != 0) {
            outputChannel.show();
            vscode.window.showErrorMessage(`Failed to launch Generator ${generator}!`);
        }
    }
}
