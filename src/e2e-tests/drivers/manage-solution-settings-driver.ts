/**
 * Copyright 2026 Arm Limited
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

import { expect, FrameLocator, Locator } from '@playwright/test';
import * as path from 'path';
import { DEFAULT_TIMEOUT_MS } from '../constants';
import { VsCodeDriver } from '../infrastructure/vscode-driver';

const normalizePathForComparison = (value: string): string =>
    path.normalize(value).replace(/\\/g, '/').toLowerCase();

export class ManageSolutionSettingsDriver {
    constructor(private readonly vscode: VsCodeDriver) {}

    async open(expectedSolutionFilePath?: string): Promise<FrameLocator> {
        await this.vscode.page
            .getRoleByName('button', { name: 'Manage Solution Settings' })
            .click();

        // Manage Solution is a custom editor, so VS Code titles its inner iframe from
        // the active .csolution.yml document instead of the webview's HTML title.
        const frame = this.vscode.page.getActiveWebview();

        await expect(
            frame.getByRole('heading', { name: /Manage Solution/i }),
        ).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

        // Wait until the webview is loaded with the expected solution.
        await expect(frame.locator('.ant-spin-spinning')).toHaveCount(0, {
            timeout: DEFAULT_TIMEOUT_MS,
        });
        if (expectedSolutionFilePath) {
            const solutionFileLink = frame.locator('.open-csolution-yml');
            const normalizedExpectedPath = normalizePathForComparison(expectedSolutionFilePath);

            await expect.poll(async () => {
                const actualPath = await solutionFileLink.getAttribute('title');
                return actualPath ? normalizePathForComparison(actualPath) : undefined;
            }, {
                timeout: DEFAULT_TIMEOUT_MS,
                message: `Expected webview to load solution "${expectedSolutionFilePath}"`,
            }).toBe(normalizedExpectedPath);
        }

        return frame;
    }

    async selectDebugAdapter(frame: FrameLocator, adapter: string): Promise<void> {
        const section = frame.locator('section.debug-adapter').filter({
            has: frame.getByRole('heading', { name: /Debug Adapter for Target/i }),
        });
        const enabledCheckbox = section.locator('.hasDebugAdapter input[type="checkbox"]');
        const dropdown = section.locator('.debug-adapter-dropdown');
        const trigger = dropdown.getByRole('combobox');

        if (!(await trigger.textContent())?.includes(adapter)) {
            await trigger.click();
            await dropdown.locator(`.search-list-values li[data-value="${this.cssString(adapter)}"]`).click();
        }

        await expect(trigger).toContainText(adapter);
        await expect(enabledCheckbox).toBeChecked();
    }

    async selectModel(frame: FrameLocator, model: string): Promise<void> {
        const control = this.getDropdownControl(frame, /^Model$/);

        await control.locator('.compact-dropdown-trigger').click();
        await control.locator(`.search-list-values li[data-value="${this.cssString(model)}"]`).click();

        await expect(control.locator('.compact-dropdown-trigger')).toContainText(model);
    }

    async setConfigFile(frame: FrameLocator, filePath: string): Promise<void> {
        const configFileInput = this.getInputControl(frame, /^Config File$/).locator('input').first();

        await configFileInput.fill(filePath);
        await configFileInput.blur();
        await expect(configFileInput).toHaveValue(filePath);
    }

    async setMisc(frame: FrameLocator, value: string): Promise<void> {
        const miscInput = this.getInputControl(frame, /^Misc$/).locator('input').first();

        await miscInput.fill(value);
        await miscInput.blur();
        await expect(miscInput).toHaveValue(value);
    }

    async save(): Promise<void> {
        await this.vscode.page.getPage().keyboard.press('Control+KeyS');
        await this.vscode.page.waitForVsCodeToBeReady();
    }

    private getDropdownControl(frame: FrameLocator, addonText: string | RegExp): Locator {
        return frame
            .locator('.section-control')
            .filter({ has: frame.locator('.compact-dropdown-addon-before', { hasText: addonText }) })
            .first();
    }

    private getInputControl(frame: FrameLocator, addonText: string | RegExp): Locator {
        return frame
            .locator('.section-control')
            .filter({ has: frame.locator('.ant-input-group-addon', { hasText: addonText }) })
            .first();
    }

    private cssString(value: string): string {
        return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }
}
