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

import 'jest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Result } from '../../../../../json-rpc/csolution-rpc-client';
import { ComponentRowDataType } from '../../../data/component-tools';
import { renderWarningCell, validationIds } from './render-warning-cell';

const makeRow = (
    name: string,
    validation?: Result,
    children: ComponentRowDataType[] = []
): ComponentRowDataType => ({
    key: name,
    name,
    data: {
        id: name,
        pack: 'Vendor::Pack@1.0.0',
    },
    aggregate: {
        id: name,
        name,
        variants: [],
    },
    parsed: {
        vendor: 'Vendor',
        class: 'Class',
    },
    variants: [],
    children,
    validation,
});

const renderIcon = (record: ComponentRowDataType) => {
    const { container } = render(<>{renderWarningCell(record, undefined)}</>);
    return container;
};

describe('renderWarningCell', () => {
    it('renders a warning icon for an individual SELECTABLE validation', () => {
        const record = makeRow('Warning', { id: 'Warning', result: 'SELECTABLE' });

        expect(renderIcon(record).querySelector('.codicon-warning')).not.toBeNull();
    });

    it('renders an error icon for an individual error validation', () => {
        const record = makeRow('Error', { id: 'Error', result: 'MISSING' });

        expect(renderIcon(record).querySelector('.codicon-error')).not.toBeNull();
    });

    it('renders a warning icon for a parent with warning-only descendants', () => {
        const record = makeRow('Group', undefined, [
            makeRow('Warning', { id: 'Warning', result: 'SELECTABLE' }),
        ]);

        expect(renderIcon(record).querySelector('.codicon-warning')).not.toBeNull();
    });

    it('renders an error icon for a parent containing errors and warnings', () => {
        const record = makeRow('Group', undefined, [
            makeRow('Warning', { id: 'Warning', result: 'SELECTABLE' }),
            makeRow('Error', { id: 'Error', result: 'MISSING' }),
        ]);

        const container = renderIcon(record);
        expect(container.querySelector('.codicon-error')).not.toBeNull();
        expect(container.querySelector('.codicon-warning')).toBeNull();
    });

    it('shows only error validation details when errors and warnings coexist', () => {
        const record = makeRow('Group', undefined, [
            makeRow('Warning', { id: 'Warning', result: 'SELECTABLE' }),
            makeRow('Error', { id: 'Error', result: 'MISSING' }),
        ]);

        render(<ul>{validationIds(record, undefined)}</ul>);

        expect(screen.getByText(/component not found/)).toBeTruthy();
        expect(screen.queryByText(/requires selection/)).toBeNull();
    });
});
