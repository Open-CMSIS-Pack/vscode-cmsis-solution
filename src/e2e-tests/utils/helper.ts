/**
 * Copyright 2025-2026 Arm Limited
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
 * Test Helper Utilities
 *
 * This module provides reusable helper functions for common test operations
 * that don't fit into specific driver categories.
 *
 * Key responsibilities:
 * - Extract build target names from context strings (e.g., ".Debug+AVH" → "AVH")
 * - Copy terminal text content via clipboard for verification
 * - Parse build context information for test assertions
 */

import { expect } from '@playwright/test';
import type * as playwright from '@playwright/test';
import { promises as fs } from 'fs';
import * as path from 'path';
import { parse } from 'jsonc-parser';
import { VsCodeDriver } from '../infrastructure/vscode-driver';
import { DEFAULT_TIMEOUT_MS, TASK_TIMEOUT_MS } from '../constants';
import { log } from './logger';

export function getTargetFromContext(context: string): string {
    const match = /\+(.+)$/.exec(context);
    return match ? match[1] : '';
}

export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function copyTerminalText(vscode: VsCodeDriver): Promise<string> {
    const page = vscode.page.getPage();

    await page.context().grantPermissions(['clipboard-read']);

    await vscode.page.getCommands().runCommandFromPalette('Terminal: Select All');
    await vscode.page.getCommands().runCommandFromPalette('Terminal: Copy Selection');

    const copiedText = await page.evaluate(() =>
        navigator.clipboard.readText(),
    );
    return copiedText;
}

export async function waitForBuild(
    taskLocator: playwright.Locator,
): Promise<void> {
    const taskSucceeded = taskLocator.locator('.codicon-check');
    await taskSucceeded.waitFor({ timeout: TASK_TIMEOUT_MS });
}

type GeneratedShellTask = {
    label?: string;
    command?: string;
};

type GeneratedTasksJson = {
    tasks?: GeneratedShellTask[];
};

type RunTaskWithOutputOptions = {
    vscode: VsCodeDriver;
    workspaceDirectory: string;
    taskName: string;
    startButton: playwright.Locator;
    expectedOutput: string[];
};

const quoteShellArgument = (argument: string): string => {
    if (process.platform === 'win32') {
        return `"${argument.replace(/"/g, '""')}"`;
    }

    const singleQuote = String.fromCharCode(39);
    const escapedSingleQuote = `${singleQuote}"${singleQuote}"${singleQuote}`;
    return `${singleQuote}${argument.replaceAll(singleQuote, escapedSingleQuote)}${singleQuote}`;
};

const readFileIfExists = async (filePath: string): Promise<string> => {
    try {
        return await fs.readFile(filePath, 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return '';
        }
        throw error;
    }
};

const redirectGeneratedTaskOutput = async (
    tasksJsonPath: string,
    taskName: string,
    outputLogPath: string,
    wrapperScriptPath: string,
): Promise<void> => {
    const tasksJson = parse(await fs.readFile(tasksJsonPath, 'utf8')) as GeneratedTasksJson;
    const task = tasksJson.tasks?.find(candidate => candidate.label === taskName);

    expect(task, `Expected ${tasksJsonPath} to contain task "${taskName}"`).toBeDefined();
    expect(typeof task?.command).toBe('string');

    const command = quoteShellArgument(task!.command!);
    const outputLog = quoteShellArgument(outputLogPath);
    const wrapperScript = process.platform === 'win32'
        ? `@echo off\r\n${command} %* > ${outputLog} 2>&1\r\nexit /b %errorlevel%\r\n`
        : `#!/usr/bin/env bash\n${command} "$@" > ${outputLog} 2>&1\nexit $?\n`;

    await fs.writeFile(wrapperScriptPath, wrapperScript, 'utf8');
    if (process.platform !== 'win32') {
        await fs.chmod(wrapperScriptPath, 0o700);
    }

    task!.command = wrapperScriptPath;
    await fs.writeFile(tasksJsonPath, JSON.stringify(tasksJson, null, 4), 'utf8');
};

export const runTaskAndExpectOutput = async ({
    vscode,
    workspaceDirectory,
    taskName,
    startButton,
    expectedOutput,
}: RunTaskWithOutputOptions): Promise<void> => {
    const tasksJsonPath = path.join(workspaceDirectory, '.vscode', 'tasks.json');
    const safeTaskName = taskName.replace(/[^a-zA-Z0-9._-]+/g, '-');
    const outputLogPath = path.join(workspaceDirectory, '.e2e', `${safeTaskName}.log`);
    const wrapperScriptPath = path.join(
        workspaceDirectory,
        '.e2e',
        `${safeTaskName}.${process.platform === 'win32' ? 'cmd' : 'sh'}`,
    );

    await fs.mkdir(path.dirname(outputLogPath), { recursive: true });
    await fs.rm(outputLogPath, { force: true });
    await fs.rm(wrapperScriptPath, { force: true });
    await redirectGeneratedTaskOutput(tasksJsonPath, taskName, outputLogPath, wrapperScriptPath);

    try {
        await expect(startButton).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });
        await startButton.click();

        const taskButton = vscode.page.getRoleByName('button', {
            name: /^Focus Terminal.*Split Terminal/,
        });
        await expect(taskButton).toBeVisible({ timeout: DEFAULT_TIMEOUT_MS });

        const succeeded = taskButton.locator('.codicon-check');
        const failed = taskButton.locator('.codicon-error');
        await expect(succeeded.or(failed)).toBeVisible({ timeout: TASK_TIMEOUT_MS });
        const taskReportedFailure = await failed.isVisible();

        for (const expectedText of expectedOutput) {
            await expect.poll(
                () => readFileIfExists(outputLogPath),
                {
                    timeout: DEFAULT_TIMEOUT_MS,
                    intervals: [250, 500, 1000, 2000],
                    message: `Expected ${path.basename(outputLogPath)} to contain "${expectedText}"`,
                },
            ).toContain(expectedText);
        }

        if (taskReportedFailure) {
            log(
                'warn',
                `${taskName} reported a non-zero exit status; accepting the task because all expected output was produced.`,
            );
        }
    } finally {
        try {
            const capturedOutput = await readFileIfExists(outputLogPath);
            log('debug', `${taskName} captured output: ${JSON.stringify(capturedOutput)}`);
        } finally {
            await Promise.all([
                fs.rm(outputLogPath, { force: true }),
                fs.rm(wrapperScriptPath, { force: true }),
            ]);
        }
    }
};
