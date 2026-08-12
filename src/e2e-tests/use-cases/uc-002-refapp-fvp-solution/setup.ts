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

import { spawn } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import simpleGit from 'simple-git';
import { log } from '../../utils/logger';

const E2E_DATA_DIRECTORY = path.resolve(__dirname, '..', '..', 'data');
const REPOSITORY_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const PACK_INDEX_URL = 'https://www.keil.com/pack/index.pidx';

export type RequiredPack = {
    source: string;
    agree_embedded_license?: boolean;
    repository?: {
        url: string;
        directory: string;
    };
};

export const installPythonPackages = async (packages: string[]): Promise<void> => {
    if (packages.length === 0) {
        return;
    }

    log('info', `Installing required Python packages: ${packages.join(', ')}`);

    await new Promise<void>((resolve, reject) => {
        const child = spawn('python', ['-m', 'pip', 'install', ...packages], {
            shell: false,
            stdio: 'inherit',
        });

        child.on('error', error => {
            reject(new Error(`Unable to install required Python packages: ${error.message}`));
        });

        child.on('close', exitCode => {
            if (exitCode === 0) {
                resolve();
                return;
            }

            reject(new Error(
                `Installing required Python packages failed with exit code ${exitCode}`,
            ));
        });
    });
};

const resolveCpackgetExecutable = async (): Promise<string> => {
    const executableName = process.platform === 'win32' ? 'cpackget.exe' : 'cpackget';
    const bundledExecutable = path.join(
        REPOSITORY_ROOT,
        'tools',
        'cmsis-toolbox',
        'bin',
        executableName,
    );

    return await fs.pathExists(bundledExecutable) ? bundledExecutable : executableName;
};

const executeCpackget = async (
    executable: string,
    args: string[],
    quiet = false,
): Promise<number | null> => {
    if (!quiet) {
        log('info', `Running cpackget ${args.join(' ')}`);
    }

    return new Promise<number | null>((resolve, reject) => {
        const child = spawn(executable, args, {
            shell: false,
            stdio: quiet ? 'ignore' : 'inherit',
        });

        child.on('error', error => {
            reject(new Error(
                `Unable to run cpackget. Install CMSIS Toolbox or run npm run prepare: ${error.message}`,
            ));
        });

        child.on('close', exitCode => {
            resolve(exitCode);
        });
    });
};

const runCpackget = async (executable: string, args: string[]): Promise<void> => {
    const exitCode = await executeCpackget(executable, args);

    if (exitCode !== 0) {
        throw new Error(`cpackget ${args.join(' ')} failed with exit code ${exitCode}`);
    }
};

const initializePackRoot = async (cpackget: string): Promise<void> => {
    const isInitialized = await executeCpackget(cpackget, ['list', '--quiet'], true) === 0;

    if (!isInitialized) {
        await runCpackget(cpackget, ['init', PACK_INDEX_URL]);
    }

    await runCpackget(cpackget, ['update-index']);
};

const resolvePackSource = async (pack: RequiredPack): Promise<string> => {
    if (!pack.repository) {
        return pack.source;
    }

    const checkoutDirectory = path.join(E2E_DATA_DIRECTORY, pack.repository.directory);
    const packSource = path.join(checkoutDirectory, pack.source);

    if (!await fs.pathExists(packSource)) {
        if (await fs.pathExists(checkoutDirectory)) {
            throw new Error(
                `The pack repository checkout at ${checkoutDirectory} does not contain ${pack.source}`,
            );
        }

        await fs.ensureDir(E2E_DATA_DIRECTORY);
        log('info', `Cloning ${pack.repository.url} into ${checkoutDirectory}`);
        await simpleGit().clone(pack.repository.url, checkoutDirectory, ['--depth', '1']);
    }

    if (!await fs.pathExists(packSource)) {
        throw new Error(`The pack repository does not contain ${packSource}`);
    }

    return packSource;
};

export const setupPacks = async (requiredPacks: RequiredPack[]): Promise<void> => {
    const cpackget = await resolveCpackgetExecutable();
    await initializePackRoot(cpackget);

    for (const pack of requiredPacks) {
        const source = await resolvePackSource(pack);
        const args = ['add', source];

        if (pack.agree_embedded_license) {
            args.push('--agree-embedded-license');
        }

        await runCpackget(cpackget, args);
    }
};
