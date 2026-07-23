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
import { log } from '../utils/logger';

export const launchElectron = async (executablePath: string, args: string[], defaultTimeoutMillis: number, env: { [key: string]: string } = {}): Promise<playwright.ElectronApplication> => {
    const electronApp = await playwright._electron.launch({ executablePath, args, timeout: defaultTimeoutMillis, env: { ...process.env, ...env } as { [key: string]: string } });
    electronApp.context().setDefaultTimeout(defaultTimeoutMillis);

    const proc = electronApp.process();

    // Capture VS Code stderr so startup errors are visible in test logs.
    proc.stderr?.on('data', (chunk: Buffer) => {
        const text = chunk.toString().trim();
        if (text) {
            log('debug', `VS Code stderr: ${text}`);
        }
    });

    // Log unexpected exits before the window appears to aid diagnosis.
    proc.once('exit', (code, signal) => {
        if (code !== 0 || signal) {
            log('warn', `VS Code process exited: code=${code ?? 'null'}, signal=${signal ?? 'null'}`);
        }
    });

    return electronApp;
};

export const ELECTRON_APPLICATION_CLOSED_MESSAGE = 'Electron application is closed immediately after launch';

/** Playwright error messages that indicate the Electron process exited before showing a window. */
const ELECTRON_APP_CLOSED_PATTERNS = [
    'electronApplication.firstWindow: Electron application closed',
    'Target page, context or browser has been closed',
];

export const getPage = async (electronApp: playwright.ElectronApplication, timeout: number): Promise<playwright.Page> => {
    try {
        return await electronApp.firstWindow({ timeout });
    } catch (e) {
        if (e instanceof Error && ELECTRON_APP_CLOSED_PATTERNS.some(p => e.message.includes(p))) {
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

type DialogWithBackup = ElectronDialog & {
    __e2eOriginalShowMessageBox?: ElectronDialog['showMessageBox'];
};

export type MockShowMessageBoxOptions = {
    /**
     * When true the mock stays installed and auto-answers every subsequent dialog that
     * contains the target button, instead of being removed after the first dialog.
     * Use this for prompts (e.g. the Arm Environment Manager "Always Allow" trust dialog)
     * that can appear at an unpredictable time, or more than once, during a test.
     */
    persist?: boolean;
};

/**
 * Mock electron's native message box dialog.
 *
 * By default the mock is one-shot: it intercepts the next dialog and then restores the
 * original handler. Native message boxes are modal and block the extension host, so if a
 * real dialog appears before the mock is installed (or a second dialog appears after a
 * one-shot mock was consumed) the host blocks forever in headless CI. Pass `persist: true`
 * for prompts that may appear at an unpredictable time to keep the auto-response installed.
 *
 * @param buttonNameToClick Name of the button to click for dialogs opened during the test run
 * @param options Optional behaviour flags (e.g. `persist`)
 */
export const mockShowMessageBoxResponse = async (
    electronApp: playwright.ElectronApplication,
    buttonNameToClick: string,
    options: MockShowMessageBoxOptions = {},
): Promise<void> => {
    await electronApp.evaluate(
        // Note: this function cannot include "advanced" JS features, e.g., async. It is stringified and sent to the electron process for evaluation,
        // where not all modern language features are supported.
        ({ dialog }: { dialog: DialogWithBackup }, { targetButtonName, persist }: { targetButtonName: string, persist: boolean }) => {
            // Capture the true original handler exactly once so repeated installs never chain.
            if (!dialog.__e2eOriginalShowMessageBox) {
                dialog.__e2eOriginalShowMessageBox = dialog.showMessageBox;
            }
            const originalShowMessageBox = dialog.__e2eOriginalShowMessageBox;

            dialog.showMessageBox = function (_browserWindow, dialogOptions) {
                const buttonNames = dialogOptions.buttons || [];
                const buttonIndex = buttonNames.indexOf(targetButtonName);

                if (buttonIndex === -1) {
                    if (persist) {
                        // Keep the persistent handler installed and forward unexpected dialogs unchanged.
                        return originalShowMessageBox(_browserWindow, dialogOptions);
                    }
                    dialog.showMessageBox = originalShowMessageBox;
                    const optionsWithErrorMessage = { ...dialogOptions, message: `E2E test error: could not find button ${targetButtonName}` };
                    return originalShowMessageBox(_browserWindow, optionsWithErrorMessage);
                }

                if (!persist) {
                    // One-shot: restore the original handler after the first matching dialog.
                    dialog.showMessageBox = originalShowMessageBox;
                }
                return { response: buttonIndex, checkboxChecked: false };
            };
        },
        { targetButtonName: buttonNameToClick, persist: options.persist ?? false },
    );
};
