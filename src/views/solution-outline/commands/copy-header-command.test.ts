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
const componentName = 'ARM::CMSIS:CORE';

function addHeader(
    component: COutlineItem,
    include: string,
    origin: 'api' | 'component',
    resourcePath?: string,
): COutlineItem {
    if (!component.getAttribute('label')) {
        component.setAttribute('label', componentName);
    }
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
        expect(vscode.env.clipboard.writeText)
            .toHaveBeenCalledWith('#include "arm_math.h"                    // ARM::CMSIS:CORE\n');
    });

    it('reuses the complete component identifier without rebuilding it', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());
        const componentItem = new COutlineItem('component');
        const fullComponentId = 'Vendor::Class&Bundle:Group:Sub&Variant@>=1.2.3';
        componentItem.setAttribute('label', fullComponentId);
        addHeader(componentItem, 'header.h', 'component');

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, componentItem);

        expect(vscode.env.clipboard.writeText)
            .toHaveBeenCalledWith(`#include "header.h"                      // ${fullComponentId}\n`);
    });

    it('uses the implementing component name when an API header is copied directly', async () => {
        const commandsProvider = commandsProviderFactory();
        await new CopyHeaderCommand(commandsProvider).activate(extensionContextFactory());
        const componentItem = new COutlineItem('component');
        const apiHeader = addHeader(componentItem, 'cmsis_os2.h', 'api');

        await commandsProvider.mockRunRegistered(CopyHeaderCommand.copyHeaderCommandId, apiHeader);

        expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
        expect(vscode.env.clipboard.writeText)
            .toHaveBeenCalledWith('#include "cmsis_os2.h"                   // ARM::CMSIS:CORE\n');
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
            expect.objectContaining({
                label: '#include "cmsis_os2.h" // ARM::CMSIS:CORE',
            }),
            expect.objectContaining({
                label: '#include "rtx_os.h" // ARM::CMSIS:CORE',
            }),
        ], {
            placeHolder: 'Select a header to copy',
        });
        const quickPickItems = (vscode.window.showQuickPick as jest.Mock).mock.calls[0][0];
        quickPickItems.forEach((item: vscode.QuickPickItem) => {
            expect(item).not.toHaveProperty('description');
            expect(item).not.toHaveProperty('detail');
        });
        expect(vscode.env.clipboard.writeText)
            .toHaveBeenCalledWith('#include "rtx_os.h"                      // ARM::CMSIS:CORE\n');
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

    it('groups duplicate includes without displaying resource paths or origins', async () => {
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
                label: '#include "common.h" // ARM::CMSIS:CORE',
            }),
            expect.objectContaining({
                label: '#include "other.h" // ARM::CMSIS:CORE',
            }),
        ], expect.anything());
        const quickPickItems = (vscode.window.showQuickPick as jest.Mock).mock.calls[0][0];
        quickPickItems.forEach((item: vscode.QuickPickItem) => {
            expect(item).not.toHaveProperty('description');
            expect(item).not.toHaveProperty('detail');
        });
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
            expect.objectContaining({ label: '#include "z_api.h" // ARM::CMSIS:CORE' }),
            expect.objectContaining({ label: '#include "a_api.h" // ARM::CMSIS:CORE' }),
            expect.objectContaining({ label: '#include "component.h" // ARM::CMSIS:CORE' }),
        ], expect.anything());
    });

    it('groups duplicate includes from distinct resource paths', async () => {
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
                label: '#include "common.h" // ARM::CMSIS:CORE',
            }),
            expect.objectContaining({ label: '#include "other.h" // ARM::CMSIS:CORE' }),
        ], expect.anything());
        const quickPickItems = (vscode.window.showQuickPick as jest.Mock).mock.calls[0][0];
        quickPickItems.forEach((item: vscode.QuickPickItem) => {
            expect(item).not.toHaveProperty('detail');
        });
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
            expect.objectContaining({ label: '#include "api/common.h" // ARM::CMSIS:CORE' }),
            expect.objectContaining({ label: '#include "component/common.h" // ARM::CMSIS:CORE' }),
        ], expect.anything());
    });
});
