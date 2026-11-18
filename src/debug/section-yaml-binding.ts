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

import type { SectionPathSegment } from '../solutions/files/csolution-wrap';

/** Scalar values identifying individual sequence entries. */
export type SectionSelector = string | number | boolean | null;

/** Shares storage addressing and switch structure between registry and normalized bindings. */
type SectionYamlNode<SwitchValues> = {
    name: string;
    value?: SectionSelector | SectionSelector[];
    kind?: 'map' | 'sequence';
    optional?: boolean; // Omit empty selector markers; absent means false.
    select?: {
        node: string;
        selected: SwitchValues;
        unselected: SwitchValues;
    };
};

/** Registry binding accepting shorthand addresses and scalar or non-empty list switch values. */
export type UISectionYamlNode = string | SectionYamlNode<string | [string, ...string[]]>;

/** Validated binding with an explicit container kind and ordered switch aliases. */
export type SectionYamlBinding = SectionYamlNode<readonly string[]> & {
    kind: 'map' | 'sequence';
};

/** Checks a binding's name, container kind, and optional selector requirements. */
function isBindingStorageValid(value: SectionYamlNode<unknown>): boolean {
    if (!value || typeof value.name !== 'string' || !value.name.length) {
        return false;
    }

    const hasValidKind = value.kind === undefined || value.kind === 'map' || value.kind === 'sequence';
    const hasValidOptional = value.optional === undefined || typeof value.optional === 'boolean';
    const hasRequiredSelector = value.optional !== true || 'value' in value;

    return hasValidKind && hasValidOptional && hasRequiredSelector;
}

/** Validates registry data before it can be used to read or edit the solution tree. */
export function resolveSectionYamlBinding(binding: UISectionYamlNode): SectionYamlBinding {
    const value = typeof binding === 'string' ? { name: binding } : binding;
    if (!isBindingStorageValid(value)) {
        throw new Error('Invalid section YAML binding');
    }
    const selector = 'value' in value ? { value: value.value } : {};
    const optional = value.optional === undefined ? {} : { optional: value.optional };
    if (value.select === undefined) {
        return { name: value.name, kind: value.kind ?? 'map', ...selector, ...optional };
    }
    const select = value.select;

    /** Validates switch values and preserves their order for canonical writes and read aliases. */
    const normalizeSwitchValues = (input: unknown): string[] => {
        const list = typeof input === 'string' ? [input] : input;
        if (!Array.isArray(list) || !list.length || !list.every(entry => typeof entry === 'string')) {
            throw new Error('Section switch states must be strings or non-empty lists of strings');
        }
        return [...list];
    };

    if (!select || typeof select.node !== 'string' || !select.node.length) {
        throw new Error('Invalid section switch node');
    }
    const selected = normalizeSwitchValues(select.selected);
    const unselected = normalizeSwitchValues(select.unselected);
    if (selected.some(entry => unselected.includes(entry))) {
        throw new Error('Section switch states must not overlap');
    }
    return { name: value.name, kind: value.kind ?? 'map', ...selector, ...optional, select: { node: select.node, selected, unselected } };
}

/** Resolves both registry spellings without leaking object bindings into storage paths. */
export function sectionYamlNodeName(section: { 'yml-node'?: UISectionYamlNode }): string | undefined {
    const binding = section['yml-node'];
    return typeof binding === 'string' ? binding : binding?.name;
}

/** Builds concrete storage addresses while retaining exact sequence marker values. */
export function sectionStoragePath(branch: { id?: string; 'yml-node'?: UISectionYamlNode }[]): SectionPathSegment[] {
    return branch.flatMap((section, depth): SectionPathSegment[] => {
        const binding = section['yml-node'];
        const name = sectionYamlNodeName(section) ?? (depth > 0 ? section.id : undefined);
        if (!name) {
            return [];
        }
        if (typeof binding === 'object' && 'value' in binding) {
            if (Array.isArray(binding.value) || binding.value === undefined) {
                throw new Error('Section storage requires a scalar selector');
            }
            return [{ name, value: binding.value, ...(binding.optional ? { optional: true } : {}) }];
        }
        return [name];
    });
}
