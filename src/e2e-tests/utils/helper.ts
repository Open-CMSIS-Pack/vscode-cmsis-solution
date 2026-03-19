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
 * Test Helper Utilities
 *
 * This module provides reusable helper functions for common test operations
 * that don't fit into specific driver categories.
 *
 * Key responsibilities:
 * - Extract build target names from context strings (e.g., ".Debug+AVH" → "AVH")
 * - Copy terminal text content via clipboard for verification
 * - Parse build context information for test assertions
 */

import type * as playwright from '@playwright/test';
import { VsCodeDriver } from '../infrastructure/vscode-driver';
import { UI_STABILITY_DELAY_MS, TASK_TIMEOUT_MS } from '../constants';

export function getTargetFromContext(context: string): string {
    const match = /\+(.+)$/.exec(context);
    return match ? match[1] : '';
}

export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function copyTerminalText(vscode: VsCodeDriver): Promise<string> {
    const page = vscode.page.getPage();

    await page.context().grantPermissions(['clipboard-read']);

    await vscode.page.getCommands().runCommandFromPalette('Terminal: Select All');
    await vscode.page.getCommands().runCommandFromPalette('Terminal: Copy Last Command and Output');

    await page.click('.terminal', { button: 'right' });
    await page.waitForTimeout(UI_STABILITY_DELAY_MS);

    const copiedText = await page.evaluate(() =>
        navigator.clipboard.readText(),
    );
    return copiedText;
}

export async function waitForBuild(
    taskLocator: playwright.Locator,
): Promise<void> {
    const taskSucceeded = taskLocator.locator('.codicon-check');
    await taskSucceeded.waitFor({ timeout: TASK_TIMEOUT_MS });
}
