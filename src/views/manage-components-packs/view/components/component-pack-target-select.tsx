/**
 * Copyright (C) 2025-2026 Arm Limited
 */

import { TreeSelect } from 'antd';
import { DataNode } from 'antd/es/tree';
import * as React from 'react';
import { MessageHandler } from '../../../message-handler';
import { TargetSetData } from '../../components-data';
import { IncomingMessage, OutgoingMessage } from '../../messages';

interface ComponentPackTargetSelectProps {
    state: {
        selectedTargetType?: TargetSetData;
        availableTargetTypes: TargetSetData[];
    };
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>;
}

export const ComponentPackTargetSelect: React.FC<ComponentPackTargetSelectProps> = ({ state, messageHandler }) => {
    const handleContextChange = (_value: string, targetSet: (TargetSetData & DataNode)) => {
        messageHandler.push({
            type: 'CHANGE_TARGET',
            targetSet: targetSet
        });
    };

    const filename = (path: string | undefined) => path?.split(/[/\\]+/).pop() || path;

    return (<TreeSelect
        style={{ width: '100%' }}
        rootClassName='hide-tree-switcher'
        onSelect={handleContextChange}
        value={filename(state.selectedTargetType?.relativePath)}
        treeCheckable={false}
        showCheckedStrategy={TreeSelect.SHOW_ALL}
        dropdownAlign={{ points: ['tl', 'bl'] }}
        multiple={false}
        styles={{
            popup: {
                root: { maxHeight: 400, overflow: 'auto' },
            },
        }}
        treeData={state.availableTargetTypes.map(ctx => ({
            ...ctx,
            title: filename(ctx.relativePath),
            key: ctx.label,
            value: ctx.label,
            children: ctx.children?.map(layer => ({
                ...layer,
                title: filename(layer.relativePath),
                key: layer.label,
                value: layer.label,
            }))
        }))}
        placeholder="Please select"
        treeDefaultExpandAll
        onChange={() => { }}
    />);
};
