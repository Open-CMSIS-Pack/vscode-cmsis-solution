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
import { CMSIS_SOLUTION_OUTPUT_CHANNEL, RUN_GENERATOR_COMMAND_ID } from '../../manifest';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { COutlineItem } from '../../views/solution-outline/tree-structure/solution-outline-item';
import { OutputChannelProvider } from '../../vscode-api/output-channel-provider';
import { CmsisToolboxManager } from '../../solutions/cmsis-toolbox';
import { SolutionManager } from '../../solutions/solution-manager';

interface RunGeneratorRequest {
    generator: string;
    context: string;
}

export class GeneratorCommand {
    public static readonly runGeneratorCommandType = RUN_GENERATOR_COMMAND_ID;

    public constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly solutionManager: SolutionManager,
        private readonly outputChannelProvider: OutputChannelProvider,
        private readonly cmsisToolboxManager: CmsisToolboxManager,
    ) { }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(

            this.commandsProvider.registerCommand(GeneratorCommand.runGeneratorCommandType, async (input: unknown) => {
                const request = this.getRunGeneratorRequest(input);
                if (request) {
                    await this.handleRunGenerator(request.generator, request.context);
                } else {
                    console.error(`Tried to execute ${GeneratorCommand.runGeneratorCommandType} without a generator component`);
                }
            }, this),
        );
    }

    private getRunGeneratorRequest(input: unknown): RunGeneratorRequest | undefined {
        const maybeNode = input as Partial<COutlineItem> & { getAttribute?: (name: string) => string | undefined };
        if (typeof maybeNode?.getAttribute === 'function') {
            if (maybeNode.getAttribute('type') !== 'component-gen') {
                return undefined;
            }

            return {
                generator: maybeNode.getAttribute('generator') ?? '',
                context: maybeNode.getAttribute('cbuild-context') ?? '',
            };
        }

        const maybeRequest = input as Partial<RunGeneratorRequest> | undefined;
        if (typeof maybeRequest?.generator !== 'string' || typeof maybeRequest.context !== 'string') {
            return undefined;
        }

        return {
            generator: maybeRequest.generator,
            context: maybeRequest.context,
        };
    }

    public async handleRunGenerator(generator: string, context: string): Promise<void> {
        const solutionFilePath = this.solutionManager.getCsolution()?.solutionPath;
        if (!solutionFilePath) {
            vscode.window.showErrorMessage('Solution file does not exist');
            return;
        }

        const msg = `Starting generator ${generator} for project ${context}...`;
        vscode.window.showInformationMessage(msg);

        const executableArgs = ['run', solutionFilePath, '-g', generator, '-c', context];
        const outputChannel = this.outputChannelProvider.getOrCreate(CMSIS_SOLUTION_OUTPUT_CHANNEL);
        outputChannel.appendLine(msg);

        const [result] = await this.cmsisToolboxManager.runCmsisTool('csolution', executableArgs, line => outputChannel.appendLine(line.trimEnd()), undefined,
            undefined, true);

        if (result != 0) {
            outputChannel.show();
            vscode.window.showErrorMessage(`Failed to launch Generator ${generator}!`);
        }
    }
}
