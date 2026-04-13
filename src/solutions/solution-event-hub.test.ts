/**
 * Copyright 2026 Arm Limited
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

import * as vscode from 'vscode';
import { SolutionEventHub, ConvertRequestData, ConvertResultData } from './solution-event-hub';
import { Severity } from './constants';

describe('EventHub', () => {
    let eventHub: SolutionEventHub;
    let mockContext: vscode.ExtensionContext;
    const logMessages = { success: true, errors: [], warnings: [], info: [] };

    beforeEach(() => {
        eventHub = new SolutionEventHub();
        mockContext = {
            subscriptions: []
        } as unknown as vscode.ExtensionContext;
    });

    describe('activate', () => {
        it('should register emitters with context subscriptions', async () => {
            await eventHub.activate(mockContext);

            expect(mockContext.subscriptions).toHaveLength(3);
        });
    });

    describe('fireConvertRequest', () => {
        it('should fire event with complete data', async () => {
            const listener = jest.fn();
            eventHub.onDidConvertRequested(listener);

            const data: ConvertRequestData = {
                solutionPath: '/path/to/solution.csolution.yml',
                targetSet: 'Debug',
                updateRte: true,
                restartRpc: true
            };
            await eventHub.fireConvertRequest(data);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith(data);
        });

        it('should fire event with minimal data', async () => {
            const listener = jest.fn();
            eventHub.onDidConvertRequested(listener);

            const data: ConvertRequestData = {
                solutionPath: '/path/to/solution.csolution.yml',
                targetSet: undefined,
                updateRte: undefined
            };
            await eventHub.fireConvertRequest(data);

            expect(listener).toHaveBeenCalledWith(data);
        });

        it('should notify multiple listeners', async () => {
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            eventHub.onDidConvertRequested(listener1);
            eventHub.onDidConvertRequested(listener2);

            const data: ConvertRequestData = {
                solutionPath: '/path/to/solution.csolution.yml',
                targetSet: 'Release',
                updateRte: false
            };
            await eventHub.fireConvertRequest(data);

            expect(listener1).toHaveBeenCalledWith(data);
            expect(listener2).toHaveBeenCalledWith(data);
        });
    });

    describe('fireConvertCompleted', () => {
        it.each<{ severity: Severity; detection: boolean }>([
            { severity: 'error', detection: true },
            { severity: 'warning', detection: false },
            { severity: 'info', detection: true },
            { severity: 'success', detection: false },
        ])('should fire event with severity "$severity" and detection $detection', async ({ severity, detection }) => {
            const listener = jest.fn();
            eventHub.onDidConvertCompleted(listener);

            const data: ConvertResultData = { severity, detection, logMessages };
            await eventHub.fireConvertCompleted(data);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith(data);
        });

        it('should notify multiple listeners', async () => {
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            eventHub.onDidConvertCompleted(listener1);
            eventHub.onDidConvertCompleted(listener2);

            const data: ConvertResultData = { severity: 'success', detection: true, logMessages };
            await eventHub.fireConvertCompleted(data);

            expect(listener1).toHaveBeenCalledWith(data);
            expect(listener2).toHaveBeenCalledWith(data);
        });
    });

    describe('event independence', () => {
        it('should not cross-fire events between different event types', async () => {
            const requestListener = jest.fn();
            const completeListener = jest.fn();

            eventHub.onDidConvertRequested(requestListener);
            eventHub.onDidConvertCompleted(completeListener);

            await eventHub.fireConvertRequest({
                solutionPath: '/path/to/solution.csolution.yml',
                targetSet: undefined,
                updateRte: true
            });

            expect(requestListener).toHaveBeenCalledTimes(1);
            expect(completeListener).not.toHaveBeenCalled();

            await eventHub.fireConvertCompleted({ severity: 'success', detection: true, logMessages });

            expect(requestListener).toHaveBeenCalledTimes(1);
            expect(completeListener).toHaveBeenCalledTimes(1);
        });
    });

    describe('async behavior', () => {
        it('should handle concurrent fireConvertRequest calls', async () => {
            const listener = jest.fn();
            eventHub.onDidConvertRequested(listener);

            const data1: ConvertRequestData = {
                solutionPath: '/path1.csolution.yml',
                targetSet: undefined,
                updateRte: true
            };
            const data2: ConvertRequestData = {
                solutionPath: '/path2.csolution.yml',
                targetSet: 'Debug',
                updateRte: false
            };

            await Promise.all([
                eventHub.fireConvertRequest(data1),
                eventHub.fireConvertRequest(data2)
            ]);

            expect(listener).toHaveBeenCalledTimes(2);
        });

        it('should handle concurrent fireConvertCompleted calls', async () => {
            const listener = jest.fn();
            eventHub.onDidConvertCompleted(listener);

            await Promise.all([
                eventHub.fireConvertCompleted({ severity: 'info', detection: true, logMessages }),
                eventHub.fireConvertCompleted({ severity: 'error', detection: false, logMessages })
            ]);

            expect(listener).toHaveBeenCalledTimes(2);
        });
    });

    describe('fireConfigureSolutionDataReady', () => {
        it('should fire event with compilers and configurations', async () => {
            const listener = jest.fn();
            eventHub.onDidConfigureSolutionDataReady(listener);

            const data = { availableCompilers: ['GCC', 'AC6'], availableConfigurations: undefined };
            await eventHub.fireConfigureSolutionDataReady(data);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith(data);
        });

        it('should notify multiple listeners', async () => {
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            eventHub.onDidConfigureSolutionDataReady(listener1);
            eventHub.onDidConfigureSolutionDataReady(listener2);

            const data = { availableCompilers: [], availableConfigurations: [{ variables: [] }] };
            await eventHub.fireConfigureSolutionDataReady(data);

            expect(listener1).toHaveBeenCalledWith(data);
            expect(listener2).toHaveBeenCalledWith(data);
        });
    });
});
