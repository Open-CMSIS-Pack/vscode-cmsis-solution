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

import { ComponentRowDataType } from '../../data/component-tools';
import { rowClassName } from './components-packs-helpers';

const makeComponent = (layer: string, selectedCount = 1): ComponentRowDataType => ({
    key: 'Vendor::Class:Group@1.0.0',
    name: 'Component',
    data: {
        id: 'Vendor::Class:Group@1.0.0',
        description: '',
        maxInstances: 1,
        pack: 'Vendor::Pack@1.0.0',
    },
    parsed: {
        vendor: 'Vendor',
        class: 'Class',
        group: 'Group',
        bundle: '',
        variant: '',
        version: '1.0.0',
    },
    variants: [],
    aggregate: {
        id: 'Vendor::Class:Group',
        name: 'Component',
        variants: [],
        options: { layer },
        selectedCount,
    },
});

describe('rowClassName', () => {
    const state = {
        selectedTargetType: {
            label: 'Layer: Active',
            key: 'active.clayer.yml',
            path: 'active.clayer.yml',
            relativePath: 'active.clayer.yml',
            type: 'layer' as const,
        },
    };

    it('highlights selected rows used in the active layer', () => {
        expect(rowClassName(makeComponent('active.clayer.yml'), state)).toBe('leaf-node current-layer-row');
    });

    it('leaves rows outside the active layer without a highlight class', () => {
        expect(rowClassName(makeComponent('other.clayer.yml'), state)).toBe('leaf-node');
    });

    it('leaves unselected rows without a highlight class', () => {
        expect(rowClassName(makeComponent('other.clayer.yml', 0), state)).toBe('leaf-node');
    });
});
