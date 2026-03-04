/**
 * Copyright 2023-2026 Arm Limited
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
import { NotificationHandler, NotificationType } from 'vscode-messenger-common';

export type MockMessenger = {
    sendNotification: jest.Mock;
    onNotification: <P>(type: NotificationType<P>, handler: NotificationHandler<P>) => void;
    registerWebviewView: jest.Mock;
    fireMockNotification: <P>(type: NotificationType<P>, params: P) => Promise<void>;
}

export const mockMessenger = (): MockMessenger => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notificationHandlers: { type: NotificationType<any>, handler: NotificationHandler<any> }[] = [];

    return {
        sendNotification: jest.fn(),
        registerWebviewView: jest.fn(),
        onNotification: <P>(type: NotificationType<P>, handler: NotificationHandler<P>): void => {
            notificationHandlers.push({ type, handler });
        },
        fireMockNotification: async <P>(type: NotificationType<P>, params: P): Promise<void> => {
            for (const entry of notificationHandlers) {
                if (entry.type.method === type.method) {
                    await entry.handler(params, { type: 'extension' });
                }
            }
        }
    };
};
