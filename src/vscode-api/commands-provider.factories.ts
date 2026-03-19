/**
 * Copyright 2023-2026 Arm Limited
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

import { CommandsProvider } from './commands-provider';

export type MockCommandsProvider = {
    mockRunRegistered: <R>(commandId: string, ...parameters: unknown[]) => Promise<R>;
} & {
    [key in keyof CommandsProvider]: jest.Mock;
}

export const commandsProviderFactory = (): MockCommandsProvider => {
    const provider = {
        executeCommand: jest.fn(),
        executeCommandIfRegistered: jest.fn(),
        registerCommand: jest.fn(),
    };

    provider.registerCommand.mockImplementation(() => ({ dispose: jest.fn() }));

    return {
        ...provider,
        mockRunRegistered: async (commandId, ...parameters) => {
            const registerCall = provider.registerCommand.mock.calls.find(([registeredId]) => registeredId === commandId);

            if (!registerCall) {
                throw new Error(`Could not find command handler for ${commandId}`);
            }

            return await registerCall[1].call(registerCall[2], ...parameters);
        }
    };
};
