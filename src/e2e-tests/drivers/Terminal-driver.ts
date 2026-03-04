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
 * Terminal Driver
 *
 * This driver provides automation for VS Code's Terminal panel, allowing tests
 * to switch between terminals and verify their content.
 */

import type * as playwright from '@playwright/test';
import { VsCodeDriver } from '../infrastructure/vscode-driver';
import { QUICK_PICK_DELAY_MS, QUICK_PICK_TIMEOUT_MS, PANEL_VISIBILITY_TIMEOUT_MS, PANEL_TEXT_TIMEOUT_MS } from '../constants';
import { log } from '../utils/logger';

export class TerminalDriver {
    public constructor(private readonly vscode: VsCodeDriver) {}

    public async switchTerminal(terminalName: string): Promise<void> {
        log('debug', `[switchTerminal] Switching to terminal: "${terminalName}"`);
        await this.vscode.page.getCommands().runCommandFromPalette('Terminal: Switch Active Terminal');

        // Wait for the quick pick to appear
        log('debug', `[switchTerminal] Waiting ${QUICK_PICK_DELAY_MS}ms for quick pick to appear`);
        await new Promise(resolve => setTimeout(resolve, QUICK_PICK_DELAY_MS));

        // Select the terminal from the quick pick
        // Wait for the quick pick list to appear
        const quickPickList = this.vscode.page.getLocator('.quick-input-list');
        log('debug', `[switchTerminal] Waiting for quick pick list to become visible (timeout: ${QUICK_PICK_TIMEOUT_MS}ms)`);
        await quickPickList.waitFor({ state: 'visible', timeout: QUICK_PICK_TIMEOUT_MS });

        // Find the desired terminal
        const terminalItem = this.vscode.page.getLocator(`.quick-input-list .monaco-list-row:has-text("${terminalName}")`);
        const count = await terminalItem.count();
        log('debug', `[switchTerminal] Found ${count} terminal(s) matching "${terminalName}"`);

        await terminalItem.first().click();
        log('debug', `[switchTerminal] Clicked terminal "${terminalName}"`);
    }

    getTerminalPanel (): playwright.Locator {
        return this.vscode.page.getLocator('#workbench\\.panel\\.terminal');
    }

    async waitForTerminalEntry (text: string | RegExp): Promise<void> {
        const terminalPanel = this.getTerminalPanel();
        await terminalPanel.waitFor({ state: 'visible', timeout: PANEL_VISIBILITY_TIMEOUT_MS });
        await terminalPanel.getByText(text).first().waitFor({ state: 'visible', timeout: PANEL_TEXT_TIMEOUT_MS });
    }
}
