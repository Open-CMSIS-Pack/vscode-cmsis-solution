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

import { COutlineItem } from './solution-outline-item';

describe('COutlineItem', () => {
    let rootItem: COutlineItem;
    let childItem: COutlineItem;

    beforeEach(() => {
        rootItem = new COutlineItem('root');
        childItem = new COutlineItem('child', rootItem);
    });

    it('creates an instance of COutlineItem', () => {
        expect(rootItem).toBeInstanceOf(COutlineItem);
        expect(rootItem.getTag()).toBe('root');
    });

    it('creates a new child item correctly', () => {
        const newItem = rootItem.createItem('newChild');
        expect(newItem).toBeInstanceOf(COutlineItem);
        expect(newItem.getTag()).toBe('newChild');
    });

    it('returns undefined for non-existent child item', () => {
        expect(rootItem.getChildItem('nonExistent')).toBeUndefined();
    });

    it('retrieves parent item correctly', () => {
        expect(childItem.getParentItem()).toBe(rootItem);
    });

    it('returns undefined if parent does not exist', () => {
        expect(rootItem.getParentItem()).toBeUndefined();
    });

    it('retrieves context attribute correctly', () => {
        childItem.addFeature('testContext');
        expect(childItem.getFeatures()).toBe('testContext');
        childItem.addFeature('anotherContext');
        expect(childItem.getFeatures()).toBe('testContext;anotherContext');
    });

    it('returns undefined if features attribute is not set', () => {
        expect(childItem.getFeatures()).toEqual('');
    });

    it('sorts groups before files and keeps labels alphabetical', () => {
        rootItem.createChild('group').setAttribute('label', 'Z_subfolder3');

        const fileA = rootItem.createChild('fileA');
        fileA.setTag('file');
        fileA.setAttribute('label', 'A_file1');

        rootItem.createChild('group').setAttribute('label', 'X_subfolder1');

        const fileC = rootItem.createChild('fileC');
        fileC.setTag('file');
        fileC.setAttribute('label', 'C_file3');

        rootItem.createChild('group').setAttribute('label', 'Y_subfolder2');

        const fileB = rootItem.createChild('fileB');
        fileB.setTag('file');
        fileB.setAttribute('label', 'B_file2');

        rootItem.sortChildrenByGroupThenLabel();

        const labels = rootItem.getChildren().map((item) => item.getAttribute('label'));
        expect(labels).toEqual([
            'X_subfolder1',
            'Y_subfolder2',
            'Z_subfolder3',
            'A_file1',
            'B_file2',
            'C_file3',
        ]);
    });
});
