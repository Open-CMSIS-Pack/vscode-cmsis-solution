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
 * VS Code Download and Launch Management
 *
 * This module provides core functionality for obtaining and launching VS Code instances
 * for E2E testing. It handles downloading the VS Code stable release, caching the
 * executable path, and launching VS Code with appropriate test configurations.
 */

import { downloadAndUnzipVSCode } from '@vscode/test-electron';
import { TestDirectories } from './test-directories';
import { launchElectron } from './electron';
import * as playwright from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { log } from '../utils/logger';

let cachedVSCodeExecutablePath: string | undefined;

export const getVsCode = async (): Promise<string> => {
    if (cachedVSCodeExecutablePath === undefined) {
        cachedVSCodeExecutablePath = await downloadAndUnzipVSCode({
            version: 'stable',
        });
    }
    return cachedVSCodeExecutablePath;
};

export type LaunchOptions = {
    vsCodeExecutablePath: string;
    testDirectories: TestDirectories;
    defaultTimeoutMillis: number;
}

export const launchVsCode = async ({ vsCodeExecutablePath, testDirectories, defaultTimeoutMillis }: LaunchOptions): Promise<playwright.ElectronApplication> => {
    // Disable authentication providers in test environment to avoid timeout errors
    const testEnv = {
        VSCODE_SKIP_GETTING_STARTED: 'true',
    };

    return await launchElectron(vsCodeExecutablePath, [
        '--disable-workspace-trust',
        '--skip-release-notes',
        '--skip-welcome',
        '--disable-telemetry',
        '--no-cached-data',
        '--disable-updates',
        '--disable-keytar',
        '--skip-add-to-recently-opened',
        `--user-data-dir=${testDirectories.userData}`,
        `--extensions-dir=${testDirectories.extensions}`,
        '--extensionDevelopmentPath', path.resolve(__dirname, '../../../'),
        testDirectories.workspace,
    ], defaultTimeoutMillis, testEnv);
};

export type InstallExtensionOptions = {
    testDirectories: TestDirectories;
    extensionId: string;
    vsCodeExecutablePath: string;
}

const getCodeCliExecutableRelativePath = (platform: typeof process.platform): string => {
    switch (platform) {
        case 'win32': return '.\\bin\\code.cmd';
        case 'darwin': return '../Resources/app/bin/code';
        default: return './bin/code';
    }
};

export const installExtension = async ({ extensionId, vsCodeExecutablePath, testDirectories }: InstallExtensionOptions): Promise<void> => {
    const codeCliExecutablePath = path.resolve(path.dirname(vsCodeExecutablePath), getCodeCliExecutableRelativePath(process.platform));

    log('info', '🔧 Installing extension:', extensionId);
    log('debug', '📁 VS Code executable path:', vsCodeExecutablePath);
    log('debug', '📁 Code CLI path:', codeCliExecutablePath);
    log('debug', '📁 Extensions dir:', testDirectories.extensions);

    if (!fs.existsSync(codeCliExecutablePath)) {
        log('error', '❌ Code CLI executable not found at:', codeCliExecutablePath);
        throw new Error(`Code CLI executable not found at: ${codeCliExecutablePath}`);
    }

    try {
        const process = spawn(codeCliExecutablePath, [
            `--extensions-dir=${testDirectories.extensions}`,
            `--install-extension=${extensionId}`,
        ], {
            shell: true,
            stdio: 'pipe'
        });

        let stdout = '';
        let stderr = '';

        process.stdout?.on('data', (data: Buffer) => {
            stdout += data.toString();
        });

        process.stderr?.on('data', (data: Buffer) => {
            stderr += data.toString();
        });

        await new Promise((resolve, reject) => {
            process.on('close', (code: number) => {
                if (code === 0) {
                    log('info', `✅ Installed extension ${extensionId} into test environment`);
                    if (stdout) log('debug', 'Output:', stdout);
                    resolve(code);
                } else {
                    log('error', '❌ Failed to install extension. Exit code:', code);
                    if (stderr) log('error', 'Error output:', stderr);
                    reject(new Error(`Extension installation failed with exit code ${code}: ${stderr}`));
                }
            });

            process.on('error', (error: Error) => {
                log('error', '❌ Process error:', error);
                reject(error);
            });
        });
    } catch (error) {
        log('error', '❌ Failed to install extension:', error);
        throw error;
    }
};
