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

import { TestDataHandler } from '../../../__test__/test-data';
import { DeleteCommand } from './delete-command';
import { commandsProviderFactory } from '../../../vscode-api/commands-provider.factories';
import { workspaceFsProviderFactory } from '../../../vscode-api/workspace-fs-provider.factories';
import { ExtensionContext } from 'vscode';
import path from 'node:path';
import * as fs from 'fs';
import { parseYamlToCTreeItem } from '../../../generic/tree-item-yaml-parser';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import * as vscode from 'vscode';

jest.mock('vscode', () => ({
    window: {
        showWarningMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn(),
    },
    Uri: {
        file: (path: string) => ({ fsPath: path })
    },
    workspace: {
        fs: {
            delete: jest.fn() // we'll override this in the test
        }
    },
}));

const extensionContextFactory = (): Pick<ExtensionContext, 'subscriptions'> => ({ subscriptions: [] });

describe('DeleteCommand', () => {
    let deleteCommand: DeleteCommand;
    const commandsProvider = commandsProviderFactory();
    const workspaceFsProvider = workspaceFsProviderFactory();
    const testDataHandler = new TestDataHandler();
    let tmpSolutionDir: string;
    beforeAll(async () => {
        tmpSolutionDir = testDataHandler.copyTestDataToTmp('solutions');
        deleteCommand = new DeleteCommand(commandsProvider, workspaceFsProvider);
    });

    afterAll(async () => {
        testDataHandler.dispose();
    });

    it('should register remove command on activation', async () => {
        const newDeleteCommand = new DeleteCommand(commandsProvider, workspaceFsProviderFactory());
        await newDeleteCommand.activate(extensionContextFactory());
        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(
            DeleteCommand.removeCommandId,
            expect.any(Function),
            newDeleteCommand
        );
    });

    it('removes a file from yaml and writes updated file', async () => {
        const projectPath = path.join(tmpSolutionDir, 'USBD', 'HID', 'HID.cproject.yml');

        const solutionNode = new COutlineItem('file');
        solutionNode.setAttribute('label', 'USBD_User_HID_0.c');
        solutionNode.setAttribute('tag', 'file');
        solutionNode.setAttribute('resourcePath', path.join(tmpSolutionDir, 'USBD', 'HID', 'USBD_User_HID_0.c'));

        await (deleteCommand).delete(true, solutionNode, 'USBD_User_HID_0.c', true);

        const cprojectContent = fs.readFileSync(projectPath, 'utf8');
        const root = await parseYamlToCTreeItem(cprojectContent);
        expect(root).toBeDefined();
        const topChild = root?.getChild();
        root!.rootFileName = projectPath;

        const children = topChild?.getChildren();
        const groups = children?.[2];
        const groupItems = groups?.getChildren();

        const want: string[] = ['README.md', 'HID.c', '$OutDir()$/testOutput.test'];
        const got: string[] = [];
        if (groupItems) {
            for (const gi of groupItems) {
                const children = gi.getChildren();
                const fs = children[1];
                const fs1 = fs.getGrandChildren();
                for (const f of fs1) {
                    const fileName = f.getText();
                    got.push(fileName ?? '');
                }
            }
        }
        expect(got).toEqual(want);
    });

    it('does not remove a file from yaml if file deletion fails', async () => {
        const projectPath = path.join(tmpSolutionDir, 'USBD', 'HID', 'HID.cproject.yml');

        const solutionNode = new COutlineItem('file');
        solutionNode.setAttribute('label', 'README.md');
        solutionNode.setAttribute('tag', 'file');
        solutionNode.setAttribute('resourcePath', path.join(tmpSolutionDir, 'USBD', 'HID', 'README.md'));
        solutionNode.setAttribute('projectUri', projectPath);

        jest.spyOn(vscode.workspace.fs, 'delete').mockImplementation(() => {
            throw new Error('Simulated deletion failure');
        });

        await deleteCommand.delete(true, solutionNode, 'README.md', true);

        const cprojectContent = fs.readFileSync(projectPath, 'utf8');
        const root = await parseYamlToCTreeItem(cprojectContent);
        const topChild = root?.getChild();
        root!.rootFileName = projectPath;

        const children = topChild?.getChildren();
        const groups = children?.[2];
        const groupItems = groups?.getChildren();

        const got: string[] = [];
        if (groupItems) {
            for (const gi of groupItems) {
                const children = gi.getChildren();
                const fs = children[1];
                const fs1 = fs.getGrandChildren();
                for (const f of fs1) {
                    const fileName = f.getText();
                    got.push(fileName ?? '');
                }
            }
        }

        expect(got).toContain('README.md');
    });

    it('should prompt for deletion confirmation when removing a file', async () => {
        const projectPath = path.join(tmpSolutionDir, 'USBD', 'HID', 'HID.cproject.yml');
        const solutionNode = new COutlineItem('file');
        solutionNode.setAttribute('label', 'USBD_User_HID_0.c');
        solutionNode.setAttribute('tag', 'file');
        solutionNode.setAttribute('resourcePath', projectPath);
        solutionNode.setAttribute('projectUri', projectPath);

        const deleteCommand = new DeleteCommand(commandsProvider, workspaceFsProviderFactory());
        deleteCommand.confirmDeletion(solutionNode);

        expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
            'Choose Remove to remove \'USBD_User_HID_0.c\' from \'HID.cproject.yml\'\n\nChoose Delete to permanently delete \'USBD_User_HID_0.c\'',
            { modal: true, detail: 'You can restore deleted file from the Recycle Bin.' },
            'Remove', 'Delete'
        );
    });

    it('removes a group from yaml and writes updated file', async () => {
        const projectPath = path.join(tmpSolutionDir, 'USBD', 'HID', 'HID.cproject.yml');
        const solutionNode = new COutlineItem('group');

        solutionNode.setAttribute('label', 'USB');
        solutionNode.setAttribute('type', 'group');
        solutionNode.setAttribute('tag', 'group');
        solutionNode.setAttribute('groupPath', 'USB');
        solutionNode.setAttribute('projectUri', projectPath);

        // Create a delete command with properly mocked file system provider
        const mockWorkspaceFs = workspaceFsProviderFactory();
        mockWorkspaceFs.readUtf8File.mockImplementation((filePath: string) => {
            return Promise.resolve(fs.readFileSync(filePath, 'utf8'));
        });
        mockWorkspaceFs.writeUtf8File.mockImplementation((filePath: string, content: string) => {
            fs.writeFileSync(filePath, content, 'utf8');
            return Promise.resolve();
        });

        const testDeleteCommand = new DeleteCommand(commandsProvider, mockWorkspaceFs);
        await testDeleteCommand.delete(false, solutionNode, 'USB', true);

        const cprojectContent = fs.readFileSync(projectPath, 'utf8');
        const root = await parseYamlToCTreeItem(cprojectContent);
        const topChild = root?.getChild();
        root!.rootFileName = projectPath;

        const children = topChild?.getChildren();
        const groups = children?.[2];
        const groupItems = groups?.getChildren();

        const want: string[] = ['Documentation', 'AccessSequencesTest'];
        const got: string[] = [];
        if (groupItems) {
            for (const gi of groupItems) {
                const children = gi.getChildren();
                const gps = children[0];
                const groupName = gps.getText();
                got.push(groupName ?? '');
            }
        }
        expect(got).toEqual(want);
    });

    it('fails to remove group and returns false if an error occurs', async () => {
        const projectPath = path.join(tmpSolutionDir, 'USBD', 'HID', 'HID.cproject.yml');
        const solutionNode = new COutlineItem('group');
        solutionNode.setAttribute('label', 'Documentation');
        solutionNode.setAttribute('type', 'group');
        solutionNode.setAttribute('tag', 'group');
        solutionNode.setAttribute('groupPath', 'Documentation');
        solutionNode.setAttribute('projectUri', projectPath);

        const dc = deleteCommand as DeleteCommand;

        jest.spyOn(dc, 'deletePhysicalGroupFiles' as keyof DeleteCommand)
            .mockImplementation(() => {
                throw new Error('Simulated failure inside deletePhysicalGroupFiles');
            });

        await dc.delete(false, solutionNode, 'USB', true);

        const cprojectContent = fs.readFileSync(projectPath, 'utf8');
        const root = await parseYamlToCTreeItem(cprojectContent);
        const topChild = root?.getChild();
        root!.rootFileName = projectPath;

        const children = topChild?.getChildren();
        const groups = children?.[2];
        const groupItems = groups?.getChildren();

        const got: string[] = [];
        if (groupItems) {
            for (const gi of groupItems) {
                const children = gi.getChildren();
                const gps = children[0];
                const groupName = gps.getText();
                got.push(groupName ?? '');
            }
        }

        expect(got).toContain('Documentation');
    });

    it('should prompt for confirmation when removing a group', async () => {
        const projectPath = path.join(tmpSolutionDir, 'USBD', 'HID', 'HID.cproject.yml');

        const solutionNode = new COutlineItem('group');
        solutionNode.setAttribute('label', 'USB');
        solutionNode.setAttribute('type', 'group');
        solutionNode.setAttribute('tag', 'group');
        solutionNode.setAttribute('groupPath', 'USB');
        solutionNode.setAttribute('projectUri', projectPath);

        const deleteCommand = new DeleteCommand(commandsProvider, workspaceFsProviderFactory());
        deleteCommand.confirmDeletion(solutionNode);

        expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
            'Choose Remove to remove \'USB\' and all its content from \'HID.cproject.yml\'\n\nChoose Delete to permanently delete \'USB\' and all its content',
            { modal: true, detail: 'You can restore deleted files from the Recycle Bin.' },
            'Remove', 'Delete'
        );
    });

    it('removes a nested group from YAML and updates the structure', async () => {
        const projectPath = path.join(tmpSolutionDir, 'USBD', 'HID', 'HID.cproject.yml');

        const solutionNode = new COutlineItem('group');
        solutionNode.setAttribute('label', 'Documentation');
        solutionNode.setAttribute('type', 'group');
        solutionNode.setAttribute('tag', 'group');
        solutionNode.setAttribute('groupPath', 'Documentation');
        solutionNode.setAttribute('projectUri', projectPath);

        const childGroup = solutionNode.createChild('group');
        childGroup.setAttribute('label', 'subDoc');
        childGroup.setAttribute('type', 'group');
        childGroup.setAttribute('tag', 'group');
        childGroup.setAttribute('groupPath', 'Documentation;subDoc');
        childGroup.setAttribute('projectUri', projectPath);

        await (deleteCommand).delete(false, solutionNode, 'subDoc', true);

        const cprojectContent = fs.readFileSync(projectPath, 'utf8');
        const root = await parseYamlToCTreeItem(cprojectContent);
        const topChild = root?.getChild();
        root!.rootFileName = projectPath;

        const children = topChild?.getChildren();
        const groups = children?.[2];
        const groupItems = groups?.getChildren();

        const want: string[] = [];
        const got: string[] = [];
        if (groupItems) {
            for (const gi of groupItems) {
                const children = gi.getChildren();
                const gps = children[0];
                const groupName = gps.getText();
                if (groupName == 'Documentation') {
                    const nestedGroup = gps.getChildByValue('subDoc');
                    if (nestedGroup) {
                        got.push(nestedGroup.getAttribute('label') ?? '');
                    }
                }
            }
        }
        expect(got).toEqual(want);
    });

    it('should remove nested group with duplicate name without affecting top-level group', async () => {
        const projectPath = path.join(tmpSolutionDir, 'USBD', 'HID', 'HID_test.cproject.yml');

        const testYamlContent = `project:
  groups:
    - group: foo
      files:
        - file: top-level-file.c
    - group: bar
      groups:
        - group: foo
          files:
            - file: nested-file.c
      files:
        - file: bar-file.c
`;

        // Write the test YAML structure to the project file
        fs.writeFileSync(projectPath, testYamlContent, 'utf8');

        // Create a delete command with properly mocked file system provider
        const mockWorkspaceFs = workspaceFsProviderFactory();
        mockWorkspaceFs.readUtf8File.mockImplementation((filePath: string) => {
            return Promise.resolve(fs.readFileSync(filePath, 'utf8'));
        });
        mockWorkspaceFs.writeUtf8File.mockImplementation((filePath: string, content: string) => {
            fs.writeFileSync(filePath, content, 'utf8');
            return Promise.resolve();
        });

        const testDeleteCommand = new DeleteCommand(commandsProvider, mockWorkspaceFs);

        const solutionNode = new COutlineItem('group');
        solutionNode.setAttribute('label', 'foo');
        solutionNode.setAttribute('type', 'group');
        solutionNode.setAttribute('tag', 'group');
        solutionNode.setAttribute('groupPath', 'bar;foo');
        solutionNode.setAttribute('projectUri', projectPath);

        await testDeleteCommand.delete(false, solutionNode, 'foo', true);

        const cprojectContent = fs.readFileSync(projectPath, 'utf8');

        // Verify the top-level foo group still exists
        expect(cprojectContent).toContain('- group: foo');
        expect(cprojectContent).toContain('- file: top-level-file.c');

        // Verify the bar group still exists
        expect(cprojectContent).toContain('- group: bar');
        expect(cprojectContent).toContain('- file: bar-file.c');

        // Verify the nested foo group and its content have been removed
        expect(cprojectContent).not.toContain('- file: nested-file.c');

    });

    it('deletes a group and all its files from file system and YAML', async () => {
        const projectPath = path.join(tmpSolutionDir, 'USBD', 'HID', 'HID_group_delete.cproject.yml');

        // Create test YAML with a group containing multiple files
        const testYamlContent = `project:
  packs:
    - pack: Keil::MDK-Middleware@>=8.0.0-0

  groups:
    - group: Documentation
      files:
        - file: README.md
    - group: TestGroup
      files:
        - file: test1.c
        - file: test2.h
        - file: test3.cpp
      groups:
        - group: SubGroup
          files:
            - file: sub1.c
            - file: sub2.h

  components:
    - component: ARM::CMSIS:OS Tick:SysTick
`;

        // Write the test YAML structure to the project file
        fs.writeFileSync(projectPath, testYamlContent, 'utf8');

        // Create corresponding physical files for testing file deletion
        const testDir = path.join(tmpSolutionDir, 'USBD', 'HID');
        const test1File = path.join(testDir, 'test1.c');
        const test2File = path.join(testDir, 'test2.h');
        const test3File = path.join(testDir, 'test3.cpp');
        const sub1File = path.join(testDir, 'sub1.c');
        const sub2File = path.join(testDir, 'sub2.h');

        fs.writeFileSync(test1File, '// test1.c content', 'utf8');
        fs.writeFileSync(test2File, '// test2.h content', 'utf8');
        fs.writeFileSync(test3File, '// test3.cpp content', 'utf8');
        fs.writeFileSync(sub1File, '// sub1.c content', 'utf8');
        fs.writeFileSync(sub2File, '// sub2.h content', 'utf8');

        // Verify files exist before deletion
        expect(fs.existsSync(test1File)).toBe(true);
        expect(fs.existsSync(test2File)).toBe(true);
        expect(fs.existsSync(test3File)).toBe(true);
        expect(fs.existsSync(sub1File)).toBe(true);
        expect(fs.existsSync(sub2File)).toBe(true);

        // Create a delete command with properly mocked file system provider
        const mockWorkspaceFs = workspaceFsProviderFactory();
        mockWorkspaceFs.readUtf8File.mockImplementation((filePath: string) => {
            return Promise.resolve(fs.readFileSync(filePath, 'utf8'));
        });
        mockWorkspaceFs.writeUtf8File.mockImplementation((filePath: string, content: string) => {
            fs.writeFileSync(filePath, content, 'utf8');
            return Promise.resolve();
        });

        // Mock vscode.workspace.fs.delete to actually delete the files
        const mockDelete = jest.spyOn(vscode.workspace.fs, 'delete').mockImplementation((uri) => {
            if (fs.existsSync(uri.fsPath)) {
                fs.unlinkSync(uri.fsPath);
            }
            return Promise.resolve();
        });

        const testDeleteCommand = new DeleteCommand(commandsProvider, mockWorkspaceFs);

        // Create the group node with proper structure including child files and subgroups
        const groupNode = new COutlineItem('group');
        groupNode.setAttribute('label', 'TestGroup');
        groupNode.setAttribute('type', 'group');
        groupNode.setAttribute('tag', 'group');
        groupNode.setAttribute('groupPath', 'TestGroup');
        groupNode.setAttribute('projectUri', projectPath);

        // Add file children to the group node
        const file1Node = groupNode.createChild('file');
        file1Node.setAttribute('label', 'test1.c');
        file1Node.setAttribute('tag', 'file');
        file1Node.setAttribute('resourcePath', test1File);

        const file2Node = groupNode.createChild('file');
        file2Node.setAttribute('label', 'test2.h');
        file2Node.setAttribute('tag', 'file');
        file2Node.setAttribute('resourcePath', test2File);

        const file3Node = groupNode.createChild('file');
        file3Node.setAttribute('label', 'test3.cpp');
        file3Node.setAttribute('tag', 'file');
        file3Node.setAttribute('resourcePath', test3File);

        // Add subgroup with files
        const subGroupNode = groupNode.createChild('group');
        subGroupNode.setAttribute('label', 'SubGroup');
        subGroupNode.setAttribute('tag', 'group');
        subGroupNode.setAttribute('groupPath', 'TestGroup;SubGroup');

        const subFile1Node = subGroupNode.createChild('file');
        subFile1Node.setAttribute('label', 'sub1.c');
        subFile1Node.setAttribute('tag', 'file');
        subFile1Node.setAttribute('resourcePath', sub1File);

        const subFile2Node = subGroupNode.createChild('file');
        subFile2Node.setAttribute('label', 'sub2.h');
        subFile2Node.setAttribute('tag', 'file');
        subFile2Node.setAttribute('resourcePath', sub2File);

        // Delete the entire group (isDelete = true)
        await testDeleteCommand.delete(false, groupNode, 'TestGroup', true);

        // Verify the YAML file has been updated - TestGroup should be removed
        const cprojectContent = fs.readFileSync(projectPath, 'utf8');
        expect(cprojectContent).toContain('- group: Documentation');
        expect(cprojectContent).not.toContain('- group: TestGroup');
        expect(cprojectContent).not.toContain('- file: test1.c');
        expect(cprojectContent).not.toContain('- file: test2.h');
        expect(cprojectContent).not.toContain('- file: test3.cpp');
        expect(cprojectContent).not.toContain('- group: SubGroup');
        expect(cprojectContent).not.toContain('- file: sub1.c');
        expect(cprojectContent).not.toContain('- file: sub2.h');

        // Verify all physical files have been deleted
        expect(fs.existsSync(test1File)).toBe(false);
        expect(fs.existsSync(test2File)).toBe(false);
        expect(fs.existsSync(test3File)).toBe(false);
        expect(fs.existsSync(sub1File)).toBe(false);
        expect(fs.existsSync(sub2File)).toBe(false);

        // Verify delete was called for each file
        expect(mockDelete).toHaveBeenCalledTimes(5);
        expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({ fsPath: test1File }), { useTrash: true });
        expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({ fsPath: test2File }), { useTrash: true });
        expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({ fsPath: test3File }), { useTrash: true });
        expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({ fsPath: sub1File }), { useTrash: true });
        expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({ fsPath: sub2File }), { useTrash: true });

        mockDelete.mockRestore();
    });
});
