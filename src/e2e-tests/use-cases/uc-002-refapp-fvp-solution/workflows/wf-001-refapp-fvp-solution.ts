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
    ExpectedFiles,
    ExpectedProblems,
    readAndValidateGeneratedSolutionArtifacts,
} from '../../../utils/usecases';
import { ArmToolsDriver } from '../../../drivers/arm-tools-driver';
import { ManageSolutionSettingsDriver } from '../../../drivers/manage-solution-settings-driver';
import { VcpkgDriver } from '../../../drivers/vcpkg-driver';
import { copyTerminalText, escapeRegExp, waitForBuild } from '../../../utils/helper';

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
    expected_files?: ExpectedFiles;
    expected_problems?: ExpectedProblems;
};

const confirmDiscoveredSolutionConfiguration = async (
    vsCodeDriver: VsCodeDriver,
): Promise<void> => {
    const frame = vsCodeDriver.page.getWebviewByTitle('Configure Solution');
    const okButton = frame.getByRole('button', { name: 'OK' });

    await expect(okButton).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
    await okButton.click();
    await vsCodeDriver.page.waitForVsCodeToBeReady();
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

/**
 * Runs WF-001: Creates a solution from a reference application for the FVP
 * board, configures the Arm Tools environment, builds it, and verifies the
 * generated build artifacts.
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

        // Steps 6-8: verify the generated application, add FVP support, and
        // confirm the discovered board-layer configuration.
        const createdFiles = fixture.expected_files?.created ?? [];
        await Promise.all(createdFiles.map(file => expectGeneratedFileExists(artifacts, file)));

        const referenceApplicationSolutionFilePath = await expectGeneratedFileExists(
            artifacts,
            `./${createdSolution.solutionFileName}`,
        );
        await addPackToCsolution(referenceApplicationSolutionFilePath, fixture.fvp.pack);
        await confirmDiscoveredSolutionConfiguration(vsCodeDriver);

        // Step 9: configure and save the FVP debug settings.
        await vsCodeDriver.page.logAndClearNotifications();
        const manageSolutionSettings = new ManageSolutionSettingsDriver(vsCodeDriver);
        const manageSolutionFrame = await manageSolutionSettings.open();

        await manageSolutionSettings.selectDebugAdapter(
            manageSolutionFrame,
            fixture.fvp.debug_adapter,
        );
        await manageSolutionSettings.selectModel(manageSolutionFrame, fixture.fvp.model);
        await manageSolutionSettings.setConfigFile(
            manageSolutionFrame,
            fixture.fvp.config_file.replace(/^\.\//, ''),
        );
        await manageSolutionSettings.setMisc(manageSolutionFrame, fixture.fvp.misc);
        await vsCodeDriver.page.screenshot(
            `${SCREENSHOT_PREFIX}/Manage Solution Settings FVP configuration`,
        );
        await manageSolutionSettings.save();
        await expectFileToContainAll(referenceApplicationSolutionFilePath, [
            fixture.fvp.pack,
            `name: ${fixture.fvp.debug_adapter}`,
            `model: ${fixture.fvp.model}`,
            fixture.fvp.config_file.replace(/^\.\//, ''),
            `args: ${fixture.fvp.misc}`,
        ]);

        // Steps 10-11: configure the Arm Tools environment and save it.
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

        const vcpkg = new VcpkgDriver(vsCodeDriver);
        await vcpkg.waitForActivation();
        await vcpkg.waitForLoadedSolution(fixture.device ?? fixture.board);

        // Loading the solution and activating the tools do not mean that the
        // automatic cbuild conversion has finished. Building before the index
        // exists can cancel the still-running setup task and leave no binary.
        const cbuildIndexFile = `./${createdSolution.solutionFileName.replace(
            /\.csolution\.ya?ml$/,
            '.cbuild-idx.yml',
        )}`;
        await expectGeneratedFileExists(artifacts, cbuildIndexFile);

        // Steps 12-13: build the solution and verify all specified artifacts.
        await vsCodeDriver.page.openCmsisPanel();
        const targetName = fixture.device ?? fixture.board;
        const buildContextName = `${fixture.reference_application}.Debug+${targetName}`;
        const buildContextPattern = new RegExp(
            `${escapeRegExp(fixture.reference_application)}\\.Debug\\s*\\+\\s*${escapeRegExp(targetName)}`,
            'i',
        );
        const buildContext = vsCodeDriver.page.getLocator('a').filter({
            hasText: buildContextPattern,
        }).first();
        await expect(buildContext).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
        await buildContext.click();

        const buildTask = vsCodeDriver.page.getRoleByName('button', {
            name: /^Focus Terminal.*Split Terminal/,
        });
        await vsCodeDriver.page.getCommands().runCommandFromPalette('Terminal: Kill All Terminals');
        await expect(buildTask).toHaveCount(0, { timeout: DEFAULT_TIMEOUT_MS });

        const buildButton = vsCodeDriver.page.getRoleByName('button', { name: 'Build solution' });
        await expect(buildButton).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
        await expect(buildButton).toBeEnabled({ timeout: DEFAULT_TIMEOUT_MS });
        await buildButton.click();

        await expect(buildTask).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
        await waitForBuild(buildTask);

        let terminalOutput = '';
        try {
            await expect.poll(async () => {
                terminalOutput = await copyTerminalText(vsCodeDriver);
                return terminalOutput;
            }, {
                timeout: DEFAULT_TIMEOUT_MS,
                intervals: [4000],
                message: `Expected compilation output for ${buildContextName}`,
            }).toMatch(/Program Size:\s*Code=\d+\s+RO-data=\d+\s+RW-data=\d+\s+ZI-data=\d+/i);
        } catch (error) {
            const cause = error instanceof Error ? error.message : String(error);
            throw new Error(
                `Build did not compile ${buildContextName}.\n`
                + `Terminal output:\n${terminalOutput}\n`
                + `Cause: ${cause}`,
            );
        }

        const builtFiles = fixture.expected_files?.built ?? [];
        for (const file of builtFiles) {
            try {
                await expectGeneratedFileExists(artifacts, file);
            } catch (error) {
                const outputDirectory = path.join(artifacts.solutionDirectory, 'out');
                const generatedOutput = await fs.readdir(outputDirectory, { recursive: true })
                    .catch(() => []);
                const cause = error instanceof Error ? error.message : String(error);

                throw new Error(
                    `Expected build artifact was not generated: ${file}\n`
                    + `Files found under out: ${JSON.stringify(generatedOutput)}\n`
                    + `Cause: ${cause}`,
                );
            }
        }
        await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/After successful build`);
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
