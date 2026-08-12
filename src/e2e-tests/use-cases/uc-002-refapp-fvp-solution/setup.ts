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

import { spawn } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import simpleGit from 'simple-git';
import { log } from '../../utils/logger';

const E2E_DATA_DIRECTORY = path.resolve(__dirname, '..', '..', 'data');

export type RequiredPack = {
    source: string;
    agree_embedded_license?: boolean;
    repository?: {
        url: string;
        directory: string;
    };
};

const runCpackget = async (args: string[]): Promise<void> => {
    log('info', `Running cpackget ${args.join(' ')}`);

    await new Promise<void>((resolve, reject) => {
        const child = spawn('cpackget', args, {
            shell: false,
            stdio: 'inherit',
        });

        child.on('error', error => {
            reject(new Error(`Unable to run cpackget: ${error.message}`));
        });

        child.on('close', (exitCode, signal) => {
            if (exitCode === 0) {
                resolve();
                return;
            }

            const result = signal ? `signal ${signal}` : `exit code ${exitCode}`;
            reject(new Error(`cpackget ${args.join(' ')} failed with ${result}`));
        });
    });
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
    for (const pack of requiredPacks) {
        const source = await resolvePackSource(pack);
        const args = ['add', source];

        if (pack.agree_embedded_license) {
            args.push('--agree-embedded-license');
        }

        await runCpackget(args);
    }
};
