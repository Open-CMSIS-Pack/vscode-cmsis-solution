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

import * as path from 'node:path';
import * as vscode from 'vscode';
import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { ETextFileResult, TextFile } from '@open-cmsis-pack/cmsis-common/text-file';
import { DocumentCommand } from './document-command';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import { DocManager } from '../../../doc-manager/doc-manager';
import { csolutionFactory } from '../../../solutions/csolution.factory';
import { TargetTypeWrap } from '../../../solutions/files/csolution-wrap';
import { solutionManagerFactory } from '../../../solutions/solution-manager.factories';
import { commandsProviderFactory } from '../../../vscode-api/commands-provider.factories';
import { extensionContextFactory } from '../../../vscode-api/extension-context.factories';
import { textFileSystemFactory } from '../../../__test__/text-file-system';

describe('DocumentCommand', () => {
    const localPath = vscode.Uri.file(path.resolve('manual.pdf')).fsPath;
    const name = 'https://example.com/manual.pdf';
    let manager: DocManager;
    let commands: ReturnType<typeof commandsProviderFactory>;
    let solution: ReturnType<typeof csolutionFactory>;
    let solutionManager: ReturnType<typeof solutionManagerFactory>;
    let target: TargetTypeWrap;
    let window: {
        showOpenDialog: jest.Mock;
        showWarningMessage: jest.Mock;
        showErrorMessage: jest.Mock;
    };
    let context: ReturnType<typeof extensionContextFactory>;

    const nodeFor = (parentTag: 'board' | 'device', tag = parentTag as string): COutlineItem => {
        const hardware = new COutlineItem(parentTag);
        hardware.setAttribute('hardwareName', 'Vendor::Selected');
        const node = tag === parentTag ? hardware : hardware.createChild(tag);
        node.setAttribute('docName', name);
        node.setAttribute('docPath', 'not-the-inventory-identity.pdf');
        return node;
    };

    beforeEach(async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        TextFile.setFileSystem(textFileSystemFactory(new Map()));
        manager = new DocManager();
        await manager.initialize(path.resolve('inventory'));
        target = new TargetTypeWrap(new CTreeItem('target-type'));
        target.board = 'UnresolvedBoard';
        target.device = 'UnresolvedDevice';
        solution = csolutionFactory({
            getActiveTargetTypeWrap: jest.fn().mockReturnValue(target),
            getActiveTargetType: jest.fn().mockReturnValue('Target'),
            getBoardName: jest.fn().mockReturnValue('Vendor::ResolvedBoard'),
            getDeviceNameWithVendor: jest.fn().mockReturnValue('Vendor::ResolvedDevice'),
        });
        solutionManager = solutionManagerFactory({
            getCsolution: jest.fn().mockReturnValue(solution),
            getDocManager: jest.fn().mockReturnValue(manager),
        });
        commands = commandsProviderFactory();
        window = {
            showOpenDialog: jest.fn().mockResolvedValue([vscode.Uri.file(localPath)]),
            showWarningMessage: jest.fn(),
            showErrorMessage: jest.fn(),
        };
        context = extensionContextFactory();
        await new DocumentCommand(solutionManager, commands, window).activate(context);
    });

    afterEach(() => {
        context.subscriptions.forEach(disposable => disposable.dispose());
        manager.dispose();
        TextFile.setFileSystem();
        jest.restoreAllMocks();
    });

    it('registers only the three implemented document commands', () => {
        expect(commands.registerCommand.mock.calls.map(call => call[0])).toEqual([
            DocumentCommand.addCommandId, DocumentCommand.setLocalPathCommandId, DocumentCommand.removeCommandId,
        ]);
        expect(context.subscriptions).toHaveLength(3);
    });

    it.each(['board', 'device'] as const)('adds a user document to the selected %s rather than the active board', async parentTag => {
        await commands.mockRunRegistered(DocumentCommand.addCommandId, nodeFor(parentTag));

        const doc = manager.file.getDoc(localPath, 'Vendor::Selected', parentTag)!;
        expect(doc.title).toBe('manual.pdf');
        expect(doc.path).toBe(localPath);
        expect(doc.mode).toBe('user');
        expect(manager.file.getDocs('Vendor::ResolvedBoard', 'board')).toEqual([]);
        expect(window.showOpenDialog).toHaveBeenCalledWith({
            title: 'Add Document', canSelectFiles: true, canSelectFolders: false, canSelectMany: false,
        });
    });

    it.each([DocumentCommand.addCommandId, DocumentCommand.setLocalPathCommandId, DocumentCommand.removeCommandId])('uses processor-independent device identity for %s', async command => {
        const parentId = 'Vendor::Selected';
        if (command !== DocumentCommand.addCommandId) {
            expect(await manager.addUserBook(parentId, 'device', name, 'Manual')).toBeDefined();
        }
        const hardware = nodeFor('device');
        hardware.setAttribute('hardwareName', `${parentId}:cm33`);
        const node = command === DocumentCommand.addCommandId ? hardware : hardware.createChild('book');
        node.setAttribute('docName', name);

        await commands.mockRunRegistered(command, node);

        if (command === DocumentCommand.removeCommandId) {
            expect(manager.file.getDoc(name, parentId, 'device')).toBeUndefined();
        } else {
            const docName = command === DocumentCommand.addCommandId ? localPath : name;
            expect(manager.file.getDoc(docName, parentId, 'device')?.path).toBe(localPath);
        }
        expect(manager.file.getDocParents('device').map(parent => parent.id)).toEqual([parentId]);
        expect(window.showErrorMessage).not.toHaveBeenCalled();
    });

    it.each([
        { description: 'unnamed hardware', createNode: () => new COutlineItem('board') },
        { description: 'a book under unnamed hardware', createNode: () => new COutlineItem('device').createChild('book') },
        { description: 'an orphan book', createNode: () => new COutlineItem('book') },
        { description: 'a book under a non-hardware parent', createNode: () => {
            const group = nodeFor('board', 'group');
            group.setAttribute('hardwareName', 'Vendor::Selected');
            return group.createChild('book');
        } },
        { description: 'an unsupported hardware child', createNode: () => nodeFor('board', 'file') },
    ])('leaves inventory unchanged for $description', async ({ createNode }) => {
        manager.file.ensureDoc(name, 'Vendor::Selected', 'board').mode = 'user';
        manager.file.ensureDoc(name, 'Vendor::ResolvedBoard', 'board').mode = 'user';
        const node = createNode();
        node.setAttribute('docName', name);
        const inventory = manager.file.stringify();
        const save = jest.spyOn(manager.file, 'save');

        for (const command of [DocumentCommand.addCommandId, DocumentCommand.setLocalPathCommandId, DocumentCommand.removeCommandId]) {
            await commands.mockRunRegistered(command, node);
            expect(manager.file.stringify()).toBe(inventory);
            expect(save).not.toHaveBeenCalled();
        }
    });

    it.each([true, false])('uses explicit target board preference from the palette: %s', async useBoard => {
        solution.getBoardName.mockReturnValue('Vendor::ResolvedBoard:RevA');
        solution.getDeviceNameWithVendor.mockReturnValue('Vendor::ResolvedDevice:cm33');
        if (!useBoard) {
            target.board = undefined;
        }
        await commands.mockRunRegistered(DocumentCommand.addCommandId);
        const parentTag = useBoard ? 'board' : 'device';
        const parentId = useBoard ? 'Vendor::ResolvedBoard:RevA' : 'Vendor::ResolvedDevice';
        expect(manager.file.getDoc(localPath, parentId, parentTag)?.mode).toBe('user');
        expect(manager.file.getDocParents()).toHaveLength(1);
    });

    it('uses target hardware before build files exist', async () => {
        solution.getBoardName.mockReturnValue('');
        await commands.mockRunRegistered(DocumentCommand.addCommandId);
        expect(manager.file.getDoc(localPath, target.board!, 'board')?.mode).toBe('user');
    });

    it('uses the unqualified device without its processor before build files exist', async () => {
        target.board = undefined;
        target.device = 'UnresolvedDevice:cm33';
        solution.getDeviceNameWithVendor.mockReturnValue('');

        await commands.mockRunRegistered(DocumentCommand.addCommandId);

        expect(manager.file.getDoc(localPath, 'UnresolvedDevice', 'device')?.mode).toBe('user');
        expect(manager.file.getDocParents('device').map(parent => parent.id)).toEqual(['UnresolvedDevice']);
    });

    it('reports missing hardware after selecting a file', async () => {
        solutionManager.getCsolution.mockReturnValue(undefined);
        await commands.mockRunRegistered(DocumentCommand.addCommandId);
        expect(window.showWarningMessage).toHaveBeenCalledTimes(1);
        expect(window.showOpenDialog).toHaveBeenCalledTimes(1);
    });

    it.each([DocumentCommand.addCommandId, DocumentCommand.setLocalPathCommandId])('does not save on picker cancellation: %s', async command => {
        manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        const save = jest.spyOn(manager.file, 'save');
        const load = jest.spyOn(manager.file, 'load');
        const before = manager.file.stringify();
        window.showOpenDialog.mockResolvedValueOnce(undefined);
        await commands.mockRunRegistered(command, nodeFor('board', command === DocumentCommand.addCommandId ? 'board' : 'book'));
        expect(manager.file.stringify()).toBe(before);
        expect(save).not.toHaveBeenCalled();
        expect(load).not.toHaveBeenCalled();
    });

    it('sets the local path using original document identity, retaining URL and mode', async () => {
        const doc = manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        await commands.mockRunRegistered(DocumentCommand.setLocalPathCommandId, nodeFor('board', 'book'));
        expect(doc.path).toBe(localPath);
        expect(doc.name).toBe(name);
        expect(doc.locationType).toBe('W');
        expect(doc.mode).toBeUndefined();
    });

    it.each(['https://example.com/manual.html', 'local.pdf'])('does not update a non-W document %s after selecting a file', async docName => {
        const node = nodeFor('board', 'book');
        node.setAttribute('docName', docName);
        const doc = manager.file.ensureDoc(docName, 'Vendor::Selected', 'board');
        const save = jest.spyOn(manager.file, 'save');
        await commands.mockRunRegistered(DocumentCommand.setLocalPathCommandId, node);
        expect(doc.path).toBeUndefined();
        expect(save).not.toHaveBeenCalled();
    });

    it.each([undefined, 'future', 'user'])('removes only user entries through the command: %s', async mode => {
        const doc = manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        doc.item!.setValue('mode', mode);
        const save = jest.spyOn(manager.file, 'save');
        await commands.mockRunRegistered(DocumentCommand.removeCommandId, nodeFor('board', 'book'));
        expect(manager.file.getDoc(name, 'Vendor::Selected', 'board')?.item).toBe(mode === 'user' ? undefined : doc.item);
        expect(save).toHaveBeenCalledTimes(mode === 'user' ? 1 : 0);
        expect(window.showOpenDialog).not.toHaveBeenCalled();
    });

    it.each([DocumentCommand.addCommandId, DocumentCommand.setLocalPathCommandId])('uses the current inventory after browsing: %s', async command => {
        manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        window.showOpenDialog.mockImplementationOnce(async () => {
            await manager.initialize(path.resolve('other-inventory'));
            return [vscode.Uri.file(localPath)];
        });
        await commands.mockRunRegistered(command, nodeFor('board', command === DocumentCommand.addCommandId ? 'board' : 'book'));
        if (command === DocumentCommand.addCommandId) {
            expect(manager.file.getDoc(localPath, 'Vendor::Selected', 'board')?.mode).toBe('user');
        } else {
            expect(manager.file.getDocParents()).toEqual([]);
        }
        expect(window.showWarningMessage).not.toHaveBeenCalled();
    });

    it('uses the current palette target after browsing', async () => {
        window.showOpenDialog.mockImplementationOnce(async () => {
            target.board = undefined;
            return [vscode.Uri.file(localPath)];
        });
        await commands.mockRunRegistered(DocumentCommand.addCommandId);
        expect(manager.file.getDoc(localPath, 'Vendor::ResolvedDevice', 'device')?.mode).toBe('user');
        expect(window.showWarningMessage).not.toHaveBeenCalled();
    });

    it('uses current document metadata after browsing', async () => {
        manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        await manager.file.save();
        window.showOpenDialog.mockImplementationOnce(async () => {
            manager.file.getDoc(name, 'Vendor::Selected', 'board')!.title = 'Updated while browsing';
            return [vscode.Uri.file(localPath)];
        });
        await commands.mockRunRegistered(DocumentCommand.setLocalPathCommandId, nodeFor('board', 'book'));
        const doc = manager.file.getDoc(name, 'Vendor::Selected', 'board');
        expect(doc?.title).toBe('Updated while browsing');
        expect(doc?.path).toBe(localPath);
    });

    it('does not recreate a document removed from the manager while browsing', async () => {
        manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        await manager.file.save();
        window.showOpenDialog.mockImplementationOnce(async () => {
            manager.file.removeDoc(name, 'Vendor::Selected', 'board');
            return [vscode.Uri.file(localPath)];
        });
        const save = jest.spyOn(manager.file, 'save');
        await commands.mockRunRegistered(DocumentCommand.setLocalPathCommandId, nodeFor('board', 'book'));
        expect(manager.file.getDoc(name, 'Vendor::Selected', 'board')).toBeUndefined();
        expect(save).not.toHaveBeenCalled();
    });

    it('checks the current mode before removing a document', async () => {
        const doc = manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        doc.mode = 'user';
        await manager.file.save();
        doc.mode = undefined;
        const save = jest.spyOn(manager.file, 'save');

        await commands.mockRunRegistered(DocumentCommand.removeCommandId, nodeFor('board', 'book'));

        expect(manager.file.getDoc(name, 'Vendor::Selected', 'board')).toBeDefined();
        expect(save).not.toHaveBeenCalled();
    });

    it.each([DocumentCommand.addCommandId, DocumentCommand.setLocalPathCommandId, DocumentCommand.removeCommandId])('uses the existing manager without reinitializing: %s', async command => {
        const doc = manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        doc.mode = 'user';
        await manager.file.save();
        const initialize = jest.spyOn(manager, 'initialize');
        await commands.mockRunRegistered(command, nodeFor('board', command === DocumentCommand.addCommandId ? 'board' : 'book'));
        expect(solutionManager.getDocManager).toHaveBeenCalledTimes(1);
        expect(initialize).not.toHaveBeenCalled();
        expect(window.showErrorMessage).not.toHaveBeenCalled();
    });

    it.each([DocumentCommand.addCommandId, DocumentCommand.setLocalPathCommandId, DocumentCommand.removeCommandId])('reports save failures: %s', async command => {
        const doc = manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        doc.mode = 'user';
        jest.spyOn(manager.file, 'save').mockResolvedValueOnce(ETextFileResult.Error);
        await commands.mockRunRegistered(command, nodeFor('board', command === DocumentCommand.addCommandId ? 'board' : 'book'));
        expect(window.showErrorMessage).toHaveBeenCalledWith('Failed to save the document inventory.');
    });
});
