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
import { createItemCommand, solutionOutlineUriScheme, TreeViewProviderImpl } from './treeview-provider';
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

describe('TreeViewProviderImpl tooltip rendering', () => {
    it('uses markdown tooltip with theme icons enabled when tooltip text is available', () => {
        const provider = new TreeViewProviderImpl<COutlineItem>('cmsis.test');
        const node = new COutlineItem('file');
        node.setAttribute('label', 'node');
        node.setAttribute('tooltip', 'tooltip with $(link-external)');

        const treeItem = provider.getTreeItem(node);
        const tooltip = treeItem.tooltip as vscode.MarkdownString;

        expect(String(tooltip)).toBe('tooltip with $(link-external)');
        expect(tooltip.supportThemeIcons).toBe(true);
    });

    it('does not set a tooltip when tooltip text is missing', () => {
        const provider = new TreeViewProviderImpl<COutlineItem>('cmsis.test');
        const node = new COutlineItem('file');
        node.setAttribute('label', 'node');

        const treeItem = provider.getTreeItem(node);

        expect(treeItem.tooltip).toBeUndefined();
    });

    it.each(['group', 'component'])('uses the label instead of the synthetic URI as the %s tooltip', tag => {
        const provider = new TreeViewProviderImpl<COutlineItem>('cmsis.test');
        const node = new COutlineItem(tag);
        node.setAttribute('label', 'Outline item');

        const treeItem = provider.getTreeItem(node);

        expect(treeItem.tooltip).toBe('Outline item');
        expect(String(treeItem.tooltip)).not.toContain(solutionOutlineUriScheme);
    });
});

describe('TreeViewProviderImpl resource URI', () => {
    it('preserves file URIs for resource-backed items', () => {
        const provider = new TreeViewProviderImpl<COutlineItem>('cmsis.test');
        const filePath = path.join('tmp', 'device.h');
        const node = new COutlineItem('file');
        node.setAttribute('resourcePath', filePath);

        const treeItem = provider.getTreeItem(node);

        expect(treeItem.resourceUri?.scheme).toBe('file');
        expect(treeItem.resourceUri?.fsPath).toBe(filePath);
    });

    it('assigns unique structural URIs to groups with duplicate labels', () => {
        const provider = new TreeViewProviderImpl<COutlineItem>('cmsis.test');
        const root = new COutlineItem('root');
        const firstGroup = root.createChild('group');
        const secondGroup = root.createChild('group');
        firstGroup.setAttribute('label', 'Sources');
        secondGroup.setAttribute('label', 'Sources');

        const firstTreeItem = provider.getTreeItem(firstGroup);
        const secondTreeItem = provider.getTreeItem(secondGroup);

        expect(firstTreeItem.resourceUri?.scheme).toBe(solutionOutlineUriScheme);
        expect(firstTreeItem.resourceUri?.path).toBe('/group/0');
        expect(secondTreeItem.resourceUri?.path).toBe('/group/1');
    });

    it('assigns a structural URI without a command to components', () => {
        const provider = new TreeViewProviderImpl<COutlineItem>('cmsis.test');
        const components = new COutlineItem('components');
        const component = components.createChild('component');
        component.setAttribute('label', 'Device:Startup');

        const treeItem = provider.getTreeItem(component);

        expect(treeItem.resourceUri?.scheme).toBe(solutionOutlineUriScheme);
        expect(treeItem.resourceUri?.path).toBe('/component/0');
        expect(treeItem.command).toBeUndefined();
    });

    it('keeps group and component identity structural when resource paths are present', () => {
        const provider = new TreeViewProviderImpl<COutlineItem>('cmsis.test');
        const group = new COutlineItem('group');
        group.setAttribute('resourcePath', path.join('tmp', 'group.yml'));

        const treeItem = provider.getTreeItem(group);

        expect(treeItem.resourceUri?.scheme).toBe(solutionOutlineUriScheme);
    });

    it('does not assign a URI to structural container nodes', () => {
        const provider = new TreeViewProviderImpl<COutlineItem>('cmsis.test');
        const components = new COutlineItem('components');

        const treeItem = provider.getTreeItem(components);

        expect(treeItem.resourceUri).toBeUndefined();
    });
});
