import React from 'react';
import { ComponentRowDataType } from '../../../data/component-tools';
import { Button } from 'antd';
import { isInActiveLayer } from '../../helpers/components-packs-helpers';
import { TargetSetData } from '../../../components-data';

/**
 * Renders the edit field for a component row.
 * Only renders for leaf nodes in the active layer.
 * @param record The component row data
 * @param setSelectedComponent Callback to set the selected component
 * @param state The current state (for active layer)
 * @returns The rendered edit field button or null
 */
export const renderEditField = (
    record: ComponentRowDataType,
    setSelectedComponent: (component: ComponentRowDataType) => void,
    state: { activeLayer?: string, selectedTargetType: TargetSetData | undefined }
): React.ReactNode => {
    if (record.children?.length) return null;
    return (
        <Button
            onClick={() => setSelectedComponent(record)}
            disabled={!isInActiveLayer(record, state)}
            className='component-properties-edit'
            tabIndex={0}
            aria-label={`Edit properties for ${record.name}`}
        >
            &middot;&middot;&middot;
        </Button>
    );
};
