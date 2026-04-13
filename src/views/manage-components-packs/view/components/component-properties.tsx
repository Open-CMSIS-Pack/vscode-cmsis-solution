/**
 * Copyright 2025-2026 Arm Limited
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

import './components-properties.css';
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, InputNumber, Dropdown, Button, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ComponentRowDataType } from '../../data/component-tools';
import DraggableModalWrapper from './draggable-modal-wrapper';

interface ComponentPropertiesDialogProperties {
    component?: ComponentRowDataType;
    onClose: (confirmed: boolean, updated?: ComponentRowDataType, original?: ComponentRowDataType) => void;
}

export const ComponentPropertiesDialog: React.FC<ComponentPropertiesDialogProperties> = ({ component, onClose }) => {
    const [localComponent, setLocalComponent] = useState<ComponentRowDataType | undefined>(component);

    useEffect(() => {
        setLocalComponent(component);
    }, [component]);

    const handleInputChange = useCallback((value: number | null) => {
        if (localComponent && localComponent.aggregate) {
            setLocalComponent({
                ...localComponent,
                aggregate: {
                    ...localComponent.aggregate,
                    selectedCount: value !== null && value >= 0 ? value : 0,
                },
            });
        }
    }, [localComponent]);

    const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (localComponent && localComponent.aggregate) {
            setLocalComponent({
                ...localComponent,
                aggregate: {
                    ...localComponent.aggregate,
                    selectedCount: e.currentTarget.checked ? 1 : 0,
                },
            });
        }
    }, [localComponent]);

    const handleOk = useCallback(() => {
        onClose(true, localComponent, component);
    }, [onClose, localComponent, component]);

    const handleCancel = useCallback(() => {
        onClose(false, undefined, component);
    }, [onClose, component]);

    const renderCheckboxControll = useCallback(() => (
        <input
            type="checkbox"
            checked={localComponent?.aggregate?.selectedCount === 1}
            onChange={handleCheckboxChange}
            aria-label="Toggle component selection"
        />
    ), [localComponent, handleCheckboxChange]);

    const renderInputControll = useCallback(() => (
        <InputNumber<number>
            min={0}
            max={localComponent?.data.maxInstances}
            value={localComponent?.aggregate?.selectedCount ?? 0}
            onChange={handleInputChange}
            aria-label="Set instance count"
        />
    ), [localComponent, handleInputChange]);

    const renderVariantsControll = useCallback(() => (
        <Dropdown
            menu={{
                items: localComponent?.variants.map((v) => ({ key: v, label: v })),
                onClick: (e) => {
                    if (localComponent && localComponent.aggregate) {
                        setLocalComponent({
                            ...localComponent,
                            aggregate: {
                                ...localComponent.aggregate,
                                activeVariant: e.key,
                            },
                        });
                    }
                },
            }}
            trigger={['click']}
        >
            <Button
                onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                style={{ padding: '0px 8px', height: '23px' }}
                tabIndex={0}
                aria-label="Select variant"
            >
                <Space>
                    <div style={{ overflow: 'hidden' }}>{localComponent?.aggregate.activeVariant}</div>
                    <DownOutlined />
                </Space>
            </Button>
        </Dropdown>
    ), [localComponent]);

    const description = localComponent?.data.description || localComponent?.api?.description || '';

    return (
        <Modal
            title={component ? component.name : ''}
            open={!!component}
            onOk={handleOk}
            onCancel={handleCancel}
            closable={{ 'aria-label': 'Custom Close Button' }}
            keyboard={true}
            transitionName=""
            maskTransitionName=""
            maskClosable={false}
            modalRender={(modal) => <DraggableModalWrapper modal={modal} />}
        >
            {localComponent && (
                <table className='manage-component-properties-table'>
                    <tbody>
                        <tr><td>Component:</td><        td>{localComponent.data.id}</td></tr>
                        <tr><td>Pack:</td><             td>{localComponent.data.pack}</td></tr>
                        <tr><td>Version:</td><          td>{localComponent.parsed.version}</td></tr>
                        <tr><td>Description:</td><      td>{description}</td></tr>
                        <tr><td colSpan={2}><hr /></td></tr>
                        {localComponent.variants.some(Boolean) &&
                            <tr><td>Variant:</td><      td>{renderVariantsControll()}</td></tr>
                        }
                        {localComponent.data.maxInstances
                            ? <tr><td>Instances:</td><  td>{renderInputControll()}</td></tr>
                            : <tr><td>Selected:</td><   td>{renderCheckboxControll()}</td></tr>
                        }
                    </tbody>
                </table>
            )}
        </Modal>
    );
};
