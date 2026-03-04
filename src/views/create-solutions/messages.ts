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

import { BoardId, DeviceReference, Example, RefApp, Template } from '../../core-tools/client/packs_pb';
import { DraftProjectData } from '../../data-manager/draft-project-data';
import { ExampleProject } from '../../solar-search/solar-search-client';
import { PackReference } from '../../solutions/parsing/common-file-parsing';
import { TargetType } from '../../solutions/parsing/solution-file';
import { TreeViewCategory } from '../common/components/tree-view';
import { BoardHardwareOption, DeviceHardwareOption, HardwareInfo, NewProject } from './cmsis-solution-types';
import { DataManagerExample, DraftProject } from './view/state/reducer';


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
  = {
    type: 'NEW_SOLUTION',
    solutionName: string,
    projects: NewProject[],
    targetTypes: TargetType[],
    packs: PackReference[],
    gitInit: boolean,
    solutionLocation: string,
    solutionFolder: string,
    compiler: string,
    selectedTemplate?: DraftProject,
    showOpenDialog?: boolean,
    dataManagerObject?: DraftProjectData, // is set in GUI backend
  }
  | { type: 'PROJECT_DOES_NOT_EXIST', solutionName: string, projectName: string }
  | { type: 'CHECK_SOLUTION_DOES_NOT_EXIST', solutionLocation: string, solutionName: string, solutionFolder: string }
  | { type: 'WEBVIEW_CLOSE' }
  | { type: 'DATA_GET_TARGETS' }
  | { type: 'OPEN_FILE_PICKER', solutionLocation?: string }
  | { type: 'DATA_GET_DEFAULT_LOCATION' }
  | { type: 'DATA_GET_BOARD_INFO', boardId: BoardId.AsObject & { key: string } }
  | { type: 'DATA_GET_DEVICE_INFO', deviceId: DeviceReference.AsObject & { key: string } }
  | { type: 'DATA_GET_CONNECTED_DEVICE' }
  | { type: 'GET_PLATFORM' }
  | { type: 'DATA_GET_DATAMANAGER_APPS', device?: string, board?: string, fromAllPackVersions?: boolean }
  | { type: 'GET_STATE_USE_WEBSERVICES' }
  | { type: 'DATA_GET_DRAFTPROJECT_INFO', id: string }
  | { type: 'HELP_OPEN' }
  ;


export type HardwareLists = {
  boards: TreeViewCategory<BoardHardwareOption>[];
  devices: TreeViewCategory<DeviceHardwareOption>[];
}

export type Platform = 'ksc' | 'vscode';

/**
 * Messages that the extension can pass to the Create Solution view.
*/
export type IncomingMessage
  = | { type: 'REQUEST_SUCCESSFUL', requestType: OutgoingMessage['type'] }
  | { type: 'REQUEST_FAILED', requestType: OutgoingMessage['type'], errorMessage?: string }
  | { type: 'TARGET_DATA', data: HardwareLists, errors: string[] }
  | { type: 'BOARD_EXAMPLE_DATA', data: ExampleProject[] }
  | { type: 'BOARD_EXAMPLE_DATA_LOCAL', data: Example.AsObject[] }
  | { type: 'SOLUTION_LOCATION', data: { path: string } }
  | { type: 'HARDWARE_INFO', data: HardwareInfo }
  | { type: 'CONNECTED_BOARD', data: { name: string } }
  | { type: 'PLATFORM', data: { name: Platform } }
  | { type: 'REF_APP_DATA', data: RefApp.AsObject[] }
  | { type: 'TEMPLATE_DATA', data: Template.AsObject[] }
  | { type: 'DATAMANAGER_APPS_DATA', data: Array<TreeViewCategory<string>> }
  | { type: 'STATE_USE_WEBSERVICES', enabled: boolean }
  | { type: 'DRAFTPROJECT_INFO', data: DataManagerExample }

export type NewSolutionMessage = Extract<OutgoingMessage, { type: 'NEW_SOLUTION' }>;
