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

class TestSolutionOutlineItemBuilder extends SolutionOutlineItemBuilder {
    constructor(context?: string) {
        super(undefined, undefined, context);
    }

    public applyContextExclusion(outlineItem: COutlineItem, sourceItem?: ITreeItem<CTreeItem>): void {
        super.applyContextExclusion(outlineItem, sourceItem);
    }
}

describe('SolutionOutlineItemBuilder', () => {
    const context = 'Project.Debug+Target';

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
