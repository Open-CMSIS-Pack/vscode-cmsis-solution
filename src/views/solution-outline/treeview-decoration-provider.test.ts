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

import * as path_utils from '../../utils/path-utils';
import { TreeViewFileDecorationProvider } from './treeview-decoration-provider';
import { FileDecorationProviderManager } from '../../vscode-api/file-decoration-provider-manager';
import { ThemeProvider } from '../../vscode-api/theme-provider';
import path from 'path';
import { URI } from 'vscode-uri';
import { COutlineItem } from './tree-structure/solution-outline-item';

describe('provideFileDecoration', () => {
    let treeViewDecorationProvider: TreeViewFileDecorationProvider;
    let mockFileDecorationProviderManager: FileDecorationProviderManager;
    let mockThemeProvider: ThemeProvider;

    beforeEach(() => {
        mockFileDecorationProviderManager = {
            registerFileDecorationProvider: jest.fn(),
        };

        mockThemeProvider = {
            getThemeColor: (id: string) => ({ id }),
        };

        treeViewDecorationProvider = new TreeViewFileDecorationProvider(mockFileDecorationProviderManager, mockThemeProvider);
    });

    it('should return a decoration for URIs starting with {CMSIS_PACK_ROOT}', async () => {
        const packCachePath = 'MOCKED_CMSIS_PACK_ROOT';
        jest.spyOn(path_utils, 'getCmsisPackRoot').mockReturnValue(packCachePath);

        const filePath = path.join(packCachePath, 'root', 'myFile.c');
        const uri = URI.file(filePath);

        const result = treeViewDecorationProvider.provideFileDecoration(uri);

        expect(result).toEqual({
            badge: TreeViewFileDecorationProvider.badge,
            tooltip: TreeViewFileDecorationProvider.tooltip,
            color: { id: TreeViewFileDecorationProvider.themeColor },
        });
    });

    it('should return undefined for URIs not starting with {CMSIS_PACK_ROOT}', () => {
        const filePath = path.join('path', 'to', 'myfile.c');
        const uri = URI.file(filePath);

        const result = treeViewDecorationProvider.provideFileDecoration(uri);
        expect(result).toBeUndefined();
    });

    it('should return excluded decoration for files marked as excluded', () => {
        const filePath = path.join('src', 'excluded', 'file.c');
        const uri = URI.file(filePath);

        // Create mock tree with excluded file
        const root = new COutlineItem('root');
        const project = root.createChild('project');
        const group = project.createChild('group');
        const file = group.createChild('file');
        file.setTag('file');
        file.setAttribute('resourcePath', uri.fsPath);
        file.setAttribute('excluded', '1');

        treeViewDecorationProvider.setTreeRoot(root);

        const result = treeViewDecorationProvider.provideFileDecoration(uri);

        expect(result).toEqual({
            badge: TreeViewFileDecorationProvider.excludedBadge,
            tooltip: TreeViewFileDecorationProvider.excludedTooltip,
            color: { id: TreeViewFileDecorationProvider.excludedColor },
        });
    });

    it('should prioritize excluded decoration over pack-sourced decoration', () => {
        const packCachePath = 'MOCKED_CMSIS_PACK_ROOT';
        jest.spyOn(path_utils, 'getCmsisPackRoot').mockReturnValue(packCachePath);

        const filePath = path.join(packCachePath, 'root', 'excluded.c');
        const uri = URI.file(filePath);

        // Create mock tree with excluded file from pack
        const root = new COutlineItem('root');
        const project = root.createChild('project');
        const group = project.createChild('group');
        const file = group.createChild('file');
        file.setTag('file');
        file.setAttribute('resourcePath', uri.fsPath);
        file.setAttribute('excluded', '1');

        treeViewDecorationProvider.setTreeRoot(root);

        const result = treeViewDecorationProvider.provideFileDecoration(uri);

        // Should return excluded decoration, not pack decoration
        expect(result).toEqual({
            badge: TreeViewFileDecorationProvider.excludedBadge,
            tooltip: TreeViewFileDecorationProvider.excludedTooltip,
            color: { id: TreeViewFileDecorationProvider.excludedColor },
        });
    });

    it('should not return excluded decoration for non-excluded files', () => {
        const filePath = path.join('src', 'included', 'file.c');
        const uri = URI.file(filePath);

        // Create mock tree with non-excluded file
        const root = new COutlineItem('root');
        const project = root.createChild('project');
        const group = project.createChild('group');
        const file = group.createChild('file');
        file.setTag('file');
        file.setAttribute('resourcePath', uri.fsPath);
        // No 'excluded' attribute

        treeViewDecorationProvider.setTreeRoot(root);

        const result = treeViewDecorationProvider.provideFileDecoration(uri);

        expect(result).toBeUndefined();
    });

    it('should handle deeply nested file structures', () => {
        const filePath = path.join('src', 'deep', 'nested', 'path', 'file.c');
        const uri = URI.file(filePath);

        // Create deeply nested tree
        const root = new COutlineItem('root');
        const project = root.createChild('project');
        const group1 = project.createChild('group1');
        const group2 = group1.createChild('group2');
        const group3 = group2.createChild('group3');
        const file = group3.createChild('file');
        file.setTag('file');
        file.setAttribute('resourcePath', uri.fsPath);
        file.setAttribute('excluded', '1');

        treeViewDecorationProvider.setTreeRoot(root);

        const result = treeViewDecorationProvider.provideFileDecoration(uri);

        expect(result).toEqual({
            badge: TreeViewFileDecorationProvider.excludedBadge,
            tooltip: TreeViewFileDecorationProvider.excludedTooltip,
            color: { id: TreeViewFileDecorationProvider.excludedColor },
        });
    });

    it('should return undefined when tree is not set', () => {
        const filePath = path.join('src', 'file.c');
        const uri = URI.file(filePath);

        // No tree set
        const result = treeViewDecorationProvider.provideFileDecoration(uri);

        expect(result).toBeUndefined();
    });

    it('should refresh decorations when setTreeRoot is called', () => {
        const refreshSpy = jest.spyOn(
            treeViewDecorationProvider as TreeViewFileDecorationProvider,
            'refresh'
        );

        const root = new COutlineItem('root');
        treeViewDecorationProvider.setTreeRoot(root);

        expect(refreshSpy).toHaveBeenCalled();
    });
});
