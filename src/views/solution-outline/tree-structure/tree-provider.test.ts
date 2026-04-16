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

jest.mock('vscode');
import * as vscode from 'vscode';
import { COutlineItem } from './solution-outline-item';
import { createItemCommand } from '../treeview-provider';

describe('createCommand', () => {
    beforeAll(async () => {
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

    it('returns a command from the "command" attribute', () => {
        const element = new COutlineItem('file');
        element.setAttribute('command', 'myCustomCommand').setAttribute('description', 'Run this command');

        const result = createItemCommand(element);

        expect(result).toEqual({
            command: 'myCustomCommand',
            title: 'Run this command',
            arguments: [element],
        });
    });

    it('returns undefined when no command or resourcePath is present', () => {
        const element = new COutlineItem('file');

        const result = createItemCommand(element);

        expect(result).toBeUndefined();
    });

    it('returns undefined for project item', () => {
        const element = new COutlineItem('project');
        const filePath = '/some/path/file.MD';
        element.setAttribute('resourcePath', filePath);

        const result = createItemCommand(element);

        expect(result).toBeUndefined();
    });

    it('returns undefined for layer item', () => {
        const element = new COutlineItem('layer');
        const filePath = '/some/path/file.MD';
        element.setAttribute('resourcePath', filePath);

        const result = createItemCommand(element);

        expect(result).toBeUndefined();
    });


    it('returns markdown preview command for .md files', async () => {
        const element = new COutlineItem('file');
        const filePath = '/some/path/file.MD';
        element.setAttribute('resourcePath', filePath);

        const result = createItemCommand(element);

        expect(result).toMatchObject({
            command: 'markdown.showPreview',
            title: 'Open Preview',
            arguments: [
                {
                    fsPath: filePath,
                    path: filePath,
                },
            ],
        });
    });

    it('returns smart source open command for non-md files', () => {
        const element = new COutlineItem('file');
        const filePath = '/some/path/file.txt';
        element.setAttribute('resourcePath', filePath);

        const result = createItemCommand(element);

        expect(result).toMatchObject({
            command: 'cmsis-csolution.openSourceFileSmart',
            title: 'Open',
            arguments: [
                {
                    fsPath: filePath,
                    path: filePath,
                },
            ],
        });
    });
});
