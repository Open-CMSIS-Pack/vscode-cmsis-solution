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

/**
 * Electron Application Integration Layer
 *
 * This module provides low-level Playwright-Electron integration utilities for
 * launching and interacting with VS Code's Electron application. It handles
 * the bridge between Playwright's test automation and Electron's application layer.
 *
 * Key responsibilities:
 * - Launch Electron applications with custom arguments and environment variables
 * - Configure Playwright timeouts for Electron context
 * - Retrieve the first window (main VS Code window) from Electron app
 * - Set up logging for Electron console, page errors, and crashes
 * - Mock dialog responses (e.g., message boxes, file dialogs)
 */

import * as playwright from 'playwright';

export const launchElectron = async (executablePath: string, args: string[], defaultTimeoutMillis: number, env: { [key: string]: string } = {}): Promise<playwright.ElectronApplication> => {
    const electronApp = await playwright._electron.launch({ executablePath, args, timeout: defaultTimeoutMillis, env: { ...process.env, ...env } as { [key: string]: string } });
    electronApp.context().setDefaultTimeout(defaultTimeoutMillis);
    return electronApp;
};

export const ELECTRON_APPLICATION_CLOSED_MESSAGE = 'Electron application is closed immediately after launch';

export const getPage = async (electronApp: playwright.ElectronApplication): Promise<playwright.Page> => {
    try {
        return await electronApp.firstWindow();
    } catch (e) {
        if (e instanceof Error && e.message === 'electronApplication.firstWindow: Electron application closed') {
            throw new Error(ELECTRON_APPLICATION_CLOSED_MESSAGE);
        } else {
            throw e;
        }
    }
};

export const setupElectronLogging = (page: playwright.Page): void => {
    page.on('console', e => e.type() === 'error' && console.log(`Playwright (Electron): window.on('console.error') [${e.text()}]`));
    page.on('pageerror', async (error) => console.log(`Playwright (Electron) ERROR: page error: ${error}`));
    page.on('crash', () => console.log('Playwright (Electron) ERROR: page crash'));
    page.on('close', () => console.log('Playwright (Electron): page close'));
};

type ElectronDialog = {
    showMessageBox: (browserWindow: unknown, options: { buttons?: string[], message: string }) => { response: number, checkboxChecked: boolean };
}

/**
 * Mock electron's native message box dialog.
 * @param buttonNameToClick Name of the button to click for the next dialog opened during the test run
 */
export const mockShowMessageBoxResponse = async (electronApp: playwright.ElectronApplication, buttonNameToClick: string): Promise<void> => {
    await electronApp.evaluate(
        // Note: this function cannot include "advanced" JS features, e.g., async. It is stringified and sent to the electron process for evaluation,
        // where not all modern language features are supported.
        ({ dialog }: { dialog: ElectronDialog }, targetButtonName: string) => {
            const originalShowMessageBox = dialog.showMessageBox;
            dialog.showMessageBox = function (_browserWindow, options) {
                dialog.showMessageBox = originalShowMessageBox;
                const buttonNames = options.buttons || [];
                const buttonIndex = buttonNames.indexOf(targetButtonName);
                if (buttonIndex === -1) {
                    const optionsWithErrorMessage = { ...options, message: `E2E test error: could not find button ${targetButtonName}` };
                    return originalShowMessageBox(_browserWindow, optionsWithErrorMessage);
                } else {
                    return { response: buttonIndex, checkboxChecked: false };
                }
            };
        },
        buttonNameToClick,
    );
};
