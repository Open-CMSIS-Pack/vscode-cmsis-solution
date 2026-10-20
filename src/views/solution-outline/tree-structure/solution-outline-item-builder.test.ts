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

import { CTreeItem, ITreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { SolutionOutlineItemBuilder } from './solution-outline-item-builder';
import { COutlineItem } from './solution-outline-item';
import * as path from 'node:path';
import { ETextFileResult, TextFile } from '@open-cmsis-pack/cmsis-common/text-file';
import { DocManager } from '../../../doc-manager/doc-manager';
import { textFileSystemFactory } from '../../../__test__/text-file-system';

class TestSolutionOutlineItemBuilder extends SolutionOutlineItemBuilder {
    constructor(context?: string, docManager?: DocManager) {
        super(undefined, undefined, docManager, context);
    }

    public get documentManager(): DocManager | undefined {
        return this.docManager;
    }

    public applyContextExclusion(outlineItem: COutlineItem, sourceItem?: ITreeItem<CTreeItem>): void {
        super.applyContextExclusion(outlineItem, sourceItem);
    }
}

describe('SolutionOutlineItemBuilder', () => {
    const context = 'Project.Debug+Target';

    afterEach(() => {
        TextFile.setFileSystem();
    });

    it('retains the injected real document manager and its loaded inventory', async () => {
        const docsDirectory = path.resolve('inventory');
        const fileSystem = textFileSystemFactory(new Map([[
            path.join(docsDirectory, 'docs.yml'),
            'docs: {boards: [{board: Vendor::Board, docs: [{name: manual, title: Board manual}]}]}\n',
        ]]));
        TextFile.setFileSystem(fileSystem);
        const docManager = new DocManager();
        expect(await docManager.initialize(docsDirectory)).toBe(ETextFileResult.Success);

        const builder = new TestSolutionOutlineItemBuilder(context, docManager);

        expect(builder.documentManager).toBe(docManager);
        expect(builder.documentManager?.file.getDoc('manual', 'Vendor::Board', 'board')?.title).toBe('Board manual');
        expect(fileSystem.write).not.toHaveBeenCalled();
    });

    function makeSourceItem(forContext: string[]): ITreeItem<CTreeItem> {
        return {
            getValuesAsArray: (key: string) => key === 'for-context' ? forContext : [],
        } as unknown as ITreeItem<CTreeItem>;
    }

    it('inherits exclusion from its parent', () => {
        const parent = new COutlineItem('group');
        parent.setAttribute('excluded', '1');
        const outlineItem = new COutlineItem('file', parent);

        new TestSolutionOutlineItemBuilder(context).applyContextExclusion(
            outlineItem,
            makeSourceItem(['.Debug']),
        );

        expect(outlineItem.getAttribute('excluded')).toBe('1');
    });

    it('excludes an item that does not match the active context', () => {
        const outlineItem = new COutlineItem('file');

        new TestSolutionOutlineItemBuilder(context).applyContextExclusion(
            outlineItem,
            makeSourceItem(['.Release']),
        );

        expect(outlineItem.getAttribute('excluded')).toBe('1');
    });

    it('does not exclude an item that matches the active context', () => {
        const outlineItem = new COutlineItem('file');

        new TestSolutionOutlineItemBuilder(context).applyContextExclusion(
            outlineItem,
            makeSourceItem(['.Debug']),
        );

        expect(outlineItem.getAttribute('excluded')).toBeUndefined();
    });

    it('does not exclude an item when no context is active', () => {
        const outlineItem = new COutlineItem('file');

        new TestSolutionOutlineItemBuilder().applyContextExclusion(
            outlineItem,
            makeSourceItem(['.Release']),
        );

        expect(outlineItem.getAttribute('excluded')).toBeUndefined();
    });

    it('excludes an item without a source when a context is active', () => {
        const outlineItem = new COutlineItem('file');

        new TestSolutionOutlineItemBuilder(context).applyContextExclusion(outlineItem);

        expect(outlineItem.getAttribute('excluded')).toBe('1');
    });
});
