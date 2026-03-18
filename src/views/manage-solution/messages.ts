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

import { DebugAdapter } from '../../debug/debug-adapters-yaml-file';
import { FileSelectorOptionsType } from './types';
import { ActiveTargetSet, SolutionData } from './view/state/manage-solution-state';

/**
 * Messages that the context selection view can pass to the extension.
 */
export type OutgoingMessage
    = { type: 'GET_CONTEXT_SELECTION_DATA' }
    | { type: 'SET_SELECTED_TARGET', target: string, set: string | undefined }
    | { type: 'OPEN_FILE', path: string }
    | { type: 'SET_SELECTED_CONTEXTS', data: SolutionData }
    | { type: 'GET_DEBUG_ADAPTERS' }
    | { type: 'SET_DEBUGGER', name: string }
    | { type: 'ADD_NEW_CONTEXT' }
    | { type: 'ADD_NEW_PROJECT' }
    | { type: 'ADD_NEW_IMAGE' }
    | { type: 'UNLINK_IMAGE', image: string }
    | { type: 'SET_START_PROCESSOR', value: string }
    | { type: 'SAVE_CONTEXT_SELECTION' }
    | { type: 'OPEN_HELP' }
    | { type: 'SET_DEBUG_ADAPTER_PROPERTY', service: string | undefined, key: string, value: string | number, pname?: string }
    | { type: 'SELECT_FILE', requestId: string, options?: FileSelectorOptionsType }
    | { type: 'SET_AUTO_UPDATE', value: boolean }
    | { type: 'TOGGLE_DEBUGGER', value: boolean }
    | { type: 'TOGGLE_DEBUG_ADAPTER_SECTION', section: string }
    ;

/**
 * Messages that the extension can pass to the context selection view.
 */
export type IncomingMessage
    = { type: 'DATA_CONTEXT_SELECTION', data: SolutionData }
    | { type: 'DEBUG_ADAPTERS', data: DebugAdapter[], sectionsInUse: string[] }
    | { type: 'DEBUGGER', data: string }
    | { type: 'ACTIVE_TARGET_SET', data: ActiveTargetSet }
    | { type: 'IS_DIRTY', data: boolean }
    | { type: 'IS_BUSY', data: boolean }
    | { type: 'FILE_SELECTED', data: string[], requestId: string }
    | { type: 'AUTO_UPDATE', data: boolean }
    ;
