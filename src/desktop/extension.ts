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

import type { EnvironmentManagerApiV1, EnvironmentManagerExtension } from '@arm-software/vscode-environment-manager';
import { ExtensionContext, window, workspace } from 'vscode';
import { CsolutionExtension } from '../../api/csolution';
import { CsolutionExtensionImpl } from '../api/csolution-extension';
import { DataManager } from '../data-manager/data-manager';
import { CsolutionDataSource, SolarDataSource } from '../data-manager/data-source';
import * as manifest from '../manifest';
import { OpenFileExternal } from '../open-file-external';
import { PackInstallCommands } from '../packs/pack-install-commands';
import { SolarSearchClientImpl } from '../solar-search/solar-search-client';
import { ActiveSolutionTrackerImpl } from '../solutions/active-solution-tracker';
import { BinaryFileLocator } from '../solutions/binary-file-locator';
import { ClangdManager } from '../solutions/clangd-manager';
import { CmsisToolboxManagerImpl } from '../solutions/cmsis-toolbox';
import { getCreateSolutionFromDataManager } from '../solutions/create-solution-from-data-manager';
import { DebugHardwareCommands } from '../solutions/hardware/debug-hardware-commands';
import { TargetPackCommandImpl } from '../solutions/hardware/target-pack-command';
import { ArmclangDefineGetter } from '../solutions/intellisense/armclang-define-getter';
import { CompileCommandsGeneratorImpl } from '../solutions/intellisense/compile-commands-generator';
import { CompileCommandsParser } from '../solutions/intellisense/compile-commands-parser';
import { SolutionLanguageFeaturesProvider } from '../solutions/language-features/solution-language-features-provider';
import { ConvertMdkToCsolutionCommand } from '../solutions/mdk-conversion/convert-mdk-command';
import { SolutionCreatorImp } from '../solutions/solution-creator';
import { SolutionInitialiserImp } from '../solutions/solution-initialiser';
import { SolutionManagerImpl } from '../solutions/solution-manager';
import { SolutionRootsWatcher } from '../solutions/solution-roots-watcher';
import { StatusBar } from '../status-bar';
import { BuildCommand } from '../tasks/build/build-command';
import { BuildTaskDefinitionBuilderImpl } from '../tasks/build/build-task-definition-builder';
import { BuildTaskProviderImpl } from '../tasks/build/build-task-provider';
import { BuildRunner } from '../tasks/build/build-runner';
import { getHandleBuildEnoent } from '../tasks/build/handle-enoent';
import { GeneratorCommand } from '../tasks/generator/generator-command';
import { initUtils } from '../util';
import { getConfigureVcpkgForSolution } from '../vcpkg/configure-vcpkg';
import { VcpkgManager } from '../vcpkg/vcpkg-manager';
import { ConfWizWebview } from '../views/config-wizard/confwiz-webview-main';
import { CreateSolutionWebviewMain } from '../views/create-solutions/create-solution-webview-main';
import { ManageLayersWebviewMain } from '../views/manage-layers/manage-layers-webview-main';
import { AddToGroupCommand } from '../views/solution-outline/commands/add-to-group-command';
import { DeleteCommand } from '../views/solution-outline/commands/delete-command';
import { EditCommand } from '../views/solution-outline/commands/edit-command';
import { OpenCommand } from '../views/solution-outline/commands/open-command';
import { FindCommand } from '../views/solution-outline/commands/find-command';
import { MergeCommand } from '../views/solution-outline/commands/merge-command';
import { SolutionOutlineView } from '../views/solution-outline/solution-outline';
import { TreeViewFileDecorationProvider } from '../views/solution-outline/treeview-decoration-provider';
import { TreeViewProviderImpl } from '../views/solution-outline/treeview-provider';
import { commandsProvider } from '../vscode-api/commands-provider';
import { ConfigurationProviderImpl } from '../vscode-api/configuration-provider';
import { ExtensionApiProviderImpl } from '../vscode-api/extension-api-provider';
import { FileDecorationProviderManagerImpl } from '../vscode-api/file-decoration-provider-manager';
import { fileWatcherProvider } from '../vscode-api/file-watcher-provider';
import { GlobalStateImpl } from '../vscode-api/global-state';
import { messageProvider } from '../vscode-api/message-provider';
import { OutputChannelProviderImpl } from '../vscode-api/output-channel-provider';
import { ProcessManagerImpl } from '../vscode-api/runner/process-manager';
import { ThemeProviderImpl } from '../vscode-api/theme-provider';
import { workspaceFoldersProvider } from '../vscode-api/workspace-folders-provider';
import { workspaceFsProvider } from '../vscode-api/workspace-fs-provider';
import { ProtocolHandler } from './protocol-handler';
import { CopyHeaderCommand } from '../views/solution-outline/commands/copy-header-command';
import { CmsisCommands } from '../tasks/commands/cmsis-commands';
import { DebugLaunchProvider } from '../debug/debug-launch-provider';
import { CsolutionService } from '../json-rpc/csolution-rpc-client';
import { BuildStopCommand } from '../tasks/build/build-stop-command';
import { ComponentsPacksWebviewMain } from '../views/manage-components-packs/components-packs-webview-main';
import { SolutionConverterImpl } from '../solutions/solution-converter';
import { SolutionProblemsImpl } from '../solutions/solution-problems';
import { EnvironmentManager } from './env-manager';
import { ExtensionApiWrapper } from '../vscode-api/extension-api-wrapper';
import { SerialMonitorApi, Version } from '@microsoft/vscode-serial-monitor-api';
import { SolutionEventHub } from '../solutions/solution-event-hub';
import { SolutionRpcData } from '../solutions/solution-rpc-data';
import { ManageSolutionCustomEditorProvider, registerManageSolutionCommand } from '../views/manage-solution/manage-solution-custom-editor';

let installDefaultToolsetProcess: Promise<void> | undefined;

export const activate = async (context: ExtensionContext): Promise<CsolutionExtension> => {
    console.log(`Activating extension ${manifest.PACKAGE_NAME}`);

    // Companion Extensions
    type SerialMonitorExtension = {
        getApi: (version: Version, context: ExtensionContext) => SerialMonitorApi;
    }
    const serialMonitorExtension = new ExtensionApiWrapper<SerialMonitorApi, SerialMonitorExtension>(
        'ms-vscode.vscode-serial-monitor',
        (exports, context) => exports.getApi(Version.v0, context)
    );

    // Event hub
    const eventHub = new SolutionEventHub();

    // VS Code API providers
    const configurationProvider = new ConfigurationProviderImpl(context);
    const envManager = new EnvironmentManager(configurationProvider);
    const processManager = new ProcessManagerImpl(envManager);
    const outputChannelProvider = new OutputChannelProviderImpl(context);

    const externalFileOpener = new OpenFileExternal();

    initUtils(configurationProvider, undefined);

    installDefaultToolsetProcess = VcpkgManager.instance.acquireDefaultToolsetMdk(); // install default toolset for MDK6

    const environmentManagerApiProvider = new ExtensionApiProviderImpl<EnvironmentManagerApiV1, EnvironmentManagerExtension>('Arm.environment-manager', 1);
    const configureVcpkgForSolution = getConfigureVcpkgForSolution(environmentManagerApiProvider);

    const globalStateProvider = new GlobalStateImpl(context.globalState);
    const activeSolutionTracker = new ActiveSolutionTrackerImpl(
        messageProvider,
        commandsProvider,
        fileWatcherProvider,
        workspaceFoldersProvider,
        workspaceFsProvider,
        configurationProvider,
    );

    const solutionRootsWatcher = new SolutionRootsWatcher(fileWatcherProvider, workspaceFoldersProvider, workspaceFsProvider, commandsProvider);

    const csolutionService = new CsolutionService(
        envManager,
        commandsProvider,
    );

    const rpcData = new SolutionRpcData(csolutionService);

    const solutionManager = new SolutionManagerImpl(
        activeSolutionTracker,
        eventHub,
        rpcData,
        commandsProvider,
        environmentManagerApiProvider);

    initUtils(configurationProvider, solutionManager);

    const handleBuildEnoent = getHandleBuildEnoent(
        solutionManager,
        environmentManagerApiProvider,
        commandsProvider,
        configureVcpkgForSolution,
        window,
        workspace
    );
    const cmsisToolboxManager = new CmsisToolboxManagerImpl(
        processManager,
        handleBuildEnoent,
        csolutionService,
    );
    const buildRunner = new BuildRunner(
        cmsisToolboxManager,
    );

    const buildTaskProvider = new BuildTaskProviderImpl(buildRunner);
    const buildTaskDefinitionBuilder = new BuildTaskDefinitionBuilderImpl(solutionManager, configurationProvider);
    const compileCommandsGenerator = new CompileCommandsGeneratorImpl(buildTaskProvider, buildTaskDefinitionBuilder);

    const solutionConverterImpl = new SolutionConverterImpl(
        eventHub,
        configurationProvider,
        outputChannelProvider,
        cmsisToolboxManager,
        compileCommandsGenerator,
    );
    const solutionProblems = new SolutionProblemsImpl(solutionManager, eventHub);

    const themeProvider = new ThemeProviderImpl();
    const statusBar = new StatusBar(solutionManager, cmsisToolboxManager, themeProvider);
    const componentsManager = new ComponentsPacksWebviewMain(solutionManager, csolutionService, context, messageProvider, commandsProvider, externalFileOpener);
    const solarSearch = new SolarSearchClientImpl();
    const convertMdkToCsolution = new ConvertMdkToCsolutionCommand(commandsProvider, processManager, outputChannelProvider, workspaceFoldersProvider, messageProvider, workspaceFsProvider, globalStateProvider);
    const solutionInitialiserImp = new SolutionInitialiserImp(commandsProvider, workspaceFoldersProvider, configureVcpkgForSolution, messageProvider, globalStateProvider,);
    const createSolutionFromDataManager = getCreateSolutionFromDataManager(workspaceFsProvider, convertMdkToCsolution, workspace.findFiles);
    const solutionCreator = new SolutionCreatorImp(createSolutionFromDataManager, solutionInitialiserImp, workspaceFsProvider);
    const dataManager = new DataManager(
        new SolarDataSource(solarSearch, () => configurationProvider.getConfigVariableOrDefault<boolean>(manifest.CONFIG_USE_WEBSERVICES, true)),
        new CsolutionDataSource(csolutionService),
    );

    const createSolution = new CreateSolutionWebviewMain(
        solutionCreator,
        context,
        messageProvider,
        commandsProvider,
        workspaceFoldersProvider,
        dataManager,
    );
    const manageLayers = new ManageLayersWebviewMain(
        context,
        commandsProvider,
        messageProvider,
        solutionManager,
        eventHub,
    );

    const debugProvider = new DebugLaunchProvider(commandsProvider, solutionManager, configurationProvider);

    const addToGroupCommand = new AddToGroupCommand(workspaceFsProvider, commandsProvider, solutionManager);
    const deleteCommand = new DeleteCommand(commandsProvider, workspaceFsProvider);
    const editCommand = new EditCommand(commandsProvider);
    const copyHeaderCommand = new CopyHeaderCommand(commandsProvider);
    const openCommand = new OpenCommand(solutionManager, commandsProvider, externalFileOpener);
    const findCommand = new FindCommand(commandsProvider);
    const mergeCommand = new MergeCommand(commandsProvider, activeSolutionTracker);
    const fileDecorationProviderManager = new FileDecorationProviderManagerImpl();
    const buildCommand = new BuildCommand(buildTaskProvider, commandsProvider, buildTaskDefinitionBuilder);
    const runGeneratorCommand = new GeneratorCommand(commandsProvider, solutionManager, outputChannelProvider, cmsisToolboxManager);
    const armclangDefineGetter = new ArmclangDefineGetter(processManager, workspaceFsProvider);
    const manageSolutionCustomEditorProvider = new ManageSolutionCustomEditorProvider(
        context,
        solutionManager,
        commandsProvider,
        configurationProvider,
        csolutionService,
        externalFileOpener,
    );
    context.subscriptions.push(window.registerCustomEditorProvider(
        ManageSolutionCustomEditorProvider.viewType,
        manageSolutionCustomEditorProvider,
        {
            webviewOptions: { retainContextWhenHidden: true },
            supportsMultipleEditorsPerDocument: false,
        }
    ));
    context.subscriptions.push(registerManageSolutionCommand(commandsProvider, solutionManager));
    const getBinaryFile = new BinaryFileLocator(solutionManager, commandsProvider);
    const compileCommandsParser = new CompileCommandsParser(workspaceFsProvider);
    const clangdManager = new ClangdManager(solutionManager, configurationProvider, armclangDefineGetter, compileCommandsParser, workspaceFsProvider, commandsProvider);
    const targetPackCommand = new TargetPackCommandImpl(commandsProvider, solutionManager);
    const debugHardwareCommands = new DebugHardwareCommands(commandsProvider, solutionManager);
    const csolutionExtension = new CsolutionExtensionImpl(solutionCreator, buildTaskProvider, dataManager);
    const treeViewProviderImpl = new TreeViewProviderImpl(SolutionOutlineView.treeViewId);

    const treeViewFileDecorationProvider = new TreeViewFileDecorationProvider(fileDecorationProviderManager, themeProvider);
    const solutionOutline = new SolutionOutlineView(solutionManager, treeViewProviderImpl, globalStateProvider, treeViewFileDecorationProvider);
    const cmsisCommands = new CmsisCommands(configurationProvider, commandsProvider, solutionManager, debugProvider, serialMonitorExtension);
    const buildStopCommand = new BuildStopCommand(commandsProvider, buildTaskProvider);
    const configurationWizardView = new ConfWizWebview(context);
    const solutionLanguageFeatures = new SolutionLanguageFeaturesProvider(solutionManager);
    const packInstallCommands = new PackInstallCommands(commandsProvider, cmsisToolboxManager, outputChannelProvider);
    const protocolHandler = new ProtocolHandler(cmsisToolboxManager, outputChannelProvider);

    const activations = [
        eventHub.activate(context),
        csolutionService.activate(context),
        solutionManager.activate(context),
        buildTaskProvider.activate(context),
        buildCommand.activate(context),
        runGeneratorCommand.activate(context),
        convertMdkToCsolution.activate(context),
        solutionConverterImpl.activate(context),
        solutionProblems.activate(context),
        clangdManager.activate(context),
        componentsManager.activate(context),
        createSolution.activate(context),
        manageLayers.activate(context),
        getBinaryFile.activate(context),
        csolutionExtension.activate(context),
        solutionOutline.activate(context),
        targetPackCommand.activate(context),
        debugHardwareCommands.activate(context),
        solutionLanguageFeatures.activate(context),
        addToGroupCommand.activate(context),
        deleteCommand.activate(context),
        editCommand.activate(context),
        copyHeaderCommand.activate(context),
        openCommand.activate(context),
        findCommand.activate(context),
        mergeCommand.activate(context),
        cmsisCommands.activate(context),
        configurationWizardView.activate(),
        statusBar.activate(context),
        packInstallCommands.activate(context),
        cmsisToolboxManager.activate(context),
        treeViewFileDecorationProvider.activate(context),
        buildStopCommand.activate(context),
        protocolHandler.activate(context),
        debugProvider.activate(context),
        envManager.activate(context),
        serialMonitorExtension.activate(context),
        solutionRootsWatcher.activate(context),
        // activeSolutionTracker triggers an event by activation that can be consumed only if the receiver is already activated ,
        activeSolutionTracker.activate(context),
    ];

    await Promise.all(activations);

    console.log(`Extension ${manifest.PACKAGE_NAME} activated`);

    return csolutionExtension;
};

export const deactivate = async (): Promise<void> => {
    const deactivations = [];
    if (installDefaultToolsetProcess) {
        deactivations.push(installDefaultToolsetProcess);
    }
    await Promise.all(deactivations);
};
