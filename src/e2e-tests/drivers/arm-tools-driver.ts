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
import { escapeRegExp } from '../utils/helper';

export class ArmToolsDriver {
    constructor(private readonly vscode: VsCodeDriver) {}

    async openConfigureArmToolsEnvironment(): Promise<FrameLocator> {
        await this.vscode.page.getCommands().runCommandFromPalette('Arm Tools: Configure Arm Tools Environment');

        const frame = this.vscode.page.getWebviewByTitle('Configure Arm Tools Environment');

        await expect(
            frame.getByRole('heading', { name: /Configure Arm Tools Environment/i }),
        ).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

        return frame;
    }

    async selectEnvironment(frame: FrameLocator, name: string): Promise<void> {
        const environmentPattern = new RegExp(escapeRegExp(name), 'i');

        await frame.getByLabel(/environment/i).click();
        await frame.getByRole('option', { name: environmentPattern }).click();

        await expect(frame.getByLabel(/environment/i)).toContainText(environmentPattern);
    }

    async selectVersion(frame: FrameLocator, version: string): Promise<void> {
        const versionPattern = new RegExp(escapeRegExp(version), 'i');

        await frame.getByLabel(/version/i).click();
        await frame.getByRole('option', { name: versionPattern }).click();

        await expect(frame.getByLabel(/version/i)).toContainText(versionPattern);
    }

    async save(): Promise<void> {
        await this.vscode.page.getPage().keyboard.press('Control+KeyS');
        await this.vscode.page.waitForVsCodeToBeReady();
    }
}
