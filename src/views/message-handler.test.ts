/**
 * Copyright 2020-2026 Arm Limited
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

import 'jest';
import { MessageHandler, MessageHandlerImpl } from './message-handler';

interface MessageIn {
    type: 'COUNT';
    count: number
}

interface MessageOut {
    type: 'RESET';
}

describe('MessageHandler', () => {
    let messageHandler: MessageHandler<MessageIn, MessageOut>;
    let postMessage: jest.Mock;
    let window: { addEventListener: jest.Mock };
    let messageListeners: Array<(event: MessageEvent) => void>;

    beforeEach(() => {
        messageListeners = [];
        postMessage = jest.fn();
        window = { addEventListener: jest.fn() };

        window.addEventListener.mockImplementation((eventType: string, listener: () => void) => {
            if (eventType === 'message') {
                messageListeners.push(listener);
            }
        });

        messageHandler = new MessageHandlerImpl(postMessage, window as unknown as Window);
    });

    it('adds a message event listener on construction', () => {
        expect(messageListeners.length).toBe(1);
    });

    it('calls postMessage when a message is pushed', () => {
        const message: MessageOut = { type: 'RESET' };
        messageHandler.push(message);

        expect(postMessage).toHaveBeenCalledTimes(1);
        expect(postMessage).toHaveBeenCalledWith(message);
    });

    it('calls a subscription handler when a message is received via the window', () => {
        const subscriptionHandler = jest.fn();
        messageHandler.subscribe(subscriptionHandler);

        const message: MessageIn = { type: 'COUNT', count: 3 };
        const listener = messageListeners[0] as (event: MessageEvent) => void;
        listener({ data: message } as MessageEvent);

        expect(subscriptionHandler).toHaveBeenCalledTimes(1);
        expect(subscriptionHandler).toHaveBeenCalledWith(message);
    });

    it('does not call a subscription handler when unsubscribe has been called', () => {
        const subscriptionHandler = jest.fn();
        const unsubscribe = messageHandler.subscribe(subscriptionHandler);

        unsubscribe();

        const message: MessageIn = { type: 'COUNT', count: 3 };
        const listener = messageListeners[0] as (event: MessageEvent) => void;
        listener({ data: message } as MessageEvent);

        expect(subscriptionHandler).not.toHaveBeenCalled();
    });
});
