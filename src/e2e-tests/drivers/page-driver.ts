/**
 * Copyright 2023-2026 Arm Limited
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
 * Page Driver - Playwright Page Wrapper
 *
 * This driver provides a high-level API for common VS Code UI interactions,
 * abstracting Playwright's page API into domain-specific operations.
 *
 * Key responsibilities:
 * - Wait for VS Code to be ready (workbench loaded)
 * - Take screenshots for debugging
 * - Provide convenient accessors for common UI elements (buttons, text, webviews)
 * - Manage notifications and UI state
 * - Access command palette via CommandDriver
 */

import { FrameLocator, Locator, Page } from 'playwright';
import { CommandDriver } from './command-driver';
import { DEFAULT_TIMEOUT_MS, SCREENSHOT_TIMEOUT_MS } from '../constants';
import { log } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export class PageDriver {
    constructor(private readonly page: Page) {}

    async waitForVsCodeToBeReady(): Promise<void> {
        await this.page.waitForSelector('.monaco-workbench');
    }

    async waitForActionItem(name: string): Promise<void> {
        await this.page.getByRole('tablist', { name: 'Active View Switcher' })
            .getByRole('tab', { name })
            .waitFor({ timeout: DEFAULT_TIMEOUT_MS });
    }

    /**
     * Reloads the VS Code window and waits for it to become ready again.
     *
     * Reloading forces the extension host to fully re-initialize against the current contents
     * of the workspace folder. This makes workspace switches deterministic: the project files
     * are already on disk when the extension activates, so solution discovery and tool
     * activation no longer race against asynchronous file watchers.
     *
     * The Playwright Page survives the renderer reload (it is a navigation of the same window),
     * so this instance remains valid afterwards.
     *
     * @param waitForActionItemName Optional action item (e.g. 'CMSIS') to wait for after reload.
     */
    async reloadWindow(waitForActionItemName?: string): Promise<void> {
        // Begin waiting for the reload navigation before triggering it to avoid missing the event.
        const navigation = this.page
            .waitForEvent('framenavigated', { timeout: DEFAULT_TIMEOUT_MS })
            .catch(() => undefined);

        await this.getCommands().runCommandFromPalette('Developer: Reload Window');
        await navigation;

        await this.waitForVsCodeToBeReady();
        if (waitForActionItemName) {
            await this.waitForActionItem(waitForActionItemName);
        }
    }

    async screenshot(name: string): Promise<void> {
        const outputDir = path.join(process.cwd(), 'e2e-screenshots');
        const fullPath = path.join(outputDir, name + '.png');
        const dir = path.dirname(fullPath);

        // Ensure directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // These screenshots are diagnostic aids only and must never fail an otherwise-passing test.
        // page.screenshot occasionally hangs on "waiting for fonts to load", so bound it with a short
        // timeout and swallow any failure instead of letting it bubble up.
        try {
            await this.page.screenshot({ path: fullPath, timeout: SCREENSHOT_TIMEOUT_MS });
        } catch (err) {
            log('warn', `Failed to capture screenshot "${name}": ${(err as Error).message}`);
        }
    }

    async turnNotificationsOff(): Promise<void> {
        await this.page.getByRole('button', { name: 'Notifications' }).click();
        await this.page.getByRole('button', { name: 'Toggle Do Not Disturb Mode' }).click();
    }

    async openCmsisPanel(): Promise<void> {
        await this.page.getByRole('tab', { name: 'CMSIS' }).click();
    }

    getWebviewByTitle(title: string): FrameLocator {
        return this.page.frameLocator('.webview.ready').frameLocator(`[title="${title}"]`);
    }

    getCommands(): CommandDriver {
        return new CommandDriver(this.page);
    }

    getRoleByName(name: 'code' | 'button' | 'link' | 'dialog' | 'treeitem' | 'tree' | 'toolbar', options?: { name?: string| RegExp }): Locator {
        return this.page.getByRole(name, options);
    }

    getLocator(name: string): Locator {
        return this.page.locator(name);
    }

    getTextByName(name: string | RegExp): Locator {
        return this.page.getByText(name, { exact: true });
    }

    // for development use -- run test from command line
    async pausePlayWright(): Promise<void> {
        return this.page.pause();
    }

    /**
     * Get the underlying Playwright Page object for advanced operations
     */
    getPage(): Page {
        return this.page;
    }
}
