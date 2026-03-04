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

import { Disposable } from 'vscode';
import * as vscode from 'vscode';

export type CommandsProvider = {
    executeCommand: <T = unknown>(command: string, ...rest: unknown[]) => Thenable<T>;
    executeCommandIfRegistered: <T = unknown>(command: string, ...rest: unknown[]) => Thenable<T | undefined>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerCommand: <A extends any[] = unknown[]>(command: string, callback: (...args: A) => unknown, thisArg?: unknown) => Disposable;
}

export const commandsProvider: Readonly<CommandsProvider> = {
    executeCommand: vscode.commands.executeCommand.bind(vscode.commands),
    registerCommand: vscode.commands.registerCommand.bind(vscode.commands),
    executeCommandIfRegistered: async <T = unknown>(command: string, ...rest: unknown[]): Promise<T | undefined> => {
        const registeredCommands = await vscode.commands.getCommands();

        if (registeredCommands.includes(command)) {
            return vscode.commands.executeCommand(command, ...rest);
        } else {
            return undefined;
        }
    },
};
