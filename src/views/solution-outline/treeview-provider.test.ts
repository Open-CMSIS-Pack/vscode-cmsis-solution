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

jest.mock('vscode');

import path from 'path';
import * as vscode from 'vscode';
import { createItemCommand } from './treeview-provider';
import { COutlineItem } from './tree-structure/solution-outline-item';

describe('createItemCommand', () => {
    beforeAll(() => {
        vscode.Uri.file = (filePath: string) => ({
            fsPath: filePath,
            path: filePath,
            scheme: 'file',
            authority: '',
            query: '',
            fragment: '',
            with: () => null as unknown,
            toString: () => filePath,
            toJSON: () => filePath,
        } as unknown as vscode.Uri);
    });

    it('uses explicit command from item attributes when provided', () => {
        const node = new COutlineItem('file');
        node.setAttribute('command', 'cmsis-csolution.someExplicitCommand');
        node.setAttribute('description', 'Run explicit action');

        const command = createItemCommand(node);

        expect(command).toEqual({
            command: 'cmsis-csolution.someExplicitCommand',
            title: 'Run explicit action',
            arguments: [node],
        });
    });

    it('does not create default command for project and layer nodes', () => {
        const projectNode = new COutlineItem('project');
        const layerNode = new COutlineItem('layer');

        expect(createItemCommand(projectNode)).toBeUndefined();
        expect(createItemCommand(layerNode)).toBeUndefined();
    });

    it('does not create command when resource path is missing', () => {
        const fileNode = new COutlineItem('file');

        expect(createItemCommand(fileNode)).toBeUndefined();
    });

    it('opens markdown with markdown preview', () => {
        const markdownNode = new COutlineItem('file');
        markdownNode.setAttribute('resourcePath', path.join('tmp', 'notes.md'));

        const command = createItemCommand(markdownNode);

        expect(command).toMatchObject({
            command: 'markdown.showPreview',
            title: 'Open Preview',
            arguments: [
                {
                    fsPath: path.join('tmp', 'notes.md'),
                    path: path.join('tmp', 'notes.md'),
                },
            ],
        });
    });

    it('routes non-markdown files through smart source open command', () => {
        const sourceNode = new COutlineItem('file');
        sourceNode.setAttribute('resourcePath', path.join('tmp', 'device.h'));

        const command = createItemCommand(sourceNode);

        expect(command).toMatchObject({
            command: 'cmsis-csolution.openSourceFileSmart',
            title: 'Open',
            arguments: [
                {
                    fsPath: path.join('tmp', 'device.h'),
                    path: path.join('tmp', 'device.h'),
                },
            ],
        });
    });
});
