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

import { CONFIG_ACTIVATE_WORKSPACE, CONFIG_VCPKG_FILENAME, DEFAULT_ACTIVATE_WORKSPACE, DEFAULT_VCPKG_FILENAME, VcpkgManager } from './vcpkg-manager';
import { vcpkgApiFactory } from './vcpkg-manager.factories';
import { when } from 'jest-when';
import { ActiveTool, VcpkgResults } from '@arm-software/vscode-environment-manager';

jest.mock('vscode');

function workspaceConfigurationMockFactory() {
    return {
        get: jest.fn(),
        has: jest.fn(),
        inspect: jest.fn(),
        update: jest.fn(),
    };
}

describe('VcpkgManager', () => {

    describe('instance', () => {
        it('caches latest instance', () => {
            const vcpkgManagerA = new VcpkgManager(vcpkgApiFactory());
            const vcpkgManagerB = new VcpkgManager(vcpkgApiFactory());

            expect(VcpkgManager.instance).not.toEqual(vcpkgManagerA);
            expect(VcpkgManager.instance).toStrictEqual(vcpkgManagerB);
        });
    });

    describe('acquireDefaultToolsetMdk', () => {

        it('skip installation if environment manager extension not available', async () => {
            const vcpkgManager = new VcpkgManager();

            const acquire = vcpkgManager.acquireDefaultToolsetMdk();

            await expect(acquire).rejects.toBeDefined();
        });

        it('installs all default MDK tools', async () => {
            const apiMock = vcpkgApiFactory();
            const vcpkgManager = new VcpkgManager(apiMock);

            await vcpkgManager.acquireDefaultToolsetMdk();

            expect(apiMock.acquirePackages).toHaveBeenCalledTimes(1);
        });
    });

    describe('awaitActivation', () => {

        const findFilesMock = vscode.workspace.findFiles as jest.Mock;
        const getConfigurationMock = vscode.workspace.getConfiguration as jest.Mock;

        let wsConfigMock: jest.Mocked<vscode.WorkspaceConfiguration>;

        beforeEach(() => {
            findFilesMock.mockReset();

            wsConfigMock = workspaceConfigurationMockFactory();

            when(wsConfigMock.get)
                .calledWith(CONFIG_ACTIVATE_WORKSPACE, undefined)
                .mockReturnValue(DEFAULT_ACTIVATE_WORKSPACE);

            when(wsConfigMock.get)
                .calledWith(CONFIG_VCPKG_FILENAME, expect.any)
                .mockReturnValue(DEFAULT_VCPKG_FILENAME);

            getConfigurationMock.mockReset();
            getConfigurationMock.mockReturnValue(wsConfigMock);
        });

        it('skip if environment manager extension not available', async () => {
            const vcpkgManager = new VcpkgManager();

            const activation = vcpkgManager.awaitActivation();

            await expect(activation).rejects.toBeDefined();
        });

        it('skip if activation on workspace load is disabled', async () => {
            const apiMock = vcpkgApiFactory();
            const vcpkgManager = new VcpkgManager(apiMock);

            when(wsConfigMock.get)
                .calledWith(CONFIG_ACTIVATE_WORKSPACE, undefined)
                .mockReturnValue(false);

            const activation = vcpkgManager.awaitActivation();

            await expect(activation).rejects.toBeDefined();
            expect(apiMock.activate).not.toHaveBeenCalled();
        });

        it('skip if workspace does not contain config file', async () => {
            const apiMock = vcpkgApiFactory();
            const vcpkgManager = new VcpkgManager(apiMock);

            findFilesMock.mockResolvedValue([]);

            const activation = vcpkgManager.awaitActivation();

            await expect(activation).rejects.toBeDefined();
            expect(apiMock.activate).not.toHaveBeenCalled();
        });

        it('awaits activation', async () => {
            const configFileMock = jest.fn();
            findFilesMock.mockResolvedValue([configFileMock]);

            const apiMock = vcpkgApiFactory();
            const vcpkgManager = new VcpkgManager(apiMock);

            const disposeMock = jest.fn();
            apiMock.getActiveTools.mockReturnValue([]);
            apiMock.onDidActivate.mockImplementation((listener) => {
                return jest.mocked<vscode.Disposable & { timeout: NodeJS.Timeout }>({
                    timeout: setTimeout(() => listener({} as VcpkgResults), 500),
                    dispose: disposeMock,
                });
            });

            const activation = vcpkgManager.awaitActivation();

            await expect(activation).resolves.toBeUndefined();

            expect(disposeMock).toHaveBeenCalledTimes(1);
        });

        it('pass if activation already done', async () => {
            const configFileMock = jest.fn();
            findFilesMock.mockResolvedValue([configFileMock]);

            const apiMock = vcpkgApiFactory();
            const vcpkgManager = new VcpkgManager(apiMock);

            const disposeMock = jest.fn();
            apiMock.getActiveTools.mockReturnValue([{} as ActiveTool]);
            apiMock.onDidActivate.mockImplementation((listener) => {
                return jest.mocked<vscode.Disposable & { timeout: NodeJS.Timeout }>({
                    timeout: setTimeout(() => listener({} as VcpkgResults), 500),
                    dispose: disposeMock,
                });
            });

            await vcpkgManager.awaitActivation();

            expect(apiMock.onDidActivate).not.toHaveBeenCalled();
        });
    });

});
