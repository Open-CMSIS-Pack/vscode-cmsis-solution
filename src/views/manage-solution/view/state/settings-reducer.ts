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

import type { AdapterSnapshot, SettingsActionResult, SettingsField, SettingsSection } from '../../settings-contract';
import { settingsFields, settingsSections } from '../../settings-contract';

export type NavigationEntry = { section: SettingsSection; depth: number; parent?: string };

/** Once a branch enters content, its descendants never re-enter navigation. */
export function settingsNavigation(sections: SettingsSection[]): NavigationEntry[] {
    /** Visits only children whose ancestors keep them in the navigation pane. */
    const visit = (nodes: SettingsSection[], depth: number, parent?: string): NavigationEntry[] => nodes.flatMap(section => [
        { section, depth, parent },
        ...(section.childrenLayout === 'navigation' ? visit(section.children, depth + 1, section.id) : []),
    ]);
    return visit(sections, 0);
}

export type SettingsDraft = { value: string | number; version: number; dirty: boolean; focused: boolean };
export type SettingsContextState = {
    snapshot: AdapterSnapshot;
    activeId?: string;
    expanded: Record<string, boolean>;
    drafts: Record<string, SettingsDraft>;
    pending: Record<string, { fieldId: string; version: number }>;
};
export type SettingsState = {
    revision: number;
    contextId?: string;
    contexts: Record<string, SettingsContextState>;
};
/** Starts without an active context until the host supplies the first snapshot. */
export const initialSettingsState: SettingsState = { revision: -1, contexts: {} };
export type SettingsStateAction =
    | { type: 'snapshot'; snapshot: AdapterSnapshot }
    | { type: 'result'; result: SettingsActionResult }
    | { type: 'navigate'; sectionId: string }
    | { type: 'expand'; sectionId: string }
    | { type: 'edit'; fieldId: string; value: string | number }
    | { type: 'focus'; fieldId: string; focused: boolean }
    | { type: 'sent'; requestId: string; fieldId: string };

/** Local interactions that operate only on the currently displayed context. */
type SettingsContextAction = Exclude<SettingsStateAction, { type: 'snapshot' | 'result' }>;

/** Preserves interaction state for existing fields and focus only while the same context stays mounted. */
function reconcile(
    snapshot: AdapterSnapshot,
    previous: SettingsContextState | undefined,
    activeContextId: string | undefined,
): SettingsContextState {
    const sections = settingsSections(snapshot.sections);
    const fields = sections.flatMap(section => section.fields);
    const drafts: Record<string, SettingsDraft> = {};
    fields.forEach(field => {
        const current = previous?.drafts[field.id];
        const focused = snapshot.contextId === activeContextId && !!current?.focused;
        drafts[field.id] = current && (current.dirty || focused)
            ? { ...current, focused }
            : { value: field.value, version: current?.version ?? 0, dirty: false, focused: false };
    });
    const navigation = settingsNavigation(snapshot.sections);
    const ids = new Set(navigation.map(entry => entry.section.id));
    const oldNavigation = settingsNavigation(previous?.snapshot.sections ?? []);
    let activeId = previous?.activeId;
    while (activeId && !ids.has(activeId)) {
        activeId = oldNavigation.find(entry => entry.section.id === activeId)?.parent;
    }
    activeId ??= navigation[0]?.section.id;
    return {
        snapshot, activeId, drafts,
        expanded: Object.fromEntries(sections.filter(section => previous?.expanded[section.id]).map(section => [section.id, true])),
        pending: Object.fromEntries(Object.entries(previous?.pending ?? {}).filter(([, pending]) => fields.some(field => field.id === pending.fieldId))),
    };
}

/** Finds the host's canonical value even for fields inside collapsed content containers. */
function fieldById(snapshot: AdapterSnapshot, id: string): SettingsField | undefined {
    return settingsFields(snapshot.sections).find(field => field.id === id);
}

/** Accepts a newer host snapshot and restores the interaction state belonging to its context. */
function receiveSnapshot(state: SettingsState, snapshot: AdapterSnapshot): SettingsState {
    if (snapshot.revision <= state.revision) {
        return state;
    }
    return {
        revision: snapshot.revision,
        contextId: snapshot.contextId,
        contexts: { ...state.contexts, [snapshot.contextId]: reconcile(snapshot, state.contexts[snapshot.contextId], state.contextId) },
    };
}

/** Settles a request in its original context while protecting newer drafts and the current context selection. */
function receiveResult(state: SettingsState, result: SettingsActionResult): SettingsState {
    const { snapshot, requestId } = result;
    let next = state;
    if (state.contextId === snapshot.contextId) {
        const previous = state.contexts[snapshot.contextId];
        const canonical = previous && previous.snapshot.revision > snapshot.revision ? previous.snapshot : snapshot;
        next = {
            ...state,
            revision: canonical.revision,
            contexts: { ...state.contexts, [snapshot.contextId]: reconcile(canonical, previous, state.contextId) },
        };
    }

    // The response snapshot describes the host's current context, which may differ from the request's owner.
    const owner = Object.entries(next.contexts).find(([, context]) => context.pending[requestId]);
    if (!owner) {
        return next;
    }
    const [contextId, context] = owner;
    const pending = context.pending[requestId];
    const field = fieldById(context.snapshot, pending.fieldId);
    const current = context.drafts[pending.fieldId];
    const drafts = { ...context.drafts };
    if (field && current?.version === pending.version) {
        drafts[pending.fieldId] = { ...current, value: field.value, dirty: false };
    }
    const remaining = { ...context.pending };
    delete remaining[requestId];
    return {
        ...next,
        contexts: { ...next.contexts, [contextId]: { ...context, drafts, pending: remaining } },
    };
}

/** Applies navigation, expansion, and field interactions within one context without changing host data. */
function reduceContext(context: SettingsContextState, action: SettingsContextAction): SettingsContextState {
    switch (action.type) {
        case 'navigate':
            if (!settingsNavigation(context.snapshot.sections).some(entry => entry.section.id === action.sectionId)) {
                return context;
            }
            return { ...context, activeId: action.sectionId };
        case 'expand':
            return { ...context, expanded: { ...context.expanded, [action.sectionId]: !context.expanded[action.sectionId] } };
        case 'edit': {
            const draft = context.drafts[action.fieldId];
            if (!draft) {
                return context;
            }
            return {
                ...context,
                drafts: { ...context.drafts, [action.fieldId]: { ...draft, value: action.value, version: draft.version + 1, dirty: true } },
            };
        }
        case 'focus': {
            const draft = context.drafts[action.fieldId];
            if (!draft) {
                return context;
            }
            const canonical = fieldById(context.snapshot, action.fieldId);
            const value = !action.focused && !draft.dirty && canonical ? canonical.value : draft.value;
            return {
                ...context,
                drafts: { ...context.drafts, [action.fieldId]: { ...draft, focused: action.focused, value } },
            };
        }
        case 'sent': {
            const draft = context.drafts[action.fieldId];
            if (!draft) {
                return context;
            }
            return {
                ...context,
                pending: { ...context.pending, [action.requestId]: { fieldId: action.fieldId, version: draft.version } },
            };
        }
    }
}

/** Routes host updates and local interactions to the reducer that owns their state transitions. */
export function settingsReducer(state: SettingsState, action: SettingsStateAction): SettingsState {
    if (action.type === 'snapshot') {
        return receiveSnapshot(state, action.snapshot);
    }
    if (action.type === 'result') {
        return receiveResult(state, action.result);
    }

    const contextId = state.contextId;
    const current = contextId && state.contexts[contextId];
    if (!contextId || !current) {
        return state;
    }
    const context = reduceContext(current, action);
    if (context === current) {
        return state;
    }
    return { ...state, contexts: { ...state.contexts, [contextId]: context } };
}
