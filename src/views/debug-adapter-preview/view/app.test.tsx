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

import '@testing-library/jest-dom';
import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { IncomingMessage, OutgoingMessage, PreviewState } from '../messages';
import type { MessageHandler } from '../../message-handler';
import { PreviewSession } from '../preview-session';
import { Preview } from './app';

/** Creates a browser message boundary with a real production-model snapshot. */
function setup() {
    const session = new PreviewSession('untitled:preview');
    session.update(`debug-adapters:
  - name: Example
    user-interface:
      - section: General
        options:
          - name: Frequency
            yml-node: clock
            type: string
            default: initial
          - name: Script
            yml-node: script
            type: file
            default: script.ini
`, true);
    const state: PreviewState = { ...session.state(), devices: [
        { id: 'Vendor::STM32', name: 'STM32' },
        { id: 'Vendor::LPC', name: 'LPC' },
    ], loading: false };
    let receive: (message: IncomingMessage) => void = () => {};
    const unsubscribe = jest.fn();
    const handler: MessageHandler<IncomingMessage, OutgoingMessage> = {
        push: jest.fn(),
        subscribe: callback => {
            receive = callback;
            return unsubscribe;
        },
    };
    const view = render(<Preview handler={handler} />);
    act(() => receive({ type: 'STATE', state }));
    return { ...view, handler, state, receive, unsubscribe };
}

describe('isolated preview webview', () => {
    it('filters device names and sends only the selected csolution ID', async () => {
        const { handler } = setup();
        const devices = screen.getByRole('combobox', { name: 'Device' });
        fireEvent.mouseDown(devices);
        fireEvent.change(devices, { target: { value: 'lpc' } });
        fireEvent.click(await screen.findByText('Vendor::LPC (LPC)'));
        expect(handler.push).toHaveBeenCalledWith({ type: 'DEVICE', id: 'Vendor::LPC' });
        expect(screen.queryByText('Vendor::STM32 (STM32)')).not.toBeInTheDocument();
    });

    it('commits temporary field edits and provides reset and source actions', () => {
        const { handler, unmount, unsubscribe } = setup();
        const field = screen.getByRole('textbox', { name: 'Frequency' });
        fireEvent.change(field, { target: { value: 'changed' } });
        fireEvent.blur(field);
        expect(handler.push).toHaveBeenCalledWith(expect.objectContaining({ type: 'ACTION', request: expect.objectContaining({ value: 'changed' }) }));
        fireEvent.click(screen.getByRole('button', { name: 'Reset preview' }));
        expect(handler.push).toHaveBeenCalledWith({ type: 'RESET' });
        fireEvent.click(screen.getByRole('button', { name: 'Show YAML source' }));
        expect(handler.push).toHaveBeenCalledWith({ type: 'REVEAL' });
        unmount();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('renders both file buttons from a real preview-session snapshot', () => {
        setup();

        expect(screen.getByRole('textbox', { name: 'Script' })).toHaveValue('script.ini');
        expect(screen.getByRole('button', { name: 'Browse Script' }).querySelector('svg')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Open Script' }).querySelector('svg')).toBeInTheDocument();
    });

    it('applies device JSON, retains invalid drafts during updates, and discards them on device selection', () => {
        const { state, receive, handler } = setup();
        fireEvent.click(screen.getByText('Device context', { selector: 'summary' }));
        const editor = screen.getByRole('textbox', { name: 'Device context' });
        expect(editor).toHaveValue(state.deviceContext);
        fireEvent.change(editor, { target: { value: '{' } });
        fireEvent.click(screen.getByRole('button', { name: 'Apply device context' }));
        expect(handler.push).toHaveBeenCalledWith({ type: 'DEVICE_CONTEXT', text: '{' });

        act(() => receive({ type: 'STATE', state: { ...state, contextError: 'Invalid JSON' } }));
        expect(editor).toHaveValue('{');
        expect(screen.getByRole('alert')).toHaveTextContent('The last valid device context is still in use.');
        act(() => receive({ type: 'STATE', state: { ...state, device: 'Vendor::LPC', deviceContext: '{"id":"Vendor::LPC"}' } }));
        expect(editor).toHaveValue('{"id":"Vendor::LPC"}');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('retains the last rendering but blocks edits while the buffer is invalid', () => {
        const { state, receive, handler } = setup();
        act(() => receive({ type: 'STATE', state: { ...state, error: 'Invalid YAML' } }));
        expect(screen.getByRole('alert')).toHaveTextContent('Showing the last valid preview');
        expect(screen.getByRole('textbox', { name: 'Frequency' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Reset preview' })).toBeDisabled();
        expect(handler.push).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'ACTION' }));
    });
});
