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

import '../webpack-globals';
import { MessageHandlerImpl } from '../message-handler';
import * as Messages from './messages';

// Acquire the VS Code webview API via vscode-messenger-webview.
const api = acquireVsCodeApi();

const messageHandler = new MessageHandlerImpl<Messages.IncomingMessage, Messages.OutgoingMessage>(
    api.postMessage.bind(api),
    window
);

// Dynamically load the rest of the assets, then start the application
import('./view/app').then(({ start }) => {
    start(messageHandler);
});
