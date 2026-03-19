/**
 * Copyright 2024-2026 Arm Limited
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

import { it } from '@jest/globals';
import { CTreeItemBuilder } from './tree-item-builder';
import { CTreeItem, ETreeItemKind } from './tree-item';

describe('CTreeItemBuilder', () => {
    it('test CTreeItemBuilder generic methods to create items', () => {

        const builder = new CTreeItemBuilder();
        expect(builder.getKind()).toBe(ETreeItemKind.Undefined);
        builder.fileName = './dummyFile';
        builder.preCreateItem();
        builder.createItem('root');
        builder.setProperty('foo', 42);
        for (let i = 1; i < 4; i++) {
            builder.preCreateItem();
            const tag = 'c' + i.toString();
            builder.createItem(tag, ETreeItemKind.Scalar);
            expect(builder.getKind()).toBe(ETreeItemKind.Scalar);

            for (let j = 1; j < 4; j++) {
                builder.preCreateItem();
                expect(builder.getKind()).toBe(ETreeItemKind.Undefined);
                builder.createItem(tag + j.toString());
                builder.setText('text_' + j.toString());
                builder.setAttribute('i', i.toString());
                builder.setAttribute('j', j.toString());
                builder.postCreateItem();
            }
            builder.setAttribute('a', i.toString());
            builder.postCreateItem();
        }
        builder.postCreateItem();

        const root = builder.root;
        expect(root).toBeDefined();
        expect(root).toBeInstanceOf(CTreeItem);
        expect(root!.getProperty('foo')).toBe(42);
        expect(root!.rootFileName).toEqual(builder.fileName);
        expect(root!.getChildren().length).toEqual(3);
        const c12 = root!.findChild(['c1', 'c12']);
        expect(c12).toBeInstanceOf(CTreeItem);
        expect(c12!.getAttribute('i')).toEqual('1');
        expect(c12!.getAttribute('j')).toEqual('2');
        expect(c12!.getText()).toEqual('text_2');
        expect(c12!.getRoot()).toEqual(root);
    });
});
