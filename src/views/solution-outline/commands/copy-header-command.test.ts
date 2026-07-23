/**
 * Copyright 2025-2026 Arm Limited
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

import 'jest';
import * as vscode from 'vscode';
import { commandsProviderFactory } from '../../../vscode-api/commands-provider.factories';
import type { ExtensionContext } from 'vscode';
import { CopyHeaderCommand } from './copy-header-command';
import { COutlineItem } from '../tree-structure/solution-outline-item';

const extensionContextFactory = (): Pick<ExtensionContext, 'subscriptions'> => ({ subscriptions: [] });
describe('CopyHeaderCommand', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

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
        expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
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

    it('copies a component single header without showing a picker', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());
        const componentItem = new COutlineItem('component');
        componentItem.setHeaderChoices([{
            include: 'arm_math.h',
            origins: ['component'],
            resourcePaths: [],
        }]);

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, componentItem);

        expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
        expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith('#include "arm_math.h"\n');
    });

    it('shows a picker and copies the selected component header', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());
        const componentItem = new COutlineItem('component');
        componentItem.setHeaderChoices([
            { include: 'cmsis_os2.h', origins: ['api'], resourcePaths: ['/api/cmsis_os2.h'] },
            { include: 'rtx_os.h', origins: ['component'], resourcePaths: ['/component/rtx_os.h'] },
        ]);
        (vscode.window.showQuickPick as jest.Mock).mockImplementation(async (items) => items[1]);

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, componentItem);

        expect(vscode.window.showQuickPick).toHaveBeenCalledWith([
            expect.objectContaining({ label: 'cmsis_os2.h', description: 'API' }),
            expect.objectContaining({ label: 'rtx_os.h', description: 'Component' }),
        ], {
            placeHolder: 'Select a header to copy',
            matchOnDescription: true,
        });
        expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith('#include "rtx_os.h"\n');
    });

    it('does not change the clipboard when the picker is cancelled', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());
        const componentItem = new COutlineItem('component');
        componentItem.setHeaderChoices([
            { include: 'api.h', origins: ['api'], resourcePaths: [] },
            { include: 'component.h', origins: ['component'], resourcePaths: [] },
        ]);
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, componentItem);

        expect(vscode.window.showQuickPick).toHaveBeenCalledTimes(1);
        expect(vscode.env.clipboard.writeText).not.toHaveBeenCalled();
    });

    it('shows every resource path retained for a grouped include', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());
        const componentItem = new COutlineItem('component');
        componentItem.setHeaderChoices([
            {
                include: 'common.h',
                origins: ['api', 'component'],
                resourcePaths: ['/api/common.h', '/component/common.h'],
            },
            { include: 'other.h', origins: ['component'], resourcePaths: [] },
        ]);
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, componentItem);

        expect(vscode.window.showQuickPick).toHaveBeenCalledWith([
            expect.objectContaining({
                label: 'common.h',
                description: 'API · Component',
                detail: '/api/common.h · /component/common.h',
            }),
            expect.objectContaining({ label: 'other.h', detail: undefined }),
        ], expect.anything());
    });
});
