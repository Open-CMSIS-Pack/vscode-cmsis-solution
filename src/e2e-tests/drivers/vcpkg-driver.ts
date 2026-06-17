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
 * Vcpkg Integration Driver
 *
 * This driver provides automation for vcpkg and Arm Environment Manager integration
 * within the CMSIS Solution extension. It handles waiting for tool activation,
 * solution loading, and verification of build tool availability.
 *
 * Key responsibilities:
 * - Wait for Vcpkg Driver and Environment Manager activation
 * - Monitor solution loading progress via status bar
 * - Verify correct number of activated tools (compilers, debuggers)
 * - Poll for build readiness before executing build commands
 */

import { log } from '../utils/logger';
import { type VsCodeDriver } from '../infrastructure/vscode-driver';
import { LONG_TIMEOUT_MS, TASK_TIMEOUT_MS } from '../constants';

import * as playwright from '@playwright/test';

/**
 * Wrapper around the vcpkg driver CLI integration, with toggleable logging.
 */
export class VcpkgDriver {
    public constructor(private readonly vscode: VsCodeDriver) {}

    /**
     * Waits for the Vcpkg Driver to be activated.
     * This includes waiting for the Arm Environment Manager to be activated.
     */
    public async waitForActivation(): Promise<void> {
        // Ensure "Always Allow" is selected in the message box. Use a persistent mock because the
        // Arm Environment Manager trust dialog is a native modal that can appear at an unpredictable
        // time (and more than once) while tools are activated; a one-shot mock races with it and can
        // leave the dialog unanswered, blocking activation until this poll times out.
        await this.vscode.mockShowMessageBoxResponse('Always Allow', { persist: true });

        await playwright.expect.poll(
            async () => {
                try {
                    return await this.getActivatedToolCount();
                } catch (e) {
                    log('error', 'Polling failed in waitForActivation:', (e as Error).message);
                    throw e; // Fail the test on genuine errors
                }
            },
            {
                timeout: LONG_TIMEOUT_MS,
                intervals: [2000], // Poll every 2 seconds instead
                message: 'Expected activated tool count to be greater than 0',
            }
        ).toBeGreaterThan(0);
    }

    /**
     * Returns the number of activated tools in the Arm Tools status bar item.
     * @returns The count of activated tools, or 0 if not found or parsing fails.
     */
    private async getActivatedToolCount(): Promise<number> {
        try {
            const statusItem = await this.getArmToolsStatusBarItem();

            // The status bar can briefly contain more than one item with the same id (e.g. a
            // transient progress item), so inspect every match rather than assuming a single one;
            // reading an aria-label off a multi-match locator throws a strict-mode violation.
            const items = await statusItem.all();
            if (items.length === 0) {
                log('debug', 'Status bar item not found.');
                return 0;
            }

            let bestCount = 0;
            for (const item of items) {
                const label = await item.getAttribute('aria-label');
                if (!label) {
                    continue;
                }

                const match = /Arm Tools:\s*(\d+)/.exec(label);
                if (!match) {
                    continue;
                }

                const count = parseInt(match[1], 10);
                if (!Number.isNaN(count)) {
                    bestCount = Math.max(bestCount, count);
                }
            }

            log('debug', `Parsed activated tool count: ${bestCount}`);
            return bestCount;

        } catch (err) {
            log('error', 'Error while retrieving activated tool count:', (err as Error).message);
            return 0;
        }
    }

    private async getStatusBarItem(extensionId: string): Promise<playwright.Locator> {
        const [vendor, ...nameParts] = extensionId.split('.');

        if (nameParts.length === 0 || nameParts.length > 3) {
            throw new Error(
                `Invalid extension name. Expected: "Vendor.name(s)", got ${extensionId}`
            );
        }

        const selector = `#${[vendor, ...nameParts].join('\\.')}`;
        return this.vscode.page.getLocator('#workbench\\.parts\\.statusbar')
            .locator(selector);
    }

    private async getArmToolsStatusBarItem(): Promise<playwright.Locator> {
        return this.getStatusBarItem('Arm.environment-manager.environment-manager.tools');
    }

    private async getLoadSolutionStatusBarItem(): Promise<playwright.Locator> {
        return this.getStatusBarItem('Arm.cmsis-csolution');
    }


    /**
     * Checks if the CMSIS Csolution extension has a loaded solution with the specified target name.
     * @param targetName The name of the target to check for in the loaded solution.
     * @returns A promise that resolves to true if the solution is loaded, false otherwise.
     */
    private async getLoadedSolution(targetName: string): Promise<boolean> {
        const statusItem = await this.getLoadSolutionStatusBarItem();

        // The CMSIS status bar may briefly contain more than one item sharing the same id (for
        // example a transient "Building Compilation Database…" progress item alongside the loaded
        // solution item). Reading an attribute from a locator that matches multiple elements throws
        // a strict-mode violation, so inspect each matching item individually.
        const items = await statusItem.all();
        if (items.length === 0) {
            log('warn', '[getLoadedSolution] Status bar item not found.');
            return false;
        }

        for (const item of items) {
            const label = await item.getAttribute('aria-label');
            if (!label) {
                continue;
            }

            if (label.includes(targetName)) {
                log('debug', `[getLoadedSolution] Label: "${label}", Contains "${targetName}": true`);
                return true;
            }
        }

        log('debug', `[getLoadedSolution] No status bar item contained "${targetName}"`);
        return false;
    }

    /**
     * Waits for the CMSIS Csolution extension to load a solution with the specified target name.
     * @param targetName The name of the target to wait for in the loaded solution.
     */
    public async waitForLoadedSolution(targetName: string): Promise<void> {
        // Ensure "Always Allow" is selected in the message box (see waitForActivation for rationale).
        await this.vscode.mockShowMessageBoxResponse('Always Allow', { persist: true });

        // Let a genuine "solution never loaded" surface here with a clear message instead of being
        // swallowed and continuing, which previously masked the real failure and produced a confusing
        // downstream timeout (e.g. the command palette failing to open several steps later).
        await playwright.expect.poll(
            async () => {
                const isLoaded = await this.getLoadedSolution(targetName);
                log('debug', `[waitForLoadedSolution] Checking if "${targetName}" is loaded: ${isLoaded}`);
                if (isLoaded) {
                    log('info', `🎯 Solution "${targetName}" detected as loaded in status bar`);
                }
                return isLoaded;
            },
            {
                timeout: TASK_TIMEOUT_MS,
                message: `Expected loaded solution "${targetName}" to be visible.`,
            }
        ).toBe(true);
        log('info', `✅ Solution "${targetName}" loaded successfully`);
    }
}
