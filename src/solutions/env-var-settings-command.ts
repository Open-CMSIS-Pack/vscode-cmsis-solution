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

import type { ExtensionContext } from 'vscode';
import { CONFIG_ENVIRONMENT_VARIABLES, OPEN_ENV_VAR_SETTINGS_COMMAND_ID, PACKAGE_NAME } from '../manifest';
import type { CommandsProvider } from '../vscode-api/commands-provider';

export class EnvironmentVariablesSettingsCommand {
    private readonly settingName = `${PACKAGE_NAME}.${CONFIG_ENVIRONMENT_VARIABLES}`;

    constructor(private readonly commandsProvider: CommandsProvider) {
    }

    public async activate(context: Pick<ExtensionContext, 'subscriptions'>): Promise<void> {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(
                OPEN_ENV_VAR_SETTINGS_COMMAND_ID,
                this.openWorkspaceSettings,
                this,
            ),
        );
    }

    private async openWorkspaceSettings(settingName?: unknown): Promise<void> {
        const query = typeof settingName === 'string' && settingName.length > 0 ? settingName : this.settingName;
        await this.commandsProvider.executeCommand('workbench.action.openWorkspaceSettings', query);
    }
}
