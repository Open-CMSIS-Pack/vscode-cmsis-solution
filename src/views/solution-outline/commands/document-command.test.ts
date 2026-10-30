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
import { TextFile } from '@open-cmsis-pack/cmsis-common/text-file';
import { DocumentCommand } from './document-command';
import { COutlineItem } from '../tree-structure/solution-outline-item';
import { DocManager } from '../../../doc-manager/doc-manager';
import { DocDownload } from '../../../doc-manager/doc-download';
import { csolutionFactory } from '../../../solutions/csolution.factory';
import { TargetTypeWrap } from '../../../solutions/files/csolution-wrap';
import { solutionManagerFactory } from '../../../solutions/solution-manager.factories';
import { commandsProviderFactory } from '../../../vscode-api/commands-provider.factories';
import { extensionContextFactory } from '../../../vscode-api/extension-context.factories';
import { textFileSystemFactory } from '../../../__test__/text-file-system';
import { TestDataHandler } from '../../../__test__/test-data';
import { writeTextFile } from '../../../utils/fs-utils';

describe('DocumentCommand', () => {
    const testData = new TestDataHandler();
    let localPath: string;
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
        hardware.addFeature('docParent');
        const node = tag === parentTag ? hardware : hardware.createChild(tag);
        if (tag === 'book') {
            node.setAttribute('docParentId', 'Vendor::Selected');
            node.setAttribute('docParentTag', parentTag);
            node.setAttribute('docLocationType', 'W');
            node.addFeature('docFile');
            node.addFeature('webDoc');
        }
        node.setAttribute('docName', name);
        node.setAttribute('docPath', 'not-the-inventory-identity.pdf');
        return node;
    };

    beforeEach(async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        TextFile.setFileSystem(textFileSystemFactory(new Map()));
        manager = new DocManager();
        await manager.initialize(testData.tmpDir);
        localPath = vscode.Uri.file(path.join(testData.tmpDir, 'source', 'manual.pdf')).fsPath;
        writeTextFile(localPath, 'Selected document');
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
        testData.rmTmpDir();
        TextFile.setFileSystem();
        jest.restoreAllMocks();
    });

    it('registers the four document commands', () => {
        expect(commands.registerCommand.mock.calls.map(call => call[0])).toEqual([
            DocumentCommand.addCommandId, DocumentCommand.downloadCommandId, DocumentCommand.importCommandId, DocumentCommand.removeCommandId,
        ]);
        expect(context.subscriptions).toHaveLength(4);
    });

    it.each(['board', 'device', 'common'] as const)('downloads a document using its %s inventory identity', async parentTag => {
        const node = nodeFor(parentTag === 'board' ? 'board' : 'device', 'book');
        const parentId = parentTag === 'common' ? 'arm-docs' : 'Vendor::Selected';
        node.setAttribute('docParentId', parentId);
        node.setAttribute('docParentTag', parentTag);
        const download = jest.spyOn(manager, 'downloadDocument').mockResolvedValue(undefined);

        await commands.mockRunRegistered(DocumentCommand.downloadCommandId, node);

        expect(download).toHaveBeenCalledWith(parentId, parentTag, name, expect.any(Function));
        expect(window.showOpenDialog).not.toHaveBeenCalled();
        expect(window.showErrorMessage).not.toHaveBeenCalled();
    });

    it.each(['webDoc', 'webLink'])('does not download an H document with the %s feature', async feature => {
        const node = nodeFor('board', 'book');
        node.setAttribute('docLocationType', 'H');
        node.setAttribute('features', `docFile;${feature}`);
        const download = jest.spyOn(manager, 'downloadDocument').mockResolvedValue(undefined);

        await commands.mockRunRegistered(DocumentCommand.downloadCommandId, node);

        expect(download).not.toHaveBeenCalled();
        expect(window.showOpenDialog).not.toHaveBeenCalled();
        expect(window.showWarningMessage).not.toHaveBeenCalled();
        expect(window.showErrorMessage).not.toHaveBeenCalled();
    });

    it.each([
        { command: DocumentCommand.addCommandId, action: 'Overwrite', message: 'The destination file already exists. Overwrite it?' },
        { command: DocumentCommand.downloadCommandId, action: 'Overwrite', message: 'The download destination already exists. Overwrite it?' },
        { command: DocumentCommand.importCommandId, action: 'Overwrite', message: 'The destination file already exists. Overwrite it?' },
    ].flatMap(scenario => ['approve', 'dismiss'].map(decision => ({ ...scenario, decision }))))(
        'confirms $command and handles $decision', async ({ command, action, message, decision }) => {
            manager.dispose();
            manager = new DocManager(undefined, new DocDownload());
            await manager.initialize(testData.tmpDir);
            solutionManager.getDocManager.mockReturnValue(manager);
            const previousPath = path.join(testData.tmpDir, 'docs', 'Vendor', 'Selected', 'manual', 'manual.pdf');
            writeTextFile(previousPath, 'Existing document');
            const isAdd = command === DocumentCommand.addCommandId;
            const doc = await manager.addUserBook('Vendor::Selected', 'board', isAdd ? previousPath : name, 'Original title');
            doc!.mode = isAdd ? 'user' : undefined;
            doc!.path = previousPath;
            doc!.error = 'Previous error';
            await manager.file.save();
            const before = manager.file.stringify();
            const changed = jest.fn();
            manager.onDidChange(changed);
            const download = jest.spyOn(DocDownload.prototype, 'downloadDoc').mockResolvedValue(undefined);
            window.showWarningMessage.mockResolvedValue(decision === 'approve' ? action : undefined);

            await commands.mockRunRegistered(command, nodeFor('board', isAdd ? 'board' : 'book'));

            expect(window.showWarningMessage).toHaveBeenCalledTimes(1);
            expect(window.showWarningMessage).toHaveBeenCalledWith(message, {
                modal: true, detail: expect.stringContaining(previousPath),
            }, action);
            expect(window.showErrorMessage).not.toHaveBeenCalled();
            const approved = decision === 'approve';
            expect(changed).toHaveBeenCalledTimes(approved ? 1 : 0);
            expect(download).toHaveBeenCalledTimes(approved && command === DocumentCommand.downloadCommandId ? 1 : 0);
            if (!approved) {
                expect(manager.file.stringify()).toBe(before);
            } else {
                const stored = manager.file.getDoc(isAdd ? previousPath : name, 'Vendor::Selected', 'board');
                expect(stored?.path).toBe(previousPath);
                expect(stored?.error).toBeUndefined();
                expect(stored?.title).toBe('Original title');
            }
        },
    );

    it('does not add error reporting after a download completes', async () => {
        jest.spyOn(manager, 'downloadDocument').mockResolvedValue(undefined);

        await commands.mockRunRegistered(DocumentCommand.downloadCommandId, nodeFor('board', 'book'));

        expect(window.showErrorMessage).not.toHaveBeenCalled();
    });

    it.each([DocumentCommand.downloadCommandId, DocumentCommand.importCommandId])('ignores missing, non-web and user targets for %s', async command => {
        const download = jest.spyOn(manager, 'downloadDocument');
        const importDocument = jest.spyOn(manager, 'importDocument');
        const node = nodeFor('board', 'book');
        node.setAttribute('features', 'docFile');

        await commands.mockRunRegistered(command);
        await commands.mockRunRegistered(command, node);
        node.setAttribute('features', 'docFile;webDoc;userDoc');
        await commands.mockRunRegistered(command, node);
        node.setAttribute('features', 'docFile;webLink;userDoc');
        await commands.mockRunRegistered(command, node);

        expect(download).not.toHaveBeenCalled();
        expect(importDocument).not.toHaveBeenCalled();
        expect(window.showOpenDialog).not.toHaveBeenCalled();
        expect(window.showErrorMessage).not.toHaveBeenCalled();
    });

    it.each(['board', 'device'] as const)('adds a user document to the selected %s rather than the active board', async parentTag => {
        await commands.mockRunRegistered(DocumentCommand.addCommandId, nodeFor(parentTag));

        const doc = manager.file.getDoc(localPath, 'Vendor::Selected', parentTag)!;
        expect(doc.title).toBe('manual.pdf');
        expect(doc.path).toBe(doc.getDestinationPath());
        expect(doc.mode).toBe('user');
        expect(manager.file.getDocs('Vendor::ResolvedBoard', 'board')).toEqual([]);
        expect(window.showOpenDialog).toHaveBeenCalledWith({
            title: 'Add Document', canSelectFiles: true, canSelectFolders: false, canSelectMany: false,
            filters: { Documents: ['md', 'pdf'] },
        });
    });

    it.each([DocumentCommand.addCommandId, DocumentCommand.importCommandId, DocumentCommand.removeCommandId])('uses processor-independent device identity for %s', async command => {
        const parentId = 'Vendor::Selected';
        if (command !== DocumentCommand.addCommandId) {
            const doc = manager.file.ensureDoc(name, parentId, 'device');
            doc.mode = command === DocumentCommand.removeCommandId ? 'user' : undefined;
            await manager.file.save();
        }
        const hardware = nodeFor('device');
        hardware.setAttribute('hardwareName', `${parentId}:cm33`);
        const node = command === DocumentCommand.addCommandId ? hardware : hardware.createChild('book');
        node.setAttribute('docName', name);
        if (command !== DocumentCommand.addCommandId) {
            node.setAttribute('docParentId', parentId);
            node.setAttribute('docParentTag', 'device');
            node.addFeature('webDoc');
            if (command === DocumentCommand.removeCommandId) {
                node.addFeature('userDoc');
            }
        }

        await commands.mockRunRegistered(command, node);

        if (command === DocumentCommand.removeCommandId) {
            expect(manager.file.getDoc(name, parentId, 'device')).toBeUndefined();
        } else {
            const docName = command === DocumentCommand.addCommandId ? localPath : name;
            const doc = manager.file.getDoc(docName, parentId, 'device')!;
            expect(doc.path).toBe(doc.getDestinationPath());
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

        for (const command of [DocumentCommand.addCommandId, DocumentCommand.importCommandId, DocumentCommand.removeCommandId]) {
            await commands.mockRunRegistered(command, node);
            expect(manager.file.stringify()).toBe(inventory);
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

    it.each([DocumentCommand.addCommandId, DocumentCommand.importCommandId])('does not save on picker cancellation: %s', async command => {
        manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        const before = manager.file.stringify();
        window.showOpenDialog.mockResolvedValueOnce(undefined);
        await commands.mockRunRegistered(command, nodeFor('board', command === DocumentCommand.addCommandId ? 'board' : 'book'));
        expect(manager.file.stringify()).toBe(before);
    });

    it.each([
        { docName: name, locationType: 'W' },
        { docName: 'https://example.com/manual.html', locationType: 'H' },
    ])('imports a $locationType document using its original identity, retaining URL and mode', async ({ docName, locationType }) => {
        const doc = manager.file.ensureDoc(docName, 'Vendor::Selected', 'board');
        const node = nodeFor('board', 'book');
        node.setAttribute('docName', docName);
        node.setAttribute('docLocationType', locationType);
        node.setAttribute('features', locationType === 'W' ? 'docFile;webDoc' : 'docFile;webLink');

        await commands.mockRunRegistered(DocumentCommand.importCommandId, node);

        expect(window.showOpenDialog).toHaveBeenCalledWith({
            title: 'Import', canSelectFiles: true, canSelectFolders: false, canSelectMany: false,
            filters: { Documents: ['md', 'pdf'] },
        });
        expect(doc.path).toBe(doc.getDestinationPath());
        expect(doc.path).toBeDefined();
        expect(doc.name).toBe(docName);
        expect(doc.locationType).toBe(locationType);
        expect(doc.mode).toBeUndefined();
        expect(window.showErrorMessage).not.toHaveBeenCalled();
    });

    it('uses the shared document owner supplied by the outline item', async () => {
        const armName = 'https://developer.arm.com/documentation/ddi0553/latest';
        const doc = manager.file.ensureDoc(armName, 'arm-docs', 'common');
        doc.format = 'pdf';
        doc.id = 'ddi0553';
        doc.version = 'latest';
        await manager.file.save();
        const node = nodeFor('device', 'book');
        node.setAttribute('docName', armName);
        node.setAttribute('docParentId', 'arm-docs');
        node.setAttribute('docParentTag', 'common');

        await commands.mockRunRegistered(DocumentCommand.importCommandId, node);

        expect(manager.file.findDocs(armName).map(doc => doc.path)).toEqual([manager.file.getDoc(armName, 'arm-docs', 'common')?.getDestinationPath()]);
        expect(manager.file.getDoc(armName, 'Vendor::Selected', 'device')).toBeUndefined();
        expect(window.showErrorMessage).not.toHaveBeenCalled();
    });

    it.each(['${CMSIS_PACK_ROOT}/manual.pdf', 'local.pdf'])('ignores a non-web document %s before selecting a file', async docName => {
        const node = nodeFor('board', 'book');
        node.setAttribute('docName', docName);
        node.setAttribute('features', 'docFile');
        const doc = manager.file.ensureDoc(docName, 'Vendor::Selected', 'board');
        await commands.mockRunRegistered(DocumentCommand.importCommandId, node);
        expect(doc.path).toBeUndefined();
        expect(window.showOpenDialog).not.toHaveBeenCalled();
    });

    it.each([undefined, 'future', 'user'])('removes only user entries through the command: %s', async mode => {
        const doc = manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        doc.item!.setValue('mode', mode);
        const node = nodeFor('board', 'book');
        if (mode === 'user') {
            node.addFeature('userDoc');
        }
        await commands.mockRunRegistered(DocumentCommand.removeCommandId, node);
        expect(manager.file.getDoc(name, 'Vendor::Selected', 'board')?.item).toBe(mode === 'user' ? undefined : doc.item);
        expect(window.showOpenDialog).not.toHaveBeenCalled();
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
        await commands.mockRunRegistered(DocumentCommand.importCommandId, nodeFor('board', 'book'));
        const doc = manager.file.getDoc(name, 'Vendor::Selected', 'board');
        expect(doc?.title).toBe('Updated while browsing');
        expect(doc?.path).toBe(doc?.getDestinationPath());
    });

    it('does not recreate a document removed from the manager while browsing', async () => {
        manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        await manager.file.save();
        window.showOpenDialog.mockImplementationOnce(async () => {
            await manager.file.removeDoc(name, 'Vendor::Selected', 'board');
            return [vscode.Uri.file(localPath)];
        });
        await commands.mockRunRegistered(DocumentCommand.importCommandId, nodeFor('board', 'book'));
        expect(manager.file.getDoc(name, 'Vendor::Selected', 'board')).toBeUndefined();
        expect(window.showErrorMessage).toHaveBeenCalledWith('Failed to import the document.');
    });

    it('checks the current mode before removing a document', async () => {
        const doc = manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        doc.mode = 'user';
        await manager.file.save();
        doc.mode = undefined;

        const node = nodeFor('board', 'book');
        node.addFeature('userDoc');
        await commands.mockRunRegistered(DocumentCommand.removeCommandId, node);

        expect(manager.file.getDoc(name, 'Vendor::Selected', 'board')).toBeDefined();
    });

    it.each([DocumentCommand.addCommandId, DocumentCommand.importCommandId, DocumentCommand.removeCommandId])('uses the existing manager without reinitializing: %s', async command => {
        const doc = manager.file.ensureDoc(name, 'Vendor::Selected', 'board');
        doc.mode = command === DocumentCommand.removeCommandId ? 'user' : undefined;
        await manager.file.save();
        const initialize = jest.spyOn(manager, 'initialize');
        const node = nodeFor('board', command === DocumentCommand.addCommandId ? 'board' : 'book');
        if (command === DocumentCommand.removeCommandId) {
            node.addFeature('userDoc');
        }
        await commands.mockRunRegistered(command, node);
        expect(solutionManager.getDocManager).toHaveBeenCalledTimes(1);
        expect(initialize).not.toHaveBeenCalled();
        expect(window.showErrorMessage).not.toHaveBeenCalled();
    });

});
