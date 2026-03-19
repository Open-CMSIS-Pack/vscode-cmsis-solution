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
import * as path from 'path';
import { TerminalTaskRunner } from '../../vscode-api/runner/terminal-task-runner';
import { Runner } from '../../vscode-api/runner/runner';
import { PACKAGE_NAME } from '../../manifest';
import { BuildTaskDefinition } from './build-task-definition';
import { COMMAND_GET_SOLUTION_FILE } from '../../solutions/active-solution-tracker';
import { cbuildArgsFromTaskDefinition } from './build-runner';

export interface BuildTaskProvider {
    createTask(definition: BuildTaskDefinition): vscode.Task,
    terminateTask(taskName: string): boolean,
    getActiveTaskRunner(taskName: string): TerminalTaskRunner | undefined;
}

export class BuildTaskProviderImpl implements BuildTaskProvider, vscode.TaskProvider {
    public static taskType = `${PACKAGE_NAME}.build`;
    private readonly activeTaskRunners = new Map<string, TerminalTaskRunner>();

    public constructor(
        private readonly runner: Runner,
        private readonly taskName: string = 'Build', // Make task name configurable
        private readonly taskMessages: {
            runMessage: string,
            completeMessage: string,
            terminationMessage: string
        } = {
            runMessage: '',
            completeMessage: '',
            terminationMessage: '\r\n🟥 Build cancelled by user\r\n'
        }
    ) {}

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            vscode.tasks.registerTaskProvider(BuildTaskProviderImpl.taskType, this)
        );
    }

    public async provideTasks(): Promise<vscode.Task[] | undefined> {
        const definition: BuildTaskDefinition = {
            type: BuildTaskProviderImpl.taskType,
            solution: '${command:' + COMMAND_GET_SOLUTION_FILE + '}',
            rebuild: false,
        };

        const task = this.createTask(definition);

        return [task];
    }

    public resolveTask(task: vscode.Task): vscode.Task {
        // We *must* return a new Task here, but with the same definition,
        // otherwise the task cannot be customised in tasks.json.
        // https://github.com/microsoft/vscode/issues/58836#issuecomment-696620105
        return this.createTask(task.definition as BuildTaskDefinition);
    }

    /**
     * Gracefully terminates an active task by name and removes it from tracking.
     *
     * This method provides a controlled way to stop running tasks without force-closing
     * terminals. It searches for the specified task in the active runners registry and
     * initiates graceful termination if found.
     */
    public terminateTask(taskName: string): boolean {
        const runner = this.activeTaskRunners.get(taskName);
        if (runner) {
            runner.terminateProcess();
            this.activeTaskRunners.delete(taskName);
            return true;
        }
        return false;
    }

    public getActiveTaskRunner(taskName: string): TerminalTaskRunner | undefined {
        return this.activeTaskRunners.get(taskName);
    }

    public createTask(definition: BuildTaskDefinition): vscode.Task {
        const taskLabel = this.getTaskLabel(definition);
        return new vscode.Task(
            definition,
            vscode.TaskScope.Workspace,
            taskLabel,
            definition.type,
            new vscode.CustomExecution(async resolvedTaskDefinition => {
                const runner = new TerminalTaskRunner({
                    definition: resolvedTaskDefinition,
                    runner: this.runner,
                    taskName: taskLabel,
                    runMessage: this.taskMessages.runMessage,
                    completeMessage: this.taskMessages.completeMessage,
                    terminationMessage: this.taskMessages.terminationMessage,
                    dimensions: resolvedTaskDefinition.dimensions,
                });
                // Use the generated task name for tracking
                this.activeTaskRunners.set(taskLabel, runner);
                return runner;
            }),
        );
    }

    private getTaskLabel(definition: BuildTaskDefinition): string {
        const rawArgs = cbuildArgsFromTaskDefinition(definition);
        const displaySolution = this.getDisplaySolutionLabel(definition.solution);

        const displayArgs = rawArgs.map(arg => {
            if (displaySolution && arg === definition.solution) {
                return displaySolution;
            }
            return arg;
        });

        const args = displayArgs.map(arg =>
            (!arg || arg.trim().length === 0) ? '""' : arg
        );
        const label = ['cbuild', ...args].join(' ');
        return label.length > 0 ? label : this.taskName;
    }

    private getDisplaySolutionLabel(solutionPath?: string): string | undefined {
        if (!solutionPath) {
            return solutionPath;
        }

        if (solutionPath.endsWith('.csolution.yml') || solutionPath.endsWith('.csolution.yaml')) {
            return path.basename(solutionPath);
        }

        return solutionPath;
    }
}
