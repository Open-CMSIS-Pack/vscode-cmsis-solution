#!npx tsx

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

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { parse as parseSemver } from 'semver';

const argv = process.argv.slice(2);

function isOddMinorVersion(version: string): boolean {
    const parsedVersion = parseSemver(version);

    if (!parsedVersion) {
        throw new Error(`Invalid package version: ${version}`);
    }

    return parsedVersion.minor % 2 === 1;
}

// default target: host OS and architecture
let target = `${os.platform()}-${os.arch()}`;

const targetFlag = argv.findIndex(arg => arg == '--target' || arg == '-t');
if (targetFlag !== -1) {
    target = argv[targetFlag + 1];
} else {
    argv.push('--target', target);
}

// copy pre-downloaded node-pty for the target platform
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as { version?: string };
const version = packageJson.version;

if (!version) {
    throw new Error(`Missing version in ${packageJsonPath}`);
}

if (isOddMinorVersion(version) && !argv.includes('--pre-release')) {
    argv.push('--pre-release');
}

const src = path.resolve(__dirname, '..','tools', 'node-pty');
if (fs.existsSync(src)) {
    const dst = path.resolve(__dirname, '..', 'node_modules', '@lydell');
    // clean existing platform specific node-pty-*
    glob.sync(`${dst}/node-pty-*`).forEach(path => {
        fs.rmSync(path, { recursive: true, force: true });
    });
    // move the pre-downloaded node-pty for the target platform
    fs.cpSync(src, `${dst}/node-pty-${target}`, { recursive: true });
    fs.rmSync(src, { recursive: true, force: true });
}

// package the extension for the target platform
const command = `vsce package ${argv.join(' ')}`;
console.log(`Running command: ${command}`);
execSync(command, { stdio: 'inherit' });
