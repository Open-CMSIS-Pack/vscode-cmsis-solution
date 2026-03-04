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
import { VcpkgManager as VcpkgManagerExtension, EnvironmentManagerExtension } from '@arm-software/vscode-environment-manager';
import * as dependencies from './default-tools-dependencies';

const EXTENSION_PACKAGE_NAME = 'environment-manager';
const EXTENSION_ID = `arm.${EXTENSION_PACKAGE_NAME}`;
export const CONFIG_ACTIVATE_WORKSPACE = 'activateOnWorkspaceOpen';
export const DEFAULT_ACTIVATE_WORKSPACE = true;
export const CONFIG_VCPKG_FILENAME = 'configurationFilename';
export const DEFAULT_VCPKG_FILENAME = 'vcpkg-configuration.json';

export interface VcpkgManager {
    acquireDefaultToolsetMdk(): Promise<void>;
    awaitActivation(): Promise<void>;
}

class VcpkgManagerImpl implements VcpkgManager {

    static _instance: VcpkgManager | null = null;
    static get instance(): VcpkgManager {
        if (VcpkgManagerImpl._instance === null) {
            return new VcpkgManagerImpl();
        }
        return VcpkgManagerImpl._instance;
    }

    constructor(
        private vcpkgApi?: VcpkgManagerExtension,
    ) {
        VcpkgManagerImpl._instance = this;
    }

    private async getApi(): Promise<VcpkgManagerExtension> {
        if (this.vcpkgApi == undefined) {
            const environmentManagerExtension =
                vscode.extensions.getExtension<EnvironmentManagerExtension>(EXTENSION_ID);

            if (environmentManagerExtension) {
                this.vcpkgApi = await environmentManagerExtension.activate().then(ext => ext.getApi(2).packages);
            }
        }
        if (this.vcpkgApi !== undefined) {
            return this.vcpkgApi;
        }
        return Promise.reject('Arm Environment Manager extension not available');
    }

    public async acquireDefaultToolsetMdk() {
        const pkgs = Object.values(dependencies);
        await this.getApi().then(a => a.acquirePackages(pkgs));
    }

    protected doesActivateWorkspace() {
        return vscode.workspace.getConfiguration(EXTENSION_PACKAGE_NAME).get<boolean>(CONFIG_ACTIVATE_WORKSPACE) ?? DEFAULT_ACTIVATE_WORKSPACE;
    }

    protected async getWorkspaceVcpkgConfig() {
        const configFileName = vscode.workspace.getConfiguration(EXTENSION_PACKAGE_NAME).get<string>(CONFIG_VCPKG_FILENAME) ?? DEFAULT_VCPKG_FILENAME;
        const configFiles = await vscode.workspace.findFiles(configFileName, undefined, 1);
        return configFiles.at(0);
    }

    public async awaitActivation(): Promise<void> {
        if (!this.doesActivateWorkspace()) {
            return Promise.reject('Activation on workspace open is disabled');
        }
        const configFile = await this.getWorkspaceVcpkgConfig();
        if (configFile === undefined) {
            return Promise.reject('Workspace does not contain an environment configuration');
        }
        const awaitOnDidActivate = (api: VcpkgManagerExtension) => {
            return new Promise<void>((resolve) => {
                if (api.getActiveTools().length === 0) {
                    const handler = () => {
                        event.dispose();
                        resolve();
                    };
                    const event = api.onDidActivate(handler);
                } else {
                    resolve();
                }
            });
        };
        return this.getApi().then(awaitOnDidActivate);
    }
}

interface VcpkgManagerConstructor {
    new (vcpkgApi?: VcpkgManagerExtension): VcpkgManager;
    readonly instance: VcpkgManager;
}

export const VcpkgManager: VcpkgManagerConstructor = VcpkgManagerImpl;
