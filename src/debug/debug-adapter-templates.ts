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

import { Eta } from 'eta';
import { cloneDeep } from 'lodash';
import type { Device } from '../json-rpc/csolution-rpc-client';
import type { UISection } from './debug-adapters-yaml-file';
import { storedOptionDefault } from './debug-adapter-options';
import { resolveSectionYamlBinding, sectionStoragePath, sectionYamlNodeName, type SectionSelector } from './section-yaml-binding';
import type { DebuggerWrap } from '../solutions/files/csolution-wrap';

/** Device trace capabilities anticipated from GetDeviceInfo. */
export type DeviceTrace = {
    serialwire?: boolean;
    tracebuffer?: { name?: string; start?: number; size?: number }[];
};

/** Retains the complete RPC device object while accepting future trace metadata. */
export type DeviceWithTrace = Device & { trace?: DeviceTrace };

/** Full device information with explicit fallback trace capabilities. */
export type TemplateDevice = Omit<Partial<DeviceWithTrace>, 'trace'> & {
    trace: { serialwire: boolean; tracebuffer: NonNullable<DeviceTrace['tracebuffer']> };
};

/** Supplies legacy trace capabilities only when trace metadata is absent. */
export function templateDevice(device?: DeviceWithTrace): TemplateDevice {
    const trace = device?.trace;
    return cloneDeep({
        ...device,
        trace: trace === undefined
            ? { serialwire: true, tracebuffer: [{}] }
            : { ...trace, serialwire: trace.serialwire ?? false, tracebuffer: trace.tracebuffer ?? [] },
    });
}

/** Complete, detached sources available to registry expressions. */
export type AdapterTemplateContext = { config: Record<string, unknown>; device: TemplateDevice };

/** Associates projected leaves with their originating array records. */
type Projection = { value: unknown; scope: Map<object, unknown>; available: boolean };

/** Runs registry expressions without converting their results to strings or reparsing JSON. */
const expressions = new Eta({ useWith: true, autoEscape: false });

/** Evaluates one expression against detached, read-only context views. */
function evaluate(expression: string, context: AdapterTemplateContext, scope: Map<object, unknown>): unknown {
    let result: unknown;
    const data = {
        ...context,
        capture: (value: unknown) => {
            result = value;
        },
    };
    expressions.renderString(`<% it.capture((${expression})); %>`, view(data, scope) as object);
    return result;
}

/** Preserves full arrays while resolving projected properties against their associated record. */
function view(value: unknown, scope: Map<object, unknown>): unknown {
    if (value === null || typeof value !== 'object') {
        return value;
    }
    return new Proxy(value, {
        get(target, property) {
            if (Array.isArray(target) && !Reflect.has(target, property) && scope.has(target)) {
                const record = scope.get(target);
                return view(record && typeof record === 'object' ? Reflect.get(record, property) : undefined, scope);
            }
            return view(Reflect.get(target, property), scope);
        },
        set() {
            throw new Error('Template context is read-only');
        },
        deleteProperty() {
            throw new Error('Template context is read-only');
        },
        defineProperty() {
            throw new Error('Template context is read-only');
        },
    });
}

/** Resolves complete expressions as typed values and interpolated fragments as text. */
function render(value: unknown, context: AdapterTemplateContext, scope: Map<object, unknown>): unknown {
    if (typeof value !== 'string' || !value.includes('${{')) {
        return value;
    }
    const whole = /^\$\{\{((?:(?!\$\{\{)[\s\S])*)\}\}$/.exec(value);
    if (whole) {
        return evaluate(whole[1], context, scope);
    }
    const rendered = value.replace(/\$\{\{([\s\S]*?)\}\}/g, (_match, expression: string) => {
        const result = evaluate(expression, context, scope);
        if (result !== null && typeof result === 'object') {
            throw new Error('Interpolated fields require scalar values');
        }
        return String(result ?? '');
    });
    if (rendered.includes('${{')) {
        throw new Error('Unclosed template expression');
    }
    return rendered;
}

/** Projects a property path through arrays, retaining unnamed records and source ordering. */
function project(value: unknown, path: string[], scope: Map<object, unknown>): Projection[] {
    if (Array.isArray(value)) {
        const selected = scope.has(value) ? [scope.get(value)] : value;
        return selected.flatMap(record => project(record, path, new Map(scope).set(value, record)));
    }
    if (path.length === 0) {
        return [{ value: value ?? null, scope, available: true }];
    }
    const next = value !== null && typeof value === 'object' ? Reflect.get(value, path[0]) : undefined;
    return project(next, path.slice(1), scope);
}

/** Rejects complex values before they can become YAML selectors or section identities. */
function selector(value: unknown): SectionSelector {
    if (value === null || typeof value === 'string' || typeof value === 'boolean'
        || (typeof value === 'number' && Number.isFinite(value))) {
        return value;
    }
    throw new Error('Section value must expand to finite scalar selectors');
}

/** Reads existing object containers without materializing optional sections or candidate entries. */
function containers(parents: unknown[], section: UISection, depth: number): unknown[] {
    const binding = section['yml-node'];
    const name = sectionYamlNodeName(section) ?? (depth > 0 ? section.id : undefined);
    if (!name) {
        return parents;
    }
    return parents.flatMap(parent => {
        if (Array.isArray(parent)) {
            return parent.filter(entry => entry && typeof entry === 'object' && Object.prototype.hasOwnProperty.call(entry, name)
                && (typeof binding !== 'object' || binding.value === undefined || Array.isArray(binding.value)
                    || (typeof binding.value === 'string' && binding.value.includes('${{')) || entry[name] === binding.value));
        }
        if (parent && typeof parent === 'object') {
            const child = Reflect.get(parent, name);
            return child !== null && typeof child === 'object' ? [child] : [];
        }
        return [];
    });
}

/** Fills missing option values in a detached copy, retaining explicit falsy values and YAML markers. */
export function effectiveDebugConfiguration(sections: UISection[], actual: unknown): Record<string, unknown> {
    const config = cloneDeep(actual && typeof actual === 'object' ? actual : {}) as Record<string, unknown>;
    /** Applies defaults only to existing storage containers, matching processor-specific entries. */
    function fill(definitions: UISection[], parents: unknown[], depth: number): void {
        for (const section of definitions) {
            const nodes = containers(parents, section, depth);
            for (const node of nodes) {
                for (const option of section.options) {
                    const entries = Array.isArray(node)
                        ? node.filter(entry => !option.pname || entry?.pname === option.pname) : [node];
                    for (const entry of entries) {
                        const fallback = storedOptionDefault(option);
                        if (entry && typeof entry === 'object' && Reflect.get(entry, option['yml-node']) === undefined && fallback !== undefined) {
                            Reflect.set(entry, option['yml-node'], fallback);
                        }
                    }
                }
            }
            fill(section.subsections ?? [], nodes, depth + 1);
        }
    }
    fill(sections, [config], 0);
    return config;
}

/** Resolves storage defaults before rendering section text and conditions against a detached context. */
export function expandAdapterSections(
    sections: UISection[], context: AdapterTemplateContext, debuggerWrap?: DebuggerWrap,
): UISection[] {
    const effectiveContext = { ...context, config: effectiveDebugConfiguration(sections, context.config) };
    const bindings = expandSections(sections, effectiveContext, debuggerWrap, true);
    effectiveContext.config = effectiveDebugConfiguration(bindings, effectiveContext.config);
    return expandSections(sections, effectiveContext, debuggerWrap);
}

/** Expands storage bindings alone or complete UI sections, retaining configured selectors absent from capabilities. */
function expandSections(
    sections: UISection[], context: AdapterTemplateContext, debuggerWrap?: DebuggerWrap, bindingsOnly = false,
): UISection[] {
    /** Expands one sibling group and suppresses conflicting templated identities and selectors. */
    function expand(definitions: UISection[], parents: UISection[], scope: Map<object, unknown>, inherited = true): UISection[] {
        const results = definitions.flatMap(definition => {
            try {
                return expandOne(definition, parents, scope, inherited);
            } catch (error) {
                if (!bindingsOnly) {
                    console.error(`Invalid adapter section ${definition.section}:`, error);
                }
                return [];
            }
        });
        if (bindingsOnly) {
            return results;
        }
        const identities = new Map<string, number>();
        const addresses = new Map<string, number>();
        for (const result of results) {
            const binding = result['yml-node'];
            const identity = result.id ?? sectionYamlNodeName(result) ?? result.section;
            identities.set(identity, (identities.get(identity) ?? 0) + 1);
            if (typeof binding === 'object' && 'value' in binding) {
                const address = JSON.stringify([binding.name, binding.value]);
                addresses.set(address, (addresses.get(address) ?? 0) + 1);
            }
        }
        return results.filter(result => {
            const binding = result['yml-node'];
            if (typeof binding !== 'object' || !('value' in binding)) {
                return true;
            }
            const duplicate = identities.get(result.id ?? binding.name)! > 1 || addresses.get(JSON.stringify([binding.name, binding.value]))! > 1;
            if (duplicate) {
                console.error(`Duplicate adapter section identity or selector: ${result.section}`);
            }
            return !duplicate;
        });
    }

    /** Resolves an optional selector sequence, then renders fields in each corresponding record scope. */
    function expandOne(definition: UISection, parents: UISection[], scope: Map<object, unknown>, inherited: boolean): UISection[] {
        const raw = definition['yml-node'];
        const hasValue = typeof raw === 'object' && 'value' in raw;
        const path = hasValue && typeof raw.value === 'string'
            ? /^\$\{\{\s*((?:config|device)(?:\.[A-Za-z_$][\w$]*)+)\s*\}\}$/.exec(raw.value)?.[1].split('.') : undefined;
        let projections: Projection[] = [{ value: null, scope, available: true }];
        if (hasValue) {
            if (path) {
                projections = project(context, path, scope);
            } else {
                const result = render(raw.value, context, scope);
                projections = (Array.isArray(result) ? result : [result]).map(value => ({ value: value ?? null, scope, available: true }));
            }
            const marker = render(raw.name, context, scope);
            const stored = debuggerWrap?.getSection(sectionStoragePath(parents))?.item;
            if (typeof marker === 'string' && stored?.isSequence()) {
                for (const entry of stored.getChildren()) {
                    const node = entry.getChild(marker);
                    const value = node?.getText() === '' ? '' : node?.toObject();
                    if (!node || projections.some(projection => projection.value === value)) {
                        continue;
                    }
                    // Only projected templates own entries not explicitly enumerated by a scalar binding.
                    if (path) {
                        const orphanScope = new Map(scope);
                        let source: unknown = context;
                        for (let index = 0; index < path.length; index++) {
                            if (Array.isArray(source)) {
                                let record: unknown = value === null ? undefined : value;
                                for (const key of path.slice(index).reverse()) {
                                    record = { [key]: record };
                                }
                                orphanScope.set(source, record);
                                break;
                            }
                            source = source && typeof source === 'object' ? Reflect.get(source, path[index]) : undefined;
                        }
                        projections.push({ value, scope: orphanScope, available: false });
                    }
                }
            }
        }
        return projections.map(projection => {
            const itemScope = projection.scope;
            const binding = typeof raw === 'object' ? { ...raw, name: render(raw.name, context, itemScope) as string } : raw;
            if (hasValue && typeof binding === 'object') {
                binding.value = selector(projection.value);
            }
            const resolvedBinding = typeof binding === 'string' ? render(binding, context, itemScope) as string : binding;
            if (raw !== undefined && resolvedBinding === undefined) {
                throw new Error('Section bindings must resolve to storage addresses');
            }
            if (resolvedBinding !== undefined) {
                resolveSectionYamlBinding(resolvedBinding);
            }
            if (bindingsOnly) {
                const storage: UISection = { ...definition, 'yml-node': resolvedBinding };
                if (raw === undefined) {
                    storage.id = render(definition.id, context, itemScope) as string | undefined;
                }
                if (definition.subsections) {
                    storage.subsections = expand(definition.subsections, [...parents, storage], itemScope);
                }
                return storage;
            }
            const ui: UISection = {
                ...definition,
                section: render(definition.section, context, itemScope) as string,
                id: render(definition.id, context, itemScope) as string | undefined,
                description: render(definition.description, context, itemScope) as string | undefined,
                warning: render(definition.warning, context, itemScope) as string | undefined,
                'yml-node': resolvedBinding,
            };
            if (typeof ui.section !== 'string' || !ui.section.length) {
                throw new Error('Section labels must resolve to non-empty strings');
            }
            for (const text of [ui.id, ui.description, ui.warning]) {
                if (text !== undefined && typeof text !== 'string') {
                    throw new Error('Section text fields must resolve to strings');
                }
            }
            if (hasValue && !ui.id) {
                ui.id = JSON.stringify([sectionYamlNodeName(ui), selector(projection.value)]);
            }
            const allowed = inherited && projection.available && render(definition.condition ?? true, context, itemScope) === true;
            if (definition.condition !== undefined || !allowed) {
                ui.condition = allowed;
            }
            if (!allowed) {
                ui.warning = render(definition['condition-message'], context, itemScope) as string | undefined
                    ?? 'This section is not supported by the current device or debugger configuration.';
            }
            if (ui.warning !== undefined && typeof ui.warning !== 'string') {
                throw new Error('Section warnings must resolve to strings');
            }
            delete ui['condition-message'];
            if (definition.subsections) {
                ui.subsections = expand(definition.subsections, [...parents, ui], itemScope, allowed);
            }
            return ui;
        });
    }
    return expand(sections, [], new Map());
}
