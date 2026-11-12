/**
 * Copyright 2024-2026 Arm Limited
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

import '@testing-library/jest-dom';
import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { AdapterSnapshot } from '../../settings-contract';
import { ManageSolution, manageSolutionTargetDocsUrl } from './manage-solution';
import { SolutionData } from '../state/manage-solution-state';

const data: SolutionData = {
    solutionName: 'Example', solutionPath: '/workspace/example.csolution.yml',
    targets: [{ name: 'First', targetSets: [{ name: '' }] }, { name: 'Second', targetSets: [{ name: '' }] }],
    selectedTarget: { name: 'First', targetSets: [{ name: '' }] }, projects: [], images: [], availableCoreNames: [], usedCoreNames: [],
};
const snapshot: AdapterSnapshot = {
    contextId: 'context', revision: 1,
    header: {
        enabled: true, toggleDebuggerAction: 'enabled', adapters: [{ label: 'Adapter', value: 'adapter' }], selectedAdapter: 'adapter',
        processors: [], selectedProcessor: '', showProcessor: false, autoUpdate: true, autoUpdateAction: 'auto',
    },
    sections: [{
        id: 'root', label: 'Settings', disabled: false, childrenLayout: 'content', children: [], addActions: [],
        fields: [{ id: 'misc', label: 'Misc', type: 'string', value: 'old', disabled: false, editAction: 'edit' }],
    }],
};
function setup() {
    const sent = jest.fn();
    const handler = new MockMessageHandler<IncomingMessage, OutgoingMessage>(sent);
    const view = render(<ManageSolution messageHandler={handler} />);
    act(() => {
        handler.postWindowMessage({ type: 'DATA_CONTEXT_SELECTION', data });
        handler.postWindowMessage({ type: 'IS_BUSY', data: false });
        handler.postWindowMessage({ type: 'ADAPTER_SETTINGS', snapshot });
    });
    return { ...view, handler, sent };
}

describe('Manage Solution composition', () => {
    it('requests the solution and prepared adapter snapshot on mount', () => {
        const { sent } = setup();
        expect(sent).toHaveBeenCalledWith({ type: 'GET_CONTEXT_SELECTION_DATA' });
        expect(sent).toHaveBeenCalledWith({ type: 'GET_ADAPTER_SETTINGS' });
        expect(sent).not.toHaveBeenCalledWith({ type: 'GET_DEBUG_ADAPTERS' });
        expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('retains documentation, solution-file opening and target selection callbacks', () => {
        const { sent } = setup();
        fireEvent.click(screen.getByRole('button', { name: 'Manage Solution Target' }));
        expect(sent).toHaveBeenCalledWith({ type: 'OPEN_FILE', path: manageSolutionTargetDocsUrl, external: true });
        fireEvent.click(screen.getByText('Edit csolution.yml'));
        expect(sent).toHaveBeenCalledWith({ type: 'OPEN_FILE', path: data.solutionPath, external: undefined });
        fireEvent.click(screen.getAllByRole('radio')[1]);
        expect(sent).toHaveBeenCalledWith({ type: 'SET_SELECTED_TARGET', target: 'Second', set: undefined });
    });

    it('sends opaque field actions and preserves a newer draft across delayed snapshots', () => {
        const { handler, sent } = setup();
        const input = screen.getByRole('textbox', { name: 'Misc' });
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 'draft' } });
        act(() => handler.postWindowMessage({ type: 'ADAPTER_SETTINGS', snapshot: { ...snapshot, revision: 2 } }));
        expect(input).toHaveValue('draft');
        fireEvent.blur(input);
        expect(sent).toHaveBeenLastCalledWith({ type: 'SETTINGS_ACTION', request: {
            contextId: 'context', revision: 2, requestId: expect.any(String), actionId: 'edit', value: 'draft',
        } });
    });

    it('uses prepared header actions for enable and automatic update without evaluating debugger data', () => {
        const { sent } = setup();
        fireEvent.click(screen.getByRole('checkbox', { name: 'Enable debug adapter' }));
        expect(sent).toHaveBeenLastCalledWith({ type: 'SETTINGS_ACTION', request: expect.objectContaining({ actionId: 'enabled', value: false }) });
        fireEvent.click(screen.getByRole('checkbox', { name: 'Update launch.json and tasks.json' }));
        expect(sent).toHaveBeenLastCalledWith({ type: 'SETTINGS_ACTION', request: expect.objectContaining({ actionId: 'auto', value: false }) });
    });
});
