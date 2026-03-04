/**
 * Copyright 2024-2026 Arm Limited
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

import type { ExtensionContext } from 'vscode';
import * as manifest from '../manifest';
import fs from 'fs/promises';
import path from 'path';
import semver from 'semver';
import { CommandsProvider } from '../vscode-api/commands-provider';
import { CmsisToolboxManager } from '../solutions/cmsis-toolbox';
import { OutputChannelProvider } from '../vscode-api/output-channel-provider';
import { getCmsisPackRoot } from '../utils/path-utils';

export class PackInstallCommands {
    public static readonly installPackCommandId = `${manifest.PACKAGE_NAME}.installPack`;

    constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly cmsisToolboxManager: CmsisToolboxManager,
        private readonly outputChannelProvider: OutputChannelProvider,
    ) { }

    public async activate(context: ExtensionContext): Promise<void> {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(PackInstallCommands.installPackCommandId, this.handleInstallPack, this),
        );
    }

    private validateInput(vendor: string, name: string, version: string): boolean {
        // validate that 'vendor' and 'name' are not empty and 'version' (if specified) is a valid semantic version
        if (!vendor || !name || (version && !semver.valid(version))) {
            return false;
        }
        return true;
    }

    private async getPackPath(vendor: string, name: string, version: string): Promise<string | undefined> {
        // get the path to the installed pack, if 'version' is not specified find the latest one
        const packRoot = getCmsisPackRoot();
        const packDir = path.join(packRoot, vendor, name);
        const versionDir = version ? version : await this.getLatestVersionDir(packDir);
        return versionDir ? path.join(packDir, versionDir) : undefined;
    }

    private async getLatestVersionDir(packDir: string): Promise<string | undefined> {
        // find the latest semantic version in a given `packDir` directory
        try {
            const latest = semver.maxSatisfying(await fs.readdir(packDir), '>0');
            return latest ? latest : undefined;
        } catch (error) {
            console.error('Failed to read directory', error);
            return undefined;
        }
    }

    private async handleInstallPack(vendor: string, name: string, version: string): Promise<string | undefined> {
        // validate input variables
        if (!this.validateInput(vendor, name, version)) {
            return undefined;
        }
        const outputChannel = this.outputChannelProvider.getOrCreate(manifest.CMSIS_SOLUTION_OUTPUT_CHANNEL);
        // run 'cpackget add -a <vendor>::<name>@<version>', if 'version' is not specified set it 'latest'
        const [result] = await this.cmsisToolboxManager.runCmsisTool(
            'cpackget',
            ['add', '-a', `${vendor}::${name}@${version ? version : 'latest'}`],
            line => outputChannel.appendLine(line.trimEnd())
        );
        // if cpackget finished successfully return path to installed pack, otherwise undefined
        return result === 0 ? await this.getPackPath(vendor, name, version) : undefined;
    }
}
