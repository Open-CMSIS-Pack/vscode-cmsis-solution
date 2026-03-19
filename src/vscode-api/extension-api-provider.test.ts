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

import vscode from 'vscode';
import { faker } from '@faker-js/faker';
import 'jest';
import { EventEmitter } from 'vscode';
import { ExtensionApiProviderImpl } from './extension-api-provider';
import { extensionFactory } from './extensions.factories';
import { waitTimeout } from '../__test__/test-waits';

type MockVscodeExtensions = {
    onDidChange: (typeof vscode.extensions)['onDidChange'],
    getExtension: jest.MockedFunction<(typeof vscode.extensions)['getExtension']>,
    mockFireChange: () => void,
}

export const vscodeExtensionsFactory = (): MockVscodeExtensions => {
    const emitter = new EventEmitter<void>();
    return {
        getExtension: jest.fn(),
        onDidChange: emitter.event,
        mockFireChange: () => emitter.fire(),
    };
};

describe('ExtensionApiProvider', () => {
    describe('activateIfEnabled', () => {
        it('returns undefined if the extension is not installed', async () => {
            const vscodeExtensions = vscodeExtensionsFactory();
            const provider = new ExtensionApiProviderImpl(faker.word.noun(), faker.number.int(), vscodeExtensions);

            const result = await provider.activateIfEnabled();

            expect(result).toBeUndefined();
        });

        it('returns undefined if the extension is installed but the API version is not available', async () => {
            const extensionId = faker.word.noun();
            const extensionVersion = 2;
            const extension = extensionFactory({
                id: extensionId,
                exports: {
                    getApi: () => {
                        throw new Error('This version is not available');
                    },
                },
            });
            const vscodeExtensions = vscodeExtensionsFactory();
            vscodeExtensions.getExtension.mockImplementation(id => id === extensionId ? extension : undefined);
            const provider = new ExtensionApiProviderImpl(extensionId, extensionVersion, vscodeExtensions);

            const result = await provider.activateIfEnabled();

            expect(result).toBeUndefined();
        });

        it('returns the extension API if the version is available and the extension is installed', async () => {
            const extensionId = faker.word.noun();
            const extensionVersion = 2;
            const extensionApi = { someField: 'someValue' };
            const extension = extensionFactory({
                id: extensionId,
                exports: {
                    getApi: (version: number) => {
                        if (version === extensionVersion) {
                            return extensionApi;
                        }
                        throw new Error('This version is not available');
                    },
                },
            });
            const vscodeExtensions = vscodeExtensionsFactory();
            vscodeExtensions.getExtension.mockImplementation(id => id === extensionId ? extension : undefined);
            const provider = new ExtensionApiProviderImpl(extensionId, extensionVersion, vscodeExtensions);

            const result = await provider.activateIfEnabled();

            expect(result).toEqual(extensionApi);
        });
    });

    describe('onActivate', () => {
        it('calls the callback with the extension API if the extension is installed', async () => {
            const extensionId = faker.word.noun();
            const extensionVersion = 2;
            const extensionApi = { someField: 'someValue' };
            const extension = extensionFactory({
                id: extensionId,
                exports: {
                    getApi: (version: number) => {
                        if (version === extensionVersion) {
                            return extensionApi;
                        }
                        throw new Error('This version is not available');
                    },
                },
            });
            const vscodeExtensions = vscodeExtensionsFactory();
            vscodeExtensions.getExtension.mockImplementation(id => id === extensionId ? extension : undefined);
            const provider = new ExtensionApiProviderImpl(extensionId, extensionVersion, vscodeExtensions);

            const callback = jest.fn();
            provider.onActivate(callback);

            await waitTimeout();

            expect(callback).toHaveBeenCalledWith(extensionApi);
        });

        it('does not call the callback if the extension is installed but the API version is not available', async () => {
            const extensionId = faker.word.noun();
            const extensionVersion = 2;
            const extension = extensionFactory({
                id: extensionId,
                exports: {
                    getApi: () => {
                        throw new Error('This version is not available');
                    },
                },
            });
            const vscodeExtensions = vscodeExtensionsFactory();
            vscodeExtensions.getExtension.mockImplementation(id => id === extensionId ? extension : undefined);
            const provider = new ExtensionApiProviderImpl(extensionId, extensionVersion, vscodeExtensions);

            const callback = jest.fn();
            provider.onActivate(callback);

            await waitTimeout();

            expect(callback).not.toHaveBeenCalled();
        });

        it('calls the callback with the extension API when the extension is installed later', async () => {
            const extensionId = faker.word.noun();
            const extensionVersion = 2;
            const vscodeExtensions = vscodeExtensionsFactory();
            const provider = new ExtensionApiProviderImpl(extensionId, extensionVersion, vscodeExtensions);

            const callback = jest.fn();
            provider.onActivate(callback);

            await waitTimeout();

            const extensionApi = { someField: 'someValue' };
            const extension = extensionFactory({
                id: extensionId,
                exports: {
                    getApi: (version: number) => {
                        if (version === extensionVersion) {
                            return extensionApi;
                        }
                        throw new Error('This version is not available');
                    },
                },
            });
            vscodeExtensions.getExtension.mockImplementation(id => id === extensionId ? extension : undefined);
            vscodeExtensions.mockFireChange();

            await waitTimeout();

            expect(callback).toHaveBeenCalledWith(extensionApi);
        });
    });
});
