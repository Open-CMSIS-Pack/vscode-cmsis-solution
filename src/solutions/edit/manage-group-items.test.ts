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

import 'jest';
import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { parseYamlToCTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item-yaml-parser';
import {
    FileOrGroup,
    GroupItemData,
    addItemToExistingGroup,
    deleteItemFromExistingGroup,
    findGroup,
} from './manage-group-items';

const fileDataFactory = (options: Partial<GroupItemData> = {}): GroupItemData => ({
    name: 'newFile.c',
    forContext: [],
    notForContext: [],
    ...options,
});

const projectTopItem = (yaml: string): CTreeItem => {
    const rootItem = parseYamlToCTreeItem(yaml);
    const topItem = rootItem?.getChild('project');
    if (!(topItem instanceof CTreeItem)) {
        throw new Error('Project item was not parsed');
    }
    return topItem;
};

describe('manage group items', () => {
    it('finds a nested group', () => {
        const topItem = projectTopItem(`
project:
  groups:
    - group: Parent
      groups:
        - group: Child
`);

        expect(findGroup(topItem, ['Parent', 'Child'])?.getValue('group')).toBe('Child');
        expect(findGroup(topItem, ['Parent', 'Missing'])).toBeUndefined();
    });

    it('adds a file to a nested group', () => {
        const topItem = projectTopItem(`
project:
  groups:
    - group: Another Group
    - group: Parent
      groups:
        - group: Child
          files:
            - file: aFile.c
`);
        const file: FileOrGroup = { type: 'file', data: fileDataFactory() };

        expect(addItemToExistingGroup(topItem, ['Parent', 'Child'], file)).toBe('changed');
        expect(topItem.toObject()).toEqual({
            groups: [
                { group: 'Another Group' },
                {
                    group: 'Parent',
                    groups: [{
                        group: 'Child',
                        files: [{ file: 'aFile.c' }, { file: 'newFile.c' }],
                    }],
                },
            ],
        });
    });

    it('adds context restrictions using scalar and sequence forms', () => {
        const topItem = projectTopItem('project: {}');
        const file: FileOrGroup = {
            type: 'file',
            data: fileDataFactory({
                forContext: ['.Build', '.Release'],
                notForContext: '+Target',
            }),
        };

        expect(addItemToExistingGroup(topItem, [], file)).toBe('changed');
        expect(topItem.toObject()).toEqual({
            files: [{
                file: 'newFile.c',
                'for-context': ['.Build', '.Release'],
                'not-for-context': '+Target',
            }],
        });
    });

    it('does not add a duplicate entry', () => {
        const topItem = projectTopItem(`
project:
  files:
    - file: existing.c
`);
        const file: FileOrGroup = {
            type: 'file',
            data: fileDataFactory({ name: 'existing.c' }),
        };

        expect(addItemToExistingGroup(topItem, [], file)).toBe('duplicate');
        expect(topItem.getGrandChildren('files')).toHaveLength(1);
    });

    it('reports an invalid group path without modifying the tree', () => {
        const topItem = projectTopItem('project: {}');
        const before = topItem.toObject();

        expect(addItemToExistingGroup(
            topItem,
            ['Missing'],
            { type: 'group', data: fileDataFactory({ name: 'New Group' }) },
        )).toBe('invalid-path');
        expect(topItem.toObject()).toEqual(before);
    });

    it('removes only the matching nested group', () => {
        const topItem = projectTopItem(`
project:
  groups:
    - group: foo
      files:
        - file: top-level-file.c
    - group: bar
      groups:
        - group: foo
          files:
            - file: nested-file.c
      files:
        - file: bar-file.c
`);

        expect(deleteItemFromExistingGroup(topItem, ['bar'], 'group', 'foo')).toBe('changed');
        expect(topItem.toObject()).toEqual({
            groups: [
                { group: 'foo', files: [{ file: 'top-level-file.c' }] },
                { group: 'bar', files: [{ file: 'bar-file.c' }] },
            ],
        });
    });

    it('removes an empty container after deleting its last item', () => {
        const topItem = projectTopItem(`
project:
  groups:
    - group: Parent
      files:
        - file: only.c
`);

        expect(deleteItemFromExistingGroup(topItem, ['Parent'], 'file', 'only.c')).toBe('changed');
        expect(topItem.toObject()).toEqual({ groups: [{ group: 'Parent' }] });
    });

    it('distinguishes missing entries from invalid paths', () => {
        const topItem = projectTopItem('project: {}');

        expect(deleteItemFromExistingGroup(topItem, [], 'file', 'missing.c')).toBe('not-found');
        expect(deleteItemFromExistingGroup(topItem, ['Missing'], 'file', 'missing.c')).toBe('invalid-path');
    });
});
