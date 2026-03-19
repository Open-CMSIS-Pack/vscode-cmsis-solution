/**
 * Copyright 2025-2026 Arm Limited
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
import { Optional } from '../generic/type-helper';
import { IExtensionApiWrapper } from './extension-api-wrapper';

export type ExtensionApiWrapperMock<A> = IExtensionApiWrapper<jest.Mocked<A>> & { setApi: (newApi: Optional<jest.Mocked<A>>) => void };

export const extensionApiWrapperFactory = <A>(api?: jest.Mocked<A>): ExtensionApiWrapperMock<A> => {
    const onAvailableEmitter = new vscode.EventEmitter<jest.Mocked<A>>();
    const ext = {
        api,
        onAvailable: onAvailableEmitter.event,
        setApi: (newApi: Optional<jest.Mocked<A>>) => {
            ext.api = newApi;
            if (newApi !== undefined) {
                onAvailableEmitter.fire(newApi);
            }
        }
    };
    return ext;
};
