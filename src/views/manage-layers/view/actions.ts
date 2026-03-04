/**
 * Copyright 2022-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MessageHandler } from '../../message-handler';
import { IncomingMessage, OutgoingMessage } from '../messages';
import { messageServiceAwaitResult } from './components/message-service';
import { ManageLayersAction, ManageLayersState } from './state/reducer';


export const buildChangeLayerMessage = (state: ManageLayersState): OutgoingMessage => {
    return {
        type: 'APPLY_CONFIGURE',
        layer: state.layers[state.currentLayerNumber],
        compiler: state.selectedCompiler,
    };
};

export const changeLayer = async (
    dispatch: (action: ManageLayersAction) => void,
    state: ManageLayersState,
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>,
): Promise<void> => {
    dispatch({ type: 'LAYERS_CHECK_START' });

    const hasValidationErrors = false;
    if (hasValidationErrors) {
        dispatch({ type: 'LAYERS_END' });
        return;
    }

    try {
        await messageServiceAwaitResult(
            messageHandler,
            buildChangeLayerMessage(state),
        );
    } catch {
        dispatch({ type: 'LAYERS_END' });
        return;
    }

    messageHandler.push({ type: 'WEBVIEW_CLOSE' });
};


export const changeLayerActions = {
    changeLayer,
} as const;

export type ChangeLayerActions = typeof changeLayerActions;
