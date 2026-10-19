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

import React from 'react';
import { render } from '@testing-library/react';
import { ComponentRowDataType } from '../../../data/component-tools';
import { renderNameCell } from './render-name-cell';

const activeLayer = 'active.clayer.yml';
const state = {
    selectedTargetType: {
        label: 'Layer: Active',
        key: activeLayer,
        path: activeLayer,
        relativePath: activeLayer,
        type: 'layer' as const,
    },
};

const makeComponent = (name: string, layer: string, selectedCount = 1): ComponentRowDataType => ({
    key: `Vendor::${name}@1.0.0`,
    name,
    data: {
        id: `Vendor::${name}@1.0.0`,
        description: '',
        maxInstances: 1,
        pack: 'Vendor::Pack@1.0.0',
    },
    parsed: {
        vendor: 'Vendor',
        class: 'Class',
        group: name,
        bundle: '',
        variant: '',
        version: '1.0.0',
    },
    variants: [],
    aggregate: {
        id: `Vendor::${name}`,
        name,
        variants: [],
        options: { layer },
        selectedCount,
    },
});

const openFile = jest.fn();

const renderName = (record: ComponentRowDataType) => render(
    <>{renderNameCell(record.name, record, openFile, state)}</>
);

describe('renderNameCell current-layer highlighting', () => {
    it('bolds a component name belonging to the current layer', () => {
        const { container } = renderName(makeComponent('ActiveComponent', activeLayer));

        const name = container.querySelector('.current-layer-name');

        expect(name?.textContent).toContain('ActiveComponent');
    });

    it('does not bold a component name outside the current layer', () => {
        const { container } = renderName(makeComponent('OtherComponent', 'other.clayer.yml'));

        expect(container.querySelector('.current-layer-name')).toBeNull();
    });

    it('bolds a class or group name containing a current-layer component', () => {
        const parent = makeComponent('Group', 'other.clayer.yml', 0);
        parent.children = [makeComponent('ActiveComponent', activeLayer)];

        const { container } = renderName(parent);

        const name = container.querySelector('.current-layer-name');

        expect(name?.textContent).toContain('Group');
    });

    it('does not bold a class or group name without a current-layer component', () => {
        const parent = makeComponent('Group', 'other.clayer.yml', 0);
        parent.children = [makeComponent('OtherComponent', 'other.clayer.yml')];

        const { container } = renderName(parent);

        expect(container.querySelector('.current-layer-name')).toBeNull();
    });
});
