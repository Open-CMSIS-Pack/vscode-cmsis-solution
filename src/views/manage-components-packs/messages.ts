/**
 * Copyright 2020-2026 Arm Limited
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

import { CtRoot, Result } from '../../json-rpc/csolution-rpc-client';
import { Project, TargetSetData, UiErrorMessage } from './components-data';
import { ComponentRowDataType, ComponentScope, PackRowDataType } from './data/component-tools';

export type SolutionInfo = {
    dir?: string;
    name?: string;
    path?: string;
    relativePath?: string;
};

export type ContextInfo = {
    name?: string;
    path?: string;
    type?: string;
};

/**
 * This module defines the API between the Manage Software Components webview and the backend extension.
 */

/**
 * Messages that the CMSIS Component view can pass to the extension.
 */
export type OutgoingMessage
    = { type: 'REQUEST_INITIAL_DATA' }
    | { type: 'APPLY_COMPONENT_SET' }
    | { type: 'CHANGE_COMPONENT_SCOPE', scope: ComponentScope }
    | { type: 'OPEN_FILE', uri: string, external: boolean, focusOn?: string }
    | { type: 'CHANGE_COMPONENT_VALUE', componentData: ComponentRowDataType }
    | { type: 'CHANGE_COMPONENT_VARIANT', componentData: ComponentRowDataType, variant: string }
    | { type: 'CHANGE_COMPONENT_BUNDLE', componentData: ComponentRowDataType, bundle: string }
    | { type: 'CHANGE_TARGET', targetSet: TargetSetData }
    | { type: 'UNLINK_PACKAGE', packName: string }
    | { type: 'SELECT_PACKAGE', target: string, packId: string }
    | { type: 'UNSELECT_PACKAGE', target: string, packId: string }
    | { type: 'RESOLVE_COMPONENTS' }
    ;

/**
 * Messages that the extension can pass to the CMSIS Component view.
 */
export type IncomingMessage
    = { type: 'SELECTED_PROJECT', project: Project }
    | { type: 'SET_COMPONENT_TREE', tree: CtRoot, validations?: Result[], scope?: ComponentScope }
    | { type: 'SET_PACKS_INFO', packs: PackRowDataType[] }
    | { type: 'IS_DIRTY', isDirty: boolean }
    | { type: 'SET_SOLUTION_STATE', stateMessage: string | undefined }
    | { type: 'SET_ERROR_MESSAGES', messages: UiErrorMessage[] }
    | { type: 'SET_SOLUTION_INFO', solution: SolutionInfo }
    | { type: 'SET_UNLINKREQUESTS_STACK', unlinkRequests: string[] }
    | {
        type: 'SOLUTION_LOADED',
        componentTree: CtRoot,
        validations: Result[],
        componentScope: ComponentScope,
        availableTargetTypes: TargetSetData[],
        selectedTargetType?: TargetSetData,
        selectedLayer?: string,
        packs: PackRowDataType[],
        cbuildPackPath: string,
        solution: SolutionInfo,
        isDirty?: boolean,
        availablePacks: Record<string, string>
    }
    ;
