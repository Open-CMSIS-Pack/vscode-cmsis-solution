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
 * WF-001: Create CMSIS Solution from Reference Application with FVP
 *
 * Executable implementation of the workflow steps described in the accompanying
 * wf-001-refapp-fvp-solution.yml specification.
 *
 * Accepts a typed fixture so the same steps can be driven with different
 * FVP/Reference Application combinations by simply providing a different fixture object.
 */

import { expect } from '@playwright/test';
import { promises as fs } from 'fs';
import * as path from 'path';
import { VsCodeDriver } from '../../../infrastructure/vscode-driver';
import { DEFAULT_TIMEOUT_MS } from '../../../constants';
import {
    addPackToCsolution,
    createSolutionFromWizard,
    expectGeneratedFileExists,
    expectGeneratedSolutionFiles,
    ExpectedFiles,
    ExpectedProblems,
    readAndValidateGeneratedSolutionArtifacts,
} from '../../../utils/usecases';
import { ManageSolutionSettingsDriver } from '../../../drivers/manage-solution-settings-driver';
import { ArmToolsDriver } from '../../../drivers/arm-tools-driver';
import { copyTerminalText, waitForBuild } from '../../../utils/helper';

export { loadYamlFixture } from '../../../utils/usecases';

const SCREENSHOT_PREFIX = 'uc-002-refapp-fvp-solution/wf-001';

// Fixture type
export type CreateSolutionFixture = {
    board: string;
    device?: string;
    reference_application: string;
    template?: string;
    solution_name_prefix?: string;
    fvp: {
        pack: string;
        debug_adapter: string;
        model: string;
        config_file: string;
        misc: string;
    };
    arm_tools: {
        environment: string;
        version: string;
    };
    expected_run: {
        terminal: string;
        command_contains?: string[];
        output_contains?: string[];
    };
    expected_files?: ExpectedFiles;
    expected_problems?: ExpectedProblems;
};

const confirmConfigureSolution = async (vsCodeDriver: VsCodeDriver): Promise<void> => {
    const frame = vsCodeDriver.page.getWebviewByTitle('Configure Solution');

    await frame.getByRole('button', { name: 'OK' }).click();
    await vsCodeDriver.page.waitForVsCodeToBeReady();
};

const expectGeneratedRunConfiguration = async (
    cbuildRunFilePath: string,
    expectedCommandParts: string[],
): Promise<void> => {
    const normalizedRunConfiguration = (await fs.readFile(cbuildRunFilePath, 'utf8'))
        .replace(/\\/g, '/');

    for (const expectedCommandPart of expectedCommandParts) {
        const normalizedCommandPart = expectedCommandPart.replace(/\\/g, '/');
        const equivalentCommandParts = [
            normalizedCommandPart,
            normalizedCommandPart.replace(/^\.\//, ''),
            normalizedCommandPart.replace(/^\.?\/?out\//, ''),
        ];

        expect(equivalentCommandParts.some(commandPart =>
            normalizedRunConfiguration.includes(commandPart),
        ), `Expected cbuild-run.yml to contain one of: ${equivalentCommandParts.join(', ')}`).toBe(true);
    }
};

const expectFileToContainAll = async (
    filePath: string,
    expectedParts: string[],
): Promise<void> => {
    const normalizedFileText = (await fs.readFile(filePath, 'utf8')).replace(/\\/g, '/');

    for (const expectedPart of expectedParts) {
        expect(normalizedFileText).toContain(expectedPart.replace(/\\/g, '/'));
    }
};

const expectFileToContainPath = async (
    filePath: string,
    expectedPath: string,
): Promise<void> => {
    const normalizedFileText = (await fs.readFile(filePath, 'utf8')).replace(/\\/g, '/');
    const normalizedExpectedPath = expectedPath.replace(/\\/g, '/').replace(/^\.\//, '');

    expect(
        normalizedFileText.includes(normalizedExpectedPath),
        `Expected ${filePath} to contain a path ending with ${normalizedExpectedPath}`,
    ).toBe(true);
};

/**
 * Runs WF-001: Creates a solution from a reference application using the FVP
 * specified in `fixture`, then verifies the generated solution, builds it,
 * loads and runs it on the FVP, and validates the expected runtime output.
 */
export const runWf001RefAppFVPSolution = async (
    vsCodeDriver: VsCodeDriver,
    fixture: CreateSolutionFixture,
): Promise<void> => {
    const generatedSolutionsDirectory = path.join(vsCodeDriver.testWorkspaceDirectory, '.generated');

    try {
        // Start from a clean notification state so error checks only include this workflow.
        await vsCodeDriver.page.getCommands().runCommandFromPalette('Notifications: Clear All Notifications');
        await vsCodeDriver.page.openCmsisPanel();

        // 1) Create the FVP reference application solution from the Create Solution wizard.
        const createdSolution = await createSolutionFromWizard(vsCodeDriver, {
            target: fixture.board,
            targetKind: 'board',
            template: fixture.reference_application,
            templateKind: 'referenceApplication',
            solutionNamePrefix: fixture.solution_name_prefix,
            expectedFiles: fixture.expected_files,
            expectedProblems: fixture.expected_problems,
        });

        // The extension opens the generated solution folder by default.
        await vsCodeDriver.page.waitForVsCodeToBeReady();
        await vsCodeDriver.page.waitForActionItem('CMSIS');

        // 2) Validate the .csolution.yml exists before trying to parse it.
        const artifacts = await readAndValidateGeneratedSolutionArtifacts(
            createdSolution.solutionFilePath,
            createdSolution.solutionFileName,
        );

        // 3) Add the FVP support pack to the generated reference application solution.
        const referenceApplicationSolutionFilePath = await expectGeneratedFileExists(
            artifacts,
            './Blinky.csolution.yml',
        );
        await addPackToCsolution(referenceApplicationSolutionFilePath, fixture.fvp.pack);
        await confirmConfigureSolution(vsCodeDriver);

        // Clear notifications that could block webview clicks.
        await vsCodeDriver.page.logAndClearNotifications();

        const createdFiles = fixture.expected_files?.created ?? [];
        await expectGeneratedSolutionFiles(artifacts, createdFiles);

        // 4) Configure FVP debug settings in Manage Solution Settings.
        const manageSolutionSettings = new ManageSolutionSettingsDriver(vsCodeDriver);
        const manageSolutionFrame = await manageSolutionSettings.open();

        await manageSolutionSettings.selectDebugAdapter(manageSolutionFrame, fixture.fvp.debug_adapter);
        await manageSolutionSettings.selectModel(manageSolutionFrame, fixture.fvp.model);
        await manageSolutionSettings.setConfigFile(
            manageSolutionFrame,
            fixture.fvp.config_file.replace(/^\.\//, ''),
        );
        await manageSolutionSettings.setMisc(manageSolutionFrame, fixture.fvp.misc);
        await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/Manage Solution Settings FVP configuration`);
        await manageSolutionSettings.save();
        await expectFileToContainAll(referenceApplicationSolutionFilePath, [
            `name: ${fixture.fvp.debug_adapter}`,
            `model: ${fixture.fvp.model}`,
            `args: ${fixture.fvp.misc}`,
        ]);
        await expectFileToContainPath(referenceApplicationSolutionFilePath, fixture.fvp.config_file);

        // 5) Configure Arm Tools environment.
        const armTools = new ArmToolsDriver(vsCodeDriver);
        const armToolsFrame = await armTools.openConfigureArmToolsEnvironment();

        await armTools.selectVersion(
            armToolsFrame,
            fixture.arm_tools.environment,
            fixture.arm_tools.version,
        );
        await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/Arm Tools environment configuration`);
        await armTools.saveVcpkgConfiguration();
        await expectGeneratedFileExists(artifacts, './vcpkg-configuration.json');

        // 6) Build the solution and verify build artifacts.
        await vsCodeDriver.page.openCmsisPanel();
        const buildButton = vsCodeDriver.page.getRoleByName('button', { name: 'Build solution' });
        await expect(buildButton).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
        await buildButton.click();

        const buildTask = vsCodeDriver.page.getRoleByName('button', {
            name: /^Focus Terminal.*Split Terminal/,
        });
        await waitForBuild(buildTask);

        const builtFiles = fixture.expected_files?.built ?? [];
        await expectGeneratedSolutionFiles(artifacts, builtFiles);

        const cbuildRunFilePath = await expectGeneratedFileExists(
            artifacts,
            './out/Blinky+SSE-300-MPS3.cbuild-run.yml',
        );
        await expectGeneratedRunConfiguration(
            cbuildRunFilePath,
            [
                fixture.fvp.debug_adapter,
                fixture.fvp.model,
                fixture.fvp.config_file,
                fixture.fvp.misc,
                ...(fixture.expected_run.command_contains ?? []),
            ],
        );

        await vsCodeDriver.page.getCommands().runCommandFromPalette('Update Debug Tasks and Launch Configurations');

        // 7) Run the application on the FVP and verify the reference application output.
        await vsCodeDriver.page.openCmsisPanel();
        const loadAndRunButton = vsCodeDriver.page.getRoleByName('button', {
            name: 'Load & Run Application',
        });
        await expect(loadAndRunButton).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
        await loadAndRunButton.click();

        for (const expectedOutput of fixture.expected_run.output_contains ?? []) {
            await expect.poll(async () =>
                copyTerminalText(vsCodeDriver),
            {
                timeout: DEFAULT_TIMEOUT_MS,
                intervals: [1000, 2000, 3000],
            }).toContain(expectedOutput);
        }

        await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/After FVP load and run task`);
    } finally {
        try {
            await vsCodeDriver.restoreTestWorkspace();
        } finally {
            await fs.rm(generatedSolutionsDirectory, {
                recursive: true,
                force: true,
                maxRetries: 3,
                retryDelay: 200,
            });
        }
    }
};
