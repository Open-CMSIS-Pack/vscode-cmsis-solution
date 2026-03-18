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

import { globSync } from 'glob';
import * as vscode from 'vscode';
import { CommandsProvider } from '../vscode-api/commands-provider';
import { CONFIG_AUTO_DEBUG_LAUNCH, DEBUG_TEMPLATES_FOLDER, PACKAGE_NAME } from '../manifest';
import { SolutionManager } from '../solutions/solution-manager';
import { constructor } from '../generic/constructor';
import { loadDebugAdaptersYml } from './debug-adapters-yaml-file';
import path from 'path';
import { ETextFileResult, TextFile } from '../generic/text-file';
import { AdapterJson, AdapterJsonFile } from './adapter-json-file';
import { TasksJsonFile } from './tasks-json-file';
import { Configuration, LaunchJsonFile } from './launch-json-file';
import { EtaExt } from '../generic/eta-ext';
import { CbuildRunYaml, DebugTopology } from '../solutions/files/cbuild-run-yaml-file';
import { DebugAdapter } from './debug-adapters-yaml-file';
import { ConfigurationProvider } from '../vscode-api/configuration-provider';
import { backToForwardSlashes } from '../utils/path-utils';

export interface DebugLaunchProvider {
    activate(context: vscode.ExtensionContext): Promise<void>;

    readonly activeLaunchConfiguration: string | undefined;
    readonly activeAttachConfiguration: string | undefined;
}

export const UPDATE_DEBUG_TASKS_COMMAND_ID = `${PACKAGE_NAME}.updateDebugTasks` as const;

export class DebugLaunchProviderImpl implements DebugLaunchProvider {

    protected _activeLaunchConfiguration: string | undefined = undefined;
    protected _activeAttachConfiguration: string | undefined = undefined;
    private currentDebuggerName: string | undefined = undefined;

    constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly solutionManager: SolutionManager,
        private readonly configurationProvider: ConfigurationProvider,
        private readonly eta = new EtaExt({ useWith: true }),
    ) { }

    public get activeLaunchConfiguration() {
        return this._activeLaunchConfiguration;
    }

    public get activeAttachConfiguration() {
        return this._activeAttachConfiguration;
    }

    public async activate(context: Pick<vscode.ExtensionContext, 'subscriptions' | 'extensionPath'>) {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(UPDATE_DEBUG_TASKS_COMMAND_ID, this.handleUpdateDebugTasks, this),
        );
        this.configurationProvider.onChangeConfiguration(this.handleUpdateDebugTasks.bind(this), CONFIG_AUTO_DEBUG_LAUNCH);
    }

    protected async loadCbuildRunYml() {
        const cbuildRunYml = this.solutionManager.getCsolution()?.cbuildRunYml;
        if (!cbuildRunYml) {
            console.error('Failed to retrieve cbuild-run.yml file for active solution!');
            return undefined;
        }
        const result = await cbuildRunYml.load();
        if (result === ETextFileResult.Error || result === ETextFileResult.NotExists) {
            console.error('Failed to load cbuild-run.yml file for active solution!');
            return undefined;
        }
        return cbuildRunYml;
    }

    protected async loadDebugAdaptersYml() {
        return loadDebugAdaptersYml(); // use global methods
    }

    protected loadFiles() {
        const cbuildRunYml = this.loadCbuildRunYml();
        const debugAdaptersYml = this.loadDebugAdaptersYml();
        return Promise.all([cbuildRunYml, debugAdaptersYml]);
    }

    protected renderTemplate<T extends object>(obj: T, vars: Map<string, unknown>): T {
        const data = Object.fromEntries(vars);
        try {
            return this.eta.renderObject(obj, data);
        } catch (error) {
            console.error('Failed to render template:', obj, error);
        }
        return obj;
    }

    protected async processConfigDir<T extends TextFile>(
        folders: string[],
        configGlob: string,
        fileClass: new (filePath: string) => T,
        func: (file: T) => void,
    ) {
        const globPatterns = folders.map(f => backToForwardSlashes(path.join(f, configGlob)));
        const configFiles = globSync(globPatterns);
        for (const filePath of configFiles) {
            const configFile = new fileClass(filePath);
            const loadResult = await configFile.load();
            if (loadResult === ETextFileResult.Error) {
                console.error('Failed to load additional file:', filePath);
                continue;
            }
            func(configFile);
        }
    }

    protected async updateTasksJson(workspaceFolder: string, templateTasks: AdapterJson['tasks'], vars: Map<string, unknown>) {
        const tasksJsonFile = path.join(workspaceFolder, '.vscode', 'tasks.json');
        const tasksJson = new TasksJsonFile(tasksJsonFile);
        const result = await tasksJson.load();
        if (result === ETextFileResult.Error) {
            console.error('Failed to load tasks.json file');
            return;  // cannot update file
        }

        const updatedTasks: string[] = [];
        for (const task of templateTasks) {
            const newTask = this.renderTemplate(task, vars);
            if (newTask.label) {
                updatedTasks.push(newTask.label);
            }
            tasksJson.addTask(newTask);
        }
        tasksJson.removeUnlistedTasks(updatedTasks);

        const solutionFolder = this.solutionManager.getCsolution()?.solutionDir ?? workspaceFolder;
        await this.processConfigDir(
            [solutionFolder],
            '.vscode.d/tasks.json',
            TasksJsonFile,
            (extraTasksJson) => {
                extraTasksJson.inputs.forEach(i => tasksJson.addInput(i));
                extraTasksJson.tasks.forEach(t => tasksJson.addTask(t));
            }
        );

        if (this.configurationProvider.getConfigVariableOrDefault<boolean>(CONFIG_AUTO_DEBUG_LAUNCH, true)) {
            await tasksJson.save();
        }
    }

    protected updateLaunchConfiguration(launchJson: LaunchJsonFile,
        template: Configuration | undefined, vars: Map<string, unknown>,
        updatedConfigs?: string[]) {
        if (!template) {
            return undefined;
        }
        const newConfig = this.renderTemplate(template, vars);
        launchJson.addConfig(newConfig);
        updatedConfigs?.push(newConfig.name);
        return newConfig.name;
    }

    protected async updateLaunchJson(
        workspaceFolder: string,
        templates: AdapterJsonFile['launch'],
        options: {
            processors: string[],
        },
        vars: Map<string, unknown>
    ) {
        const launchJsonFilePath = path.join(workspaceFolder, '.vscode', 'launch.json');
        const launchJson = new LaunchJsonFile(launchJsonFilePath);
        const result = await launchJson.load();
        if (result === ETextFileResult.Error) {
            console.error('Failed to load launch.json file');
            return;  // cannot update file
        }

        const updatedConfigs: string[] = [];

        if (options.processors.length <= 1) {
            vars.set('pname', options.processors.at(0) || '');

            this._activeLaunchConfiguration = this.updateLaunchConfiguration(launchJson, templates['singlecore-launch'], vars, updatedConfigs);
            this._activeAttachConfiguration = this.updateLaunchConfiguration(launchJson, templates['singlecore-attach'], vars, updatedConfigs);
        } else {
            for (const [idx, pname] of options.processors.entries()) {
                vars.set('pname', pname);

                if (idx === 0) {
                    this._activeLaunchConfiguration = this.updateLaunchConfiguration(launchJson, templates['multicore-start-launch'], vars, updatedConfigs);
                    this._activeAttachConfiguration = this.updateLaunchConfiguration(launchJson, templates['multicore-start-attach'], vars, updatedConfigs);
                } else {
                    this.updateLaunchConfiguration(launchJson, templates['multicore-other'], vars, updatedConfigs);
                }
            }
        }
        // purge auto configurations
        launchJson.removeUnlistedConfigurations(updatedConfigs);

        const solutionFolder = this.solutionManager.getCsolution()?.solutionDir ?? workspaceFolder;
        await this.processConfigDir(
            [solutionFolder],
            '.vscode.d/launch.json',
            LaunchJsonFile,
            (extraLaunchJson) => extraLaunchJson.configurations.forEach(c => launchJson.addConfig(c))
        );

        if (this.configurationProvider.getConfigVariableOrDefault<boolean>(CONFIG_AUTO_DEBUG_LAUNCH, true)) {
            await launchJson.save();
        }
    }

    protected relativePosixPath(from: string, to: string) {
        return path.relative(from, to).replace(/\\/g, '/');
    }

    protected async updateDebugTasks(workspaceFolder: string, params: {
        debug: CbuildRunYaml['cbuild-run']['debugger'],
        debugAdapter: DebugAdapter,
        deviceName: string,
        targetType: string,
        processors: DebugTopology['processors'],
        image_files: CbuildRunYaml['cbuild-run']['output'],
        symbol_files: CbuildRunYaml['cbuild-run']['output'],
    }) {
        if (!params.debugAdapter.template) {
            return;
        }
        const templateFilePath = path.join(DEBUG_TEMPLATES_FOLDER, params.debugAdapter.template);
        const templateFile = new AdapterJsonFile(templateFilePath);
        const result = await templateFile.load();
        if (result === ETextFileResult.Error || result == ETextFileResult.NotExists) {
            console.error('Failed to load adapter template file!', templateFilePath);
            return undefined;
        }

        const start_pname = params.debug['start-pname'] || '';
        const processors = params.processors
            ?.map((proc) => proc?.pname || '')
            ?.sort((a, b) => a === start_pname ? -1 : b === start_pname ? 1 : 0)
            || [];
        const ports = new Map(
            params.debug.gdbserver?.map((core) => [core.pname || '', core.port.toString()])
        );

        const vars = new Map<string, unknown>([
            ['platform', process.platform],
            ['template', (file: string) => backToForwardSlashes(path.join(DEBUG_TEMPLATES_FOLDER, path.basename(file)))], // use only the basename for security reasons
            ['solution_path', this.relativePosixPath(workspaceFolder, this.solutionManager.getCsolution()?.solutionPath || '')],
            ['solution_folder', this.relativePosixPath(workspaceFolder, this.solutionManager.getCsolution()?.solutionDir || '')],
            ['device_name', params.deviceName],
            ['target_type', params.targetType],
            ['start_pname', start_pname],
            ['image_files', params.image_files],
            ['symbol_files', params.symbol_files],
            ['ports', ports],
            ['config', params.debug],
            ['processors', processors],
        ]);

        // preprocess custom template data
        const data = this.renderTemplate(templateFile.data, vars);
        vars.set('data', data);

        await Promise.all([
            this.updateTasksJson(workspaceFolder, templateFile.tasks, vars),
            this.updateLaunchJson(workspaceFolder, templateFile.launch, { processors }, vars),
        ]);
    }

    protected async handleUpdateDebugTasks() {
        const workspaceFolder = this.solutionManager.workspaceFolder?.fsPath;
        const [cbuildRunYml, debugAdaptersYml] = await this.loadFiles();
        if (!cbuildRunYml || !debugAdaptersYml || !workspaceFolder) {
            return;
        }
        const debug = cbuildRunYml.getDebugger();
        if (!debug) {
            console.error('No debugger defined in cbuild-run.yml file!');
            return;
        }

        /* Workaround until cbuild setup retains all additional debugger settings */
        const [, targetSet] = this.solutionManager.getCsolution()?.getActiveTargetSet() ?? [undefined, undefined];
        if (targetSet?.debugger !== undefined) {
            for (const [key, value] of Object.entries(targetSet!.debugger!)) {
                if (!(key in debug)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (debug as any)[key] = value;
                }
            }
        }

        /* Inject custom user settings */
        if (!debug['probe-id']) {
            debug['probe-id'] = this.configurationProvider.getConfigVariable<string>('probe-id');
        }

        const debugAdapter = debugAdaptersYml.getAdapterByName(debug.name);
        if (!debugAdapter) {
            if (this.currentDebuggerName !== debug.name) {
                this.currentDebuggerName = debug.name;
                console.error(`No debug adapter found for ${debug.name} in debug-adapters.yaml file!`);
                vscode.window.showErrorMessage(`Cannot update debug launch configuration for unknown debug adapter ${debug.name}!`);
            }
            return;
        }

        const solutionFile = cbuildRunYml.getSolution();
        const solutionFolder = solutionFile ? path.dirname(solutionFile) : workspaceFolder;
        const relativeToSolution = (file: string) => this.relativePosixPath(solutionFolder, file);

        const deviceName = cbuildRunYml.getDevice()?.split('::').pop() || '';
        const targetType = cbuildRunYml.getTargetType() || '';
        const processors = cbuildRunYml.getProcessors();

        const relImgFile = (img: CbuildRunYaml['cbuild-run']['output'][number]) => ({
            ...img,
            file: relativeToSolution(img.file),
        });
        const image_files = cbuildRunYml.getImages({ image: true }).map(relImgFile);
        const symbol_files = cbuildRunYml.getImages({ symbols: true }).map(relImgFile);

        await this.updateDebugTasks(workspaceFolder, {
            debug,
            debugAdapter,
            deviceName,
            targetType,
            processors,
            image_files,
            symbol_files,
        });

        // Set debug.hideSlowPreLaunchWarning to suppress warnings due to extensive download tasks
        const hideSlowPreLaunchWarning = this.configurationProvider.inspectConfigVariable<boolean>('hideSlowPreLaunchWarning', 'debug');
        if ((hideSlowPreLaunchWarning?.globalValue ?? hideSlowPreLaunchWarning?.workspaceValue) === undefined) {
            this.configurationProvider.setConfigVariable<boolean>('hideSlowPreLaunchWarning', true, 'debug', true);
        }

        // Disable debug configuration status bar item by default
        const showInStatusBar = this.configurationProvider.inspectConfigVariable<string>('showInStatusBar', 'debug');
        if ((showInStatusBar?.globalValue ?? showInStatusBar?.workspaceValue) === undefined) {
            this.configurationProvider.setConfigVariable<string>('showInStatusBar', 'never', 'debug', true);
        }
    }
}

export const DebugLaunchProvider = constructor<typeof DebugLaunchProviderImpl, DebugLaunchProvider>(DebugLaunchProviderImpl);
