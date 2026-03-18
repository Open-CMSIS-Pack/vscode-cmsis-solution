/**
 * Copyright 2024-2026 Arm Limited
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

import * as manifest from '../../manifest';
import { CommandsProvider } from '../../vscode-api/commands-provider';
import { ExtensionContext } from 'vscode';
import { SolutionManager } from '../solution-manager';

export interface TargetPackCommand {
    getTargetPack(): Promise<string | undefined>;
}

export class TargetPackCommandImpl implements TargetPackCommand {
    public static readonly COMMAND_ID = `${manifest.PACKAGE_NAME}.getTargetPack`;

    constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly solutionManager: SolutionManager,
    ) {}

    public async activate(context: Pick<ExtensionContext, 'subscriptions'>) {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(TargetPackCommandImpl.COMMAND_ID, this.getTargetPack, this),
        );
    }

    public async getTargetPack(): Promise<string | undefined> {
        return this.solutionManager.getCsolution()?.getDevicePack() ?? '';
    }
}
