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

import 'jest';
import * as vscode from 'vscode';
import { ExtensionApiWrapper } from './extension-api-wrapper';

const mockGetExtension = vscode.extensions.getExtension as jest.Mock;
const mockOnDidChange = vscode.extensions.onDidChange as jest.Mock;

interface TestApi {
    getValue: () => string;
    dispose?: () => void;
}

interface TestExports {
    value: string;
}

describe('ExtensionApiWrapper', () => {
    let context: vscode.ExtensionContext;
    let onDidChangeCallback: () => void;

    beforeEach(() => {
        context = { subscriptions: [] } as unknown as vscode.ExtensionContext;
        mockGetExtension.mockClear();
        mockOnDidChange.mockClear();
        mockOnDidChange.mockImplementation((callback: () => void) => {
            onDidChangeCallback = callback;
            return { dispose: jest.fn() };
        });
    });

    describe('constructor', () => {
        it('creates a wrapper with extensionId', () => {
            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');

            expect(wrapper.extensionId).toBe('test.extension');
            expect(wrapper.api).toBeUndefined();
        });

        it('creates a wrapper with custom getApi function', () => {
            const getApi = jest.fn();
            const wrapper = new ExtensionApiWrapper<TestApi, TestExports>(
                'test.extension',
                getApi
            );

            expect(wrapper.getApi).toBe(getApi);
        });
    });

    describe('activate', () => {
        it('subscribes to extensions.onDidChange event', async () => {
            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');

            await wrapper.activate(context);

            expect(mockOnDidChange).toHaveBeenCalledTimes(1);
            expect(context.subscriptions.length).toBeGreaterThan(0);
        });

        it('calls extensionsDidChange on activation', async () => {
            mockGetExtension.mockReturnValue(undefined);
            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');

            await wrapper.activate(context);

            expect(mockGetExtension).toHaveBeenCalledWith('test.extension');
        });

        it('sets api when extension is already active', async () => {
            const mockApi: TestApi = { getValue: () => 'test' };
            const mockExtension = {
                isActive: true,
                exports: mockApi,
                activate: jest.fn().mockResolvedValue(mockApi),
            };
            mockGetExtension.mockReturnValue(mockExtension);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            await wrapper.activate(context);

            expect(wrapper.api).toBe(mockApi);
            expect(mockExtension.activate).toHaveBeenCalledTimes(1);
        });

        it('activates and sets api when extension is not yet active', async () => {
            const mockApi: TestApi = { getValue: () => 'test' };
            const mockExtension = {
                isActive: false,
                exports: undefined,
                activate: jest.fn().mockResolvedValue(mockApi),
            };
            mockGetExtension.mockReturnValue(mockExtension);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            await wrapper.activate(context);

            expect(mockExtension.activate).toHaveBeenCalledTimes(1);
            expect(wrapper.api).toBe(mockApi);
        });

        it('uses custom getApi function to transform exports', async () => {
            const mockExports: TestExports = { value: 'exported' };
            const mockApi: TestApi = { getValue: () => mockExports.value };
            const mockExtension = {
                isActive: true,
                exports: mockExports,
                activate: jest.fn().mockResolvedValue(mockExports),
            };
            mockGetExtension.mockReturnValue(mockExtension);

            const getApi = jest.fn().mockReturnValue(mockApi);
            const wrapper = new ExtensionApiWrapper<TestApi, TestExports>(
                'test.extension',
                getApi
            );
            await wrapper.activate(context);

            expect(mockExtension.activate).toHaveBeenCalledTimes(1);
            expect(getApi).toHaveBeenCalledWith(mockExports, context);
            expect(wrapper.api).toBe(mockApi);
        });

        it('sets api to undefined when extension is not found', async () => {
            mockGetExtension.mockReturnValue(undefined);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            await wrapper.activate(context);

            expect(wrapper.api).toBeUndefined();
        });
    });

    describe('onAvailable event', () => {
        it('fires onAvailable when api becomes available', async () => {
            const mockApi: TestApi = { getValue: () => 'test' };
            const mockExtension = {
                isActive: true,
                exports: mockApi,
                activate: jest.fn().mockResolvedValue(mockApi),
            };
            mockGetExtension.mockReturnValue(mockExtension);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            const listener = jest.fn();
            wrapper.onAvailable(listener);

            await wrapper.activate(context);

            expect(listener).toHaveBeenCalledWith(mockApi);
        });

        it('does not fire onAvailable when api is set to undefined', async () => {
            mockGetExtension.mockReturnValue(undefined);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            const listener = jest.fn();
            wrapper.onAvailable(listener);

            await wrapper.activate(context);

            expect(listener).not.toHaveBeenCalled();
        });

        it('fires onAvailable when extension becomes available after activation', async () => {
            mockGetExtension.mockReturnValue(undefined);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            const listener = jest.fn();
            wrapper.onAvailable(listener);

            await wrapper.activate(context);
            expect(listener).not.toHaveBeenCalled();

            // Extension becomes available
            const mockApi: TestApi = { getValue: () => 'test' };
            const mockExtension = {
                isActive: true,
                exports: mockApi,
                activate: jest.fn().mockResolvedValue(mockApi),
            };
            mockGetExtension.mockReturnValue(mockExtension);
            await onDidChangeCallback();

            expect(listener).toHaveBeenCalledWith(mockApi);
        });
    });

    describe('extensionsDidChange', () => {
        it('activates extension and sets api when extension is installed', async () => {
            const mockApi: TestApi = { getValue: () => 'test' };
            const mockExtension = {
                isActive: false,
                exports: undefined,
                activate: jest.fn().mockResolvedValue(mockApi),
            };
            mockGetExtension.mockReturnValue(mockExtension);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            await wrapper.activate(context);

            expect(mockExtension.activate).toHaveBeenCalledTimes(1);
            expect(wrapper.api).toBe(mockApi);
        });

        it('updates api when extension is reinstalled', async () => {
            const mockApi1: TestApi = { getValue: () => 'test1' };
            const mockExtension1 = {
                isActive: true,
                exports: mockApi1,
                activate: jest.fn().mockResolvedValue(mockApi1),
            };
            mockGetExtension.mockReturnValue(mockExtension1);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            await wrapper.activate(context);
            expect(wrapper.api).toBe(mockApi1);

            // Extension is updated/reinstalled with new API
            const mockApi2: TestApi = { getValue: () => 'test2' };
            const mockExtension2 = {
                isActive: true,
                exports: mockApi2,
                activate: jest.fn().mockResolvedValue(mockApi2),
            };
            mockGetExtension.mockReturnValue(mockExtension2);
            await onDidChangeCallback();

            expect(wrapper.api).toBe(mockApi2);
        });

        it('clears api when extension is uninstalled', async () => {
            const mockApi: TestApi = { getValue: () => 'test' };
            const mockExtension = {
                isActive: true,
                exports: mockApi,
                activate: jest.fn().mockResolvedValue(mockApi),
            };
            mockGetExtension.mockReturnValue(mockExtension);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            await wrapper.activate(context);
            expect(wrapper.api).toBeDefined();

            // Extension is uninstalled
            mockGetExtension.mockReturnValue(undefined);
            await onDidChangeCallback();

            expect(wrapper.api).toBeUndefined();
        });
    });

    describe('disposeApi', () => {
        it('calls dispose on api when api has dispose method', async () => {
            const mockDispose = jest.fn();
            const mockApi: TestApi = {
                getValue: () => 'test',
                dispose: mockDispose,
            };
            const mockExtension = {
                isActive: true,
                exports: mockApi,
                activate: jest.fn().mockResolvedValue(mockApi),
            };
            mockGetExtension.mockReturnValue(mockExtension);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            await wrapper.activate(context);
            expect(wrapper.api).toBe(mockApi);

            // Trigger api change to dispose old api
            mockGetExtension.mockReturnValue(undefined);
            await onDidChangeCallback();

            expect(mockDispose).toHaveBeenCalledTimes(1);
        });

        it('does not call dispose when api does not have dispose method', async () => {
            const mockApi: TestApi = { getValue: () => 'test' };
            const mockExtension = {
                isActive: true,
                exports: mockApi,
                activate: jest.fn().mockResolvedValue(mockApi),
            };
            mockGetExtension.mockReturnValue(mockExtension);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            await wrapper.activate(context);

            // Trigger api change - should not throw
            mockGetExtension.mockReturnValue(undefined);
            await expect(onDidChangeCallback()).resolves.not.toThrow();
        });

        it('disposes api when wrapper is disposed through context subscriptions', async () => {
            const mockDispose = jest.fn();
            const mockApi: TestApi = {
                getValue: () => 'test',
                dispose: mockDispose,
            };
            const mockExtension = {
                isActive: true,
                exports: mockApi,
                activate: jest.fn().mockResolvedValue(mockApi),
            };
            mockGetExtension.mockReturnValue(mockExtension);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            await wrapper.activate(context);

            // Dispose all subscriptions (simulating extension deactivation)
            context.subscriptions.forEach(sub => sub.dispose());

            expect(mockDispose).toHaveBeenCalled();
        });
    });

    describe('api property', () => {
        it('returns undefined when no api is set', () => {
            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');

            expect(wrapper.api).toBeUndefined();
        });

        it('does not fire onAvailable when setting same api value', async () => {
            const mockApi: TestApi = { getValue: () => 'test' };
            const mockExtension = {
                isActive: true,
                exports: mockApi,
                activate: jest.fn().mockResolvedValue(mockApi),
            };
            mockGetExtension.mockReturnValue(mockExtension);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            const listener = jest.fn();
            wrapper.onAvailable(listener);

            await wrapper.activate(context);
            expect(listener).toHaveBeenCalledTimes(1);

            // Trigger change but same extension returns same API
            await onDidChangeCallback();

            // Should only be called once (not twice)
            expect(listener).toHaveBeenCalledTimes(1);
        });
    });

    describe('integration scenarios', () => {
        it('handles extension lifecycle: install -> activate -> uninstall', async () => {
            mockGetExtension.mockReturnValue(undefined);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            const listener = jest.fn();
            wrapper.onAvailable(listener);

            // Initially no extension
            await wrapper.activate(context);
            expect(wrapper.api).toBeUndefined();
            expect(listener).not.toHaveBeenCalled();

            // Extension installed and activated
            const mockApi: TestApi = { getValue: () => 'test', dispose: jest.fn() };
            const mockExtension = {
                isActive: false,
                exports: undefined,
                activate: jest.fn().mockResolvedValue(mockApi),
            };
            mockGetExtension.mockReturnValue(mockExtension);
            await onDidChangeCallback();
            expect(wrapper.api).toBe(mockApi);
            expect(listener).toHaveBeenCalledWith(mockApi);
            expect(mockExtension.activate).toHaveBeenCalledTimes(1);

            // Extension uninstalled
            mockGetExtension.mockReturnValue(undefined);
            await onDidChangeCallback();
            expect(wrapper.api).toBeUndefined();
            expect(mockApi.dispose).toHaveBeenCalled();
        });

        it('handles multiple listeners on onAvailable event', async () => {
            const mockApi: TestApi = { getValue: () => 'test' };
            const mockExtension = {
                isActive: true,
                exports: mockApi,
                activate: jest.fn().mockResolvedValue(mockApi),
            };
            mockGetExtension.mockReturnValue(mockExtension);

            const wrapper = new ExtensionApiWrapper<TestApi>('test.extension');
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            wrapper.onAvailable(listener1);
            wrapper.onAvailable(listener2);

            await wrapper.activate(context);

            expect(listener1).toHaveBeenCalledWith(mockApi);
            expect(listener2).toHaveBeenCalledWith(mockApi);
        });
    });
});
