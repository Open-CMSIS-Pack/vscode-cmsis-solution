/**
 * Copyright 2025-2026 Arm Limited
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

import { Optional } from '../generic/type-helper';

export interface IExtensionApiWrapper<A> {
    readonly api: Optional<A>;
    readonly onAvailable: vscode.Event<A>;
}

export class ExtensionApiWrapper<A extends object, E = A> implements IExtensionApiWrapper<A> {

    private _api: Optional<A> = undefined;

    private readonly onAvailableEmitter = new vscode.EventEmitter<A>();
    public readonly onAvailable: vscode.Event<A> = this.onAvailableEmitter.event;

    constructor(
        readonly extensionId: string,
        readonly getApi: (exports: E, context: vscode.ExtensionContext) => A = (exports: unknown) => exports as A,
    ) {}

    public async activate(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            this.onAvailableEmitter,
            vscode.extensions.onDidChange(() => this.extensionsDidChange(context)),
            { dispose: () => this.disposeApi() },
        );
        this.extensionsDidChange(context);
    }

    public get api(): Optional<A> {
        return this._api;
    }

    protected set api(value: Optional<A>) {
        if (this._api !== value) {
            this.disposeApi();
            this._api = value;
            if (value) {
                this.onAvailableEmitter.fire(value);
            }
        }
    }

    protected disposeApi() {
        if ((this._api !== undefined)
            && ('dispose' in this._api)
            && (typeof this._api.dispose === 'function')) {
            this._api.dispose.call(this._api);
        }
    }

    protected async extensionsDidChange(context: vscode.ExtensionContext) {
        const extension = vscode.extensions.getExtension<E>(this.extensionId);
        if (extension) {
            const exports = await extension.activate();
            this.api = this.getApi(exports, context);
        } else {
            this.api = undefined;
        }
    }
}
