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

import { renderHook, act } from '@testing-library/react';
import { useVSCodeTheme } from './use-vscode-theme';

describe('useVSCodeTheme', () => {
    beforeEach(() => {
        // Reset body classes before each test
        document.body.className = '';
        // Force disconnect any lingering observers
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Clean up classes
        document.body.className = '';
    });

    describe('initial theme detection', () => {
        it('should detect dark theme from body class', () => {
            document.body.classList.add('vscode-dark');

            const { result } = renderHook(() => useVSCodeTheme());

            expect(result.current).toBe(true);
        });

        it('should detect light theme when dark class is absent', () => {
            document.body.classList.add('vscode-light');

            const { result } = renderHook(() => useVSCodeTheme());

            expect(result.current).toBe(false);
        });

        it('should return false when no VS Code theme class is present', () => {
            const { result } = renderHook(() => useVSCodeTheme());

            expect(result.current).toBe(false);
        });
    });

    describe('theme change detection', () => {
        it('should update when theme changes from light to dark', async () => {
            document.body.classList.add('vscode-light');
            const { result, unmount } = renderHook(() => useVSCodeTheme());

            expect(result.current).toBe(false);

            // Trigger theme change
            act(() => {
                document.body.classList.remove('vscode-light');
                document.body.classList.add('vscode-dark');
            });

            // Wait for MutationObserver to fire and state to update
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(result.current).toBe(true);
            unmount();
        });

        it('should update when theme changes from dark to light', async () => {
            document.body.classList.add('vscode-dark');
            const { result, unmount } = renderHook(() => useVSCodeTheme());

            expect(result.current).toBe(true);

            // Trigger theme change
            act(() => {
                document.body.classList.remove('vscode-dark');
                document.body.classList.add('vscode-light');
            });

            // Wait for MutationObserver to fire and state to update
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(result.current).toBe(false);
            unmount();
        });

        it('should not update when unrelated classes change', async () => {
            document.body.classList.add('vscode-dark');
            const { result, unmount } = renderHook(() => useVSCodeTheme());

            const initialValue = result.current;
            expect(initialValue).toBe(true);

            act(() => {
                document.body.classList.add('some-other-class');
            });

            // Small delay to ensure any potential updates would have occurred
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(result.current).toBe(initialValue);
            unmount();
        });
    });

    describe('MutationObserver cleanup', () => {
        it('should disconnect observer on unmount', () => {
            const disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');

            const { unmount } = renderHook(() => useVSCodeTheme());

            unmount();

            expect(disconnectSpy).toHaveBeenCalled();
            disconnectSpy.mockRestore();
        });

        it('should observe body element with correct configuration', () => {
            const observeSpy = jest.spyOn(MutationObserver.prototype, 'observe');

            const { unmount } = renderHook(() => useVSCodeTheme());

            expect(observeSpy).toHaveBeenCalledWith(
                document.body,
                {
                    attributes: true,
                    attributeFilter: ['class']
                }
            );

            // Clean up to prevent observer leakage
            unmount();
            observeSpy.mockRestore();
        });
    });

    describe('event-driven updates pattern', () => {
        it('should reactively sync with VS Code theme without message passing', async () => {
            document.body.classList.add('vscode-light');
            const { result, unmount } = renderHook(() => useVSCodeTheme());

            expect(result.current).toBe(false);

            // Simulate VS Code changing theme
            act(() => {
                document.body.classList.remove('vscode-light');
                document.body.classList.add('vscode-dark');
            });

            // Wait for MutationObserver to fire and state to update
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(result.current).toBe(true);

            // Clean up
            unmount();
        });
    });

    describe('edge cases', () => {
        it('should handle high-contrast theme as light theme', () => {
            document.body.classList.add('vscode-high-contrast');

            const { result } = renderHook(() => useVSCodeTheme());

            // High contrast is not dark, so should return false
            expect(result.current).toBe(false);
        });

        it('should handle multiple theme classes gracefully', () => {
            // Should never happen, but test defensive behavior
            document.body.classList.add('vscode-dark', 'vscode-light');

            const { result } = renderHook(() => useVSCodeTheme());

            // vscode-dark takes precedence
            expect(result.current).toBe(true);
        });

        it('should handle rapid theme changes', async () => {
            const { result, unmount } = renderHook(() => useVSCodeTheme());

            // Rapid succession of theme changes
            act(() => {
                document.body.className = 'vscode-dark';
            });
            await new Promise(resolve => setTimeout(resolve, 10));

            act(() => {
                document.body.className = 'vscode-light';
            });
            await new Promise(resolve => setTimeout(resolve, 10));

            act(() => {
                document.body.className = 'vscode-dark';
            });

            // Wait for final state to settle
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(result.current).toBe(true);

            // Clean up
            unmount();
        });
    });
});
