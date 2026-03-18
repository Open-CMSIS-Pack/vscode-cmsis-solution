/**
 * Copyright 2024-2026 Arm Limited
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

import { CsolutionGlobalState, GlobalState } from './global-state';

export type MockGlobalState = {
    [key in keyof GlobalState<CsolutionGlobalState>]: jest.Mock;
}

export const globalStateFactory = (): MockGlobalState => {
    const store = new Map<string, unknown>();

    const get = jest.fn((key: string, defaultValue?: unknown) => {
        return store.get(key) ?? defaultValue;
    });

    const update = jest.fn(async (key: string, value: unknown) => {
        store.set(key, value);
    });

    return {
        get,
        update
    };
};
