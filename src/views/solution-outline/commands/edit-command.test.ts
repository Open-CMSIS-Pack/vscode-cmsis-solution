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

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as vscode from 'vscode';
import { EditCommand } from './edit-command';
import { extensionContextFactory } from '../../../vscode-api/extension-context.factories';
import { commandsProviderFactory, MockCommandsProvider } from '../../../vscode-api/commands-provider.factories';
import { COutlineItem } from '../tree-structure/solution-outline-item';

describe('EditCommand', () => {
    let commandsProvider: MockCommandsProvider;
    let tmpDir: string;
    let cprojectPath: string;
    let yamlContent: string;
    let positionAt: jest.Mock;

    beforeEach(() => {
        commandsProvider = commandsProviderFactory();
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edit-command-'));
        cprojectPath = path.join(tmpDir, 'test.cproject.yml');

        yamlContent = `project:
  groups:
    - group: App
      files:
        - file: src/main.c
      groups:
        - group: Drivers
          files:
            - file: drv.c
    components:
        - component: ARM::CMSIS:RTOS2
`;

        fs.writeFileSync(cprojectPath, yamlContent, 'utf8');

        positionAt = jest.fn().mockReturnValue(new vscode.Position(0, 0));
        jest.spyOn(vscode.workspace, 'openTextDocument').mockResolvedValue({ positionAt } as unknown as vscode.TextDocument);
        jest.spyOn(vscode.window, 'showTextDocument').mockResolvedValue({} as vscode.TextEditor);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('registers the edit command on activation', async () => {
        const editCommand = new EditCommand(commandsProvider);

        await editCommand.activate(extensionContextFactory());

        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(
            EditCommand.editCommandId,
            expect.any(Function),
            editCommand,
        );
    });

    it('opens cproject.yml at the selected group entry', async () => {
        const editCommand = new EditCommand(commandsProvider);
        await editCommand.activate(extensionContextFactory());

        const groupNode = new COutlineItem('group');
        groupNode.setAttribute('groupPath', 'App;Drivers');
        groupNode.setAttribute('projectUri', cprojectPath);

        await commandsProvider.mockRunRegistered(EditCommand.editCommandId, groupNode);

        expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith(vscode.Uri.file(cprojectPath));
        expect(positionAt).toHaveBeenCalledTimes(1);
        const actualOffset = positionAt.mock.calls[0][0] as number;
        expect(actualOffset).toBeGreaterThanOrEqual(0);
        expect(yamlContent.slice(actualOffset)).toContain('group: Drivers');
        expect(vscode.window.showTextDocument).toHaveBeenCalled();
    });

    it('opens cproject.yml at the selected file entry', async () => {
        const editCommand = new EditCommand(commandsProvider);
        await editCommand.activate(extensionContextFactory());

        const groupNode = new COutlineItem('group');
        groupNode.setAttribute('groupPath', 'App;Drivers');
        groupNode.setAttribute('projectUri', cprojectPath);

        const fileNode = groupNode.createChild('file');
        fileNode.setAttribute('projectUri', cprojectPath);
        fileNode.setAttribute('fileUri', 'drv.c');

        await commandsProvider.mockRunRegistered(EditCommand.editCommandId, fileNode);

        expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith(vscode.Uri.file(cprojectPath));
        expect(positionAt).toHaveBeenCalledTimes(1);
        const actualOffset = positionAt.mock.calls[0][0] as number;
        expect(actualOffset).toBeGreaterThanOrEqual(0);
        expect(yamlContent.slice(actualOffset)).toContain('file: drv.c');
        expect(vscode.window.showTextDocument).toHaveBeenCalled();
    });

    it('opens cproject.yml at the selected component entry', async () => {
        const editCommand = new EditCommand(commandsProvider);
        await editCommand.activate(extensionContextFactory());

        const componentNode = new COutlineItem('component');
        componentNode.setAttribute('label', 'ARM::CMSIS:RTOS2');
        componentNode.setAttribute('projectUri', cprojectPath);

        await commandsProvider.mockRunRegistered(EditCommand.editCommandId, componentNode);

        expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith(vscode.Uri.file(cprojectPath));
        expect(positionAt).toHaveBeenCalledTimes(1);
        const actualOffset = positionAt.mock.calls[0][0] as number;
        expect(actualOffset).toBeGreaterThanOrEqual(0);
        expect(yamlContent.slice(actualOffset)).toContain('component: ARM::CMSIS:RTOS2');
        expect(vscode.window.showTextDocument).toHaveBeenCalled();
    });

    it('ignores file nodes outside editable groups', async () => {
        const editCommand = new EditCommand(commandsProvider);
        await editCommand.activate(extensionContextFactory());

        const nonEditableNode = new COutlineItem('file');
        nonEditableNode.setAttribute('fileUri', 'out/test.map');

        await commandsProvider.mockRunRegistered(EditCommand.editCommandId, nonEditableNode);

        expect(vscode.workspace.openTextDocument).not.toHaveBeenCalled();
        expect(vscode.window.showTextDocument).not.toHaveBeenCalled();
    });

});
