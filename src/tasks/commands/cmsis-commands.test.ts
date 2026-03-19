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

import { mockWaitUntilFree, mockWaitUntilUsed } from '../../generic/tcp-port-monitor.mock';

import * as vscode from 'vscode';
import { CmsisCommands } from './cmsis-commands';
import { commandsProviderFactory, MockCommandsProvider } from '../../vscode-api/commands-provider.factories';
import { DebugLaunchProvider } from '../../debug/debug-launch-provider';
import { MockSolutionManager, solutionManagerFactory } from '../../solutions/solution-manager.factories';
import { EtaExt } from '../../generic/eta-ext';
import { extensionContextFactory } from '../../vscode-api/extension-context.factories';
import { configurationProviderFactory, MockConfigurationProvider } from '../../vscode-api/configuration-provider.factories';
import { CONFIG_AUTO_CONFIGURE_TELNET_PORT_MONITOR, PACKAGE_NAME } from '../../manifest';
import { CSolution } from '../../solutions/csolution';
import { CTreeItem } from '../../generic/tree-item';
import { SolutionManager } from '../../solutions/solution-manager';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import path from 'path';
import { setupMockWorkspace } from '../../__test__/test-data';
import { IExtensionApiWrapper } from '../../vscode-api/extension-api-wrapper';
import { Port, SerialMonitorApi } from '@microsoft/vscode-serial-monitor-api';
import { extensionApiWrapperFactory, ExtensionApiWrapperMock } from '../../vscode-api/extension-api-wrapper.factories';
import { CbuildRunYamlFile } from '../../solutions/files/cbuild-run-yaml-file';
import { waitForPromises } from '../../__test__/test-waits';
import { faker } from '@faker-js/faker';

jest.mock('vscode');
(vscode.tasks.fetchTasks as jest.Mock) = jest.fn();
(vscode.tasks.executeTask as jest.Mock) = jest.fn();
(vscode.tasks.onDidStartTask as jest.Mock) = jest.fn();
(vscode.tasks.onDidEndTask as jest.Mock) = jest.fn();
(vscode.tasks.onDidEndTaskProcess as jest.Mock) = jest.fn();
(vscode.debug.onDidStartDebugSession as jest.Mock) = jest.fn();
(vscode.debug.onDidTerminateDebugSession as jest.Mock) = jest.fn();
(vscode.debug.onDidReceiveDebugSessionCustomEvent as jest.Mock) = jest.fn();
(vscode.window.showErrorMessage as jest.Mock) = jest.fn();
(vscode.debug.startDebugging as jest.Mock) = jest.fn();
(vscode.workspace.getWorkspaceFolder as jest.Mock) = jest.fn();
(vscode.workspace.onDidChangeConfiguration as jest.Mock) = jest.fn();
(vscode.commands.executeCommand as jest.Mock) = jest.fn();

class DebugLaunchProviderTest extends DebugLaunchProvider {
    private _mockConfig: string | undefined;

    constructor(
        readonly commandsProviderMock = commandsProviderFactory(),
        readonly solutionManagerMock = solutionManagerFactory(),
        readonly configurationProviderMock = configurationProviderFactory(),
        readonly etaMock = jest.mocked(new EtaExt()),
    ) {
        super(
            commandsProviderMock,
            solutionManagerMock,
            configurationProviderMock,
            etaMock,
        );

        etaMock.renderObject = jest.fn().mockImplementation((obj, _) => obj);
    }

    get activeLaunchConfiguration() {
        return this._mockConfig;
    }

    set activeLaunchConfiguration(config: string | undefined) {
        this._mockConfig = config;
    }
}

describe('CmsisCommands', () => {
    let configProvider: MockConfigurationProvider;
    let commandsProvider: MockCommandsProvider;
    let solutionManager: MockSolutionManager;
    let cmsisCommands: CmsisCommands;
    let debugLaunchProvider: DebugLaunchProviderTest;
    let serialMonitorExtension: ExtensionApiWrapperMock<SerialMonitorApi>;
    let onDidChangeConfigurationHandler: (e: vscode.ConfigurationChangeEvent) => Promise<void>;
    let onDidEndTaskProcessHandler: (event: vscode.TaskProcessEndEvent) => Promise<void>;
    let onDidStartDebugSessionHandler: (session: vscode.DebugSession) => Promise<void>;
    let onDidTerminateDebugSessionHandler: (session: vscode.DebugSession) => Promise<void>;
    let onDidReceiveCustomEventHandler: (event: vscode.DebugSessionCustomEvent) => Promise<void>;

    beforeEach(() => {
        jest.clearAllMocks();

        (vscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation((handler) => {
            onDidChangeConfigurationHandler = handler;
            return { dispose: jest.fn() };
        });

        (vscode.tasks.onDidEndTaskProcess as jest.Mock).mockImplementation((handler) => {
            onDidEndTaskProcessHandler = handler;
            return { dispose: jest.fn() };
        });

        (vscode.debug.onDidStartDebugSession as jest.Mock).mockImplementation((handler) => {
            onDidStartDebugSessionHandler = handler;
            return { dispose: jest.fn() };
        });

        (vscode.debug.onDidTerminateDebugSession as jest.Mock).mockImplementation((handler) => {
            onDidTerminateDebugSessionHandler = handler;
            return { dispose: jest.fn() };
        });

        (vscode.debug.onDidReceiveDebugSessionCustomEvent as jest.Mock).mockImplementation((handler) => {
            onDidReceiveCustomEventHandler = handler;
            return { dispose: jest.fn() };
        });

        (vscode.tasks.fetchTasks as jest.Mock).mockResolvedValue([]);

        const mockWorkspaceConfig: vscode.WorkspaceConfiguration = {
            get: <T>(key: string): T | undefined => {
                if (key === 'configurations') {
                    return [] as T;
                }
                return undefined;
            },
            has: () => false,
            inspect: () => undefined,
            update: async () => { }
        };

        jest.spyOn(vscode.workspace, 'getConfiguration').mockImplementation((section) => {
            if (section === 'launch') {
                return mockWorkspaceConfig;
            }
            return {
                get: () => undefined,
                has: () => false,
                inspect: () => undefined,
                update: async () => { }
            };
        });

        configProvider = configurationProviderFactory({});
        commandsProvider = commandsProviderFactory();
        solutionManager = solutionManagerFactory();
        debugLaunchProvider = new DebugLaunchProviderTest();

        const portMock = {
            stopMonitoring: jest.fn().mockResolvedValue(undefined),
            onClosed: jest.fn(),
        } as Port;
        const serialMonitorApi = {
            listAvailablePorts: jest.fn().mockResolvedValue([]),
            startMonitoringPort: jest.fn().mockResolvedValue(portMock),
            stopMonitoringPort: jest.fn().mockResolvedValue(false),
            startMonitoringTCPConnection: jest.fn().mockResolvedValue(portMock),
            stopMonitoringTCPConnection: jest.fn().mockResolvedValue(false),
            clearOutput: jest.fn().mockResolvedValue(undefined),
            dispose: jest.fn(),
        } as jest.Mocked<SerialMonitorApi>;
        serialMonitorExtension = extensionApiWrapperFactory<SerialMonitorApi>(serialMonitorApi);
        cmsisCommands = new CmsisCommands(configProvider, commandsProvider, solutionManager, debugLaunchProvider, serialMonitorExtension);
    });

    it('registers the command on activation', async () => {

        jest.spyOn(vscode.tasks, 'fetchTasks').mockResolvedValue([]);

        const debugLaunchProvider = new DebugLaunchProviderTest();
        const cmsisCommands = new CmsisCommands(
            configProvider,
            commandsProvider,
            solutionManager,
            debugLaunchProvider,
            serialMonitorExtension,
        );

        await cmsisCommands.activate(extensionContextFactory());

        expect(commandsProvider.registerCommand).toHaveBeenCalledTimes(11);

        const calls = (commandsProvider.registerCommand as jest.Mock).mock.calls;
        const registeredCommands = calls.map(([command, callback]) => [command, typeof callback]);

        expect(registeredCommands).toEqual([
            [CmsisCommands.loadAndRunCommandId, 'function'],
            [CmsisCommands.stopRunCommandId, 'function'],
            [CmsisCommands.loadAndDebugCommandId, 'function'],
            [CmsisCommands.attachDebuggerCommandId, 'function'],
            [CmsisCommands.detachDebugger, 'function'],
            [CmsisCommands.eraseCommandId, 'function'],
            [CmsisCommands.loadCommandId, 'function'],
            [CmsisCommands.runCommandId, 'function'],
            [CmsisCommands.disabledLoadAndRun, 'function'],
            [CmsisCommands.disabledLoadAndDebug, 'function'],
            [CmsisCommands.targetInfo, 'function']
        ]);
    });

    it('runs a CMSIS task if it exists', async () => {
        const mockTask = { name: 'CMSIS Load+Run', source: 'Workspace', scope: { uri: solutionManager.workspaceFolder } } as unknown as vscode.Task;
        (vscode.tasks.fetchTasks as jest.Mock).mockResolvedValue([mockTask]);

        await cmsisCommands['runCmsisTask']('CMSIS Load+Run', 'running');

        expect(vscode.tasks.executeTask).toHaveBeenCalledWith(mockTask);
    });

    it('shows error message if CMSIS task is not found', async () => {
        (vscode.tasks.fetchTasks as jest.Mock).mockResolvedValue([]);

        await cmsisCommands['runCmsisTask']('CMSIS x', 'running');

        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("Task 'CMSIS x' not found");
    });

    it('starts debugging if launch config and workspace folder are available', async () => {
        const mockConfig = 'STLink@pyOCD (launch)';
        debugLaunchProvider.activeLaunchConfiguration = mockConfig;
        const mockFolder = { uri: solutionManager.workspaceFolder } as vscode.WorkspaceFolder;

        (vscode.workspace.getWorkspaceFolder as jest.Mock).mockReturnValue(mockFolder);
        (vscode.debug.startDebugging as jest.Mock).mockResolvedValue(true);

        await cmsisCommands['runLoadAndDebug']('loading');

        expect(vscode.debug.startDebugging).toHaveBeenCalledWith(mockFolder, mockConfig);
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith('workbench.debug.action.focusRepl');
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith('workbench.view.debug');
    });

    it('shows error message if no debug configuration is available', async () => {
        debugLaunchProvider.activeLaunchConfiguration = undefined;

        await cmsisCommands['runLoadAndDebug']('loading');

        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
            expect.stringContaining('Unable to start debugging')
        );
    });

    it('returns only tasks scoped to the current workspace folder', async () => {
        const mockUri = solutionManager.workspaceFolder;
        const goodTask = {
            name: 'CMSIS Load',
            source: 'Workspace',
            scope: { uri: mockUri }
        } as unknown as vscode.Task;

        const badTask = {
            name: 'Other',
            source: 'Workspace',
            scope: { uri: vscode.Uri.file('/other/folder') }
        } as unknown as vscode.Task;

        (vscode.tasks.fetchTasks as jest.Mock).mockResolvedValue([goodTask, badTask]);

        const tasks = await cmsisCommands['getTasksFromWorkspace']();

        expect(tasks).toEqual([goodTask]);
    });

    // sets VS Code context for execution states:
    const expectedStates = [
        'unconfigured',
        'idle',
        'loading',
        'running',
        'debugging',
        'erasing'
    ] as const;

    expectedStates.forEach((state) => {
        it(`sets VS Code context for execution state: ${state}`, () => {
            cmsisCommands['setExecutionState'](state);
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                'setContext',
                `${PACKAGE_NAME}.executionState`,
                state
            );
        });
    });

    it('sets execution state to idle if solution is configured', async () => {
        const mockCsolution = {
            cbuildYmlRoot: new Map([['fake.yml', {} as CTreeItem]])
        };

        solutionManager.getCsolution.mockReturnValue(mockCsolution as unknown as CSolution);

        await cmsisCommands.activate(extensionContextFactory());

        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            'setContext',
            expect.stringContaining('executionState'),
            'idle'
        );
    });


    it('sets execution state to unconfigured if solution is missing', async () => {
        solutionManager.getCsolution.mockReturnValue(undefined);

        await cmsisCommands.activate(extensionContextFactory());

        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            'setContext',
            expect.stringContaining('executionState'),
            'unconfigured'
        );
    });

    it('registers task end listener into context subscriptions', async () => {
        const context = extensionContextFactory();

        await cmsisCommands.activate(context);

        expect(context.subscriptions.length).toBeGreaterThan(0);
    });

    it('sets state on launch config change', async () => {
        await cmsisCommands.activate(extensionContextFactory());

        expect(vscode.commands.executeCommand).toHaveBeenCalledTimes(12);

        await onDidChangeConfigurationHandler({
            affectsConfiguration: (section) => section === 'launch'
        } as vscode.ConfigurationChangeEvent);

        expect(vscode.commands.executeCommand).toHaveBeenCalledTimes(18);
    });

    it('sets state to idle and shows error if CMSIS Load fails', async () => {
        solutionManager.getCsolution.mockReturnValue({
            cbuildYml: new Map([['mock', {} as unknown]])
        } as unknown as CSolution);

        await cmsisCommands.activate(extensionContextFactory());

        onDidEndTaskProcessHandler({
            execution: { task: { name: 'CMSIS Load' } },
            exitCode: 1
        } as vscode.TaskProcessEndEvent);

        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
            'CMSIS Load task failed before launch.'
        );
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            'setContext',
            expect.stringContaining('executionState'),
            'idle'
        );
    });

    it('sets isDebugging to true and shows message on launch start', async () => {
        await cmsisCommands.activate(extensionContextFactory());

        onDidStartDebugSessionHandler({
            name: debugLaunchProvider.activeLaunchConfiguration
        } as vscode.DebugSession);

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            'Debug session started: Launch mode'
        );
    });

    it('sets isDebugging to true and shows message on attach start', async () => {
        const mockConfig = 'STLink@pyOCD (attach)';
        debugLaunchProvider.activeLaunchConfiguration = mockConfig;

        await cmsisCommands.activate(extensionContextFactory());

        onDidStartDebugSessionHandler({
            name: debugLaunchProvider.activeAttachConfiguration
        } as vscode.DebugSession);

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            'Debug session started: Attach mode'
        );
    });

    it('terminates debugger session', async () => {
        const mockConfig = 'STLink@pyOCD (launch)';
        debugLaunchProvider.activeLaunchConfiguration = mockConfig;

        await cmsisCommands.activate(extensionContextFactory());

        onDidTerminateDebugSessionHandler({
            name: debugLaunchProvider.activeLaunchConfiguration
        } as vscode.DebugSession);

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            'Debug session ended: STLink@pyOCD (launch)'
        );
    });

    it('shows error and resets state if debugger output contains "Error"', async () => {
        await cmsisCommands.activate(extensionContextFactory());

        onDidReceiveCustomEventHandler({
            event: 'output',
            body: { output: 'Error: Something failed' }
        } as vscode.DebugSessionCustomEvent);

        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
            'Debugger error output:',
            'Error: Something failed'
        );
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            'setContext',
            expect.stringContaining('executionState'),
            'idle'
        );
    });

    it('runs the "CMSIS TargetInfo" task if it exists', async () => {
        solutionManager.getCsolution.mockReturnValue({
            cbuildYmlRoot: new Map([['fake.yml', {} as CTreeItem]])
        } as unknown as CSolution);

        Object.defineProperty(solutionManager, 'loadState', {
            value: { type: 'active', solutionPath: '/fake/solution.csolution.yml' },
            writable: true
        });

        const mockTask = {
            name: 'CMSIS TargetInfo',
            source: 'Workspace',
            scope: { uri: solutionManager.workspaceFolder }
        } as unknown as vscode.Task;

        (vscode.tasks.fetchTasks as jest.Mock).mockResolvedValue([mockTask]);

        await cmsisCommands['runCmsisTask']('CMSIS TargetInfo');

        expect(vscode.tasks.executeTask).toHaveBeenCalledWith(mockTask);
    });

    it('executes a fallback task if targetInfo task is not found', async () => {
        solutionManager.getCsolution.mockReturnValue({
            cbuildYmlRoot: new Map([['fake.yml', {} as CTreeItem]])
        } as unknown as CSolution);

        (vscode.tasks.fetchTasks as jest.Mock).mockResolvedValue([]);

        const shellExecMock = jest.spyOn(vscode, 'ShellExecution');

        await cmsisCommands['runCmsisTask']('CMSIS TargetInfo');

        expect(vscode.tasks.executeTask).toHaveBeenCalledTimes(1);

        const executedTask = (vscode.tasks.executeTask as jest.Mock).mock.calls[0][0];

        expect(executedTask.name).toBe('Target Information');
        expect(executedTask.source).toBe('CMSIS');

        // assert ShellExecution was constructed correctly
        expect(shellExecMock).toHaveBeenCalledWith('pyocd list');
    });

    it('executes Target Information fallback task without active solution', async () => {
        const noSolutionManager = solutionManagerFactory({ workspaceFolder: undefined });
        noSolutionManager.getCsolution.mockReturnValue(undefined);

        const testCommands = new CmsisCommands(
            configProvider,
            commandsProvider,
            noSolutionManager,
            debugLaunchProvider,
            serialMonitorExtension
        );

        (vscode.tasks.fetchTasks as jest.Mock).mockResolvedValue([]);

        const shellExecMock = jest.spyOn(vscode, 'ShellExecution');

        await testCommands['runCmsisTask']('CMSIS TargetInfo');

        expect(vscode.tasks.executeTask).toHaveBeenCalledTimes(1);

        const executedTask = (vscode.tasks.executeTask as jest.Mock).mock.calls[0][0];

        // Should still create a valid task with fallback scope
        expect(executedTask.name).toBe('Target Information');
        expect(executedTask.source).toBe('CMSIS');
        expect(shellExecMock).toHaveBeenCalledWith('pyocd list');
    });

    it('sets execution state to idle after single "CMSIS Load" task completes successfully', async () => {
        solutionManager.getCsolution.mockReturnValue({
            cbuildYmlRoot: new Map([['fake.yml', {} as CTreeItem]])
        } as unknown as CSolution);

        await cmsisCommands.activate(extensionContextFactory());

        onDidEndTaskProcessHandler({
            execution: { task: { name: 'CMSIS Load' } },
            exitCode: 0
        } as vscode.TaskProcessEndEvent);

        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            'setContext',
            expect.stringContaining('executionState'),
            'idle'
        );
    });

    it('Starts and stops serial monitors on debug session start and end', async () => {
        await cmsisCommands.activate(extensionContextFactory());

        await configProvider.setConfigVariable(CONFIG_AUTO_CONFIGURE_TELNET_PORT_MONITOR, true);

        const portNumber = faker.number.int({ min: 1025, max: 65535 });
        const cbuildRunYmlMock : jest.Mocked<CbuildRunYamlFile> = {
            load: jest.fn().mockResolvedValue(undefined),
            getTelnet: jest.fn().mockReturnValue([{
                mode: 'monitor',
                port: portNumber,
            }, {
                mode: 'off',
            }]),
        } as unknown as jest.Mocked<CbuildRunYamlFile>;

        const csolution = {
            cbuildRunYml: cbuildRunYmlMock,
        } as unknown as jest.Mocked<CSolution>;
        solutionManager.getCsolution.mockReturnValue(csolution);

        const port = {
            stopMonitoring: jest.fn().mockResolvedValue(undefined),
            onClosed: jest.fn(),
        } as Port;
        serialMonitorExtension.api?.startMonitoringTCPConnection.mockResolvedValueOnce(port);

        // When the debug session starts ...
        onDidStartDebugSessionHandler({
            name: debugLaunchProvider.activeLaunchConfiguration
        } as vscode.DebugSession);

        // ... and the TCP port becomes used
        await mockWaitUntilUsed.resolve();

        // Then the serial monitor should be started
        expect(serialMonitorExtension.api?.startMonitoringTCPConnection)
            .toHaveBeenCalledWith(expect.objectContaining({
                host: 'localhost',
                port: portNumber,
            }));

        // When the debug session ends ...
        onDidTerminateDebugSessionHandler({
            name: debugLaunchProvider.activeLaunchConfiguration
        } as vscode.DebugSession);

        // ... and the TCP port becomes free
        await mockWaitUntilFree.resolve();

        // Then the serial monitor should be stopped
        expect(port.stopMonitoring).toHaveBeenCalledTimes(1);
    });

    it('Skip serial port monitoring when ports do not become used', async () => {
        await cmsisCommands.activate(extensionContextFactory());

        await configProvider.setConfigVariable(CONFIG_AUTO_CONFIGURE_TELNET_PORT_MONITOR, true);

        const cbuildRunYmlMock : jest.Mocked<CbuildRunYamlFile> = {
            load: jest.fn().mockResolvedValue(undefined),
            getTelnet: jest.fn().mockReturnValue([{
                mode: 'monitor',
                port: 4444,
            }, {
                mode: 'off',
            }]),
        } as unknown as jest.Mocked<CbuildRunYamlFile>;

        const csolution = {
            cbuildRunYml: cbuildRunYmlMock,
        } as unknown as jest.Mocked<CSolution>;
        solutionManager.getCsolution.mockReturnValue(csolution);

        const port = {
            stopMonitoring: jest.fn().mockResolvedValue(undefined),
            onClosed: jest.fn(),
        } as Port;
        serialMonitorExtension.api?.startMonitoringTCPConnection.mockResolvedValueOnce(port);

        // When the debug session starts ...
        onDidStartDebugSessionHandler({
            name: debugLaunchProvider.activeLaunchConfiguration
        } as vscode.DebugSession);

        // ... and the TCP port does not become used
        await waitForPromises();

        // Then the serial monitor should be started
        expect(serialMonitorExtension.api?.startMonitoringTCPConnection).not.toHaveBeenCalled();

        // When the debug session ends ...
        onDidTerminateDebugSessionHandler({
            name: debugLaunchProvider.activeLaunchConfiguration
        } as vscode.DebugSession);

        // ... and the TCP port still is not used
        await waitForPromises();

        // Then there is no port to stop monitoring
        expect(port.stopMonitoring).not.toHaveBeenCalled();
    });

});

describe('updateTaskAndLaunchContexts', () => {
    let configProvider: MockConfigurationProvider;
    let solutionManager: SolutionManager;
    let debugLaunchProvider: DebugLaunchProvider;
    let commandsProvider: CommandsProvider;
    let cmsisCommands: CmsisCommands;
    let serialMonitorExtension: IExtensionApiWrapper<SerialMonitorApi>;

    const mockWorkspaceUri = vscode.Uri.file('/fake-workspace');

    beforeEach(() => {
        solutionManager = {
            workspaceFolder: mockWorkspaceUri,
        } as unknown as SolutionManager;

        debugLaunchProvider = {
            activeLaunchConfiguration: 'DebugLaunch',
            activeAttachConfiguration: 'AttachDebug',
        } as DebugLaunchProvider;

        configProvider = configurationProviderFactory({});
        commandsProvider = {} as CommandsProvider;
        serialMonitorExtension = extensionApiWrapperFactory<SerialMonitorApi>();
        cmsisCommands = new CmsisCommands(configProvider, commandsProvider, solutionManager, debugLaunchProvider, serialMonitorExtension);

        jest.spyOn(cmsisCommands, 'getTasksFromWorkspace')
            .mockImplementation(async (): Promise<vscode.Task[]> => {
                const createTask = (name: string): vscode.Task => {
                    const mockWorkspaceFolder = { uri: mockWorkspaceUri } as vscode.WorkspaceFolder;
                    return new vscode.Task(
                        { type: 'shell' },
                        mockWorkspaceFolder,
                        name,
                        'Workspace',
                        new vscode.ShellExecution('echo test')
                    );
                };
                return [createTask('CMSIS Load+Run'), createTask('CMSIS Load')];
            });

        const mockConfig: vscode.WorkspaceConfiguration = {
            get: <T>(section: string): T | undefined => {
                if (section === 'configurations') {
                    return [
                        { name: 'DebugLaunch' },
                        { name: 'AttachDebug' },
                    ] as unknown as T;
                }
                return undefined;
            },
            has: () => false,
            inspect: () => undefined,
            update: async () => { },
        };
        jest.spyOn(vscode.workspace, 'getConfiguration').mockReturnValue(mockConfig);

        jest.spyOn(vscode.commands, 'executeCommand').mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns early if workspaceFolder is undefined', async () => {
        // redefine the read-only property to simulate undefined
        Object.defineProperty(solutionManager, 'workspaceFolder', {
            get: () => undefined,
            configurable: true,
        });

        const executeSpy = jest.spyOn(vscode.commands, 'executeCommand');
        await cmsisCommands['updateTaskAndLaunchContexts']();

        expect(executeSpy).not.toHaveBeenCalled();
    });

    it('sets context keys correctly based on available tasks and debug configs', async () => {
        const executeSpy = jest.spyOn(vscode.commands, 'executeCommand');

        await cmsisCommands['updateTaskAndLaunchContexts']();

        expect(executeSpy).toHaveBeenCalledWith('setContext', 'hasLoadRunTask', true);
        expect(executeSpy).toHaveBeenCalledWith('setContext', 'hasEraseTask', false);
        expect(executeSpy).toHaveBeenCalledWith('setContext', 'hasRunTask', false);
        expect(executeSpy).toHaveBeenCalledWith('setContext', 'hasLoadTask', true);
        expect(executeSpy).toHaveBeenCalledWith('setContext', 'hasDebugConfig', true);
        expect(executeSpy).toHaveBeenCalledWith('setContext', 'hasAttachConfig', true);
    });
});

describe('CmsisCommands.startDebugging', () => {
    let configProvider: MockConfigurationProvider;
    let cmsisCommands: CmsisCommands;
    let solutionManager: SolutionManager;
    let debugLaunchProvider: DebugLaunchProvider;
    let commandsProvider: CommandsProvider;
    let serialMonitorExtension: IExtensionApiWrapper<SerialMonitorApi>;

    const workspaceFile = setupMockWorkspace();
    const workspaceUri = vscode.Uri.file(path.dirname(workspaceFile));

    beforeEach(() => {
        configProvider = configurationProviderFactory({});
        commandsProvider = {} as CommandsProvider;
        solutionManager = { workspaceFolder: workspaceUri } as SolutionManager;
        debugLaunchProvider = {} as DebugLaunchProvider;
        serialMonitorExtension = extensionApiWrapperFactory<SerialMonitorApi>();
        cmsisCommands = new CmsisCommands(configProvider, commandsProvider, solutionManager, debugLaunchProvider, serialMonitorExtension);

        jest.clearAllMocks();
        (vscode.workspace.getWorkspaceFolder as jest.Mock).mockReturnValue({ uri: workspaceUri });
    });

    it('returns true and focuses debug UI when debugging starts successfully', async () => {
        (vscode.debug.startDebugging as jest.Mock).mockResolvedValue(true);

        const result = await cmsisCommands['startDebugging']('DebugConfig', workspaceUri);

        expect(result).toBe(true);
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith('workbench.debug.action.focusRepl');
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith('workbench.view.debug');
        expect(vscode.window.showErrorMessage).not.toHaveBeenCalled();
    });

    it('returns false and shows error message when debugging fails to start', async () => {
        (vscode.debug.startDebugging as jest.Mock).mockResolvedValue(false);

        const result = await cmsisCommands['startDebugging']('DebugConfig', workspaceUri);

        expect(result).toBe(false);
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
            'Failed to start debugging with configuration "DebugConfig".'
        );
        expect(vscode.commands.executeCommand).not.toHaveBeenCalledWith('workbench.debug.action.focusRepl');
        expect(vscode.commands.executeCommand).not.toHaveBeenCalledWith('workbench.view.debug');
    });
});
