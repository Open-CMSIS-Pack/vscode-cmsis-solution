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

/** Shares storage addressing and switch structure between registry and normalized bindings. */
type SectionYamlNode<SwitchValues> = {
    name: string;
    kind?: 'map' | 'sequence';
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

/** Validates registry data before it can be used to read or edit the solution tree. */
export function resolveSectionYamlBinding(binding: UISectionYamlNode): SectionYamlBinding {
    const value = typeof binding === 'string' ? { name: binding } : binding;
    if (!value || typeof value.name !== 'string' || !value.name.length
        || (value.kind !== undefined && value.kind !== 'map' && value.kind !== 'sequence')) {
        throw new Error('Invalid section YAML binding');
    }
    if (value.select === undefined) {
        return { name: value.name, kind: value.kind ?? 'map' };
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
    return { name: value.name, kind: value.kind ?? 'map', select: { node: select.node, selected, unselected } };
}

/** Resolves both registry spellings without leaking object bindings into storage paths. */
export function sectionYamlNodeName(section: { 'yml-node'?: UISectionYamlNode }): string | undefined {
    const binding = section['yml-node'];
    return typeof binding === 'string' ? binding : binding?.name;
}
