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

import { VcpkgManager as VcpkgManagerExtension } from '@arm-software/vscode-environment-manager';
import { VcpkgManager } from './vcpkg-manager';

export type MockVcpkgApi = jest.Mocked<VcpkgManagerExtension>;

export function vcpkgApiFactory(): MockVcpkgApi {
    return {
        onDidActivate: jest.fn(),
        onDidDeactivate: jest.fn(),
        onDidFailActivation: jest.fn(),
        onDidUpdate: jest.fn(),
        isActivating: jest.fn(),
        activate: jest.fn(),
        deactivate: jest.fn(),
        update: jest.fn(),
        listRegistries: jest.fn(),
        listPackages: jest.fn(),
        getActiveTools: jest.fn(),
        installPackage: jest.fn(),
        acquirePackages: jest.fn(),
    };
}

export type MockVcpkgManager = jest.Mocked<VcpkgManager>;
export function vcpkgManagerFactory(): MockVcpkgManager {
    return {
        acquireDefaultToolsetMdk: jest.fn(() => Promise.resolve()),
        awaitActivation: jest.fn(() => Promise.resolve()),
    };
}
