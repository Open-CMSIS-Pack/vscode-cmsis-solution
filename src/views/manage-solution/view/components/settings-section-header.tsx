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
import { settingsSections, type SettingsSection } from '../../settings-contract';
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

/** Returns the first section or field warning in display order throughout a section's subtree. */
function sectionWarning(section: SettingsSection): string | undefined {
    for (const descendant of settingsSections([section])) {
        const warning = descendant.warning || descendant.fields.find(field => field.warning)?.warning;
        if (warning) {
            return warning;
        }
    }
    return undefined;
}

/** Renders section state and actions, keeping activation separate from expansion and navigation. */
export const SettingsSectionHeader = ({ section, onAction, collapsible, expanded, onExpand, navigation }: SettingsSectionHeaderProps) => {
    const label = section.label && section.childCount !== undefined ? `${section.label} (${section.childCount})` : section.label;
    const actionLabel = section.label || section.description || 'section';
    const showToggle = section.selected !== undefined && !!section.toggleAction;
    const showExpand = !navigation && !!section.label && collapsible;
    const showAdd = section.childCount !== undefined || section.addActions.length > 0;
    const showControls = showToggle || showAdd || !!section.removeAction;
    const expandLabel = `${expanded ? 'Collapse' : 'Expand'} ${section.label}`;
    const expandIcon = expanded ? 'chevron-down' : 'chevron-right';
    const removeLabel = `Remove ${actionLabel}`;
    const warningMessage = sectionWarning(section);
    const warning = warningMessage && (
        <Tooltip title={<span className='settings-warning-tooltip'>{warningMessage}</span>}>
            <span
                role='status'
                aria-label={warningMessage}
                className='settings-warning'
            >
                <WarningOutlined />
            </span>
        </Tooltip>
    );

    if (!section.label && !showControls && !warningMessage) {
        return null;
    }

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
                            aria-label={`Enable ${actionLabel}`}
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
                    {!navigation && section.collapsible !== false && section.label && (
                        <span className='settings-chevron-slot' />
                    )}
                    {section.label && (
                        <span
                            className='settings-label'
                            title={section.description}
                        >
                            {label}
                        </span>
                    )}
                </>
            )}

            <span
                className='settings-actions'
                onClick={stopHeaderEvent}
                onKeyDown={stopHeaderEvent}
            >
                {navigation && warning}
                {showAdd && (
                    <SettingsAddMenu
                        label={actionLabel}
                        actions={section.addActions}
                        onAction={onAction}
                    />
                )}
                {!navigation && warning}
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
