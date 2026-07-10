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
import { expect, FrameLocator } from '@playwright/test';
import { DEFAULT_TIMEOUT_MS } from '../constants';
import { VsCodeDriver } from '../infrastructure/vscode-driver';

export class ArmToolsDriver {
    constructor(private readonly vscode: VsCodeDriver) {}

    async openConfigureArmToolsEnvironment(): Promise<FrameLocator> {
        await this.vscode.page.getCommands().runCommandFromPalette('Arm Tools: Configure Arm Tools Environment');

        const frame = this.vscode.page.getActiveWebview();

        await expect(frame.getByRole('combobox').first()).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

        return frame;
    }

    async selectVersion(frame: FrameLocator, toolName: string, version: string): Promise<void> {
        const tool = frame
            .getByText(toolName, { exact: true })
            .locator('xpath=ancestor::*[.//*[@role="combobox"]][1]');
        const versionDropdown = tool.getByRole('combobox');

        await expect(versionDropdown).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
        await versionDropdown.click();
        await frame.getByRole('option', { name: version, exact: true }).click();

        await expect(versionDropdown).toContainText(version);
    }

    async saveVcpkgConfiguration(): Promise<void> {
        const configurationTab = this.vscode.page
            .getPage()
            .getByRole('tab', { name: /vcpkg-configuration\.json/i });

        await expect(configurationTab).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
        await configurationTab.click();
        await expect(configurationTab).toHaveAttribute('aria-selected', 'true');

        await this.vscode.page.getPage().keyboard.press('Control+KeyS');
        await this.vscode.page.waitForVsCodeToBeReady();
    }
}
