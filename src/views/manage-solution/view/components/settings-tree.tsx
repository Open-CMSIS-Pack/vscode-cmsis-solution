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
import { settingsNavigation } from '../state/settings-reducer';
import { SettingsNavigation } from './settings-navigation';
import { SettingsSection } from './settings-section';
import './settings-tree.css';

export type SettingsTreeProps = SettingsCallbacks & {
    sections: Section[];
    activeId?: string;
    expanded: Record<string, boolean>;
    drafts: Record<string, SettingsDraft>;
    onSelect: (id: string) => void;
    onExpand: (id: string) => void;
};

/** Connects recursive section navigation to the selected content pane using presentation data only. */
export const SettingsTree = ({ sections, activeId, expanded, drafts, onSelect, onExpand, ...callbacks }: SettingsTreeProps) => {
    const panelId = `settings-${React.useId().replace(/:/g, '')}`;
    const selected = settingsNavigation(sections).find(entry => entry.section.id === activeId)?.section;
    const labelledBy = selected ? `${panelId}-tab-${selected.id}` : undefined;

    return (
        <div className='settings-tree'>
            <nav
                className='settings-navigation'
                role='tablist'
                aria-orientation='vertical'
                aria-label='Adapter settings'
            >
                <SettingsNavigation
                    sections={sections}
                    activeId={activeId}
                    onSelect={onSelect}
                    onAction={callbacks.onAction}
                    panelId={panelId}
                />
            </nav>

            <div
                className='settings-content'
                role='tabpanel'
                id={panelId}
                aria-labelledby={labelledBy}
            >
                {selected && (
                    <SettingsSection
                        section={selected}
                        drafts={drafts}
                        expanded={expanded}
                        onExpand={onExpand}
                        {...callbacks}
                    />
                )}
            </div>
        </div>
    );
};
