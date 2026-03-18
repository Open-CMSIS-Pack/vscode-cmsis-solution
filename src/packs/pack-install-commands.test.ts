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

import 'jest';
import * as os from 'os';
import type { ExtensionContext } from 'vscode';
import path from 'path';
import fs from 'fs/promises';
import { commandsProviderFactory, MockCommandsProvider } from '../vscode-api/commands-provider.factories';
import { CmsisToolboxManager, CmsisToolboxManagerImpl } from '../solutions/cmsis-toolbox';
import { HandleBuildEnoent } from '../../src/tasks/build/handle-enoent';
import { MockProcessManager, processManagerFactory } from '../vscode-api/runner/process-manager.factories';
import { MockOutputChannelProvider, outputChannelProviderFactory } from '../vscode-api/output-channel-provider.factories';
import { PackInstallCommands } from './pack-install-commands';
import { csolutionServiceFactory } from '../json-rpc/csolution-rpc-client.factory';

jest.mock('which', () => jest.fn((cmd) => Promise.resolve(path.join('path', 'to', cmd))));

describe('PackInstallCommands', () => {

    let mockCommandsProvider: MockCommandsProvider;
    let packInstallCommands: PackInstallCommands;
    let mockProcessManager: MockProcessManager;
    let mockOutputChannelProvider: MockOutputChannelProvider;
    let mockHandleBuildEnoent : jest.MockedFunction<HandleBuildEnoent>;
    let cmsisToolboxManager: CmsisToolboxManager;
    let mockCsolutionService: jest.Mocked<ReturnType<typeof csolutionServiceFactory>>;

    beforeEach(() => {
        mockCommandsProvider = commandsProviderFactory();
        mockProcessManager = processManagerFactory();
        mockOutputChannelProvider = outputChannelProviderFactory();
        mockHandleBuildEnoent = jest.fn();
        mockCsolutionService = csolutionServiceFactory();

        cmsisToolboxManager = new CmsisToolboxManagerImpl(
            mockProcessManager,
            mockHandleBuildEnoent,
            mockCsolutionService,
        );

        packInstallCommands = new PackInstallCommands(
            mockCommandsProvider,
            cmsisToolboxManager,
            mockOutputChannelProvider,
        );
    });

    describe('installPack command', () => {
        const packRoot = path.join(os.tmpdir(), 'packs');
        const packDir = path.join(packRoot, 'vendor', 'name', '3.3.3');

        beforeAll(async () => {
            await fs.mkdir(packDir, { recursive: true });
            await fs.mkdir(path.join(packRoot, 'vendor', 'name', '1.1.1'));
            await fs.mkdir(path.join(packRoot, 'vendor', 'name', '2.2.2'));
            process.env['CMSIS_PACK_ROOT'] = packRoot;
        });

        afterAll(async () => {
            await fs.rm(packRoot, { recursive: true });
        });

        beforeEach(async () => {
            await packInstallCommands.activate({ subscriptions: [] } as unknown as ExtensionContext);
        });

        it('register the installPack command', async () => {
            expect(mockCommandsProvider.registerCommand).toHaveBeenCalledTimes(1);
            expect(mockCommandsProvider.registerCommand).toHaveBeenCalledWith(PackInstallCommands.installPackCommandId, expect.any(Function), expect.anything());
        });

        it('run with valid parameters', async () => {
            const result = await mockCommandsProvider.mockRunRegistered(PackInstallCommands.installPackCommandId, 'vendor', 'name', '0.0.0');
            expect(mockProcessManager.spawn).toHaveBeenCalledTimes(1);
            expect(mockProcessManager.spawn).toHaveBeenCalledWith(
                path.join('path', 'to', 'cpackget'),
                ['add', '-a', 'vendor::name@0.0.0'],
                expect.any(Object),
                expect.any(Function),
                undefined,
                undefined
            );
            expect(result).toBe(path.join(packRoot,'vendor', 'name', '0.0.0'));
        });

        it('run without version', async () => {
            const result = await mockCommandsProvider.mockRunRegistered(PackInstallCommands.installPackCommandId, 'vendor', 'name');
            expect(mockProcessManager.spawn).toHaveBeenCalledTimes(1);
            expect(mockProcessManager.spawn).toHaveBeenCalledWith(
                path.join('path', 'to', 'cpackget'),
                ['add', '-a', 'vendor::name@latest'],
                expect.any(Object),
                expect.any(Function),
                undefined,
                undefined
            );
            expect(result).toBe(path.join(packRoot,'vendor', 'name', '3.3.3'));
        });

        it('run with undefined vendor', async () => {
            const result = await mockCommandsProvider.mockRunRegistered(PackInstallCommands.installPackCommandId, '', 'name', '0.0.0');
            expect(result).toBeUndefined();
        });

        it('run with undefined name', async () => {
            const result = await mockCommandsProvider.mockRunRegistered(PackInstallCommands.installPackCommandId, 'vendor', '', '0.0.0');
            expect(result).toBeUndefined();
        });

        it('run with wrong semantic version', async () => {
            const result = await mockCommandsProvider.mockRunRegistered(PackInstallCommands.installPackCommandId, 'vendor', 'name', 'unnknown');
            expect(result).toBeUndefined();
        });

        it('run unknown pack without version', async () => {
            const result = await mockCommandsProvider.mockRunRegistered(PackInstallCommands.installPackCommandId, 'unnknown', 'unnknown');
            expect(result).toBeUndefined();
        });

        it('cpackget fails', async () => {
            const errorMessage = 'cpackget fails';
            mockProcessManager.mockOutputLinesAndReject([], errorMessage);
            const result = await mockCommandsProvider.mockRunRegistered(PackInstallCommands.installPackCommandId, 'vendor', 'name', '0.0.0');
            expect(result).toBeUndefined();
        });
    });
});
