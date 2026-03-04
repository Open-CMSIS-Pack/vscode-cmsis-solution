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

import * as vscode from 'vscode';
import { MockCommandsProvider, commandsProviderFactory } from '../../vscode-api/commands-provider.factories';
import { SolutionManager } from '../../solutions/solution-manager';
import { MockWebviewManager, getMockWebViewManager } from '../__test__/mock-webview-manager';
import { ManageSolutionWebviewMain } from './manage-solution-webview-main';
import { IncomingMessage, OutgoingMessage } from './messages';
import { WebviewManager } from '../webview-manager';
import { solutionManagerFactory } from '../../solutions/solution-manager.factories';
import { DataManager } from '../../data-manager/data-manager';
import { DebugAdaptersYamlFile } from '../../debug/debug-adapters-yaml-file';
import { IOpenFileExternal } from '../../open-file-external-if';
import { configurationProviderFactory } from '../../vscode-api/configuration-provider.factories';
import { ETextFileResult } from '../../generic/text-file';
import { SolutionData } from './view/state/manage-solution-state';
import { ManageSolutionController } from './manage-solution-controller';
import { ApplyParams, BoardInfo, BoardList, ContextInfo, ConvertSolutionParams, ConvertSolutionResult, CsolutionService, CtRoot, DeviceInfo, DeviceList, DiscoverLayersInfo, DraftProjectsInfo, GetBoardInfoParams, GetBoardListParams, GetComponentsTreeParams, GetContextInfoParams, GetDeviceInfoParams, GetDeviceListParams, GetDraftProjectsParams, GetPacksInfoParams, GetUsedItemsParams, GetVariablesParams, GetVersionResult, ListMissingPacksResult, LoadSolutionParams, LogMessages, PacksInfo, ResolveParams, Results, SelectBundleParams, SelectComponentParams, SelectPackParams, SelectVariantParams, SuccessResult, UsedItems, ValidateComponentsParams, VariablesResult } from '../../json-rpc/csolution-rpc-client';

export type ManageSolutionWebviewMainFactoryOptions = {
    solutionManager?: SolutionManager;
    webviewManager?: MockWebviewManager<OutgoingMessage>;
    commandsProvider?: MockCommandsProvider;
    dataManager?: DataManager;
    debugAdaptersYmlFile?: DebugAdaptersYamlFile;
    configurationProvider?: ReturnType<typeof configurationProviderFactory>;
    openFileExternal?: IOpenFileExternal,
    csolutionService?: CsolutionService,
    onEdit?: (label: string, before: SolutionData, after: SolutionData) => void,
}

class ManageSolutionControllerMock extends ManageSolutionController {
    constructor() {
        super();
        this.csolutionYml.ensureTargetSets();
    }
}

class ManageSolutionWebviewMainMock extends ManageSolutionWebviewMain {
    mockSolutionData?: SolutionData;

    protected override createController(): ManageSolutionController {
        const mockController = new ManageSolutionControllerMock();
        return mockController;
    }
};

function ensureStructuredCloneMock(): void {
    if (typeof globalThis.structuredClone === 'function') {
        return;
    }

    Object.defineProperty(globalThis, 'structuredClone', {
        configurable: true,
        writable: true,
        value: jest.fn(<T>(value: T): T => JSON.parse(JSON.stringify(value)) as T),
    });
}

export function manageSolutionWebviewMainFactory(options?: ManageSolutionWebviewMainFactoryOptions): ManageSolutionWebviewMain {
    ensureStructuredCloneMock();

    const mock = new ManageSolutionWebviewMainMock(
        { subscriptions: [] } as unknown as vscode.ExtensionContext,
        options?.solutionManager ?? solutionManagerFactory(),
        options?.commandsProvider ?? commandsProviderFactory(),
        options?.openFileExternal ?? jest.mocked<IOpenFileExternal>({ openFile: function (path: string): void { throw new Error(`Function not implemented. ${path}`); } }),
        options?.configurationProvider ?? configurationProviderFactory(),
        options?.csolutionService ?? jest.mocked<CsolutionService>({
            getDeviceList: async function (_args: GetDeviceListParams): Promise<DeviceList> { throw new Error('Function not implemented.'); },
            activate: function (_context: Pick<vscode.ExtensionContext, 'subscriptions'>): Promise<void> {
                return Promise.resolve();
            },
            getCsolutionBin: function (): string {
                throw new Error('Function not implemented.');
            },
            waitForExit: function (): Promise<void> {
                throw new Error('Function not implemented.');
            },
            getVariables: function (_args: GetVariablesParams): Promise<VariablesResult> {
                throw new Error('Function not implemented.');
            },
            getVersion: function (): Promise<GetVersionResult> {
                throw new Error('Function not implemented.');
            },
            shutdown: function (): Promise<SuccessResult> {
                throw new Error('Function not implemented.');
            },
            apply: function (_args: ApplyParams): Promise<SuccessResult> {
                throw new Error('Function not implemented.');
            },
            resolve: function (_args: ResolveParams): Promise<SuccessResult> {
                throw new Error('Function not implemented.');
            },
            loadPacks: function (): Promise<SuccessResult> {
                throw new Error('Function not implemented.');
            },
            loadSolution: function (_args: LoadSolutionParams): Promise<SuccessResult> {
                throw new Error('Function not implemented.');
            },
            getPacksInfo: function (_args: GetPacksInfoParams): Promise<PacksInfo> {
                throw new Error('Function not implemented.');
            },
            selectPack: function (_args: SelectPackParams): Promise<SuccessResult> {
                throw new Error('Function not implemented.');
            },
            getUsedItems: function (_args: GetUsedItemsParams): Promise<UsedItems> {
                throw new Error('Function not implemented.');
            },
            getContextInfo: function (_args: GetContextInfoParams): Promise<ContextInfo> {
                throw new Error('Function not implemented.');
            },
            getDeviceInfo: function (_args: GetDeviceInfoParams): Promise<DeviceInfo> {
                throw new Error('Function not implemented.');
            },
            getBoardList: function (_args: GetBoardListParams): Promise<BoardList> {
                throw new Error('Function not implemented.');
            },
            getBoardInfo: function (_args: GetBoardInfoParams): Promise<BoardInfo> {
                throw new Error('Function not implemented.');
            },
            getComponentsTree: function (_args: GetComponentsTreeParams): Promise<CtRoot> {
                throw new Error('Function not implemented.');
            },
            selectComponent: function (_args: SelectComponentParams): Promise<SuccessResult> {
                throw new Error('Function not implemented.');
            },
            selectVariant: function (_args: SelectVariantParams): Promise<SuccessResult> {
                throw new Error('Function not implemented.');
            },
            selectBundle: function (_args: SelectBundleParams): Promise<SuccessResult> {
                throw new Error('Function not implemented.');
            },
            validateComponents: function (_args: ValidateComponentsParams): Promise<Results> {
                throw new Error('Function not implemented.');
            },
            getLogMessages: function (): Promise<LogMessages> {
                throw new Error('Function not implemented.');
            },
            getDraftProjects: function (_args: GetDraftProjectsParams): Promise<DraftProjectsInfo> {
                throw new Error('Function not implemented.');
            },
            convertSolution: function (_args: ConvertSolutionParams): Promise<ConvertSolutionResult> {
                throw new Error('Function not implemented.');
            },
            discoverLayers: function (_args: LoadSolutionParams): Promise<DiscoverLayersInfo> {
                throw new Error('Function not implemented.');
            },
            listMissingPacks: function (_args: LoadSolutionParams): Promise<ListMissingPacksResult> {
                throw new Error('Function not implemented.');
            }
        }),
        options?.onEdit,
        (options?.webviewManager ?? getMockWebViewManager<OutgoingMessage>()) as unknown as WebviewManager<IncomingMessage, OutgoingMessage>);

    mock['loadSolution'] = jest.fn().mockResolvedValue(ETextFileResult.Success);
    return mock;
};
