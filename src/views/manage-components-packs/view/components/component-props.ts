/**
 * Copyright 2026 Arm Limited
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

import { MessageHandler } from '../../../message-handler';
import { IncomingMessage, OutgoingMessage } from '../../messages';

/**
 * @description The props for the ManageComponents component.
 * It contains the message handler for communication with the backend and the component actions.
 * The message handler is used to send and receive messages between the frontend and backend.
 * The component actions are used to perform specific actions when the selected components are modified.
 * The component actions are optional and can be passed as a prop to the component.
 * @type {ComponentProps}
 * @interface
 */
export interface ComponentProps {
    /**
     * @description The message handler for communication with the backend.
     * It is used to send and receive messages between the frontend and backend.
     * The message handler is responsible for handling incoming messages and sending outgoing messages.
     * It is an instance of the MessageHandler class, which provides methods for sending and receiving messages.
     * The message handler is passed as a prop to the component, allowing it to communicate with the backend.
     * @type {MessageHandler<Messages.IncomingMessage, Messages.OutgoingMessage>}
     */
    messageHandler: MessageHandler<IncomingMessage, OutgoingMessage>;
}
