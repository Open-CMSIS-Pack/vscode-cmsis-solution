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
import * as manifest from '../../manifest';
import * as Messages from './messages';
import path, { dirname } from 'path';
import { ComponentInstance, CsolutionService, CtAggregate, CtRoot, Pack, PackReference, PacksInfo, Results, UsedItems } from '../../json-rpc/csolution-rpc-client';
import { IOpenFileExternal } from '../../open-file-external-if';
import { ProjectFileUpdater, ProjectFileUpdaterImpl } from '../../solutions/edit/project-file-updater';
import { SolutionLoadStateChangeEvent, SolutionManager } from '../../solutions/solution-manager';
import { backToForwardSlashes, getFileNameNoExt } from '../../utils/path-utils';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { MessageProvider } from '../../vscode-api/message-provider';
import { COutlineItem } from '../solution-outline/tree-structure/solution-outline-item';
import { WebviewManager, WebviewManagerOptions } from '../webview-manager';
import { BuildContext, Project, TargetSetData } from './components-data';
import { ComponentsPacksActions, CurrentProject, normalizeForCompare } from './components-packs-actions';
import { ComponentRowDataType, ComponentScope, PackRowDataType, PackRowReferenceDataType } from './data/component-tools';
import { componentTreeWalker } from './data/component-tree-walker';
import { cloneDeep, uniqWith } from 'lodash';
import { parsePackId } from './data/pack-parse';
import { lineOf, readTextFile } from '../../utils/fs-utils';
import { stripTwoExtensions } from '../../utils/string-utils';
import { getLatestAvailablePacks } from '../../packs/index-pidx-file';
import { isDeepStrictEqual } from 'util';

export const MANAGE_COMPONENTS_WEBVIEW_OPTIONS: Readonly<WebviewManagerOptions> = {
    title: 'Software Components',
    scriptPath: 'dist/views/manageComponentsPacks.js',
    viewType: 'cmsis.manageComponentsPacks',
    iconName: {
        dark: 'software-components-dark.svg',
        light: 'software-components-light.svg'
    }
};

const createProject = (cprojectPath: string): Project => {
    return { projectId: cprojectPath, projectName: getFileNameNoExt(cprojectPath) };
};

const packsRowFromInfo = (packInfo: Pack, solutionPath: string): PackRowDataType => {
    const pack = parsePackId(packInfo.id);
    const solutionDir = dirname(solutionPath);
    const references = uniqWith((packInfo.references || []).map(ref => ({
        ...ref,
        relOrigin: backToForwardSlashes(path.relative(solutionDir, ref.origin)),
        relPath: ref.path ? backToForwardSlashes(path.relative(solutionDir, ref.path)) : undefined,
    } satisfies PackRowReferenceDataType)), (left, right) => left.origin === right.origin && left.pack === right.pack);

    return {
        key: packInfo.id,
        name: pack ? (pack.vendor ? `${pack.vendor}::${pack.packName}` : pack.packName) : packInfo.id,
        packId: packInfo.id,
        versionUsed: pack?.versionOperator ? pack.versionOperator + pack.version : (pack?.version || ''),
        versionTarget: '',
        description: packInfo.description || '',
        used: packInfo.used || false,
        references,
        overviewLink: packInfo.doc || ''
    };
};

const packsRowsFromInfo = (packsInfo: PacksInfo, solutionPath: string): PackRowDataType[] => {
    return (packsInfo.packs || []).map(pack => packsRowFromInfo(pack, solutionPath));
};

type ManageComponentsCommandPayload = {
    type: 'context';
    value: string;
};

export class ComponentsPacksWebviewMain {
    private readonly webviewManager: WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>;

    public static readonly WEBVIEW_COMMAND_ID = `${manifest.PACKAGE_NAME}.manageComponentsPacks`;

    private project: CurrentProject;

    private componentTree!: CtRoot;
    private validations!: Results;
    private selectedContext: TargetSetData | undefined;
    public usedItems!: UsedItems; // loaded after load solution and after apply calls. need to use this data
    private cachedTargetSetData?: TargetSetData[];

    private readonly projectFileUpdater: ProjectFileUpdater;

    private readonly manageComponentsActions: ComponentsPacksActions = new ComponentsPacksActions();

    private scope: ComponentScope = ComponentScope.Solution;

    private isLoading = false;
    private readonly unlinkRequests: Set<string> = new Set<string>();
    private availablePacksCache: Record<string, string> = {}; // this cache must be invalidated, if a new pack was installed

    constructor(
        private readonly solutionManager: SolutionManager,
        private readonly csolutionService: CsolutionService,
        context: vscode.ExtensionContext,
        private readonly messageProvider: MessageProvider,
        private readonly commandsProvider: CommandsProvider,
        private readonly openFileExternal: IOpenFileExternal,
        webviewManager?: WebviewManager<Messages.IncomingMessage, Messages.OutgoingMessage>,
    ) {
        this.webviewManager = webviewManager ??
            new WebviewManager(context, MANAGE_COMPONENTS_WEBVIEW_OPTIONS, commandsProvider);
        this.manageComponentsActions.setCsolutionService(this.csolutionService);
        this.manageComponentsActions.setMessageProvider(this.messageProvider);
        this.projectFileUpdater = new ProjectFileUpdaterImpl(this.solutionManager);
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.webviewManager.onDidReceiveMessage(this.handleMessage, this),
            this.webviewManager.onDidDispose(this.dispose, this),
            this.solutionManager.onDidChangeLoadState(this.handleSolutionLoadChange, this),
            this.commandsProvider.registerCommand(manifest.MANAGE_COMPONENTS_PACKS_COMMAND_ID, this.handleWebviewCommand, this),
        );

        await this.webviewManager.activate(context);
    }

    private dispose(): void {
        this.disposeInternal().catch((error) => {
            // Ensure any errors during dispose do not become unhandled promise rejections.
            console.error('Error during ComponentsPacksWebviewMain.dispose:', error);
        });
    }

    private async disposeInternal(): Promise<void> {
        const discardView = () => {
            this.currentProject = undefined;
            this.componentTree = { success: false, classes: [] };
            this.validations = { success: false, result: 'UNDEFINED', validation: [] };
            this.usedItems = { components: [], packs: [], success: false };
            this.cachedTargetSetData = undefined;
            this.availablePacksCache = {};
            this.unlinkRequests.clear();
            this.isLoading = false;
            this.scope = ComponentScope.Solution;
        };

        const hasBaseline = this.usedItems !== undefined;

        if (hasBaseline && await this.isDirty()) {
            const buttonOptions = [
                { title: 'Save' },
                { title: 'Don\'t Save' },
                { title: 'Cancel', isCloseAffordance: true },
            ];
            const messageOptions: vscode.MessageOptions = { modal: true, detail: 'Your changes will be lost if you don\'t save them. Press cancel to continue editing.' };

            const pick = (await vscode.window.showWarningMessage(
                'Do you want to save the changes you made to the Solution?',
                messageOptions,
                ...buttonOptions,
            )) || { title: 'Cancel' };

            switch (pick.title) {
                case 'Save':
                    await this.handleApplyComponentSet();
                    discardView();
                    break;
                case 'Cancel':
                    this.webviewManager.createOrShowPanel();
                    break;
                case 'Don\'t Save':
                default:
                    discardView();
                    break;
            }
        } else {
            discardView();
        }
    }

    set currentProject(project: CurrentProject | undefined) {
        this.project = project;
        this.manageComponentsActions.setCurrentProject(project);
    }

    get currentProject(): CurrentProject | undefined {
        return this.project;
    }

    private resolveProjectPathFromContext(context: string): string | undefined {
        const descriptors = this.solutionManager.getCsolution()?.getContextDescriptors();
        return descriptors?.find(descriptor => descriptor.displayName === context)?.projectPath;
    }

    private async handleWebviewCommand(commandArg: COutlineItem | ManageComponentsCommandPayload | undefined) {
        if (commandArg instanceof COutlineItem) {
            await this.openWebview(commandArg.cprojectPath, commandArg.clayerPath);
            return;
        }

        if (commandArg?.type === 'context') {
            const projectId = this.resolveProjectPathFromContext(commandArg.value);
            if (!projectId) {
                this.messageProvider.showWarningMessage(`No valid project found for context: ${commandArg.value}.`);
                return;
            }

            await this.openWebview(projectId, undefined);
            return;
        }

        const projectId = this.getValidProjectId();
        if (!projectId) {
            this.messageProvider.showWarningMessage('No valid project found in the active solution.');
            return;
        }

        await this.openWebview(projectId, undefined);
    }

    private projectFromPath(path: string | undefined): string {
        const contexts = this.createBuildContextDeps();
        const ctx = contexts.find(ctx =>
            ctx.projectPath === path ||
            (ctx.layers && ctx.layers.some(layer => layer.path === path))
        );
        if (!ctx) return '';
        return ctx.projectPath || '';
    }

    public async openWebview(cprojectPath: string | undefined, clayerPath: string | undefined): Promise<void> {
        if (!cprojectPath) {
            return; // nothing to show
        }

        const reload = this.currentProject === undefined ||
            this.projectFromPath(this.currentProject.project.projectId) !== this.projectFromPath(cprojectPath);
        const csolution = this.solutionManager.getCsolution();
        if (csolution) {
            this.currentProject = { solutionPath: csolution.solutionPath, project: createProject(cprojectPath) };
        }

        if (clayerPath) {
            const selectedTarget = this.findTargetSetFromPath(clayerPath);
            if (selectedTarget) {
                this.selectedContext = selectedTarget;
            }
        } else {
            this.selectedContext = undefined;
        }
        this.webviewManager.createOrShowPanel();

        await this.debounce_load(cprojectPath, reload);
        await this.sendDirtyState();
    }

    private async handleSolutionLoadChange(e: SolutionLoadStateChangeEvent): Promise<void> {
        if (!this.webviewManager.isPanelActive) {
            return;
        }

        const csolution = this.solutionManager.getCsolution();
        if (e.newState.converted == true && e.previousState.converted == false) {
            return;
        }

        if (csolution && e.newState.solutionPath) {
            // in case of switching a solution we need to track the correct or first project from the solution to keep this.currentProject active
            if (e.newState.solutionPath !== this.project?.solutionPath) {
                this.currentProject = undefined;
            }

            const validProjectId = this.getValidProjectId();
            if (!validProjectId) {
                this.currentProject = undefined;
            }
            if (validProjectId && validProjectId !== this.currentProject?.project.projectId) {
                this.currentProject = { solutionPath: csolution.solutionPath, project: createProject(validProjectId) };
            }

            if (this.currentProject) {
                await this.debounce_load(this.currentProject.project.projectId, true);
            } else {
                await this.clearComponents();
                await this.webviewManager.sendMessage({
                    type: 'SET_ERROR_MESSAGES', messages: [
                        { type: 'ERROR', message: 'No valid project found in the loaded solution' }
                    ]
                });
            }
        } else {
            await this.clearComponents();
        }
    }

    /**
     * Return the projectId specified in the currentProject or return the first
     * project available from the current TargetSet specified in csolution.
     * @returns the valid projectId or undefined if no csolution or projects are available
     */
    private getValidProjectId(): string | undefined {
        const csolution = this.solutionManager.getCsolution();
        if (csolution) {
            if (this.currentProject?.project.projectId && csolution.getCproject(this.currentProject.project.projectId)) {
                return this.currentProject.project.projectId;
            }
            const firstProjectPath = csolution?.getContextDescriptors()
                .find(ctx => ctx.targetType === csolution.getActiveTargetSetName())
                ?.projectPath;
            return firstProjectPath ?? csolution.getCprojectPath();
        }
        return undefined;
    }

    private async isDirty(usedItems?: UsedItems): Promise<boolean> {
        const actx = this.getActiveContext();

        if (this.solutionManager.getCsolution()?.cbuildPackFile.isModified()) {
            return true;
        }

        const latestUsedItems = usedItems ?? await this.csolutionService.getUsedItems({ context: actx });
        if (this.usedItems?.packs?.length !== latestUsedItems.packs?.length || this.usedItems?.components?.length !== latestUsedItems.components?.length) {
            return true;
        }

        const componentMapper = (c: ComponentInstance) => ({ id: c.id, variant: c.resolvedComponent?.pack });
        const packMapper = (p: PackReference) => ({ pack: p.pack, origin: normalizeForCompare(p.origin) });
        const localUsedItemsSorted = {
            components: [...(this.usedItems?.components ?? [])].sort((a, b) => a.id.localeCompare(b.id)).map(componentMapper),
            packs: [...(this.usedItems?.packs ?? [])].sort((a, b) => a.pack.localeCompare(b.pack)).map(packMapper),
        };
        const usedItemsSorted = {
            components: [...(latestUsedItems.components ?? [])].sort((a, b) => a.id.localeCompare(b.id)).map(componentMapper),
            packs: [...(latestUsedItems.packs ?? [])].sort((a, b) => a.pack.localeCompare(b.pack)).map(packMapper),
        };
        const usedItemsChanged = !isDeepStrictEqual(localUsedItemsSorted, usedItemsSorted);
        return usedItemsChanged;
    }

    private async sendDirtyState(options?: { skipApply?: boolean, usedItems?: UsedItems }): Promise<void> {
        const actx = this.getActiveContext();
        if (!options?.skipApply) {
            await this.csolutionService.apply({ context: actx });
        }

        const isDirty = await this.isDirty(options?.usedItems);
        await this.webviewManager.sendMessage({ type: 'IS_DIRTY', isDirty: isDirty });
    }


    // Use direct method call with mutex
    private async debounce_load(projectId: string, reload: boolean): Promise<void> {
        if (this.isLoading) {
            console.log('Load already in progress, ignoring request');
            return;
        }
        this.isLoading = true;
        try {
            await this.load(projectId, reload);
        } finally {
            this.isLoading = false;
        }
    }

    private async load(projectId: string, reload: boolean): Promise<void> {
        const csolution = this.solutionManager.getCsolution();
        if (csolution) {
            this.clearTargetSetCache();
            this.currentProject = { solutionPath: csolution.solutionPath, project: createProject(projectId) };
            const actx = this.getActiveContext();

            const activeTs = csolution.getActiveTargetSetName() ?? '';
            await this.loadSolution(csolution.solutionPath, activeTs, actx, reload);
            await this.sendSelectedProject(backToForwardSlashes(projectId));
        }
    }

    private async loadSolution(solutionPath: string, activeTargetSet: string, activeContext: string, reload: boolean): Promise<void> {
        await this.webviewManager.sendMessage({ type: 'SET_ERROR_MESSAGES', messages: [] });

        try {
            if (reload) {
                this.availablePacksCache = {};
                this.unlinkRequests.clear();
                await this.webviewManager.sendMessage({ type: 'SET_SOLUTION_STATE', stateMessage: 'Connecting to rpc daemon' });
                const version = await this.csolutionService.getVersion();
                console.log('csolution version:', version);

                await this.webviewManager.sendMessage({ type: 'SET_SOLUTION_STATE', stateMessage: 'Loading Packs...' });
                await this.csolutionService.loadPacks();

                await this.webviewManager.sendMessage({ type: 'SET_SOLUTION_STATE', stateMessage: 'Loading Solution...' });
                const solutionSuccess = await this.csolutionService.loadSolution({ solution: solutionPath, activeTarget: activeTargetSet });
                if (!solutionSuccess.success) {
                    throw new Error(`Failed loading solution: ${solutionPath} due to previous errors`);
                }

                await this.webviewManager.sendMessage({ type: 'SET_SOLUTION_STATE', stateMessage: 'Retrieving assigned items...' });
                this.usedItems = await this.csolutionService.getUsedItems({ context: activeContext });
            }
            await this.webviewManager.sendMessage({ type: 'SET_UNLINKREQUESTS_STACK', unlinkRequests: Array.from(this.unlinkRequests) });
            await this.sendSolutionData();
            if (reload) {
                await this.sendDirtyState();
            } else {
                await this.sendDirtyState({ skipApply: true });
            }
        } catch (error) {
            const messages = await this.csolutionService.getLogMessages();

            const msg = error instanceof Error ? error.message : String(error);
            console.error('Failed requesting csolution pipeline: ', error);

            await Promise.all([
                this.webviewManager.sendMessage({ type: 'IS_DIRTY', isDirty: false }),
                this.webviewManager.sendMessage({ type: 'SET_COMPONENT_TREE', tree: { success: false, classes: [] }, validations: [] }),
                this.webviewManager.sendMessage({ type: 'SET_SOLUTION_STATE', stateMessage: undefined }),
                this.webviewManager.sendMessage({
                    type: 'SET_ERROR_MESSAGES', messages: [
                        { type: 'ERROR', message: msg },
                        ...messages.errors?.map(e => ({ type: 'ERROR' as const, message: e })) ?? [],
                        ...messages.warnings?.map(w => ({ type: 'WARNING' as const, message: w })) ?? [],
                        ...messages.info?.map(w => ({ type: 'INFO' as const, message: w })) ?? [],
                    ]
                })
            ]);
        }
    }

    private getSelectedTargetSetData(): TargetSetData | undefined {
        if (!this.selectedContext) {
            const normalizedProjectId = normalizeForCompare(this.currentProject?.project.projectId || '');
            this.selectedContext = this.getTargetSetData().find(ts => normalizeForCompare(ts.path) === normalizedProjectId);
            if (!this.selectedContext) {
                this.selectedContext = this.getTargetSetData()?.at(0);
            }
        }
        return this.selectedContext;
    }

    private clearTargetSetCache(): void {
        this.cachedTargetSetData = undefined;
    }

    private getRelativePath(fromDir: string, toPath: string): string {
        return backToForwardSlashes(path.relative(fromDir, toPath));
    }

    private getSolutionDir(): string {
        return dirname(this.project?.solutionPath ?? '');
    }

    private getTargetSetData(): TargetSetData[] {
        if (this.cachedTargetSetData) {
            return this.cachedTargetSetData;
        }

        const targets: TargetSetData[] = [];

        this.solutionManager.getCsolution()?.projects.forEach(proj => {
            const contextDescriptor = this.solutionManager.getCsolution()?.getContextDescriptors().find(d => d.projectPath === proj.fileName);
            const normalizedPath = backToForwardSlashes(proj.fileName);
            if (contextDescriptor) {
                const ptarget: TargetSetData = {
                    label: contextDescriptor.displayName,
                    key: normalizedPath,
                    path: normalizedPath,
                    relativePath: this.getRelativePath(this.getSolutionDir(), proj.fileName),
                    type: 'project' as const
                };

                const finder = /\.cgen\.ya?ml$/i;

                contextDescriptor.layers?.forEach(layer => {
                    if (finder.test(layer.absolutePath)) {
                        return;
                    }
                    const layerLabel = layer.displayName
                        || getFileNameNoExt(layer.absolutePath);
                    const ltarget: TargetSetData = {
                        label: `Layer: ${layerLabel}`,
                        key: layer.absolutePath,
                        path: backToForwardSlashes(layer.absolutePath),
                        relativePath: this.getRelativePath(this.getSolutionDir(), layer.absolutePath),
                        type: 'layer' as const
                    };

                    if (!ptarget.children) {
                        ptarget.children = [];
                    }
                    ptarget.children.push(ltarget);
                });

                targets.push(ptarget);
            }
        });

        this.cachedTargetSetData = targets;
        return targets;
    };

    private async handleRequestInitialData(): Promise<void> {
        const cprojectPath = this.getValidProjectId();
        this.scope = ComponentScope.Solution;
        if (cprojectPath) {
            const reload = this.projectFromPath(this.currentProject?.project.projectId) !== this.projectFromPath(cprojectPath);

            await this.debounce_load(cprojectPath, reload);
        }
    }

    private async handleChangeComponentScope(message: Messages.OutgoingMessage): Promise<void> {
        if (isChangeComponentScopeMessage(message)) {
            this.scope = message.scope;
        }
        await this.debounce_load(this.project?.project.projectId ?? '', false);
    }

    private async handleApplyComponentSet(): Promise<void> {
        await this.webviewManager.sendMessage({ type: 'SET_SOLUTION_STATE', stateMessage: 'Saving changes...' });

        if (this.solutionManager.getCsolution()?.cbuildPackFile.isModified()) {
            await this.solutionManager.getCsolution()?.cbuildPackFile.save();
            await this.handleRequestInitialData();
            this.unlinkRequests.clear();
        }

        const activeContext = this.getActiveContext();
        const state = await this.csolutionService.apply({ context: activeContext });
        this.usedItems = await this.csolutionService.getUsedItems({ context: activeContext });
        const usedItemsForProjectFileUpdate = cloneDeep(this.usedItems);
        const projectFileName = this.project?.project.projectId ?? '';
        const requestAll = this.scope === ComponentScope.All;
        this.componentTree = this.manageComponentsActions.mapComponentsFromService(await this.csolutionService.getComponentsTree({ context: activeContext, all: requestAll }));
        this.validations = await this.csolutionService.validateComponents({ context: activeContext });
        await this.projectFileUpdater.updateUsedItems(activeContext, projectFileName, usedItemsForProjectFileUpdate);

        await Promise.all([
            this.webviewManager.sendMessage({ type: 'SET_ERROR_MESSAGES', messages: [] }),
            this.webviewManager.sendMessage({ type: 'SET_COMPONENT_TREE', tree: this.componentTree, validations: this.validations.validation ?? [], scope: this.scope })
        ]);
        if (state.success === false) {
            this.webviewManager.sendMessage({ type: 'SET_SOLUTION_STATE', stateMessage: state.message ?? 'Unspecified error when writing solution information' });
        }
        await this.sendDirtyState({ skipApply: true, usedItems: usedItemsForProjectFileUpdate });
    }

    private async handleOpenFile(message: Messages.OutgoingMessage): Promise<void> {
        if (isOpenDocFileMessage(message)) {
            this.openFile(message.uri, message.external, message.focusOn);
        }
    }

    private async handleChangeComponentValue(message: Messages.OutgoingMessage): Promise<void> {
        if (isChangeComponentValueMessage(message)) {
            const { componentData } = message;
            const activeContext = this.getActiveContext();
            if (activeContext) {
                await this.manageComponentsActions.changeComponentValue(
                    activeContext,
                    this.componentTree,
                    componentData
                );

                await this.sendDirtyState();
                await this.refreshComponentTree(activeContext);
            }
        }
    }

    private async handleChangeComponentVariant(message: Messages.OutgoingMessage): Promise<void> {
        if (isChangeComponentVariantMessage(message)) {
            const { componentData, variant } = message;
            const activeContext = this.getActiveContext();
            if (activeContext) {
                await this.manageComponentsActions.changeComponentVariant(
                    activeContext,
                    componentData,
                    variant
                );
                await this.sendDirtyState();
                await this.refreshComponentTree(activeContext);
            }
        }
    }

    private async handleChangeComponentBundle(message: Messages.OutgoingMessage): Promise<void> {
        if (isChangeComponentBundleMessage(message)) {
            const { componentData, bundle } = message;
            const activeContext = this.getActiveContext();
            if (activeContext) {
                await this.manageComponentsActions.changeBundle(
                    activeContext,
                    componentData,
                    bundle
                );
                await this.sendDirtyState();
                await this.refreshComponentTree(activeContext);
            }
        }
    }

    // A targetSet given by it's relative path from the UI is located in the current list of targets
    private findTargetSetFromPath(path: string): TargetSetData | undefined {
        const targets = this.getTargetSetData();

        if (/\.clayer\.ya?ml$/i.test(path)) {
            return targets
                .flatMap(project => project.children || [])
                .find(layer => backToForwardSlashes(layer.path) === backToForwardSlashes(path));
        }

        return targets.find(t => backToForwardSlashes(t.path) === backToForwardSlashes(path));
    }

    private projectFromLayer(layerPath: string | undefined): string {
        if (!layerPath) {
            return '';
        }

        const contexts = this.createBuildContextDeps();
        const ctx = contexts.find(ctx =>
            ctx.layers?.some(layer => backToForwardSlashes(layer.path) === backToForwardSlashes(layerPath))
        );
        if (!ctx) return '';
        return ctx.projectPath || '';
    }

    private async handleChangeTarget(message: Messages.OutgoingMessage): Promise<void> {
        if (!isChangeContextMessage(message)) {
            return undefined;
        }
        const selectedTarget = this.findTargetSetFromPath(message.targetSet.path);
        if (selectedTarget) {
            this.selectedContext = selectedTarget;
            const path = selectedTarget.type === 'project'
                ? selectedTarget.path
                : this.projectFromLayer(selectedTarget.path);
            await this.debounce_load(path || '', false);
        }
    }

    private async handleMessage(message: Messages.OutgoingMessage): Promise<void> {
        const csolution = this.solutionManager.getCsolution();
        if (csolution) {
            switch (message.type) {
                case 'REQUEST_INITIAL_DATA':
                    await this.handleRequestInitialData();
                    break;
                case 'CHANGE_COMPONENT_SCOPE':
                    await this.handleChangeComponentScope(message);
                    break;
                case 'APPLY_COMPONENT_SET':
                    await this.handleApplyComponentSet();
                    break;
                case 'OPEN_FILE':
                    this.handleOpenFile(message);
                    break;
                case 'CHANGE_COMPONENT_VALUE':
                    await this.handleChangeComponentValue(message);
                    break;
                case 'CHANGE_COMPONENT_VARIANT':
                    await this.handleChangeComponentVariant(message);
                    break;
                case 'CHANGE_COMPONENT_BUNDLE':
                    await this.handleChangeComponentBundle(message);
                    break;
                case 'CHANGE_TARGET':
                    this.handleChangeTarget(message);
                    break;
                case 'UNLINK_PACKAGE':
                    await this.handleUnlinkPackage(message.packName);
                    break;
                case 'SELECT_PACKAGE': {
                    await this.selectPackage(message);
                    break;
                }
                case 'UNSELECT_PACKAGE': {
                    await this.unselectPackage(message);
                    break;
                }
                case 'RESOLVE_COMPONENTS': {
                    await this.resolveComponents();
                    break;
                }
                default:
                    return message; // Exhaustiveness check
            }
        } else {
            await this.clearComponents();
        }
    }

    private async handleUnlinkPackage(packName: string): Promise<void> {
        try {
            await this.webviewManager.sendMessage({ type: 'SET_SOLUTION_STATE', stateMessage: 'Unlinking Pack' });

            this.solutionManager.getCsolution()?.cbuildPackFile?.unlockPackage(packName);
            this.unlinkRequests.add(packName);
            await this.webviewManager.sendMessage({ type: 'SET_UNLINKREQUESTS_STACK', unlinkRequests: Array.from(this.unlinkRequests) });
            await this.sendDirtyState();
        } finally {
            this.unlinkRequests.delete(packName);
            await this.webviewManager.sendMessage({ type: 'SET_UNLINKREQUESTS_STACK', unlinkRequests: Array.from(this.unlinkRequests) });
        }
    };

    private async handlePackageSelectionChange(
        target: string,
        packId: string,
        stateMessage: string,
        action: (actx: string, target: string, packId: string) => Promise<void>
    ): Promise<void> {
        try {
            await this.webviewManager.sendMessage({ type: 'SET_SOLUTION_STATE', stateMessage });
            const actx = this.getActiveContext();
            await action(actx, target, packId);
            const requestAll = this.scope === ComponentScope.All;
            const packs = await this.csolutionService.getPacksInfo({ context: actx, all: requestAll });
            await this.webviewManager.sendMessage({
                type: 'SET_PACKS_INFO',
                packs: packsRowsFromInfo(packs, this.project?.solutionPath ?? '')
            });
            await this.sendDirtyState();
        } finally {
            await this.webviewManager.sendMessage({ type: 'SET_SOLUTION_STATE', stateMessage: undefined });
        }
    }

    private async selectPackage(message: Messages.OutgoingMessage): Promise<void> {
        if (isSelectPackageMessage(message)) {
            await this.handlePackageSelectionChange(
                message.target, message.packId, 'Selecting Pack',
                (actx, target, packId) => this.manageComponentsActions.selectPackage(actx, target, packId)
            );
        }
    }

    private async unselectPackage(message: Messages.OutgoingMessage): Promise<void> {
        if (isUnselectPackageMessage(message)) {
            await this.handlePackageSelectionChange(
                message.target, message.packId, 'Unselecting Pack',
                (actx, target, packId) => this.manageComponentsActions.unselectPackage(actx, target, packId)
            );
        }
    }

    private async filterAvailablePacks(context: string) {
        const allPacks = await this.csolutionService.getPacksInfo({ context: context, all: true });
        const availablePacks = Object.fromEntries(await getLatestAvailablePacks());

        // Build a Set for O(1) lookup
        const installedPackKeys = new Set(
            allPacks.packs?.flatMap(p => {
                const parsed = parsePackId(p.id);
                return parsed ? [`${parsed.vendor}:${parsed.packName}`] : [];
            }) ?? []
        );

        const filteredAvailablePacks = Object.fromEntries(
            Object.entries(availablePacks).filter(([packId]) => {
                const availablePack = parsePackId(packId);
                if (!availablePack) {
                    return false;
                }
                return installedPackKeys.has(`${availablePack.vendor}:${availablePack.packName}`);
            })
        );
        return filteredAvailablePacks;
    }

    private async sendSolutionData(): Promise<void> {
        const activeContext = this.getActiveContext();
        const requestAll = this.scope === ComponentScope.All;

        if (!this.availablePacksCache || Object.keys(this.availablePacksCache).length === 0) {
            this.availablePacksCache = await this.filterAvailablePacks(activeContext);
        }

        this.componentTree = this.manageComponentsActions.mapComponentsFromService(await this.csolutionService.getComponentsTree({ context: activeContext, all: requestAll }));
        this.validations = await this.csolutionService.validateComponents({ context: activeContext });
        const packs = packsRowsFromInfo(
            await this.csolutionService.getPacksInfo({ context: activeContext, all: requestAll }),
            this.project?.solutionPath ?? ''
        );

        componentTreeWalker(this.componentTree, (node, type) => {
            if (type === 'aggregate' && (node as CtAggregate).options?.layer) {
                (node as CtAggregate).options!.layer = (node as CtAggregate).options!.layer || '';
            }
        });

        const cbuildPackPath = backToForwardSlashes(path.relative(
            dirname(this.solutionManager.getCsolution()?.solutionPath || ''),
            stripTwoExtensions(this.solutionManager.getCsolution()?.solutionPath || '') + '.cbuild-pack.yml'
        ));

        await this.webviewManager.sendMessage({
            type: 'SOLUTION_LOADED',
            componentTree: this.componentTree,
            validations: this.validations.validation ?? [],
            componentScope: this.scope,
            availableTargetTypes: this.getTargetSetData(),
            selectedTargetType: this.getSelectedTargetSetData(),
            packs,
            cbuildPackPath: cbuildPackPath,
            solution: {
                dir: this.solutionManager.getCsolution()?.solutionDir,
                name: this.solutionManager.getCsolution()?.solutionName,
                path: this.solutionManager.getCsolution()?.solutionPath,
                relativePath: backToForwardSlashes(path.relative(dirname(this.solutionManager.getCsolution()?.solutionPath || ''), this.solutionManager.getCsolution()?.solutionPath || ''))
            },
            availablePacks: this.availablePacksCache
        });
    }

    private async resolveComponents(): Promise<void> {
        const activeContext = this.getActiveContext();
        await this.csolutionService.resolve({ context: activeContext });
        await this.sendSolutionData();
        await this.sendDirtyState();
    };

    private async clearComponents() {
        if (this.componentTree) {
            this.componentTree.classes = [];

            await this.webviewManager.sendMessage({ type: 'SET_COMPONENT_TREE', tree: { success: false, classes: [] }, validations: [] });
        }
    }

    private createBuildContextDeps(): BuildContext[] {
        const csolution = this.solutionManager.getCsolution();
        if (!csolution) {
            return [];
        }

        const activeBuildContexts: BuildContext[] = [];
        const contextDescriptors = csolution?.getContextDescriptors() ?? [];

        for (const cd of contextDescriptors) {
            const context: BuildContext = {
                targetType: cd.targetType,
                buildType: cd.buildType,
                projectPath: cd.projectPath,
                layers: cd.layers
                    ?.filter(layer => !/\.cgen\.ya?ml$/i.test(layer.absolutePath))
                    ?.map(layer => {
                        const type = csolution.getClayer(layer.absolutePath)?.findChild(['layer', 'type'])?.getValue();
                        return {
                            path: layer.absolutePath,
                            name: layer.displayName,
                            type: type || layer.displayName
                        };
                    })
            };
            activeBuildContexts.push(context);
        }
        return activeBuildContexts;
    }

    private async sendSelectedProject(cprojectPath: string): Promise<void> {
        const programMessage: Messages.IncomingMessage = {
            type: 'SELECTED_PROJECT',
            project: createProject(cprojectPath),
        };
        await this.webviewManager.sendMessage(programMessage);
    }

    private async refreshComponentTree(activeContext: string): Promise<void> {
        this.componentTree = this.manageComponentsActions.mapComponentsFromService(
            await this.csolutionService.getComponentsTree({ context: activeContext, all: this.scope === ComponentScope.All })
        );
        this.validations = await this.csolutionService.validateComponents({ context: activeContext });
        await this.webviewManager.sendMessage({
            type: 'SET_COMPONENT_TREE',
            tree: this.componentTree,
            validations: this.validations.validation ?? [],
            scope: this.scope
        });
    }

    private async openFile(filePath: string, openExternal?: boolean, focusOn?: string): Promise<void> {
        if (openExternal) {
            this.openFileExternal.openFile(filePath);
        } else {
            const absoluteFilePath = path.resolve(path.dirname(this.project?.solutionPath || './'), filePath);
            const isMarkdown = absoluteFilePath.toLowerCase().endsWith('.md');

            if (isMarkdown) {
                this.commandsProvider.executeCommand('markdown.showPreview', vscode.Uri.file(absoluteFilePath));
            } else {
                let focusOnLine: number = 0;

                if (focusOn) {
                    focusOnLine = lineOf(readTextFile(absoluteFilePath), focusOn);
                }

                await vscode.window.showTextDocument(vscode.Uri.file(absoluteFilePath), {
                    selection: new vscode.Range(new vscode.Position(focusOnLine ?? 0, 0), new vscode.Position(focusOnLine ?? 0, focusOnLine ? 100 : 0))
                });
            }
        }
    }

    private getActiveContext(): string {
        const activeContexts = this.solutionManager.getCsolution()?.getContextDescriptors();
        const currentContext = activeContexts
            ?.find(ctx =>
                normalizeForCompare(ctx.projectPath ?? '') === normalizeForCompare(this.project?.project.projectId ?? '')
            );
        return currentContext?.displayName ?? '';
    }
}

// Type guards for message types
const isChangeComponentScopeMessage = (message: Messages.OutgoingMessage): message is Messages.OutgoingMessage & { scope: ComponentScope } => {
    return message.type === 'CHANGE_COMPONENT_SCOPE' && 'scope' in message;
};

const isChangeComponentValueMessage = (message: Messages.OutgoingMessage): message is Messages.OutgoingMessage & { componentData: ComponentRowDataType } => {
    return message.type === 'CHANGE_COMPONENT_VALUE' && 'componentData' in message;
};

const isChangeComponentVariantMessage = (message: Messages.OutgoingMessage): message is Messages.OutgoingMessage & { componentData: ComponentRowDataType, variant: string } => {
    return message.type === 'CHANGE_COMPONENT_VARIANT' && 'componentData' in message && 'variant' in message;
};

const isChangeComponentBundleMessage = (message: Messages.OutgoingMessage): message is Messages.OutgoingMessage & { componentData: ComponentRowDataType, bundle: string } => {
    return message.type === 'CHANGE_COMPONENT_BUNDLE' && 'componentData' in message && 'bundle' in message;
};

const isOpenDocFileMessage = (message: Messages.OutgoingMessage): message is Messages.OutgoingMessage & { uri: string, external?: boolean, focusOn?: string } => {
    return message.type === 'OPEN_FILE' && 'uri' in message;
};

const isChangeContextMessage = (message: Messages.OutgoingMessage): message is Messages.OutgoingMessage & { targetSet: TargetSetData } => {
    return message.type === 'CHANGE_TARGET' && 'targetSet' in message && 'relativePath' in message.targetSet;
};

const isSelectPackageMessage = (message: Messages.OutgoingMessage): message is Messages.OutgoingMessage & { target: string; packId: string } => {
    return message.type === 'SELECT_PACKAGE' && 'target' in message && 'packId' in message;
};

const isUnselectPackageMessage = (message: Messages.OutgoingMessage): message is Messages.OutgoingMessage & { target: string; packId: string } => {
    return message.type === 'UNSELECT_PACKAGE' && 'target' in message && 'packId' in message;
};

