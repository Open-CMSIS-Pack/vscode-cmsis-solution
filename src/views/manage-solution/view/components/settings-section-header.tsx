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
import { Button, Checkbox, Tooltip, type CheckboxChangeEvent } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import type { SettingsSection } from '../../settings-contract';
import { CmsisCodicon } from '../../../common/components/cmsis-codicon';
import { SettingsAddMenu } from './settings-add-menu';

export type SettingsSectionHeaderProps = {
    section: SettingsSection;
    onAction: (id: string, value?: boolean) => void;
    collapsible?: boolean;
    expanded?: boolean;
    onExpand?: () => void;
    navigation?: boolean;
};

/** Renders section state and actions, keeping activation separate from expansion and navigation. */
export const SettingsSectionHeader = ({ section, onAction, collapsible, expanded, onExpand, navigation }: SettingsSectionHeaderProps) => {
    const label = section.childCount === undefined ? section.label : `${section.label} (${section.childCount})`;
    const showToggle = section.selected !== undefined && !!section.toggleAction;
    const showExpand = !navigation && collapsible;
    const showAdd = section.childCount !== undefined || section.addActions.length > 0;
    const expandLabel = `${expanded ? 'Collapse' : 'Expand'} ${section.label}`;
    const expandIcon = expanded ? 'chevron-down' : 'chevron-right';
    const removeLabel = `Remove ${section.label}`;

    /** Keeps header controls from selecting a surrounding navigation row. */
    function stopHeaderEvent(event: React.SyntheticEvent): void {
        event.stopPropagation();
    }

    /** Dispatches an enabled state when the host provides the section's toggle action. */
    function handleToggle(event: CheckboxChangeEvent): void {
        if (section.toggleAction) {
            onAction(section.toggleAction, event.target.checked);
        }
    }

    /** Expands or collapses content without selecting a surrounding navigation row. */
    function handleExpand(event: React.MouseEvent<HTMLButtonElement>): void {
        event.stopPropagation();
        onExpand?.();
    }

    /** Dispatches section removal when the host provides its action. */
    function handleRemove(): void {
        if (section.removeAction) {
            onAction(section.removeAction);
        }
    }

    return (
        <div className='settings-section-header'>
            {(navigation || showToggle) && (
                <span
                    className='settings-checkbox-slot'
                    onClick={stopHeaderEvent}
                    onKeyDown={stopHeaderEvent}
                >
                    {showToggle && (
                        <Checkbox
                            aria-label={`Enable ${section.label}`}
                            checked={section.selected}
                            onChange={handleToggle}
                        />
                    )}
                </span>
            )}

            {showExpand ? (
                <button
                    type='button'
                    className='settings-expand'
                    aria-label={expandLabel}
                    title={section.description}
                    aria-expanded={expanded}
                    onClick={handleExpand}
                >
                    <CmsisCodicon name={expandIcon} />
                    <span className='settings-label'>{label}</span>
                </button>
            ) : (
                <>
                    {!navigation && <span className='settings-chevron-slot' />}
                    <span
                        className='settings-label'
                        title={section.description}
                    >
                        {label}
                    </span>
                </>
            )}

            {section.warning && (
                <Tooltip title={section.warning}>
                    <span
                        role='status'
                        aria-label={section.warning}
                        className='settings-warning'
                    >
                        <WarningOutlined />
                        {section.warning}
                    </span>
                </Tooltip>
            )}

            <span
                className='settings-actions'
                onClick={stopHeaderEvent}
                onKeyDown={stopHeaderEvent}
            >
                {showAdd && (
                    <SettingsAddMenu
                        label={section.label}
                        actions={section.addActions}
                        onAction={onAction}
                    />
                )}
                {section.removeAction && (
                    <Button
                        type='text'
                        size='small'
                        aria-label={removeLabel}
                        title={removeLabel}
                        icon={<CmsisCodicon name='trash' />}
                        onClick={handleRemove}
                    />
                )}
            </span>
        </div>
    );
};
