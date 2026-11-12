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

import * as React from 'react';
import { Button, Dropdown, type MenuProps } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';

export type SettingsAddMenuProps = {
    label: string;
    actions: { label: string; action: string }[];
    onAction: (id: string) => void;
};

/** Offers host-prepared additions, retaining a disabled button when no additions remain. */
export const SettingsAddMenu = ({ label, actions, onAction }: SettingsAddMenuProps) => {
    /** Dispatches the chosen addition without activating its parent section. */
    const handleMenuClick: MenuProps['onClick'] = info => {
        info.domEvent.stopPropagation();
        onAction(info.key);
    };

    /** Opens the menu without activating its parent section. */
    function handleTriggerClick(event: React.MouseEvent<HTMLElement>): void {
        event.stopPropagation();
    }

    const actionLabel = `Add to ${label}`;
    const menu: MenuProps = {
        items: actions.map(item => ({ key: item.action, label: item.label })),
        onClick: handleMenuClick,
    };

    return (
        <Dropdown
            trigger={['click']}
            menu={menu}
            disabled={actions.length === 0}
        >
            <Button
                type='text'
                size='small'
                disabled={actions.length === 0}
                aria-label={actionLabel}
                title={actionLabel}
                icon={<PlusSquareOutlined />}
                onClick={handleTriggerClick}
            />
        </Dropdown>
    );
};
