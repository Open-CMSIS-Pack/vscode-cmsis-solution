/**
 * Copyright 2024-2026 Arm Limited
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

import path, { dirname } from 'path';
import * as vscode from 'vscode';
import { ExtensionContext } from 'vscode';
import { URI } from 'vscode-uri';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import * as manifest from '../../manifest';
import { SolutionLoadStateChangeEvent, SolutionManager } from '../../solutions/solution-manager';
import { backToForwardSlashes } from '../../utils/path-utils';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { ConfigurationProvider } from '../../vscode-api/configuration-provider';
import { WebviewManager, WebviewManagerOptions } from '../webview-manager';
import { ManageSolutionController } from './manage-solution-controller';
import { AdapterSettingsPresenter, type AdapterSettingsAction } from './adapter-settings-presenter';
import { settingsFields, type AdapterSnapshot, type SettingsActionRequest, type SettingsActionResult, type SettingsField } from './settings-contract';
import { IncomingMessage, OutgoingMessage } from './messages';
import { SolutionData } from './view/state/manage-solution-state';
import { initialState } from './view/state/reducer';
import debounce from 'lodash.debounce';
import { CsolutionService } from '../../json-rpc/csolution-rpc-client';
import { isDeepStrictEqual } from 'util';
import { OpenCommand } from '../solution-outline/commands/open-command';
import { IOpenFileExternal } from '../../open-file-external-if';

/** Carries a chosen file path and its validity token into the queued edit. */
type SettingsFileSelection = {
    editAction: string;
    token: symbol;
    value: string;
};

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
    private readonly settingsPresenter = new AdapterSettingsPresenter();
    /** Tracks file choices so edits and restored state invalidate delayed results. */
    private readonly fileSelections = new Map<string, symbol>();
    /** Orders model operations from admission, including asynchronous settings validation. */
    private editQueue: Promise<void> = Promise.resolve();

    private readonly absolutePath = (inputPath: string, baseDir: string) =>
        path.isAbsolute(inputPath) ? inputPath : path.resolve(baseDir, inputPath);

    constructor(
        context: ExtensionContext,
        protected readonly solutionManager: SolutionManager, // solutionManager is only used for didChange events. Other calls to csolution must be done using the csolution getter/setter
        private readonly commandsProvider: CommandsProvider,
        private readonly openFileExternal: IOpenFileExternal,
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
        const { solutionPath: newPath, converted: newConverted, loaded: newLoaded, activated: newActivated } = e.newState;
        const { solutionPath: prevPath, converted: prevConverted, loaded: prevLoaded, activated: prevActivated } = e.previousState;

        if (!this.webviewManager.isPanelActive || (newPath === prevPath && newConverted !== prevConverted && !newConverted)) {
            return;
        }

        this.setBusyState(true);

        let csolutionChanged = false;
        let defaultsUpdated = false;
        if (newPath !== prevPath) {
            if (newPath) {
                csolutionChanged = true;
            } else if (prevPath) {
                await this.clearContext();
                this.webviewManager.disposePanel();
                this.setBusyState(false);
                return;
            }
        } else if (newConverted !== prevConverted) {
            this.controller.updateDefaults(await this.solutionManager.getCsolution()?.getDefaultTargetConfiguration());
            defaultsUpdated = true;
        } else if (newActivated !== prevActivated) {
            csolutionChanged = true;
        } else if (newLoaded !== prevLoaded) {
            csolutionChanged = true;
        }

        const externalFilesChanged = csolutionChanged || defaultsUpdated ? false : this.controller.hasExternalFileChanges();

        if (csolutionChanged || externalFilesChanged) {
            this.fileSelections.clear();
            const result = await this.loadSolution();
            if (result === ETextFileResult.Error || result === ETextFileResult.NotExists) {
                this.setBusyState(false);
                return;
            }
        }

        const activeTargetTypeUpdated = !defaultsUpdated && await this.controller.ensureActiveTargetTypeName();

        if (csolutionChanged || externalFilesChanged || activeTargetTypeUpdated || defaultsUpdated) {
            await this.controller.getAvailableCoreNames();
            await this.sendContextDataFromControllerState();
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
            await this.sendAdapterSettings();
        }, manifest.CONFIG_AUTO_DEBUG_LAUNCH);

        await this.webviewManager.activate(context);
    }

    private async setBusyState(busy: boolean): Promise<void> {
        await this.webviewManager.sendMessage({ type: 'IS_BUSY', data: busy });
    }

    private getSolutionDir(): string {
        return dirname(this.controller?.solutionPath ?? '');
    }

    public attachToPanel(panel: vscode.WebviewPanel): void {
        this.webviewManager.attachPanel(panel);
    }

    /** Restores undo/redo state after earlier operations without recording another edit. */
    public async applySnapshot(snapshot: SolutionData): Promise<void> {
        this.fileSelections.clear();
        await this.enqueueOperation(async () => {
            this.fileSelections.clear();
            const previousContext = this.controller.getActiveTypeAndSetNames();
            this.controller.solutionData = this.cloneSolutionData(snapshot);
            if (!isDeepStrictEqual(previousContext, this.controller.getActiveTypeAndSetNames())) {
                await this.controller.getAvailableCoreNames();
            }
            await this.broadcastState();
        });
    }

    public getSolutionSnapshot(): SolutionData {
        return this.cloneSolutionData(this.controller.solutionData);
    }

    private cloneSolutionData(data: SolutionData): SolutionData {
        return structuredClone(data) as SolutionData;
    }

    /** Admits an operation immediately and lets later operations proceed after a failure. */
    private enqueueOperation<T>(action: () => Promise<T>): Promise<T> {
        const operation = this.editQueue.then(action);
        this.editQueue = operation.then(() => undefined, () => undefined);
        return operation;
    }

    /** Queues one undoable mutation alongside saves, restorations, and settings requests. */
    private async withEdit(label: string, action: () => Promise<void>): Promise<void> {
        await this.enqueueOperation(() => this.recordEdit(label, action));
    }

    /** Records one mutation while its caller holds the operation queue. */
    private async recordEdit(label: string, action: () => Promise<void>): Promise<void> {
        const before = this.cloneSolutionData(this.controller.solutionData);
        await action();
        const after = this.cloneSolutionData(this.controller.solutionData);
        if (this.onEdit && !isDeepStrictEqual(before, after)) {
            this.onEdit(label, before, after);
        }
        await this.calculateDirtyState();
    }

    private async settingsSnapshot(): Promise<AdapterSnapshot> {
        const autoUpdate = this.configurationProvider.getConfigVariableOrDefault(manifest.CONFIG_AUTO_DEBUG_LAUNCH, true);
        return this.settingsPresenter.prepare(await this.controller.adapterSettingsContext(autoUpdate));
    }

    private async sendAdapterSettings(): Promise<void> {
        await this.webviewManager.sendMessage({ type: 'ADAPTER_SETTINGS', snapshot: await this.settingsSnapshot() });
    }

    /** Acknowledges an action with its outcome and the canonical settings snapshot. */
    private async applySettingsRequest(request: SettingsActionRequest): Promise<void> {
        let status: SettingsActionResult['status'] = 'rejected';
        try {
            status = await this.executeSettingsRequest(request);
        } catch {
            status = 'rejected';
        }

        await this.webviewManager.sendMessage({
            type: 'SETTINGS_ACTION_RESULT',
            result: { requestId: request.requestId, status, snapshot: await this.settingsSnapshot() },
        });
    }

    /** Orders validation, edits, and Open while releasing the queue before a file dialog. */
    private async executeSettingsRequest(request: SettingsActionRequest): Promise<SettingsActionResult['status']> {
        const prepared = await this.enqueueOperation(async () => {
            const snapshot = await this.settingsSnapshot();
            const action = this.settingsPresenter.resolve(request);
            if (!action) {
                return 'rejected';
            }

            if (action.kind !== 'browse' && action.kind !== 'open') {
                return this.commitSettingsAction(request);
            }

            const field = settingsFields(snapshot.sections).find(field => field.type === 'file'
                && (field.browseAction === request.actionId || field.openAction === request.actionId));
            if (!field) {
                return 'rejected';
            }

            if (action.kind === 'open') {
                await this.openFile(field.value.toString());
                return 'applied';
            }

            if (!field.editAction) {
                return 'rejected';
            }
            const token = Symbol();
            this.fileSelections.set(field.editAction, token);
            return { action, field, token };
        });

        if (typeof prepared === 'string') {
            return prepared;
        }

        return this.browseSettingsFile(request, prepared.action, prepared.field, prepared.token);
    }

    /** Selects and converts a file path, retaining its validity token until the queued edit finishes. */
    private async browseSettingsFile(
        request: SettingsActionRequest,
        action: AdapterSettingsAction,
        field: SettingsField,
        token: symbol,
    ): Promise<SettingsActionResult['status']> {
        const editAction = field.editAction;
        if (!editAction) {
            return 'rejected';
        }

        const solutionDir = this.getSolutionDir();
        const currentPath = field.value.toString();
        try {
            const files = await vscode.window.showOpenDialog({
                canSelectMany: false,
                openLabel: 'Select File',
                title: action.option?.description ?? 'Select File',
                filters: { 'All Files': ['*'] },
                defaultUri: vscode.Uri.file(currentPath ? this.absolutePath(currentPath, solutionDir) : solutionDir),
            });

            await this.settingsSnapshot();
            if (!this.settingsPresenter.resolve(request) || this.fileSelections.get(editAction) !== token) {
                return 'rejected';
            }

            const selectedFile = files?.[0];
            if (!selectedFile) {
                return 'cancelled';
            }

            const selectedPath = action.option?.['path-type'] === 'absolute'
                ? selectedFile.fsPath
                : path.relative(solutionDir, selectedFile.fsPath);
            const value = backToForwardSlashes(selectedPath);

            return await this.enqueueOperation(() => this.commitSettingsAction(request, { editAction, token, value }));
        } finally {
            if (this.fileSelections.get(editAction) === token) {
                this.fileSelections.delete(editAction);
            }
        }
    }

    /** Revalidates and records an action while its caller holds the operation queue. */
    private async commitSettingsAction(
        request: SettingsActionRequest,
        selection?: SettingsFileSelection,
    ): Promise<SettingsActionResult['status']> {
        let status: SettingsActionResult['status'] = 'rejected';

        await this.recordEdit('UPDATE_ADAPTER_SETTINGS', async () => {
            await this.settingsSnapshot();
            const current = this.settingsPresenter.resolve(request);
            if (!current || (selection && this.fileSelections.get(selection.editAction) !== selection.token)) {
                return;
            }

            const action = selection ? { ...current, kind: 'edit' as const, value: selection.value } : current;
            switch (action.kind) {
                case 'adapter':
                    this.controller.setSelectedDebugger(action.value as string);
                    break;
                case 'enableDebugger':
                    this.controller.enableDebugger(action.value as boolean);
                    break;
                case 'processor':
                    this.controller.activeDebugger!.startPname = action.value as string;
                    break;
                case 'autoUpdate':
                    await this.configurationProvider.setConfigVariable(manifest.CONFIG_AUTO_DEBUG_LAUNCH, action.value, undefined, true);
                    break;
                default:
                    if (action.kind === 'edit') {
                        this.fileSelections.delete(request.actionId);
                    }
                    this.controller.applySettingsAction(action);
            }

            status = 'applied';
            await this.sendContextDataFromControllerState();
        });

        return status;
    }

    /** Keep raw debugger configuration out of table messages and prevent it returning in project edits. */
    private browserSolutionData(): SolutionData {
        const data = this.cloneSolutionData(this.controller.solutionData);
        for (const target of [...data.targets, ...(data.selectedTarget ? [data.selectedTarget] : [])]) {
            target.targetSets?.forEach(set => { delete set.debugger; });
        }
        return data;
    }

    private async broadcastState(): Promise<void> {
        await Promise.all([
            this.sendAdapterSettings(),
            this.webviewManager.sendMessage({ type: 'DATA_CONTEXT_SELECTION', data: this.browserSolutionData() }),
            this.webviewManager.sendMessage({ type: 'IS_DIRTY', data: this.isDirty }),
        ]);
    }

    private async openFile(filePath: string, openExternal?: boolean): Promise<void> {
        const solutionDir = this.getSolutionDir();
        const resolvedPath = (!path.isAbsolute(filePath) && solutionDir) && !filePath.match(/^http.:\/\//)
            ? path.join(solutionDir, filePath)
            : filePath;
        if (openExternal) {
            this.openFileExternal.openFile(resolvedPath);
        } else {
            await this.commandsProvider.executeCommand('vscode.open', vscode.Uri.file(resolvedPath));
        }
    }

    private async handleMessage(message: OutgoingMessage): Promise<void> {
        switch (message.type) {
            case 'GET_ADAPTER_SETTINGS': await this.sendAdapterSettings(); break;
            case 'SETTINGS_ACTION': await this.applySettingsRequest(message.request); break;
            case 'GET_CONTEXT_SELECTION_DATA':
                await this.sendContextData();
                break;
            case 'OPEN_FILE':
                await this.openFile(message.path, message.external);
                break;
            case 'SET_SELECTED_CONTEXTS':
                await this.setSelectedContexts(message.data);
                break;
            case 'SET_SELECTED_TARGET':
                await this.setSelectedTarget(message.target, message.set);
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
            case 'SAVE_CONTEXT_SELECTION':
                await this.commandsProvider.executeCommand('workbench.action.files.save');
                break;
            case 'OPEN_HELP':
                await this.commandsProvider.executeCommand(OpenCommand.openHelpCommandId, 'manage_settings.html#active-target');
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

    /** Saves after previously admitted edits, checking dirty state only when they have finished. */
    public async saveChanges(force: boolean = false): Promise<void> {
        await this.enqueueOperation(async () => {
            if (!this.isDirty && !force) {
                return;
            }
            await this.setBusyState(true);
            try {
                const saved = await this.controller.saveSolution(this.solutionManager);
                if (saved) {
                    this.wasDirty = false;
                    await this.sendContextData();
                }
            } finally {
                await this.setBusyState(false);
            }
        });
    }

    public async revertToDisk(): Promise<void> {
        this.fileSelections.clear();
        this._controller = this.createController();
        this.wasDirty = false;
        await this.sendContextData();
    }

    private async setSelectedContexts(selectedContextState: SolutionData): Promise<void> {
        await this.withEdit('SET_SELECTED_CONTEXTS', async () => {
            this.controller.applyDialogSelection(selectedContextState);
            await this.sendContextData();
        });
    }

    /**
     * Loads csolution.ym file for editing
     * @returns true if solution file is successfully loaded
     */
    protected async loadSolution(): Promise<ETextFileResult> {
        const globalSolution = this.solutionManager.getCsolution(); // get global csolution
        if (this.controller.solutionPath !== globalSolution?.solutionPath) {
            this._controller = this.createController(); // todo: use clear instead
        }
        if (!globalSolution) { // no solution is loaded in workspace
            return ETextFileResult.NotExists;
        }
        const defaults = await globalSolution.getDefaultTargetConfiguration();

        return this.controller.loadSolution(globalSolution.solutionPath, defaults);
    }

    private async clearContext(): Promise<void> {
        this.fileSelections.clear();
        this._controller = undefined;
        this.wasDirty = false;
        await Promise.all([
            this.webviewManager.sendMessage({ type: 'DATA_CONTEXT_SELECTION', data: initialState.solutionData }),
            this.webviewManager.sendMessage({ type: 'IS_DIRTY', data: false }),
        ]);
    }

    public async sendContextData(): Promise<void> {
        const result = await this.loadSolution();
        if (result === ETextFileResult.Error || result === ETextFileResult.NotExists) {
            await this.setBusyState(false);
            return;
        }

        await this.controller.getAvailableCoreNames();
        await this.sendContextDataFromControllerState();
    }

    private async sendContextDataFromControllerState(): Promise<void> {
        await Promise.all([
            this.sendAdapterSettings(),
            this.webviewManager.sendMessage({ type: 'DATA_CONTEXT_SELECTION', data: this.browserSolutionData() }),
            this.webviewManager.sendMessage({ type: 'IS_DIRTY', data: this.isDirty }),
            this.setBusyState(false),
        ]);
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
                    await this.controller.addImage(filePath);
                    await this.sendContextData();
                }
            } finally {
                await this.setBusyState(false);
            }
        });
    }

    private async calculateDirtyState(): Promise<void> {
        if (this.wasDirty !== this.isDirty) {
            await this.webviewManager.sendMessage({ type: 'IS_DIRTY', data: this.isDirty });
        }
        this.wasDirty = this.isDirty;
    };
}
