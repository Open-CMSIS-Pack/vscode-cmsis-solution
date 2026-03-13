/**
 * Copyright 2024-2026 Arm Limited
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

import path, { dirname } from 'path';
import * as vscode from 'vscode';
import { ExtensionContext } from 'vscode';
import { URI } from 'vscode-uri';
import { ETextFileResult } from '../../generic/text-file';
import * as manifest from '../../manifest';
import { SolutionLoadStateChangeEvent, SolutionManager } from '../../solutions/solution-manager';
import { backToForwardSlashes } from '../../utils/path-utils';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { ConfigurationProvider } from '../../vscode-api/configuration-provider';
import { WebviewManager, WebviewManagerOptions } from '../webview-manager';
import { ManageSolutionController } from './manage-solution-controller';
import { IncomingMessage, OutgoingMessage } from './messages';
import { SolutionData } from './view/state/manage-solution-state';
import { initialState } from './view/state/reducer';
import debounce from 'lodash.debounce';
import { CsolutionService } from '../../json-rpc/csolution-rpc-client';
import { isDeepStrictEqual } from 'util';
import { OpenCommand } from '../solution-outline/commands/open-command';
import { FileSelectorOptionsType } from './types';

export const MANAGE_SOLUTION_WEBVIEW_OPTIONS: Readonly<WebviewManagerOptions> = {
    title: 'Manage Solution',
    scriptPath: path.join('dist', 'views', 'manageSolution.js'),
    viewType: 'cmsis.manageSolution',
    commandId: undefined,
    iconName: {
        dark: 'gear-dark.svg',
        light: 'gear-light.svg',
    },
    enableSerializer: false,
};


export class ManageSolutionWebviewMain {
    private readonly webviewManager: WebviewManager<IncomingMessage, OutgoingMessage>;

    private readonly onEdit?: (label: string, before: SolutionData, after: SolutionData) => void;

    protected _controller?: ManageSolutionController;
    private wasDirty: boolean = false;

    constructor(
        context: ExtensionContext,
        protected readonly solutionManager: SolutionManager, // solutionManager is only used for didChange events. Other calls to csolution must be done using the csolution getter/setter
        private readonly commandsProvider: CommandsProvider,
        private readonly configurationProvider: ConfigurationProvider,
        private readonly csolutionService: CsolutionService,
        onEdit?: (label: string, before: SolutionData, after: SolutionData) => void,
        webviewManager?: WebviewManager<IncomingMessage, OutgoingMessage>,
    ) {
        this.webviewManager = webviewManager || new WebviewManager(context, MANAGE_SOLUTION_WEBVIEW_OPTIONS, commandsProvider);
        this.onEdit = onEdit;
        context.subscriptions.push(
            this.webviewManager.onDidCreate(() => {
                debounce(() => this.setBusyState(!this.solutionManager.loadState.solutionPath), 500)();
            }),
            this.solutionManager.onDidChangeLoadState(this.handleSolutionLoadChange, this),
        );

        this.configurationProvider.onChangeConfiguration(() => {
            if (this._controller) {
                this._controller.customDebugAdapterDefaults = this.configurationProvider.getConfigVariableOrDefault('debug-adapters', {});
                this._controller.csolutionService = this.csolutionService;
            }
        }, 'debug-adapters');
    }

    private async handleSolutionLoadChange(e: SolutionLoadStateChangeEvent): Promise<void> {
        const { solutionPath: newPath, converted: newConverted, loaded: newLoaded } = e.newState;
        const { solutionPath: prevPath, converted: prevConverted, loaded: prevLoaded } = e.previousState;

        if (!this.webviewManager.isPanelActive || (newPath === prevPath && newConverted !== prevConverted)) {
            return;
        }

        this.setBusyState(true);

        if (newPath !== prevPath) {
            if (newPath) {
                await this.sendContextData();
            } else if (prevPath) {
                await this.clearContext();
                this.webviewManager.disposePanel();
            }
        } else if (newLoaded !== prevLoaded) {
            await this.sendContextData();
        }

        this.setBusyState(false);
    }

    private get isDirty(): boolean {
        return (
            this.controller?.cmsisJsonFile.isModified()
            || this.controller?.csolutionYml.isModified()
            || false);
    }

    get controller() {
        if (!this._controller) {
            this._controller = this.createController();
        }
        return this._controller;
    }

    protected createController(): ManageSolutionController {
        const controller = new ManageSolutionController();
        controller.customDebugAdapterDefaults = this.configurationProvider.getConfigVariableOrDefault('debug-adapters', {});
        controller.csolutionService = this.csolutionService;
        return controller;
    }

    public async activate(context: ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.webviewManager.onDidReceiveMessage(this.handleMessage, this),
        );

        // get notified about updates on the value of autoDebugLaunch and update the UI
        this.configurationProvider.onChangeConfiguration(async () => {
            const autoUpdate = this.configurationProvider.getConfigVariableOrDefault(manifest.CONFIG_AUTO_DEBUG_LAUNCH, true);
            await this.webviewManager.sendMessage({ type: 'AUTO_UPDATE', data: autoUpdate });
        }, manifest.CONFIG_AUTO_DEBUG_LAUNCH);

        await this.webviewManager.activate(context);
    }

    private async setBusyState(busy: boolean): Promise<void> {
        await this.webviewManager.sendMessage({ type: 'IS_BUSY', data: busy });
    }

    private getSolutionDir(): string {
        return dirname(this.controller?.solutionPath ?? '');
    }

    private getSolutionBasename(): string {
        return path.basename(this.controller?.solutionPath ?? '') || 'the solution';
    }

    public attachToPanel(panel: vscode.WebviewPanel): void {
        this.webviewManager.attachPanel(panel);
    }

    public async applySnapshot(snapshot: SolutionData): Promise<void> {
        this.controller.solutionData = this.cloneSolutionData(snapshot);
        await this.broadcastState();
    }

    public getSolutionSnapshot(): SolutionData {
        return this.cloneSolutionData(this.controller.solutionData);
    }

    private cloneSolutionData(data: SolutionData): SolutionData {
        return structuredClone(data) as SolutionData;
    }

    private async withEdit(label: string, action: () => Promise<void>): Promise<void> {
        const before = this.cloneSolutionData(this.controller.solutionData);
        await action();
        const after = this.cloneSolutionData(this.controller.solutionData);
        if (this.onEdit && !isDeepStrictEqual(before, after)) {
            this.onEdit(label, before, after);
        }
        await this.calculateDirtyState();
    }

    private async broadcastState(): Promise<void> {
        await this.controller.refreshDebugAdapters();
        const debugAdapters = await this.controller.debugAdapters;
        const activeDebugger = this.controller.activeDebugger;

        await Promise.all([
            this.webviewManager.sendMessage({ type: 'DATA_CONTEXT_SELECTION', data: this.controller.solutionData }),
            this.webviewManager.sendMessage({ type: 'DEBUGGER', data: this.controller.activeDebuggerName }),
            this.webviewManager.sendMessage({ type: 'IS_DIRTY', data: this.isDirty }),
            this.webviewManager.sendMessage({ type: 'AUTO_UPDATE', data: this.configurationProvider.getConfigVariableOrDefault(manifest.CONFIG_AUTO_DEBUG_LAUNCH, true) }),
            this.webviewManager.sendMessage({ type: 'DEBUG_ADAPTERS', data: debugAdapters, sectionsInUse: activeDebugger?.sectionNames ?? [] }),
        ]);
    }

    private async handleMessage(message: OutgoingMessage): Promise<void> {
        switch (message.type) {
            case 'GET_CONTEXT_SELECTION_DATA':
                await this.sendContextData();
                break;
            case 'OPEN_FILE':
                await this.commandsProvider.executeCommand('vscode.open', vscode.Uri.file(message.path));
                break;
            case 'SET_SELECTED_CONTEXTS':
                await this.setSelectedContexts(message.data);
                break;
            case 'SET_SELECTED_TARGET':
                await this.setSelectedTarget(message.target, message.set);
                break;
            case 'GET_DEBUG_ADAPTERS':
                await this.sendDebugAdapters();
                break;
            case 'SET_DEBUGGER':
                await this.setSelectedDebugger(message.name);
                break;
            case 'ADD_NEW_CONTEXT':
                // not implemented yet
                break;
            case 'ADD_NEW_PROJECT':
                await this.addNewProject();
                break;
            case 'ADD_NEW_IMAGE':
                await this.addNewImage();
                break;
            case 'UNLINK_IMAGE':
                await this.unlinkImage(message.image);
                break;
            case 'SET_START_PROCESSOR':
                await this.updateStartProcessor(message.value);
                break;
            case 'SAVE_CONTEXT_SELECTION':
                await this.commandsProvider.executeCommand('workbench.action.files.save');
                break;
            case 'OPEN_HELP':
                await this.commandsProvider.executeCommand(OpenCommand.openHelpCommandId, 'manage_settings.html#active-target');
                break;
            case 'SET_DEBUG_ADAPTER_PROPERTY':
                await this.updateDebuggerParameter(message.service, message.key, message.value, message.pname);
                break;
            case 'SELECT_FILE':
                await this.selectFileDialog(message.requestId, message.options);
                break;
            case 'SET_AUTO_UPDATE':
                await this.configurationProvider.setConfigVariable(manifest.CONFIG_AUTO_DEBUG_LAUNCH, message.value, undefined, true);
                await this.webviewManager.sendMessage({ type: 'AUTO_UPDATE', data: message.value });
                break;
            case 'TOGGLE_DEBUGGER':
                await this.toggleDebugger(message.value);
                break;
            case 'TOGGLE_DEBUG_ADAPTER_SECTION':
                await this.toggleDebugAdapterSection(message.section);
                break;
        }
    }

    private async setSelectedTarget(target: string, set: string | undefined): Promise<void> {
        await this.withEdit('SET_SELECTED_TARGET', async () => {
            if (this.controller.setActiveTargetSet(target, set || undefined)) {
                await this.sendContextData();
            }
        });
    };

    private async toggleDebugAdapterSection(section: string): Promise<void> {
        await this.withEdit('TOGGLE_DEBUG_ADAPTER_SECTION', async () => {
            await this.controller.toggleDebugAdapterSection(section);
            await this.sendDebugAdapters();
        });
    }

    private async toggleDebugger(enabled: boolean): Promise<void> {
        await this.withEdit('TOGGLE_DEBUGGER', async () => {
            this.controller.enableDebugger(enabled);
            await this.sendContextData();
        });
    }

    private async updateDebuggerParameter(service: string | undefined, param: string, value: string | number, pname?: string) {
        await this.withEdit('UPDATE_DEBUGGER_PARAMETER', async () => {
            if (service && !this.controller.isDebuggerSectionEnabled(service)) {
                await this.controller.toggleDebugAdapterSection(service);
            }

            if ((pname === undefined || pname === null) || this.controller.availableCoreNames.length <= 1) {
                this.controller.setDebuggerParameter(service, param, value.toString());
            } else {
                this.controller.setDebuggerParameterWithPname(service, pname, param, value.toString());
            }
            await this.sendContextData();
        });
    }

    private async updateStartProcessor(name: string) {
        await this.updateDebuggerParameter('', 'start-pname', name);
    }

    public async saveChanges(): Promise<void> {
        if (!this.isDirty) {
            return;
        }
        await this.setBusyState(true);
        await this.controller.saveSolution(this.solutionManager);
        this.wasDirty = false;
        await this.setBusyState(false);
        await this.sendContextData();
    }

    public async revertToDisk(): Promise<void> {
        this._controller = this.createController();
        this.wasDirty = false;
        await this.sendContextData();
    }

    private async setSelectedContexts(selectedContextState: SolutionData): Promise<void> {
        await this.withEdit('SET_SELECTED_CONTEXTS', async () => {
            this.controller.solutionData = selectedContextState;
            await this.sendContextData();
        });
    }

    protected async querySaveModified(): Promise<void> {
        if (!this.isDirty) {
            return;
        }
        // for now only yes/no answers are supported, cancel can be only triggered externally when changing solution
        // todo: query all modifications from this and component views
        const result = await vscode.window.showWarningMessage(
            `Manage Solution: You have unsaved changes in ${this.getSolutionBasename()}. Do you want to save them?`,
            { modal: true },
            'Yes',
            'No'
        );
        if (result === 'Yes') {
            await this.saveChanges();
        }
    }

    /**
     * Loads csolution.ym file for editing
     * @returns true if solution file is successfully loaded
     */
    protected async loadSolution(): Promise<ETextFileResult> {
        const globalSolution = this.solutionManager.getCsolution(); // get global csolution
        if (this.controller.solutionPath !== globalSolution?.solutionPath) {
            // await this.querySaveModified();
            this._controller = this.createController(); // todo: use clear instead
        }
        if (!globalSolution) { // no solution is loaded in workspace
            return ETextFileResult.NotExists;
        }
        const defaultDebugAdapterName = await globalSolution.getDefaultDebugAdapterName();

        return this.controller.loadSolution(globalSolution.solutionPath, defaultDebugAdapterName);
    }

    private async clearContext(): Promise<void> {
        this._controller = undefined;
        this.wasDirty = false;
        await Promise.all([
            this.webviewManager.sendMessage({ type: 'DATA_CONTEXT_SELECTION', data: initialState.solutionData }),
            this.webviewManager.sendMessage({ type: 'DEBUG_ADAPTERS', data: [], sectionsInUse: [] }),
            this.webviewManager.sendMessage({ type: 'DEBUGGER', data: '' }),
            this.webviewManager.sendMessage({ type: 'IS_DIRTY', data: false }),
            this.webviewManager.sendMessage({ type: 'AUTO_UPDATE', data: false }),
        ]);
    }

    public async sendContextData(): Promise<void> {
        const result = await this.loadSolution();
        if (result === ETextFileResult.Error || result === ETextFileResult.NotExists) {
            await this.setBusyState(false);
            return;
        }

        const controller = this.controller;
        await controller.getAvailableCoreNames();
        await Promise.all([
            this.sendDebugAdapters(),
            this.webviewManager.sendMessage({ type: 'DATA_CONTEXT_SELECTION', data: controller.solutionData }),
            this.webviewManager.sendMessage({ type: 'DEBUGGER', data: controller.activeDebuggerName }),
            this.webviewManager.sendMessage({ type: 'IS_DIRTY', data: this.isDirty }),
            this.webviewManager.sendMessage({ type: 'AUTO_UPDATE', data: this.configurationProvider.getConfigVariableOrDefault(manifest.CONFIG_AUTO_DEBUG_LAUNCH, true) }),
            this.setBusyState(false),
        ]);
    }

    private async sendDebugAdapters(): Promise<void> {
        await this.controller.refreshDebugAdapters();

        const debugAdaters = await this.controller.debugAdapters;
        const activeDebugger = this.controller.activeDebugger;
        return this.webviewManager.sendMessage({
            type: 'DEBUG_ADAPTERS',
            data: debugAdaters,
            sectionsInUse: activeDebugger?.sectionNames ?? []
        });
    }

    private async addNewProject(): Promise<void> {
        await vscode.window.showWarningMessage('Not implemented');
    };

    private async unlinkImage(image: string): Promise<void> {
        await this.withEdit('UNLINK_IMAGE', async () => {
            await this.setBusyState(true);
            try {
                this.controller.activeTargetSetWrap.getImage(image)?.remove();
                await this.sendContextData();
            } finally {
                await this.setBusyState(false);
            }
        });
    }

    private async selectFileDialog(requestId: string, options?: FileSelectorOptionsType): Promise<void> {
        const solutionDir = this.getSolutionDir();
        if (options?.defaultUri) {
            options.defaultUri = URI.file(dirname(options.defaultUri)).toString();
        }

        const localOptions: vscode.OpenDialogOptions = {
            canSelectMany: options?.canSelectMany || false,
            openLabel: options?.openLabel || 'Select File',
            title: options?.title || 'Select File',
            filters: options?.filters || { 'All Files': ['*'] },
            defaultUri: options?.defaultUri ? URI.parse(options.defaultUri) : URI.file(solutionDir),
        };

        const fileUri = await vscode.window.showOpenDialog(localOptions);

        if (fileUri && fileUri[0]) {
            const paths = fileUri.map(u =>
                backToForwardSlashes(options?.pathType === 'absolute'
                    ? u.fsPath
                    : path.relative(solutionDir, u.fsPath)
                )
            );

            await this.webviewManager.sendMessage({ type: 'FILE_SELECTED', data: paths, requestId });
        } else {
            await this.webviewManager.sendMessage({ type: 'FILE_SELECTED', data: [], requestId });
        }
    }

    private async addNewImage() {
        await this.withEdit('ADD_IMAGE', async () => {
            await this.setBusyState(true);
            try {
                const solutionDir = this.getSolutionDir();
                const options: vscode.OpenDialogOptions = {
                    canSelectMany: false,
                    openLabel: 'Select File',
                    filters: {
                        'All Files': ['*'],
                        'All Image Files': ['axf', 'elf', 'hex', 'bin'],
                        'Executable in ELF format': ['axf', 'elf'],
                        'Intel HEX file in HEX-386 format': ['hex'],
                        'Binary Image': ['bin'],
                    },
                    defaultUri: URI.file(solutionDir),
                };

                const fileUri = await vscode.window.showOpenDialog(options);
                if (fileUri?.[0]) {
                    const filePath = backToForwardSlashes(path.relative(solutionDir, fileUri[0].fsPath));
                    this.controller.activeTargetSetWrap.addImage(filePath);
                    await this.sendContextData();
                }
            } finally {
                await this.setBusyState(false);
            }
        });
    }

    private async setSelectedDebugger(name: string): Promise<void> {
        await this.withEdit('SET_DEBUGGER', async () => {
            this.controller.setSelectedDebugger(name);
            await this.sendContextData();
        });
    }

    private async calculateDirtyState(): Promise<void> {
        if (this.wasDirty !== this.isDirty) {
            await this.webviewManager.sendMessage({ type: 'IS_DIRTY', data: this.isDirty });
        }
        this.wasDirty = this.isDirty;
    };
}
