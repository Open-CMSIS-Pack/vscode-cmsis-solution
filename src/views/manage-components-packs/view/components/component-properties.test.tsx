/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (C) 2026 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ComponentPropertiesDialog } from './component-properties';
import { ComponentRowDataType } from '../../data/component-tools';

describe('ComponentPropertiesDialog', () => {
    const makeComponent = (): ComponentRowDataType => ({
        key: 'Vendor::Class:Group@1.0.0',
        name: 'My Component',
        data: {
            id: 'Vendor::Class:Group@1.0.0',
            pack: 'Vendor::Pack@1.0.0',
            description: 'Description',
            maxInstances: 0,
        } as any,
        aggregate: {
            id: 'Vendor::Class:Group',
            selectedCount: 1,
            activeVariant: 'Default',
        } as any,
        parsed: {
            vendor: 'Vendor',
            class: 'Class',
            group: 'Group',
            version: '1.0.0',
            variant: 'Default'
        },
        variants: []
    });

    it('calls onClose with current component when OK is clicked', () => {
        const onClose = jest.fn();
        const component = makeComponent();

        render(<ComponentPropertiesDialog component={component} onClose={onClose} />);

        fireEvent.click(screen.getByRole('button', { name: 'OK' }));

        expect(onClose).toHaveBeenCalledWith(true, expect.objectContaining({ key: component.key }), component);
    });

    it('calls onClose with cancelled state and original component on Cancel', () => {
        const onClose = jest.fn();
        const component = makeComponent();

        render(<ComponentPropertiesDialog component={component} onClose={onClose} />);

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onClose).toHaveBeenCalledWith(false, undefined, component);
    });
});
