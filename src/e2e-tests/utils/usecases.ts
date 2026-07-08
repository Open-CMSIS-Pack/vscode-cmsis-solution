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

import { promises as fs } from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { expect } from '@playwright/test';
import { DEFAULT_TIMEOUT_MS } from '../constants';
import { CreateSolutionDriver } from '../drivers/create-solution-driver';
import { VsCodeDriver } from '../infrastructure/vscode-driver';

export type ExpectedFiles = {
    required?: string[];
};

export type ExpectedProblems = {
    required?: { message: string }[];
};

export type CreateSolutionInput = {
    target: string;
    template: string;
    solutionNamePrefix?: string;
    expectedFiles?: ExpectedFiles;
    expectedProblems?: ExpectedProblems;
};

export type GeneratedSolutionArtifacts = {
    solutionDirectory: string;
    solutionFilePath: string;
    projectFilePaths: string[];
    mainFilePaths: string[];
};

export type CreatedSolution = {
    solutionName: string;
    solutionFolder: string;
    solutionFileName: string;
    solutionBaseFolder: string;
    solutionFilePath: string;
    relativeSolutionFilePath: string;
    artifacts: GeneratedSolutionArtifacts;
};

type ParsedProjectEntry = string | { project?: string };

type ParsedCsolution = {
    solution?: {
        projects?: ParsedProjectEntry[];
    };
};

/**
 * Loads and parses a YAML fixture file from the provided path.
 */
export const loadYamlFixture = async <T>(fixturePath: string): Promise<T> => {
    const text = await fs.readFile(fixturePath, 'utf8');
    return YAML.parse(text) as T;
};

export const createUniqueSolutionName = (prefix = 'e2e_device_template_solution'): string => {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    return `${prefix}_${timestamp}`;
};

export const createGeneratedSolution = (
    vsCodeDriver: VsCodeDriver,
    solutionName: string,
): Omit<CreatedSolution, 'artifacts'> => {
    const solutionFolder = `${solutionName}_folder`;
    const solutionFileName = `${solutionName}.csolution.yml`;
    const solutionBaseFolder = path.join(vsCodeDriver.testWorkspaceDirectory, '.generated-solutions');
    const solutionFilePath = path.join(solutionBaseFolder, solutionFolder, solutionFileName);
    const relativeSolutionFilePath = path.relative(vsCodeDriver.testWorkspaceDirectory, solutionFilePath);

    expect(relativeSolutionFilePath.startsWith('..')).toBe(false);
    expect(path.isAbsolute(relativeSolutionFilePath)).toBe(false);

    return {
        solutionName,
        solutionFolder,
        solutionFileName,
        solutionBaseFolder,
        solutionFilePath,
        relativeSolutionFilePath,
    };
};

export const readGeneratedSolutionArtifacts = async (
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

export const allPathsExist = async (pathsToCheck: string[]): Promise<boolean> => {
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
    const normalizedPattern = pattern.replace(/\\/g, '/').replace(/^\.\//, '');
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

export const allRequiredFilePatternsExist = async (
    solutionDirectory: string,
    requiredPatterns: string[],
): Promise<boolean> => {
    const relativeFiles = await listRelativeFiles(solutionDirectory);

    return requiredPatterns.every(pattern => {
        const matcher = globPatternToRegExp(pattern);
        return relativeFiles.some(file => matcher.test(file));
    });
};

export const createSolutionFromWizard = async (
    vsCodeDriver: VsCodeDriver,
    input: CreateSolutionInput,
): Promise<Omit<CreatedSolution, 'artifacts'>> => {
    const solutionName = createUniqueSolutionName(input.solutionNamePrefix);
    const createdSolution = createGeneratedSolution(vsCodeDriver, solutionName);
    const createSolution = new CreateSolutionDriver(vsCodeDriver);

    await createSolution.createSolution({
        target: input.target,
        template: input.template,
        solutionName: createdSolution.solutionName,
        solutionFolder: createdSolution.solutionFolder,
        solutionBaseFolder: createdSolution.solutionBaseFolder,
    });

    return createdSolution;
};

export const readAndValidateGeneratedSolutionArtifacts = async (
    solutionFilePath: string,
    solutionFileName: string,
): Promise<GeneratedSolutionArtifacts> => {
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

    return generatedArtifacts;
};

export const expectGeneratedSolutionFiles = async (
    artifacts: GeneratedSolutionArtifacts,
    requiredFilePatterns: string[],
): Promise<void> => {
    await expect.poll(async () => allPathsExist([
        artifacts.solutionFilePath,
        ...artifacts.projectFilePaths,
        ...artifacts.mainFilePaths,
    ]), {
        timeout: DEFAULT_TIMEOUT_MS,
        intervals: [1000, 2000, 3000],
    }).toBe(true);

    await expect.poll(async () => allRequiredFilePatternsExist(
        artifacts.solutionDirectory,
        requiredFilePatterns,
    ), {
        timeout: DEFAULT_TIMEOUT_MS,
        intervals: [1000, 2000, 3000],
    }).toBe(true);
};
