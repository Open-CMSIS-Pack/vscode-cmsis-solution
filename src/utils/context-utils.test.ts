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

import { CTreeItem, ITreeItem } from '../generic/tree-item';
import { matchesContext } from './context-utils';

describe('matchesContext (CMSIS context forms)', () => {
    // Mock ITreeItem<CTreeItem>
    function makeItem(forContext?: string[], notForContext?: string[]): ITreeItem<CTreeItem> {
        return {
            getValuesAsArray: (key: string) => {
                if (key === 'for-context') return forContext || [];
                if (key === 'not-for-context') return notForContext || [];
                return [];
            }
        } as unknown as ITreeItem<CTreeItem>;
    }

    const context = 'Hello.Debug+CS300';

    it('matches project-name', () => {
        expect(matchesContext(makeItem(['Hello']), context)).toBe(true);
        expect(matchesContext(makeItem(['Other']), context)).toBe(false);
    });

    it('matches .build-type', () => {
        expect(matchesContext(makeItem(['.Debug']), context)).toBe(true);
        expect(matchesContext(makeItem(['.Release']), context)).toBe(false);
    });

    it('matches +target-type', () => {
        expect(matchesContext(makeItem(['+CS300']), context)).toBe(true);
        expect(matchesContext(makeItem(['+Other']), context)).toBe(false);
    });

    it('matches project-name.build-type', () => {
        expect(matchesContext(makeItem(['Hello.Debug']), context)).toBe(true);
        expect(matchesContext(makeItem(['Hello.Release']), context)).toBe(false);
    });

    it('matches project-name+target-type', () => {
        expect(matchesContext(makeItem(['Hello+CS300']), context)).toBe(true);
        expect(matchesContext(makeItem(['Hello+Other']), context)).toBe(false);
    });

    it('matches .build-type+target-type', () => {
        expect(matchesContext(makeItem(['.Debug+CS300']), context)).toBe(true);
        expect(matchesContext(makeItem(['.Debug+Other']), context)).toBe(false);
    });

    it('matches project-name.build-type+target-type', () => {
        expect(matchesContext(makeItem(['Hello.Debug+CS300']), context)).toBe(true);
        expect(matchesContext(makeItem(['Hello.Debug+Other']), context)).toBe(false);
    });

    it('matches all if nothing specified', () => {
        expect(matchesContext(makeItem([]), context)).toBe(true);
        expect(matchesContext(makeItem(undefined), context)).toBe(true);
    });

    it('excludes if not-for-context matches', () => {
        expect(matchesContext(makeItem(undefined, ['Hello.Debug']), context)).toBe(false);
        expect(matchesContext(makeItem(undefined, ['.Debug']), context)).toBe(false);
        expect(matchesContext(makeItem(undefined, ['+CS300']), context)).toBe(false);
        expect(matchesContext(makeItem(undefined, ['Hello']), context)).toBe(false);
        expect(matchesContext(makeItem(undefined, ['.Release']), context)).toBe(true);
    });

    it('matches regex pattern in for-context (\\.*D.*)', () => {
        expect(matchesContext(makeItem(['\\.*D.*']), context)).toBe(true);
        expect(matchesContext(makeItem(['\\.*D.*']), 'Hello.Release+CS300')).toBe(false);
    });
});

