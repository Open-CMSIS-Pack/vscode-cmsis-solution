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

export type MessageCallback<In> = (message: In) => void;

/**
 * Handles sending messages to the extension backend and receiving messages from it.
 */
export interface MessageHandler<In, Out> {
    /**
     * Send a message to the backend.
     */
    push(message: Out): void;

    /**
     * Subscribe to receive messages pushed from the extension backend.
     * Returns a function that unsubscribes.
     */
    subscribe(handler: MessageCallback<In>): () => void;
}

export class MessageHandlerImpl<In, Out> implements MessageHandler<In, Out> {
    private idSeed = 0;
    private readonly handlers: Map<number, MessageCallback<In>> = new Map();

    constructor(
        /**
         * The postMessage method from the Theia webview plugin API.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private readonly postMessage: (message: any) => void,
        windowObject: Window = window
    ) {
        windowObject.addEventListener('message', ({ data }) => {
            const message: In = data;

            for (const handler of this.handlers.values()) {
                handler(message);
            }
        });
    }

    public push(message: Out): void {
        this.postMessage(message);
    }

    public subscribe(handler: MessageCallback<In>): () => void {
        const id = this.idSeed++;
        this.handlers.set(id, handler);

        return () => {
            this.handlers.delete(id);
        };
    }
}
