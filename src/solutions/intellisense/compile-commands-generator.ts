/**
 * Copyright 2022-2026 Arm Limited
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
import { ExtensionContext } from 'vscode';
import * as manifest from '../../manifest';
import { BuildTaskDefinitionBuilder } from '../../tasks/build/build-task-definition-builder';
import { BuildTaskProvider } from '../../tasks/build/build-task-provider';
import { SolutionEventHub } from '../solution-event-hub';
import { getToolsSeverity } from '../solution-problems';
import { OutputChannelProvider } from '../../vscode-api/output-channel-provider';

export class CompileCommandsGenerator {
    constructor(
        private readonly buildTaskProvider: BuildTaskProvider,
        private readonly buildTaskDefinitionBuilder: BuildTaskDefinitionBuilder,
        private readonly eventHub: SolutionEventHub,
        private readonly outputChannelProvider: OutputChannelProvider,
    ) {
    }

    public activate(context: ExtensionContext) {
        context.subscriptions.push(
            this.eventHub.onDidCbuildSetupRequested(() => {
                // fire-and-forget: completion is reported via onDidCbuildCompleted
                void this.runCbuildSetup();
            }),
        );
    }

    private readonly outputRegex = /\b(?:completed|failed)\s+with\s+exit\s+code\s*([+-]?\d+)\b/i;

    private async runCbuildSetup(): Promise<void> {
        const definition = await this.buildTaskDefinitionBuilder.createDefinitionFromUriOrSolutionNode('setup');
        const task = this.buildTaskProvider.createTask(definition);
        const revealKind = definition.west ? vscode.TaskRevealKind?.Always : vscode.TaskRevealKind?.Silent;
        task.presentationOptions = {
            ...(revealKind !== undefined ? { reveal: revealKind } : {})
        };
        this.outputChannelProvider
            .getOrCreate(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL)
            .appendLine('Launching cbuild setup in Terminal to generate IntelliSense database');
        const execution = await vscode.tasks.executeTask(task);

        return await new Promise<void>((resolve) => {
            const disposable = vscode.tasks.onDidEndTaskProcess((event) => {
                if (event.execution === execution) {
                    disposable.dispose();
                    const output = this.buildTaskProvider.getActiveTaskRunner(task.name)?.getOutputBuffer() ?? [];
                    const match = this.outputRegex.exec(output.join('\n'));
                    const returnCode = match?.[1] !== undefined ? Number(match[1]) :
                        event.exitCode !== undefined ? event.exitCode : -1;
                    const success = returnCode === 0;
                    const severity = success ? getToolsSeverity(output) : 'error';
                    this.eventHub.fireCbuildCompleted({ success, severity, toolsOutputMessages: output });
                    resolve();
                }
            });
        });
    }
}
