/**
 * Copyright 2022-2026 Arm Limited
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

import { TreeViewCategory } from '../common/components/tree-view';
import {
    CreateSolutionSubmission,
    DraftProjectDetails,
    HardwareInfo,
    HardwareLists,
} from './create-solution-dto';


/**
  * This module defines the API between the Create Solution webview and the backend extension.
  *
  * To match the transactional model of core-tools this API adopts a similar pattern.
  * The typical flow is that the webview can make a specific request (OutgoingMessage),
  * and the backend will then respond (IncomingMessage) with a more generic ACK-like message,
  * indicating either success or failure.
  *
  * Request IDs correlate every request with its data and completion responses.
  */

/**
 * Messages that the Create Solution view can pass to the extension.
 */
export type RequestId = string;

type Request<T extends string> = { type: T; requestId: RequestId };

export type RequestMessage
  = Request<'NEW_SOLUTION'> & CreateSolutionSubmission
  | Request<'CHECK_SOLUTION_DOES_NOT_EXIST'> & { solutionLocation: string; solutionName: string; solutionFolder: string }
  | Request<'DATA_GET_TARGETS'>
  | Request<'OPEN_FILE_PICKER'> & { solutionLocation?: string }
  | Request<'DATA_GET_DEFAULT_LOCATION'>
  | Request<'DATA_GET_BOARD_INFO'> & { boardKey: string }
  | Request<'DATA_GET_DEVICE_INFO'> & { deviceKey: string }
  | Request<'DATA_GET_CONNECTED_DEVICE'>
  | Request<'GET_PLATFORM'>
  | Request<'DATA_GET_DATAMANAGER_APPS'> & { device?: string; board?: string; fromAllPackVersions?: boolean }
  | Request<'GET_STATE_USE_WEBSERVICES'>
  | Request<'DATA_GET_DRAFTPROJECT_INFO'> & { id: string }
  | Request<'HELP_OPEN'>;

export type OutgoingMessage = RequestMessage | { type: 'WEBVIEW_CLOSE' };

export type RequestMessagePayload = RequestMessage extends infer Message
  ? Message extends { requestId: RequestId }
    ? Omit<Message, 'requestId'>
    : never
  : never;

let nextRequestId = 0;

export const addRequestId = (message: RequestMessagePayload): RequestMessage => ({
    ...message,
    requestId: `${Date.now()}-${nextRequestId++}`,
} as RequestMessage);

export type Platform = 'ksc' | 'vscode';

/**
 * Messages that the extension can pass to the Create Solution view.
*/
export type IncomingMessage
  = | { type: 'REQUEST_SUCCESSFUL'; requestType: RequestMessage['type']; requestId: RequestId }
  | { type: 'REQUEST_FAILED'; requestType: RequestMessage['type']; requestId: RequestId; errorMessage?: string }
  | { type: 'TARGET_DATA'; requestId: RequestId; data: HardwareLists; errors: string[] }
  | { type: 'SOLUTION_LOCATION'; requestId: RequestId; data: { path: string } }
  | { type: 'HARDWARE_INFO'; requestId: RequestId; data: HardwareInfo }
  | { type: 'CONNECTED_BOARD'; requestId: RequestId; data: { name: string } }
  | { type: 'PLATFORM'; requestId: RequestId; data: { name: Platform } }
  | { type: 'DATAMANAGER_APPS_DATA'; requestId: RequestId; data: Array<TreeViewCategory<string>> }
  | { type: 'STATE_USE_WEBSERVICES'; requestId: RequestId; enabled: boolean }
  | { type: 'DRAFTPROJECT_INFO'; requestId: RequestId; data: DraftProjectDetails }

export type NewSolutionMessage = Extract<RequestMessage, { type: 'NEW_SOLUTION' }>;
