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
 * Extension Installation Utilities
 *
 * This module handles installation of VS Code extensions (.vsix files) during
 * E2E test setup.
 *
 * Key responsibilities:
 * - Discover .vsix extension files in project root directory
 * - Install extensions via VS Code CLI (code command)
 * - Cache installed extensions to avoid redundant installations
 * - Handle cross-platform VS Code CLI path differences
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { TestDirectories } from '../infrastructure/test-directories';
import { log } from './logger';

const EXTENSIONS_DIR = path.join(__dirname, '..', '..', '..');

function shouldInclude(file: string): boolean {
    return file.endsWith('.vsix');
}

async function getLocalExtensions(): Promise<string[]> {
    const files = await fs.promises.readdir(EXTENSIONS_DIR);

    return files
        .filter((file) => shouldInclude(file))
        .map((file) => path.join(EXTENSIONS_DIR, file));
}

const getCodeCliExecutableRelativePath = (platform: typeof process.platform): string => {
    switch (platform) {
        case 'win32': return '.\\bin\\code.cmd';
        case 'darwin': return '../Resources/app/bin/code';
        default: return './bin/code';
    }
};

/**
 * Manages VS Code extension installation for testing
 */
export class ExtensionCache {
    constructor(
        private readonly vsCodeExecutablePath: string,
        private readonly testDirectories: TestDirectories
    ) {}

    async installExtension(extensionPathOrId: string): Promise<void> {
        const codeCliExecutablePath = path.resolve(
            path.dirname(this.vsCodeExecutablePath),
            getCodeCliExecutableRelativePath(process.platform)
        );

        log('info', '🔧 Installing extension:', extensionPathOrId);
        log('debug', '📁 VS Code executable path:', this.vsCodeExecutablePath);
        log('debug', '📁 Code CLI path:', codeCliExecutablePath);
        log('debug', '📁 Extensions dir:', this.testDirectories.extensions);

        if (!fs.existsSync(codeCliExecutablePath)) {
            log('error', '❌ Code CLI executable not found at:', codeCliExecutablePath);
            throw new Error(`Code CLI executable not found at: ${codeCliExecutablePath}`);
        }

        try {
            // On Windows, use spawn with shell: true for .cmd files
            const process = spawn(codeCliExecutablePath, [
                `--extensions-dir=${this.testDirectories.extensions}`,
                `--install-extension=${extensionPathOrId}`,
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

            await new Promise<void>((resolve, reject) => {
                process.on('close', (code: number) => {
                    if (code === 0) {
                        log('info', `✅ Installed extension ${extensionPathOrId} into test environment`);
                        if (stdout) log('debug', 'Output:', stdout);
                        resolve();
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
    }
}

let extensionCache: ExtensionCache | undefined;
let extensionCacheParams: { vsCodeExecutablePath: string; testDirectories: TestDirectories } | undefined;

export const buildExtensionCacheWithTestDirectories = (
    vsCodeExecutablePath: string,
    testDirectories: TestDirectories
): ExtensionCache => {
    return new ExtensionCache(vsCodeExecutablePath, testDirectories);
};

export const getExtensionCache = (
    vsCodeExecutablePath: string,
    testDirectories: TestDirectories
): ExtensionCache => {
    if (!extensionCache) {
        extensionCache = buildExtensionCacheWithTestDirectories(vsCodeExecutablePath, testDirectories);
    }
    return extensionCache;
};

/**
 * Initialize the extension cache with VS Code parameters
 * Call this once before using installRequiredExtensions()
 */
export const initializeExtensionCache = (
    vsCodeExecutablePath: string,
    testDirectories: TestDirectories
): void => {
    extensionCacheParams = { vsCodeExecutablePath, testDirectories };
    extensionCache = getExtensionCache(vsCodeExecutablePath, testDirectories);
};

let alreadyInstalled = false;

/**
 * Install required extensions using the initialized cache
 * Must call initializeExtensionCache() first
 */
export const installRequiredExtensions = async (): Promise<void> => {
    if (alreadyInstalled) return;

    if (!extensionCacheParams || !extensionCache) {
        throw new Error('Extension cache not initialized. Call initializeExtensionCache() first.');
    }

    const localExtensions = await getLocalExtensions();

    for (const extensionPath of localExtensions) {
        log('debug', `Installing local extension: ${extensionPath}`);
        await extensionCache.installExtension(extensionPath);
    }

    await extensionCache.installExtension('Arm.keil-studio-pack');
    alreadyInstalled = true;
};

/**
 * Install required extensions with explicit parameters (alternative API)
 */
export const installRequiredExtensionsWithParams = async (
    vsCodeExecutablePath: string,
    testDirectories: TestDirectories
): Promise<void> => {
    if (alreadyInstalled) return;

    const cache = getExtensionCache(vsCodeExecutablePath, testDirectories);
    const localExtensions = await getLocalExtensions();

    for (const extensionPath of localExtensions) {
        log('debug', `Installing local extension: ${extensionPath}`);
        await cache.installExtension(extensionPath);
    }

    await cache.installExtension('Arm.keil-studio-pack');
    alreadyInstalled = true;
};
