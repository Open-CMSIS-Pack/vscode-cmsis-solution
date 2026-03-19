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

import * as React from 'react';

/**
 * Custom hook to detect VS Code theme changes in webviews.
 * Observes DOM mutations on document.body for 'vscode-dark' class changes.
 *
 * Following the event-driven updates architecture pattern, this hook reactively
 * synchronizes with VS Code theme changes without requiring backend message passing.
 *
 * @returns boolean indicating if dark theme is active
 *
 * @example
 * ```tsx
 * const isDarkTheme = useVSCodeTheme();
 * <ConfigProvider theme={{
 *   algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm
 * }}>
 * ```
 */
export const useVSCodeTheme = (): boolean => {
    const [isDarkTheme, setIsDarkTheme] = React.useState<boolean>(
        document.body.classList.contains('vscode-dark')
    );

    React.useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutationRecord) => {
                const vscode_dark = (mutationRecord.target as HTMLElement).classList.contains('vscode-dark');
                if (vscode_dark !== isDarkTheme) {
                    setIsDarkTheme(vscode_dark);
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => {
            observer.disconnect();
        };
    }, [isDarkTheme]);

    return isDarkTheme;
};
