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
import { TaskOutputCapture, TerminalTaskRunner } from '../../vscode-api/runner/terminal-task-runner';
import type { CsolutionApiV3 } from '../../../api/csolution-api-v3';
import { Runner } from '../../vscode-api/runner/runner';
import { PACKAGE_NAME } from '../../manifest';
import { BuildTaskDefinition } from './build-task-definition';
import { COMMAND_GET_SOLUTION_FILE } from '../../solutions/active-solution-tracker';
import { cbuildArgsFromTaskDefinition } from './build-runner';
import type { SolutionManager } from '../../solutions/solution-manager';
import { pathsEqual } from '../../utils/path-utils';

export interface BuildTaskProvider {
    createTask(definition: BuildTaskDefinition): vscode.Task,
    getBuildResult(execution: vscode.TaskExecution): Promise<CsolutionApiV3.BuildResult>;
    getBuildResult(): Promise<CsolutionApiV3.BuildResult | undefined>;
    terminateTask(taskName: string): boolean,
    getActiveTaskRunner(taskName: string): TerminalTaskRunner | undefined;
}

export const isBuildTask = (task: vscode.Task): boolean =>
    task.definition?.type === BuildTaskProviderImpl.taskType;

export const waitForActiveBuildTasksCompletion = async (): Promise<void> => {
    const activeExecutions = (vscode.tasks.taskExecutions ?? []).filter(execution => isBuildTask(execution.task));

    if (activeExecutions.length === 0) {
        return;
    }

    const pendingExecutions = new Set(activeExecutions);

    await new Promise<void>((resolve) => {
        const disposable = vscode.tasks.onDidEndTask((event) => {
            if (!pendingExecutions.has(event.execution)) {
                return;
            }

            pendingExecutions.delete(event.execution);
            if (pendingExecutions.size === 0) {
                disposable.dispose();
                resolve();
            }
        });

        // Guard against missing an end event between the snapshot and listener registration.
        // If a build task ended between the snapshot and now, remove it from pending.
        const stillActive = new Set((vscode.tasks.taskExecutions ?? []).filter(execution => isBuildTask(execution.task)));
        for (const exec of pendingExecutions) {
            if (!stillActive.has(exec)) {
                pendingExecutions.delete(exec);
            }
        }
        if (pendingExecutions.size === 0) {
            disposable.dispose();
            resolve();
        }
    });
};

interface BuildCapture extends TaskOutputCapture {
    result: Promise<CsolutionApiV3.BuildResult>;
    readonly started: boolean;
}

interface BuildResultEntry {
    result: Promise<CsolutionApiV3.BuildResult>;
    resolve: (result: CsolutionApiV3.BuildResult | PromiseLike<CsolutionApiV3.BuildResult>) => void;
    capture?: BuildCapture;
    latestKey?: string;
    ended?: boolean;
}

export class BuildTaskProviderImpl implements BuildTaskProvider, vscode.TaskProvider {
    public static taskType = `${PACKAGE_NAME}.build`;
    private readonly activeTaskRunners = new Map<string, TerminalTaskRunner>();
    private readonly buildResults = new WeakMap<vscode.TaskExecution, BuildResultEntry>();
    private readonly latestBuildResults = new Map<string, CsolutionApiV3.BuildResult>();
    // VS Code can replace CustomExecution objects while retaining a task's execution handle.
    // Match callback invocations to lifecycle events using the registered task definition.
    private readonly pendingCaptures = new Map<string, BuildCapture[]>();

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
        },
        private readonly solutionManager?: Pick<SolutionManager, 'getCsolution' | 'loadState'>,
    ) {}

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            vscode.tasks.registerTaskProvider(BuildTaskProviderImpl.taskType, this),
            vscode.tasks.onDidStartTask(event => { this.trackExecution(event.execution); }),
            vscode.tasks.onDidEndTask(event => {
                const entry = this.trackExecution(event.execution);
                if (entry && !entry.ended) {
                    entry.ended = true;
                    if (entry.capture) {
                        // A terminal can close before cancellation has finished the process.
                        if (!entry.capture.started) entry.capture.onComplete();
                    } else {
                        const result = { output: '' };
                        if (entry.latestKey) {
                            this.latestBuildResults.set(entry.latestKey, result);
                        }
                        entry.resolve(result);
                    }
                }
            }),
            { dispose: () => { this.latestBuildResults.clear(); this.pendingCaptures.clear(); } },
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

    public getBuildResult(execution: vscode.TaskExecution): Promise<CsolutionApiV3.BuildResult>;
    public getBuildResult(): Promise<CsolutionApiV3.BuildResult | undefined>;
    public getBuildResult(execution?: vscode.TaskExecution): Promise<CsolutionApiV3.BuildResult | undefined> {
        if (!execution) {
            const key = this.solutionManager?.loadState.loaded ? this.getLatestBuildKey() : undefined;
            return Promise.resolve(key ? this.latestBuildResults.get(key) : undefined);
        }
        const known = this.buildResults.get(execution);
        if (known) {
            return known.result;
        }
        // executeTask may return an active handle before its custom callback/start event.
        if (isBuildTask(execution.task)
            && (vscode.tasks.taskExecutions ?? []).includes(execution)) {
            return this.getResultEntry(execution).result;
        }
        return Promise.reject(new Error('No captured build result is available for this task execution'));
    }

    private getResultEntry(execution: vscode.TaskExecution): BuildResultEntry {
        let entry = this.buildResults.get(execution);
        if (!entry) {
            let resolve!: BuildResultEntry['resolve'];
            const result = new Promise<CsolutionApiV3.BuildResult>(complete => { resolve = complete; });
            const latestKey = this.getLatestBuildKey(this.bindBuildDefinition(execution.task.definition as BuildTaskDefinition));
            entry = { result, resolve, latestKey };
            this.buildResults.set(execution, entry);
        }
        return entry;
    }

    private trackExecution(execution: vscode.TaskExecution): BuildResultEntry | undefined {
        if (!isBuildTask(execution.task)) {
            return undefined;
        }
        const entry = this.getResultEntry(execution);
        if (!entry.capture) {
            const key = this.getTaskKey(execution.task.definition);
            const pending = this.pendingCaptures.get(key);
            entry.capture = pending?.shift();
            if (!pending?.length) this.pendingCaptures.delete(key);
            if (entry.capture) {
                entry.resolve(entry.capture.result);
            }
        }
        return entry;
    }

    private getTaskKey(definition: vscode.TaskDefinition): string {
        // Match package.json's build task properties, ignoring terminal/UI metadata.
        // VS Code fills an omitted required string (solution) with an empty string.
        const properties: (keyof BuildTaskDefinition)[] = [
            'type', 'solution', 'clean', 'downloadPacks', 'schemaCheck', 'buildOutputVerbosity',
            'intermediateDirectory', 'outputDirectory', 'cmakeTarget', 'generator', 'rebuild',
            'setup', 'jobs', 'updateRte', 'toolchain', 'active',
        ];
        return JSON.stringify(properties.map(key => definition[key] ?? (key === 'solution' ? '' : null)));
    }

    private bindBuildDefinition(definition: BuildTaskDefinition): BuildTaskDefinition {
        const solution = this.solutionManager?.getCsolution();
        const solutionPath = definition.solution || solution?.solutionPath;
        const resolvedPath = solutionPath
            ? path.resolve(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '.', solutionPath) : undefined;
        return {
            ...definition,
            solution: resolvedPath,
            active: definition.active || (pathsEqual(resolvedPath, solution?.solutionPath) ? solution?.getActiveTargetSetName() : undefined),
        };
    }

    private getLatestBuildKey(definition?: BuildTaskDefinition): string | undefined {
        if (definition?.clean || definition?.setup) {
            return undefined;
        }
        const solutionPath = definition?.solution ?? this.solutionManager?.getCsolution()?.solutionPath;
        if (!solutionPath) {
            return undefined;
        }
        const resolvedPath = path.resolve(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '.', solutionPath);
        const active = definition ? definition.active : this.solutionManager?.getCsolution()?.getActiveTargetSetName();
        if (active === undefined) {
            return undefined;
        }
        return JSON.stringify([process.platform === 'win32' ? resolvedPath.toLowerCase() : resolvedPath, active]);
    }

    private createCapture(definition: BuildTaskDefinition): BuildCapture {
        // Snapshot the build's context now; the user can switch solutions or targets while it runs.
        const latestKey = this.getLatestBuildKey(definition);
        const chunks: string[] = [];
        let complete!: (result: CsolutionApiV3.BuildResult) => void;
        const result = new Promise<CsolutionApiV3.BuildResult>(resolve => { complete = resolve; });
        let settled = false;
        let started = false;
        return {
            result,
            get started() { return started; },
            onStart: () => { started = true; },
            onOutput: message => { if (!settled) chunks.push(message); },
            onComplete: exitCode => {
                if (!settled) {
                    settled = true;
                    const completed = { exitCode, output: chunks.join('') };
                    if (latestKey) {
                        this.latestBuildResults.set(latestKey, completed);
                    }
                    complete(completed);
                    chunks.length = 0;
                }
            },
        };
    }

    public createTask(definition: BuildTaskDefinition): vscode.Task {
        const taskLabel = this.getTaskLabel(definition);
        const customExecution = new vscode.CustomExecution(async resolvedTaskDefinition => {
            const boundDefinition = this.bindBuildDefinition(resolvedTaskDefinition as BuildTaskDefinition);
            const capture = this.createCapture(boundDefinition);
            const key = this.getTaskKey(definition);
            const pending = this.pendingCaptures.get(key) ?? [];
            pending.push(capture);
            this.pendingCaptures.set(key, pending);
            const runner = new TerminalTaskRunner({
                definition: boundDefinition,
                runner: this.runner,
                taskName: taskLabel,
                runMessage: this.taskMessages.runMessage,
                completeMessage: this.taskMessages.completeMessage,
                terminationMessage: resolvedTaskDefinition.setup ? '\r\n🟥 Build requested by user, skip setup\r\n' :
                    this.taskMessages.terminationMessage,
                dimensions: resolvedTaskDefinition.dimensions,
                capture,
            });
            // Use the generated task name for tracking
            this.activeTaskRunners.set(taskLabel, runner);
            return runner;
        });
        return new vscode.Task(definition, vscode.TaskScope.Workspace, taskLabel, definition.type, customExecution);
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
