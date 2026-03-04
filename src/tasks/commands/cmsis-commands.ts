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

import { EventEmitter, ExtensionContext } from 'vscode';
import { CONFIG_AUTO_CONFIGURE_TELNET_PORT_MONITOR, PACKAGE_NAME } from '../../manifest';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import * as vscode from 'vscode';
import { DebugLaunchProvider } from '../../debug/debug-launch-provider';
import { SolutionManager } from '../../solutions/solution-manager';
import { IExtensionApiWrapper } from '../../vscode-api/extension-api-wrapper';
import { SerialMonitorApi } from '@microsoft/vscode-serial-monitor-api';
import { TCPPortMonitor } from '../../generic/tcp-port-monitor';
import { ConfigurationProvider } from '../../vscode-api/configuration-provider';


type executionState = 'idle' | 'running' | 'debugging' | 'loading' | 'erasing' | 'unconfigured';
const trackedTasks = ['CMSIS Load+Run', 'CMSIS Load', 'CMSIS Run', 'CMSIS Erase'];
let isDebugging = false;
let isAttachedDebugger = false;

interface DebugContext {
    configName: string | undefined;
    folder: vscode.Uri | undefined;
    solutionPath: string;
    activeTarget: string;
}

interface TaskLifecycle {
    name: string;
    started: boolean;
    processStarted: boolean;
    exitCode?: number;
    stoppedManually?: boolean;
    isSingleTask?: boolean;
}

export class CmsisCommands {
    public static readonly loadAndRunCommandId = `${PACKAGE_NAME}.cmsisLoadAndRun`;
    public static readonly disabledLoadAndRun = `${PACKAGE_NAME}.cmsisDisabledLoadAndRun`;
    public static readonly stopRunCommandId = `${PACKAGE_NAME}.cmsisStopRun`;
    public static readonly loadAndDebugCommandId = `${PACKAGE_NAME}.cmsisLoadAndDebug`;
    public static readonly disabledLoadAndDebug = `${PACKAGE_NAME}.cmsisDisabledLoadAndDebug`;
    public static readonly attachDebuggerCommandId = `${PACKAGE_NAME}.cmsisAttachDebugger`;
    public static readonly detachDebugger = `${PACKAGE_NAME}.cmsisDetachDebugger`;
    public static readonly eraseCommandId = `${PACKAGE_NAME}.cmsisErase`;
    public static readonly loadCommandId = `${PACKAGE_NAME}.cmsisLoad`;
    public static readonly runCommandId = `${PACKAGE_NAME}.cmsisRun`;
    public static readonly targetInfo = `${PACKAGE_NAME}.cmsisTargetInfo`;

    private readonly eventEmitter = new EventEmitter<void>();
    private readonly taskLifecycles = new Map<string, TaskLifecycle>();

    constructor(
        private readonly configProvider: ConfigurationProvider,
        private readonly commandsProvider: CommandsProvider,
        private readonly solutionManager: SolutionManager,
        private readonly debugLaunchProvider: DebugLaunchProvider,
        private readonly serialMonitorExtension: IExtensionApiWrapper<SerialMonitorApi>,
    ) {
    }

    public async activate(context: Pick<ExtensionContext, 'subscriptions'>) {
        await this.setExecStateBasedOnCSol();

        context.subscriptions.push(
            this.solutionManager.onLoadedBuildFiles(async () => {
                await this.setExecStateBasedOnCSol();
            }),

            vscode.workspace.onDidChangeConfiguration(async (event) => {
                const workspaceFolder = this.solutionManager.workspaceFolder;
                if (!workspaceFolder) {
                    return;
                }
                if (event.affectsConfiguration('launch', workspaceFolder)) {
                    await this.updateTaskAndLaunchContexts();
                }
            }),

            vscode.tasks.onDidStartTask(event => {
                const taskName = event.execution.task.name;
                if (!trackedTasks.includes(taskName)) {
                    return;
                }

                const lifecycle = this.taskLifecycles.get(taskName);
                this.taskLifecycles.set(taskName, {
                    name: taskName,
                    started: true,
                    processStarted: false,
                    isSingleTask: lifecycle?.isSingleTask ?? false
                });
            }),

            vscode.tasks.onDidStartTaskProcess(event => {
                const taskName = event.execution.task.name;
                if (!trackedTasks.includes(taskName)) {
                    return;
                }

                const lifecycle = this.taskLifecycles.get(taskName);
                if (lifecycle) {
                    lifecycle.processStarted = true;
                }

                const load = this.taskLifecycles.get('CMSIS Load');
                if (taskName === 'CMSIS Load' && load?.processStarted) {
                    this.setExecutionState('loading');
                }

                const run = this.taskLifecycles.get('CMSIS Run');
                if (load?.exitCode === 0 && run?.processStarted) {
                    this.setExecutionState('running');
                }
            }),

            vscode.tasks.onDidEndTaskProcess(event => {
                const taskName = event.execution.task.name;
                if (!trackedTasks.includes(taskName)) {
                    return;
                }

                const lifecycle = this.taskLifecycles.get(taskName);
                if (lifecycle) {
                    lifecycle.exitCode = event.exitCode;
                }

                if (event.execution.task.name === 'CMSIS Load' && event.exitCode !== 0) {
                    vscode.window.showErrorMessage('CMSIS Load task failed before launch.');
                    if (!lifecycle?.stoppedManually) {
                        this.setExecutionState('idle');
                    }
                }
            }),

            vscode.tasks.onDidEndTask((event) => {
                const taskName = event.execution.task.name;
                if (!trackedTasks.includes(taskName)) {
                    return;
                }

                const lifecycle = this.taskLifecycles.get(taskName);
                if (!lifecycle || lifecycle.stoppedManually) {
                    return;
                }

                const isLoad = lifecycle.name === 'CMSIS Load';
                const isSuccess = lifecycle.exitCode === 0;

                if (isLoad && isSuccess) {
                    this.setExecutionState(lifecycle.isSingleTask ? 'idle' : 'loading');
                    lifecycle.isSingleTask = false;
                } else { // if user terminates from terminal or task ends on its own
                    this.setExecutionState('idle');
                }
                this.eventEmitter.fire();
            }),

            // track debug sessions and update execution states
            vscode.debug.onDidStartDebugSession(session => {
                if (session.name === this.debugLaunchProvider.activeLaunchConfiguration) {
                    vscode.window.showInformationMessage('Debug session started: Launch mode');
                    isDebugging = true;
                } else if (session.name === this.debugLaunchProvider.activeAttachConfiguration) {
                    isAttachedDebugger = true;
                    vscode.window.showInformationMessage('Debug session started: Attach mode');
                }
                this.startSerialMonitors();
            }),

            vscode.debug.onDidTerminateDebugSession(session => {
                if (this.isTrackedDebugSession(session)) {
                    this.stopSerialMonitors();
                    if (isAttachedDebugger) {
                        this.setExecutionState('running');
                    } else {
                        this.setExecutionState('idle');
                    }
                    this.handleDebugSessionEnded(session);
                }
            }),

            vscode.debug.onDidReceiveDebugSessionCustomEvent(event => {
                if (event.event === 'output') {
                    const output = event.body?.output ?? '';
                    if (output.includes('Error') || output.includes('failed')) {
                        vscode.window.showErrorMessage('Debugger error output:', output);
                        this.setExecutionState('idle');
                    }
                }
            }),

            this.commandsProvider.registerCommand(CmsisCommands.loadAndRunCommandId, () => {
                this.runCmsisTask('CMSIS Load+Run');
            }),

            this.commandsProvider.registerCommand(CmsisCommands.stopRunCommandId, () => {
                this.stopCmsisTask('CMSIS');
            }),

            this.commandsProvider.registerCommand(CmsisCommands.loadAndDebugCommandId, () => {
                this.runLoadAndDebug('loading');
            }),

            this.commandsProvider.registerCommand(CmsisCommands.attachDebuggerCommandId, () => {
                this.attachDebug('debugging');
            }),

            this.commandsProvider.registerCommand(CmsisCommands.detachDebugger, () => {
                this.detachDebugger();
            }),

            this.commandsProvider.registerCommand(CmsisCommands.eraseCommandId, () => {
                this.runCmsisTask('CMSIS Erase', 'erasing');
            }),

            this.commandsProvider.registerCommand(CmsisCommands.loadCommandId, () => {
                this.runCmsisTask('CMSIS Load', 'loading', true);
            }),

            this.commandsProvider.registerCommand(CmsisCommands.runCommandId, () => {
                this.runCmsisTask('CMSIS Run', 'running');
            }),

            this.commandsProvider.registerCommand(CmsisCommands.disabledLoadAndRun, () => {

            }),
            this.commandsProvider.registerCommand(CmsisCommands.disabledLoadAndDebug, () => {

            }),
            this.commandsProvider.registerCommand(CmsisCommands.targetInfo, () => {
                this.runCmsisTask('CMSIS TargetInfo');
            }),
        );
    }

    private readonly serialMonitors: TCPPortMonitor[] = [];

    private startSerialMonitors(): void {
        const enableSerialMonitor = this.configProvider.getConfigVariableOrDefault(CONFIG_AUTO_CONFIGURE_TELNET_PORT_MONITOR, false);
        if (!enableSerialMonitor) {
            return;
        }
        const api = this.serialMonitorExtension.api;
        if (!api) {
            return;
        }
        const cbuildRunYml = this.solutionManager.getCsolution()?.cbuildRunYml;
        if (!cbuildRunYml) {
            return;
        }
        cbuildRunYml.load();
        for (const telnet of cbuildRunYml.getTelnet()) {
            if (telnet.mode === 'monitor') {
                this.serialMonitors.push(
                    new TCPPortMonitor(telnet.port, () => {
                        const portPromise = api.startMonitoringTCPConnection({ host: 'localhost', port: telnet.port, swoEnabled: false });
                        portPromise.then(() => {
                            vscode.commands.executeCommand('workbench.debug.action.focusRepl');
                        });
                        return { dispose: async () => { (await portPromise).stopMonitoring(); } };
                    })
                );
            }
        }
    }

    private stopSerialMonitors() {
        let monitor: TCPPortMonitor | undefined;
        while ((monitor = this.serialMonitors.pop()) !== undefined) {
            monitor.dispose();
        }
    }


    private async setExecStateBasedOnCSol(): Promise<void> {
        this.setExecutionState(this.isCSolution() ? 'idle' : 'unconfigured');
        await this.updateTaskAndLaunchContexts();
    }


    private setExecutionState(state: executionState) {
        vscode.commands.executeCommand('setContext', `${PACKAGE_NAME}.executionState`, state);

        const isActive = this.isCSolution();

        vscode.commands.executeCommand('setContext', 'canStartRun', isActive && state === 'idle');
        vscode.commands.executeCommand('setContext', 'canStopRun', isActive && state !== 'idle');
        vscode.commands.executeCommand('setContext', 'canAttachDebug', isActive && state === 'running');
        vscode.commands.executeCommand('setContext', 'canDetachDebug', isActive && state === 'debugging');
        vscode.commands.executeCommand('setContext', 'canStartDebug', isActive && state === 'idle');
    }

    private async updateTaskAndLaunchContexts(): Promise<void> {
        const workspaceFolder = this.solutionManager.workspaceFolder;
        if (!workspaceFolder) {
            return;
        }

        const workspaceTasks = await this.getTasksFromWorkspace();

        interface DebugConfiguration {
            name: string;
            type?: string;
            request?: string;
            [key: string]: unknown;
        }

        const debugConfigs = vscode.workspace
            .getConfiguration('launch', workspaceFolder)
            .get<DebugConfiguration[]>('configurations') ?? [];

        const hasTask = (name: string): boolean =>
            workspaceTasks.some(task => task.name === name);

        const hasDebugConfig = (name: string): boolean =>
            debugConfigs.some(cfg => cfg.name === name);

        vscode.commands.executeCommand('setContext', 'hasLoadRunTask', hasTask('CMSIS Load+Run'));
        vscode.commands.executeCommand('setContext', 'hasEraseTask', hasTask('CMSIS Erase'));
        vscode.commands.executeCommand('setContext', 'hasRunTask', hasTask('CMSIS Run'));
        vscode.commands.executeCommand('setContext', 'hasLoadTask', hasTask('CMSIS Load'));

        const launchConfigName = this.debugLaunchProvider.activeLaunchConfiguration;
        vscode.commands.executeCommand(
            'setContext',
            'hasDebugConfig',
            launchConfigName ? hasDebugConfig(launchConfigName) : false
        );

        const attachConfigName = this.debugLaunchProvider.activeAttachConfiguration;
        vscode.commands.executeCommand(
            'setContext',
            'hasAttachConfig',
            attachConfigName ? hasDebugConfig(attachConfigName) : false
        );
    }

    private isCSolution(): boolean {
        const csolution = this.solutionManager.getCsolution();
        return !!csolution?.cbuildYmlRoot && csolution.cbuildYmlRoot.size > 0;
    }

    private isCSolutionActive(): boolean {
        return !!this.solutionManager.loadState.solutionPath;
    }

    private async runCmsisTask(taskName: string, state?: executionState, isSingleTask?: boolean): Promise<void> {
        let task: vscode.Task | undefined;

        if (taskName === 'CMSIS TargetInfo') {
            task = await this.readTargetInfo(taskName);
        } else {
            const tasks = await this.getTasksFromWorkspace();
            task = tasks.find(task => task.name === taskName);
        }

        if (task) {
            const singleTaskFlag = (taskName === 'CMSIS Load') ? !!isSingleTask : undefined;
            this.taskLifecycles.set(task.name, { name: task.name, started: true, processStarted: false, isSingleTask: singleTaskFlag });
            vscode.tasks.executeTask(task);
            if (state) {
                this.setExecutionState(state);
            }
        } else {
            vscode.window.showErrorMessage(`Task '${taskName}' not found`);
        }
    }

    public async readTargetInfo(taskName: string): Promise<vscode.Task> {
        if (this.isCSolution() && this.isCSolutionActive()) {
            const tasks = await this.getTasksFromWorkspace();
            const targetInfoTask = tasks.find(task => task.name === taskName);

            if (targetInfoTask) {
                return targetInfoTask;
            }
        }
        // Fallback: Create a standalone target info task that doesn't require cbuild-run.yml
        // This allows the command to work without an active CMSIS solution

        return new vscode.Task(
            { type: 'shell' },
            vscode.TaskScope.Global,
            'Target Information',
            'CMSIS',
            new vscode.ShellExecution('pyocd list'),
            []
        );
    }

    private async stopCmsisTask(taskName: string): Promise<void> {
        for (const exec of vscode.tasks.taskExecutions) {
            const name = exec.task.name;
            if (name.startsWith(taskName)) {
                exec.terminate();
                const lifecycle = this.taskLifecycles.get(name);
                if (lifecycle) {
                    lifecycle.stoppedManually = true;
                }
            }
        }
        if ((isDebugging || isAttachedDebugger) && vscode.debug.activeDebugSession) {
            await this.stopDebugSession();
        }

        this.resetExecutionState();
    }

    private async stopPendingTasks(): Promise<void> {
        // kill only running VS Code tasks that are tracked
        for (const exec of vscode.tasks.taskExecutions) {
            if (trackedTasks.includes(exec.task.name)) {
                exec.terminate();
            }
        }

        this.resetExecutionState();
    }

    private resetExecutionState(): void {
        this.setExecutionState('idle');
        // notify other extension's views
        this.eventEmitter.fire();
    }

    private async detachDebugger(): Promise<void> {
        this.stopDebugSession();
        // allows to attach debugger again
        this.setExecutionState('running');
    }

    private async stopDebugSession(): Promise<void> {
        const session = vscode.debug.activeDebugSession;

        if (session && this.isTrackedDebugSession(session)) {
            await vscode.debug.stopDebugging(session);
            this.handleDebugSessionEnded(session);
        }
    }

    private isTrackedDebugSession(session: vscode.DebugSession): boolean {
        return (
            session.name === this.debugLaunchProvider.activeLaunchConfiguration ||
            session.name === this.debugLaunchProvider.activeAttachConfiguration
        );
    }

    private handleDebugSessionEnded(session: vscode.DebugSession): void {
        vscode.window.showInformationMessage(`Debug session ended: ${session.name}`);
        isDebugging = false;
        isAttachedDebugger = false;
    }

    private async runLoadAndDebug(state: executionState): Promise<void> {
        await this.validateAndStartDebugging(
            this.debugLaunchProvider.activeLaunchConfiguration,
            this.reportDebugConfigError.bind(this),
            state
        );
    }

    private async attachDebug(state: executionState): Promise<void> {
        await this.validateAndStartDebugging(
            this.debugLaunchProvider.activeAttachConfiguration,
            this.reportAttachConfigError.bind(this),
            state
        );
    }

    private async validateAndStartDebugging(
        configName: string | undefined,
        errorReporter: (configName: string | undefined, workspaceFolder: vscode.Uri | undefined, solutionPath: string, activeTarget: string) => void,
        state: executionState
    ): Promise<void> {
        const workspaceFolder = this.solutionManager.workspaceFolder;
        const solution = this.solutionManager.getCsolution();
        const solPath = solution?.solutionPath ?? '<unknown solution>';
        const activeTarget = solution?.getActiveTargetType() ?? '<unknown target>';

        if (!configName || !workspaceFolder) {
            errorReporter(configName, workspaceFolder, solPath, activeTarget);
            return;
        }

        try {
            const started = await this.startDebugging(configName, workspaceFolder);
            if (started) {
                this.setExecutionState(state);
            } else {
                this.stopPendingTasks();
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Unexpected error while starting debugger: ${error}`);
            this.stopPendingTasks();
        }
    }

    private async startDebugging(configName: string, workspaceFolder: vscode.Uri): Promise<boolean> {
        const wsFolder = vscode.workspace.getWorkspaceFolder(workspaceFolder);
        const success = await vscode.debug.startDebugging(wsFolder, configName);

        if (success) {
            vscode.commands.executeCommand('workbench.debug.action.focusRepl');
            vscode.commands.executeCommand('workbench.view.debug');
            return true;
        } else {
            vscode.window.showErrorMessage(`Failed to start debugging with configuration "${configName}".`);
            return false;
        }
    }

    private reportDebugConfigError(
        configName: string | undefined,
        folder: vscode.Uri | undefined,
        solutionPath: string,
        activeTarget: string
    ): void {
        const context: DebugContext = { configName, folder, solutionPath, activeTarget };
        this.showDebugErrorMessage(context, 'Unable to start debugging', 'no debugger configuration');
    }

    private reportAttachConfigError(
        configName: string | undefined,
        folder: vscode.Uri | undefined,
        solutionPath: string,
        activeTarget: string
    ): void {
        const context: DebugContext = { configName, folder, solutionPath, activeTarget };
        this.showDebugErrorMessage(context, 'Unable to attach debugger', 'no attach configuration');
    }


    private showDebugErrorMessage(
        context: DebugContext,
        prefix: string,
        configMessage: string
    ): void {
        const issues: string[] = [];
        if (!context.configName) {
            issues.push(`${configMessage} provided for '${context.solutionPath}' and target '${context.activeTarget}'`);
        }
        if (!context.folder) {
            issues.push('missing workspace folder');
        }

        const message = `${prefix}: ${issues.join(', ')}.`;
        vscode.window.showErrorMessage(message);
    }

    public async getTasksFromWorkspace(): Promise<vscode.Task[]> {
        const workspaceFolder = this.solutionManager.workspaceFolder;
        if (!workspaceFolder) {
            return [];
        }

        const tasks = await vscode.tasks.fetchTasks();

        // match only tasks scoped to this folder
        return tasks.filter(task =>
            task.source === 'Workspace' &&
            this.isTaskInWorkspaceFolder(task, workspaceFolder)
        );
    }

    private isTaskInWorkspaceFolder(task: vscode.Task, folderUri: vscode.Uri): boolean {
        return typeof task.scope === 'object' &&
            'uri' in task.scope &&
            task.scope.uri.toString() === folderUri.toString();
    }
}
