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

import '../webpack-globals';
import { MessageHandlerImpl } from '../message-handler';
import type { IncomingMessage, OutgoingMessage } from './messages';

/** Uses the VS Code message bridge only in the dedicated preview browser entry point. */
const api = acquireVsCodeApi();
/** Carries preview-only messages independently of the Manage Solution transport. */
const handler = new MessageHandlerImpl<IncomingMessage, OutgoingMessage>(api.postMessage.bind(api), window);

import('./view/app').then(({ start }) => start(handler));
