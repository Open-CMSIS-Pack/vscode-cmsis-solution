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
// generated with AI
/**
 * Create Solution Driver
 *
 * Encapsulates all UI interactions with the Create Solution webview wizard.
 *
 * Key responsibilities:
 * - Open the Create Solution webview via the command palette
 * - Select a target device from the device-target dropdown
 * - Select a software template from the template dropdown
 * - Fill in solution name, folder, and base location
 * - Trigger the final Create action
 */

import { expect, FrameLocator } from '@playwright/test';
import { VsCodeDriver } from '../infrastructure/vscode-driver';
import { DEFAULT_TIMEOUT_MS } from '../constants';
import { escapeRegExp } from '../utils/helper';

export class CreateSolutionDriver {
    constructor(private readonly vscode: VsCodeDriver) {}

    /**
     * Opens the Create Solution wizard via the command palette and returns
     * the webview FrameLocator once the heading is visible.
     */
    async open(): Promise<FrameLocator> {
        await this.vscode.page.getCommands().runCommandFromPalette('CMSIS: Create Solution');
        const frame = this.vscode.page.getWebviewByTitle('Create Solution');
        await frame.getByRole('heading', { name: 'Create Solution' }).waitFor({ timeout: DEFAULT_TIMEOUT_MS });
        return frame;
    }

    /**
     * Opens the device-target dropdown, searches for `device`, selects the first
     * matching item, and confirms via the "Select" button.
     */
    async selectDevice(frame: FrameLocator, device: string): Promise<void> {
        const devicePattern = new RegExp(escapeRegExp(device), 'i');

        await frame.locator('#create-solution-device-target').click();

        const deviceDropdown = frame
            .locator('.dropdown-select.expanded')
            .filter({ has: frame.locator('#create-solution-device-target') });

        await expect(deviceDropdown).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

        const allItems = deviceDropdown.locator('.components-tree-view-item');
        await expect.poll(async () => allItems.count(), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000],
        }).toBeGreaterThan(0);

        await deviceDropdown.getByPlaceholder('Search').fill(device);

        const matchingItems = deviceDropdown
            .locator('.components-tree-view-item')
            .filter({ hasText: devicePattern });

        await expect.poll(async () => matchingItems.count(), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000],
        }).toBeGreaterThan(0);

        await matchingItems.first().click();
        await frame.getByRole('button', { name: 'Select' }).click();
        await expect(frame.locator('#create-solution-device-target')).toContainText(devicePattern);
    }

    /**
     * Opens the template dropdown, searches for `template`, selects the first
     * matching item, and confirms the selection is reflected in the trigger.
     */
    async selectTemplate(frame: FrameLocator, template: string): Promise<void> {
        const templatePattern = new RegExp(escapeRegExp(template), 'i');

        await frame.locator('#create-solution-template').click();

        const templateDropdown = frame
            .locator('.dropdown-select.expanded')
            .filter({ has: frame.locator('#create-solution-template') });

        await expect(templateDropdown).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

        const allTemplateItems = templateDropdown.locator('.components-tree-view-item.template');
        await expect.poll(async () => allTemplateItems.count(), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000],
        }).toBeGreaterThan(0);

        await templateDropdown.getByPlaceholder('Search').fill(template);

        const matchingTemplates = templateDropdown
            .locator('.components-tree-view-item.template')
            .filter({ hasText: templatePattern });

        await expect.poll(async () => matchingTemplates.count(), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000],
        }).toBeGreaterThan(0);

        await matchingTemplates.first().scrollIntoViewIfNeeded();
        await matchingTemplates.first().click();
        await expect(frame.locator('#create-solution-template')).toContainText(templatePattern);
    }

    /**
     * Fills in the solution name, folder, and base location fields.
     */
    async fillDetails(
        frame: FrameLocator,
        solutionName: string,
        solutionFolder: string,
        baseFolder: string,
    ): Promise<void> {
        const solutionNameInput = frame.locator('#create-solution-solution-name');
        const solutionFolderInput = frame.locator('#create-solution-solution-folder');

        await solutionNameInput.fill(solutionName);
        await expect(solutionNameInput).toHaveValue(solutionName);

        await solutionFolderInput.fill(solutionFolder);
        await expect(solutionFolderInput).toHaveValue(solutionFolder);

        const locationInput = frame.locator('#create-solution-file-locator');
        await expect(locationInput).toHaveValue(/.+/);
        await locationInput.fill(baseFolder);
        await expect(locationInput).toHaveValue(baseFolder);
    }

    /**
     * Clicks the "Create Solution" button to trigger solution generation.
     */
    async create(frame: FrameLocator): Promise<void> {
        const createButton = frame.locator('button[title="Create Solution"]');
        await createButton.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT_MS });
        await expect(createButton).toBeEnabled();
        await createButton.click();
    }
}
