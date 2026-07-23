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

function addHeader(
    component: COutlineItem,
    include: string,
    origin: 'api' | 'component',
    resourcePath?: string,
): COutlineItem {
    const header = component.createChild('file');
    header.setAttribute('header', include);
    header.setAttribute('description', origin === 'api' ? ' (API)' : undefined);
    header.setAttribute('resourcePath', resourcePath);
    return header;
}

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
        addHeader(componentItem, 'arm_math.h', 'component');

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, componentItem);

        expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
        expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith('#include "arm_math.h"\n');
    });

    it('shows a picker and copies the selected component header', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());
        const componentItem = new COutlineItem('component');
        addHeader(componentItem, 'cmsis_os2.h', 'api', '/api/cmsis_os2.h');
        addHeader(componentItem, 'rtx_os.h', 'component', '/component/rtx_os.h');
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
        addHeader(componentItem, 'api.h', 'api');
        addHeader(componentItem, 'component.h', 'component');
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, componentItem);

        expect(vscode.window.showQuickPick).toHaveBeenCalledTimes(1);
        expect(vscode.env.clipboard.writeText).not.toHaveBeenCalled();
    });

    it('shows every resource path retained for a grouped include', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());
        const componentItem = new COutlineItem('component');
        addHeader(componentItem, 'common.h', 'api', '/api/common.h');
        addHeader(componentItem, 'common.h', 'component', '/component/common.h');
        addHeader(componentItem, 'other.h', 'component');
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

    it('preserves the order of headers with the same priority', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());
        const componentItem = new COutlineItem('component');
        addHeader(componentItem, 'z_api.h', 'api');
        addHeader(componentItem, 'a_api.h', 'api');
        addHeader(componentItem, 'component.h', 'component');
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, componentItem);

        expect(vscode.window.showQuickPick).toHaveBeenCalledWith([
            expect.objectContaining({ label: 'z_api.h' }),
            expect.objectContaining({ label: 'a_api.h' }),
            expect.objectContaining({ label: 'component.h' }),
        ], expect.anything());
    });

    it('retains distinct paths when one origin contributes the same include', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());
        const componentItem = new COutlineItem('component');
        addHeader(componentItem, 'common.h', 'component', '/first/common.h');
        addHeader(componentItem, 'common.h', 'component', '/second/common.h');
        addHeader(componentItem, 'other.h', 'component');
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, componentItem);

        expect(vscode.window.showQuickPick).toHaveBeenCalledWith([
            expect.objectContaining({
                label: 'common.h',
                detail: '/first/common.h · /second/common.h',
            }),
            expect.objectContaining({ label: 'other.h' }),
        ], expect.anything());
    });

    it('keeps equal basenames with different include expressions separate', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());
        const componentItem = new COutlineItem('component');
        addHeader(componentItem, 'api/common.h', 'api');
        addHeader(componentItem, 'component/common.h', 'component');
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, componentItem);

        expect(vscode.window.showQuickPick).toHaveBeenCalledWith([
            expect.objectContaining({ label: 'api/common.h' }),
            expect.objectContaining({ label: 'component/common.h' }),
        ], expect.anything());
    });
});
