/**
 * Copyright 2025-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Example Project Management
 *
 * This module manages loading and cloning of CMSIS example projects used
 * in E2E testing. It reads test configuration, clones git repositories,
 * and provides example metadata to test cases.
 *
 * Key responsibilities:
 * - Load example project configuration from test_data.config.json
 * - Clone example repositories from GitHub/remote sources
 * - Provide example metadata (name, contexts, compiler selection)
 * - Skip disabled examples based on configuration
 *
 * Configuration Structure:
 * - examples[]: List of example projects with contexts and flags
 * - repositories[]: Git repository URLs to clone
 * - cloneDirectory: Target directory for cloned repositories
 *
 * Example Configuration:
 * ```json
 * {
 *   "examples": [
 *     {
 *       "name": "Hello",
 *       "contexts": [".Debug+AVH", ".Release+AVH"],
 *       "skipTest": false,
 *       "selectCompiler": false
 *     }
 *   ],
 *   "repositories": ["https://github.com/test-software/Test-Stream"],
 *   "cloneDirectory": "data"
 * }
 * ```
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { log } from './logger';

// ============================================================================
// Types
// ============================================================================

export interface Example {
    name: string;
    contexts: string[];
    skipTest: boolean;
    selectCompiler: boolean;
}

export interface ExampleConfig {
    examples: Example[];
    repositories: string[];
    cloneDirectory: string;
}

// ============================================================================
// Configuration
// ============================================================================

const CONFIG_PATH = path.resolve(__dirname, '../test_data.config.json');

async function loadConfig(filePath: string): Promise<ExampleConfig> {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to read or parse config file: ${errorMessage}`);
    }
}

// ============================================================================
// Load Examples
// ============================================================================

/**
 * Loads example configurations from test_data.config.json
 * @returns Array of example configurations
 */
export function loadExamples(): Example[] {
    try {
        const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const parsed: ExampleConfig = JSON.parse(data);

        if (!Array.isArray(parsed.examples)) {
            throw new Error(
                "Invalid format: 'examples' field is missing or not an array.",
            );
        }

        return parsed.examples;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to load examples: ${message}`);
    }
}

// ============================================================================
// Clone Example Repositories
// ============================================================================

function getRepoNameFromUrl(url: string): string {
    return url.split('/').pop() || 'unknown-repo';
}

async function cloneRepositories(config: ExampleConfig): Promise<void> {
    const git: SimpleGit = simpleGit();
    await fs.ensureDir(config.cloneDirectory);

    for (const repoUrl of config.repositories) {
        const repoName = getRepoNameFromUrl(repoUrl);
        const targetPath = path.join(config.cloneDirectory, repoName);

        if (await fs.pathExists(targetPath)) {
            log('debug', `Skipped cloning "${repoName}", already exists at "${targetPath}"`);
            continue;
        }

        log('debug', `Cloning "${repoUrl}" into "${targetPath}"`);
        try {
            await git.clone(repoUrl, targetPath);
            log('debug', `Successfully cloned "${repoName}"`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            log('error', `Failed to clone "${repoUrl}": "${errorMessage}"`);
        }
    }
}

/**
 * Clones example repositories specified in test_data.config.json
 * Skips repositories that already exist locally
 */
export async function getExampleRepos(): Promise<void> {
    try {
        const config = await loadConfig(CONFIG_PATH);
        await cloneRepositories(config);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        log('error', `"${errorMessage}"`);
        process.exit(1);
    }
}
