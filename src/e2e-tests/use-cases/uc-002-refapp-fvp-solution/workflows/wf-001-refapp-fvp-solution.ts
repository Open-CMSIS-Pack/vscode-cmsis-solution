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
 // generated with AI
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
import { parse } from 'jsonc-parser';
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
import {
    copyTerminalText,
    escapeRegExp,
    waitForBuild,
} from '../../../utils/helper';
import { log } from '../../../utils/logger';

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
        artifact: string;
        version: string;
    };
    expected_run: {
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
    await expect(async () => {
        const normalizedFileText = (await fs.readFile(filePath, 'utf8')).replace(/\\/g, '/');

        for (const expectedPart of expectedParts) {
            expect(normalizedFileText).toContain(expectedPart.replace(/\\/g, '/'));
        }
    }).toPass({
        timeout: DEFAULT_TIMEOUT_MS,
        intervals: [250, 500, 1000, 2000],
    });
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

type VcpkgConfiguration = {
    requires?: Record<string, string>;
};

type GeneratedTask = {
    label?: string;
    dependsOn?: string[];
    dependsOrder?: string;
};

type GeneratedTasksJson = {
    tasks?: GeneratedTask[];
};

const expectToolsConfigurationApplied = async (
    configurationFilePath: string,
    artifact: string,
    version: string,
): Promise<void> => {
    await expect(async () => {
        const configuration = JSON.parse(
            await fs.readFile(configurationFilePath, 'utf8'),
        ) as VcpkgConfiguration;

        expect(configuration.requires?.[artifact]).toBe(version);
    }).toPass({
        timeout: DEFAULT_TIMEOUT_MS,
        intervals: [250, 500, 1000, 2000],
    });
};

const expectLoadAndRunConfigurationGenerated = async (
    tasksJsonPath: string,
): Promise<void> => {
    await expect(async () => {
        const tasksJson = parse(
            await fs.readFile(tasksJsonPath, 'utf8'),
        ) as GeneratedTasksJson;
        const tasks = tasksJson.tasks ?? [];

        expect(tasks.some(task => task.label === 'CMSIS Load')).toBe(true);
        expect(tasks.some(task => task.label === 'CMSIS Run')).toBe(true);

        const loadAndRunTask = tasks.find(task => task.label === 'CMSIS Load+Run');
        expect(loadAndRunTask).toBeDefined();
        expect(loadAndRunTask?.dependsOn).toEqual(['CMSIS Load', 'CMSIS Run']);
        expect(loadAndRunTask?.dependsOrder).toBe('sequence');
    }).toPass({
        timeout: DEFAULT_TIMEOUT_MS,
        intervals: [250, 500, 1000, 2000],
    });
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
    let failureScreenshotCaptured = false;
    const captureFailureScreenshot = async (): Promise<void> => {
        if (failureScreenshotCaptured) {
            return;
        }
        failureScreenshotCaptured = true;
        try {
            await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/99-failure`);
        } catch (error) {
            log('warn', `Failed to capture UC-002 failure screenshot: ${String(error)}`);
        }
    };

    try {
        // Start from a clean notification state so error checks only include this workflow.
        await vsCodeDriver.page.getCommands().runCommandFromPalette('Notifications: Clear All Notifications');
        await vsCodeDriver.page.openCmsisPanel();

        const { createdSolution, artifacts } = await test.step(
            'Create and load solution',
            async () => {
                const solution = await createSolutionFromWizard(vsCodeDriver, {
                    target: fixture.board,
                    targetKind: 'board',
                    template: fixture.reference_application,
                    templateKind: 'referenceApplication',
                    solutionNamePrefix: fixture.solution_name_prefix,
                    expectedFiles: fixture.expected_files,
                    expectedProblems: fixture.expected_problems,
                });

                // Creation opens the unique generated solution folder as the VS Code workspace.
                // The title connects the UI state to this invocation rather than a solution left
                // loaded by an earlier test.
                await vsCodeDriver.page.waitForVsCodeToBeReady();
                await vsCodeDriver.page.waitForActionItem('CMSIS');
                await expect(vsCodeDriver.page.getPage()).toHaveTitle(
                    new RegExp(escapeRegExp(solution.solutionFolder), 'i'),
                    { timeout: DEFAULT_TIMEOUT_MS },
                );

                // Validate the exact newly-created solution and its expected source artifacts.
                const generatedArtifacts = await readAndValidateGeneratedSolutionArtifacts(
                    solution.solutionFilePath,
                    solution.solutionFileName,
                );
                const createdFiles = fixture.expected_files?.created ?? [];
                await Promise.all(createdFiles.map(file =>
                    expectGeneratedFileExists(generatedArtifacts, file),
                ));

                // This action is enabled only while the extension has an active solution.
                await vsCodeDriver.page.openCmsisPanel();
                const manageSolutionSettingsButton = vsCodeDriver.page.getRoleByName(
                    'button',
                    { name: 'Manage Solution Settings' },
                );
                await expect(manageSolutionSettingsButton).toBeVisible({
                    timeout: DEFAULT_TIMEOUT_MS,
                });
                await expect(manageSolutionSettingsButton).toBeEnabled({
                    timeout: DEFAULT_TIMEOUT_MS,
                });

                await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/01-solution-created`);
                return { createdSolution: solution, artifacts: generatedArtifacts };
            },
        );

        await test.step('Configure FVP', async () => {
            // Finish the discovered board-layer configuration before editing the solution file
            // directly. Otherwise the still-open Configure Solution editor can save its stale
            // in-memory model over the external pack edit.
            const referenceApplicationSolutionFilePath = await expectGeneratedFileExists(
                artifacts,
                `./${createdSolution.solutionFileName}`,
            );
            await confirmDiscoveredSolutionConfiguration(vsCodeDriver);
            await addPackToCsolution(referenceApplicationSolutionFilePath, fixture.fvp.pack);
            await expectFileToContainAll(referenceApplicationSolutionFilePath, [fixture.fvp.pack]);
            await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/02-csolution-updated`);

            // Force all extension-side solution controllers to reload the external YAML change
            // before Manage Solution Settings updates and saves the same file.
            await vsCodeDriver.page.reloadWindow('CMSIS');
            await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/03-window-reloaded`);

            await vsCodeDriver.page.logAndClearNotifications();
            const manageSolutionSettings = new ManageSolutionSettingsDriver(vsCodeDriver);
            const manageSolutionFrame = await manageSolutionSettings.open(
                referenceApplicationSolutionFilePath,
            );

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
            await manageSolutionSettings.save();

            // Saving is asynchronous. Poll the exact solution file until every configured value
            // is persisted instead of treating the Ctrl+S keypress as completion.
            await expectFileToContainAll(referenceApplicationSolutionFilePath, [
                fixture.fvp.pack,
                `name: ${fixture.fvp.debug_adapter}`,
                `model: ${fixture.fvp.model}`,
                fixture.fvp.config_file.replace(/^\.\//, ''),
                `args: ${fixture.fvp.misc}`,
            ]);
            await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/04-fvp-configured`);
        });

        await test.step('Configure Arm Tools', async () => {
            const armTools = new ArmToolsDriver(vsCodeDriver);
            const armToolsFrame = await armTools.openConfigureArmToolsEnvironment();

            await armTools.selectVersion(
                armToolsFrame,
                fixture.arm_tools.environment,
                fixture.arm_tools.version,
            );
            await armTools.saveVcpkgConfiguration();

            // Saving is asynchronous. Completion means the exact selected artifact and version
            // are persisted in the generated configuration, not merely that the editor exists.
            const configurationFilePath = await expectGeneratedFileExists(
                artifacts,
                './vcpkg-configuration.json',
            );
            await expectToolsConfigurationApplied(
                configurationFilePath,
                fixture.arm_tools.artifact,
                fixture.arm_tools.version,
            );

            const vcpkg = new VcpkgDriver(vsCodeDriver);
            await vcpkg.waitForActivation();
            await vcpkg.waitForLoadedSolution(fixture.device ?? fixture.board);
            await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/05-tools-configured`);
        });

        const targetName = fixture.device ?? fixture.board;
        await test.step('Build solution', async () => {
            // The generated index is the readiness postcondition for cbuild conversion.
            const cbuildIndexFile = `./${createdSolution.solutionFileName.replace(
                /\.csolution\.ya?ml$/,
                '.cbuild-idx.yml',
            )}`;
            await expectGeneratedFileExists(artifacts, cbuildIndexFile);

            await vsCodeDriver.page.openCmsisPanel();
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

            // A clean terminal list ensures the new task and its output belong to this build.
            const buildTask = vsCodeDriver.page.getRoleByName('button', {
                name: /^Focus Terminal.*Split Terminal/,
            });
            await vsCodeDriver.page.getCommands()
                .runCommandFromPalette('Terminal: Kill All Terminals');
            await expect(buildTask).toHaveCount(0, { timeout: DEFAULT_TIMEOUT_MS });

            const buildButton = vsCodeDriver.page.getRoleByName('button', {
                name: 'Build solution',
            });
            await expect(buildButton).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
            await expect(buildButton).toBeEnabled({ timeout: DEFAULT_TIMEOUT_MS });
            await buildButton.click();
            await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/06-build-started`);

            await expect(buildTask).toHaveCount(1, { timeout: DEFAULT_TIMEOUT_MS });
            await expect(buildTask).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
            await waitForBuild(buildTask);

            // Select the sole task explicitly before copying its output; do not depend on which
            // terminal VS Code happens to leave active when the task finishes.
            await buildTask.click();
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

            // Completion requires every fixture-defined artifact from this fresh solution.
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
            await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/07-build-done`);
        });

        const terminalTaskButtons = vsCodeDriver.page.getRoleByName('button', {
            name: /^Focus Terminal.*Split Terminal/,
        });
        const runTaskButton = terminalTaskButtons.filter({ hasText: 'CMSIS Run' });
        let loadAndRunOutput = '';
        try {
            await test.step('Generate Load & Run configuration', async () => {
                const cbuildRunFilePath = await expectGeneratedFileExists(
                    artifacts,
                    `./out/${fixture.reference_application}+${targetName}.cbuild-run.yml`,
                );
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
                await expectLoadAndRunConfigurationGenerated(tasksJsonPath);
                await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/08-before-load-run`);
            });

            await test.step('Run Load & Run compound task', async () => {
                // With no existing terminals, the task observed below must belong to this action.
                await vsCodeDriver.page.getCommands()
                    .runCommandFromPalette('Terminal: Kill All Terminals');
                await expect(terminalTaskButtons).toHaveCount(0, {
                    timeout: DEFAULT_TIMEOUT_MS,
                });

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
                await expect(loadAndRunButton).toBeEnabled({ timeout: DEFAULT_TIMEOUT_MS });
                await loadAndRunButton.click();
                await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/09-load-run-triggered`);

                // The sequential compound task starts Run only after Load succeeds.
                await expect(runTaskButton).toHaveCount(1, { timeout: DEFAULT_TIMEOUT_MS });
                await expect(runTaskButton).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

                // Read only this run's terminal; polling must not switch output sources.
                await runTaskButton.click();
                await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/10-cmsis-run-started`);

                try {
                    for (const expectedText of expectedOutput) {
                        await expect.poll(async () => {
                            loadAndRunOutput = await copyTerminalText(vsCodeDriver);
                            return loadAndRunOutput;
                        }, {
                            timeout: DEFAULT_TIMEOUT_MS,
                            intervals: [1000, 2000, 3000],
                            message: `Expected CMSIS Run terminal to contain "${expectedText}"`,
                        }).toContain(expectedText);
                    }
                } catch (error) {
                    const cause = error instanceof Error ? error.message : String(error);
                    throw new Error(
                        'FVP did not produce the expected application output.\n'
                        + `Terminal output:\n${loadAndRunOutput}\n`
                        + `Cause: ${cause}`,
                    );
                }

                await vsCodeDriver.page.screenshot(`${SCREENSHOT_PREFIX}/11-blinky-output`);
            });
        } catch (error) {
            await captureFailureScreenshot();
            throw error;
        } finally {
            try {
                await vsCodeDriver.page.getCommands()
                    .runCommandFromPalette('Terminal: Kill All Terminals');
            } catch (error) {
                log('warn', `Failed to stop CMSIS Load+Run during cleanup: ${String(error)}`);
            }
        }
    } catch (error) {
        await captureFailureScreenshot();
        throw error;
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
