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

import { waitForPromises } from '../__test__/test-waits';
import { mockWaitUntilUsed, mockWaitUntilFree } from './tcp-port-monitor.mock';

import { TCPPortMonitor } from './tcp-port-monitor';

describe('TCPPortMonitor', () => {
    const testPort = 8080;
    let onAvailableCallback: jest.Mock;
    let mockDisposable: { dispose: jest.Mock };

    beforeEach(() => {
        jest.clearAllMocks();
        mockDisposable = { dispose: jest.fn() };
        onAvailableCallback = jest.fn().mockReturnValue(mockDisposable);
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    describe('construction and lifecycle', () => {
        it('starts monitoring port on construction', async () => {
            new TCPPortMonitor(testPort, onAvailableCallback);
            await waitForPromises();

            expect(mockWaitUntilUsed.mock).toHaveBeenCalledWith(testPort, 500, 500);
            expect(onAvailableCallback).not.toHaveBeenCalled();
        });

        it('stores the port number', async () => {
            const monitor = new TCPPortMonitor(testPort, onAvailableCallback);
            await waitForPromises();

            expect(monitor.port).toBe(testPort);
        });

        it('can be disposed before port becomes available', async () => {
            const monitor = new TCPPortMonitor(testPort, onAvailableCallback);
            await waitForPromises();

            mockWaitUntilUsed.resolve();
            await monitor.dispose();

            expect(onAvailableCallback).not.toHaveBeenCalled();
        });
    });

    describe('port availability detection', () => {
        it('calls onAvailable when port becomes used', async () => {
            new TCPPortMonitor(testPort, onAvailableCallback);
            await waitForPromises();

            await mockWaitUntilUsed.resolve();

            expect(onAvailableCallback).toHaveBeenCalledTimes(1);
            expect(mockWaitUntilFree.mock).toHaveBeenCalledWith(testPort, 500, 500);
        });

        it('starts monitoring for port to become free after becoming available', async () => {
            new TCPPortMonitor(testPort, onAvailableCallback);
            await waitForPromises();

            await mockWaitUntilUsed.resolve();
            await mockWaitUntilFree.resolve();

            expect(mockWaitUntilFree.mock).toHaveBeenCalledWith(testPort, 500, 500);
            expect(mockWaitUntilUsed.mock).toHaveBeenCalledTimes(2);
        });

        it('disposes onAvailable state when port becomes free', async () => {
            new TCPPortMonitor(testPort, onAvailableCallback);
            await waitForPromises();

            await mockWaitUntilUsed.resolve();
            await mockWaitUntilFree.resolve();

            expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
        });

        it('cycles between monitoring used and free states', async () => {
            new TCPPortMonitor(testPort, onAvailableCallback);
            await waitForPromises();

            await mockWaitUntilUsed.resolve();
            await mockWaitUntilFree.resolve();
            await mockWaitUntilUsed.resolve();

            expect(onAvailableCallback).toHaveBeenCalledTimes(2);
            expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
        });
    });

    describe('error handling', () => {
        it('retries when waitUntilUsed fails', async () => {
            new TCPPortMonitor(testPort, onAvailableCallback);
            await waitForPromises();

            await mockWaitUntilUsed.reject();
            await mockWaitUntilUsed.resolve();

            expect(mockWaitUntilUsed.mock).toHaveBeenCalledTimes(2);
            expect(onAvailableCallback).toHaveBeenCalledTimes(1);
        });

        it('retries when waitUntilFree fails', async () => {
            new TCPPortMonitor(testPort, onAvailableCallback);
            await waitForPromises();

            await mockWaitUntilUsed.resolve();
            await mockWaitUntilFree.reject();
            await mockWaitUntilFree.resolve();

            expect(mockWaitUntilFree.mock).toHaveBeenCalledTimes(2);
            expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
        });

    });

    describe('dispose behavior', () => {
        it('disposes the state when monitor is disposed', async () => {
            const monitor = new TCPPortMonitor(testPort, onAvailableCallback);
            await waitForPromises();

            await mockWaitUntilUsed.resolve();

            mockWaitUntilFree.reject();
            await monitor.dispose();

            expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
        });

        it('can be disposed multiple times safely', async () => {
            const monitor = new TCPPortMonitor(testPort, onAvailableCallback);
            await waitForPromises();

            await mockWaitUntilUsed.resolve();

            mockWaitUntilFree.reject();
            await monitor.dispose();
            await monitor.dispose();
            await monitor.dispose();

            expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
        });

        it('does not call onAvailable after being disposed', async () => {
            const monitor = new TCPPortMonitor(testPort, onAvailableCallback);
            mockWaitUntilUsed.reject();
            await monitor.dispose();

            // Resolve the promise after disposal
            await mockWaitUntilUsed.resolve();

            expect(onAvailableCallback).not.toHaveBeenCalled();
        });
    });

});

