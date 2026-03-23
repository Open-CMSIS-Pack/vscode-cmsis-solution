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

import { expect, it, describe } from '@jest/globals';
import * as path from 'path';
import * as manifest from '../manifest';
import { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import { SolutionConverterImpl } from './solution-converter';
import { MockOutputChannelProvider, outputChannelProviderFactory } from '../vscode-api/output-channel-provider.factories';
import { MockConfigurationProvider, configurationProviderFactory } from '../vscode-api/configuration-provider.factories';
import { MockProcessManager, processManagerFactory } from '../vscode-api/runner/process-manager.factories';
import { MockSolutionManager, solutionManagerFactory } from './solution-manager.factories';
import { CmsisToolboxManager, CmsisToolboxManagerImpl } from './cmsis-toolbox';
import { CompileCommandsGenerator } from './intellisense/compile-commands-generator';
import { HandleBuildEnoent } from '../tasks/build/handle-enoent';
import { VcpkgManager } from '../vcpkg/vcpkg-manager';
import { vcpkgManagerFactory } from './../vcpkg/vcpkg-manager.factories';
import { initUtils } from './../util';
import { CSolution } from './csolution';
import { csolutionServiceFactory } from '../json-rpc/csolution-rpc-client.factory';
import { ConvertSolutionParams } from '../json-rpc/csolution-rpc-client';
import { CbuildFile } from './files/cbuild-file';
import * as vscodeUtils from '../utils/vscode-utils';
import { getWorkspaceFolder } from '../utils/vscode-utils';
import * as fsUtils from '../utils/fs-utils';
import { ConvertRequestData, SolutionEventHub } from './solution-event-hub';
import { waitTimeout } from '../__test__/test-waits';

jest.mock('which', () => jest.fn((cmd) => Promise.resolve(path.join('path', 'to', cmd))));

const ACTIVE_SOLUTION = path.join(__dirname, 'Active.csolution.yml');

const checkConvertSolution = (
    csolutionService: jest.Mocked<ReturnType<typeof csolutionServiceFactory>>,
    updateRte: boolean,
    activeTarget?: string,
) => {
    const expectedArgs: ConvertSolutionParams = {
        solution: ACTIVE_SOLUTION,
        activeTarget: activeTarget ?? '',
        updateRte: updateRte
    };
    expect(csolutionService.convertSolution).toHaveBeenCalledTimes(1);
    expect(csolutionService.convertSolution).toHaveBeenCalledWith(expectedArgs);
};

describe('SolutionConverter', () => {
    let solutionManager: MockSolutionManager;
    let mockCSolution: jest.Mocked<CSolution>;
    let eventHub: SolutionEventHub;
    let mockConfigurationProvider: MockConfigurationProvider;
    let converter: SolutionConverterImpl;
    let outputChannelProvider: MockOutputChannelProvider;
    let processManager: MockProcessManager;
    let compileCommandsGenerator: CompileCommandsGenerator;
    let cmsisToolboxManager: CmsisToolboxManager;
    let mockHandleBuildEnoent: jest.MockedFunction<HandleBuildEnoent>;
    let mockCsolutionService: jest.Mocked<ReturnType<typeof csolutionServiceFactory>>;
    let convertRequestData: ConvertRequestData;
    let completedListener: jest.Mock;

    /**
     * Helper to wait for N completion events from EventHub
     */
    const waitForNCompletions = (count: number): Promise<void> => {
        let receivedCount = 0;
        return new Promise<void>((resolve) => {
            const disposable = eventHub.onDidConvertCompleted(() => {
                receivedCount++;
                if (receivedCount >= count) {
                    disposable.dispose();
                    resolve();
                }
            });
        });
    };

    /**
     * Helper to fire convert request and wait for completion
     * Follows the extension's event-driven async pattern
     */
    const fireAndWaitForConversion = async (): Promise<void> => {
        await eventHub.fireConvertRequest(convertRequestData);
        await waitForNCompletions(1);
    };

    beforeEach(async () => {
        (VcpkgManager as unknown as { _instance: VcpkgManager | null })._instance = vcpkgManagerFactory();

        mockConfigurationProvider = configurationProviderFactory();

        // Use real EventHub instance
        eventHub = new SolutionEventHub();
        completedListener = jest.fn();
        eventHub.onDidConvertCompleted(completedListener);

        // Initialize convertRequestData with default test values
        convertRequestData = {
            solutionPath: ACTIVE_SOLUTION,
            targetSet: undefined,
            updateRte: undefined,
            restartRpc: undefined,
            lockAbort: undefined
        };

        solutionManager = solutionManagerFactory();
        outputChannelProvider = outputChannelProviderFactory();

        processManager = processManagerFactory();
        mockHandleBuildEnoent = jest.fn();
        mockCsolutionService = csolutionServiceFactory();
        cmsisToolboxManager = new CmsisToolboxManagerImpl(
            processManager,
            mockHandleBuildEnoent,
            mockCsolutionService,
        );
        compileCommandsGenerator = {
            runCbuildSetup: jest.fn().mockResolvedValue([true, []]),
        } as unknown as jest.Mocked<CompileCommandsGenerator>;

        mockCSolution = jest.mocked<CSolution>(new CSolution());
        solutionManager.getCsolution.mockReturnValue(mockCSolution);

        converter = new SolutionConverterImpl(
            solutionManager,
            eventHub,
            mockConfigurationProvider,
            outputChannelProvider,
            cmsisToolboxManager,
            compileCommandsGenerator,
        );

        initUtils(mockConfigurationProvider, solutionManager);
        converter.activate({ subscriptions: [] } as unknown as ExtensionContext);

        mockCsolutionService.listMissingPacks.mockResolvedValue({ success: true });
        mockCsolutionService.convertSolution.mockResolvedValue({ success: true });
        mockCsolutionService.discoverLayers.mockResolvedValue({ success: true });
        mockCsolutionService.getLogMessages.mockResolvedValue({ success: true });
        mockCsolutionService.shutdown.mockResolvedValue({ success: true });
        mockCsolutionService.loadPacks.mockResolvedValue({ success: true });
        mockCsolutionService.getCsolutionBin.mockReturnValue('path/to/csolution');
    });

    it('run solution convert without --update-rte if not specified', async () => {
        await fireAndWaitForConversion();

        checkConvertSolution(mockCsolutionService, false);
        expect(completedListener).toHaveBeenCalledTimes(1);
        expect(completedListener).toHaveBeenCalledWith(
            expect.objectContaining({
                severity: 'success',
                detection: false
            })
        );
    });

    it('run solution convert with --update-rte if specified', async () => {
        convertRequestData.updateRte = true;
        await fireAndWaitForConversion();

        checkConvertSolution(mockCsolutionService, true);
        expect(completedListener).toHaveBeenCalledTimes(1);
        expect(completedListener).toHaveBeenCalledWith(
            expect.objectContaining({
                severity: 'success',
                detection: false
            })
        );
    });

    it('run solution convert with --active when targetSet is specified', async () => {
        convertRequestData.targetSet = 'foo';
        await fireAndWaitForConversion();

        checkConvertSolution(mockCsolutionService, false, 'foo');
        expect(completedListener).toHaveBeenCalledTimes(1);
        expect(completedListener).toHaveBeenCalledWith(
            expect.objectContaining({
                severity: 'success',
                detection: false
            })
        );
    });
    it('should handle restartRpc flag', async () => {
        convertRequestData.restartRpc = true;
        await fireAndWaitForConversion();

        expect(mockCsolutionService.shutdown).toHaveBeenCalledTimes(1);
        expect(mockCsolutionService.loadPacks).toHaveBeenCalledTimes(1);
        expect(mockCsolutionService.convertSolution).toHaveBeenCalledTimes(1);
    });
    it('sends output to the output channel', async () => {
        await fireAndWaitForConversion();

        const outputChannel = outputChannelProvider.mockGetCreatedChannelByName(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);

        expect(outputChannel!.mockAppendedStrings).toEqual([
            expect.stringContaining('⚙️ Converting solution...'),
            expect.stringContaining('Check for missing packs...'),
            expect.stringContaining('Convert solution...'),
            expect.stringContaining('Setup database...'),
            expect.stringContaining('Get log messages...'),
            expect.stringContaining('✅ Convert solution completed'),
        ]);
        expect(completedListener).toHaveBeenCalledTimes(1);
    });

    it('prints an error message to the output channel if the solution could not be converted', async () => {
        mockCsolutionService.listMissingPacks.mockResolvedValue({ success: false });
        mockCsolutionService.convertSolution.mockResolvedValue({ success: false });
        await fireAndWaitForConversion();

        const outputChannel = outputChannelProvider.mockGetCreatedChannelByName(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);

        // When listMissingPacks fails, ConvertSolution is skipped
        expect(outputChannel!.mockAppendedStrings).toEqual([
            expect.stringContaining('⚙️ Converting solution...'),
            expect.stringContaining('Check for missing packs...'),
            expect.stringContaining('Get log messages...'),
            expect.stringContaining('🟥 Convert solution failed'),
        ]);

        expect(completedListener).toHaveBeenCalledTimes(1);
    });

    it('prints an error when convert solution fails', async () => {
        mockCsolutionService.listMissingPacks.mockResolvedValue({ success: true });
        mockCsolutionService.convertSolution.mockResolvedValue({ success: false });
        await fireAndWaitForConversion();

        const outputChannel = outputChannelProvider.mockGetCreatedChannelByName(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);

        expect(outputChannel!.mockAppendedStrings).toEqual([
            expect.stringContaining('⚙️ Converting solution...'),
            expect.stringContaining('Check for missing packs...'),
            expect.stringContaining('Convert solution...'),
            expect.stringContaining('Get log messages...'),
            expect.stringContaining('🟥 Convert solution failed'),
        ]);

        expect(completedListener).toHaveBeenCalledTimes(1);
    });

    it('run solution convert and download missing packs', async () => {
        const mockRunCbuildSetup = jest.spyOn(compileCommandsGenerator, 'runCbuildSetup').mockResolvedValue([true, []]);
        const mockRunCmsisTool = jest.spyOn(cmsisToolboxManager, 'runCmsisTool').mockResolvedValue([0, undefined]);
        mockCsolutionService.listMissingPacks.mockResolvedValue({
            success: true, packs: [
                'VendorA::PackA@1.0.0', 'VendorB::PackB@2.0.0'
            ]
        });
        await fireAndWaitForConversion();

        expect(mockRunCmsisTool).toHaveBeenCalledTimes(2);
        expect(mockRunCmsisTool).toHaveBeenNthCalledWith(1, 'cpackget',
            expect.arrayContaining(['add', 'VendorA::PackA@1.0.0']), expect.any(Function), undefined, undefined, true);
        expect(mockRunCmsisTool).toHaveBeenNthCalledWith(2, 'cpackget',
            expect.arrayContaining(['add', 'VendorB::PackB@2.0.0']), expect.any(Function), undefined, undefined, true);
        expect(mockRunCbuildSetup).toHaveBeenCalledTimes(1);

        expect(completedListener).toHaveBeenCalledTimes(1);
    });

    it('run solution convert and discover layers', async () => {
        mockCsolutionService.convertSolution.mockResolvedValue({ success: false, undefinedLayers: ['$Board-Layer'] });
        await fireAndWaitForConversion();

        expect(mockCsolutionService.discoverLayers).toHaveBeenCalledTimes(1);
        expect(completedListener).toHaveBeenCalledTimes(1);
        expect(completedListener).toHaveBeenCalledWith(
            expect.objectContaining({
                severity: 'error',
                detection: true
            })
        );
    });

    it('run solution convert and check whether to update compile commands', async () => {
        const mockRunCbuildSetup = jest.spyOn(compileCommandsGenerator, 'runCbuildSetup').mockResolvedValue([true,[]]);
        mockCSolution.getContextDescriptors = jest.fn().mockReturnValue([{ displayName: 'context' }]);
        mockCSolution.cbuilds = [];
        mockCSolution.cbuilds.some = jest.fn().mockReturnValue(false);
        mockCSolution.cbuildIdxFile.cbuildFiles.get = jest.fn().mockReturnValue({ outDir: './out' } as CbuildFile);

        await fireAndWaitForConversion();

        expect(mockRunCbuildSetup).toHaveBeenCalledTimes(1);
        expect(completedListener).toHaveBeenCalledTimes(1);
    });

    it('get log messages and set diagnostics accordingly', async () => {
        const mockDiagnosticsCollectionSet = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');
        const mockDiagnosticsCollectionClear = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'clear');

        mockCsolutionService.convertSolution.mockResolvedValue({ success: false });
        mockCsolutionService.getLogMessages.mockResolvedValue({
            success: true,
            errors: ['hello.cproject.yml:41:11 - file path/to/hello.c not found'],
            warnings: ['hello.csolution.yml - solution created for unknown tool'],
            info: ['hello.cbuild-idx.yml - file generated successfully', 'general info message'],
        });
        await fireAndWaitForConversion();

        expect(mockDiagnosticsCollectionClear).toHaveBeenCalled();
        expect(mockDiagnosticsCollectionSet).toHaveBeenCalledTimes(3);
        expect(completedListener).toHaveBeenCalledTimes(1);
    });

    it('get cbuild west output and set diagnostics accordingly', async () => {
        const mockDiagnosticsCollectionSet = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');
        mockCsolutionService.convertSolution.mockResolvedValue({ success: true });
        mockCsolutionService.getLogMessages.mockResolvedValue({ success: true });
        let mockRunCbuildSetup = jest.spyOn(compileCommandsGenerator, 'runCbuildSetup').mockResolvedValue([true, [
            'warning cbuild: missing ZEPHYR_BASE environment variable',
            'error cbuild: exec: "west": executable file not found in $PATH',
        ]]);
        mockCSolution.getContextDescriptors = jest.fn().mockReturnValue([{ displayName: 'context' }]);
        mockCSolution.cbuilds = [];
        mockCSolution.cbuilds.some = jest.fn().mockReturnValue(false);
        mockCSolution.cbuildIdxFile.cbuildFiles.get = jest.fn().mockReturnValue({ outDir: './out' } as CbuildFile);
        jest.spyOn(vscodeUtils, 'getWorkspaceFolder').mockReturnValue('workspace/folder');

        await fireAndWaitForConversion();
        expect(mockRunCbuildSetup).toHaveBeenCalledTimes(1);
        expect(mockDiagnosticsCollectionSet).toHaveBeenCalledTimes(2);
        expect(completedListener).toHaveBeenCalledTimes(1);

        // Remove settings.json
        completedListener.mockClear();
        const settings = path.join(getWorkspaceFolder(), '.vscode', 'settings.json');
        mockRunCbuildSetup.mockClear();
        mockDiagnosticsCollectionSet.mockClear();
        fsUtils.deleteFileIfExists(settings);
        await fireAndWaitForConversion();
        expect(mockRunCbuildSetup).toHaveBeenCalledTimes(1);
        expect(completedListener).toHaveBeenCalledTimes(1);

        // No errors/warnings
        completedListener.mockClear();
        mockRunCbuildSetup = jest.spyOn(compileCommandsGenerator, 'runCbuildSetup').mockResolvedValue([true, []]);
        mockRunCbuildSetup.mockClear();
        mockDiagnosticsCollectionSet.mockClear();
        await fireAndWaitForConversion();
        expect(mockRunCbuildSetup).toHaveBeenCalledTimes(1);
        expect(completedListener).toHaveBeenCalledTimes(1);
    });

    describe('conversion coalescing', () => {
        const mockConvertSolutionDelay = () => {
            mockCsolutionService.convertSolution.mockImplementation(async (param) => {
                await waitTimeout(50);
                // emulate return value to check which request makes through
                return { success: true, selectCompiler: param.activeTarget === 'foo' ? [param.activeTarget] : undefined };
            });
        };

        it('should not abort current conversion if locked', async () => {
            // Mock convertSolution to take time
            mockConvertSolutionDelay();

            const waitPromise = waitForNCompletions(1);
            convertRequestData.lockAbort = true;
            convertRequestData.targetSet = 'foo';
            // Fire two requests with small delay
            await eventHub.fireConvertRequest(convertRequestData);
            await waitTimeout();
            convertRequestData.targetSet = 'bar';
            await eventHub.fireConvertRequest(convertRequestData);

            // Wait for the single completion event
            await waitPromise;

            // Should only convert once because second request was coalesced
            expect(mockCsolutionService.convertSolution).toHaveBeenCalledTimes(1);
            expect(mockCsolutionService.convertSolution).toHaveBeenCalledWith(
                expect.objectContaining({ activeTarget: 'foo' })
            );
            expect(completedListener).toHaveBeenCalledTimes(1);
            // check if call is from request with 'foo'
            expect(completedListener).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'success', detection: true })
            );
        });

        it('should start new conversion if not locked', async () => {
            // Mock to take time
            mockConvertSolutionDelay();

            const waitPromise = waitForNCompletions(1);

            // Start first conversion
            convertRequestData.targetSet = 'foo';
            await eventHub.fireConvertRequest(convertRequestData);

            // Fire the second with small delay
            await waitTimeout();
            convertRequestData.targetSet = 'bar';
            await eventHub.fireConvertRequest(convertRequestData);

            // Wait for both to complete
            await waitPromise;

            expect(mockCsolutionService.convertSolution).toHaveBeenCalledTimes(2);
            // two conversions requested, only one run to the end => 1
            expect(completedListener).toHaveBeenCalledTimes(1);
            // check if call is from request with 'bar'
            expect(completedListener).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'success', detection: false })
            );
        });
    });

    it('creates diagnostic when cpackget fails to download a pack', async () => {
        const diagnosticCollection = vscode.languages.createDiagnosticCollection();
        const mockDiagnosticsCollectionSet = jest.spyOn(diagnosticCollection, 'set') as unknown as jest.MockedFunction<
            (uri: vscode.Uri, diagnostics: readonly vscode.Diagnostic[] | undefined) => void
        >;
        jest.spyOn(cmsisToolboxManager, 'runCmsisTool').mockImplementation(async (_t, _a, onOutput) => {
            onOutput('W: retry failed');
            onOutput('E: network timeout');
            return [1, undefined];
        });
        mockCsolutionService.listMissingPacks.mockResolvedValue({ success: true, packs: ['VendorA::PackA@1.0.0'] });
        mockCsolutionService.getLogMessages.mockResolvedValue({ success: true });

        await fireAndWaitForConversion();

        expect(mockDiagnosticsCollectionSet).toHaveBeenCalledTimes(1);
        const [[, diagnostics]] = mockDiagnosticsCollectionSet.mock.calls;
        expect(diagnostics?.[0]?.message).toContain('network timeout');
        expect(diagnostics?.[0]?.message).toContain('retry failed');
    });

    it('extracts warnings from cbuild2cmake and csolution tool output', async () => {
        const mockDiagnosticsCollectionSet = jest.spyOn(vscode.languages.createDiagnosticCollection(), 'set');
        mockCsolutionService.convertSolution.mockResolvedValue({ success: true });
        mockCsolutionService.getLogMessages.mockResolvedValue({ success: true });
        jest.spyOn(compileCommandsGenerator, 'runCbuildSetup').mockResolvedValue([true, [
            'warning cbuild2cmake: some warning',
            'error csolution: some error',
        ]]);

        await fireAndWaitForConversion();

        // Expect two calls: one for cbuild2cmake warning, one for csolution error
        expect(mockDiagnosticsCollectionSet).toHaveBeenCalledTimes(2);
    });
});
