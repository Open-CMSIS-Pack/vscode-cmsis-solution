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
/**
 * Create Solution Driver
 *
 * Encapsulates all UI interactions with the Create Solution webview wizard.
 *
 */

import { expect, FrameLocator } from '@playwright/test';
import { VsCodeDriver } from '../infrastructure/vscode-driver';
import { DEFAULT_TIMEOUT_MS } from '../constants';
import { escapeRegExp } from '../utils/helper';

export type CreateSolutionOptions = {
    target: string;
    targetKind?: 'board' | 'device';
    template: string;
    templateKind?: 'referenceApplication' | 'template';
    solutionName: string;
    solutionFolder: string;
    solutionBaseFolder: string;
};

export class CreateSolutionDriver {
    constructor(private readonly vscode: VsCodeDriver) { }

    // Opens the Create Solution wizard via the command palette and returns
    // the webview FrameLocator once the heading is visible.
    async open(): Promise<FrameLocator> {
        await this.vscode.page.getCommands().runCommandFromPalette('CMSIS: Create Solution');
        const frame = this.vscode.page.getWebviewByTitle('Create Solution');
        await frame.getByRole('heading', { name: 'Create Solution' }).waitFor({ timeout: DEFAULT_TIMEOUT_MS });
        await this.vscode.page.dismissWelcomeOverlay();
        return frame;
    }

    async selectDevice(frame: FrameLocator, device: string): Promise<void> {
        await this.selectHardware(frame, 'device', device);
    }

    async selectBoard(frame: FrameLocator, board: string): Promise<void> {
        await this.selectHardware(frame, 'board', board);
    }

    private async selectHardware(
        frame: FrameLocator,
        targetKind: 'board' | 'device',
        target: string,
    ): Promise<void> {
        const targetPattern = new RegExp(escapeRegExp(target), 'i');
        const targetSelector = `#create-solution-${targetKind}-target`;

        await frame.locator(targetSelector).click();

        const hardwareDropdown = frame
            .locator('.dropdown-select.expanded')
            .filter({ has: frame.locator(targetSelector) });

        await expect(hardwareDropdown).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

        const allItems = hardwareDropdown.locator('.components-tree-view-item');
        await expect.poll(async () => allItems.count(), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000],
        }).toBeGreaterThan(0);

        await hardwareDropdown.getByPlaceholder('Search').fill(target);

        const matchingItems = hardwareDropdown
            .locator('.components-tree-view-item')
            .filter({ hasText: targetPattern });

        await expect.poll(async () => matchingItems.count(), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000],
        }).toBeGreaterThan(0);

        await matchingItems.first().click();
        await frame.getByRole('button', { name: 'Select' }).click();
        await expect(frame.locator(targetSelector)).toContainText(targetPattern);
    }


    async selectTemplate(frame: FrameLocator, template: string): Promise<void> {
        await this.selectProject(frame, ['Templates'], template);
    }

    async selectReferenceApplication(frame: FrameLocator, referenceApplication: string): Promise<void> {
        await this.selectProject(frame, ['Local', 'Reference Applications'], referenceApplication);
    }

    private async selectProject(
        frame: FrameLocator,
        categoryPath: string[],
        project: string,
    ): Promise<void> {
        const projectPattern = new RegExp(escapeRegExp(project), 'i');

        await frame.locator('#create-solution-template').click();

        const templateDropdown = frame
            .locator('.dropdown-select.expanded')
            .filter({ has: frame.locator('#create-solution-template') });

        await expect(templateDropdown).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

        await templateDropdown.getByPlaceholder('Search').fill(project);

        let category = templateDropdown.locator('.components-tree-view-category');
        for (const [index, categoryName] of categoryPath.entries()) {
            if (index > 0) {
                category = category.locator(
                    'xpath=../following-sibling::div//div[contains(concat(" ", normalize-space(@class), " "), " components-tree-view-category ")]'
                );
            }

            const categoryPattern = new RegExp(`^${escapeRegExp(categoryName)} \\(\\d+\\)$`, 'i');
            category = category.filter({ hasText: categoryPattern }).first();
            await expect.poll(async () => category.count(), {
                timeout: DEFAULT_TIMEOUT_MS,
                intervals: [1000, 2000, 3000],
            }).toBeGreaterThan(0);
        }

        const matchingProjects = category
            .locator(
                'xpath=../following-sibling::div[1]//div[contains(concat(" ", normalize-space(@class), " "), " components-tree-view-item ")]'
            )
            .filter({ hasText: projectPattern });

        await expect.poll(async () => matchingProjects.count(), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000],
        }).toBeGreaterThan(0);

        await matchingProjects.first().scrollIntoViewIfNeeded();
        await matchingProjects.first().click();
        await expect(frame.locator('#create-solution-template')).toContainText(projectPattern);
    }

    // Fills solution details
    async fillDetails(
        frame: FrameLocator,
        solutionName: string | undefined,
        solutionFolder: string,
        baseFolder: string,
    ): Promise<void> {
        const solutionFolderInput = frame.locator('#create-solution-solution-folder');

        if (solutionName !== undefined) {
            const solutionNameInput = frame.locator('#create-solution-solution-name');
            await solutionNameInput.fill(solutionName);
            await expect(solutionNameInput).toHaveValue(solutionName);
        }

        await solutionFolderInput.fill(solutionFolder);
        await expect(solutionFolderInput).toHaveValue(solutionFolder);

        const locationInput = frame.locator('#create-solution-file-locator');
        await expect(locationInput).toHaveValue(/.+/);
        await locationInput.fill(baseFolder);
        await expect(locationInput).toHaveValue(baseFolder);
    }

    // Clicks the "Create Solution" button to trigger solution generation.
    async create(frame: FrameLocator): Promise<void> {
        const createButton = frame.locator('button[title="Create Solution"]');
        await createButton.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT_MS });
        await expect(createButton).toBeEnabled();
        await createButton.click();
    }

    async createSolution(options: CreateSolutionOptions): Promise<void> {
        const frame = await this.open();

        if (options.targetKind === 'board') {
            await this.selectBoard(frame, options.target);
        } else {
            await this.selectDevice(frame, options.target);
        }
        if (options.templateKind === 'referenceApplication') {
            await this.selectReferenceApplication(frame, options.template);
        } else {
            await this.selectTemplate(frame, options.template);
        }
        await this.fillDetails(
            frame,
            options.templateKind === 'referenceApplication' ? undefined : options.solutionName,
            options.solutionFolder,
            options.solutionBaseFolder,
        );
        await this.create(frame);
    }
}
