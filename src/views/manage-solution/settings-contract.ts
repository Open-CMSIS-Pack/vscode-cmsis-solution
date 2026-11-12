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

/** Browser-safe presentation contract. Storage addresses and registry instructions stay in the host. */
export type SettingsActionId = string;
export type SettingsChoice = { label: string; value: string; description?: string };

export type SettingsFieldBase = {
    id: string;
    label: string;
    description?: string;
    processor?: string;
    disabled: boolean;
    warning?: string;
    editAction?: SettingsActionId;
};

export type SettingsField = SettingsFieldBase & (
    | { type: 'number'; value: number; min?: number; max?: number }
    | { type: 'string'; value: string }
    | { type: 'enum'; value: string; choices: SettingsChoice[] }
    | { type: 'file'; value: string; browseAction?: SettingsActionId; openAction?: SettingsActionId }
);

export type SettingsSection = {
    id: string;
    label: string;
    description?: string;
    warning?: string;
    disabled: boolean;
    selected?: boolean;
    toggleAction?: SettingsActionId;
    removeAction?: SettingsActionId;
    addActions: { label: string; action: SettingsActionId }[];
    childCount?: number;
    childrenLayout: 'navigation' | 'content';
    fields: SettingsField[];
    children: SettingsSection[];
};

export type AdapterHeader = {
    adapters: SettingsChoice[];
    selectedAdapter: string;
    selectAdapterAction?: SettingsActionId;
    processors: SettingsChoice[];
    selectedProcessor: string;
    showProcessor: boolean;
    selectProcessorAction?: SettingsActionId;
    autoUpdate: boolean;
    autoUpdateAction?: SettingsActionId;
};

export type AdapterSnapshot = {
    contextId: string;
    revision: number;
    header: AdapterHeader;
    sections: SettingsSection[];
};

export type SettingsActionRequest = {
    contextId: string;
    revision: number;
    actionId: SettingsActionId;
    requestId: string;
    value?: string | number | boolean;
};

export type SettingsActionResult = {
    requestId: string;
    status: 'applied' | 'cancelled' | 'rejected';
    snapshot: AdapterSnapshot;
};

/** Encodes full paths as JSON tuples to keep repeated leaf names and delimiter characters collision-free. */
export function settingsIdentity(path: readonly string[]): string {
    return JSON.stringify(path);
}

/** Collects every section in display order, including descendants rendered inside content containers. */
export function settingsSections(sections: SettingsSection[]): SettingsSection[] {
    return sections.flatMap(section => [section, ...settingsSections(section.children)]);
}

/** Collects fields across the complete settings tree for host and webview lookups. */
export function settingsFields(sections: SettingsSection[]): SettingsField[] {
    return settingsSections(sections).flatMap(section => section.fields);
}
