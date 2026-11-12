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
import type { SettingsSection as Section } from '../../settings-contract';
import type { SettingsDraft } from '../state/settings-reducer';
import type { SettingsCallbacks } from './settings-callbacks';
import { SettingsField } from './settings-field';
import { SettingsSectionHeader } from './settings-section-header';

export type SettingsSectionProps = SettingsCallbacks & {
    section: Section;
    drafts: Record<string, SettingsDraft>;
    expanded: Record<string, boolean>;
    onExpand: (id: string) => void;
    embedded?: boolean;
};

/** Displays a section's fields and nested content containers, using the supplied expansion state. */
export const SettingsSection = ({ section, drafts, expanded, embedded = false, onExpand, ...callbacks }: SettingsSectionProps) => {
    const children = embedded || section.childrenLayout === 'content' ? section.children : [];
    const collapsible = section.fields.length > 0 || children.length > 0;
    const open = !embedded || !!expanded[section.id];
    const className = embedded ? 'settings-container' : 'settings-content-section';

    /** Toggles only this content container's expansion state. */
    function handleExpand(): void {
        onExpand(section.id);
    }

    return (
        <section className={className}>
            {embedded && (
                <SettingsSectionHeader
                    section={section}
                    onAction={callbacks.onAction}
                    collapsible={collapsible}
                    expanded={open}
                    onExpand={handleExpand}
                />
            )}

            {!embedded && section.warning && (
                <p
                    className='settings-warning'
                    role='status'
                >
                    {section.warning}
                </p>
            )}

            {open && (
                <div className='settings-section-body'>
                    {section.fields.map(field => (
                        <SettingsField
                            key={field.id}
                            field={field}
                            draft={drafts[field.id]}
                            {...callbacks}
                        />
                    ))}

                    {children.map(child => (
                        <SettingsSection
                            key={child.id}
                            section={child}
                            drafts={drafts}
                            expanded={expanded}
                            onExpand={onExpand}
                            embedded
                            {...callbacks}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
