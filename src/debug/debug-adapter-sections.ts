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
import { DebuggerWrap, type SectionPathSegment } from '../solutions/files/csolution-wrap';
import { UISection } from './debug-adapters-yaml-file';
import { storedOptionDefault } from './debug-adapter-options';
import { resolveSectionYamlBinding, sectionYamlNodeName, sectionStoragePath } from './section-yaml-binding';
import { expandAdapterSections, templateDevice, templateProcessors, type DeviceWithTrace } from './debug-adapter-templates';

/** Internal compilation of declarative section storage. */
type DebugAdapterSectionDefinition = {
    ui: UISection;
    subsections?: DebugAdapterSectionDefinition[];
    switch?: {
        read: (section: CTreeItemWrap) => boolean;
        write: (section: CTreeItemWrap, enabled: boolean) => void;
    };
    dynamic?: {
        kind: 'map' | 'sequence';
        types: DebugAdapterSectionDefinition[];
    };
};

/** Resolves the identity used in section messages, retaining legacy root label normalization. */
export function sectionIdentity(section: UISection, root = false): string {
    const label = section.section ?? '';
    return section.id ?? sectionYamlNodeName(section) ?? (root ? label.toLocaleLowerCase() : label);
}

/** Builds option override paths, omitting optional selectors that identify an entry rather than a subtree. */
export function sectionYamlPath(branch: UISection[]): string[] {
    return branch.flatMap((section, depth) => {
        const binding = section['yml-node'];
        if (typeof binding === 'object' && binding.optional && 'value' in binding) {
            return [];
        }
        const key = sectionYamlNodeName(section) ?? (depth > 0 ? section.id : undefined);
        return key ? [key] : [];
    });
}

/** Builds section UI and applies edits through the existing debugger tree without replacing YAML subtrees. */
export class DebugAdapterSections {
    /** Compiles registry descriptions; debugger access follows the owning target set. */
    constructor(
        private readonly declarations: UISection[],
        private readonly getDebugger: () => DebuggerWrap | undefined,
        private readonly ensureDebugger: () => DebuggerWrap,
        private readonly device?: DeviceWithTrace,
        private readonly processorNames?: readonly string[],
    ) {
        this.validateDeclarationBindings(declarations);
        this.compileDefinitions();
    }

    /** Retains eager validation of registry storage and switch instructions before editing. */
    private validateDeclarationBindings(sections: UISection[]): void {
        for (const section of sections) {
            if (section['yml-node'] !== undefined) {
                resolveSectionYamlBinding(section['yml-node']);
            }
            this.validateDeclarationBindings(section.subsections ?? []);
        }
    }

    /** Rebuilds conditions and projections from the latest in-memory debugger tree. */
    private compileDefinitions(): DebugAdapterSectionDefinition[] {
        const debuggerWrap = this.getDebugger();
        const sections = expandAdapterSections(this.declarations, {
            config: (debuggerWrap?.object ?? {}) as Record<string, unknown>,
            device: templateDevice(this.device),
            processors: templateProcessors(this.device, this.processorNames),
        }, debuggerWrap);
        /** Checks concrete identities after capability expansion. */
        const validate = (siblings: UISection[], root: boolean): void => {
            const identities = new Set<string>();
            for (const section of siblings) {
                const identity = sectionIdentity(section, root);
                if (identities.has(identity)) {
                    throw new Error(`Duplicate section identity: ${identity}`);
                }
                identities.add(identity);
                const fields = new Set<string>();
                for (const option of section.options) {
                    const field = JSON.stringify([option['yml-node'], option.pname ?? '']);
                    if (fields.has(field)) {
                        throw new Error(`Duplicate field identity in section: ${identity}`);
                    }
                    fields.add(field);
                }
                validate(section.subsections ?? [], false);
            }
        };
        validate(sections, true);
        return sections.map(ui => this.fromUI(ui));
    }

    /** Compiles declarative instructions into generic tree operations, independently of section names. */
    private fromUI(ui: UISection): DebugAdapterSectionDefinition {
        const binding = ui['yml-node'] === undefined ? undefined : resolveSectionYamlBinding(ui['yml-node']);
        const children = ui.subsections?.map(child => this.fromUI(child));
        const dynamic = children?.filter(child => child.ui.usage !== undefined) ?? [];
        const select = binding?.select;
        return {
            ui,
            subsections: children?.filter(child => child.ui.usage === undefined),
            ...(dynamic.length ? { dynamic: { kind: binding?.kind ?? 'map', types: dynamic } } : {}),
            ...(select ? {
                switch: {
                    read: section => {
                        const value = section.getValue(select.node);
                        return value !== undefined && select.selected.includes(value);
                    },
                    write: (section, enabled) => {
                        section.setValue(select.node, (enabled ? select.selected : select.unselected)[0]);
                    },
                },
            } : {}),
        };
    }

    /** Reads current switches, configured children, and add choices without mutating the debugger tree. */
    public get sections(): UISection[] {
        return this.compileDefinitions()
            .filter(definition => definition.ui.readOnly || definition.ui.condition !== false || this.node([definition]))
            .map(definition => this.toUI([definition]));
    }

    /** Resolves a configured section at any depth; unconfigured dynamic templates cannot be edited. */
    private findBranch(root: string, path: string[]): DebugAdapterSectionDefinition[] | undefined {
        let definition = this.compileDefinitions().find(candidate => sectionIdentity(candidate.ui, true) === root);
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
        return branch.some(part => part.ui.readOnly) ? undefined : branch;
    }

    /** Creates an allowed dynamic child once, applying typed defaults and its optional switch binding. */
    public add(root: string, path: string[]): void {
        if (path.length === 0) {
            return;
        }
        const parent = this.findBranch(root, path.slice(0, -1));
        const dynamic = parent?.at(-1)?.dynamic;
        if (!parent || !dynamic) {
            return;
        }
        if (parent.some(part => part.ui.condition === false)) {
            return;
        }

        const definition = dynamic.types.find(candidate => sectionIdentity(candidate.ui) === path.at(-1) && candidate.ui.usage === 'available' && candidate.ui.condition !== false);
        if (!definition || this.node([...parent, definition])) {
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
        this.applyDefaults(branch);
        if (definition.ui.select !== undefined) {
            if (definition.switch) {
                definition.switch.write(node, definition.ui.select);
            } else if (!definition.ui.select) {
                node.remove();
            }
        }
    }

    /** Removes only explicitly removable children and prunes an empty dynamic container. */
    public remove(root: string, path: string[]): void {
        const branch = path.length > 0 ? this.findBranch(root, path) : undefined;
        const ui = branch?.at(-1)?.ui;
        if (!branch || ui?.usage === undefined || !(ui['yml-node'] ?? ui.id)) {
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
        if (!branch || !definition) {
            return;
        }
        if (enabled && branch.some(part => part.ui.condition === false)) {
            return;
        }
        if (definition.ui.select === undefined || !(definition.ui['yml-node'] ?? definition.ui.id)) {
            return;
        }
        const existing = this.node(branch);
        if (definition.switch) {
            const node = existing ?? this.ensureBranch(branch);
            if (node) {
                if (!existing) {
                    this.applyDefaults(branch);
                }
                definition.switch.write(node, enabled);
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
        const exists = !!this.node(branch);
        this.ensureBranch(branch);
        if (!exists) {
            this.applyDefaults(branch);
        }
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
        return [...children.filter(child => child.ui.readOnly || child.ui.condition !== false || this.node([...branch, child])), ...instances];
    }

    /** Projects backend definitions into plain UI data, keeping callbacks and templates out of webview messages. */
    private toUI(branch: DebugAdapterSectionDefinition[]): UISection {
        const definition = branch.at(-1)!;
        const ui = { ...definition.ui };
        const children = this.children(branch);
        const node = this.node(branch);
        if (ui.usage !== undefined) {
            ui.usage = node ? 'used' : 'available';
        }
        if (ui.select !== undefined) {
            ui.select = !!node && (definition.switch ? definition.switch.read(node) : true);
        }
        if (ui.subsections !== undefined || definition.subsections !== undefined || definition.dynamic) {
            const declaredCandidates = definition.dynamic?.types.filter(child => child.ui.usage !== undefined
                && child.ui.usage === 'available' && child.ui.condition !== false && !children.includes(child)) ?? [];
            ui.subsections = [...children, ...declaredCandidates].map(child => this.toUI([...branch, child]));
        }
        return ui;
    }

    /** Resolves a branch using the debugger wrapper's generic map and sequence traversal. */
    private node(branch: DebugAdapterSectionDefinition[]): CTreeItemWrap | undefined {
        return branch.some(part => part.ui.readOnly) ? undefined : this.getDebugger()?.getSection(this.yamlPath(branch));
    }

    /** Computes the storage path independently of display labels and dynamic type identities. */
    private yamlPath(branch: DebugAdapterSectionDefinition[]): SectionPathSegment[] {
        return sectionStoragePath(branch.map(definition => definition.ui));
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
                const binding = definition.ui['yml-node'];
                const sequence = (binding !== undefined && resolveSectionYamlBinding(binding).kind === 'sequence')
                    || definition.dynamic?.kind === 'sequence' || multipleProcessors;
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
            } else if (node?.item?.isMap() && definition.ui['yml-node'] !== undefined
                && resolveSectionYamlBinding(definition.ui['yml-node']).kind === 'sequence') {
                const item = node.item;
                const fields = item.getChildren();
                const selectors = (definition.subsections ?? []).flatMap(child => {
                    const binding = child.ui['yml-node'];
                    return typeof binding === 'object' && binding.optional && 'value' in binding ? [binding] : [];
                });
                if (selectors.length) {
                    item.removeChildrenNotInTags([]);
                    item.setKind(ETreeItemKind.Sequence).setText(undefined);
                    for (const binding of selectors) {
                        const entry = item.createChild('-').setKind(ETreeItemKind.Map);
                        fields.forEach(field => entry.addChild(field.clone(entry)));
                        entry.removeChild(entry.getChild(binding.name));
                        if (binding.value !== null && binding.value !== '') {
                            entry.createChild(binding.name, true).fromObject(binding.value);
                        }
                    }
                }
            }
        }
        return node;
    }

    /** Identifies static branches with initial values, without materializing empty or optional children. */
    private hasInitialValues(definition: DebugAdapterSectionDefinition): boolean {
        return !definition.ui.readOnly && definition.ui.condition !== false && definition.ui.select !== false
            && (definition.ui.select === true
                || definition.ui.options.some(option => storedOptionDefault(option) !== undefined)
                || (definition.subsections ?? []).some(child => this.hasInitialValues(child)));
    }

    /** Fills missing fields and initializes static children, retaining values in shared layout containers. */
    private applyDefaults(branch: DebugAdapterSectionDefinition[]): void {
        const debuggerWrap = this.ensureDebugger();
        const path = this.yamlPath(branch);
        const container = debuggerWrap.getSection(path)?.item;
        if (!container) {
            return;
        }

        for (const option of branch.at(-1)!.ui.options) {
            const value = storedOptionDefault(option);
            if (value === undefined) {
                continue;
            }
            const entries = container.isSequence()
                ? container.getChildren().filter(entry => !option.pname || entry.getValue('pname') === option.pname)
                : [container];
            if (entries.length === 0) {
                debuggerWrap.setSectionParameter(path, option['yml-node'], value, option.pname);
                continue;
            }
            for (const entry of entries) {
                if (!entry.getChild(option['yml-node'])) {
                    entry.createChild(option['yml-node']).fromObject(value);
                }
            }
        }

        for (const child of branch.at(-1)!.subsections ?? []) {
            if (!this.hasInitialValues(child)) {
                continue;
            }
            const childBranch = [...branch, child];
            const sharesParentStorage = this.yamlPath(childBranch).length === path.length;
            if (sharesParentStorage || !this.node(childBranch)) {
                const node = this.ensureBranch(childBranch);
                this.applyDefaults(childBranch);
                if (node && child.ui.select === true) {
                    child.switch?.write(node, true);
                }
            }
        }
    }
}
