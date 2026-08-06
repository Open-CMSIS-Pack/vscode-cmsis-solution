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

import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { CTreeItemYamlFile } from '@open-cmsis-pack/cmsis-common/tree-item-file';
import { parseYamlToCTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item-yaml-parser';
import { ETextFileResult } from '@open-cmsis-pack/cmsis-common/text-file';
import * as fs from 'fs';
import os from 'node:os';
import path from 'node:path';
import { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import { CSolution } from '../../../solutions/csolution';
import { CProjectYamlFile } from '../../../solutions/files/cproject-yaml-file';
import { commandsProviderFactory } from '../../../vscode-api/commands-provider.factories';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import { DeleteCommand } from './delete-command';

jest.mock('vscode', () => ({
    window: {
        showWarningMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn(),
    },
    Uri: {
        file: (filePath: string) => ({ fsPath: filePath }),
    },
    workspace: {
        fs: {
            delete: jest.fn(),
        },
    },
}));

const extensionContextFactory = (): Pick<ExtensionContext, 'subscriptions'> => ({ subscriptions: [] });
const commandsProvider = commandsProviderFactory();
const projectPath = path.resolve('project', 'test.cproject.yml');

const yamlFileFixture = (
    yaml: string,
    layerPath?: string,
    saveResult: ETextFileResult = ETextFileResult.Unchanged,
) => {
    const yamlFile = layerPath
        ? new CTreeItemYamlFile(layerPath)
        : new CProjectYamlFile(projectPath);
    const rootItem = parseYamlToCTreeItem(yaml);
    if (!(rootItem instanceof CTreeItem)) {
        throw new Error('YAML root item was not parsed');
    }
    yamlFile.rootItem = rootItem;
    rootItem.rootFileName = yamlFile.fileName;
    const save = jest.spyOn(yamlFile, 'save').mockResolvedValue(saveResult);
    const load = jest.spyOn(yamlFile, 'load').mockResolvedValue(ETextFileResult.Success);
    const csolution = {
        getCproject: jest.fn(() => yamlFile),
        getClayerYamlFile: jest.fn(() => yamlFile),
    } as unknown as CSolution;
    const solutionManager = { getCsolution: jest.fn(() => csolution) };
    const command = new DeleteCommand(commandsProvider, solutionManager);
    return { command, csolution, load, save, yamlFile };
};

const groupNode = (groupPath: string, layerPath?: string): COutlineItem => {
    const node = new COutlineItem('group');
    node.setAttribute('label', groupPath.split(';').at(-1));
    node.setAttribute('type', 'group');
    node.setAttribute('groupPath', groupPath);
    node.setAttribute('projectUri', projectPath);
    node.setAttribute('layerUri', layerPath);
    return node;
};

const fileNode = (parent: COutlineItem, fileUri: string, resourcePath?: string): COutlineItem => {
    const node = parent.createChild('file');
    node.setAttribute('label', path.basename(fileUri));
    node.setAttribute('fileUri', fileUri);
    node.setAttribute('resourcePath', resourcePath ?? path.resolve(path.dirname(projectPath), fileUri));
    node.setAttribute('projectUri', parent.getAttribute('projectUri'));
    node.setAttribute('layerUri', parent.getAttribute('layerUri'));
    return node;
};

const groupNames = (topItem: CTreeItem, groupPath: string[] = []): string[] => {
    let item = topItem;
    for (const groupName of groupPath) {
        item = item.getChild('groups')?.getChildByValue('group', groupName) as CTreeItem;
    }
    return item.getGrandChildren('groups').map(group => group.getValueAsString('group'));
};

const fileNames = (topItem: CTreeItem, groupPath: string[]): string[] => {
    let item = topItem;
    for (const groupName of groupPath) {
        item = item.getChild('groups')?.getChildByValue('group', groupName) as CTreeItem;
    }
    return item.getGrandChildren('files').map(file => file.getValueAsString('file'));
};

describe('DeleteCommand', () => {
    let tempDir: string;

    beforeEach(() => {
        jest.clearAllMocks();
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'delete-command-'));
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('registers the remove command on activation', async () => {
        const { command } = yamlFileFixture('project: {}');

        await command.activate(extensionContextFactory());

        expect(commandsProvider.registerCommand).toHaveBeenCalledWith(
            DeleteCommand.removeCommandId,
            expect.any(Function),
            command,
        );
    });

    it('removes a file from the loaded project and saves it once', async () => {
        const fixture = yamlFileFixture(`project:
  groups:
    - group: Source
      files:
        - file: keep.c
        - file: remove.c
`);
        const group = groupNode('Source');
        const file = fileNode(group, 'remove.c');

        await fixture.command.delete(true, file, 'remove.c', false);

        expect(fileNames(fixture.yamlFile.topItem!, ['Source'])).toEqual(['keep.c']);
        expect(fixture.save).toHaveBeenCalledTimes(1);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith("'remove.c' has been removed.");
    });

    it('removes only the targeted nested group with a duplicate name', async () => {
        const fixture = yamlFileFixture(`project:
  groups:
    - group: foo
    - group: bar
      groups:
        - group: foo
        - group: keep
`);
        const nestedFoo = groupNode('bar;foo');

        await fixture.command.delete(false, nestedFoo, 'foo', false);

        expect(groupNames(fixture.yamlFile.topItem!)).toEqual(['foo', 'bar']);
        expect(groupNames(fixture.yamlFile.topItem!, ['bar'])).toEqual(['keep']);
        expect(fixture.save).toHaveBeenCalledTimes(1);
    });

    it('uses the loaded layer wrapper for a layer-owned group', async () => {
        const layerPath = path.resolve('layers', 'test.clayer.yml');
        const fixture = yamlFileFixture(`layer:
  groups:
    - group: LayerGroup
`, layerPath);
        const layerGroup = groupNode('LayerGroup', layerPath);

        await fixture.command.delete(false, layerGroup, 'LayerGroup', false);

        expect(groupNames(fixture.yamlFile.topItem!)).toEqual([]);
        expect(fixture.csolution.getClayerYamlFile).toHaveBeenCalledWith(layerPath);
        expect(fixture.csolution.getCproject).not.toHaveBeenCalled();
    });

    it('deletes physical group files recursively before saving the model', async () => {
        const fixture = yamlFileFixture(`project:
  groups:
    - group: TestGroup
      files:
        - file: first.c
      groups:
        - group: Nested
          files:
            - file: second.c
`);
        const group = groupNode('TestGroup');
            const firstPath = path.join(tempDir, 'first.c');
            const secondPath = path.join(tempDir, 'second.c');
            fs.writeFileSync(firstPath, '');
            fs.writeFileSync(secondPath, '');
        fileNode(group, 'first.c', firstPath);
        const nested = group.createChild('group');
        nested.setAttribute('groupPath', 'TestGroup;Nested');
        fileNode(nested, 'second.c', secondPath);

        await fixture.command.delete(false, group, 'TestGroup', true);

        expect(vscode.workspace.fs.delete).toHaveBeenCalledTimes(2);
        expect(vscode.workspace.fs.delete).toHaveBeenCalledWith(expect.objectContaining({ fsPath: firstPath }), { useTrash: true });
        expect(vscode.workspace.fs.delete).toHaveBeenCalledWith(expect.objectContaining({ fsPath: secondPath }), { useTrash: true });
        expect(groupNames(fixture.yamlFile.topItem!)).toEqual([]);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith("'TestGroup' has been deleted.");
    });

    it('does not change the model when physical file deletion fails', async () => {
        const fixture = yamlFileFixture(`project:
  groups:
    - group: Source
      files:
        - file: keep.c
`);
        const group = groupNode('Source');
    const resourcePath = path.join(tempDir, 'keep.c');
    fs.writeFileSync(resourcePath, '');
    const file = fileNode(group, 'keep.c', resourcePath);
        jest.mocked(vscode.workspace.fs.delete).mockRejectedValueOnce(new Error('delete failed'));

        await fixture.command.delete(true, file, 'keep.c', true);

        expect(fileNames(fixture.yamlFile.topItem!, ['Source'])).toEqual(['keep.c']);
        expect(fixture.save).not.toHaveBeenCalled();
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("Failed to delete the file 'keep.c'.");
    });

    it('reloads and reports an error when saving fails', async () => {
        const fixture = yamlFileFixture(`project:
  groups:
    - group: Source
      files:
        - file: remove.c
`, undefined, ETextFileResult.Error);
        const group = groupNode('Source');
        const file = fileNode(group, 'remove.c');

        await fixture.command.delete(true, file, 'remove.c', false);

        expect(fixture.load).toHaveBeenCalledTimes(1);
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("Failed to delete the file 'remove.c'.");
        expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });

    it('reports a missing YAML item as a failed removal without saving', async () => {
        const fixture = yamlFileFixture('project: {}');
        const group = groupNode('Missing');

        await fixture.command.delete(false, group, 'Missing', false);

        expect(fixture.save).not.toHaveBeenCalled();
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith("Failed to delete the group 'Missing'.");
    });

    it('prompts for file and group confirmation using the owning YAML file name', async () => {
        const { command } = yamlFileFixture('project: {}');
        const group = groupNode('Source');
        const file = fileNode(group, 'source.c');

        await command.confirmDeletion(file);
        expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
            "Choose Remove to remove 'source.c' from 'test.cproject.yml'\n\nChoose Delete to permanently delete 'source.c'",
            { modal: true, detail: 'You can restore deleted file from the Recycle Bin.' },
            'Remove', 'Delete',
        );

        await command.confirmDeletion(group);
        expect(vscode.window.showWarningMessage).toHaveBeenLastCalledWith(
            "Choose Remove to remove 'Source' and all its content from 'test.cproject.yml'\n\nChoose Delete to permanently delete 'Source' and all its content",
            { modal: true, detail: 'You can restore deleted files from the Recycle Bin.' },
            'Remove', 'Delete',
        );
    });
});
