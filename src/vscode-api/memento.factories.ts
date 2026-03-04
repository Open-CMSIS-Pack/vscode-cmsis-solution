/**
 * Copyright 2024-2026 Arm Limited
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

import { ExtensionContext, Memento } from 'vscode';

export type MockVscodeMomento = Memento & jest.Mocked<Pick<ExtensionContext['globalState'], 'setKeysForSync'>>

export const mementoFactory = (): Memento => {
    const store = new Map<string, unknown>();

    return {
        get: <T>(key: string, defaultValue?: T) => store.get(key) ?? defaultValue,
        update: async (key: string, value: unknown) => {
            store.set(key, value);
        },
        keys: () => Array.from(store.keys()),
    };
};

export const vscodeMomentoFactory = (): MockVscodeMomento => ({
    ...mementoFactory(),
    setKeysForSync: jest.fn(),
});
