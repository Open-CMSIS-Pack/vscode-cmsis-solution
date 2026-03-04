/**
 * Copyright (C) 2025-2026 Arm Limited
 */
import React from 'react';
import { ComponentRowDataType } from '../../../data/component-tools';
import { CompactDropdown } from '../../../../common/components/compact-dropdown';

/**
 * Renders the variant cell with a dropdown if there are multiple variants available.
 * If there is only one variant, it displays the variant name.
 * If there are no variants, it returns an empty fragment.
 * @param value The variant value to render
 * @param record The record of the row
 * @param _index The index of the row
 * @param onChangeBundle Callback for bundle change
 * @param onChangeComponentVariant Callback for variant change
 * @returns The rendered cell with the variant name or a dropdown
 */
export const renderVariantCell = (
    value: string | undefined,
    record: ComponentRowDataType,
    _index: number,
    onChangeBundle: (record: ComponentRowDataType, bundle: string) => void,
    onChangeComponentVariant: (record: ComponentRowDataType, variant: string) => void
): React.ReactNode => {
    const defaultLabel = '<empty>';

    if (!record.variants) return null;
    if (record.variants.filter(Boolean).length === 0) return null;
    const menuItems = record.variants.map((v) => ({ key: v, label: v || defaultLabel }));

    const onChange = (newValue: string) => {
        if (record.children && record.children.length > 0) {
            onChangeBundle(record, newValue);
        } else {
            onChangeComponentVariant(record, newValue);
        }
    };

    return (

        <CompactDropdown
            available={menuItems.map(item => item.key)}
            selected={value || defaultLabel}
            unselectedLabel={defaultLabel}
            onChange={onChange}
            style={{ width: 'calc(100% - 16px)' }}
        />
    );
};
