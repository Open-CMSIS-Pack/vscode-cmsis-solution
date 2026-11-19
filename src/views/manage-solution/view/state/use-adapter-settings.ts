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

import { useCallback, useEffect, useId, useReducer, useRef } from 'react';
import type { MessageHandler } from '../../../message-handler';
import type { IncomingMessage, OutgoingMessage } from '../../messages';
import { initialSettingsState, settingsReducer } from './settings-reducer';

/** Isolates message transport from presentation components and ties every action to its current snapshot. */
export function useAdapterSettings(handler: MessageHandler<IncomingMessage, OutgoingMessage>) {
    const [state, dispatch] = useReducer(settingsReducer, initialSettingsState);
    const sequence = useRef(0);
    const clientId = useId();
    const context = state.contextId ? state.contexts[state.contextId] : undefined;
    useEffect(() => {
        const unsubscribe = handler.subscribe(message => {
            if (message.type === 'ADAPTER_SETTINGS') dispatch({ type: 'snapshot', snapshot: message.snapshot });
            if (message.type === 'SETTINGS_ACTION_RESULT') dispatch({ type: 'result', result: message.result });
        });
        handler.push({ type: 'GET_ADAPTER_SETTINGS' });
        return unsubscribe;
    }, [handler]);
    const act = useCallback((actionId: string, value?: string | number | boolean, fieldId?: string) => {
        if (!context) return;
        const requestId = `${clientId}-${++sequence.current}`;
        if (fieldId) dispatch({ type: 'sent', requestId, fieldId });
        handler.push({ type: 'SETTINGS_ACTION', request: {
            contextId: context.snapshot.contextId, revision: context.snapshot.revision, requestId, actionId, value,
        } });
    }, [handler, context, clientId]);
    return { context, dispatch, act };
}
