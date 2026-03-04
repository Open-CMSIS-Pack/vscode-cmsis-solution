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

import * as vscode from 'vscode';

export interface GlobalState<C extends { [key in string]: unknown }> {
    update<K extends keyof C>(key: K, value: C[K]): void;
    get<K extends keyof C>(key: K): C[K] | undefined;
}

export type CsolutionGlobalState = {
    panelSeen: boolean;
    autoInstallPackKey: boolean;
}

export class GlobalStateImpl {
    constructor(private readonly globalState: vscode.Memento) {}

    public update<K extends keyof CsolutionGlobalState>(key: K, value: CsolutionGlobalState[K]): void {
        this.globalState.update(key, value);
    }

    public get<K extends keyof CsolutionGlobalState>(key: K): CsolutionGlobalState[K] | undefined {
        return this.globalState.get(key);
    }
}
