/**
 * Copyright 2026 Arm Limited
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

import type { AdapterSnapshot, SettingsActionRequest, SettingsActionResult } from '../manage-solution/settings-contract';

/** Serializable state for one document's isolated authoring preview. */
export type PreviewState = {
    adapters: string[];
    adapter: string;
    devices: { id: string; name: string }[];
    device: string;
    processors: string[];
    usedProcessors: string[];
    loading: boolean;
    deviceError?: string;
    error?: string;
    snapshot?: AdapterSnapshot;
    yaml: string;
    context: string;
    deviceContext: string;
    contextError?: string;
};

/** Host updates retain the production settings action acknowledgement protocol. */
export type IncomingMessage =
    | { type: 'STATE'; state: PreviewState }
    | { type: 'RESULT'; result: SettingsActionResult };

/** Preview commands carry no source file paths or debugger storage addresses. */
export type OutgoingMessage =
    | { type: 'READY' }
    | { type: 'ADAPTER'; name: string }
    | { type: 'DEVICE'; id: string }
    | { type: 'PROCESSORS'; names: string[] }
    | { type: 'DEVICE_CONTEXT'; text: string }
    | { type: 'RESET' }
    | { type: 'REVEAL' }
    | { type: 'ACTION'; request: SettingsActionRequest };
