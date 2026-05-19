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

import { beforeEach, describe, expect, it } from '@jest/globals';
import type * as vscode from 'vscode';
import { OPEN_ENV_VAR_SETTINGS_COMMAND_ID } from '../manifest';
import { commandsProviderFactory, MockCommandsProvider } from '../vscode-api/commands-provider.factories';
import { extensionContextFactory } from '../vscode-api/extension-context.factories';
import { EnvironmentVariablesSettingsCommand } from './env-var-settings-command';

describe('EnvironmentVariablesSettingsCommand', () => {
    let command: EnvironmentVariablesSettingsCommand;
    let commandsProvider: MockCommandsProvider;

    beforeEach(() => {
        jest.clearAllMocks();
        commandsProvider = commandsProviderFactory();
        command = new EnvironmentVariablesSettingsCommand(commandsProvider);
    });

    describe('activation', () => {
        it('registers the open environment variables settings command', async () => {
            const context = extensionContextFactory() as unknown as vscode.ExtensionContext;

            await command.activate(context);

            expect(commandsProvider.registerCommand).toHaveBeenCalledWith(
                OPEN_ENV_VAR_SETTINGS_COMMAND_ID,
                expect.any(Function),
                command,
            );
        });
    });

    describe('command behavior', () => {
        it('opens workspace settings filtered to environment variables setting by default', async () => {
            const context = extensionContextFactory() as unknown as vscode.ExtensionContext;
            await command.activate(context);

            await commandsProvider.mockRunRegistered(OPEN_ENV_VAR_SETTINGS_COMMAND_ID);

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith(
                'workbench.action.openWorkspaceSettings',
                'cmsis-csolution.environmentVariables',
            );
        });

        it('uses a provided setting name when invoked with one', async () => {
            const context = extensionContextFactory() as unknown as vscode.ExtensionContext;
            await command.activate(context);

            await commandsProvider.mockRunRegistered(OPEN_ENV_VAR_SETTINGS_COMMAND_ID, 'cmsis-csolution.someOtherSetting');

            expect(commandsProvider.executeCommand).toHaveBeenCalledWith(
                'workbench.action.openWorkspaceSettings',
                'cmsis-csolution.someOtherSetting',
            );
        });
    });
});
