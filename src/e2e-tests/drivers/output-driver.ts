/**
 * Copyright 2025-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Output Panel Driver
 *
 * This driver provides automation for VS Code's Output panel, allowing tests
 * to select specific output channels and verify their content.
 */

import type * as playwright from '@playwright/test';
import { VsCodeDriver } from '../infrastructure/vscode-driver';
import { QUICK_PICK_DELAY_MS, QUICK_PICK_TIMEOUT_MS, PANEL_VISIBILITY_TIMEOUT_MS, PANEL_TEXT_TIMEOUT_MS } from '../constants';

export class OutputDriver {
    public constructor(private readonly vscode: VsCodeDriver) {}

    public async showOutputFrom (outputter: string): Promise<void> {
        await this.vscode.page.getCommands().runCommandFromPalette('Output: Show Output Channels...');

        // Wait for the quick pick to appear
        await new Promise(resolve => setTimeout(resolve, QUICK_PICK_DELAY_MS));

        // Select the output channel from the quick pick
        // Wait for the quick pick list to appear
        const quickPickList = this.vscode.page.getLocator('.quick-input-list');
        await quickPickList.waitFor({ state: 'visible', timeout: QUICK_PICK_TIMEOUT_MS });

        // Find and click the desired outputter
        const outputterItem = this.vscode.page.getLocator(`.quick-input-list .monaco-list-row:has-text("${outputter}")`);
        await outputterItem.click();
    }

    getOutputPanel (): playwright.Locator {
        return this.vscode.page.getLocator('#workbench\\.panel\\.output');
    }

    async waitForOutputEntry (text: string | RegExp): Promise<void> {
        const outputPanel = this.getOutputPanel();
        await outputPanel.waitFor({ state: 'visible', timeout: PANEL_VISIBILITY_TIMEOUT_MS });
        await outputPanel.getByText(text).first().waitFor({ state: 'visible', timeout: PANEL_TEXT_TIMEOUT_MS });
    }
}
