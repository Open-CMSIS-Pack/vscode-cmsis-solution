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

import { EventEmitter, ExtensionContext } from 'vscode';
import { PACKAGE_NAME } from '../../manifest';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import * as vscode from 'vscode';
import { BuildTaskProviderImpl } from './build-task-provider';

type buildState = 'idle' | 'building';

interface TaskLifecycle {
    name: string;
    started: boolean;
    processStarted: boolean;
    exitCode?: number;
    stoppedManually?: boolean;
}

export class BuildStopCommand {
    public static readonly stopBuildCommand = `${PACKAGE_NAME}.stopBuild`;
    private readonly eventEmitter = new EventEmitter<void>();
    private readonly taskLifecycles = new Map<string, TaskLifecycle>();

    constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly buildTaskProvider?: { terminateTask(taskName: string): boolean }) {
    }

    public async activate(context: Pick<ExtensionContext, 'subscriptions'>) {
        this.setExecutionState('idle');

        vscode.tasks.onDidStartTask(event => {
            const task = event.execution.task;
            if (!this.isBuildTask(task)) {
                return;
            }

            this.taskLifecycles.set(task.name, {
                name: task.name,
                started: true,
                processStarted: false
            });
        });

        vscode.tasks.onDidStartTaskProcess(event => {
            const task = event.execution.task;
            if (!this.isBuildTask(task)) {
                return;
            }

            const lifecycle = this.taskLifecycles.get(task.name);
            if (lifecycle) {
                lifecycle.processStarted = true;
            }

            this.setExecutionState('building');
        });

        vscode.tasks.onDidEndTaskProcess(event => {
            const task = event.execution.task;
            if (!this.isBuildTask(task)) {
                return;
            }

            const lifecycle = this.taskLifecycles.get(task.name);
            if (lifecycle) {
                lifecycle.exitCode = event.exitCode;
            }

            if (event.exitCode !== undefined && event.exitCode !== 0) {
                this.setExecutionState('idle');
            }
        });

        const taskEndListener = vscode.tasks.onDidEndTask((event) => {
            const task = event.execution.task;
            if (!this.isBuildTask(task)) {
                return;
            }

            const lifecycle = this.taskLifecycles.get(task.name);
            if (!lifecycle) {
                return;
            }

            this.taskLifecycles.delete(task.name);

            if (lifecycle.stoppedManually) {
                // lifecycle cleanup has already been performed during manual stop
                return;
            }
            // if user terminates from terminal or task ends on its own
            this.setExecutionState('idle');

            this.eventEmitter.fire();
        });

        context.subscriptions.push(taskEndListener);

        // register commands
        context.subscriptions.push(
            this.commandsProvider.registerCommand(BuildStopCommand.stopBuildCommand, () => {
                this.stopBuildTask();
            }),
        );
    }

    private setExecutionState(state: buildState) {
        vscode.commands.executeCommand('setContext', `${PACKAGE_NAME}.buildState`, state);
    }

    private async stopBuildTask(): Promise<void> {
        const taskName = this.getActiveBuildTaskName();
        if (taskName && this.buildTaskProvider?.terminateTask(taskName)) {
            const lifecycle = this.taskLifecycles.get(taskName);
            if (lifecycle) {
                lifecycle.stoppedManually = true;
            }
        } else {
            const taskExecutions = vscode.tasks.taskExecutions ?? [];
            for (const exec of taskExecutions) {
                if (this.isBuildTask(exec.task)) {
                    exec.terminate();
                    break;
                }
            }
        }
        this.setExecutionState('idle');
        // notify other extension's views
        this.eventEmitter.fire();
    }

    private getActiveBuildTaskName(): string | undefined {
        const lifecycleName = this.taskLifecycles.keys().next().value as string | undefined;
        if (lifecycleName) {
            return lifecycleName;
        }
        const taskExecutions = vscode.tasks.taskExecutions ?? [];
        for (const exec of taskExecutions) {
            if (this.isBuildTask(exec.task)) {
                return exec.task.name;
            }
        }
        return undefined;
    }

    private isBuildTask(task: vscode.Task): boolean {
        return task.definition?.type === BuildTaskProviderImpl.taskType;
    }

}
