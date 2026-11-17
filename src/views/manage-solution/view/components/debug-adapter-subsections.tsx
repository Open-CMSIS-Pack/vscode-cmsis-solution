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
import { MinusSquareOutlined, PlusSquareOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Checkbox, Dropdown, Tooltip } from 'antd';
import { UISection } from '../../../../debug/debug-adapters-yaml-file';
import { MessageHandler } from '../../../message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';

/** Addresses a section within its root and supplies the backend message transport. */
type SectionProps = {
    section: UISection;
    rootSection: string;
    path: string[];
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>;
};

/** Displays the backend-supplied choices for adding dynamic subsections. */
export const AddDebugAdapterSubsection = ({ section, rootSection, path, messageHandler }: SectionProps) => {
    const addOptions = section.addOptions ?? [];

    return <Dropdown
        trigger={['click']}
        menu={{
            items: addOptions.map(option => ({ key: option.id, label: option.name })),
            onClick: ({ key, domEvent }) => {
                domEvent.stopPropagation();
                messageHandler.push({ type: 'ADD_DEBUG_ADAPTER_SUBSECTION', section: rootSection, subsection: [...path, key] });
            },
        }}
        disabled={addOptions.length === 0}
    >
        <Button
            type='text'
            size='small'
            className='debug-adapter-section-action'
            icon={<PlusSquareOutlined />}
            aria-label='Add subsection'
            title={`Add to ${section.section}`}
            onClick={event => event.stopPropagation()}
        />
    </Dropdown>;
};

/** Renders a tree level with its optional switch, warning, add menu, and allowed removal action. */
export const DebugAdapterSectionLabel = ({ section, rootSection, path, disabled, onToggle, messageHandler }: SectionProps & {
    disabled: boolean;
    onToggle: () => void;
}) => (
    <span
        className={[
            'debug-adapter-section-label',
            ...(path.length > 0 ? ['debug-adapter-subsection-label'] : []),
            ...(section.subsections?.length ? ['debug-adapter-parent-section-label'] : []),
        ].join(' ')}
        style={{ paddingLeft: `${path.length * 1.5}rem` }}
    >
        <Tooltip title={section.warning}>
            <span className='section-checkbox'>
                {section.warning && section.select !== false && <WarningOutlined
                    className='debug-adapter-section-warning'
                    aria-label={section.warning}
                />}
                {section.select !== undefined && (
                    <Checkbox
                        aria-label={path.length > 0 ? section.section : `Enable ${section.section}`}
                        aria-invalid={section.warning && section.select ? true : undefined}
                        checked={section.select}
                        disabled={disabled || (section.subsections?.length === 0 && section.options.length === 0)}
                        onClick={event => event.stopPropagation()}
                        onChange={event => {
                            if (path.length === 0) {
                                onToggle();
                            } else {
                                messageHandler.push({
                                    type: 'SET_DEBUG_ADAPTER_SUBSECTION_ENABLED',
                                    section: rootSection,
                                    subsection: path,
                                    enabled: event.target.checked,
                                });
                            }
                        }}
                    />
                )}
            </span>
        </Tooltip>
        <span className='section-label' title={section.description ?? ''}>{section.section}</span>
        {section.addOptions && <AddDebugAdapterSubsection section={section} rootSection={rootSection} path={path} messageHandler={messageHandler} />}
        {path.length > 0 && section.removable && <Button
            type='text'
            size='small'
            className='debug-adapter-section-action'
            icon={<MinusSquareOutlined />}
            aria-label={`Remove ${section.section}`}
            title={`Remove ${section.section}`}
            onClick={event => {
                event.stopPropagation();
                messageHandler.push({
                    type: 'REMOVE_DEBUG_ADAPTER_SUBSECTION',
                    section: rootSection,
                    subsection: path,
                });
            }}
        />}
    </span>
);
