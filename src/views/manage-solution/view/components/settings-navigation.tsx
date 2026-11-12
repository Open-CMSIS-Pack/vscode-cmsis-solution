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
import type { SettingsSection } from '../../settings-contract';
import { SettingsSectionHeader } from './settings-section-header';

export type SettingsNavigationProps = {
    sections: SettingsSection[];
    activeId?: string;
    onSelect: (id: string) => void;
    onAction: (id: string, value?: boolean) => void;
    depth?: number;
    panelId: string;
};

/** Activates tabs with the keyboard while leaving nested header controls to handle their own keys. */
function handleNavigationKey(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) {
        return;
    }

    const tabs = Array.from(event.currentTarget.closest('[role=tablist]')?.querySelectorAll<HTMLElement>('[role=tab]') ?? []);
    const index = tabs.indexOf(event.currentTarget);
    let next: HTMLElement | undefined;
    switch (event.key) {
        case 'Enter':
        case ' ':
            next = event.currentTarget;
            break;
        case 'ArrowDown':
            next = tabs[(index + 1) % tabs.length];
            break;
        case 'ArrowUp':
            next = tabs[(index - 1 + tabs.length) % tabs.length];
            break;
        case 'Home':
            next = tabs[0];
            break;
        case 'End':
            next = tabs.at(-1);
            break;
    }
    if (next) {
        event.preventDefault();
        next.focus();
        next.click();
    }
}

/** Renders navigable sections recursively with independent header actions and keyboard selection. */
export const SettingsNavigation = ({ sections, activeId, onSelect, onAction, depth = 0, panelId }: SettingsNavigationProps) => {
    return (
        <>
            {sections.map(section => {
                const active = activeId === section.id;
                const tabId = `${panelId}-tab-${section.id}`;
                const className = `settings-navigation-row${active ? ' active' : ''}`;

                return (
                    <React.Fragment key={section.id}>
                        <div
                            role='tab'
                            tabIndex={active ? 0 : -1}
                            aria-selected={active}
                            aria-controls={panelId}
                            id={tabId}
                            aria-label={section.label}
                            className={className}
                            style={{ paddingLeft: depth * 15 }}
                            onClick={() => onSelect(section.id)}
                            onKeyDown={handleNavigationKey}
                        >
                            <SettingsSectionHeader
                                section={section}
                                navigation
                                onAction={onAction}
                            />
                        </div>

                        {section.childrenLayout === 'navigation' && (
                            <SettingsNavigation
                                sections={section.children}
                                depth={depth + 1}
                                activeId={activeId}
                                onSelect={onSelect}
                                onAction={onAction}
                                panelId={panelId}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
};
