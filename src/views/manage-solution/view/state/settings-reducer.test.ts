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

import { AdapterSnapshot, SettingsSection } from '../../settings-contract';
import { initialSettingsState, settingsNavigation, settingsReducer, SettingsState } from './settings-reducer';

/** Builds a section with optional navigation, content, or field details for interaction scenarios. */
const section = (id: string, overrides: Partial<SettingsSection> = {}): SettingsSection => ({
    id, label: id, disabled: false, childrenLayout: 'content', children: [], addActions: [], fields: [], ...overrides,
});
/** Builds canonical host state with a shared field name to expose accidental cross-context updates. */
function snapshot(revision: number, value = 1, contextId = 'one'): AdapterSnapshot {
    return {
        contextId, revision,
        header: { enabled: true, adapters: [], selectedAdapter: '', processors: [], selectedProcessor: '', showProcessor: false, autoUpdate: true },
        sections: [section('root', { childrenLayout: 'navigation', children: [section('child', {
            fields: [{ id: 'field', label: 'Value', type: 'number', value, disabled: false, editAction: 'edit' }],
        })] })],
    };
}
/** Delivers a host snapshot through the same reducer action as the transport hook. */
const receive = (state: SettingsState, next: AdapterSnapshot) => settingsReducer(state, { type: 'snapshot', snapshot: next });

describe('settings interaction reducer', () => {
    it('supports explicit navigation and prevents content descendants re-entering navigation', () => {
        const tree = [section('root', { childrenLayout: 'navigation', children: [
            section('left', { children: [section('content', { childrenLayout: 'navigation', children: [section('deeper')] })] }),
        ] })];
        expect(settingsNavigation(tree).map(entry => [entry.section.id, entry.depth, entry.parent])).toEqual([
            ['root', 0, undefined], ['left', 1, 'root'],
        ]);
        expect(settingsNavigation([section('root', { children: [section('child')] })]).map(entry => entry.section.id)).toEqual(['root']);
    });

    it('starts containers closed, preserves state per context, and falls back to a remaining ancestor', () => {
        let state = receive(initialSettingsState, snapshot(1));
        expect(state.contexts.one.expanded).toEqual({});
        state = settingsReducer(state, { type: 'navigate', sectionId: 'child' });
        state = settingsReducer(state, { type: 'expand', sectionId: 'child' });
        state = receive(state, snapshot(2, 2, 'two'));
        state = receive(state, snapshot(3));
        expect(state.contexts.one.activeId).toBe('child');
        expect(state.contexts.one.expanded.child).toBe(true);
        const removed = snapshot(4);
        removed.sections[0].children = [];
        state = receive(state, removed);
        expect(state.contexts.one.activeId).toBe('root');
        expect(state.contexts.one.expanded).toEqual({});
        state = receive(state, snapshot(5));
        expect(state.contexts.one.expanded.child).toBeUndefined();
    });

    it('accepts normalized confirmations but protects newer drafts from delayed acknowledgements', () => {
        let state = receive(initialSettingsState, snapshot(1));
        state = settingsReducer(state, { type: 'edit', fieldId: 'field', value: 3.7 });
        state = settingsReducer(state, { type: 'sent', fieldId: 'field', requestId: 'first' });
        state = settingsReducer(state, { type: 'edit', fieldId: 'field', value: 4.9 });
        state = settingsReducer(state, { type: 'sent', fieldId: 'field', requestId: 'second' });
        state = settingsReducer(state, { type: 'result', result: { requestId: 'first', status: 'applied', snapshot: snapshot(2, 3) } });
        expect(state.contexts.one.drafts.field).toMatchObject({ value: 4.9, dirty: true });
        state = settingsReducer(state, { type: 'result', result: { requestId: 'second', status: 'applied', snapshot: snapshot(3, 4) } });
        expect(state.contexts.one.drafts.field).toMatchObject({ value: 4, dirty: false });
        expect(state.contexts.one.pending).toEqual({});
    });

    it('handles a confirmation overtaken by a newer snapshot without restoring stale values', () => {
        let state = receive(initialSettingsState, snapshot(1));
        state = settingsReducer(state, { type: 'edit', fieldId: 'field', value: 3.7 });
        state = settingsReducer(state, { type: 'sent', fieldId: 'field', requestId: 'first' });
        state = receive(state, snapshot(3, 5));
        state = settingsReducer(state, { type: 'result', result: { requestId: 'first', status: 'applied', snapshot: snapshot(2, 3) } });
        expect(state.revision).toBe(3);
        expect(state.contexts.one.drafts.field).toMatchObject({ value: 5, dirty: false });
        expect(state.contexts.one.pending).toEqual({});
    });

    it('discards stale snapshots and results from a previous context', () => {
        const state = receive(receive(initialSettingsState, snapshot(1)), snapshot(2, 2, 'two'));
        expect(receive(state, snapshot(1))).toBe(state);
        expect(settingsReducer(state, { type: 'result', result: {
            requestId: 'old', status: 'cancelled', snapshot: snapshot(3, 5),
        } })).toBe(state);
    });

    it.each(['one', 'two'])('settles a request across a context switch when its response describes %s', resultContext => {
        let state = receive(initialSettingsState, snapshot(1));
        state = settingsReducer(state, { type: 'edit', fieldId: 'field', value: 3.7 });
        state = settingsReducer(state, { type: 'sent', fieldId: 'field', requestId: 'first' });
        state = receive(state, snapshot(3, 8, 'two'));
        state = settingsReducer(state, { type: 'result', result: {
            requestId: 'first', status: 'applied', snapshot: snapshot(resultContext === 'one' ? 2 : 4, 8, resultContext),
        } });

        expect(state.contextId).toBe('two');
        expect(state.contexts.two.drafts.field).toMatchObject({ value: 8, dirty: false });
        expect(state.contexts.one.pending).toEqual({});
        state = receive(state, snapshot(5, 3));
        expect(state.contexts.one.drafts.field).toMatchObject({ value: 3, dirty: false });
    });

    it('preserves a newer unsent draft when an earlier request finishes in another context', () => {
        let state = receive(initialSettingsState, snapshot(1));
        state = settingsReducer(state, { type: 'focus', fieldId: 'field', focused: true });
        state = settingsReducer(state, { type: 'edit', fieldId: 'field', value: 3.7 });
        state = settingsReducer(state, { type: 'sent', fieldId: 'field', requestId: 'first' });
        state = settingsReducer(state, { type: 'edit', fieldId: 'field', value: 4.9 });
        state = receive(state, snapshot(2, 8, 'two'));
        state = settingsReducer(state, { type: 'result', result: {
            requestId: 'first', status: 'rejected', snapshot: snapshot(3, 8, 'two'),
        } });

        expect(state.contexts.one.pending).toEqual({});
        state = receive(state, snapshot(4, 3));
        expect(state.contexts.one.drafts.field).toMatchObject({ value: 4.9, dirty: true, focused: false });
    });

    it('releases focus when returning to a context whose input was unmounted', () => {
        let state = receive(initialSettingsState, snapshot(1));
        state = settingsReducer(state, { type: 'focus', fieldId: 'field', focused: true });
        state = receive(state, snapshot(2, 8, 'two'));
        state = receive(state, snapshot(3, 5));

        expect(state.contexts.one.drafts.field).toMatchObject({ value: 5, dirty: false, focused: false });
    });

    it('does not mark focus/blur as an edit and reconciles a clean field on blur', () => {
        let state = receive(initialSettingsState, snapshot(1));
        state = settingsReducer(state, { type: 'focus', fieldId: 'field', focused: true });
        state = receive(state, snapshot(2, 8));
        expect(state.contexts.one.drafts.field).toMatchObject({ value: 1, dirty: false });
        state = settingsReducer(state, { type: 'focus', fieldId: 'field', focused: false });
        expect(state.contexts.one.drafts.field).toMatchObject({ value: 8, dirty: false, focused: false });
    });
});
