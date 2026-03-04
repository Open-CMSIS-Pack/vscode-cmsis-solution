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
import * as path_utils from '../../../utils/path-utils';
import { AddToGroupCommand, addExistingFileOption, addFromCodeTemplateOption, addNewFileOption, addNewGroupOption } from './add-to-group-command';
import { commandsProviderFactory } from '../../../vscode-api/commands-provider.factories';
import { workspaceFsProviderFactory } from '../../../vscode-api/workspace-fs-provider.factories';
import type { ExtensionContext, QuickPickItem } from 'vscode';
import { faker } from '@faker-js/faker';
import { URI } from 'vscode-uri';
import { projectGroupItemDataFactory, projectItemDataFactory } from '../tree-structure/solution-outline-types.factories';
import { MockSolutionManager, solutionManagerFactory } from '../../../solutions/solution-manager.factories';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import * as path from 'path';
import { CSolution } from '../../../solutions/csolution';
import { TestDataHandler } from '../../../__test__/test-data';
import { ETextFileResult } from '../../../generic/text-file';
import { waitTimeout } from '../../../__test__/test-waits';

const vscodeWindowFactory = (): jest.Mocked<Pick<typeof vscode.window,
    'showInputBox' |
    'showQuickPick' |
    'showOpenDialog' |
    'showSaveDialog' |
    'showWarningMessage'
>> => ({
    showInputBox: jest.fn(),
    showOpenDialog: jest.fn(),
    showQuickPick: jest.fn(),
    showSaveDialog: jest.fn(),
    showWarningMessage: jest.fn(),
});

const extensionContextFactory = (): Pick<ExtensionContext, 'subscriptions'> => ({ subscriptions: [] });
const solutionNodeFactory = (): COutlineItem => projectGroupItemDataFactory();
const solutionNodeProjectFactory = (): COutlineItem => projectItemDataFactory();
const commandsProvider = commandsProviderFactory();
const vscodeWindow = vscodeWindowFactory();
const editYamlFile = jest.fn();

describe('AddToGroupCommand command', () => {
    const testDataHandler = new TestDataHandler();
    let tmpSolutionDir: string;
    beforeAll(async () => {
        tmpSolutionDir = testDataHandler.copyTestDataToTmp('solutions');
        jest.spyOn(path_utils, 'getCmsisPackRoot').mockReturnValue('MOCKED_CMSIS_PACK_ROOT');
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });

    it('shows a quick pick with options to add to the group', async () => {
        const workspaceFsProvider = workspaceFsProviderFactory();
        await new AddToGroupCommand(
            workspaceFsProvider,
            commandsProvider,
            solutionManagerFactory(),
            vscodeWindow,
        ).activate(extensionContextFactory());

        vscodeWindow.showQuickPick.mockResolvedValue(undefined);

        await commandsProvider.mockRunRegistered(AddToGroupCommand.addToGroupCommandId, solutionNodeFactory());

        expect(vscodeWindow.showQuickPick).toHaveBeenCalledWith(expect.arrayContaining([
            addNewFileOption,
            addExistingFileOption,
        ]));
    });

    it('does nothing if the user does not select an option', async () => {
        const workspaceFsProvider = workspaceFsProviderFactory();
        await new AddToGroupCommand(
            workspaceFsProvider,
            commandsProvider,
            solutionManagerFactory(),
            vscodeWindow,
        ).activate(extensionContextFactory());

        vscodeWindow.showQuickPick.mockResolvedValue(undefined);

        await commandsProvider.mockRunRegistered(AddToGroupCommand.addToGroupCommandId, solutionNodeFactory());

        expect(workspaceFsProvider.writeUtf8File).not.toHaveBeenCalled();
        expect(vscodeWindow.showOpenDialog).not.toHaveBeenCalled();
        expect(vscodeWindow.showSaveDialog).not.toHaveBeenCalled();
    });

    it('shows a save dialog if the user chooses to add a new file, saving an empty new file and adding it to the group', async () => {
        const workspaceFsProvider = workspaceFsProviderFactory();

        await new AddToGroupCommand(
            workspaceFsProvider,
            commandsProvider,
            solutionManagerFactory(),
            vscodeWindow, editYamlFile,
        ).activate(extensionContextFactory());

        vscodeWindow.showQuickPick.mockResolvedValue(addNewFileOption);
        const newFileUri = URI.file(faker.system.filePath());
        vscodeWindow.showSaveDialog.mockResolvedValue(newFileUri);

        const solutionNode = solutionNodeFactory();
        await commandsProvider.mockRunRegistered(AddToGroupCommand.addToGroupCommandId, solutionNode);

        expect(vscodeWindow.showSaveDialog).toHaveBeenCalled();
        expect(workspaceFsProvider.writeUtf8File).toHaveBeenCalledWith(newFileUri.fsPath, '');

        const projectUriString = solutionNode.getAttribute('projectUri') ?? '';
        const projectUri = URI.file(projectUriString);

        expect(editYamlFile).toHaveBeenCalledWith(
            workspaceFsProvider,
            projectUri,
            expect.any(Array),
        );
    });

    it('shows an open dialog if the user chooses to add an existing file and adding it to the group', async () => {
        const workspaceFsProvider = workspaceFsProviderFactory();

        await new AddToGroupCommand(
            workspaceFsProvider,
            commandsProvider,
            solutionManagerFactory(),
            vscodeWindow, editYamlFile,
        ).activate(extensionContextFactory());

        vscodeWindow.showQuickPick.mockResolvedValue(addExistingFileOption);
        const existingFileUri = URI.file(faker.system.filePath());
        vscodeWindow.showOpenDialog.mockResolvedValue([existingFileUri]);

        const solutionNode = solutionNodeFactory();
        await commandsProvider.mockRunRegistered(AddToGroupCommand.addToGroupCommandId, solutionNode);

        expect(vscodeWindow.showOpenDialog).toHaveBeenCalled();

        const projectUriString = solutionNode.getAttribute('projectUri') ?? '';
        const projectUri = URI.file(projectUriString);

        expect(editYamlFile).toHaveBeenCalledWith(
            workspaceFsProvider,
            projectUri,
            expect.any(Array),
        );
    });

    it('adds multiple files to the group when user selects several files in open dialog', async () => {
        const workspaceFsProvider = workspaceFsProviderFactory();

        await new AddToGroupCommand(
            workspaceFsProvider,
            commandsProvider,
            solutionManagerFactory(),
            vscodeWindow, editYamlFile,
        ).activate(extensionContextFactory());

        vscodeWindow.showQuickPick.mockResolvedValue(addExistingFileOption);
        const fileUris = [URI.file(faker.system.filePath()), URI.file(faker.system.filePath()), URI.file(faker.system.filePath())];
        vscodeWindow.showOpenDialog.mockResolvedValue(fileUris);

        const solutionNode = solutionNodeFactory();
        await commandsProvider.mockRunRegistered(AddToGroupCommand.addToGroupCommandId, solutionNode);

        expect(vscodeWindow.showOpenDialog).toHaveBeenCalled();

        const projectUriString = solutionNode.getAttribute('projectUri') ?? '';
        const projectUri = URI.file(projectUriString);

        expect(editYamlFile).toHaveBeenCalledWith(
            workspaceFsProvider,
            projectUri,
            expect.any(Array),
        );
    });

    it('shows an input box if the user chooses to add a group (subgroup) to project group or to layer group', async () => {
        const workspaceFsProvider = workspaceFsProviderFactory();

        await new AddToGroupCommand(
            workspaceFsProvider,
            commandsProvider,
            solutionManagerFactory(),
            vscodeWindow, editYamlFile,
        ).activate(extensionContextFactory());

        vscodeWindow.showQuickPick.mockResolvedValue(addNewGroupOption);
        vscodeWindow.showInputBox.mockResolvedValue('New subgroup');

        const solutionNode = solutionNodeFactory();
        await commandsProvider.mockRunRegistered(AddToGroupCommand.addToGroupCommandId, solutionNode);
        expect(vscodeWindow.showInputBox).toHaveBeenCalled();

    });

    it('shows an input box if the user chooses to add a group to project', async () => {
        const workspaceFsProvider = workspaceFsProviderFactory();

        await new AddToGroupCommand(
            workspaceFsProvider,
            commandsProvider,
            solutionManagerFactory(),
            vscodeWindow, editYamlFile,
        ).activate(extensionContextFactory());

        vscodeWindow.showQuickPick.mockResolvedValue(addNewGroupOption);
        vscodeWindow.showInputBox.mockResolvedValue('New group');

        const solutionNode = solutionNodeProjectFactory();
        await commandsProvider.mockRunRegistered(AddToGroupCommand.addToGroupCommandId, solutionNode);
        expect(vscodeWindow.showInputBox).toHaveBeenCalled();

    });

    it('shows a quick pick with available templates if the user chooses to use a user code template', async () => {
        const workspaceFsProvider = workspaceFsProviderFactory();

        // load csolution file
        const fileName = path.join(tmpSolutionDir, 'USBD', 'USB_Device.csolution.yml');
        const csolution = new CSolution();

        const loadResult = await csolution.load(fileName);
        expect(loadResult).toEqual(ETextFileResult.Success);

        // mock solutionManager to return the loaded CSolution and set loadState.solutionPath
        const solutionManager: MockSolutionManager = solutionManagerFactory();
        solutionManager.getCsolution.mockReturnValue(csolution);
        // Set loadState to mimic an active state
        Object.defineProperty(solutionManager, 'loadState', {
            get: () => ({ solutionPath: fileName }),
        });

        await new AddToGroupCommand(
            workspaceFsProvider,
            commandsProvider,
            solutionManager,
            vscodeWindow, editYamlFile,
        ).activate(extensionContextFactory());

        vscodeWindow.showQuickPick.mockResolvedValue(addFromCodeTemplateOption);
        vscodeWindow.showInputBox.mockResolvedValue('Add From Component Code Template');

        const groupNode = new COutlineItem('group');
        groupNode.setTag('group');
        groupNode.setAttribute('type', 'group');
        groupNode.setAttribute('label', 'USB');
        groupNode.setAttribute('groupPath', 'USB');
        groupNode.setAttribute('projectUri', 'USBD/HID/HID.cproject.yml');


        vscodeWindow.showQuickPick
            .mockResolvedValueOnce(addFromCodeTemplateOption)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .mockImplementation((async (input: Promise<readonly QuickPickItem[]>) => (await input)[0]) as any);

        await commandsProvider.mockRunRegistered(AddToGroupCommand.addToGroupCommandId, groupNode);
        await waitTimeout();


        const quickPickItemPromise = vscodeWindow.showQuickPick.mock.calls[1][0] as Promise<QuickPickItem[]>;
        const quickPickItems = await quickPickItemPromise;

        expect(quickPickItems).toBeDefined();

        // case 1: maxInstances is 1, then no "_0" index should be added to the filename
        expect(quickPickItems).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ description: 'STDERR User Template', label: 'ARM::CMSIS-Compiler:STDERR:Custom' }),
            ])
        );

        // case 2: maxInstances > 1 then even if instances = 1 "_0" index must added to the filename
        expect(quickPickItems).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ description: 'USB Device HID (Human Interface Device) [0]', label: 'Keil::USB&MDK:Device:HID' }),
            ])
        );

        expect(quickPickItems).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ description: 'USB Device HID (Human Interface Device) [1]', label: 'Keil::USB&MDK:Device:HID' }),
            ])
        );

        expect(quickPickItems).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ description: 'USB Device HID Mouse [0]', label: 'Keil::USB&MDK:Device:HID' }),
            ])
        );

        expect(quickPickItems).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ description: 'USB Device HID Mouse [1]', label: 'Keil::USB&MDK:Device:HID' }),
            ])
        );

    });

    it('should avoid adding duplicate files and show error message', async () => {
        const workspaceFsProvider = workspaceFsProviderFactory();
        const mockShowErrorMessage = jest.spyOn(vscode.window, 'showErrorMessage').mockResolvedValue(undefined);
        const existingFilePath = path.join('src', 'existing', 'file.c');

        const mockRoot = new COutlineItem('root');
        const mockProject = mockRoot.createChild('project');
        mockProject.setTag('project');

        const mockExistingGroup = mockProject.createChild('existingGroup');
        mockExistingGroup.setTag('group');
        mockExistingGroup.setAttribute('label', 'Source Files');

        const existingFileUri = URI.file(path.resolve(existingFilePath));

        const mockExistingFileNode = mockExistingGroup.createChild('file');
        mockExistingFileNode.setTag('file');
        mockExistingFileNode.setAttribute('resourcePath', existingFileUri.fsPath);

        await new AddToGroupCommand(
            workspaceFsProvider,
            commandsProvider,
            solutionManagerFactory(),
            vscodeWindow,
            editYamlFile,
        ).activate(extensionContextFactory());

        const mockTargetGroup = mockProject.createChild('targetGroup');
        mockTargetGroup.setTag('group');
        mockTargetGroup.setAttribute('label', 'Test Group');
        mockTargetGroup.setAttribute('type', 'group');
        mockTargetGroup.setAttribute('projectUri', path.join('project', 'test.cproject.yml'));

        vscodeWindow.showQuickPick.mockResolvedValue(addExistingFileOption);

        vscodeWindow.showOpenDialog.mockResolvedValue([existingFileUri]);

        await commandsProvider.mockRunRegistered(AddToGroupCommand.addToGroupCommandId, mockTargetGroup);

        expect(mockShowErrorMessage).toHaveBeenCalledWith(
            'The following file(s) cannot be added:',
            expect.objectContaining({
                modal: true,
                detail: expect.stringContaining('• "file.c" already exists in the group "Source Files"')
            })
        );

        expect(editYamlFile).not.toHaveBeenCalled();

        mockShowErrorMessage.mockRestore();
    });

    it('should add only non-duplicate files when some files are duplicates', async () => {
        const workspaceFsProvider = workspaceFsProviderFactory();

        const mockShowErrorMessage = jest.spyOn(vscode.window, 'showErrorMessage').mockResolvedValue(undefined);

        const existingFilePath = path.join('src', 'existing', 'file.c');
        const newFilePath = path.join('src', 'new', 'file.c');

        const mockRoot = new COutlineItem('root');
        const mockProject = mockRoot.createChild('project');
        mockProject.setTag('project');

        const mockExistingGroup = mockProject.createChild('existingGroup');
        mockExistingGroup.setTag('group');
        mockExistingGroup.setAttribute('label', 'Source Files');

        const existingFileUri = URI.file(path.resolve(existingFilePath));
        const newFileUri = URI.file(path.resolve(newFilePath));

        const mockExistingFileNode = mockExistingGroup.createChild('file');
        mockExistingFileNode.setTag('file');
        mockExistingFileNode.setAttribute('resourcePath', existingFileUri.fsPath);

        await new AddToGroupCommand(
            workspaceFsProvider,
            commandsProvider,
            solutionManagerFactory(),
            vscodeWindow,
            editYamlFile,
        ).activate(extensionContextFactory());

        const mockTargetGroup = mockProject.createChild('targetGroup');
        mockTargetGroup.setTag('group');
        mockTargetGroup.setAttribute('label', 'Test Group');
        mockTargetGroup.setAttribute('type', 'group');
        mockTargetGroup.setAttribute('projectUri', path.join('project', 'test.cproject.yml'));

        vscodeWindow.showQuickPick.mockResolvedValue(addExistingFileOption);

        vscodeWindow.showOpenDialog.mockResolvedValue([
            existingFileUri,
            newFileUri
        ]);

        await commandsProvider.mockRunRegistered(AddToGroupCommand.addToGroupCommandId, mockTargetGroup);

        expect(mockShowErrorMessage).toHaveBeenCalledWith(
            'The following file(s) cannot be added:',
            expect.objectContaining({
                modal: true,
                detail: expect.stringContaining('• "file.c" already exists in the group "Source Files"'),
            })
        );

        expect(editYamlFile).toHaveBeenCalledTimes(1);

        mockShowErrorMessage.mockRestore();
    });
});
