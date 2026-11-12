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

import { UISection, UISectionChildren } from '../../debug/debug-adapters-yaml-file';
import { normalizeNumberOption, readNumberOption } from '../../debug/debug-adapter-options';
import { sectionYamlNodeName } from '../../debug/section-yaml-binding';
import { sectionIdentity, sectionYamlPath } from '../../debug/debug-adapter-sections';
import { DebuggerWrap } from '../../solutions/files/csolution-wrap';
import {
    AdapterHeader, AdapterSnapshot, SettingsActionRequest, SettingsField, SettingsFieldBase, SettingsSection, settingsIdentity,
} from './settings-contract';

export type AdapterSettingsContext = {
    identity: string[];
    adapters: string[];
    adapter: string;
    processors: string[];
    startProcessor: string;
    autoUpdate: boolean;
    sections: UISection[];
    debugger?: DebuggerWrap;
};

/** Host-only addresses. These never form part of a snapshot or an action request. */
export type AdapterSettingsAction = {
    kind: 'edit' | 'browse' | 'open' | 'toggle' | 'add' | 'remove' | 'adapter' | 'processor' | 'autoUpdate' | 'enableDebugger';
    root: string;
    path: string[];
    option?: UISectionChildren;
    value?: string | number | boolean;
};

/** Registers a host-only address and returns the opaque action identity exposed to the webview. */
type RegisterAction = (address: AdapterSettingsAction, identity: string[]) => string;

/** Resolves field values and actions into a presentation-only, context-scoped snapshot. */
export class AdapterSettingsPresenter {
    private revision = 0;
    private sequence = 0;
    private readonly identities = new Map<string, string>();
    private actions = new Map<string, { address: AdapterSettingsAction; availableSince: number }>();
    private snapshot?: AdapterSnapshot;

    /** Prepares canonical display values and records which actions are available in this revision. */
    public prepare(context: AdapterSettingsContext): AdapterSnapshot {
        this.revision++;
        const contextId = this.identity('context', context.identity);
        const previousActions = this.actions;
        this.actions = new Map();

        /** Preserves action identities while detecting interruptions in their availability. */
        const action: RegisterAction = (address, identity) => {
            const id = this.identity('action', [contextId, address.kind, ...identity]);
            this.actions.set(id, {
                address,
                availableSince: previousActions.get(id)?.availableSince ?? this.revision,
            });
            return id;
        };

        this.snapshot = {
            contextId,
            revision: this.revision,
            header: this.prepareHeader(context, action),
            sections: context.sections.map(section => this.prepareSection(context, contextId, [section], false, action)),
        };
        return this.snapshot;
    }

    /** Rejects stale/unknown actions, validates types and converts edited display values to storage units. */
    public resolve(request: SettingsActionRequest): AdapterSettingsAction | undefined {
        if (!this.snapshot || request.contextId !== this.snapshot.contextId
            || request.revision > this.snapshot.revision) {
            return undefined;
        }
        const availableAction = this.actions.get(request.actionId);
        if (!availableAction || request.revision < availableAction.availableSince) {
            return undefined;
        }
        const { address } = availableAction;
        let value = request.value;
        switch (address.kind) {
            case 'edit': {
                const option = address.option!;
                if (option.type === 'number') {
                    if (typeof value !== 'number' && typeof value !== 'string') {
                        return undefined;
                    }
                    value = normalizeNumberOption(option, value);
                    if (value === undefined) {
                        return undefined;
                    }
                } else if (typeof value !== 'string' || (option.type === 'enum' && !option.values.some(choice => choice.value === value))) {
                    return undefined;
                }
                break;
            }
            case 'enableDebugger':
            case 'toggle':
            case 'autoUpdate':
                if (typeof value !== 'boolean') {
                    return undefined;
                }
                break;
            case 'adapter':
                if (typeof value !== 'string' || !this.snapshot.header.adapters.some(choice => choice.value === value)) {
                    return undefined;
                }
                break;
            case 'processor':
                if (typeof value !== 'string' || !this.snapshot.header.processors.some(choice => choice.value === value)) {
                    return undefined;
                }
                break;
        }
        return { ...address, value };
    }

    /** Allocates stable opaque identities in separate context, section, field, and action namespaces. */
    private identity(kind: 'context' | 'section' | 'field' | 'action', path: string[]): string {
        const key = settingsIdentity([kind, ...path]);
        let id = this.identities.get(key);
        if (!id) {
            id = `${kind}-${++this.sequence}`;
            this.identities.set(key, id);
        }
        return id;
    }

    /** Resolves adapter and processor choices independently of the recursive section tree. */
    private prepareHeader(context: AdapterSettingsContext, action: RegisterAction): AdapterHeader {
        /** Registers an action belonging to the separate adapter header. */
        const headerAction = (kind: 'adapter' | 'processor' | 'autoUpdate' | 'enableDebugger') => action({ kind, root: '', path: [] }, []);
        const selectedProcessor = context.processors.includes(context.startProcessor)
            ? context.startProcessor : context.processors[0] ?? '';

        return {
            enabled: !!context.debugger,
            toggleDebuggerAction: headerAction('enableDebugger'),
            adapterWarning: context.adapter && !context.adapters.includes(context.adapter)
                ? 'Select a registered debug adapter from drop down' : undefined,
            adapters: context.adapters.map(value => ({ label: value, value })),
            selectedAdapter: context.adapter,
            selectAdapterAction: headerAction('adapter'),
            processors: context.processors.map(value => ({ label: value, value })),
            selectedProcessor,
            showProcessor: context.processors.length > 1,
            selectProcessorAction: context.debugger && context.processors.length > 1 ? headerAction('processor') : undefined,
            autoUpdate: context.autoUpdate,
            autoUpdateAction: headerAction('autoUpdate'),
        };
    }

    /** Projects one section and its descendants, reading its storage container once for all fields. */
    private prepareSection(
        context: AdapterSettingsContext,
        contextId: string,
        branch: UISection[],
        inheritedDisabled: boolean,
        action: RegisterAction,
    ): SettingsSection {
        const section = branch.at(-1)!;
        const identity = branch.map((part, depth) => sectionIdentity(part, depth === 0));
        const root = identity[0];
        const path = identity.slice(1);
        const disabled = inheritedDisabled || section.select === false;
        const children = section.subsections ?? [];
        const sectionNode = context.debugger?.getSection(sectionYamlPath(branch))?.item;

        /** Registers a section action using its complete path or a candidate child's path. */
        const sectionAction = (kind: AdapterSettingsAction['kind'], child?: UISection) => {
            const childPath = child ? [...path, sectionIdentity(child)] : path;
            return action({ kind, root, path: childPath }, [root, ...childPath]);
        };
        const fields = section.options.map(option => {
            const fieldIdentity = [...identity, option['yml-node'], option.pname ?? ''];
            const valueNode = sectionNode?.isSequence()
                ? sectionNode.getChildren().find(entry => !option.pname || entry.getValue('pname') === option.pname)
                : sectionNode;
            const processor = option.pname || undefined;

            /** Registers a field action without exposing its storage address to the webview. */
            const fieldAction = (kind: 'edit' | 'browse' | 'open') => action({ kind, root, path, option }, fieldIdentity);
            const base: SettingsFieldBase = {
                id: this.identity('field', [contextId, ...fieldIdentity]),
                label: option.name,
                description: option.description,
                processor,
                disabled,
                editAction: disabled ? undefined : fieldAction('edit'),
            };
            return this.prepareField(option, valueNode?.getValue(option['yml-node']), base, fieldAction);
        });

        return {
            id: this.identity('section', [contextId, ...identity]),
            label: section.section,
            description: section.description,
            warning: section.warning,
            disabled,
            selected: section.select,
            toggleAction: section.select !== undefined && !inheritedDisabled
                && (sectionYamlNodeName(section) || (branch.length > 1 && section.id)) ? sectionAction('toggle') : undefined,
            removeAction: section.usage === 'used' ? sectionAction('remove') : undefined,
            addActions: disabled ? [] : children.filter(child => child.usage === 'available').map(child => ({
                label: child.section, action: sectionAction('add', child),
            })),
            childCount: children.some(child => child.usage !== undefined)
                ? children.filter(child => child.usage === 'used').length : undefined,
            childrenLayout: section['subsections-layout'] ?? 'content',
            fields,
            children: children.filter(child => child.usage !== 'available')
                .map(child => this.prepareSection(context, contextId, [...branch, child], disabled, action)),
        };
    }

    /** Resolves type-specific display values and file actions from common field presentation data. */
    private prepareField(
        option: UISectionChildren,
        raw: string | undefined,
        base: SettingsFieldBase,
        action: (kind: 'edit' | 'browse' | 'open') => string,
    ): SettingsField {
        switch (option.type) {
            case 'number': {
                const value = readNumberOption(option, raw);
                return { ...base, type: 'number', value, min: option.range?.[0], max: option.range?.[1] } satisfies SettingsField;
            }
            case 'enum': {
                const value = raw ?? option.default ?? '';
                return {
                    ...base, type: 'enum', value,
                    choices: option.values.map(choice => ({ label: choice.name, value: choice.value, description: choice.description })),
                    warning: option.values.some(choice => choice.value === value) ? undefined : `Unknown value: ${value}`,
                } satisfies SettingsField;
            }
            case 'file': {
                const value = raw ?? option.default ?? '';
                return {
                    ...base, type: 'file', value,
                    browseAction: base.disabled ? undefined : action('browse'),
                    openAction: value ? action('open') : undefined,
                } satisfies SettingsField;
            }
            case 'string': return { ...base, type: 'string', value: raw ?? option.default ?? '' } satisfies SettingsField;
        }
    }
}
