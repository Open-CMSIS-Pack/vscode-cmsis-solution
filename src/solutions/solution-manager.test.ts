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

import 'jest';
import * as vscode from 'vscode';
import * as path from 'path';
import { SolutionLoadState, SolutionManagerImpl } from './solution-manager';
import { EventEmitter, Event, ExtensionContext, ConfigurationChangeEvent, } from 'vscode';
import { ActiveSolutionTracker, SolutionDetails, } from './active-solution-tracker';
import { waitTimeout } from '../__test__/test-waits';
import { commandsProviderFactory, MockCommandsProvider, } from '../vscode-api/commands-provider.factories';
import { SolutionEventHub, ConvertResultData } from './solution-event-hub';
import { extensionApiProviderFactory } from '../vscode-api/extension-api-provider.factories';
import { EnvironmentManagerApiV1, VcpkgResults } from '@arm-software/vscode-environment-manager';
import { TestDataHandler } from '../__test__/test-data';
import { Board, Device } from '../json-rpc/csolution-rpc-client';
import { csolutionServiceFactory } from '../json-rpc/csolution-rpc-client.factory';
import { SolutionRpcData } from './solution-rpc-data';
import { configurationProviderFactory, MockConfigurationProvider } from '../vscode-api/configuration-provider.factories';
import { EnvironmentManager } from '../desktop/env-manager';
import { CONFIG_ENVIRONMENT_VARIABLES } from '../manifest';


const convertResultData: ConvertResultData = {
    success: true,
    severity: 'success',
    detection: false,
    logMessages: { success: true, errors: [], warnings: [], info: [] },
};

describe('SolutionManager', () => {
    let mockActiveSolutionTracker: {
        activeSolution: string | undefined;
        onDidChangeActiveSolution: Event<void>;
        onActiveSolutionFilesChanged: Event<void>;
        getSolutionDetails: jest.Mock;
        triggerReload: jest.Mock;
        suspendWatch: boolean;
    };
    let changeActiveSolutionEmitter: EventEmitter<void>;
    let solutionManager: SolutionManagerImpl;
    let loadStateChangeListener: jest.Mock;
    let changeConfigurationEmitter: EventEmitter<ConfigurationChangeEvent>;
    let commandsProvider: MockCommandsProvider;
    let configurationProviderMock: MockConfigurationProvider;
    let changeSolutionFilesEmitter: EventEmitter<void>;
    let vcpkgActivateEmitter: EventEmitter<VcpkgResults>;
    let environmentManagerApi: Pick<EnvironmentManagerApiV1, 'onDidActivate' | 'getActiveTools'>;
    let environmentManager: EnvironmentManager;
    let eventHub: SolutionEventHub;
    let convertMock: jest.Mock;
    let loadBuildFilesListener: jest.Mock;
    let tmpSolutionsDir: string;
    let testSolutionPath: string;
    let csolutionService: jest.Mocked<ReturnType<typeof csolutionServiceFactory>>;
    let rpcData: SolutionRpcData;

    const testDataHandler = new TestDataHandler();

    beforeAll(async () => {
        tmpSolutionsDir = testDataHandler.copyTestDataToTmp('solutions');
    });

    afterAll(async () => {
        testDataHandler.dispose();
        jest.restoreAllMocks();
    });

    beforeEach(async () => {
        changeConfigurationEmitter = new EventEmitter();
        (
            vscode.workspace as {
                onDidChangeConfiguration: Event<ConfigurationChangeEvent>;
            }
        ).onDidChangeConfiguration = changeConfigurationEmitter.event;

        changeActiveSolutionEmitter = new EventEmitter<void>();
        changeSolutionFilesEmitter = new EventEmitter<void>();

        testSolutionPath = path.join(tmpSolutionsDir, 'USBD', 'USB_Device.csolution.yml');

        mockActiveSolutionTracker = {
            activeSolution: testSolutionPath,
            onDidChangeActiveSolution: changeActiveSolutionEmitter.event,
            onActiveSolutionFilesChanged: changeSolutionFilesEmitter.event,
            getSolutionDetails: jest.fn(
                (solutionPath: string): SolutionDetails => ({
                    path: solutionPath,
                    displayName: path.basename(solutionPath),
                }),
            ),
            triggerReload: jest.fn(() => changeSolutionFilesEmitter.fire()),
            suspendWatch: false,
        };

        eventHub = new SolutionEventHub();
        convertMock = jest.fn(() => {
            setTimeout(() => {
                eventHub.fireConvertCompleted(convertResultData);
            }, 1);
        });
        eventHub.onDidConvertRequested(convertMock);

        vcpkgActivateEmitter = new EventEmitter<VcpkgResults>();
        environmentManagerApi = {
            onDidActivate: vcpkgActivateEmitter.event,
            getActiveTools: jest.fn(),
        };

        commandsProvider = commandsProviderFactory();
        csolutionService = csolutionServiceFactory();
        configurationProviderMock = configurationProviderFactory({
            [CONFIG_ENVIRONMENT_VARIABLES]: {},
        });
        const device: Device = { id: 'device-id' };
        const board: Board = { id: 'board-id' };
        csolutionService.getDeviceInfo.mockResolvedValue({ success: true, device });
        csolutionService.getBoardInfo.mockResolvedValue({ success: true, board });
        csolutionService.loadSolution.mockResolvedValue({ success: true });
        csolutionService.getVariables.mockResolvedValue({ success: true, variables: {} });
        rpcData = new SolutionRpcData(csolutionService);
        environmentManager = new EnvironmentManager(configurationProviderMock);

        solutionManager = new SolutionManagerImpl(
            mockActiveSolutionTracker as unknown as ActiveSolutionTracker,
            eventHub,
            rpcData,
            commandsProvider,
            extensionApiProviderFactory(environmentManagerApi),
            environmentManager,
        );
        loadStateChangeListener = jest.fn();
        solutionManager.onDidChangeLoadState(loadStateChangeListener);
        loadBuildFilesListener = jest.fn();
        solutionManager.onDidSetupCompleted(loadBuildFilesListener);
        await solutionManager.activate({
            subscriptions: [],
        } as unknown as ExtensionContext);
    });


    it('register the command on activation', async () => {
        expect(commandsProvider.registerCommand).toHaveBeenCalledTimes(1);
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(
            SolutionManagerImpl.refreshCommandId,
            expect.any(Function),
            expect.anything(),
        );
    });

    it('reloads the active solution when the refresh command is executed', async () => {
        // Initialize solution state first
        mockActiveSolutionTracker.activeSolution = testSolutionPath;
        changeActiveSolutionEmitter.fire();
        await waitTimeout(100);

        await commandsProvider.mockRunRegistered(
            SolutionManagerImpl.refreshCommandId,
        );

        await waitTimeout(100);

        const expectedLoadState: SolutionLoadState = {
            solutionPath: testSolutionPath, loaded: true, converted: true, activated: true,
        };

        expect(solutionManager.loadState).toEqual(expectedLoadState);
        expect(loadBuildFilesListener).toHaveBeenCalledTimes(2);
        expect(loadBuildFilesListener).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining([
                convertResultData.severity,
                convertResultData.detection,
            ]),
        );
        expect(loadBuildFilesListener).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining([
                convertResultData.severity,
                convertResultData.detection,
            ]),
        );
    });

    it('sets the idle state when there is no active solution', async () => {
        mockActiveSolutionTracker.activeSolution = undefined;
        changeActiveSolutionEmitter.fire();

        const expectedLoadState: SolutionLoadState = { solutionPath: undefined };
        expect(solutionManager.loadState).toEqual(expectedLoadState);
        expect(loadStateChangeListener).toHaveBeenCalledTimes(1);
        expect(loadStateChangeListener).toHaveBeenCalledWith(
            expect.objectContaining({ newState: expectedLoadState }),
        );
    });

    it('reloads the solution when a file in the active solution is modified', async () => {
        // Initialize solution state first
        mockActiveSolutionTracker.activeSolution = testSolutionPath;
        changeActiveSolutionEmitter.fire();
        await waitTimeout(100);

        changeSolutionFilesEmitter.fire();

        await waitTimeout(100);

        const expectedLoadState: SolutionLoadState = {
            solutionPath: testSolutionPath, loaded: true, converted: true, activated: true,
        };
        expect(solutionManager.loadState).toEqual(expectedLoadState);

        expect(loadStateChangeListener.mock.calls.length).toBeGreaterThanOrEqual(3);

        expect(loadBuildFilesListener).toHaveBeenCalledTimes(2);
        expect(loadBuildFilesListener).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining([
                convertResultData.severity,
                convertResultData.detection,
            ]),
        );
        expect(loadBuildFilesListener).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining([
                convertResultData.severity,
                convertResultData.detection,
            ]),
        );
        expect(convertMock).toHaveBeenCalledTimes(2);
        expect(convertMock).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                solutionPath: testSolutionPath,
                targetSet: 'B-U585I-IOT02A',
                restartRpc: false,
                updateRte: false,
                lockAbort: true,
            }),
        );
        expect(convertMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                solutionPath: testSolutionPath,
                targetSet: 'B-U585I-IOT02A',
                restartRpc: false,
                updateRte: true,
                lockAbort: false,
            }),
        );
    });

    it('loads the new solution when the active solution is changed', async () => {
        const newSolutionPath = testSolutionPath;
        // path.join(tmpSolutionsDir, 'targetSet', 'TargetSets.csolution.yml');
        mockActiveSolutionTracker.activeSolution = newSolutionPath;
        changeActiveSolutionEmitter.fire();

        await waitTimeout(100);

        const expectedLoadingState: SolutionLoadState = {
            solutionPath: newSolutionPath, loaded: true,
        };
        expect(loadStateChangeListener).toHaveBeenCalledWith(
            expect.objectContaining({ newState: expectedLoadingState }),
        );
        expect(convertMock).toHaveBeenCalledTimes(1);
        expect(convertMock).toHaveBeenCalledWith(
            expect.objectContaining({
                solutionPath: newSolutionPath,
            })
        );
        expect(loadBuildFilesListener).toHaveBeenCalled();
        expect(loadBuildFilesListener).toHaveBeenCalledWith(
            expect.objectContaining([
                convertResultData.severity,
                convertResultData.detection,
            ]),
        );
    });

    it('requests restartRpc when envVars change after solution is activated', async () => {
        mockActiveSolutionTracker.activeSolution = testSolutionPath;
        changeActiveSolutionEmitter.fire();
        await waitTimeout(100);

        await environmentManager.activate({
            subscriptions: [],
            environmentVariableCollection: {
                clear: jest.fn(),
                prepend: jest.fn(),
                replace: jest.fn(),
            } as unknown as vscode.GlobalEnvironmentVariableCollection,
        } as unknown as ExtensionContext);

        convertMock.mockClear();
        configurationProviderMock.getConfigVariableOrDefault.mockReturnValue({
            NEW_VAR: 'new_value',
        });
        configurationProviderMock.fireOnChangeConfiguration(CONFIG_ENVIRONMENT_VARIABLES);
        await waitTimeout(600);

        expect(convertMock).toHaveBeenCalledTimes(1);
        expect(convertMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                solutionPath: testSolutionPath,
                updateRte: false,
                restartRpc: true,
                lockAbort: false,
            }),
        );
    });

    it('fires updatedCompileCommands when cbuild completes', async () => {
        const updatedCompileCommandsListener = jest.fn();
        solutionManager.onUpdatedCompileCommands(updatedCompileCommandsListener);

        mockActiveSolutionTracker.activeSolution = testSolutionPath;
        changeActiveSolutionEmitter.fire();
        await waitTimeout(200);

        // Reset mock to count only cbuild event
        updatedCompileCommandsListener.mockClear();

        // Fire cbuild completion event
        const cbuildData = { success: true, severity: 'success' as const, toolsOutputMessages: [] };
        eventHub.fireCbuildCompleted(cbuildData);

        expect(updatedCompileCommandsListener).toHaveBeenCalledTimes(1);
    });

    it('fires setup completed event with detection=false when cbuild completes with warning', async () => {
        mockActiveSolutionTracker.activeSolution = testSolutionPath;
        changeActiveSolutionEmitter.fire();
        await waitTimeout(200);

        // Reset mock to count only cbuild event
        loadBuildFilesListener.mockClear();

        const cbuildData = { success: true, severity: 'warning' as const, toolsOutputMessages: [] };
        eventHub.fireCbuildCompleted(cbuildData);

        expect(loadBuildFilesListener).toHaveBeenCalledTimes(1);
        expect(loadBuildFilesListener).toHaveBeenCalledWith(['warning', false]);
    });

    it('fires setup completed event with detection=false when cbuild completes with error', async () => {
        mockActiveSolutionTracker.activeSolution = testSolutionPath;
        changeActiveSolutionEmitter.fire();
        await waitTimeout(200);

        // Reset mock to count only cbuild event
        loadBuildFilesListener.mockClear();

        const cbuildData = { success: false, severity: 'error' as const, toolsOutputMessages: [] };
        eventHub.fireCbuildCompleted(cbuildData);

        expect(loadBuildFilesListener).toHaveBeenCalledTimes(1);
        expect(loadBuildFilesListener).toHaveBeenCalledWith(['error', false]);
    });

    it('does not fire setup completed event when cbuild completes with success', async () => {
        mockActiveSolutionTracker.activeSolution = testSolutionPath;
        changeActiveSolutionEmitter.fire();
        await waitTimeout(200);

        // Reset mock to count only cbuild event
        loadBuildFilesListener.mockClear();

        const cbuildData = { success: true, severity: 'success' as const, toolsOutputMessages: [] };
        eventHub.fireCbuildCompleted(cbuildData);

        expect(loadBuildFilesListener).not.toHaveBeenCalled();
    });
});
