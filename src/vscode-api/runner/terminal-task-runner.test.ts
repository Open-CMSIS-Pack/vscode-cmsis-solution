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
import { TerminalTaskRunner, TerminalTask } from './terminal-task-runner';
import { Runner } from './runner';

jest.mock('vscode', () => {
    interface MockCancellationToken {
        isCancellationRequested: boolean;
        onCancellationRequested: (callback: () => void) => { dispose: () => void };
    }

    class MockCancellationTokenSource {
        public token: MockCancellationToken;
        private _cancelled = false;
        private readonly _callbacks: (() => void)[] = [];

        constructor() {
            this.token = {
                isCancellationRequested: false,
                onCancellationRequested: (callback: () => void) => {
                    this._callbacks.push(callback);
                    return { dispose: () => {} };
                }
            };
        }

        cancel() {
            if (this._cancelled) return;
            this._cancelled = true;
            this.token.isCancellationRequested = true;
            this._callbacks.forEach(callback => callback());
        }

        dispose() {
            // Mock dispose implementation - clears callbacks
            this._callbacks.length = 0;
        }
    }

    class MockEventEmitter<T = string> {
        private readonly _callbacks: ((data: T) => void)[] = [];

        constructor() {
            this.event = (callback: (data: T) => void) => {
                this._callbacks.push(callback);
                return { dispose: () => {} };
            };
        }

        fire(data: T) {
            this._callbacks.forEach(callback => callback(data));
        }

        event: (callback: (data: T) => void) => { dispose: () => void };
    }

    return {
        CancellationTokenSource: MockCancellationTokenSource,
        EventEmitter: MockEventEmitter,
    };
}, { virtual: true });

describe('TerminalTaskRunner - Build Process Cancellation', () => {
    let mockRunner: jest.Mocked<Runner>;
    let terminalTask: TerminalTask;
    let terminalTaskRunner: TerminalTaskRunner;

    beforeEach(() => {
        mockRunner = {
            run: jest.fn(),
        };

        terminalTask = {
            definition: { type: 'build-task', solution: 'test.csolution.yml' },
            runner: mockRunner,
            taskName: 'Build',
            runMessage: 'Building',
            completeMessage: 'Build complete',
            terminationMessage: 'Build cancelled',
            dimensions: undefined,
        };

        terminalTaskRunner = new TerminalTaskRunner(terminalTask);
    });

    it('should cancel build process when close() is called', async () => {
        let cancellationRequested = false;
        let cancellationCallback: (() => void) | undefined;

        mockRunner.run.mockImplementation(async (_definition, _onOutput, cancellationToken) => {
            // Register cancellation handler (simulating ProcessManager behavior)
            cancellationToken?.onCancellationRequested(() => {
                cancellationRequested = true;
                cancellationCallback?.();
            });

            return new Promise<void>((resolve) => {
                cancellationCallback = () => resolve(); // Build stops when cancelled
                // Without cancellation, this would timeout
                setTimeout(() => resolve(), 5000);
            });
        });

        const buildPromise = terminalTaskRunner.open(undefined);

        // Wait a moment to ensure build has started
        await new Promise(resolve => setTimeout(resolve, 10));

        // Simulate user clicking "Stop build" button
        terminalTaskRunner.close();

        await buildPromise;

        expect(cancellationRequested).toBe(true);
        expect(mockRunner.run).toHaveBeenCalledWith(
            terminalTask.definition,
            expect.any(Function),
            expect.objectContaining({
                isCancellationRequested: expect.any(Boolean),
                onCancellationRequested: expect.any(Function),
            }),
            undefined
        );
    });

    it('should not cancel if build completes before close() is called', async () => {
        let cancellationRequested = false;

        mockRunner.run.mockImplementation(async (_definition, _onOutput, cancellationToken) => {
            cancellationToken?.onCancellationRequested(() => {
                cancellationRequested = true;
            });

            return Promise.resolve();
        });

        // Start and wait for build to complete
        await terminalTaskRunner.open(undefined);

        // Try to cancel after build is done
        terminalTaskRunner.close();

        expect(cancellationRequested).toBe(false);
    });

    it('should handle multiple close() calls safely', async () => {
        let cancelCallCount = 0;

        mockRunner.run.mockImplementation(async (_definition, _onOutput, cancellationToken) => {
            cancellationToken?.onCancellationRequested(() => {
                cancelCallCount++;
            });
            // Simulate long-running task
            return new Promise<void>((resolve) => {
                setTimeout(() => resolve(), 1000);
            });
        });

        // Start build
        const buildPromise = terminalTaskRunner.open(undefined);

        // Call close multiple times
        terminalTaskRunner.close();
        terminalTaskRunner.close();
        terminalTaskRunner.close();

        await buildPromise;

        // Should only cancel once, not multiple times
        expect(cancelCallCount).toBe(1);
    });

    it('should pass real cancellation token to runner', async () => {
        mockRunner.run.mockResolvedValue();

        await terminalTaskRunner.open(undefined);

        expect(mockRunner.run).toHaveBeenCalledWith(
            terminalTask.definition,
            expect.any(Function),
            expect.objectContaining({
                isCancellationRequested: expect.any(Boolean),
                onCancellationRequested: expect.any(Function),
            }),
            undefined
        );

        const passedToken = mockRunner.run.mock.calls[0][2];
        expect(passedToken).toBeDefined();
        expect(typeof passedToken?.onCancellationRequested).toBe('function');
    });

    it('should simulate complete build cancellation flow', async () => {
        const buildSteps: string[] = [];
        interface MockBuildProcess {
            pid: number;
            killed: boolean;
            kill: jest.MockedFunction<() => void>;
        }
        let buildProcess: MockBuildProcess | null = null;

        // Mock the complete cancellation chain
        mockRunner.run.mockImplementation(async (_definition, onOutput, cancellationToken) => {
            buildSteps.push('Build started');
            onOutput('Starting build process...');

            // Simulate ProcessManager spawning cbuild
            buildProcess = {
                pid: 12345,
                killed: false,
                kill: jest.fn(() => {
                    if (buildProcess) {
                        buildProcess.killed = true;
                        buildSteps.push('Process killed');
                    }
                })
            };

            // Register cancellation (simulating ProcessManager)
            cancellationToken?.onCancellationRequested(() => {
                buildSteps.push('Cancellation requested');
                if (buildProcess && !buildProcess.killed) {
                    buildProcess.kill();
                }
            });

            // Simulate long build that gets interrupted
            return new Promise<void>((resolve) => {
                const timeout = setTimeout(() => {
                    buildSteps.push('Build completed normally');
                    resolve();
                }, 2000);

                // If cancelled, resolve immediately
                cancellationToken?.onCancellationRequested(() => {
                    clearTimeout(timeout);
                    buildSteps.push('Build cancelled');
                    resolve();
                });
            });
        });

        // Start build
        const buildPromise = terminalTaskRunner.open(undefined);

        // Wait for build to start
        await new Promise(resolve => setTimeout(resolve, 10));

        // Cancel the build (user action)
        terminalTaskRunner.close();

        await buildPromise;

        // Verify the complete cancellation flow
        expect(buildSteps).toContain('Build started');
        expect(buildSteps).toContain('Cancellation requested');
        expect(buildSteps).toContain('Process killed');
        expect(buildSteps).toContain('Build cancelled');
        expect(buildSteps).not.toContain('Build completed normally');

        expect(buildProcess).toBeDefined();
        expect(buildProcess!.kill).toHaveBeenCalled();
    });
});
