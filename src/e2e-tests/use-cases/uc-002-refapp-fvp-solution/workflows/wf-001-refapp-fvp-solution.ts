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

import { expect, test } from '@playwright/test';
import { promises as fs } from 'fs';
import * as path from 'path';
import { parse } from 'jsonc-parser';
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
import {
    copyTerminalText,
    escapeRegExp,
    waitForBuild,
} from '../../../utils/helper';
import { log } from '../../../utils/logger';

export { loadYamlFixture } from '../../../utils/usecases';

const SCREENSHOT_PREFIX = 'uc-002-refapp-fvp-solution/wf-001';

type GeneratedTasksJson = {
    tasks?: Array<{
        label?: string;
        command?: string;
        dependsOn?: string[];
        dependsOrder?: string;
    }>;
};

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

/**
 * Runs WF-001: Creates and configures an FVP reference application, builds it,
 * then loads and runs it on the FVP and validates the application output.
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

        // Create the FVP reference application solution from the Create Solution wizard.
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

        // Validate the .csolution.yml exists before trying to parse it.
        const artifacts = await readAndValidateGeneratedSolutionArtifacts(
            createdSolution.solutionFilePath,
            createdSolution.solutionFileName,
        );

        // Verify the generated application and finish the discovered board-layer
        // configuration before editing the solution file directly. Otherwise the
        // still-open Configure Solution editor can save its stale in-memory model
        // over the external pack edit.
        const createdFiles = fixture.expected_files?.created ?? [];
        await Promise.all(createdFiles.map(file => expectGeneratedFileExists(artifacts, file)));

        const referenceApplicationSolutionFilePath = await expectGeneratedFileExists(
            artifacts,
            `./${createdSolution.solutionFileName}`,
        );
        await confirmDiscoveredSolutionConfiguration(vsCodeDriver);
        await addPackToCsolution(referenceApplicationSolutionFilePath, fixture.fvp.pack);
        await expectFileToContainAll(referenceApplicationSolutionFilePath, [fixture.fvp.pack]);

        // Force all extension-side solution controllers to reload the external YAML
        // change before Manage Solution Settings updates and saves the same file.
        await vsCodeDriver.page.reloadWindow('CMSIS');

        // Configure and save the FVP debug settings.
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

        // Configure the Arm Tools environment and save it.
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

        // Wait for cbuild conversion to finish before starting the build.
        const cbuildIndexFile = `./${createdSolution.solutionFileName.replace(
            /\.csolution\.ya?ml$/,
            '.cbuild-idx.yml',
        )}`;
        await expectGeneratedFileExists(artifacts, cbuildIndexFile);

        // Build the solution and verify all specified artifacts.
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

        const loadAndRunTaskLabel = 'CMSIS Load+Run';
        const terminalTaskButtons = vsCodeDriver.page.getRoleByName('button', {
            name: /^Focus Terminal.*Split Terminal/,
        });
        const runTaskButton = terminalTaskButtons.filter({ hasText: 'CMSIS Run' });
        let loadAndRunOutput = '';
        try {
            await test.step('Generate the Load & Run task', async () => {
                log('info', 'Generating CMSIS Load+Run task...');
                const cbuildRunFilePath = await expectGeneratedFileExists(
                    artifacts,
                    `./out/${fixture.reference_application}+${targetName}.cbuild-run.yml`,
                );
                log('debug', `Using cbuild-run configuration: ${cbuildRunFilePath}`);
                await expectGeneratedRunConfiguration(cbuildRunFilePath, [
                    fixture.fvp.debug_adapter,
                    fixture.fvp.model,
                    fixture.fvp.config_file,
                    fixture.fvp.misc,
                    ...(fixture.expected_run.command_contains ?? []),
                ]);

                await vsCodeDriver.page.getCommands()
                    .runCommandFromPalette('Update Debug Tasks and Launch Configurations');
                const tasksJsonPath = await expectGeneratedFileExists(
                    artifacts,
                    './.vscode/tasks.json',
                );
                const tasksJson = parse(
                    await fs.readFile(tasksJsonPath, 'utf8'),
                ) as GeneratedTasksJson;
                const loadAndRunTask = tasksJson.tasks?.find(
                    candidate => candidate.label === loadAndRunTaskLabel,
                );
                expect(
                    loadAndRunTask,
                    `Expected ${tasksJsonPath} to contain task "${loadAndRunTaskLabel}"`,
                ).toBeDefined();
                expect(loadAndRunTask?.dependsOn).toEqual(['CMSIS Load', 'CMSIS Run']);
                expect(loadAndRunTask?.dependsOrder).toBe('sequence');
                log(
                    'debug',
                    `Generated CMSIS Load+Run task: ${JSON.stringify(loadAndRunTask)}`,
                );

                await vsCodeDriver.page.getCommands()
                    .runCommandFromPalette('Terminal: Kill All Terminals');
                await expect(terminalTaskButtons).toHaveCount(0, {
                    timeout: DEFAULT_TIMEOUT_MS,
                });
                log('info', 'CMSIS Load+Run task generated successfully');
            });

            await test.step('Run the compound Load & Run task and verify its terminal output', async () => {
                log('info', 'Starting sequential CMSIS Load then CMSIS Run tasks...');
                await vsCodeDriver.page.openCmsisPanel();
                const loadAndRunButton = vsCodeDriver.page.getRoleByName('button', {
                    name: 'Load & Run Application',
                });
                const expectedOutput = fixture.expected_run.output_contains ?? [];
                expect(
                    expectedOutput.length,
                    'Load & Run requires at least one functional success string',
                ).toBeGreaterThan(0);
                await expect(loadAndRunButton).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
                await loadAndRunButton.click();

                // The Run child starts only after the compound task's Load child succeeds.
                await expect(runTaskButton).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
                const taskSucceeded = runTaskButton.locator('.codicon-check');
                const taskFailed = runTaskButton.locator('.codicon-error');
                await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/After starting Load+Run task`);
                await expect(taskSucceeded.or(taskFailed)).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

                for (const expectedText of expectedOutput) {
                    await expect.poll(async () => {
                        await runTaskButton.click();
                        loadAndRunOutput = await copyTerminalText(vsCodeDriver);
                        return loadAndRunOutput;
                    }, {
                        timeout: DEFAULT_TIMEOUT_MS,
                        intervals: [1000, 2000, 3000],
                        message: `Expected CMSIS Run terminal to contain "${expectedText}"`,
                    }).toContain(expectedText);
                    log('info', `CMSIS Run terminal contains expected text: "${expectedText}"`);
                }

                if (await taskFailed.isVisible()) {
                    log('warn', 'CMSIS Run exited non-zero after producing the expected output');
                }
                log('info', 'CMSIS Load completed and CMSIS Run produced the expected output');
                await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/After FVP Load & Run`);
            });
        } finally {
            await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/Finally`);
            log('debug', `CMSIS Run terminal output: ${JSON.stringify(loadAndRunOutput)}`);
            try {
                await vsCodeDriver.page.getCommands()
                    .runCommandFromPalette('Terminal: Kill All Terminals');
                log('debug', 'CMSIS Load+Run terminals cleaned up');
            } catch (error) {
                log('warn', `Failed to stop CMSIS Load+Run during cleanup: ${String(error)}`);
            }
        }
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
