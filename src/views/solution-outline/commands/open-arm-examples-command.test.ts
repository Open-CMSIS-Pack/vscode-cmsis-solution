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

import { ARM_EXAMPLES_URL, OPEN_ARM_EXAMPLES_COMMAND_ID } from '../../../manifest';
import { openFileExternalFactory } from '../../../open-file-external.factories';
import { commandsProviderFactory, MockCommandsProvider } from '../../../vscode-api/commands-provider.factories';
import { extensionContextFactory } from '../../../vscode-api/extension-context.factories';
import { OpenArmExamplesCommand } from './open-arm-examples-command';

describe('OpenArmExamplesCommand', () => {
    let commandsProvider: MockCommandsProvider;
    let openFileExternal: ReturnType<typeof openFileExternalFactory>;
    let command: OpenArmExamplesCommand;

    beforeEach(() => {
        commandsProvider = commandsProviderFactory();
        openFileExternal = openFileExternalFactory();
        openFileExternal.openFile = jest.fn();
        command = new OpenArmExamplesCommand(commandsProvider, openFileExternal);
    });

    it('registers the command on activation', () => {
        const context = extensionContextFactory();

        command.activate(context);

        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(
            OPEN_ARM_EXAMPLES_COMMAND_ID,
            expect.any(Function)
        );
        expect(context.subscriptions).toHaveLength(1);
    });

    it('opens the Arm examples landing page', async () => {
        command.activate(extensionContextFactory());

        await commandsProvider.mockRunRegistered(OPEN_ARM_EXAMPLES_COMMAND_ID);

        expect(openFileExternal.openFile).toHaveBeenCalledWith(ARM_EXAMPLES_URL);
    });
});
