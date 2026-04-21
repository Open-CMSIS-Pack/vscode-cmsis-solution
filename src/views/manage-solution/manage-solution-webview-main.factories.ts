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
import { configurationProviderFactory } from '../../vscode-api/configuration-provider.factories';
import { IOpenFileExternal } from '../../open-file-external-if';
import { openFileExternalFactory } from '../../open-file-external.factories';
import { ETextFileResult } from '../../generic/text-file';
import { SolutionData } from './view/state/manage-solution-state';
import { ManageSolutionController } from './manage-solution-controller';
import { CsolutionService } from '../../json-rpc/csolution-rpc-client';
import { csolutionServiceFactory } from '../../json-rpc/csolution-rpc-client.factory';

export type ManageSolutionWebviewMainFactoryOptions = {
    solutionManager?: SolutionManager;
    webviewManager?: MockWebviewManager<OutgoingMessage>;
    commandsProvider?: MockCommandsProvider;
    dataManager?: DataManager;
    debugAdaptersYmlFile?: DebugAdaptersYamlFile;
    openFileExternal?: IOpenFileExternal;
    configurationProvider?: ReturnType<typeof configurationProviderFactory>;
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
        options?.openFileExternal ?? openFileExternalFactory(),
        options?.configurationProvider ?? configurationProviderFactory(),
        options?.csolutionService ?? csolutionServiceFactory(),
        options?.onEdit,
        (options?.webviewManager ?? getMockWebViewManager<OutgoingMessage>()) as unknown as WebviewManager<IncomingMessage, OutgoingMessage>);

    mock['loadSolution'] = jest.fn().mockResolvedValue(ETextFileResult.Success);
    return mock;
};
