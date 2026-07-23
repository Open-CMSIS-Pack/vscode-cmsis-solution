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

import { ExtensionContext } from 'vscode';
import { ARM_EXAMPLES_URL, OPEN_ARM_EXAMPLES_COMMAND_ID } from '../../../manifest';
import { IOpenFileExternal } from '../../../open-file-external-if';
import { CommandsProvider } from '../../../vscode-api/commands-provider';

export class OpenArmExamplesCommand {
    constructor(
        private readonly commandsProvider: CommandsProvider,
        private readonly openFileExternal: IOpenFileExternal,
    ) { }

    public activate(context: Pick<ExtensionContext, 'subscriptions'>): void {
        context.subscriptions.push(
            this.commandsProvider.registerCommand(OPEN_ARM_EXAMPLES_COMMAND_ID, () => {
                this.openFileExternal.openFile(ARM_EXAMPLES_URL);
            })
        );
    }
}
