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

import { act, renderHook } from '@testing-library/react';
import { MockMessageHandler } from '../../../__test__/mock-message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';
import { AdapterSnapshot } from '../../settings-contract';
import { useAdapterSettings } from './use-adapter-settings';

it('subscribes before requesting state, sends scoped actions, and unsubscribes on unmount', () => {
    const sent = jest.fn();
    const handler = new MockMessageHandler<IncomingMessage, OutgoingMessage>(sent);
    const subscribe = jest.spyOn(handler, 'subscribe');
    const snapshot: AdapterSnapshot = {
        contextId: 'context', revision: 12,
        header: { enabled: true, adapters: [], selectedAdapter: '', processors: [], selectedProcessor: '', showProcessor: false, autoUpdate: false },
        sections: [],
    };
    sent.mockImplementation((message: OutgoingMessage) => {
        if (message.type === 'GET_ADAPTER_SETTINGS') handler.postWindowMessage({ type: 'ADAPTER_SETTINGS', snapshot });
    });
    const { result, unmount } = renderHook(() => useAdapterSettings(handler));
    expect(result.current.context?.snapshot).toEqual(snapshot);
    act(() => result.current.act('opaque', true));
    expect(sent).toHaveBeenLastCalledWith({ type: 'SETTINGS_ACTION', request: {
        contextId: 'context', revision: 12, requestId: expect.any(String), actionId: 'opaque', value: true,
    } });
    expect(subscribe).toHaveBeenCalledTimes(1);
    unmount();
    // A new snapshot after disposal has no subscribed hook to update.
    act(() => handler.postWindowMessage({ type: 'ADAPTER_SETTINGS', snapshot: { ...snapshot, revision: 13 } }));
    expect(result.current.context?.snapshot.revision).toBe(12);
});
