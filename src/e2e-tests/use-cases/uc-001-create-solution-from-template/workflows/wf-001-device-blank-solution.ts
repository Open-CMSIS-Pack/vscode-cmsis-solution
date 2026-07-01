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
 * WF-001: Create Solution from Blank Solution Template for a Device
 *
 * Executable implementation of the workflow steps described in the accompanying
 * wf-001-device-blank-solution.yml specification.
 *
 * Accepts a typed fixture so the same steps can be driven with different
 * device/template combinations by simply providing a different fixture object.
 */

import { expect } from '@playwright/test';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { VsCodeDriver } from '../../../infrastructure/vscode-driver';
import { CreateSolutionDriver } from '../../../drivers/create-solution-driver';
import { DEFAULT_TIMEOUT_MS } from '../../../constants';

// ---------------------------------------------------------------------------
// Fixture type
// ---------------------------------------------------------------------------

export type CreateSolutionFixture = {
    device: string;
    template: string;
    solution_name_prefix?: string;
    expected_files?: {
        required?: string[];
    };
    expected_problems?: {
        required?: { message: string }[];
    };
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

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

const createUniqueSolutionName = (prefix = 'e2e_device_template_solution'): string => {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    return `${prefix}_${timestamp}`;
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

    return { solutionDirectory, solutionFilePath, projectFilePaths, mainFilePaths };
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

const globPatternToRegExp = (pattern: string): RegExp => {
    const normalizedPattern = pattern.replace(/\\/g, '/');
    let source = '^';

    for (let index = 0; index < normalizedPattern.length;) {
        const current = normalizedPattern[index];
        const next = normalizedPattern[index + 1];
        const afterNext = normalizedPattern[index + 2];

        if (current === '*' && next === '*' && afterNext === '/') {
            source += '(?:.*/)?';
            index += 3;
            continue;
        }

        if (current === '*' && next === '*') {
            source += '.*';
            index += 2;
            continue;
        }

        if (current === '*') {
            source += '[^/]*';
            index += 1;
            continue;
        }

        source += current.replace(/[\\^$+?.()|[\]{}]/g, '\\$&');
        index += 1;
    }

    return new RegExp(`${source}$`);
};

const listRelativeFiles = async (
    directory: string,
    baseDirectory = directory,
): Promise<string[]> => {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = await Promise.all(entries.map(async entry => {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            return listRelativeFiles(entryPath, baseDirectory);
        }

        if (entry.isFile()) {
            return [path.relative(baseDirectory, entryPath).replace(/\\/g, '/')];
        }

        return [];
    }));

    return files.flat();
};

const allRequiredFilePatternsExist = async (
    solutionDirectory: string,
    requiredPatterns: string[],
): Promise<boolean> => {
    const relativeFiles = await listRelativeFiles(solutionDirectory);

    return requiredPatterns.every(pattern => {
        const matcher = globPatternToRegExp(pattern);
        return relativeFiles.some(file => matcher.test(file));
    });
};

// ---------------------------------------------------------------------------
// Fixture loader
// ---------------------------------------------------------------------------

/**
 * Loads and parses a YAML fixture file from the provided path.
 */
export const loadYamlFixture = async <T>(fixturePath: string): Promise<T> => {
    const text = await fs.readFile(fixturePath, 'utf8');
    return YAML.parse(text) as T;
};

// ---------------------------------------------------------------------------
// Workflow entry point
// ---------------------------------------------------------------------------

/**
 * Runs WF-001: creates a solution from the Blank Solution template using the
 * device/template specified in `fixture`, then validates the generated artifacts
 * and verifies dependency validation does not report blocking problems.
 */
export const runWf001DeviceBlankSolution = async (
    vsCodeDriver: VsCodeDriver,
    fixture: CreateSolutionFixture,
): Promise<void> => {
    const solutionName = createUniqueSolutionName(fixture.solution_name_prefix);
    const solutionFolder = `${solutionName}_folder`;
    const solutionFileName = `${solutionName}.csolution.yml`;
    const solutionBaseFolder = path.dirname(vsCodeDriver.testWorkspaceDirectory);
    const solutionFilePath = path.join(solutionBaseFolder, solutionFolder, solutionFileName);

    // Start from a clean notification state so error checks only include this workflow.
    await vsCodeDriver.page.getCommands().runCommandFromPalette('Notifications: Clear All Notifications');
    await vsCodeDriver.page.openCmsisPanel();

    // 1) Open wizard and fill in device, template, and solution details.
    const createSolution = new CreateSolutionDriver(vsCodeDriver);
    const frame = await createSolution.open();
    await createSolution.selectDevice(frame, fixture.device);
    await createSolution.selectTemplate(frame, fixture.template);
    await createSolution.fillDetails(frame, solutionName, solutionFolder, solutionBaseFolder);
    await createSolution.create(frame);

    try {
        // The extension opens the generated solution folder by default.
        await vsCodeDriver.page.waitForVsCodeToBeReady();
        await vsCodeDriver.page.waitForActionItem('CMSIS');

        // 2) Validate the .csolution.yml exists before trying to parse it.
        await expect.poll(async () => allPathsExist([solutionFilePath]), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000],
        }).toBe(true);

        let generatedArtifacts: GeneratedSolutionArtifacts | undefined;
        await expect(async () => {
            generatedArtifacts = await readGeneratedSolutionArtifacts(solutionFilePath);
            expect(path.basename(generatedArtifacts.solutionFilePath)).toBe(solutionFileName);
            expect(generatedArtifacts.projectFilePaths.length).toBeGreaterThan(0);
        }).toPass({
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [250, 500, 1000, 2000, 3000],
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
            intervals: [1000, 2000, 3000],
        }).toBe(true);

        const requiredFilePatterns = fixture.expected_files?.required ?? [];
        await expect.poll(async () => allRequiredFilePatternsExist(
            artifacts.solutionDirectory,
            requiredFilePatterns,
        ), {
            timeout: DEFAULT_TIMEOUT_MS,
            intervals: [1000, 2000, 3000],
        }).toBe(true);

        // 3) Verify the generated solution is loaded in the CMSIS UI.
        await vsCodeDriver.page.openCmsisPanel();
        await expect(vsCodeDriver.page.getRoleByName('button', { name: 'Build solution' }))
            .toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

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
