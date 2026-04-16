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

import path from 'path';
import { createItemCommand } from './treeview-provider';
import { COutlineItem } from './tree-structure/solution-outline-item';

describe('createItemCommand', () => {
    it('uses explicit command from item attributes when provided', () => {
        const node = new COutlineItem('file');
        node.setAttribute('command', 'cmsis-csolution.someExplicitCommand');
        node.setAttribute('description', 'Run explicit action');

        const command = createItemCommand(node);

        expect(command?.command).toBe('cmsis-csolution.someExplicitCommand');
        expect(command?.arguments).toEqual([node]);
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

        expect(command?.command).toBe('markdown.showPreview');
    });

    it('routes non-markdown files through smart source open command', () => {
        const sourceNode = new COutlineItem('file');
        sourceNode.setAttribute('resourcePath', path.join('tmp', 'device.h'));

        const command = createItemCommand(sourceNode);

        expect(command?.command).toBe('cmsis-csolution.openSourceFileSmart');
    });
});
