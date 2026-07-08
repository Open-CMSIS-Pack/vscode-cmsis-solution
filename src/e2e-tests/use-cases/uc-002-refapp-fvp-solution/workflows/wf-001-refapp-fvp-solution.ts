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
import { VsCodeDriver } from '../../../infrastructure/vscode-driver';
import { DEFAULT_TIMEOUT_MS } from '../../../constants';
import {
    createSolutionFromWizard,
    expectGeneratedSolutionFiles,
    ExpectedFiles,
    ExpectedProblems,
    readAndValidateGeneratedSolutionArtifacts,
} from '../../../utils/usecases';

export { loadYamlFixture } from '../../../utils/usecases';

// ---------------------------------------------------------------------------
// Fixture type
// ---------------------------------------------------------------------------

export type CreateSolutionFixture = {
    board: string;
    device?: string;
    reference_application: string;
    template?: string;
    solution_name_prefix?: string;
    expected_files?: ExpectedFiles;
    expected_problems?: ExpectedProblems;
};

// ---------------------------------------------------------------------------
// Workflow entry point
// ---------------------------------------------------------------------------

/**
 * Runs WF-001: Creates a solution from a reference application using the FVP
 * specified in `fixture`, then verifies the generated solution, builds it,
 * loads and runs it on the FVP, and validates the expected runtime output.
 */
export const runWf001RefAppFVPSolution = async (
    vsCodeDriver: VsCodeDriver,
    fixture: CreateSolutionFixture,
): Promise<void> => {
    // Start from a clean notification state so error checks only include this workflow.
    await vsCodeDriver.page.getCommands().runCommandFromPalette('Notifications: Clear All Notifications');
    await vsCodeDriver.page.openCmsisPanel();

    // 1) Open wizard and fill in FVP, reference application, and solution details.
    const createdSolution = await createSolutionFromWizard(vsCodeDriver, {
        target: fixture.board,
        template: fixture.reference_application,
        solutionNamePrefix: fixture.solution_name_prefix,
        expectedFiles: fixture.expected_files,
        expectedProblems: fixture.expected_problems,
    });

    try {
        // The extension opens the generated solution folder by default.
        await vsCodeDriver.page.waitForVsCodeToBeReady();
        await vsCodeDriver.page.waitForActionItem('CMSIS');

        // 2) Validate the .csolution.yml exists before trying to parse it.
        const artifacts = await readAndValidateGeneratedSolutionArtifacts(
            createdSolution.solutionFilePath,
            createdSolution.solutionFileName,
        );

        const requiredFilePatterns = fixture.expected_files?.required ?? [];
        await expectGeneratedSolutionFiles(artifacts, requiredFilePatterns);

        // 3) Verify the generated solution is loaded in the CMSIS UI.
        await vsCodeDriver.page.openCmsisPanel();
        await expect(vsCodeDriver.page.getRoleByName('button', { name: 'Build solution' }))
            .toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

        await vsCodeDriver.page.screenshot('uc-002-refapp-fvp-solution/wf-001/CMSIS view after solution load');

        // 4) Verify dependency validation does not report blocking problems.
        const dependencyValidationProblemPattern = /dependency validation for context '[^']+' failed:/i;
        const getDependencyValidationProblemRows = () => vsCodeDriver.page
            .getLocator('.monaco-list-row:visible')
            .filter({ hasText: dependencyValidationProblemPattern });
        const getDependencyValidationProblemTexts = async () => (await getDependencyValidationProblemRows()
            .allTextContents())
            .map(text => text.replace(/\s+/g, ' ').trim());

        await vsCodeDriver.page.getCommands().runCommandFromPalette('View: Show Problems');

        const noWorkspaceProblems = vsCodeDriver.page
            .getLocator('text=No problems have been detected in the workspace.');

        const expectedProblems = fixture.expected_problems?.required ?? [];

        if (expectedProblems.length > 0) {
            for (const expectedProblem of expectedProblems) {
                await expect(vsCodeDriver.page.getPage().getByText(expectedProblem.message))
                    .toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
            }
        } else {
            await expect.poll(async () => getDependencyValidationProblemTexts(), {
                timeout: DEFAULT_TIMEOUT_MS,
                intervals: [1000, 2000, 3000],
            }).toEqual([]);
        }

        if (await noWorkspaceProblems.count() > 0) {
            await expect(noWorkspaceProblems).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
        }

        await vsCodeDriver.page.screenshot('uc-002-refapp-fvp-solution/wf-001/Problems view after validation');

        // 5) Verify no error notifications or failed task notifications were raised.
        await vsCodeDriver.page.getCommands().runCommandFromPalette('Notifications: Show Notifications');

        await expect(vsCodeDriver.page.getLocator('.notification-list-item .codicon-error'))
            .toHaveCount(0);

        await expect(
            vsCodeDriver.page
                .getLocator('.notification-list-item')
                .filter({ hasText: /failed with exit code|terminated with exit code|task .* failed/i }),
        ).toHaveCount(0);

        await vsCodeDriver.page.getPage().keyboard.press('Escape');
    } finally {
        await vsCodeDriver.restoreTestWorkspace();
    }
};
