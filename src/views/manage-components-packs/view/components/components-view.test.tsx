/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (C) 2026 Arm Limited
 */

import 'jest';
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import { ComponentRowDataType } from '../../data/component-tools';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { ComponentsView } from './components-view';
import { manageComponentsStateFactory } from '../state/reducer.factories';

jest.mock('./component-pack-target-select', () => ({
    ComponentPackTargetSelect: () => <div data-testid='target-select' />
}));

jest.mock('./table-renderers/render-name-cell', () => ({
    renderNameCell: (value: string) => <span>{value}</span>
}));

jest.mock('./table-renderers/render-warning-cell', () => ({
    renderWarningCell: () => null,
    hasValidation: () => false
}));

jest.mock('./table-renderers/render-description-cell', () => ({
    renderDescriptionCell: (value: string) => <span>{value}</span>
}));

jest.mock('./table-renderers/render-variant-cell', () => ({
    renderVariantCell: (value: string) => <span>{value}</span>
}));

jest.mock('./table-renderers/render-validation-row', () => ({
    renderValidation: () => null
}));

jest.mock('./table-renderers/render-row-selector', () => ({
    rowSelection: () => ({})
}));

jest.mock('../helpers/components-packs-helpers', () => ({
    rowClassName: () => '',
    validationIssuesTooltip: () => 'validation tooltip',
    warningIcon: () => <span data-testid='warn-icon' />,
}));

jest.mock('./table-renderers/render-edit-field', () => ({
    renderEditField: (record: ComponentRowDataType, setSelectedComponent: (component: ComponentRowDataType) => void) => (
        <button type='button' onClick={() => setSelectedComponent(record)}>edit-component</button>
    )
}));

jest.mock('./component-properties', () => ({
    ComponentPropertiesDialog: ({ component, onClose }: {
        component?: ComponentRowDataType;
        onClose: (confirmed: boolean, updated?: ComponentRowDataType, original?: ComponentRowDataType) => void;
    }) => component ? (
        <div>
            <button
                type='button'
                onClick={() => onClose(true, {
                    ...component,
                    aggregate: {
                        ...component.aggregate,
                        selectedCount: (component.aggregate.selectedCount ?? 0) + 1,
                        activeVariant: 'UpdatedVariant',
                    }
                }, component)}
            >
                confirm-component-properties
            </button>
            <button type='button' onClick={() => onClose(false, undefined, component)}>cancel-component-properties</button>
        </div>
    ) : null
}));

describe('ComponentsView', () => {
    const makeComponent = (): ComponentRowDataType => ({
        key: 'Vendor::Class:Group@1.0.0',
        name: 'My Component',
        data: {
            id: 'Vendor::Class:Group@1.0.0',
            description: 'Desc',
            maxInstances: 1,
            pack: 'Vendor::Pack@1.0.0',
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
        variants: ['Default', 'UpdatedVariant']
    });

    const baseProps = () => {
        const listener = jest.fn();
        const messageHandler = new MockMessageHandler<IncomingMessage, OutgoingMessage>(listener);
        const setExpandedRowKeys = jest.fn();
        const setDropdownKey = jest.fn();
        const onChangeComponentValue = jest.fn();
        const onChangeComponentVariant = jest.fn();
        const onChangeBundle = jest.fn();
        const openFile = jest.fn();
        const openDocFile = jest.fn();
        const onSearch = jest.fn();
        const componentRefs = { current: {} as Record<string, HTMLInputElement | null> };

        return {
            messageHandler,
            listener,
            setExpandedRowKeys,
            setDropdownKey,
            onChangeComponentValue,
            onChangeComponentVariant,
            onChangeBundle,
            openFile,
            openDocFile,
            onSearch,
            componentRefs,
        };
    };

    it('applies updates from component properties dialog and triggers callbacks', () => {
        const row = makeComponent();
        const props = baseProps();
        const state = manageComponentsStateFactory({ errorMessages: [] });

        render(
            <ComponentsView
                treeNodes={[row]}
                state={state}
                expandedRowKeys={[]}
                setExpandedRowKeys={props.setExpandedRowKeys}
                dropdownKey={1}
                setDropdownKey={props.setDropdownKey}
                componentRefs={props.componentRefs}
                messageHandler={props.messageHandler}
                validationErrorComponents={[]}
                onChangeComponentValue={props.onChangeComponentValue}
                onChangeComponentVariant={props.onChangeComponentVariant}
                onChangeBundle={props.onChangeBundle}
                openFile={props.openFile}
                openDocFile={props.openDocFile}
                onSearch={props.onSearch}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'edit-component' }));
        fireEvent.click(screen.getByRole('button', { name: 'confirm-component-properties' }));

        expect(props.onChangeComponentValue).toHaveBeenCalledWith(expect.objectContaining({
            aggregate: expect.objectContaining({ selectedCount: 2 })
        }));
        expect(props.onChangeComponentVariant).toHaveBeenCalledWith(row, 'UpdatedVariant');
    });

    it('shows only sorted error messages and hides table when only errors are present', () => {
        const props = baseProps();
        const state = manageComponentsStateFactory({
            errorMessages: [
                { type: 'WARNING', message: 'warning-message' },
                { type: 'ERROR', message: 'z-error' },
                { type: 'INFO', message: 'info-message' },
                { type: 'ERROR', message: 'a-error' },
            ]
        });

        const { container } = render(
            <ComponentsView
                treeNodes={[]}
                state={state}
                expandedRowKeys={[]}
                setExpandedRowKeys={props.setExpandedRowKeys}
                dropdownKey={1}
                setDropdownKey={props.setDropdownKey}
                componentRefs={props.componentRefs}
                messageHandler={props.messageHandler}
                validationErrorComponents={[]}
                onChangeComponentValue={props.onChangeComponentValue}
                onChangeComponentVariant={props.onChangeComponentVariant}
                onChangeBundle={props.onChangeBundle}
                openFile={props.openFile}
                openDocFile={props.openDocFile}
                onSearch={props.onSearch}
            />
        );

        expect(container.querySelector('.ant-table')).toBeNull();
        expect(screen.getByText('a-error')).toBeTruthy();
        expect(screen.getByText('z-error')).toBeTruthy();
        expect(screen.queryByText('warning-message')).toBeNull();
        expect(screen.queryByText('info-message')).toBeNull();
        const content = container.textContent || '';
        expect(content.indexOf('a-error')).toBeLessThan(content.indexOf('z-error'));
    });

    it('dispatches resolve message when Resolve button is clicked', () => {
        const row = makeComponent();
        const props = baseProps();
        const state = manageComponentsStateFactory({ errorMessages: [] });

        render(
            <ComponentsView
                treeNodes={[row]}
                state={state}
                expandedRowKeys={[]}
                setExpandedRowKeys={props.setExpandedRowKeys}
                dropdownKey={1}
                setDropdownKey={props.setDropdownKey}
                componentRefs={props.componentRefs}
                messageHandler={props.messageHandler}
                validationErrorComponents={['Vendor::Class:Group']}
                onChangeComponentValue={props.onChangeComponentValue}
                onChangeComponentVariant={props.onChangeComponentVariant}
                onChangeBundle={props.onChangeBundle}
                openFile={props.openFile}
                openDocFile={props.openDocFile}
                onSearch={props.onSearch}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /Resolve/i }));

        expect(props.listener).toHaveBeenCalledWith({ type: 'RESOLVE_COMPONENTS' });
    });
});
