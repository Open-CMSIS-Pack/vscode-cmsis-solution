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

import type { AdapterSnapshot, SettingsActionRequest, SettingsActionResult } from './settings-contract';
import { ActiveTargetSet, SolutionData } from './view/state/manage-solution-state';

/**
 * Messages that the context selection view can pass to the extension.
 */
export type OutgoingMessage
    = { type: 'GET_ADAPTER_SETTINGS' }
    | { type: 'SETTINGS_ACTION', request: SettingsActionRequest }
    | { type: 'GET_CONTEXT_SELECTION_DATA' }
    | { type: 'SET_SELECTED_TARGET', target: string, set: string | undefined }
    | { type: 'OPEN_FILE', path: string, external?: boolean }
    | { type: 'SET_SELECTED_CONTEXTS', data: SolutionData }
    | { type: 'ADD_NEW_CONTEXT' }
    | { type: 'ADD_NEW_PROJECT' }
    | { type: 'ADD_NEW_IMAGE' }
    | { type: 'UNLINK_IMAGE', image: string }
    | { type: 'SAVE_CONTEXT_SELECTION' }
    | { type: 'OPEN_HELP' }
    ;

/**
 * Messages that the extension can pass to the context selection view.
 */
export type IncomingMessage
    = { type: 'ADAPTER_SETTINGS', snapshot: AdapterSnapshot }
    | { type: 'SETTINGS_ACTION_RESULT', result: SettingsActionResult }
    | { type: 'DATA_CONTEXT_SELECTION', data: SolutionData }
    | { type: 'ACTIVE_TARGET_SET', data: ActiveTargetSet }
    | { type: 'IS_DIRTY', data: boolean }
    | { type: 'IS_BUSY', data: boolean }
    ;
