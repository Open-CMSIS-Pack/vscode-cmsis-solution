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

import * as vscode from 'vscode';
import { Disposable, Extension } from 'vscode';

export type ExtensionApiProvider<A> = {

    onActivate(callback: (api: A) => void): Disposable;

    activateIfEnabled(): Promise<A | undefined>;

}

type VersionedExtension<A> = {
    getApi(version: number): A;
}

export class ExtensionApiProviderImpl<A, E extends VersionedExtension<A>> implements ExtensionApiProvider<A> {
    constructor(
        private readonly extensionId: string,
        private readonly version: number,
        private readonly vscodeExtensions: Pick<typeof vscode.extensions, 'onDidChange' | 'getExtension'> = vscode.extensions,
    ) {}

    public onActivate(callback: (api: A) => void): Disposable {
        let extensionIsEnabled: boolean | undefined;

        const handleChange = async () => {
            const extensionApi = await this.activateIfEnabled();

            if (extensionIsEnabled === undefined || !!extensionApi !== extensionIsEnabled) {
                extensionIsEnabled = !!extensionApi;

                if (extensionApi) {
                    callback(extensionApi);
                }
            }
        };

        handleChange();
        return this.vscodeExtensions.onDidChange(handleChange);
    }

    public async activateIfEnabled(): Promise<A | undefined> {
        const extension = this.getExtension();

        if (extension) {
            const extensionExports = await extension.activate();
            return this.getApi(extensionExports);
        }

        return undefined;
    }

    private getExtension(): Extension<E> | undefined {
        return this.vscodeExtensions.getExtension<E>(this.extensionId);
    }

    private getApi(extensionExports: E): A | undefined {
        try {
            return extensionExports.getApi(this.version);
        } catch (error) {
            console.warn(`Failed to get extension API version ${this.version} for ${this.extensionId}`, error);
            return undefined;
        }
    }
}
