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

import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import { TargetSetData } from '../../components-data';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { ComponentPackTargetSelect } from './component-pack-target-select';

const treeSelect = jest.fn();

jest.mock('antd', () => ({
    TreeSelect: Object.assign((props: unknown) => {
        treeSelect(props);
        return <div data-testid='tree-select' />;
    }, { SHOW_ALL: 'SHOW_ALL' }),
}));

describe('ComponentPackTargetSelect', () => {
    beforeEach(() => {
        treeSelect.mockClear();
    });

    it('shows filenames as labels and guidance as the selected value tooltip', () => {
        const layer: TargetSetData = {
            label: 'Layer',
            key: 'layer',
            path: 'path/to/layer.clayer.yml',
            relativePath: 'path/to/layer.clayer.yml',
            type: 'layer',
        };
        const project: TargetSetData = {
            label: 'Project',
            key: 'project',
            path: 'path/to/project.cproject.yml',
            relativePath: 'path/to/project.cproject.yml',
            type: 'project',
            children: [layer],
        };

        render(
            <ComponentPackTargetSelect
                state={{ selectedTargetType: project, availableTargetTypes: [project] }}
                messageHandler={new MockMessageHandler<IncomingMessage, OutgoingMessage>()}
            />
        );

        expect(screen.getByTestId('tree-select')).toBeTruthy();
        expect(treeSelect).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Select csolution project partition to modify',
            value: 'project.cproject.yml',
            treeData: [expect.objectContaining({
                title: 'project.cproject.yml',
                children: [expect.objectContaining({ title: 'layer.clayer.yml' })],
            })],
        }));
    });
});
