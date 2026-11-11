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

import { ETreeItemKind } from '@open-cmsis-pack/cmsis-common/tree-item';
import { CTreeItemWrap } from '@open-cmsis-pack/cmsis-common/tree-item-wrapper';
import { DebuggerWrap } from '../solutions/files/csolution-wrap';
import { UISection } from './debug-adapters-yaml-file';

/** Binds a checkbox to a stored value instead of the presence of its section. */
export type SectionSwitchBinding = {
    read: (section: CTreeItemWrap) => boolean;
    write: (section: CTreeItemWrap, enabled: boolean) => void;
};

/** Keeps runtime bindings and dynamic templates separate from the serializable UI description. */
export type DebugAdapterSectionDefinition = {
    ui: UISection;
    subsections?: DebugAdapterSectionDefinition[];
    switch?: SectionSwitchBinding;
    initialValues?: Record<string, string | number | null>;
    validators?: Record<string, (value: string | number) => boolean>;
    addable?: boolean;
    dynamic?: {
        kind: 'map' | 'sequence';
        types: DebugAdapterSectionDefinition[];
        label?: (count: number) => string;
    };
};

/** Resolves the identity used in section messages, retaining legacy root label normalization. */
export function sectionIdentity(section: UISection, root = false): string {
    return section.id ?? section['yml-node'] ?? (root ? section.section.toLocaleLowerCase() : section.section);
}

/** Converts a descriptor branch into map keys or markers identifying sequence entries. */
export function sectionYamlPath(branch: UISection[]): string[] {
    return branch.flatMap((section, depth) => {
        const key = section['yml-node'] ?? (depth > 0 ? section.id : undefined);
        return key ? [key] : [];
    });
}

/** Builds section UI and applies edits through the existing debugger tree without replacing YAML subtrees. */
export class DebugAdapterSections {
    private readonly definitions: DebugAdapterSectionDefinition[];

    /** Combines static descriptions with runtime extensions; debugger access follows the owning target set. */
    constructor(
        sections: UISection[],
        extensions: DebugAdapterSectionDefinition[],
        private readonly getDebugger: () => DebuggerWrap | undefined,
        private readonly ensureDebugger: () => DebuggerWrap,
    ) {
        this.definitions = sections.map(ui => ({ ui }));
        extensions.forEach(extension => {
            const index = this.definitions.findIndex(definition => sectionIdentity(definition.ui, true) === sectionIdentity(extension.ui, true));
            if (index < 0) {
                this.definitions.push(extension);
            } else {
                this.definitions[index] = extension;
            }
        });
    }

    /** Reads current switches, configured children, and add choices without mutating the debugger tree. */
    public get sections(): UISection[] {
        return this.definitions.map(definition => this.toUI([definition]));
    }

    /** Resolves a configured section at any depth; unconfigured dynamic templates cannot be edited. */
    public findBranch(root: string, path: string[]): DebugAdapterSectionDefinition[] | undefined {
        let definition = this.definitions.find(candidate => sectionIdentity(candidate.ui, true) === root);
        if (!definition) {
            return undefined;
        }
        const branch = [definition];
        for (const id of path) {
            definition = this.children(branch).find(candidate => sectionIdentity(candidate.ui) === id);
            if (!definition) {
                return undefined;
            }
            branch.push(definition);
        }
        return branch;
    }

    /** Creates an allowed dynamic child once, applying typed defaults and its optional switch binding. */
    public add(root: string, path: string[]): void {
        if (path.length === 0) {
            return;
        }
        const parent = this.findBranch(root, path.slice(0, -1));
        const dynamic = parent?.at(-1)?.dynamic;
        const definition = dynamic?.types.find(candidate => sectionIdentity(candidate.ui) === path.at(-1) && candidate.addable !== false);
        if (!parent || !dynamic || !definition || this.node([...parent, definition])) {
            return;
        }

        const parentNode = this.ensureBranch(parent);
        if (!(dynamic.kind === 'sequence' ? parentNode?.item?.isSequence() : parentNode?.item?.isMap())) {
            return;
        }
        const branch = [...parent, definition];
        const node = this.ensureBranch(branch);
        if (!node) {
            return;
        }
        Object.entries(definition.initialValues ?? {}).forEach(([key, value]) => node.ensureItem().createChild(key, true).fromObject(value));
        this.applyDefaults(branch);
        if (definition.ui.select !== undefined) {
            definition.switch?.write(node, true);
        }
    }

    /** Removes only explicitly removable children and prunes an empty dynamic container. */
    public remove(root: string, path: string[]): void {
        const branch = path.length > 0 ? this.findBranch(root, path) : undefined;
        const ui = branch?.at(-1)?.ui;
        if (!branch || !ui?.removable || !(ui['yml-node'] ?? ui.id)) {
            return;
        }
        this.node(branch)?.remove();
        const parent = branch.slice(0, -1);
        const parentNode = this.node(parent);
        if (parent.at(-1)?.dynamic && parentNode?.item?.getChildren().length === 0) {
            parentNode.remove();
        }
    }

    /** Changes a switch through its binding or creates/removes a section for presence-based switches. */
    public setEnabled(root: string, path: string[], enabled: boolean): void {
        const branch = this.findBranch(root, path);
        const definition = branch?.at(-1);
        if (!branch || !definition || definition.ui.select === undefined || !(definition.ui['yml-node'] ?? definition.ui.id)) {
            return;
        }
        const existing = this.node(branch);
        if (definition.switch) {
            if (existing) {
                definition.switch.write(existing, enabled);
            }
        } else if (!enabled) {
            existing?.remove();
        } else if (!existing) {
            this.ensureBranch(branch);
            this.applyDefaults(branch);
        }
    }

    /** Validates and writes an option in storage units, preserving sibling fields and processor entries. */
    public setParameter(root: string, path: string[], key: string, value: string | number, pname?: string): void {
        const branch = this.findBranch(root, path);
        const definition = branch?.at(-1);
        const option = definition?.ui.options.find(candidate => candidate['yml-node'] === key && (!pname || candidate.pname === pname));
        if (!branch || !definition || !option) {
            return;
        }
        const storedValue = option.type === 'number' ? Number(value) : value;
        if (option.type === 'number') {
            const numericValue = Number(storedValue);
            const scale = option.scale ?? 1;
            const displayValue = numericValue / scale;
            if (!Number.isFinite(numericValue) || (option.range && (displayValue < option.range[0] || displayValue > option.range[1]))) {
                return;
            }
        }
        if (definition.validators?.[key] && !definition.validators[key](storedValue)) {
            return;
        }
        this.ensureBranch(branch);
        this.ensureDebugger().setSectionParameter(this.yamlPath(branch), key, storedValue, pname);
    }

    /** Reads static children and instantiated dynamic types, including types currently unavailable for adding. */
    private children(branch: DebugAdapterSectionDefinition[]): DebugAdapterSectionDefinition[] {
        const definition = branch.at(-1)!;
        const children = definition.subsections ?? definition.ui.subsections?.map(ui => ({ ui })) ?? [];
        const container = this.node(branch)?.item;
        const dynamic = definition.dynamic;
        const validContainer = dynamic?.kind === 'sequence' ? container?.isSequence() : container?.isMap();
        const instances = validContainer ? dynamic?.types.filter(candidate => !!this.node([...branch, candidate])) ?? [] : [];
        return [...children, ...instances];
    }

    /** Projects backend definitions into plain UI data, keeping callbacks and templates out of webview messages. */
    private toUI(branch: DebugAdapterSectionDefinition[]): UISection {
        const definition = branch.at(-1)!;
        const ui = { ...definition.ui };
        const children = this.children(branch);
        const node = this.node(branch);
        if (ui.select !== undefined) {
            ui.select = !!node && (definition.switch ? definition.switch.read(node) : true);
        }
        if (ui.subsections !== undefined || definition.subsections !== undefined || definition.dynamic) {
            ui.subsections = children.map(child => this.toUI([...branch, child]));
        }
        if (definition.dynamic) {
            ui.section = definition.dynamic.label?.(children.length) ?? ui.section;
            ui.addOptions = definition.dynamic.types
                .filter(candidate => candidate.addable !== false && !children.some(child => sectionIdentity(child.ui) === sectionIdentity(candidate.ui)))
                .map(candidate => ({ id: sectionIdentity(candidate.ui), name: candidate.ui.section }));
        } else {
            delete ui.addOptions;
        }
        return ui;
    }

    /** Resolves a branch using the debugger wrapper's generic map and sequence traversal. */
    private node(branch: DebugAdapterSectionDefinition[]): CTreeItemWrap | undefined {
        return this.getDebugger()?.getSection(this.yamlPath(branch));
    }

    /** Computes the storage path independently of display labels and dynamic type identities. */
    private yamlPath(branch: DebugAdapterSectionDefinition[]): string[] {
        return sectionYamlPath(branch.map(definition => definition.ui));
    }

    /** Creates containers in the required shape, migrating shared maps when multiple processors are used. */
    private ensureBranch(branch: DebugAdapterSectionDefinition[]): CTreeItemWrap | undefined {
        const debuggerWrap = this.ensureDebugger();
        let node: CTreeItemWrap | undefined;
        for (let depth = 1; depth <= branch.length; depth++) {
            const current = branch.slice(0, depth);
            const path = this.yamlPath(current);
            const existing = debuggerWrap.getSection(path);
            node = existing ?? debuggerWrap.getSection(path, true);
            const definition = current.at(-1)!;
            const processorNames = new Set(definition.ui.options.map(option => option.pname).filter(Boolean));
            const multipleProcessors = definition.ui['pname-options'] !== undefined && processorNames.size > 1;
            if (!existing) {
                const sequence = definition.dynamic?.kind === 'sequence' || multipleProcessors;
                node?.item?.setKind(sequence ? ETreeItemKind.Sequence : ETreeItemKind.Map).setText(undefined);
            } else if (multipleProcessors && node?.item?.isMap()) {
                const fields = node.item.getChildren();
                node.item.removeChildrenNotInTags([]);
                node.item.setKind(ETreeItemKind.Sequence).setText(undefined);

                for (const pname of processorNames) {
                    const entry = node.item.createChild('-').setKind(ETreeItemKind.Map);
                    fields.forEach(field => entry.addChild(field.clone(entry)));
                    entry.setValue('pname', pname);
                }
            }
        }
        return node;
    }

    /** Initializes only a newly created section's fields, converting display defaults to storage units. */
    private applyDefaults(branch: DebugAdapterSectionDefinition[]): void {
        const debuggerWrap = this.ensureDebugger();
        branch.at(-1)!.ui.options.forEach(option => {
            if (option.default !== undefined) {
                const value = option.type === 'number' ? Number(option.default) * (option.scale ?? 1) : option.default;
                debuggerWrap.setSectionParameter(this.yamlPath(branch), option['yml-node'], value, option.pname);
            }
        });
    }
}
