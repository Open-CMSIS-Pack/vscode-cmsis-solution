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

import { LayerError, TargetConfiguration } from './view/state/reducer';

/**
  * This module defines the API between the Create Solution webview and the backend extension.
  *
  * To match the transactional model of core-tools this API adopts a similar pattern.
  * The typical flow is that the webview can make a specific request (OutgoingMessage),
  * and the backend will then respond (IncomingMessage) with a more generic ACK-like message,
  * indicating either success or failure.
  *
  * At present there is no message ID, to concretely identify an ACK, but as core-tools only
  * holds onto one active solution in memory there should be a 1-1 mapping of any requests/ACKs
  * of the same type.
  */

/**
 * Messages that the Create Solution view can pass to the extension.
 */
export type OutgoingMessage
    = { type: 'APPLY_CONFIGURE', layer: TargetConfiguration, compiler: string }
    | { type: 'WEBVIEW_CLOSE' }
    | { type: 'DATA_UPDATE_BOARD_LAYERS' }
    | { type: 'OPEN_FILE_PICKER' }
    | { type: 'DATA_GET_DEFAULT_LOCATION' }
    | { type: 'GET_PLATFORM' }
    | { type: 'CHECK_LAYER_DOES_NOT_EXIST', layerFolder: string, variableId: number }


export type Platform = 'ksc' | 'vscode';

/**
 * Messages that the extension can pass to the Create Solution view.
*/
export type IncomingMessage
= { type: 'REQUEST_SUCCESSFUL', requestType: OutgoingMessage['type'] }
| { type: 'REQUEST_FAILED', requestType: OutgoingMessage['type'], errorMessage?: string }
| { type: 'BOARD_LAYER_DATA', layers: TargetConfiguration[], activeTargetType: string, availableCompilers: string[] }
| { type: 'LOADING' }
| { type: 'BOARD_LAYER_NODATA', activeTargetType: string, availableCompilers: string[] }
| { type: 'PLATFORM', data: { name: Platform } }
| { type: 'BOARD_LAYER_DATA_ERRORS', layerErrors: LayerError[] }
| { type: 'RESULT_LAYER_EXISTS_CHECK', variableId: number, result: boolean }

export type ChangeLayerMessage = Extract<OutgoingMessage, {type: 'APPLY_CONFIGURE'}>;
