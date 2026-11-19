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

import { useCallback, useEffect, useReducer } from 'react';
import type { MessageHandler } from '../../../message-handler';
import type { IncomingMessage, OutgoingMessage } from '../../messages';
import { contextUpdateReducer, initialState, manageSolutionReducer, SolutionUpdateAction } from './reducer';
import { useAdapterSettings } from './use-adapter-settings';
import { useVSCodeTheme } from '../../../hooks/use-vscode-theme';
import { useDisableContextMenu } from '../../../hooks/use-disable-context-menu';

/** Coordinates independent dialog areas; the settings renderer only receives presentation props. */
export function useManageSolution(handler: MessageHandler<IncomingMessage, OutgoingMessage>) {
    const [state, dispatch] = useReducer(manageSolutionReducer, initialState);
    const settings = useAdapterSettings(handler);
    const isDarkTheme = useVSCodeTheme();

    useDisableContextMenu();

    useEffect(() => {
        const unsubscribe = handler.subscribe(message => {
            if (message.type === 'DATA_CONTEXT_SELECTION' || message.type === 'IS_BUSY' || message.type === 'IS_DIRTY') {
                dispatch({ type: 'INCOMING_MESSAGE', message });
            }
        });
        handler.push({ type: 'GET_CONTEXT_SELECTION_DATA' });
        return unsubscribe;
    }, [handler]);

    const updateSelectedTarget = useCallback((action: SolutionUpdateAction) => {
        if (action.type !== 'SET_SELECTED_TARGET') return;
        const set = action.set === '<default>' ? undefined : action.set;
        handler.push({ type: 'SET_SELECTED_TARGET', target: action.target, set });
        dispatch({ ...action, set });
    }, [handler]);

    const updateSolutionData = useCallback((action: SolutionUpdateAction) => {
        handler.push({ type: 'SET_SELECTED_CONTEXTS', data: contextUpdateReducer(state.solutionData, action) });
        dispatch(action);
    }, [handler, state.solutionData]);

    return {
        state, settings, isDarkTheme, updateSelectedTarget, updateSolutionData,
        openFile: (path: string, external?: boolean) => handler.push({ type: 'OPEN_FILE', path, external }),
        addContext: () => handler.push({ type: 'ADD_NEW_CONTEXT' }),
        addProject: () => handler.push({ type: 'ADD_NEW_PROJECT' }),
        addImage: () => handler.push({ type: 'ADD_NEW_IMAGE' }),
        unlinkImage: (image: string) => handler.push({ type: 'UNLINK_IMAGE', image }),
        settingsCallbacks: {
            onAction: settings.act,
            onEdit: (fieldId: string, value: string | number) => settings.dispatch({ type: 'edit', fieldId, value }),
            onFocus: (fieldId: string, focused: boolean) => settings.dispatch({ type: 'focus', fieldId, focused }),
        },
    };
}
