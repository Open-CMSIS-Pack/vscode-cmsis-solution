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

import 'jest';
import * as vscode from 'vscode';
import { commandsProviderFactory } from '../../../vscode-api/commands-provider.factories';
import type { ExtensionContext } from 'vscode';
import { CopyHeaderCommand } from './copy-header-command';
import { COutlineItem } from '../tree-structure/solution-outline-item';

const extensionContextFactory = (): Pick<ExtensionContext, 'subscriptions'> => ({ subscriptions: [] });
describe('CopyHeaderCommand', () => {
    it('copy header file to clipboard', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());

        const fileItem = new COutlineItem('file');
        fileItem.setAttribute('label', 'header.h');
        fileItem.addFeature('header');
        fileItem.setAttribute('type', 'headerFile');
        fileItem.setAttribute('resourcePath', '/path/to/header.h');

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, fileItem);
        expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith('#include "header.h"\n');
    });

    it('do not copy project files to clipboard', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());

        const fileItem = new COutlineItem('file');
        fileItem.setAttribute('label', 'header');
        fileItem.setAttribute('type', 'projectFile');
        fileItem.setAttribute('resourcePath', '/path/to/main.c');

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, fileItem);
        expect(vscode.env.clipboard.writeText).not.toHaveBeenCalled();
    });
});
