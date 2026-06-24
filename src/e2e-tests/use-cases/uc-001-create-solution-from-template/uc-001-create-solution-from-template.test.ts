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

import { expect, test } from '@playwright/test';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { VsCodeDriver } from '../../infrastructure/vscode-driver';
import { installRequiredExtensions } from '../../utils/install-extensions';
import { log } from '../../utils/logger';
import { DEFAULT_TIMEOUT_MS } from '../../constants';

type ParsedProjectEntry = string | { project?: string };

type ParsedCsolution = {
    solution?: {
        projects?: ParsedProjectEntry[];
    };
};

type GeneratedSolutionArtifacts = {
    solutionDirectory: string;
    solutionFilePath: string;
    projectFilePaths: string[];
    mainFilePaths: string[];
};

type CreateSolutionFixture = {
    device: string;
    template: string;
    solution_name_prefix?: string;
};

test.describe('UC-001 Create Solution From Template', () => {
    let vsCodeDriver: VsCodeDriver;
    let isVsCodeStarted = false;

    test.beforeAll(async () => {
        const maxStartAttempts = 2;
        let startupError: unknown;

        for (let attempt = 1; attempt <= maxStartAttempts; attempt++) {
            vsCodeDriver = new VsCodeDriver();
            try {
                await vsCodeDriver.startWithWorkspaceContents(undefined);
                await installRequiredExtensions();

                // Keep native trust prompts from blocking CI execution when folders are opened.
                await vsCodeDriver.mockShowMessageBoxResponse('Always Allow', { persist: true });
                isVsCodeStarted = true;
                break;
            } catch (error) {
                startupError = error;
                log('warn', `VS Code startup attempt ${attempt}/${maxStartAttempts} failed`, error);
            }
        }

        if (!isVsCodeStarted) {
            throw startupError instanceof Error
                ? startupError
                : new Error('Unable to start VS Code test environment.');
        }
    });

    test.afterEach(async () => {
        if (vsCodeDriver && isVsCodeStarted) {
            await vsCodeDriver.cleanupTestState();
        }
    });

    test.afterAll(async () => {
        if (vsCodeDriver && isVsCodeStarted) {
            await vsCodeDriver.stop();
            isVsCodeStarted = false;
        }
    });

    test('UC-001 WF-001 Create a solution from the Blank Solution template by selecting a device', async ({ page: _page }, testInfo) => {
        log('info', 'Executing Test:', testInfo.title);

        const fixture = await readCreateSolutionFixture();
        const devicePattern = new RegExp(escapeRegExp(fixture.device), 'i');
        const templatePattern = new RegExp(escapeRegExp(fixture.template), 'i');
        const solutionName = createUniqueSolutionName(fixture.solution_name_prefix);
        const solutionFolder = `${solutionName}_folder`;
        const solutionFileName = `${solutionName}.csolution.yml`;
        const solutionBaseFolder = path.dirname(vsCodeDriver.testWorkspaceDirectory);
        const solutionFilePath = getExpectedSolutionFilePath(solutionBaseFolder, solutionFolder, solutionName);

        // Start from a clean notification state so error checks only include this workflow.
        await vsCodeDriver.page.getCommands().runCommandFromPalette('Notifications: Clear All Notifications');
        await vsCodeDriver.page.openCmsisPanel();

        await vsCodeDriver.page.getCommands().runCommandFromPalette('CMSIS: Create Solution');
        const createSolutionFrame = vsCodeDriver.page.getWebviewByTitle('Create Solution');
        await createSolutionFrame.getByRole('heading', { name: 'Create Solution' }).waitFor({ timeout: DEFAULT_TIMEOUT_MS });

        // 1) Select device from target dropdown and confirm in side panel.
        await createSolutionFrame.locator('#create-solution-device-target').click();

        const deviceItems = createSolutionFrame.locator('.components-tree-view-item');
        await expect.poll(async () => deviceItems.count(), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000]
        }).toBeGreaterThan(0);

        const deviceSearchInput = createSolutionFrame.getByPlaceholder('Search').first();
        await deviceSearchInput.fill(fixture.device);

        const targetDeviceItems = createSolutionFrame
            .locator('.components-tree-view-item')
            .filter({ hasText: devicePattern });

        await expect.poll(async () => targetDeviceItems.count(), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000]
        }).toBeGreaterThan(0);

        await targetDeviceItems.first().click();
        await createSolutionFrame.getByRole('button', { name: 'Select' }).click();
        await expect(createSolutionFrame.locator('#create-solution-device-target')).toContainText(devicePattern);

        // 2) Select a software template for the chosen device.
        await createSolutionFrame.locator('#create-solution-template').click();

        const templateDropdown = createSolutionFrame
            .locator('.dropdown-select.expanded')
            .filter({ has: createSolutionFrame.locator('#create-solution-template') });

        await expect(templateDropdown).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

        const templateItems = templateDropdown.locator('.components-tree-view-item.template');
        await expect.poll(async () => templateItems.count(), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000]
        }).toBeGreaterThan(0);

        const templateSearchInput = templateDropdown.getByPlaceholder('Search');
        await templateSearchInput.fill(fixture.template);

        const matchingTemplateItems = templateDropdown
            .locator('.components-tree-view-item.template')
            .filter({ hasText: templatePattern });

        await expect.poll(async () => matchingTemplateItems.count(), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000]
        }).toBeGreaterThan(0);

        await matchingTemplateItems.first().scrollIntoViewIfNeeded();
        await matchingTemplateItems.first().click();
        await expect(createSolutionFrame.locator('#create-solution-template')).toContainText(templatePattern);

        // 3) Complete the required fields with unique names.
        await createSolutionFrame.locator('#create-solution-solution-name').fill(solutionName);
        await createSolutionFrame.locator('#create-solution-solution-folder').fill(solutionFolder);

        const solutionLocationInput = createSolutionFrame.locator('#create-solution-file-locator');
        await expect(solutionLocationInput).toHaveValue(/.+/);
        await solutionLocationInput.fill(solutionBaseFolder);
        await expect(solutionLocationInput).toHaveValue(solutionBaseFolder);

        const createButton = createSolutionFrame.locator('button[title="Create Solution"]');
        await createButton.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT_MS });
        await expect(createButton).toBeEnabled();
        await createButton.click();

        // The extension opens the generated solution folder by default.
        await vsCodeDriver.page.waitForVsCodeToBeReady();
        await vsCodeDriver.page.waitForActionItem('CMSIS');

        // 4) Validate generated artifacts on disk.
        await expect.poll(async () => allPathsExist([solutionFilePath]), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000]
        }).toBe(true);

        let generatedArtifacts: GeneratedSolutionArtifacts | undefined;
        await expect(async () => {
            generatedArtifacts = await readGeneratedSolutionArtifacts(solutionFilePath);
            expect(path.basename(generatedArtifacts.solutionFilePath)).toBe(solutionFileName);
            expect(generatedArtifacts.projectFilePaths.length).toBeGreaterThan(0);
        }).toPass({
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [250, 500, 1000, 2000, 3000]
        });

        if (!generatedArtifacts) {
            throw new Error('Generated solution artifacts were not read.');
        }
        const artifacts = generatedArtifacts;

        await expect.poll(async () => allPathsExist([
            artifacts.solutionFilePath,
            ...artifacts.projectFilePaths,
            ...artifacts.mainFilePaths,
        ]), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000]
        }).toBe(true);

        // 5) Verify the generated solution is loaded in the CMSIS UI.
        await vsCodeDriver.page.openCmsisPanel();
        await expect(vsCodeDriver.page.getRoleByName('button', { name: 'Build solution' })).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

        // 6) Resolve required components from the dependency validation diagnostic.
        const dependencyValidationProblemPattern = /dependency validation for context '[^']+' failed:/i;

        await vsCodeDriver.page.getCommands().runCommandFromPalette('View: Show Problems');

        const dependencyValidationProblemRows = vsCodeDriver.page
            .getLocator('.monaco-list-row')
            .filter({ hasText: dependencyValidationProblemPattern });

        await expect.poll(async () => dependencyValidationProblemRows.count(), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000]
        }).toBeGreaterThan(0);

        const manageComponentsLink = dependencyValidationProblemRows.first()
            .locator('a')
            .filter({ hasText: /^Manage Components$/ });
        await manageComponentsLink.click();

        const softwareComponentsFrame = vsCodeDriver.page.getWebviewByTitle('Software Components');
        const saveComponentsButton = softwareComponentsFrame.getByRole('button', { name: 'Save' });
        await saveComponentsButton.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT_MS });

        const resolveComponentsButton = softwareComponentsFrame.locator('.resolve-packs-button');
        await expect(resolveComponentsButton).toBeEnabled({ timeout: DEFAULT_TIMEOUT_MS });
        await resolveComponentsButton.click();

        await expect(saveComponentsButton).toBeEnabled({ timeout: DEFAULT_TIMEOUT_MS });
        await saveComponentsButton.click();
        await expect(saveComponentsButton).toBeDisabled({ timeout: DEFAULT_TIMEOUT_MS });

        await vsCodeDriver.page.getCommands().runCommandFromPalette('View: Show Problems');
        await expect(vsCodeDriver.page.getLocator('text=No problems have been detected in the workspace.'))
            .toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

        // 7) Verify no error notifications or failed task notifications were raised.
        await vsCodeDriver.page.getCommands().runCommandFromPalette('Notifications: Show Notifications');

        const errorNotificationIcons = vsCodeDriver.page.getLocator('.notification-list-item .codicon-error');
        await expect(errorNotificationIcons).toHaveCount(0);

        const failedTaskNotifications = vsCodeDriver.page
            .getLocator('.notification-list-item')
            .filter({ hasText: /failed with exit code|terminated with exit code|task .* failed/i });
        await expect(failedTaskNotifications).toHaveCount(0);

        await vsCodeDriver.page.getPage().keyboard.press('Escape');
    });
});

const createUniqueSolutionName = (prefix = 'e2e_device_template_solution'): string => {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    return `${prefix}_${timestamp}`;
};

const readCreateSolutionFixture = async (): Promise<CreateSolutionFixture> => {
    const fixturePath = path.resolve(__dirname, 'fixtures', 'wf-001-device-blank-solution.yml');
    const fixtureText = await fs.readFile(fixturePath, 'utf8');
    return YAML.parse(fixtureText) as CreateSolutionFixture;
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getExpectedSolutionFilePath = (
    solutionBaseFolder: string,
    solutionFolder: string,
    solutionName: string,
): string => {
    return path.join(solutionBaseFolder, solutionFolder, `${solutionName}.csolution.yml`);
};

const readGeneratedSolutionArtifacts = async (
    solutionFilePath: string,
): Promise<GeneratedSolutionArtifacts> => {
    const solutionDirectory = path.dirname(solutionFilePath);
    const fileText = await fs.readFile(solutionFilePath, 'utf8');
    const parsed = YAML.parse(fileText) as ParsedCsolution;
    const projects = parsed.solution?.projects ?? [];

    const projectReferences = projects
        .map(entry => typeof entry === 'string' ? entry : entry.project)
        .filter((entry): entry is string => !!entry)
        .map(entry => entry.replace(/^\.\//, ''));

    const projectFilePaths = projectReferences
        .map(reference => path.resolve(solutionDirectory, reference));

    const mainFilePaths = projectFilePaths
        .map(projectFilePath => path.join(path.dirname(projectFilePath), 'main.c'));

    return {
        solutionDirectory,
        solutionFilePath,
        projectFilePaths,
        mainFilePaths,
    };
};

const allPathsExist = async (pathsToCheck: string[]): Promise<boolean> => {
    const checks = await Promise.all(pathsToCheck.map(async currentPath => {
        try {
            await fs.access(currentPath);
            return true;
        } catch {
            return false;
        }
    }));

    return checks.every(Boolean);
};
